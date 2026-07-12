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
  /** The food the user described — for the component-mention rule (W-17). */
  food?: string;
};

/** Words too common to count as "naming a component of the meal". */
const COMPONENT_STOPWORDS = new Set([
  "with",
  "and",
  "the",
  "a",
  "an",
  "of",
  "or",
  "some",
  "my",
  "from",
  "for",
  "plain",
  "large",
  "small",
  "fresh",
  "hot",
  "cold",
  "meal",
  "food",
  "lunch",
  "dinner",
  "breakfast",
  "snack"
]);

/**
 * W-17 Tier 2.1 — does the advice name something the user actually typed?
 *
 * SHIPPED OFF BY DEFAULT (`REVORA_ENFORCE_COMPONENT_MENTION=1` to enable), and
 * that is a deliberate call, not timidity.
 *
 * This rule is fail-closed: a violation becomes a retry card. Turning it on
 * without first measuring its false-positive rate would degrade real users to
 * retry cards at an unknown rate — which is precisely the shape of the mistake
 * F-21 made (ship a model-behaviour change whose own evidence said "not yet").
 * The prompt instruction ships enabled and does the work; this assertion is the
 * enforcement, and it turns on when W-07's live run has measured the retry-rate
 * delta against the ≤2pt budget.
 */
export function mentionsMealComponent(food: string, advice: string): boolean {
  const tokens = food
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length > 2 && !COMPONENT_STOPWORDS.has(token));

  if (tokens.length === 0) {
    return true; // Nothing nameable — do not punish the model for it.
  }

  const lowered = advice.toLowerCase();
  return tokens.some((token) => {
    // Match the stem so "rice" hits "rice", and "potatoes" hits "potato".
    const stem = token.replace(/(?:es|s)$/, "");
    return lowered.includes(stem.length > 2 ? stem : token);
  });
}

function componentMentionEnforced(): boolean {
  return process.env.REVORA_ENFORCE_COMPONENT_MENTION === "1";
}

export class RevoraContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RevoraContractError";
  }
}

/**
 * Instruction/prompt leakage. Kept here (not in eval-rubric) because it must
 * run in PRODUCTION, not only in the eval harness — the eval-only copy was
 * half of finding N-01.
 */
const LEAK_PATTERN =
  /\b(system prompt|you are revora|allowed response kinds|policy[_ ]flags|json[_ ]schema|instructions:)\b/i;

/**
 * Compiled banned-output patterns, cached per contract (the regex strings live
 * as JSON in tests/fixtures/safety-contract.json and never change at runtime).
 */
const BANNED_PATTERN_CACHE = new WeakMap<SafetyContract, RegExp[]>();

function bannedOutputPatterns(contract: SafetyContract): RegExp[] {
  const cached = BANNED_PATTERN_CACHE.get(contract);
  if (cached) {
    return cached;
  }

  const { fixture } = contract;
  const patterns = [
    ...fixture.forbiddenClaims.map((entry) => new RegExp(entry.pattern, "i")),
    ...fixture.forbiddenPredictions.map(
      (entry) => new RegExp(entry.pattern, "i")
    ),
    ...fixture.qualitativeOnly.forbiddenPatterns.map(
      (entry) => new RegExp(entry.pattern, "i")
    ),
    LEAK_PATTERN
  ];

  BANNED_PATTERN_CACHE.set(contract, patterns);
  return patterns;
}

/**
 * The safety contract, actually enforced (N-01 / W-06).
 *
 * The contract has always defined regexes for banned claims ("cure",
 * "reverses"), banned predictions ("your A1C will drop to…"), and
 * quantitative claims ("spikes your glucose by 32 mg/dL"). They ran in the eval
 * harness. They never ran on a real model response — production injected only
 * the *labels* of these patterns into the prompt and then trusted the model to
 * obey. So the single control that was supposed to make a banned claim
 * structurally unable to reach a user was, in production, an instruction and a
 * hope.
 *
 * Fail-closed: a violation throws, which the service catches and turns into the
 * calm retry card. A retry card cannot carry a verdict, so the worst case of a
 * false positive is a user asked to rephrase — never a wrong answer shown.
 */
export function assertNoForbiddenClaims(
  contract: SafetyContract,
  fields: Array<string | null | undefined>
): void {
  const patterns = bannedOutputPatterns(contract);

  for (const text of fields) {
    if (!text) {
      continue;
    }

    for (const pattern of patterns) {
      if (pattern.test(text)) {
        throw new RevoraContractError(
          `Model output matched a banned pattern (${pattern.source}).`
        );
      }
    }
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

  // Runs on the FLOORED draft, i.e. the exact strings the user would read —
  // not on the raw model output, so a floor cannot reintroduce banned text.
  assertNoForbiddenClaims(context.contract, [
    result.reason,
    result.adjustment,
    result.swap
  ]);

  if (result.risk === "SAFE") {
    assertNoUnsafeSafeFields(result);
  } else {
    assertModerateHighFields(result, mergedFlags);

    if (
      componentMentionEnforced() &&
      context.food &&
      result.adjustment &&
      !mentionsMealComponent(context.food, result.adjustment)
    ) {
      throw new RevoraContractError(
        "Adjustment must name a component of the described meal."
      );
    }
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

  if (flags.has("carbs_only") && !hasCarbsOnlyCompanionGuidance(result.adjustment)) {
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
      !hasCarbsOnlyCompanionGuidance(result.adjustment) ||
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

const CARBS_ONLY_COMPANION_TARGET =
  "(?:protein|non[- ]starchy vegetables?|eggs?|egg whites?|greek yogurt|yogurt|cottage cheese|chicken|turkey|tuna|salmon|fish|tofu|tempeh|beans?|lentils?|nuts?|seeds?|side salad|salad|spinach|broccoli|greens)";
const CARBS_ONLY_EXPLICIT_ADD_OR_PAIR_PATTERN = new RegExp(
  String.raw`\b(?:add|pair|include|combine|top)\b[^.?!\n]{0,80}\b${CARBS_ONLY_COMPANION_TARGET}\b`,
  "i"
);
const CARBS_ONLY_WITH_COMPANION_PATTERN = new RegExp(
  String.raw`\b(?:with|alongside)\b[^.?!\n]{0,40}\b${CARBS_ONLY_COMPANION_TARGET}\b`,
  "i"
);
const CARBS_ONLY_SEQUENCING_ONLY_PATTERN =
  /\bvegetables?\s+first\b|\beat\s+(?:the\s+)?vegetables?\s+first\b|\bstart\s+with\s+(?:vegetables?|fiber)\b|\bbegin\s+with\s+(?:vegetables?|fiber)\b|\bbefore\s+the\s+carbs\b/i;

function looksLikeSwap(value: string): boolean {
  return /\bswap\b|\binstead of\b|\bchoose\b|\bless refined\b|\bless sweet\b|\bwhole[- ]grain\b|\bbrown rice\b|\bbeans?\b|\blentil/i.test(
    value
  );
}

function hasCarbsOnlyCompanionGuidance(value: string | null): boolean {
  if (value === null) {
    return false;
  }

  if (CARBS_ONLY_EXPLICIT_ADD_OR_PAIR_PATTERN.test(value)) {
    return true;
  }

  return (
    CARBS_ONLY_WITH_COMPANION_PATTERN.test(value) &&
    !CARBS_ONLY_SEQUENCING_ONLY_PATTERN.test(value)
  );
}
