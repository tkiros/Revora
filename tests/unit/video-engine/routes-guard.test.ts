import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createHooksHandler } from "../../../app/api/video-engine/hooks/route";
import { createSpecsHandler } from "../../../app/api/video-engine/specs/route";
import { createApproveHandler } from "../../../app/api/video-engine/approve/route";
import { createCommitHandler } from "../../../app/api/video-engine/commit/route";
import { createStateHandler } from "../../../app/api/video-engine/state/route";
import { createRunsHandler } from "../../../app/api/video-engine/runs/route";

// A spawn spy so the guard test can never actually launch a child.
const noSpawn = () => {};
const req = (body?: unknown) => new Request("http://localhost/api/video-engine/x", { method: "POST", body: JSON.stringify(body ?? {}) });

const prodEnvs = [{ VERCEL_ENV: "production" }, { VERCEL_ENV: "preview" }, { NODE_ENV: "production" }];

describe("SECURITY: video-engine routes 404 outside pure-local dev", () => {
  for (const env of prodEnvs) {
    const label = JSON.stringify(env);
    it(`hooks 404s under ${label}`, async () => {
      const h = createHooksHandler({ getEnv: () => env, spawn: noSpawn });
      expect((await h(req({ dump: "x" }))).status).toBe(404);
    });
    it(`specs 404s under ${label}`, async () => {
      const h = createSpecsHandler({ getEnv: () => env, spawn: noSpawn });
      expect((await h(req({ date: "2026-07-09", selectedHookIds: ["h1"] }))).status).toBe(404);
    });
    it(`approve 404s under ${label}`, async () => {
      const h = createApproveHandler({ getEnv: () => env });
      expect((await h(req({ date: "2026-07-09", specId: "s1", verdict: "approve" }))).status).toBe(404);
    });
    it(`commit 404s under ${label}`, async () => {
      const h = createCommitHandler({ getEnv: () => env });
      expect((await h(req({ date: "2026-07-09" }))).status).toBe(404);
    });
    it(`state 404s under ${label}`, async () => {
      const h = createStateHandler({ getEnv: () => env });
      expect((await h(new Request("http://localhost/api/video-engine/state?date=2026-07-09"))).status).toBe(404);
    });
    it(`runs 404s under ${label}`, async () => {
      const h = createRunsHandler({ getEnv: () => env });
      expect((await h()).status).toBe(404);
    });
  }
});

describe("SECURITY: routes never import the engine module (bundle isolation)", () => {
  const routeDir = path.resolve(__dirname, "../../../app/api/video-engine");
  const files = fs.readdirSync(routeDir).map((d) => path.join(routeDir, d, "route.ts"));
  for (const f of files) {
    it(`${path.basename(path.dirname(f))}/route.ts imports only the dashboard lib`, () => {
      const src = fs.readFileSync(f, "utf8");
      // must not import from the engine dir (run/agents/llm/state) — those pull claude/git.
      expect(src).not.toMatch(/from\s+["'][^"']*\/video-engine\/(run|agents|llm|state|linter|store)["']/);
    });
  }
});
