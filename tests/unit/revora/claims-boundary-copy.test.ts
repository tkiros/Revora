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
  "app/page.tsx",
  "app/privacy/page.tsx",
  "components/food-check-form.tsx",
  "components/result-card.tsx",
  "components/request-status.tsx",
  "lib/revora/fallback.ts",
  "lib/revora/coach-outputs.ts",
  "lib/client/ui-state.ts"
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
