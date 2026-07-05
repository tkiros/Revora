import { z } from "zod";

import {
  RevoraUserClarifySchema,
  RevoraUserNotFoodSchema,
  RevoraUserOutOfScopeSchema,
  RevoraUserResultSchema,
  RevoraUserRetrySchema
} from "./schemas";
import type { RevoraUserResponse } from "./schemas";

/**
 * Decision-card v2 coach outputs (plan P1: PP-03 sequencing, PP-06 post-meal
 * action). Derived deterministically from the engine response — never by new
 * model behavior, so the engine and its floors stay untouched. Copy is a
 * fixed, claims-audited phrase bank; the evidence grounding (Imai 2023,
 * Shukla 2019, CDC DPP) is cited on /how-it-works, never as numbers here.
 */

export type CoachOutputs = {
  sequencingTip: string | null;
  postMealAction: string | null;
  keepMost: string | null;
};

const SEQUENCING_TIP =
  "If practical, start with the vegetables or protein on your plate and save the carb-heavy part for last.";

const POST_MEAL_ACTION =
  "A short 10–15 minute walk after this meal is a calm next step.";

// "Enjoy it anyway" (Approach B, 2026-07-05 handoff §6): the promise is
// addressing the pain WITHOUT losing food enjoyment. Qualitative only,
// DO-framed, MODERATE/HIGH only — SAFE gets nothing (no piling on). This is
// the claims-audited winner (copy-ledger keep-most-02): it names no meal
// component, so whole-portion moderation stays true for every flagged meal
// the component-blind derivation attaches to.
const KEEP_MOST =
  "Enjoy a smaller portion now and set the rest aside for later — same food, gentler pace.";

export function deriveCoachOutputs(response: RevoraUserResponse): CoachOutputs {
  if (response.kind !== "result" || response.risk === "SAFE") {
    // SAFE gets no extra homework (tone policy: no piling on), and
    // clarify/not_food/out_of_scope/retry carry no verdict to coach on.
    return { sequencingTip: null, postMealAction: null, keepMost: null };
  }

  return {
    sequencingTip: SEQUENCING_TIP,
    postMealAction: POST_MEAL_ACTION,
    keepMost: KEEP_MOST
  };
}

// The API response = engine union + the two nullable coach fields. The
// engine's own schemas stay untouched; this schema belongs to the route layer.
const COACH_FIELDS = {
  sequencingTip: z.string().nullable(),
  postMealAction: z.string().nullable(),
  keepMost: z.string().nullable()
};

export const CheckApiResponseSchema = z.discriminatedUnion("kind", [
  RevoraUserResultSchema.extend(COACH_FIELDS),
  RevoraUserClarifySchema.extend(COACH_FIELDS),
  RevoraUserNotFoodSchema.extend(COACH_FIELDS),
  RevoraUserOutOfScopeSchema.extend(COACH_FIELDS),
  RevoraUserRetrySchema.extend(COACH_FIELDS)
]);

export type CheckApiResponse = z.infer<typeof CheckApiResponseSchema>;
