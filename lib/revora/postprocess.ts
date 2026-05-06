import type { A1CRoute } from "./a1c";
import { buildCarbsOnlyResponse } from "./fallback";
import { RevoraUserResultSchema } from "./schemas";
import type {
  RevoraModelOutput,
  RevoraPolicyFlag,
  RevoraRisk,
  RevoraUserResponse
} from "./schemas";
import type { SafetyContract } from "./safety-contract";

type ResultDraft = {
  risk: RevoraRisk;
  reason: string;
  adjustment: string | null;
  swap: string | null;
};

export type PostprocessContext = {
  contract: SafetyContract;
  route: A1CRoute;
  precheckFlags: RevoraPolicyFlag[];
};

export class RevoraContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RevoraContractError";
  }
}

export function postprocessModelOutput(
  modelOutput: RevoraModelOutput,
  context: PostprocessContext
): Extract<RevoraUserResponse, { kind: "result" }> {
  if (context.route.kind !== "in_scope") {
    throw new RevoraContractError(
      "Result post-processing only accepts in-scope A1C routes."
    );
  }

  if (modelOutput.risk === null || modelOutput.reason === null) {
    throw new RevoraContractError(
      "Result outputs must include a risk and reason."
    );
  }

  const mergedFlags = new Set<RevoraPolicyFlag>([
    ...context.precheckFlags,
    ...modelOutput.policy_flags
  ]);

  const result = applyConservativeFloors(
    {
      risk: modelOutput.risk,
      reason: modelOutput.reason,
      adjustment: modelOutput.adjustment,
      swap: modelOutput.swap
    },
    {
      ...context,
      precheckFlags: [...mergedFlags]
    }
  );

  assertOneSentence("reason", result.reason);

  if (result.risk === "SAFE") {
    assertNoUnsafeSafeFields(result);
  } else {
    assertModerateHighFields(result, mergedFlags);
  }

  return RevoraUserResultSchema.parse({
    kind: "result",
    risk: result.risk,
    reason: result.reason,
    adjustment: result.adjustment,
    swap: result.swap,
    disclaimer: context.contract.copy.disclaimer
  });
}

export function assertOneSentence(field: string, value: string): void {
  const normalized = value.trim();
  const sentenceEndings = normalized.match(/[.!?](?=\s|$)/g) ?? [];

  if (normalized.length === 0 || sentenceEndings.length > 1) {
    throw new RevoraContractError(
      `${field} must be exactly one plain-English sentence.`
    );
  }
}

export function assertNoUnsafeSafeFields(result: ResultDraft): void {
  if (result.risk !== "SAFE") {
    return;
  }

  if (!isPermissionFirstReason(result.reason)) {
    throw new RevoraContractError(
      "SAFE results must lead with permission-first reassurance."
    );
  }

  if (result.adjustment !== null || result.swap !== null) {
    throw new RevoraContractError(
      "SAFE results cannot include an adjustment or swap."
    );
  }
}

export function assertModerateHighFields(
  result: ResultDraft,
  flags: ReadonlySet<RevoraPolicyFlag>
): void {
  if (result.risk === "SAFE") {
    return;
  }

  if (result.adjustment === null || result.swap === null) {
    throw new RevoraContractError(
      "MODERATE and HIGH results require one adjustment and one swap."
    );
  }

  assertOneSentence("adjustment", result.adjustment);
  assertOneSentence("swap", result.swap);

  if (!looksLikeSwap(result.swap)) {
    throw new RevoraContractError(
      "MODERATE and HIGH results require a lower-glycemic swap."
    );
  }

  if (flags.has("carbs_only") && !mentionsProteinOrVegetables(result.adjustment)) {
    throw new RevoraContractError(
      "Carbs-only adjustments must add protein or nonstarchy vegetables."
    );
  }
}

export function applyConservativeFloors(
  result: ResultDraft,
  context: PostprocessContext
): ResultDraft {
  const flags = new Set(context.precheckFlags);
  const highRisk = flags.has("high_risk");
  const upperBandBorderline =
    context.route.kind === "in_scope" &&
    context.route.band === "prediabetes_63_64" &&
    (flags.has("borderline") || flags.has("carbs_only"));

  if (
    highRisk &&
    (result.risk !== "HIGH" ||
      result.adjustment === null ||
      result.swap === null)
  ) {
    return buildFloorDraft(context.contract, "HIGH");
  }

  if (flags.has("carbs_only")) {
    if (
      result.risk === "SAFE" ||
      !mentionsProteinOrVegetables(result.adjustment) ||
      result.swap === null ||
      !looksLikeSwap(result.swap)
    ) {
      return buildFloorDraft(context.contract, highRisk ? "HIGH" : "MODERATE");
    }
  }

  if (upperBandBorderline && result.risk === "SAFE") {
    return buildFloorDraft(context.contract, "MODERATE");
  }

  return result;
}

function buildFloorDraft(
  contract: SafetyContract,
  risk: "MODERATE" | "HIGH"
): ResultDraft {
  const floored = buildCarbsOnlyResponse(contract, risk);

  if (floored.kind !== "result") {
    throw new RevoraContractError("Expected a result fallback for floors.");
  }

  return {
    risk: floored.risk,
    reason: floored.reason,
    adjustment: floored.adjustment,
    swap: floored.swap
  };
}

function isPermissionFirstReason(reason: string): boolean {
  return /^(this looks|this seems|this is|you can|you likely)/i.test(
    reason.trim()
  );
}

function looksLikeSwap(value: string): boolean {
  return /\bswap\b|\binstead of\b|\bchoose\b|\bless refined\b|\bless sweet\b|\bwhole[- ]grain\b|\bbrown rice\b|\bbeans?\b|\blentil/i.test(
    value
  );
}

function mentionsProteinOrVegetables(value: string | null): boolean {
  if (value === null) {
    return false;
  }

  return /\bprotein\b|\bnonstarchy vegetables\b|\bvegetables\b|\bfiber\b/i.test(
    value
  );
}
