import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createHealthDataDeleteHandler } from "../../../app/api/account/health-data/route";
import { encryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const TEST_KEY = Buffer.alloc(32, 11).toString("base64");
let testDb: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = TEST_KEY;
  testDb = await createTestDb();
});

afterAll(async () => {
  delete process.env.HEALTH_DATA_KEY;
  await testDb.close();
});

describe("DELETE /api/account/health-data", () => {
  it("requires a signed-in account", async () => {
    const DELETE = createHealthDataDeleteHandler({
      db: () => testDb.db,
      getSession: async () => null
    });
    expect((await DELETE()).status).toBe(401);
  });

  it("erases health rows while preserving login and subscription", async () => {
    const [user] = await testDb.db
      .insert(schema.users)
      .values({ email: "withdraw@test.dev" })
      .returning();
    await testDb.db.insert(schema.profiles).values({
      userId: user.id,
      a1cCiphertext: encryptField("6.1"),
      a1cBand: "prediabetes_60_62",
      consentedAt: new Date()
    });
    await testDb.db.insert(schema.checks).values({
      userId: user.id,
      foodCiphertext: encryptField("meal"),
      risk: "MODERATE",
      a1cBand: "prediabetes_60_62"
    });
    await testDb.db.insert(schema.baiWeekly).values({
      userId: user.id,
      weekStart: "2026-07-06",
      score: 50,
      adherence: 50,
      consistency: 50,
      action: 50
    });
    await testDb.db.insert(schema.pushSubscriptions).values({
      userId: user.id,
      endpoint: "https://push.example/withdraw",
      p256dh: "key",
      auth: "auth"
    });
    await testDb.db.insert(schema.subscriptions).values({
      userId: user.id,
      provider: "stripe",
      providerRef: "sub_withdraw",
      productId: "premium_monthly",
      status: "active",
      currentPeriodEnd: new Date("2026-08-12T00:00:00Z")
    });

    const DELETE = createHealthDataDeleteHandler({
      db: () => testDb.db,
      getSession: async () => ({ userId: user.id, email: user.email })
    });
    expect((await DELETE()).status).toBe(200);

    expect(
      await testDb.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, user.id))
    ).toHaveLength(1);
    expect(
      await testDb.db
        .select()
        .from(schema.subscriptions)
        .where(eq(schema.subscriptions.userId, user.id))
    ).toHaveLength(1);

    for (const table of ["profiles", "checks", "bai_weekly", "push_subscriptions"]) {
      const result = await testDb.raw.query(
        `SELECT count(*)::int AS n FROM ${table} WHERE user_id = '${user.id}'`
      );
      expect((result.rows[0] as { n: number }).n).toBe(0);
    }
  });
});
