import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  capabilitiesFor,
  PREMIUM_CAPABILITY_KEYS,
  type Capabilities
} from "../../../lib/server/capabilities";
import type { Entitlement } from "../../../lib/server/entitlement";

const ROOT = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

/**
 * Paywall truth (plan §P2.4 "Remove paywall promises that do not exist").
 *
 * The claims audit catches copy that says a forbidden thing; it cannot catch a
 * paywall bullet that promises a real-sounding capability the product does not
 * actually gate behind Premium. "Weekly insights from your own meals" was
 * exactly that — the thin insight is FREE onboarding value, and the genuinely
 * Premium weekly artifact ships flagged-off in T18. So this pins the wall's
 * bullets to the ONE capability matrix: every bullet must name a capability the
 * matrix marks premium-true today, and nothing may promise a flag-gated feature
 * that has not shipped.
 */

const FREE: Entitlement = {
  tier: "free",
  source: null,
  status: "none",
  currentPeriodEnd: null
};
const PREMIUM: Entitlement = {
  tier: "premium",
  source: "stripe",
  status: "premium",
  currentPeriodEnd: new Date("2026-08-01T00:00:00.000Z")
};

// Each paywall bullet, mapped to the capability it sells. A bullet with no
// mapping here is an unaudited promise — the test fails until it is mapped and
// the capability is proven premium-true.
const BULLET_CAPABILITY: { match: RegExp; key: keyof Capabilities }[] = [
  { match: /unlimited daily checks/i, key: "dailyChecks" },
  { match: /full history/i, key: "historyDays" },
  { match: /progress view/i, key: "progress" },
  { match: /daily reminder/i, key: "nudges" }
];

function paywallBullets(): string[] {
  const src = read("components/paywall-card.tsx");
  const ul = src.match(
    /<ul className="page-copy expectation-list">([\s\S]*?)<\/ul>/
  );
  expect(ul, "paywall-card must render the expectation-list bullets").not.toBeNull();
  return [...ul![1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) =>
    m[1].replace(/\s+/g, " ").trim()
  );
}

describe("paywall bullets only promise premium-true capabilities", () => {
  it("with flags off, the flag-gated features are NOT premium-true", () => {
    // The guard: if a future flag flip made weeklyLearning true for premium,
    // it would become a legitimate bullet — but today it must be off, which is
    // exactly why the wall may not promise it.
    const premium = capabilitiesFor(PREMIUM, {});
    expect(premium.weeklyLearning).toBe(false);
    expect(premium.mealMemory).toBe(false);
  });

  it("every rendered bullet maps to a capability free lacks and premium has", () => {
    const free = capabilitiesFor(FREE, {});
    const premium = capabilitiesFor(PREMIUM, {});
    const bullets = paywallBullets();
    expect(bullets.length).toBeGreaterThan(0);

    for (const bullet of bullets) {
      const mapping = BULLET_CAPABILITY.find((m) => m.match.test(bullet));
      expect(mapping, `unaudited paywall bullet: "${bullet}"`).toBeDefined();
      const key = mapping!.key;
      // A genuine upgrade: free does not have it, premium does, and it is in
      // the canonical premium set.
      expect(free[key], `${key} must differ for free`).not.toBe(premium[key]);
      expect(
        (PREMIUM_CAPABILITY_KEYS as readonly string[]).includes(key)
      ).toBe(true);
    }
  });

  it("no unshipped promise appears in the wall copy or its imports", () => {
    const src = read("components/paywall-card.tsx");
    // The removed bullet, and the flag that used to gate it.
    expect(src).not.toMatch(/weekly insights from your own meals/i);
    expect(src).not.toMatch(/longitudinal-insights-flag/);
    expect(src).not.toMatch(/longitudinalInsightsEnabled/);
  });

  it("premium-pitch surfaces no longer promise a premium weekly insight", () => {
    // The four surfaces T10 audited (welcome/page keeps its data-processing
    // consent line — personalized insight is a real free feature there, not a
    // paid promise, so it is deliberately excluded from this list).
    for (const rel of [
      "components/paywall-card.tsx",
      "components/trial-wall.tsx",
      "app/(app)/account/page.tsx",
      "app/(app)/subscribe/page.tsx"
    ]) {
      const src = read(rel);
      expect(src, `${rel} still promises weekly patterns`).not.toMatch(
        /weekly patterns|weekly insights/i
      );
    }
  });
});
