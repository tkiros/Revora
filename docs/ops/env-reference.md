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
| `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL` | 4D | Stripe price IDs for the two legacy SKUs |
| `PAYWALL_MODE` | launch-readiness | **The business-model flag.** `trial` = card-gated 7-day trial + hard wall (the locked 2026-07-05 model); anything else = `legacy` standing free tier (5 checks/day). Defaults to `legacy` (`lib/server/pricing.ts`) — production must be flipped to `trial` deliberately, after the DoR live walkthrough (see `docs/runbooks/price-test.md`) |
| `TRIAL_PRICE_VARIANT` | launch-readiness | `999` / `1299` (default) / `1999` — selects the monthly price cohort for the trial wall |
| `STRIPE_PRICE_MONTHLY_999` / `STRIPE_PRICE_MONTHLY_1299` / `STRIPE_PRICE_MONTHLY_1999` | launch-readiness | live Stripe price IDs for the three trial-mode monthly variants (`lib/server/pricing.ts`) |
| `STRIPE_PRICE_PANTRY` | launch-readiness | live Stripe price ID for the one-time $49 Pantry Review |
| `MEAL_EXTRACT_STUB` | dev/test only | `1` returns a fixed meal-photo draft without a vision call (`lib/meal/photo-extract.ts`). Ignored in production builds |
| `NEXT_PUBLIC_PHOTO_INPUT` | counsel gate | **Meal photo-assist gate** (`lib/photo-input-flag.ts`): only exact `1` renders the control and permits `/api/check/photo-draft`; unset, `0`, and every other value return `404` before model use. Keep unset in preview and production until written function-specific counsel clearance plus evidence review. Tests that exercise enabled behavior must opt in explicitly. Build-time variable — changing it requires a newly reviewed build and redeploy |
| `NEXT_PUBLIC_LONGITUDINAL_INSIGHTS` | counsel gate | **Longitudinal-insights gate** (`lib/longitudinal-insights-flag.ts`): only exact `1` permits derived pattern output or its product/paid promises. Unset, `0`, and every other value produce no coach insight in server payloads, guest/signed-in dashboards, or the daily loop. Keep unset until written function-specific counsel clearance plus evidence review. Build-time variable — changing it requires a newly reviewed build and redeploy |
| `PANTRY_EXTRACT_STUB` | dev/test only | same idea for the Pantry Review photo extraction |
| `REVORA_DAILY_CHECK_CAP` | existing | global daily check cap enforced by the middleware (default 2000, `lib/revora/rate-limit.ts`) |
| `NEXT_PUBLIC_WAITLIST_URL` | launch-readiness | Tally waitlist form URL for `/get-the-app`; section hidden when unset |
| ⚙ `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | P5 | `npx web-push generate-vapid-keys`; also expose the public key as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` |
| ⚙ `CRON_SECRET` | P5 | bearer token the schedulers send to cron routes — the Railway `hourly-crons` service (nudge, pantry-sweep, trial-precharge; `docs/runbooks/price-test.md`) and the one remaining Vercel cron (`bai-weekly`, `vercel.json`) |
| `NEXT_PUBLIC_UMAMI_SRC` | P7 | Umami tracker script URL (self-hosted on Railway — `docs/adr/analytics-umami.md`); analytics is fully disabled (no `<script>` rendered, `track()` no-ops) when unset |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | P7 | Umami website ID; both this and `NEXT_PUBLIC_UMAMI_SRC` must be set for analytics to activate |
| `NEXT_PUBLIC_APP_URL` | 4D/P7 | canonical origin, e.g. `https://revora.app` |
| ⚙ `REVIEWER_TEST_SECRET` | P9 | shared secret for the Play-reviewer test-login bypass (`app/api/auth/reviewer-signin/route.ts`). Set in **preview only** — the route hard-404s in production regardless of this value (`VERCEL_ENV`/`NODE_ENV` check), so leaving it unset in production is a second, redundant lock, not the only one |
| `NEXT_PUBLIC_REVIEWER_MODE` | P9 | set to `1` in **preview only** to show the "Reviewer access" form on `/signin`. **Never set in production** — this is a build-time constant, so leaving it unset makes the form permanently inert (`false`) in the production bundle |
| `SUPPORT_EMAIL` | P5/P9 | production support inbox; current public fallback is `support@revora.bio`. Used by service email, reports, Privacy, and Terms. Set explicitly in production |
| `LEGAL_ENTITY_NAME` | P9/legal | exact person or registered entity operating Revora; rendered in Terms and Privacy. Required before a public paid launch; never use a placeholder |
| `REVORA_LAUNCH_MODE_OVERRIDE` | dev/test only | set to `paused` to simulate a launch-controls incident (`lib/revora/launch-controls.ts`) in unit/smoke tests without touching live Edge Config. **Never set in production** — it is ignored whenever `NODE_ENV` or `VERCEL_ENV` is `production`, so this is a dev/test-only override, not a production kill switch (use `EDGE_CONFIG`'s `launch_mode` key for that) |

Local dev bootstrap:

```bash
# .env.local (never committed)
openssl rand -base64 32   # → AUTH_SECRET
openssl rand -base64 32   # → HEALTH_DATA_KEY
npx web-push generate-vapid-keys   # → VAPID_*
```

Migrations: `DATABASE_URL=<railway-url> npx drizzle-kit migrate` (run per
Railway Postgres environment: dev → preview → prod).
