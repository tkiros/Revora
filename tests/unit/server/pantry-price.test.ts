import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearPantryPriceCache,
  resolvePantryPrice
} from "../../../lib/server/pantry-price";

/**
 * AUD-010 — the Pantry price authority. Display and checkout both come from
 * this resolver, which verifies the configured Stripe Price is an active
 * one-time USD amount and fails closed (null) otherwise. The contract: the
 * rendered amount can only ever be the unit_amount of the Price the checkout
 * session will charge.
 */

const ENV = { STRIPE_PRICE_PANTRY: "price_pantry_49" } as unknown as NodeJS.ProcessEnv;

function stripeWith(price: Record<string, unknown>) {
  return {
    prices: { retrieve: vi.fn().mockResolvedValue(price) }
  } as never;
}

const GOOD = {
  id: "price_pantry_49",
  active: true,
  recurring: null,
  currency: "usd",
  unit_amount: 4900
};

beforeEach(() => clearPantryPriceCache());

describe("resolvePantryPrice", () => {
  it("binds the display to the charged Price's unit_amount", async () => {
    const resolved = await resolvePantryPrice({
      stripeClient: () => stripeWith(GOOD),
      env: ENV
    });
    expect(resolved).toEqual({ priceId: "price_pantry_49", display: "$49" });
  });

  it("formats non-integer amounts with cents", async () => {
    const resolved = await resolvePantryPrice({
      stripeClient: () => stripeWith({ ...GOOD, unit_amount: 4950 }),
      env: ENV
    });
    expect(resolved?.display).toBe("$49.50");
  });

  it("fails closed on a recurring, non-USD, inactive, or amountless Price", async () => {
    for (const bad of [
      { ...GOOD, recurring: { interval: "month" } },
      { ...GOOD, currency: "eur" },
      { ...GOOD, active: false },
      { ...GOOD, unit_amount: null },
      { ...GOOD, unit_amount: 0 }
    ]) {
      clearPantryPriceCache();
      expect(
        await resolvePantryPrice({ stripeClient: () => stripeWith(bad), env: ENV })
      ).toBeNull();
    }
  });

  it("fails closed when the env names no price or the lookup throws", async () => {
    expect(
      await resolvePantryPrice({
        stripeClient: () => stripeWith(GOOD),
        env: {} as unknown as NodeJS.ProcessEnv
      })
    ).toBeNull();

    clearPantryPriceCache();
    const stripe = {
      prices: { retrieve: vi.fn().mockRejectedValue(new Error("down")) }
    } as never;
    expect(
      await resolvePantryPrice({ stripeClient: () => stripe, env: ENV })
    ).toBeNull();
  });

  it("caches within the TTL (success and failure) and re-resolves after it", async () => {
    let t = 0;
    const retrieve = vi.fn().mockResolvedValue(GOOD);
    const stripe = { prices: { retrieve } } as never;
    const deps = { stripeClient: () => stripe, env: ENV, now: () => t };

    await resolvePantryPrice(deps);
    await resolvePantryPrice(deps);
    expect(retrieve).toHaveBeenCalledTimes(1);

    // A Stripe outage is cached too — no per-view retry storm.
    t = 6 * 60_000;
    retrieve.mockRejectedValueOnce(new Error("down"));
    expect(await resolvePantryPrice(deps)).toBeNull();
    expect(await resolvePantryPrice(deps)).toBeNull();
    expect(retrieve).toHaveBeenCalledTimes(2);

    t = 12 * 60_000;
    expect(await resolvePantryPrice(deps)).toEqual({
      priceId: "price_pantry_49",
      display: "$49"
    });
  });

  it("PANTRY_PRICE_STUB is a test seam only — never active in production", async () => {
    const retrieve = vi.fn().mockResolvedValue(GOOD);
    const stripe = { prices: { retrieve } } as never;
    const stubEnv = {
      PANTRY_PRICE_STUB: "1"
    } as unknown as NodeJS.ProcessEnv;

    // Stubbed: fixed $49 with no Stripe call, even with no price configured.
    expect(
      await resolvePantryPrice({ stripeClient: () => stripe, env: stubEnv })
    ).toEqual({ priceId: "price_stub_pantry", display: "$49" });
    expect(retrieve).not.toHaveBeenCalled();

    // Production posture: the stub is ignored and the resolver fails closed.
    vi.stubEnv("VERCEL_ENV", "production");
    try {
      clearPantryPriceCache();
      expect(
        await resolvePantryPrice({ stripeClient: () => stripe, env: stubEnv })
      ).toBeNull();
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("re-resolves immediately when the configured price id changes", async () => {
    const retrieve = vi
      .fn()
      .mockResolvedValueOnce(GOOD)
      .mockResolvedValueOnce({ ...GOOD, id: "price_new", unit_amount: 5900 });
    const stripe = { prices: { retrieve } } as never;

    expect(
      (await resolvePantryPrice({ stripeClient: () => stripe, env: ENV }))?.display
    ).toBe("$49");
    expect(
      (
        await resolvePantryPrice({
          stripeClient: () => stripe,
          env: { STRIPE_PRICE_PANTRY: "price_new" } as unknown as NodeJS.ProcessEnv
        })
      )?.display
    ).toBe("$59");
  });
});
