import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { mealMemoryServerEnabled } from "../../../lib/meal-memory-flag";
import { normalize as normalizeFood } from "../../../lib/revora/input-precheck";
import { capabilitiesFor } from "../../../lib/server/capabilities";
import { decryptField, encryptField } from "../../../lib/server/crypto";
import { getDb, schema, type Db } from "../../../lib/server/db";
import {
  getEntitlement,
  type Entitlement
} from "../../../lib/server/entitlement";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../lib/server/session";

/**
 * Meal memory API (plan §P3.2, §8 entity `meal_memories`).
 *
 * POST upserts the caller's single memory for one of their checks; GET lists
 * their memories joined with the check's display fields. Both gate in the same
 * order:
 *
 *   1. server flag OFF  → 404  (the feature does not exist in this build; the
 *      routes are inert without an approved rollout, global constraint §10)
 *   2. no session       → 401
 *   3. not entitled     → 403  (mealMemory is premium — the SINGLE capability
 *      matrix decides, lib/server/capabilities.ts; UI renders from this, never
 *      UI-only gating, global constraint §6)
 *
 * The 404-before-401 order is deliberate: with the flag off the endpoint must
 * look like it is simply not there, for signed-in and signed-out alike.
 *
 * Free text ("what I chose", the private note) is health-adjacent and encrypted
 * at rest (AES-256-GCM, same standard as checks.food), decrypted only here for
 * the owner. The bounded reflections (ease, label, wouldRepeat, favorite) stay
 * plaintext so the list renders without a decrypt per field. NOTHING here feeds
 * the check engine — this module is never imported by lib/revora/* (global
 * constraint §1, asserted by meal-memory-non-interference.test.ts).
 */

export type MemoryRouteDeps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  entitlementOf?: (db: Db, userId: string) => Promise<Entitlement>;
  now?: () => Date;
  env?: { MEAL_MEMORY_ENABLED?: string };
};

export const MEMORY_CHOICE_MAX = 200;
export const MEMORY_NOTE_MAX = 500;

// Closed vocabularies — mirrors of the schema enums. Free text is never a
// reflection value; these are the only ease/label strings that may enter the DB.
export const MEMORY_EASE_VALUES = ["easy", "okay", "hard"] as const;
export const MEMORY_LABEL_VALUES = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "restaurant",
  "travel",
  "family_meal",
  "other"
] as const;

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

// Honest bounded scan for exact recall (plan §P3.3). Recall decrypts and compares
// the caller's own memories to the just-checked food — no hash index, no fuzzy
// search (§P3.3 "Prefer user-confirmed matching over opaque semantic inference";
// global constraint §5 "never … an unsalted hash of meal text"). The cap mirrors
// the Task 9 history search honesty: the newest 200 saved memories are searched,
// and a memory older than that is simply not recalled rather than pretending to
// scan an unbounded archive on every completed check.
export const RECALL_SCAN_LIMIT = 200;

// The just-checked meal text, transported in the POST BODY (never a URL — global
// constraint §5, health data must not appear in URLs). Bounds mirror the check
// request's food field (1..MAX_FOOD_LENGTH).
const RECALL_FOOD_MAX = 160;
const MemoryRecallSchema = z
  .object({
    food: z.string().trim().min(1).max(RECALL_FOOD_MAX)
  })
  .strict();

const MemoryUpsertSchema = z
  .object({
    checkId: z.string().uuid(),
    choice: z.string().trim().min(1).max(MEMORY_CHOICE_MAX).optional(),
    wouldRepeat: z.boolean().optional(),
    ease: z.enum(MEMORY_EASE_VALUES).optional(),
    note: z.string().trim().min(1).max(MEMORY_NOTE_MAX).optional(),
    favorite: z.boolean().optional(),
    label: z.enum(MEMORY_LABEL_VALUES).optional()
  })
  .strict();

function unauthorized() {
  return NextResponse.json({ error: "Sign in first." }, { status: 401 });
}

function notFound() {
  return NextResponse.json({ error: "Not found." }, { status: 404 });
}

function forbidden() {
  return NextResponse.json({ error: "Forbidden." }, { status: 403 });
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function safeDecrypt(ciphertext: string | null): string | null {
  if (!ciphertext) {
    return null;
  }
  try {
    return decryptField(ciphertext);
  } catch {
    // A row that cannot decrypt (rotated key) degrades to a placeholder — never
    // an error that takes the whole memory list down (fail-soft, like history).
    return "(unreadable entry)";
  }
}

function resolveDeps(deps: MemoryRouteDeps) {
  return {
    db: deps.db ?? getDb,
    getSession: deps.getSession ?? getSessionInfo,
    entitlementOf:
      deps.entitlementOf ??
      ((d: Db, userId: string) => getEntitlement(d, userId)),
    now: deps.now ?? (() => new Date()),
    env:
      deps.env ??
      (process.env as unknown as { MEAL_MEMORY_ENABLED?: string })
  };
}

export function createMemoryUpsertHandler(deps: MemoryRouteDeps = {}) {
  const { db, getSession, entitlementOf, now, env } = resolveDeps(deps);

  return async function POST(request: Request) {
    if (!mealMemoryServerEnabled(env)) {
      return notFound();
    }

    const session = await getSession();
    if (!session) {
      return unauthorized();
    }

    const entitlement = await entitlementOf(db(), session.userId);
    if (!capabilitiesFor(entitlement, env).mealMemory) {
      return forbidden();
    }

    const parsed = MemoryUpsertSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const { checkId, choice, wouldRepeat, ease, note, favorite, label } =
      parsed.data;

    // Ownership: the check must exist and belong to the caller. A missing check
    // is 404; someone else's check is 403 — no cross-user memory, and the
    // distinct codes never let a caller enumerate which ids are real (same
    // boundary as /api/feedback).
    const [check] = await db()
      .select({ userId: schema.checks.userId })
      .from(schema.checks)
      .where(eq(schema.checks.id, checkId));
    if (!check) {
      return notFound();
    }
    if (check.userId !== session.userId) {
      return forbidden();
    }

    const choiceCiphertext = choice ? encryptField(choice) : null;
    const noteCiphertext = note ? encryptField(note) : null;
    const nowTs = now();

    // Latest save replaces the prior one wholesale for this (user, check) —
    // the affordance submits the whole form at once, so an upsert (not a merge)
    // matches what the user did. Edit/delete land in Task 16.
    await db()
      .insert(schema.mealMemories)
      .values({
        userId: session.userId,
        checkId,
        choiceCiphertext,
        wouldRepeat: wouldRepeat ?? null,
        easeReflection: ease ?? null,
        noteCiphertext,
        favorite: favorite ?? false,
        label: label ?? null,
        createdAt: nowTs,
        updatedAt: nowTs
      })
      .onConflictDoUpdate({
        target: [schema.mealMemories.userId, schema.mealMemories.checkId],
        set: {
          choiceCiphertext,
          wouldRepeat: wouldRepeat ?? null,
          easeReflection: ease ?? null,
          noteCiphertext,
          favorite: favorite ?? false,
          label: label ?? null,
          updatedAt: nowTs
        }
      });

    return NextResponse.json({ ok: true });
  };
}

export function createMemoryListHandler(deps: MemoryRouteDeps = {}) {
  const { db, getSession, entitlementOf, env } = resolveDeps(deps);

  return async function GET(request: Request) {
    if (!mealMemoryServerEnabled(env)) {
      return notFound();
    }

    const session = await getSession();
    if (!session) {
      return unauthorized();
    }

    const entitlement = await entitlementOf(db(), session.userId);
    if (!capabilitiesFor(entitlement, env).mealMemory) {
      return forbidden();
    }

    const url = new URL(request.url);
    const limit = Math.min(
      Math.max(Number(url.searchParams.get("limit")) || DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );
    const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);

    const rows = await db()
      .select({
        id: schema.mealMemories.id,
        checkId: schema.mealMemories.checkId,
        choiceCiphertext: schema.mealMemories.choiceCiphertext,
        wouldRepeat: schema.mealMemories.wouldRepeat,
        ease: schema.mealMemories.easeReflection,
        noteCiphertext: schema.mealMemories.noteCiphertext,
        favorite: schema.mealMemories.favorite,
        label: schema.mealMemories.label,
        createdAt: schema.mealMemories.createdAt,
        updatedAt: schema.mealMemories.updatedAt,
        foodCiphertext: schema.checks.foodCiphertext,
        risk: schema.checks.risk,
        a1cBand: schema.checks.a1cBand
      })
      .from(schema.mealMemories)
      .innerJoin(schema.checks, eq(schema.mealMemories.checkId, schema.checks.id))
      .where(eq(schema.mealMemories.userId, session.userId))
      .orderBy(
        desc(schema.mealMemories.createdAt),
        desc(schema.mealMemories.id)
      )
      .limit(limit)
      .offset(offset);

    const memories = rows.map((row) => ({
      id: row.id,
      checkId: row.checkId,
      // Owner-only decrypt (same trust boundary as the history read path).
      food: safeDecrypt(row.foodCiphertext),
      risk: row.risk,
      choice: safeDecrypt(row.choiceCiphertext),
      wouldRepeat: row.wouldRepeat,
      ease: row.ease,
      note: safeDecrypt(row.noteCiphertext),
      favorite: row.favorite,
      label: row.label,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    }));

    return NextResponse.json({
      memories,
      nextOffset: rows.length === limit ? offset + limit : null
    });
  };
}

/**
 * Recall (plan §P3.3): after a completed check, surface the caller's OWN prior
 * saved memories whose meal text matches the just-checked meal, so the client can
 * render the "Your meal memory" panel below the current card and offer a one-tap
 * re-check.
 *
 * Matching is EXACT normalized-string equality — the same normalizer the input
 * precheck uses (lib/revora/input-precheck.normalize), so "White Rice " recalls a
 * saved "white rice". Deliberately NOT fuzzy or semantic at launch (§P3.3), and
 * NO search index: the newest RECALL_SCAN_LIMIT memories are decrypted and
 * compared in memory. There is no hash of meal text anywhere (global constraint
 * §5). The food rides the POST body, never the URL (§5).
 *
 * READ-ONLY and non-interfering: this never writes, and nothing here (or its
 * result) feeds the check engine (global constraint §1). The client calls it only
 * AFTER a result renders.
 *
 * Gate order is identical to the other memory routes: flag 404 → session 401 →
 * capability 403.
 */
export function createMemoryRecallHandler(deps: MemoryRouteDeps = {}) {
  const { db, getSession, entitlementOf, env } = resolveDeps(deps);

  return async function POST(request: Request) {
    if (!mealMemoryServerEnabled(env)) {
      return notFound();
    }

    const session = await getSession();
    if (!session) {
      return unauthorized();
    }

    const entitlement = await entitlementOf(db(), session.userId);
    if (!capabilitiesFor(entitlement, env).mealMemory) {
      return forbidden();
    }

    const parsed = MemoryRecallSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const target = normalizeFood(parsed.data.food);

    // Bounded scan: the caller's newest RECALL_SCAN_LIMIT saved memories, joined
    // to the check that anchors each so we can compare its (encrypted) food.
    const rows = await db()
      .select({
        id: schema.mealMemories.id,
        checkId: schema.mealMemories.checkId,
        choiceCiphertext: schema.mealMemories.choiceCiphertext,
        wouldRepeat: schema.mealMemories.wouldRepeat,
        ease: schema.mealMemories.easeReflection,
        noteCiphertext: schema.mealMemories.noteCiphertext,
        favorite: schema.mealMemories.favorite,
        label: schema.mealMemories.label,
        savedAt: schema.mealMemories.createdAt,
        foodCiphertext: schema.checks.foodCiphertext,
        risk: schema.checks.risk,
        a1cBand: schema.checks.a1cBand,
        checkedAt: schema.checks.createdAt
      })
      .from(schema.mealMemories)
      .innerJoin(schema.checks, eq(schema.mealMemories.checkId, schema.checks.id))
      .where(eq(schema.mealMemories.userId, session.userId))
      .orderBy(
        desc(schema.mealMemories.createdAt),
        desc(schema.mealMemories.id)
      )
      .limit(RECALL_SCAN_LIMIT);

    const matches = rows
      .map((row) => {
        const food = safeDecrypt(row.foodCiphertext);
        return { row, food };
      })
      // Exact normalized-string equality only — no substring / fuzzy match. An
      // unreadable (rotated-key) row can never accidentally match a real meal.
      .filter(({ food }) => food !== null && normalizeFood(food) === target)
      .map(({ row, food }) => ({
        id: row.id,
        checkId: row.checkId,
        // Owner-only decrypt — the stored meal text, so the client can pre-fill
        // it into the standard input path for a one-tap re-check.
        food,
        risk: row.risk,
        band: row.a1cBand,
        choice: safeDecrypt(row.choiceCiphertext),
        wouldRepeat: row.wouldRepeat,
        ease: row.ease,
        note: safeDecrypt(row.noteCiphertext),
        favorite: row.favorite,
        label: row.label,
        savedAt: row.savedAt.toISOString(),
        checkedAt: row.checkedAt.toISOString()
      }));

    return NextResponse.json({ matches });
  };
}
