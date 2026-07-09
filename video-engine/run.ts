// video-engine/run.ts
import fs from "node:fs";
import path from "node:path";
import { loadDump, writeJson, readJson, writeText, renderReview } from "./store";
import { mineInsights, generateHooks, buildSpec, lintSpec } from "./agents";
import { readRun, writeRun, newRun, type RunState } from "./state";
import { claudeOnPath, type ClaudeRunner } from "./llm";
import { approvedSpecIds } from "./decisions";
import { buildPostingPackage } from "./export";
import { ROOT } from "./config";
import type { Hook, VideoSpec, ComplianceReport } from "./schema";

const today = () => new Date().toISOString().slice(0, 10);

const PHASES = ["hooks", "specs", "render"] as const;
export type Phase = (typeof PHASES)[number];
export type CliArgs = { date: string; phase?: Phase; selected?: string[]; maxHooks?: number };

/** Parse the job entrypoint argv: `<date?> [--phase hooks|specs|render] [--selected a,b] [--maxHooks n]`.
 *  A present-but-unrecognized --phase THROWS (must never fall through to a full runBatch LLM re-run). */
export function parseArgs(argv: string[]): CliArgs {
  const flags: Record<string, string> = {};
  let date = today();
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t.startsWith("--")) flags[t.slice(2)] = argv[++i];
    else date = t;
  }
  if (flags.phase !== undefined && !PHASES.includes(flags.phase as Phase)) {
    throw new Error(`unknown --phase "${flags.phase}" (expected hooks|specs|render)`);
  }
  return {
    date,
    phase: flags.phase as Phase | undefined,
    selected: flags.selected ? flags.selected.split(",").filter(Boolean) : undefined,
    // ignore a missing/garbage --maxHooks rather than pass NaN downstream
    maxHooks: (() => { const n = Number(flags.maxHooks); return Number.isFinite(n) && n > 0 ? n : undefined; })(),
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

  // State-read first so the outer catch can always mark FAILED (e.g. hooks.json missing).
  const s = readRun(date, root) ?? newRun(date);
  s.status = "SPECS";
  s.selectedHookIds = selectedHookIds;
  save(s, root);

  try {
    const allHooks = readJson<Hook[]>(date, "hooks.json", root);
    const selected = new Set(selectedHookIds);
    let hooks = allHooks.filter((h) => selected.has(h.id));
    // maxHooks is a blunt cap; guard against NaN/garbage so we never slice(0, NaN) → 0.
    if (Number.isFinite(maxHooks) && (maxHooks as number) > 0) hooks = hooks.slice(0, maxHooks);

    s.progress = { stage: "building", done: 0, total: hooks.length };
    for (const h of hooks) if (!s.specs[h.id]) s.specs[h.id] = { status: "PENDING" };
    save(s, root);

    // Persistence spans ALL hooks for the date, not just this selection — a subset
    // re-run (per-spec Retry) must never wipe sibling specs. So:
    //   carry   = existing specs whose hook isn't in THIS build set (untouched)
    //   recover = existing specs for build-set hooks already DONE (resume; skip rebuild)
    //   rebuild = everything else in the build set
    const safe = <T,>(name: string): T[] => { try { return readJson<T[]>(date, name, root); } catch { return []; } };
    const existingSpecs = safe<VideoSpec>("specs.json");
    const existingReports = safe<ComplianceReport>("compliance.json");
    const buildSet = new Set(hooks.map((h) => h.id));
    const doneInBuildSet = new Set(hooks.filter((h) => s.specs[h.id]?.status === "DONE").map((h) => h.id));

    const carrySpecs = existingSpecs.filter((sp) => !buildSet.has(sp.hook_id));
    const recoverSpecs = existingSpecs.filter((sp) => doneInBuildSet.has(sp.hook_id));
    const recovered = new Set(recoverSpecs.map((sp) => sp.hook_id));
    const keptSpecs = [...carrySpecs, ...recoverSpecs];
    const keptIds = new Set(keptSpecs.map((sp) => sp.id));

    const specs: VideoSpec[] = [...keptSpecs];
    const reports: ComplianceReport[] = existingReports.filter((r) => keptIds.has(r.spec_id));
    const seenSpecIds = new Set<string>(keptSpecs.map((sp) => sp.id));
    let done = 0;

    const flush = () => { writeJson(date, "specs.json", specs, root); writeJson(date, "compliance.json", reports, root); };

    for (const hook of hooks) {
      if (recovered.has(hook.id)) { done++; continue; } // resume: recovered from disk
      try {
        s.specs[hook.id] = { status: "BUILDING" };
        s.progress = { stage: "building", done, total: hooks.length };
        save(s, root);
        const spec = await buildSpec(hook, a);

        // duplicate model spec id: first wins, later collisions isolated (never a batch-wide throw).
        if (seenSpecIds.has(spec.id)) {
          s.specs[hook.id] = { status: "ERROR", error: `duplicate spec id "${spec.id}" — cannot safely correlate compliance reports`, specId: spec.id };
          done++;
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
      flush(); // incremental persistence: crash-safe resume
      save(s, root);
    }

    flush();
    // Render over the FULL set (all hooks + all kept/built specs) so REVIEW.md and
    // the commit reflect every spec for the date, not just this run's selection.
    writeText(date, "REVIEW.md", renderReview(date, specs, allHooks, reports), root);

    s.status = "AWAITING_G1";
    s.progress = { stage: "awaiting_g1", done, total: hooks.length };
    save(s, root);

    const bounced = reports.filter((r) => r.verdict === "hard_fail").length;
    console.log(`[video-engine] ${date}: ${specs.length} specs, ${bounced} bounced.`);
  } catch (e) {
    s.status = "FAILED";
    s.error = e instanceof Error ? e.message : String(e);
    save(s, root);
  }
}

/** Render one approved spec to a 9:16 master at `outFile`. Injected so the phase is unit-testable
 *  without launching Remotion/Chromium; the default lazily imports render.ts (keeps Remotion out of
 *  the module graph — and out of every non-render test's import cost). */
export type RenderFn = (spec: VideoSpec, outFile: string) => Promise<string>;
const defaultRender: RenderFn = async (spec, outFile) => (await import("./render")).renderSpec(spec, outFile);

/**
 * G2-producing phase: render the founder's selected (G1-approved) specs to master.mp4 + caption.txt.
 * Per-spec ERROR isolation and carry/recover mirror runSpecs — but the payload is on-disk asset
 * DIRECTORIES indexed by run.json.render, so a second wave MUST MERGE the prior render map (start
 * from readRun's state), never rebuild it, or wave-1's assets get orphaned (files survive, the G2
 * view loses the pointer). No LLM in this path.
 */
export async function runRender(
  date: string,
  selectedSpecIds: string[],
  opts?: { render?: RenderFn; root?: string; force?: boolean },
): Promise<void> {
  const { root, force } = opts ?? {};
  const render = opts?.render ?? defaultRender;
  const veRoot = root ?? ROOT;

  const s = readRun(date, root) ?? newRun(date);
  s.status = "PRODUCING";
  s.render ??= {}; // MERGE: prior render map is carried from readRun, never rebuilt
  save(s, root);

  try {
    const safe = <T,>(name: string): T[] => { try { return readJson<T[]>(date, name, root); } catch { return []; } };
    // eligibility keys off specs.json ids (unique — duplicate-spec-id hooks ERROR before this).
    const specById = new Map(safe<VideoSpec>("specs.json").map((sp) => [sp.id, sp]));
    const approved = approvedSpecIds(date, veRoot); // gate discriminator: only G1-approved render
    const outRoot = path.resolve(veRoot, "output", date, "assets");

    const targets = [...new Set(selectedSpecIds)]
      .filter((id) => approved.has(id) && specById.has(id))       // approved + present on disk
      .filter((id) => force || s.render![id]?.status !== "READY"); // skip already-READY (recover) unless force

    let done = 0;
    s.progress = { stage: "rendering", done, total: targets.length };
    save(s, root);

    for (const id of targets) {
      const specDef = specById.get(id)!;
      s.render![id] = { status: "RENDERING" };
      save(s, root);
      const tmp = `${path.join(outRoot, id)}.tmp-${process.pid}`;
      try {
        fs.rmSync(tmp, { recursive: true, force: true });
        fs.mkdirSync(tmp, { recursive: true });
        const master = path.join(tmp, "master.mp4");
        await render(specDef, master);
        // dual-mode compliance (caption half): buildPostingPackage mirrors the disclosure in.
        fs.writeFileSync(path.join(tmp, "caption.txt"), buildPostingPackage(specDef, master).caption);
        // Only rename on FULL success → no half-written asset dir. rm+rename is safe under the
        // single-run lock (one writer per date). ponytail: not truly atomic; the date lock is the guard.
        const dest = path.join(outRoot, id);
        fs.rmSync(dest, { recursive: true, force: true });
        fs.mkdirSync(outRoot, { recursive: true });
        fs.renameSync(tmp, dest);
        s.render![id] = { status: "READY", assetDir: dest };
      } catch (e) {
        fs.rmSync(tmp, { recursive: true, force: true }); // discard partial temp (master rendered, export failed, …)
        s.render![id] = { status: "ERROR", error: e instanceof Error ? e.message : String(e) };
      }
      done++;
      s.progress = { stage: "rendering", done, total: targets.length };
      save(s, root); // incremental persist → crash-safe resume
    }

    s.status = "AWAITING_G1"; // rest at the gate; the per-spec render map carries G2-eligibility
    save(s, root);
  } catch (e) {
    s.status = "FAILED";
    s.error = e instanceof Error ? e.message : String(e);
    save(s, root);
  }
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

  // Preflight: the LLM phases shell out to `claude`. If it's not on PATH, fail loudly into
  // run.json instead of dying with a mid-run ENOENT. The render path has NO LLM — skip it there
  // (the /render route's renderRuntimeReady() gates Chrome; a missing runtime surfaces per-spec).
  if (phase !== "render" && !claudeOnPath()) {
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
    : phase === "render" ? runRender(date, selected ?? [], {})
    : runBatch(date, { maxHooks });

  Promise.resolve(job)
    .then(() => {
      // runHooks/runSpecs swallow errors into run.json (FAILED) rather than throwing,
      // so surface that as a non-zero exit for CLI/CI wrappers that check $?.
      if (readRun(date)?.status === "FAILED") {
        console.error(`[video-engine] run FAILED: ${readRun(date)?.error ?? ""}`);
        process.exit(1);
      }
    })
    .catch((e) => {
      console.error("[video-engine] job failed:", e instanceof Error ? e.message : e);
      process.exit(1);
    });
}
