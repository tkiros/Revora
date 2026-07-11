import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
  PHOTO_MAX_AGE_MS,
  deleteOrderBlobs,
  deleteUserBlobs,
  reapPantryBlobs
} from "../../../lib/server/blob";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

/**
 * N-23: the blob lifecycle IS the privacy promise. These tests pin the two
 * properties the promise rests on — a terminal order's photos leave the store,
 * and a failed delete never *claims* they did (which is what used to orphan
 * them permanently, since every retry path skips rows marked "deleted").
 */

const NOW = new Date("2026-07-10T12:00:00.000Z");

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let userId: string;

beforeAll(async () => {
  testDb = await createTestDb();
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: "blob@test.dev" })
    .returning();
  userId = user.id;
});

afterAll(async () => {
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.pantryOrders);
});

async function makeOrder(
  overrides: Partial<typeof schema.pantryOrders.$inferInsert> = {}
) {
  const [order] = await testDb.db
    .insert(schema.pantryOrders)
    .values({
      email: "buyer@example.com",
      stripeSessionId: `cs_${Math.random().toString(36).slice(2)}`,
      claimToken: `hash_${Math.random().toString(36).slice(2)}`,
      userId,
      status: "processing",
      ...overrides
    })
    .returning();
  return order;
}

async function addPhoto(
  orderId: string,
  overrides: Partial<typeof schema.pantryPhotos.$inferInsert> = {}
) {
  const [photo] = await testDb.db
    .insert(schema.pantryPhotos)
    .values({
      orderId,
      blobUrl: `https://blob.test/${Math.random().toString(36).slice(2)}.jpg`,
      status: "extracted",
      ...overrides
    })
    .returning();
  return photo;
}

async function photosOf(orderId: string) {
  return testDb.db
    .select()
    .from(schema.pantryPhotos)
    .where(eq(schema.pantryPhotos.orderId, orderId));
}

describe("deleteOrderBlobs", () => {
  it("deletes every live photo and marks the rows", async () => {
    const order = await makeOrder();
    const first = await addPhoto(order.id);
    const second = await addPhoto(order.id);
    const deleteBlobs = vi.fn().mockResolvedValue(undefined);

    const deleted = await deleteOrderBlobs(testDb.db, order.id, deleteBlobs);

    expect(deleted).toBe(2);
    expect(deleteBlobs).toHaveBeenCalledWith(
      expect.arrayContaining([first.blobUrl, second.blobUrl])
    );
    expect((await photosOf(order.id)).every((p) => p.status === "deleted")).toBe(
      true
    );
  });

  it("does NOT mark rows deleted when the Blob API throws — the objects are still live", async () => {
    const order = await makeOrder();
    await addPhoto(order.id);
    const deleteBlobs = vi.fn().mockRejectedValue(new Error("blob api down"));

    const deleted = await deleteOrderBlobs(testDb.db, order.id, deleteBlobs);

    expect(deleted).toBe(0);
    // The whole point: still not "deleted", so the sweep's GC sees it again.
    expect((await photosOf(order.id)).map((p) => p.status)).toEqual([
      "extracted"
    ]);
  });

  it("skips already-deleted rows and never calls the Blob API for them", async () => {
    const order = await makeOrder();
    await addPhoto(order.id, { status: "deleted" });
    const deleteBlobs = vi.fn().mockResolvedValue(undefined);

    expect(await deleteOrderBlobs(testDb.db, order.id, deleteBlobs)).toBe(0);
    expect(deleteBlobs).not.toHaveBeenCalled();
  });
});

describe("deleteUserBlobs", () => {
  it("deletes photos across every order the user owns", async () => {
    const first = await makeOrder({ status: "ready" });
    const second = await makeOrder({ status: "needs_manual" });
    const a = await addPhoto(first.id);
    const b = await addPhoto(second.id);
    const deleteBlobs = vi.fn().mockResolvedValue(undefined);

    const deleted = await deleteUserBlobs(testDb.db, userId, deleteBlobs);

    expect(deleted).toBe(2);
    expect(deleteBlobs).toHaveBeenCalledWith(
      expect.arrayContaining([a.blobUrl, b.blobUrl])
    );
  });

  it("leaves another user's photos alone", async () => {
    const [other] = await testDb.db
      .insert(schema.users)
      .values({ email: `other-${Math.random()}@test.dev` })
      .returning();
    const mine = await makeOrder();
    const theirs = await makeOrder({ userId: other.id });
    const myPhoto = await addPhoto(mine.id);
    await addPhoto(theirs.id);
    const deleteBlobs = vi.fn().mockResolvedValue(undefined);

    const deleted = await deleteUserBlobs(testDb.db, userId, deleteBlobs);

    expect(deleted).toBe(1);
    expect(deleteBlobs).toHaveBeenCalledWith([myPhoto.blobUrl]);
  });
});

describe("reapPantryBlobs", () => {
  it("reaps canceled, needs_manual, and delivered orders", async () => {
    const canceled = await makeOrder({ status: "canceled" });
    const manual = await makeOrder({ status: "needs_manual" });
    const delivered = await makeOrder({ status: "ready", deliveredAt: NOW });
    for (const order of [canceled, manual, delivered]) {
      await addPhoto(order.id);
    }
    const deleteBlobs = vi.fn().mockResolvedValue(undefined);

    expect(await reapPantryBlobs(testDb.db, NOW, deleteBlobs)).toBe(3);
  });

  it("leaves photos of an in-flight order alone", async () => {
    const processing = await makeOrder({ status: "processing" });
    const awaiting = await makeOrder({ status: "awaiting_confirm" });
    const undelivered = await makeOrder({ status: "ready", deliveredAt: null });
    for (const order of [processing, awaiting, undelivered]) {
      await addPhoto(order.id);
    }
    const deleteBlobs = vi.fn().mockResolvedValue(undefined);

    expect(await reapPantryBlobs(testDb.db, NOW, deleteBlobs)).toBe(0);
    expect(deleteBlobs).not.toHaveBeenCalled();
  });

  it("reaps an abandoned order's photos once they pass the retention ceiling", async () => {
    // Never confirmed, never canceled — the case no terminal state covers.
    const abandoned = await makeOrder({ status: "awaiting_confirm" });
    await addPhoto(abandoned.id, {
      createdAt: new Date(NOW.getTime() - PHOTO_MAX_AGE_MS - 1000)
    });
    const deleteBlobs = vi.fn().mockResolvedValue(undefined);

    expect(await reapPantryBlobs(testDb.db, NOW, deleteBlobs)).toBe(1);
  });

  it("retries an order the Blob API failed on last run", async () => {
    const order = await makeOrder({ status: "canceled" });
    await addPhoto(order.id);

    const failing = vi.fn().mockRejectedValue(new Error("blob api down"));
    expect(await reapPantryBlobs(testDb.db, NOW, failing)).toBe(0);

    // Same order, next sweep, Blob API healthy again.
    const healthy = vi.fn().mockResolvedValue(undefined);
    expect(await reapPantryBlobs(testDb.db, NOW, healthy)).toBe(1);
    expect((await photosOf(order.id)).every((p) => p.status === "deleted")).toBe(
      true
    );
  });

  it("is idempotent — a second run finds nothing left", async () => {
    const order = await makeOrder({ status: "canceled" });
    await addPhoto(order.id);
    const deleteBlobs = vi.fn().mockResolvedValue(undefined);

    expect(await reapPantryBlobs(testDb.db, NOW, deleteBlobs)).toBe(1);
    expect(await reapPantryBlobs(testDb.db, NOW, deleteBlobs)).toBe(0);
    expect(deleteBlobs).toHaveBeenCalledTimes(1);
  });
});
