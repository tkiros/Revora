import { NextResponse } from "next/server";

import { getLaunchControls } from "../../../lib/revora/launch-controls";
import { getRevoraEnv } from "../../../lib/revora/env";
import { isRateLimitConfigured } from "../../../lib/revora/rate-limit";

export const runtime = "nodejs";

export async function GET() {
  let environment: "preview" | "production" | "development" | "test";

  try {
    const env = getRevoraEnv();
    environment = env.environment;
  } catch {
    // OPENAI_API_KEY missing — still report env/launch state from what we know
    environment = detectEnvironment(process.env);

    return NextResponse.json(
      {
        ok: false,
        environment,
        launch: "missing_config",
        launchMode: "normal",
        upstash: isRateLimitConfigured() ? "configured" : "unconfigured"
      },
      { status: 503 }
    );
  }

  // Read launch state from the shared seam (same state the middleware uses)
  const controls = await getLaunchControls();
  const launchMode = controls.launchMode;
  const isPaused = !controls.publicChecksEnabled || launchMode === "paused";

  return NextResponse.json({
    ok: true,
    environment,
    launch: isPaused ? "paused" : "ready",
    launchMode,
    // Surfaces the merge-gate dependency: middleware fails CLOSED (503) on a
    // public deploy when Upstash env is absent. ponytail: presence only, no live
    // ping and no client construction — the limiter fails open on reachability, so
    // a ping failure isn't app-fatal and doesn't belong in a frequently-hit probe.
    upstash: isRateLimitConfigured() ? "configured" : "unconfigured"
  });
}

function detectEnvironment(
  input: NodeJS.ProcessEnv
): "preview" | "production" | "development" | "test" {
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
