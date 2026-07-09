import path from "node:path";
import { NextResponse } from "next/server";
import { isVideoEngineEnabled, isRunInFlight, defaultPidAlive, readRunFile, claudeReady, writeDump, seedRun, spawnJob } from "../../../../lib/video-engine/dashboard";

export const runtime = "nodejs";

const today = () => new Date().toISOString().slice(0, 10);
const notFound = () => new NextResponse(null, { status: 404 });

export type HooksDeps = {
  getEnv?: () => { VERCEL_ENV?: string; NODE_ENV?: string; PATH?: string };
  cwd?: () => string;
  now?: () => Date;
  today?: () => string;
  spawn?: typeof spawnJob;
};

/** G0 start: persist the pasted dump, then spawn the cheap hooks phase. */
export function createHooksHandler(deps: HooksDeps = {}) {
  const getEnv = deps.getEnv ?? (() => process.env);
  const cwd = deps.cwd ?? (() => process.cwd());
  const now = deps.now ?? (() => new Date());
  const date = deps.today ?? today;
  const spawn = deps.spawn ?? spawnJob;

  return async function POST(req: Request): Promise<NextResponse> {
    const env = getEnv();
    if (!isVideoEngineEnabled(env)) return notFound();

    const body = (await req.json().catch(() => null)) as { dump?: string; maxHooks?: number } | null;
    const dump = (body?.dump ?? "").trim();
    if (!dump) return NextResponse.json({ error: "VOC dump is empty — paste this week's material first." }, { status: 400 });
    if (!claudeReady(env.PATH)) return NextResponse.json({ error: "claude CLI not found — authenticate it and ensure it's on PATH." }, { status: 503 });

    const veRoot = path.join(cwd(), "video-engine");
    const d = date();
    if (isRunInFlight(readRunFile(d, veRoot), { now: now(), isPidAlive: defaultPidAlive })) {
      return NextResponse.json({ error: "a run is already in progress for this date." }, { status: 409 });
    }

    writeDump(d, dump, veRoot);
    // seed run.json synchronously (before the async child) to close the lock window
    seedRun(d, "hooks", veRoot);
    spawn({ date: d, phase: "hooks", maxHooks: body?.maxHooks }, cwd());
    return NextResponse.json({ date: d, status: "HOOKS" }, { status: 202 });
  };
}

export const POST = createHooksHandler();
