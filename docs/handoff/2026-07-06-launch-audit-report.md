# Revora — Launch Audit Report (2026-07-06)

Full plan-execution audit, end-to-end QA, and pain-point validation, per
`docs/handoff/2026-07-06-full-audit-e2e-qa-pain-point-master-prompt.v2.md`.

- **Repo:** `/home/tefera/Desktop/Revora`, branch `main` @ `7727a31` (merge: "D5 photo-assist check input + disclaimer coverage"). `origin/main` is identical (0 ahead / 0 behind).
- **Auditor:** Claude Code session, 2026-07-06 (afternoon ET). Static verification by four per-plan agents + two sweep agents, all evidence-cited; test suites, runtime QA, and Stripe inspection run by the orchestrator.
- **Constraint compliance:** safety-frozen files (`lib/revora/postprocess.ts`, `service.ts`, `prompt.ts`, `schemas.ts`, `a1c.ts`) were read, never modified. **No Stripe writes, no deploys, no pushes, no Play submission, no real emails.** Live-spend evals (`eval:revora:live`, `eval:pantry-extract`, `eval:meal-photo`) were not run. Local `.env*` files are permission-blocked in this session; flag values below come from code defaults, runbooks, and observed runtime behavior, with dashboard values flagged for human confirmation. Nothing was "fixed inline" — zero source changes were made; this file is the only file written.

---

## 1. Executive verdict

**No — not ready for a real paying client today.** The code on `main` is in materially good shape (typecheck clean, production build clean, offline safety evals 8/8, all four plans substantially executed with evidence, Stripe live products/prices provisioned, privacy copy accurate, disclaimer coverage complete), but **production is not running that code, and what production is running is broken at its core.** Top 3 blockers, each traced to Part 2 rows:

1. **The core check API is 100% down in production** (BUG-01). Every request to `/api/check` returns HTTP 500 `MIDDLEWARE_INVOCATION_FAILED`; runtime logs show `UrlError: Upstash Redis client…`. The `UPSTASH_REDIS_REST_URL` value in the Vercel production env is present but invalid, and the client is constructed at middleware module scope, so every matched request dies before app code runs. `/api/health` meanwhile reports green (`upstash:"configured"` is presence-only) — so monitoring would never have caught it.
2. **Production serves a stale build** (BUG-02). The current deployment (created 2026-07-06 ~13:26 ET, *after* the 10:59 ET photo-assist merge was pushed) lacks the merged work: `/api/check/photo-draft` 404s and the shared disclaimer footer is absent from `/history` and `/progress` (both present locally at `7727a31`). The deploy pipeline is not shipping `origin/main`.
3. **No scheduled jobs run in production** (BUG-03). `/api/health` (prod) reports `nudge: never, baiWeekly: never, pantrySweep: never, trialPrecharge: stale`. The Railway scheduler the hourly crons were moved to was never provisioned (the pulled Railway config is an import placeholder), and even the one remaining Vercel cron (`bai-weekly`, due this morning — it's Monday) has never fired. Without `trial-precharge` the promised 2-day pre-charge email cannot happen; without `pantry-sweep`, paid Pantry Review orders would sit unprocessed.

Two further launch-blocking facts sit just behind those: **the locked business model is dormant** — production runs `PAYWALL_MODE=legacy` (live `/subscribe` shows "Free keeps working: five checks a day… Monthly — $12.99/mo"), i.e. the standing free tier the 2026-07-05 locked decisions removed is what real users get, and the flag isn't even documented in `docs/ops/env-reference.md` (BUG-04) — and **a banned-family claims line ships on the first onboarding screen** ("Reversal is achieved through your dietary choices…"), unledgered and hand-carved out of the claims CI test, with counsel Q8 sign-off still pending (BUG-05).

The encouraging side: Plan #1 is verified **fully executed through Phase 8 and merged** (the SDD handoff understates reality), Plan #2's engineering layers are done and tested, Plan #3's buildable scope is done with everything else correctly human-gated, and the D5 photo-assist feature is well-gated in code (rate-limited, trial-walled, provably no photo persistence). Fix the three ops blockers, resolve the claims line, flip the flag deliberately, and this is a launchable product.

---

## 2. Environments tested

| Env | URL / port | Commit | How reached | Notes |
|---|---|---|---|---|
| local dev | `http://127.0.0.1:3100` | `7727a31` + working tree | `npx next dev` (no `dev` script exists in package.json) | Degraded env: `/api/health` → `db:"unconfigured"` (no `DATABASE_URL`), Auth.js `MissingSecret`, OpenAI calls fail → checks return the calm `retry` fallback. Used for route sweeps, API edge cases, cache warming. |
| local E2E (legacy mode) | `http://127.0.0.1:3100` (Playwright-managed) | `7727a31` | `npx playwright test` webServer #1 | Default `PAYWALL_MODE` → `legacy`. |
| local E2E (trial mode) | `http://127.0.0.1:3101` (Playwright-managed) | `7727a31` | webServer #2 (`PAYWALL_MODE=trial`, `AUTH_EMAIL_STUB_DIR`, isolated distDir) | Exercises the Day-2 hard wall (`trial-wall.spec.ts` — passed, both browsers). |
| production | `https://revora-lovat.vercel.app` (aliases: `revora-tkiros-projects.vercel.app`, `revora-tkiros-tkiros-projects.vercel.app`) | **Stale: post-Plan-#1 merge, pre-`7727a31`** (evidence: `/subscribe` renders the new `paywall-card`; `photo-draft` 404s; disclaimer footer missing on `/history`/`/progress`). Exact source commit needs the Vercel dashboard. | `vercel ls`/`vercel inspect` on linked project `tkiros-projects/revora`; deployment `dpl_J3bJUvffzyUVC5YBUbWQvrd53huU`, created 2026-07-06 13:26 ET, status Ready | `/api/health`: `ok:true, environment:"production", launch:"ready", upstash:"configured", db:"ok"`, crons `never`/`stale`. **No custom domain** — `revora.app` is not this app; bare deployment URLs sit behind Vercel SSO; the `revora-lovat` alias is public. |

Test-suite runs (all local, `7727a31`):

| Suite | Result | Notes |
|---|---|---|
| `npm run typecheck` | **PASS** (exit 0, 0 errors) | An initial run failed with 20 syntax errors — all inside the *generated* `.next/dev/types/routes.d.ts` (included by `tsconfig.json:35`), stale/mid-rewrite at the time. Clean tree passes (BUG-14). |
| `npx vitest run` (full, offline) | **6 failed / 591 passed / 53 skipped (650 tests; 12 of 90 files)** | Every failure is `createTestDb()` PGlite boot exceeding the 45 s hook timeout on this I/O-bound machine. The failing files pass standalone: `trial-start.test.ts` + `pantry-schema.test.ts` → **11/11 PASS** in isolation. Environmental — but the `npm test` release gate is not reliably green on this hardware (BUG-11). Skips = env-gated live evals + DB-gated suites. |
| `npm run eval:revora` (offline, `REVORA_LIVE_EVAL=0`) | **PASS 8/8** | Fixture-driven; verified offline before running. |
| `npx playwright test` (full, 2 mobile projects) | **39 failed / 4 flaky / 12 skipped / 77 passed (132)** in 15.8 m | 148 × "Test timeout of 30000ms exceeded", dominated by Mobile Safari/WebKit under load. Isolation re-run of the two worst files (`mobile-check` + `billing-pages`, Mobile Chrome): **0 failed / 1 flaky / 7 passed**. Notably `trial-wall`, `photo-check`, `onboarding`, `pwa-assets` passed on *both* projects even under load. `auth.spec`/`pantry.spec` self-skip without `DATABASE_URL` → magic-link and pantry E2E unverifiable on this machine. A first full-suite attempt died at the 120 s webServer boot timeout on cold caches (BUG-15). |
| `npm run build` | **PASS** (exit 0) | Production build of `main` succeeds — the stale prod deployment is a pipeline problem, not a build problem. |

---

## 3. Part 1 — Plan-execution audit

> Verdict legend (master prompt): `DONE` · `PARTIAL` · `NOT DONE` · `DONE-BUT-BROKEN` · `SCOPE-DRIFT` · `BLOCKED-HUMAN` · `UNVERIFIABLE`.
> Tie-break: code wins for "what shipped"; the plan wins for "what was supposed to ship"; the gap is a finding.
> **Deployed? column:** "merged ✓" = on `origin/main`. Production runs a **stale build** (§2), so *nothing from the 2026-07-06 merge is deployed*, and even pre-merge work's prod behavior is subject to BUG-01/03/04. Prod-side confirmation cells name the dashboard a human must check.

### 3.0 Cross-plan runtime facts (established by this audit's own runs)

- `paywallMode()` defaults to `legacy` unless `PAYWALL_MODE === "trial"` (`lib/server/pricing.ts:24-25`). Production serves legacy copy (live `/subscribe`) → **prod runs legacy; Plan #1's paywall is built but dormant.** `docs/ops/env-reference.md` has no `PAYWALL_MODE` row.
- **Stripe (read-only MCP; account `acct_14W8GFKweWSWjefk`):** live-mode `Revora Premium` (`prod_UpYMfliiN8R9DW`) with monthly prices **$9.99 / $12.99 (default) / $19.99** (`revora_monthly_999/1299/1999`) and `Revora Pantry Review` (`prod_UpYOONypmsbqiZ`) **one-time $49** (`revora_pantry_49`, statement descriptor `REVORA PANTRY`), all created 2026-07-05 — **supersedes the SDD handoff's "zero Revora products" finding.** `trial_period_days` is null on the prices; the 7-day trial is correctly applied at Checkout-session level (`app/api/billing/handlers.ts:872`, `trial_period_days: 7`). Webhook endpoints are not readable via this MCP → confirm in Stripe dashboard (H21/H24). No writes made.
- Production `/api/health`: `db:"ok"` (Railway Postgres reachable; `cron_heartbeat` exists → migrations at least partially applied on prod), crons `never/stale` (BUG-03).

### 3.1 Plan #1 — `docs/superpowers/plans/2026-07-05-launch-readiness-paywall-pantry.md` (Phases 0–8)

**Headline: every phase 0–8, including the final merge, is DONE in code — the SDD handoff (claiming 0–7 done, Phase 8 outstanding) is a stale mid-execution snapshot; execution outran it.** No under-delivery, no DONE-BUT-BROKEN, no scope-drift found. The plan's runtime effect in production is dormant behind `PAYWALL_MODE=legacy` (BUG-04).

| Phase/Task | Claimed | Verified (evidence) | Deployed? | Verdict |
|---|---|---|---|---|
| 0.1 DESIGN.md chips + first-win + CSS | Done | `DESIGN.md:62-79`; classes used `app/onboarding/page.tsx:140,264`, `components/daily-loop.tsx:93` | merged ✓ | DONE |
| 1.1 Client analytics union | Done | `lib/client/analytics.ts:22,40-48` (6 events) + allowlist `:58-62` | merged ✓ | DONE |
| 1.2 Server billing telemetry | Done | `lib/server/billing/telemetry.ts:10-14` — 5 names, strict zod, console-JSON | merged ✓ | DONE |
| 1.3 Claims scan → pantry emails | Done | `tests/unit/revora/claims-boundary-copy.test.ts:78-79` | merged ✓ | DONE |
| 2.1 Stripe provisioning + env | Done | Code reads env price IDs (`lib/server/pricing.ts:2-4`, `app/api/billing/handlers.ts:297` — bare `handlers.ts` refs in this and the Plan #3 table are this file); **live products/prices confirmed via Stripe MCP (§3.0)**; env-var mapping in Vercel unverifiable | prod: env unknown (Vercel H22) | DONE (code+Stripe) / BLOCKED-HUMAN (env mapping + webhook) |
| 2.2 Migration 0002 | Done | `drizzle/0002_trial-billing.sql:1-4` additive enum + nullable cols | prod db:"ok"; applied-state per-migration UNVERIFIABLE | DONE |
| 2.3 Entitlement states | Done | `lib/server/entitlement.ts:15-19,36,56-100`; Play self-heal gated `:72-97` | merged ✓ | DONE |
| 2.4 Webhook trial lifecycle | Done | `handlers.ts:485-548` (trialing+variant), `:551-617` (invoice.paid conversion, create-guard `:580`), `:620-687` (updated/deleted + telemetry) | merged ✓; live webhook endpoint UNVERIFIABLE (H21) | DONE |
| 2.5 Pricing module + /api/paywall | Done | `pricing.ts:12-26`; `app/api/paywall/route.ts:6-13` | merged ✓ | DONE |
| 2.6 Email-first trial checkout | Done | `handlers.ts:803-883`: find-or-create `:843-858`, magic link `:817-822`, `trial_period_days:7` `:872`, `payment_method_collection:"always"` `:870` (card-gated), variant metadata `:873` | merged ✓ | DONE |
| 2.7 /trial/started page | Done | `app/trial/started/page.tsx:9-50`; fires `trial_started` `:11-17` | merged ✓ | DONE |
| 3.1 HMAC cancel token | Done | `lib/server/billing/cancel-token.ts:1,8-9,14,37` — createHmac + timingSafeEqual, AUTH_SECRET | merged ✓ | DONE |
| 3.2 One-tap cancel + /canceled | Done | `handlers.ts:370-446` (GET token works signed-out `:386-408`; POST provider-scoped `:421-429`); `app/canceled/page.tsx:1-31` | merged ✓ | DONE |
| 3.3 2-day pre-charge cron | Done | `lib/server/billing/precharge.ts:34-107` — 48 h window `:45-59`, stamp-on-send `:80-93`, heartbeat `:98-104`; route CRON_SECRET-gated. Scheduled via **Railway, not vercel.json** | **NOT running in prod** (heartbeat `stale`; BUG-03) | DONE (code) / **BLOCKED-HUMAN (scheduler not provisioned)** |
| 4.1 Taster store | Done | `lib/client/taster-store.ts:1-59` — 10-cap, local-day, status/record | merged ✓ | DONE |
| 4.2 Multi-step trial wall | Done | `components/trial-wall.tsx:9-13,23,33,35`; `app/subscribe/page.tsx:14-32` mode-aware | merged ✓; **dormant in prod (legacy mode)** | DONE |
| 4.3 Client Day-1 gate + taster_check | Done | `components/food-check-form.tsx:122-124,204-205`; A1C prefill `:107-108` | merged ✓ | DONE |
| 4.4 Hard 402 wall (trial mode) | Done | `app/api/check/route.ts:104-125` (tier ≠ premium → 402), `TRIAL_WALL_MESSAGE` `:62`; legacy 5/day path preserved `:126-153` | merged ✓; dormant in prod | DONE |
| 4.5 Trial upsell card CTA | Done | `components/result-card.tsx:31-51,133-153` — "Start your free week" | merged ✓ | DONE |
| 4.6 ADR amendment | Done | `docs/adr/billing.md:49-57` — Decision D supersedes 5/day | merged ✓ | DONE |
| 5.1 First-run redirect | Done | `app/page.tsx:5,12`; `components/first-run-gate.tsx:24`; `?stay=1` escape `:12` | merged ✓ | DONE |
| 5.2 Segmentation + guided first-check chips | Done | `app/onboarding/page.tsx:26-35,255-281` — oatmeal/banana/orange-juice via `revora.recheck` `:91`; **A1C is captured once in onboarding (`:162-209`) and prefilled thereafter (`food-check-form.tsx:107-108`) — no double capture** | merged ✓ | DONE |
| 5.3 Calm Day-1 first-win | Done | `components/daily-loop.tsx:92-96` `.first-win` gated; no emoji/animation | merged ✓ | DONE |
| 5.4 Clear taster on account | Done | commit `82a0200`; `tasterStore.clear()` `:40-46` | merged ✓ | DONE |
| 5.5 Betrayal demo card | Done | commits `79ac700`/`eb6a7f0`, home landing | merged ✓ | DONE |
| 5.6 get-the-app + waitlist | Done | `app/get-the-app/page.tsx`; needs `NEXT_PUBLIC_WAITLIST_URL` (H25) | env pending | DONE (code) / BLOCKED-HUMAN (Tally) |
| 6.1 In-app pantry checkout | Done | `handlers.ts:293-313` (`mode:"payment"` → /pantry/thanks); `app/api/billing/stripe/pantry-checkout/route.ts:4`; webhook reused `:488-492` | merged ✓; **fulfillment cron dead in prod (BUG-03)** | DONE (code) |
| 6.2 Pantry landing | Done | `app/pantry/page.tsx`; `components/pantry-buy-button.tsx:12,18,33` | merged ✓ | DONE |
| 6.3 Post-verdict entry only on non-SAFE | Done | `components/result-card.tsx:10-15,120-128` `showPantryEntry` | merged ✓ | DONE |
| 7.1 Keep-most ledger gate | Done | `docs/safety/copy-ledger.md:46,63-71` — 9 candidates; winner `keep-most-02` `:64` | merged ✓ | DONE |
| 7.2 Deterministic keepMost | Done | `lib/revora/coach-outputs.ts:23,38-52` — MODERATE/HIGH only, SAFE → null `:42-45`, verbatim ledger string `:39` | merged ✓ | DONE |
| 7.3 Render "Enjoy it anyway" | Done | `components/result-card.tsx:75-79` gated on keepMost | merged ✓ | DONE |
| 8.1 DoR smoke spec | "NOT STARTED" (handoff) | **`tests/smoke/trial-wall.spec.ts` exists with all 7 scenarios** (`:83,130,151,168,200,212,229`) — and passed both browsers in this audit's run | merged ✓ | DONE (exceeds claim) |
| 8.2 DoR walkthrough doc | Human-gated | `docs/handoff/2026-07-05-dor-walkthrough.md` scaffolded; live legs (real card → trial → test-clock → pre-charge → cancel → conversion) human | — | DONE (doc) / BLOCKED-HUMAN (live legs) |
| 8.3 Price-test + flip runbook | "Not yet" (handoff) | `docs/runbooks/price-test.md`; flip procedure correctly references Railway `:158-175` | merged ✓ | DONE |
| 8.4 /demo + capture script | "Not yet" (handoff) | `app/demo/page.tsx` (in COPY_FILES `:39`); `scripts/capture-marketing-shots.mjs`; marketing-assets doc | merged ✓ | DONE |
| FINAL review + merge + deploy | "Remaining" (handoff) | Hardening `cdbaae8`; merged `b6fb5b5`; origin/main synced | **prod deploy stale (BUG-02)** | DONE (merge) / **NOT DONE (prod deploy of current main)** |

**Discrepancies vs the SDD handoff** (`docs/handoff/2026-07-05-launch-readiness-sdd-session-handoff.md`): (1) it understates completion — Phase 8.1–8.4 and the merge are done; (2) its "zero Stripe products" flag is superseded (§3.0); (3) its cron transport assumption (Vercel hourly crons) is superseded by the Railway move (`eb3005e`) — but the Railway side was never provisioned, so the *outcome* it feared (no pre-charge emails) is currently true anyway; (4) minor: `app/api/health/route.ts:10-14` comment still attributes hourly cadences to `vercel.json`.

### 3.2 Plan #2 — `docs/superpowers/plans/2026-06-21-revora-launch-hardening.md`

**Headline: engineering layers (rate limit, cost caps, eval pipeline, /privacy, error UX, Sentry scrub, PWA) are implemented and tested in-repo. Two substantive gaps: domain gold labels absent (band-accuracy quality sub-gate dormant) and the "reversal" copy carve-out pending counsel.** Prod-infra rows are UNVERIFIABLE from the repo — and this audit's runtime findings show the one that could be observed (Upstash in prod) is misconfigured (BUG-01).

| Phase/Task | Claimed | Verified (evidence) | Deployed? | Verdict |
|---|---|---|---|---|
| 0.1 OpenAI hard spend cap | ops gate | Dashboard action; runbook copy only (`docs/ops/launch-checklist.md`, `openai-cost-model.md`) | unknown (OpenAI dashboard) | BLOCKED-HUMAN |
| 0.2 Prod domain + HTTPS | ops gate | No in-repo evidence; **runtime: no custom domain exists (§2)** | **no** | BLOCKED-HUMAN |
| 0.3 Upstash provision + env | ops/eng | Code consumes `UPSTASH_REDIS_REST_URL/TOKEN`, `REVORA_DAILY_CHECK_CAP` (`lib/revora/rate-limit.ts:82-96`). **Runtime: prod value present but invalid → BUG-01** | **broken in prod** | **DONE-BUT-BROKEN (prod env value)** |
| 0.4 Secret audit + .env.example + Secrets doc | eng | `git grep NEXT_PUBLIC_(OPENAI\|UPSTASH)` → none; `.env.example` tracked; Secrets §7 `docs/ops/launch-controls.md:203` | merged ✓ | DONE (file contents unread — perm) |
| 1.1 Rate-limit module (test-first) | eng | `evaluateRateLimit` per-IP→daily order, transient-fail-open (`rate-limit.ts:26-49`); `createRateLimitDeps` null-when-unconfigured, slidingWindow(20,"1h") (`:79-114`); unit tests | merged ✓ | DONE |
| 1.2 Telemetry `daily_cap` | eng | `lib/revora/telemetry.ts:12-14` + test | merged ✓ | DONE |
| 1.3 Middleware wiring | eng | pause → per-IP → daily, 429 + Retry-After, fail-closed without Upstash on public deploys (`middleware.ts:73-124`) | merged ✓; **crashing in prod (BUG-01)** | DONE (+ positive SCOPE-DRIFT: also covers `photo-draft` `:126`; fails closed on preview too `:42-48`) |
| 2.1 Client timeout + maxRetries:0 | eng | `timeout:10_000, maxRetries:0` (`lib/revora/openai-client.ts:144`) + test | merged ✓ | DONE |
| 2.2 MAX_MODEL_ATTEMPTS = 1 | eng | `lib/revora/service.ts:30` (read-only; safety-frozen) | merged ✓ | DONE |
| 2.3 Route maxDuration | eng+ops | `app/api/check/route.ts:41` `maxDuration = 15`; Vercel-plan-limit check is ops (NOTE-2) | plan tier unknown | DONE (code) / UNVERIFIABLE (plan limit) |
| 3.1 Domain gold labels | domain reviewer | **0 occurrences** of `acceptableRisks`/`labelSource` in `tests/fixtures/revora-eval-cases.json`; schema supports them (`tests/support/revora-test-model.ts:47-48`); accuracy sub-gate inactive by design (`lib/revora/eval-rubric.ts:120-140`) | — | **NOT DONE → BLOCKED-HUMAN** (domain reviewer, not eng) |
| 3.2 Adversarial/injection cases | eng+domain | fixture: adversarial=8, prompt_injection=5 (≥5 required); 38 `harmfulIfSafe:true` | merged ✓ | DONE |
| 3.3 Live graded runner + rubric | eng | `eval-rubric.ts:94-158`; `tests/evals/revora-graded-eval.test.ts`; `scripts/run-graded-evals.mjs`; unit tests | merged ✓ | DONE (live run needs key + spend; accuracy sub-gate dormant until 3.1) |
| 4.1 Public /privacy | eng (legal reviews) | `app/privacy/page.tsx:36-52,98-100,130-136`; **runtime: prod copy accurate for the current stateful posture** (§4 positives) | deployed (older copy) | DONE |
| 4.2 Disclaimer-presence test | eng | `tests/unit/revora/disclaimer-presence.test.ts:56-70` (all 5 kinds) | merged ✓ | DONE |
| 4.3 Claims-boundary copy audit | eng+domain | `claims-boundary-copy.test.ts:14-25` — 8 banned word-families | merged ✓ | DONE — **but see BUG-05 (sanctioned reversal carve-out `:82-96`) and BUG-08 (numeric families unscanned)** |
| 4.4 Legal counsel | legal | Non-code by design | — | BLOCKED-HUMAN |
| 5.1 Distinct 503/paused UI | eng | `lib/client/check.ts:109-132` | merged ✓ | DONE |
| 5.2 Offline detection | eng | `components/food-check-form.tsx:148` | merged ✓ | DONE |
| 5.3 A11y audit | eng/design | `tests/smoke/a11y.spec.ts` present; passed on Mobile Chrome in this audit's run; manual keyboard/SR pass human | — | PARTIAL (automated ✓; manual UNVERIFIABLE) |
| 6.1 Sentry + PII scrub | eng | allowlist init + `beforeSend` (`sentry.server.config.ts:16-24`); scrub strips request/user/message/frame vars (`lib/revora/sentry-scrub.ts:19-37`); tests. **Runtime: local telemetry lines confirmed food-text-free** | DSN-in-prod unknown | DONE (code) / UNVERIFIABLE (prod DSN + live canary) |
| 6.2 Alert rules | eng/ops | Spec `launch-controls.md:254-290`; actual Sentry/Vercel rules external | unknown | DONE (spec) / BLOCKED-HUMAN (config) |
| 6.3 Incident runbook + health probe | ops/eng | `launch-controls.md` §10; health `upstash` probe (`app/api/health/route.ts:67,89`) | deployed | DONE — **but the presence-only probe masks BUG-01 (see BUG-07)** |
| 7.1–7.3 PWA (manifest, icons, SW, offline) | eng | `public/manifest.webmanifest`, 192/512/maskable PNGs, `app/layout.tsx:16-27`, `public/sw.js:50-65` network-first + offline fallback incl. disclaimer (`offline.html:56-59`), `components/sw-register.tsx` | deployed | DONE — **minor bug: SW push icon path `/icons/icon-192.png` should be `/icon-192.png` (`sw.js:34-35`) → notification icon 404s (BUG-16)** |
| 8.1–8.3 QA, gates, go-live/rollback drills | eng/ops | Smoke suite present (this audit's counts §2); drills human-timed | — | PARTIAL / BLOCKED-HUMAN (drills) |
| 9.1–9.4 Play (account, Data Safety, TWA/assetlinks, submit) | ops/legal | `public/.well-known/assetlinks.json` **correctly absent** (real SHA-256 doesn't exist yet — runbook §2 forbids placeholders); no `.aab`; runbooks ready | no | BLOCKED-HUMAN |

### 3.3 Plan #3 — `docs/production-implementation-plan-2026-07-01.md` (full build)

**Headline: all code-buildable scope (P0–P6, 4A–4E) is materially DONE and test-backed, with three intentional, ADR-documented supersessions (Neon→Railway Postgres; Plausible→Umami; Vercel→Railway hourly crons). Everything from P7 on (provisioning, deploy, TWA signing, Play, counsel) is correctly BLOCKED-HUMAN. Gates 1 and 2 cannot close without the human actions in §6.**

| Phase/Task | Claimed | Verified (evidence) | Deployed? | Verdict |
|---|---|---|---|---|
| P0 Regression guard + consistency harness + ADRs | done | ADRs present (`docs/adr/*`); `scripts/consistency-check.mjs`; engine-regression suite | — | PARTIAL (harness DONE; live N=50 flip-rate never measured → BLOCKED-HUMAN) |
| P1 Card v2 (sequencing + post-meal) | done | `lib/revora/coach-outputs.ts` rule-based; engine untouched | deployed (pre-merge era) | DONE |
| P2 Voice input | done | `lib/client/speech.ts`, `components/voice-input-button.tsx`, input-method header | deployed | DONE |
| P3 Onboarding + guest coach (device-local) | done | `app/onboarding/page.tsx:62-223` (A1C once + out-of-range → clinician routing `:16-19,73-81`), `lib/client/history-store.ts`, `lib/coach/insights.ts` | deployed | DONE |
| 4A Auth.js v5 magic-link | done | `auth.ts:1,20-27` DrizzleAdapter; `:40-81` Resend provider; DB sessions `:32` | prod: Resend DNS unknown | DONE (code); E2E DB-gated locally |
| 4A GDPR Art.9 consent | done | Enforced `app/api/profile/route.ts:84-91` + `/welcome` checkbox `app/welcome/page.tsx:176-205`; wording is `COUNSEL-DRAFT` `:186-194` | — | DONE (code) / BLOCKED-HUMAN (counsel wording) |
| 4A middleware signed-in detection | done | `middleware.ts` has **no** auth logic; gating is route-level via `lib/server/session.ts` | — | PARTIAL (sub-item as written unmet; functionally protected — DB sessions aren't edge-verifiable; likely intentional) |
| 4A DB schema + migrations | done | `lib/server/db/schema.ts` — all 10 plan-§3.3 tables + extras (`cron_heartbeat`, pantry_*); `drizzle/0000..0002` + `meta/_journal.json` consistent; CHECKs + `checks_migration_dedupe` partial-unique (`schema.ts:117-119`) | prod `db:"ok"` (health); per-migration applied-state UNVERIFIABLE; apply is manual (`env-reference.md:43`), not CI-enforced | DONE (defined) |
| 4A Encryption at rest | done | `lib/server/crypto.ts:1-69` AES-256-GCM, 32-byte `HEALTH_DATA_KEY`, iv‖tag‖ct, tamper-fail; encrypted: food (`app/api/check/route.ts:241`), exact A1C (`app/api/profile/route.ts:111`); coarse `a1c_band`/`risk` deliberately plaintext; scrub covers new fields + test (`tests/unit/revora/privacy-stateful.test.ts:69-97`). **Spot-checking a real prod DB row was not possible (no DB access) — the schema stores only ciphertext columns for these fields and PGlite tests verify round-trip; a human with `DATABASE_URL` should confirm one prod row.** | prod row-level check UNVERIFIABLE | DONE (code+tests) |
| 4B Server history + guest→server migration | done | Signed-in-only persist (`check/route.ts:172-250`; guests untouched `:218-221`); owner-scoped decrypt GET + 401 (`app/api/history/handlers.ts:72-108`); dedup migrate `.onConflictDoNothing()` (`:126-165`); invoked `welcome/page.tsx:96-106`, `daily-loop.tsx:44` | prod DB E2E unknown | DONE |
| 4B Privacy lockstep docs | done | `/privacy` rewrite, `docs/privacy/data-flow.md`, Data Safety table, counsel brief; `privacy-stateful.test.ts` | deployed (older copy) | DONE / counsel sign-off BLOCKED-HUMAN |
| 4C Server coach compute | done | `GET /api/coach` + `lib/coach/compute.ts` | — | DONE |
| 4D Stripe billing | done | checkout `handlers.ts:250-289`; webhook 5 events + sig verify `:450-704`; portal `:317-355`; one-tap cancel chain (`cancel/route.ts` → `handlers.ts:370-446`; `app/account/page.tsx:189-199`) | live webhook endpoint UNVERIFIABLE (H21) | DONE |
| 4D Play billing | done | `lib/client/digital-goods.ts`; server verify `app/api/billing/handlers.ts:117-168`; `lib/server/play-api.ts:41-114` RS256 JWT, no googleapis; RTDN shared-token `:172-242` | real purchase device-only | DONE (code) / BLOCKED-HUMAN (device) |
| 4D Entitlement + canceled behavior | done | `entitlement.ts:36,57-60,100` — `canceled` premium only while `currentPeriodEnd > now`, else lapsed→free; grace honored; Play verify-on-read fails toward free `:94-96` | — | DONE |
| 4D Free-tier 5/day enforcement | done | server count `entitlement.ts:104-127` + 402 gate `check/route.ts:126-153`; Upstash IP backstop | **this is what prod currently runs (legacy)** | DONE |
| 4D Refund → entitlement | done | `charge.refunded` updates **pantry orders only** (`handlers.ts:699-702`); sub refunds reach free only via `subscription.deleted` | — | PARTIAL — a refund *without* cancel leaves premium until period-end (edge case; BUG-17) |
| 4E Account deletion + public URL | done | `app/api/account/delete/route.ts:54-78` best-effort Stripe cancel + FK-cascade delete + identity-free sha256 `deletion_log`; `app/account/delete/page.tsx` | — | DONE |
| P5 Nudge (Web Push) | done | `public/sw.js:23-48`; two-step premium-only opt-in; subscribe POST/DELETE; `lib/server/nudge.ts:41-127` tz-match/one-per-day/prune-410; CRON_SECRET-gated route | **cron never fires in prod (BUG-03)**; VAPID env unknown | DONE (code) / BLOCKED-HUMAN (scheduler) — minor drift: default hour 11:00 vs plan's 11:30 (`app/account/page.tsx:244-271`) |
| P5 Crons: vercel.json vs Railway | done | `vercel.json:2` = only `bai-weekly 30 4 * * 1`; hourly nudge/pantry-sweep/trial-precharge → Railway service, documented only in `docs/runbooks/price-test.md:158-166`; Railway config not committed | **not provisioned (BUG-03)** | DONE (intentional move) / **BLOCKED-HUMAN (provisioning)** — doc drift in `adr/hosting-hybrid.md:9-11`, `adr/stack.md:13-14`, `ops/launch-controls.md:374-375`, `ops/env-reference.md:25` (all still say "Vercel hourly cron") |
| P6 Progress / BAI | done | `lib/coach/bai.ts` math + band copy; `app/api/cron/bai-weekly` + `lib/server/bai-cron.ts:58-134`; `/progress`, `/how-it-works` | cron never fired in prod | DONE (code) / band-copy compliance read BLOCKED-HUMAN |
| P7 Prod hardening/observability → Gate 1 | partial | health db+cron probes; Sentry wired; analytics inert until Umami env | **Gate 1 open** | BLOCKED-HUMAN (provisioning; and see BUG-01/02/03 — the parts that *were* provisioned are misconfigured) |
| P8 TWA + device QA | template | `twa-manifest.json` placeholders; assetlinks **correctly absent**; no `.aab`; `device-qa-checklist.md` ready | no | BLOCKED-HUMAN |
| P9 Play submission | blocked | reviewer bypass hard-404s in prod (`app/api/auth/reviewer-signin/route.ts:71-79`); `/terms` has 2 `COUNSEL-DRAFT` bracketed placeholders; `play-listing.md` ready | no | BLOCKED-HUMAN |
| P10 Launch/support → Gate 2 | blocked | `support-playbook.md`, `launch-checklist.md`, incident scenarios §10.5 | no | BLOCKED-HUMAN |
| F3/D5 Photo-assist | **DEFERRED** per plan | **Built and merged** (see §3.4) — the plan's own text still says "not built" (L16, L187, L211, L500) | merged ✓ / **not in prod (stale deploy)** | **SCOPE-DRIFT** (needs the §3.4 correction note) |
| F21 CGM | EXCLUDED | No CGM code (grep-clean) | — | DONE (correctly excluded) |

*(Reconciliation note: the Plan #3 verification pass initially classed D5 as "correctly not built," reading `photo-draft` as Pantry code. The dedicated photo-assist audit (§3.4) disproves that with commit-level evidence — `photo-draft` is the D5 meal input, wired into `food-check-form.tsx:306-331`; Pantry's upload is a separate surface (`app/api/pantry/upload/route.ts`). §3.4 governs.)*

### 3.4 Photo-assist (D5) — `docs/superpowers/plans/2026-07-06-photo-assist-check-input.md` + scope-drift reconciliation

| Phase/Task | Claimed | Verified (evidence) | Deployed? | Verdict |
|---|---|---|---|---|
| T1 Meal extractor `lib/meal/photo-extract.ts` | Done (7ee6867) | Transcribe-only schema `{dish, items[{name, portion, uncertain}]}` — **no verdict field** (`:48-68`); prompt bans advice/health/risk/numbers-except-visible-portions (`:42-43`); `store:false` (`:122`); no `lib/revora`/`lib/pantry` imports (`:1-11`); stub prod-gated (`:100-102`); zod clamp 20 items (`:139`); `maxRetries:0` (`:152`); unit test | merged ✓ / **not in prod** | DONE |
| T2 Live eval (go/no-go gate) | Done (e24c2ed) | `tests/evals/meal-photo-eval.test.ts` — recall ≥ 0.70 + zero confident hallucinations (`:58-59`), **but `describe.skipIf(!READY)`: repo ships only `labels.example.json` — no `labels.json`, no real photos → the gate is SKIPPED and its pass has never been demonstrated in-repo** | merged ✓ | **PARTIAL — gate unrun (BUG-10)** |
| T3 Gated `/api/check/photo-draft` route + middleware | Done (232d5c1) | data-URL validation → 400 (`route.ts:70-76`); **trial wall 402 before any vision call** (`:83-99`); model failure → 502 retry-JSON (`:108-114`); middleware matcher covers it (`middleware.ts:75,126`); 5-case unit test | merged ✓ / **prod 404 (stale deploy)** | DONE |
| T4 Client capture/chips/handoff | Done (048944a) | `lib/client/image.ts`, `lib/client/photo-draft.ts`, `photo-input-button.tsx`, `photo-draft-review.tsx`; wired `food-check-form.tsx:306-331`; confirm disabled while uncertain chips unresolved; `photo_draft` analytics event | merged ✓ | DONE |
| T5 `inputMethod:"photo"` end-to-end | Done (d9626b7) | header (`lib/client/check.ts:64-65`) → coercion (`check/route.ts:244-247`) → schema enum + CHECK (`schema.ts:104-123`); on-device history mirrors it; covered by `tests/unit/server/check-persistence.test.ts:131-144` (plan's named test file doesn't exist; coverage relocated) | merged ✓ | DONE |
| T6 Disclaimer coverage | Done (20839d6) | Shared `components/disclaimer-line.tsx` + verbatim `RESULT_FOOTER_DISCLAIMER`; rendered on all 3 result-card branches (`result-card.tsx:119,151,191`), `/history:138`, `/progress:213` | merged ✓ / **missing in prod (stale deploy)** | DONE (one sub-step skipped: `demo-check-card.tsx:32-35` still inline — copy identical, un-deduped) |
| T7 Ledger + privacy + env docs | Done (14295fc) | Ledger rows added (`copy-ledger.md:73-76`, all **Pending** review); privacy sentence (`privacy/page.tsx:107`). `MEAL_EXTRACT_STUB` not documented in `.env.example` (commit touched only 2 files) | merged ✓ | PARTIAL (env doc missing) |
| T8 Playwright smoke | Done (6a607ba) | `tests/smoke/photo-check.spec.ts`: uncertain chip must be confirmed → confirm enabled → textarea + `data-input-method="photo"`; **passed both browsers in this audit's run**. Deviation: stubs via network intercept rather than `MEAL_EXTRACT_STUB` env (config untouched) | merged ✓ | DONE |

**Gating & privacy verification (all confirmed in code):**
- **Rate-limited:** middleware matcher includes `photo-draft`; kill-switch + per-IP + global daily cap fire pre-route; fails closed on public deploys without Upstash (`middleware.ts:75,86-96,126`).
- **Trial-walled:** 402 upsell before any vision spend for signed-in non-premium in trial mode (`route.ts:83-99`). Nuance: in **legacy** mode, drafts are not counted against the 5/day per-user cap (per the plan's explicit out-of-scope decision) — IP/global caps still apply.
- **No photo persistence:** `@vercel/blob` grep in the meal path = empty (blob is Pantry-only); DB stores only `encryptField(food)` (the confirmed *text*) + `input_method` (`check/route.ts:239-249`); image is base64 in-request → vision transport, `store:false`, never logged.

**Scope-drift reconciliation (required):**
(a) **Is D5 now in scope?** Yes — built, tested, merged to `origin/main` (commits `7ee6867…6a607ba`), though **not yet in production** (stale deploy).
(b) **Is it gated correctly?** Yes per the three checks above.
(c) **Do Plans #1/#3 need correction notes?** **Only Plan #3.** The task premise was half-wrong: `docs/production-implementation-plan-2026-07-01.md` defers D5 explicitly (L16 "explicitly **not built or launched**", L187 F3 "DEFERRED — specified, not built", L211, L500) — but `docs/superpowers/plans/2026-07-05-launch-readiness-paywall-pantry.md` **never mentions D5**; its "photo" references are the separate Pantry Review upload. Exact one-liners to append:

> **For `docs/production-implementation-plan-2026-07-01.md` (under §6.3 / F3 row):** "CORRECTION 2026-07-06: D5 Photo-assist is no longer deferred — built and merged to `main` (see `docs/superpowers/plans/2026-07-06-photo-assist-check-input.md`, commits 7ee6867…6a607ba); ships transcribe-only draft→confirm→existing `/api/check`, gated + no photo persistence. ⚠ The §6.3.4 binding pre-ship gates (100-meal blind dietitian-graded eval; counsel SaMD imaging answer Q9; owner green-light) are NOT yet evidenced as satisfied — the shipped eval is a lighter 20–30-photo recall bar with fixtures uncommitted (skipped). Treat those gates as still-open before any photo marketing / store-facing launch."
>
> **For `docs/superpowers/plans/2026-07-05-launch-readiness-paywall-pantry.md` (header/scope note):** "NOTE 2026-07-06: This plan does not scope D5 Photo-assist (its 'photo' references are the Pantry Review upload, a separate surface). D5 meal-photo check input was built under `docs/superpowers/plans/2026-07-06-photo-assist-check-input.md`; no change to this plan's paywall/pantry scope is implied."

**⚠ Highest-severity D5 finding (BUG-10):** Plan #3 §6.3.4 defined **binding** pre-ship gates for exactly this feature — a 100-meal blind dietitian-graded eval (zero under-warned verdicts; accept-without-edit ≥ 60%; portion error ≤ 25%; dish-family ID ≥ 90%), counsel's SaMD answer for an imaging input (Q9), and an owner green-light — and stated those gates "stand" regardless of scope re-decisions. The shipped work substituted a lighter 20–30-photo recall ≥ 0.70 eval whose fixtures aren't committed (so it has never demonstrably run), and no evidence exists that Q9 or the green-light cleared. D5 is on `main`; **redeploying main ships it to production with those gates unmet** — an explicit owner decision is required (ship anyway / hold the deploy / flag it off).

---

## 4. Part 2 — Bug / issue list (blockers first)

| ID | Area | Severity | Repro steps | Expected vs actual | Evidence |
|---|---|---|---|---|---|
| BUG-01 | Prod core check API | **blocker** | `curl -X POST https://revora-lovat.vercel.app/api/check -H 'content-type: application/json' -d '{"food":"toast","a1c":6.0}'` (GET fails identically) | SAFE/MODERATE/HIGH result JSON; actual HTTP 500 `x-vercel-error: MIDDLEWARE_INVOCATION_FAILED` on every request | `vercel logs`: `UrlError: Upstash Redis client…`; client built at module scope `middleware.ts:34` → `lib/revora/rate-limit.ts:86` (`new Redis({url, token})`). `UPSTASH_REDIS_REST_URL` in Vercel prod is present-but-invalid (classic cause: the `rediss://` TCP URL instead of the `https://` REST URL). Health can't see it: `isRateLimitConfigured()` is presence-only (`rate-limit.ts:67-71`). |
| BUG-02 | Prod deploy pipeline | **blocker** | Compare prod vs local at `7727a31`: prod `/history` lacks the disclaimer footer; `POST /api/check/photo-draft` → 404; both present locally | Prod should serve `origin/main` (pushed 10:59 ET; deploy created 13:26 ET); actual: built from older code | Disclaimer/photo greps (§2); `vercel ls` deployment `dpl_J3bJUvffzyUVC5YBUbWQvrd53huU`. Source-commit identification needs the Vercel dashboard. ⚠ Interlock: redeploying main ships D5 past its unmet binding gates (BUG-10) — owner decision needed first. |
| BUG-03 | Prod scheduled jobs | **blocker** | `curl https://revora-lovat.vercel.app/api/health` → `crons` | All crons `ok` (launch-checklist §3 gate); actual `nudge: never, baiWeekly: never, pantrySweep: never, trialPrecharge: stale` | `vercel.json:2` (only `bai-weekly 30 4 * * 1` — today is Monday and it still reads `never`; check `CRON_SECRET`/cron enablement); Railway scheduler never provisioned (`.railway-config-pull-*/railway.ts` = `import-placeholder`, one `web` service, no crons); intended move documented in `eb3005e` + `docs/runbooks/price-test.md:158-166`. Consequences: no 2-day pre-charge emails (trial contract), no pantry order sweep (paid product unfulfilled), no nudges, no weekly BAI. |
| BUG-04 | Prod paywall mode (business) | **blocker** | Load `https://revora-lovat.vercel.app/subscribe` | Locked decisions: card-gated trial, **no standing free tier**, $9.99/$12.99/$19.99; actual: "Free keeps working: five checks a day", "Monthly — $12.99/mo" (legacy) | `lib/server/pricing.ts:24-25` defaults `legacy`; live subscribe copy. A deliberate flag-flip with prerequisites (BUG-01/02/03 fixed; Stripe H20–H24; DoR live walkthrough). `docs/ops/env-reference.md` omits `PAYWALL_MODE` (doc gap). Landing's "No login is required" copy also becomes wrong in trial mode — recheck at flip time. |
| BUG-05 | Claims boundary | **blocker** (claims/legal) | Open `/onboarding` first screen | No banned-family claims, every string ledgered; actual: "Reversal is achieved through your dietary choices — Revora gives you the clarity to make them" is live, **unledgered**, and the claims CI test carves out exactly this sentence pending "counsel Q8" | `app/onboarding/page.tsx:117-119`; `docs/safety/claims-boundary.md:23,34-40` (reversal = banned family); `docs/safety/copy-ledger.md:48-49` (no row); `tests/unit/revora/claims-boundary-copy.test.ts:82-96` (hand-carved exclusion). Counter-argument on file (user-as-agent framing, brand doc calls it the "master legal safeguard line") — but the boundary docs are non-negotiable and counsel sign-off is pending. Adjudicate with counsel before any marketing push. |
| BUG-06 | Domain / distribution | major | `curl https://revora.app` → generic 404 (not this app); all aliases are `*.vercel.app` | Launch checklist Gate 1 requires the real domain; actual: none configured | `docs/ops/launch-checklist.md` §0/§1; `env-reference.md:28`. Human-only (purchase/DNS/Vercel). |
| BUG-07 | Health/monitoring gap | major | Compare prod `/api/health` (`ok:true, upstash:"configured"`) with BUG-01 (check API 100% down) | The probe the launch checklist wires to uptime alerts should not read green during a total core-endpoint outage | `app/api/health/route.ts` presence-only upstash probe (deliberate `ponytail:` tradeoff, now demonstrated harmful); no probe exercises `/api/check`. Hardening: validate URL scheme in `isRateLimitConfigured()`; try/catch `createRateLimitDeps()` in middleware to fail closed with the designed 503; add a synthetic check probe to monitoring. |
| BUG-08 | Claims guardrail blind spot | major | Add "keeps you under 140 mg/dL" to any COPY_FILES surface → CI passes | `claims-boundary.md:40-42` also bans numeric families (mg/dL, exact GI/GL, % glucose figures); the CI test scans only 8 banned *word*-families | `tests/unit/revora/claims-boundary-copy.test.ts:14-25`. No live numeric violation exists today (greps clean) — latent gap. Related: new photo/disclaimer components aren't in COPY_FILES (`photo-draft-review.tsx`, `photo-input-button.tsx`, `photo-draft/route.ts`, `disclaimer-line.tsx`), contrary to the every-new-user-facing-file convention. |
| BUG-09 | Eval quality gate dormant | major | Inspect `tests/fixtures/revora-eval-cases.json` | Plan #2 3.1 gold labels (`acceptableRisks` + `labelSource`) present; actual: 0 occurrences → the live graded eval enforces harmful-SAFE/usefulness/adversarial but **not band accuracy** | Fixture grep; `lib/revora/eval-rubric.ts:120-140` (sub-gate inactive by design until labels exist). BLOCKED-HUMAN: domain/clinical reviewer must author labels; eng cannot self-certify. |
| BUG-10 | D5 shipped past binding gates | major (**becomes blocker on redeploy**) | Compare Plan #3 §6.3.4 gates vs shipped D5 | 100-meal blind dietitian-graded eval + counsel SaMD Q9 + owner green-light before D5 ships; actual: lighter 20–30-photo eval whose fixtures aren't committed (gate skipped/unrun), no Q9/green-light evidence; D5 is merged on main | §3.4; `tests/evals/meal-photo-eval.test.ts:17` (`skipIf`), only `labels.example.json` in repo. Owner decision required before the BUG-02 redeploy. |
| BUG-11 | Test-infra reliability | major | `npx vitest run` / full Playwright on this dev box | Release gates green; actual: 6 PGlite hook-timeout failures and 39 Playwright timeout failures that vanish in isolation | §2 table; `vitest.config.ts:27-30` comments anticipate this. "All suites green" claims are not reproducible on this hardware — CI or a faster box is needed for trustworthy gates. |
| BUG-12 | Photo-draft error shape (degraded env) | minor | Local dev without DB: `POST /api/check/photo-draft` bad payload | Clean 4xx gate; actual HTTP 502 with retry-JSON | Observed on `127.0.0.1:3100` (no `DATABASE_URL`). Calm body correct; status code is the wart. Prod-relevant only if the DB is down. |
| BUG-13 | Duplicate disclaimer (transient) | minor | Playwright retry-state assertion, flaky occurrence | `getByText('Not medical advice.')` unique; actual: strict-mode violation — 2 elements in a transient retry state | This audit's Playwright log; likely form-footer + result-footer co-visible after the shared-footer refactor (`20839d6`). UI duplication + flake source. |
| BUG-14 | Typecheck vs generated types | minor | `npm run typecheck` while `.next/dev/types/routes.d.ts` is stale/mid-write | Deterministic typecheck; actual: can fail on a generated artifact | `tsconfig.json:35` includes `.next/dev/types/**`; first run of this audit hit 20 × TS1005 there; clean re-run passes. Can also poison CI if `.next` is cached. |
| BUG-15 | Playwright webServer cold-boot timeout | minor | Full suite, cold `.next` cache, slow disk | Servers boot; actual `Timed out waiting 120000ms from config.webServer`, zero tests run | `playwright.config.ts:48,88` hard-code 120 s. Warm caches pass. |
| BUG-16 | SW notification icon 404 | minor | Receive a push notification | Icon renders; actual: `sw.js` references `/icons/icon-192.png` but the file lives at `/icon-192.png` | `public/sw.js:34-35` vs `public/icon-192.png`. |
| BUG-17 | Refund edge case | minor | Stripe refund issued *without* cancel | Entitlement reflects refund; actual: `charge.refunded` updates pantry orders only — a refunded subscriber keeps premium until period-end | `app/api/billing/handlers.ts:699-702`; sub refunds reach `free` only via `subscription.deleted`. The `"refunded"` enum value is never written by any path. |
| BUG-18 | Privacy allowlist omission | minor | Read `data-flow.md` stored-data allowlist vs schema | Every persisted field listed; actual: `pantry_orders.email` (plaintext Stripe buyer email) omitted | `lib/server/db/schema.ts:243` vs `docs/privacy/data-flow.md:37-48`. No leak — doc completeness. |
| BUG-19 | Doc drift (crons + env) | minor | — | Docs match the Railway cron reality and full env surface; actual: 4 docs still say "Vercel hourly cron" (`adr/hosting-hybrid.md:9-11`, `adr/stack.md:13-14`, `ops/launch-controls.md:374-375`, `ops/env-reference.md:25`); `env-reference.md` lacks `PAYWALL_MODE` and `MEAL_EXTRACT_STUB`; `app/api/health/route.ts:10-14` comment stale; `demo-check-card.tsx:32-35` inline disclaimer un-deduped | Cited files. |
| BUG-20 | Local dev env incomplete | minor (local only) | `npx next dev` with current `.env`/`.env.local` | Working local happy path; actual: Auth.js `MissingSecret`, OpenAI calls fail → all checks fall back to `retry` | Dev-server logs. The fallback behavior itself is good (calm copy + disclaimer, no crash, telemetry scrubbed). Env contents permission-blocked — owner must reconcile against `env-reference.md:34-41`. |
| NOTE-1 | Framework deprecations | cosmetic | boot dev server | — | Next 16 `middleware`→`proxy` deprecation; multiple-lockfile root inference (`/home/tefera/package-lock.json` shadow); slow-filesystem warning. |
| NOTE-2 | `maxDuration = 15` vs Vercel plan | note (human) | — | Comment demands ops verify plan cap ≥ 15 s (Hobby historically lower); Hobby is also why hourly crons left Vercel — the plan-tier decision (Pro?) is open | `app/api/check/route.ts:36-41`; `docs/handoff/human-actions-required.md`. |

**Positive findings worth recording** (things a paying client would experience correctly, verified):
- Prod `/privacy` copy accurately describes the stateful split posture (guest: "no account, no server-side history… held in memory only"; signed-in: AES-256-GCM "encrypted at rest", deletable, consent-gated) — no stale no-DB claims. Sentry scrub code matches `data-flow.md:79-86` exactly.
- Claims greps are clean across all user-facing surfaces (mg/dL 0, GI/GL numbers 0, diagnose/cure/guarantee/"will lower" 0, CGM only in the correct "does not replace your doctor" context). The only numeric figures are cited-study framings on `/how-it-works` (`:71-86`) with strong hedging — recommend counsel glance (FTC health-claim standards), no action forced.
- Disclaimer-footer coverage is **complete**: shared `DisclaimerLine` on all 3 result-card branches, `/history`, `/progress`, `/report/[id]`, `/demo`, pantry landing; the `/api/check` response carries the disclaimer on **every** response kind incl. malformed/non-food/retry (verified live); offline fallback page includes it (`offline.html:56-59`).
- ≤1-clarify contract enforced in the safety contract + `disclaimer-presence.test.ts` (all 5 response kinds); `not_food`/`out_of_scope` are deterministic short-circuit categories in the eval harness.
- Debt greps: zero TODO/FIXME/HACK/XXX in `app/ lib/ components/ middleware.ts`; only 2 `console.*` calls, both strict-zod bounded-enum objects (no PII possible); no secret-sounding `NEXT_PUBLIC_` vars.
- Rate limiting, kill-switch, encryption, entitlement lapse logic, account deletion, and guest→server history migration all verified at code level with tests.

---

## 5. Part 3 — Pain-point / burning-question coverage

Source: `/home/tefera/Desktop/Various_files/target_audience_questions.md` (read in full; themes extracted from the file, not assumed). All 9 hypothesis themes **confirmed**; one added (T10). Representative quotes cited by line.

Themes: **T1** unpredictable individual carb reactions ("oats are like a warm hug for my system, pasta feels like I've been mildly poisoned" L22; "I can't have rice, full stop" L33) · **T2** guilt/all-or-nothing ("had more carbs, now I feeling so bad and guilty… I am spiralling" L81) · **T3** fear-of-food/orthorexia-adjacent ("this shit is giving me an eating disorder… afraid to eat" L221-231; "I literally sit around hungry half the time" L239) · **T4** overwhelm/conflicting advice ("tried picking healthy foods and almost broke down. I don't even know where to start" L120) · **T5** convenience pressure (L75) · **T6** confusing labs → doctor distrust ("5.6 to 7.4 in four months?… I'm literally at a loss" L186-188) · **T7** boredom with safe meals (L218-219) · **T8** travel "mental food break" (L282-283) · **T9** underweight/ARFID nuance (L287-289) · **T10 (added)** "is this *specific* food/ingredient OK?" — label/ingredient literacy ("Is sourdough okay…?" L92; Crystal Light maltodextrin L125).

| Pain point | Addressed by (feature/copy + file ref) | Strength | Risk notes |
|---|---|---|---|
| T10 Is this food OK? | Core check → decision card (verdict + reason + swap + adjustment) `components/result-card.tsx:62-118`; qualitative-only enforced `lib/revora/prompt.ts:44-49`; Pantry Review for whole-kitchen triage `app/pantry/page.tsx:44-78` | **Strong** | The product's tightest fit; stays inside the boundary. |
| T4 Overwhelm / conflicting advice | One calm verdict — "one reason, one adjustment, one safer swap, never a number" `app/onboarding/page.tsx:120-125`; guided first-check chips `:255-281`; "When we're unsure, we say so" `app/page.tsx:31-35` | **Strong** | One-answer framing directly counters advice overload. |
| T2 Guilt / all-or-nothing | "Enjoy it anyway" keep-most on MODERATE/HIGH only `lib/revora/coach-outputs.ts:38-52` + `result-card.tsx:75-79`; SAFE gets no homework `:42-46`; "You don't need a perfect week — you need a next meal" `lib/coach/bai.ts:143-147`; "No streak guilt, no repeats" `components/nudge-opt-in.tsx:117-119` | **Strong** | Tone deliberately shame-free, permission-first. |
| T5 Convenience pressure | Photo + voice input lower friction `components/food-check-form.tsx:302-331`; one-tap re-check `app/history/page.tsx:53-60` | Partial | Input friction reduced; no quick/on-the-go meal-idea output — swaps are tweaks, not recipes. |
| T6 Confusing labs / doctor distrust | Deliberately out of scope: A1C prediction/diagnosis banned `claims-boundary.md:38-43`; out-of-range A1C routed to clinician `app/onboarding/page.tsx:16-19,73-81`; honest limit "Only a blood test…" `app/how-it-works/page.tsx:91-98` | **Deliberately out of scope** | Limitation, not gap — handled honestly; the redirect is to the very party some users distrust. |
| T8 Travel / vigilance fatigue | Keep-most copy helps at the margin (`coach-outputs.ts:38-39`) | Partial | No "mental break" mode; per-meal checking inherently conflicts with the wish to stop thinking for a week. |
| T1 Individual carb reactions | Verdict is population-level (food + A1C band) `lib/revora/prompt.ts:52-60`; CGM-style individualization banned `claims-boundary.md:26,38-40` | Partial → **structural limitation** | **The #1 theme by volume, and Revora structurally cannot meet it** (correctly, per boundary). ⚠ Contradiction risk: the onboarding hero-check and demo both label **oatmeal "Be careful"** (`onboarding:255-281`, `components/demo-check-card.tsx:15-31`) while the audience's lead quotes are people who tolerate oats and react to rice/pasta — the flagship example can contradict a user's lived experience. Frame honestly ("general guidance, not your personal response") so the verdict isn't read as personalized prediction. |
| T7 Boredom with safe meals | `repeat_meal` insight frames a go-to positively `lib/coach/insights.ts:106-109` | Not addressed | Reframes repetition; no variety/recipe surface exists. |
| T3 Fear-of-food / orthorexia-adjacent | No feature; calm tone helps marginally; precheck has no anxiety/ED path `lib/revora/input-precheck.ts:52,147-160` | **Not addressed — risk** | ⚠ HIGH/"Hold off" verdicts to an already food-fearful user can reinforce restriction. No screening, no de-escalation, no "food is not the enemy" off-ramp. |
| T9 Underweight / ARFID nuance | Onboarding collects A1C only `app/onboarding/page.tsx:162-209`; no weight/ED context or guardrail | **Not addressed — risk** | ⚠ Carb-restriction swaps are counter-indicated for underweight/ARFID users; the app cannot detect them. |

**Overpromise flags:** (1) the onboarding "Reversal…" line — see BUG-05 (the one boundary violation risk found; everything else clean). (2) `/how-it-works` "29% reduction in post-meal glucose spikes" — cited-study framing with hedging; awareness only. No CGM-replacement or glucose-prediction implications found anywhere in `marketing/`, landing, or onboarding.

**Cross-cutting recommendation:** T3 + T9 are the most consequential *safety* gaps — populations for whom the core "hold off" output can be actively harmful, with zero detection or de-escalation. At minimum, consider an ED-aware line in onboarding/results (counsel + clinical input; deliberately not implemented in this audit).

---

## 6. Recommended next actions

### Human-only (ordered — these gate everything)

1. **Fix `UPSTASH_REDIS_REST_URL` in Vercel production** (use the `https://…upstash.io` REST URL, not the TCP `rediss://` URL; confirm token pairs with it) and redeploy → restores `/api/check` immediately (BUG-01). Verify with a live POST, not `/api/health`.
2. **Decide the D5 question, then fix the deploy pipeline** (BUG-02 + BUG-10): either accept shipping D5 with its §6.3.4 gates unmet (owner green-light recorded), or gate/revert it first. Then connect the Vercel project to GitHub `main` (or `vercel --prod` from a clean `7727a31` checkout) and confirm the deployed commit in the dashboard.
3. **Stand up the schedulers** (BUG-03): provision the Railway `hourly-crons` service (curl `/api/cron/{nudge,pantry-sweep,trial-precharge}` hourly with `CRON_SECRET`, per `docs/runbooks/price-test.md:158-166`) — or move the crons back to Vercel on a Pro plan; investigate why `bai-weekly` never fired (cron enabled? `CRON_SECRET` set?). Exit criterion: `/api/health` crons all `ok` (launch-checklist §3).
4. **Stripe dashboard** (read-only audit found products/prices live): configure the production webhook endpoint + `STRIPE_WEBHOOK_SECRET` (H21; blocked on final domain), Billing Portal config (H20), map the three price IDs + `TRIAL_PRICE_VARIANT` into Vercel env (H22), create the test-mode mirror for QA (H23), confirm API version ≥ basil (H24).
5. **Counsel:** adjudicate the "Reversal…" onboarding line (Q8 / BUG-05 — remove, rewrite, or sign off and ledger it), consent wording, `/terms` placeholders, SaMD Q9 (imaging) if D5 ships, and the `/how-it-works` numeric citations.
6. **Domain + env provisioning:** buy/configure the real domain (BUG-06), `NEXT_PUBLIC_APP_URL`, Resend sending domain, Umami, Sentry DSN + live canary, rotate the leaked Resend/Upstash keys (H1 in `human-actions-required.md`), Vercel plan decision (NOTE-2).
7. **Only after 1–6:** run the DoR live walkthrough (Task 8.2: real card → trial → test-clock → pre-charge email → one-tap cancel → conversion) on preview with Stripe test mode, then **flip `PAYWALL_MODE=trial` in Vercel** (BUG-04) — and re-check the landing "No login is required" copy at that moment. Commission the domain-reviewer gold labels (BUG-09) and, if D5 stays, the dietitian-graded 100-meal eval + committed `labels.json` (BUG-10).
8. Longer lead: Play chain per `docs/ops/launch-checklist.md` §4–§8 (keystore, `.aab`, assetlinks from the real SHA-256, device QA with license tester, Data Safety, staged rollout), support inbox + uptime monitor + on-call owner.

### Engineering work (small, high-leverage; none block on humans)

1. Middleware resilience (BUG-01 hardening): wrap `createRateLimitDeps()` in try/catch so an invalid env fails closed with the designed 503 instead of a platform 500; validate URL scheme in `isRateLimitConfigured()`; surface a distinct health state (BUG-07).
2. Claims CI: add the numeric banned-families (mg/dL, GI/GL, % glucose) to `claims-boundary-copy.test.ts`; add the new photo/disclaimer components to COPY_FILES (BUG-08).
3. Small fixes: SW icon path (BUG-16); dedupe `demo-check-card` disclaimer + investigate the transient duplicate (BUG-13); `charge.refunded` handling for subscriptions or a documented policy (BUG-17); photo-draft 502→4xx shape (BUG-12).
4. Docs: append the two §3.4 correction notes; fix the four "Vercel hourly cron" doc-drift spots; add `PAYWALL_MODE` + `MEAL_EXTRACT_STUB` to `env-reference.md`; add `pantry_orders.email` to the data-flow allowlist (BUG-18, BUG-19).
5. Test-infra: run gates in CI (or a faster box); consider raising PGlite hook timeout / sharding, and a `dev` script in package.json (BUG-11, BUG-14, BUG-15).

---

## 7. Audit self-check

- Every Part 1 verdict cites `file:line` or a command observation — none rely on a plan's self-report; where an agent's reading conflicted (Plan #3 vs photo-assist on D5), the commit-level evidence governs and the conflict is disclosed (§3.3 note).
- Test claims carry pass/fail counts (§2), including the unflattering full-suite numbers alongside isolation results.
- Every `UNVERIFIABLE`/`BLOCKED-HUMAN` names what is needed and who: Vercel dashboard (env values, deploy source), Railway console (cron service, DB row spot-check), Stripe dashboard (webhooks, portal, env mapping), OpenAI dashboard (hard cap), counsel (Q1–Q10), domain reviewer (gold labels), dietitian (D5 eval), owner (D5 green-light, deploy approvals), physical Android device (Play QA).
- No Stripe object was created or modified; no deploy, push, Play submission, or real email occurred; live-spend evals were not run; safety-frozen files untouched; zero source files changed.
- Executive-verdict blockers trace to BUG-01, BUG-02, BUG-03 (with BUG-04, BUG-05 named as the next two).

---

## 8. Fix-status appendix (2026-07-06 evening remediation session)

All engineering fixes landed on `main` in commits `6de7f7c` (BUG-01/05/07/08/12/13/16/17/18/19 + test-infra 11/14/15/20) and `90ff285` (D5 launch gate), and `main` was deployed to production (`revora-4g5jisfav`, aliased to `revora-lovat.vercel.app`). Verified live after deploy:

| ID | Status | Live evidence / notes |
|---|---|---|
| BUG-01 | **Mitigated in code; env value still owner** | Middleware never 500s: prod `POST /api/check` now returns the designed calm 503 JSON (fail-closed) instead of `MIDDLEWARE_INVOCATION_FAILED`. `createRateLimitDeps` validates the `https://` REST scheme and never throws. **Owner:** replace `UPSTASH_REDIS_REST_URL` in Vercel prod with the `https://…upstash.io` REST URL (Upstash console) and redeploy — value is Sensitive, unreadable via CLI. |
| BUG-02 | **Fixed + root-caused** | The stale build was a **manually pinned alias**: `revora-lovat.vercel.app` was aliased to an old deployment and never moved on deploy (the auto aliases `revora-tkiros-projects.vercel.app` did move). Re-pointed via `vercel alias set`. ⚠ After every `vercel deploy --prod`, re-run `vercel alias set <new-deployment> revora-lovat.vercel.app` — or retire the pinned alias / add the real domain (BUG-06). Also: the project has **no Git integration** (all `VERCEL_GIT_*` empty) — connecting GitHub would remove this whole failure class. Local `.env` is bundled into CLI deploys (build log: "Environments: .env") — add a `.vercelignore` or rely on dashboard env only. |
| BUG-03 | **Fixed** | Root cause: the Railway `hourly-crons` service (schedule `0 * * * *`, image `curlimages/curl`, `APP_URL` + `CRON_SECRET` set) had **no start command** — every tick ran bare `curl` and errored. Start command set via `railway environment edit`; new deployment `3871a40b` built. All four cron endpoints manually triggered with the bearer (200s, per runbook): `/api/health` crons now all `ok`, including this Monday's missed `bai-weekly`. Auto-cadence to be confirmed at the next top-of-hour tick. |
| BUG-04 | **Documented; flip is deliberate** | `PAYWALL_MODE` absent from Vercel prod env (legacy confirmed). Env row added to `env-reference.md`. Flip to `trial` only after §6 items 1–6 + DoR live walkthrough. |
| BUG-05 | **Fixed (removal)** | "Reversal…" line removed from `/onboarding` (verified gone in prod), CI carve-out deleted, onboarding added to COPY_FILES, `Rejected` ledger row records the counsel-Q8 restore path. |
| BUG-06 | Owner | Still no domain (`vercel domains ls` = 0). |
| BUG-07 | **Fixed** | Prod `/api/health` now reports `upstash:"invalid"` during exactly this misconfig — wire the uptime alert to anything ≠ `configured`. A synthetic `/api/check` probe remains recommended. |
| BUG-08 | **Fixed** | Numeric families (mg/dL, GI/GL-with-number, glucose-percent) added to claims CI; `/how-it-works` citation block exempted for the percent family only; photo/disclaimer surfaces added to COPY_FILES. |
| BUG-09 | Owner (domain reviewer) | Unchanged — gold labels needed. |
| BUG-10 | **Gated** | `NEXT_PUBLIC_PHOTO_INPUT` (default off in production; `lib/photo-input-flag.ts`) hides the photo button and 404s `/api/check/photo-draft` in prod. D5 is no longer shipped-past-gates; set the flag to `1` only after §6.3.4 gates clear. |
| BUG-11/14/15 | **Fixed** | vitest testTimeout 60s / hookTimeout 120s; `.next/dev` excluded from typecheck; Playwright webServer timeout 240s. Full vitest: 660 passed, 4 load-induced timeouts that pass standalone (environmental — CI still recommended). |
| BUG-12 | **Fixed** | Photo-draft model failure → 200 + `kind:"retry"` (mirrors `/api/check`). |
| BUG-13 | **Fixed (dedupe)** | `demo-check-card` uses shared `DisclaimerLine`. Duplicate-disclaimer flake not reproducible from code (all render paths mutually exclusive); watch under CI. |
| BUG-16 | **Fixed** | SW icon paths corrected; pwa-assets test now pins every SW asset path to `public/`. |
| BUG-17 | **Fixed** | Full `charge.refunded` on a subscription invoice → status `refunded` → premium drops immediately; policy in `docs/adr/billing.md`. |
| BUG-18/19 | **Fixed** | Data-flow allowlist row; cron doc drift (4 files); env-reference rows (`PAYWALL_MODE`, `TRIAL_PRICE_VARIANT`, price IDs, `MEAL_EXTRACT_STUB`, `REVORA_DAILY_CHECK_CAP`, `NEXT_PUBLIC_WAITLIST_URL`, `NEXT_PUBLIC_PHOTO_INPUT`); §3.4 correction notes appended to both plans; health-route comment. |
| BUG-20 | Owner | Local `.env*` remains permission-blocked to agents; reconcile against `env-reference.md`. |

**New findings this session:** Vercel prod env is **missing** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `AUTH_EMAIL_FROM`, `EDGE_CONFIG`, `SENTRY_DSN`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `SUPPORT_EMAIL` — checkout, webhooks, magic-link email, kill-switch, error capture, and push cannot work in production until these are added (Stripe MCP cannot read webhook endpoints; configure in dashboard, H21).
