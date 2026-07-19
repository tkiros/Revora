/**
 * Pure state resolver for the Account page's initial entitlement read
 * (global constraint 7 / plan §7). The old code set "signed_out" on ANY thrown
 * error and rendered "ready" (falling through to free/trial plan copy) on a
 * non-2xx response — so a transient backend outage told a paying user they were
 * signed out, or worse, showed them the "start your free week" upsell. This
 * keeps the three outcomes distinct and unit-testable.
 */

export type AccountLoadState = "signed_out" | "unavailable" | "ready";

export type AccountFetchResult =
  | { outcome: "network" }
  | { outcome: "response"; ok: boolean; status: number };

export function resolveAccountLoadState(
  result: AccountFetchResult
): AccountLoadState {
  // fetch threw (offline / DNS / abort) → outage, not signed-out.
  if (result.outcome === "network") {
    return "unavailable";
  }
  // Only a real 401 is signed-out.
  if (result.status === 401) {
    return "signed_out";
  }
  // Any other non-2xx (5xx / 403) is an outage — never render plan/upsell copy.
  if (!result.ok) {
    return "unavailable";
  }
  return "ready";
}
