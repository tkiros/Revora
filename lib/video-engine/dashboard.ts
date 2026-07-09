// lib/video-engine/dashboard.ts
// Server-side helpers for the dev-only Video Engine dashboard. The route handlers
// stay thin; the testable logic (prod guard, single-run lock, decisions, commit)
// lives here. NOTE: only `import type` from ../../video-engine/* — the engine
// module (claude/git shell-outs) must never enter the Next bundle; it's spawned.
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";
import type { RunState } from "../../video-engine/state";
// The decision log lives in the engine module (pure fs) so the render phase and the
// route lib share ONE gate-discriminator backfill. Re-exported for existing importers.
export { type Decision, appendDecision, readDecisions, approvedSpecIds } from "../../video-engine/decisions";
import { readDecisions } from "../../video-engine/decisions";

// --- prod guard (fail-closed) -------------------------------------------------
// Enabled ONLY in pure-local dev. Any VERCEL_ENV (production/preview/development)
// means serverless — no `claude`/`git` on PATH — so the route must 404 there.
export function isVideoEngineEnabled(env: { VERCEL_ENV?: string; NODE_ENV?: string }): boolean {
  if (env.VERCEL_ENV) return false;
  return env.NODE_ENV !== "production";
}

/** Route-side `claude`-on-PATH preflight (kept here so routes never import the
 * engine module). Mirrors video-engine/llm.claudeOnPath. */
export function claudeReady(pathEnv: string = process.env.PATH ?? ""): boolean {
  return pathEnv.split(path.delimiter).filter(Boolean).some((dir) => {
    try { fs.accessSync(path.join(dir, "claude"), fs.constants.X_OK); return true; } catch { return false; }
  });
}

/** Render-path preflight — a system Chrome must be present (this host has no network for
 * Remotion's Chromium CDN). Distinct from claudeReady: the render path has NO LLM, so gating
 * it on `claude` would be wrong. Mirrors render.ts findChrome (routes must not import render.ts). */
export function renderRuntimeReady(env: Record<string, string | undefined> = process.env): boolean {
  const candidates = [
    env.REMOTION_BROWSER_EXECUTABLE,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/opt/google/chrome/chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  return candidates.some((p) => !!p && fs.existsSync(p));
}

/** Persist the pasted VOC dump where the engine's loadDump expects it. */
export function writeDump(date: string, text: string, videoEngineRoot: string): void {
  const dir = path.join(videoEngineRoot, "input");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${date}-voc-dump.md`), text);
}

// --- single-run lock with liveness -------------------------------------------
const HEARTBEAT_STALE_MS = 90_000;
// PRODUCING is in the ACTIVE set so a render and a hooks/specs run for the same date
// are mutually exclusive — all phases share one run.json per date (one lock per date).
const ACTIVE: RunState["status"][] = ["HOOKS", "SPECS", "PRODUCING"];

export function defaultPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0); // signal 0 = existence check
    return true;
  } catch {
    return false;
  }
}

/** In-flight iff a child is actively running: status active AND (pid alive OR
 * heartbeat fresh). A dead pid with a stale heartbeat is reclaimable (wedged run). */
export function isRunInFlight(
  state: RunState | null,
  deps: { now: Date; isPidAlive: (pid: number) => boolean },
): boolean {
  if (!state || !ACTIVE.includes(state.status)) return false;
  if (state.pid != null && deps.isPidAlive(state.pid)) return true;
  const age = deps.now.getTime() - new Date(state.heartbeat).getTime();
  return age < HEARTBEAT_STALE_MS;
}

// --- file layout (route-side reads; engine owns writes) ----------------------
export function readRunFile(date: string, videoEngineRoot: string): RunState | null {
  try {
    return JSON.parse(fs.readFileSync(path.join(videoEngineRoot, "output", date, "run.json"), "utf8")) as RunState;
  } catch {
    return null;
  }
}

function writeRunFile(date: string, state: RunState, veRoot: string): void {
  const p = path.join(veRoot, "output", date, "run.json");
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const tmp = `${p}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, p);
}

/** Write an initial run.json SYNCHRONOUSLY before spawning the detached child.
 * Closes the single-run-lock window (a second request now sees the active run)
 * and lets the client start polling immediately instead of racing the child. */
export function seedRun(date: string, phase: "hooks" | "specs" | "render", veRoot: string, selectedIds?: string[]): void {
  const now = new Date().toISOString();
  const prior = phase === "hooks" ? null : readRunFile(date, veRoot); // hooks = fresh start; specs/render = resume
  const status = phase === "hooks" ? "HOOKS" : phase === "render" ? "PRODUCING" : "SPECS";
  const state: RunState = {
    date,
    status,
    // render selects spec ids (not hooks), so it must not clobber the hook selection.
    selectedHookIds: phase === "render" ? prior?.selectedHookIds ?? [] : selectedIds ?? prior?.selectedHookIds ?? [],
    progress: prior?.progress ?? { stage: "starting", done: 0, total: 0 },
    specs: prior?.specs ?? {},
    render: prior?.render, // carry the render map so the G2 view keeps prior READY specs during a new wave
    pid: null, // child will stamp its own pid; until then the fresh heartbeat holds the lock
    heartbeat: now,
  };
  writeRunFile(date, state, veRoot);
}

/** Everything the dashboard needs for a date in one poll: state + entities + decisions. */
export function readSnapshot(date: string, videoEngineRoot: string) {
  const dir = path.join(videoEngineRoot, "output", date);
  return {
    run: readRunFile(date, videoEngineRoot),
    hooks: readJsonSafe<unknown[]>(path.join(dir, "hooks.json"), []),
    specs: readJsonSafe<unknown[]>(path.join(dir, "specs.json"), []),
    reports: readJsonSafe<unknown[]>(path.join(dir, "compliance.json"), []),
    decisions: readDecisions(date, videoEngineRoot),
  };
}

export type RunSummary = { date: string; status: RunState["status"]; hooks: number; specs: number; approved: number; bounced: number };

const readJsonSafe = <T,>(p: string, fallback: T): T => {
  try { return JSON.parse(fs.readFileSync(p, "utf8")) as T; } catch { return fallback; }
};

/** History: one summary row per dated run under output/*, newest first. */
export function listRuns(videoEngineRoot: string): RunSummary[] {
  const outRoot = path.join(videoEngineRoot, "output");
  let dates: string[];
  try { dates = fs.readdirSync(outRoot).filter((d) => fs.existsSync(path.join(outRoot, d, "run.json"))); } catch { return []; }
  return dates
    .map((date) => {
      const dir = path.join(outRoot, date);
      const run = readRunFile(date, videoEngineRoot);
      const hooks = readJsonSafe<unknown[]>(path.join(dir, "hooks.json"), []);
      const specs = readJsonSafe<unknown[]>(path.join(dir, "specs.json"), []);
      const reports = readJsonSafe<{ verdict: string }[]>(path.join(dir, "compliance.json"), []);
      return {
        date,
        status: run?.status ?? "FAILED",
        hooks: hooks.length,
        specs: specs.length,
        approved: readDecisions(date, videoEngineRoot).filter((d) => d.verdict === "approve" && d.gate === "g1").length,
        bounced: reports.filter((r) => r.verdict === "hard_fail").length,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

// --- path-scoped commit (audit trail) ----------------------------------------
/** Commit ONLY video-engine/output/<date>. Scoped `add` + pathspec-limited
 * `commit` so a web click can never sweep up the founder's unrelated staged files. */
export function commitReview(
  date: string,
  opts: { cwd: string; pathPrefix?: string; message?: string },
): { ok: boolean; message: string } {
  const target = `${opts.pathPrefix ?? "output"}/${date}`;
  if (fs.existsSync(path.join(opts.cwd, ".git", "index.lock"))) {
    return { ok: false, message: `git index is locked — commit manually: git commit ${target} -m "..."` };
  }
  const msg = opts.message ?? `video-engine: review ${date}`;
  try {
    execFileSync("git", ["add", "--", target], { cwd: opts.cwd, stdio: "pipe" });
    // pathspec on commit → only <target> is committed even if other files are staged
    execFileSync("git", ["commit", "-m", msg, "--", target], { cwd: opts.cwd, stdio: "pipe" });
    return { ok: true, message: `committed ${target}` };
  } catch (e) {
    // "nothing to commit" (already committed / unchanged) is a benign no-op, not a failure.
    const out = `${(e as { stdout?: Buffer }).stdout ?? ""}${(e as { stderr?: Buffer }).stderr ?? ""}`;
    if (/nothing to commit|no changes added/i.test(out)) return { ok: true, message: `nothing new to commit for ${target}` };
    const detail = e instanceof Error ? e.message : String(e);
    return { ok: false, message: `commit failed (${detail}) — run manually: git commit ${target} -m "..."` };
  }
}

// --- detached job spawn (not unit-tested: exercised E2E) ----------------------
/** Spawn the engine as a detached child so it survives tab-close / dev-server HMR.
 * Does NOT import the engine module → keeps claude/git out of the bundle. */
export function spawnJob(
  args: { date: string; phase: "hooks" | "specs" | "render"; selected?: string[]; maxHooks?: number },
  cwd: string,
): void {
  const argv = ["video-engine/run.ts", args.date, "--phase", args.phase];
  if (args.selected?.length) argv.push("--selected", args.selected.join(","));
  if (args.maxHooks != null) argv.push("--maxHooks", String(args.maxHooks));
  const child = spawn("tsx", argv, { cwd, detached: true, stdio: "ignore" });
  // Without this, a spawn failure (e.g. tsx not on PATH) emits an unhandled
  // 'error' event that would take down the whole `next dev` process. Instead,
  // surface it into run.json as FAILED so the dashboard shows it.
  child.on("error", (err) => {
    try {
      const veRoot = path.join(cwd, "video-engine");
      const prior = readRunFile(args.date, veRoot);
      writeRunFile(args.date, {
        date: args.date,
        status: "FAILED",
        error: `failed to start the engine: ${err.message} (is tsx on PATH?)`,
        selectedHookIds: prior?.selectedHookIds ?? [],
        progress: prior?.progress ?? { stage: "starting", done: 0, total: 0 },
        specs: prior?.specs ?? {},
        pid: null,
        heartbeat: new Date().toISOString(),
      }, veRoot);
    } catch { /* best-effort; never rethrow from the error handler */ }
  });
  child.unref();
}
