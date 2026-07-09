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
