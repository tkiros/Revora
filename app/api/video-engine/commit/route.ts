import { NextResponse } from "next/server";
import { isVideoEngineEnabled, commitReview } from "../../../../lib/video-engine/dashboard";

export const runtime = "nodejs";

const notFound = () => new NextResponse(null, { status: 404 });

export type CommitDeps = {
  getEnv?: () => { VERCEL_ENV?: string; NODE_ENV?: string };
  cwd?: () => string;
};

/** Commit output/<date> as the compliance audit trail (path-scoped, safe). */
export function createCommitHandler(deps: CommitDeps = {}) {
  const getEnv = deps.getEnv ?? (() => process.env);
  const cwd = deps.cwd ?? (() => process.cwd());

  return async function POST(req: Request): Promise<NextResponse> {
    if (!isVideoEngineEnabled(getEnv())) return notFound();

    const body = (await req.json().catch(() => null)) as { date?: string } | null;
    if (!body?.date) return NextResponse.json({ error: "date is required." }, { status: 400 });

    const res = commitReview(body.date, { cwd: cwd(), pathPrefix: "video-engine/output", message: `video-engine: review ${body.date}` });
    return NextResponse.json(res, { status: res.ok ? 200 : 500 });
  };
}

export const POST = createCommitHandler();
