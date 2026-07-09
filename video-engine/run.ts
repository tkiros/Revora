// video-engine/run.ts
import { loadDump, writeJson, readJson, writeText, renderReview } from "./store";
import { mineInsights, generateHooks, buildSpec, lintSpec } from "./agents";
import { readRun, writeRun, newRun, type RunState } from "./state";
import { claudeOnPath, type ClaudeRunner } from "./llm";
import type { Hook, VideoSpec, ComplianceReport } from "./schema";

const today = () => new Date().toISOString().slice(0, 10);

export type CliArgs = { date: string; phase?: "hooks" | "specs"; selected?: string[]; maxHooks?: number };

/** Parse the job entrypoint argv: `<date?> [--phase hooks|specs] [--selected a,b] [--maxHooks n]`. */
export function parseArgs(argv: string[]): CliArgs {
  const flags: Record<string, string> = {};
  let date = today();
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t.startsWith("--")) flags[t.slice(2)] = argv[++i];
    else date = t;
  }
  return {
    date,
    phase: flags.phase === "hooks" || flags.phase === "specs" ? flags.phase : undefined,
    selected: flags.selected ? flags.selected.split(",").filter(Boolean) : undefined,
    maxHooks: flags.maxHooks != null ? Number(flags.maxHooks) : undefined,
  };
}

export type RunOpts = { runner?: ClaudeRunner; root?: string; maxHooks?: number };

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
  const { runner, root, maxHooks } = opts ?? {};
  const a = runner ? { runner } : undefined;

  const allHooks = readJson<Hook[]>(date, "hooks.json", root);
  const selected = new Set(selectedHookIds);
  let hooks = allHooks.filter((h) => selected.has(h.id));
  if (maxHooks != null) hooks = hooks.slice(0, maxHooks); // blunt safety net; G0 is the real lever

  const s = readRun(date, root) ?? newRun(date);
  s.status = "SPECS";
  s.selectedHookIds = selectedHookIds;
  s.progress = { stage: "building", done: 0, total: hooks.length };
  // seed a slot per selected hook so the UI can render PENDING immediately.
  for (const h of hooks) if (!s.specs[h.id]) s.specs[h.id] = { status: "PENDING" };
  save(s, root);

  // resume: carry forward specs/reports already built this run (their hooks are skipped below).
  const doneHookIds = new Set(hooks.filter((h) => s.specs[h.id]?.status === "DONE").map((h) => h.id));
  const priorSpecs = doneHookIds.size ? readJson<VideoSpec[]>(date, "specs.json", root).filter((sp) => doneHookIds.has(sp.hook_id)) : [];
  const priorReports = doneHookIds.size ? readJson<ComplianceReport[]>(date, "compliance.json", root).filter((r) => priorSpecs.some((sp) => sp.id === r.spec_id)) : [];
  const specs: VideoSpec[] = [...priorSpecs];
  const reports: ComplianceReport[] = [...priorReports];
  const seenSpecIds = new Set<string>(priorSpecs.map((sp) => sp.id));
  let done = 0;

  for (const hook of hooks) {
    // resume: a hook already DONE this run is skipped (spec/report carried forward above).
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

// CLI / spawned-job entry. Single entrypoint for the dashboard's detached child
// (`tsx video-engine/run.ts <date> --phase hooks|specs ...`) and the manual CLI.
if (import.meta.url === `file://${process.argv[1]}`) {
  const { date, phase, selected, maxHooks } = parseArgs(process.argv.slice(2));

  // Preflight: the real runner shells out to `claude`. If it's not on PATH, fail
  // loudly into run.json instead of dying with a mid-run ENOENT.
  if (!claudeOnPath()) {
    const s = readRun(date) ?? newRun(date);
    s.status = "FAILED";
    s.error = "claude CLI not found — authenticate it and ensure it's on PATH.";
    s.pid = process.pid;
    s.heartbeat = new Date().toISOString();
    writeRun(date, s);
    console.error(`[video-engine] ${s.error}`);
    process.exit(1);
  }

  const job =
    phase === "hooks" ? runHooks(date, { maxHooks })
    : phase === "specs" ? runSpecs(date, selected ?? [], { maxHooks })
    : runBatch(date, { maxHooks });

  Promise.resolve(job).catch((e) => {
    console.error("[video-engine] job failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
