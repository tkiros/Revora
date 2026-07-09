import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runBatch } from "../../../video-engine/run";

// Fake runner keyed on each prompt's first-line marker.
const fakeRunner = async (prompt: string): Promise<string> => {
  if (prompt.includes("<!-- a1-miner -->"))
    return JSON.stringify({ insights: [{ id: "i1", verbatim: "is oatmeal ok?", source_url: "", theme: "hidden carbs", pillar: "P3", freq_count: 3, status: "NEW" }] });
  if (prompt.includes("<!-- a2-hooks -->"))
    return JSON.stringify({
      angles: [{ id: "a1", insight_ids: ["i1"], premise: "healthy foods spike", enemy: "health halo", persona: "newly diagnosed", status: "DRAFT" }],
      hooks: [
        { id: "h1", angle_id: "a1", spoken_text: "Watch what it says about oatmeal", visual_text: "your healthy breakfast", framework_tag: "curiosity_gap", cta_type: "soft", pillar: "P3", similarity_max_30d: null, status: "DRAFT" },
        { id: "h2", angle_id: "a1", spoken_text: "This reversed my prediabetes", visual_text: "reverse it now", framework_tag: "testimonial", cta_type: "hard", pillar: "P3", similarity_max_30d: null, status: "DRAFT" },
      ],
    });
  if (prompt.includes("<!-- a3-spec -->")) {
    const hookId = prompt.includes('"id": "h2"') || prompt.includes('"id":"h2"') ? "h2" : "h1";
    const bad = hookId === "h2";
    return JSON.stringify({
      id: `s_${hookId}`, hook_id: hookId, format: "myth_label_trap",
      spoken_hook: bad ? "This reversed my prediabetes" : "Watch what it says about oatmeal",
      visual_hook: bad ? "reverse it now" : "your healthy breakfast",
      beats: ["beat"], asset_list: ["real app screen recording"], caption_text: "Informational only.",
      disclosure_block: "", claims_used: [], duration_s: 25, status: "DRAFT",
    });
  }
  if (prompt.includes("<!-- a4-linter -->")) return JSON.stringify({ items: [] });
  throw new Error("unknown prompt");
};

describe("runBatch", () => {
  it("writes entities + REVIEW.md; hard-fail spec is bounced, clean spec approvable", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "ve-run-"));
    fs.mkdirSync(path.join(root, "input"), { recursive: true });
    fs.writeFileSync(path.join(root, "input", "2026-07-09-voc-dump.md"), "people keep asking if oatmeal is ok");

    await runBatch("2026-07-09", { runner: fakeRunner, root });

    const outDir = path.join(root, "output", "2026-07-09");
    for (const f of ["insights.json", "angles.json", "hooks.json", "specs.json", "compliance.json", "REVIEW.md"]) {
      expect(fs.existsSync(path.join(outDir, f)), `${f} exists`).toBe(true);
    }
    const md = fs.readFileSync(path.join(outDir, "REVIEW.md"), "utf8");
    expect(md).toContain("[ ] approve `s_h1`");
    expect(md).not.toContain("[ ] approve `s_h2`");
    expect(md).toContain("Bounced");
  });
});
