import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createAccountExportHandler } from "../../../app/api/account/export/route";
import { encryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

/**
 * PR-5: the data-rights export must include what the other export endpoints
 * omitted — the exact A1C, weekly reflections, and the pantry corpus.
 */

const NOW = new Date("2026-07-21T12:00:00.000Z");

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let userId: string;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = Buffer.alloc(32, 7).toString("base64");
  testDb = await createTestDb();
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: "export@test.dev" })
    .returning();
  userId = user.id;
  await testDb.db.insert(schema.profiles).values({
    userId,
    a1cCiphertext: encryptField("6.1"),
    a1cBand: "prediabetes_60_62",
    timezone: "UTC",
    consentedAt: NOW
  });
  await testDb.db.insert(schema.weeklyReflections).values({
    userId,
    weekStart: "2026-07-13",
    version: "v1",
    artifactCiphertext: encryptField('{"headline":"steady week"}')
  });
  await testDb.db.insert(schema.pantryOrders).values({
    userId,
    email: "export@test.dev",
    stripeSessionId: "cs_export_1",
    claimToken: "hash_export_1",
    status: "ready",
    a1cBand: "prediabetes_60_62",
    a1cCiphertext: encryptField("6.2"),
    notesCiphertext: encryptField("mostly cooking at home"),
    reportCiphertext: encryptField("Report body")
  });
});

afterAll(async () => {
  delete process.env.HEALTH_DATA_KEY;
  await testDb.close();
});

describe("GET /api/account/export (PR-5)", () => {
  it("401s signed out", async () => {
    const GET = createAccountExportHandler({
      db: () => testDb.db,
      getSession: async () => null
    });
    expect((await GET()).status).toBe(401);
  });

  it("bundles exact A1C, weekly reflections, and pantry data", async () => {
    const GET = createAccountExportHandler({
      db: () => testDb.db,
      getSession: async () => ({ userId, email: "export@test.dev" }),
      now: () => NOW
    });

    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-disposition")).toContain("attachment");

    const body = (await res.json()) as {
      profile: { a1c: string; a1cBand: string };
      weeklyReflections: Array<{ artifact: string }>;
      pantryOrders: Array<{ a1c: string | null; notes: string | null; report: string | null }>;
    };
    expect(body.profile.a1c).toBe("6.1");
    expect(body.profile.a1cBand).toBe("prediabetes_60_62");
    expect(body.weeklyReflections[0].artifact).toContain("steady week");
    expect(body.pantryOrders[0].a1c).toBe("6.2");
    expect(body.pantryOrders[0].notes).toBe("mostly cooking at home");
    expect(body.pantryOrders[0].report).toBe("Report body");
  });
});
