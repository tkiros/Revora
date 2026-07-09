import path from "node:path";
import { NextResponse } from "next/server";
import { isVideoEngineEnabled, appendDecision } from "../../../../lib/video-engine/dashboard";

export const runtime = "nodejs";

const notFound = () => new NextResponse(null, { status: 404 });

export type ApproveDeps = {
  getEnv?: () => { VERCEL_ENV?: string; NODE_ENV?: string };
  cwd?: () => string;
  now?: () => Date;
};

/** G1 decision: append one approve/reject record to decisions.jsonl (audit trail). */
export function createApproveHandler(deps: ApproveDeps = {}) {
  const getEnv = deps.getEnv ?? (() => process.env);
  const cwd = deps.cwd ?? (() => process.cwd());
  const now = deps.now ?? (() => new Date());

  return async function POST(req: Request): Promise<NextResponse> {
    if (!isVideoEngineEnabled(getEnv())) return notFound();

    const body = (await req.json().catch(() => null)) as { date?: string; specId?: string; verdict?: "approve" | "reject" } | null;
    const { date, specId, verdict } = body ?? {};
    if (!date || !specId || (verdict !== "approve" && verdict !== "reject")) {
      return NextResponse.json({ error: "date, specId and verdict (approve|reject) are required." }, { status: 400 });
    }

    appendDecision(date, { specId, verdict, ts: now().toISOString() }, path.join(cwd(), "video-engine"));
    return NextResponse.json({ ok: true }, { status: 200 });
  };
}

export const POST = createApproveHandler();
