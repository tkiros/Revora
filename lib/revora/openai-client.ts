import OpenAI from "openai";
import type { ResponseCreateParamsNonStreaming } from "openai/resources/responses/responses";
import type { ReasoningEffort } from "openai/resources/shared";

import { RevoraModelOutputSchema, revoraModelJsonSchema } from "./schemas";
import type { RevoraModelOutput } from "./schemas";
import type { RevoraPromptPayload } from "./prompt";

export const DEFAULT_REVORA_MODEL = "gpt-5.4-mini";
export const REVORA_JSON_SCHEMA_NAME = "revora_model_output";

/**
 * The model this process will actually call — for telemetry (W-13/N-18).
 *
 * Telemetry used to record no model at all, so a user reporting a bad answer
 * could not be attributed to the model that produced it. This is the same
 * resolution the client itself does, kept in one place so the stamp cannot
 * drift from the call.
 */
export function activeModelId(): string {
  return process.env.REVORA_MODEL ?? DEFAULT_REVORA_MODEL;
}

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
  openAiCtor?: typeof OpenAI;
}): RevoraModelClient {
  const model = options?.model ?? process.env.REVORA_MODEL ?? DEFAULT_REVORA_MODEL;
  const reasoningEffort = resolveReasoningEffort(
    options?.reasoningEffort ?? process.env.REVORA_REASONING_EFFORT
  );
  const client =
    options?.client ??
    createTransport(
      options?.apiKey ?? process.env.OPENAI_API_KEY,
      options?.openAiCtor
    );

  return {
    async generate(prompt) {
      const response = await createWithConnectionRetry(client, {
        model,
        instructions: prompt.instructions,
        input: prompt.input,
        store: false,
        // Revora answers are short JSON. Without a cap, OpenRouter prices the
        // request against the model's worst-case output window (65k) and can
        // reject larger models outright (2026-07-09 benchmark finding). 1024
        // (not 512) because GPT-5.x reasoning tokens bill against this cap and
        // could truncate the JSON on complex meals. A truncated response fails
        // JSON.parse below and falls to the calm retry — fail-closed, never a
        // partial answer.
        max_output_tokens: 1024,
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

      // Normalize before validation: drop empty/whitespace example strings.
      // A benchmarked gpt-5.4-mini run failed the strict parser only because
      // it returned examples:[""] — content-free, so dropping is safe.
      if (
        parsedOutput !== null &&
        typeof parsedOutput === "object" &&
        Array.isArray((parsedOutput as { examples?: unknown }).examples)
      ) {
        (parsedOutput as { examples: unknown[] }).examples = (
          parsedOutput as { examples: unknown[] }
        ).examples.filter(
          (item) => typeof item !== "string" || item.trim().length > 0
        );
      }

      return RevoraModelOutputSchema.parse(parsedOutput);
    }
  };
}

/** Connection never reached (or lost) the provider and one retry also failed.
 * Surfaced as its own type so the route can log "connection_blip" instead of
 * "provider_error" (REL-01). */
export class RevoraConnectionError extends Error {
  constructor(cause: unknown) {
    super("Model provider unreachable after one connection retry.", { cause });
    this.name = "RevoraConnectionError";
  }
}

/**
 * REL-01: one retry on CONNECTION-level failures only. HTTP errors (4xx/5xx)
 * mean the provider processed the request — never retried, preserving the
 * single-paid-attempt invariant. Timeouts are also never retried: a timed-out
 * request may still be running (and billing) provider-side. The SDK's own
 * maxRetries stays 0 so retry policy lives in exactly one place.
 */
async function createWithConnectionRetry(
  client: OpenAIResponsesTransport,
  params: ResponseCreateParamsNonStreaming
): Promise<ResponsesCreateResult> {
  const isRetriableConnectionError = (error: unknown) =>
    error instanceof OpenAI.APIConnectionError &&
    !(error instanceof OpenAI.APIConnectionTimeoutError);

  try {
    return await client.responses.create(params);
  } catch (firstError) {
    if (!isRetriableConnectionError(firstError)) {
      throw firstError;
    }

    try {
      return await client.responses.create(params);
    } catch (secondError) {
      throw isRetriableConnectionError(secondError)
        ? new RevoraConnectionError(secondError)
        : secondError;
    }
  }
}

function createTransport(
  apiKey: string | undefined,
  ctor: typeof OpenAI = OpenAI
): OpenAIResponsesTransport {
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

  // timeout (10s) stays under the client's 12s abort so a slow call can never
  // spend after the browser has given up; maxRetries 0 means the SDK never
  // silently stacks a second paid attempt (the service does one live attempt).
  //
  // baseURL is UNSET by default — production calls OpenAI directly, which is
  // the whole point of N-19: the model-selection bakeoff was gathered through
  // OpenRouter, a different provider path with different failure modes, so its
  // evidence never applied to the path that actually serves users. The env var
  // exists so the eval harness can be pointed at an alternate provider
  // deliberately (and so a provider outage has a documented failover), never so
  // that production quietly drifts off the path its evidence was gathered on.
  const baseURL = process.env.OPENAI_BASE_URL;

  return new ctor({
    apiKey,
    timeout: 10_000,
    maxRetries: 0,
    ...(baseURL ? { baseURL } : {})
  });
}
