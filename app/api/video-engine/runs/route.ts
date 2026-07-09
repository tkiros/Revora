import path from "node:path";
import { NextResponse } from "next/server";
import { isVideoEngineEnabled, listRuns } from "../../../../lib/video-engine/dashboard";

export const runtime = "nodejs";

const notFound = () => new NextResponse(null, { status: 404 });

export type RunsDeps = {
  getEnv?: () => { VERCEL_ENV?: string; NODE_ENV?: string };
  cwd?: () => string;
};

/** History: summaries of past runs for the dashboard home. */
export function createRunsHandler(deps: RunsDeps = {}) {
  const getEnv = deps.getEnv ?? (() => process.env);
  const cwd = deps.cwd ?? (() => process.cwd());

  return async function GET(): Promise<NextResponse> {
    if (!isVideoEngineEnabled(getEnv())) return notFound();
    return NextResponse.json({ runs: listRuns(path.join(cwd(), "video-engine")) }, { status: 200 });
  };
}

export const GET = createRunsHandler();
