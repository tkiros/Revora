import path from "node:path";
import { NextResponse } from "next/server";
import { isVideoEngineEnabled, isRunInFlight, defaultPidAlive, readRunFile, claudeReady, seedRun, spawnJob } from "../../../../lib/video-engine/dashboard";

export const runtime = "nodejs";

const notFound = () => new NextResponse(null, { status: 404 });

export type SpecsDeps = {
  getEnv?: () => { VERCEL_ENV?: string; NODE_ENV?: string; PATH?: string };
  cwd?: () => string;
  now?: () => Date;
  spawn?: typeof spawnJob;
};

/** G0 → specs: build only the founder's selected hooks. Also serves per-spec
 * Retry (a single ERROR hook id) since runSpecs resumes DONE hooks. */
export function createSpecsHandler(deps: SpecsDeps = {}) {
  const getEnv = deps.getEnv ?? (() => process.env);
  const cwd = deps.cwd ?? (() => process.cwd());
  const now = deps.now ?? (() => new Date());
  const spawn = deps.spawn ?? spawnJob;

  return async function POST(req: Request): Promise<NextResponse> {
    const env = getEnv();
    if (!isVideoEngineEnabled(env)) return notFound();

    const body = (await req.json().catch(() => null)) as { date?: string; selectedHookIds?: string[]; maxHooks?: number } | null;
    const date = body?.date;
    const selected = body?.selectedHookIds ?? [];
    if (!date || selected.length === 0) return NextResponse.json({ error: "date and at least one hook id are required." }, { status: 400 });
    if (!claudeReady(env.PATH)) return NextResponse.json({ error: "claude CLI not found — authenticate it and ensure it's on PATH." }, { status: 503 });

    const veRoot = path.join(cwd(), "video-engine");
    if (isRunInFlight(readRunFile(date, veRoot), { now: now(), isPidAlive: defaultPidAlive })) {
      return NextResponse.json({ error: "a run is already in progress for this date." }, { status: 409 });
    }

    seedRun(date, "specs", veRoot, selected); // close the lock window before the async child
    spawn({ date, phase: "specs", selected, maxHooks: body?.maxHooks }, cwd());
    return NextResponse.json({ date, status: "SPECS" }, { status: 202 });
  };
}

export const POST = createSpecsHandler();
