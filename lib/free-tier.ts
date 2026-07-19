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

/**
 * The free-tier history VIEW window: how many recent days a free account can see
 * (the full archive is premium — plan 4D). This is a VIEW rule, not a storage
 * rule; the export path (a data right) ignores it.
 *
 * Single definition (T10 / G5): the history handler that enforces the window and
 * the capability matrix that renders it BOTH import this constant, so the number
 * can never fork between what the server enforces and what the UI promises.
 */
export const FREE_HISTORY_DAYS = 7;
