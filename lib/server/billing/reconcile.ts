import { and, asc, count, desc, eq, gte, inArray, lt, lte, ne } from "drizzle-orm";
import type Stripe from "stripe";

import { schema, type Db } from "../db";
import { recordHeartbeat } from "../heartbeat";
import { fetchStripeSubscription } from "../stripe-api";
import {
  resolveInvoiceSubscriptionId,
  type PantryEmailSender
} from "../../../app/api/billing/handlers";
import {
  MAX_INBOX_ATTEMPTS,
  processInboxRow,
  type InboxDeps
} from "./inbox";
import { emitBillingEvent } from "./telemetry";

/**
 * Stripe reconciliation sweep (Task 8 / P2.2, §13 SLO backstop). Runs on the
 * hourly cron. Three jobs, each independent and fail-soft:
 *
 *  1. Reprocess the inbox: retry every pending/failed row that still has
 *     attempts left; dead-letter (and alert) once it exhausts them. This is the
 *     recovery path when Stripe stops redelivering a failed event.
 *  2. Verify subscriptions whose paid-through date is at/near the horizon
 *     against the Stripe API, healing the row and alerting when the row claimed
 *     premium the provider no longer backs (entitlement-without-subscription).
 *  3. Detect charge-without-entitlement: a processed paid invoice, older than
 *     the SLO window, with no subscription row at all — a charged user with no
 *     entitlement and no row for verify-on-read to heal.
 *
 * The Stripe client + reducer are injected (same seam as the webhook), so tests
 * drive the whole sweep against PGlite with a fake Stripe and no real calls.
 */

const RECONCILE_BATCH = 100;
// How far past `now` a paid-through date must be to be worth a verify — a small
// look-ahead so a renewal that is about to lapse is checked before it does.
const VERIFY_HORIZON_MS = 60 * 60 * 1000;
// Charge-without-entitlement is only asserted once a paid invoice is older than
// the 60-second SLO — before that the webhook may simply not have landed yet.
const CHARGE_SLO_MS = 60_000;
// The charge-without-entitlement scan looks at RECENT paid invoices (newest
// first) inside this window, not the oldest rows — so a fresh ghost is always
// covered even after the inbox has accumulated far more than one batch of
// historical processed rows.
const CHARGE_SCAN_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
// Processed inbox rows are pruned past this age. Bounds the table (and keeps the
// charge scan's window meaningful) without losing the recovery/audit value of a
// recently-processed event.
const PROCESSED_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const STRIPE_PREMIUM_STATUSES: Array<
  "active" | "trialing" | "grace" | "canceled"
> = ["active", "trialing", "grace", "canceled"];

export type ReconcileDeps = {
  now?: () => Date;
  stripe?: () => Stripe;
  email?: PantryEmailSender;
  apply?: InboxDeps["apply"];
};

export type ReconcileResult = {
  reprocessed: number;
  deadLettered: number;
  verified: number;
  healed: number;
  chargesWithoutEntitlement: number;
  pruned: number;
};

export async function runStripeReconcileCron(
  db: Db,
  deps: ReconcileDeps = {}
): Promise<ReconcileResult> {
  const now = deps.now?.() ?? new Date();
  const inboxDeps: InboxDeps = {
    now: () => now,
    stripe: deps.stripe,
    email: deps.email,
    apply: deps.apply
  };

  const result: ReconcileResult = {
    reprocessed: 0,
    deadLettered: 0,
    verified: 0,
    healed: 0,
    chargesWithoutEntitlement: 0,
    pruned: 0
  };

  // ── 1. Reprocess pending/failed inbox rows ────────────────────────────────
  const retryable = await db
    .select()
    .from(schema.billingEventInbox)
    .where(inArray(schema.billingEventInbox.status, ["pending", "failed"]))
    .orderBy(asc(schema.billingEventInbox.receivedAt))
    .limit(RECONCILE_BATCH);

  for (const row of retryable) {
    if (row.attempts >= MAX_INBOX_ATTEMPTS) {
      continue; // Already exhausted; the dead-letter alert below covers it.
    }
    const outcome = await processInboxRow(db, row, inboxDeps);
    if (outcome === "processed") {
      result.reprocessed += 1;
    } else if (outcome === "dead_letter") {
      result.deadLettered += 1;
    }
  }

  // Dead-letter backlog alert (§13): page while any row is unrecoverable.
  const [deadRow] = await db
    .select({ n: count() })
    .from(schema.billingEventInbox)
    .where(eq(schema.billingEventInbox.status, "dead_letter"));
  const deadCount = deadRow?.n ?? 0;
  if (deadCount > 0) {
    emitBillingEvent({
      name: "stripe_inbox_dead_letter",
      provider: "stripe",
      count: deadCount
    });
  }

  // ── 2. Verify subscriptions at/near their paid-through horizon ────────────
  if (deps.stripe) {
    const horizon = new Date(now.getTime() + VERIFY_HORIZON_MS);
    const stale = await db
      .select()
      .from(schema.subscriptions)
      .where(
        and(
          eq(schema.subscriptions.provider, "stripe"),
          inArray(schema.subscriptions.status, STRIPE_PREMIUM_STATUSES),
          lte(schema.subscriptions.currentPeriodEnd, horizon)
        )
      )
      // Deterministic: the most-overdue rows first, so a batch-capped sweep
      // always makes progress on the worst offenders.
      .orderBy(asc(schema.subscriptions.currentPeriodEnd))
      .limit(RECONCILE_BATCH);

    for (const row of stale) {
      result.verified += 1;
      try {
        const fresh = await fetchStripeSubscription(
          deps.stripe(),
          row.providerRef,
          row.currentPeriodEnd
        );
        const premiumSet = STRIPE_PREMIUM_STATUSES as readonly string[];
        const wasPremium = premiumSet.includes(row.status);
        const nowPremium =
          premiumSet.includes(fresh.status) && fresh.currentPeriodEnd > now;

        // Guard on `refunded` (B3): a charge.refunded can land during this
        // in-flight Stripe fetch, and a refund does NOT cancel the Stripe
        // subscription — so `fresh` still reads active/premium. Writing it back
        // would resurrect a refunded (terminal) row. Skip the heal when the row
        // went refunded under us.
        const healedRows = await db
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
        if (healedRows.length === 0) {
          continue; // Refunded mid-fetch — leave the terminal row alone.
        }
        result.healed += 1;

        // The row claimed premium the provider no longer backs — an
        // entitlement without a valid subscription.
        if (wasPremium && !nowPremium) {
          emitBillingEvent({
            name: "entitlement_without_subscription",
            provider: "stripe"
          });
        }
      } catch {
        // Stripe unreachable for this row: leave it for the next sweep. Never
        // downgrade on a failed lookup.
      }
    }
  }

  // ── 3. Charge-without-entitlement: paid invoice, past SLO, no row ─────────
  // Scan the NEWEST paid invoices in a bounded recent window (not the oldest
  // rows), so a fresh ghost is always covered even once the inbox holds far
  // more than one batch of already-resolved historical rows.
  const scanFloor = new Date(now.getTime() - CHARGE_SCAN_WINDOW_MS);
  const scanCeil = new Date(now.getTime() - CHARGE_SLO_MS);
  const paidInvoices = await db
    .select()
    .from(schema.billingEventInbox)
    .where(
      and(
        eq(schema.billingEventInbox.status, "processed"),
        eq(schema.billingEventInbox.eventType, "invoice.paid"),
        gte(schema.billingEventInbox.receivedAt, scanFloor),
        lte(schema.billingEventInbox.receivedAt, scanCeil)
      )
    )
    .orderBy(desc(schema.billingEventInbox.receivedAt))
    .limit(RECONCILE_BATCH);

  for (const inboxRow of paidInvoices) {
    const event = inboxRow.payload as unknown as Stripe.Event;
    const invoice = event?.data?.object as Stripe.Invoice | undefined;
    if (!invoice) {
      continue;
    }
    // The $0 trial-create invoice is not a charge.
    if (
      (invoice as { billing_reason?: string }).billing_reason ===
      "subscription_create"
    ) {
      continue;
    }
    const subscriptionId = resolveInvoiceSubscriptionId(invoice);
    if (!subscriptionId) {
      continue;
    }
    const [sub] = await db
      .select({ id: schema.subscriptions.id })
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerRef, subscriptionId));
    if (!sub) {
      result.chargesWithoutEntitlement += 1;
      emitBillingEvent({
        name: "charge_without_entitlement",
        provider: "stripe"
      });
    }
  }

  // ── 4. Prune old processed rows ───────────────────────────────────────────
  // Keeps the inbox bounded and the charge scan's window honest. Only fully
  // processed rows are eligible; pending/failed/dead-letter rows are retained
  // for retry/audit.
  const pruneCutoff = new Date(now.getTime() - PROCESSED_RETENTION_MS);
  const pruned = await db
    .delete(schema.billingEventInbox)
    .where(
      and(
        eq(schema.billingEventInbox.status, "processed"),
        lt(schema.billingEventInbox.processedAt, pruneCutoff)
      )
    )
    .returning({ id: schema.billingEventInbox.id });
  result.pruned = pruned.length;

  await recordHeartbeat(db, "stripe-reconcile", now);
  return result;
}
