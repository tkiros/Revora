# Session Handoff — Video Engine Dashboard (BUILT) + Slice 2 Renderer (DESIGNED)

**Date:** 2026-07-09
**Branch:** `feat/video-engine-dashboard` (HEAD `72c760d`, 12 commits off `main`, **unmerged**)
**Author of session:** Claude (Opus 4.8, 1M ctx)

This session did two things:
1. **Built + hardened the Video Engine Dashboard** (Approach B from the prior handoff's locked design) — Lane A engine refactors + Lane B UI. TDD throughout, then a high-effort multi-agent code review whose 8 real bugs were fixed. **88 unit tests pass, typecheck clean, production build succeeds.** Not yet merged.
2. **Scoped Slice 2 (the renderer)** via `/ioffice-hours` (Builder mode) → wrote + adversarially-reviewed a design doc, **now APPROVED**. No Slice 2 code written yet.

**➡️ START THE NEXT SESSION BY KICKING OFF `/iplan-eng-review`** on the Slice 2 design doc (path in §5). Do that before writing any renderer code.

---

## 1. What was accomplished

### 1a. Video Engine Dashboard — BUILT, reviewed, hardened (on `feat/video-engine-dashboard`, NOT merged)
A local, dev-only Next.js dashboard over the Slice-1 CLI engine, implementing the two-gate flow (G0 hook-pick → G1 approve/reject) with live progress, resumability, and per-spec error isolation. Built per the locked design at `~/.gstack/projects/Revora/tefera-main-design-20260709-051441.md`.

**Lane A — engine (`video-engine/`), TDD, refactor-first (Beck):**
- `llm.ts` retry now feeds the **actual zod error** into the retry prompt (the A2/A3 real-run contract bugs would now auto-fix instead of dead-lettering).
- Pure refactor: `runBatch` → `runHooks` + `runSpecs` (kept all existing tests green before adding behavior).
- `state.ts` (NEW): `run.json` job state — `status` (HOOKS/AWAITING_G0/SPECS/AWAITING_G1/DONE/FAILED), per-hook spec map, progress, `pid`, `heartbeat`. Atomic temp+rename writes; `readRun` returns `null` on crash-truncated files.
- **Per-spec ERROR isolation** — a hook whose build fails twice is marked ERROR and the batch CONTINUES (kills the all-or-nothing bug the real 20-hook run hit). MANDATORY regression test.
- **Duplicate model spec-id no-throw** — first wins, later collisions isolated as ERROR (was the `run.ts:28-32` batch-wide throw). MANDATORY regression test.
- `maxHooks` cap (NaN-guarded), resumable `runSpecs`, crash-safe incremental persistence (specs/compliance flush after every hook; resume only skips a DONE hook whose spec is actually recoverable from disk, else rebuilds — never silently dropped).
- `run.ts` is now the single job entrypoint for both the CLI and the dashboard's detached child: `--phase hooks|specs --selected <ids> --maxHooks <n>`; `claudeOnPath()` preflight; exits non-zero when a run ends FAILED.

**Lane B — UI (`app/`, `lib/`):**
- `lib/video-engine/dashboard.ts` (NEW): server-side helpers — `isVideoEngineEnabled` (fail-closed prod guard: local dev only, any `VERCEL_ENV` → 404), `isRunInFlight` (single-run lock with pid + heartbeat liveness; stale = reclaimable), `appendDecision`/`readDecisions` (`decisions.jsonl` audit), `commitReview` (path-scoped `git add`+`commit`, never sweeps unrelated staged files; "nothing to commit" is a benign no-op; index.lock/errors surface "commit manually"), `listRuns`/`readSnapshot`, `seedRun` (writes `run.json` synchronously before spawn), `spawnJob` (detached child with an `error` listener so a missing `tsx` writes FAILED instead of crashing dev-server), route-side `claudeReady`/`writeDump`.
- Six API routes under `app/api/video-engine/` (factory + injectable-env pattern, `runtime='nodejs'`): `hooks`, `specs`, `approve`, `commit`, `state` (GET snapshot), `runs` (GET history). None import the engine module (spawn-not-import → engine's claude/git stay out of the bundle).
- `app/video-engine/page.tsx` (server guard → 404 outside local dev) + `dashboard-client.tsx`: history table + new-run form; G0 hook cards + checkboxes → Build selected; live progress via 1s `/state` polling; G1 spec cards Approve/Reject; bounced (read-only) + ERROR sections with per-spec Retry; Commit-review button.
- `next.config.ts`: the webpack watcher-ignore was tried then **removed** — Next 16 defaults to Turbopack and rejects a `webpack` config (hard build error). HMR churn from `run.json` writes is cosmetic anyway (the run is a detached child that survives HMR). Documented the turbopack-native revisit path.

**Tests (`tests/unit/video-engine/`):** 88 pass. Includes the 2 mandatory regressions (per-spec ERROR isolation, duplicate-id no-throw) + the mandatory security test (all six routes 404 under production/preview/`NODE_ENV=production` AND a source-level assertion that no route imports the engine module).

### 1b. Proved it renders in the browser
Founder ran `npm run dev` and loaded `/video-engine` (on port 3001; 3000 was taken). Screenshot confirmed the UI renders correctly (New-run box, max-hooks, Start disabled until dump typed, History "No runs yet"). The "1 Issue" Next.js overlay was a **browser-extension hydration warning** (`bis_skin_checked` injected by a Bitdefender-class extension) — NOT our code; appears on every page including the landing page. Harmless; use Incognito to silence it. **The true end-to-end (paste real dump → G0 → G1 → commit against authenticated `claude`) has NOT been run yet** — that needs the founder's machine + `claude` CLI.

### 1c. High-effort code review (workflow, 21 agents) — 8 real bugs fixed
Ran `/code-review high --base main`. 10 verified findings; fixed the 8 correctness ones (commit `72c760d`):
1. **Retry data loss (BLOCKER):** `runSpecs` persisted only the current selection, so a subset re-run (per-spec Retry) wiped sibling specs. Fixed: `specs.json`/`compliance.json`/`REVIEW.md` span ALL hooks for the date (carry untouched siblings, recover DONE hooks, rebuild the rest).
2. **Polling + duplicate-spawn race (BLOCKER):** routes now `seedRun()` a `run.json` synchronously BEFORE the detached child — closes the single-run-lock window (2nd Start → 409, one spawn) AND guarantees the client immediately observes an ACTIVE status (fixes live progress never starting).
3. `runSpecs` now has an outer try/catch → FAILED (missing `hooks.json` no longer wedges `run.json` in SPECS).
4. NaN `maxHooks` guarded (parseArgs + runSpecs) — no more silent 0-spec runs.
5. CLI exits non-zero on FAILED runs.
6. `commitReview` treats "nothing to commit" as ok (no spurious 500).
7. `spawnJob` `error` listener → `tsx`-missing writes FAILED instead of crashing dev-server.
8. (crash-safe incremental persistence — committed earlier as `55c1f87`).
**Skipped (with rationale):** dup-spec-id drop = locked design (ERROR surfaced in the G1 UI with Retry); `claudeReady`/`writeAtomic` duplication = intentional for bundle isolation.

### 1d. Slice 2 (the renderer) — DESIGNED + APPROVED (no code)
Ran `/ioffice-hours` (Builder mode). Confirmed the founder is **NOT posting videos yet**, which by the plan's own gates (§11, risk 9) makes both Slice 2 (renderer) and Slice 3 (loop) premature. Founder **chose to build the Slice 2 renderer anyway** — a defensible bet because the plan names **text-on-screen myth/label-trap** as *the beachhead format* (§6) and the likely Slice-2 target (§11). Risk 9 is neutralized in the architecture: **format-agnostic pipeline, one swappable `template(format)` module** — betting wrong on the format costs one file, not the slice.

Design doc written, then adversarially reviewed (7/10 first pass, 9 issues all folded in), then **APPROVED**. See §5 for the path and §4 for what it says.

---

## 2. Current repo state

- **Branch:** `feat/video-engine-dashboard`, HEAD `72c760d`. **NOT merged to `main`.**
- **Tests:** `npx vitest run tests/unit/video-engine` → **88/88 pass**. `npm run typecheck` clean. `npm run build` succeeds (`/video-engine` prerenders as 404 under the prod build — correct: `NODE_ENV=production` fires the guard; `next dev` serves it live).
- **Working tree:** `next-env.d.ts` shows modified (auto-regenerated by `next build`, harmless — `git checkout next-env.d.ts` to clean). An unrelated untracked file `docs/handoff/2026-07-09-openrouter-model-benchmark.md` exists (not this session's work).
- **The dashboard is unmerged.** Decide: merge `feat/video-engine-dashboard` → `main` (or open a PR) before or after Slice 2. The Slice 2 design assumes this branch's engine (run.json, seed-then-spawn lock, per-spec isolation) as its substrate, so Slice 2 work continues on this branch (or a `feat/video-engine-renderer` cut from it).

### How to run the dashboard today
```
npm run dev            # http://localhost:3000/video-engine  (or the port it prints)
```
Needs an authenticated `claude` CLI on PATH. Paste a VOC dump → Start → G0 pick → Build → G1 approve/reject → Commit. Dev-only; 404 in production.

---

## 3. Key findings & open risks

- **The dashboard's true E2E is unrun.** 88 tests + browser-render confirmed, but a real dump → G0 → G1 → commit against live `claude` has not been exercised. Highest-value verification before merge. (Do it the way Slice 1's real run caught the A2/A3 bugs.)
- **Strategic (from office hours):** the founder is not posting yet. Building the renderer is ahead of distribution data — the plan's risk 9 ("getting smarter at producing without getting smarter at learning"). Mitigated by the swappable-template design, but the honest unlock is still: **post 3-5 Slice-1 scripts this week** to start the format tournament that validates the text-on-screen bet. Building and posting are not mutually exclusive.
- **Remotion is NOT free at Revora's scale.** The adversarial review corrected the "no paid dependency" claim — Remotion needs a paid Company License above a small-team/revenue threshold. This is a genuine fork: if unwelcome, **ffmpeg-direct (free, local, in-repo) becomes the honest default** for the renderer, at the cost of slower hook-card iteration. **Resolve this at eng-review before committing to Remotion.**
- **Compliance policy (unchanged, founder-ratified):** `treatment`/`prevention` are FLAG-only; `cure`/`reversal`/`diagnosis`/predictions/number-patterns/forbidden-hooks are hard-fail. Diverges intentionally from `docs/safety/claims-boundary.md`'s stricter reading.

---

## 4. WHAT'S NEXT — Slice 2 renderer (design APPROVED, eng-review is the gate)

### The design in one paragraph
Turn a G1-approved `VideoSpec` into a rendered 9:16 short with the compliance disclosure baked into the pixels, ready for G2 (publish approval). v1 targets **text-on-screen, music-only → no TTS, no Whisper** (the beats *are* the on-screen text — §15.3). It extends the SAME `run.json` state machine + dashboard: a new per-spec `render` map, a `runRender(date, selectedSpecIds)` phase (`--phase render`), new `video-engine/services/` (render/disclosure/music/export + the swappable template), a `POST /render` route + a guarded `GET /asset` stream route, and a G2 section in the dashboard. Ends at a downloadable `.mp4` + posting package; publishing stays manual (TikTok ToS §7). Variant ladder + TTS + Whisper + slideshow/check-demo templates all deferred.

### Adversarial-review corrections baked into the design (these are MANDATORY, not eng-review defers)
1. **`gate:"g1"|"g2"` discriminator on `Decision` — NOW.** Without it, G2 approvals in the shared `decisions.jsonl` (`verdict:"approve"`) corrupt the G1 approve-count and make a G2-approved spec re-appear as render-eligible. Backfill existing rows as `g1`; update every `verdict==="approve"` reader to also require `gate==="g1"`.
2. **`--phase render` must be a real phase + hard-reject unknown phases.** Today `parseArgs` accepts only `hooks|specs`, so `--phase render` falls through to `runBatch` = an expensive full LLM re-run (fails open). Extend `CliArgs.phase`, `parseArgs`, `spawnJob`'s union, and the entry dispatch.
3. **Add `"PRODUCING"` to `ACTIVE`** in `dashboard.ts` — the single-run lock currently doesn't cover rendering, so concurrent renders could collide on `run.json`.
4. **Per-spec render-wave carry/recover** — mirror `runSpecs`: a second render wave must NOT wipe wave-1's `render` entries or asset dirs. Same data-loss class Slice 1 fixed. Mandatory test.
5. **State machine:** the per-spec `render` map is authoritative; `PRODUCING` is a transient coarse status only; `DONE` is derived (all approved specs have a G2 decision), NOT a terminal wall; re-render allowed from `READY` with atomic asset overwrite.
6. **`GET /asset` path-traversal defense** — validate `date` (`\d{4}-\d{2}-\d{2}`), `platform` (enum), `specId` (∈ `specs.json` ids, never a raw path segment); assert the resolved path stays under `output/<date>/assets/`. `Content-Type: video/mp4` + Range.
7. **Distinct `renderRuntimeReady()` preflight** (NOT `claudeReady` — the render path has no LLM) + orphaned-Chromium cleanup on crashed detached renders.
8. **Bundle isolation** — `/render` and `/asset` routes must never `import` `render.ts`/`template.ts` (Remotion + Chromium); extend the source-level security test to cover them.
9. **Format-agnostic claim scoped honestly:** render/disclosure/export/state/UI are format-agnostic, but **asset provisioning is per-format** (text needs none, slideshow needs images, check-demo needs a real recording). v1 scopes asset acquisition OUT. Don't let a green "two formats share one pipeline" test read as "risk 9 fully dead."

### Build order (from the doc, minimal-first, TDD)
1. `disclosure.ts` (pure, TDD first — the compliance unit) + a fixture `VideoSpec`.
2. `template.ts` + `render.ts` (Remotion **or** ffmpeg-direct per the license decision) → render a master `.mp4` from the fixture. Prove one video renders locally before any UI.
3. `export.ts` per-platform + `music.ts`.
4. `runRender` phase + `run.json` render states + per-spec ERROR isolation + carry/recover (mirror `runSpecs`).
5. `render` route + guarded `asset` stream route (guard + lock + seed-then-spawn + path validation).
6. G2 dashboard section (player + approve + download package).

### Mandatory tests
- Render per-spec ERROR isolation (one failed render doesn't kill the batch).
- Second render wave doesn't wipe wave-1 assets (carry/recover).
- G2 approvals never inflate the G1 approve-count / never re-render-eligible (gate discriminator).
- `render`/`asset` routes 404 in prod + never import the engine (extend the existing security test).
- Disclosure renders on-screen ≥2s whenever `claims_used ≠ ∅`.

### Deferred (NOT in Slice 2 v1)
TTS (`tts.ts` default `'none'`), Whisper captions, the variant ladder (needs a Slice-3 metrics winner), slideshow/check-demo templates, auto-publish. Slice 3 (posts + metrics + the format tournament that *unlocks* Slice 2) is mapped in the doc but correctly deferred until videos are actually posted.

---

## 5. Artifacts to read in the next session

- **Slice 2 design doc (APPROVED — source of truth for the next build):**
  `~/.gstack/projects/Revora/tefera-feat-video-engine-dashboard-design-20260709-093345.md`
  (problem, premises, 3 render-engine approaches [Remotion / Creatomate / ffmpeg-direct], the recommended-approach + the Remotion-license fork, the full "how it plugs into run.json + dashboard" section with all 9 review corrections, open questions, success criteria, mandatory tests.)
- **Dashboard design doc (already built):** `~/.gstack/projects/Revora/tefera-main-design-20260709-051441.md`
- **Dashboard test plan:** `~/.gstack/projects/Revora/tefera-main-eng-review-test-plan-20260709-052000.md`
- **Canonical Video Engine plan (defines Slices 1/2/3):** `docs/Revora_Video_Engine_Plan.md` (Slices §11; §15.4 file layout; §6 format matrix; risk 9 §13).
- **CLI usage:** `video-engine/README.md` (now documents the dashboard + two-gate flow).
- **Compliance sources of truth:** `docs/safety/claims-boundary.md`, `lib/revora/safety-contract.ts`, `tests/fixtures/safety-contract.json`.
- **Prior handoff (Slice 1 shipped + dashboard planned):** `docs/handoff/2026-07-09-video-engine-slice1-shipped-and-dashboard-plan-handoff.md`.

---

## 6. Suggested first move in the next session

> "Kick off `/iplan-eng-review` on the Slice 2 renderer design at
> `~/.gstack/projects/Revora/tefera-feat-video-engine-dashboard-design-20260709-093345.md`.
> Force it to resolve three things before any code: (1) **Remotion vs ffmpeg-direct** — price the Remotion Company License; this decides `render.ts`/`template.ts`. (2) The **`gate:"g1"|"g2"` discriminator** must land in the same PR as the render phase, with all `verdict==="approve"` readers updated + old `decisions.jsonl` rows backfilled. (3) The **per-spec render-wave carry/recover** logic + its mandatory 'second wave doesn't wipe wave-1 assets' test. Then implement via subagent-driven-development, TDD, refactor-first, on `feat/video-engine-dashboard` (or a `feat/video-engine-renderer` cut from it)."

**Also decide:** whether to **merge the dashboard branch to `main`** first (it's unmerged, 88 tests green, but its true E2E against live `claude` hasn't been run — consider one real dump run before merge). And the honest parallel track: **post 3-5 Slice-1 scripts this week** to start the format tournament that validates the text-on-screen bet the renderer is built on.
