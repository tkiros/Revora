import { z } from "zod";

export const FORMATS = ["check_demo", "myth_label_trap", "slideshow", "food_clip"] as const;
export type Format = (typeof FORMATS)[number];

// §6.1 length bands (seconds). Founder-face P5 is out of engine scope.
export const DURATION_BANDS: Record<Format, [number, number]> = {
  check_demo: [15, 25],
  myth_label_trap: [20, 30],
  slideshow: [20, 30],
  food_clip: [15, 25],
};

const maxSevenWords = (s: string) => s.trim().split(/\s+/).filter(Boolean).length <= 7;

export const InsightSchema = z.object({
  id: z.string(),
  verbatim: z.string(),
  source_url: z.string(),           // "" allowed for pasted material without a link
  theme: z.string(),
  pillar: z.string(),
  freq_count: z.number().int().positive(),
  status: z.enum(["NEW", "APPROVED", "USED"]).default("NEW"),
});
export type Insight = z.infer<typeof InsightSchema>;

export const AngleSchema = z.object({
  id: z.string(),
  insight_ids: z.array(z.string()),
  premise: z.string(),
  enemy: z.string(),
  persona: z.string(),
  status: z.string().default("DRAFT"),
});
export type Angle = z.infer<typeof AngleSchema>;

export const HookSchema = z.object({
  id: z.string(),
  angle_id: z.string(),
  spoken_text: z.string(),
  visual_text: z.string().refine(maxSevenWords, "visual_text must be <= 7 words"),
  framework_tag: z.string(),
  cta_type: z.string(),
  pillar: z.string(),
  similarity_max_30d: z.number().nullable().default(null), // M2 deferred; stays null in Slice 1
  status: z.string().default("DRAFT"),
});
export type Hook = z.infer<typeof HookSchema>;

export const VideoSpecSchema = z
  .object({
    id: z.string(),
    hook_id: z.string(),
    format: z.enum(FORMATS),
    spoken_hook: z.string(),
    visual_hook: z.string().refine(maxSevenWords, "visual_hook must be <= 7 words"),
    beats: z.array(z.string()),
    // Short on-screen copy for the beat cards, distinct from `beats` (which are production/shot
    // directions). When present, the renderer shows these; else it falls back to `beats`.
    visual_beats: z.array(z.string()).optional(),
    asset_list: z.array(z.string()),
    caption_text: z.string(),
    disclosure_block: z.string(),
    claims_used: z.array(z.string()),
    duration_s: z.number(),
    status: z.string().default("DRAFT"),
  })
  .superRefine((s, ctx) => {
    const [lo, hi] = DURATION_BANDS[s.format];
    if (s.duration_s < lo || s.duration_s > hi) {
      ctx.addIssue({ code: "custom", message: `duration_s ${s.duration_s} out of band ${lo}-${hi} for ${s.format}` });
    }
    if (s.claims_used.length > 0 && s.disclosure_block.trim().length === 0) {
      ctx.addIssue({ code: "custom", message: "disclosure_block required when claims_used is non-empty" });
    }
  });
export type VideoSpec = z.infer<typeof VideoSpecSchema>;

export const ComplianceItemSchema = z.object({
  layer: z.enum(["regex", "llm"]),
  severity: z.enum(["hard_fail", "flag"]),
  rule: z.string(),
  span: z.string(),
  suggestion: z.string().optional(),
});
export type ComplianceItem = z.infer<typeof ComplianceItemSchema>;

export const ComplianceReportSchema = z.object({
  id: z.string(),
  spec_id: z.string(),
  verdict: z.enum(["hard_fail", "flag", "pass"]),
  items: z.array(ComplianceItemSchema),
  ts: z.string(),
});
export type ComplianceReport = z.infer<typeof ComplianceReportSchema>;
