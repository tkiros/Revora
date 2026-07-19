import { describe, expect, it } from "vitest";

import {
  DEFAULT_EXPLORATION,
  STAGE_KEPT_UP_EXPLORATION,
  WEEKLY_LEARNING_COPY,
  WEEKLY_LEARNING_VERSION,
  assertWeeklyBankClaimFree,
  deriveWeeklyLearning,
  type WeeklyLearningInputs
} from "../../../lib/journey/weekly-learning";
import { assertNoForbiddenClaims } from "../../../lib/revora/postprocess";
import { loadSafetyContract } from "../../../lib/revora/safety-contract";

const WEEK_START = "2026-07-13";

function inputs(
  overrides: Partial<WeeklyLearningInputs> = {}
): WeeklyLearningInputs {
  return {
    checks: [],
    memories: [],
    stage: null,
    ...overrides
  };
}

describe("deriveWeeklyLearning — deterministic projection", () => {
  it("empty week: zeroes, no contexts, no repeats, default next exploration", () => {
    const artifact = deriveWeeklyLearning(inputs(), WEEK_START);
    expect(artifact).toEqual({
      version: WEEKLY_LEARNING_VERSION,
      weekStart: WEEK_START,
      mealsExplored: 0,
      savedChoices: 0,
      contextsCovered: [],
      repeatedUncertainty: [],
      incompleteSteps: [],
      nextExploration: DEFAULT_EXPLORATION
    });
  });

  it("fixed fixture inputs produce the exact expected artifact", () => {
    const artifact = deriveWeeklyLearning(
      inputs({
        checks: [
          { food: "white rice", risk: "MODERATE", wasClarified: false },
          { food: "White Rice ", risk: "SAFE", wasClarified: false },
          { food: "oatmeal", risk: "SAFE", wasClarified: true },
          { food: "oatmeal", risk: "SAFE", wasClarified: false },
          { food: "grilled salmon", risk: "SAFE", wasClarified: false }
        ],
        memories: [
          { label: "breakfast", favorite: true },
          { label: "lunch", favorite: false },
          { label: "breakfast", favorite: false }
        ],
        stage: 1
      }),
      WEEK_START
    );

    expect(artifact).toEqual({
      version: "1",
      weekStart: WEEK_START,
      // distinct normalized foods: white rice, oatmeal, grilled salmon
      mealsExplored: 3,
      savedChoices: 3,
      // deduped + canonical order (breakfast before lunch)
      contextsCovered: ["breakfast", "lunch"],
      // oatmeal: 2× with a clarification → uncertain; white rice: 2× with a
      // MODERATE card → uncertain. Ordered by normalized key ("oatmeal" < "white rice").
      repeatedUncertainty: ["oatmeal", "White Rice"],
      // stage 1, only saved 3 this week → save_three MET → no incomplete steps
      incompleteSteps: [],
      nextExploration: STAGE_KEPT_UP_EXPLORATION
    });
  });

  it("repeatedUncertainty excludes foods checked twice but always clear", () => {
    const artifact = deriveWeeklyLearning(
      inputs({
        checks: [
          { food: "apple", risk: "SAFE", wasClarified: false },
          { food: "apple", risk: "SAFE", wasClarified: false },
          { food: "cake", risk: "HIGH", wasClarified: false }
        ]
      }),
      WEEK_START
    );
    // apple: 2× but always clear, no clarify → not uncertain.
    // cake: HIGH but only once → not repeated.
    expect(artifact.repeatedUncertainty).toEqual([]);
  });

  it("stage 1 with fewer than three saved surfaces the incomplete step", () => {
    const artifact = deriveWeeklyLearning(
      inputs({
        memories: [{ label: "dinner", favorite: false }],
        stage: 1
      }),
      WEEK_START
    );
    expect(artifact.incompleteSteps).toEqual([
      "Save three meals this week to get comfortable reading the card."
    ]);
    expect(artifact.nextExploration).toBe(
      "Try saving one meal you eat often, so it is ready the next time you want it."
    );
  });

  it("stage drives which intent is evaluated (stage 4 = variety)", () => {
    const fourChecks = ["a", "b", "c", "d"].map((food) => ({
      food,
      risk: "SAFE" as const,
      wasClarified: false
    }));
    const artifact = deriveWeeklyLearning(
      inputs({ checks: fourChecks, stage: 4 }),
      WEEK_START
    );
    // 4 distinct foods < 5 → variety unmet.
    expect(artifact.incompleteSteps).toEqual([
      "Add a few new meals so your choices stay varied."
    ]);
  });
});

describe("determinism + versioning", () => {
  const fixture = inputs({
    checks: [
      { food: "Bagel", risk: "MODERATE", wasClarified: true },
      { food: "bagel", risk: "HIGH", wasClarified: false }
    ],
    memories: [{ label: "restaurant", favorite: true }],
    stage: 3
  });

  it("regeneration with the same inputs + version is byte-identical", () => {
    const a = JSON.stringify(deriveWeeklyLearning(fixture, WEEK_START));
    const b = JSON.stringify(deriveWeeklyLearning(fixture, WEEK_START));
    expect(a).toBe(b);
  });

  it("output order is independent of input row order", () => {
    const reversed = inputs({
      checks: [...fixture.checks].reverse(),
      memories: [...fixture.memories].reverse(),
      stage: 3
    });
    expect(deriveWeeklyLearning(reversed, WEEK_START)).toEqual(
      deriveWeeklyLearning(fixture, WEEK_START)
    );
  });

  it("the version is stamped onto the artifact and overridable", () => {
    expect(deriveWeeklyLearning(fixture, WEEK_START).version).toBe("1");
    expect(deriveWeeklyLearning(fixture, WEEK_START, "9").version).toBe("9");
  });
});

describe("no forbidden clinical claims in the fixed bank", () => {
  const contract = loadSafetyContract();

  it("every bank string passes the model banned-claims regexes", () => {
    for (const copy of WEEKLY_LEARNING_COPY) {
      expect(() => assertNoForbiddenClaims(contract, [copy])).not.toThrow();
    }
  });

  it("assertWeeklyBankClaimFree passes over the whole bank", () => {
    expect(() => assertWeeklyBankClaimFree(contract)).not.toThrow();
  });

  it("the bank has copy for all five stages plus the two defaults", () => {
    // 5 intents × (incomplete + exploration) + 2 defaults = 12 strings.
    expect(WEEKLY_LEARNING_COPY).toHaveLength(12);
    expect(WEEKLY_LEARNING_COPY).toContain(DEFAULT_EXPLORATION);
    expect(WEEKLY_LEARNING_COPY).toContain(STAGE_KEPT_UP_EXPLORATION);
  });
});
