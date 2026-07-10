import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { loadSafetyContract } from "../../../lib/revora/safety-contract";

const ROOT = process.cwd();
const contract = loadSafetyContract();

// Banned claim families from docs/safety/claims-boundary.md "Banned Claim
// Families". Word-bounded so innocent substrings (secure, retreat, create,
// prediabetes, diabetes) never trip the scan.
const BANNED: Array<{
  label: string;
  pattern: RegExp;
  exemptSources?: string[];
}> = [
  // Stems cover inflections — "reversal"/"reversing" are the highest-risk
  // prediabetes terms and must be caught, not just "reverse".
  { label: "reverse", pattern: /\brevers(?:e|es|ed|ing|al|als)\b/i },
  { label: "cure", pattern: /\bcur(?:e|es|ed|ing)\b/i },
  { label: "treat", pattern: /\btreat(?:s|ed|ing|ment|ments)?\b/i },
  { label: "prevent", pattern: /\bprevent(?:s|ed|ing|ion|ive|ative)?\b/i },
  { label: "diagnose", pattern: /\bdiagnos(?:e|es|ed|ing|is|tic|tics)\b/i },
  { label: "FDA", pattern: /\bFDA\b/i },
  { label: "guarantee", pattern: /\bguarantee(?:s|d|ing)?\b/i },
  { label: "future-claim", pattern: /\bwill\s+(?:lower|prevent)\b/i },
  // Numeric banned families (claims-boundary.md "Banned Claim Families":
  // exact mg/dL spike claims, exact GI/GL numbers, glucose-percentage
  // figures). Added 2026-07-06 — launch audit BUG-08.
  { label: "mg/dL", pattern: /\bmg\s*\/\s*dl\b/i },
  {
    label: "gi-gl-number",
    // A GI/GL term with a directly attached number ("glycemic index of 73",
    // "GI: 55", "73 GI"). Kept tight so prose that merely names the concept
    // ("No GI/GL numbers anywhere") never trips the scan.
    pattern:
      /\b(?:glycemic\s+(?:index|load)|GI|GL)\b\s*(?:of|is|=|:)?\s*\d|\b\d+(?:\.\d+)?\s*(?:GI|GL)\b/i
  },
  {
    label: "glucose-percent",
    pattern: /\d+\s*%[^.!?]{0,80}?\bglucose\b|\bglucose\b[^.!?]{0,80}?\d+\s*%/i,
    // The behavior-science citation block is the single approved home for
    // published-study percentages ("29% reduction in post-meal glucose
    // spikes", Imai 2023) — hedged, attributed, and explicitly framed as not
    // describing Revora's users (audit-reviewed 2026-07-06; counsel glance
    // recommended, no action forced). Everything else on the page stays
    // audited for this family via the other patterns and files.
    exemptSources: ["app/(app)/how-it-works/page.tsx"]
  }
];

function scan(text: string, source?: string): string[] {
  return BANNED.filter(
    ({ pattern, exemptSources }) =>
      !(source && exemptSources?.includes(source)) && pattern.test(text)
  ).map(({ label }) => label);
}

// User-facing copy sources (whole source text is scanned). Prompt-internal
// snippets are excluded on purpose: they legitimately negate banned terms
// ("do not diagnose"), and their correctness is governed by the safety-contract
// fixture tests, not by this user-facing audit.
const COPY_FILES = [
  "app/api/check/route.ts",
  "app/(app)/demo/page.tsx",
  "app/onboarding/page.tsx",
  "app/page.tsx",
  "app/check/page.tsx",
  "app/(app)/privacy/page.tsx",
  "app/(app)/terms/page.tsx",
  "app/history/page.tsx",
  "components/food-check-form.tsx",
  "components/nudge-opt-in.tsx",
  "components/result-card.tsx",
  "components/demo-check-card.tsx",
  "components/request-status.tsx",
  "components/daily-loop.tsx",
  "components/today-list.tsx",
  "components/streak-chip.tsx",
  "components/insight-card.tsx",
  "components/voice-input-button.tsx",
  "components/paywall-card.tsx",
  "components/trial-wall.tsx",
  "components/reviewer-signin-form.tsx",
  "components/print-button.tsx",
  "app/report/[id]/page.tsx",
  "app/subscribe/page.tsx",
  "app/trial/started/page.tsx",
  "app/(app)/get-the-app/page.tsx",
  "app/account/page.tsx",
  "app/canceled/page.tsx",
  "app/account/delete/page.tsx",
  "app/signin/page.tsx",
  "app/signin/check-email/page.tsx",
  "app/welcome/page.tsx",
  "app/progress/page.tsx",
  "app/(app)/how-it-works/page.tsx",
  "app/pantry/page.tsx",
  "app/pantry/thanks/page.tsx",
  "components/pantry-buy-button.tsx",
  "components/photo-input-button.tsx",
  "components/photo-draft-review.tsx",
  "components/disclaimer-line.tsx",
  "app/api/check/photo-draft/route.ts",
  "lib/client/photo-draft.ts",
  "lib/revora/fallback.ts",
  "lib/revora/coach-outputs.ts",
  "lib/coach/insights.ts",
  "lib/coach/bai.ts",
  "lib/client/ui-state.ts",
  "lib/server/pantry/emails.ts",
  "lib/server/billing/emails.ts"
];

// User-facing contract copy only. The disclaimer is excluded — it is the single
// approved home for "not medical advice"; prompt snippets are excluded as above.
const USER_FACING_COPY_KEYS = [
  "productHomeHero",
  "clarificationExample",
  "nonFoodRefusal",
  "belowRangeRoute",
  "highRangeRoute"
] as const;

const surfaces = [
  ...COPY_FILES.map((rel) => ({
    source: rel,
    text: fs.readFileSync(path.join(ROOT, rel), "utf8")
  })),
  ...USER_FACING_COPY_KEYS.map((key) => ({
    source: `contract.copy.${key}`,
    text: contract.copy[key]
  }))
];

describe("claims-boundary copy audit", () => {
  it.each(surfaces)(
    "$source stays inside the claims boundary",
    ({ source, text }) => {
      expect(scan(text, source)).toEqual([]);
    }
  );

  // One known-bad sample per family, so a typo in any pattern fails loudly
  // (a single combined control would hide a broken pattern for the rest).
  const KNOWN_BAD: Record<string, string> = {
    reverse: "supports prediabetes reversal",
    cure: "this will help cure prediabetes",
    treat: "a way to treat your blood sugar",
    prevent: "preventive care for prediabetes",
    diagnose: "Revora can diagnose prediabetes",
    FDA: "fda cleared for prediabetes",
    guarantee: "results are guaranteed",
    "future-claim": "this will lower your A1C",
    "mg/dL": "keeps you under 140 mg/dL",
    "gi-gl-number": "white rice has a glycemic index of 73",
    "glucose-percent": "cuts your glucose spikes by 40%"
  };

  it.each(Object.entries(KNOWN_BAD))(
    "flags the %s family",
    (label, sample) => {
      expect(scan(sample)).toContain(label);
    }
  );
});
