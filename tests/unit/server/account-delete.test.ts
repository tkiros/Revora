import { eq } from "drizzle-orm";
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

  it("removes every user-linked row after provider cancellation and logs a hashed audit row", async () => {
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

  it("returns 503 and preserves the account when Stripe cancellation fails", async () => {
    const user = await seedFullUser("delete-anyway@test.dev");
    const deleteBlobs = vi.fn();

    const POST = createAccountDeleteHandler({
      db: () => testDb.db,
      getSession: async () => ({ userId: user.id, email: user.email }),
      cancelStripeSubscription: vi
        .fn()
        .mockRejectedValue(new Error("stripe down")),
      deleteBlobs
    });

    const response = await POST();
    expect(response.status).toBe(503);

    const rows = await testDb.raw.query(
      `SELECT count(*)::int AS n FROM users WHERE id = '${user.id}'`
    );
    expect((rows.rows[0] as { n: number }).n).toBe(1);
    const subscriptions = await testDb.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.userId, user.id));
    expect(subscriptions).toHaveLength(1);
    expect(deleteBlobs).not.toHaveBeenCalled();
  });

  it("fails closed when Stripe cancellation is not configured", async () => {
    const user = await seedFullUser("delete-no-stripe-key@test.dev");
    const previousKey = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;

    try {
      const POST = createAccountDeleteHandler({
        db: () => testDb.db,
        getSession: async () => ({ userId: user.id, email: user.email }),
        deleteBlobs: vi.fn()
      });

      expect((await POST()).status).toBe(503);
      const [preserved] = await testDb.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, user.id));
      expect(preserved.id).toBe(user.id);
    } finally {
      if (previousKey === undefined) {
        delete process.env.STRIPE_SECRET_KEY;
      } else {
        process.env.STRIPE_SECRET_KEY = previousKey;
      }
    }
  });

  it("requires store-owned Play cancellation before account deletion", async () => {
    const user = await seedFullUser("delete-play@test.dev");
    await testDb.db
      .update(schema.subscriptions)
      .set({ provider: "play" })
      .where(eq(schema.subscriptions.userId, user.id));
    const cancelStripe = vi.fn();

    const POST = createAccountDeleteHandler({
      db: () => testDb.db,
      getSession: async () => ({ userId: user.id, email: user.email }),
      cancelStripeSubscription: cancelStripe,
      deleteBlobs: vi.fn()
    });

    const response = await POST();
    expect(response.status).toBe(409);
    expect(cancelStripe).not.toHaveBeenCalled();
    const [preserved] = await testDb.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id));
    expect(preserved.id).toBe(user.id);
  });

  /**
   * N-23, the P0 this route existed to violate: `DELETE users` cascades
   * pantry_photos away, and blob_url is the ONLY pointer to a live object.
   * Deleting the blobs afterwards is impossible — so it must happen before,
   * and it must happen for orders in every state, not just delivered ones.
   */
  it("deletes the user's pantry photos from Blob BEFORE the cascade destroys the URLs", async () => {
    const user = await seedFullUser("delete-photos@test.dev");
    const urls: string[] = [];
    for (const status of ["ready", "needs_manual", "awaiting_confirm"] as const) {
      const [order] = await testDb.db
        .insert(schema.pantryOrders)
        .values({
          userId: user.id,
          email: user.email,
          stripeSessionId: `cs_${status}_${user.id}`,
          claimToken: `hash_${status}_${user.id}`,
          status
        })
        .returning();
      const url = `https://blob.test/${status}-${user.id}.jpg`;
      urls.push(url);
      await testDb.db
        .insert(schema.pantryPhotos)
        .values({ orderId: order.id, blobUrl: url, status: "extracted" });
    }

    const deleteBlobs = vi.fn().mockResolvedValue(undefined);
    const POST = createAccountDeleteHandler({
      db: () => testDb.db,
      getSession: async () => ({ userId: user.id, email: user.email }),
      cancelStripeSubscription: vi.fn().mockResolvedValue(undefined),
      deleteBlobs
    });

    expect((await POST()).status).toBe(200);

    expect(deleteBlobs).toHaveBeenCalledTimes(1);
    expect(deleteBlobs).toHaveBeenCalledWith(expect.arrayContaining(urls));

    const rows = await testDb.raw.query(
      `SELECT count(*)::int AS n FROM pantry_orders WHERE user_id = '${user.id}'`
    );
    expect((rows.rows[0] as { n: number }).n).toBe(0);
  });

  it("deletes the account even if the Blob API is down (the user asked)", async () => {
    const user = await seedFullUser("delete-blob-down@test.dev");
    const [order] = await testDb.db
      .insert(schema.pantryOrders)
      .values({
        userId: user.id,
        email: user.email,
        stripeSessionId: `cs_down_${user.id}`,
        claimToken: `hash_down_${user.id}`,
        status: "ready"
      })
      .returning();
    await testDb.db.insert(schema.pantryPhotos).values({
      orderId: order.id,
      blobUrl: `https://blob.test/down-${user.id}.jpg`,
      status: "extracted"
    });

    const POST = createAccountDeleteHandler({
      db: () => testDb.db,
      getSession: async () => ({ userId: user.id, email: user.email }),
      cancelStripeSubscription: vi.fn().mockResolvedValue(undefined),
      deleteBlobs: vi.fn().mockRejectedValue(new Error("blob api down"))
    });

    expect((await POST()).status).toBe(200);

    const rows = await testDb.raw.query(
      `SELECT count(*)::int AS n FROM users WHERE id = '${user.id}'`
    );
    expect((rows.rows[0] as { n: number }).n).toBe(0);
  });
});
