// lib/video-engine/dashboard.ts
// Server-side helpers for the dev-only Video Engine dashboard. The route handlers
// stay thin; the testable logic (prod guard, single-run lock, decisions, commit)
// lives here. NOTE: only `import type` from ../../video-engine/* — the engine
// module (claude/git shell-outs) must never enter the Next bundle; it's spawned.
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";
import type { RunState } from "../../video-engine/state";

// --- prod guard (fail-closed) -------------------------------------------------
// Enabled ONLY in pure-local dev. Any VERCEL_ENV (production/preview/development)
// means serverless — no `claude`/`git` on PATH — so the route must 404 there.
export function isVideoEngineEnabled(env: { VERCEL_ENV?: string; NODE_ENV?: string }): boolean {
  if (env.VERCEL_ENV) return false;
  return env.NODE_ENV !== "production";
}

// --- single-run lock with liveness -------------------------------------------
const HEARTBEAT_STALE_MS = 90_000;
const ACTIVE: RunState["status"][] = ["HOOKS", "SPECS"];

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

// --- decisions log (G1 approvals; append-only audit) -------------------------
export type Decision = { specId: string; verdict: "approve" | "reject"; ts: string; reportRef?: string };

export function appendDecision(date: string, d: Decision, videoEngineRoot: string): void {
  const dir = path.join(videoEngineRoot, "output", date);
  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(path.join(dir, "decisions.jsonl"), JSON.stringify(d) + "\n");
}

export function readDecisions(date: string, videoEngineRoot: string): Decision[] {
  try {
    return fs.readFileSync(path.join(videoEngineRoot, "output", date, "decisions.jsonl"), "utf8")
      .split("\n").filter(Boolean).map((l) => JSON.parse(l) as Decision);
  } catch {
    return [];
  }
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
    const detail = e instanceof Error ? e.message : String(e);
    return { ok: false, message: `commit failed (${detail}) — run manually: git commit ${target} -m "..."` };
  }
}

// --- detached job spawn (not unit-tested: exercised E2E) ----------------------
/** Spawn the engine as a detached child so it survives tab-close / dev-server HMR.
 * Does NOT import the engine module → keeps claude/git out of the bundle. */
export function spawnJob(
  args: { date: string; phase: "hooks" | "specs"; selected?: string[]; maxHooks?: number },
  cwd: string,
): void {
  const argv = ["video-engine/run.ts", args.date, "--phase", args.phase];
  if (args.selected?.length) argv.push("--selected", args.selected.join(","));
  if (args.maxHooks != null) argv.push("--maxHooks", String(args.maxHooks));
  const child = spawn("tsx", argv, { cwd, detached: true, stdio: "ignore" });
  child.unref();
}
