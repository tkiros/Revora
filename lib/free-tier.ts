/**
 * The signed-in free allowance: checks per day for an account with no active
 * trial or subscription (enforced in app/api/check/route.ts, displayed by
 * lib/server/plan-box.ts).
 *
 * Client-safe on purpose (F-07 / G5): marketing surfaces must interpolate
 * this constant, never retype the number — the finding was two free-tier
 * numbers coexisting with only one of them disclosed. lib/server/entitlement
 * re-exports it for server callers.
 */
export const FREE_DAILY_CHECKS = 5;
