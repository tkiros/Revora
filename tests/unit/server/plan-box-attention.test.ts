import { describe, expect, it } from "vitest";

import { planBoxAttention } from "../../../lib/server/plan-box";

/**
 * C7 eng-review D2: Home renders the plan box ONLY when it carries actionable
 * billing truth — a running trial or a scheduled non-renewal. Steady premium
 * and the free tier stay sidebar/account-only.
 */
describe("planBoxAttention", () => {
  it("shows for a running trial", () => {
    expect(
      planBoxAttention({ tier: "premium", status: "trialing", cancelAtPeriodEnd: false })
    ).toBe(true);
  });

  it("shows for a scheduled non-renewal", () => {
    expect(
      planBoxAttention({ tier: "premium", status: "active", cancelAtPeriodEnd: true })
    ).toBe(true);
  });

  it("hides for steady premium", () => {
    expect(
      planBoxAttention({ tier: "premium", status: "active", cancelAtPeriodEnd: false })
    ).toBe(false);
  });

  it("hides for the free tier, whatever the flags say", () => {
    expect(planBoxAttention({ tier: "free" })).toBe(false);
    expect(
      planBoxAttention({ tier: "free", status: "trialing", cancelAtPeriodEnd: true })
    ).toBe(false);
  });
});
