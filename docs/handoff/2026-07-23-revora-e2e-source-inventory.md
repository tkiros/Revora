# Revora source-derived product denominator

> Snapshot: local committed source
> `b5c03f4666ea793923482b08fd53c45c037467e7`. Production
> `24d88ec85ba52162544e0336a189db340c18616d` has the same application,
> component, library, route, and function denominator; its code delta is a CSP
> change in `next.config.ts` plus test/harness changes.

## Denominator

| Surface | Count | Method |
|---|---:|---|
| Page routes | 27 | Every tracked `app/**/page.tsx` |
| Layouts | 4 | Every tracked `app/**/layout.tsx` |
| Route error boundaries | 1 | `app/(app)/home/error.tsx` |
| `not-found`, `loading`, `template`, or parallel-default files | 0 | Exact special-file search |
| Route-handler files | 61 | 59 under `app/api`, plus security.txt and Pantry claim |
| Exported HTTP methods | 71 | TypeScript export scan: GET 26, POST 37, DELETE 5, PATCH 3 |
| Permanent redirects | 3 | `/history`, `/memory`, `/progress` |
| Inline Server Actions | 1 | Magic-link sign-in form |
| Cron entry points | 5 | BAI, nudge, Pantry sweep, Stripe reconcile, precharge |
| Provider webhooks | 3 | Stripe, Google Play RTDN, Resend |
| Admin pages / API methods | 2 / 4 | Feedback, Pantry; feedback/pantry/support |
| Health methods | 2 | Readiness and process liveness |
| Internal video-engine page / API methods | 1 / 8 | Local-only UI and asset/spec/hook/render/approve/commit/run/state |
| Shared component modules | 41 | `components/*.{ts,tsx}` |
| Component-bearing non-test TSX modules | 77 | 41 shared, 34 app, 2 Remotion |
| Tracked first-party/test TS/TSX modules | 482 | app 105, components 41, lib 102, video-engine 19, scripts 4, tests 199, root/config/IaC 12 |
| Product/runtime TS/TSX modules | 272 | app + components + lib + video-engine + five root runtime/config modules |
| Exported callable values | 524 | TypeScript AST/type-checker export scan |
| Exported non-callable values | 267 | TypeScript AST/type-checker export scan |
| Type-only exports | 216 | TypeScript AST/type-checker export scan |
| Private callable definitions | 380 | 270 module-level named, 83 nested named, 27 object/class methods |
| SQL migrations / journal snapshots / tables | 18 / 18 / 22 | Drizzle source and journal |
| Direct external integrations | 11 | Postgres, OpenAI, Upstash, Stripe, Play/RTDN, Resend, Blob, Edge Config, Sentry, Umami, Web Push |
| Operational hosting/scheduling dependencies | 2 | Vercel and Railway |
| Vitest / eval / Playwright source files | 175 / 4 / 17 | Exact test file inventory |

`robots.ts` and `sitemap.ts` are counted as metadata endpoints, not page or
route-handler files. Root/layout metadata, the PWA manifest file, service
worker, icons, and security headers are mapped under installability rather than
inflating the page denominator.

## Page routes — 27

- Public/acquisition: `/`, `/demo`, `/get-the-app`, `/how-it-works`,
  `/privacy`, `/terms`, `/pantry`, `/pantry/thanks`, `/report/[id]`
- Identity/first use: `/onboarding`, `/signin`, `/signin/check-email`,
  `/welcome`
- App: `/home`, `/check`, `/meals`, `/journey`, `/account`,
  `/account/delete`, `/subscribe`, `/trial/started`, `/canceled`,
  `/canceled/confirm`
- Internal: `/admin/feedback`, `/admin/pantry`, `/video-engine`
- Pantry authenticated intake: `/pantry/intake`

Permanent compatibility redirects are `/history → /meals`,
`/memory → /meals`, and `/progress → /journey`.

## API and background map — 71 methods

| Family | Methods |
|---|---|
| Account/profile/data rights | `GET,POST,PATCH /api/profile`; `GET /api/account/export`; `DELETE /api/account/health-data`; `POST /api/account/delete` |
| Authentication | `GET,POST /api/auth/[...nextauth]`; `POST /api/auth/reviewer-signin` |
| Core check | `POST /api/check`; `POST /api/check/photo-draft`; `POST /api/feedback` |
| History | `GET /api/history`; `POST /api/history/search`; `POST /api/history/migrate`; `POST /api/history/action`; `DELETE /api/history/[id]`; `GET /api/history/export` |
| Meal Memory | `GET,POST,DELETE /api/memory`; `PATCH,DELETE /api/memory/[id]`; `POST /api/memory/recall`; `POST /api/memory/search`; `GET /api/memory/export` |
| Learning/progress | `GET /api/coach`; `GET,POST /api/journey`; `GET /api/journey/weekly`; `POST,DELETE /api/push/subscribe` |
| Billing/access | `GET /api/paywall`; `GET /api/entitlement`; `POST /api/trial/start`; `POST /api/billing/stripe/checkout`; `POST /api/billing/stripe/pantry-checkout`; `POST /api/billing/stripe/portal`; `POST /api/billing/stripe/sync`; `GET,POST /api/billing/cancel`; `POST /api/billing/play/verify` |
| Provider inbound | `POST /api/billing/stripe/webhook`; `POST /api/billing/play/rtdn`; `POST /api/webhooks/resend` |
| Pantry lifecycle | `GET /pantry/claim`; `POST /api/pantry/upload`; `POST /api/pantry/submit`; `POST /api/pantry/confirm`; `POST /api/pantry/process` |
| Admin | `POST /api/admin/feedback`; `POST /api/admin/pantry`; `GET,PATCH /api/admin/support` |
| Scheduled | `GET /api/cron/bai-weekly`; `GET /api/cron/nudge`; `GET /api/cron/pantry-sweep`; `GET /api/cron/stripe-reconcile`; `GET /api/cron/trial-precharge` |
| Operations | `GET /api/health`; `GET /api/health/live`; `GET /.well-known/security.txt` |
| Video engine | `GET /api/video-engine/asset`; `POST /api/video-engine/specs`; `POST /api/video-engine/hooks`; `POST /api/video-engine/render`; `POST /api/video-engine/approve`; `POST /api/video-engine/commit`; `GET /api/video-engine/runs`; `GET /api/video-engine/state` |

## Function-to-concern classification

Every callable in the denominator is assigned by these exhaustive,
non-overlapping path/call-path rules:

| Classification | Paths / call-path rule |
|---|---|
| User-facing page and interaction | `app/**/page.tsx`, `components/**` when imported by a page/layout |
| API/authz/data mutation | `app/**/route.ts` and handler factories they import |
| Meal/safety engine | `lib/revora/**`, `lib/meal/**`, and their route callers |
| Identity/billing/entitlement | `lib/server/session*`, `lib/server/entitlement*`, `lib/server/billing/**`, billing/auth routes |
| History/memory/journey/coach | Corresponding `lib/client`, `lib/server`, `lib/journey`, `lib/coach`, API, and UI paths |
| Pantry | `lib/pantry/**`, `lib/server/pantry/**`, Pantry routes/components/pages |
| Privacy/security/observability | crypto, analytics, Sentry, proxy/rate-limit, data-right routes |
| Installability/platform | root Next/Playwright/TypeScript config, manifest/SW/PWA modules, Play bridge |
| Internal video infrastructure | `video-engine/**`, `/video-engine`, and `/api/video-engine/**` |
| Build/test/operations helper | `scripts/**`, config/IaC, and test support |
| Test-only | `tests/**` |
| Dormant/unreferenced candidate | No runtime inbound import, package entry, child-process entry, route convention, or string-resolved runtime entry |

The import graph produced two dormant candidates:
`components/dashboard-insight.tsx` and `video-engine/music.ts`. The video runner
and Remotion registration are not dead despite lacking normal imports: one is a
package/child-process entry and the other is resolved by string URL.

## Database denominator — 22 tables

`users`, `accounts`, `sessions`, `verification_tokens`, `profiles`, `checks`,
`check_feedback`, `meal_memories`, `learning_journeys`,
`weekly_reflections`, `push_subscriptions`, `subscriptions`,
`billing_event_inbox`, `email_delivery_attempts`, `email_suppressions`,
`bai_weekly`, `support_cases`, `deletion_log`, `cron_heartbeat`,
`pantry_orders`, `pantry_photos`, and `pantry_items`.

Both current Railway databases reported all 18 journal hashes through migration
`0017` and all 22 tables. That proves migration shape in those stores, not that
the Vercel runtime role has the intended restricted grants.

## Completeness limitations

- Dynamic imports, route conventions, package scripts, child processes, and
  string-resolved Remotion entries were explicitly accounted for. Runtime
  reflection can still make static dead-code classification imperfect.
- A callable count is not behavioral coverage. The feature matrix and test
  matrix record which call paths have direct evidence.
- The source denominator does not make active feature flags or deployed
  provider bindings true; those are separate evidence buckets.
