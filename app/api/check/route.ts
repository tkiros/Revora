import { NextResponse } from "next/server";

import { buildRetryResponse } from "../../../lib/revora/fallback";
import {
  createOpenAIRevoraModelClient,
  type RevoraModelClient
} from "../../../lib/revora/openai-client";
import { loadSafetyContract } from "../../../lib/revora/safety-contract";
import { checkFood } from "../../../lib/revora/service";
import {
  emitSafeEvent,
  type SafeTelemetryEvent
} from "../../../lib/revora/telemetry";

export const runtime = "nodejs";

// Hard ceiling on function execution. Sits above the 10s OpenAI client timeout
// (server budget) and below/at the Vercel plan's function-duration limit so a
// stuck call is cut, not left hanging. ponytail: 15 is a safe default; OPS MUST
// verify it is ≤ the active Vercel plan limit (Hobby has historically capped
// low — Pro may be required) and ≥ the 12s client abort (plan A1/B7) before
// production. Adjust here if the plan limit differs.
export const maxDuration = 15;

type CheckRouteDeps = {
  checkFoodImpl?: typeof checkFood;
  emitEvent?: typeof emitSafeEvent;
  modelFactory?: () => RevoraModelClient;
  now?: () => number;
};

let model: RevoraModelClient | null = null;

function getModelClient() {
  model ??= createOpenAIRevoraModelClient();
  return model;
}

export function createCheckRouteHandler(deps: CheckRouteDeps = {}) {
  const checkFoodImpl = deps.checkFoodImpl ?? checkFood;
  const emitEvent = deps.emitEvent ?? emitSafeEvent;
  const modelFactory = deps.modelFactory ?? getModelClient;
  const now = deps.now ?? Date.now;

  return async function POST(request: Request) {
    const startedAt = now();
    const environment = getEnvironment();
    let body: unknown = null;

    try {
      body = await request.json();
    } catch {
      body = null;
    }

    try {
      const response = await checkFoodImpl(body, { model: modelFactory() });

      emitEvent({
        name: "check_completed",
        environment,
        responseKind: response.kind,
        risk: response.kind === "result" ? response.risk : undefined,
        latencyBucket: getLatencyBucket(now() - startedAt)
      });

      return NextResponse.json(response);
    } catch (error) {
      emitEvent({
        name: "check_failed",
        environment,
        reasonCode: classifyFailureReason(error),
        latencyBucket: getLatencyBucket(now() - startedAt)
      });

      return NextResponse.json(buildRetryResponse(loadSafetyContract()));
    }
  };
}

export const POST = createCheckRouteHandler();

function getEnvironment(
  input: NodeJS.ProcessEnv = process.env
): SafeTelemetryEvent["environment"] {
  if (input.NODE_ENV === "test") {
    return "test";
  }

  switch (input.VERCEL_ENV) {
    case "preview":
      return "preview";
    case "production":
      return "production";
    case "development":
      return "development";
    default:
      return input.NODE_ENV === "production" ? "production" : "development";
  }
}

function getLatencyBucket(
  durationMs: number
): NonNullable<SafeTelemetryEvent["latencyBucket"]> {
  if (durationMs < 2_000) {
    return "<2s";
  }

  if (durationMs < 5_000) {
    return "2-5s";
  }

  if (durationMs <= 12_000) {
    return "5-12s";
  }

  return ">12s";
}

function classifyFailureReason(
  error: unknown
): NonNullable<SafeTelemetryEvent["reasonCode"]> {
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    error.status === 429
  ) {
    return "rate_limited";
  }

  if (error instanceof SyntaxError) {
    return "schema_error";
  }

  if (error instanceof Error && /schema|zod|json/i.test(error.message)) {
    return "schema_error";
  }

  return "provider_error";
}
