import { describe, expect, it } from "vitest";

import { routeA1C } from "../../../lib/revora/a1c";
import { buildCarbsOnlyResponse } from "../../../lib/revora/fallback";
import {
  RevoraContractError,
  applyConservativeFloors,
  assertModerateHighFields,
  assertNoUnsafeSafeFields,
  assertOneSentence,
  groundReason,
  hasSugarEvidence,
  mentionsMealComponent,
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

/**
 * W-17 Tier 2.1 — the rule that makes advice meal-specific instead of generic.
 *
 * The enforcement half ships OFF (`REVORA_ENFORCE_COMPONENT_MENTION=1`): a
 * fail-closed rule whose false-positive rate has never been measured against a
 * live model would degrade real users to retry cards at an unknown rate. The
 * PURE function is still fully testable without spending a token, and it was
 * shipped with no tests at all — an exported enforcement primitive nobody had
 * exercised. That is the gap these close.
 */
describe("mentionsMealComponent (W-17 Tier 2.1)", () => {
  it("accepts advice that names a component the user actually typed", () => {
    expect(
      mentionsMealComponent(
        "rice, dal, ghee and salad",
        "If practical, cut the rice portion by a third and lead with the salad."
      )
    ).toBe(true);
  });

  it("rejects generic advice that names nothing from the meal", () => {
    expect(
      mentionsMealComponent(
        "spaghetti bolognese",
        "If practical, add protein or nonstarchy vegetables."
      )
    ).toBe(false);
  });

  it("matches across singular/plural stems", () => {
    expect(
      mentionsMealComponent(
        "roast potatoes with chicken",
        "Keep the potato serving to a fist and the chicken as it is."
      )
    ).toBe(true);
  });

  it("ignores stopwords, so 'with' and 'and' can never satisfy the rule", () => {
    // Without the stopword filter this passes on the word "with" alone — the
    // rule would be satisfied by advice that names no food whatsoever.
    expect(
      mentionsMealComponent(
        "toast with jam",
        "If practical, pair this with protein to slow things down."
      )
    ).toBe(false);
  });

  it("passes when the input names nothing stemmable (never punish the model for an empty meal)", () => {
    expect(mentionsMealComponent("a b c", "Add some vegetables.")).toBe(true);
  });
});

describe("postprocessModelOutput — component-mention enforcement (W-17 Tier 2.1)", () => {
  const generic = makeModelOutput({
    adjustment: "If practical, add protein or nonstarchy vegetables."
  });
  const context = {
    contract,
    route: routeA1C(6.1),
    precheckFlags: [],
    food: "spaghetti bolognese"
  };

  it("is INERT by default — generic advice still reaches the user", () => {
    delete process.env.REVORA_ENFORCE_COMPONENT_MENTION;
    // This is the shipped production behaviour today, asserted so that turning
    // the flag on is a deliberate, visible change and not an accident.
    expect(postprocessModelOutput(generic, context).kind).toBe("result");
  });

  it("fails closed to a retry when enabled and the advice names no component", () => {
    process.env.REVORA_ENFORCE_COMPONENT_MENTION = "1";
    try {
      expect(() => postprocessModelOutput(generic, context)).toThrow(
        RevoraContractError
      );
    } finally {
      delete process.env.REVORA_ENFORCE_COMPONENT_MENTION;
    }
  });

  it("passes meal-specific advice when enabled", () => {
    process.env.REVORA_ENFORCE_COMPONENT_MENTION = "1";
    try {
      const response = postprocessModelOutput(
        makeModelOutput({
          adjustment: "If practical, halve the spaghetti and keep the sauce."
        }),
        context
      );
      expect(response.kind).toBe("result");
    } finally {
      delete process.env.REVORA_ENFORCE_COMPONENT_MENTION;
    }
  });

  it("never fires on SAFE results, which carry no adjustment to check", () => {
    process.env.REVORA_ENFORCE_COMPONENT_MENTION = "1";
    try {
      const response = postprocessModelOutput(
        makeModelOutput({
          risk: "SAFE",
          reason: "This looks like a reasonable fit.",
          adjustment: null,
          swap: null,
          policy_flags: []
        }),
        context
      );
      expect(response.risk).toBe("SAFE");
    } finally {
      delete process.env.REVORA_ENFORCE_COMPONENT_MENTION;
    }
  });
});

describe("groundReason (doc 18 F-5 — fabricated sugar claims)", () => {
  it("replaces a sugar claim about a food that names no sugar", () => {
    expect(
      groundReason(
        "mac and cheese",
        "MODERATE",
        "This is mostly sugary carbs, so be careful."
      )
    ).toBe(
      "This looks like it can have a higher blood-sugar impact than a balanced meal, so some extra care fits here."
    );
  });

  it("does not count a sugar-free variant as sugar evidence", () => {
    expect(
      groundReason(
        "sugar-free cookies",
        "HIGH",
        "These are mostly sugary treats."
      )
    ).toBe("This is likely a higher-impact choice for this range in its current form.");
  });

  it("keeps a grounded sugar claim untouched", () => {
    const reason = "The sugary glaze on the donut is the main driver here.";
    expect(groundReason("glazed donut", "HIGH", reason)).toBe(reason);
  });

  it("keeps a non-sugar reason untouched regardless of the food", () => {
    const reason = "The macaroni carries most of the carb load here.";
    expect(groundReason("mac and cheese", "MODERATE", reason)).toBe(reason);
  });
});

describe("postprocessModelOutput grounds model-authored reasons", () => {
  it("swaps in the band-consistent fallback reason for an ungrounded sugar claim", () => {
    const response = postprocessModelOutput(
      makeModelOutput({
        reason: "This dish is mostly sugary carbs.",
        policy_flags: []
      }),
      {
        contract,
        route: routeA1C(6.1),
        precheckFlags: [],
        food: "mac and cheese"
      }
    );

    expect(response.reason).toBe(
      "This looks like it can have a higher blood-sugar impact than a balanced meal, so some extra care fits here."
    );
    expect(response.risk).toBe("MODERATE");
  });

  it("never touches a floored draft's template reason", () => {
    const floored = postprocessModelOutput(
      makeModelOutput({ risk: "SAFE", adjustment: null, swap: null }),
      {
        contract,
        route: routeA1C(6.4),
        precheckFlags: ["borderline"],
        food: "salmon poke bowl"
      }
    );

    expect(floored.risk).toBe("MODERATE");
    expect(floored.reason).toBe(
      "This leans on a carb-heavy base, which can have a higher blood-sugar impact in your range even with protein or vegetables alongside."
    );
  });
});

describe("carbs-only floor preserves model severity (doc 18 item 12)", () => {
  it("keeps HIGH when replacing a non-compliant HIGH draft", () => {
    const floored = applyConservativeFloors(
      {
        risk: "HIGH",
        reason: "Half a box is several servings of refined pasta at once.",
        adjustment: null, // non-compliant for carbs-only → template replaces it
        swap: null
      },
      {
        contract,
        route: routeA1C(6.1),
        precheckFlags: ["carbs_only", "borderline"]
      }
    );

    expect(floored.risk).toBe("HIGH");
  });

  it("still floors a SAFE draft to MODERATE, not HIGH", () => {
    const floored = applyConservativeFloors(
      {
        risk: "SAFE",
        reason: "This looks fine.",
        adjustment: null,
        swap: null
      },
      {
        contract,
        route: routeA1C(6.1),
        precheckFlags: ["carbs_only", "borderline"]
      }
    );

    expect(floored.risk).toBe("MODERATE");
  });
});

describe("HIGH floor copy is sugar-aware (2026-07-16 re-run finding)", () => {
  const context = (food: string) => ({
    contract,
    route: routeA1C(6.3),
    precheckFlags: [],
    food
  });

  it("uses the composition-free HIGH draft when the food names no sugar", () => {
    // Model flags injera high_risk (its right — flags are risk-raising), but
    // the sugary template copy was a fabricated driver; the panel flagged it.
    const response = postprocessModelOutput(
      makeModelOutput({ risk: "MODERATE", policy_flags: ["high_risk"] }),
      context("injera with doro wat")
    );

    expect(response.risk).toBe("HIGH");
    expect(response.reason).toBe(
      "This is likely a higher-impact choice for this range in its current form."
    );
    expect(response.swap).toBe(
      "If you have the option, swap to a less refined version."
    );
  });

  it("keeps the sugary HIGH draft for foods that name sugar", () => {
    const response = postprocessModelOutput(
      makeModelOutput({ risk: "MODERATE", policy_flags: ["high_risk"] }),
      context("glazed donut")
    );

    expect(response.risk).toBe("HIGH");
    expect(response.reason).toBe(
      "This is likely a higher-impact choice because it is mostly sugary or refined carbs."
    );
  });

  it("a diet/sugar-free variant does not count as sugar evidence", () => {
    expect(hasSugarEvidence("sugar free cookies")).toBe(false);
    expect(hasSugarEvidence("cookies")).toBe(true);
    expect(hasSugarEvidence("canned corn, white bread, and peanut butter")).toBe(false);
  });
});
