import { NextResponse } from "next/server";

import { getRevoraEnv } from "../../../lib/revora/env";

export const runtime = "nodejs";

export async function GET() {
  try {
    const env = getRevoraEnv();

    return NextResponse.json({
      ok: true,
      environment: env.environment,
      launch: "ready"
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        environment: detectEnvironment(process.env),
        launch: "missing_config"
      },
      { status: 503 }
    );
  }
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
