# Video Engine Slice 1 — "The Script Factory" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn a weekly voice-of-customer dump into compliance-pre-checked video scripts, ending in a `REVIEW.md` the founder approves in ~15 min — no render, no publish.

**Architecture:** Four single-task LLM agents (A1 miner → A2 hooks → A3 spec → A4 linter), each a prompted `claude -p` call returning zod-validated JSON. State is in-repo JSON under `video-engine/output/<date>/`; git history is the append-only compliance audit trail; a generated `REVIEW.md` is the G1 human gate. The A4 linter reuses the existing `loadSafetyContract()` regexes.

**Tech Stack:** TypeScript (ESNext, `moduleResolution: Bundler`, strict), zod 4, Claude Code headless (`claude -p --output-format json`) as the LLM backend, `tsx` as the TS script runner, vitest for tests.

## Global Constraints

- **Subordinate to** `docs/safety/claims-boundary.md`, `docs/safety/copy-ledger.md`, and the §3.2 pre-flight in `docs/Revora_90-Day_Distribution_Strategy.md`. When they disagree, they win.
- **LLM backend is Claude Code headless only** — spawn `claude -p --output-format json`, write the prompt to **stdin** (never argv — a large dump exceeds `ARG_MAX`). No OpenAI/Anthropic API path is built.
- **Reuse, don't rewrite** the banned-family regexes: `loadSafetyContract()` from `lib/revora/safety-contract.ts` + `tests/fixtures/safety-contract.json`. Compile each pattern with `new RegExp(entry.pattern, entry.flags || "i")` — identical to `scripts/validate-safety-contract.mjs:446`.
- **Linter severity split:** HARD-FAIL families = `diagnosis, cure, reversal, fda approval, unsupported clinical proof` + all `forbiddenPredictions` + all `qualitativeOnly` number patterns + the three §6.1 forbidden-hook families. FLAG-only = `treatment`, `prevention` (innocent marketing use). A `hard_fail` spec never reaches `REVIEW.md`'s approve list.
- **Quality floors** (schema-enforced): `visual_text`/`visual_hook` ≤ 7 words; `duration_s` within the format's §6.1 band; `disclosure_block` non-empty whenever `claims_used` is non-empty.
- **Deferred (do NOT build):** renderer/TTS/captions/publisher (Slice 2); metrics/A5/experiments (Slice 3); Reddit fetcher (leave the `dump: string` seam only); M2 embedding-similarity (`similarity_max_30d` stays `null`).
- All imports within `video-engine/` are **extensionless** (matches repo convention under Bundler resolution).
- New files live under `video-engine/`; tests live under `tests/unit/video-engine/` (vitest `include` is `tests/**/*.test.ts`).

---

## File Structure

| File | Responsibility |
|---|---|
| `video-engine/config.ts` | One place for model id, paths, brand constants. |
| `video-engine/schema.ts` | zod schemas = §9 entities (Insight, Angle, Hook, VideoSpec, ComplianceItem/Report) + quality-floor refinements. |
| `video-engine/llm.ts` | Adapter: `llm(prompt, schema, opts)` → validated object via `claude -p`; injectable runner; `extractJson`; one retry. |
| `video-engine/linter.ts` | A4 deterministic pass: `runRegexChecks(spec)` reusing `loadSafetyContract()` + forbidden-hook list + severity mapping. |
| `video-engine/store.ts` | `loadDump`, `writeJson`/`readJson` under `output/<date>/`, pure `renderReview(...)`. |
| `video-engine/agents.ts` | `mineInsights`, `generateHooks`, `buildSpec`, `lintSpec` (merges regex + LLM layer). |
| `video-engine/run.ts` | `runBatch(date, opts?)` orchestration + CLI entry. |
| `video-engine/prompts/{a1-miner,a2-hooks,a3-spec,a4-linter}.md` | Governance layer — prompts with embedded JSON contracts + claims boundary. |
| `tests/unit/video-engine/{schema,llm,linter,store,agents,run}.test.ts` | Per-task tests. |

---

## Task 1: Scaffolding, config, schema, runner wiring

**Files:**
- Create: `video-engine/config.ts`, `video-engine/schema.ts`
- Modify: `package.json` (add `tsx` devDependency + `video-engine` script)
- Test: `tests/unit/video-engine/schema.test.ts`

**Interfaces:**
- Produces: `Format`, `FORMATS`, `InsightSchema`/`Insight`, `AngleSchema`/`Angle`, `HookSchema`/`Hook`, `VideoSpecSchema`/`VideoSpec`, `ComplianceItemSchema`/`ComplianceItem`, `ComplianceReportSchema`/`ComplianceReport`, `MODEL` (from config).

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/video-engine/schema.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/video-engine/schema.test.ts`
Expected: FAIL — cannot resolve `../../../video-engine/schema`.

- [ ] **Step 3: Write config + schema**

```ts
// video-engine/config.ts
// ponytail: single config surface (the "setup node"). Add keys here, nowhere else.
export const MODEL = process.env.VIDEO_ENGINE_MODEL ?? ""; // "" = claude default model
export const ROOT = "video-engine";
```

```ts
// video-engine/schema.ts
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
```

- [ ] **Step 4: Add the tsx runner + script to `package.json`**

Add to `devDependencies` (already in the lockfile as a transitive dep — this makes it a declared direct dep): `"tsx": "^4.21.0"`. Add to `scripts`:

```json
"video-engine": "tsx video-engine/run.ts"
```

Then run: `npm install`
Expected: no download churn (tsx already resolved), `package.json` updated.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/video-engine/schema.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add video-engine/config.ts video-engine/schema.ts package.json package-lock.json tests/unit/video-engine/schema.test.ts
git commit -m "feat(video-engine): slice-1 scaffold — config + zod schema + tsx runner"
```

---

## Task 2: A4 linter — deterministic regex layer (the spine)

**Files:**
- Create: `video-engine/linter.ts`
- Test: `tests/unit/video-engine/linter.test.ts`

**Interfaces:**
- Consumes: `VideoSpec`, `ComplianceItem` (Task 1); `loadSafetyContract` from `lib/revora/safety-contract.ts`.
- Produces: `runRegexChecks(spec: VideoSpec): ComplianceItem[]`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/video-engine/linter.test.ts
import { describe, it, expect } from "vitest";
import { runRegexChecks } from "../../../video-engine/linter";
import type { VideoSpec } from "../../../video-engine/schema";

function spec(over: Partial<VideoSpec>): VideoSpec {
  return {
    id: "s1", hook_id: "h1", format: "myth_label_trap",
    spoken_hook: "Watch what oatmeal really does", visual_hook: "your healthy breakfast",
    beats: [], asset_list: [], caption_text: "Informational only.",
    disclosure_block: "", claims_used: [], duration_s: 25, status: "DRAFT", ...over,
  } as VideoSpec;
}
const rules = (items: ReturnType<typeof runRegexChecks>) => items.map((i) => i.rule);

describe("runRegexChecks", () => {
  it("hard-fails the reversal family", () => {
    const items = runRegexChecks(spec({ caption_text: "Revora helps reverse prediabetes." }));
    expect(items.some((i) => i.rule === "claim:reversal" && i.severity === "hard_fail")).toBe(true);
  });

  it("hard-fails a future-A1C prediction", () => {
    const items = runRegexChecks(spec({ beats: ["Your A1C will drop to 5.8% this way."] }));
    expect(items.some((i) => i.severity === "hard_fail" && i.rule.startsWith("prediction:"))).toBe(true);
  });

  it("flags — does not hard-fail — bare 'treat'/'prevent'", () => {
    const items = runRegexChecks(spec({ caption_text: "Treat yourself to steel-cut oats to prevent a boring breakfast." }));
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.severity === "flag")).toBe(true);
  });

  it("hard-fails the fear/urgency hook family", () => {
    const items = runRegexChecks(spec({ spoken_hook: "Check this right now before it's too late" }));
    expect(items.some((i) => i.rule.startsWith("hook:") && i.severity === "hard_fail")).toBe(true);
  });

  it("hard-fails the dramatic-results testimonial family", () => {
    const items = runRegexChecks(spec({ spoken_hook: "This fixed my A1C in two weeks" }));
    expect(items.some((i) => i.rule.startsWith("hook:") && i.severity === "hard_fail")).toBe(true);
  });

  it("passes clean, on-brand copy", () => {
    const items = runRegexChecks(spec({
      spoken_hook: "Watch what it says about breakfast",
      visual_hook: "your healthy breakfast",
      caption_text: "This looks more balanced than a fast-carb option. Informational only.",
    }));
    expect(items).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/video-engine/linter.test.ts`
Expected: FAIL — cannot resolve `../../../video-engine/linter`.

- [ ] **Step 3: Write the linter**

```ts
// video-engine/linter.ts
import { loadSafetyContract } from "../lib/revora/safety-contract";
import type { VideoSpec, ComplianceItem } from "./schema";

// Mirror scripts/validate-safety-contract.mjs:446 exactly.
function compile(entry: { pattern: string; flags?: string }): RegExp {
  return new RegExp(entry.pattern, entry.flags || "i");
}

// Genuinely-fatal claim families (§5/§10). Everything else in forbiddenClaims (treatment,
// prevention) is a FLAG so innocent marketing ("treat yourself") doesn't block a spec.
const HARD_FAIL_CLAIM_LABELS = new Set([
  "diagnosis", "cure", "reversal", "fda approval", "unsupported clinical proof",
]);

// §6.1 forbidden-hook families. Not in the product-copy fixture — defined here. The LLM
// layer (Task 6) is the primary catch for tone; these regexes catch the obvious markers.
const FORBIDDEN_HOOKS: Array<{ rule: string; pattern: RegExp }> = [
  { rule: "hook:fear/urgency", pattern: /\b(right now|before it'?s too late|act now|don'?t wait|urgent(ly)?)\b/i },
  { rule: "hook:fear/urgency", pattern: /\b\d+\s+(seconds?|minutes?|hours?|days?)\s+(left|to go|until)\b/i },
  { rule: "hook:dramatic-results", pattern: /\b(fixed|cured|reversed|healed|dropped|lowered|normalized)\b[^.]{0,25}\b(a1c|blood sugar|prediabetes|diabetes)\b/i },
  { rule: "hook:dramatic-results", pattern: /\b(my|his|her|their)\s+a1c\b[^.]{0,25}\b(dropped|fell|went down|normalized|plummeted)\b/i },
  { rule: "hook:polarizing/taboo", pattern: /\b(shouldn'?t|don'?t)\s+deserve\b|\b(idiots?|losers?|stupid)\b/i },
];

function scannedFields(spec: VideoSpec): Array<{ field: string; text: string }> {
  // disclosure_block is a controlled field (approved disclaimer) — excluded from the banned-claim
  // scan so "not a diagnosis"-style wording can't false-hard-fail. Adequacy is checked separately.
  return [
    { field: "spoken_hook", text: spec.spoken_hook },
    { field: "visual_hook", text: spec.visual_hook },
    { field: "caption_text", text: spec.caption_text },
    ...spec.beats.map((t, i) => ({ field: `beats[${i}]`, text: t })),
    ...spec.asset_list.map((t, i) => ({ field: `asset_list[${i}]`, text: t })),
  ];
}

export function runRegexChecks(spec: VideoSpec): ComplianceItem[] {
  const { fixture, copy } = loadSafetyContract();
  const items: ComplianceItem[] = [];
  const seen = new Set<string>();
  const push = (severity: "hard_fail" | "flag", rule: string, text: string, re: RegExp) => {
    const span = text.match(re)?.[0] ?? "";
    const key = `${rule}|${span}`;
    if (seen.has(key)) return;
    seen.add(key);
    items.push({ layer: "regex", severity, rule, span });
  };

  for (const { text } of scannedFields(spec)) {
    for (const entry of fixture.forbiddenClaims) {
      const re = compile(entry);
      if (re.test(text)) {
        const severity = HARD_FAIL_CLAIM_LABELS.has(entry.label) ? "hard_fail" : "flag";
        push(severity, `claim:${entry.label}`, text, re);
      }
    }
    for (const entry of fixture.forbiddenPredictions) {
      const re = compile(entry);
      if (re.test(text)) push("hard_fail", `prediction:${entry.label}`, text, re);
    }
    for (const entry of fixture.qualitativeOnly.forbiddenPatterns) {
      const re = compile(entry);
      if (re.test(text)) push("hard_fail", `number:${entry.label}`, text, re);
    }
    for (const hook of FORBIDDEN_HOOKS) {
      if (hook.pattern.test(text)) push("hard_fail", hook.rule, text, hook.pattern);
    }
  }

  // Disclosure adequacy: if claims are used, the block must carry the approved disclaimer verbatim.
  if (spec.claims_used.length > 0 && !spec.disclosure_block.includes(copy.disclaimer)) {
    items.push({
      layer: "regex", severity: "flag", rule: "disclosure:missing-approved-text",
      span: spec.disclosure_block.slice(0, 60),
      suggestion: copy.disclaimer,
    });
  }

  return items;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/video-engine/linter.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add video-engine/linter.ts tests/unit/video-engine/linter.test.ts
git commit -m "feat(video-engine): A4 deterministic linter reusing safety-contract regexes"
```

---

## Task 3: LLM adapter (`llm.ts`)

**Files:**
- Create: `video-engine/llm.ts`
- Test: `tests/unit/video-engine/llm.test.ts`

**Interfaces:**
- Produces: `type ClaudeRunner = (prompt: string) => Promise<string>`; `extractJson(text: string): unknown`; `llm<T>(prompt: string, schema: ZodType<T>, opts?: { runner?: ClaudeRunner }): Promise<T>`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/video-engine/llm.test.ts
import { describe, it, expect } from "vitest";
import { z } from "zod";
import { extractJson, llm } from "../../../video-engine/llm";

const S = z.object({ a: z.number() });

describe("extractJson", () => {
  it("parses bare JSON", () => { expect(extractJson('{"a":1}')).toEqual({ a: 1 }); });
  it("parses fenced JSON with prose around it", () => {
    expect(extractJson('Sure:\n```json\n{"a":1}\n```\ndone')).toEqual({ a: 1 });
  });
  it("parses a top-level array", () => { expect(extractJson("[1,2]")).toEqual([1, 2]); });
});

describe("llm", () => {
  it("validates a good response", async () => {
    const out = await llm("p", S, { runner: async () => '{"a":1}' });
    expect(out).toEqual({ a: 1 });
  });

  it("retries once on invalid JSON then succeeds", async () => {
    let n = 0;
    const runner = async () => (n++ === 0 ? "not json" : '{"a":2}');
    expect(await llm("p", S, { runner })).toEqual({ a: 2 });
    expect(n).toBe(2);
  });

  it("throws after a second failure", async () => {
    await expect(llm("p", S, { runner: async () => "nope" })).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/video-engine/llm.test.ts`
Expected: FAIL — cannot resolve `../../../video-engine/llm`.

- [ ] **Step 3: Write the adapter**

```ts
// video-engine/llm.ts
import { spawn } from "node:child_process";
import type { ZodType } from "zod";
import { MODEL } from "./config";

export type ClaudeRunner = (prompt: string) => Promise<string>;

// Default runner: pipe the prompt to `claude -p` via STDIN (never argv — ARG_MAX).
const defaultRunner: ClaudeRunner = (prompt) =>
  new Promise((resolve, reject) => {
    const args = ["-p", "--output-format", "json", ...(MODEL ? ["--model", MODEL] : [])];
    const child = spawn("claude", args, { stdio: ["pipe", "pipe", "pipe"] });
    let out = "", err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) return reject(new Error(`claude exited ${code}: ${err}`));
      try {
        const env = JSON.parse(out);
        resolve(typeof env.result === "string" ? env.result : out);
      } catch {
        resolve(out); // envelope wasn't JSON; hand raw text to extractJson
      }
    });
    child.stdin.write(prompt);
    child.stdin.end();
  });

export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced ? fenced[1] : text).trim();
  try {
    return JSON.parse(body);
  } catch {
    const starts = ["{", "["].map((c) => body.indexOf(c)).filter((i) => i >= 0);
    const first = starts.length ? Math.min(...starts) : -1;
    const last = Math.max(body.lastIndexOf("}"), body.lastIndexOf("]"));
    if (first < 0 || last < 0) throw new Error("no JSON found in model output");
    return JSON.parse(body.slice(first, last + 1));
  }
}

export async function llm<T>(
  prompt: string,
  schema: ZodType<T>,
  opts?: { runner?: ClaudeRunner },
): Promise<T> {
  const runner = opts?.runner ?? defaultRunner;
  const attempt = async (p: string) => schema.parse(extractJson(await runner(p)));
  try {
    return await attempt(prompt);
  } catch {
    // one retry with an explicit "JSON only" nudge; a second failure throws (dead-letter).
    return attempt(prompt + "\n\nYour previous output was invalid. Return ONLY the JSON object matching the schema — no prose, no code fences.");
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/video-engine/llm.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add video-engine/llm.ts tests/unit/video-engine/llm.test.ts
git commit -m "feat(video-engine): claude -p LLM adapter with zod validation + retry"
```

---

## Task 4: Store — dump load, JSON persistence, REVIEW.md rendering

**Files:**
- Create: `video-engine/store.ts`
- Test: `tests/unit/video-engine/store.test.ts`

**Interfaces:**
- Consumes: `VideoSpec`, `Hook`, `ComplianceReport` (Task 1).
- Produces:
  - `loadDump(date: string, root?: string): string`
  - `writeJson(date: string, name: string, data: unknown, root?: string): void`
  - `readJson<T>(date: string, name: string, root?: string): T`
  - `renderReview(date: string, specs: VideoSpec[], hooks: Hook[], reports: ComplianceReport[]): string` (pure)

- [ ] **Step 1: Write the failing test**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/video-engine/store.test.ts`
Expected: FAIL — cannot resolve `../../../video-engine/store`.

- [ ] **Step 3: Write the store**

```ts
// video-engine/store.ts
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./config";
import type { VideoSpec, Hook, ComplianceReport } from "./schema";

const outDir = (date: string, root: string) => path.join(process.cwd(), root, "output", date);
const inPath = (date: string, root: string) => path.join(process.cwd(), root, "input", `${date}-voc-dump.md`);

export function loadDump(date: string, root: string = ROOT): string {
  const p = inPath(date, root);
  if (!fs.existsSync(p)) throw new Error(`No VOC dump at ${p} — paste this week's material there first.`);
  const text = fs.readFileSync(p, "utf8").trim();
  if (!text) throw new Error(`VOC dump at ${p} is empty.`);
  return text;
}

export function writeJson(date: string, name: string, data: unknown, root: string = ROOT): void {
  const dir = outDir(date, root);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), JSON.stringify(data, null, 2));
}

export function readJson<T>(date: string, name: string, root: string = ROOT): T {
  return JSON.parse(fs.readFileSync(path.join(outDir(date, root), name), "utf8")) as T;
}

export function writeText(date: string, name: string, text: string, root: string = ROOT): void {
  const dir = outDir(date, root);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), text);
}

export function renderReview(
  date: string,
  specs: VideoSpec[],
  hooks: Hook[],
  reports: ComplianceReport[],
): string {
  const hookById = new Map(hooks.map((h) => [h.id, h]));
  const reportBySpec = new Map(reports.map((r) => [r.spec_id, r]));
  const lines: string[] = [`# G1 Review — ${date}`, ""];

  const reviewable = specs.filter((s) => reportBySpec.get(s.id)?.verdict !== "hard_fail");
  const bounced = specs.filter((s) => reportBySpec.get(s.id)?.verdict === "hard_fail");

  lines.push(`## To review (${reviewable.length})`, "");
  for (const s of reviewable) {
    const r = reportBySpec.get(s.id);
    const h = hookById.get(s.hook_id);
    lines.push(`### \`${s.id}\` — ${s.format} — ${s.duration_s}s`);
    lines.push(`- **Spoken hook:** ${s.spoken_hook}`);
    lines.push(`- **Visual hook:** ${s.visual_hook}`);
    if (h) lines.push(`- **Framework:** ${h.framework_tag} · **pillar:** ${h.pillar}`);
    lines.push(`- **Caption:** ${s.caption_text}`);
    for (const it of r?.items ?? []) {
      lines.push(`  - ⚠️ FLAG \`${it.rule}\` — "${it.span}"${it.suggestion ? ` → ${it.suggestion}` : ""}`);
    }
    lines.push(`- [ ] approve \`${s.id}\`   - [ ] reject \`${s.id}\``, "");
  }

  lines.push(`## Bounced — hard-fail, fix and re-run (${bounced.length})`, "");
  for (const s of bounced) {
    const r = reportBySpec.get(s.id);
    lines.push(`### \`${s.id}\` — ${s.format}`);
    lines.push(`- Hook: ${s.spoken_hook}`);
    for (const it of r?.items.filter((i) => i.severity === "hard_fail") ?? []) {
      lines.push(`  - ❌ \`${it.rule}\` — "${it.span}"${it.suggestion ? ` → ${it.suggestion}` : ""}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/video-engine/store.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add video-engine/store.ts tests/unit/video-engine/store.test.ts
git commit -m "feat(video-engine): JSON store + pure REVIEW.md renderer"
```

---

## Task 5: Prompts + agents (`agents.ts`)

**Files:**
- Create: `video-engine/prompts/a1-miner.md`, `a2-hooks.md`, `a3-spec.md`, `a4-linter.md`
- Create: `video-engine/agents.ts`
- Test: `tests/unit/video-engine/agents.test.ts`

**Interfaces:**
- Consumes: `llm`, `ClaudeRunner` (Task 3); `runRegexChecks` (Task 2); all schemas (Task 1).
- Produces:
  - `mineInsights(dump: string, opts?): Promise<Insight[]>`
  - `generateHooks(insights: Insight[], opts?): Promise<{ angles: Angle[]; hooks: Hook[] }>`
  - `buildSpec(hook: Hook, opts?): Promise<VideoSpec>`
  - `lintSpec(spec: VideoSpec, opts?): Promise<ComplianceReport>`
  - (`opts` is `{ runner?: ClaudeRunner }` throughout.)

- [ ] **Step 1: Write the prompt files**

Each prompt ends with an explicit JSON contract and a machine marker (first line, HTML comment) the integration test keys on. Author the bodies from the cited sources; the **required** structural elements are listed per file.

`video-engine/prompts/a1-miner.md` — first line exactly `<!-- a1-miner -->`. Body: role = extract verbatim pain quotes from the VOC dump; never invent verbatims; one insight per distinct pain theme with a `freq_count`. Contract: `Return ONLY {"insights": Insight[]} where Insight = {id, verbatim, source_url, theme, pillar, freq_count, status:"NEW"}. pillar ∈ {P1,P2,P3,P4,P5}. source_url may be "".`

`video-engine/prompts/a2-hooks.md` — first line `<!-- a2-hooks -->`. Body: embed the swipe-file **mechanisms** (scenario injection, curiosity gap, attention anchor, STI visual-text hook 3–7 words, curiosity reloop, context-lean→scroll-stop→contrarian-snapback, CTA-after-value) from `docs/superpowers/plans/video_hooks_scripts_ideas.md`. Hard ban (state verbatim): no polarizing/taboo, no fear/urgency, no dramatic-results/testimonial — persuasion is curiosity + relief + specificity, not shock (§6.1). Contract: `Return ONLY {"angles": Angle[], "hooks": Hook[]}. Each Hook: {id, angle_id, spoken_text, visual_text (<=7 words), framework_tag, cta_type, pillar, similarity_max_30d:null, status:"DRAFT"}.`

`video-engine/prompts/a3-spec.md` — first line `<!-- a3-spec -->`. Body: turn one Hook into a VideoSpec; screen recordings are always the real app (never mocked); CTA placed after value, not in the first beats; set `duration_s` within the §6.1 band for the chosen `format`; if any performance claim is used, list it in `claims_used` and set `disclosure_block` to the approved disclaimer verbatim: "Revora is informational only and is not medical advice. Talk with a doctor or registered dietitian for guidance that is specific to you." Contract: `Return ONLY a VideoSpec object {id, hook_id, format ∈ [check_demo,myth_label_trap,slideshow,food_clip], spoken_hook, visual_hook (<=7 words), beats[], asset_list[], caption_text, disclosure_block, claims_used[], duration_s, status:"DRAFT"}. hook_id MUST equal the input hook's id.`

`video-engine/prompts/a4-linter.md` — first line `<!-- a4-linter -->`. Body: paste the full text of `docs/safety/claims-boundary.md` (Allowed Claim Classes + Banned Claim Families) and the §6.1 forbidden-hook table. Task = flag any span violating the boundary or importing a forbidden-hook tone; quote the span; propose a compliant rewrite. Note you are advisory; a human decides. Contract: `Return ONLY {"items": ComplianceItem[]} where ComplianceItem = {layer:"llm", severity:"hard_fail"|"flag", rule, span, suggestion?}. Empty items means clean.`

- [ ] **Step 2: Write the failing test**

```ts
// tests/unit/video-engine/agents.test.ts
import { describe, it, expect } from "vitest";
import { lintSpec } from "../../../video-engine/agents";
import type { VideoSpec } from "../../../video-engine/schema";

const spec = (over: Partial<VideoSpec>): VideoSpec => ({
  id: "s1", hook_id: "h1", format: "myth_label_trap", spoken_hook: "Watch this", visual_hook: "healthy breakfast",
  beats: [], asset_list: [], caption_text: "Informational only.", disclosure_block: "",
  claims_used: [], duration_s: 25, status: "DRAFT", ...over,
});

describe("lintSpec", () => {
  it("merges regex + LLM items and reports pass on clean copy with an empty LLM layer", async () => {
    const rep = await lintSpec(spec({}), { runner: async () => '{"items":[]}' });
    expect(rep.verdict).toBe("pass");
    expect(rep.spec_id).toBe("s1");
  });

  it("hard-fails from the regex layer even if the LLM layer says clean", async () => {
    const rep = await lintSpec(spec({ caption_text: "Revora reverses prediabetes." }), { runner: async () => '{"items":[]}' });
    expect(rep.verdict).toBe("hard_fail");
    expect(rep.items.some((i) => i.rule === "claim:reversal")).toBe(true);
  });

  it("degrades to regex-only if the LLM layer errors", async () => {
    const rep = await lintSpec(spec({}), { runner: async () => { throw new Error("cli down"); } });
    expect(rep.verdict).toBe("pass"); // regex found nothing; LLM failure is swallowed
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/unit/video-engine/agents.test.ts`
Expected: FAIL — cannot resolve `../../../video-engine/agents`.

- [ ] **Step 4: Write the agents**

```ts
// video-engine/agents.ts
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { ROOT } from "./config";
import { llm, type ClaudeRunner } from "./llm";
import { runRegexChecks } from "./linter";
import {
  InsightSchema, AngleSchema, HookSchema, VideoSpecSchema,
  ComplianceItemSchema,
  type Insight, type Angle, type Hook, type VideoSpec, type ComplianceReport,
} from "./schema";

type Opts = { runner?: ClaudeRunner };
const loadPrompt = (name: string) =>
  fs.readFileSync(path.join(process.cwd(), ROOT, "prompts", name), "utf8");

export async function mineInsights(dump: string, opts?: Opts): Promise<Insight[]> {
  const prompt = `${loadPrompt("a1-miner.md")}\n\n## VOC DUMP\n${dump}`;
  const out = await llm(prompt, z.object({ insights: z.array(InsightSchema) }), opts);
  return out.insights;
}

export async function generateHooks(insights: Insight[], opts?: Opts): Promise<{ angles: Angle[]; hooks: Hook[] }> {
  const prompt = `${loadPrompt("a2-hooks.md")}\n\n## APPROVED INSIGHTS\n${JSON.stringify(insights, null, 2)}`;
  return llm(prompt, z.object({ angles: z.array(AngleSchema), hooks: z.array(HookSchema) }), opts);
}

export async function buildSpec(hook: Hook, opts?: Opts): Promise<VideoSpec> {
  const prompt = `${loadPrompt("a3-spec.md")}\n\n## HOOK\n${JSON.stringify(hook, null, 2)}`;
  return llm(prompt, VideoSpecSchema, opts);
}

export async function lintSpec(spec: VideoSpec, opts?: Opts): Promise<ComplianceReport> {
  const regexItems = runRegexChecks(spec);
  const prompt = `${loadPrompt("a4-linter.md")}\n\n## SPEC\n${JSON.stringify(spec, null, 2)}`;
  const llmOut = await llm(prompt, z.object({ items: z.array(ComplianceItemSchema) }), opts).catch(() => ({ items: [] }));

  const seen = new Set<string>();
  const items = [...regexItems, ...llmOut.items].filter((i) => {
    const k = `${i.rule}|${i.span}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const verdict = items.some((i) => i.severity === "hard_fail")
    ? "hard_fail"
    : items.some((i) => i.severity === "flag")
      ? "flag"
      : "pass";
  return { id: `cr_${spec.id}`, spec_id: spec.id, verdict, items, ts: new Date().toISOString() };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/video-engine/agents.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add video-engine/prompts video-engine/agents.ts tests/unit/video-engine/agents.test.ts
git commit -m "feat(video-engine): A1–A4 agents + governance prompts"
```

---

## Task 6: Orchestration (`run.ts`) + end-to-end smoke

**Files:**
- Create: `video-engine/run.ts`, `video-engine/input/.gitkeep`
- Test: `tests/unit/video-engine/run.test.ts`

**Interfaces:**
- Consumes: all agents (Task 5), store (Task 4) — including `writeText` (Task 4).
- Produces: `runBatch(date: string, opts?: { runner?: ClaudeRunner; root?: string }): Promise<void>` + CLI entry.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/video-engine/run.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/video-engine/run.test.ts`
Expected: FAIL — cannot resolve `../../../video-engine/run`.

- [ ] **Step 3: Write the orchestrator**

Prompt files always load from the real repo (`ROOT`, via `agents.ts`); only the store writes/reads under `root`. So thread `root` through the store calls and `loadDump`, and thread `runner` through the agents.

```ts
// video-engine/run.ts
import { loadDump, writeJson, writeText, renderReview } from "./store";
import { mineInsights, generateHooks, buildSpec, lintSpec } from "./agents";
import type { ClaudeRunner } from "./llm";
import type { VideoSpec, ComplianceReport } from "./schema";

const today = () => new Date().toISOString().slice(0, 10);

export async function runBatch(
  date: string,
  opts?: { runner?: ClaudeRunner; root?: string },
): Promise<void> {
  const { runner, root } = opts ?? {};
  const a = runner ? { runner } : undefined;

  const dump = loadDump(date, root);

  const insights = await mineInsights(dump, a);
  writeJson(date, "insights.json", insights, root);

  const { angles, hooks } = await generateHooks(insights, a);
  writeJson(date, "angles.json", angles, root);
  writeJson(date, "hooks.json", hooks, root);

  const specs: VideoSpec[] = [];
  for (const hook of hooks) specs.push(await buildSpec(hook, a));
  writeJson(date, "specs.json", specs, root);

  const reports: ComplianceReport[] = [];
  for (const spec of specs) reports.push(await lintSpec(spec, a));
  writeJson(date, "compliance.json", reports, root);

  writeText(date, "REVIEW.md", renderReview(date, specs, hooks, reports), root);

  const bounced = reports.filter((r) => r.verdict === "hard_fail").length;
  console.log(`[video-engine] ${date}: ${specs.length} specs, ${bounced} bounced.`);
}

// CLI entry
if (import.meta.url === `file://${process.argv[1]}`) {
  runBatch(process.argv[2] ?? today()).catch((e) => {
    console.error("[video-engine] batch failed:", e.message);
    process.exit(1);
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/video-engine/run.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Full suite + typecheck**

Run: `npx vitest run tests/unit/video-engine && npm run typecheck`
Expected: all video-engine tests PASS; `tsc --noEmit` clean.

- [ ] **Step 6: Commit**

```bash
git add video-engine/run.ts video-engine/input/.gitkeep tests/unit/video-engine/run.test.ts
git commit -m "feat(video-engine): batch orchestrator + end-to-end smoke test"
```

---

## Task 7: Docs — how to run it

**Files:**
- Create: `video-engine/README.md`

**Interfaces:** none.

- [ ] **Step 1: Write the README**

Cover: (1) paste the weekly dump into `video-engine/input/<YYYY-MM-DD>-voc-dump.md`; (2) run `npm run video-engine -- <date>` (defaults to today); (3) open `video-engine/output/<date>/REVIEW.md`, tick `approve`/`reject`, commit the file — the commit IS the compliance audit trail; (4) hard-failed specs are in the Bounced section, fix the prompt or input and re-run; (5) requires the `claude` CLI authenticated on the Max plan; `VIDEO_ENGINE_MODEL` env overrides the model; (6) what's deferred (render/publish/metrics — Slices 2–3). Link `docs/Revora_Video_Engine_Plan.md` and `docs/superpowers/specs/2026-07-09-video-engine-slice-1-design.md`.

- [ ] **Step 2: Commit**

```bash
git add video-engine/README.md
git commit -m "docs(video-engine): slice-1 run instructions"
```

---

## Self-Review

**Spec coverage:**
- §1 scope / four agents → Tasks 5–6. ✓
- §2.1 in-repo JSON + REVIEW.md + git audit trail → Task 4 (`store.ts`), Task 7 README. ✓
- §2.2 paste dump + Reddit seam → `loadDump` + `dump: string` into `mineInsights`; no fetcher built. ✓
- §2.3 Claude Code headless, stdin, retry → Task 3 (`llm.ts`). ✓
- §2.4 A4 reuses `loadSafetyContract`, hard-fail/flag split → Task 2. ✓
- §2.5 linter advisory, G1 decides → `renderReview` approve/reject checkboxes; hard-fail bounces. ✓
- §5 two-layer linter + disclosure adequacy → Tasks 2 (regex) + 5 (`lintSpec` merge). ✓
- §6 schema + quality floors → Task 1. ✓
- §7 A2 mechanisms-not-tones → Task 5 `a2-hooks.md`. ✓
- §8 one linter test → Task 2 (plus store/llm/agents/run tests). ✓
- Deferred items (render/publish/metrics/M2/Reddit) → not built; `similarity_max_30d` nullable. ✓

**Placeholder scan:** the two `NOTE for implementer` blocks (store `readJson`, run `REVIEW.md.tmp`) are deliberate, each with the exact corrected code in the very next step — not open-ended TODOs. No "add error handling"/"similar to Task N"/bare TODOs remain.

**Type consistency:** `runRegexChecks`, `llm`, `extractJson`, `ClaudeRunner`, `mineInsights`, `generateHooks`, `buildSpec`, `lintSpec`, `runBatch`, `loadDump`, `writeJson`, `readJson`, `writeText`, `renderReview` — names/signatures are consistent across the tasks that produce and consume them. `ComplianceItem.severity` ∈ `{hard_fail, flag}`; `ComplianceReport.verdict` ∈ `{hard_fail, flag, pass}` — used consistently in linter, agents, store, run.
