# Environment reference (full build)

Every variable, per phase. Provision in Vercel for **preview + production**
(plan §10 §2). ⚙ = generate yourself and store in your secret manager:
`openssl rand -base64 32`.

| Variable | Phase | Notes |
|---|---|---|
| `OPENAI_API_KEY` | existing | engine calls |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | existing | rate limit; prod instance |
| `SENTRY_DSN` | existing/P7 | server-only capture |
| `EDGE_CONFIG` | existing | launch-controls kill switch |
| `DATABASE_URL` | 4A | **Railway Postgres** URL (`docs/adr/hosting-hybrid.md`) — plain TCP, human-provisioned; the app connects via `pg`/`drizzle-orm/node-postgres` with a small per-instance pool (`max: 3`) |
| ⚙ `AUTH_SECRET` | 4A | Auth.js session/token signing |
| ⚙ `HEALTH_DATA_KEY` | 4A | **exactly 32 bytes base64** — AES-256-GCM key for A1C + food text. Losing it orphans all ciphertext; store it like a root credential |
| `RESEND_API_KEY` | 4A | magic-link email |
| `AUTH_EMAIL_FROM` | 4A | e.g. `Revora <signin@yourdomain>`; domain must be Resend-verified |
| `AUTH_EMAIL_STUB_DIR` | dev/test only | writes magic links to disk instead of sending — never set in production |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | 4D | full JSON of the Play API service account |
| `PLAY_PACKAGE_NAME` | 4D | e.g. `app.revora.twa` |
| ⚙ `RTDN_SHARED_TOKEN` | 4D | shared token on the Pub/Sub push endpoint URL |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | 4D | web-fallback billing |
| `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL` | 4D | Stripe price IDs for the two SKUs |
| ⚙ `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | P5 | `npx web-push generate-vapid-keys`; also expose the public key as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` |
| ⚙ `CRON_SECRET` | P5 | bearer token Vercel sends to cron routes |
| `NEXT_PUBLIC_UMAMI_SRC` | P7 | Umami tracker script URL (self-hosted on Railway — `docs/adr/analytics-umami.md`); analytics is fully disabled (no `<script>` rendered, `track()` no-ops) when unset |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | P7 | Umami website ID; both this and `NEXT_PUBLIC_UMAMI_SRC` must be set for analytics to activate |
| `NEXT_PUBLIC_APP_URL` | 4D/P7 | canonical origin, e.g. `https://revora.app` |
| ⚙ `REVIEWER_TEST_SECRET` | P9 | shared secret for the Play-reviewer test-login bypass (`app/api/auth/reviewer-signin/route.ts`). Set in **preview only** — the route hard-404s in production regardless of this value (`VERCEL_ENV`/`NODE_ENV` check), so leaving it unset in production is a second, redundant lock, not the only one |
| `NEXT_PUBLIC_REVIEWER_MODE` | P9 | set to `1` in **preview only** to show the "Reviewer access" form on `/signin`. **Never set in production** — this is a build-time constant, so leaving it unset makes the form permanently inert (`false`) in the production bundle |

Local dev bootstrap:

```bash
# .env.local (never committed)
openssl rand -base64 32   # → AUTH_SECRET
openssl rand -base64 32   # → HEALTH_DATA_KEY
npx web-push generate-vapid-keys   # → VAPID_*
```

Migrations: `DATABASE_URL=<railway-url> npx drizzle-kit migrate` (run per
Railway Postgres environment: dev → preview → prod).
