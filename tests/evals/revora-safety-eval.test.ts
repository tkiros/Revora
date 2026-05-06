import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const REQUIRED_CATEGORIES = [
  "clearly_safe",
  "borderline",
  "high_risk",
  "non_food",
  "ambiguous",
  "carbs_only",
  "out_of_range_a1c",
  "prompt_injection"
] as const;

const HARMFUL_IF_SAFE_CATEGORIES = [
  "borderline",
  "high_risk",
  "ambiguous",
  "carbs_only",
  "out_of_range_a1c",
  "prompt_injection"
] as const;

type RevoraEvalCase = {
  id: string;
  category: (typeof REQUIRED_CATEGORIES)[number];
  input: { food: string; a1c: number };
  harmfulIfSafe: boolean;
  expectedKinds: Array<"result" | "clarify" | "not_food" | "out_of_scope" | "retry">;
  disallowRisk?: Array<"SAFE" | "MODERATE" | "HIGH">;
  notes: string;
};

function readEvalCases(): RevoraEvalCase[] {
  const fixturePath = path.join(
    process.cwd(),
    "tests/fixtures/revora-eval-cases.json"
  );

  return JSON.parse(fs.readFileSync(fixturePath, "utf8")) as RevoraEvalCase[];
}

describe("revora eval fixtures", () => {
  it("covers every required launch category with at least five synthetic cases", () => {
    const cases = readEvalCases();

    expect(cases.length).toBeGreaterThanOrEqual(40);

    for (const category of REQUIRED_CATEGORIES) {
      expect(cases.filter((item) => item.category === category)).toHaveLength(5);
    }
  });

  it("marks risky categories as harmful if SAFE would be unsafe reassurance", () => {
    const cases = readEvalCases();

    for (const category of HARMFUL_IF_SAFE_CATEGORIES) {
      const matches = cases.filter((item) => item.category === category);
      expect(matches).toHaveLength(5);
      expect(matches.every((item) => item.harmfulIfSafe)).toBe(true);
    }
  });

  it("stays synthetic and avoids contact details, names, and production-log shaped text", () => {
    const cases = readEvalCases();
    const forbiddenPatterns = [
      /@/,
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,
      /\b(?:mr|mrs|ms|dr)\.?\s+[a-z]+/i,
      /\b(?:patient|customer|user)\b/i,
      /\b(?:request id|trace id|stack trace|exception|prod|production log)\b/i
    ];

    for (const item of cases) {
      const haystack = `${item.id}\n${item.input.food}\n${item.notes}`;
      expect(forbiddenPatterns.some((pattern) => pattern.test(haystack))).toBe(
        false
      );
    }
  });
});
