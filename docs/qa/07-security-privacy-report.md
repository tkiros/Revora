# 07 — Security & Privacy Report (2026-07-10)

Scope: static review of the repo, dependency audit, secret scanning, and the
already-passing security-relevant unit suites (814 tests green this run).
No attacks were run against deployed environments (no authorization assumed).

## Findings

### SEC-01 — Plaintext OpenRouter API key in `openr.md` (P1) — PARTIALLY REMEDIATED
- **Proof:** `openr.md` at repo root contains a live `sk-or-v1-…` key (not reproduced here).
  It was untracked but **not gitignored** — one `git add .` from being committed. The key has
  also been shared in plaintext contexts outside the repo (it appears in the QA task brief).
- **Remediation done this run:** `openr.md` added to `.gitignore`.
- **Remaining human action (required):** rotate the key in the OpenRouter dashboard, move it
  to `.env` as `OPENROUTER_API_KEY`, delete `openr.md`. Until rotated, treat as exposed.
- **Status:** EXECUTED (detection + gitignore); rotation = MANUAL ACTION REQUIRED.

### SEC-02 — Five API keys live in git history (P1) — CARRY-OVER, STILL OWED
- **Proof:** `docs/handoff/2026-07-09-slice2-laneC-…-handoff.md` records OPENAI, RESEND,
  UPSTASH (×2), BLOB tokens blanked at HEAD but live in history commit `213ab8a`; the
  founder deferred rotation. Repo is private, so blast radius is collaborators — but the
  QA position is unchanged: **history is not deletion**.
- **Remediation:** rotate all five in their dashboards. Status: MANUAL ACTION REQUIRED.

### SEC-03 — `next@16.2.4` high-severity advisories, incl. middleware/proxy bypass (P1)
- **Proof:** `npm audit --omit=dev`: 1 high (next: DoS, middleware/proxy bypass via
  segment-prefetch routes GHSA-26hh-7cqf-hhc6 / GHSA-267c-6grr-h53f, cache poisoning, XSS
  vectors), 1 moderate (postcss). Fix version: `16.2.10`.
- **Why it matters here:** `proxy.ts` is the **pre-model cost/abuse gate** (kill switch +
  per-IP + global daily cap) for `/api/check*`. A middleware bypass lets an attacker reach
  the model spend path unmetered. (Signed-in entitlement checks in the route itself still
  hold; guests are metered *only* by the proxy.)
- **Remediation:** patch upgrade to `next@>=16.2.10`, rerun `npm run test` + smoke suite.
  Not applied during this QA run to keep the baseline stable. Status: RECOMMENDED.

### SEC-04 — No explicit security headers / CSP (P2)
- `next.config.ts` sets no `headers()` (no CSP, X-Frame-Options, Referrer-Policy…).
  Low urgency (no third-party scripts found), but cheap hardening. Status: RECOMMENDED.

### SEC-05 — Dev-dependency vulnerabilities (P2)
- Full `npm audit`: 7 (5 moderate, 2 high) vs 2 in production graph — the delta is
  dev/test tooling only. Fold into the SEC-03 upgrade pass.

## Verified controls (evidence-based, all EXECUTED via unit suite or direct inspection)

| Control | Evidence |
|---|---|
| Cron endpoints default-deny bearer `CRON_SECRET` (`!secret` ⇒ reject) | all four `app/api/cron/*/route.ts` |
| Admin default-deny (`ADMIN_EMAIL` unset ⇒ nobody) | `lib/server/admin.ts` |
| History/account routes session-gated, owner-scoped queries (IDOR-resistant by construction) | `app/api/history/handlers.ts`, `account-delete.test.ts`, `history-routes.test.ts` |
| Food text encrypted at rest (`foodCiphertext`); pantry ciphertext too | `lib/server/crypto.ts`, `pantry-ciphertext.test.ts`, `check-persistence.test.ts` |
| Telemetry contains no food text / PII | `telemetry.test.ts`, `privacy-minimal.test.ts`, `privacy-stateful.test.ts` |
| Sentry PII scrub | `sentry-scrub.test.ts`, `sentry-capture.test.ts` |
| Model calls: `store:false`, server-side only, single attempt, 10s timeout | `lib/revora/openai-client.ts` |
| Rate limit fails CLOSED on public deploys without Upstash | `proxy.ts`, `rate-limit.test.ts`, `launch-controls.spec.ts` |
| Server-side entitlement is source of truth; wall enforced before model spend | `app/api/check/route.ts`, `entitlement.test.ts`, `billing-routes.test.ts` |
| Stripe webhook signature handling | `pantry-webhook.test.ts`, `billing-routes.test.ts` |
| Internal video-engine API 404s outside dev | `routes-guard.test.ts` |
| No secrets in client bundle (`.next/static`, `public/`) | pattern scan this run — no matches |
| `.env*` gitignored; only `.env.example` tracked | `git ls-files` + `.gitignore` |

## Not executed / blocked

- **Dynamic testing of deployed envs** (session fixation, brute force, header checks on
  prod): BLOCKED — no authorized target specified.
- **Auth-endpoint rate limiting** (magic-link email flood): NOT EXECUTED — no limiter found
  on `/api/auth/*`; the Upstash gate covers `/api/check*` only. Recommend confirming
  provider-side email throttling. (P2 follow-up.)
- **Malicious image payloads / decompression bombs** on pantry upload: NOT EXECUTED this
  run; `pantry-upload-auth.test.ts` covers auth and size, not adversarial payloads. (P2.)
- **Push notification content privacy on devices**: MANUAL VERIFICATION REQUIRED.
