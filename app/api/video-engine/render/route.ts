import path from "node:path";
import { NextResponse } from "next/server";
import { isVideoEngineEnabled, isRunInFlight, defaultPidAlive, readRunFile, renderRuntimeReady, seedRun, spawnJob } from "../../../../lib/video-engine/dashboard";

export const runtime = "nodejs";

const notFound = () => new NextResponse(null, { status: 404 });

export type RenderDeps = {
  getEnv?: () => { VERCEL_ENV?: string; NODE_ENV?: string };
  cwd?: () => string;
  now?: () => Date;
  spawn?: typeof spawnJob;
  runtimeReady?: () => boolean;
};

/** G1 → render: produce master.mp4 + caption for the founder's selected (G1-approved) specs.
 * PRODUCING single-run lock; renderRuntimeReady() preflight (NOT claudeReady — no LLM here);
 * seed-then-spawn closes the lock window before the detached child starts. Never imports render.ts. */
export function createRenderHandler(deps: RenderDeps = {}) {
  const getEnv = deps.getEnv ?? (() => process.env);
  const cwd = deps.cwd ?? (() => process.cwd());
  const now = deps.now ?? (() => new Date());
  const spawn = deps.spawn ?? spawnJob;
  const runtimeReady = deps.runtimeReady ?? (() => renderRuntimeReady());

  return async function POST(req: Request): Promise<NextResponse> {
    if (!isVideoEngineEnabled(getEnv())) return notFound();

    const body = (await req.json().catch(() => null)) as { date?: string; specIds?: string[] } | null;
    const date = body?.date;
    const specIds = body?.specIds ?? [];
    if (!date || specIds.length === 0) return NextResponse.json({ error: "date and at least one specId are required." }, { status: 400 });
    if (!runtimeReady()) return NextResponse.json({ error: "render runtime not ready — install Chrome/Chromium or set REMOTION_BROWSER_EXECUTABLE." }, { status: 503 });

    const veRoot = path.join(cwd(), "video-engine");
    if (isRunInFlight(readRunFile(date, veRoot), { now: now(), isPidAlive: defaultPidAlive })) {
      return NextResponse.json({ error: "a run is already in progress for this date." }, { status: 409 });
    }

    seedRun(date, "render", veRoot); // close the lock window before the async child
    spawn({ date, phase: "render", selected: specIds }, cwd());
    return NextResponse.json({ date, status: "PRODUCING" }, { status: 202 });
  };
}

export const POST = createRenderHandler();
