import { describe, expect, it, vi } from "vitest";

import {
  DEFAULT_REVORA_MODEL,
  REVORA_JSON_SCHEMA_NAME,
  createOpenAIRevoraModelClient
} from "../../../lib/revora/openai-client";
import { revoraModelJsonSchema } from "../../../lib/revora/schemas";

describe("createOpenAIRevoraModelClient", () => {
  it("sets store false on every Responses API call", async () => {
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

    await client.generate({
      instructions: "instruction text",
      input: "Food: lentil soup\nA1C: 6.1"
    });

    expect(create).toHaveBeenCalledTimes(1);
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

  it("rejects missing output_text instead of returning raw provider output", async () => {
    const client = createOpenAIRevoraModelClient({
      client: {
        responses: {
          create: vi.fn().mockResolvedValue({})
        }
      }
    });

    await expect(
      client.generate({
        instructions: "instruction text",
        input: "Food: lentil soup\nA1C: 6.1"
      })
    ).rejects.toThrow("output_text");
  });
});
