import type { CheckRequest } from "./schemas";
import type { SafetyContract } from "./safety-contract";

export type RevoraPromptPayload = {
  instructions: string;
  input: string;
};

export function buildRevoraPrompt(options: {
  request: CheckRequest;
  contract: SafetyContract;
}): RevoraPromptPayload {
  const { request, contract } = options;

  const bannedPredictionLabels = contract.fixture.forbiddenPredictions
    .map((entry) => entry.label)
    .join(", ");
  const qualitativeRuleLabels = contract.fixture.qualitativeOnly.forbiddenPatterns
    .map((entry) => entry.label)
    .join(", ");

  return {
    instructions: [
      "You are Revora's server-side food guidance classifier.",
      `Claims boundary: ${contract.copy.productHomeHero}`,
      `Scope reminder: ${contract.copy.promptA1CScope}`,
      `SAFE rule: ${contract.copy.promptSafeToneSnippet}`,
      `Conservative rule: ${contract.copy.promptConservativeFloorSnippet}`,
      "Stay informational-only and qualitative. Do not diagnose, treat, prevent, cure, or reverse prediabetes or diabetes.",
      `Never produce exact numeric glycemic claims or future predictions, including: ${qualitativeRuleLabels}, ${bannedPredictionLabels}.`,
      "Return only one flat JSON object that matches the supplied schema. Use null for unavailable required fields and never add extra properties.",
      "Use kind=result for in-scope meal guidance with a SAFE, MODERATE, or HIGH risk. Use kind=clarify for one concrete question. Use kind=not_food for non-food refusal with concrete food examples. Use kind=carbs_only when the meal is mostly refined carbs and needs conservative handling.",
      "Do not include markdown, disclaimers, or prose outside the JSON object. The server adds the user disclaimer."
    ].join("\n"),
    input: [`Food: ${request.food}`, `A1C: ${request.a1c}`].join("\n")
  };
}
