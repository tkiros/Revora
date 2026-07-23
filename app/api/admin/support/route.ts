import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdmin } from "../../../../lib/server/admin";
import { decryptField } from "../../../../lib/server/crypto";
import { getDb, schema, type Db } from "../../../../lib/server/db";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../../lib/server/session";

export const runtime = "nodejs";

type Deps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  now?: () => Date;
};

const UpdateSchema = z
  .object({
    caseId: z.string().uuid(),
    status: z.enum(["open", "resolved"])
  })
  .strict();

const NO_STORE = { "Cache-Control": "no-store" } as const;

export function createAdminSupportHandlers(deps: Deps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const now = deps.now ?? (() => new Date());

  async function GET(request: Request) {
    const session = await getSession();
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: "Not found." },
        { status: 404, headers: NO_STORE }
      );
    }

    const requested = new URL(request.url).searchParams.get("status");
    const status = requested === "resolved" ? "resolved" : "open";
    const rows = await db()
      .select({
        id: schema.supportCases.id,
        kind: schema.supportCases.kind,
        messageCiphertext: schema.supportCases.messageCiphertext,
        status: schema.supportCases.status,
        createdAt: schema.supportCases.createdAt,
        resolvedAt: schema.supportCases.resolvedAt,
        accountEmail: schema.users.email
      })
      .from(schema.supportCases)
      .innerJoin(schema.users, eq(schema.supportCases.userId, schema.users.id))
      .where(eq(schema.supportCases.status, status))
      .orderBy(desc(schema.supportCases.createdAt))
      .limit(50);

    return NextResponse.json(
      {
        cases: rows.map(({ messageCiphertext, ...row }) => ({
          ...row,
          message: decryptField(messageCiphertext)
        }))
      },
      { headers: NO_STORE }
    );
  }

  async function PATCH(request: Request) {
    const session = await getSession();
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: "Not found." },
        { status: 404, headers: NO_STORE }
      );
    }

    const parsed = UpdateSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request." },
        { status: 400, headers: NO_STORE }
      );
    }
    const updatedAt = now();
    const updated = await db()
      .update(schema.supportCases)
      .set({
        status: parsed.data.status,
        resolvedAt: parsed.data.status === "resolved" ? updatedAt : null
      })
      .where(eq(schema.supportCases.id, parsed.data.caseId))
      .returning({ id: schema.supportCases.id });
    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Not found." },
        { status: 404, headers: NO_STORE }
      );
    }
    return NextResponse.json(
      { ok: true, status: parsed.data.status },
      { headers: NO_STORE }
    );
  }

  return { GET, PATCH };
}

export const { GET, PATCH } = createAdminSupportHandlers();
