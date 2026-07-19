/**
 * Discovery gate for the 90-day Learning Journey (Task 17 / plan §P4.1, global
 * constraint §10). Same two-boundary shape as meal memory (lib/meal-memory-flag.ts):
 *
 *  - `learningJourneyUiEnabled()` — the CLIENT build flag
 *    (`NEXT_PUBLIC_LEARNING_JOURNEY`), inlined into a reviewed build at build
 *    time. Gates every user-facing surface (the journey card on the progress
 *    page). Mirrors lib/longitudinal-insights-flag.ts.
 *
 *  - `learningJourneyServerEnabled(env)` — the SERVER flag
 *    (`LEARNING_JOURNEY_ENABLED`, NOT NEXT_PUBLIC). The API route 404s when this
 *    is off so the endpoint is inert without an approved rollout, and the
 *    capability matrix (lib/server/capabilities.ts) imports THIS exact function
 *    so premium+flag is defined once and can never fork from the route that
 *    404s on the same flag. `env` is injectable purely so tests (and the
 *    matrix's env param) can exercise it without mutating process.env.
 *
 * A premium user with the server flag off still gets `weeklyLearning: false` —
 * the capability is BOTH premium-gated AND unavailable until the feature ships.
 */

export function learningJourneyUiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_LEARNING_JOURNEY === "1";
}

export function learningJourneyServerEnabled(
  env: { LEARNING_JOURNEY_ENABLED?: string } = process.env as unknown as {
    LEARNING_JOURNEY_ENABLED?: string;
  }
): boolean {
  return env.LEARNING_JOURNEY_ENABLED === "1";
}
