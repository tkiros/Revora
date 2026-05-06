import {
  RevoraUserClarifySchema,
  RevoraUserNotFoodSchema,
  RevoraUserOutOfScopeSchema,
  RevoraUserResultSchema,
  RevoraUserRetrySchema
} from "./schemas";
import type { RevoraUserResponse } from "./schemas";
import type { SafetyContract } from "./safety-contract";

const INVALID_REQUEST_MESSAGE =
  "Enter a food or meal description and a numeric A1C value to get a Revora check.";
const RETRY_MESSAGE =
  "I couldn't produce a safe answer this time. Please try again with a simpler food description.";
const CARBS_ONLY_MODERATE_REASON =
  "This may have a higher blood-sugar impact because it leans heavily on refined carbs.";
const CARBS_ONLY_MODERATE_ADJUSTMENT =
  "If practical, add protein or nonstarchy vegetables to make it easier to handle.";
const CARBS_ONLY_MODERATE_SWAP =
  "If you have the option, swap to a less refined version.";
const CARBS_ONLY_HIGH_REASON =
  "This is likely a higher-impact choice because it is mostly sugary or refined carbs.";
const CARBS_ONLY_HIGH_ADJUSTMENT =
  "A smaller portion with protein or nonstarchy vegetables would be a steadier fit here.";
const CARBS_ONLY_HIGH_SWAP =
  "If you have the option, swap to a less sweet or less refined version.";

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

export function buildClarifyResponse(
  contract: SafetyContract,
  question: string
): RevoraUserResponse {
  return RevoraUserClarifySchema.parse({
    kind: "clarify",
    question,
    examples: [],
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

export function buildCarbsOnlyResponse(
  contract: SafetyContract,
  risk: "MODERATE" | "HIGH" = "MODERATE"
): RevoraUserResponse {
  return RevoraUserResultSchema.parse({
    kind: "result",
    risk,
    reason:
      risk === "HIGH" ? CARBS_ONLY_HIGH_REASON : CARBS_ONLY_MODERATE_REASON,
    adjustment:
      risk === "HIGH"
        ? CARBS_ONLY_HIGH_ADJUSTMENT
        : CARBS_ONLY_MODERATE_ADJUSTMENT,
    swap: risk === "HIGH" ? CARBS_ONLY_HIGH_SWAP : CARBS_ONLY_MODERATE_SWAP,
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
    return [
      "oatmeal with nuts",
      "grilled chicken with rice and vegetables",
      "egg scramble with spinach"
    ];
  }

  return [
    match[1].trim(),
    match[2].trim(),
    "egg scramble with spinach"
  ];
}
