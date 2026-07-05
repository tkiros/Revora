import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createTrialCheckoutHandler } from "../../../app/api/billing/handlers";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

/**
 * Task 2.6 — email-first trial checkout. Account is created at trial start
 * (find-or-create on the same `users` row the magic-link sign-in resolves),
 * the magic link is fired non-fatally, and a card-gated 7-day trial Checkout
 * session is returned. DI seams (db / stripeClient / sendMagicLink / env) keep
 * the test off the network.
 */

let ctx: Awaited<ReturnType<typeof createTestDb>>;

beforeEach(async () => {
  ctx = await createTestDb();
});

afterEach(async () => {
  await ctx.close();
});

function jsonRequest(body: unknown) {
  return new Request("http://t/api/trial/start", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

const trialEnv = {
  STRIPE_PRICE_MONTHLY_1299: "price_1299",
  TRIAL_PRICE_VARIANT: "1299",
  NEXT_PUBLIC_APP_URL: "https://app"
} as unknown as NodeJS.ProcessEnv;

function stripeStub() {
  return {
    checkout: {
      sessions: { create: vi.fn().mockResolvedValue({ url: "https://stripe/x" }) }
    }
  };
}

it("creates the user, sends the magic link, and returns a trial checkout url", async () => {
  const stripe = stripeStub();
  const sendMagicLink = vi.fn().mockResolvedValue(undefined);
  const handler = createTrialCheckoutHandler({
    db: () => ctx.db,
    stripeClient: () => stripe as never,
    sendMagicLink,
    env: trialEnv
  });

  const res = await handler(jsonRequest({ email: "new@example.com" }));
  expect((await res.json()).url).toBe("https://stripe/x");

  const [user] = await ctx.db.select().from(schema.users);
  expect(user.email).toBe("new@example.com");
  expect(sendMagicLink).toHaveBeenCalledWith("new@example.com");

  const call = stripe.checkout.sessions.create.mock.calls[0][0];
  expect(call).toMatchObject({
    mode: "subscription",
    payment_method_collection: "always",
    client_reference_id: user.id,
    customer_email: "new@example.com",
    line_items: [{ price: "price_1299", quantity: 1 }],
    subscription_data: {
      trial_period_days: 7,
      metadata: { price_variant: "1299" }
    },
    success_url: "https://app/trial/started",
    cancel_url: "https://app/subscribe?declined=1"
  });
});

it("is idempotent for an existing user (no duplicate users row)", async () => {
  const [existing] = await ctx.db
    .insert(schema.users)
    .values({ email: "again@example.com" })
    .returning();

  const stripe = stripeStub();
  const handler = createTrialCheckoutHandler({
    db: () => ctx.db,
    stripeClient: () => stripe as never,
    sendMagicLink: vi.fn().mockResolvedValue(undefined),
    env: trialEnv
  });

  // Uppercase + whitespace must normalise to the same row (schema lowercases).
  const res = await handler(jsonRequest({ email: "  AGAIN@example.com  " }));
  expect(res.status).toBe(200);

  const rows = await ctx.db.select().from(schema.users);
  expect(rows).toHaveLength(1);
  expect(rows[0].id).toBe(existing.id);

  const call = stripe.checkout.sessions.create.mock.calls[0][0];
  expect(call.client_reference_id).toBe(existing.id);
  expect(call.customer_email).toBe("again@example.com");
});

it("400s on an invalid email", async () => {
  const stripe = stripeStub();
  const handler = createTrialCheckoutHandler({
    db: () => ctx.db,
    stripeClient: () => stripe as never,
    sendMagicLink: vi.fn(),
    env: trialEnv
  });

  const res = await handler(jsonRequest({ email: "not-an-email" }));
  expect(res.status).toBe(400);
  expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
  expect(await ctx.db.select().from(schema.users)).toHaveLength(0);
});

it("503s when the variant price env is unset", async () => {
  const stripe = stripeStub();
  const handler = createTrialCheckoutHandler({
    db: () => ctx.db,
    stripeClient: () => stripe as never,
    sendMagicLink: vi.fn(),
    env: { TRIAL_PRICE_VARIANT: "1299" } as unknown as NodeJS.ProcessEnv
  });

  const res = await handler(jsonRequest({ email: "new@example.com" }));
  expect(res.status).toBe(503);
  expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
});

describe("magic-link delivery is non-fatal", () => {
  it("still returns a checkout url when sendMagicLink throws", async () => {
    const stripe = stripeStub();
    const handler = createTrialCheckoutHandler({
      db: () => ctx.db,
      stripeClient: () => stripe as never,
      sendMagicLink: vi.fn().mockRejectedValue(new Error("resend down")),
      env: trialEnv
    });

    const res = await handler(jsonRequest({ email: "new@example.com" }));
    expect(res.status).toBe(200);
    expect((await res.json()).url).toBe("https://stripe/x");
  });
});
