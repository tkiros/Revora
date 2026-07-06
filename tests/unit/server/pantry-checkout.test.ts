import type Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  applyStripeEvent,
  createPantryCheckoutSessionHandler
} from "../../../app/api/billing/handlers";
import { hashClaimToken } from "../../../lib/server/pantry/claims";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

/**
 * Task 6.1 — in-app one-time Pantry Review checkout. The factory mirrors the
 * subscription checkout minus the session gate (buyers may be anonymous;
 * Checkout collects the email). The completed session flows through the SAME
 * `applyPantryCheckout` webhook branch as the Payment Link path, so the
 * regression below reuses the pantry-webhook fixture shape to prove it.
 */

const NOW = new Date("2026-07-05T10:00:00.000Z");
const PRICE = "price_pantry_25";

let savedPrice: string | undefined;
let savedAppUrl: string | undefined;

beforeEach(() => {
  savedPrice = process.env.STRIPE_PRICE_PANTRY;
  savedAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  process.env.STRIPE_PRICE_PANTRY = PRICE;
  process.env.NEXT_PUBLIC_APP_URL = "https://revora.test";
});

afterEach(() => {
  if (savedPrice === undefined) delete process.env.STRIPE_PRICE_PANTRY;
  else process.env.STRIPE_PRICE_PANTRY = savedPrice;
  if (savedAppUrl === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
  else process.env.NEXT_PUBLIC_APP_URL = savedAppUrl;
});

function stripeStub() {
  return {
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: "https://stripe/pantry" })
      }
    }
  };
}

describe("createPantryCheckoutSessionHandler", () => {
  it("returns a payment-mode checkout url for the pantry price, no session gate", async () => {
    const stripe = stripeStub();
    const handler = createPantryCheckoutSessionHandler({
      stripeClient: () => stripe as never
    });

    const res = await handler();
    expect(res.status).toBe(200);
    expect((await res.json()).url).toBe("https://stripe/pantry");

    const call = stripe.checkout.sessions.create.mock.calls[0][0];
    expect(call).toMatchObject({
      mode: "payment",
      line_items: [{ price: PRICE, quantity: 1 }],
      success_url: "https://revora.test/pantry/thanks",
      cancel_url: "https://revora.test/pantry"
    });
    // No session gate: the handler never touches client_reference_id.
    expect(call.client_reference_id).toBeUndefined();
  });

  it("503s when STRIPE_PRICE_PANTRY is unset", async () => {
    delete process.env.STRIPE_PRICE_PANTRY;
    const stripe = stripeStub();
    const handler = createPantryCheckoutSessionHandler({
      stripeClient: () => stripe as never
    });

    const res = await handler();
    expect(res.status).toBe(503);
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("REGRESSION: a completed session from this handler's shape drives applyPantryCheckout to create an order + intake email", async () => {
    const ctx = await createTestDb();
    try {
      const send = vi.fn().mockResolvedValue({ ok: true });

      // The completed webhook payload for a session created by this handler:
      // mode "payment", the pantry price on the line items — identical to the
      // Payment Link path the pantry-webhook fixtures exercise.
      const event = {
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_pantry_inapp_1",
            mode: "payment",
            payment_intent: "pi_inapp_1",
            customer_details: { email: "buyer@example.com" },
            subscription: null,
            client_reference_id: null
          }
        }
      } as unknown as Stripe.Event;

      const stripe = () =>
        ({
          checkout: {
            sessions: {
              listLineItems: vi.fn().mockResolvedValue({
                data: [{ price: { id: PRICE } }]
              })
            }
          }
        }) as unknown as Stripe;

      await applyStripeEvent(ctx.db, event, NOW, stripe, { send });

      const [order] = await ctx.db.select().from(schema.pantryOrders);
      expect(order.status).toBe("paid");
      expect(order.email).toBe("buyer@example.com");
      expect(order.stripeSessionId).toBe("cs_pantry_inapp_1");
      expect(order.intakeEmailSentAt?.toISOString()).toBe(NOW.toISOString());

      expect(send).toHaveBeenCalledTimes(1);
      const message = send.mock.calls[0][0];
      expect(message.to).toBe("buyer@example.com");
      const token = /token=([A-Za-z0-9_-]+)/.exec(message.text)?.[1] ?? "";
      expect(hashClaimToken(token)).toBe(order.claimToken);
    } finally {
      await ctx.close();
    }
  });
});
