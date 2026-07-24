import Stripe from "stripe";

/**
 * AUD-010 — one authority for the Pantry Review price. The landing surfaces
 * and the checkout session both resolve the SAME Stripe Price object named by
 * STRIPE_PRICE_PANTRY, so a configuration change can never show one amount and
 * charge another. Fail closed: no verified one-time USD amount → null, and the
 * callers render "not available" / 503 instead of a guessed "$49".
 */
export type PantryPrice = { priceId: string; display: string };

export type PantryPriceDeps = {
  stripeClient?: () => Stripe;
  env?: Partial<NodeJS.ProcessEnv>;
  now?: () => number;
};

let stripeSingleton: Stripe | null = null;
function defaultStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  stripeSingleton ??= new Stripe(key);
  return stripeSingleton;
}

// ponytail: module-level TTL cache — the cold-traffic landing must not call
// Stripe per view. 5 minutes bounds display-vs-charge drift after a price
// reconfiguration; move to a durable cache if multi-instance skew matters.
const TTL_MS = 5 * 60_000;
let cache: { key: string; value: PantryPrice | null; at: number } | null = null;

export function clearPantryPriceCache() {
  cache = null;
}

export async function resolvePantryPrice(
  deps: PantryPriceDeps = {}
): Promise<PantryPrice | null> {
  const env = deps.env ?? process.env;
  const now = deps.now ?? Date.now;
  const priceId = env.STRIPE_PRICE_PANTRY;
  if (!priceId) {
    return null;
  }

  if (cache && cache.key === priceId && now() - cache.at < TTL_MS) {
    return cache.value;
  }

  let value: PantryPrice | null = null;
  try {
    const stripe = (deps.stripeClient ?? defaultStripe)();
    const price = await stripe.prices.retrieve(priceId);
    // The Pantry promise is "one payment, nothing renews" in USD — anything
    // else configured under this ID is a misconfiguration, not a new price.
    if (
      price.active &&
      !price.recurring &&
      price.currency === "usd" &&
      typeof price.unit_amount === "number" &&
      price.unit_amount > 0
    ) {
      const dollars = price.unit_amount / 100;
      value = {
        priceId: price.id,
        display: Number.isInteger(dollars)
          ? `$${dollars}`
          : `$${dollars.toFixed(2)}`
      };
    }
  } catch {
    value = null;
  }

  // Cache the failure too — a Stripe outage must not turn the landing page
  // into a per-view retry storm.
  cache = { key: priceId, value, at: now() };
  return value;
}
