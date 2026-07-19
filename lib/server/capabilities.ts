import { FREE_DAILY_CHECKS, FREE_HISTORY_DAYS } from "../free-tier";
import type { Entitlement } from "./entitlement";

/**
 * The single capability matrix (plan §P2.4 "Define each capability once").
 *
 * One typed function turns an Entitlement into the exact set of things a caller
 * may do. Every enforcing surface derives from THIS — the check route's daily
 * cap, the history window, the nudge gate — and the /api/entitlement response
 * ships the same object so the UI renders paid state from server truth, never
 * from UI-only gating (global constraint §6).
 *
 * Numbers are the shared constants (FREE_DAILY_CHECKS, FREE_HISTORY_DAYS from
 * lib/free-tier). Nothing here retypes a literal — a matrix that disagreed with
 * the routes it is supposed to describe would be worse than no matrix.
 *
 * Disposition of the thin longitudinal insight (controller decision, ledger
 * 2026-07-18): `thinInsight` is FREE onboarding value for every signed-in user
 * (and guests locally). It is NOT a paid capability. The genuinely Premium
 * artifact is the weekly learning summary (`weeklyLearning`), which ships flagged
 * off in Task 18 — so the paywall may not promise it yet.
 */

export type Capabilities = {
  /** Result checks allowed per day; premium removes the cap. */
  dailyChecks: number | "unlimited";
  /** History VIEW window in days; premium sees the whole archive. */
  historyDays: number | "all";
  /** Data-rights export — every tier can get their data back. */
  export: true;
  /** Per-meal memory (T14). Premium-gated AND flag-gated until it ships. */
  mealMemory: boolean;
  /** Weekly learning artifact (T17-18). Premium-gated AND flag-gated. */
  weeklyLearning: boolean;
  /** The progress / BAI view. Premium (coach route enforces the same gate). */
  progress: boolean;
  /** One optional gentle daily reminder. Premium (nudge cron enforces it). */
  nudges: boolean;
  /** Thin daypart/repeat-meal insight — FREE for all signed-in users. */
  thinInsight: true;
  support: "standard";
};

/**
 * Flags for premium features that do not exist yet. The flag MODULES land with
 * their features (T14: mealMemory, T17-18: learning journey); until then the
 * matrix reads the server-side env directly, defaulting off. The capability is
 * therefore BOTH premium-gated AND unavailable until the feature ships — a
 * premium user with the flag off still sees `false`.
 */
export type CapabilityFlagEnv = {
  MEAL_MEMORY_ENABLED?: string;
  LEARNING_JOURNEY_ENABLED?: string;
};

/**
 * The capabilities that actually differ between free and premium TODAY (flags
 * off) — i.e. the only things the paywall may truthfully sell. mealMemory and
 * weeklyLearning are premium features but currently false for premium too, so
 * they are deliberately NOT here until their flags ship. The paywall bullet pin
 * test (tests/unit/revora/paywall-capability-truth.test.ts) keys off this list.
 */
export const PREMIUM_CAPABILITY_KEYS = [
  "dailyChecks",
  "historyDays",
  "progress",
  "nudges"
] as const satisfies readonly (keyof Capabilities)[];

export function capabilitiesFor(
  entitlement: Entitlement,
  env: CapabilityFlagEnv = process.env as unknown as CapabilityFlagEnv
): Capabilities {
  const premium = entitlement.tier === "premium";
  return {
    dailyChecks: premium ? "unlimited" : FREE_DAILY_CHECKS,
    historyDays: premium ? "all" : FREE_HISTORY_DAYS,
    export: true,
    mealMemory: premium && env.MEAL_MEMORY_ENABLED === "1",
    weeklyLearning: premium && env.LEARNING_JOURNEY_ENABLED === "1",
    progress: premium,
    nudges: premium,
    thinInsight: true,
    support: "standard"
  };
}
