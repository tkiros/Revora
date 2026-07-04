import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createPantrySubmitHandler } from "../../../app/api/pantry/submit/route";
import { decryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const NOW = new Date("2026-07-06T09:00:00.000Z");

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let userId: string;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = Buffer.alloc(32, 8).toString("base64");
  testDb = await createTestDb();
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: "submit@test.dev" })
    .returning();
  userId = user.id;
});

afterAll(async () => {
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.pantryOrders);
});

async function makeClaimedOrder() {
  const [order] = await testDb.db
    .insert(schema.pantryOrders)
    .values({
      email: "submit@test.dev",
      stripeSessionId: `cs_${Math.random().toString(36).slice(2)}`,
      claimToken: `hash_${Math.random().toString(36).slice(2)}`,
      userId,
      status: "claimed"
    })
    .returning();
  return order;
}

const visionOk = {
  extractFromPhoto: vi.fn().mockResolvedValue([
    { name: "rolled oats", portion: "1 canister" },
    { name: "orange juice", portion: null }
  ])
};

function makeDeps(overrides: Record<string, unknown> = {}) {
  return {
    db: () => testDb.db,
    getSession: async () => ({ userId, email: "submit@test.dev" }),
    vision: () => visionOk,
    email: { send: vi.fn().mockResolvedValue({ ok: true }) },
    rateLimit: async () => ({ ok: true }) as const,
    now: () => NOW,
    ...overrides
  };
}

function submitRequest(body: unknown) {
  return new Request("http://t/api/pantry/submit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

function validBody(orderId: string, overrides: Record<string, unknown> = {}) {
  return {
    orderId,
    photoUrls: ["https://blob.test/a.jpg", "https://blob.test/b.jpg"],
    a1cBand: "prediabetes_60_62",
    notes: "mostly breakfast stuff",
    consent: true,
    ...overrides
  };
}

describe("POST /api/pantry/submit", () => {
  it("stores photos + encrypted intake fields, extracts drafts, moves to awaiting_confirm", async () => {
    const order = await makeClaimedOrder();
    const POST = createPantrySubmitHandler(makeDeps());

    const response = await POST(submitRequest(validBody(order.id)));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("awaiting_confirm");
    // Two photos, two calls, deduped item names across photos.
    expect(body.items.map((item: { name: string }) => item.name)).toEqual([
      "rolled oats",
      "orange juice"
    ]);

    const [updated] = await testDb.db
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, order.id));
    expect(updated.status).toBe("awaiting_confirm");
    expect(updated.a1cBand).toBe("prediabetes_60_62");
    expect(updated.consentedAt?.toISOString()).toBe(NOW.toISOString());
    expect(updated.a1cCiphertext).not.toBeNull();
    expect(decryptField(updated.a1cCiphertext!)).toBe("6.1");
    expect(updated.notesCiphertext).not.toContain("breakfast");
    expect(decryptField(updated.notesCiphertext!)).toBe("mostly breakfast stuff");

    const photos = await testDb.db
      .select()
      .from(schema.pantryPhotos)
      .where(eq(schema.pantryPhotos.orderId, order.id));
    expect(photos).toHaveLength(2);
    expect(photos.every((photo) => photo.status === "extracted")).toBe(true);

    const items = await testDb.db
      .select()
      .from(schema.pantryItems)
      .where(eq(schema.pantryItems.orderId, order.id));
    expect(items).toHaveLength(2);
    expect(items.every((item) => item.status === "draft")).toBe(true);
    expect(items.every((item) => item.source === "vision")).toBe(true);
    expect(decryptField(items[0].nameCiphertext)).toBe("rolled oats");
  });

  it("rejects an 11th photo server-side", async () => {
    const order = await makeClaimedOrder();
    const POST = createPantrySubmitHandler(makeDeps());
    const response = await POST(
      submitRequest(
        validBody(order.id, {
          photoUrls: Array.from({ length: 11 }, (_, i) => `https://blob.test/${i}.jpg`)
        })
      )
    );
    expect(response.status).toBe(400);
  });

  it("rejects a submit without consent", async () => {
    const order = await makeClaimedOrder();
    const POST = createPantrySubmitHandler(makeDeps());
    const response = await POST(
      submitRequest(validBody(order.id, { consent: false }))
    );
    expect(response.status).toBe(400);
  });

  it("404s another user's order (wrong-user access)", async () => {
    const order = await makeClaimedOrder();
    const POST = createPantrySubmitHandler(
      makeDeps({
        getSession: async () => ({ userId: crypto.randomUUID(), email: "x@y.z" })
      })
    );
    const response = await POST(submitRequest(validBody(order.id)));
    expect(response.status).toBe(404);
  });

  it("429s when the pantry rate limit trips", async () => {
    const order = await makeClaimedOrder();
    const POST = createPantrySubmitHandler(
      makeDeps({
        rateLimit: async () => ({ ok: false, retryAfterSeconds: 60 }) as const
      })
    );
    const response = await POST(submitRequest(validBody(order.id)));
    expect(response.status).toBe(429);
  });

  it("partial extraction: a failed photo is marked, the rest still draft items", async () => {
    const order = await makeClaimedOrder();
    const flaky = {
      extractFromPhoto: vi
        .fn()
        .mockResolvedValueOnce([{ name: "rolled oats", portion: null }])
        .mockRejectedValueOnce(new Error("vision down"))
    };
    const POST = createPantrySubmitHandler(makeDeps({ vision: () => flaky }));

    const response = await POST(submitRequest(validBody(order.id)));
    const body = await response.json();

    expect(body.status).toBe("awaiting_confirm");
    expect(body.failedPhotos).toBe(1);
    const photos = await testDb.db
      .select()
      .from(schema.pantryPhotos)
      .where(eq(schema.pantryPhotos.orderId, order.id));
    expect(photos.map((photo) => photo.status).sort()).toEqual([
      "extracted",
      "failed"
    ]);
  });

  it("total extraction failure: needs_manual + founder alerted, buyer sees the service state", async () => {
    const order = await makeClaimedOrder();
    const dead = {
      extractFromPhoto: vi.fn().mockRejectedValue(new Error("vision down"))
    };
    const email = { send: vi.fn().mockResolvedValue({ ok: true }) };
    const POST = createPantrySubmitHandler(makeDeps({ vision: () => dead, email }));

    const response = await POST(submitRequest(validBody(order.id)));
    const body = await response.json();

    expect(body.status).toBe("needs_manual");
    const [updated] = await testDb.db
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, order.id));
    expect(updated.status).toBe("needs_manual");
    expect(email.send).toHaveBeenCalledTimes(1);
  });
});
