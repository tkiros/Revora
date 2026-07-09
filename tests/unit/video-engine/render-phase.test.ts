import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runRender, type RenderFn } from "../../../video-engine/run";
import { appendDecision } from "../../../video-engine/decisions";
import { readRun } from "../../../video-engine/state";
import type { VideoSpec } from "../../../video-engine/schema";

const DATE = "2026-07-09";

// Minimal in-band fixture spec (myth_label_trap band = 20-30s). Override per test.
const spec = (id: string, over: Partial<VideoSpec> = {}): VideoSpec => ({
  id, hook_id: `h_${id}`, format: "myth_label_trap",
  spoken_hook: "watch what the label hides", visual_hook: "your healthy breakfast",
  beats: ["beat one", "beat two"], asset_list: [], caption_text: "Informational only.",
  disclosure_block: "", claims_used: [], duration_s: 25, status: "APPROVED", ...over,
});

let root: string;
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "ve-render-"));
});

const writeSpecs = (specs: VideoSpec[]) => {
  const dir = path.join(root, "output", DATE);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "specs.json"), JSON.stringify(specs));
};
const g1 = (id: string, verdict: "approve" | "reject" = "approve") =>
  appendDecision(DATE, { specId: id, verdict, gate: "g1", ts: "t" }, root);
const assetDir = (id: string) => path.join(root, "output", DATE, "assets", id);

// A render fn that writes a dummy master and records calls; throws for ids in `fail`.
const fakeRender = (calls: string[] = [], fail: string[] = []): RenderFn => async (s, outFile) => {
  calls.push(s.id);
  if (fail.includes(s.id)) throw new Error(`render blew up for ${s.id}`);
  fs.writeFileSync(outFile, `MP4:${s.id}`);
  return outFile;
};

describe("runRender — per-spec ERROR isolation (CRITICAL)", () => {
  it("one spec's render failure does not sink the wave; siblings render, no half-written asset dir", async () => {
    writeSpecs([spec("A"), spec("B"), spec("C")]);
    ["A", "B", "C"].forEach((id) => g1(id));

    await runRender(DATE, ["A", "B", "C"], { root, render: fakeRender([], ["B"]) });

    const r = readRun(DATE, root)!.render!;
    expect(r.A.status).toBe("READY");
    expect(r.B.status).toBe("ERROR");
    expect(r.C.status).toBe("READY");
    expect(fs.existsSync(path.join(assetDir("A"), "master.mp4"))).toBe(true);
    expect(fs.existsSync(assetDir("B"))).toBe(false); // partial temp discarded — no half-written dir
    expect(fs.existsSync(path.join(assetDir("C"), "master.mp4"))).toBe(true);
  });
});

describe("runRender — carry/recover: wave 2 MERGES, never rebuilds (CRITICAL)", () => {
  it("a second wave leaves wave-1 render entries + asset dirs intact and does not re-render them", async () => {
    writeSpecs([spec("A"), spec("B"), spec("C"), spec("D"), spec("E")]);
    ["A", "B", "C", "D", "E"].forEach((id) => g1(id));

    const calls: string[] = [];
    await runRender(DATE, ["A", "B", "C"], { root, render: fakeRender(calls) }); // wave 1
    await runRender(DATE, ["D", "E"], { root, render: fakeRender(calls) });      // wave 2

    const r = readRun(DATE, root)!.render!;
    expect(Object.keys(r).sort()).toEqual(["A", "B", "C", "D", "E"]); // merged, not rebuilt
    for (const id of ["A", "B", "C", "D", "E"]) expect(r[id].status).toBe("READY");
    // wave-1 assets survive on disk
    for (const id of ["A", "B", "C"]) expect(fs.existsSync(path.join(assetDir(id), "master.mp4"))).toBe(true);
    // wave 2 did NOT re-render A,B,C (already READY)
    expect(calls).toEqual(["A", "B", "C", "D", "E"]);
  });

  it("force re-renders an already-READY spec (founder swaps music/template)", async () => {
    writeSpecs([spec("A")]);
    g1("A");
    const calls: string[] = [];
    await runRender(DATE, ["A"], { root, render: fakeRender(calls) });
    await runRender(DATE, ["A"], { root, render: fakeRender(calls), force: true });
    expect(calls).toEqual(["A", "A"]); // rendered twice under force
    expect(readRun(DATE, root)!.render!.A.status).toBe("READY");
  });
});

describe("runRender — gate discriminator: only G1-approved specs render (CRITICAL)", () => {
  it("a G2 approve or a G1 reject never makes a spec render-eligible", async () => {
    writeSpecs([spec("A"), spec("B"), spec("C")]);
    g1("A", "approve");                                                       // eligible
    appendDecision(DATE, { specId: "B", verdict: "approve", gate: "g2", ts: "t" }, root); // asset approval only
    g1("C", "reject");                                                        // explicitly rejected

    const calls: string[] = [];
    await runRender(DATE, ["A", "B", "C"], { root, render: fakeRender(calls) });

    expect(calls).toEqual(["A"]);
    const r = readRun(DATE, root)!.render ?? {};
    expect(r.A?.status).toBe("READY");
    expect(r.B).toBeUndefined();
    expect(r.C).toBeUndefined();
  });
});

describe("runRender — disclosure ships in the caption when claims_used ≠ ∅", () => {
  it("writes caption.txt carrying the disclosure block (compliance dual-mode, caption half)", async () => {
    writeSpecs([spec("A", { claims_used: ["reverses prediabetes"], disclosure_block: "Not medical advice. Consult your doctor." })]);
    g1("A");
    await runRender(DATE, ["A"], { root, render: fakeRender() });
    const caption = fs.readFileSync(path.join(assetDir("A"), "caption.txt"), "utf8");
    expect(caption).toContain("Not medical advice");
  });
});

describe("runRender — rests at the AWAITING_G1 gate after the wave", () => {
  it("status returns to AWAITING_G1 (no terminal wall that blocks a later wave)", async () => {
    writeSpecs([spec("A")]);
    g1("A");
    await runRender(DATE, ["A"], { root, render: fakeRender() });
    expect(readRun(DATE, root)!.status).toBe("AWAITING_G1");
  });
});
