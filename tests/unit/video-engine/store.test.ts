// tests/unit/video-engine/store.test.ts
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { writeJson, readJson, renderReview } from "../../../video-engine/store";
import type { VideoSpec, Hook, ComplianceReport } from "../../../video-engine/schema";

const hook = (id: string): Hook => ({
  id, angle_id: "a1", spoken_text: "s", visual_text: "v",
  framework_tag: "curiosity_gap", cta_type: "soft", pillar: "P3",
  similarity_max_30d: null, status: "DRAFT",
});
const spec = (id: string, hook_id: string): VideoSpec => ({
  id, hook_id, format: "myth_label_trap", spoken_hook: "Watch this", visual_hook: "healthy breakfast",
  beats: [], asset_list: [], caption_text: "Informational only.", disclosure_block: "",
  claims_used: [], duration_s: 25, status: "DRAFT",
});
const report = (spec_id: string, verdict: ComplianceReport["verdict"], items: ComplianceReport["items"] = []): ComplianceReport =>
  ({ id: `cr_${spec_id}`, spec_id, verdict, items, ts: "2026-07-09T00:00:00.000Z" });

describe("store", () => {
  it("round-trips JSON", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "ve-"));
    writeJson("2026-07-09", "insights.json", [{ x: 1 }], root);
    expect(readJson("2026-07-09", "insights.json", root)).toEqual([{ x: 1 }]);
  });

  it("puts hard-failed specs in the bounced section, not the approve list", () => {
    const md = renderReview(
      "2026-07-09",
      [spec("s1", "h1"), spec("s2", "h2")],
      [hook("h1"), hook("h2")],
      [
        report("s1", "pass"),
        report("s2", "hard_fail", [{ layer: "regex", severity: "hard_fail", rule: "claim:reversal", span: "reverse" }]),
      ],
    );
    expect(md).toContain("[ ] approve `s1`");
    expect(md).not.toContain("[ ] approve `s2`");
    expect(md).toContain("Bounced");
    expect(md).toContain("claim:reversal");
  });
});
