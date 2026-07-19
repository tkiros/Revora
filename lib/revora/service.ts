import { routeA1C } from "./a1c";
import { classifyClinicalRisk } from "./clinical-risk";
import {
  buildClarifyResponse,
  buildClinicalResponse,
  buildInvalidRequestResponse,
  buildNotFoodResponse,
  buildOutOfScopeResponse,
  buildRetryResponse
} from "./fallback";
import { classifyInputBeforeModel } from "./input-precheck";
import type { RevoraModelClient } from "./openai-client";
import {
  assertNoForbiddenClaims,
  postprocessModelOutput,
  type SnapshotMetadata
} from "./postprocess";
import { buildRevoraPrompt } from "./prompt";
import { captureServerError } from "./sentry-capture";
import {
  CheckRequestSchema,
  RevoraUserClarifySchema,
  RevoraUserResponseSchema
} from "./schemas";
import type {
  RevoraModelOutput,
  RevoraPolicyFlag,
  RevoraUserResponse
} from "./schemas";
import { loadSafetyContract } from "./safety-contract";

// One live attempt only. At ~10s per attempt a second would land after the
// client's 12s abort — spending money on a response the browser has already
// discarded. The bounded SDK timeout (openai-client) + this cap keep the
// server budget under the client abort.
const MAX_MODEL_ATTEMPTS = 1;

export async function checkFood(
  rawRequest: unknown,
  deps: {
    model: RevoraModelClient;
    clarified?: boolean;
    /**
     * Optional Task 13 snapshot sink. When supplied, the conservative-floor
     * metadata that postprocess computes is written here for the caller to
     * persist. Absent for every other caller (pantry, evals), so their
     * behavior is unchanged.
     */
    snapshot?: SnapshotMetadata;
  }
): Promise<RevoraUserResponse> {
  const contract = loadSafetyContract();
  const parsedRequest = CheckRequestSchema.safeParse(rawRequest);

  if (!parsedRequest.success) {
    return buildInvalidRequestResponse(contract);
  }

  const request = parsedRequest.data;

  // Clinical risk is checked FIRST — before the A1C route, before the food
  // precheck, before any prompt is built (W-01).
  //
  // The ordering is the policy. "Medical precedence over meal classification"
  // is not a rule enforced somewhere downstream; it is a consequence of asking
  // the clinical question before the food question. A message carrying both a
  // valid meal and a medical one ("2 slices of pizza — how much insulin?")
  // therefore cannot reach the meal model, and an emergency reported by someone
  // whose A1C is out of range gets urgent-care copy rather than the calmer
  // out-of-scope route.
  //
  // No model call, no spend, no timeout, and no verdict: the clinical schema
  // has no `risk` field to put one in.
  const clinical = classifyClinicalRisk(request.food);

  if (clinical) {
    return buildClinicalResponse(contract, clinical.route);
  }

  const route = routeA1C(request.a1c);

  if (route.kind === "out_of_scope") {
    return buildOutOfScopeResponse(contract, route.band);
  }

  // One-clarification cap (§8): a follow-up answer to a prior clarify (signalled
  // by the route from the client) suppresses a second ambiguity question. The
  // clinical route above and the not_food/carbs_only floors inside the precheck
  // are unaffected — the cap silences the question, never the safety routing.
  const precheck = classifyInputBeforeModel(request.food, {
    clarified: deps.clarified
  });

  if (precheck.kind === "not_food") {
    return buildNotFoodResponse(contract, precheck.examples);
  }

  if (precheck.kind === "clarify") {
    return buildClarifyResponse(contract, precheck.question);
  }

  const precheckFlags = precheck.flags;
  const prompt = buildRevoraPrompt({
    request,
    contract,
    a1cBand: route.band,
    conservativeLevel: route.conservativeLevel,
    precheckFlags
  });

  for (let attempt = 0; attempt < MAX_MODEL_ATTEMPTS; attempt += 1) {
    try {
      const modelOutput = await deps.model.generate(prompt);
      return mapModelOutput(
        modelOutput,
        contract,
        route,
        precheckFlags,
        request.food,
        deps.snapshot
      );
    } catch (error) {
      // Single attempt: fail closed to controlled retry copy. The provider error
      // is otherwise invisible (we return retry, not check_failed) — surface it to
      // Sentry. captureServerError never throws and awaits flush; PII is stripped
      // at init + beforeSend; fully inert without SENTRY_DSN.
      await captureServerError(error, "model");
    }
  }

  return buildRetryResponse(contract);
}

function mapModelOutput(
  modelOutput: RevoraModelOutput,
  contract: ReturnType<typeof loadSafetyContract>,
  route: ReturnType<typeof routeA1C>,
  precheckFlags: RevoraPolicyFlag[],
  food: string,
  snapshot?: SnapshotMetadata
): RevoraUserResponse {
  switch (modelOutput.kind) {
    case "result":
    case "carbs_only":
      return postprocessModelOutput(modelOutput, {
        contract,
        route,
        precheckFlags,
        food,
        snapshot
      });
    case "clarify":
      // The clarify and not_food arms bypass postprocess entirely, so before
      // W-06 they were the one model-authored path with NO output-side claims
      // check at all — a banned claim smuggled into a clarifying question
      // ("Is that the version that spikes your glucose by 40 mg/dL?") would
      // have shipped. Same fail-closed contract as every other field.
      assertNoForbiddenClaims(contract, [
        modelOutput.question,
        ...modelOutput.examples
      ]);

      return RevoraUserResponseSchema.parse(
        RevoraUserClarifySchema.parse({
          kind: "clarify",
          question: modelOutput.question,
          examples: modelOutput.examples,
          disclaimer: contract.copy.disclaimer
        })
      );
    case "not_food":
      assertNoForbiddenClaims(contract, modelOutput.examples);
      return buildNotFoodResponse(contract, modelOutput.examples);
  }
}
