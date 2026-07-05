import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getEntitlement,
  countChecksToday,
  FREE_DAILY_CHECKS
} from "../../../lib/server/entitlement";
import { encryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const TEST_KEY = Buffer.alloc(32, 4).toString("base64");
const NOW = new Date("2026-07-03T15:00:00.000Z");

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let userId: string;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = TEST_KEY;
  testDb = await createTestDb();
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: "ent@test.dev" })
    .returning();
  userId = user.id;
});

afterAll(async () => {
  delete process.env.HEALTH_DATA_KEY;
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.subscriptions);
  await testDb.db.delete(schema.checks);
});

function subscription(
  status: "active" | "canceled" | "grace" | "expired" | "refunded",
  periodEnd: Date,
  provider: "play" | "stripe" = "play"
) {
  return {
    userId,
    provider,
    providerRef: `ref-${status}-${periodEnd.getTime()}-${Math.random()}`,
    productId: "premium_monthly",
    status,
    currentPeriodEnd: periodEnd
  };
}

const FUTURE = new Date("2026-08-01T00:00:00.000Z");
const PAST = new Date("2026-06-01T00:00:00.000Z");

describe("getEntitlement", () => {
  it("free with no subscription rows", async () => {
    const result = await getEntitlement(testDb.db, userId, { now: () => NOW });

    expect(result).toEqual({ tier: "free", source: null, status: "none" });
  });

  it.each([
    ["active", FUTURE, "premium"],
    ["grace", FUTURE, "premium"],
    ["canceled", FUTURE, "premium"], // canceled but paid-through period
    ["canceled", PAST, "free"],
    ["expired", FUTURE, "free"],
    ["refunded", FUTURE, "free"],
    ["active", PAST, "free"]
  ] as const)(
    "status=%s periodEnd=%s → %s",
    async (status, periodEnd, expected) => {
      await testDb.db
        .insert(schema.subscriptions)
        .values(subscription(status, periodEnd));

      const result = await getEntitlement(testDb.db, userId, {
        now: () => NOW
      });

      expect(result.tier).toBe(expected);
    }
  );

  it("reports the provider source for premium", async () => {
    await testDb.db
      .insert(schema.subscriptions)
      .values(subscription("active", FUTURE, "stripe"));

    const result = await getEntitlement(testDb.db, userId, { now: () => NOW });

    expect(result).toEqual({
      tier: "premium",
      source: "stripe",
      status: "premium"
    });
  });

  it("verify-on-read: a stale active Play row triggers re-verification", async () => {
    await testDb.db
      .insert(schema.subscriptions)
      .values(subscription("active", PAST, "play"));

    const refresh = vi.fn().mockResolvedValue({
      status: "active" as const,
      currentPeriodEnd: FUTURE
    });

    const result = await getEntitlement(testDb.db, userId, {
      now: () => NOW,
      refreshPlaySubscription: refresh
    });

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(result.tier).toBe("premium");

    // and the row was healed in the DB
    const [row] = await testDb.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.userId, userId));
    expect(row.currentPeriodEnd.toISOString()).toBe(FUTURE.toISOString());
  });

  it("verify-on-read failure degrades to free without throwing", async () => {
    await testDb.db
      .insert(schema.subscriptions)
      .values(subscription("active", PAST, "play"));

    const result = await getEntitlement(testDb.db, userId, {
      now: () => NOW,
      refreshPlaySubscription: vi.fn().mockRejectedValue(new Error("api down"))
    });

    expect(result.tier).toBe("free");
  });

  it("returns status trialing (tier premium) for a valid trialing row", async () => {
    const trialingEnd = new Date(NOW.getTime() + 5 * 24 * 60 * 60 * 1000);
    await testDb.db.insert(schema.subscriptions).values({
      userId,
      provider: "stripe",
      providerRef: `ref-trialing-${trialingEnd.getTime()}`,
      productId: "premium_monthly",
      status: "trialing",
      currentPeriodEnd: trialingEnd
    });

    const e = await getEntitlement(testDb.db, userId, { now: () => NOW });

    expect(e).toMatchObject({
      tier: "premium",
      status: "trialing",
      source: "stripe"
    });
  });

  it("returns status lapsed when rows exist but none valid", async () => {
    await testDb.db
      .insert(schema.subscriptions)
      .values(subscription("expired", PAST, "stripe"));

    const result = await getEntitlement(testDb.db, userId, { now: () => NOW });

    expect(result.status).toBe("lapsed");
  });

  it("returns status none with no rows", async () => {
    const [fresh] = await testDb.db
      .insert(schema.users)
      .values({ email: `fresh-${Date.now()}@test.dev` })
      .returning();

    const result = await getEntitlement(testDb.db, fresh.id, {
      now: () => NOW
    });

    expect(result.status).toBe("none");
  });
});

describe("countChecksToday", () => {
  it("counts only today's checks in the user's timezone", async () => {
    const insert = (iso: string) =>
      testDb.db.insert(schema.checks).values({
        userId,
        foodCiphertext: encryptField("x"),
        risk: "SAFE",
        a1cBand: "prediabetes_60_62",
        createdAt: new Date(iso)
      });

    // NOW is 2026-07-03T15:00Z. In Denver (UTC-6) "today" is 07-03 Denver.
    await insert("2026-07-03T14:00:00.000Z"); // today everywhere
    await insert("2026-07-03T04:00:00.000Z"); // 07-02 in Denver, 07-03 UTC
    await insert("2026-07-01T12:00:00.000Z"); // past

    const utcCount = await countChecksToday(testDb.db, userId, "UTC", NOW);
    const denverCount = await countChecksToday(
      testDb.db,
      userId,
      "America/Denver",
      NOW
    );

    expect(utcCount).toBe(2);
    expect(denverCount).toBe(1);
  });

  it("exports the default free-tier limit", () => {
    expect(FREE_DAILY_CHECKS).toBe(5);
  });
});
