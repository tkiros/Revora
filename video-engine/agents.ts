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
  const llmOut = await llm(prompt, z.object({ items: z.array(ComplianceItemSchema) }), opts).catch((e) => { console.warn(`[video-engine] A4 LLM linter failed for ${spec.id}, degrading to regex-only: ${e instanceof Error ? e.message : e}`); return { items: [] }; });

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
