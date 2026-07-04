import type { RevoraRisk, RevoraUserResponse } from "./ui-state";

/**
 * Umami analytics (plan P7; docs/adr/analytics-umami.md). A typed, closed
 * event allowlist — every prop is a bounded enum, never a free-form string —
 * so nothing from the health domain (lab values, meal descriptions, contact
 * identifiers) can reach the analytics vendor by construction. Enforced
 * further by tests/unit/client/analytics.test.ts, including a static source
 * scan for the specific field names this module must never mention.
 *
 * `track()` no-ops when the Umami script isn't loaded (no env vars set, or
 * running server-side / in tests) — callers never need to guard the call.
 */

// Closed set of response kinds the check engine can return to the client
// (lib/client/ui-state.ts — the same type check.ts normalizes onto).
type CheckResponseKind = RevoraUserResponse["kind"];

export type AnalyticsEvent =
  | {
      name: "check_completed";
      props: {
        risk: RevoraRisk;
        kind: CheckResponseKind;
        input_method: "text" | "voice";
      };
    }
  | { name: "onboarding_completed" }
  | { name: "signin_completed" }
  | { name: "nudge_opened" }
  | { name: "paywall_viewed" }
  | { name: "subscribe_started" }
  | { name: "subscribe_completed" }
  | { name: "deletion_completed" };

// Runtime belt-over-type-belt guard: even if a caller bypasses the type
// system (e.g. `track(untyped)`), only these names are ever forwarded.
const ALLOWED_EVENT_NAMES: ReadonlySet<AnalyticsEvent["name"]> = new Set([
  "check_completed",
  "onboarding_completed",
  "signin_completed",
  "nudge_opened",
  "paywall_viewed",
  "subscribe_started",
  "subscribe_completed",
  "deletion_completed"
]);

type AnalyticsHost = {
  umami?: {
    track: (eventName: string, data?: Record<string, unknown>) => void;
  };
};

declare global {
  interface Window {
    umami?: AnalyticsHost["umami"];
  }
}

// `host` defaults to `window` (digital-goods.ts's injection convention) so
// call sites never pass it — it exists purely so tests can supply a fake
// `umami` without touching the global in a Node (non-jsdom) test environment.
export function track(
  event: AnalyticsEvent,
  host: AnalyticsHost = typeof window === "undefined" ? {} : window
): void {
  if (!host.umami) {
    return;
  }

  if (!ALLOWED_EVENT_NAMES.has(event.name)) {
    return;
  }

  const props = "props" in event ? event.props : undefined;
  host.umami.track(event.name, props);
}
