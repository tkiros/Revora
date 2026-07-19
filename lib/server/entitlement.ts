import { and, count, desc, eq, gte, ne } from "drizzle-orm";

import { dayKeyInTimezone } from "../coach/days";
import { schema, type Db } from "./db";
import { emitBillingEvent, latencyBucket } from "./billing/telemetry";
import type { StripeRefreshResult } from "./stripe-api";

/**
 * Unified entitlement (plan 4D / docs/adr/billing.md). One read path over
 * the one `subscriptions` table — the rest of the app never knows which
 * provider granted premium.
 *
 * Verify-on-read heals stale rows against the provider API:
 *  - Play self-heals on read when an RTDN was missed — for Play the webhook is
 *    an optimization, not a correctness dependency.
 *  - Stripe correctness DOES depend on the webhook. When the webhook + durable
 *    inbox (Task 8 / P2.2) miss a renewal, a Stripe row can read premium-status
 *    but past its paid-through date; this path re-checks it against the Stripe
 *    API (time-gated to once per hour per row) and heals it. The reconciliation
 *    sweep is the scheduled backstop for rows nobody reads.
 */

// A Stripe row is re-checked against the Stripe API at most this often, so a
// hot read path never turns into a per-request Stripe call.
const STRIPE_RECHECK_INTERVAL_MS = 60 * 60 * 1000;

// Client-safe home (G5): marketing pages interpolate it too.
export { FREE_DAILY_CHECKS } from "../free-tier";

export type Entitlement = {
  tier: "free" | "premium";
  source: "play" | "stripe" | null;
  status: "trialing" | "premium" | "lapsed" | "none";
  /**
   * Paid-through / trial-end date of the granting row; null when free.
   * Display data, not grant data — callers that only DISPLAY the plan
   * (dashboard plan box, /account) omit `refreshPlaySubscription` so the
   * read never blocks on the Play API; granting paths keep verify-on-read.
   */
  currentPeriodEnd: Date | null;
};

export type PlayRefreshResult = {
  status: "active" | "canceled" | "grace" | "expired" | "refunded";
  currentPeriodEnd: Date;
};

export type EntitlementDeps = {
  now?: () => Date;
  // Injected Play Developer API lookup (lib/server/play-api.ts in prod).
  refreshPlaySubscription?: (
    purchaseToken: string
  ) => Promise<PlayRefreshResult>;
  // Injected Stripe subscription lookup (lib/server/stripe-api.ts in prod).
  // Present only on granting read paths (the entitlement route); display-only
  // callers omit it so the read never blocks on Stripe.
  refreshStripeSubscription?: (
    subscriptionId: string,
    fallbackPeriodEnd: Date
  ) => Promise<StripeRefreshResult>;
};

// 'canceled' still counts until the paid-through date; grace is honored.
// 'trialing' grants unlimited premium during the trial window.
const PREMIUM_STATUSES = ["active", "trialing", "grace", "canceled"] as const;

export async function getEntitlement(
  db: Db,
  userId: string,
  deps: EntitlementDeps = {}
): Promise<Entitlement> {
  const now = deps.now?.() ?? new Date();

  // Select ALL rows for the user (tiny per-user) and filter in JS: this lets us
  // distinguish "rows exist but none valid" (lapsed) from "no rows at all" (none)
  // in a single query, while still honoring PREMIUM_STATUSES for the grant.
  const rows = await db
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.userId, userId))
    .orderBy(desc(schema.subscriptions.currentPeriodEnd));

  const hadRows = rows.length > 0;

  for (const row of rows) {
    if (
      (PREMIUM_STATUSES as readonly string[]).includes(row.status) &&
      row.currentPeriodEnd > now
    ) {
      return {
        tier: "premium",
        source: row.provider,
        status: row.status === "trialing" ? "trialing" : "premium",
        currentPeriodEnd: row.currentPeriodEnd
      };
    }

    // Stale Play row: RTDN may have been missed — verify on read and heal.
    // Gate on status membership so we only touch the Play API for rows the
    // pre-change status-filtered query would have selected (never for
    // expired/refunded rows the old inArray filter excluded).
    if (
      row.provider === "play" &&
      (PREMIUM_STATUSES as readonly string[]).includes(row.status) &&
      deps.refreshPlaySubscription
    ) {
      try {
        const fresh = await deps.refreshPlaySubscription(row.providerRef);
        await db
          .update(schema.subscriptions)
          .set({
            status: fresh.status,
            currentPeriodEnd: fresh.currentPeriodEnd,
            updatedAt: now
          })
          .where(eq(schema.subscriptions.id, row.id));

        if (
          (PREMIUM_STATUSES as readonly string[]).includes(fresh.status) &&
          fresh.currentPeriodEnd > now
        ) {
          return {
            tier: "premium",
            source: "play",
            status: "premium",
            currentPeriodEnd: fresh.currentPeriodEnd
          };
        }
      } catch {
        // Play API unreachable: fail toward free — never grant on a guess.
      }
    }

    // Stale Stripe row: the webhook/inbox missed a renewal, so the row still
    // reads a premium status but its paid-through date has passed. Re-check it
    // against the Stripe API and heal — bounded to premium-status rows that are
    // actually stale, and rate-limited to once per hour per row so a hot read
    // path never becomes a per-request Stripe call.
    if (
      row.provider === "stripe" &&
      (PREMIUM_STATUSES as readonly string[]).includes(row.status) &&
      row.currentPeriodEnd <= now &&
      deps.refreshStripeSubscription &&
      (!row.lastVerifiedAt ||
        now.getTime() - row.lastVerifiedAt.getTime() >=
          STRIPE_RECHECK_INTERVAL_MS)
    ) {
      try {
        const fresh = await deps.refreshStripeSubscription(
          row.providerRef,
          row.currentPeriodEnd
        );
        // Guard on `refunded` (B3): a charge.refunded can commit during this
        // in-flight Stripe fetch, and a refund does NOT cancel the Stripe
        // subscription — so `fresh` still reads premium. Writing it back (and
        // returning premium) would resurrect a refunded (terminal) row. If the
        // guarded update matched nothing, the row went refunded under us: do
        // not heal and do not grant.
        const healed = await db
          .update(schema.subscriptions)
          .set({
            status: fresh.status,
            currentPeriodEnd: fresh.currentPeriodEnd,
            lastVerifiedAt: now,
            updatedAt: now
          })
          .where(
            and(
              eq(schema.subscriptions.id, row.id),
              ne(schema.subscriptions.status, "refunded")
            )
          )
          .returning({ id: schema.subscriptions.id });

        if (
          healed.length > 0 &&
          (PREMIUM_STATUSES as readonly string[]).includes(fresh.status) &&
          fresh.currentPeriodEnd > now
        ) {
          // A charged user was missing entitlement and just got it back — the
          // §10.1 recovery signal, bucketed by how long the row was stale.
          emitBillingEvent({
            name: "entitlement_recovered",
            provider: "stripe",
            latency: latencyBucket(now.getTime() - row.currentPeriodEnd.getTime())
          });
          return {
            tier: "premium",
            source: "stripe",
            status: "premium",
            currentPeriodEnd: fresh.currentPeriodEnd
          };
        }
      } catch {
        // Stripe API unreachable: fail toward free — never grant on a guess.
      }
    }
  }

  return {
    tier: "free",
    source: null,
    status: hadRows ? "lapsed" : "none",
    currentPeriodEnd: null
  };
}

// countChecksTotal() lived here and had exactly one caller: the model-tier
// switch in app/api/check/route.ts, which downgraded a user to a weaker model
// after 10 lifetime checks. That routing is gone (W-02) and so is this — a
// lifetime-usage counter with no consumer is an invitation to reintroduce
// usage-keyed degradation without the evidence gate that should precede it.

/** Server-side free-tier metering: result-checks stored today (profile tz). */
export async function countChecksToday(
  db: Db,
  userId: string,
  timezone: string,
  now: Date = new Date()
): Promise<number> {
  const dayKey = dayKeyInTimezone(timezone);
  const todayKey = dayKey(now);

  // Fetch the last 48h and bucket precisely in the user's timezone — cheaper
  // than shipping tz math into SQL and exact at day boundaries.
  const since = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const rows = await db
    .select({ createdAt: schema.checks.createdAt })
    .from(schema.checks)
    .where(
      and(
        eq(schema.checks.userId, userId),
        gte(schema.checks.createdAt, since)
      )
    );

  return rows.filter((row) => dayKey(row.createdAt) === todayKey).length;
}
