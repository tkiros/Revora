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
| `DATABASE_URL` | 4A | Neon **pooled** URL; use the direct URL for `npx drizzle-kit migrate` |
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
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | P7 | analytics site domain |
| `NEXT_PUBLIC_APP_URL` | 4D/P7 | canonical origin, e.g. `https://revora.app` |

Local dev bootstrap:

```bash
# .env.local (never committed)
openssl rand -base64 32   # → AUTH_SECRET
openssl rand -base64 32   # → HEALTH_DATA_KEY
npx web-push generate-vapid-keys   # → VAPID_*
```

Migrations: `DATABASE_URL=<direct-url> npx drizzle-kit migrate` (run per Neon
branch: dev → preview → prod).
