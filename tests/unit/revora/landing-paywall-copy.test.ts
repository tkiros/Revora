import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const src = fs.readFileSync(
  path.join(process.cwd(), "app/page.tsx"),
  "utf8"
);

/**
 * §0.2 #4 — landing copy vs live config. The landing's pricing section must
 * render from the SAME server flags checkout enforces (paywallMode +
 * resolvePriceVariant) so it cannot promise a funnel or a price the deploy
 * doesn't run. Runtime proof lives in the two mode-pinned e2e servers
 * (billing-pages.spec.ts on legacy :3100, trial-wall.spec.ts on trial :3101);
 * these pins keep the mechanism itself from regressing.
 */
describe("landing pricing derives from the live paywall config", () => {
  it("imports the mode and price from lib/server/pricing", () => {
    expect(src).toMatch(
      /import\s*\{[^}]*paywallMode[^}]*\}\s*from\s*["'].*server\/pricing["']/
    );
    expect(src).toMatch(/resolvePriceVariant/);
    expect(src).toContain('paywallMode() === "trial"');
  });

  it("never hard-codes a monthly price the checkout might not charge", () => {
    // The variant ladder is $9.99/$12.99/$19.99 (lib/server/pricing.ts) —
    // display must interpolate resolvePriceVariant().display, never a digit.
    expect(src).not.toMatch(/\$(?:9|12|19)\.99/);
    expect(src).toContain("{monthlyPrice}/month");
  });

  it("carries both funnel branches so either mode renders true copy", () => {
    // Trial branch
    expect(src).toContain("7 days free");
    expect(src).toContain("Days 2–8");
    // Legacy branch
    expect(src).toContain("A free account");
    expect(src).toContain("still no card");
  });
});
