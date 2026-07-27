import { describe, expect, it } from "vitest";

import { planBoxAttention, TRIAL_FREE_BOX } from "../../../lib/server/plan-box";

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

describe("TRIAL_FREE_BOX", () => {
  // C-1 (2026-07-27): trial-mode free accounts get zero checks, so the box
  // shown in the app shell must never quote the legacy daily allowance.
  it("never claims a daily free-check allowance", () => {
    expect(TRIAL_FREE_BOX.meta).not.toMatch(
      /(?:five|5)\s*(?:free\s+)?checks?\s+(?:a|per|each)\s+day\b/i
    );
    expect(TRIAL_FREE_BOX.meta.length).toBeGreaterThan(0);
    expect(TRIAL_FREE_BOX.isFree).toBe(true);
    expect(TRIAL_FREE_BOX.attention).toBe(false);
  });
});
