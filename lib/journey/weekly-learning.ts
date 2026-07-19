import { normalize as normalizeFood } from "../revora/input-precheck";
import { assertNoForbiddenClaims } from "../revora/postprocess";
import type { SafetyContract } from "../revora/safety-contract";
import type { Stage } from "./state";

/**
 * Weekly learning artifact — the deterministic, versioned projection (plan
 * §P4.2, §8 entity `weekly_reflections`: "Versioned weekly learning artifact.
 * Derived only from allowed fields; reproducible.").
 *
 * This module is DELIBERATELY the same shape as the rest of lib/journey/: pure,
 * db-free, IO-free. The API route (app/api/journey/weekly) loads and DECRYPTS
 * the week's checks + memories, derives the journey stage, and hands the plain
 * inputs here; every rule about what the summary says lives in this file and
 * nowhere else. Building version 1 as a projection rather than a model call is a
 * plan requirement — a later generative summary would need its own privacy,
 * safety, claims, eval, and fallback review (plan §P4.2).
 *
 * Hard boundaries (plan §P4.2, global constraint §3):
 *  - NOT a health score. `mealsExplored`/`savedChoices` are activity counts, and
 *    the copy never presents them as a lab-outcome, band aggregation, or
 *    prediction. This module imports NO band/BAI math.
 *  - NO glucose / A1C / prevention / diagnosis language anywhere. Every fixed
 *    copy string in the banks below is exported and run through the SAME
 *    `assertNoForbiddenClaims` regexes the model output is held to
 *    (tests/unit/journey/weekly-learning.test.ts + assertWeeklyBankClaimFree),
 *    so a future copy edit that smuggles in a clinical claim turns the suite red.
 *
 * `repeatedUncertainty` echoes the user's OWN meal text back to them (foods they
 * checked twice with a clarification or a be-careful/hold-off card). That is
 * their data shown to themselves, which is fine — but it is why the persisted
 * artifact is ENCRYPTED at rest (the route stores ciphertext), never plaintext.
 */

export const WEEKLY_LEARNING_VERSION = "1";

/** The bounded meal-context vocabulary — mirror of the `meal_memories.label`
 * schema enum. Retyped here (not imported from app/api) to keep this lib pure;
 * `contextsCovered` is emitted in THIS canonical order so the output is
 * independent of row order. A label added to the schema must be added here. */
export const CONTEXT_LABELS = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "restaurant",
  "travel",
  "family_meal",
  "other"
] as const;

export type ContextLabel = (typeof CONTEXT_LABELS)[number];

const LABEL_ORDER: Record<ContextLabel, number> = Object.fromEntries(
  CONTEXT_LABELS.map((label, index) => [label, index])
) as Record<ContextLabel, number>;

/** One check the user ran this week (already owner-decrypted by the route). */
export type WeeklyCheckInput = {
  /** The user's own meal text (decrypted). Used for distinct-meal + repeat math. */
  food: string;
  risk: "SAFE" | "MODERATE" | "HIGH";
  /** True when this result resolved a one-question clarification (checks.wasClarified). */
  wasClarified: boolean;
};

/** One meal memory the user saved this week (bounded fields only). */
export type WeeklyMemoryInput = {
  label: ContextLabel | null;
  favorite: boolean;
};

export type WeeklyLearningInputs = {
  checks: WeeklyCheckInput[];
  memories: WeeklyMemoryInput[];
  /** The DERIVED journey stage for this week (lib/journey/state.currentStage),
   * or null for a user with no active journey. Never a stored stage. */
  stage: Stage | null;
};

export type WeeklyLearningArtifact = {
  version: string;
  weekStart: string;
  /** Distinct meals explored this week (distinct normalized food strings). */
  mealsExplored: number;
  /** How many meal memories the user saved this week. */
  savedChoices: number;
  /** Distinct meal-context labels covered this week, in canonical order. */
  contextsCovered: ContextLabel[];
  /** The user's OWN meal text for foods they checked ≥2× this week with a
   * clarification or a be-careful/hold-off card. Their data, shown to them. */
  repeatedUncertainty: string[];
  /** Unmet intents for the current stage — the "unused / incomplete steps". */
  incompleteSteps: string[];
  /** One optional next exploration, chosen deterministically from the fixed
   * bank by stage + gaps. Null only when there is no stage AND no default. */
  nextExploration: string;
};

/**
 * The fixed suggestion bank (plan §P4.2 "one optional next exploration" +
 * "unused or incomplete journey steps"). One intent per stage: a met() predicate
 * over the week's signals, the line shown in `incompleteSteps` when unmet, and
 * the gentler line shown as `nextExploration` when it is the first unmet intent.
 *
 * All copy is behavioral and non-clinical by construction and is asserted so
 * (assertWeeklyBankClaimFree). Numbers ("three meals") are fine — the banned
 * patterns are about clinical CLAIMS, not digits.
 */
type WeeklySignals = {
  mealsExplored: number;
  savedChoices: number;
  labels: Set<ContextLabel>;
  favorites: number;
};

type StageIntent = {
  id: string;
  stage: Stage;
  incomplete: string;
  exploration: string;
  met: (signals: WeeklySignals) => boolean;
};

const STAGE_INTENTS: readonly StageIntent[] = [
  {
    id: "save_three",
    stage: 1,
    incomplete: "Save three meals this week to get comfortable reading the card.",
    exploration:
      "Try saving one meal you eat often, so it is ready the next time you want it.",
    met: (s) => s.savedChoices >= 3
  },
  {
    id: "cover_mealtimes",
    stage: 2,
    incomplete: "Save an easy default for breakfast, lunch, and dinner.",
    exploration:
      "Pick one reliable breakfast to save, so mornings are one less decision.",
    met: (s) =>
      s.labels.has("breakfast") && s.labels.has("lunch") && s.labels.has("dinner")
  },
  {
    id: "real_life",
    stage: 3,
    incomplete: "Save a restaurant or travel meal you can fall back on.",
    exploration:
      "Next time you eat out, save what you chose so it is there later.",
    met: (s) => s.labels.has("restaurant") || s.labels.has("travel")
  },
  {
    id: "variety",
    stage: 4,
    incomplete: "Add a few new meals so your choices stay varied.",
    exploration: "Explore one new meal this week to widen your range.",
    met: (s) => s.mealsExplored >= 5
  },
  {
    id: "playbook",
    stage: 5,
    incomplete: "Mark the meals you want to keep as favorites.",
    exploration: "Look back at what you saved and star the ones worth keeping.",
    met: (s) => s.favorites >= 1
  }
];

/** Shown as `nextExploration` when there is no active journey stage. */
export const DEFAULT_EXPLORATION =
  "Save a meal you ate this week, so your summary has more to build on.";

/** Shown as `nextExploration` when every intent for the current stage is met. */
export const STAGE_KEPT_UP_EXPLORATION =
  "You are keeping up with this stage — keep checking meals when it is useful to you.";

/** Every fixed string this projection can emit, for the banned-claims test. */
export const WEEKLY_LEARNING_COPY: readonly string[] = [
  ...STAGE_INTENTS.flatMap((intent) => [intent.incomplete, intent.exploration]),
  DEFAULT_EXPLORATION,
  STAGE_KEPT_UP_EXPLORATION
];

/**
 * Run every fixed bank string through the model's own banned-claims regexes.
 * Reused by the unit test; kept here so any caller wiring can assert it too.
 */
export function assertWeeklyBankClaimFree(contract: SafetyContract): void {
  assertNoForbiddenClaims(contract, [...WEEKLY_LEARNING_COPY]);
}

function distinctFoods(checks: WeeklyCheckInput[]): number {
  return new Set(checks.map((c) => normalizeFood(c.food))).size;
}

function contextsCovered(memories: WeeklyMemoryInput[]): ContextLabel[] {
  const present = new Set<ContextLabel>();
  for (const memory of memories) {
    if (memory.label) {
      present.add(memory.label);
    }
  }
  return [...present].sort((a, b) => LABEL_ORDER[a] - LABEL_ORDER[b]);
}

/**
 * Foods checked ≥2× this week where at least one of those checks carried
 * uncertainty (a clarification, or a MODERATE/HIGH card). Output is the user's
 * own display text, deduped by normalized form and ordered deterministically so
 * regeneration is byte-identical regardless of input row order.
 */
function repeatedUncertainty(checks: WeeklyCheckInput[]): string[] {
  const byNormalized = new Map<
    string,
    { count: number; uncertain: boolean; displays: string[] }
  >();
  for (const check of checks) {
    const key = normalizeFood(check.food);
    if (!key) {
      continue;
    }
    const entry = byNormalized.get(key) ?? {
      count: 0,
      uncertain: false,
      displays: []
    };
    entry.count += 1;
    entry.uncertain =
      entry.uncertain || check.wasClarified || check.risk !== "SAFE";
    entry.displays.push(check.food.trim());
    byNormalized.set(key, entry);
  }

  const result: Array<{ key: string; display: string }> = [];
  for (const [key, entry] of byNormalized) {
    if (entry.count >= 2 && entry.uncertain) {
      // Deterministic representative: the lexicographically smallest of the
      // user's own spellings for this meal.
      const display = [...entry.displays].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))[0];
      result.push({ key, display });
    }
  }
  return result
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
    .map((r) => r.display);
}

/**
 * Derive the weekly learning artifact. Pure and deterministic: the same inputs +
 * weekStart + version always produce a byte-identical object (asserted by the
 * reproducibility test), which is what lets the route persist it lazily and
 * regenerate it on demand without drift.
 */
export function deriveWeeklyLearning(
  inputs: WeeklyLearningInputs,
  weekStart: string,
  version: string = WEEKLY_LEARNING_VERSION
): WeeklyLearningArtifact {
  const mealsExplored = distinctFoods(inputs.checks);
  const savedChoices = inputs.memories.length;
  const labels = contextsCovered(inputs.memories);

  const signals: WeeklySignals = {
    mealsExplored,
    savedChoices,
    labels: new Set(labels),
    favorites: inputs.memories.filter((m) => m.favorite).length
  };

  const stageIntents = inputs.stage
    ? STAGE_INTENTS.filter((intent) => intent.stage === inputs.stage)
    : [];
  const unmet = stageIntents.filter((intent) => !intent.met(signals));

  const incompleteSteps = unmet.map((intent) => intent.incomplete);

  let nextExploration: string;
  if (unmet.length > 0) {
    nextExploration = unmet[0].exploration;
  } else if (inputs.stage) {
    nextExploration = STAGE_KEPT_UP_EXPLORATION;
  } else {
    nextExploration = DEFAULT_EXPLORATION;
  }

  return {
    version,
    weekStart,
    mealsExplored,
    savedChoices,
    contextsCovered: labels,
    repeatedUncertainty: repeatedUncertainty(inputs.checks),
    incompleteSteps,
    nextExploration
  };
}
