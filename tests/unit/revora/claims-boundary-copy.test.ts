import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { loadSafetyContract } from "../../../lib/revora/safety-contract";

const ROOT = process.cwd();
const contract = loadSafetyContract();

// Banned claim families from docs/safety/claims-boundary.md "Banned Claim
// Families". Word-bounded so innocent substrings (secure, retreat, create,
// prediabetes, diabetes) never trip the scan.
const BANNED: Array<{ label: string; pattern: RegExp }> = [
  // Stems cover inflections — "reversal"/"reversing" are the highest-risk
  // prediabetes terms and must be caught, not just "reverse".
  { label: "reverse", pattern: /\brevers(?:e|es|ed|ing|al|als)\b/i },
  { label: "cure", pattern: /\bcur(?:e|es|ed|ing)\b/i },
  { label: "treat", pattern: /\btreat(?:s|ed|ing|ment|ments)?\b/i },
  { label: "prevent", pattern: /\bprevent(?:s|ed|ing|ion|ive|ative)?\b/i },
  { label: "diagnose", pattern: /\bdiagnos(?:e|es|ed|ing|is|tic|tics)\b/i },
  { label: "FDA", pattern: /\bFDA\b/i },
  { label: "guarantee", pattern: /\bguarantee(?:s|d|ing)?\b/i },
  { label: "future-claim", pattern: /\bwill\s+(?:lower|prevent)\b/i }
];

function scan(text: string): string[] {
  return BANNED.filter(({ pattern }) => pattern.test(text)).map(
    ({ label }) => label
  );
}

// User-facing copy sources (whole source text is scanned). Prompt-internal
// snippets are excluded on purpose: they legitimately negate banned terms
// ("do not diagnose"), and their correctness is governed by the safety-contract
// fixture tests, not by this user-facing audit.
const COPY_FILES = [
  "app/api/check/route.ts",
  "app/page.tsx",
  "app/privacy/page.tsx",
  "app/terms/page.tsx",
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
  "app/get-the-app/page.tsx",
  "app/account/page.tsx",
  "app/canceled/page.tsx",
  "app/account/delete/page.tsx",
  "app/signin/page.tsx",
  "app/signin/check-email/page.tsx",
  "app/welcome/page.tsx",
  "app/progress/page.tsx",
  "app/how-it-works/page.tsx",
  "app/pantry/thanks/page.tsx",
  "lib/revora/fallback.ts",
  "lib/revora/coach-outputs.ts",
  "lib/coach/insights.ts",
  "lib/coach/bai.ts",
  "lib/client/ui-state.ts",
  "lib/server/pantry/emails.ts",
  "lib/server/billing/emails.ts"
];

// The single approved user-as-agent line (docs/product-marketing.md; counsel
// Q8 tracks the app-as-agent variants). It is the ONLY sanctioned use of the
// "reversal" family in product copy; the onboarding surface is scanned with
// exactly this sentence removed (whitespace-normalized so JSX wrapping cannot
// dodge the audit) — everything else on the page stays audited.
const APPROVED_NORTH_STAR_LINE =
  "Reversal is achieved through your dietary choices — Revora gives you the clarity to make them.";

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ");
}

const CARVE_OUT_FILES: Array<{ file: string; approved: string[] }> = [
  { file: "app/onboarding/page.tsx", approved: [APPROVED_NORTH_STAR_LINE] }
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
  ...CARVE_OUT_FILES.map(({ file, approved }) => {
    let text = normalizeWhitespace(fs.readFileSync(path.join(ROOT, file), "utf8"));
    for (const line of approved) {
      const normalized = normalizeWhitespace(line);
      // The approved line must actually be present verbatim — a silent drift
      // in the North Star copy should fail here, not pass unnoticed.
      if (!text.includes(normalized)) {
        throw new Error(
          `${file} no longer contains the approved line: "${line}"`
        );
      }
      text = text.split(normalized).join("");
    }
    return { source: `${file} (minus approved lines)`, text };
  }),
  ...USER_FACING_COPY_KEYS.map((key) => ({
    source: `contract.copy.${key}`,
    text: contract.copy[key]
  }))
];

describe("claims-boundary copy audit", () => {
  it.each(surfaces)("$source stays inside the claims boundary", ({ text }) => {
    expect(scan(text)).toEqual([]);
  });

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
    "future-claim": "this will lower your A1C"
  };

  it.each(Object.entries(KNOWN_BAD))(
    "flags the %s family",
    (label, sample) => {
      expect(scan(sample)).toContain(label);
    }
  );
});
