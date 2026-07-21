/**
 * Counsel gate for longitudinal insights — two boundaries, two env names (the
 * meal-memory twin pattern, lib/meal-memory-flag.ts):
 *
 *  - `longitudinalInsightsEnabled()` — the CLIENT build flag
 *    (`NEXT_PUBLIC_LONGITUDINAL_INSIGHTS`), fixed into a reviewed build.
 *
 *  - `longitudinalInsightsServerEnabled(env)` — the SERVER flag
 *    (`LONGITUDINAL_INSIGHTS_ENABLED`, NOT NEXT_PUBLIC). Server render/API
 *    paths null the insight when this is off, so derived pattern output can be
 *    killed by an env change + redeploy without a reviewed rebuild. `env` is
 *    injectable so tests can exercise it without mutating process.env.
 *
 * Both are fail-closed: only the exact value `1` enables anything.
 */

export function longitudinalInsightsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_LONGITUDINAL_INSIGHTS === "1";
}

export function longitudinalInsightsServerEnabled(
  env: { LONGITUDINAL_INSIGHTS_ENABLED?: string } = process.env as unknown as {
    LONGITUDINAL_INSIGHTS_ENABLED?: string;
  }
): boolean {
  return env.LONGITUDINAL_INSIGHTS_ENABLED === "1";
}
