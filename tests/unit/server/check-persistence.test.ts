import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createCheckRouteHandler } from "../../../app/api/check/route";
import { decryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const TEST_KEY = Buffer.alloc(32, 3).toString("base64");

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let userId: string;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = TEST_KEY;
  testDb = await createTestDb();
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: "persist@test.dev" })
    .returning();
  userId = user.id;
});

afterAll(async () => {
  delete process.env.HEALTH_DATA_KEY;
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.checks);
});

const RESULT_RESPONSE = {
  kind: "result",
  risk: "MODERATE",
  reason: "This leans on refined carbs.",
  adjustment: "If practical, add protein.",
  swap: "If you have the option, swap to a less refined version.",
  disclaimer: "Not medical advice."
} as const;

function createHandler(options: {
  sessionUserId: string | null;
  responseKind?: "result" | "clarify";
  dbFails?: boolean;
}) {
  const checkFoodImpl = vi.fn().mockResolvedValue(
    options.responseKind === "clarify"
      ? {
          kind: "clarify",
          question: "Plain or sweetened?",
          examples: [],
          disclaimer: "Not medical advice."
        }
      : RESULT_RESPONSE
  );

  return createCheckRouteHandler({
    checkFoodImpl,
    emitEvent: vi.fn(),
    modelFactory: () => ({ generate: vi.fn() }),
    db: options.dbFails
      ? () => {
          throw new Error("db down");
        }
      : () => testDb.db,
    getSession: async () =>
      options.sessionUserId
        ? { userId: options.sessionUserId, email: "persist@test.dev" }
        : null
  });
}

function checkRequest(headers: Record<string, string> = {}) {
  return new Request("http://test/api/check", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify({ food: "white rice and beans", a1c: 6.1 })
  });
}

describe("check persistence (4B)", () => {
  it("persists a signed-in result with encrypted food, band, method, client id", async () => {
    const POST = createHandler({ sessionUserId: userId });
    const response = await POST(
      checkRequest({
        "x-revora-client-id": "web-123",
        "x-revora-input-method": "voice"
      })
    );

    expect(response.status).toBe(200);

    const rows = await testDb.db
      .select()
      .from(schema.checks)
      .where(eq(schema.checks.userId, userId));

    expect(rows).toHaveLength(1);
    expect(rows[0].risk).toBe("MODERATE");
    expect(rows[0].a1cBand).toBe("prediabetes_60_62");
    expect(rows[0].inputMethod).toBe("voice");
    expect(rows[0].clientId).toBe("web-123");
    expect(rows[0].foodCiphertext).not.toContain("rice");
    expect(decryptField(rows[0].foodCiphertext)).toBe("white rice and beans");
  });

  it("persists nothing for guests", async () => {
    const POST = createHandler({ sessionUserId: null });
    await POST(checkRequest());

    const rows = await testDb.db.select().from(schema.checks);
    expect(rows).toHaveLength(0);
  });

  it("persists nothing for non-result kinds", async () => {
    const POST = createHandler({
      sessionUserId: userId,
      responseKind: "clarify"
    });
    await POST(checkRequest());

    const rows = await testDb.db.select().from(schema.checks);
    expect(rows).toHaveLength(0);
  });

  it("defaults a bad input-method header to text", async () => {
    const POST = createHandler({ sessionUserId: userId });
    await POST(checkRequest({ "x-revora-input-method": "photo" }));

    const rows = await testDb.db.select().from(schema.checks);
    expect(rows[0].inputMethod).toBe("text");
  });

  it("fails soft: a broken DB never breaks the check response", async () => {
    const POST = createHandler({ sessionUserId: userId, dbFails: true });
    const response = await POST(checkRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.kind).toBe("result");
  });
});
