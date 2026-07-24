import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createPantryConfirmHandler } from "../../../app/api/pantry/confirm/route";
import { decryptField, encryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const NOW = new Date("2026-07-06T10:00:00.000Z");

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let userId: string;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = Buffer.alloc(32, 9).toString("base64");
  testDb = await createTestDb();
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: "confirm@test.dev" })
    .returning();
  userId = user.id;
});

afterAll(async () => {
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.pantryOrders);
});

async function makeAwaitingOrder() {
  const [order] = await testDb.db
    .insert(schema.pantryOrders)
    .values({
      email: "confirm@test.dev",
      stripeSessionId: `cs_${Math.random().toString(36).slice(2)}`,
      claimToken: `hash_${Math.random().toString(36).slice(2)}`,
      userId,
      status: "awaiting_confirm"
    })
    .returning();
  await testDb.db.insert(schema.pantryItems).values({
    orderId: order.id,
    position: 0,
    nameCiphertext: encryptField("draft item"),
    source: "vision",
    status: "draft"
  });
  return order;
}

const deps = (uid = userId) => ({
  db: () => testDb.db,
  getSession: async () => ({ userId: uid, email: "confirm@test.dev" }),
  now: () => NOW
});

function confirmRequest(body: unknown) {
  return new Request("http://t/api/pantry/confirm", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("POST /api/pantry/confirm", () => {
  it("replaces drafts with the buyer's confirmed list and moves to processing", async () => {
    const order = await makeAwaitingOrder();
    const POST = createPantryConfirmHandler(deps());

    const response = await POST(
      confirmRequest({
        orderId: order.id,
        items: [
          { name: "steel cut oats", portion: "1 canister" },
          { name: "white bread", portion: null }
        ]
      })
    );

    expect(response.status).toBe(200);
    const [updated] = await testDb.db
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, order.id));
    expect(updated.status).toBe("processing");

    const items = await testDb.db
      .select()
      .from(schema.pantryItems)
      .where(eq(schema.pantryItems.orderId, order.id));
    expect(items).toHaveLength(2);
    expect(items.every((item) => item.source === "buyer")).toBe(true);
    expect(items.every((item) => item.status === "confirmed")).toBe(true);
    expect(decryptField(items[0].nameCiphertext)).toBe("steel cut oats");
  });

  it("rejects a 41st item", async () => {
    const order = await makeAwaitingOrder();
    const POST = createPantryConfirmHandler(deps());
    const response = await POST(
      confirmRequest({
        orderId: order.id,
        items: Array.from({ length: 41 }, (_, index) => ({
          name: `item ${index}`,
          portion: null
        }))
      })
    );
    expect(response.status).toBe(400);
  });

  it("rejects an empty list", async () => {
    const order = await makeAwaitingOrder();
    const POST = createPantryConfirmHandler(deps());
    const response = await POST(confirmRequest({ orderId: order.id, items: [] }));
    expect(response.status).toBe(400);
  });

  it("404s another user's order", async () => {
    const order = await makeAwaitingOrder();
    const POST = createPantryConfirmHandler(deps(crypto.randomUUID()));
    const response = await POST(
      confirmRequest({ orderId: order.id, items: [{ name: "x", portion: null }] })
    );
    expect(response.status).toBe(404);
  });

  it("double-confirm: second call is a 409 and does not duplicate items", async () => {
    const order = await makeAwaitingOrder();
    const POST = createPantryConfirmHandler(deps());
    const body = {
      orderId: order.id,
      items: [{ name: "steel cut oats", portion: null }]
    };

    await POST(confirmRequest(body));
    const second = await POST(confirmRequest(body));

    expect(second.status).toBe(409);
    const items = await testDb.db
      .select()
      .from(schema.pantryItems)
      .where(eq(schema.pantryItems.orderId, order.id));
    expect(items).toHaveLength(1);
  });

  it("WS-7: a TRUE concurrent double-confirm yields one 200 + one 409, items written once", async () => {
    const order = await makeAwaitingOrder();
    const POST = createPantryConfirmHandler(deps());
    const body = {
      orderId: order.id,
      items: [{ name: "steel cut oats", portion: null }]
    };

    const responses = await Promise.all([
      POST(confirmRequest(body)),
      POST(confirmRequest(body))
    ]);
    expect(responses.map((r) => r.status).sort()).toEqual([200, 409]);

    const items = await testDb.db
      .select()
      .from(schema.pantryItems)
      .where(eq(schema.pantryItems.orderId, order.id));
    expect(items).toHaveLength(1);
    expect(items[0].status).toBe("confirmed");
    expect(decryptField(items[0].nameCiphertext)).toBe("steel cut oats");
  });

  it("WS-7 fault injection: a failure mid-confirm rolls EVERYTHING back — no stranded processing", async () => {
    const order = await makeAwaitingOrder();
    // now() is called once for the status transition, then per confirmed
    // item — throwing from the second call on faults the transaction AFTER
    // the transition + draft delete have run inside it.
    let calls = 0;
    const POST = createPantryConfirmHandler({
      ...deps(),
      now: () => {
        calls += 1;
        if (calls >= 2) {
          throw new Error("injected fault mid-transaction");
        }
        return NOW;
      }
    });

    await expect(
      POST(
        confirmRequest({
          orderId: order.id,
          items: [{ name: "steel cut oats", portion: null }]
        })
      )
    ).rejects.toThrow("injected fault");

    // Atomicity: the order is NOT stranded `processing`, and the drafts the
    // buyer was confirming are still there for the retry.
    const [after] = await testDb.db
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, order.id));
    expect(after.status).toBe("awaiting_confirm");
    const items = await testDb.db
      .select()
      .from(schema.pantryItems)
      .where(eq(schema.pantryItems.orderId, order.id));
    expect(items).toHaveLength(1);
    expect(items[0].status).toBe("draft");

    // And the retry (healthy clock) completes normally.
    const retry = await createPantryConfirmHandler(deps())(
      confirmRequest({
        orderId: order.id,
        items: [{ name: "steel cut oats", portion: null }]
      })
    );
    expect(retry.status).toBe(200);
  });
});
