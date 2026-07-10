/**
 * Revora proxy (né middleware; Next 16 rename) — pre-model abuse + cost gate
 * (Plans 04-02 + launch-hardening)
 *
 * Intercepts POST /api/check and /api/check/photo-draft and runs, in order, BEFORE any model spend:
 *   1. Launch-mode pause gate (Edge Config kill-switch).
 *   2. Per-IP rate limit + global daily cap (Upstash).
 *
 * Order matters: IP-blocked requests must NOT increment the global daily
 * counter, or an attacker could trip the global pause cheaply (handled inside
 * evaluateRateLimit). Production with no Upstash config fails CLOSED (never run
 * public + unlimited); dev/test without config skips limiting. Transient Redis
 * errors fail OPEN — the OpenAI dashboard hard cap is the true cost ceiling.
 *
 * Edge-runtime safe: does NOT call getRevoraEnv() (which requires
 * OPENAI_API_KEY and would throw when absent).
 */

import { NextRequest, NextResponse } from "next/server";
import { evaluateLaunchMode } from "./lib/revora/launch-controls";
import {
  createRateLimitDeps,
  evaluateRateLimit,
  getClientIp,
  type RateLimitDeps
} from "./lib/revora/rate-limit";
import { emitSafeEvent } from "./lib/revora/telemetry";

const CHECK_PATH = "/api/check";
const DEFAULT_PAUSE_DISCLAIMER = "Not medical advice.";
const RATE_LIMIT_COPY =
  "Revora is helping a lot of people right now. Please try again in a moment.";

// Built once per runtime; null when Upstash env is absent OR invalid (e.g. a
// rediss:// TCP URL instead of the https:// REST URL). The factory never
// throws — a throw at module scope here is a platform 500 on every matched
// request (launch audit BUG-01); null fails closed below on public deploys.
const rateLimitDeps: RateLimitDeps | null = createRateLimitDeps();

/**
 * True for any internet-reachable Vercel deploy (preview OR production). Preview
 * URLs are public and shareable, so a missing-Upstash misconfiguration there
 * must also fail closed — never run public + unlimited. Only genuine local dev
 * and the test runner skip limiting.
 */
function isPublicDeploy(): boolean {
  if (process.env.NODE_ENV === "test") return false;
  if (process.env.VERCEL_ENV === "preview" || process.env.VERCEL_ENV === "production") {
    return true;
  }
  return process.env.NODE_ENV === "production";
}

function environment(): "preview" | "production" | "development" | "test" {
  if (process.env.NODE_ENV === "test") return "test";
  switch (process.env.VERCEL_ENV) {
    case "preview":
      return "preview";
    case "production":
      return "production";
    case "development":
      return "development";
    default:
      return process.env.NODE_ENV === "production"
        ? "production"
        : "development";
  }
}

function pause503(message: string) {
  return NextResponse.json(
    { kind: "retry", message, disclaimer: DEFAULT_PAUSE_DISCLAIMER },
    { status: 503 }
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith(CHECK_PATH) || request.method !== "POST") {
    return NextResponse.next();
  }

  // 1. Global pause gate (existing behavior).
  const evaluation = await evaluateLaunchMode();
  if (!evaluation.ok) {
    return pause503(evaluation.message);
  }

  // 2. Inbound abuse + cost gate.
  if (!rateLimitDeps) {
    // Never run public + unlimited. Fail closed on any public deploy; skip in
    // local dev / test only.
    if (isPublicDeploy()) {
      emitSafeEvent({
        name: "check_failed",
        environment: environment(),
        reasonCode: "paused"
      });
      return pause503(RATE_LIMIT_COPY);
    }
    return NextResponse.next();
  }

  const decision = await evaluateRateLimit(
    getClientIp(request.headers),
    rateLimitDeps
  );
  if (!decision.ok) {
    emitSafeEvent({
      name: "check_failed",
      environment: environment(),
      reasonCode: decision.reason === "daily_cap" ? "daily_cap" : "rate_limited"
    });
    return NextResponse.json(
      {
        kind: "retry",
        message: RATE_LIMIT_COPY,
        disclaimer: DEFAULT_PAUSE_DISCLAIMER
      },
      {
        status: 429,
        headers: { "Retry-After": String(decision.retryAfterSeconds) }
      }
    );
  }

  return NextResponse.next();
}

export const config = { matcher: ["/api/check", "/api/check/photo-draft"] };
