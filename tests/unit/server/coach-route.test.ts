import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { createCoachRouteHandler } from "../../../app/api/coach/route";
import { encryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const TEST_KEY = Buffer.alloc(32, 2).toString("base64");
const NOW = new Date("2026-07-03T15:00:00.000Z");

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let userId: string;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = TEST_KEY;
  testDb = await createTestDb();

  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: "coach@test.dev" })
    .returning();
  userId = user.id;

  await testDb.db.insert(schema.profiles).values({
    userId,
    a1cCiphertext: encryptField("6.1"),
    a1cBand: "prediabetes_60_62",
    timezone: "UTC",
    consentedAt: NOW
  });

  const day = (offset: number, hourUtc: number) =>
    new Date(Date.UTC(2026, 6, 3 - offset, hourUtc, 0, 0));

  await testDb.db.insert(schema.checks).values(
    (
      [
        [0, 8, "MODERATE"],
        [1, 8, "HIGH"],
        [2, 9, "MODERATE"],
        [1, 13, "SAFE"],
        [2, 19, "SAFE"]
      ] as const
    ).map(([offset, hour, risk]) => ({
      userId,
      foodCiphertext: encryptField("secret salmon plate"),
      risk,
      a1cBand: "prediabetes_60_62",
      createdAt: day(offset, hour)
    }))
  );

  await testDb.db.insert(schema.baiWeekly).values({
    userId,
    weekStart: "2026-06-29",
    score: 72,
    adherence: 71,
    consistency: 66,
    action: 90
  });

  // Premium — the BAI surface is entitlement-gated.
  await testDb.db.insert(schema.subscriptions).values({
    userId,
    provider: "stripe",
    providerRef: "sub_coach",
    productId: "premium_monthly",
    status: "active",
    currentPeriodEnd: new Date("2026-08-01T00:00:00.000Z")
  });
});

afterAll(async () => {
  delete process.env.HEALTH_DATA_KEY;
  await testDb.close();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/coach", () => {
  it("401s signed-out requests", async () => {
    const GET = createCoachRouteHandler({
      db: () => testDb.db,
      getSession: async () => null,
      now: () => NOW
    });

    expect((await GET()).status).toBe(401);
  });

  it("returns no longitudinal insight unless the counsel-gated feature is explicitly enabled", async () => {
    const GET = createCoachRouteHandler({
      db: () => testDb.db,
      getSession: async () => ({ userId, email: "coach@test.dev" }),
      now: () => NOW
    });

    const body = await (await GET()).json();

    expect(body.insight).toBeNull();
    expect(body.streak).toBe(3);
    expect(body.weekView).toHaveLength(7);
  });

  it("returns streak, week view, daypart insight, and the latest BAI when explicitly enabled — no food, no exact a1c", async () => {
    vi.stubEnv("NEXT_PUBLIC_LONGITUDINAL_INSIGHTS", "1");
    const GET = createCoachRouteHandler({
      db: () => testDb.db,
      getSession: async () => ({ userId, email: "coach@test.dev" }),
      now: () => NOW
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.streak).toBe(3);
    expect(body.weekView).toHaveLength(7);
    expect(body.insight.id).toBe("daypart");
    expect(body.insight.text).toContain("breakfast");
    expect(body.latestBai).toMatchObject({ score: 72, adherence: 71 });

    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain("salmon");
    expect(serialized).not.toContain("6.1");
    expect(serialized).not.toContain("coach@test.dev");
  });

  it("hides the BAI from free users (entitlement-gated surface)", async () => {
    const { schema: s } = await import("../../../lib/server/db");
    await testDb.db.delete(s.subscriptions);

    const GET = createCoachRouteHandler({
      db: () => testDb.db,
      getSession: async () => ({ userId, email: "coach@test.dev" }),
      now: () => NOW
    });

    const body = await (await GET()).json();

    expect(body.tier).toBe("free");
    expect(body.latestBai).toBeNull();
    expect(body.streak).toBe(3); // streak/week stay free
  });
});
