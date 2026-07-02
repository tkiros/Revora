# ADR: Stateful-layer stack

**Date:** 2026-07-01 · **Status:** Accepted · **Phases:** 4A–4E, 5, 7

## Decision

| Concern | Choice | One-line why |
|---|---|---|
| Database | ~~Neon Postgres (Vercel Marketplace)~~ + **Drizzle ORM/kit** migrations | Serverless-native Postgres with branching (dev/preview/prod); Drizzle is schema-as-TS with plain SQL migrations, no runtime magic. **Superseded by `docs/adr/hosting-hybrid.md` (DB)** — the database is now Railway Postgres |
| Auth | **Auth.js v5** email magic-link, **DB sessions**, Drizzle adapter | Passwordless fits the 40–65 audience; no password storage; DB sessions are revocable and power deletion |
| Email | **Resend** | One API for magic links + transactional; dev key works locally |
| Field encryption | **AES-256-GCM via `node:crypto`**, key = `HEALTH_DATA_KEY` (32-byte base64 env), format `base64(iv‖tag‖ciphertext)` | A1C + food text are GDPR Art. 9 / health-adjacent; env-key AES-GCM is the smallest correct at-rest control. `ponytail:` upgrade path = KMS/managed keys if compliance posture demands |
| Push | **web-push** (VAPID) + Vercel hourly cron | Standard Web Push works in TWA/Android Chrome; no vendor SDK |
| Cron | **Vercel crons** (`vercel.json`) | Already on Vercel; hourly schedule needs Pro (human decision §10) |
| Analytics | ~~Plausible~~ script + a typed no-PII event allowlist (`lib/client/analytics.ts`) | Cookieless, no consent banner needed for US launch; the allowlist is enforced by a unit test. **Superseded by `docs/adr/analytics-umami.md`** — the vendor is now Umami, self-hosted on Railway |
| Billing | see `docs/adr/billing.md` | |

## Non-choices (rejected)

- **Prisma**: heavier runtime + engine binary on serverless; Drizzle's SQL
  migrations are easier to audit for the encrypted-column rules.
- **NextAuth JWT sessions**: DB sessions make sign-out-everywhere and
  account deletion trivially correct.
- **`googleapis`**: one endpoint (`subscriptionsv2.get`) does not justify the
  dependency; RS256 JWT via `node:crypto` + `fetch` suffices.
- **Google Analytics / PostHog default config**: PII risk in a health app;
  Plausible's model matches the privacy posture.

## Constraints carried by this stack

- Exact A1C and food text are **only** stored encrypted (`profiles.a1c_ciphertext`,
  `checks.food_ciphertext`); coarse fields (band, risk, timestamps) stay
  plaintext so coach compute never decrypts.
- `HEALTH_DATA_KEY`, `AUTH_SECRET`, VAPID keys are generated in-session and
  **stored by the human** (plan §10 §2).
