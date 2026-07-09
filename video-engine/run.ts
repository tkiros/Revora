// video-engine/run.ts
import { loadDump, writeJson, readJson, writeText, renderReview } from "./store";
import { mineInsights, generateHooks, buildSpec, lintSpec } from "./agents";
import { readRun, writeRun, newRun, type RunState } from "./state";
import type { ClaudeRunner } from "./llm";
import type { Hook, VideoSpec, ComplianceReport } from "./schema";

const today = () => new Date().toISOString().slice(0, 10);

export type RunOpts = { runner?: ClaudeRunner; root?: string };

const save = (s: RunState, root?: string) => {
  s.heartbeat = new Date().toISOString();
  s.pid = process.pid;
  writeRun(s.date, s, root);
};

/** G0 phase: dump → insights → angles → hooks (cheap; one call per stage). */
export async function runHooks(date: string, opts?: RunOpts): Promise<Hook[]> {
  const { runner, root } = opts ?? {};
  const a = runner ? { runner } : undefined;
  const s = readRun(date, root) ?? newRun(date);
  s.status = "HOOKS";
  s.progress = { stage: "mining", done: 0, total: 0 };
  save(s, root);

  try {
    const dump = loadDump(date, root);

    const insights = await mineInsights(dump, a);
    writeJson(date, "insights.json", insights, root);
    s.progress = { stage: "hooks", done: 0, total: 0 };
    save(s, root);

    const { angles, hooks } = await generateHooks(insights, a);
    writeJson(date, "angles.json", angles, root);
    writeJson(date, "hooks.json", hooks, root);

    if (hooks.length === 0) {
      s.status = "FAILED";
      s.error = "A2 generated 0 hooks — check the dump / prompt.";
      save(s, root);
      return [];
    }

    s.status = "AWAITING_G0";
    s.progress = { stage: "awaiting_g0", done: hooks.length, total: hooks.length };
    save(s, root);
    return hooks;
  } catch (e) {
    s.status = "FAILED";
    s.error = e instanceof Error ? e.message : String(e);
    save(s, root);
    return [];
  }
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

  const s = readRun(date, root) ?? newRun(date);
  s.status = "SPECS";
  s.selectedHookIds = selectedHookIds;
  s.progress = { stage: "building", done: 0, total: hooks.length };
  // seed a slot per selected hook so the UI can render PENDING immediately.
  for (const h of hooks) if (!s.specs[h.id]) s.specs[h.id] = { status: "PENDING" };
  save(s, root);

  const specs: VideoSpec[] = [];
  const reports: ComplianceReport[] = [];
  const seenSpecIds = new Set<string>();
  let done = 0;

  for (const hook of hooks) {
    // resume: a hook already DONE this run is skipped (spec/report re-read below).
    if (s.specs[hook.id]?.status === "DONE") { done++; continue; }
    try {
      s.specs[hook.id] = { status: "BUILDING" };
      s.progress = { stage: "building", done, total: hooks.length };
      save(s, root);
      const spec = await buildSpec(hook, a);

      // duplicate model spec id: first wins, later collisions are isolated (never a batch-wide throw).
      if (seenSpecIds.has(spec.id)) {
        s.specs[hook.id] = { status: "ERROR", error: `duplicate spec id "${spec.id}" — cannot safely correlate compliance reports`, specId: spec.id };
        done++;
        s.progress = { stage: "building", done, total: hooks.length };
        save(s, root);
        continue;
      }
      seenSpecIds.add(spec.id);

      s.specs[hook.id] = { status: "LINTING", specId: spec.id };
      s.progress = { stage: "linting", done, total: hooks.length };
      save(s, root);
      const report = await lintSpec(spec, a);

      specs.push(spec);
      reports.push(report);
      s.specs[hook.id] = { status: "DONE", specId: spec.id };
    } catch (e) {
      // per-spec isolation: a hook that fails twice is marked ERROR; the batch continues.
      s.specs[hook.id] = { status: "ERROR", error: e instanceof Error ? e.message : String(e) };
    }
    done++;
    s.progress = { stage: "linting", done, total: hooks.length };
    save(s, root);
  }

  writeJson(date, "specs.json", specs, root);
  writeJson(date, "compliance.json", reports, root);
  writeText(date, "REVIEW.md", renderReview(date, specs, hooks, reports), root);

  s.status = "AWAITING_G1";
  s.progress = { stage: "awaiting_g1", done, total: hooks.length };
  save(s, root);

  const bounced = reports.filter((r) => r.verdict === "hard_fail").length;
  console.log(`[video-engine] ${date}: ${specs.length} specs, ${bounced} bounced.`);
}

/** Full run: both phases back-to-back over every hook (CLI convenience / regression guard). */
export async function runBatch(date: string, opts?: RunOpts): Promise<void> {
  const hooks = await runHooks(date, opts);
  if (!hooks.length) return;
  await runSpecs(date, hooks.map((h) => h.id), opts);
}

// CLI entry
if (import.meta.url === `file://${process.argv[1]}`) {
  runBatch(process.argv[2] ?? today()).catch((e) => {
    console.error("[video-engine] batch failed:", e.message);
    process.exit(1);
  });
}
