import { describe, it, expect } from "vitest";
import { HookSchema, VideoSpecSchema } from "../../../video-engine/schema";

const baseSpec = {
  id: "s1", hook_id: "h1", format: "myth_label_trap",
  spoken_hook: "Watch what oatmeal does", visual_hook: "your healthy breakfast",
  beats: ["beat one"], asset_list: ["screen recording"],
  caption_text: "Informational only.", disclosure_block: "", claims_used: [],
  duration_s: 25, status: "DRAFT",
};

describe("schema quality floors", () => {
  it("rejects a visual_hook over 7 words", () => {
    const r = HookSchema.safeParse({
      id: "h1", angle_id: "a1", spoken_text: "x",
      visual_hook: undefined, visual_text: "one two three four five six seven eight",
      framework_tag: "curiosity_gap", cta_type: "soft", pillar: "P3", status: "DRAFT",
    });
    expect(r.success).toBe(false);
  });

  it("rejects duration outside the format band", () => {
    const r = VideoSpecSchema.safeParse({ ...baseSpec, duration_s: 40 });
    expect(r.success).toBe(false);
  });

  it("requires a disclosure_block when claims_used is non-empty", () => {
    const r = VideoSpecSchema.safeParse({ ...baseSpec, claims_used: ["result-qualitative-impact"], disclosure_block: "" });
    expect(r.success).toBe(false);
  });

  it("accepts a clean in-band spec", () => {
    expect(VideoSpecSchema.safeParse(baseSpec).success).toBe(true);
  });
});
