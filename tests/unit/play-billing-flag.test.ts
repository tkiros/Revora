import { describe, expect, it } from "vitest";

import { playBillingEnabled } from "../../lib/play-billing-flag";

describe("playBillingEnabled", () => {
  it("fails closed unless an operator explicitly sets exact 1", () => {
    expect(playBillingEnabled({})).toBe(false);
    expect(playBillingEnabled({ NEXT_PUBLIC_PLAY_BILLING: "0" })).toBe(false);
    expect(playBillingEnabled({ NEXT_PUBLIC_PLAY_BILLING: "true" })).toBe(false);
    expect(playBillingEnabled({ NEXT_PUBLIC_PLAY_BILLING: "1" })).toBe(true);
  });
});
