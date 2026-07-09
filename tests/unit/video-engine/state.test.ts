import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runHooks, runSpecs } from "../../../video-engine/run";
import { readRun, writeRun } from "../../../video-engine/state";
import type { ClaudeRunner } from "../../../video-engine/llm";

// A configurable fake `claude` runner. `specBehavior` maps a hook id to how its
// A3 (spec-build) call should behave: "ok" | "throw" | a spec id to force.
function makeRunner(opts?: {
  hookIds?: string[];
  specBehavior?: Record<string, "ok" | "throw" | { forceSpecId: string }>;
  failStage?: "a1" | "a2";
}): ClaudeRunner {
  const hookIds = opts?.hookIds ?? ["h1", "h2"];
  return async (prompt: string): Promise<string> => {
    if (prompt.includes("<!-- a1-miner -->")) {
      if (opts?.failStage === "a1") throw new Error("claude auth failed");
      return JSON.stringify({ insights: [{ id: "i1", verbatim: "is oatmeal ok?", source_url: "", theme: "carbs", pillar: "P3", freq_count: 3, status: "NEW" }] });
    }
    if (prompt.includes("<!-- a2-hooks -->")) {
      if (opts?.failStage === "a2") throw new Error("model down");
      return JSON.stringify({
        angles: [{ id: "a1", insight_ids: ["i1"], premise: "healthy foods spike", enemy: "health halo", persona: "newly diagnosed", status: "DRAFT" }],
        hooks: hookIds.map((id) => ({ id, angle_id: "a1", spoken_text: `spoken ${id}`, visual_text: "your healthy breakfast", framework_tag: "curiosity_gap", cta_type: "soft", pillar: "P3", similarity_max_30d: null, status: "DRAFT" })),
      });
    }
    if (prompt.includes("<!-- a3-spec -->")) {
      const hookId = hookIds.find((id) => prompt.includes(`"id": "${id}"`)) ?? "h1";
      const b = opts?.specBehavior?.[hookId] ?? "ok";
      if (b === "throw") return "not valid json at all"; // fails zod twice → llm throws
      const specId = typeof b === "object" ? b.forceSpecId : `s_${hookId}`;
      return JSON.stringify({
        id: specId, hook_id: hookId, format: "myth_label_trap",
        spoken_hook: `spoken ${hookId}`, visual_hook: "your healthy breakfast",
        beats: ["beat"], asset_list: ["real app screen recording"], caption_text: "Informational only.",
        disclosure_block: "", claims_used: [], duration_s: 25, status: "DRAFT",
      });
    }
    if (prompt.includes("<!-- a4-linter -->")) return JSON.stringify({ items: [] });
    throw new Error("unknown prompt");
  };
}

function tmpRootWithDump(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ve-state-"));
  fs.mkdirSync(path.join(root, "input"), { recursive: true });
  fs.writeFileSync(path.join(root, "input", "2026-07-09-voc-dump.md"), "people keep asking if oatmeal is ok");
  return root;
}

const DATE = "2026-07-09";
let root: string;
beforeEach(() => { root = tmpRootWithDump(); });

describe("runHooks state", () => {
  it("writes run.json AWAITING_G0 with the hooks", async () => {
    await runHooks(DATE, { runner: makeRunner(), root });
    const s = readRun(DATE, root)!;
    expect(s.status).toBe("AWAITING_G0");
    expect(s.date).toBe(DATE);
    expect(typeof s.heartbeat).toBe("string");
  });

  it("0 hooks generated → FAILED, does not sit in an empty G0", async () => {
    await runHooks(DATE, { runner: makeRunner({ hookIds: [] }), root });
    const s = readRun(DATE, root)!;
    expect(s.status).toBe("FAILED");
    expect(s.error).toMatch(/0 hooks|no hooks/i);
  });

  it("a phase-stage throw (claude down) → run.json FAILED with the error", async () => {
    await runHooks(DATE, { runner: makeRunner({ failStage: "a1" }), root });
    const s = readRun(DATE, root)!;
    expect(s.status).toBe("FAILED");
    expect(s.error).toMatch(/claude auth failed/);
  });
});

describe("runSpecs isolation + state", () => {
  it("builds ONLY the selected hooks", async () => {
    await runHooks(DATE, { runner: makeRunner({ hookIds: ["h1", "h2", "h3"] }), root });
    await runSpecs(DATE, ["h1", "h3"], { runner: makeRunner({ hookIds: ["h1", "h2", "h3"] }), root });
    const specs = JSON.parse(fs.readFileSync(path.join(root, "output", DATE, "specs.json"), "utf8"));
    expect(specs.map((s: { hook_id: string }) => s.hook_id).sort()).toEqual(["h1", "h3"]);
  });

  it("[REGRESSION] one spec failing twice → that hook ERROR, others DONE, batch COMPLETES", async () => {
    const runner = makeRunner({ hookIds: ["h1", "h2"], specBehavior: { h2: "throw" } });
    await runHooks(DATE, { runner, root });
    await runSpecs(DATE, ["h1", "h2"], { runner, root });

    const s = readRun(DATE, root)!;
    expect(s.specs["h2"].status).toBe("ERROR");
    expect(s.specs["h1"].status).toBe("DONE");
    expect(s.status).toBe("AWAITING_G1");
    // the good spec still made it through
    const specs = JSON.parse(fs.readFileSync(path.join(root, "output", DATE, "specs.json"), "utf8"));
    expect(specs.map((x: { hook_id: string }) => x.hook_id)).toEqual(["h1"]);
    expect(fs.existsSync(path.join(root, "output", DATE, "REVIEW.md"))).toBe(true);
  });

  it("maxHooks caps the fan-out before building", async () => {
    const runner = makeRunner({ hookIds: ["h1", "h2", "h3"] });
    await runHooks(DATE, { runner, root });
    await runSpecs(DATE, ["h1", "h2", "h3"], { runner, root, maxHooks: 2 });
    const specs = JSON.parse(fs.readFileSync(path.join(root, "output", DATE, "specs.json"), "utf8"));
    expect(specs).toHaveLength(2);
  });

  it("resume: DONE hooks are skipped (not rebuilt) and their specs preserved", async () => {
    // 1st run: h2 fails (build), h1 done.
    await runHooks(DATE, { runner: makeRunner({ hookIds: ["h1", "h2"] }), root });
    await runSpecs(DATE, ["h1", "h2"], { runner: makeRunner({ hookIds: ["h1", "h2"], specBehavior: { h2: "throw" } }), root });

    // 2nd run: h2 now succeeds; count how many A3 build calls happen.
    let builds = 0;
    const base = makeRunner({ hookIds: ["h1", "h2"] });
    const counting: ClaudeRunner = async (p) => { if (p.includes("<!-- a3-spec -->")) builds++; return base(p); };
    await runSpecs(DATE, ["h1", "h2"], { runner: counting, root });

    expect(builds).toBe(1); // only h2 rebuilt; h1 was DONE and skipped
    const specs = JSON.parse(fs.readFileSync(path.join(root, "output", DATE, "specs.json"), "utf8"));
    expect(specs.map((x: { hook_id: string }) => x.hook_id).sort()).toEqual(["h1", "h2"]);
  });

  it("resume tolerates a crash before specs.json was written (DONE in run.json, no spec on disk)", async () => {
    await runHooks(DATE, { runner: makeRunner({ hookIds: ["h1", "h2"] }), root });
    // simulate a crash mid-run: h1 marked DONE in run.json, but specs.json never written.
    const s = readRun(DATE, root)!;
    s.status = "SPECS";
    s.specs = { h1: { status: "DONE", specId: "s_h1" }, h2: { status: "PENDING" } };
    writeRun(DATE, s, root);
    expect(fs.existsSync(path.join(root, "output", DATE, "specs.json"))).toBe(false);

    // must not throw, and must not silently lose h1 — it's unrecoverable, so rebuild it.
    await runSpecs(DATE, ["h1", "h2"], { runner: makeRunner({ hookIds: ["h1", "h2"] }), root });
    const specs = JSON.parse(fs.readFileSync(path.join(root, "output", DATE, "specs.json"), "utf8"));
    expect(specs.map((x: { hook_id: string }) => x.hook_id).sort()).toEqual(["h1", "h2"]);
  });

  it("[REGRESSION] duplicate model spec id → colliding hook ERROR, NO throw", async () => {
    const runner = makeRunner({ hookIds: ["h1", "h2"], specBehavior: { h1: { forceSpecId: "dup" }, h2: { forceSpecId: "dup" } } });
    await runHooks(DATE, { runner, root });
    // must not throw
    await runSpecs(DATE, ["h1", "h2"], { runner, root });
    const s = readRun(DATE, root)!;
    const statuses = [s.specs["h1"].status, s.specs["h2"].status];
    expect(statuses).toContain("DONE");
    expect(statuses).toContain("ERROR"); // second collision is isolated, not fatal
    expect(s.status).toBe("AWAITING_G1");
  });
});
