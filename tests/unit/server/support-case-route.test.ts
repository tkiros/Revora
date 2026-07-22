import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  createSupportCaseHandler,
  SUPPORT_MESSAGE_MAX
} from "../../../app/api/support/handlers";
import { decryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const TEST_KEY = Buffer.alloc(32, 9).toString("base64");

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let userId: string;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = TEST_KEY;
  testDb = await createTestDb();
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: "case@test.dev" })
    .returning();
  userId = user.id;
});

afterAll(async () => {
  delete process.env.HEALTH_DATA_KEY;
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.supportCases);
});

function post(body: unknown) {
  return new Request("http://localhost/api/support/case", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

const session = async () => ({ userId, email: "case@test.dev" });

describe("POST /api/support/case (P0.4)", () => {
  it("401s signed-out requests", async () => {
    const handler = createSupportCaseHandler({
      db: () => testDb.db,
      getSession: async () => null as never,
      sendEmailImpl: async () => ({ ok: true as const })
    });
    expect((await handler(post({ kind: "help", message: "hi" }))).status).toBe(
      401
    );
  });

  it("400s bad kind, empty message, and over-cap message — no row, no email", async () => {
    let sent = 0;
    const handler = createSupportCaseHandler({
      db: () => testDb.db,
      getSession: session,
      sendEmailImpl: async () => ((sent += 1), { ok: true as const })
    });

    for (const body of [
      { kind: "complaint", message: "hello" },
      { kind: "help", message: "   " },
      { kind: "refund", message: "x".repeat(SUPPORT_MESSAGE_MAX + 1) },
      null
    ]) {
      expect((await handler(post(body))).status).toBe(400);
    }
    expect(sent).toBe(0);
    expect(await testDb.db.select().from(schema.supportCases)).toHaveLength(0);
  });

  it("writes an encrypted row, emails a full copy to the inbox, returns the case id", async () => {
    let mail: { to: string; subject: string; text: string } | null = null;
    const handler = createSupportCaseHandler({
      db: () => testDb.db,
      getSession: session,
      sendEmailImpl: async (args) => ((mail = args), { ok: true as const })
    });

    const response = await handler(
      post({ kind: "refund", message: "Charged twice for July." })
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.emailed).toBe(true);

    const [row] = await testDb.db
      .select()
      .from(schema.supportCases)
      .where(eq(schema.supportCases.id, body.caseId));
    expect(row.kind).toBe("refund");
    expect(row.status).toBe("open");
    // Encrypted at rest — never the plaintext in the column.
    expect(row.messageCiphertext).not.toContain("Charged twice");
    expect(decryptField(row.messageCiphertext)).toBe("Charged twice for July.");

    expect(mail!.to).toBe("support@revora.plus");
    expect(mail!.subject).toContain(body.caseId);
    expect(mail!.text).toContain("Charged twice for July.");
    expect(mail!.text).toContain("case@test.dev");
  });

  // Namecheap's forwarders greylist Resend's relays, so production points the
  // internal copy at a directly-deliverable inbox via SUPPORT_INBOX_EMAIL.
  it("SUPPORT_INBOX_EMAIL overrides the internal recipient; public address is the fallback", async () => {
    process.env.SUPPORT_INBOX_EMAIL = "owner-inbox@test.dev";
    try {
      let mail: { to: string } | undefined;
      const handler = createSupportCaseHandler({
        db: () => testDb.db,
        getSession: session,
        sendEmailImpl: async (input) => {
          mail = input;
          return { ok: true as const };
        }
      });
      const response = await handler(
        post({ kind: "help", message: "Where does this land?" })
      );
      expect(response.status).toBe(201);
      expect(mail!.to).toBe("owner-inbox@test.dev");
    } finally {
      delete process.env.SUPPORT_INBOX_EMAIL;
    }
  });

  it("an email failure never loses the case — row written, caseId returned, emailed:false", async () => {
    const handler = createSupportCaseHandler({
      db: () => testDb.db,
      getSession: session,
      sendEmailImpl: async () => ({ ok: false as const, status: 500 })
    });

    const response = await handler(post({ kind: "help", message: "stuck" }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.emailed).toBe(false);
    const rows = await testDb.db.select().from(schema.supportCases);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe(body.caseId);
  });

  it("a thrown email send never loses the case either", async () => {
    const handler = createSupportCaseHandler({
      db: () => testDb.db,
      getSession: session,
      sendEmailImpl: async () => {
        throw new Error("resend down");
      }
    });

    const response = await handler(post({ kind: "help", message: "stuck" }));
    expect(response.status).toBe(201);
    expect(await testDb.db.select().from(schema.supportCases)).toHaveLength(1);
  });
});
