import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

import {
  applyStripeEvent,
  createStripeWebhookHandler
} from "../../../app/api/billing/handlers";
import {
  ingestStripeEvent,
  MAX_INBOX_ATTEMPTS
} from "../../../lib/server/billing/inbox";
import { runStripeReconcileCron } from "../../../lib/server/billing/reconcile";
import { getEntitlement } from "../../../lib/server/entitlement";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const NOW = new Date("2026-07-10T12:00:00.000Z");
const PAST = new Date("2026-07-01T12:00:00.000Z");
const FUTURE = new Date("2026-08-10T12:00:00.000Z");
const FUTURE2 = new Date("2026-09-10T12:00:00.000Z");

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let userId: string;

beforeAll(async () => {
  testDb = await createTestDb();
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: "heal@test.dev" })
    .returning();
  userId = user.id;
});

afterAll(async () => {
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.subscriptions);
  await testDb.db.delete(schema.billingEventInbox);
});

// ── helpers ──────────────────────────────────────────────────────────────────

let evtCounter = 0;
/** Build a Stripe event with a unique id and a `created` (unix seconds). */
function evt(
  type: string,
  object: Record<string, unknown>,
  createdSeconds: number,
  id?: string
): Stripe.Event {
  return {
    id: id ?? `evt_${++evtCounter}`,
    created: createdSeconds,
    type,
    data: { object }
  } as unknown as Stripe.Event;
}

function seedSub(overrides: Partial<typeof schema.subscriptions.$inferInsert>) {
  return testDb.db.insert(schema.subscriptions).values({
    userId,
    provider: "stripe",
    providerRef: "sub_x",
    productId: "premium_monthly",
    status: "active",
    currentPeriodEnd: FUTURE,
    ...overrides
  });
}

const deps = (extra: Record<string, unknown> = {}) => ({
  now: () => NOW,
  ...extra
});

// ── 1. Durable inbox: dedupe ─────────────────────────────────────────────────

describe("durable inbox — dedupe by provider event id", () => {
  it("stores the event, processes it once, and acks a redelivery as duplicate", async () => {
    await seedSub({ providerRef: "sub_dedupe", status: "trialing", currentPeriodEnd: FUTURE });

    const stripe = () =>
      ({
        subscriptions: {
          retrieve: vi.fn().mockResolvedValue({
            status: "active",
            items: {
              data: [{ current_period_end: Math.floor(FUTURE2.getTime() / 1000) }]
            }
          })
        }
      }) as unknown as Stripe;

    const event = evt(
      "invoice.paid",
      { parent: { subscription_details: { subscription: "sub_dedupe" } } },
      Math.floor(NOW.getTime() / 1000),
      "evt_dupe"
    );

    const first = await ingestStripeEvent(testDb.db, event, deps({ stripe }));
    const second = await ingestStripeEvent(testDb.db, event, deps({ stripe }));

    expect(first).toBe("processed");
    expect(second).toBe("duplicate");

    // Exactly one inbox row, marked processed.
    const inbox = await testDb.db.select().from(schema.billingEventInbox);
    expect(inbox).toHaveLength(1);
    expect(inbox[0].status).toBe("processed");
    expect(inbox[0].processedAt).not.toBeNull();

    // The reducer ran once: trial converted to active.
    const [row] = await testDb.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerRef, "sub_dedupe"));
    expect(row.status).toBe("active");
  });

  it("a failed row is reprocessed on redelivery (not dropped as duplicate)", async () => {
    let attempts = 0;
    const apply = vi.fn(async () => {
      attempts += 1;
      if (attempts === 1) {
        throw new Error("transient");
      }
      // second attempt succeeds (no-op)
    });

    const event = evt("customer.subscription.updated", { id: "sub_retry" }, 100, "evt_retry");

    const first = await ingestStripeEvent(testDb.db, event, deps({ apply }));
    expect(first).toBe("failed");
    let [row] = await testDb.db.select().from(schema.billingEventInbox);
    expect(row.status).toBe("failed");
    expect(row.attempts).toBe(1);
    expect(row.lastError).toContain("transient");

    // Stripe redelivers the same event id → we reprocess the failed row.
    const second = await ingestStripeEvent(testDb.db, event, deps({ apply }));
    expect(second).toBe("processed");
    [row] = await testDb.db.select().from(schema.billingEventInbox);
    expect(row.status).toBe("processed");
    expect(apply).toHaveBeenCalledTimes(2);
  });

  it("dead-letters once attempts are exhausted", async () => {
    const apply = vi.fn(async () => {
      throw new Error("poison");
    });
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    const event = evt("charge.refunded", {}, 100, "evt_poison");

    let outcome: string = "";
    for (let i = 0; i < MAX_INBOX_ATTEMPTS; i++) {
      outcome = await ingestStripeEvent(testDb.db, event, deps({ apply }));
    }

    expect(outcome).toBe("dead_letter");
    const [row] = await testDb.db.select().from(schema.billingEventInbox);
    expect(row.status).toBe("dead_letter");
    expect(row.attempts).toBe(MAX_INBOX_ATTEMPTS);

    const dead = info.mock.calls
      .map((c) => JSON.parse(String(c[0])))
      .filter((e) => e.name === "stripe_inbox_dead_letter");
    expect(dead.length).toBeGreaterThanOrEqual(1);
    info.mockRestore();
  });
});

// ── 2. Webhook handler retry semantics ───────────────────────────────────────

describe("webhook handler — retry-honest HTTP status", () => {
  function webhookRequest() {
    return new Request("https://x.test/api/billing/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "sig" },
      body: "{}"
    });
  }

  it("200 on first process, 200 duplicate on redelivery, 500 on reducer failure", async () => {
    const event = evt("customer.subscription.updated", { id: "sub_wh" }, 100, "evt_wh_ok");
    const okStripe = () =>
      ({
        webhooks: { constructEventAsync: vi.fn().mockResolvedValue(event) }
      }) as unknown as Stripe;

    const GET = createStripeWebhookHandler({
      db: () => testDb.db,
      stripeClient: okStripe,
      now: () => NOW
    });

    const first = await GET(webhookRequest());
    expect(first.status).toBe(200);
    const second = await GET(webhookRequest());
    expect(second.status).toBe(200);
    expect((await second.json()).outcome).toBe("duplicate");

    // A reducer that throws → 500 so Stripe retries. charge.refunded whose
    // invoice lookup rejects is the simplest event that makes the reducer throw.
    const throwing = createStripeWebhookHandler({
      db: () => testDb.db,
      stripeClient: () =>
        ({
          webhooks: {
            constructEventAsync: vi
              .fn()
              .mockResolvedValue(evt("charge.refunded", { refunded: true, invoice: "in_x" }, 100, "evt_wh_500"))
          },
          invoices: { retrieve: vi.fn().mockRejectedValue(new Error("stripe down")) }
        }) as unknown as Stripe,
      now: () => NOW
    });
    const failed = await throwing(webhookRequest());
    expect(failed.status).toBe(500);
  });

  it("400 on a bad signature — nothing is stored", async () => {
    const GET = createStripeWebhookHandler({
      db: () => testDb.db,
      stripeClient: () =>
        ({
          webhooks: {
            constructEventAsync: vi.fn().mockRejectedValue(new Error("bad sig"))
          }
        }) as unknown as Stripe,
      now: () => NOW
    });
    const res = await GET(webhookRequest());
    expect(res.status).toBe(400);
    const inbox = await testDb.db.select().from(schema.billingEventInbox);
    expect(inbox).toHaveLength(0);
  });
});

// ── 3. Idempotent, order-tolerant reducer (permutations) ─────────────────────

/** Apply an event list against a freshly-seeded row and return final status. */
async function runSequence(
  events: Stripe.Event[],
  stripe?: () => Stripe
): Promise<string> {
  await testDb.db.delete(schema.subscriptions);
  await seedSub({ providerRef: "sub_perm", status: "active", currentPeriodEnd: FUTURE });
  for (const event of events) {
    await applyStripeEvent(testDb.db, event, NOW, stripe);
  }
  const [row] = await testDb.db
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.providerRef, "sub_perm"));
  return row.status;
}

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  const out: T[][] = [];
  items.forEach((item, i) => {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    for (const p of permutations(rest)) out.push([item, ...p]);
  });
  return out;
}

describe("reducer — order tolerance (latest-event-wins per providerRef)", () => {
  it("converges to `expired` for every ordering of update/cancel/delete", async () => {
    const updated = evt(
      "customer.subscription.updated",
      { id: "sub_perm", status: "active", items: { data: [{ current_period_end: Math.floor(FUTURE.getTime() / 1000) }] } },
      100
    );
    const canceledFlag = evt(
      "customer.subscription.updated",
      { id: "sub_perm", status: "active", cancel_at_period_end: true, items: { data: [{ current_period_end: Math.floor(FUTURE.getTime() / 1000) }] } },
      200
    );
    const deleted = evt(
      "customer.subscription.deleted",
      { id: "sub_perm", status: "canceled", items: { data: [{ current_period_end: Math.floor(NOW.getTime() / 1000) }] } },
      300
    );

    const results = new Set<string>();
    for (const order of permutations([updated, canceledFlag, deleted])) {
      results.add(await runSequence(order));
    }
    // Deleted (created=300) is newest → expired wins in all 6 orderings.
    expect([...results]).toEqual(["expired"]);
  });

  it("`refunded` is terminal and wins over every ordering, even a later delete", async () => {
    const stripe = () =>
      ({
        invoices: {
          retrieve: vi.fn().mockResolvedValue({
            parent: { subscription_details: { subscription: "sub_perm" } }
          })
        }
      }) as unknown as Stripe;

    const updated = evt(
      "customer.subscription.updated",
      { id: "sub_perm", status: "active", items: { data: [{ current_period_end: Math.floor(FUTURE.getTime() / 1000) }] } },
      100
    );
    const refunded = evt(
      "charge.refunded",
      { payment_intent: "pi_x", refunded: true, invoice: "in_x" },
      200
    );
    const deleted = evt(
      "customer.subscription.deleted",
      { id: "sub_perm", status: "canceled", items: { data: [{ current_period_end: Math.floor(NOW.getTime() / 1000) }] } },
      300
    );

    const results = new Set<string>();
    for (const order of permutations([updated, refunded, deleted])) {
      results.add(await runSequence(order, stripe));
    }
    expect([...results]).toEqual(["refunded"]);
  });

  it("a stale invoice.paid (older `created`) never re-refreshes an active row backwards", async () => {
    await testDb.db.delete(schema.subscriptions);
    await seedSub({ providerRef: "sub_stale", status: "active", currentPeriodEnd: FUTURE });

    const retrieve = vi.fn().mockResolvedValue({
      status: "active",
      items: { data: [{ current_period_end: Math.floor(FUTURE2.getTime() / 1000) }] }
    });
    const stripe = () => ({ subscriptions: { retrieve } }) as unknown as Stripe;

    const newer = evt(
      "invoice.paid",
      { parent: { subscription_details: { subscription: "sub_stale" } } },
      200
    );
    const older = evt(
      "invoice.paid",
      { parent: { subscription_details: { subscription: "sub_stale" } } },
      100
    );

    await applyStripeEvent(testDb.db, newer, NOW, stripe);
    await applyStripeEvent(testDb.db, older, NOW, stripe);

    const [row] = await testDb.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerRef, "sub_stale"));
    expect(row.currentPeriodEnd.toISOString()).toBe(FUTURE2.toISOString());
    // The stale event returned before the Stripe fetch — retrieve ran once.
    expect(retrieve).toHaveBeenCalledTimes(1);
  });

  it("a checkout.session.completed replayed after a refund does not resurrect premium", async () => {
    await testDb.db.delete(schema.subscriptions);
    await seedSub({ providerRef: "sub_ref", status: "refunded", currentPeriodEnd: FUTURE });

    const stripe = () =>
      ({
        subscriptions: {
          retrieve: vi.fn().mockResolvedValue({
            items: { data: [{ price: { id: "p" }, current_period_end: Math.floor(FUTURE.getTime() / 1000) }] }
          })
        }
      }) as unknown as Stripe;

    await applyStripeEvent(
      testDb.db,
      evt(
        "checkout.session.completed",
        { client_reference_id: userId, subscription: "sub_ref" },
        400
      ),
      NOW,
      stripe
    );

    const [row] = await testDb.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerRef, "sub_ref"));
    expect(row.status).toBe("refunded");
  });
});

// ── 4. Stripe verify-on-read heal ────────────────────────────────────────────

describe("getEntitlement — Stripe verify-on-read", () => {
  it("heals a stale premium-status row (past period end) against Stripe", async () => {
    await seedSub({
      providerRef: "sub_heal",
      status: "active",
      currentPeriodEnd: PAST,
      lastVerifiedAt: null
    });
    const refreshStripeSubscription = vi
      .fn()
      .mockResolvedValue({ status: "active", currentPeriodEnd: FUTURE });
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    const result = await getEntitlement(testDb.db, userId, {
      now: () => NOW,
      refreshStripeSubscription
    });

    expect(result.tier).toBe("premium");
    expect(result.source).toBe("stripe");
    expect(result.currentPeriodEnd?.toISOString()).toBe(FUTURE.toISOString());
    expect(refreshStripeSubscription).toHaveBeenCalledTimes(1);

    const [row] = await testDb.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerRef, "sub_heal"));
    expect(row.lastVerifiedAt).not.toBeNull();

    const recovered = info.mock.calls
      .map((c) => JSON.parse(String(c[0])))
      .filter((e) => e.name === "entitlement_recovered");
    expect(recovered.length).toBe(1);
    expect(recovered[0].provider).toBe("stripe");
    info.mockRestore();
  });

  it("does NOT re-check a row verified within the last hour (time-gated)", async () => {
    await seedSub({
      providerRef: "sub_gated",
      status: "active",
      currentPeriodEnd: PAST,
      lastVerifiedAt: new Date(NOW.getTime() - 30 * 60 * 1000)
    });
    const refreshStripeSubscription = vi.fn();

    const result = await getEntitlement(testDb.db, userId, {
      now: () => NOW,
      refreshStripeSubscription
    });

    expect(refreshStripeSubscription).not.toHaveBeenCalled();
    expect(result.tier).toBe("free");
  });

  it("never grants when the Stripe lookup throws (fails toward free)", async () => {
    await seedSub({
      providerRef: "sub_down",
      status: "active",
      currentPeriodEnd: PAST
    });
    const refreshStripeSubscription = vi
      .fn()
      .mockRejectedValue(new Error("stripe down"));

    const result = await getEntitlement(testDb.db, userId, {
      now: () => NOW,
      refreshStripeSubscription
    });
    expect(result.tier).toBe("free");
  });
});

// ── 5. Reconciliation sweep ──────────────────────────────────────────────────

describe("runStripeReconcileCron", () => {
  it("reprocesses pending/failed inbox rows and dead-letters the exhausted ones", async () => {
    // A benign event that the real reducer no-ops (no matching row) — succeeds.
    await testDb.db.insert(schema.billingEventInbox).values({
      provider: "stripe",
      providerEventId: "evt_ok",
      eventType: "customer.subscription.updated",
      payload: evt("customer.subscription.updated", { id: "nobody" }, 100, "evt_ok") as never,
      status: "failed",
      attempts: 1,
      receivedAt: PAST
    });
    // A poison row one failure short of the ceiling.
    await testDb.db.insert(schema.billingEventInbox).values({
      provider: "stripe",
      providerEventId: "evt_dead",
      eventType: "customer.subscription.updated",
      payload: evt("__throw__", {}, 100, "evt_dead") as never,
      status: "failed",
      attempts: MAX_INBOX_ATTEMPTS - 1,
      receivedAt: PAST
    });

    const apply = async (
      db: never,
      event: Stripe.Event,
      now: Date,
      stripe?: () => Stripe,
      email?: never
    ) => {
      if ((event.type as string) === "__throw__") throw new Error("still poison");
      await applyStripeEvent(db, event, now, stripe, email);
    };
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    const result = await runStripeReconcileCron(testDb.db, {
      now: () => NOW,
      apply: apply as never
    });

    expect(result.reprocessed).toBe(1);
    expect(result.deadLettered).toBe(1);

    const rows = await testDb.db.select().from(schema.billingEventInbox);
    const byId = Object.fromEntries(rows.map((r) => [r.providerEventId, r]));
    expect(byId.evt_ok.status).toBe("processed");
    expect(byId.evt_dead.status).toBe("dead_letter");
    expect(byId.evt_dead.attempts).toBe(MAX_INBOX_ATTEMPTS);

    // Heartbeat recorded + dead-letter alert emitted.
    const [hb] = await testDb.db
      .select()
      .from(schema.cronHeartbeat)
      .where(eq(schema.cronHeartbeat.name, "stripe-reconcile"));
    expect(hb).toBeTruthy();

    const alerts = info.mock.calls
      .map((c) => JSON.parse(String(c[0])))
      .filter((e) => e.name === "stripe_inbox_dead_letter");
    expect(alerts.length).toBeGreaterThanOrEqual(1);
    info.mockRestore();
  });

  it("verifies a near-horizon subscription and alerts on entitlement-without-subscription", async () => {
    await seedSub({
      providerRef: "sub_mismatch",
      status: "active",
      currentPeriodEnd: PAST
    });
    const stripe = () =>
      ({
        subscriptions: {
          retrieve: vi.fn().mockResolvedValue({
            status: "incomplete_expired",
            items: { data: [{ current_period_end: Math.floor(PAST.getTime() / 1000) }] }
          })
        }
      }) as unknown as Stripe;
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    const result = await runStripeReconcileCron(testDb.db, {
      now: () => NOW,
      stripe
    });

    expect(result.healed).toBe(1);
    const [row] = await testDb.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerRef, "sub_mismatch"));
    expect(row.status).toBe("expired");
    expect(row.lastVerifiedAt).not.toBeNull();

    const alerts = info.mock.calls
      .map((c) => JSON.parse(String(c[0])))
      .filter((e) => e.name === "entitlement_without_subscription");
    expect(alerts.length).toBe(1);
    info.mockRestore();
  });

  it("flags charge-without-entitlement: a processed paid invoice, past SLO, with no row", async () => {
    await testDb.db.insert(schema.billingEventInbox).values({
      provider: "stripe",
      providerEventId: "evt_ghost",
      eventType: "invoice.paid",
      payload: evt(
        "invoice.paid",
        {
          billing_reason: "subscription_cycle",
          parent: { subscription_details: { subscription: "sub_ghost" } }
        },
        100,
        "evt_ghost"
      ) as never,
      status: "processed",
      receivedAt: new Date(NOW.getTime() - 5 * 60 * 1000) // 5 min ago, past SLO
    });
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    const result = await runStripeReconcileCron(testDb.db, { now: () => NOW });

    expect(result.chargesWithoutEntitlement).toBe(1);
    const alerts = info.mock.calls
      .map((c) => JSON.parse(String(c[0])))
      .filter((e) => e.name === "charge_without_entitlement");
    expect(alerts.length).toBe(1);
    info.mockRestore();
  });
});

// ── 5b. Transactional atomicity (reviewer #1) ────────────────────────────────

describe("inbox — transactional atomicity", () => {
  it("rolls back a partial subscription write when the reducer throws mid-apply", async () => {
    // apply writes a subscription row and THEN throws — the transaction must
    // undo the write, leaving no ghost row, and mark the inbox row failed.
    const apply = (async (db: typeof testDb.db) => {
      await db.insert(schema.subscriptions).values({
        userId,
        provider: "stripe",
        providerRef: "sub_partial_rollback",
        productId: "premium_monthly",
        status: "active",
        currentPeriodEnd: FUTURE
      });
      throw new Error("boom after write");
    }) as unknown as typeof applyStripeEvent;

    const event = evt("customer.subscription.updated", { id: "x" }, 100, "evt_rollback");
    const outcome = await ingestStripeEvent(testDb.db, event, deps({ apply }));
    expect(outcome).toBe("failed");

    // The write was rolled back with the transaction.
    const subs = await testDb.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerRef, "sub_partial_rollback"));
    expect(subs).toHaveLength(0);

    // The failure record itself persists (written outside the rolled-back tx).
    const [inbox] = await testDb.db.select().from(schema.billingEventInbox);
    expect(inbox.status).toBe("failed");
    expect(inbox.attempts).toBe(1);
  });
});

// ── 5c. charge-without-entitlement window + pruning (reviewer #2) ─────────────

describe("reconcile — charge scan window + pruning", () => {
  it("catches a RECENT ghost even when >100 older processed rows exist", async () => {
    // 100 processed invoice.paid rows OUTSIDE the 7-day scan window — under the
    // old oldest-first, unbounded scan these would crowd out the recent ghost.
    const old = new Date(NOW.getTime() - 10 * 24 * 60 * 60 * 1000);
    await testDb.db.insert(schema.billingEventInbox).values(
      Array.from({ length: 100 }, (_, i) => ({
        provider: "stripe" as const,
        providerEventId: `evt_old_${i}`,
        eventType: "invoice.paid",
        payload: evt(
          "invoice.paid",
          { billing_reason: "subscription_cycle", parent: { subscription_details: { subscription: `sub_old_${i}` } } },
          100,
          `evt_old_${i}`
        ) as never,
        status: "processed" as const,
        receivedAt: old,
        processedAt: old
      }))
    );
    // One recent ghost (2 min ago, inside window, past the 60s SLO), no row.
    await testDb.db.insert(schema.billingEventInbox).values({
      provider: "stripe",
      providerEventId: "evt_recent_ghost",
      eventType: "invoice.paid",
      payload: evt(
        "invoice.paid",
        { billing_reason: "subscription_cycle", parent: { subscription_details: { subscription: "sub_recent_ghost" } } },
        100,
        "evt_recent_ghost"
      ) as never,
      status: "processed",
      receivedAt: new Date(NOW.getTime() - 2 * 60 * 1000),
      processedAt: new Date(NOW.getTime() - 2 * 60 * 1000)
    });
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    const result = await runStripeReconcileCron(testDb.db, { now: () => NOW });

    expect(result.chargesWithoutEntitlement).toBe(1);
    const alerts = info.mock.calls
      .map((c) => JSON.parse(String(c[0])))
      .filter((e) => e.name === "charge_without_entitlement");
    expect(alerts.length).toBe(1);
    info.mockRestore();
  });

  it("prunes processed rows older than the retention window, keeps recent ones", async () => {
    await testDb.db.insert(schema.billingEventInbox).values([
      {
        provider: "stripe",
        providerEventId: "evt_stale_processed",
        eventType: "customer.subscription.updated",
        payload: {} as never,
        status: "processed",
        receivedAt: new Date(NOW.getTime() - 40 * 24 * 60 * 60 * 1000),
        processedAt: new Date(NOW.getTime() - 40 * 24 * 60 * 60 * 1000)
      },
      {
        provider: "stripe",
        providerEventId: "evt_fresh_processed",
        eventType: "customer.subscription.updated",
        payload: {} as never,
        status: "processed",
        receivedAt: new Date(NOW.getTime() - 5 * 24 * 60 * 60 * 1000),
        processedAt: new Date(NOW.getTime() - 5 * 24 * 60 * 60 * 1000)
      }
    ]);

    const result = await runStripeReconcileCron(testDb.db, { now: () => NOW });

    expect(result.pruned).toBe(1);
    const remaining = await testDb.db.select().from(schema.billingEventInbox);
    const ids = remaining.map((r) => r.providerEventId);
    expect(ids).toContain("evt_fresh_processed");
    expect(ids).not.toContain("evt_stale_processed");
  });
});

// ── 6. Delayed-event alert ───────────────────────────────────────────────────

describe("inbox — delayed-event alert", () => {
  it("alerts when a webhook arrives more than 60s after the event was created", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const event = evt(
      "customer.subscription.updated",
      { id: "sub_delayed" },
      Math.floor((NOW.getTime() - 5 * 60 * 1000) / 1000), // created 5 min ago
      "evt_delayed"
    );
    await ingestStripeEvent(testDb.db, event, deps());

    const delayed = info.mock.calls
      .map((c) => JSON.parse(String(c[0])))
      .filter((e) => e.name === "stripe_event_delayed");
    expect(delayed.length).toBe(1);
    expect(delayed[0].latency).toBe("under_5m");
    info.mockRestore();
  });
});
