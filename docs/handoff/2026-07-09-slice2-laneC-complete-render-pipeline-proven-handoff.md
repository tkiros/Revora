# Session Handoff — Slice 2: Lane C COMPLETE (render pipeline + G2 + routes) · render proven E2E

**Date:** 2026-07-09
**Branch:** `feat/video-engine-renderer` (HEAD `bb3e2f2`, **7 commits ahead of `main`**, unpushed, unmerged)
**`main` tip (origin):** `5a96fc2`
**Tests:** **130 unit tests green** (was 99 at Lane A/B → +31), typecheck clean.

**This session built all of Lane C** — the integration layer that turns an approved `VideoSpec` into a rendered, downloadable, G2-reviewable video. Lane A (renderer) and Lane B (gate discriminator) were already done/committed at session start. **Slice 2 is now functionally complete end-to-end** and the render pipeline was **proven with a real `.mp4`** — modulo one environmental blocker (§4, the brand font hangs in this sandbox).

**➡️ NEXT SESSION: (1) fix the font-load hang so real branded renders succeed (§4 — the one thing blocking real posting), (2) ship the branch (PR → merge), (3) remind founder to rotate the 5 leaked keys (§5). Optionally: music tracks + `<Audio>` wiring, founder motion gut-check.**

---

## 1. What was accomplished this session (Lane C, TDD, 3 commits)

### `bee6f84` — Lane C·1: `runRender` phase + orphaned-Chromium teardown
- **`runRender(date, selectedSpecIds, opts)`** (`video-engine/run.ts`) — the G2-producing phase. Mirrors `runSpecs` carry/recover **but the payload is on-disk asset directories** indexed by `run.json.render`, so **wave 2 MERGES the prior render map** (starts from `readRun`'s state, never rebuilds) or wave-1's assets orphan. Per-spec ERROR isolation; gate discriminator (only G1-approved specs render); atomic temp-dir + `rename` per spec (rm+rename under the single-run lock; partial temp discarded on failure → no half-written asset dir); writes `caption.txt` via `buildPostingPackage` (dual-mode compliance, caption half). Rests at `AWAITING_G1` (no terminal wall). **Render fn is injected** (`RenderFn`, default lazily `import("./render")`) so the phase is unit-testable without launching Remotion.
- **State** (`video-engine/state.ts`): `RunStatus += "PRODUCING"` (coarse/transient — only while a render child is live); `render?: Record<specId, {status: PENDING|RENDERING|READY|ERROR, assetDir?, error?}>`. Keyed by **specId** (unique in specs.json — dup-spec-id hooks ERROR before they reach it), deliberately divergent from the hook-keyed `specs` map.
- **`parseArgs`**: accepts `--phase render`; **an unknown `--phase` now THROWS** (never falls through to a full `runBatch` LLM re-run — the "fails open into an expensive re-run" bug the design flagged). Entry dispatch adds the render branch and **skips the `claude` preflight for render** (no LLM in that path).
- **Decision log extracted** to **`video-engine/decisions.ts`** (`Decision`, `readDecisions` with the g1-backfill, `appendDecision`, new `approvedSpecIds` = last-g1-verdict-per-spec wins). `lib/video-engine/dashboard.ts` now **re-exports** these — ONE source of truth for the gate discriminator, shared by the engine (render phase) and the route lib.
- **Dashboard lock/preflight** (`lib/video-engine/dashboard.ts`): `ACTIVE += "PRODUCING"` (a render and a hooks/specs run for a date are mutually exclusive — one lock per date); **`renderRuntimeReady()`** preflight (checks a Chrome executable exists — **distinct from `claudeReady`**, the render path has no LLM); `seedRun`/`spawnJob` unions accept `"render"` (`seedRun` carries the prior render map so the G2 view keeps prior READY specs during a new wave).
- **Orphaned-Chromium cleanup — THE named critical gap, now closed.** `video-engine/browser-teardown.ts` (pure, no Remotion import → unit-testable) tracks live browser handles and closes them on SIGTERM/SIGINT/uncaughtException/exit. `render.ts` was switched from the high-level managed-browser API to **`openBrowser(...)` + `puppeteerInstance`** so it OWNS the Chromium instance and teardown can reap it — a killed/crashed detached render (the `unref`'d parent won't reap it) no longer orphans Chrome.

### `3b7053f` — Lane C·2: `/render` + `/asset` routes + bundle isolation
- **`POST /api/video-engine/render`** (`app/api/video-engine/render/route.ts`) — guard + `PRODUCING` single-run lock + **`renderRuntimeReady()` preflight (NOT `claudeReady`)** + seed-then-spawn (the same race-closing pattern). Body `{date, specIds}`.
- **`GET /api/video-engine/asset?date&specId`** (`app/api/video-engine/asset/route.ts`) — guard, then **validate every input**: `date` matches `\d{4}-\d{2}-\d{2}`; **`specId` must be an id from `specs.json`** (via `readSpecIds`, never a raw path segment); resolved path asserted under `output/<date>/assets/` (path-traversal defense). Range-aware `video/mp4` stream. **No `platform` enum** (v1 = `master.mp4` only, per eng review). Dev-only.
- **Bundle isolation** (`tests/unit/video-engine/routes-guard.test.ts`): render/asset 404 under prod envs added to the loop; the source-import regex **extended to forbid `render`/`template`** (they pull the Remotion bundler + Chromium — catastrophic in the serverless build) alongside the existing `run|agents|llm|state|linter|store`.

### `bb3e2f2` — Lane C·3: G2 dashboard section + G2 approve gate
- **`approve` route** now accepts `gate: "g1"|"g2"` (default `g1`); the G2 player posts `gate:"g2"` → the discriminator keeps it off the G1 render-eligible count.
- **`app/video-engine/dashboard-client.tsx`**: `"PRODUCING"` added to the client `ACTIVE` poll set; render-map view type + `g2By` split. **"Render approved (N)"** button (renders G1-approved specs not already READY/RENDERING). **G2 section**: each render entry → READY shows inline `<video>` (via `/asset`) + caption block + **Approve (G2)** / **Reject** / **Download .mp4** / **Re-render**; ERROR shows the error + **Retry render**; in-progress shows "rendering…". Warm empty state.

---

## 2. VERIFIED end-to-end (the "prove it with a real run" bar)

Rendered the approved, `claims_used ≠ ∅` spec **`vs-002`** through `runRender` (real Remotion, system Chrome):
- `run.json.render["vs-002"] = { status: "READY", assetDir }`; `run.status` → `AWAITING_G1`. ✅
- Valid **9:16 `master.mp4`, 2.77 MB**. ✅
- `caption.txt` **carries the disclosure** ("…not medical advice…"). ✅
- `templateFor(vs-002).disclosureHoldS === 4` (≥ MIN_HOLD_S=2). ✅
- **Disclosure frame renders on-screen** — extracted a still at frame 525/600: light band, **"A QUICK NOTE"** eyebrow in `--text-strong`, body in `--text-body` (NOT `--text-soft`), left-aligned document style, in the safe band. ✅ (Compliance dual-mode holds: on-screen + caption.)

**Caveat on HOW it was proven:** the real render only completed after I **temporarily** neutralized the font `delayRender` wait (see §4). That patch was **reverted, not committed** — `TextOnScreen.tsx` is back to its committed state. So the *pipeline* is proven; the *branded font* is not currently rendering in this environment.

---

## 3. Current repo state
- **Branch:** `feat/video-engine-renderer` @ `bb3e2f2`, **7 commits ahead of `main`**, not pushed, not merged.
  - Lane A: `412db2b` `5a2e84e` `8d0159a` · Lane B: `be9e25c` · **Lane C: `bee6f84` `3b7053f` `bb3e2f2`**
- **`origin/main`:** `5a96fc2`.
- **Tests:** **130 green** (16 files). Typecheck clean. New tests this session: `render-phase.test.ts` (6 — ERROR isolation, carry/recover merge + force, gate discriminator, disclosure caption, gate rest), `browser-teardown.test.ts` (2), plus additions to `cli.test.ts` (render phase + unknown-phase throw), `dashboard.test.ts` (PRODUCING lock, renderRuntimeReady), `routes.test.ts` (render 400/503/202/409, asset 400/404/traversal/200/206, approve g2), `routes-guard.test.ts` (render/asset 404 + render|template import ban).
- **No new deps** (Remotion `openBrowser` was already in `@remotion/renderer`).
- **New files:** `video-engine/decisions.ts`, `video-engine/browser-teardown.ts`, `app/api/video-engine/render/route.ts`, `app/api/video-engine/asset/route.ts`, `tests/unit/video-engine/render-phase.test.ts`, `tests/unit/video-engine/browser-teardown.test.ts`.
- **Dirty working tree (all pre-existing/untracked):** 4 handoff docs (incl. this one), `video-engine/input/2026-07-09-voc-dump.md`, `next-env.d.ts` (auto-regen). Founder's call whether to gitignore `video-engine/input/` vs commit.
- **Env facts:** Node 24, React 19.2, Next 16. System `/usr/bin/google-chrome` present. No network for Remotion's Chromium CDN — the `findChrome` preflight handles it. `.gitignore` already excludes `video-engine/output/**/assets/` (rendered mp4s are large binaries; regenerate from specs).

---

## 4. 🔴 THE ONE REAL BLOCKER — brand font hangs in this environment (NEXT SESSION #1)

Discovered during verification. **In this sandbox, `document.fonts.load("… 'Plus Jakarta Sans'")` never settles** — it neither resolves nor rejects — so the module-level `delayRender("plus-jakarta-sans")` in `video-engine/remotion/TextOnScreen.tsx` (L10-17) hits its **28s timeout and hard-fails every real render**.

- **This is PRE-EXISTING Lane A / environment drift, NOT Lane C.** Proven: the *original committed* renderer (`browserExecutable` direct, no teardown changes) fails **identically** — I tested it standalone; raising the timeout to 118s did not help (the font still never loads). The prior handoff's "renders in ~73s" was a prior session; something in the current env changed (most likely the woff2 asset fetch from the webpack serve now hangs).
- **Lane C handled it CORRECTLY** — this is the resilience the design demanded working in the wild: the render phase marked `vs-002` as a per-spec `ERROR`, returned `run.status` to `AWAITING_G1`, did not crash the batch, and (via `openBrowser`/teardown) left no orphan. The failure was contained, surfaced in `run.json.render[specId].error`, and Retry-able.
- **A dead-end I ruled out:** a wall-clock `setTimeout` cap inside the composition to force `continueRender` **does not work** — Remotion **fakes `setTimeout`** during render (deterministic clock), so the cap never fires. Don't re-attempt that; I already did and reverted it.

**Fix direction for next session (Lane A / render-robustness):**
1. **Diagnose why the woff2 hangs** — is the `@fontsource` asset being served by the Remotion webpack bundle in this env? Check the network tab equivalent (`onBrowserLog` / `dumpBrowserLogs: true` on `renderMedia`), or whether the font files exist under the bundle. A hanging *fetch* (not a 404) is the symptom.
2. **Make the font wait fail-SAFE the Remotion-correct way** — a slow/unreachable font must degrade to fallback, never hard-fail a render. Options: use `@remotion/fonts` `loadFont`/`waitForFonts` (render-clock-aware), or Remotion's `delayRender(label, { timeoutInMilliseconds })` combined with a proper resolve path, or preload the font via `staticFile`. The principle: **continueRender always fires within a bounded number of frames**, using Remotion's clock, not `Date.now`/`setTimeout`.
3. **Then re-verify a branded render** (font actually Plus Jakarta Sans, not Arial) and do the founder motion gut-check (still owed from Lane A — is the hook card confident vs frantic?).

Until this is fixed, **real renders fail in this environment** — the dashboard will show specs going `RENDERING → ERROR`. The code is right; the font asset is the problem.

---

## 5. Deferred / owed (don't lose these)
- **🔴 Rotate the 5 leaked API keys** — `OPENAI_API_KEY` (`sk-proj-9K8…`), `RESEND_API_KEY` (`re_AP9V…`), `UPSTASH_REDIS_REST_URL`+`UPSTASH_REDIS_REST_TOKEN`, `UPSTASH_API_KEY`, `BLOB_READ_WRITE_TOKEN`. Blanked at HEAD (`5a96fc2`) but **live in history commit `213ab8a`**. Repo is PRIVATE (blast radius = collaborators); founder chose "blank now, rotate later." Do it in each provider's dashboard. Still owed.
- **Font hang (§4)** — the real unblock for posting.
- **Music:** no royalty-free tracks in-repo; `musicFor` returns null (silent). `<Audio>` wiring into the composition deferred until real, clear-license tracks exist (Open Q3 — a content task).
- **Founder motion gut-check** on the hook card (Lane A, still owed) — do it once the font renders.
- **Distribution track (the honest unlock):** founder is not posting yet. The whole renderer is built ahead of a format-tournament winner (mitigated by the swappable `template(format)` design). Posting 3-5 Slice-1 scripts remains the real validation of the text-on-screen bet.
- **`next-env.d.ts` + `video-engine/input/`** working-tree noise — decide gitignore vs commit.

---

## 6. WHAT'S NEXT — in order
1. **Fix the font hang (§4)** — the one thing between "pipeline proven" and "real branded video renders." Lane A / render-robustness, ~a focused debug session.
2. **Ship the branch** — `feat/video-engine-renderer` (7 commits) → PR → CI green → merge to `main`. Watch the same Vercel GitHub-account authorship check that bit PR #3 (commits are authored `tkiros <terrykiros@gmail.com>` now — should be fine). The route bundle-isolation tests guarantee the render/Chromium code never enters the serverless build; the prod guard 404s every video-engine route on Vercel.
3. **Remind founder to rotate the 5 keys (§5).**
4. **Then:** music tracks + `<Audio>` wiring; founder motion gut-check; and eventually the real distribution validation (post Slice-1 scripts).

---

## 7. Artifacts to read next session
- **This handoff** (source of truth for Lane C state).
- **Prior handoff (Lane A+B):** `docs/handoff/2026-07-09-slice2-laneB-and-laneA-renderer-proven-handoff.md`
- **Slice 2 design doc (APPROVED + reviews + visual spec):** `~/.gstack/projects/Revora/tefera-feat-video-engine-dashboard-design-20260709-093345.md`
- **Slice 2 eng-review test plan:** `~/.gstack/projects/Revora/tefera-feat-video-engine-dashboard-eng-review-test-plan-20260709.md`
- **Lane C code:** `video-engine/run.ts` (`runRender`, `parseArgs`, `RenderFn`), `video-engine/decisions.ts`, `video-engine/browser-teardown.ts`, `video-engine/render.ts` (`openBrowser`), `video-engine/state.ts` (render map), `lib/video-engine/dashboard.ts` (`renderRuntimeReady`, `readSpecIds`, ACTIVE, seedRun/spawnJob), `app/api/video-engine/{render,asset}/route.ts`, `app/video-engine/dashboard-client.tsx` (G2).
- **The font issue lives here:** `video-engine/remotion/TextOnScreen.tsx` L10-17 (`delayRender`/`continueRender` font wait) + `video-engine/remotion/config.ts`, `Root.tsx`.
- **Tests to mirror:** `tests/unit/video-engine/render-phase.test.ts`, `routes.test.ts`, `routes-guard.test.ts`, `browser-teardown.test.ts`.
- **Compliance sources of truth:** `docs/safety/claims-boundary.md`, `lib/revora/safety-contract.ts`. **Brand:** `DESIGN.md`.

---

## 8. Suggested first move next session
> "Slice 2 Lane C is complete and committed on `feat/video-engine-renderer` (`bb3e2f2`, 7 ahead of main, 130 tests green): `runRender` phase (carry/recover merge, per-spec ERROR isolation, gate discriminator), `/render` + `/asset` routes (PRODUCING lock, `renderRuntimeReady` preflight, path-traversal defense, bundle isolation), G2 dashboard section, and orphaned-Chromium teardown via `openBrowser`. The pipeline was PROVEN end-to-end — a real approved claims spec (`vs-002`) rendered to a valid 9:16 master.mp4 with the ≥2s disclosure frame on-screen + in the caption. **But `video-engine/remotion/TextOnScreen.tsx`'s `document.fonts.load` for Plus Jakarta Sans hangs in this environment, hard-failing every real render at the 28s `delayRender` timeout** (pre-existing Lane A/env issue — the render phase correctly isolates it as a per-spec ERROR; a wall-clock `setTimeout` cap does NOT work because Remotion fakes timers). **First: diagnose the woff2 hang and make the font wait fail-safe the Remotion-correct way (`@remotion/fonts`/`waitForFonts` or bounded frames), then re-verify a truly branded render.** Then ship the branch to main. Separately: the 5 leaked API keys still need rotating in provider dashboards."
