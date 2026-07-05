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
