# Session Handoff — Video Engine Slice 1 (shipped) + Dashboard (planned)

**Date:** 2026-07-09
**Branch:** `main` (HEAD `87fac9f`)
**Author of session:** Claude (Opus 4.8, 1M ctx)

This handoff covers two connected pieces of work completed this session:
1. **Built + shipped Video Engine Slice 1** — the CLI "script factory" (merged to `main`, tested, proven with a real run).
2. **Scoped + eng-reviewed a local Dashboard** over it — design is locked and implementation-ready, **not yet built**.

Pick up in a new session by reading this file top to bottom, then the two artifacts linked in §5.

---

## 1. What was accomplished

### 1a. Video Engine Slice 1 — BUILT, TESTED, MERGED to `main`
A standalone TypeScript module under `video-engine/` that turns a weekly voice-of-customer (VOC) dump into compliance-pre-checked short-video scripts, ending in a human-approved `REVIEW.md`. No render/publish (deferred to Slices 2/3).

Pipeline: **A1 miner → A2 hooks → A3 spec → A4 linter**, each a headless `claude -p --output-format json` call returning zod-validated JSON. State is JSON under `video-engine/output/<date>/`; git history is the compliance audit trail. A4 reuses the existing `loadSafetyContract()` regexes (`lib/revora/safety-contract.ts` + `tests/fixtures/safety-contract.json`).

- Executed the plan at `docs/superpowers/plans/2026-07-09-video-engine-slice-1.md` via subagent-driven-development (7 tasks, TDD, per-task spec+quality review, final whole-branch review).
- **22/22 vitest tests pass** (`npx vitest run tests/unit/video-engine`), `npm run typecheck` clean.
- SDD progress ledger: `.superpowers/sdd/video-engine-slice-1-progress.md`.

Files created under `video-engine/`: `config.ts`, `schema.ts`, `llm.ts`, `linter.ts`, `store.ts`, `agents.ts`, `run.ts`, `prompts/{a1-miner,a2-hooks,a3-spec,a4-linter}.md`, `README.md`, `input/.gitkeep`. Tests under `tests/unit/video-engine/`.

### 1b. Proved it works with a REAL run (not just mocked tests)
The 22 tests inject a fake LLM runner, so a real `claude -p` path had never executed. Ran it live against a synthetic VOC dump. This caught **two real bugs the mocked tests structurally could not** — both fixed and committed:
- **A2 (`86e8502`):** the hooks prompt's JSON contract enumerated every Hook field but only said `angles: Angle[]`, so the real model invented an angle shape → zod rejected it. Fix: enumerate Angle fields.
- **A3 (`87fac9f`):** the model returned `beats` as objects; schema wants `string[]`. Fix: pin `beats`/`asset_list`/`claims_used` as plain-string arrays.

After the fixes, the tail of the pipeline (A3 build → A4 lint → REVIEW.md) ran clean on 2 hooks: one spec **hard-fail bounced** (regex caught `hook:fear/urgency` on "right now" in a CTA beat), one spec **flagged** (LLM linter caught a missing disclosure) but stayed approvable. The compliance engine does its job on real model output.

### 1c. Scoped a Dashboard (office-hours) — DESIGN DOC written
Ran `/ioffice-hours` (Builder mode) to scope a UI over the CLI. Confirmed **local, single-user**. Chose **Approach B: full local Next.js dashboard + job model + history**. Design doc written and adversarially reviewed (9 issues caught + fixed).

### 1d. Eng-reviewed the Dashboard (plan-eng-review) — ARCHITECTURE LOCKED
Ran `/iplan-eng-review`. Locked 4 architecture decisions, produced a test coverage map, then an **outside voice** (independent Claude review; Codex timed out) caught **5 more real gaps**, all folded in. Eng Review status: **CLEAR**.

---

## 2. Current repo state

- **Branch:** `main`, HEAD `87fac9f`. Video-engine Slice 1 is fully merged (via `4bdc17d`) plus the two real-run fixes.
- **Tests:** `npx vitest run tests/unit/video-engine` → 22/22 pass. `npm run typecheck` clean.
- **Commit trail (most recent first):**
  - `87fac9f` A3 contract fix (beats/asset_list string arrays)
  - `86e8502` A2 contract fix (enumerate Angle fields)
  - `4bdc17d` Merge feat/video-engine-slice-1
  - `81febae` guard duplicate spec ids + log A4 LLM degradation
  - `e5c7e44` README · `c472329` orchestrator+e2e · `89ac2f1` agents+prompts · `cf81f37` store path.resolve fix · `a2c50dd` store · `132b5a8` llm adapter · `b848b75` linter · `937ee31` scaffold
- **Untracked test artifacts** (safe to delete): `video-engine/input/2026-07-09-voc-dump.md` and `video-engine/output/` — leftovers from the real run. Clean with:
  `rm -rf video-engine/output video-engine/input/2026-07-09-voc-dump.md`
- The `feat/video-engine-slice-1` branch still exists locally (merged; can be deleted).

### How to run the CLI today
1. Paste the week's raw VOC material into `video-engine/input/<YYYY-MM-DD>-voc-dump.md`.
2. `npm run video-engine -- <date>` (omit date = today). Needs an authenticated `claude` CLI (Max plan) on PATH.
3. Open `video-engine/output/<date>/REVIEW.md`; tick approve/reject; commit it (commit = audit trail).
4. `VIDEO_ENGINE_MODEL=<id>` env overrides the model. Full guide: `video-engine/README.md`.

---

## 3. Key findings & known issues (CLI, current)

- **Fragility at volume (all-or-nothing):** `runBatch` builds a spec for EVERY hook then lints; a rich dump → 20 hooks → ~40 sequential `claude` calls (~15-25 min). One spec that fails zod twice throws and discards the WHOLE batch. The full 20-hook run never completed for this reason (that's how the A3 bug was found). Fixed by the Dashboard plan's per-spec ERROR isolation.
- **Blind retry:** `llm.ts` retries once with a generic "return JSON" nudge; it does NOT feed the zod error back, so contract-shape bugs never self-correct. Both A2/A3 bugs would have auto-fixed with a smarter retry. (In the Dashboard plan.)
- **Aggressive fear/urgency regex:** hard-fails benign CTA phrasing like "...right now" (real example: a CTA beat). Design is conservative + human-fixes-and-reruns, but it will bounce otherwise-fine scripts. Tuning call, not a bug.
- **Minor roll-up** (from Slice 1 reviews, all accepted/non-blocking): duplicate hard-fails when fixture patterns overlap (report noise); `disclosure_block` excluded from banned-claim scan by design; default `claude` runner lacks `setEncoding("utf8")` + stdin-after-spawn-error guard (untested path); `maxSevenWords("")` returns true (no `.min(1)`). See `.superpowers/sdd/video-engine-slice-1-progress.md` for the full list.
- **Compliance policy ratified by founder:** `treatment`/`prevention` are FLAG-only (surface a ⚠️ at the G1 gate but stay approvable); `cure`/`reversal`/`diagnosis`/predictions/number-patterns/forbidden-hooks are hard-fail. This intentionally diverges from `docs/safety/claims-boundary.md`'s stricter Banned-Family reading; founder chose it to avoid false hard-fails on innocent marketing ("treat yourself"). Revisit if compliance posture tightens.

---

## 4. WHAT'S NEXT — build the Dashboard (Approach B, hardened)

**Decision:** Founder chose to build the full local dashboard now (an independent review recommended CLI-first / defer the UI; founder overrode, with runway + "ship-before-build" context surfaced and weighed). Build it.

### Locked architecture (do NOT re-litigate — these are decided)
1. **Run lifecycle = detached child process.** API routes `child_process.spawn('tsx', ['video-engine/run.ts', '<date>', '--phase', 'hooks|specs', '--selected', '<ids>', '--maxHooks', '<n>'])`, return `202` immediately, do NOT import the engine module (so `claude`/`git`/engine never enter the Next bundle). `run.ts` becomes the single job entrypoint (CLI + spawned). Set `cwd: <repoRoot>`; preflight-check `claude` is on PATH before spawning.
2. **Two-gate flow (the core insight):** `runHooks(date)` → **G0** (founder ticks 3-5 hooks worth building) → `runSpecs(date, selectedHookIds)` → **G1** (approve/reject specs). Hooks are cheap (1 call for all), specs are expensive (1 call each), so gating at hooks cuts calls ~75% AND raises quality. This is the single most important product idea in the plan.
3. **Per-spec ERROR isolation:** wrap each `buildSpec`/`lintSpec`; a spec that fails twice is marked `status:"ERROR"`, the batch CONTINUES. (Kills the all-or-nothing bug — mandatory regression test.)
4. **Duplicate spec-id no-throw:** the current `run.ts:28-32` throw becomes "mark colliding spec ERROR" (mandatory regression test).
5. **Smarter retry:** `llm.ts` feeds the zod error + schema field list into the retry prompt.
6. **`run.json` job state + resumability:** `{ date, status: HOOKS|AWAITING_G0|SPECS|AWAITING_G1|DONE|FAILED, selectedHookIds, progress:{stage,done,total}, specs:{[id]: PENDING|BUILDING|LINTING|ERROR|DONE}, pid, heartbeat }`. Atomic writes (temp+rename). Resume skips completed items.
7. **Single-run lock with liveness:** in-flight only if `status` active AND (`pid` alive OR `heartbeat` < ~90s old). Prevents the stale-lock-wedged-at-409-forever deadlock (outside-voice catch).
8. **HMR safety:** add `video-engine/output/**` to the Next dev watcher's ignore list so ~1s `run.json` writes don't churn Fast Refresh.
9. **Production guard (security, must-have):** route is `export const runtime = 'nodejs'`, returns 404 when `VERCEL_ENV=production` (reuse the fail-closed pattern in `app/api/auth/reviewer-signin/route.ts`), add engine dir to `serverExternalPackages`. This route shells out to `claude` and `git` — it must never be reachable or bundled in prod.
10. **Path-scoped commit with error handling:** `git commit output/<date> -m "..."` (never `git add ... && git commit`); check `.git/index.lock`, catch mid-rebase/pre-commit-hook failures, surface "commit manually" instead of silent fail.
11. **Sequential spec builds for v1** (parallel fan-out deferred to TODO).
12. **Refactor-first (Beck):** split `runBatch` → `runHooks`/`runSpecs` as a PURE refactor, confirm all 22 tests stay green, THEN add behavior. Never structural + behavioral in one commit.

### UI (local Next.js, dev-only `/video-engine`)
- Home + history: table of past runs read from `output/*` (date, #hooks/#specs/#approved/#bounced/status). New-run form: textarea (dump) + maxHooks + Start.
- `POST /api/video-engine/hooks`: writes `input/<date>-voc-dump.md` from the body (reject empty), spawns `runHooks`.
- G0 view: hook cards + checkboxes → Build selected → `POST /api/video-engine/specs` (persist `selectedHookIds`).
- Live progress: client polls `run.json` (NOT SSE — deliberately, single user).
- G1 view: spec cards, Approve/Reject (writes status + appends `decisions.jsonl`), bounced specs read-only with reason, per-spec Retry, a "Commit review" button (path-scoped commit).

### Implementation order (2 lanes, sequential)
- **Lane A (engine, `video-engine/`, testable headless with injected runner):** retry hardening → `runHooks`/`runSpecs` split (refactor, keep 22 tests green) → per-spec ERROR isolation + dup-id → `run.json` state machine + atomic writes + pid/heartbeat → maxHooks → resume.
- **Lane B (UI, `app/`, depends on Lane A):** API routes (hooks/specs/approve/commit/progress) → `/video-engine` pages → prod guard.
- Recommended: run this via subagent-driven-development (same as Slice 1). Start on a fresh branch, e.g. `feat/video-engine-dashboard`.

### Mandatory tests (IRON RULE + security)
1. **Regression:** one failing spec must NOT kill the batch (per-spec isolation).
2. **Regression:** duplicate model spec-id must NOT throw.
3. **Security:** `VERCEL_ENV=production` → `/video-engine` + API routes return 404, engine never imported.
Plus (from hardening): stale-lock recovery (dead pid/old heartbeat reclaims the lock), git-commit failure surfaces cleanly, `claude`-missing preflight → FAILED with actionable message.

### Deferred (NOT in scope for v1)
Parallel spec builds (TODO), inline spec editing (retry-only for now), hosted/multi-user (no DB/auth/API swap), angle-level G0, Reddit fetcher/render/publish/metrics (Slices 2/3).

---

## 5. Artifacts to read in the next session

- **Dashboard design doc (locked + hardened, source of truth):**
  `~/.gstack/projects/Revora/tefera-main-design-20260709-051441.md`
  (contains: problem, premises, approaches, Recommended Approach, `run.json` schema, Eng-Review Locked Decisions, Outside-Voice Hardening, NOT-in-scope, failure-mode table, parallelization lanes, GSTACK REVIEW REPORT.)
- **Dashboard test plan:**
  `~/.gstack/projects/Revora/tefera-main-eng-review-test-plan-20260709-052000.md`
- **Slice 1 plan (already executed):** `docs/superpowers/plans/2026-07-09-video-engine-slice-1.md`
- **Slice 1 SDD ledger (decisions + minor roll-up):** `.superpowers/sdd/video-engine-slice-1-progress.md`
- **CLI usage:** `video-engine/README.md`
- **Compliance sources of truth:** `docs/safety/claims-boundary.md`, `docs/safety/copy-ledger.md`, `lib/revora/safety-contract.ts`.

---

## 6. Suggested first move in the next session

> "Build the Video Engine Dashboard per the locked design at `~/.gstack/projects/Revora/tefera-main-design-20260709-051441.md`. Use subagent-driven-development. Start Lane A (engine refactors) on a new branch `feat/video-engine-dashboard`, refactor-first (split `runBatch` → `runHooks`/`runSpecs` keeping all 22 tests green), then layer the hardening + state machine, then Lane B (UI). Honor the 3 mandatory tests (2 regressions + prod-guard security)."

Optional cheaper alternative if priorities shift: ship ONLY the engine wins on the CLI first (G0 as a CLI prompt + retry hardening + per-spec isolation + maxHooks), run it weekly, and build the UI later — the independent reviewer's recommendation. The engine refactors (Lane A) are identical either way, so starting with Lane A loses nothing.
