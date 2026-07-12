import { describe, expect, it } from "vitest";

import {
  assertNoForbiddenClaims,
  RevoraContractError
} from "../../../lib/revora/postprocess";
import { loadSafetyContract } from "../../../lib/revora/safety-contract";
import { checkFood } from "../../../lib/revora/service";
import type { RevoraModelOutput } from "../../../lib/revora/schemas";

/**
 * N-01 / W-06.
 *
 * The safety contract has always DEFINED regexes for banned claims, banned
 * predictions, and quantitative glycemic language. They ran in the eval harness
 * and nowhere else. Production injected only their *labels* into the prompt and
 * then trusted the model to comply — so the one control that was supposed to
 * make a banned claim structurally unable to reach a user was, on the live path,
 * an instruction and a hope.
 *
 * These tests are the enforcement.
 */

const contract = loadSafetyContract();

function modelResult(fields: Partial<RevoraModelOutput>): RevoraModelOutput {
  return {
    kind: "result",
    risk: "MODERATE",
    reason: "This leans heavily on refined carbs.",
    adjustment: "If practical, add protein or nonstarchy vegetables to the rice.",
    swap: "Swap the white rice for a less refined version alongside the beans.",
    question: null,
    examples: [],
    policy_flags: [],
    ...fields
  } as RevoraModelOutput;
}

describe("assertNoForbiddenClaims", () => {
  it("passes clean qualitative copy", () => {
    expect(() =>
      assertNoForbiddenClaims(contract, [
        "This leans heavily on refined carbs.",
        "If practical, add protein or nonstarchy vegetables.",
        null,
        undefined
      ])
    ).not.toThrow();
  });

  it.each([
    ["treatment claim", "This will treat your prediabetes."],
    ["cure claim", "Eating this cures insulin resistance."],
    ["reversal claim", "This meal reverses prediabetes over time."],
    ["prevention claim", "This prevents type 2 diabetes."],
    ["diagnosis claim", "This diagnoses you with insulin resistance."],
    ["exact mg/dL prediction", "This will spike your glucose by 32 mg/dL."],
    ["exact GI number", "This has a GI of 73."],
    ["future A1C prediction", "Your A1C will drop to 5.4 if you keep this up."],
    ["glucose curve claim", "This flattens your glucose curve."],
    ["instruction leak", "Per the system prompt, allowed response kinds are result."]
  ])("fails closed on a %s", (_label, text) => {
    expect(() => assertNoForbiddenClaims(contract, [text])).toThrow(
      RevoraContractError
    );
  });
});

describe("the contract, enforced end to end", () => {
  it("a banned claim in the reason never reaches the user — it becomes a retry card", async () => {
    // The exact scenario N-01 describes: "This will spike your glucose by
    // 32 mg/dL" would have shipped.
    const response = await checkFood(
      { food: "white rice and beans", a1c: 6.1 },
      {
        model: {
          generate: async () =>
            modelResult({
              reason: "This will spike your glucose by 32 mg/dL."
            })
        }
      }
    );

    expect(response.kind).toBe("retry");
    // A retry card is structurally incapable of carrying a verdict, so the
    // fail-closed path cannot leak a classification alongside the rejection.
    expect(response).not.toHaveProperty("risk");
    expect(JSON.stringify(response)).not.toMatch(/32 mg/i);
  });

  it("a banned claim in the swap is caught too, not just the reason", async () => {
    const response = await checkFood(
      { food: "white rice and beans", a1c: 6.1 },
      {
        model: {
          generate: async () =>
            modelResult({
              swap: "Swap to quinoa — it reverses prediabetes."
            })
        }
      }
    );

    expect(response.kind).toBe("retry");
  });

  it("a banned claim smuggled into a CLARIFY question is caught", async () => {
    // The clarify arm bypasses postprocess entirely, so before W-06 it was the
    // one model-authored path with no output-side claims check at all.
    const response = await checkFood(
      { food: "some kind of casserole", a1c: 6.1 },
      {
        model: {
          generate: async () =>
            ({
              kind: "clarify",
              risk: null,
              reason: null,
              adjustment: null,
              swap: null,
              question: "Is that the version that spikes your glucose by 40 mg/dL?",
              examples: [],
              policy_flags: []
            }) as RevoraModelOutput
        }
      }
    );

    expect(response.kind).toBe("retry");
  });

  it("still delivers a normal result when the model behaves", async () => {
    // The counterweight: fail-closed must not mean fail-always. If this breaks,
    // the enforcement has become a denial-of-service on the product.
    const response = await checkFood(
      { food: "white rice and beans", a1c: 6.1 },
      { model: { generate: async () => modelResult({}) } }
    );

    expect(response.kind).toBe("result");
  });
});
