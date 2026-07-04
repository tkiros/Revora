import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  createHistoryGetHandler,
  createHistoryMigrateHandler,
  createHistoryActionHandler
} from "../../../app/api/history/handlers";
import { encryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const TEST_KEY = Buffer.alloc(32, 5).toString("base64");

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
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.checks);
});

function asUser(userId: string | null) {
  return {
    db: () => testDb.db,
    getSession: async () =>
      userId ? { userId, email: "owner@test.dev" } : null
  };
}

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

async function seedCheck(userId: string, food: string, clientId?: string) {
  await testDb.db.insert(schema.checks).values({
    userId,
    foodCiphertext: encryptField(food),
    risk: "MODERATE",
    a1cBand: "prediabetes_60_62",
    inputMethod: "text",
    clientId: clientId ?? null
  });
}

describe("GET /api/history", () => {
  it("401s signed-out requests", async () => {
    const GET = createHistoryGetHandler(asUser(null));
    const response = await GET(new Request("http://test/api/history"));

    expect(response.status).toBe(401);
  });

  it("returns only the owner's checks, food decrypted", async () => {
    await seedCheck(ownerId, "lentil soup");
    await seedCheck(otherId, "other users pasta");

    const GET = createHistoryGetHandler(asUser(ownerId));
    const response = await GET(new Request("http://test/api/history"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.checks).toHaveLength(1);
    expect(body.checks[0].food).toBe("lentil soup");
    expect(JSON.stringify(body)).not.toContain("other users pasta");
  });

  it("caps the page size", async () => {
    for (let i = 0; i < 5; i += 1) {
      await seedCheck(ownerId, `meal ${i}`);
    }

    const GET = createHistoryGetHandler(asUser(ownerId));
    const response = await GET(
      new Request("http://test/api/history?limit=2")
    );
    const body = await response.json();

    expect(body.checks).toHaveLength(2);
  });
});

describe("POST /api/history/migrate", () => {
  const storedCheck = (clientId: string, food = "oatmeal with nuts") => ({
    clientId,
    food,
    risk: "MODERATE",
    a1cBand: "prediabetes_60_62",
    inputMethod: "text",
    createdAt: "2026-06-30T12:00:00.000Z"
  });

  it("401s signed-out requests", async () => {
    const POST = createHistoryMigrateHandler(asUser(null));
    const response = await POST(
      jsonRequest("http://test/api/history/migrate", {
        checks: [storedCheck("a")]
      })
    );

    expect(response.status).toBe(401);
  });

  it("imports local checks encrypted, keeping the original timestamps", async () => {
    const POST = createHistoryMigrateHandler(asUser(ownerId));
    const response = await POST(
      jsonRequest("http://test/api/history/migrate", {
        checks: [storedCheck("local-1"), storedCheck("local-2", "salad bowl")]
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.imported).toBe(2);

    const rows = await testDb.db
      .select()
      .from(schema.checks)
      .where(eq(schema.checks.userId, ownerId));
    expect(rows).toHaveLength(2);
    // encrypted at rest — no plaintext food in any column
    for (const row of rows) {
      expect(JSON.stringify(row)).not.toMatch(/oatmeal|salad/);
    }
    expect(rows[0].createdAt.toISOString()).toBe("2026-06-30T12:00:00.000Z");
  });

  it("is idempotent — re-running the same migration imports nothing new", async () => {
    const POST = createHistoryMigrateHandler(asUser(ownerId));
    const payload = { checks: [storedCheck("dup-1")] };

    await POST(jsonRequest("http://test/api/history/migrate", payload));
    const second = await POST(
      jsonRequest("http://test/api/history/migrate", payload)
    );
    const body = await second.json();

    expect(body.imported).toBe(0);

    const rows = await testDb.db
      .select()
      .from(schema.checks)
      .where(eq(schema.checks.userId, ownerId));
    expect(rows).toHaveLength(1);
  });

  it("rejects oversized payloads", async () => {
    const POST = createHistoryMigrateHandler(asUser(ownerId));
    const response = await POST(
      jsonRequest("http://test/api/history/migrate", {
        checks: Array.from({ length: 501 }, (_, i) => storedCheck(`c${i}`))
      })
    );

    expect(response.status).toBe(400);
  });

  it("carries actionDoneAt through the migration", async () => {
    const POST = createHistoryMigrateHandler(asUser(ownerId));
    await POST(
      jsonRequest("http://test/api/history/migrate", {
        checks: [
          {
            ...storedCheck("acted-1"),
            actionDoneAt: "2026-06-30T13:00:00.000Z"
          }
        ]
      })
    );

    const rows = await testDb.db
      .select()
      .from(schema.checks)
      .where(eq(schema.checks.userId, ownerId));
    expect(rows[0].actionDoneAt?.toISOString()).toBe(
      "2026-06-30T13:00:00.000Z"
    );
  });
});

describe("POST /api/history/action", () => {
  it("marks the owner's check done and never another user's", async () => {
    await seedCheck(ownerId, "walk meal", "act-1");
    await seedCheck(otherId, "other meal", "act-1");

    const POST = createHistoryActionHandler(asUser(ownerId));
    const response = await POST(
      jsonRequest("http://test/api/history/action", { clientId: "act-1" })
    );

    expect(response.status).toBe(200);

    const ownerRows = await testDb.db
      .select()
      .from(schema.checks)
      .where(eq(schema.checks.userId, ownerId));
    const otherRows = await testDb.db
      .select()
      .from(schema.checks)
      .where(eq(schema.checks.userId, otherId));

    expect(ownerRows[0].actionDoneAt).toBeTruthy();
    expect(otherRows[0].actionDoneAt).toBeNull();
  });
});
