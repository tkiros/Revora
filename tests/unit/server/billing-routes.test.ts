import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
  applyStripeEvent,
  createEntitlementHandler,
  createPlayRtdnHandler,
  createPlayVerifyHandler
} from "../../../app/api/billing/handlers";
import { encryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const TEST_KEY = Buffer.alloc(32, 6).toString("base64");
const NOW = new Date("2026-07-03T15:00:00.000Z");
const FUTURE = new Date("2026-08-03T15:00:00.000Z");

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let userId: string;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = TEST_KEY;
  process.env.RTDN_SHARED_TOKEN = "rtdn-secret";
  testDb = await createTestDb();
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: "billing@test.dev" })
    .returning();
  userId = user.id;
  await testDb.db.insert(schema.profiles).values({
    userId,
    a1cCiphertext: encryptField("6.1"),
    a1cBand: "prediabetes_60_62",
    timezone: "UTC",
    consentedAt: NOW
  });
});

afterAll(async () => {
  delete process.env.HEALTH_DATA_KEY;
  delete process.env.RTDN_SHARED_TOKEN;
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.subscriptions);
});

const baseDeps = () => ({
  db: () => testDb.db,
  getSession: async () => ({ userId, email: "billing@test.dev" }),
  now: () => NOW
});

function post(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("POST /api/billing/play/verify", () => {
  it("verifies server-side, upserts the subscription, returns premium", async () => {
    const playLookup = vi.fn().mockResolvedValue({
      status: "active",
      currentPeriodEnd: FUTURE,
      productId: "premium_annual"
    });
    const POST = createPlayVerifyHandler({ ...baseDeps(), playLookup });

    const response = await POST(
      post("http://t/api/billing/play/verify", { purchaseToken: "tok-1" })
    );
    const body = await response.json();

    expect(playLookup).toHaveBeenCalledWith("tok-1");
    expect(body).toEqual({
      tier: "premium",
      source: "play",
      status: "premium"
    });

    const [row] = await testDb.db.select().from(schema.subscriptions);
    expect(row.providerRef).toBe("tok-1");
    expect(row.productId).toBe("premium_annual");
  });

  it("never grants on an unverifiable token", async () => {
    const POST = createPlayVerifyHandler({
      ...baseDeps(),
      playLookup: vi.fn().mockRejectedValue(new Error("api down"))
    });

    const response = await POST(
      post("http://t/api/billing/play/verify", { purchaseToken: "tok-x" })
    );

    expect(response.status).toBe(502);
    expect(await testDb.db.select().from(schema.subscriptions)).toHaveLength(0);
  });

  it("re-verify is idempotent (upsert on providerRef)", async () => {
    const playLookup = vi.fn().mockResolvedValue({
      status: "active",
      currentPeriodEnd: FUTURE,
      productId: "premium_monthly"
    });
    const POST = createPlayVerifyHandler({ ...baseDeps(), playLookup });
    const request = () =>
      post("http://t/api/billing/play/verify", { purchaseToken: "tok-2" });

    await POST(request());
    await POST(request());

    expect(await testDb.db.select().from(schema.subscriptions)).toHaveLength(1);
  });
});

describe("POST /api/billing/play/rtdn", () => {
  function rtdnRequest(token: string, purchaseToken: string) {
    return post(`http://t/api/billing/play/rtdn?token=${token}`, {
      message: {
        data: Buffer.from(
          JSON.stringify({
            subscriptionNotification: { purchaseToken, notificationType: 3 }
          })
        ).toString("base64")
      }
    });
  }

  it("rejects a bad shared token", async () => {
    const POST = createPlayRtdnHandler(baseDeps());
    const response = await POST(rtdnRequest("wrong", "tok-1"));

    expect(response.status).toBe(401);
  });

  it("updates a known subscription from the Play lookup (cancel flow)", async () => {
    await testDb.db.insert(schema.subscriptions).values({
      userId,
      provider: "play",
      providerRef: "tok-3",
      productId: "premium_monthly",
      status: "active",
      currentPeriodEnd: FUTURE
    });

    const POST = createPlayRtdnHandler({
      ...baseDeps(),
      playLookup: vi.fn().mockResolvedValue({
        status: "canceled",
        currentPeriodEnd: FUTURE,
        productId: "premium_monthly"
      })
    });

    const response = await POST(rtdnRequest("rtdn-secret", "tok-3"));

    expect(response.status).toBe(200);
    const [row] = await testDb.db.select().from(schema.subscriptions);
    expect(row.status).toBe("canceled");
  });

  it("acks unknown purchase tokens without creating rows", async () => {
    const playLookup = vi.fn();
    const POST = createPlayRtdnHandler({ ...baseDeps(), playLookup });

    const response = await POST(rtdnRequest("rtdn-secret", "tok-unknown"));

    expect(response.status).toBe(200);
    expect(playLookup).not.toHaveBeenCalled();
    expect(await testDb.db.select().from(schema.subscriptions)).toHaveLength(0);
  });

  it("nacks (500) when the Play lookup fails so Pub/Sub retries", async () => {
    await testDb.db.insert(schema.subscriptions).values({
      userId,
      provider: "play",
      providerRef: "tok-4",
      productId: "premium_monthly",
      status: "active",
      currentPeriodEnd: FUTURE
    });

    const POST = createPlayRtdnHandler({
      ...baseDeps(),
      playLookup: vi.fn().mockRejectedValue(new Error("down"))
    });

    const response = await POST(rtdnRequest("rtdn-secret", "tok-4"));
    expect(response.status).toBe(500);
  });
});

describe("applyStripeEvent", () => {
  it("checkout.session.completed creates an active subscription", async () => {
    const stripeClient = {
      subscriptions: {
        retrieve: vi.fn().mockResolvedValue({
          items: {
            data: [
              {
                price: { id: "price_monthly" },
                current_period_end: Math.floor(FUTURE.getTime() / 1000)
              }
            ]
          }
        })
      }
    } as unknown as Stripe;

    await applyStripeEvent(
      testDb.db,
      {
        type: "checkout.session.completed",
        data: {
          object: { client_reference_id: userId, subscription: "sub_123" }
        }
      } as unknown as Stripe.Event,
      NOW,
      () => stripeClient
    );

    const [row] = await testDb.db.select().from(schema.subscriptions);
    expect(row.provider).toBe("stripe");
    expect(row.providerRef).toBe("sub_123");
    expect(row.status).toBe("active");
    expect(row.currentPeriodEnd.toISOString()).toBe(FUTURE.toISOString());
  });

  it("customer.subscription.deleted expires the subscription", async () => {
    await testDb.db.insert(schema.subscriptions).values({
      userId,
      provider: "stripe",
      providerRef: "sub_del",
      productId: "premium_monthly",
      status: "active",
      currentPeriodEnd: FUTURE
    });

    await applyStripeEvent(
      testDb.db,
      {
        type: "customer.subscription.deleted",
        data: {
          object: {
            id: "sub_del",
            status: "canceled",
            items: {
              data: [
                { current_period_end: Math.floor(NOW.getTime() / 1000) }
              ]
            }
          }
        }
      } as unknown as Stripe.Event,
      NOW
    );

    const [row] = await testDb.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerRef, "sub_del"));
    expect(row.status).toBe("expired");
  });

  it("charge.refunded (full) on a subscription invoice drops the row to refunded (BUG-17)", async () => {
    await testDb.db.insert(schema.subscriptions).values({
      userId,
      provider: "stripe",
      providerRef: "sub_refund",
      productId: "premium_monthly",
      status: "active",
      currentPeriodEnd: FUTURE
    });

    const stripeClient = {
      invoices: {
        retrieve: vi.fn().mockResolvedValue({
          parent: { subscription_details: { subscription: "sub_refund" } }
        })
      }
    } as unknown as Stripe;

    await applyStripeEvent(
      testDb.db,
      {
        type: "charge.refunded",
        data: {
          object: {
            payment_intent: "pi_refund",
            refunded: true,
            invoice: "in_refund"
          }
        }
      } as unknown as Stripe.Event,
      NOW,
      () => stripeClient
    );

    const [row] = await testDb.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerRef, "sub_refund"));
    // "refunded" is outside PREMIUM_STATUSES — premium drops immediately.
    expect(row.status).toBe("refunded");
  });

  it("charge.refunded (partial) leaves the subscription untouched", async () => {
    await testDb.db.insert(schema.subscriptions).values({
      userId,
      provider: "stripe",
      providerRef: "sub_partial",
      productId: "premium_monthly",
      status: "active",
      currentPeriodEnd: FUTURE
    });

    const retrieve = vi.fn();
    await applyStripeEvent(
      testDb.db,
      {
        type: "charge.refunded",
        data: {
          object: {
            payment_intent: "pi_partial",
            refunded: false, // amount_refunded < amount
            invoice: "in_partial"
          }
        }
      } as unknown as Stripe.Event,
      NOW,
      () => ({ invoices: { retrieve } }) as unknown as Stripe
    );

    const [row] = await testDb.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerRef, "sub_partial"));
    expect(row.status).toBe("active");
    expect(retrieve).not.toHaveBeenCalled();
  });

  it("checkout.session.completed with a trialing subscription stores status trialing + variant", async () => {
    const trialEnd = Math.floor(FUTURE.getTime() / 1000);
    const stripeClient = {
      subscriptions: {
        retrieve: vi.fn().mockResolvedValue({
          status: "trialing",
          trial_end: trialEnd,
          items: {
            data: [
              {
                price: { id: "price_1299" },
                current_period_end: Math.floor(NOW.getTime() / 1000)
              }
            ]
          },
          metadata: { price_variant: "1299" }
        })
      }
    } as unknown as Stripe;

    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    await applyStripeEvent(
      testDb.db,
      {
        type: "checkout.session.completed",
        data: {
          object: { client_reference_id: userId, subscription: "sub_trial" }
        }
      } as unknown as Stripe.Event,
      NOW,
      () => stripeClient
    );

    const [row] = await testDb.db.select().from(schema.subscriptions);
    expect(row.status).toBe("trialing");
    expect(row.priceVariant).toBe("1299");
    // currentPeriodEnd prefers trial_end while trialing.
    expect(row.currentPeriodEnd.toISOString()).toBe(FUTURE.toISOString());

    const emitted = info.mock.calls
      .map((c) => {
        try {
          return JSON.parse(String(c[0]));
        } catch {
          return null;
        }
      })
      .filter((e) => e && e.name === "trial_started");
    expect(emitted).toHaveLength(1);
    expect(emitted[0].priceVariant).toBe("1299");
    info.mockRestore();
  });

  it("invoice.paid flips trialing → active and emits trial_converted once", async () => {
    await testDb.db.insert(schema.subscriptions).values({
      userId,
      provider: "stripe",
      providerRef: "sub_conv",
      productId: "premium_monthly",
      status: "trialing",
      priceVariant: "1299",
      currentPeriodEnd: NOW
    });

    const stripeClient = {
      subscriptions: {
        retrieve: vi.fn().mockResolvedValue({
          status: "active",
          items: {
            data: [
              { current_period_end: Math.floor(FUTURE.getTime() / 1000) }
            ]
          }
        })
      }
    } as unknown as Stripe;

    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    await applyStripeEvent(
      testDb.db,
      {
        type: "invoice.paid",
        data: {
          object: {
            parent: {
              subscription_details: { subscription: "sub_conv" }
            }
          }
        }
      } as unknown as Stripe.Event,
      NOW,
      () => stripeClient
    );

    const [row] = await testDb.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerRef, "sub_conv"));
    expect(row.status).toBe("active");
    expect(row.currentPeriodEnd.toISOString()).toBe(FUTURE.toISOString());

    const converted = info.mock.calls
      .map((c) => {
        try {
          return JSON.parse(String(c[0]));
        } catch {
          return null;
        }
      })
      .filter((e) => e && e.name === "trial_converted");
    expect(converted).toHaveLength(1);
    expect(converted[0].priceVariant).toBe("1299");
    info.mockRestore();
  });

  it("invoice.paid on an already-active subscription refreshes period end WITHOUT a conversion event (renewals are not conversions)", async () => {
    await testDb.db.insert(schema.subscriptions).values({
      userId,
      provider: "stripe",
      providerRef: "sub_renew",
      productId: "premium_monthly",
      status: "active",
      priceVariant: "1299",
      currentPeriodEnd: NOW
    });

    const stripeClient = {
      subscriptions: {
        retrieve: vi.fn().mockResolvedValue({
          status: "active",
          items: {
            data: [
              { current_period_end: Math.floor(FUTURE.getTime() / 1000) }
            ]
          }
        })
      }
    } as unknown as Stripe;

    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    await applyStripeEvent(
      testDb.db,
      {
        type: "invoice.paid",
        data: {
          object: {
            parent: {
              subscription_details: { subscription: "sub_renew" }
            }
          }
        }
      } as unknown as Stripe.Event,
      NOW,
      () => stripeClient
    );

    const [row] = await testDb.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerRef, "sub_renew"));
    expect(row.status).toBe("active");
    expect(row.currentPeriodEnd.toISOString()).toBe(FUTURE.toISOString());

    const converted = info.mock.calls
      .map((c) => {
        try {
          return JSON.parse(String(c[0]));
        } catch {
          return null;
        }
      })
      .filter((e) => e && e.name === "trial_converted");
    expect(converted).toHaveLength(0);
    info.mockRestore();
  });

  it("subscription.updated with cancel_at_period_end during trial keeps status trialing and emits trial_canceled", async () => {
    await testDb.db.insert(schema.subscriptions).values({
      userId,
      provider: "stripe",
      providerRef: "sub_cancel",
      productId: "premium_monthly",
      status: "trialing",
      priceVariant: "1299",
      currentPeriodEnd: FUTURE
    });

    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    await applyStripeEvent(
      testDb.db,
      {
        type: "customer.subscription.updated",
        data: {
          object: {
            id: "sub_cancel",
            status: "trialing",
            cancel_at_period_end: true,
            items: {
              data: [
                { current_period_end: Math.floor(FUTURE.getTime() / 1000) }
              ]
            }
          }
        }
      } as unknown as Stripe.Event,
      NOW
    );

    const [row] = await testDb.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerRef, "sub_cancel"));
    expect(row.status).toBe("trialing");

    const canceled = info.mock.calls
      .map((c) => {
        try {
          return JSON.parse(String(c[0]));
        } catch {
          return null;
        }
      })
      .filter((e) => e && e.name === "trial_canceled");
    expect(canceled).toHaveLength(1);
    expect(canceled[0].priceVariant).toBe("1299");
    info.mockRestore();
  });

  it("past_due maps to grace (premium retained through dunning)", async () => {
    await testDb.db.insert(schema.subscriptions).values({
      userId,
      provider: "stripe",
      providerRef: "sub_grace",
      productId: "premium_monthly",
      status: "active",
      currentPeriodEnd: FUTURE
    });

    await applyStripeEvent(
      testDb.db,
      {
        type: "customer.subscription.updated",
        data: {
          object: {
            id: "sub_grace",
            status: "past_due",
            items: {
              data: [
                { current_period_end: Math.floor(FUTURE.getTime() / 1000) }
              ]
            }
          }
        }
      } as unknown as Stripe.Event,
      NOW
    );

    const [row] = await testDb.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerRef, "sub_grace"));
    expect(row.status).toBe("grace");
  });

  function emittedNamed(
    info: ReturnType<typeof vi.spyOn>,
    name: string
  ): Array<{ name: string; priceVariant?: string }> {
    return info.mock.calls
      .map((c: unknown[]) => {
        try {
          return JSON.parse(String(c[0]));
        } catch {
          return null;
        }
      })
      .filter(
        (e: { name?: string } | null): e is { name: string; priceVariant?: string } =>
          Boolean(e) && e!.name === name
      );
  }

  const activeSubStripe = () =>
    ({
      subscriptions: {
        retrieve: vi.fn().mockResolvedValue({
          status: "active",
          items: {
            data: [{ current_period_end: Math.floor(FUTURE.getTime() / 1000) }]
          }
        })
      }
    }) as unknown as Stripe;

  const invoicePaidEvent = (subscriptionId: string, billingReason?: string) =>
    ({
      type: "invoice.paid",
      data: {
        object: {
          billing_reason: billingReason,
          parent: { subscription_details: { subscription: subscriptionId } }
        }
      }
    }) as unknown as Stripe.Event;

  const trialToActiveUpdatedEvent = (subscriptionId: string) =>
    ({
      type: "customer.subscription.updated",
      data: {
        object: {
          id: subscriptionId,
          status: "active",
          items: {
            data: [{ current_period_end: Math.floor(FUTURE.getTime() / 1000) }]
          }
        },
        previous_attributes: { status: "trialing" }
      }
    }) as unknown as Stripe.Event;

  const seedTrialingRow = (providerRef: string) =>
    testDb.db.insert(schema.subscriptions).values({
      userId,
      provider: "stripe",
      providerRef,
      productId: "premium_monthly",
      status: "trialing",
      priceVariant: "1299",
      currentPeriodEnd: NOW
    });

  it("Order A: invoice.paid (subscription_cycle) then subscription.updated (trialing→active) → active, ONE trial_converted", async () => {
    await seedTrialingRow("sub_orderA");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    await applyStripeEvent(
      testDb.db,
      invoicePaidEvent("sub_orderA", "subscription_cycle"),
      NOW,
      () => activeSubStripe()
    );
    await applyStripeEvent(
      testDb.db,
      trialToActiveUpdatedEvent("sub_orderA"),
      NOW
    );

    const [row] = await testDb.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerRef, "sub_orderA"));
    expect(row.status).toBe("active");

    const converted = emittedNamed(info, "trial_converted");
    expect(converted).toHaveLength(1);
    expect(converted[0].priceVariant).toBe("1299");
    info.mockRestore();
  });

  it("Order B: subscription.updated (trialing→active) then invoice.paid → active, ONE trial_converted", async () => {
    await seedTrialingRow("sub_orderB");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    await applyStripeEvent(
      testDb.db,
      trialToActiveUpdatedEvent("sub_orderB"),
      NOW
    );
    await applyStripeEvent(
      testDb.db,
      invoicePaidEvent("sub_orderB", "subscription_cycle"),
      NOW,
      () => activeSubStripe()
    );

    const [row] = await testDb.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerRef, "sub_orderB"));
    expect(row.status).toBe("active");

    const converted = emittedNamed(info, "trial_converted");
    expect(converted).toHaveLength(1);
    expect(converted[0].priceVariant).toBe("1299");
    info.mockRestore();
  });

  it("invoice.paid with billing_reason subscription_create keeps the trial trialing and emits nothing", async () => {
    await seedTrialingRow("sub_create");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    await applyStripeEvent(
      testDb.db,
      invoicePaidEvent("sub_create", "subscription_create"),
      NOW,
      () => activeSubStripe()
    );

    const [row] = await testDb.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerRef, "sub_create"));
    expect(row.status).toBe("trialing");
    expect(emittedNamed(info, "trial_converted")).toHaveLength(0);
    info.mockRestore();
  });

  it("invoice.paid resolves subscriptionId from the legacy top-level field and still converts", async () => {
    await seedTrialingRow("sub_legacy");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    await applyStripeEvent(
      testDb.db,
      {
        type: "invoice.paid",
        data: {
          object: {
            billing_reason: "subscription_cycle",
            subscription: "sub_legacy"
          }
        }
      } as unknown as Stripe.Event,
      NOW,
      () => activeSubStripe()
    );

    const [row] = await testDb.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerRef, "sub_legacy"));
    expect(row.status).toBe("active");

    const converted = emittedNamed(info, "trial_converted");
    expect(converted).toHaveLength(1);
    expect(converted[0].priceVariant).toBe("1299");
    info.mockRestore();
  });
});

describe("GET /api/entitlement", () => {
  it("returns tier + today's usage against the free limit", async () => {
    const GET = createEntitlementHandler({
      ...baseDeps(),
      playLookup: vi.fn()
    });

    const response = await GET();
    const body = await response.json();

    expect(body).toMatchObject({
      tier: "free",
      source: null,
      freeDailyLimit: 5
    });
    expect(typeof body.checksToday).toBe("number");
  });
});
