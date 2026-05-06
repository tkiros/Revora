import { routeA1C } from "./a1c";
import {
  buildClarifyResponse,
  buildInvalidRequestResponse,
  buildNotFoodResponse,
  buildOutOfScopeResponse,
  buildRetryResponse
} from "./fallback";
import { classifyInputBeforeModel } from "./input-precheck";
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

  if (route.kind === "out_of_scope") {
    return buildOutOfScopeResponse(contract, route.band);
  }

  const precheck = classifyInputBeforeModel(request.food);

  if (precheck.kind === "not_food") {
    return buildNotFoodResponse(contract, precheck.examples);
  }

  if (precheck.kind === "clarify") {
    return buildClarifyResponse(contract, precheck.question);
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
