import { and, desc, eq, gte, lt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { decryptField, encryptField } from "../../../lib/server/crypto";
import { getDb, schema, type Db } from "../../../lib/server/db";
import { getEntitlement, type Entitlement } from "../../../lib/server/entitlement";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../lib/server/session";

/**
 * Server history (plan 4B). Food text is stored encrypted and decrypted only
 * here, for the authenticated owner. Coarse fields stay plaintext.
 */

export type RouteDeps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  entitlementOf?: (db: Db, userId: string) => Promise<Entitlement>;
};

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;
const MAX_MIGRATE_BATCH = 500;
// Free tier keeps the recent week (guest parity); the full archive is
// premium (plan 4D: premium = history + insights + progress + nudge).
const FREE_HISTORY_DAYS = 7;

const StoredCheckSchema = z
  .object({
    clientId: z.string().trim().min(1).max(64),
    food: z.string().trim().min(1).max(160),
    risk: z.enum(["SAFE", "MODERATE", "HIGH"]),
    a1cBand: z.string().trim().min(1).max(32),
    inputMethod: z.enum(["text", "voice"]),
    createdAt: z.iso.datetime(),
    actionDoneAt: z.iso.datetime().optional()
  })
  .strict();

const MigrateRequestSchema = z
  .object({
    checks: z.array(StoredCheckSchema).min(1).max(MAX_MIGRATE_BATCH)
  })
  .strict();

const ActionRequestSchema = z
  .object({ clientId: z.string().trim().min(1).max(64) })
  .strict();

function unauthorized() {
  return NextResponse.json({ error: "Sign in first." }, { status: 401 });
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function createHistoryGetHandler(deps: RouteDeps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const entitlementOf =
    deps.entitlementOf ?? ((d: Db, userId: string) => getEntitlement(d, userId));

  return async function GET(request: Request) {
    const session = await getSession();
    if (!session) {
      return unauthorized();
    }

    const url = new URL(request.url);
    const limit = Math.min(
      Math.max(Number(url.searchParams.get("limit")) || DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );
    const beforeParam = url.searchParams.get("before");
    const before = beforeParam ? new Date(beforeParam) : null;

    const conditions = [eq(schema.checks.userId, session.userId)];
    if (before && !Number.isNaN(before.getTime())) {
      conditions.push(lt(schema.checks.createdAt, before));
    }

    // Server-enforced free-tier window.
    const entitlement = await entitlementOf(db(), session.userId);
    if (entitlement.tier === "free") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - (FREE_HISTORY_DAYS - 1));
      cutoff.setHours(0, 0, 0, 0);
      conditions.push(gte(schema.checks.createdAt, cutoff));
    }

    const rows = await db()
      .select()
      .from(schema.checks)
      .where(and(...conditions))
      .orderBy(desc(schema.checks.createdAt))
      .limit(limit);

    const checks = rows.map((row) => ({
      clientId: row.clientId ?? row.id,
      food: safeDecrypt(row.foodCiphertext),
      risk: row.risk,
      a1cBand: row.a1cBand,
      inputMethod: row.inputMethod,
      actionDoneAt: row.actionDoneAt?.toISOString(),
      createdAt: row.createdAt.toISOString()
    }));

    return NextResponse.json({
      checks,
      nextBefore:
        rows.length === limit
          ? rows[rows.length - 1].createdAt.toISOString()
          : null
    });
  };
}

export function createHistoryMigrateHandler(deps: RouteDeps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;

  return async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
      return unauthorized();
    }

    const parsed = MigrateRequestSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid migration payload." },
        { status: 400 }
      );
    }

    const inserted = await db()
      .insert(schema.checks)
      .values(
        parsed.data.checks.map((check) => ({
          userId: session.userId,
          foodCiphertext: encryptField(check.food),
          risk: check.risk,
          a1cBand: check.a1cBand,
          inputMethod: check.inputMethod,
          clientId: check.clientId,
          createdAt: new Date(check.createdAt),
          actionDoneAt: check.actionDoneAt
            ? new Date(check.actionDoneAt)
            : null
        }))
      )
      .onConflictDoNothing()
      .returning({ id: schema.checks.id });

    return NextResponse.json({ imported: inserted.length });
  };
}

export function createHistoryActionHandler(deps: RouteDeps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;

  return async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
      return unauthorized();
    }

    const parsed = ActionRequestSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    await db()
      .update(schema.checks)
      .set({ actionDoneAt: new Date() })
      .where(
        and(
          eq(schema.checks.userId, session.userId),
          eq(schema.checks.clientId, parsed.data.clientId)
        )
      );

    return NextResponse.json({ ok: true });
  };
}

function safeDecrypt(ciphertext: string): string {
  try {
    return decryptField(ciphertext);
  } catch {
    // A row that cannot decrypt (rotated key) degrades to a placeholder —
    // never an error that blocks the whole history.
    return "(unreadable entry)";
  }
}
