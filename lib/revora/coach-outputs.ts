import { z } from "zod";

import {
  RevoraUserClarifySchema,
  RevoraUserClinicalSchema,
  RevoraUserNotFoodSchema,
  RevoraUserOutOfScopeSchema,
  RevoraUserResultSchema,
  RevoraUserRetrySchema
} from "./schemas";
import type { RevoraUserResponse } from "./schemas";

/**
 * Decision-card coach outputs (F-12 / W-17 Tier 1).
 *
 * Derived deterministically from the engine response — never by new model
 * behavior. That design is CORRECT and is kept: every sentence a user reads
 * from this file is pre-cleared against the claims boundary, which is a
 * guarantee free generation cannot make. The bug was never the determinism.
 *
 * The bug was that the bank held exactly ONE sentence per slot, attached to
 * EVERY non-SAFE result, forever. A daily user met the same three sentences
 * about thirty times a month, which quietly falsified the "daily relationship"
 * the product is sold on — and, because the tips were labelled as though chosen
 * for that meal, the sequencing tip cheerfully told people to start with the
 * vegetables on their milkshake.
 *
 * Three changes, none of which loosen the claims guarantee:
 *
 *  1. **Variants.** 6 audited sentences per slot instead of 1. The bank is a
 *     bounded artifact a dietitian can review in one sitting — unlike free
 *     generation, which must be policed forever.
 *  2. **Deterministic rotation.** Selection is `rotation % variants.length`,
 *     never Math.random() — so it is reproducible, testable, and a client
 *     cycling its counter cannot see the same sentence twice in a row.
 *  3. **Suppression + honest framing.** A drink gets no plate-sequencing tip,
 *     and the card now frames these as general strategies rather than implying
 *     they were selected for this specific meal (they are not, and saying so
 *     was the actual dishonesty).
 */

export type CoachOutputs = {
  sequencingTip: string | null;
  postMealAction: string | null;
  keepMost: string | null;
};

// Eat-order strategies. Grounded in Imai 2023 / Shukla 2019, cited with full
// framing on /how-it-works — never as numbers here.
const SEQUENCING_TIPS = [
  "If practical, start with the vegetables or protein on your plate and save the carb-heavy part for last.",
  "Where you can, eat the protein and vegetables first and leave the starchy part until the end.",
  "Saving the bread or rice until after the rest of the plate is one small change that costs nothing.",
  "If the plate allows it, front-load the vegetables and protein and finish with the carbs.",
  "Vegetables first, protein second, the carb-heavy part last — same meal, different order.",
  "Eating the salad or protein before the starch is a habit many people find easy to keep."
] as const;

const POST_MEAL_ACTIONS = [
  "A short 10–15 minute walk after this meal is a calm next step.",
  "A gentle 10–15 minute walk afterwards is an easy one, if you have the time.",
  "Ten minutes on your feet after eating — a walk, the washing-up, a lap of the block — is enough to count.",
  "If you can, move a little after this meal: a short walk, some tidying, anything that is not sitting down.",
  "A brief walk after eating is one of the simplest habits to keep, whenever it fits your day.",
  "Standing up and moving for ten minutes after a meal is a small, repeatable step."
] as const;

// "Enjoy it anyway" (Approach B): address the pain WITHOUT taking the food
// away. Qualitative, DO-framed, MODERATE/HIGH only — SAFE gets nothing (no
// piling on). Every variant names no meal component, so whole-portion
// moderation stays true for every flagged meal this attaches to.
const KEEP_MOST_LINES = [
  "Enjoy a smaller portion now and set the rest aside for later — same food, gentler pace.",
  "Have some of it now and save the rest — you keep the food, just spread out.",
  "A smaller helping now and the rest later still keeps the thing you actually wanted.",
  "You do not have to skip it. A little now and the rest another time is a real option.",
  "Keep the food, shrink the serving — the rest will still be there later.",
  "Half now and half later is a fair trade: you still get it, just at a gentler pace."
] as const;

/**
 * Drink-dominant meals get no plate-sequencing tip.
 *
 * "Start with the vegetables on your plate" attached to a milkshake was a real
 * shipped output — the honest tell that the tip was never about the meal.
 * A drink only suppresses the tip when there is nothing on a plate alongside
 * it: "orange juice" gets no sequencing tip, "chicken salad and a juice" still
 * does, because there the advice is actionable.
 */
const DRINK_TOKENS = [
  "milkshake",
  "shake",
  "smoothie",
  "juice",
  "soda",
  "cola",
  "lemonade",
  "frappuccino",
  "latte",
  "cappuccino",
  "coffee",
  "tea",
  "eggnog",
  "cocktail",
  "beer",
  "wine",
  "cider",
  "drink"
] as const;

const PLATE_TOKENS = [
  "chicken",
  "salmon",
  "fish",
  "egg",
  "eggs",
  "tofu",
  "beans",
  "lentils",
  "turkey",
  "beef",
  "steak",
  "shrimp",
  "salad",
  "broccoli",
  "spinach",
  "greens",
  "vegetables",
  "rice",
  "pasta",
  "bread",
  "toast",
  "sandwich",
  "burger",
  "pizza",
  "plate",
  "bowl"
] as const;

function hasWord(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`,
    "iu"
  ).test(text);
}

export function isDrinkOnly(food: string): boolean {
  const hasDrink = DRINK_TOKENS.some((token) => hasWord(food, token));
  if (!hasDrink) {
    return false;
  }

  return !PLATE_TOKENS.some((token) => hasWord(food, token));
}

/**
 * FNV-1a. Not cryptographic and does not need to be — it exists only to turn a
 * per-check client id into a stable index when the client sends no rotation
 * counter. The point is determinism (a given check always renders the same
 * card, in tests and in production), which `Math.random()` cannot offer and
 * which matters more here than distribution quality.
 */
function hashToIndex(seed: string, modulo: number): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash % modulo;
}

function pick<T>(
  variants: readonly T[],
  rotation: number | undefined,
  seed: string
): T {
  const index =
    rotation === undefined
      ? hashToIndex(seed, variants.length)
      : // A monotonic counter cycles the bank, so consecutive checks can never
        // land on the same sentence. Negative/NaN counters fall back to 0.
        Math.abs(Math.trunc(rotation) || 0) % variants.length;

  return variants[index];
}

export type CoachOptions = {
  /** The food text — used only to decide suppression, never stored or logged. */
  food?: string;
  /** Monotonic per-client counter; absent for older clients → hash fallback. */
  rotation?: number;
  /** Per-check id, the hash fallback's seed. */
  seed?: string;
};

export function deriveCoachOutputs(
  response: RevoraUserResponse,
  options: CoachOptions = {}
): CoachOutputs {
  if (response.kind !== "result" || response.risk === "SAFE") {
    // SAFE gets no extra homework (tone policy: no piling on), and
    // clarify/not_food/out_of_scope/clinical/retry carry no verdict to coach
    // on. A clinical route in particular must never pick up a walking tip.
    return { sequencingTip: null, postMealAction: null, keepMost: null };
  }

  const { food = "", rotation, seed = food } = options;

  return {
    sequencingTip: isDrinkOnly(food)
      ? null
      : pick(SEQUENCING_TIPS, rotation, `seq:${seed}`),
    postMealAction: pick(POST_MEAL_ACTIONS, rotation, `act:${seed}`),
    keepMost: pick(KEEP_MOST_LINES, rotation, `keep:${seed}`)
  };
}

/** Exposed so the copy-audit and ledger tests can enumerate the whole bank. */
export const COACH_PHRASE_BANK = {
  sequencingTip: SEQUENCING_TIPS,
  postMealAction: POST_MEAL_ACTIONS,
  keepMost: KEEP_MOST_LINES
} as const;

// The API response = engine union + the three nullable coach fields. The
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
  RevoraUserClinicalSchema.extend(COACH_FIELDS),
  RevoraUserRetrySchema.extend(COACH_FIELDS)
]);

export type CheckApiResponse = z.infer<typeof CheckApiResponseSchema>;
