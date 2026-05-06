import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  DEFAULT_REVORA_MODEL,
  REVORA_JSON_SCHEMA_NAME,
  createOpenAIRevoraModelClient
} from "../../../lib/revora/openai-client";
import { buildRevoraPrompt } from "../../../lib/revora/prompt";
import { checkFood } from "../../../lib/revora/service";
import * as serviceModule from "../../../lib/revora/service";
import { revoraModelJsonSchema } from "../../../lib/revora/schemas";
import { loadSafetyContract } from "../../../lib/revora/safety-contract";

describe("safety contract loader", () => {
  it("loads the Phase 1 fixture and approved disclaimer copy", () => {
    const contract = loadSafetyContract();

    expect(contract.paths.fixture).toBe(
      path.join(process.cwd(), "tests/fixtures/safety-contract.json")
    );
    expect(contract.fixture.uncertaintyFloors.length).toBeGreaterThan(0);
    expect(contract.copy.disclaimer).toBe(
      "Revora is informational only and is not medical advice. Talk with a doctor or registered dietitian for guidance that is specific to you."
    );
    expect(contract.copy.promptA1CScope).toContain("5.7%");
  });
});

describe("prompt composer", () => {
  it("includes the claims boundary, A1C scope, qualitative-only rules, and strict output contract", () => {
    const contract = loadSafetyContract();
    const prompt = buildRevoraPrompt({
      request: {
        food: "sweetened oatmeal",
        a1c: 6.2
      },
      contract
    });

    expect(prompt.instructions).toContain(contract.copy.productHomeHero);
    expect(prompt.instructions).toContain(contract.copy.promptA1CScope);
    expect(prompt.instructions).toContain(contract.copy.promptSafeToneSnippet);
    expect(prompt.instructions).toContain(
      contract.copy.promptConservativeFloorSnippet
    );
    expect(prompt.instructions).toContain("qualitative");
    expect(prompt.instructions).toContain("Return only one flat JSON object");
    expect(prompt.instructions).toContain("Do not diagnose");
    expect(prompt.input).toContain("Food: sweetened oatmeal");
    expect(prompt.input).toContain("A1C: 6.2");
  });
});

describe("OpenAI client", () => {
  it("calls the Responses API with store false and strict json_schema output", async () => {
    const create = vi.fn().mockResolvedValue({
      output_text: JSON.stringify({
        kind: "result",
        risk: "SAFE",
        reason: "This looks balanced.",
        adjustment: null,
        swap: null,
        question: null,
        examples: [],
        policy_flags: ["safe_food"]
      })
    });
    const client = createOpenAIRevoraModelClient({
      client: {
        responses: { create }
      }
    });

    const result = await client.generate({
      instructions: "instruction text",
      input: "Food: lentil soup\nA1C: 6.1"
    });

    expect(result).toEqual({
      kind: "result",
      risk: "SAFE",
      reason: "This looks balanced.",
      adjustment: null,
      swap: null,
      question: null,
      examples: [],
      policy_flags: ["safe_food"]
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: DEFAULT_REVORA_MODEL,
        instructions: "instruction text",
        input: "Food: lentil soup\nA1C: 6.1",
        store: false,
        text: {
          format: {
            type: "json_schema",
            name: REVORA_JSON_SCHEMA_NAME,
            schema: revoraModelJsonSchema,
            strict: true
          }
        }
      })
    );
  });
});

describe("checkFood", () => {
  it("is the only core service export", () => {
    expect(Object.keys(serviceModule).sort()).toEqual(["checkFood"]);
  });

  it("returns a safe retry response for malformed requests without calling the model", async () => {
    const model = {
      generate: vi.fn()
    };

    const response = await checkFood(
      {
        food: "",
        a1c: "nope"
      },
      { model }
    );

    expect(response.kind).toBe("retry");
    expect(response.disclaimer).toContain("registered dietitian");
    expect(model.generate).not.toHaveBeenCalled();
  });

  it("short-circuits out-of-scope A1C inputs before the model call", async () => {
    const model = {
      generate: vi.fn()
    };

    const belowRange = await checkFood(
      {
        food: "lentil soup",
        a1c: 5.6
      },
      { model }
    );
    const highRange = await checkFood(
      {
        food: "lentil soup",
        a1c: 6.5
      },
      { model }
    );

    expect(model.generate).not.toHaveBeenCalled();
    expect(belowRange).toMatchObject({
      kind: "out_of_scope",
      route: "below_prediabetes_range"
    });
    expect(highRange).toMatchObject({
      kind: "out_of_scope",
      route: "diabetes_range_out_of_scope"
    });
  });

  it("returns non-food guidance without calling the model", async () => {
    const model = {
      generate: vi.fn()
    };

    const response = await checkFood(
      {
        food: "write a poem about blood sugar",
        a1c: 6.1
      },
      { model }
    );

    expect(response.kind).toBe("not_food");
    expect(response.disclaimer).toContain("registered dietitian");
    expect(model.generate).not.toHaveBeenCalled();
  });

  it("returns one ambiguous question without calling the model", async () => {
    const model = {
      generate: vi.fn()
    };

    const response = await checkFood(
      {
        food: "oatmeal",
        a1c: 6.1
      },
      { model }
    );

    expect(response.kind).toBe("clarify");
    expect(response.disclaimer).toContain("registered dietitian");
    expect(model.generate).not.toHaveBeenCalled();
  });

  it("retries malformed model outputs once and then fails closed", async () => {
    const model = {
      generate: vi
        .fn()
        .mockRejectedValueOnce(new Error("malformed output"))
        .mockRejectedValueOnce(new Error("malformed output"))
    };

    const response = await checkFood(
      {
        food: "sweetened cereal",
        a1c: 6.1
      },
      { model }
    );

    expect(model.generate).toHaveBeenCalledTimes(2);
    expect(response.kind).toBe("retry");
    expect(response.disclaimer).toContain("registered dietitian");
  });

  it("returns validated in-scope results with the disclaimer merged server-side", async () => {
    const model = {
      generate: vi.fn().mockResolvedValue({
        kind: "result",
        risk: "SAFE",
        reason: "This looks balanced.",
        adjustment: null,
        swap: null,
        question: null,
        examples: [],
        policy_flags: ["safe_food"]
      })
    };

    const response = await checkFood(
      {
        food: "lentil soup",
        a1c: 6.1
      },
      { model }
    );

    expect(model.generate).toHaveBeenCalledTimes(1);
    expect(response).toEqual({
      kind: "result",
      risk: "SAFE",
      reason: "This looks balanced.",
      adjustment: null,
      swap: null,
      disclaimer:
        "Revora is informational only and is not medical advice. Talk with a doctor or registered dietitian for guidance that is specific to you."
    });
  });
});
