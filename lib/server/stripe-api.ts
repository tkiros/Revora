import type Stripe from "stripe";

/**
 * Stripe subscription verify-on-read / reconciliation adapter (Task 8 / P2.2).
 *
 * The mirror of lib/server/play-api.ts for the Stripe side: given a Stripe
 * subscription id, fetch the authoritative status + paid-through date and map
 * them onto the unified `subscriptions` vocabulary. Used by getEntitlement's
 * verify-on-read heal and by the reconciliation sweep. No secrets live here —
 * the caller injects the Stripe client (the same `() => Stripe` factory the
 * webhook uses), so tests pass a fake and no real Stripe call is ever made.
 */

export type StripeRefreshResult = {
  status: "active" | "trialing" | "canceled" | "grace" | "expired" | "refunded";
  currentPeriodEnd: Date;
};

/**
 * Map a live Stripe subscription status onto the unified enum. Deliberately
 * identical in spirit to mapStripeStatus in handlers.ts, minus the
 * deleted-event special case: a live `retrieve` reports `canceled` for a
 * subscription that has ended, and past_due is our entitled "grace" window.
 */
export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status
): Exclude<StripeRefreshResult["status"], "refunded"> {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "grace";
    case "canceled":
      return "canceled";
    default:
      // incomplete, incomplete_expired, unpaid, paused → not entitled.
      return "expired";
  }
}

function periodEndOf(
  subscription: Stripe.Subscription,
  fallback: Date
): Date {
  const item = subscription.items?.data?.[0] as
    | { current_period_end?: number }
    | undefined;
  if (subscription.status === "trialing" && subscription.trial_end) {
    return new Date(subscription.trial_end * 1000);
  }
  if (item?.current_period_end) {
    return new Date(item.current_period_end * 1000);
  }
  return fallback;
}

/**
 * Fetch a Stripe subscription and reduce it to {status, currentPeriodEnd}.
 * `fallbackPeriodEnd` (the row's stored value) is returned when Stripe omits a
 * period end, so a heal never zeroes out a paying subscriber's paid-through.
 */
export async function fetchStripeSubscription(
  stripe: Stripe,
  subscriptionId: string,
  fallbackPeriodEnd: Date
): Promise<StripeRefreshResult> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return {
    status: mapStripeSubscriptionStatus(subscription.status),
    currentPeriodEnd: periodEndOf(subscription, fallbackPeriodEnd)
  };
}
