import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Process liveness only. Monitoring that needs end-user readiness must use
 * /api/health, which verifies configuration, the database, and cron freshness.
 */
export function GET() {
  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
