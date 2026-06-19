import { NextResponse } from "next/server";

import { getLaunchControls } from "../../../lib/revora/launch-controls";
import { getRevoraEnv } from "../../../lib/revora/env";

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
        launchMode: "normal"
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
    launchMode
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
