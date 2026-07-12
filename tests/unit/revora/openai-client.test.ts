import OpenAI from "openai";
import { describe, expect, it, vi } from "vitest";

import {
  DEFAULT_REVORA_MODEL,
  REVORA_JSON_SCHEMA_NAME,
  RevoraConnectionError,
  activeModelId,
  createOpenAIRevoraModelClient
} from "../../../lib/revora/openai-client";
import { revoraModelJsonSchema } from "../../../lib/revora/schemas";

describe("activeModelId", () => {
  // A declared-but-empty REVORA_MODEL= was live in .env: `??` let the empty
  // string win, so every model call requested model "" and 400'd. Blank is unset.
  it.each([
    ["unset", undefined],
    ["empty", ""],
    ["whitespace", "   "]
  ])("falls back to the default when REVORA_MODEL is %s", (_label, value) => {
    vi.stubEnv("REVORA_MODEL", value as string);
    expect(activeModelId()).toBe(DEFAULT_REVORA_MODEL);
    vi.unstubAllEnvs();
  });

  it("uses an explicitly set REVORA_MODEL", () => {
    vi.stubEnv("REVORA_MODEL", "gpt-5.4");
    expect(activeModelId()).toBe("gpt-5.4");
    vi.unstubAllEnvs();
  });
});

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

  const VALID_OUTPUT = {
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
  };

  it("retries exactly once on a connection-level error (REL-01)", async () => {
    const create = vi
      .fn()
      .mockRejectedValueOnce(new OpenAI.APIConnectionError({ message: "boom" }))
      .mockResolvedValueOnce(VALID_OUTPUT);

    const client = createOpenAIRevoraModelClient({
      client: { responses: { create } }
    });

    const result = await client.generate({ instructions: "i", input: "f" });
    expect(result.kind).toBe("result");
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("surfaces RevoraConnectionError when the retry also fails", async () => {
    const create = vi
      .fn()
      .mockRejectedValue(new OpenAI.APIConnectionError({ message: "down" }));

    const client = createOpenAIRevoraModelClient({
      client: { responses: { create } }
    });

    await expect(
      client.generate({ instructions: "i", input: "f" })
    ).rejects.toBeInstanceOf(RevoraConnectionError);
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("never retries timeouts or provider HTTP errors (single paid attempt)", async () => {
    for (const error of [
      new OpenAI.APIConnectionTimeoutError({ message: "slow" }),
      Object.assign(new Error("http 500"), { status: 500 })
    ]) {
      const create = vi.fn().mockRejectedValue(error);
      const client = createOpenAIRevoraModelClient({
        client: { responses: { create } }
      });

      await expect(
        client.generate({ instructions: "i", input: "f" })
      ).rejects.toBe(error);
      expect(create).toHaveBeenCalledTimes(1);
    }
  });

  it("omits the reasoning parameter by default (behavior-neutral)", async () => {
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
      client: { responses: { create } }
    });

    await client.generate({ instructions: "x", input: "y" });

    // Default must NOT lower reasoning on the live safety classifier — the model
    // runs at its own default until an effort is explicitly set + eval-confirmed.
    expect(create.mock.calls[0][0]).not.toHaveProperty("reasoning");
  });

  it("passes through an explicit reasoning effort", async () => {
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
      reasoningEffort: "minimal",
      client: { responses: { create } }
    });

    await client.generate({ instructions: "x", input: "y" });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ reasoning: { effort: "minimal" } })
    );
  });

  it("omits the reasoning parameter when effort is 'off'", async () => {
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
      reasoningEffort: "off",
      client: { responses: { create } }
    });

    await client.generate({ instructions: "x", input: "y" });

    expect(create.mock.calls[0][0]).not.toHaveProperty("reasoning");
  });

  it("constructs the OpenAI client with a bounded timeout and no SDK retries", () => {
    const captured: Array<Record<string, unknown>> = [];
    const FakeOpenAI = function (this: unknown, opts: Record<string, unknown>) {
      captured.push(opts);
      return { responses: { create: async () => ({ output_text: "{}" }) } };
    } as unknown as typeof import("openai").default;

    createOpenAIRevoraModelClient({ apiKey: "k", openAiCtor: FakeOpenAI });
    expect(captured[0]).toMatchObject({ timeout: 10_000, maxRetries: 0 });
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
