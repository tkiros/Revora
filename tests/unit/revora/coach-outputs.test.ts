import { describe, expect, it } from "vitest";

import {
  CheckApiResponseSchema,
  deriveCoachOutputs
} from "../../../lib/revora/coach-outputs";
import type { RevoraUserResponse } from "../../../lib/revora/schemas";

const DISCLAIMER =
  "Revora is informational only and is not medical advice. Talk with a doctor or registered dietitian for guidance that is specific to you.";

function resultResponse(risk: "SAFE" | "MODERATE" | "HIGH"): RevoraUserResponse {
  return {
    kind: "result",
    risk,
    reason: "This may have a higher blood-sugar impact.",
    adjustment: risk === "SAFE" ? null : "If practical, add protein.",
    swap: risk === "SAFE" ? null : "If you have the option, swap to a less refined version.",
    disclaimer: DISCLAIMER
  };
}

const NON_RESULT_RESPONSES: RevoraUserResponse[] = [
  {
    kind: "clarify",
    question: "Is this plain or sweetened?",
    examples: [],
    disclaimer: DISCLAIMER
  },
  {
    kind: "not_food",
    message: "I can only classify foods or meals.",
    examples: ["oatmeal with nuts"],
    disclaimer: DISCLAIMER
  },
  {
    kind: "out_of_scope",
    route: "below_prediabetes_range",
    message: "Below the range.",
    disclaimer: DISCLAIMER
  },
  {
    kind: "retry",
    message: "Please try again.",
    disclaimer: DISCLAIMER
  }
];

describe("deriveCoachOutputs", () => {
  it("returns both outputs for MODERATE results", () => {
    const outputs = deriveCoachOutputs(resultResponse("MODERATE"));

    expect(outputs.sequencingTip).toBe(
      "If practical, start with the vegetables or protein on your plate and save the carb-heavy part for last."
    );
    expect(outputs.postMealAction).toBe(
      "A short 10–15 minute walk after this meal is a calm next step."
    );
  });

  it("returns both outputs for HIGH results", () => {
    const outputs = deriveCoachOutputs(resultResponse("HIGH"));

    expect(outputs.sequencingTip).not.toBeNull();
    expect(outputs.postMealAction).not.toBeNull();
  });

  it("returns null outputs for SAFE results — no piling on", () => {
    expect(deriveCoachOutputs(resultResponse("SAFE"))).toEqual({
      sequencingTip: null,
      postMealAction: null,
      keepMost: null
    });
  });

  it.each(NON_RESULT_RESPONSES.map((r) => [r.kind, r] as const))(
    "returns null outputs for %s responses",
    (_kind, response) => {
      expect(deriveCoachOutputs(response)).toEqual({
        sequencingTip: null,
        postMealAction: null,
        keepMost: null
      });
    }
  );

  it("keepMost is the approved keep-most phrase for MODERATE and HIGH", () => {
    const phrase =
      "Enjoy a smaller portion now and set the rest aside for later — same food, gentler pace.";

    expect(deriveCoachOutputs(resultResponse("MODERATE")).keepMost).toBe(phrase);
    expect(deriveCoachOutputs(resultResponse("HIGH")).keepMost).toBe(phrase);
    expect(deriveCoachOutputs(resultResponse("HIGH")).keepMost).toBeTruthy();
  });

  it("keepMost is null for SAFE and every non-result kind", () => {
    expect(deriveCoachOutputs(resultResponse("SAFE")).keepMost).toBeNull();
    for (const response of NON_RESULT_RESPONSES) {
      expect(deriveCoachOutputs(response).keepMost).toBeNull();
    }
  });

  it("keepMost obeys the tone rules — banned list adds skip, no digits", () => {
    const text = deriveCoachOutputs(resultResponse("HIGH")).keepMost as string;

    // one sentence
    expect(text.match(/[.!?](?=\s|$)/g) ?? []).toHaveLength(1);
    // permission-first hedges, never commands framed as musts; skip is banned too
    expect(text).not.toMatch(/\bmust\b|\bnever\b|\bdon't\b|\bavoid\b|\bskip\b/i);
    // no backward judgment
    expect(text).not.toMatch(/should have|you failed|too much/i);
    // no glycemic numbers and no digits at all for this field
    expect(text).not.toMatch(/\bGI\b|\bGL\b|\bgrams?\b|mg\/?dl|\bcarbs? grams?\b/i);
    expect(text).not.toMatch(/\d/);
  });

  it("is deterministic — same input, same output", () => {
    const a = deriveCoachOutputs(resultResponse("MODERATE"));
    const b = deriveCoachOutputs(resultResponse("MODERATE"));

    expect(a).toEqual(b);
  });

  it("keeps the phrase bank inside the tone policy: permission-first, no numbers beyond duration, one sentence each", () => {
    const outputs = deriveCoachOutputs(resultResponse("HIGH"));
    const strings = [outputs.sequencingTip, outputs.postMealAction] as string[];

    for (const text of strings) {
      // one sentence
      expect(text.match(/[.!?](?=\s|$)/g) ?? []).toHaveLength(1);
      // permission-first hedges, never commands framed as musts
      expect(text).not.toMatch(/\bmust\b|\bnever\b|\bdon't\b|\bavoid\b/i);
      // no backward judgment
      expect(text).not.toMatch(/should have|you failed|too much/i);
      // no glycemic numbers (GI/GL, grams, mg/dL); minutes of walking are allowed
      expect(text).not.toMatch(/\bGI\b|\bGL\b|\bgrams?\b|mg\/?dl|\bcarbs? grams?\b/i);
    }
  });
});

describe("CheckApiResponseSchema", () => {
  it("accepts every engine kind extended with the two nullable coach fields", () => {
    for (const response of [
      resultResponse("SAFE"),
      resultResponse("MODERATE"),
      ...NON_RESULT_RESPONSES
    ]) {
      const wrapped = { ...response, ...deriveCoachOutputs(response) };
      expect(CheckApiResponseSchema.safeParse(wrapped).success).toBe(true);
    }
  });

  it("rejects payloads missing the coach fields", () => {
    expect(CheckApiResponseSchema.safeParse(resultResponse("SAFE")).success).toBe(
      false
    );
  });

  it("requires keepMost on result kinds", () => {
    const missingKeepMost = {
      ...resultResponse("MODERATE"),
      sequencingTip: null,
      postMealAction: null
      // keepMost intentionally omitted
    };

    expect(CheckApiResponseSchema.safeParse(missingKeepMost).success).toBe(false);
  });

  it("rejects unknown extra fields (stays strict like the engine schemas)", () => {
    const wrapped = {
      ...resultResponse("SAFE"),
      sequencingTip: null,
      postMealAction: null,
      calories: 120
    };

    expect(CheckApiResponseSchema.safeParse(wrapped).success).toBe(false);
  });
});
