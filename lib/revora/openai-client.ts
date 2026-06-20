import OpenAI from "openai";
import type { ResponseCreateParamsNonStreaming } from "openai/resources/responses/responses";
import type { ReasoningEffort } from "openai/resources/shared";

import { RevoraModelOutputSchema, revoraModelJsonSchema } from "./schemas";
import type { RevoraModelOutput } from "./schemas";
import type { RevoraPromptPayload } from "./prompt";

export const DEFAULT_REVORA_MODEL = "gpt-5.4-mini";
export const REVORA_JSON_SCHEMA_NAME = "revora_model_output";

// Reasoning-effort lever (cost/latency control for GPT-5.x reasoning models).
// This is a small, schema-constrained JSON classification, so a low effort is
// the likely sweet spot for cost/latency. But this is the LIVE SAFETY
// classifier (launch blocker: zero harmful-SAFE), and lowering reasoning can
// change classification quality — so the default is behavior-NEUTRAL: omit the
// parameter and let the model run at its own default. Activate a specific
// effort (recommended: "low") via REVORA_REASONING_EFFORT only AFTER confirming
// it still holds zero-harmful-SAFE with `npm run eval:revora`. Reasoning tokens
// are billed as output, so a validated low effort is the main cost lever here.
// Recommended value once eval-confirmed: "low".

const REASONING_EFFORT_VALUES: ReadonlySet<ReasoningEffort> = new Set([
  "none",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh"
]);

/**
 * Resolve the reasoning effort from config. Returns `null` to mean "omit the
 * reasoning parameter" — the behavior-neutral default that preserves the
 * model's own reasoning behavior. Only an explicit, valid effort string
 * activates the parameter; anything else (unset, blank, "off", "default", or an
 * unknown value) omits it. This keeps the live safety classifier on its
 * validated behavior until a specific effort is chosen and eval-confirmed.
 */
export function resolveReasoningEffort(
  raw: string | undefined | null
): ReasoningEffort | null {
  if (raw === undefined || raw === null) {
    return null;
  }

  const value = raw.trim().toLowerCase();
  return REASONING_EFFORT_VALUES.has(value as ReasoningEffort)
    ? (value as ReasoningEffort)
    : null;
}

type ResponsesCreateResult = {
  output_text?: string;
};

type OpenAIResponsesTransport = {
  responses: {
    create(
      params: ResponseCreateParamsNonStreaming
    ): Promise<ResponsesCreateResult>;
  };
};

export interface RevoraModelClient {
  generate(prompt: RevoraPromptPayload): Promise<RevoraModelOutput>;
}

export function createOpenAIRevoraModelClient(options?: {
  apiKey?: string;
  model?: string;
  reasoningEffort?: ReasoningEffort | "off";
  client?: OpenAIResponsesTransport;
}): RevoraModelClient {
  const model = options?.model ?? process.env.REVORA_MODEL ?? DEFAULT_REVORA_MODEL;
  const reasoningEffort = resolveReasoningEffort(
    options?.reasoningEffort ?? process.env.REVORA_REASONING_EFFORT
  );
  const client =
    options?.client ??
    createTransport(options?.apiKey ?? process.env.OPENAI_API_KEY);

  return {
    async generate(prompt) {
      const response = await client.responses.create({
        model,
        instructions: prompt.instructions,
        input: prompt.input,
        store: false,
        ...(reasoningEffort ? { reasoning: { effort: reasoningEffort } } : {}),
        text: {
          format: {
            type: "json_schema",
            name: REVORA_JSON_SCHEMA_NAME,
            schema: revoraModelJsonSchema,
            strict: true
          }
        }
      });

      const outputText = response.output_text?.trim();
      if (!outputText) {
        throw new Error("OpenAI response did not include output_text.");
      }

      let parsedOutput: unknown;

      try {
        parsedOutput = JSON.parse(outputText);
      } catch (error) {
        throw new Error("OpenAI response output_text was not valid JSON.", {
          cause: error
        });
      }

      return RevoraModelOutputSchema.parse(parsedOutput);
    }
  };
}

function createTransport(apiKey: string | undefined): OpenAIResponsesTransport {
  if (typeof window !== "undefined") {
    throw new Error(
      "Revora OpenAI client must run server-side only."
    );
  }

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is required for live Revora model calls."
    );
  }

  return new OpenAI({ apiKey });
}
