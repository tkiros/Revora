import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createFeedbackHandler } from "../../../app/api/feedback/handlers";
import { createAdminFeedbackHandler } from "../../../app/api/admin/feedback/handlers";
import { decryptField, encryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const TEST_KEY = Buffer.alloc(32, 7).toString("base64");

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let ownerId: string;
let otherId: string;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = TEST_KEY;
  testDb = await createTestDb();
  const [owner] = await testDb.db
    .insert(schema.users)
    .values({ email: "owner@test.dev" })
    .returning();
  const [other] = await testDb.db
    .insert(schema.users)
    .values({ email: "other@test.dev" })
    .returning();
  ownerId = owner.id;
  otherId = other.id;
});

afterAll(async () => {
  delete process.env.HEALTH_DATA_KEY;
  delete process.env.ADMIN_EMAIL;
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.checkFeedback);
  await testDb.db.delete(schema.checks);
});

async function seedCheck(userId: string, risk = "MODERATE" as const) {
  const [row] = await testDb.db
    .insert(schema.checks)
    .values({
      userId,
      foodCiphertext: encryptField("white rice"),
      risk,
      a1cBand: "prediabetes_60_62",
      inputMethod: "text"
    })
    .returning({ id: schema.checks.id });
  return row.id;
}

function asUser(userId: string | null, email = "owner@test.dev") {
  return {
    db: () => testDb.db,
    getSession: async () => (userId ? { userId, email } : null)
  };
}

function jsonRequest(body: unknown) {
  return new Request("http://test/api/feedback", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("POST /api/feedback", () => {
  it("401s a signed-out request", async () => {
    const POST = createFeedbackHandler(asUser(null));
    const response = await POST(jsonRequest({ checkId: crypto.randomUUID(), helpful: true }));
    expect(response.status).toBe(401);
  });

  it("400s an invalid payload (bad checkId)", async () => {
    const POST = createFeedbackHandler(asUser(ownerId));
    const response = await POST(jsonRequest({ checkId: "not-a-uuid", helpful: true }));
    expect(response.status).toBe(400);
  });

  it("400s a comment over the 500-char cap", async () => {
    const checkId = await seedCheck(ownerId);
    const POST = createFeedbackHandler(asUser(ownerId));
    const response = await POST(
      jsonRequest({ checkId, helpful: false, reason: "other", comment: "x".repeat(501) })
    );
    expect(response.status).toBe(400);
  });

  it("404s when the check does not exist", async () => {
    const POST = createFeedbackHandler(asUser(ownerId));
    const response = await POST(jsonRequest({ checkId: crypto.randomUUID(), helpful: true }));
    expect(response.status).toBe(404);
  });

  it("403s feedback on another user's check (no cross-user feedback)", async () => {
    const checkId = await seedCheck(otherId);
    const POST = createFeedbackHandler(asUser(ownerId));
    const response = await POST(jsonRequest({ checkId, helpful: true }));
    expect(response.status).toBe(403);

    const rows = await testDb.db.select().from(schema.checkFeedback);
    expect(rows).toHaveLength(0);
  });

  it("stores a positive feedback with reviewStatus none and no comment", async () => {
    const checkId = await seedCheck(ownerId);
    const POST = createFeedbackHandler(asUser(ownerId));
    const response = await POST(jsonRequest({ checkId, helpful: true }));
    expect(response.status).toBe(200);

    const [row] = await testDb.db.select().from(schema.checkFeedback);
    expect(row.helpful).toBe(true);
    expect(row.reason).toBeNull();
    expect(row.commentCiphertext).toBeNull();
    expect(row.reviewStatus).toBe("none");
  });

  it("encrypts the private comment (round-trips via decrypt; ciphertext hides the text)", async () => {
    const checkId = await seedCheck(ownerId);
    const POST = createFeedbackHandler(asUser(ownerId));
    await POST(
      jsonRequest({ checkId, helpful: false, reason: "confusing", comment: "too many numbers" })
    );

    const [row] = await testDb.db.select().from(schema.checkFeedback);
    expect(row.commentCiphertext).not.toBeNull();
    expect(row.commentCiphertext).not.toContain("numbers");
    expect(decryptField(row.commentCiphertext!)).toBe("too many numbers");
  });

  it("queues an unsafe_feeling report for safety review", async () => {
    const checkId = await seedCheck(ownerId);
    const POST = createFeedbackHandler(asUser(ownerId));
    await POST(jsonRequest({ checkId, helpful: false, reason: "unsafe_feeling" }));

    const [row] = await testDb.db.select().from(schema.checkFeedback);
    expect(row.reviewStatus).toBe("queued");
  });

  it("queues a not-helpful wrong_food (wrong-direction) report", async () => {
    const checkId = await seedCheck(ownerId);
    const POST = createFeedbackHandler(asUser(ownerId));
    await POST(jsonRequest({ checkId, helpful: false, reason: "wrong_food" }));

    const [row] = await testDb.db.select().from(schema.checkFeedback);
    expect(row.reviewStatus).toBe("queued");
  });

  it("does NOT queue a helpful wrong_food report", async () => {
    const checkId = await seedCheck(ownerId);
    const POST = createFeedbackHandler(asUser(ownerId));
    await POST(jsonRequest({ checkId, helpful: true, reason: "wrong_food" }));

    const [row] = await testDb.db.select().from(schema.checkFeedback);
    expect(row.reviewStatus).toBe("none");
  });

  it("does NOT queue too_vague / confusing / other", async () => {
    const checkId = await seedCheck(ownerId);
    const POST = createFeedbackHandler(asUser(ownerId));
    await POST(jsonRequest({ checkId, helpful: false, reason: "too_vague" }));

    const [row] = await testDb.db.select().from(schema.checkFeedback);
    expect(row.reviewStatus).toBe("none");
  });

  it("upserts on re-submit — one row per (check, user), latest wins", async () => {
    const checkId = await seedCheck(ownerId);
    const POST = createFeedbackHandler(asUser(ownerId));

    await POST(jsonRequest({ checkId, helpful: true }));
    await POST(jsonRequest({ checkId, helpful: false, reason: "unsafe_feeling", comment: "worried" }));

    const rows = await testDb.db.select().from(schema.checkFeedback);
    expect(rows).toHaveLength(1);
    expect(rows[0].helpful).toBe(false);
    expect(rows[0].reason).toBe("unsafe_feeling");
    expect(rows[0].reviewStatus).toBe("queued");
    expect(decryptField(rows[0].commentCiphertext!)).toBe("worried");
  });

  it("re-submit clears a prior queued/reviewed state when the new feedback is benign", async () => {
    const checkId = await seedCheck(ownerId);
    const POST = createFeedbackHandler(asUser(ownerId));

    await POST(jsonRequest({ checkId, helpful: false, reason: "unsafe_feeling" }));
    // Simulate a reviewer clearing it, then the user changing their mind.
    await testDb.db
      .update(schema.checkFeedback)
      .set({ reviewStatus: "reviewed", reviewedAt: new Date() })
      .where(eq(schema.checkFeedback.checkId, checkId));

    await POST(jsonRequest({ checkId, helpful: true }));

    const [row] = await testDb.db.select().from(schema.checkFeedback);
    expect(row.helpful).toBe(true);
    expect(row.reason).toBeNull();
    expect(row.reviewStatus).toBe("none");
    expect(row.reviewedAt).toBeNull();
    expect(row.commentCiphertext).toBeNull();
  });
});

describe("POST /api/admin/feedback (safety queue)", () => {
  const NOW = new Date("2026-07-19T00:00:00.000Z");

  function adminHandler(email: string | null) {
    return createAdminFeedbackHandler({
      db: () => testDb.db,
      getSession: async () => (email ? { userId: ownerId, email } : null),
      now: () => NOW
    });
  }

  function adminRequest(body: unknown) {
    return new Request("http://test/api/admin/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
  }

  it("404s a non-admin session", async () => {
    process.env.ADMIN_EMAIL = "boss@test.dev";
    const checkId = await seedCheck(ownerId);
    const [fb] = await testDb.db
      .insert(schema.checkFeedback)
      .values({ checkId, userId: ownerId, helpful: false, reason: "unsafe_feeling", reviewStatus: "queued" })
      .returning({ id: schema.checkFeedback.id });

    const POST = adminHandler("owner@test.dev");
    const response = await POST(adminRequest({ feedbackId: fb.id, action: "mark_reviewed" }));
    expect(response.status).toBe(404);

    const [row] = await testDb.db.select().from(schema.checkFeedback);
    expect(row.reviewStatus).toBe("queued");
  });

  it("marks a queued row reviewed for the admin", async () => {
    process.env.ADMIN_EMAIL = "boss@test.dev";
    const checkId = await seedCheck(ownerId);
    const [fb] = await testDb.db
      .insert(schema.checkFeedback)
      .values({ checkId, userId: ownerId, helpful: false, reason: "unsafe_feeling", reviewStatus: "queued" })
      .returning({ id: schema.checkFeedback.id });

    const POST = adminHandler("boss@test.dev");
    const response = await POST(adminRequest({ feedbackId: fb.id, action: "mark_reviewed" }));
    expect(response.status).toBe(200);

    const [row] = await testDb.db
      .select()
      .from(schema.checkFeedback)
      .where(and(eq(schema.checkFeedback.id, fb.id)));
    expect(row.reviewStatus).toBe("reviewed");
    expect(row.reviewedAt?.toISOString()).toBe(NOW.toISOString());
  });
});
