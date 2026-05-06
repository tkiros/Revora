import {
  RevoraUserNotFoodSchema,
  RevoraUserOutOfScopeSchema,
  RevoraUserRetrySchema
} from "./schemas";
import type { RevoraUserResponse } from "./schemas";
import type { SafetyContract } from "./safety-contract";

const INVALID_REQUEST_MESSAGE =
  "Enter a food or meal description and a numeric A1C value to get a Revora check.";
const RETRY_MESSAGE =
  "I couldn't produce a safe answer this time. Please try again with a simpler food description.";

export function buildInvalidRequestResponse(
  contract: SafetyContract
): RevoraUserResponse {
  return RevoraUserRetrySchema.parse({
    kind: "retry",
    message: INVALID_REQUEST_MESSAGE,
    disclaimer: contract.copy.disclaimer
  });
}

export function buildRetryResponse(
  contract: SafetyContract
): RevoraUserResponse {
  return RevoraUserRetrySchema.parse({
    kind: "retry",
    message: RETRY_MESSAGE,
    disclaimer: contract.copy.disclaimer
  });
}

export function buildOutOfScopeResponse(
  contract: SafetyContract,
  route: "below_prediabetes_range" | "diabetes_range_out_of_scope"
): RevoraUserResponse {
  return RevoraUserOutOfScopeSchema.parse({
    kind: "out_of_scope",
    route,
    message:
      route === "below_prediabetes_range"
        ? contract.copy.belowRangeRoute
        : contract.copy.highRangeRoute,
    disclaimer: contract.copy.disclaimer
  });
}

export function buildNotFoodResponse(
  contract: SafetyContract,
  examples: string[]
): RevoraUserResponse {
  return RevoraUserNotFoodSchema.parse({
    kind: "not_food",
    message: contract.copy.nonFoodRefusal,
    examples: examples.length > 0 ? examples : fallbackExamples(contract),
    disclaimer: contract.copy.disclaimer
  });
}

function fallbackExamples(contract: SafetyContract): string[] {
  const match = contract.copy.nonFoodRefusal.match(
    /something like (.+?) or (.+?)[.]?$/
  );

  if (!match) {
    return ["oatmeal with nuts", "grilled chicken with rice and vegetables"];
  }

  return [match[1], match[2]].map((value) => value.trim());
}
