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

export function paywallMode(env: Partial<NodeJS.ProcessEnv> = process.env): "legacy" | "trial" {
  return env.PAYWALL_MODE === "trial" ? "trial" : "legacy";
}
