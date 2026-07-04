import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { encryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { loadReportForUser } from "../../../lib/server/pantry/report-view";
import { createTestDb } from "../../helpers/test-db";

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let userId: string;
let strangerId: string;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = Buffer.alloc(32, 13).toString("base64");
  testDb = await createTestDb();
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: "report@test.dev" })
    .returning();
  const [stranger] = await testDb.db
    .insert(schema.users)
    .values({ email: "stranger2@test.dev" })
    .returning();
  userId = user.id;
  strangerId = stranger.id;
});

afterAll(async () => {
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.pantryOrders);
});

const REPORT = {
  generatedAt: "2026-07-08T12:00:00.000Z",
  a1cBand: "prediabetes_60_62",
  counts: { safe: 1, moderate: 0, high: 0, failed: 0 },
  sections: {
    safe: [{ name: "eggs", portion: null, reason: "r", adjustment: null, swap: null }],
    moderate: [],
    high: [],
    failed: []
  },
  disclaimer: "Not medical advice."
};

async function makeOrder(overrides: Partial<typeof schema.pantryOrders.$inferInsert>) {
  const [order] = await testDb.db
    .insert(schema.pantryOrders)
    .values({
      email: "report@test.dev",
      stripeSessionId: `cs_${Math.random().toString(36).slice(2)}`,
      claimToken: `hash_${Math.random().toString(36).slice(2)}`,
      userId,
      ...overrides
    })
    .returning();
  return order;
}

describe("loadReportForUser", () => {
  it("returns the decrypted report for the owner of a ready order", async () => {
    const order = await makeOrder({
      status: "ready",
      reportCiphertext: encryptField(JSON.stringify(REPORT))
    });
    const view = await loadReportForUser(testDb.db, userId, order.id);
    expect(view.kind).toBe("ready");
    if (view.kind === "ready") {
      expect(view.report.sections.safe[0].name).toBe("eggs");
    }
  });

  it("returns processing (never a 404) for the owner while any pre-ready status", async () => {
    const order = await makeOrder({ status: "processing" });
    const view = await loadReportForUser(testDb.db, userId, order.id);
    expect(view.kind).toBe("processing");
  });

  it("returns not_found for a non-owner (wrong-user access)", async () => {
    const order = await makeOrder({ status: "ready", reportCiphertext: encryptField("{}") });
    const view = await loadReportForUser(testDb.db, strangerId, order.id);
    expect(view.kind).toBe("not_found");
  });

  it("returns not_found for a garbage id without throwing", async () => {
    const view = await loadReportForUser(testDb.db, userId, "not-a-uuid");
    expect(view.kind).toBe("not_found");
  });

  it("returns not_found for canceled (refunded) orders", async () => {
    const order = await makeOrder({ status: "canceled" });
    const view = await loadReportForUser(testDb.db, userId, order.id);
    expect(view.kind).toBe("not_found");
  });
});
