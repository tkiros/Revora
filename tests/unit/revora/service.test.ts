import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  DEFAULT_REVORA_MODEL,
  REVORA_JSON_SCHEMA_NAME,
  createOpenAIRevoraModelClient
} from "../../../lib/revora/openai-client";
import { buildRevoraPrompt } from "../../../lib/revora/prompt";
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
