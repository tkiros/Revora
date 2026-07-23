import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
  PHOTO_MAX_AGE_MS,
  deleteOrderBlobs,
  deleteUserBlobs,
  reapOrphanBlobs,
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

  it("propagates provider failure and preserves every database pointer", async () => {
    const order = await makeOrder({ status: "ready" });
    const photo = await addPhoto(order.id);
    const deleteBlobs = vi.fn().mockRejectedValue(new Error("blob unavailable"));

    await expect(
      deleteUserBlobs(testDb.db, userId, deleteBlobs)
    ).rejects.toThrow("blob unavailable");

    const [preserved] = await testDb.db
      .select()
      .from(schema.pantryPhotos)
      .where(eq(schema.pantryPhotos.id, photo.id));
    expect(preserved.blobUrl).toBe(photo.blobUrl);
    expect(preserved.status).not.toBe("deleted");
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

/**
 * The orphan reaper (W-33, sub-item 3) — the only deletion path that cannot
 * start from the database, because an orphan is precisely the object whose row
 * is gone. `DELETE users` cascaded that row away and left a public object with
 * no pointer; no query over pantry_photos can ever find one. These tests pin
 * the inversion: the store is the source of truth, and anything the DB cannot
 * account for is garbage — with an age floor so an in-flight upload is never
 * mistaken for one.
 */
describe("reapOrphanBlobs", () => {
  const HOUR = 60 * 60 * 1000;
  const old = () => new Date(NOW.getTime() - 3 * HOUR);

  it("deletes an object the database has no row for — the post-cascade orphan", async () => {
    // Exactly the N-23 state: the object is live, and nothing in the DB points
    // at it because the user's account (and its cascade) took the row.
    const listBlobs = vi
      .fn()
      .mockResolvedValue([
        { url: "https://blob.test/orphan.jpg", uploadedAt: old() }
      ]);
    const deleteBlobs = vi.fn().mockResolvedValue(undefined);

    expect(
      await reapOrphanBlobs(testDb.db, NOW, listBlobs, deleteBlobs)
    ).toBe(1);
    expect(deleteBlobs).toHaveBeenCalledWith(["https://blob.test/orphan.jpg"]);
  });

  it("never touches an object a row still points at", async () => {
    const order = await makeOrder({ status: "processing" });
    const photo = await addPhoto(order.id);

    const listBlobs = vi
      .fn()
      .mockResolvedValue([{ url: photo.blobUrl, uploadedAt: old() }]);
    const deleteBlobs = vi.fn().mockResolvedValue(undefined);

    expect(
      await reapOrphanBlobs(testDb.db, NOW, listBlobs, deleteBlobs)
    ).toBe(0);
    expect(deleteBlobs).not.toHaveBeenCalled();
  });

  it("leaves a row whose delete FAILED on the normal retry path, not the orphan path", async () => {
    // The row survives (unmarked) precisely so the hourly GC retries it. If the
    // known-set filtered on status, this object would look like an orphan and
    // be deleted by the wrong mechanism — with no row left to prove it happened.
    const order = await makeOrder({ status: "canceled" });
    const photo = await addPhoto(order.id, { status: "extracted" });

    const listBlobs = vi
      .fn()
      .mockResolvedValue([{ url: photo.blobUrl, uploadedAt: old() }]);
    const deleteBlobs = vi.fn().mockResolvedValue(undefined);

    expect(
      await reapOrphanBlobs(testDb.db, NOW, listBlobs, deleteBlobs)
    ).toBe(0);
  });

  it("spares a freshly uploaded object — a young unmatched blob is a race, not an orphan", async () => {
    // The object lands in the store before its row is written. Deleting it here
    // would yank the photo out from under a user still filling in the form.
    const listBlobs = vi.fn().mockResolvedValue([
      {
        url: "https://blob.test/in-flight.jpg",
        uploadedAt: new Date(NOW.getTime() - 60_000)
      }
    ]);
    const deleteBlobs = vi.fn().mockResolvedValue(undefined);

    expect(
      await reapOrphanBlobs(testDb.db, NOW, listBlobs, deleteBlobs)
    ).toBe(0);
    expect(deleteBlobs).not.toHaveBeenCalled();
  });

  it("survives a Blob-API listing outage without taking the sweep down", async () => {
    const listBlobs = vi.fn().mockRejectedValue(new Error("blob store down"));
    const deleteBlobs = vi.fn().mockResolvedValue(undefined);

    expect(
      await reapOrphanBlobs(testDb.db, NOW, listBlobs, deleteBlobs)
    ).toBe(0);
    expect(deleteBlobs).not.toHaveBeenCalled();
  });
});
