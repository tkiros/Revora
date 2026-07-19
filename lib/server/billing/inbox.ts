import { eq } from "drizzle-orm";
import type Stripe from "stripe";

import { schema, type Db } from "../db";
import {
  emitBillingEvent,
  latencyBucket
} from "./telemetry";
import {
  applyStripeEvent,
  type PantryEmailSender
} from "../../../app/api/billing/handlers";

/**
 * Durable Stripe event inbox (Task 8 / P2.2, §8 entity `billing_event_inbox`).
 *
 * The webhook verifies the signature, then hands the event here. We store it
 * FIRST (so the money path survives a crash between "signature valid" and
 * "entitlement written"), then apply the idempotent reducer inline. Duplicate
 * deliveries dedupe on the unique provider event id; a processing failure is
 * recorded with retry metadata and the reconciliation sweep (or Stripe's own
 * redelivery) reprocesses it. Once retries are exhausted the row is
 * dead-lettered and the owner is paged.
 */

// Retry ceiling before a row is dead-lettered (owner-paged). Chosen so a
// transient dependency blip (DB, Stripe API) gets several shots across the
// webhook redeliveries + hourly sweep, while a genuinely poisoned event stops
// consuming attempts within a day.
export const MAX_INBOX_ATTEMPTS = 5;

// A webhook delivered more than this after the event's `created` time is
// "delayed" — the SLO's 60-second budget was blown before we even saw it.
const DELAYED_EVENT_MS = 60_000;

export type InboxDeps = {
  now: () => Date;
  stripe?: () => Stripe;
  email?: PantryEmailSender;
  // Injectable purely so tests can assert reducer behavior without re-deriving
  // it; production always uses the real reducer.
  apply?: typeof applyStripeEvent;
};

export type InboxOutcome = "processed" | "duplicate" | "failed" | "dead_letter";

type InboxRow = typeof schema.billingEventInbox.$inferSelect;

/**
 * Store-then-process. Returns the outcome so the webhook can choose its HTTP
 * status:
 *  - "duplicate"   → the event was already processed; 200 ack, no re-apply.
 *  - "processed"   → applied now; 200 ack.
 *  - "failed"      → apply threw, attempts left; 500 so Stripe retries.
 *  - "dead_letter" → retries exhausted; 200 (retrying won't help — owner paged).
 */
export async function ingestStripeEvent(
  db: Db,
  event: Stripe.Event,
  deps: InboxDeps
): Promise<InboxOutcome> {
  const now = deps.now();

  // Delayed-event alert (SLO §13). Fire-and-forget: an alert must never change
  // how the event is processed.
  const created = typeof event.created === "number" ? event.created * 1000 : null;
  if (created !== null && now.getTime() - created > DELAYED_EVENT_MS) {
    emitBillingEvent({
      name: "stripe_event_delayed",
      provider: "stripe",
      latency: latencyBucket(now.getTime() - created)
    });
  }

  const inserted = await db
    .insert(schema.billingEventInbox)
    .values({
      provider: "stripe",
      providerEventId: event.id,
      eventType: event.type,
      payload: event as unknown as Record<string, unknown>,
      status: "pending",
      receivedAt: now
    })
    .onConflictDoNothing({
      target: schema.billingEventInbox.providerEventId
    })
    .returning();

  let row = inserted[0];
  if (!row) {
    // Conflict: a row already exists for this event id. A processed or
    // dead-lettered row is done — ack without re-applying. A pending/failed
    // row means an earlier delivery never finished; the redelivery is doing us
    // a favor, so reprocess it.
    [row] = await db
      .select()
      .from(schema.billingEventInbox)
      .where(eq(schema.billingEventInbox.providerEventId, event.id));
    if (!row) {
      // Vanishingly unlikely (deleted between conflict and read) — treat as
      // duplicate rather than crash the webhook.
      return "duplicate";
    }
    if (row.status === "processed") {
      return "duplicate";
    }
    if (row.status === "dead_letter") {
      return "dead_letter";
    }
  }

  return processInboxRow(db, row, deps);
}

/**
 * Apply one stored inbox row's event inside a transaction. Marks it processed
 * on success; on failure the transaction rolls back any partial reducer writes
 * and the error/attempts are recorded outside it. Dead-letters once the retry
 * ceiling is hit.
 *
 * Concurrency (reviewer finding #1): the whole apply runs in a transaction that
 * FIRST re-reads the inbox row `FOR UPDATE`, so two concurrent deliveries of the
 * SAME event serialize — the loser blocks, then sees `processed` and skips (no
 * double reducer run, no duplicate telemetry/email). DISTINCT events touching
 * the same subscription serialize on the subscription row: the reducer's
 * pre-write reads take `FOR UPDATE` too (handlers.ts), so a `subscription.updated`
 * that would overwrite a just-committed `refunded` blocks, re-reads `refunded`,
 * and its terminal guard returns — no lost-update resurrection.
 *
 * (PGlite is single-connection, so true parallel interleaving can't be
 * reproduced in tests; the transactional/rollback path is covered serially and
 * the FOR UPDATE semantics are what protect the real node-postgres pool.)
 *
 * Idempotent regardless: the reducer is safe to re-run, so reprocessing a
 * partially-applied event never corrupts state.
 */
export async function processInboxRow(
  db: Db,
  row: InboxRow,
  deps: InboxDeps
): Promise<InboxOutcome> {
  const now = deps.now();
  const apply = deps.apply ?? applyStripeEvent;

  try {
    let applied = false;
    await db.transaction(async (tx) => {
      // Lock + re-read the inbox row: serializes concurrent processing of this
      // exact event. A row another worker already finished is a no-op.
      const [locked] = await tx
        .select()
        .from(schema.billingEventInbox)
        .where(eq(schema.billingEventInbox.id, row.id))
        .for("update");
      if (
        !locked ||
        locked.status === "processed" ||
        locked.status === "dead_letter"
      ) {
        return;
      }

      const event = locked.payload as unknown as Stripe.Event;
      await apply(tx, event, now, deps.stripe, deps.email);
      await tx
        .update(schema.billingEventInbox)
        .set({ status: "processed", lastError: null, processedAt: now })
        .where(eq(schema.billingEventInbox.id, row.id));
      applied = true;
    });
    // `applied === false` means another worker had already processed it — a
    // duplicate from this caller's point of view, never a re-apply.
    return applied ? "processed" : "duplicate";
  } catch (error) {
    // The transaction rolled back every partial reducer write. Record the
    // failed attempt outside it so the counter is durable.
    const attempts = row.attempts + 1;
    const dead = attempts >= MAX_INBOX_ATTEMPTS;
    await db
      .update(schema.billingEventInbox)
      .set({
        status: dead ? "dead_letter" : "failed",
        attempts,
        lastError: errorMessage(error)
      })
      .where(eq(schema.billingEventInbox.id, row.id));

    if (dead) {
      // Page the owner: an event we can never apply is a charged user with no
      // automatic path left.
      emitBillingEvent({
        name: "stripe_inbox_dead_letter",
        provider: "stripe",
        count: 1
      });
    }
    return dead ? "dead_letter" : "failed";
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message.slice(0, 500);
  }
  return String(error).slice(0, 500);
}
