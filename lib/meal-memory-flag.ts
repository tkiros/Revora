/**
 * Discovery gate for meal memory (Task 14 / plan §P3.2, global constraint §10).
 *
 * Two boundaries, two env names — the SAME names the capability matrix already
 * reads (lib/server/capabilities.ts), so the flag can never fork from the gate
 * it is supposed to describe:
 *
 *  - `mealMemoryUiEnabled()` — the CLIENT build flag (`NEXT_PUBLIC_MEAL_MEMORY`),
 *    fixed into a reviewed build at build time. Gates every user-facing surface
 *    (the save affordance, the /memory page). Mirrors
 *    lib/longitudinal-insights-flag.ts.
 *
 *  - `mealMemoryServerEnabled(env)` — the SERVER flag (`MEAL_MEMORY_ENABLED`,
 *    NOT NEXT_PUBLIC). The API routes 404 when this is off so the endpoints are
 *    inert without an approved rollout, and the capability matrix imports THIS
 *    exact function so premium+flag is defined once. `env` is injectable purely
 *    so tests (and the matrix's own env param) can exercise it without mutating
 *    process.env.
 *
 * A premium user with the server flag off still gets `mealMemory: false` — the
 * capability is BOTH premium-gated AND unavailable until the feature ships.
 */

export function mealMemoryUiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MEAL_MEMORY === "1";
}

export function mealMemoryServerEnabled(
  env: { MEAL_MEMORY_ENABLED?: string } = process.env as unknown as {
    MEAL_MEMORY_ENABLED?: string;
  }
): boolean {
  return env.MEAL_MEMORY_ENABLED === "1";
}
