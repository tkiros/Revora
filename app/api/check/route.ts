import { NextResponse } from "next/server";

import { routeA1C } from "../../../lib/revora/a1c";
import { deriveCoachOutputs } from "../../../lib/revora/coach-outputs";
import { buildRetryResponse } from "../../../lib/revora/fallback";
import {
  createOpenAIRevoraModelClient,
  type RevoraModelClient
} from "../../../lib/revora/openai-client";
import { loadSafetyContract } from "../../../lib/revora/safety-contract";
import { CheckRequestSchema } from "../../../lib/revora/schemas";
import { captureServerError } from "../../../lib/revora/sentry-capture";
import { checkFood } from "../../../lib/revora/service";
import {
  emitSafeEvent,
  type SafeTelemetryEvent
} from "../../../lib/revora/telemetry";
import { encryptField } from "../../../lib/server/crypto";
import { getDb, schema, type Db } from "../../../lib/server/db";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../lib/server/session";

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
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
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
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;

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

      // 4B: meal memory for signed-in users. Fail-soft by design — a broken
      // DB must never break the check itself (incident runbook scenario).
      if (response.kind === "result") {
        try {
          await persistCheck({
            db,
            getSession,
            body,
            risk: response.risk,
            headers: request.headers
          });
        } catch (error) {
          await captureServerError(error, "route");
        }
      }

      // Decision card v2 (plan P1): coach outputs are derived rule-based from
      // the engine response at the route layer — the engine stays untouched.
      return NextResponse.json({ ...response, ...deriveCoachOutputs(response) });
    } catch (error) {
      // Surface schema/infra throws to Sentry (awaited, guarded, no-op without
      // SENTRY_DSN), then keep the existing safe telemetry + calm retry response
      // unchanged. captureServerError never throws, so the calm-retry contract
      // below always runs.
      await captureServerError(error, "route");

      emitEvent({
        name: "check_failed",
        environment,
        reasonCode: classifyFailureReason(error),
        latencyBucket: getLatencyBucket(now() - startedAt)
      });

      const retry = buildRetryResponse(loadSafetyContract());
      return NextResponse.json({ ...retry, ...deriveCoachOutputs(retry) });
    }
  };
}

export const POST = createCheckRouteHandler();

async function persistCheck(input: {
  db: () => Db;
  getSession: () => Promise<SessionInfo>;
  body: unknown;
  risk: "SAFE" | "MODERATE" | "HIGH";
  headers: Headers;
}): Promise<void> {
  const session = await input.getSession();
  if (!session) {
    return; // guests: nothing stored, existing promise intact
  }

  const parsed = CheckRequestSchema.safeParse(input.body);
  if (!parsed.success) {
    return;
  }

  const route = routeA1C(parsed.data.a1c);
  if (route.kind !== "in_scope") {
    return;
  }

  const methodHeader = input.headers.get("x-revora-input-method");
  const clientId = input.headers.get("x-revora-client-id");

  await input
    .db()
    .insert(schema.checks)
    .values({
      userId: session.userId,
      foodCiphertext: encryptField(parsed.data.food),
      risk: input.risk,
      a1cBand: route.band,
      inputMethod: methodHeader === "voice" ? "voice" : "text",
      clientId: clientId && clientId.length <= 64 ? clientId : null
    })
    .onConflictDoNothing();
}

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
