import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { authorizePantryUpload } from "../../../lib/server/pantry/upload-auth";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let userId: string;
let otherUserId: string;

beforeAll(async () => {
  testDb = await createTestDb();
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: "up@test.dev" })
    .returning();
  const [other] = await testDb.db
    .insert(schema.users)
    .values({ email: "other@test.dev" })
    .returning();
  userId = user.id;
  otherUserId = other.id;
});

afterAll(async () => {
  await testDb.close();
});

async function makeOrder(overrides: Partial<typeof schema.pantryOrders.$inferInsert> = {}) {
  const [order] = await testDb.db
    .insert(schema.pantryOrders)
    .values({
      email: "up@test.dev",
      stripeSessionId: `cs_${Math.random().toString(36).slice(2)}`,
      claimToken: `hash_${Math.random().toString(36).slice(2)}`,
      userId,
      status: "claimed",
      ...overrides
    })
    .returning();
  return order;
}

describe("authorizePantryUpload", () => {
  it("returns scoped token options for the order owner", async () => {
    const order = await makeOrder();
    const options = await authorizePantryUpload(
      testDb.db,
      { userId, email: "up@test.dev" },
      order.id
    );
    expect(options.maximumSizeInBytes).toBe(5 * 1024 * 1024);
    expect(options.allowedContentTypes).toEqual([
      "image/jpeg",
      "image/png",
      "image/webp"
    ]);
    expect(options.tokenPayload).toBe(order.id);
  });

  it("rejects another user's order", async () => {
    const order = await makeOrder({ userId: otherUserId });
    await expect(
      authorizePantryUpload(testDb.db, { userId, email: "up@test.dev" }, order.id)
    ).rejects.toThrow(/no open pantry order/i);
  });

  it("rejects orders not in an uploadable state", async () => {
    const order = await makeOrder({ status: "ready" });
    await expect(
      authorizePantryUpload(testDb.db, { userId, email: "up@test.dev" }, order.id)
    ).rejects.toThrow(/no open pantry order/i);
  });

  it("rejects a garbage order id without throwing a database error", async () => {
    await expect(
      authorizePantryUpload(testDb.db, { userId, email: "up@test.dev" }, "not-a-uuid")
    ).rejects.toThrow(/no open pantry order/i);
  });
});
