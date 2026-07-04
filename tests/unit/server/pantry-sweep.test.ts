import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { hashClaimToken } from "../../../lib/server/pantry/claims";
import { runPantrySweep } from "../../../lib/server/pantry/sweep";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const NOW = new Date("2026-07-08T12:00:00.000Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000);

let testDb: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = Buffer.alloc(32, 12).toString("base64");
  process.env.NEXT_PUBLIC_APP_URL = "https://revora.test";
  testDb = await createTestDb();
});

afterAll(async () => {
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.pantryOrders);
  await testDb.db.delete(schema.cronHeartbeat);
});

async function makeOrder(overrides: Partial<typeof schema.pantryOrders.$inferInsert>) {
  const [order] = await testDb.db
    .insert(schema.pantryOrders)
    .values({
      email: "buyer@example.com",
      stripeSessionId: `cs_${Math.random().toString(36).slice(2)}`,
      claimToken: `hash_${Math.random().toString(36).slice(2)}`,
      ...overrides
    })
    .returning();
  return order;
}

function makeDeps() {
  return {
    db: testDb.db,
    model: { generate: vi.fn() },
    email: { send: vi.fn().mockResolvedValue({ ok: true }) },
    deleteBlobs: vi.fn().mockResolvedValue(undefined),
    now: () => NOW,
    processOrder: vi.fn().mockResolvedValue({ done: true })
  };
}

describe("runPantrySweep", () => {
  it("re-sends a failed intake email with a freshly minted token", async () => {
    const order = await makeOrder({ status: "paid", intakeEmailSentAt: null });
    const deps = makeDeps();

    const result = await runPantrySweep(deps);

    expect(result.intakeResent).toBe(1);
    const message = deps.email.send.mock.calls[0][0];
    const token = /token=([A-Za-z0-9_-]+)/.exec(message.text)?.[1] ?? "";
    const [updated] = await testDb.db
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, order.id));
    expect(updated.claimToken).toBe(hashClaimToken(token));
    expect(updated.claimToken).not.toBe(order.claimToken);
    expect(updated.intakeEmailSentAt?.toISOString()).toBe(NOW.toISOString());
  });

  it("resumes processing orders whose lease expired", async () => {
    const order = await makeOrder({
      status: "processing",
      processingLeaseUntil: hoursAgo(1)
    });
    const deps = makeDeps();

    const result = await runPantrySweep(deps);

    expect(result.resumed).toBe(1);
    expect(deps.processOrder).toHaveBeenCalledWith(
      expect.anything(),
      order.id,
      expect.any(Number)
    );
  });

  it("marks a dead mid-extraction order needs_manual", async () => {
    const order = await makeOrder({ status: "extracting", updatedAt: hoursAgo(1) });
    await runPantrySweep(makeDeps());
    const [updated] = await testDb.db
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, order.id));
    expect(updated.status).toBe("needs_manual");
  });

  it("re-delivers ready-but-undelivered reports", async () => {
    await makeOrder({
      status: "ready",
      reportCiphertext: "ct",
      deliveredAt: null
    });
    const deps = makeDeps();
    const result = await runPantrySweep(deps);
    expect(result.redelivered).toBe(1);
    expect(deps.email.send).toHaveBeenCalled();
  });

  it("alerts the founder exactly in the hour an order crosses 2h stuck", async () => {
    await makeOrder({ status: "submitted", updatedAt: hoursAgo(2.5) });
    const inWindow = await runPantrySweep(makeDeps());
    expect(inWindow.alerted).toBe(1);

    await testDb.db.delete(schema.pantryOrders);
    await makeOrder({ status: "submitted", updatedAt: hoursAgo(6) });
    const outOfWindow = await runPantrySweep(makeDeps());
    expect(outOfWindow.alerted).toBe(0);
  });

  it("writes the pantry-sweep heartbeat", async () => {
    await runPantrySweep(makeDeps());
    const [beat] = await testDb.db
      .select()
      .from(schema.cronHeartbeat)
      .where(eq(schema.cronHeartbeat.name, "pantry-sweep"));
    expect(beat.lastRunAt.toISOString()).toBe(NOW.toISOString());
  });
});
