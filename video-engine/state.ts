// video-engine/state.ts — run.json job state (polled by the dashboard, single-run lock, resume).
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./config";

// PRODUCING is coarse/transient — set only while a render child is live; it drops back
// to AWAITING_G1 (the resting gate) when the child exits. G2-eligibility is derived from
// the per-spec render map, not a global AWAITING_G2 status (renders happen in waves).
export type RunStatus = "HOOKS" | "AWAITING_G0" | "SPECS" | "AWAITING_G1" | "PRODUCING" | "DONE" | "FAILED";
export type SpecStatus = "PENDING" | "BUILDING" | "LINTING" | "ERROR" | "DONE";
export type RenderStatus = "PENDING" | "RENDERING" | "READY" | "ERROR";
export type RenderEntry = { status: RenderStatus; assetDir?: string; error?: string };

export type RunState = {
  date: string;
  status: RunStatus;
  error?: string;
  selectedHookIds: string[];
  progress: { stage: string; done: number; total: number };
  // keyed by hook_id (unique per run) so a build that fails before producing a
  // spec id still has a slot, and a duplicate model spec id can't collide here.
  specs: Record<string, { status: SpecStatus; error?: string; specId?: string }>;
  // Render map keyed by specId (unique in specs.json — duplicate-spec-id hooks are
  // ERRORed before they reach specs.json). Optional so pre-Slice-2 run.json parse fine.
  render?: Record<string, RenderEntry>;
  pid: number | null;
  heartbeat: string; // iso ts, refreshed every step — see liveness check in the lock
};

const runPath = (date: string, root: string) => path.resolve(root, "output", date, "run.json");

export function readRun(date: string, root: string = ROOT): RunState | null {
  try {
    return JSON.parse(fs.readFileSync(runPath(date, root), "utf8")) as RunState;
  } catch {
    return null; // missing or unparseable (crash mid-write) → caller treats as "restart this stage"
  }
}

/** Atomic write: temp file + rename, so a crash mid-write can't truncate run.json. */
export function writeRun(date: string, state: RunState, root: string = ROOT): void {
  const p = runPath(date, root);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const tmp = `${p}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, p);
}

export function newRun(date: string): RunState {
  return {
    date,
    status: "HOOKS",
    selectedHookIds: [],
    progress: { stage: "starting", done: 0, total: 0 },
    specs: {},
    pid: null,
    heartbeat: new Date().toISOString(),
  };
}
