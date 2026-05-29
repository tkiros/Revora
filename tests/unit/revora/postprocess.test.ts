import { describe, expect, it } from "vitest";

import { routeA1C } from "../../../lib/revora/a1c";
import { buildCarbsOnlyResponse } from "../../../lib/revora/fallback";
import {
  RevoraContractError,
  applyConservativeFloors,
  assertModerateHighFields,
  assertNoUnsafeSafeFields,
  assertOneSentence,
  postprocessModelOutput
} from "../../../lib/revora/postprocess";
import { loadSafetyContract } from "../../../lib/revora/safety-contract";
import type { RevoraModelOutput } from "../../../lib/revora/schemas";

const contract = loadSafetyContract();

function makeModelOutput(
  overrides: Partial<RevoraModelOutput> = {}
): RevoraModelOutput {
  return {
    kind: "result",
    risk: "MODERATE",
    reason:
      "This may have a higher blood-sugar impact because it leans heavily on refined carbs.",
    adjustment:
      "If practical, add protein or nonstarchy vegetables to make it easier to handle.",
    swap: "If you have the option, swap to a less refined version.",
    question: null,
    examples: [],
    policy_flags: ["borderline"],
    ...overrides
  };
}

describe("postprocessModelOutput", () => {
  it("keeps in-scope result risks inside SAFE, MODERATE, or HIGH", () => {
    const response = postprocessModelOutput(makeModelOutput(), {
      contract,
      route: routeA1C(6.1),
      precheckFlags: []
    });

    expect(response.kind).toBe("result");
    expect(["SAFE", "MODERATE", "HIGH"]).toContain(response.risk);
  });

  it("rejects a multi-sentence reason field", () => {
    expect(() =>
      assertOneSentence(
        "reason",
        "This looks balanced. It also has enough protein."
      )
    ).toThrow(RevoraContractError);
  });

  it("rejects SAFE outputs with adjustment or swap fields", () => {
    expect(() =>
      assertNoUnsafeSafeFields({
        risk: "SAFE",
        reason: "This looks like a reasonable fit.",
        adjustment: "Take a walk after eating it.",
        swap: null
      })
    ).toThrow(RevoraContractError);
  });

  it("requires exactly one adjustment and one swap for MODERATE and HIGH results", () => {
    expect(() =>
      assertModerateHighFields(
        {
          risk: "MODERATE",
          reason:
            "This may have a higher blood-sugar impact because it leans heavily on refined carbs.",
          adjustment:
            "If practical, add protein or nonstarchy vegetables to make it easier to handle.",
          swap: null
        },
        new Set()
      )
    ).toThrow(RevoraContractError);
  });

  it("rejects carbs-only sequencing-only adjustments that only say vegetables first", () => {
    expect(() =>
      assertModerateHighFields(
        {
          risk: "MODERATE",
          reason:
            "This may have a higher blood-sugar impact because it leans heavily on refined carbs.",
          adjustment: "Eat vegetables first if you can.",
          swap: "If you have the option, swap to a less refined version."
        },
        new Set(["carbs_only"])
      )
    ).toThrow(RevoraContractError);
  });

  it.each([
    "Add protein or nonstarchy vegetables to this meal.",
    "Pair it with eggs or a side salad."
  ])(
    "accepts carbs-only adjustments that add or pair with a steadier companion: %s",
    (adjustment) => {
      expect(() =>
        assertModerateHighFields(
          {
            risk: "MODERATE",
            reason:
              "This may have a higher blood-sugar impact because it leans heavily on refined carbs.",
            adjustment,
            swap: "If you have the option, swap to a less refined version."
          },
          new Set(["carbs_only"])
        )
      ).not.toThrow();
    }
  );

  it("floors invalid carbs-only adjustments back to deterministic add-protein copy", () => {
    const response = postprocessModelOutput(
      makeModelOutput({
        kind: "carbs_only",
        adjustment: "Start with vegetables before the carbs.",
        policy_flags: ["carbs_only"]
      }),
      {
        contract,
        route: routeA1C(6.1),
        precheckFlags: ["carbs_only"]
      }
    );

    expect(response).toEqual(buildCarbsOnlyResponse(contract, "MODERATE"));
  });

  it("applies conservative floors to upper-band carbs-only SAFE outputs", () => {
    const result = applyConservativeFloors(
      {
        risk: "SAFE",
        reason: "This looks like a reasonable fit.",
        adjustment: null,
        swap: null
      },
      {
        contract,
        route: routeA1C(6.4),
        precheckFlags: ["carbs_only", "borderline"]
      }
    );

    expect(result.risk).toBe("MODERATE");
    expect(result.adjustment).toContain("protein or nonstarchy vegetables");
    expect(result.swap).toContain("less refined");
  });
});
