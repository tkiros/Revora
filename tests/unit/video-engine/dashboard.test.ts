import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  isVideoEngineEnabled,
  isRunInFlight,
  appendDecision,
  readDecisions,
  commitReview,
  listRuns,
} from "../../../lib/video-engine/dashboard";
import type { RunState } from "../../../video-engine/state";

describe("isVideoEngineEnabled (prod guard, fail-closed)", () => {
  it("enabled only in pure-local dev (no VERCEL_ENV, non-prod NODE_ENV)", () => {
    expect(isVideoEngineEnabled({ NODE_ENV: "development" })).toBe(true);
    expect(isVideoEngineEnabled({})).toBe(true);
  });
  it("disabled anywhere on Vercel (claude/git never exist there)", () => {
    expect(isVideoEngineEnabled({ VERCEL_ENV: "production" })).toBe(false);
    expect(isVideoEngineEnabled({ VERCEL_ENV: "preview" })).toBe(false);
    expect(isVideoEngineEnabled({ VERCEL_ENV: "development" })).toBe(false);
  });
  it("disabled when NODE_ENV=production", () => {
    expect(isVideoEngineEnabled({ NODE_ENV: "production" })).toBe(false);
  });
});

const base = (over: Partial<RunState>): RunState => ({
  date: "2026-07-09", status: "SPECS", selectedHookIds: [], progress: { stage: "building", done: 0, total: 1 },
  specs: {}, pid: 4242, heartbeat: new Date("2026-07-09T12:00:00Z").toISOString(), ...over,
});
const NOW = new Date("2026-07-09T12:00:30Z"); // 30s after the base heartbeat

describe("isRunInFlight (single-run lock w/ liveness)", () => {
  const alive = () => true, dead = () => false;
  it("no run.json → not in flight", () => {
    expect(isRunInFlight(null, { now: NOW, isPidAlive: alive })).toBe(false);
  });
  it("active status + live pid → in flight", () => {
    expect(isRunInFlight(base({ status: "SPECS" }), { now: NOW, isPidAlive: alive })).toBe(true);
  });
  it("active status + dead pid but FRESH heartbeat → still in flight", () => {
    expect(isRunInFlight(base({ status: "SPECS" }), { now: NOW, isPidAlive: dead })).toBe(true);
  });
  it("active status + dead pid + STALE heartbeat → reclaimable (not in flight)", () => {
    const stale = new Date("2026-07-09T12:03:00Z"); // 3 min after heartbeat
    expect(isRunInFlight(base({ status: "SPECS" }), { now: stale, isPidAlive: dead })).toBe(false);
  });
  it("gate/terminal statuses are never in flight (human turn)", () => {
    for (const status of ["AWAITING_G0", "AWAITING_G1", "DONE", "FAILED"] as const) {
      expect(isRunInFlight(base({ status }), { now: NOW, isPidAlive: alive })).toBe(false);
    }
  });
});

describe("decisions log", () => {
  let root: string;
  beforeEach(() => { root = fs.mkdtempSync(path.join(os.tmpdir(), "ve-dec-")); });
  it("appends and reads back one record per action", () => {
    appendDecision("2026-07-09", { specId: "s_h1", verdict: "approve", ts: "t1" }, root);
    appendDecision("2026-07-09", { specId: "s_h2", verdict: "reject", ts: "t2" }, root);
    const d = readDecisions("2026-07-09", root);
    expect(d).toHaveLength(2);
    expect(d[0]).toMatchObject({ specId: "s_h1", verdict: "approve" });
    expect(d[1]).toMatchObject({ specId: "s_h2", verdict: "reject" });
  });
  it("missing file → empty list", () => {
    expect(readDecisions("2026-07-09", root)).toEqual([]);
  });
});

describe("listRuns (history)", () => {
  let root: string;
  beforeEach(() => { root = fs.mkdtempSync(path.join(os.tmpdir(), "ve-list-")); });
  const seed = (date: string, run: Partial<RunState>, files?: Record<string, unknown>) => {
    const dir = path.join(root, "output", date);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "run.json"), JSON.stringify(base({ date, ...run })));
    for (const [name, data] of Object.entries(files ?? {})) fs.writeFileSync(path.join(dir, name), JSON.stringify(data));
  };
  it("summarizes each dated run, newest first", () => {
    seed("2026-07-01", { status: "DONE" }, { "hooks.json": [{ id: "h1" }, { id: "h2" }], "specs.json": [{ id: "s1" }] });
    seed("2026-07-08", { status: "AWAITING_G1" }, { "hooks.json": [{ id: "h1" }] });
    const runs = listRuns(root);
    expect(runs.map((r) => r.date)).toEqual(["2026-07-08", "2026-07-01"]); // desc
    const first = runs.find((r) => r.date === "2026-07-01")!;
    expect(first).toMatchObject({ status: "DONE", hooks: 2, specs: 1 });
  });
  it("no output dir → empty list", () => {
    expect(listRuns(root)).toEqual([]);
  });
});

describe("commitReview (path-scoped, safe)", () => {
  let root: string;
  const git = (args: string[]) => execFileSync("git", args, { cwd: root, stdio: "pipe" });
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "ve-git-"));
    git(["init", "-q"]);
    git(["config", "user.email", "t@t.co"]);
    git(["config", "user.name", "t"]);
    fs.writeFileSync(path.join(root, "seed"), "x");
    git(["add", "seed"]); git(["commit", "-qm", "seed"]);
  });
  it("commits only output/<date>, never the founder's unrelated staged files", () => {
    // an unrelated file the founder has staged
    fs.writeFileSync(path.join(root, "unrelated.ts"), "secret wip");
    git(["add", "unrelated.ts"]);
    // engine output
    fs.mkdirSync(path.join(root, "output", "2026-07-09"), { recursive: true });
    fs.writeFileSync(path.join(root, "output", "2026-07-09", "REVIEW.md"), "# review");

    const res = commitReview("2026-07-09", { cwd: root });
    expect(res.ok).toBe(true);

    const files = execFileSync("git", ["show", "--name-only", "--pretty=format:", "HEAD"], { cwd: root }).toString();
    expect(files).toContain("output/2026-07-09/REVIEW.md");
    expect(files).not.toContain("unrelated.ts"); // NOT swept in
    // unrelated file is still staged, uncommitted
    const staged = execFileSync("git", ["diff", "--cached", "--name-only"], { cwd: root }).toString();
    expect(staged).toContain("unrelated.ts");
  });
  it("index.lock present → surfaces a manual-commit message, no throw", () => {
    fs.mkdirSync(path.join(root, "output", "2026-07-09"), { recursive: true });
    fs.writeFileSync(path.join(root, "output", "2026-07-09", "REVIEW.md"), "# review");
    fs.writeFileSync(path.join(root, ".git", "index.lock"), "");
    const res = commitReview("2026-07-09", { cwd: root });
    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/manually|lock/i);
  });
});
