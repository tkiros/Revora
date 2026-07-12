import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { routeA1C } from "../../../lib/revora/a1c";
import { deriveCoachOutputs } from "../../../lib/revora/coach-outputs";
import { buildRetryResponse } from "../../../lib/revora/fallback";
import {
  activeModelId,
  createOpenAIRevoraModelClient,
  type RevoraModelClient
} from "../../../lib/revora/openai-client";
import { PROMPT_VERSION } from "../../../lib/revora/prompt";
import {
  CONTRACT_VERSION,
  loadSafetyContract
} from "../../../lib/revora/safety-contract";
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
  countChecksToday,
  getEntitlement,
  FREE_DAILY_CHECKS
} from "../../../lib/server/entitlement";
import { fetchPlaySubscription } from "../../../lib/server/play-api";
import { paywallMode } from "../../../lib/server/pricing";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../lib/server/session";

export const runtime = "nodejs";

// Hard ceiling on function execution. Sits above the 10s OpenAI client timeout
// (server budget) and below/at the Vercel plan's function-duration limit so a
// stuck call is cut, not left hanging. REL-03 verified 2026-07-11: the active
// plan (Hobby, Fluid compute, 300s default limit) accepts 15 — the production
// deploy builds and serves with this value, and Vercel hard-fails builds that
// exceed the plan limit. Still ≥ the 12s client abort (plan A1/B7).
export const maxDuration = 15;

type CheckRouteDeps = {
  checkFoodImpl?: typeof checkFood;
  emitEvent?: typeof emitSafeEvent;
  modelFactory?: (model?: string) => RevoraModelClient;
  now?: () => number;
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  playLookup?: typeof fetchPlaySubscription;
  paywallMode?: () => "legacy" | "trial";
};

// Calm upsell, never a scary wall (plan 4D): the daily loop keeps working
// tomorrow; premium removes the limit. The count is derived from
// FREE_DAILY_CHECKS so the copy can never drift from the real limit.
const COUNT_WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten"
] as const;
const FREE_LIMIT_WORD = COUNT_WORDS[FREE_DAILY_CHECKS] ?? String(FREE_DAILY_CHECKS);
const FREE_LIMIT_MESSAGE = `You've used today's ${FREE_LIMIT_WORD} free checks. Premium removes the daily limit and keeps your full history — or check back in with your first meal tomorrow.`;

// Hard wall (Decision D): under PAYWALL_MODE=trial there are no residual free
// checks. The client renders this as the wall CTA; the copy stays calm and
// names the exact next step.
export const TRIAL_WALL_MESSAGE =
  "Your free taste of Revora was yesterday's checks. Start your free week — card required, unlimited everything, and we email you before any charge — to keep going.";

// Model selection (W-02, reversing the 2026-07-11 tiering decision).
//
// Every check — guest, trialing, or paying — runs on the primary model
// (REVORA_MODEL, default gpt-5.4-mini). There is deliberately NO per-user
// routing here.
//
// The removed code downgraded a user to gpt-5.4-nano after 10 stored checks.
// Because the trial wall 402s every non-premium session upstream of that line,
// the only sessions that could ever reach it were *paying and trialing* ones —
// so the downgrade applied exclusively to customers, silently, while the wall
// sold them "unlimited everything". It also contradicted the repo's own
// bakeoff, which failed nano on the ≥98% schema-validity threshold and scoped
// it to provider-outage degradation only.
//
// Nano remains reachable as a manual outage fallback by setting REVORA_MODEL
// (openai-client.ts) — a deliberate, disclosed, whole-fleet decision rather
// than an invisible per-user one. Any future routing must first pass the full
// ratified gate on the production provider path, and must be disclosed.
const modelClients = new Map<string, RevoraModelClient>();

function getModelClient(model?: string) {
  const key = model ?? "default";
  let client = modelClients.get(key);
  if (!client) {
    client = createOpenAIRevoraModelClient(model ? { model } : {});
    modelClients.set(key, client);
  }
  return client;
}

export function createCheckRouteHandler(deps: CheckRouteDeps = {}) {
  const checkFoodImpl = deps.checkFoodImpl ?? checkFood;
  const emitEvent = deps.emitEvent ?? emitSafeEvent;
  const modelFactory = deps.modelFactory ?? getModelClient;
  const now = deps.now ?? Date.now;
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const playLookup = deps.playLookup ?? fetchPlaySubscription;
  const paywallModeDep = deps.paywallMode ?? (() => paywallMode());

  return async function POST(request: Request) {
    const startedAt = now();
    const environment = getEnvironment();
    let body: unknown = null;

    try {
      body = await request.json();
    } catch {
      body = null;
    }

    // 4D free tier, enforced server-side BEFORE any model spend. Signed-in
    // only (guests are metered by the existing IP rate limit); fail-open on
    // any error — metering must never take the product down.
    try {
      const session = await getSession();
      if (session) {
        const entitlement = await getEntitlement(db(), session.userId, {
          refreshPlaySubscription: (token) => playLookup(token)
        });
        const mode = paywallModeDep();

        if (mode === "trial") {
          // Hard wall: any signed-in user without an active entitlement
          // (lapsed/none) is stopped before any model spend — no residual free
          // checks, so countChecksToday never runs. trialing/premium fall
          // through untouched. reasonCode "daily_cap" is reused deliberately;
          // the mode is distinguishable from the paywall config in analysis.
          if (entitlement.tier !== "premium") {
            emitEvent({
              name: "check_failed",
              environment,
              reasonCode: "daily_cap",
              latencyBucket: getLatencyBucket(now() - startedAt)
            });
            return NextResponse.json(
              {
                kind: "upsell",
                upsellKind: "trial",
                message: TRIAL_WALL_MESSAGE,
                disclaimer: loadSafetyContract().copy.disclaimer
              },
              { status: 402 }
            );
          }
        } else if (entitlement.tier === "free") {
          const [profile] = await db()
            .select({ timezone: schema.profiles.timezone })
            .from(schema.profiles)
            .where(eq(schema.profiles.userId, session.userId));
          const used = await countChecksToday(
            db(),
            session.userId,
            profile?.timezone ?? "America/New_York"
          );

          if (used >= FREE_DAILY_CHECKS) {
            emitEvent({
              name: "check_failed",
              environment,
              reasonCode: "daily_cap",
              latencyBucket: getLatencyBucket(now() - startedAt)
            });
            return NextResponse.json(
              {
                kind: "upsell",
                upsellKind: "legacy",
                message: FREE_LIMIT_MESSAGE,
                disclaimer: loadSafetyContract().copy.disclaimer
              },
              { status: 402 }
            );
          }
        }
      }
    } catch (error) {
      await captureServerError(error, "route");
    }

    try {
      const response = await checkFoodImpl(body, {
        model: modelFactory(undefined)
      });

      const durationMs = now() - startedAt;

      emitEvent({
        name: "check_completed",
        environment,
        responseKind: response.kind,
        risk: response.kind === "result" ? response.risk : undefined,
        // W-01: which clinical class fired — never the text that matched it.
        clinicalRoute:
          response.kind === "clinical" ? response.route : undefined,
        latencyBucket: getLatencyBucket(durationMs),
        // W-13: raw ms makes p95 computable (the buckets never could); the
        // model + version stamps make a reported bad answer reproducible.
        durationMs,
        model: activeModelId(),
        promptVersion: PROMPT_VERSION,
        contractVersion: CONTRACT_VERSION
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
      //
      // W-17: the food text decides suppression (a drink gets no plate-
      // sequencing tip) and the rotation counter cycles the phrase bank so a
      // daily user is not read the same three sentences every day. Both are
      // used to select AUDITED copy and neither is persisted or logged.
      return NextResponse.json({
        ...response,
        ...deriveCoachOutputs(response, {
          food: readFood(body),
          rotation: readRotation(request.headers),
          seed: request.headers.get("x-revora-client-id") ?? undefined
        })
      });
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
      inputMethod:
        methodHeader === "voice" || methodHeader === "photo"
          ? methodHeader
          : "text",
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

/**
 * The food text, read defensively off the raw body (which is `unknown` here —
 * the engine does its own strict parse). Used ONLY to pick which audited coach
 * sentence to render; never persisted, never logged, never sent to telemetry.
 */
function readFood(body: unknown): string | undefined {
  if (!body || typeof body !== "object" || !("food" in body)) {
    return undefined;
  }

  const food = (body as { food: unknown }).food;
  return typeof food === "string" ? food : undefined;
}

/**
 * Monotonic per-client counter that cycles the coach phrase bank (W-17).
 *
 * Client-supplied and therefore forgeable — which is fine, because the only
 * thing it can influence is WHICH pre-approved sentence a user sees. It touches
 * no verdict, no entitlement, and no safety floor. Absent (older clients,
 * curl) → the bank falls back to hashing the per-check id.
 */
function readRotation(headers: Headers): number | undefined {
  const raw = headers.get("x-revora-coach-rotation");
  if (!raw) {
    return undefined;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
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

  // Network blip vs provider outage split (REL-01).
  if (error instanceof Error && error.name === "RevoraConnectionError") {
    return "connection_blip";
  }

  if (error instanceof Error && /schema|zod|json/i.test(error.message)) {
    return "schema_error";
  }

  return "provider_error";
}
