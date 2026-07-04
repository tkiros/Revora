import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  pantryItems,
  pantryOrders,
  pantryPhotos,
  users
} from "../../../lib/server/db/schema";
import { createTestDb } from "../../helpers/test-db";

/**
 * Schema-level contract for the Pantry Review pipeline (design doc
 * 2026-07-04): orders start unclaimed (user_id null), claim binds to a user,
 * account deletion cascades claimed orders + their items/photos, and the
 * status/risk CHECK constraints reject values outside the state machine.
 */
describe("pantry schema", () => {
  let ctx: Awaited<ReturnType<typeof createTestDb>>;

  beforeEach(async () => {
    ctx = await createTestDb();
  });

  afterEach(async () => {
    await ctx.close();
  });

  async function insertOrder(overrides: Partial<typeof pantryOrders.$inferInsert> = {}) {
    const [order] = await ctx.db
      .insert(pantryOrders)
      .values({
        email: "buyer@example.com",
        stripeSessionId: `cs_test_${Math.random().toString(36).slice(2)}`,
        claimToken: `tok_${Math.random().toString(36).slice(2)}`,
        ...overrides
      })
      .returning();
    return order;
  }

  it("creates an unclaimed order with status=paid and no user", async () => {
    const order = await insertOrder();
    expect(order.status).toBe("paid");
    expect(order.userId).toBeNull();
    expect(order.claimedAt).toBeNull();
  });

  it("rejects duplicate stripe_session_id (webhook idempotency backstop)", async () => {
    await insertOrder({ stripeSessionId: "cs_test_dupe" });
    await expect(
      insertOrder({ stripeSessionId: "cs_test_dupe" })
    ).rejects.toThrow();
  });

  it("rejects a status outside the state machine", async () => {
    await expect(
      insertOrder({ status: "shipped" as never })
    ).rejects.toThrow();
  });

  it("rejects an invalid item risk, accepts NULL before judging", async () => {
    const order = await insertOrder();
    const [draft] = await ctx.db
      .insert(pantryItems)
      .values({ orderId: order.id, nameCiphertext: "ct" })
      .returning();
    expect(draft.risk).toBeNull();
    expect(draft.status).toBe("draft");

    await expect(
      ctx.db
        .insert(pantryItems)
        .values({ orderId: order.id, nameCiphertext: "ct", risk: "SPICY" as never })
    ).rejects.toThrow();
  });

  it("cascades claimed orders, items, and photos on account deletion", async () => {
    const [user] = await ctx.db
      .insert(users)
      .values({ email: "buyer@example.com" })
      .returning();
    const order = await insertOrder({
      userId: user.id,
      status: "claimed",
      claimedAt: new Date()
    });
    await ctx.db
      .insert(pantryItems)
      .values({ orderId: order.id, nameCiphertext: "ct" });
    await ctx.db
      .insert(pantryPhotos)
      .values({ orderId: order.id, blobUrl: "https://blob/x" });

    await ctx.db.delete(users).where(eq(users.id, user.id));

    expect(
      await ctx.db.select().from(pantryOrders).where(eq(pantryOrders.id, order.id))
    ).toHaveLength(0);
    expect(
      await ctx.db.select().from(pantryItems).where(eq(pantryItems.orderId, order.id))
    ).toHaveLength(0);
    expect(
      await ctx.db.select().from(pantryPhotos).where(eq(pantryPhotos.orderId, order.id))
    ).toHaveLength(0);
  });

  it("keeps unclaimed orders when an unrelated user is deleted", async () => {
    const [user] = await ctx.db
      .insert(users)
      .values({ email: "other@example.com" })
      .returning();
    const order = await insertOrder(); // userId null

    await ctx.db.delete(users).where(eq(users.id, user.id));

    expect(
      await ctx.db.select().from(pantryOrders).where(eq(pantryOrders.id, order.id))
    ).toHaveLength(1);
  });
});
