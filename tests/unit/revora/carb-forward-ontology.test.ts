import { describe, expect, it } from "vitest";

import {
  CARB_FORWARD_EXCLUSIONS,
  CARB_FORWARD_POLICY_VERSION,
  CARB_FORWARD_TOKENS,
  isCarbForward
} from "../../../lib/revora/input-precheck";

describe("CARB_FORWARD_TOKENS review surface", () => {
  it("has an explicit version and exported bounded vocabulary for panel review", () => {
    expect(CARB_FORWARD_POLICY_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}\.\d+$/);
    expect(CARB_FORWARD_TOKENS.length).toBeGreaterThan(30);
    expect(CARB_FORWARD_EXCLUSIONS.length).toBeGreaterThan(0);
    expect(new Set(CARB_FORWARD_TOKENS).size).toBe(CARB_FORWARD_TOKENS.length);
  });

  it.each([
    "salmon avocado sushi roll",
    "rice and dal",
    "jollof rice and chicken",
    "congee with egg",
    "naan with chana masala",
    "bean and rice burrito"
  ])("recognizes a culturally varied candidate carb-forward dish: %s", (food) => {
    expect(isCarbForward(food)).toBe(true);
  });

  it.each([
    "cauliflower rice bowl",
    "konjac rice with tofu",
    "shirataki noodles with vegetables",
    "lettuce wrap with chicken",
    "sweet potato and salmon"
  ])("honors a reviewed exclusion candidate: %s", (food) => {
    expect(isCarbForward(food)).toBe(false);
  });
});
