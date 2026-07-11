# 00 — Repo Reconnaissance (2026-07-10)

Read-only survey performed before any test execution. Where the master QA prompt
and the implementation disagree, the runtime implementation is treated as the
current system and the mismatch is logged (§4).

## 1. Architecture map

### Platform

- **Web app (PWA)** — Next.js `16.2.4` App Router, React 19, TypeScript 6, Node runtime.
  There is **no native iOS app and no React Native/Flutter code**.
- **Android** ships as a **TWA wrapper** (`twa-manifest.json`, startUrl `/check`);
  Play billing integration exists server-side (`lib/server/play-api.ts`, RTDN webhook).
- Deploy target: Vercel (`.vercel/`, `vercel.json`, `VERCEL_ENV` switches). Sentry for errors
  (`sentry.server.config.ts`, `instrumentation.ts`, `lib/revora/sentry-scrub.ts`).

### Frontend routes (App Router)

- Core loop: `/home` (dashboard), `/check` (the meal-moment check), `/history`, `/progress`,
  `/onboarding`, `/welcome`, `/demo`, `/how-it-works`, `/account`, `/account/delete`.
- Billing: `/subscribe`, `/trial/started`, `/canceled`, `/get-the-app`.
- Auth: `/signin`, `/signin/check-email` (NextAuth v5 beta, email magic-link; reviewer
  sign-in route for store review).
- Pantry Review (product #2, one-time purchase): `/pantry`, `/pantry/intake`, `/pantry/thanks`,
  `/report/[id]`, admin at `/admin/pantry`.
- Internal: `/video-engine` dashboard (marketing-video tooling; **not** user-facing product).
- Legal: `/privacy`, `/terms`.

### Backend (route handlers under `app/api/`)

- `POST /api/check` — the AI food check. Entitlement gate (trial wall / free daily cap)
  **before model spend**; fail-soft persistence of checks (encrypted food text via
  `lib/server/crypto.encryptField`); rule-based coach outputs derived at route layer.
- `POST /api/check/photo-draft` — vision extraction to a **draft the user confirms**
  (extractor never judges; `lib/meal/photo-extract.ts`).
- `/api/coach`, `/api/history*`, `/api/profile`, `/api/entitlement`, `/api/paywall`,
  `/api/trial/start`, `/api/billing/*` (Stripe checkout/portal/webhook + Play verify/RTDN),
  `/api/pantry/*` (upload/process/confirm), `/api/push/subscribe`, `/api/account/delete`,
  `/api/cron/*` (nudge, trial-precharge, pantry-sweep, bai-weekly), `/api/health`,
  `/api/admin/pantry`, `/api/video-engine/*`.
- **Edge proxy** (`proxy.ts`, Next 16 middleware rename): kill-switch (Edge Config) +
  per-IP rate limit and global daily cap (Upstash) on `/api/check*` — the cost/abuse gate.
  Fails CLOSED on public deploys without Upstash config; transient Redis errors fail OPEN
  (OpenAI dashboard cap is the final ceiling).

### Data layer

- Postgres via Drizzle (`lib/server/db/schema.ts`, `drizzle/` migrations). PGlite-in-wasm
  for tests (`tests/helpers/test-db.ts`). Railway config dirs present (hosted PG).
- Sensitive text (food entries) stored as ciphertext (`foodCiphertext`).
- Vercel Blob for pantry photo upload; Upstash Redis for rate limits.

### AI integration (the "Revora engine", `lib/revora/`)

- **Text + A1C only** in the daily check. Pipeline:
  `CheckRequestSchema` (zod, strict) → `routeA1C` (out-of-scope bands short-circuit) →
  `input-precheck` (deterministic non-food/clarify short-circuit before spend) →
  `buildRevoraPrompt` (safety contract copy injected) →
  `openai-client.ts` (OpenAI **Responses API**, strict `json_schema` output, `store:false`,
  10s timeout, `maxRetries:0`, **one** live attempt) →
  zod `RevoraModelOutputSchema` → `postprocess.ts` (conservative floors, one-sentence rules,
  permission-first SAFE openings) → user response with server-added disclaimer.
- **Fail-closed**: any provider/schema failure returns controlled `retry` copy — never an
  invented result (`fallback.ts`; Sentry capture with PII scrub).
- Model config: `REVORA_MODEL` (default `gpt-5.4-mini`), `OPENAI_API_KEY`,
  `OPENAI_BASE_URL` (OpenRouter is used by pointing this at
  `https://openrouter.ai/api/v1` with `openai/…` model slugs — see
  `docs/handoff/2026-07-09-openrouter-model-benchmark.md`), `REVORA_REASONING_EFFORT`
  (behavior-neutral default: omitted).
- Vision extractors (meal photo, pantry labels) are separate modules that extract only and
  feed the same text engine after user confirmation.
- Safety policy is **code-enforced**: `safety-contract.ts` + `tests/fixtures/safety-contract.json`
  (forbidden predictions, qualitative-only rules, approved copy), validated by
  `scripts/validate-safety-contract.mjs` and unit tests.

### Subscriptions / entitlements

- Stripe (checkout, portal, webhook) + Google Play (verify + RTDN). Server-side entitlement
  (`lib/server/entitlement.ts`) is the source of truth; `PAYWALL_MODE` `trial|legacy` decides
  hard trial wall vs. free daily cap. Trial pre-charge email cron exists.

### Analytics / telemetry

- `lib/revora/telemetry.ts` (`emitSafeEvent`) — server-side, low-cardinality, no food text,
  no PII (unit-tested: `telemetry.test.ts`, `privacy-minimal.test.ts`). Client analytics in
  `lib/client/analytics.ts`. No third-party analytics SDK found in dependencies.

### Existing product/safety/policy documentation

- `PRODUCT.md`, `DESIGN.md`, `Revora_Brand_Positioning_v2.md`, `Revora_PRD_Amendments.md`,
  `Revora_Traceability_Matrix.md` (root), `PRD/`.
- Safety: `docs/safety/claims-boundary.md`, `tone-uncertainty-policy.md`, `copy-ledger.md`,
  `a1c-band-rubric.md`, `evidence-pack.md`. Legal: `docs/legal/counsel-brief.md`.
  Privacy: `docs/privacy/data-flow.md`. QA: `docs/qa/launch-walkthrough-web.md`,
  `docs/qa/prompt-validation-2026-07.md`.

## 2. Test-command map

| Purpose | Command | Notes |
|---|---|---|
| Install | `npm install` | npm + package-lock |
| Dev server | `npm run dev` | Next dev |
| Typecheck | `npm run typecheck` | tsc --noEmit (clears stale .next types first) |
| Lint | — | **No lint script/config present** |
| Unit + integration | `npm run test` | Vitest, ~150 files, PGlite DB tests, maxWorkers≤4 |
| Engine subset | `npm run test:revora` | `tests/unit/revora` |
| Safety eval (mock, deterministic) | `npm run eval:revora` | fixture-driven, CI-safe |
| Safety eval (live model) | `node scripts/run-live-revora-evals.mjs` | needs `OPENAI_API_KEY`; SETUP_BLOCKED message otherwise |
| Graded quality gate (live) | `npm run eval:revora:live` → `scripts/run-graded-evals.mjs` | labeled + adversarial cases |
| Photo/pantry extraction evals | `npm run eval:meal-photo`, `npm run eval:pantry-extract` | fixture-driven |
| E2E smoke (mobile web) | `npx playwright test` | Boots two Next dev servers: :3100 `PAYWALL_MODE=legacy`, :3101 `PAYWALL_MODE=trial`; Pixel 5 + iPhone 12 profiles; includes `@axe-core/playwright` a11y spec |
| Build | `npm run build` | Next build |
| Security scan | `npm audit` | no other scanner configured |
| DB migrations | `drizzle-kit` via `drizzle.config.ts` | no seed/reset script for app DB; seed scripts exist for pantry/reviewer |
| Safety-contract validation | `node scripts/validate-safety-contract.mjs` | |
| Mobile simulators | — | N/A (web PWA + TWA; no iOS/Android project in repo) |

## 3. Risk map (P0/P1/P2 definitions per master prompt)

**P0 candidates (release blockers if broken)**
- Harmful-SAFE classification (unsafe meal labeled SAFE) — guarded by eval gate + postprocess floors.
- Fabricated result on provider failure — guarded by fail-closed `retry` path.
- Paywall bypass / paid user locked out — `entitlement.ts`, `PAYWALL_MODE` gates, Stripe/Play webhooks.
- Cross-account data access (history/checks/pantry reports).
- Secret exposure (see §5 — two live findings).
- Medical-claim boundary breach (diagnose/treat/cure/reverse language) — code-enforced contract.

**P1**
- Middleware/proxy bypass of the rate-limit gate (Next 16.2.4 advisories — live finding, §5).
- Misleading label/photo extraction accepted without user confirmation.
- A11y failure in the check→result path (axe smoke exists; needs verification).
- Trial wall wording/pricing drift vs Stripe config.
- Model regression on strict-schema validity (parser rejects → user sees retry).

**P2**
- Copy polish, non-core visual issues, video-engine internal tooling defects.

## 4. Prompt-vs-implementation mismatches (logged, not assumed)

The master QA prompt describes a generic food-**image**-scanning mobile app. The actual product:

1. **No barcode scanning, no OCR label pipeline in the daily check** — pantry labels and meal
   photos go through vision extraction + explicit user confirmation; the judging engine is text+A1C.
2. **No native mobile apps / simulators** — web PWA + Android TWA. "Camera permission" flows are
   browser-level; photo input is behind a flag (`lib/photo-input-flag.ts`).
3. **No A/B experiment framework** found (only `TRIAL_PRICE_VARIANT`-style env config).
4. **Nutrition databases** — none; the engine is qualitative-only by policy (no exact carbs/calories),
   which the safety contract enforces. Several prompt journeys (per-100g serving math, barcode lookup)
   are therefore N/A rather than untested.
5. Traceability matrix already exists at root (`Revora_Traceability_Matrix.md`); this QA round
   produces a delta rather than a duplicate (see `02-traceability-matrix.md`).

## 5. Missing prerequisites / blockers / immediate flags

| # | Item | Status |
|---|---|---|
| 1 | `openr.md` at repo root contains a **plaintext OpenRouter API key**; untracked but **not gitignored** (one `git add .` from being committed). Key must be treated as exposed. | **P1 security finding** → rotate key, move to `.env`, delete file. Logged in `07-security-privacy-report.md`. |
| 2 | Five API keys live in git history (commit `213ab8a`), rotation "still owed" per `docs/handoff/2026-07-09-slice2-laneC-…-handoff.md`. | **P1 carry-over** — human action required. |
| 3 | `next@16.2.4` has high-severity advisories incl. middleware/proxy bypass; `proxy.ts` is the cost/abuse gate for `/api/check`. | **P1** → patch upgrade to ≥16.2.10 recommended (not applied during this QA run to keep the baseline stable). |
| 4 | No lint config. | P2 gap. |
| 5 | Live Stripe/Play flows, real trial expiry, RTDN, cron jobs in production. | BLOCKED for live E2E — sandbox/unit coverage only. |
| 6 | Live model evals — `OPENAI_API_KEY` not exported in this shell; an authorized OpenRouter test key exists (see #1). Live bake-off runs are budget-capped and case-capped. | Available with explicit caps. |
| 7 | iOS device/simulator testing, screen readers (VoiceOver/TalkBack). | BLOCKED / MANUAL VERIFICATION REQUIRED — not possible in this environment; axe automated checks run instead. |

## 6. Proposed execution order (per master prompt §13)

1. ✅ Read-only recon (this document).
2. Baseline: `npm run typecheck` (PASS), full `npm run test`, `npm run eval:revora` (mock).
3. Playwright smoke suite (both paywall modes, mobile profiles, axe a11y).
4. Security/privacy checks (secrets, route auth, npm audit, scrub tests).
5. Model bake-off `openai/gpt-5.4-nano` vs `openai/gpt-5.4-mini` via OpenRouter:
   mock mode first, then budget-capped live run over the frozen 48-case corpus
   (`tests/fixtures/revora-eval-cases.json`) using the **identical production pipeline**
   (prompt, schema, postprocess) for both models.
6. Reports 01–10 + scorecard + executed-test report, with honest
   EXECUTED / NOT EXECUTED / BLOCKED / MANUAL VERIFICATION REQUIRED labels.
