import type {
  ClarifyElapsedBucket,
  ClarifyReason
} from "../revora/clarify";
import type { Channel } from "./attribution";
import type {
  ClinicalRoute,
  RevoraRisk,
  RevoraUserResponse
} from "./ui-state";

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

// Price points offered at the paywall/trial (cents-as-string, matching the
// Stripe price-lookup keys). A closed enum so no arbitrary amount reaches
// analytics — Task 2.7/4.2 import this same type for the checkout call sites.
export type PriceVariant = "999" | "1299" | "1999";

export type AnalyticsEvent =
  | {
      name: "check_completed";
      props: {
        risk: RevoraRisk;
        kind: CheckResponseKind;
        input_method: "text" | "voice" | "photo";
        // W-10/N-12: without a first-check marker the activation funnel is not
        // computable end-to-end — the north-star metric could not be measured
        // at all, only asserted.
        first_check: boolean;
      };
    }
  // W-10/N-12. The product could not measure its own three biggest risks:
  // whether people activate, whether the advice is any good, and why they
  // leave. These are the events that make each of those answerable.
  | { name: "onboarding_started" }
  | {
      // Advice quality. F-12's repetition problem is INVISIBLE in production
      // today because no feedback event exists — which is why W-17's variant
      // bank ships together with this, not before it.
      name: "result_helpful";
      props: { helpful: boolean; risk: RevoraRisk };
    }
  | {
      // W-01: which clinical class fired. The route id only — never the text
      // that matched it, which would be health data.
      name: "clinical_route";
      props: { route: ClinicalRoute };
    }
  | { name: "onboarding_completed" }
  | { name: "signin_completed" }
  | { name: "nudge_opened" }
  | { name: "paywall_viewed" }
  | { name: "subscribe_started" }
  | { name: "subscribe_completed" }
  | { name: "deletion_completed" }
  | { name: "taster_check"; props: { used: number } }
  | { name: "wall_viewed"; props: { variant: PriceVariant } }
  | { name: "trial_checkout_started"; props: { variant: PriceVariant } }
  | { name: "trial_started"; props: { variant: PriceVariant } }
  | {
      name: "pantry_viewed";
      props: { source: "landing" | "wall_decline" | "result_card" };
    }
  | { name: "pantry_checkout_started" }
  | {
      // §0.2 #6: acquisition attribution — the read every Part 10 decision
      // rule depends on. Both props are the closed Channel enum
      // (lib/client/attribution.ts); raw UTM strings are mapped onto it at
      // capture time and never stored or sent.
      name: "attribution";
      props: { reported: Channel | "skipped"; utm: Channel | "none" };
    }
  // P1.3 §10.1: the bounded-ambiguity clarify funnel. Only the ambiguity
  // `category` (which of the three deterministic prompts fired, a closed enum
  // from lib/revora/clarify.ts) and an elapsed-time bucket — never the meal
  // text or the prompt wording. Abandonment is derivable as a
  // `clarification_requested` with no matching `clarification_resolved`, so no
  // separate event is emitted. The prop is `category`, not the result's
  // rationale field, which analytics must never carry.
  | { name: "clarification_requested"; props: { category: ClarifyReason } }
  | {
      name: "clarification_resolved";
      props: { category: ClarifyReason; elapsed: ClarifyElapsedBucket };
    }
  // §P1.6/§10.1: result-linked feedback was submitted. Presence-only — the
  // single `helpful` boolean is all that reaches analytics. The structured
  // category and any private comment stay in the encrypted operational store
  // and never travel with this event (the no-PII source scan enforces it).
  | { name: "result_feedback_submitted"; props: { helpful: boolean } }
  | { name: "photo_draft"; props: { items: number; uncertain: number } };

// Runtime belt-over-type-belt guard: even if a caller bypasses the type
// system (e.g. `track(untyped)`), only these names are ever forwarded.
//
// NOTE this Set and the union above are two hand-maintained copies of the same
// list: an event added to the union but not here typechecks fine and then
// silently drops at runtime. analytics.test.ts asserts the two agree.
const ALLOWED_EVENT_NAMES: ReadonlySet<AnalyticsEvent["name"]> = new Set([
  "check_completed",
  "onboarding_started",
  "result_helpful",
  "clinical_route",
  "onboarding_completed",
  "signin_completed",
  "nudge_opened",
  "paywall_viewed",
  "subscribe_started",
  "subscribe_completed",
  "deletion_completed",
  "taster_check",
  "wall_viewed",
  "trial_checkout_started",
  "trial_started",
  "pantry_viewed",
  "pantry_checkout_started",
  "attribution",
  "photo_draft",
  "result_feedback_submitted",
  "clarification_requested",
  "clarification_resolved"
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
