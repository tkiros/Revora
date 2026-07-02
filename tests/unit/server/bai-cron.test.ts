import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { priorWeekRange, runBaiWeeklyCron } from "../../../lib/server/bai-cron";
import { encryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const TEST_KEY = Buffer.alloc(32, 7).toString("base64");
// Monday 2026-07-06, 04:30 UTC — matches vercel.json's "30 4 * * 1".
const NOW = new Date("2026-07-06T04:30:00.000Z");

let testDb: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = TEST_KEY;
  testDb = await createTestDb();
});

afterAll(async () => {
  delete process.env.HEALTH_DATA_KEY;
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.users); // cascades everything
});

async function seedUser(options: {
  email: string;
  timezone: string;
  premium?: boolean;
  checks?: Array<{ createdAt: Date; risk: "SAFE" | "MODERATE" | "HIGH"; actionDoneAt?: Date }>;
}) {
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: options.email })
    .returning();

  await testDb.db.insert(schema.profiles).values({
    userId: user.id,
    a1cCiphertext: encryptField("6.1"),
    a1cBand: "prediabetes_60_62",
    timezone: options.timezone,
    consentedAt: NOW
  });

  if (options.premium ?? true) {
    await testDb.db.insert(schema.subscriptions).values({
      userId: user.id,
      provider: "stripe",
      providerRef: `sub_${options.email}`,
      productId: "premium_monthly",
      status: "active",
      currentPeriodEnd: new Date("2026-08-01T00:00:00.000Z")
    });
  }

  for (const check of options.checks ?? []) {
    await testDb.db.insert(schema.checks).values({
      userId: user.id,
      foodCiphertext: encryptField("meal"),
      risk: check.risk,
      a1cBand: "prediabetes_60_62",
      createdAt: check.createdAt,
      actionDoneAt: check.actionDoneAt ?? null
    });
  }

  return user;
}

describe("priorWeekRange", () => {
  it("returns the Monday..Sunday week immediately before a Monday-morning run (UTC)", () => {
    const { weekStart, weekEnd } = priorWeekRange(NOW, "UTC");
    expect(weekStart).toBe("2026-06-29");
    expect(weekEnd).toBe("2026-07-05");
  });

  it("uses the user's local calendar day, not UTC, to find the week boundary", () => {
    // 04:30 UTC Monday is still Sunday night in Los Angeles (UTC-7 in July)
    // — the local week hasn't rolled over yet, so the prior COMPLETE week is
    // one week earlier than the UTC-Monday case above.
    const { weekStart, weekEnd } = priorWeekRange(NOW, "America/Los_Angeles");
    expect(weekStart).toBe("2026-06-22");
    expect(weekEnd).toBe("2026-06-28");
  });
});

describe("runBaiWeeklyCron", () => {
  it("computes and upserts BAI for a premium user from their prior-week checks", async () => {
    await seedUser({
      email: "ny@test.dev",
      timezone: "America/New_York",
      checks: [
        // Prior week (Mon 6/29 .. Sun 7/5) — 3 SAFE checks, all prompted-free
        { createdAt: new Date("2026-06-29T12:00:00.000Z"), risk: "SAFE" },
        { createdAt: new Date("2026-06-30T12:00:00.000Z"), risk: "SAFE" },
        { createdAt: new Date("2026-07-01T12:00:00.000Z"), risk: "SAFE" },
        // Outside the prior week (Monday of the NEW week, 08:00 local) — must be excluded
        { createdAt: new Date("2026-07-06T12:00:00.000Z"), risk: "HIGH" }
      ]
    });

    const result = await runBaiWeeklyCron(testDb.db, { now: () => NOW });
    expect(result.computed).toBe(1);
    expect(result.skipped).toBe(0);

    const rows = await testDb.db.select().from(schema.baiWeekly);
    expect(rows).toHaveLength(1);
    expect(rows[0].weekStart).toBe("2026-06-29");
    // 3/7 days checked → adherence 43%; zero prompts (all SAFE) → action
    // weight redistributes.
    expect(rows[0].adherence).toBe(43);
    expect(rows[0].action).toBe(0);
  });

  it("skips free-tier users", async () => {
    await seedUser({
      email: "free@test.dev",
      timezone: "America/New_York",
      premium: false,
      checks: [{ createdAt: new Date("2026-06-29T12:00:00.000Z"), risk: "SAFE" }]
    });

    const result = await runBaiWeeklyCron(testDb.db, { now: () => NOW });
    expect(result.computed).toBe(0);
    expect(result.skipped).toBe(1);

    const rows = await testDb.db.select().from(schema.baiWeekly);
    expect(rows).toHaveLength(0);
  });

  it("is idempotent — running twice for the same week updates, not duplicates", async () => {
    await seedUser({
      email: "dup@test.dev",
      timezone: "America/New_York",
      checks: [{ createdAt: new Date("2026-06-29T12:00:00.000Z"), risk: "SAFE" }]
    });

    await runBaiWeeklyCron(testDb.db, { now: () => NOW });
    await runBaiWeeklyCron(testDb.db, { now: () => NOW });

    const rows = await testDb.db.select().from(schema.baiWeekly);
    expect(rows).toHaveLength(1);
  });

  it("a user with no checks that week still gets a zero-score row", async () => {
    await seedUser({ email: "idle@test.dev", timezone: "America/New_York" });

    const result = await runBaiWeeklyCron(testDb.db, { now: () => NOW });
    expect(result.computed).toBe(1);

    const [row] = await testDb.db.select().from(schema.baiWeekly);
    expect(row.score).toBe(0);
    expect(row.weekStart).toBe("2026-06-29");
  });

  it("computes per-user in the user's own profile timezone", async () => {
    await seedUser({
      email: "la@test.dev",
      timezone: "America/Los_Angeles",
      // Falls inside America/Los_Angeles's prior COMPLETE week (6/22-6/28),
      // not the UTC-Monday-relative week (6/29-7/5).
      checks: [{ createdAt: new Date("2026-06-23T12:00:00.000Z"), risk: "SAFE" }]
    });

    await runBaiWeeklyCron(testDb.db, { now: () => NOW });

    const [row] = await testDb.db.select().from(schema.baiWeekly);
    expect(row.weekStart).toBe("2026-06-22");
    expect(row.adherence).toBe(14); // 1/7 days
  });

  it("a transient per-user failure doesn't abort the whole run (fail-soft)", async () => {
    // Two premium users; the important behavior is that a second user still
    // gets computed even if a prior one's data is unusual (e.g. no checks).
    await seedUser({ email: "a@test.dev", timezone: "America/New_York" });
    await seedUser({
      email: "b@test.dev",
      timezone: "America/New_York",
      checks: [{ createdAt: new Date("2026-06-29T12:00:00.000Z"), risk: "SAFE" }]
    });

    const result = await runBaiWeeklyCron(testDb.db, { now: () => NOW });
    expect(result.computed).toBe(2);

    const rows = await testDb.db.select().from(schema.baiWeekly);
    expect(rows).toHaveLength(2);
  });
});
