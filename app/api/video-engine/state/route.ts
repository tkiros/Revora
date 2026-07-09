import path from "node:path";
import { NextResponse } from "next/server";
import { isVideoEngineEnabled, readSnapshot } from "../../../../lib/video-engine/dashboard";

export const runtime = "nodejs";

const notFound = () => new NextResponse(null, { status: 404 });

export type StateDeps = {
  getEnv?: () => { VERCEL_ENV?: string; NODE_ENV?: string };
  cwd?: () => string;
};

/** Poll target: full snapshot (run state + entities + decisions) for a date. */
export function createStateHandler(deps: StateDeps = {}) {
  const getEnv = deps.getEnv ?? (() => process.env);
  const cwd = deps.cwd ?? (() => process.cwd());

  return async function GET(req: Request): Promise<NextResponse> {
    if (!isVideoEngineEnabled(getEnv())) return notFound();
    const date = new URL(req.url).searchParams.get("date");
    if (!date) return NextResponse.json({ error: "date query param required." }, { status: 400 });
    return NextResponse.json(readSnapshot(date, path.join(cwd(), "video-engine")), { status: 200 });
  };
}

export const GET = createStateHandler();
