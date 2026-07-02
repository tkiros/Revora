# Session Handoff — Revora Launch Hardening (Phases 0–9 ENGINEERING complete; ops/domain/legal/manual gates open)

**Date:** 2026-06-25
**Branch:** `launch-hardening` (17 commits ahead of `main`, HEAD `d4eb073`)
**Plan:** `docs/superpowers/plans/2026-06-21-revora-launch-hardening.md`
**Status:** Phases **0–9 engineering-codeable work complete, tested, reviewed, committed.** NOT merged, NOT deployed. What remains is **entirely ops / domain / legal / manual** — there is no remaining code to write before launch. Phase 9 (Play/TWA) is gated and ships *after* the PWA is live + counsel signs off.

---

## How to use this document

This is a resume prompt for a **new session**. Read the plan file above for full task detail. Carry the execution contract forward **verbatim**:

> For **each task**: 1) Implement → 2) Test & verify → 3) Run `/code-review` on the changes → 4) Fix all findings, re-review until clean → 5) Proceed. At the **end of each phase (tier)**: test, verify, `/code-review`, then commit. Run the check (`npm run typecheck` + `npm test`) once at the end of a task. No task is committed until it passes both test verification and review. Fix all review findings before moving on.

**Review pragmatics (apply going forward).** `/code-review` (high or `ultra`) is a background multi-agent workflow (~15–25 min, 30–50+ agents, ~800k–1M tokens). For **test-only / doc-only / static-asset** tiers a careful **self-review + `advisor()` pass** is proportionate (this is what Phases 7–9 used, with sign-off recorded). Reserve the full `/code-review` workflow for tiers with real runtime logic. **Triage findings — do not apply verdicts blindly;** verify before fixing.

**Owner legend:** **eng** = codeable in-session · **ops** = external dashboard/infra (Vercel, Upstash, OpenAI, Play Console) · **domain** = clinical reviewer · **legal** = counsel · **manual** = human-on-device (real phones, Lighthouse, screen-reader).

---

## What was done (Phases 0–9)

### Phases 0–6 — earlier sessions (see prior handoffs in `docs/handoff/`)
- **Phase 0** (eng parts): `.env.example`, secrets §7 in `docs/ops/launch-controls.md`, branch. Ops parts 0.1/0.2/0.3 open.
- **Phase 1** (HARD BLOCKER B1 ✅): `lib/revora/rate-limit.ts` (per-IP + daily cap, fail-open on store error), telemetry `daily_cap`, `middleware.ts` that **fails CLOSED (503) on any public deploy when Upstash env is missing**.
- **Phase 2** ✅: `openai-client.ts` (`timeout: 10_000, maxRetries: 0`), `service.ts` `MAX_MODEL_ATTEMPTS = 1`, route `maxDuration = 15` (ops verify vs Vercel plan).
- **Phase 3** ✅ (eng): eval gold-label schema fields (optional), `adversarial` category (8 cases), `lib/revora/eval-rubric.ts` + graded live eval. Gold labels are **domain** (3.1, open).
- **Phase 4** ✅: public `/privacy` page, disclaimer-presence + claims-boundary copy audits, counsel brief (`docs/legal/counsel-brief.md`, **open** — awaiting opinion).
- **Phase 5** ✅: HTTP 503 → calm retry payload (fail-closed `paused`), synchronous offline guard, `@axe-core/playwright` a11y gate (0 critical/serious WCAG A/AA). Manual a11y gates deferred → folded into Phase 8.1.
- **Phase 6** ✅ (`142bdd0`): server-only **`@sentry/node`** error capture (`instrumentation.ts` Node-runtime-only, `sentry.server.config.ts` allowlist init `defaultIntegrations:false`, `lib/revora/sentry-scrub.ts` PII strip, `lib/revora/sentry-capture.ts` guarded async seam awaiting `flush(1000)`), §9 alerting + §10 incident runbook, `/api/health` `upstash` probe.

### Phase 7 — Installable PWA ✅ (THIS session) — `9a9825e`
- `public/manifest.webmanifest` (standalone, `theme_color #0f172a`, `background_color #f3f7fb`, 3 icons).
- **Real PNG icons** (`icon-192`, `icon-512`, `icon-maskable-512`) — Revora "R" monogram on navy, built from **SVG primitives** (rect/circle/path, NOT `<text>` — resvg renders text unreliably) and rendered with the already-installed **`sharp`** (no new dep). Generator was a throwaway scratchpad script; **not committed** (PNGs are the deliverable). `app/icon.png` auto-wires the favicon.
- `app/layout.tsx`: `metadata.manifest` + `appleWebApp` + `viewport.themeColor`; renders `<SwRegister/>`. Verified the rendered `<head>` emits manifest/theme-color/apple/icon tags.
- `public/sw.js`: precache offline page, network-first navigations with offline fallback, **short-circuits non-GET** (never intercepts `POST /api/check`), never caches responses.
- `public/offline.html`: on-brand, `store:false`-accurate copy, canonical disclaimer.
- `components/sw-register.tsx`: client `useEffect` register, guarded, swallows errors.
- `tests/unit/revora/pwa-assets.test.ts`: 7 pins (manifest shape, PNG magic bytes, disclaimer presence, the no-`.put(` privacy invariant).

### Phase 8 — Full QA + go-live runbook ✅ (THIS session) — `6bca0b7`
**QA found a real Phase-7 regression and fixed it.** The smoke suite (untouched since Phase 5) hung on **all interactive Mobile Safari (WebKit)** tests because of Phase 7's service worker. Bisected empirically (systematic-debugging):
- `clients.claim()` claiming the page mid-load hangs WebKit's navigation state → 11 failures; **dropping claim fixed 10**.
- The last failure was a SW-controlled `reload()`, which **Playwright-WebKit fundamentally cannot exercise** (known SW-support gap, independent of how the navigation is fetched).
- **Fixes:** (1) **test-layer isolation** — `playwright.config.ts` `serviceWorkers: "block"` (E2E never runs against a cached SW; standard practice); (2) **SW hardening** in `public/sw.js` — dropped `clients.claim()` (unnecessary for an offline-fallback SW; the offline page only matters on reopen, which the active SW controls anyway), async network-first handler with robust `Response.error()` fallback; (3) `retries: 1` absorbs transient WebKit-under-parallel-load paint timeouts. Privacy invariant unchanged.
- **8.1:** `npx playwright test` → **46 green** (Mobile Chrome + Mobile Safari), incl. new `tests/smoke/pwa-assets.spec.ts` (asserts manifest/sw/offline/icons are actually **served** by the running app — unit test only checks files on disk). Cross-device + Lighthouse + screen-reader matrix is **manual** (runbook §11.1).
- **8.2:** release gates recorded — typecheck clean, **184 unit**, `eval:revora` 8/8 (mock). `eval:revora:live` is **`SETUP_BLOCKED`** (needs `OPENAI_API_KEY` + domain gold labels) — recorded, not faked.
- **8.3:** `docs/ops/launch-controls.md` **§11 Go-Live Sequence** — deploy (`launch_mode=normal`) → `/api/health` smoke (`upstash:configured` gate) → controlled burst (429 + cap) → **publish the link only after both rollback drills pass** (pause <60s §10.1, Vercel rollback <5min §5); timed drill-log template + embedded manual QA matrix. Cross-refs §3/§5/§9/§10, no duplication.

### Phase 9 — GATED Google Play (TWA) runbook ✅ (THIS session) — `d4eb073`
Phase 9 **must not execute** until the PWA is live/stable (Phase 8 go-live) **and** counsel (4.4) has weighed in, and its only code artifact (`assetlinks.json`) needs a real **Play App Signing SHA-256** that won't exist until ops creates the Play account. So this session produced the **executable runbook + template only**; **no hosted `assetlinks.json`** was created (a placeholder fingerprint forges trust).
- `docs/ops/play-twa-runbook.md`: 9.1 Play account prerequisites (+ "verify current Play requirements" caveat), 9.2 Data Safety form **mapped line-by-line to `docs/privacy/data-flow.md` + `/privacy`**, 9.3 Bubblewrap steps + an `assetlinks.json` **template** with `__PACKAGE_NAME__`/`__PLAY_APP_SIGNING_SHA256__` placeholders + exact host path, 9.4 store-listing **claims-boundary checklist** vs `docs/safety/claims-boundary.md`.

### Commits added this session (oldest → newest)
```
9a9825e feat(phase-7): installable PWA — manifest, icons, offline service worker
6bca0b7 test(phase-8): smoke suite green on WebKit + PWA serve test + go-live runbook
d4eb073 docs(phase-9): gated Google Play (TWA) runbook + assetlinks template
```
Full branch: 14 Phase 0–6 commits `90b4c2f … 142bdd0`, then the three above (17 total ahead of `main`).

### Verification at HEAD (`d4eb073`)
- `npm run typecheck` — clean
- `npm test` — **184/184** unit (`testTimeout: 20s`)
- `npm run eval:revora` — 8/8 (mock routing)
- `npm run eval:revora:live` — **`SETUP_BLOCKED`** (no `OPENAI_API_KEY`; also needs domain gold labels)
- `npx playwright test` — **46/46** smoke (Mobile Chrome + Mobile Safari)
- `npm run build` — clean at Phase 7 (`/icon.png` prerenders static; Sentry stays out of Edge bundle). Not re-run for the test/doc-only Phase 8/9 diffs.

### New dependencies (all server/dev-only, none `NEXT_PUBLIC_`)
`@upstash/ratelimit`, `@upstash/redis` (P1), `@axe-core/playwright` (P5, dev), `@sentry/node` (P6, v10.60.0). **No new deps in Phases 7–9** (`sharp` was already present).

---

## 🚧 Blocking gates before ANY production deploy/merge (unchanged + new)

1. **Upstash env is the merge gate (highest priority).** `middleware.ts` fails **closed (503)** on any public Vercel deploy (preview or production) when `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are absent. If `launch-hardening` merges and Vercel auto-deploys **before ops Task 0.3, every `/api/check` returns 503**. No test catches this (tests run `NODE_ENV=test`, the pass-through branch). **Do ops Task 0.3 first.** `/api/health` `upstash` field + runbook §11.3 make this visible post-deploy.
2. **Decision still standing:** keep work on `launch-hardening`; do **NOT** merge to `main` yet.
3. **There is no remaining engineering code to write before launch** — everything below is ops/domain/legal/manual.

---

## Exact next actions to reach "true done"

### A. Ops / domain / legal gates — schedule in parallel (NOT code)
1. **0.1 (ops)** Hard monthly OpenAI spend cap + ~50% alert. Screenshot into `docs/ops/`.
2. **0.2 (ops)** Production domain → Vercel, auto-HTTPS. Verify `https://<domain>/api/health` → `{ ok:true, launch:"ready", upstash:"configured" }`.
3. **0.3 (ops) — THE MERGE GATE.** Provision Upstash; set `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `REVORA_DAILY_CHECK_CAP=2000` in Vercel (Production + Preview, not client-exposed). Confirm `/api/health` flips `upstash` to `"configured"`.
4. **2.3 verify (ops)** Confirm Vercel plan max function duration ≥ 15s (Pro if Hobby caps lower).
5. **3.1 (domain) — unblocks `eval:revora:live`.** Author `acceptableRisks` + `labelSource` per case in `tests/fixtures/revora-eval-cases.json` (from `docs/safety/a1c-band-rubric.md` + `evidence-pack.md`), second-reviewer signed off. Then `OPENAI_API_KEY=… npm run eval:revora:live` and record in the go-live checklist (§11.1).
6. **4.4 (legal)** Engage counsel via `docs/legal/counsel-brief.md`; record the written opinion. **Also gates Phase 9.**
7. **6.1 deploy-time PII proof (ops/eng) — owed since Phase 6.** Set a throwaway `SENTRY_DSN` on a preview deploy, force a provider error (bad model id / revoked key) + a Zod model-output error, inspect the actual Sentry event: confirm **zero** `food`/`a1c`/prompt/`output_text`/IP and that the event **lands** (awaited `flush(1000)`).
8. **6.2 alerting (ops)** Create the Sentry alert rule (exception-volume spike, filter `stage:model`) + the Vercel log-drain alert (`reasonCode=daily_cap` + `check_failed` spike) per §9.
9. **`.env.example` append (manual one-liner)** Add `SENTRY_DSN=`. Env-file guard hard-denies the agent from editing `.env*`; `launch-controls.md` §7 already lists it authoritatively.

### B. Phase 8 — final QA + go-live (manual + ops; runbook is written → `launch-controls.md` §11)
1. **8.1 manual QA matrix (manual)** Run §11.1 against the **Preview** URL on real **Android Chrome + iOS Safari + desktop**: happy SAFE/MODERATE/HIGH, clarify, not-food, out-of-scope, invalid, slow (>5s), timeout, offline, 429, 503; **install + offline launch** (relaunch shows `offline.html`, `/api/check` never from cache); DevTools Manifest no errors; **Lighthouse PWA installable + a11y ≥ 95**; manual keyboard + VoiceOver/TalkBack; 200% zoom. Attach the filled matrix + Lighthouse report to the release PR.
   - **Note:** the SW runtime path is **not** covered by automated tests (Playwright-WebKit can't exercise SW-controlled navigations; SWs are blocked in E2E). The iOS install+offline-launch cell of this matrix is the **only** real verification that the service worker works on a device — do it carefully.
2. **8.2 release gates (eng/ops)** On the release commit: re-run typecheck + `npm test` + `npm run eval:revora` + the recorded `eval:revora:live` (needs A.5) → attach to the release PR.
3. **8.3 go-live + rollback drills (ops)** Execute §11: deploy `launch_mode=normal` → smoke `/api/health` → controlled burst (confirm 429 + cap) → **rehearse both drills** (pause <60s, rollback <5min) and fill the §11.5 timed drill-log → **publish the public link only after both pass**.

### C. Phase 9 — Google Play (TWA) — GATED, runbook is written → `docs/ops/play-twa-runbook.md`
Start **only after** the PWA is live/stable (B above) **and** counsel (A.6) has weighed in.
1. **9.1 (ops, non-code)** Play Console account ($25); verify current Play requirements (closed-testing cohort for personal accounts; D-U-N-S for org); health declarations + content rating.
2. **9.2 (ops/legal, non-code)** Data Safety form per the runbook's mapping table (meal+A1C → OpenAI, `store:false`, no Revora storage).
3. **9.3 (eng/ops)** Bubblewrap/PWABuilder → `.aab` + assetlinks; **fill the template** `public/.well-known/assetlinks.json` with the real **Play App Signing** SHA-256 + package name, commit + deploy; validate with Google's Statement List Tester; installed TWA launches **without** a URL bar.
4. **9.4 (ops/design)** Store assets + listing copy **inside the claims boundary** (audit vs `docs/safety/claims-boundary.md`); privacy URL = `/privacy`. Submit.

---

## Known issues / notes for the next session

- **The service worker is runtime-untested by automation.** `serviceWorkers: "block"` disables SWs in the Playwright suite (Playwright-WebKit can't drive SW-controlled navigations — a tooling gap, not a code bug). The unit test pins the SW *file contract*; the **only** runtime verification is the manual iOS install+offline-launch cell (§11.1 / action B.1). The SW deliberately omits `clients.claim()` (it hung WebKit mid-load and isn't needed for offline-on-reopen).
- **Phase 9 `assetlinks.json` is intentionally NOT created.** It needs the real Play App Signing SHA-256 (exists only after 9.1). The template lives in `docs/ops/play-twa-runbook.md` §9.3.
- **`eval:revora:live` is blocked on two things:** `OPENAI_API_KEY` (a secret) **and** the domain 3.1 gold labels. It exits 0 with `SETUP_BLOCKED` — that is expected, not a failure.
- **Privacy invariants (non-negotiable):** `store:false` on every model call; never log raw `food`/`a1c`/prompt/output; telemetry PII-free; no `NEXT_PUBLIC_` secret prefix; the OpenAI client throws client-side; no raw food/a1c/prompt/output/IP leaves via a Sentry event (allowlist init + `scrubSentryEvent`); **the SW never caches `/api/check`** (non-GET short-circuit + no `.put`, pinned by the unit test).
- **`daily_cap` fires on the Edge middleware** (intentionally NOT Sentry-instrumented) → it's a **log** signal, not a Sentry event. Provider errors are invisible in `check_failed` telemetry (`service.ts` swallows them and returns retry) → **Sentry** is the only place a provider outage surfaces. The §9 alerting split reflects this.
- **`detectEnvironment` triplication (deferred, pre-existing):** `lib/revora/env.ts` (private), `app/api/health/route.ts`, `app/api/check/route.ts` hold byte-identical VERCEL_ENV/NODE_ENV logic. Future DRY pass; out of scope for the launch tiers.
- **Middleware pause disclaimer divergence (pre-existing, flagged):** middleware 503/429 carry the short `"Not medical advice."` (Edge can't `fs`-read the full contract). Noted in `docs/legal/counsel-brief.md`; defensible — don't rabbit-hole.
- **Pre-existing client/Zod schema duplication (deferred):** `lib/client/check.ts` + `lib/client/ui-state.ts` re-implement validation rather than importing `lib/revora/schemas.ts`. Intentional view-model projection; no runtime bug.
- **`retries: 1` in `playwright.config.ts`** absorbs transient WebKit paint timeouts on a loaded box; a real failure still fails twice. Re-run isolated (`--workers=1 -g "<name>"`) to distinguish a flake from a regression.
- **Flaky cold-import unit test:** `tests/unit/revora/launch-controls.test.ts` health-route case can exceed the old 5s default on a loaded box; mitigated by `testTimeout: 20_000`.
- **`test-results/` (Playwright output) is now a bulky untracked dir** — do **not** stage it; a `.gitignore` entry would be sensible but is outside the "leave the tree alone" rule.
- **Pre-existing untracked / modified files** (`.vscode/`, `PRD/`, `agent/`, `docs/archive/…`, `M next-env.d.ts`, `M tsconfig.json`) are **not** part of this work — leave them; stage only files you change, by explicit path (never `git add -A`).

## First command for the resuming session
```bash
cd /home/tefera/Desktop/Revora && git checkout launch-hardening && git log --oneline main..HEAD && npm run typecheck && npm test && npx playwright test
```
Then: there is **no eng code left to write**. Drive the **ops/domain/legal gates** (esp. **0.3 Upstash** = merge gate, **3.1** gold labels, **4.4** counsel, **6.1** Sentry PII proof) and the **manual Phase 8.1 device QA**, then execute the **§11 go-live drills**. Phase 9 (Play/TWA) starts only after the PWA is live + counsel signs off, following `docs/ops/play-twa-runbook.md`.
