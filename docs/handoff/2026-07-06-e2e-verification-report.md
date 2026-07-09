# Revora — End-to-End Verification Report (2026-07-06, evening session)

Part A of `docs/handoff/2026-07-06-e2e-verification-and-painpoint-feasibility-master-prompt.md`.
Companion report: `docs/handoff/2026-07-06-painpoint-feasibility-report.md` (Part B).

- **Repo:** `/home/tefera/Desktop/Revora`, branch `main` @ `4a22f0c`, working tree carrying only untracked docs + this session's reports.
- **Baseline re-verified, not trusted:** every §1 claim of the master prompt was re-checked with fresh commands this session; drift from the prior session's state is itself reported below.
- **Constraint compliance:** no deploys, no pushes, no Stripe writes, no real emails, no live-spend eval runs, no Edge Config mutation, safety-frozen files untouched. Total real model-bound requests issued: 3 (1 prod, 2 local; all returned the calm `retry` fallback — see §4.1). The only files written are the two commissioned reports.

---

## 1. Executive verdict

**Conditionally — and the condition is a single owner action.** The app is *not* ready for real paying users **today** because the core product answer — the food verdict — cannot be produced: the OpenAI account remains on a minimal/trial tier (no real billing), so every real check in production returns the calm `retry` fallback (re-verified live this session: HTTP 200 in 2.7 s, correct copy, verbatim disclaimer). **Fix = fund the OpenAI account and raise the tier (platform.openai.com → Billing). No code change is needed or appropriate.** Everything else on the critical path was verified working in production this session: all pages 200, health fully green (`upstash:"configured"`, `db:"ok"`, all four crons `ok` — the prior session's three ops blockers stayed fixed), disclaimers server-rendered on every surface and carried on every API response kind, the banned "Reversal…" line gone, D5 photo-assist correctly dormant (`photo-draft` → 404), claims greps clean, PWA assets served.

Second-order (does not block first users, blocks *safe shipping velocity*): **both local release gates are red on `main`** — `npx vitest run` fails 2 tests deterministically (stale health-payload expectations, NEW-01) and the Playwright smoke suite fails ~20 Mobile Chrome tests from a single test-infra root cause (first-run-gate race, NEW-02). Neither is a user-facing defect; both mean "green gates" cannot currently be demanded before the next deploy. Pending human actions unchanged: DNS `A revora.bio → 76.76.21.21`, `PAYWALL_MODE` flip (deliberately dormant), counsel items, OpenAI billing.

---

## 2. Architecture map

*(Surveyed read-only by a dedicated mapping agent this session; line refs spot-verified against the live tree — one corrected below.)*

**Entry points (App Router).** Pages: `app/page.tsx` (home/check), `demo`, `how-it-works`, `onboarding` (first-run tour; step machine `app/onboarding/page.tsx:21`), `welcome`, `history`, `progress`, `account`(+`/delete`), `report/[id]`, `subscribe`, `signin`(+`/check-email`), `trial/started`, `canceled`, `get-the-app`, `privacy`, `terms`, `pantry`(+`intake/claim/thanks`), `admin/pantry`. API — check: `api/check`, `api/check/photo-draft` · billing: `api/billing/{cancel,stripe/{checkout,pantry-checkout,portal,webhook},play/{verify,rtdn}}` · auth: `api/auth/[...nextauth]`, `api/auth/reviewer-signin` · user: `api/{profile,history,history/{action,migrate},account/delete,entitlement,paywall,trial/start,push/subscribe}` · coach: `api/coach` · pantry: `api/pantry/{upload,submit,process,confirm}`, `api/admin/pantry` · cron: `api/cron/{bai-weekly,nudge,pantry-sweep,trial-precharge}` · ops: `api/health`.

**Check pipeline (the spine).**
- *Gate 1 (edge), `middleware.ts`* — matcher `["/api/check","/api/check/photo-draft"]` (`middleware.ts:129`). Order: kill-switch → rate limit, all **before model spend**. Kill-switch via Edge Config `launch_mode` (`lib/revora/launch-controls.ts:54,84`; `paused`→503). Rate limit `evaluateRateLimit()` (`rate-limit.ts:26`: per-IP sliding window + global daily cap on Upstash; `daily_cap`→429 + Retry-After). **Fails closed** (calm 503) on public deploys without/with-invalid Upstash (`middleware.ts:90`, post-BUG-01 hardening); fails open only on transient Redis errors.
- *Gate 2 (route), `app/api/check/route.ts`* (`maxDuration=15`) — deterministic A1C routing short-circuits out-of-scope with approved wording, no spend; paywall: `trial` = hard 402 wall (`:110`), `legacy` = `countChecksToday >= FREE_DAILY_CHECKS(5)` → 402 (`:126-150`); guests metered by IP only.
- *Engine, `lib/revora/service.ts:checkFood()`* — `CheckRequestSchema` validate → `routeA1C()` (`a1c.ts`) → `classifyInputBeforeModel()` (not_food/clarify pre-model) → `buildRevoraPrompt()` → single OpenAI Responses attempt (`MAX_MODEL_ATTEMPTS=1` `service.ts:30`; client: `store:false`, `timeout:10s`, `maxRetries:0`) → `postprocessModelOutput()` (`assertOneSentence`, `assertNoUnsafeSafeFields`, `applyConservativeFloors`); error → scrubbed capture → calm `retry`.
- *Disclaimer* — server-attached only (`prompt.ts:50` instructs the model to omit it); every response schema carries it (`schemas.ts:165+`, set at `postprocess.ts:80`); pause/rate-limit paths inject it too.
- *Persist* — signed-in + `result` kind only, fail-soft: `foodCiphertext: encryptField(food)` (`route.ts:241`) + coarse fields, `onConflictDoNothing`.
- **Safety-frozen:** `postprocess.ts`, `service.ts`, `prompt.ts`, `schemas.ts`, `a1c.ts` — untouched this session.

**Billing/entitlement.** `lib/server/pricing.ts:24` `paywallMode()` = `legacy` unless `PAYWALL_MODE="trial"` (prod runs legacy today); variants 999/1299/1999 single-sourced (`:2,:12`). `app/api/billing/handlers.ts` factories (checkout, email-first trial w/ `trial_period_days:7` card-gated, webhook 5 events incl. `charge.refunded`→`refunded` post-BUG-17, one-tap HMAC cancel). `lib/server/entitlement.ts:38` `getEntitlement()` verify-on-read heals stale Play, fails toward free; `PREMIUM_STATUSES` incl. `trialing/grace/canceled`-until-period-end (`:36`); `FREE_DAILY_CHECKS=5` (`:13`).

**Auth/session/DB.** Auth.js v5 Resend magic link, `DrizzleAdapter` (`auth.ts:20`), **database** sessions (`:32`), adapter mounted only when `DATABASE_URL` set; route-level gating via `lib/server/session.ts:8` (401 without session); reviewer bypass hard-404s in prod. Postgres (Railway) via drizzle (`lib/server/db/schema.ts`): `users`(25), `accounts`(36), `sessions`(58), `verificationTokens`(66), `profiles`(78, exact A1C **ciphertext**), `checks`(93, food **ciphertext**, coarse risk/band/inputMethod), `pushSubscriptions`(128), `subscriptions`(142), `baiWeekly`(179), `deletionLog`(203, sha256 only), `cronHeartbeat`(214), `pantryOrders`(238)/`pantryPhotos`(297)/`pantryItems`(323, report items ciphertext); migrations `drizzle/0000..0002` (additive pattern).

**Coach/insights/BAI.** Pure rules over `StoredCheck[]` — no model, no numbers (`lib/coach/insights.ts:39`, `bai.ts:58,99,127`, `compute.ts:29`); guest data device-local (`lib/client/history-store.ts`, the designed guest→server seam); `coach-outputs.ts` feeds keepMost/sequencing into the check response.

**Crons (hybrid).** `vercel.json`: only `bai-weekly` `30 4 * * 1`. Railway `hourly-crons`: `nudge`, `pantry-sweep`, `trial-precharge`. All bearer-gated (`CRON_SECRET`→401), heartbeats → `cronHeartbeat` → `/api/health` (all four `ok` in prod this session).

**PWA.** `public/sw.js` (`revora-v1`, precaches `offline.html` **with disclaimer**, no `clients.claim()` — WebKit hang avoidance, push w/ tag dedupe + corrected icon paths), `manifest.webmanifest` standalone + 192/512/maskable, `components/sw-register.tsx`.

**Photo-assist (D5).** `lib/photo-input-flag.ts`: on unless production without `NEXT_PUBLIC_PHOTO_INPUT=1` — one variable, two enforcement points (client button build-time; `photo-draft/route.ts:62` request-time 404), verified live both ways this session. Extractor `lib/meal/photo-extract.ts` transcribe-only (no verdict field, `store:false`, `MAX_DRAFT_ITEMS=20`, no photo persistence anywhere).

**Trust boundaries.** AES-256-GCM `lib/server/crypto.ts:36,50` (`HEALTH_DATA_KEY`, iv‖tag‖ct) for food + exact A1C; claims boundary CI (`claims-boundary-copy.test.ts`: banned families `:14` incl. numeric post-BUG-08, over 48 COPY_FILES `:65`); Sentry scrub `sentry-scrub.ts:19` as last line before egress; rate-limit + kill-switch ahead of all model spend; owner-scoped decrypt on history reads; OpenAI dashboard cap is the true cost ceiling.

---

## 3. Environments + static verification

### Environments tested

| Env | URL / port | Commit | How reached | Notes |
|---|---|---|---|---|
| local dev | `http://127.0.0.1:3100` | `4a22f0c` + tree | `PORT=3100 npm run dev` (a `dev` script now exists — BUG-11 follow-up landed) | Degraded: `db:"unconfigured"` (no `DATABASE_URL`), Auth.js `MissingSecret`, OpenAI starved → real checks fall back to `retry`. **Drift from audit:** local `/api/health` now shows `upstash:"configured"` (the §9 provisioning session evidently fixed the local `.env` too). `.env*` files remain permission-blocked to this session — env facts are behavioral only. |
| local Playwright | `127.0.0.1:3100` (legacy) + `:3101` (trial) | `4a22f0c` | Playwright-managed webServers (`reuseExistingServer:false`) | Mobile Chrome project only (WebKit-under-load is a known env flake per the audit; excluded deliberately). |
| production | `https://revora-lovat.vercel.app` | current `main` (behavioral evidence: disclaimer footers server-rendered on `/history`+`/progress` [post-`20839d6`], `photo-draft` 404s [post-`90ff285` gate], health payload carries `pantrySweep`/`trialPrecharge` [post-`cdbaae8`]) — exact deployment ID needs the Vercel dashboard | `curl` (read-only GETs + 1 check POST) | Health: `ok:true, launch:"ready", upstash:"configured", db:"ok"`, crons all `ok`. |

### Static verification (all local, `4a22f0c`)

| Suite | Result | Notes |
|---|---|---|
| `npm run typecheck` | **PASS — exit 0, 0 errors** (clean run) | First run of the session printed TS1005 syntax errors from a stale generated `.next/dev/types/routes.d.ts`. Root cause: BUG-14's fix (`tsconfig.json:39` excludes `.next/dev`) is bypassed because `next-env.d.ts:3` *imports* that file — imports ignore `exclude`. `rm -rf .next/dev/types` → clean. NEW-03 below. |
| `npx vitest run` (full, offline) | **2 failed / 663 passed / 2 skipped (667 tests, 90 files, 270 s)** | The 2 failures are **deterministic, not environmental** — they fail identically in isolation (2 failed / 2 passed in 2.4 s). NEW-01 below. Zero PGlite hook-timeout failures this run (the BUG-11 timeout raises are holding). |
| `REVORA_LIVE_EVAL=0 npm run eval:revora` | **PASS 8/8** (16 s) | Fixture-driven; confirmed offline (env flag pinned; no model calls in output). |
| `npx playwright test --project="Mobile Chrome"` (full smoke) | **20 failed / 1 flaky / 6 skipped / 39 passed (66, 6.4 m)** | The 6 skips are the DB-gated `auth.spec`/`pantry.spec` (no `DATABASE_URL` on this box — magic-link and pantry E2E remain unverifiable locally). The 20 failures share **one root cause**, confirmed by isolation re-runs: NEW-02 below. Passed even under this: `trial-wall` (Day-2 hard wall), `onboarding`, `photo-check`, `pwa-assets`, `progress`, `nudge-opt-in`, most of `a11y`. |

---

## 4. Flow-by-flow results

Legend: **PASS** (verified this session, evidence cited) · **PASS (audit)** (verified at code/test level; runtime re-check not possible this session) · **BLOCKED** (named blocker) · **NOT EXERCISED** (deliberate, reason given).

### 4.1 Core check

- **Real verdict (prod):** **BLOCKED (OpenAI billing)** — `POST https://revora-lovat.vercel.app/api/check` `{"food":"buttered toast","a1c":6.0}` → HTTP 200, `kind:"retry"`, calm copy, **verbatim ledger disclaimer**, 2.7 s. Exactly the documented tier-0 failure mode (fast 429 inside the service → fallback). The fallback itself is correct and safe. 1 request issued; the limiter was not hammered.
- **Real verdict (local):** **BLOCKED (same account)** — 2 local checks (`grilled chicken salad…`, non-food probe) → `retry` in <2 s; telemetry line `{"name":"check_completed","responseKind":"retry","latencyBucket":"<2s"}` — **no food text in logs (scrub holds)**. The master prompt's "funded key if you have one" branch does not apply: no funded key exists.
- **Deterministic routes (local, no spend): PASS** — malformed body → 200 `retry` with input guidance + disclaimer; A1C 5.0 → `out_of_scope`/`below_prediabetes_range`; A1C 7.0 → `out_of_scope`/`diabetes_range_out_of_scope` — **both byte-identical to the approved wording in `docs/safety/claims-boundary.md:66-68,78-80`**; disclaimer present on **every** response kind observed (4/4).
- **≤1-clarify contract & no-numbers:** PASS (audit + this session's eval 8/8 + `disclaimer-presence.test.ts` in the green 663; no numeric leak observed on any surface grep — §4.8).
- **Voice → transcript → result:** smoke `voice-input.spec` failed on the NEW-02 race (failure snapshots show the onboarding screen, not a voice defect); voice unit path is in the green 663. **PASS (audit) with NEW-02 caveat.**
- **Photo (D5):** prod `POST /api/check/photo-draft` → **404 (gate working)**. Local (dev = flag-on by `lib/photo-input-flag.ts` `NODE_ENV !== "production"`): `photo-check.spec.ts` **passed** (uncertain-chip confirm gate → textarea handoff → `data-input-method="photo"`).

### 4.2 Onboarding

**PASS** — `onboarding.spec.ts` passed (Mobile Chrome); first-run redirect verified live in this session's failure snapshots (the gate fires reliably — ironically proven by NEW-02); A1C captured once (`app/onboarding/page.tsx:38-41` skips the step when a profile exists) and prefilled thereafter; prod `/onboarding` HTML greps clean of "reversal" (BUG-05 removal holding in prod).

### 4.3 Taster → trial → paywall

- **Day-2 hard wall (trial mode, :3101):** **PASS** — `trial-wall.spec.ts` passed both scenarios files this run.
- **Prod mode:** `/subscribe` serves **legacy** copy ("Free keeps working: five checks a day… $12.99/mo") — **deliberate** (`PAYWALL_MODE` unset → legacy, per BUG-04 documentation; flip is gated on the §6 human sequence in the audit).
- **Trial checkout / pre-charge email / one-tap cancel / `/canceled`:** **NOT EXERCISED live** — requires the Stripe **test-mode mirror** (audit H23, still not provisioned) + a local `DATABASE_URL`; running against the live key would create real Stripe objects (banned). Code+webhook chain remains PASS (audit) — `handlers.ts` trial lifecycle, HMAC cancel token, precharge cron (heartbeat now `ok` in prod health).

### 4.4 Pantry Review

Landing 200 with server-rendered disclaimer; post-verdict entry gated to non-SAFE (`components/result-card.tsx:10-15,120-128`, in the green 663). In-app purchase + intake + report: **NOT EXERCISED live** (same test-mode/DB constraint as 4.3); `pantry.spec` self-skipped. Fulfillment cron now `ok` in prod health (was `never` at audit time).

### 4.5 Account / auth / history migration

`auth.spec` self-skips without `DATABASE_URL` → magic-link, `/welcome`, profile CRUD, guest→server migration are **PASS (audit, code+tests)** only; the 663 green include `history-routes`, `check-persistence`, `privacy-stateful`. **Encrypted-at-rest spot-check of a real prod DB row: UNVERIFIABLE this session** (no prod `DATABASE_URL` access) — remains the standing owner action; schema stores only `*_ciphertext` columns for food/exact-A1C and PGlite round-trip tests pass.

### 4.6 Daily loop / history / streaks / insights / BAI

`progress.spec` + `nudge-opt-in.spec` passed; `daily-loop.spec` failures are NEW-02-signature (onboarding screen in snapshot), one of its tests passed in isolation re-run. BAI/insights copy inside boundary per grep + the green claims tests. Prod `/history`, `/progress` render the shared disclaimer footer (server HTML grep = 1 each).

### 4.7 Error / edge states

- Rate-limited 429 + Retry-After: **PASS (audit/tests)**; not hammered in prod deliberately.
- Provider timeout → calm retry: **PASS — observed live 3×** (that *is* the current prod steady-state, §4.1).
- Offline PWA fallback incl. disclaimer: `offline.html` served (200) and contains the disclaimer (`offline.html:56-59`); `pwa-assets.spec` passed incl. the BUG-16 icon-path pin.
- Paused / kill-switch: **NOT EXERCISED** — flipping `launch_mode` would mutate the **shared production Edge Config**; declined on safety grounds. The pause path is covered by `launch-controls.spec` stubs (failed this run on NEW-02, passed in the audit's run) + unit tests in the green 663.
- Malformed / non-food / out-of-scope: §4.1 PASS.
- Expired session / canceled subscriber: **PASS (audit)** — `entitlement.ts:57-60,100` lapse logic unit-tested; not runtime-exercisable without DB.

### 4.8 Cross-cutting

- **Claims surface greps (prod, this session): CLEAN** — `/`, `/onboarding`, `/subscribe`, `/pantry`, `/how-it-works`, `/demo` show zero hits for mg/dL, numeric GI, reverse/reversal, diagnos-, cure, guarantee.
- **A11y:** `a11y.spec` passed except the error/status-surface test (NEW-02 signature). Manual keyboard/SR pass remains human.
- **PWA installability:** manifest + sw.js + icons + offline all 200 in prod.
- **Sentry:** scrub verified at code/test level (`sentry-scrub`, `privacy-stateful` in the green 663) and behaviorally (no food text in local telemetry). **Live prod canary NOT EXERCISED** (forcing a prod error = state change; DSN value unreadable).
- **Debt sweep: CLEAN** — 0 TODO/FIXME/HACK/XXX in `app/ lib/ components/ middleware.ts`; 2 `console.*` calls (both bounded-enum telemetry); `NEXT_PUBLIC_*` = APP_URL, PHOTO_INPUT, REVIEWER_MODE, UMAMI×2, VAPID_PUBLIC_KEY, WAITLIST_URL — nothing secret-sounding.
- `/api/health` (prod): fully green, including all four cron heartbeats — **first session in which this is true.**

---

## 5. Bug / issue list (blockers first)

| ID | Area | Severity | Repro steps | Expected vs actual | Evidence |
|---|---|---|---|---|---|
| **BLOCKER-OPENAI** (carried, re-verified) | Prod core answer | **blocker** | `POST https://revora-lovat.vercel.app/api/check` with any real food | SAFE/MODERATE/HIGH verdict; actual: calm `retry` fallback on every real model call | This session: HTTP 200 `kind:"retry"` in 2.7 s (prod) and <2 s ×2 (local). Root cause unchanged from `4a22f0c` docs: OpenAI tier-0 (50 req/100k tok per ~6 h, no billing). **Owner-only fix: fund account + raise tier. Do not code around it.** |
| NEW-01 | Release gate (vitest) | **major** | `npx vitest run tests/unit/revora/env.test.ts` | 4/4 pass; actual **2 failed / 2 passed — deterministic, in isolation** | Health payload now includes `crons.pantrySweep` + `crons.trialPrecharge` (added `cdbaae8`, `app/api/health/route.ts`) but the test's `toEqual` expectations were never updated (last touched `3706dbf`). `npm test` is red on `main`; any "all tests green" release claim is currently false. Fix: update the two expectation objects (test-only change). |
| NEW-02 | Release gate (smoke) | **major** | `npx playwright test tests/smoke/mobile-check.spec.ts --project="Mobile Chrome"` | Suite green; actual 20/66 fail across 6 files — **single root cause, test-infra** | Every failure snapshot (14/14 checked) shows the onboarding welcome screen: specs `goto("/")` in a virgin context with **no first-run-gate bypass** (no profile seed, no `?stay=1` — `grep beforeEach\|addInitScript` finds one usage in one test) and race the client redirect (`components/first-run-gate.tsx:24-38`). Audit-era passes were the lucky side of the same race (cold `/onboarding` compile made the redirect slow). Not user-facing: the redirect fires pre-typing for humans and never fires post-onboarding. Fix: shared helper seeding `profileStore`/history via `addInitScript` (or `?stay=1`) in the affected specs. |
| NEW-03 | Typecheck determinism | minor | Leave a stale/mid-write `.next/dev/types/routes.d.ts`, run `npm run typecheck` | Deterministic pass; actual: TS1005 parse errors from the generated file | BUG-14's `tsconfig.json:39` exclude is bypassed by `next-env.d.ts:3` (`import "./.next/dev/types/routes.d.ts"` — imports ignore `exclude`). Empirically confirmed both ways this session (probe file in that dir *is* excluded; the imported `routes.d.ts` is not). Fix: guard CI with a `.next` clean, or drop the import via Next config typegen options. |
| NEW-04 | Prod deploy provenance | minor (process) | — | Report states the exact prod commit; actual: inferable only behaviorally | Prod serves current `main` by three independent behavioral markers (§3 environments table) but the deployment→commit mapping needs the Vercel dashboard (CLI `vercel inspect` not run against a fresh deploy this session). With GitHub now connected (§8 audit), future sessions should read `VERCEL_GIT_COMMIT_SHA` from the deployment. |
| NEW-05 | Legal page in prod | **major** (launch-gating with real users) | `curl https://revora-lovat.vercel.app/terms` | Complete terms; actual: two bracketed placeholders render publicly — "[Revora's operating entity — counsel to confirm]" and "[Governing law/venue — counsel to confirm]" (each ×2 in the HTML) | Verified live this session. Known counsel item, but now confirmed **user-visible in production** — must clear before charging anyone. Owner/counsel action. |
| CARRIED | Various | — | — | Still open from the audit, re-confirmed unchanged where observable: BUG-06 (no custom domain — DNS `A` record pending), BUG-04 (`PAYWALL_MODE=legacy`, deliberate), BUG-09 (gold labels — eval band-accuracy sub-gate dormant), BUG-10 gates (D5 §6.3.4 unmet; flag correctly off in prod), counsel items (Q8/Q9), H23 (no Stripe test-mode mirror — blocks checkout QA, §4.3/4.4), prod DB row ciphertext spot-check (owner), Sentry live canary (owner) | This session's probes: photo-draft 404 (gate on), subscribe legacy copy live. |

**Nothing was fixed inline** — including the one-line NEW-01 test fix, left to a reviewed step per the commission.

---

## 6. Self-check (verification-before-completion)

- Every result above names its environment and cites a command observation, `file:line`, or test artifact; test claims carry exact counts (typecheck 0 errors; vitest 2/663/2; eval 8/8; Playwright 20/1/6/39; isolation re-runs 2/2 and 7-failed/3-passed).
- The OpenAI billing blocker is reflected in the §1 verdict and §4.1 as **BLOCKED**, not worked around; total model-bound spend this session: 3 requests against the existing starved account.
- Deliberate non-exercises are named with reasons (Edge Config flip, prod 429 hammering, live Stripe checkout, prod error canary) rather than implied passes; UNVERIFIABLE items name the owner action.
- No deploy, push, Stripe write, email, or Edge Config mutation occurred; safety-frozen files untouched; the only writes are the two commissioned reports.
