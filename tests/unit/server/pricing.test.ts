import { describe, expect, it } from "vitest";
import { resolvePriceVariant } from "../../../lib/server/pricing";

describe("resolvePriceVariant", () => {
  it("defaults to 1299", () => {
    expect(resolvePriceVariant({}).variant).toBe("1299");
    expect(resolvePriceVariant({}).display).toBe("$12.99");
  });
  it("resolves the env-selected variant and its price id", () => {
    const r = resolvePriceVariant({
      TRIAL_PRICE_VARIANT: "1999",
      STRIPE_PRICE_MONTHLY_1999: "price_x"
    });
    expect(r).toEqual({ variant: "1999", priceId: "price_x", display: "$19.99" });
  });
  it("falls back to 1299 on an unknown variant value", () => {
    expect(resolvePriceVariant({ TRIAL_PRICE_VARIANT: "699" }).variant).toBe("1299");
  });
});
