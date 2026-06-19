/**
 * Revora middleware — pre-model pause gate (Plan 04-02)
 *
 * Intercepts requests to /api/check and evaluates launch mode before any
 * model spend occurs. If public checks are paused (via Edge Config or the
 * REVORA_LAUNCH_MODE_OVERRIDE test seam), returns a friendly 503 with calm
 * copy instead of forwarding to the OpenAI path.
 *
 * The public page and /api/health remain accessible regardless of launch mode.
 *
 * Edge-runtime safe: does NOT call getRevoraEnv() (which requires
 * OPENAI_API_KEY and would throw when absent). Reads only launch-control
 * state via getLaunchControls() which is designed to never throw.
 */

import { NextRequest, NextResponse } from "next/server";
import { evaluateLaunchMode } from "./lib/revora/launch-controls";

// Only gate the public check path — everything else passes through.
const CHECK_PATH = "/api/check";

// Default pause copy for middleware responses (keeps it independent of
// loadSafetyContract() which may do filesystem reads incompatible with Edge).
const DEFAULT_PAUSE_DISCLAIMER = "Not medical advice.";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept POST /api/check — passthrough everything else
  if (pathname !== CHECK_PATH || request.method !== "POST") {
    return NextResponse.next();
  }

  const evaluation = await evaluateLaunchMode();

  if (!evaluation.ok) {
    // Paused: return friendly 503 before any model spend
    return NextResponse.json(
      {
        kind: "retry",
        message: evaluation.message,
        disclaimer: DEFAULT_PAUSE_DISCLAIMER
      },
      { status: 503 }
    );
  }

  // Normal mode: forward to the route handler
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/check"]
};
