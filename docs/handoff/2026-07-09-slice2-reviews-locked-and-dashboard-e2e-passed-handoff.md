# Session Handoff — Slice 2 Reviews LOCKED + Dashboard Real E2E PASSED

**Date:** 2026-07-09
**Branch:** `feat/video-engine-dashboard` (HEAD `a0329c3`, **unmerged**)
**Session did three things:** (1) `/iplan-eng-review` locked the Slice 2 renderer architecture, (2) `/iplan-design-review` wrote the text-on-screen video template visual spec, (3) ran the dashboard's **first real end-to-end** against live `claude` on genuine VOC — it **PASSED**.

**➡️ NEXT SESSION: decide merge-vs-build, then implement the Slice 2 renderer (Lane B first). No renderer code is written yet.**

---

## 1. What was accomplished this session

### 1a. Eng review — Slice 2 architecture LOCKED (`/iplan-eng-review`)
Reviewed the approved Slice 2 design against the actual substrate (`run.ts`, `state.ts`, `dashboard.ts`, `schema.ts`, `routes-guard.test.ts`). Three forks resolved:

1. **Render engine → Remotion, FREE tier.** Remotion's free tier covers companies of **≤3 people** (headcount, not revenue). Founder confirmed solo/≤3, so the "Remotion license fork" the design agonized over is **dead** — no cost, Approach A stands, strike the caveat. **On "use both backends": NO abstraction now** — `renderSpec` dispatches via `template(format).backend`, so a second backend (ffmpeg-direct) is a per-template property added only when a format needs it (YAGNI). ffmpeg stays the export tool, not a second creative renderer.
2. **Export → master.mp4 only for v1.** All three platforms accept the same 9:16 H.264 master; per-platform re-encode deferred. `export.ts` becomes a passthrough seam. `/asset` route drops the `platform` enum for v1 (validation shrinks to `date` + `specId ∈ specs.json`).
3. **Per-spec render-wave carry/recover — mandatory, no alternatives.** Mirror `runSpecs` L104-129. Render-specific trap: payload is per-spec asset **directories** on disk; `run.json.render` is the index. Wave 2 must **MERGE** the prior render map (not rebuild) or wave-1's on-disk assets get orphaned. Only the newly-selected subset transitions to RENDERING; atomic temp+rename per spec.

**New finding folded in (the design's "update every `verdict==="approve"` reader" list missed one):** `app/video-engine/dashboard-client.tsx:165` builds `decisionBy = new Map(decisions.map(d => [d.specId, d.verdict]))`. A G2 record on the same specId overwrites the G1 verdict (last-write-wins). The gate discriminator must split this into `g1By`/`g2By` filtered on `gate`.

**Critical failure gap flagged (build it):** orphaned-Chromium cleanup — a crashed detached render leaves Chrome procs the `unref`'d parent won't reap. The only failure mode with no test + a silent outcome. Build teardown + a test asserting no orphan.

**Build lanes:**
- **Lane B (do FIRST, standalone correctness fix):** `Decision.gate` discriminator + backfill existing rows as `g1` + update all readers (`dashboard.ts:129`, `dashboard-client.tsx:165`). Independent of rendering.
- **Lane A (parallel to B, sequential within):** services `disclosure.ts` (TDD first, compliance unit) → `render.ts`+`template.ts` → `export.ts`+`music.ts`.
- **Lane C (after A+B):** `runRender` phase + `/render`+`/asset` routes + G2 dashboard section. Sequence after B (both touch `dashboard.ts`).

**5 CRITICAL regression tests gate the slice:** render per-spec ERROR isolation · carry/recover (wave-2 doesn't wipe wave-1) · gate discriminator (G2 approve ≠ G1 count, not re-render-eligible) · bundle isolation (render/asset 404 in prod + never import render/template) · disclosure ≥2s when `claims_used ≠ ∅`. Plus: unknown `--phase` hard-rejects (no `runBatch` fallthrough); `/asset` path-traversal; `renderRuntimeReady()` preflight (NOT `claudeReady`).

Full test plan: `~/.gstack/projects/Revora/tefera-feat-video-engine-dashboard-eng-review-test-plan-20260709.md`

### 1b. Design review — text-on-screen template visual spec written (`/iplan-design-review`)
Resolved Open Q4. The template is a **motion extension of DESIGN.md**, not a new visual language (score 3/10 → 9/10). Calibrated against `DESIGN.md` (deep spruce `#0d5f57`, `--landing-band #0c332e`, Plus Jakarta Sans, permission-first voice). Decisions:

- **Color:** DESIGN.md tokens only, ZERO additions. Hook/beat bg = `#0c332e`, white text, ONE `--accent` highlight per card. **HARD RULE — risk colors (SAFE-green/HIGH-red) never appear in video** (reserved for real in-app food verdicts; the myth/truth contrast is carried by typography + brand accent, never red-for-myth).
- **Hook card (money frame):** 1080×1920, text in the platform safe band (~15–68% height — platform UI eats bottom ~35%/top ~10%), Plus Jakarta Sans **800** ~110–140px, white on `#0c332e`, small Revora leaf-wordmark. Hook text is the only anchor — no photo, no fabricated result card (real-app-only rule).
- **Disclosure frame:** light band, `--text-body`/`--text-strong` ~44px (**NEVER `--text-soft`** for health text), left-aligned document style, small eyebrow, held ≥2s, mirrored in caption. `disclosure.ts`'s dual-mode output.
- **Motion — FOUNDER CHOSE "platform-native punch"** (over the brand-calm rec), a reach bet. Guardrailed: (1) disclosure frame stays calm/held, never zoomed/cut; (2) energetic motion but permission-first *message* ("here's what it means for you", never "this label is LYING"); (3) punch from motion/timing only, never risk-color or emoji (else it becomes AI-slop). **Gut-check the first rendered hook** — if it reads frantic not confident, dial toward the "one signature move" option.
- **G2 dashboard (dev-only, low stakes):** reuse existing `dashboard-client.tsx` vocabulary (mono, minimal). Inline `<video>`, caption/disclosure block, Approve(G2)/Reject/Download/Retry. No new design-system work.

Both review sections + the visual spec are written into the design doc (see §5).

### 1c. Dashboard REAL E2E — PASSED (the verification that had never been run)
Assembled a **genuine VOC dump** (17 verbatim quotes across 5 real diabetes.co.uk forum threads — food-fear, healthy-breakfast betrayal, "no sugar added" label trap, newly-diagnosed overwhelm; firecrawl was out of credits so used WebSearch+WebFetch). Ran it through the live dashboard (http://localhost:3001/video-engine) against authenticated `claude` v2.1.205, gate to gate. **Everything worked, no bugs:**

| Stage | Result |
|---|---|
| Paste → `writeDump` → `seedRun` | ✅ run.json synchronous (race fix), dump 2343B |
| HOOKS (mining→hooks) | ✅ 6 insights (all verbatim from dump, REAL source URLs, correct pillars P1/P2/P3, freq-clustered) → 24 hooks, all ≤7 words |
| G0 → build 5 | ✅ per-hook map seeded, sequential BUILDING→LINTING→DONE, incremental persist |
| Compliance linter | ✅ **discriminating**: 1 pass / 3 flag / 1 hard_fail (not rubber-stamping) |
| Hard_fail correctness | ✅ caught glucose-curve prediction claim ("two people, same bowl, one stays steady") — a genuine hard line — and suggested the food-classification reframe |
| Flags | ✅ correct FLAG-only class (result-qualitative-impact, prompt-scope) |
| Disclosure contract | ✅ present iff `claims_used ≠ ∅` — the exact rule `disclosure.ts` keys off |
| G1 → 4 approves | ✅ hard_fail (vs-006) NOT approvable, bounce respected |
| `commitReview` | ✅ commit `a0329c3` path-scoped to `output/2026-07-09/` only, left all dirty files (next-env.d.ts, handoff docs, voc-dump) untouched |

**Standout:** the two clean `myth_label_trap` specs — **"0.4g sugar. Then you look down."** (from the MrsA2 M&S quote) and **"Read this line first"** — are the P3 beachhead format the renderer targets, need no disclosure, so they're the natural first specs to feed Slice 2.

---

## 2. Findings the E2E surfaced (both useful, neither a bug)
1. **The 4 committed `decisions.jsonl` rows have NO `gate` field** — these are exactly the legacy rows the Slice 2 gate discriminator must **backfill as `g1`**. The migration is now concrete, not hypothetical. Real data lives at `video-engine/output/2026-07-09/decisions.jsonl`.
2. **`video-engine/input/2026-07-09-voc-dump.md` is untracked in the working tree.** Decide: `.gitignore video-engine/input/` (VOC dumps = raw research, arguably not repo material) vs. commit deliberately. Founder's call.

---

## 3. Current repo state
- **Branch:** `feat/video-engine-dashboard`, HEAD `a0329c3` (`video-engine: review 2026-07-09` — the E2E's committed run output). **NOT merged to main.**
- **Tests:** 88 unit tests green (pre-session), typecheck clean, build succeeds. E2E now also proven live.
- **Dirty working tree:** `next-env.d.ts` (auto-regen, harmless), `docs/handoff/*.md` (untracked handoffs incl. this one), `video-engine/input/2026-07-09-voc-dump.md` (untracked, see finding 2).
- **Dashboard runs at** http://localhost:3001/video-engine (a dev server was already up on 3001; 3000 is another service). `claude` authenticated, `tsx` global, node 24.

---

## 4. WHAT'S NEXT (in order)

1. **Decide: merge the dashboard to main, or build the renderer first.** The dashboard now has 88 tests + a real E2E behind it — strong case to merge/PR before the branch grows. Slice 2 can continue on this branch or a `feat/video-engine-renderer` cut from it.
2. **Implement Slice 2 renderer** (design + reviews are implementation-ready). Order:
   - **Lane B first:** `Decision.gate` discriminator + backfill the 2026-07-09 rows as `g1` + update readers (`dashboard.ts:129`, `dashboard-client.tsx:165`). Standalone correctness fix, lands with the render phase.
   - **Lane A:** `disclosure.ts` (TDD first) + fixture spec → `template.ts`+`render.ts` (Remotion, prove one .mp4 renders locally) → `export.ts` (passthrough) + `music.ts`.
   - **Lane C:** `runRender` phase (`--phase render`, mirror `runSpecs` carry/recover) + `/render` + guarded `/asset` routes + G2 dashboard section.
   - Build the **orphaned-Chromium cleanup** (the one critical gap).
   - Land all **5 CRITICAL tests** alongside.
3. **Verify Slice 2 the same way:** render one of the two clean myth_label_trap specs from today's run (`vs-hk-019-01` "0.4g sugar. Then you look down." or `vs-022` "Read this line first") → watch the .mp4 → confirm disclosure logic (neither needs a disclosure frame since `claims_used` is empty — pick a `claims_used ≠ ∅` spec like vs-002/vs-016 to prove the ≥2s disclosure renders).
4. **Design gut-check:** render the first hook card, confirm "platform-native punch" reads confident not frantic; dial back if needed.
5. **Distribution track (still the honest unlock):** the founder is not posting yet. The renderer is built ahead of a format-tournament winner (mitigated by swappable-template design). Posting 3-5 Slice-1 scripts remains the real validation of the text-on-screen bet.

---

## 5. Artifacts to read next session
- **Slice 2 design doc (APPROVED + both review sections + visual spec — source of truth):**
  `~/.gstack/projects/Revora/tefera-feat-video-engine-dashboard-design-20260709-093345.md`
- **Slice 2 eng-review test plan:** `~/.gstack/projects/Revora/tefera-feat-video-engine-dashboard-eng-review-test-plan-20260709.md`
- **Brand/design system (template calibration):** `DESIGN.md`
- **Real E2E run output (the proof + the backfill test case):** `video-engine/output/2026-07-09/` (insights, hooks, specs, compliance, decisions.jsonl, REVIEW.md)
- **The VOC dump used:** `video-engine/input/2026-07-09-voc-dump.md` (also `/tmp/.../scratchpad/2026-07-09-voc-dump.md`)
- **Canonical plan:** `docs/Revora_Video_Engine_Plan.md` · **CLI/dashboard usage:** `video-engine/README.md`
- **Compliance sources of truth:** `docs/safety/claims-boundary.md`, `lib/revora/safety-contract.ts`
- **Prior handoff (dashboard built + Slice 2 designed):** `docs/handoff/2026-07-09-video-engine-dashboard-built-slice2-designed-handoff.md`

---

## 6. Suggested first move next session
> "The Slice 2 renderer is fully reviewed (eng + design) and the dashboard's real E2E passed. Decide merge-vs-build: either open the PR for `feat/video-engine-dashboard` (88 tests + real E2E behind it), or start implementing the renderer via subagent-driven-development, TDD, refactor-first — **Lane B (gate discriminator + backfill the 2026-07-09 decisions.jsonl rows as g1) first**, then Lane A services (`disclosure.ts` TDD-first), then `runRender` + routes + G2 UI. Build the orphaned-Chromium cleanup. Land all 5 critical regression tests. Verify by rendering a `claims_used ≠ ∅` spec from today's run and confirming the ≥2s disclosure frame."
