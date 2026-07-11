import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { TASTER_LIMIT } from "../../../lib/client/taster-store";
import { RISK_LABELS } from "../../../lib/revora/labels";

const ROOT = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

/**
 * The paste-in regions of a fenced doc (see claims-boundary-copy.test.ts).
 * Fence integrity — balanced, non-empty — is asserted there, so this can just
 * extract.
 */
function fenced(text: string): string {
  const out: string[] = [];
  const re = /<!-- claims-audit:start -->([\s\S]*?)<!-- claims-audit:end -->/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) out.push(m[1]);
  return out.join("\n\n");
}

/**
 * Copy pins — the numbers and words in the copy must BE the constants, not
 * agree with them by hand.
 *
 * The claims audit (claims-boundary-copy.test.ts) catches copy that says a
 * forbidden thing. It cannot catch copy that says a TRUE-shaped thing which
 * happens to be false — "five checks a day" is not a banned phrase, it is just
 * wrong. That gap is where F-07 lived, and it produced three different answers
 * to "how much is free?" across the product:
 *
 *   lib/client/taster-store.ts  TASTER_LIMIT = 10, day-1 only, device-local  ← the truth
 *   app/page.tsx                "your first day of checks is free" (no number, implies unmetered)
 *   docs/ops/play-listing.md    "Free, every day … five a day"               ← a false store claim
 *   lib/server/entitlement.ts   FREE_DAILY_CHECKS = 5                        ← the LEGACY paywall path
 *
 * The last one is the trap: 5 is a real constant, it is just not the one a
 * store user meets. Copy that is hand-synced to a constant drifts the moment
 * either side moves — so these tests assert the copy is DERIVED, by requiring
 * the literal `String(TASTER_LIMIT)` to appear in the exact phrase each surface
 * renders, and by requiring the source to import the constant rather than
 * retype the digits.
 *
 * Same argument for the three verdict words. They were copy-pasted into three
 * files until N-20; relabeling is a product + dietitian decision (F-08 / W-15),
 * and a relabel that lands on two surfaces and misses the third is worse than
 * no relabel at all.
 */

describe("free-tier copy is derived from TASTER_LIMIT", () => {
  // Guard the guard: if TASTER_LIMIT ever became, say, 1, several of the
  // phrase assertions below would still pass while reading like nonsense
  // ("1 free checks"). Pin the shape of the world these tests assume.
  it("TASTER_LIMIT is a plural, day-1 count", () => {
    expect(TASTER_LIMIT).toBeGreaterThan(1);
    expect(Number.isInteger(TASTER_LIMIT)).toBe(true);
  });

  it("the landing page imports the constant instead of retyping the number", () => {
    const src = read("app/page.tsx");
    expect(src).toMatch(/import\s*\{[^}]*TASTER_LIMIT[^}]*\}\s*from\s*["'].*taster-store["']/);
    // Every free-tier claim on the page interpolates it.
    expect(src).toContain("{TASTER_LIMIT} free checks on your first");
    expect(src).toContain("{TASTER_LIMIT} free checks on day one");
    expect(src).toContain("Check up to {TASTER_LIMIT} meals on your first day");
    expect(src).toContain("Your first {TASTER_LIMIT} checks, on your first day");
  });

  it("the landing page no longer implies an unmetered free day", () => {
    const src = read("app/page.tsx");
    // The three exact phrasings F-07 found. Each implied "check as much as you
    // like on day one", which is false at check number 11.
    expect(src).not.toMatch(/your first day of checks is free/i);
    expect(src).not.toMatch(/check your meals all day/i);
    expect(src).not.toMatch(/free taste/i);
  });

  it("the Play listing states the same number as the code", () => {
    // Only the FENCED region — the text that actually gets pasted into Play
    // Console. The un-fenced prose deliberately quotes the old false claim
    // ("five a day") in its historical note, because a fix you cannot see the
    // shape of is a fix that gets undone. Asserting over the whole file would
    // force us to delete that record to make the test pass, which is exactly
    // backwards.
    const listing = fenced(read("docs/ops/play-listing.md"));
    expect(listing).toContain(`${TASTER_LIMIT} free checks on your first day`);
    // The false store claim, in the two forms it took.
    expect(listing).not.toMatch(/five a day/i);
    expect(listing).not.toMatch(/\bfree,?\s+every\s+day\b/i);
  });

  it("no user-facing surface writes the legacy FREE_DAILY_CHECKS number as the taster limit", () => {
    // lib/server/entitlement.ts FREE_DAILY_CHECKS = 5 is the LEGACY paywall path
    // (PAYWALL_MODE=legacy). components/paywall-card.tsx and result-card.tsx may
    // still render "five" from it — they only render in legacy mode, and
    // result-card-upsell.test.ts pins them together. What must never happen
    // again is a TRIAL-mode surface (the landing page, the store listing, the
    // onboarding flow) quoting the legacy number as the free tier.
    for (const rel of [
      "app/page.tsx",
      "app/(app)/onboarding/page.tsx",
      "docs/ops/play-listing.md"
    ]) {
      // Fenced docs are judged on their paste-in text only; their editorial
      // notes are allowed to name the mistake they are recording.
      const src = rel.endsWith(".md") ? fenced(read(rel)) : read(rel);
      expect(src, `${rel} must not quote the legacy 5-a-day free tier`).not.toMatch(
        /\b(?:five|5)\s+(?:free\s+)?checks?\s+(?:a|per|each)\s+day\b/i
      );
    }
  });
});

describe("RISK_LABELS is the only source of the three verdict words", () => {
  it("holds the labels the product actually ships", () => {
    // A relabel is a product + dietitian decision (F-08 / W-15). Changing these
    // three strings should require changing this line — deliberately.
    expect(RISK_LABELS).toEqual({
      SAFE: "Clear",
      MODERATE: "Be careful",
      HIGH: "Hold off"
    });
  });

  /**
   * Surfaces that render a verdict word must interpolate it from labels.ts.
   *
   * ALLOWLIST — two files still hard-code the words. Both are owned by another
   * lane in the 2026-07-11 remediation and are NOT safe for this lane to edit
   * concurrently; both are recorded in the Lane C handoff for follow-up. They
   * are listed here, loudly, rather than quietly excluded from the walk — an
   * allowlist you can see is a to-do; a coverage gap you cannot see is a bug.
   *
   *   components/demo-check-card.tsx  — hard-codes "Be careful"
   *   components/dashboard-view.tsx   — hard-codes all three in the week legend
   *
   * Do not add to this list to make a failure go away. Import RISK_LABELS.
   */
  const ALLOWLIST = new Set([
    "components/demo-check-card.tsx",
    "components/dashboard-view.tsx"
  ]);

  const LABEL_LITERAL = new RegExp(
    `(?:^|[>"'\\s])(?:${Object.values(RISK_LABELS)
      .map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")})(?:$|[<"'.,\\s])`
  );

  function walk(dir: string, out: string[] = []): string[] {
    for (const entry of fs.readdirSync(path.join(ROOT, dir), {
      withFileTypes: true
    })) {
      const rel = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(rel, out);
      else if (entry.name.endsWith(".tsx")) out.push(rel);
    }
    return out;
  }

  const renderFiles = [...walk("app"), ...walk("components")]
    .filter((rel) => !rel.startsWith("app/video-engine/"))
    .filter((rel) => !ALLOWLIST.has(rel));

  it.each(renderFiles)(
    "%s renders verdict words only via RISK_LABELS",
    (rel) => {
      // Strip comment lines — prose ABOUT the labels is fine, rendering them is not.
      const body = read(rel)
        .split("\n")
        .filter((line) => !/^\s*(?:\/\/|\/\*|\*)/.test(line))
        .join("\n");

      const hardcoded = LABEL_LITERAL.test(body);
      if (!hardcoded) return;

      expect(
        body,
        `${rel} hard-codes a verdict word. Import RISK_LABELS from lib/revora/labels instead.`
      ).toMatch(/from\s+["'].*revora\/labels["']/);
    }
  );

  it("the surfaces the ledger cares about all import from labels.ts", () => {
    // The three that N-20 found copy-pasted, plus the two marketing surfaces
    // this lane converted. If any of these silently stops importing, a relabel
    // will miss it — the exact failure N-20 was raised to prevent.
    for (const rel of [
      "components/result-card.tsx",
      "components/today-list.tsx",
      "app/(app)/history/page.tsx",
      "app/page.tsx",
      "app/(app)/onboarding/page.tsx"
    ]) {
      expect(read(rel), `${rel} must import RISK_LABELS`).toMatch(
        /from\s+["'].*revora\/labels["']/
      );
    }
  });

  it("the allowlist only shrinks", () => {
    // A ratchet. If someone fixes demo-check-card, this fails until they remove
    // it from the allowlist — so the list can never quietly grow stale.
    expect(ALLOWLIST.size).toBeLessThanOrEqual(2);
    for (const rel of ALLOWLIST) {
      expect(
        read(rel),
        `${rel} now imports RISK_LABELS — remove it from ALLOWLIST.`
      ).not.toMatch(/from\s+["'].*revora\/labels["']/);
    }
  });
});
