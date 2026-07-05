import type Stripe from "stripe";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createCancelHandlers } from "../../../app/api/billing/handlers";
import { createCancelToken } from "../../../lib/server/billing/cancel-token";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const SECRET = "test-secret";
const NOW = new Date("2026-07-03T15:00:00.000Z");
const FUTURE = new Date("2026-08-03T15:00:00.000Z");

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let userId: string;

beforeAll(async () => {
  process.env.AUTH_SECRET = SECRET;
  testDb = await createTestDb();
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: "cancel@test.dev" })
    .returning();
  userId = user.id;
});

afterAll(async () => {
  delete process.env.AUTH_SECRET;
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.subscriptions);
});

const baseDeps = () => ({
  db: () => testDb.db,
  getSession: async () => ({ userId, email: "cancel@test.dev" })
});

function stripeStub() {
  return {
    subscriptions: { update: vi.fn().mockResolvedValue({}) }
  } as unknown as Stripe & {
    subscriptions: { update: ReturnType<typeof vi.fn> };
  };
}

async function seedStripeRow(overrides: Partial<{ status: string; priceVariant: string }> = {}) {
  const [row] = await testDb.db
    .insert(schema.subscriptions)
    .values({
      userId,
      provider: "stripe",
      providerRef: "sub_1",
      productId: "premium_monthly",
      status: (overrides.status ?? "trialing") as "trialing",
      priceVariant: overrides.priceVariant ?? "1299",
      currentPeriodEnd: FUTURE
    })
    .returning();
  return row;
}

describe("GET /api/billing/cancel", () => {
  it("with a valid token sets cancel_at_period_end and redirects to /canceled", async () => {
    const row = await seedStripeRow({ status: "trialing" });
    const stripe = stripeStub();
    const { GET } = createCancelHandlers({
      ...baseDeps(),
      stripeClient: () => stripe
    });
    const token = createCancelToken(row.id, Date.now() + 86_400_000, SECRET);

    const res = await GET(
      new Request(`https://app/api/billing/cancel?token=${token}`)
    );

    expect(stripe.subscriptions.update).toHaveBeenCalledWith("sub_1", {
      cancel_at_period_end: true
    });
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toContain("/canceled");
    expect(res.headers.get("location")).not.toContain("invalid=1");
  });

  it("with a bad/expired token redirects to /canceled?invalid=1 and touches nothing", async () => {
    await seedStripeRow({ status: "trialing" });
    const stripe = stripeStub();
    const { GET } = createCancelHandlers({
      ...baseDeps(),
      stripeClient: () => stripe
    });

    const res = await GET(
      new Request("https://app/api/billing/cancel?token=not-a-real-token")
    );

    expect(stripe.subscriptions.update).not.toHaveBeenCalled();
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toContain("/canceled?invalid=1");
  });
});

describe("POST /api/billing/cancel", () => {
  it("cancels the signed-in user's own stripe subscription (one tap, no portal)", async () => {
    await seedStripeRow({ status: "active" });
    const stripe = stripeStub();
    const { POST } = createCancelHandlers({
      ...baseDeps(),
      stripeClient: () => stripe
    });

    const res = await POST();
    const body = await res.json();

    expect(stripe.subscriptions.update).toHaveBeenCalledWith("sub_1", {
      cancel_at_period_end: true
    });
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(new Date(body.accessUntil).toISOString()).toBe(FUTURE.toISOString());
  });

  it("404s when the user has only a Play subscription (deep-link copy handles Play)", async () => {
    await testDb.db.insert(schema.subscriptions).values({
      userId,
      provider: "play",
      providerRef: "play_tok",
      productId: "premium_monthly",
      status: "active",
      currentPeriodEnd: FUTURE
    });
    const stripe = stripeStub();
    const { POST } = createCancelHandlers({
      ...baseDeps(),
      stripeClient: () => stripe
    });

    const res = await POST();

    expect(res.status).toBe(404);
    expect(stripe.subscriptions.update).not.toHaveBeenCalled();
  });
});
