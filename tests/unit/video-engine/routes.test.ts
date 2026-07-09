import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHooksHandler } from "../../../app/api/video-engine/hooks/route";
import { createSpecsHandler } from "../../../app/api/video-engine/specs/route";
import { createApproveHandler } from "../../../app/api/video-engine/approve/route";
import { readDecisions } from "../../../lib/video-engine/dashboard";
import type { RunState } from "../../../video-engine/state";

const DEV = { NODE_ENV: "development", PATH: "" };
const post = (body: unknown) => new Request("http://x/", { method: "POST", body: JSON.stringify(body) });

let repo: string;
beforeEach(() => {
  repo = fs.mkdtempSync(path.join(os.tmpdir(), "ve-routes-"));
  fs.mkdirSync(path.join(repo, "video-engine"), { recursive: true });
});
const cwd = () => () => repo;

// PATH env with a fake claude so claudeReady passes.
function withClaude(): { NODE_ENV: string; PATH: string } {
  const bin = fs.mkdtempSync(path.join(os.tmpdir(), "ve-bin-"));
  const c = path.join(bin, "claude");
  fs.writeFileSync(c, "#!/bin/sh\n"); fs.chmodSync(c, 0o755);
  return { NODE_ENV: "development", PATH: bin };
}

function writeRun(date: string, over: Partial<RunState>) {
  const dir = path.join(repo, "video-engine", "output", date);
  fs.mkdirSync(dir, { recursive: true });
  const s: RunState = { date, status: "SPECS", selectedHookIds: [], progress: { stage: "building", done: 0, total: 1 }, specs: {}, pid: null, heartbeat: new Date().toISOString(), ...over };
  fs.writeFileSync(path.join(dir, "run.json"), JSON.stringify(s));
}

describe("hooks route", () => {
  it("empty dump → 400, no spawn", async () => {
    let spawned = false;
    const h = createHooksHandler({ getEnv: () => DEV, cwd: cwd(), spawn: () => { spawned = true; } });
    const res = await h(post({ dump: "   " }));
    expect(res.status).toBe(400);
    expect(spawned).toBe(false);
  });

  it("happy path → writes dump, spawns hooks, 202", async () => {
    const env = withClaude();
    let arg: unknown = null;
    const h = createHooksHandler({ getEnv: () => env, cwd: cwd(), today: () => "2026-07-09", spawn: (a) => { arg = a; } });
    const res = await h(post({ dump: "people ask about oatmeal" }));
    expect(res.status).toBe(202);
    expect(arg).toMatchObject({ date: "2026-07-09", phase: "hooks" });
    expect(fs.readFileSync(path.join(repo, "video-engine", "input", "2026-07-09-voc-dump.md"), "utf8")).toContain("oatmeal");
  });

  it("in-flight run for date → 409", async () => {
    const env = withClaude();
    writeRun("2026-07-09", { status: "SPECS", pid: process.pid }); // live pid → in flight
    const h = createHooksHandler({ getEnv: () => env, cwd: cwd(), today: () => "2026-07-09", spawn: () => {} });
    expect((await h(post({ dump: "x" }))).status).toBe(409);
  });
});

describe("specs route", () => {
  it("no selection → 400", async () => {
    const h = createSpecsHandler({ getEnv: () => withClaude(), cwd: cwd(), spawn: () => {} });
    expect((await h(post({ date: "2026-07-09", selectedHookIds: [] }))).status).toBe(400);
  });
  it("happy path → spawns specs with selection, 202", async () => {
    let arg: { selected?: string[] } | null = null;
    const h = createSpecsHandler({ getEnv: () => withClaude(), cwd: cwd(), spawn: (a) => { arg = a as typeof arg; } });
    const res = await h(post({ date: "2026-07-09", selectedHookIds: ["h1", "h3"] }));
    expect(res.status).toBe(202);
    expect(arg!.selected).toEqual(["h1", "h3"]);
  });
});

describe("approve route", () => {
  it("appends a decision", async () => {
    const h = createApproveHandler({ getEnv: () => DEV, cwd: cwd(), now: () => new Date("2026-07-09T00:00:00Z") });
    const res = await h(post({ date: "2026-07-09", specId: "s_h1", verdict: "approve" }));
    expect(res.status).toBe(200);
    expect(readDecisions("2026-07-09", path.join(repo, "video-engine"))).toMatchObject([{ specId: "s_h1", verdict: "approve" }]);
  });
  it("bad verdict → 400", async () => {
    const h = createApproveHandler({ getEnv: () => DEV, cwd: cwd() });
    expect((await h(post({ date: "2026-07-09", specId: "s1", verdict: "maybe" }))).status).toBe(400);
  });
});
