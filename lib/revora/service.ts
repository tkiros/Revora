import { buildInvalidRequestResponse, buildNotFoodResponse, buildOutOfScopeResponse, buildRetryResponse } from "./fallback";
import type { RevoraModelClient } from "./openai-client";
import { buildRevoraPrompt } from "./prompt";
import {
  CheckRequestSchema,
  RevoraUserClarifySchema,
  RevoraUserResponseSchema,
  RevoraUserResultSchema
} from "./schemas";
import type { RevoraModelOutput, RevoraUserResponse } from "./schemas";
import { loadSafetyContract } from "./safety-contract";

const MAX_MODEL_ATTEMPTS = 2;

export async function checkFood(
  rawRequest: unknown,
  deps: { model: RevoraModelClient }
): Promise<RevoraUserResponse> {
  const contract = loadSafetyContract();
  const parsedRequest = CheckRequestSchema.safeParse(rawRequest);

  if (!parsedRequest.success) {
    return buildInvalidRequestResponse(contract);
  }

  const request = parsedRequest.data;
  const route = routeA1C(request.a1c);

  if (route) {
    return buildOutOfScopeResponse(contract, route);
  }

  const prompt = buildRevoraPrompt({
    request,
    contract
  });

  for (let attempt = 0; attempt < MAX_MODEL_ATTEMPTS; attempt += 1) {
    try {
      const modelOutput = await deps.model.generate(prompt);
      return mapModelOutput(modelOutput, contract);
    } catch {
      // Retry once, then fail closed to controlled retry copy.
    }
  }

  return buildRetryResponse(contract);
}

function routeA1C(
  a1c: number
): "below_prediabetes_range" | "diabetes_range_out_of_scope" | null {
  if (a1c < 5.7) {
    return "below_prediabetes_range";
  }

  if (a1c >= 6.5) {
    return "diabetes_range_out_of_scope";
  }

  return null;
}

function mapModelOutput(
  modelOutput: RevoraModelOutput,
  contract: ReturnType<typeof loadSafetyContract>
): RevoraUserResponse {
  switch (modelOutput.kind) {
    case "result":
    case "carbs_only":
      return mapResultOutput(modelOutput, contract);
    case "clarify":
      return RevoraUserResponseSchema.parse(
        RevoraUserClarifySchema.parse({
          kind: "clarify",
          question: modelOutput.question,
          examples: modelOutput.examples,
          disclaimer: contract.copy.disclaimer
        })
      );
    case "not_food":
      return buildNotFoodResponse(contract, modelOutput.examples);
  }
}

function mapResultOutput(
  modelOutput: RevoraModelOutput,
  contract: ReturnType<typeof loadSafetyContract>
): RevoraUserResponse {
  return RevoraUserResponseSchema.parse(
    RevoraUserResultSchema.parse({
      kind: "result",
      risk: modelOutput.risk,
      reason: modelOutput.reason,
      adjustment: modelOutput.adjustment,
      swap: modelOutput.swap,
      disclaimer: contract.copy.disclaimer
    })
  );
}
