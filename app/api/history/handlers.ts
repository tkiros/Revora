import { and, desc, eq, gte, lt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import type { A1CBand } from "../../../lib/revora/a1c";
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

/**
 * N-27 — history-migrate imports rows the CLIENT authored. `createdAt`, `risk`
 * and `a1cBand` all come out of localStorage, which the owner can edit freely,
 * and the server used to store whatever arrived. The blast radius is self-only
 * (every row is stamped with the caller's own userId), but a forged timeline
 * still corrupts the streak and BAI series the coach reasons over — and those
 * are numbers we hand back to the user as if we had observed them.
 *
 * So bound the timeline server-side: nothing from the future beyond ordinary
 * client-clock skew, and nothing older than the guest history could plausibly
 * be. `risk` and `a1cBand` are separately constrained to their real enums (the
 * a1cBand values the app actually writes), so a hand-edited band can no longer
 * enter the DB at all.
 */
const MIGRATE_MAX_SKEW_MS = 5 * 60 * 1000;
const MIGRATE_MAX_AGE_MS = 2 * 365 * 24 * 60 * 60 * 1000;

// The bands the app itself writes (lib/revora/a1c.ts is the source of truth —
// `checks.a1c_band` is untyped text, so this schema is the only thing standing
// between a hand-edited localStorage entry and the DB). Both directions are
// asserted at compile time: `satisfies` rejects a value that is not a band, and
// the Exclude check fails the build if a NEW band is added upstream and not
// listed here — which would otherwise reject a legitimate migration silently.
const A1C_BANDS = [
  "below_prediabetes_range",
  "prediabetes_57_59",
  "prediabetes_60_62",
  "prediabetes_63_64",
  "diabetes_range_out_of_scope"
] as const satisfies readonly A1CBand[];

type UncoveredBand = Exclude<A1CBand, (typeof A1C_BANDS)[number]>;
const _allBandsCovered: UncoveredBand extends never ? true : never = true;
void _allBandsCovered;

function boundedTimestamp() {
  return z.iso.datetime().refine(
    (value) => {
      const at = new Date(value).getTime();
      const now = Date.now();
      return (
        at <= now + MIGRATE_MAX_SKEW_MS && at >= now - MIGRATE_MAX_AGE_MS
      );
    },
    { message: "Timestamp outside the acceptable range." }
  );
}

const StoredCheckSchema = z
  .object({
    clientId: z.string().trim().min(1).max(64),
    food: z.string().trim().min(1).max(160),
    risk: z.enum(["SAFE", "MODERATE", "HIGH"]),
    a1cBand: z.enum(A1C_BANDS),
    inputMethod: z.enum(["text", "voice"]),
    createdAt: boundedTimestamp(),
    actionDoneAt: boundedTimestamp().optional()
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
