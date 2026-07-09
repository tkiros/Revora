// video-engine/run.ts
import { loadDump, writeJson, readJson, writeText, renderReview } from "./store";
import { mineInsights, generateHooks, buildSpec, lintSpec } from "./agents";
import type { ClaudeRunner } from "./llm";
import type { Hook, VideoSpec, ComplianceReport } from "./schema";

const today = () => new Date().toISOString().slice(0, 10);

export type RunOpts = { runner?: ClaudeRunner; root?: string };

/** G0 phase: dump → insights → angles → hooks (cheap; one call per stage). */
export async function runHooks(date: string, opts?: RunOpts): Promise<Hook[]> {
  const { runner, root } = opts ?? {};
  const a = runner ? { runner } : undefined;

  const dump = loadDump(date, root);

  const insights = await mineInsights(dump, a);
  writeJson(date, "insights.json", insights, root);

  const { angles, hooks } = await generateHooks(insights, a);
  writeJson(date, "angles.json", angles, root);
  writeJson(date, "hooks.json", hooks, root);

  return hooks;
}

/** G1 phase: selected hooks → specs → compliance → REVIEW.md (expensive; one call per hook). */
export async function runSpecs(
  date: string,
  selectedHookIds: string[],
  opts?: RunOpts,
): Promise<void> {
  const { runner, root } = opts ?? {};
  const a = runner ? { runner } : undefined;

  const allHooks = readJson<Hook[]>(date, "hooks.json", root);
  const selected = new Set(selectedHookIds);
  const hooks = allHooks.filter((h) => selected.has(h.id));

  const specs: VideoSpec[] = [];
  for (const hook of hooks) specs.push(await buildSpec(hook, a));

  const ids = specs.map((s) => s.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) {
    throw new Error(`[video-engine] duplicate spec id(s) from model: ${[...new Set(dupes)].join(", ")} — cannot safely correlate compliance reports; re-run.`);
  }

  writeJson(date, "specs.json", specs, root);

  const reports: ComplianceReport[] = [];
  for (const spec of specs) reports.push(await lintSpec(spec, a));
  writeJson(date, "compliance.json", reports, root);

  writeText(date, "REVIEW.md", renderReview(date, specs, hooks, reports), root);

  const bounced = reports.filter((r) => r.verdict === "hard_fail").length;
  console.log(`[video-engine] ${date}: ${specs.length} specs, ${bounced} bounced.`);
}

/** Full run: both phases back-to-back over every hook (CLI convenience / regression guard). */
export async function runBatch(date: string, opts?: RunOpts): Promise<void> {
  const hooks = await runHooks(date, opts);
  await runSpecs(date, hooks.map((h) => h.id), opts);
}

// CLI entry
if (import.meta.url === `file://${process.argv[1]}`) {
  runBatch(process.argv[2] ?? today()).catch((e) => {
    console.error("[video-engine] batch failed:", e.message);
    process.exit(1);
  });
}
