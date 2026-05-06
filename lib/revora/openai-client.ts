import OpenAI from "openai";
import type { ResponseCreateParamsNonStreaming } from "openai/resources/responses/responses";

import { RevoraModelOutputSchema, revoraModelJsonSchema } from "./schemas";
import type { RevoraModelOutput } from "./schemas";
import type { RevoraPromptPayload } from "./prompt";

export const DEFAULT_REVORA_MODEL = "gpt-5.4-mini";
export const REVORA_JSON_SCHEMA_NAME = "revora_model_output";

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
  client?: OpenAIResponsesTransport;
}): RevoraModelClient {
  const model = options?.model ?? process.env.REVORA_MODEL ?? DEFAULT_REVORA_MODEL;
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
