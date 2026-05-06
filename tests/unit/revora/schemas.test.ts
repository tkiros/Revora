import { describe, expect, it } from "vitest";

import {
  CheckRequestSchema,
  RevoraModelOutputSchema,
  revoraModelJsonSchema
} from "../../../lib/revora/schemas";

describe("CheckRequestSchema", () => {
  it("accepts an in-scope food request and rejects malformed values", () => {
    expect(
      CheckRequestSchema.parse({
        food: "lentil soup",
        a1c: 6.1
      })
    ).toEqual({
      food: "lentil soup",
      a1c: 6.1
    });

    const invalidRequests = [
      {},
      { food: "", a1c: 6.1 },
      { food: " ".repeat(4), a1c: 6.1 },
      { food: "x".repeat(161), a1c: 6.1 },
      { food: "lentil soup", a1c: "6.1" },
      { food: "lentil soup", a1c: -0.1 },
      { food: ["lentil soup"], a1c: 6.1 },
      { food: "lentil soup", a1c: Number.NaN }
    ];

    for (const invalidRequest of invalidRequests) {
      expect(CheckRequestSchema.safeParse(invalidRequest).success).toBe(false);
    }
  });
});

describe("revoraModelJsonSchema", () => {
  it("stays flat, strict, and structured-output compatible", () => {
    expect(revoraModelJsonSchema.type).toBe("object");
    expect(revoraModelJsonSchema.additionalProperties).toBe(false);
    expect(revoraModelJsonSchema.required).toEqual([
      "kind",
      "risk",
      "reason",
      "adjustment",
      "swap",
      "question",
      "examples",
      "policy_flags"
    ]);
    expect(revoraModelJsonSchema).not.toHaveProperty("anyOf");
    expect(revoraModelJsonSchema.properties.risk.type).toEqual([
      "string",
      "null"
    ]);
    expect(revoraModelJsonSchema.properties.reason.type).toEqual([
      "string",
      "null"
    ]);
    expect(revoraModelJsonSchema.properties.adjustment.type).toEqual([
      "string",
      "null"
    ]);
    expect(revoraModelJsonSchema.properties.swap.type).toEqual([
      "string",
      "null"
    ]);
    expect(revoraModelJsonSchema.properties.question.type).toEqual([
      "string",
      "null"
    ]);
  });
});

describe("RevoraModelOutputSchema", () => {
  it("rejects unknown risks, missing nullable fields, and extra properties", () => {
    const validOutput = {
      kind: "result",
      risk: "SAFE",
      reason: "This looks balanced.",
      adjustment: null,
      swap: null,
      question: null,
      examples: [],
      policy_flags: ["safe_food"]
    };

    expect(RevoraModelOutputSchema.parse(validOutput)).toEqual(validOutput);
    expect(
      RevoraModelOutputSchema.safeParse({
        ...validOutput,
        risk: "LOW"
      }).success
    ).toBe(false);
    expect(
      RevoraModelOutputSchema.safeParse({
        kind: "result",
        risk: "SAFE",
        reason: "This looks balanced.",
        adjustment: null,
        swap: null,
        examples: [],
        policy_flags: ["safe_food"]
      }).success
    ).toBe(false);
    expect(
      RevoraModelOutputSchema.safeParse({
        ...validOutput,
        extra: "nope"
      }).success
    ).toBe(false);
  });
});
