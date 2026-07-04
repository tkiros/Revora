import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { createAccountDeleteHandler } from "../../../app/api/account/delete/route";
import { encryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const TEST_KEY = Buffer.alloc(32, 8).toString("base64");

let testDb: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = TEST_KEY;
  testDb = await createTestDb();
});

afterAll(async () => {
  delete process.env.HEALTH_DATA_KEY;
  await testDb.close();
});

async function seedFullUser(email: string) {
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email })
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
    risk: "SAFE",
    a1cBand: "prediabetes_60_62"
  });
  await testDb.db.insert(schema.subscriptions).values({
    userId: user.id,
    provider: "stripe",
    providerRef: `sub_${email}`,
    productId: "premium_monthly",
    status: "active",
    currentPeriodEnd: new Date(Date.now() + 86_400_000)
  });
  await testDb.db.insert(schema.pushSubscriptions).values({
    userId: user.id,
    endpoint: `https://push.example/${email}`,
    p256dh: "k",
    auth: "a"
  });
  await testDb.db.insert(schema.sessions).values({
    sessionToken: `session-${email}`,
    userId: user.id,
    expires: new Date(Date.now() + 86_400_000)
  });

  return user;
}

describe("POST /api/account/delete", () => {
  it("401s signed-out requests", async () => {
    const POST = createAccountDeleteHandler({
      db: () => testDb.db,
      getSession: async () => null
    });

    expect((await POST()).status).toBe(401);
  });

  it("removes every user-linked row, cancels providers best-effort, logs a hashed audit row", async () => {
    const user = await seedFullUser("delete-me@test.dev");
    const cancelStripe = vi.fn().mockResolvedValue(undefined);

    const POST = createAccountDeleteHandler({
      db: () => testDb.db,
      getSession: async () => ({ userId: user.id, email: user.email }),
      cancelStripeSubscription: cancelStripe
    });

    const response = await POST();
    expect(response.status).toBe(200);
    expect(cancelStripe).toHaveBeenCalledWith(`sub_delete-me@test.dev`);

    // zero residual rows across every user-linked table
    for (const table of [
      "users",
      "profiles",
      "checks",
      "subscriptions",
      "push_subscriptions",
      "sessions"
    ]) {
      const column = table === "users" ? "id" : "user_id";
      const rows = await testDb.raw.query(
        `SELECT count(*)::int AS n FROM ${table} WHERE ${column} = '${user.id}'`
      );
      expect((rows.rows[0] as { n: number }).n).toBe(0);
    }

    // audit row retains no identity — a sha256 hash, not the id or email
    const audit = await testDb.raw.query(
      `SELECT * FROM deletion_log ORDER BY completed_at DESC LIMIT 1`
    );
    const row = audit.rows[0] as { user_id_hash: string };
    expect(row.user_id_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(row.user_id_hash).not.toBe(user.id);
  });

  it("still deletes when provider cancellation fails (best-effort)", async () => {
    const user = await seedFullUser("delete-anyway@test.dev");

    const POST = createAccountDeleteHandler({
      db: () => testDb.db,
      getSession: async () => ({ userId: user.id, email: user.email }),
      cancelStripeSubscription: vi
        .fn()
        .mockRejectedValue(new Error("stripe down"))
    });

    const response = await POST();
    expect(response.status).toBe(200);

    const rows = await testDb.raw.query(
      `SELECT count(*)::int AS n FROM users WHERE id = '${user.id}'`
    );
    expect((rows.rows[0] as { n: number }).n).toBe(0);
  });
});
