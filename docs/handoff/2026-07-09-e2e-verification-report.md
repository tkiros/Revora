# 2026-07-09 End-to-End Verification Report

## Executive Verdict

**Ready for real paying users today: no.**

The app has a coherent architecture, the local mobile smoke path passed, `/api/health` is green in production, and the calm fallback path is working. The launch claim still cannot be made because four gates are not closed with current-run evidence:

1. `.env.example` currently contains real-looking secret values in a dirty tracked file. Do not commit or push until the values are scrubbed and rotated. Evidence: `.env.example:6`, `.env.example:13`, `.env.example:33`, `.env.example:36`, `.env.example:42` by variable name only.
2. The production OpenAI real-answer path was not proven in this run. The prior source-of-truth report says production was blocked by OpenAI billing/quota, and the app is still configured around `OPENAI_API_KEY`. A follow-up local smoke proved the Revora route can return a real result through OpenRouter when the process is launched with `OPENAI_BASE_URL=https://openrouter.ai/api/v1`, `REVORA_MODEL=openai/gpt-4o-mini`, and a temporary OpenRouter key. Evidence: `docs/handoff/2026-07-06-launch-audit-report.md:300-333`, `lib/revora/openai-client.ts:135-144`, follow-up command result below.
3. Photo input is no longer production-gated by default, which drifts from the 2026-07-06 launch-audit state. The route is live and the homepage advertises photo input, but the required gate evidence is not present in the source-of-truth docs read for this run. Evidence: `lib/photo-input-flag.ts:1-12`, live `POST /api/check/photo-draft` returned `400 {"kind":"invalid"}` instead of `404`.
4. The full Vitest suite exits non-zero on this machine under DB/PGlite load: `18 failed | 77 passed | 1 skipped` files and `7 failed | 584 passed | 105 skipped` tests. Representative failures passed in isolation, so this is classified as an environment/load gate, not yet a product defect.

No deployment, push, Stripe write, live checkout, real email, Edge Config write, or intentional live OpenAI spend was performed. Safety-frozen files were read only.

## Architecture Map

- **Entry points:** App Router pages and handlers under `app/`, including `/`, `/onboarding`, `/check`, `/history`, `/welcome`, `/trial/*`, `/pantry/*`, `/profile`, `/api/check`, `/api/check/photo-draft`, `/api/billing/*`, `/api/cron/*`, `/api/health`, and Auth.js routes.
- **Check pipeline:** `middleware.ts` rate-limits `POST /api/check` and `POST /api/check/photo-draft`; `app/api/check/route.ts` validates session, entitlement, and paywall state; `lib/revora/service.ts` runs deterministic prechecks and one model attempt; `lib/revora/openai-client.ts` calls the Responses API with `store:false`, 10s timeout, and no SDK retries.
- **Safety-frozen core:** `lib/revora/postprocess.ts`, `lib/revora/service.ts`, `lib/revora/prompt.ts`, `lib/revora/schemas.ts`, and `lib/revora/a1c.ts` are the core claims-boundary path. They were not modified.
- **Billing and entitlement:** `app/api/billing/handlers.ts`, `app/api/billing/checkout/route.ts`, `app/api/billing/cancel/route.ts`, `lib/server/entitlement.ts`, `lib/server/pricing.ts`, and subscription tables in `lib/server/db/schema.ts`.
- **Auth and session:** `auth.ts`, `lib/server/session.ts`, profile API routes, and Auth.js user/account/session tables in `lib/server/db/schema.ts`.
- **Database and migrations:** `lib/server/db/schema.ts`, `lib/server/db/index.ts`, `lib/server/crypto.ts`, and `drizzle/0000_*` through `0002_*`. Food and A1C data are stored as ciphertext payloads for signed-in users.
- **Coach, insights, BAI, nudges:** routes under `app/api/coach`, `app/api/bai`, `app/api/insights`, `app/api/nudges`, plus server helpers under `lib/server/*`.
- **Crons:** `app/api/cron/bai-weekly`, `app/api/cron/nudge`, `app/api/cron/trial-precharge`, and `app/api/cron/pantry-sweep`; health checks read cron heartbeat rows.
- **PWA:** `public/manifest.webmanifest`, `public/sw.js`, app icons, and smoke coverage for offline shell behavior.
- **Trust boundaries:** guest checks stay local/in-memory; signed-in check/history data is encrypted at rest with AES-256-GCM; rate limiting is at middleware; claims boundary is enforced by prompt/postprocess/copy tests; provider calls must not store raw prompts.

## Environments

| Environment | URL / port | Commit | How reached | Result |
|---|---:|---|---|---|
| Local static | n/a | `e5c7e44b94148777bb482fa5376c31bc2835f111` on `feat/video-engine-slice-1` | shell in `/home/tefera/Desktop/Revora` | typecheck/eval ran locally |
| Local Playwright legacy | `http://127.0.0.1:3100` | same | Playwright `webServer`; escalated because sandbox blocked local listen with `EPERM` | Mobile Chrome smoke passed |
| Local Playwright trial | `http://127.0.0.1:3101` | same | Playwright `webServer` with trial mode | Mobile Chrome smoke passed |
| Production alias | `https://revora-lovat.vercel.app` | not proven from response headers | read-only `curl` | `/api/health` 200 green; non-model fallback path 200 |

## Static Verification

| Command | Exit | Counts / output | Interpretation |
|---|---:|---|---|
| `npm run typecheck` | 0 | `tsc --noEmit`, 0 errors | Pass |
| `npx vitest run` | 1 | Test files: `18 failed | 77 passed | 1 skipped`; tests: `7 failed | 584 passed | 105 skipped`; duration `1088.06s` | Non-zero full-suite gate on this box |
| `npx vitest run tests/unit/server/trial-start.test.ts` | 0 | `1 passed` file, `5 passed` tests | Representative DB failure passed in isolation |
| `npx vitest run tests/unit/server/pantry-schema.test.ts` | 0 | `1 passed` file, `6 passed` tests | Representative DB failure passed in isolation |
| `npx vitest run tests/unit/server/health.test.ts` | 0 | `1 passed` file, `7 passed` tests | Representative DB/health failure passed in isolation |
| `npm run eval:revora` | 0 | `1 passed` file, `8 passed` tests | Offline fixture-driven eval passed; no live OpenAI spend |
| `npx playwright test tests/smoke/mobile-check.spec.ts tests/smoke/onboarding.spec.ts tests/smoke/trial-wall.spec.ts tests/smoke/photo-check.spec.ts --project="Mobile Chrome"` | 0 | `27 passed` | Local mobile smoke passed under legacy and trial servers |
| Direct OpenRouter smoke | 0 | HTTP 200; model `openai/gpt-4o-mini`; content `revora-openrouter-ok`; usage `22` tokens; reported cost `$0.000006` | OpenRouter key and account work |
| Local Revora `/api/check` via OpenRouter | 0 | HTTP 200 result; `risk:"HIGH"` for `oatmeal with banana and peanut butter`, A1C `6.4`; server telemetry `check_completed`, `risk:"HIGH"`, `latencyBucket:"2-5s"` | Revora route can produce a real answer through OpenRouter without code changes |

Playwright notes: Next emitted multiple-lockfile and middleware-deprecation warnings; Auth.js emitted `MissingSecret` logs in local smoke because the local env was not fully provisioned for auth.

## Flow Results

### Core Check

- **Local Mobile Chrome:** core check smoke passed through result rendering. Evidence: Playwright command above, `27 passed`.
- **Production alias:** `POST /api/check` with malformed body returned HTTP 200 and a calm `retry` payload: `"Enter a food or meal description and a numeric A1C value to get a Revora check."` It included the disclaimer. This verifies the non-model fallback path only.
- **Live real food answer:** not executed. The prompt forbids real OpenAI spend, and the prior source-of-truth report identifies OpenAI billing/quota as the remaining production blocker. Evidence: `docs/handoff/2026-07-06-launch-audit-report.md:300-333`, `lib/revora/openai-client.ts:141-144`.
- **OpenRouter follow-up:** a temporary local server on `http://127.0.0.1:3110` was launched with `OPENAI_BASE_URL=https://openrouter.ai/api/v1`, `REVORA_MODEL=openai/gpt-4o-mini`, and the provided OpenRouter key passed through stdin only. `POST /api/check` with `{"food":"oatmeal with banana and peanut butter","a1c":6.4}` returned HTTP 200 with a real `result` payload and the required disclaimer. The temporary server was stopped after the smoke test.
- **Claims contract:** result UI includes the general-guidance disclaimer on result and non-result surfaces. Evidence: `components/result-card.tsx:97-183`, `components/result-card.tsx:211-247`.

### Voice

- Not driven end-to-end in this run. Source path wires transcript text into the same check submit path. Evidence: `components/food-check-form.tsx:230-235`.

### Photo

- **Local Mobile Chrome:** photo-check smoke passed in the selected Playwright run.
- **Production alias:** `POST /api/check/photo-draft` with malformed JSON returned HTTP 400 `{"kind":"invalid"}`. That means the route is active, not production-gated off with 404.
- **Gate drift:** `lib/photo-input-flag.ts:1-12` now defaults photo input on unless `NEXT_PUBLIC_PHOTO_INPUT=0`, citing an owner green-light on 2026-07-07. The required run docs still said D5 was gated off until binding gates cleared. No binding-gate evidence was found in the required source-of-truth docs.

### Onboarding

- **Local Mobile Chrome:** onboarding smoke passed in the selected Playwright run.
- A1C capture is designed to happen once with explicit out-of-scope handling. Evidence: `app/onboarding/page.tsx:99-122`.
- First-check chips and general-guidance copy are present. Evidence: `app/onboarding/page.tsx:287-340`.
- The banned "Reversal..." onboarding line was not found in active onboarding code.

### Taster, Trial, Paywall

- **Local Mobile Chrome:** trial-wall smoke passed under a trial-mode local server.
- Production still needs business-mode confirmation before launch because the prior report said `PAYWALL_MODE=legacy`. This run did not write Stripe objects, run live checkout, or charge a card.
- Entitlement behavior is source-backed in `lib/server/entitlement.ts:13-100`.

### Pantry Review

- Pantry trial-wall smoke coverage passed in the selected Playwright run.
- No live or test purchase was initiated in this run, and no Stripe writes were performed.
- Pantry schema and related server tests passed in isolation after full-suite timeout pressure.

### Account, Auth, Profile, Migration

- Not completed end-to-end in a real auth session during this run.
- Local Playwright emitted Auth.js `MissingSecret` logs, so auth UX cannot be claimed flawless from local smoke alone.
- Source paths exist for session/profile and encrypted persistence. Evidence: `auth.ts`, `lib/server/session.ts`, `lib/server/db/schema.ts:78-126`, `lib/server/crypto.ts:1-69`.

### Daily Loop, History, Streaks, Insights, BAI

- Production `/api/health` returned HTTP 200:
  `{"ok":true,"environment":"production","launch":"ready","launchMode":"normal","upstash":"configured","db":"ok","crons":{"nudge":"ok","baiWeekly":"ok","trialPrecharge":"ok","pantrySweep":"ok"}}`
- This proves the health route and cron heartbeat checks are green, but it does not prove real user data persistence.
- A real DB ciphertext row was not spot-checked because this run had no safe read-only production DB access. Source evidence for encryption is `lib/server/crypto.ts:1-69` and signed-in check persistence in `app/api/check/route.ts:227-267`.

### Error And Edge States

- Malformed production check request returns calm retry with disclaimer.
- Malformed production photo request returns invalid JSON response.
- Local smoke covered mobile check, onboarding, trial wall, and photo behavior.
- Rate-limit 429, provider timeout, Edge Config kill-switch flip, expired session, canceled subscriber check, Sentry forced error, and real offline service-worker installability were not fully driven in production because they require writes, secrets, or controlled live state. Service worker registration was blocked by Playwright in local logs.

### Cross-Cutting

- Mobile viewport smoke: passed in Mobile Chrome.
- Accessibility: no separate axe run was executed in this run.
- PWA: local smoke exercised offline shell behavior, but Playwright blocked service worker registration; no installability audit was completed.
- Sentry scrubbing: no forced live Sentry event was sent. Source privacy posture says telemetry must avoid raw food/A1C text. Evidence: `docs/privacy/data-flow.md`, `lib/revora/telemetry.ts:22`, `lib/server/billing/telemetry.ts:44`.

### Debt Sweep

- `TODO`/`FIXME` sweep found planning/archive/handoff debt but no active `app/`, `lib/`, `components/`, `middleware.ts`, `auth.ts`, or `public/` code TODO/FIXME requiring launch-stop action.
- Sensitive `console.log` sweep found bounded JSON telemetry only: `lib/revora/telemetry.ts:22`, `lib/server/billing/telemetry.ts:44`.
- `NEXT_PUBLIC_` secret-sounding sweep found expected public VAPID usage and docs references, not an active public secret variable in app code.
- `.env.example` contains real-looking secret values by variable name. Do not commit, push, or deploy from this state.

## Issue List

| ID | Area | Severity | Repro steps | Expected vs actual | Evidence |
|---|---|---|---|---|---|
| E2E-01 | Secrets / repo hygiene | blocker | Inspect the dirty `.env.example` changes. | Expected example placeholders only. Actual file contains real-looking values for OpenAI, Upstash, Resend, Upstash API, and Blob tokens. | `.env.example:6`, `.env.example:13`, `.env.example:33`, `.env.example:36`, `.env.example:42`; `git diff -- .env.example` |
| E2E-02 | Core production answer | blocker | Attempt to prove a real production food check without spending OpenAI money; then run a local OpenRouter-backed smoke. | Expected production can return real Clear/Be careful/Hold off answers for paying users. Actual production OpenAI path remains unproven/blocked by prior billing evidence, but local OpenRouter-backed Revora API returned a real result without code changes. | `docs/handoff/2026-07-06-launch-audit-report.md:300-333`; `lib/revora/openai-client.ts:135-144`; live malformed `POST /api/check` HTTP 200 retry; local OpenRouter `/api/check` HTTP 200 result |
| E2E-03 | Photo input launch gate | major | Compare required July 6 source-of-truth docs with current code and live route. | Expected D5 photo input gated off in production until binding gates clear. Actual code defaults it on and production route is active. | `lib/photo-input-flag.ts:1-12`; live `POST /api/check/photo-draft` HTTP 400 invalid; `docs/superpowers/plans/2026-07-06-photo-assist-check-input.md` |
| E2E-04 | Test gate reliability | major | Run `npx vitest run` on this machine. | Expected full unit/integration suite passes or has known skips. Actual full run exits 1 under DB/PGlite load, though representative failures pass in isolation. | Full run: `18 failed | 77 passed | 1 skipped` files, `7 failed | 584 passed | 105 skipped` tests; isolated reruns passed |
| E2E-05 | Auth/account E2E | major | Run local Playwright smoke with current local env. | Expected auth-capable local env for account/profile/migration verification. Actual logs show Auth.js `MissingSecret`; real magic-link/account migration was not completed. | Playwright logs; `docs/ops/env-reference.md` auth env surface |
| E2E-06 | Paid/customer lifecycle proof | major | Try to prove checkout, webhook, pre-charge email, cancel, Stripe portal, and paid entitlement without writes. | Expected complete test-mode proof before launch. Actual this run avoided Stripe writes and real emails by constraint, so the lifecycle remains unproven by current-run evidence. | Constraint in prompt; billing source in `app/api/billing/handlers.ts`, `lib/server/entitlement.ts` |
| E2E-07 | Store/docs claims drift | minor | Grep current docs for reversal language. | Expected rejected/banned reversal phrasing is absent from user-facing release copy. Actual stale ops docs still contain reversal-related carve-out text. | `docs/ops/play-listing.md:11-15`, `docs/ops/play-listing.md:101-102`; `docs/safety/copy-ledger.md` rejected row |
| E2E-08 | Framework warnings | minor | Run local Playwright smoke. | Expected clean test logs. Actual Next warns about multiple lockfiles and middleware naming deprecation. | Playwright logs; `middleware.ts` |

## Predict Review Consensus

- **Architecture reviewer:** the core app shape is understandable and mostly testable. The biggest architecture drift is photo input moving from gated-off to default-on without the gate evidence being in the required source-of-truth docs.
- **Reliability reviewer:** local smoke is encouraging, but health and fallback do not prove the paid model-answer path. The full Vitest suite timing out under DB load keeps the test gate non-green.
- **Security/privacy reviewer:** the highest-risk finding is real-looking secrets in `.env.example`. Encryption code exists, but no production ciphertext row was spot-checked.
- **Product/safety reviewer:** disclaimers are present on result surfaces and the reversal onboarding line is gone from active onboarding. Vulnerable-user safety and photo-assisted claims need human review before broader launch claims.
- **Consensus:** do not launch to paying users until secrets are scrubbed/rotated, OpenAI billing is funded and a real-answer path is proven, photo gate evidence is reconciled, and the paid/auth lifecycle is verified in safe test mode.

## Self-Check

- Every result above cites file lines, command counts, or exact observed URLs/responses where available.
- Test claims report pass/fail/skip counts.
- The OpenAI billing blocker is treated as a launch blocker, not worked around.
- No deploy, push, Stripe write, email send, or intentional live OpenAI spend occurred.
- Safety-frozen files were not modified.
