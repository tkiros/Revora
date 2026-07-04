import { NextResponse } from "next/server";

import { runBaiWeeklyCron } from "../../../../lib/server/bai-cron";
import { getDb, type Db } from "../../../../lib/server/db";
import { captureServerError } from "../../../../lib/revora/sentry-capture";

export const runtime = "nodejs";
export const maxDuration = 60;

type Deps = {
  db?: () => Db;
};

export function createBaiCronHandler(deps: Deps = {}) {
  const db = deps.db ?? getDb;

  return async function GET(request: Request) {
    const secret = process.env.CRON_SECRET;
    const auth = request.headers.get("authorization");
    if (!secret || auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    try {
      const result = await runBaiWeeklyCron(db());
      return NextResponse.json({ ok: true, ...result });
    } catch (error) {
      await captureServerError(error, "route");
      return NextResponse.json({ error: "bai-weekly run failed" }, { status: 500 });
    }
  };
}

export const GET = createBaiCronHandler();
