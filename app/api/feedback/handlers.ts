import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { encryptField } from "../../../lib/server/crypto";
import { getDb, schema, type Db } from "../../../lib/server/db";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../lib/server/session";

/**
 * Result-linked structured feedback (plan §P1.6, §4.6, §8).
 *
 * A signed-in user can attach one structured feedback per persisted check:
 * helpful yes/no, an optional bounded reason, and an optional private comment.
 * The comment is health-adjacent free text, so it is encrypted at rest (same
 * standard as checks.food) and stored ONLY here in the operational store —
 * never in the analytics stream, which carries submission presence only.
 *
 * Ownership is enforced: feedback may only be attached to the caller's own
 * check (403 otherwise), so no user can annotate — or probe the existence of —
 * another user's meal history. Re-submitting upserts the single (check, user)
 * row so the stored feedback always reflects the user's latest answer.
 *
 * The row NEVER feeds back into the check engine: `reviewStatus` only routes a
 * report to a human safety queue; it does not train or alter live behavior.
 */

export type FeedbackRouteDeps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
};

// The five bounded reasons — mirror of the schema enum. `unsafe_feeling` and a
// not-helpful `wrong_food` (a wrong-direction report) route to the safety queue.
const FEEDBACK_REASONS = [
  "too_vague",
  "wrong_food",
  "unsafe_feeling",
  "confusing",
  "other"
] as const;

const COMMENT_MAX = 500;

const FeedbackRequestSchema = z
  .object({
    checkId: z.string().uuid(),
    helpful: z.boolean(),
    reason: z.enum(FEEDBACK_REASONS).optional(),
    comment: z.string().trim().min(1).max(COMMENT_MAX).optional()
  })
  .strict();

/**
 * The safety-review gate. Kept deliberately narrow (constraint §P1.6): only a
 * felt-unsafe report, or a not-helpful wrong-food report (the response pointed
 * the wrong direction), reaches a human. Everything else is product feedback.
 */
function reviewStatusFor(
  helpful: boolean,
  reason: (typeof FEEDBACK_REASONS)[number] | undefined
): "none" | "queued" {
  if (reason === "unsafe_feeling") {
    return "queued";
  }
  if (reason === "wrong_food" && helpful === false) {
    return "queued";
  }
  return "none";
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function createFeedbackHandler(deps: FeedbackRouteDeps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;

  return async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    }

    const parsed = FeedbackRequestSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const { checkId, helpful, reason, comment } = parsed.data;

    // Ownership: the check must exist and belong to the caller. A missing check
    // is 404; someone else's check is 403 — no cross-user feedback, and the
    // distinct codes never let a caller enumerate which ids are real.
    const [check] = await db()
      .select({ userId: schema.checks.userId })
      .from(schema.checks)
      .where(eq(schema.checks.id, checkId));
    if (!check) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    if (check.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const reviewStatus = reviewStatusFor(helpful, reason);
    const commentCiphertext = comment ? encryptField(comment) : null;

    await db()
      .insert(schema.checkFeedback)
      .values({
        checkId,
        userId: session.userId,
        helpful,
        reason: reason ?? null,
        commentCiphertext,
        reviewStatus
      })
      .onConflictDoUpdate({
        target: [schema.checkFeedback.checkId, schema.checkFeedback.userId],
        set: {
          helpful,
          reason: reason ?? null,
          commentCiphertext,
          reviewStatus,
          // The latest answer replaces the prior one wholesale: a benign
          // re-submit clears a stale queued/reviewed state rather than leaving
          // a resolved flag on feedback the user has since changed.
          reviewedAt: null
        }
      });

    return NextResponse.json({ ok: true, queued: reviewStatus === "queued" });
  };
}
