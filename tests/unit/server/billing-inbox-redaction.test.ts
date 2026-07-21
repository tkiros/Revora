import type Stripe from "stripe";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ingestStripeEvent,
  redactBillingPayload
} from "../../../lib/server/billing/inbox";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

/**
 * BC-8/PR-1: billing_event_inbox retained full Stripe events (buyer email,
 * name, address) forever, with no user FK — account deletion never reached
 * them. Processed rows must hold a redacted payload.
 */

const NOW = new Date("2026-07-21T12:00:00.000Z");

let testDb: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  testDb = await createTestDb();
});

afterAll(async () => {
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.billingEventInbox);
});

describe("redactBillingPayload", () => {
  it("drops buyer PII keys at any depth, keeps structural billing fields", () => {
    const redacted = redactBillingPayload({
      id: "evt_1",
      type: "invoice.paid",
      data: {
        object: {
          id: "in_1",
          billing_reason: "subscription_cycle",
          customer_email: "buyer@example.com",
          customer_name: "Ada Buyer",
          customer_address: { line1: "1 Main St" },
          parent: {
            subscription_details: { subscription: "sub_9" }
          },
          lines: {
            data: [{ amount: 1299, billing_details: { email: "x@y.z" } }]
          }
        }
      }
    });

    const s = JSON.stringify(redacted);
    expect(s).not.toContain("buyer@example.com");
    expect(s).not.toContain("Ada Buyer");
    expect(s).not.toContain("1 Main St");
    expect(s).not.toContain("x@y.z");
    // What the reconcile charge scan still needs survives:
    expect(s).toContain("subscription_cycle");
    expect(s).toContain("sub_9");
    expect(s).toContain("1299");
  });
});

describe("ingestStripeEvent → processed rows hold a redacted payload", () => {
  it("removes customer details once the event is processed", async () => {
    const event = {
      id: "evt_redact_1",
      type: "customer.subscription.updated",
      created: Math.floor(NOW.getTime() / 1000),
      data: {
        object: {
          id: "sub_none",
          status: "active",
          items: { data: [] },
          customer_email: "buyer@example.com"
        }
      }
    } as unknown as Stripe.Event;

    const outcome = await ingestStripeEvent(testDb.db, event, {
      now: () => NOW,
      apply: vi.fn().mockResolvedValue([])
    });

    expect(outcome).toBe("processed");
    const [row] = await testDb.db.select().from(schema.billingEventInbox);
    expect(row.status).toBe("processed");
    expect(JSON.stringify(row.payload)).not.toContain("buyer@example.com");
    expect(JSON.stringify(row.payload)).toContain("sub_none");
  });
});
