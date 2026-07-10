const VARIANTS = {
  "999": { display: "$9.99", envKey: "STRIPE_PRICE_MONTHLY_999" },
  "1299": { display: "$12.99", envKey: "STRIPE_PRICE_MONTHLY_1299" },
  "1999": { display: "$19.99", envKey: "STRIPE_PRICE_MONTHLY_1999" }
} as const;

export type PriceVariant = keyof typeof VARIANTS;

// One price per deployment window (matched cohorts — never two prices to one
// community at once). The variant is an env var; display + Stripe price ID both
// derive from it here, so the wall can never show a price checkout won't charge.
export function resolvePriceVariant(
  env: Partial<NodeJS.ProcessEnv> = process.env
): { variant: PriceVariant; priceId: string | null; display: string } {
  const raw = env.TRIAL_PRICE_VARIANT ?? "1299";
  const variant: PriceVariant = raw in VARIANTS ? (raw as PriceVariant) : "1299";
  return {
    variant,
    priceId: env[VARIANTS[variant].envKey] ?? null,
    display: VARIANTS[variant].display
  };
}

// Annual plan (owner decision 2026-07-10): one price, no variants. Display
// values live ONLY here — the wall, the legacy paywall, and checkout all
// derive from this so no surface can show a price checkout won't charge.
export const ANNUAL_PRICE = {
  display: "$99.99",
  monthlyEquivalent: "$8.33",
  envKey: "STRIPE_PRICE_ANNUAL"
} as const;

export function resolveAnnualPrice(
  env: Partial<NodeJS.ProcessEnv> = process.env
): { priceId: string | null; display: string; monthlyEquivalent: string } {
  return {
    priceId: env[ANNUAL_PRICE.envKey] ?? null,
    display: ANNUAL_PRICE.display,
    monthlyEquivalent: ANNUAL_PRICE.monthlyEquivalent
  };
}

// Trial is the launch funnel (owner decision 2026-07-07): Day-1 free taste →
// Day-2 wall → 7-day trial → paid. `PAYWALL_MODE=legacy` is the explicit
// escape hatch back to the old 5-checks/day free tier, kept for rollback and
// for the legacy-mode test server.
export function paywallMode(env: Partial<NodeJS.ProcessEnv> = process.env): "legacy" | "trial" {
  return env.PAYWALL_MODE === "legacy" ? "legacy" : "trial";
}

// Single source for the human-readable monthly price of a stored variant. The
// price ladder lives only in VARIANTS (never hard-coded twice); callers that
// have a persisted `price_variant` (e.g. the pre-charge email) derive display
// from here. Unknown/null variants fall back to the default $12.99 variant.
// Returns the amount WITH its billing period ("$12.99/month", "$99.99/year")
// so the pre-charge email can't mislabel an annual charge as monthly.
export function priceVariantDisplay(variant: string | null | undefined): string {
  if (variant === "annual") {
    return `${ANNUAL_PRICE.display}/year`;
  }
  const monthly = (variant != null && variant in VARIANTS
    ? VARIANTS[variant as PriceVariant]
    : VARIANTS["1299"]
  ).display;
  return `${monthly}/month`;
}
