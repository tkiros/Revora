# Revora service integrations deep audit report

**Verdict: `NO-GO`**

**Audit window:** 2026-07-22 14:27:46-04:00 through 2026-07-22 16:31:13-04:00 (America/New_York)  
**Workspace:** `/home/tefera/Desktop/Revora`  
**Canonical production origin:** `https://revora.plus`  
**Local branch:** `docs/b1-b2-final-closeout`  
**Baseline local HEAD:** `df1f3a0c5e743fc084dc76dc11da5792493bc231`  
**Merged/deployed Git revision:** `fc8e9fa164bf942ec7b50d14776c7fefa252d3bf`  
**Vercel production deployment:** `dpl_GsPy…P2GWc`, READY, created 2026-07-22 14:02:51-04:00  
**Railway revisions (short operational references):** `Postgres 8ffded4d`; `hourly-crons 335656fc`; orphan `Postgres-FOMu c50a9d15`; orphan `Postgres-D2oG 576e216a`

This report records source truth, local remediation truth, automated-test truth, deployed runtime truth, and external-provider truth separately. No secret values, database URLs, private keys, user health data, or full customer/provider object identifiers are included.

## 1. Executive verdict

Revora is not release-ready. The current production deployment serves the intended Git tree and the canonical web origin, database health probe, TLS, CSP, static assets, Vercel build, and most source-level contracts are healthy. Those facts do not overcome the following launch-critical failures:

1. Two fresh synthetic production meal checks both returned Revora's `retry` fallback. A correlated Vercel log identified the configured model as `openai/gpt-5.4-mini`, indicating the production `OPENAI_BASE_URL` route is OpenRouter-compatible despite a source comment that describes direct OpenAI. The enabled public model journey is demonstrably failing.
2. All four Railway hourly jobs are stale. The scheduler calls a noncanonical app URL, receives a `301`, and treats the redirect body as success because `curl -f` neither follows nor validates the final application response. Nudge, Pantry sweep, trial precharge, and Stripe reconciliation have not recorded a heartbeat since 2026-07-21.
3. Pantry photos are uploaded as public Vercel Blob objects. Anyone holding a URL can fetch them. This is incompatible with a health-adjacent photo privacy promise and makes the complete Pantry path unsafe to launch.
4. The required Resend Return-Path MX record under the sending subdomain is absent. The current API key cannot read domain/provider logs, and no authorized magic-link receipt was sent. Authentication email delivery is therefore both DNS-incomplete and unproven.
5. The deployed Git revision has a failing required browser CI job: 3 failures, 1 flaky test, 21 skipped, 21 not run, and 191 passed. Vercel deployed it anyway; repository/environment controls do not prevent red-CI production promotion.
6. No fresh Stripe test-mode webhook-to-inbox-to-entitlement journey can be run because the account has no Revora test webhook endpoint. Live charging, refunding, replaying, or emailing was not authorized. The launch-critical billing chain remains blocked rather than proven.
7. Production code contains unsafe money/data recovery behavior: account deletion can discard the only local subscription pointer after Stripe cancellation fails; post-commit Pantry email failure has no durable retry; Blob deletion failure can be swallowed before database pointers are deleted.
8. Sentry provider receipt, Umami dashboard visibility, Resend logs/delivery, Railway backups/PITR, browser journeys, and several account controls are inaccessible or not safely testable with current authorization. Under the mandated verdict rules, these critical blocked/partial paths independently require `NO-GO`.

Two narrow source defects were safely remediated locally and regression-tested:

- the weaker second browser `Sentry.init` was removed, leaving `instrumentation-client.ts` as the single allowlisted initializer;
- Upstash SDK timeout results now follow the documented policy: email/support doors fail closed, other abuse buckets fail open, and `/api/check` fails open without incrementing the daily cap.

These fixes are **local only**. They are not committed, deployed, or proven in production. External mutation and deployment were outside this audit's authorization.

## 2. Truth buckets and revision state

| Truth bucket | Evidence | Result |
|---|---|---|
| Current local source | Baseline HEAD `df1f3a0…`, source/config/routes/tests inspected | Baseline tree matched `origin/main` content; local branch was one merge commit behind |
| Dirty in-flight work | Initial and final `git status --short` | Pre-existing handoff/retention edits preserved; five application/test paths changed by this audit; one obsolete component deleted; this report added |
| Local automated tests | Fresh commands in section 11 | Static, contract, build, Drizzle check, and unit gates pass; lint has 19 warnings and 0 errors |
| Preview/browser runtime | Preview env-name metadata; browser tool attempts; CI Playwright | Preview lacks most service variables; local browser tool failed to start; deployed-revision CI browser job fails |
| Merged/deployed production | Vercel inspect/build logs, GitHub SHA, live endpoints | Production deployment maps to `fc8e9fa…`; that revision is not the local remediated state |
| Provider/DNS/human | Vercel, Railway, Stripe, Resend, DNS/TLS, Edge Config, live API probes | Mixed; several critical paths fail or are blocked as detailed below |

### Preserved pre-existing user work

These paths were dirty before remediation and were not edited by this audit:

- `docs/handoff/2026-07-21-c7-shipped-pr24-deploy-and-residuals-handoff.md`
- `docs/retention_flow.md`
- `docs/handoff/2026-07-22-pr25-ci-unblock-merge-deploy-umami-csp-handoff.md`
- `docs/handoff/2026-07-22-revora-service-integrations-deep-audit-master-prompt.md`
- `docs/handoff/2026-07-22-stripe-webhook-verified-c7-closeout-handoff.md`

Repository-wide `git diff --check` still reports pre-existing trailing whitespace at `docs/retention_flow.md:77`. Scoped checks for the remediation paths pass.

## 3. Scope, access, and blockers

| System | Account/project identity proven? | Read access | Safe test access | Mutation requires approval? | Blocker |
|---|---:|---:|---:|---:|---|
| Git/GitHub | Yes | Yes | Yes | Yes for settings/merge | Private-repo branch/rules controls unavailable without plan support; no configured protection |
| Vercel `revora` | Yes | Yes | Read-only runtime probes | Yes | No production mutation authorized |
| Railway `revora` production | Yes | Yes | Read-only DB/log/metadata | Yes | Backup/PITR dashboard state not exposed through current CLI |
| Stripe account | Yes, shared account | Yes via CLI | No complete Revora test chain | Yes | Test mode has no Revora webhook; live financial actions not authorized |
| Stripe connector | No | No | No | Yes | OAuth token invalid/expired |
| Resend | Partial | Sending-only key | Sending intentionally not used | Yes | Full-access key/dashboard needed for domains, logs, suppressions, webhooks |
| Sentry | No | No | Source-only; production errors generated naturally | Yes | No CLI/connector/project access to confirm canary receipt or scrubbing |
| Umami | Website identifier and hosts proven; account not proven | No dashboard | One synthetic ingest POST | Yes | Dashboard access needed to prove website ownership and event visibility |
| OpenAI/OpenRouter | Routing inferred, provider account not proven | No provider dashboard | Two minimal synthetic production checks | Yes for material spend/config | Actual route appears OpenRouter-compatible; account/privacy/spend controls inaccessible |
| Upstash | Env format and live route behavior only | No dashboard | Controlled app requests | Yes | Database identity, region, quota, latency, alerting unproven |
| Vercel Blob | Store/project proven | Metadata read | No upload/delete mutation | Yes | Private migration and lifecycle drill require approval |
| Vercel Edge Config | Store/project and keys proven | Yes | Read-only | Yes | Pause/resume drill not authorized |
| DNS/registrar | Registrar and live public DNS proven | Public only | Read-only DNS/TLS | Yes | Auto-renew, MFA, recovery owner, and dashboard state inaccessible |
| Browser QA | No | No | No | No | Browser binary failed three clean starts with `lastConsoleFlushed is not defined` after rebuild |
| Production database | Canonical service proven | Read-only SQL via app credential | Read-only only | Yes | No direct backup restore drill; app role is overprivileged |

## 4. As-built dependency graph

```text
user/browser
  -> Namecheap DNS/forwarding -> revora.plus TLS -> Vercel/Next.js 16
       -> Edge Config launch controls
       -> Upstash REST rate limits and global model cap
       -> OpenAI-compatible Responses API via configured OPENAI_BASE_URL
          (runtime model label indicates an OpenRouter-style route)
       -> Auth.js + Drizzle -> Railway PostgreSQL
          -> Resend magic-link and operational email
       -> Stripe Checkout/Portal/Webhooks
          -> durable billing event inbox -> subscription/order state
          -> verify-on-read + hourly reconciliation
       -> Vercel Blob public Pantry uploads -> model extraction
          -> Railway rows -> Resend report/claim delivery -> deletion/GC
       -> Umami script at cloud.umami.is -> ingest at gateway.umami.is
       -> Sentry browser/server transports
       -> Web Push/VAPID
       -> Vercel weekly BAI cron
       -> Railway hourly curl scheduler
          -> nudge, Pantry sweep, trial precharge, Stripe reconcile

GitHub main -> Vercel automatic production deployment
Google Play/RTDN -> intentionally gated off
Video-engine/Remotion production API -> intentionally gated off
```

There is no active self-hosted Railway Umami service. Stale prose describing that architecture must not be used as runtime truth.

## 5. Redacted environment and scope matrix

Only name/scope state is shown. Values were not printed or saved.

| Configuration family | Production | Preview | Runtime/build note |
|---|---|---|---|
| `DATABASE_URL` | present | missing | Runtime server secret; preview cannot exercise DB-backed flows |
| `AUTH_SECRET` / Auth origin | present | missing | Runtime; canonical production callback only |
| `RESEND_API_KEY`, `AUTH_EMAIL_FROM`, `SUPPORT_INBOX_EMAIL` | present | missing | Runtime; provider/domain proof incomplete |
| OpenAI key, `OPENAI_BASE_URL`, model | present | missing | Runtime; configured route currently returns fallback |
| Stripe secret, webhook secret, enabled price IDs | present | missing | Runtime; exact value/mode binding not decrypted |
| Umami script URL and website ID | present | present | `NEXT_PUBLIC_*`; baked at build time |
| Sentry server/browser DSNs | present | browser DSN present | Browser DSN is build-time public config |
| Upstash REST URL/token | present, format valid | missing | Runtime/proxy; public preview fails closed on protected surfaces |
| Blob token/binding | present | Blob metadata present | Runtime; source requests public access |
| Edge Config | present | missing | Runtime/proxy; missing config defaults differ from configured outage behavior |
| VAPID public/private values | present | missing | Browser public key plus server secrets |
| `CRON_SECRET` | present in applicable services | not proven | Runtime authorization; unauthenticated probes return `401` |
| `REVORA_DAILY_CHECK_CAP` | missing | missing | Source default is 2,000/day |
| Health-data key version/old-key rotation vars | not explicitly present | missing | Rotation/recovery posture unproven |
| Google Play flag/credentials/RTDN token | missing | missing | Feature gate proves intentional off-state |

The local production build reported the names `.env.local` and `.env`; their contents were not read. A local build proves compilation only, not Vercel production scope or bundle freshness.

## 6. Canonical service proof matrix

Allowed service status values are used exactly as defined by the audit prompt.

| ID | Service/path | Intended responsibility | Provider/config proof | Runtime/user proof | Recovery/observability proof | Status | Issue IDs |
|---|---|---|---|---|---|---|---|
| SP-01 | DNS/TLS/canonical web | Route users securely to audited app | Namecheap NS, Vercel bindings, valid cert | Apex/www redirect and core assets verified | Registrar controls blocked | `PROVEN` | I-20, I-25 |
| SP-02 | Vercel production deploy | Serve audited revision | Project/team/deployment/Git SHA proven | Live alias serves `fc8e9fa…` | CI gate absent; rollback drill not run | `PARTIAL` | I-05, I-22 |
| SP-03 | Vercel preview | Safe integration proving ground | Project exists | Critical env families missing | Cannot test real integrations | `FAIL` | I-16 |
| SP-04 | Railway PostgreSQL runtime | Durable app/auth/billing state | Canonical service/schema/constraints proven | Health query passes | Backups/restore/migration provenance unproven | `PARTIAL` | I-14, I-15 |
| SP-05 | Railway hourly scheduler | Invoke four recovery/ops jobs | Service and `0 * * * *` schedule proven | Redirect body falsely logged as done; heartbeats stale | No correct effect or alert | `FAIL` | I-02, I-13 |
| SP-06 | Vercel BAI weekly cron | Weekly aggregation | Schedule and auth source proven | Heartbeat fresh | Effect and duplicate behavior not correlated end-to-end | `PARTIAL` | I-17 |
| SP-07 | OpenAI-compatible meal check | Structured meal response | Source schema/postprocess proven; env metadata present | Two fresh production calls returned `retry` | Provider error visible only through inaccessible Sentry | `FAIL` | I-01 |
| SP-08 | Upstash check limits | Abuse/spend control | Env format and source wiring proven | Ordinary request passes | Timeout handling broken in production; fixed locally only | `FAIL` | I-11 |
| SP-09 | Upstash email/support limits | Fail-closed amplification control | Source intent proven | No controlled outage test | SDK timeout silently fail-open in deployed code; fixed locally only | `FAIL` | I-11 |
| SP-10 | Edge Config launch control | Pause public checks | Store/keys and live `normal` value proven | Health reports normal | No authorized pause/resume, ownership, or audit proof | `PARTIAL` | I-17 |
| SP-11 | Umami script and ingest | Privacy-limited product analytics | Hosts/env/CSP and typed event contract proven | Script 200; synthetic gateway POST 200 | Dashboard visibility/blackout alert/browser path blocked | `PARTIAL` | I-17 |
| SP-12 | Sentry server | Error capture | Strict source options, DSN metadata, CSP proven | Production failures invoked capture helper | Correct project/event/scrub/alert receipt blocked | `PARTIAL` | I-17 |
| SP-13 | Sentry browser | Client errors without health data | DSN/CSP present | Deployed code initializes twice; weaker default integrations can load | Fixed locally, not deployed; provider/browser proof blocked | `FAIL` | I-10, I-17 |
| SP-14 | Resend magic link | Critical authentication email | Env names present; DKIM/SPF TXT present | Required Return-Path MX absent; no inbox proof | Logs/suppressions/bounces inaccessible | `FAIL` | I-04, I-19 |
| SP-15 | Resend support/operations | Deliver actionable email | Source paths inventoried | No authorized real receipt; support payload includes free text | No event webhook/durable delivery state | `PARTIAL` | I-19 |
| SP-16 | Stripe Checkout/Portal | Start/manage paid access | Live prices and live endpoint metadata proven | No approved complete transaction | Test mode lacks Revora webhook | `CONFIGURED_NOT_PROVEN` | I-06, I-21 |
| SP-17 | Stripe webhook/inbox/entitlement | Durable idempotent billing state | Signature/inbox/locking source and live endpoint proven | Bad signature returns 400; no fresh valid chain | Reconcile recovery is stale | `PARTIAL` | I-02, I-06, I-18 |
| SP-18 | Stripe account deletion | Stop billing before local deletion | Source path inspected | Stripe failure is swallowed and local pointer deleted | No durable retry/outbox | `FAIL` | I-07 |
| SP-19 | Pantry purchase/email | One-time paid workflow | Prices/routes/schema proven | No fresh end-to-end order | Post-commit email failure has no durable retry | `FAIL` | I-08 |
| SP-20 | Vercel Blob Pantry photos | Upload/process/delete photos | Store/binding/source proven | Source uploads with `access: public` | GC cron stale; deletion failures can lose pointer | `FAIL` | I-03, I-09 |
| SP-21 | Auth.js + sessions | Magic link and database sessions | Adapter/session source proven | Session endpoint returns null unauthenticated | Email/replay/expiry/revocation browser journey blocked | `PARTIAL` | I-04, I-16 |
| SP-22 | Web Push/VAPID | User nudges | Keys and source ownership/cleanup proven | Send path not exercised | Scheduler stale; transient retry semantics weak | `FAIL` | I-02, I-12, I-23 |
| SP-23 | Google Play/RTDN | Optional Android billing | All enablement vars absent | Verify returns 503; RTDN without token returns 401 | No reachable new entitlement path | `INTENTIONAL_OFF` | — |
| SP-24 | PWA/service worker | Installable app shell | Manifest/SW/icons present | Assets return 200 | Real install/update/offline browser proof blocked | `PARTIAL` | I-17 |
| SP-25 | GitHub CI/security controls | Prevent unsafe deploys | Workflows/settings inspected | Current deployed revision has red E2E | No branch/env protection or security scanning | `FAIL` | I-05, I-21 |
| SP-26 | Uptime/on-call/provider alerts | Detect silent outages | No reliable configured monitor proven | Health returns 200/`ok:true` while 4 jobs stale | Ownership/routing blocked | `BLOCKED` | I-13, I-17 |

## 7. Provider-by-provider findings

### Sentry

- `instrumentation-client.ts` uses `defaultIntegrations: false`, an explicit allowlist, zero traces, no default PII, and the shared scrubber.
- Production `app/layout.tsx` also mounted `ClientErrorReporting`, which called `Sentry.init` a second time with default integrations and a weaker scrubber. Default browser breadcrumbs/fetch/DOM behavior can carry meal text, A1C context, URLs, or local state.
- The duplicate initializer was removed locally and a source-scan regression test now proves exactly one browser initializer.
- Server capture is strict and awaited, but no Sentry CLI/dashboard access exists. Fresh production model failures called the server capture helper, yet project receipt, environment, timestamp, stack quality, redaction, alert routing, quotas, and source-map usefulness remain blocked.
- No release/source-map pipeline was found. This is a triage-quality gap, not proof that event transport works.

### Umami

- Runtime is Umami Cloud, not a Railway self-hosted instance.
- Production CSP explicitly permits `cloud.umami.is` in `script-src` and both `cloud.umami.is` and `gateway.umami.is` in `connect-src`, covering the known split-host failure class.
- The script returned 200. A correctly shaped synthetic event POST to `gateway.umami.is/api/send` returned 200 and an acceptance response.
- The source event API is a closed taxonomy with bounded properties; query strings are excluded and Do Not Track is requested.
- Browser console/network behavior, duplicate route events, attribution persistence, dashboard visibility, website ownership, internal/test filtering, and blackout alerting remain unproven.

### Stripe

- The live Revora webhook is enabled at the canonical URL, uses API version `2025-03-31.basil`, and subscribes to the expected checkout/subscription/invoice/refund event families.
- Expected live prices exist for monthly variants, annual, and Pantry. Exact environment-to-price binding was not decrypted and is reported only as metadata present.
- The source has signature verification, a durable event inbox, duplicate suppression, row locking, timestamp/order protection, checkout sync, verify-on-read, and reconciliation.
- Test mode has no Revora webhook endpoint, so no safe complete test transaction can reach the app.
- The account also contains unrelated products/endpoints, reducing isolation and increasing operator-error risk.
- Reconciliation is currently nonfunctional because its Railway scheduler call never reaches the cron handler.
- Best-effort post-commit emails can fail after paid state commits; the event is marked processed and duplicate delivery will not retry the email.
- Failed/dead-letter rows retain the full raw provider payload, including possible PII, with no demonstrated retention cleanup.
- Account deletion swallows Stripe cancellation failure and then removes the local subscription/user rows. A provider outage can therefore leave a recurring charge without a durable local cancellation task.

### Resend and email DNS

- The configured credential can send but cannot read domains, delivery logs, suppressions, webhooks, or account identity.
- The sending subdomain has DKIM and SPF TXT records, but its required Return-Path MX record is absent. That must be corrected in Namecheap and verified in Resend before email can be treated as configured.
- Apex mail uses Namecheap forwarding; DMARC is `p=none`. Current delivery to the direct support inbox versus the forwarding alias was not retested, so the historical forwarding failure remains a hypothesis.
- No Resend delivery webhook or durable email delivery-state table was found. Delivered, bounced, delayed, suppressed, complained, rejected, and rate-limited outcomes are invisible to the app.
- Support email includes the user's address and free-form support text in the provider payload. That is operationally understandable but should be minimized and explicitly covered by retention/privacy policy.
- `AUTH_EMAIL_STUB_DIR` in the Auth.js provider lacks the explicit production guard used by the shared email helper. It is absent from production metadata, but the seam should still fail closed in production.

### Vercel

- The `revora` project in the expected team serves `revora.plus` and `www.revora.plus`; Node 24.x and Next.js 16.2.10 are in use.
- Production deployment `dpl_GsPy…P2GWc` is READY and was built from merged revision `fc8e9fa…`.
- That revision's GitHub E2E job is red. Vercel production deploy is not gated on CI success.
- Preview has only a small subset of integration variables and cannot act as the required nonproduction proving ground.
- A second `revora-irj3` Vercel project/environment footprint remains and should be confirmed as unused, then retired if safe.
- Functions are deployed in `iad1`; the inspected check route has a 15-second function timeout. No load test was run.
- Edge Config and Blob bindings exist. Rollback, deployment protection, log-retention, spend, and incident drills were not mutated or fully proven.

### Railway and PostgreSQL

- Canonical PostgreSQL runs the SSL image based on PostgreSQL 18.4. The database has 20 public tables, approximately 9 MB of data, 185 constraints, and 40 indexes; critical billing/subscription constraints are present.
- `__drizzle_migrations` is absent, so migration provenance cannot be reconciled against the journal even though the present schema contains expected critical objects.
- The app source limits each serverless pool to 3 connections, but the database allows 100 and no pooler was proven. Horizontal Vercel concurrency can still exhaust the server.
- The application database role can create objects in the database/public schema and is not least privilege.
- Backup schedules, retention, PITR, capacity alerts, and a restore test are not exposed through current CLI evidence.
- Two empty PostgreSQL services remain. They are orphan/confusion/cost risks; deletion requires owner approval after confirming no binding.
- `hourly-crons` runs at `0 * * * *` UTC with a curl image. Its configured noncanonical base URL returns `301`. `curl -fsS` treats that as success, prints `Redirecting...`, and the loop prints `done` without ever invoking the canonical handlers.

### Domain, DNS, and TLS

- `revora.plus` is registered through Namecheap; nameservers are Namecheap DNS. Registration expires 2027-07-21. Auto-renew, MFA, recovery contacts, and ownership monitoring are dashboard-blocked.
- Apex A and `www` CNAME resolve consistently through public resolvers. No AAAA record exists.
- HTTP redirects to HTTPS; `www` converges to the apex. Production code, canonical metadata, sitemap, robots, Auth.js, and billing URL contracts use `https://revora.plus`.
- Apex and `www` certificates are valid Let's Encrypt certificates for the correct hosts, valid through 2026-10-19 at audit time. TLS 1.0/1.1 were rejected; 1.2/1.3 succeeded.
- HSTS is present for two years with subdomains; preload is not enabled.
- DNSSEC and CAA are absent. `revora.app` resolves to an unrelated Render site and must not be used or redirected without independently proving ownership and authorization.
- `/.well-known/security.txt` returns 404.

### Auth.js and data lifecycle

- Auth.js uses database sessions, the Drizzle adapter, a Resend provider, and secure-origin behavior in production source.
- Live magic-link delivery, expiry, replay, sign-out-everywhere, export, deletion, and cross-user browser journeys remain unproven because email and browser access are blocked.
- Blob deletion failures are swallowed before user/data rows are cascaded, which can destroy the only direct object pointer. A store-wide orphan reaper exists but its scheduler is currently broken.
- Stripe cancellation failure is likewise swallowed before the user/subscription rows are removed.
- Encryption key version/old-key rotation metadata was not found in production env-name state; rotation and recovery remain unproven.

### OpenAI/OpenRouter

- Source uses the Responses API, `store:false`, a strict JSON schema, a 10-second timeout, zero SDK retries, one narrow connection retry, and Revora postprocessing/clinical-risk short circuits.
- Production has `OPENAI_BASE_URL` and a model override. The runtime log label `openai/gpt-5.4-mini` indicates an OpenRouter-style model identifier and conflicts with a source comment describing direct OpenAI. This is an evidence-based inference, not provider-account proof.
- Two distinct synthetic meal checks returned HTTP 200 with Revora response kind `retry`; the first correlated log completed in 439 ms. This is a deterministic provider/path failure, not a timeout at the browser.
- The exact upstream error is routed to Sentry, whose provider project is inaccessible. Provider identity, retention/data-use settings, zero-data-retention qualification, spend caps, and alerting are unproven.
- `store:false` controls endpoint storage behavior but does not by itself prove organization/provider data-retention policy, particularly when a third-party base URL is configured.

### Upstash

- Production URL/token names are present and the URL has an HTTPS REST shape. Health reports only `configured`; it does not test the Redis operation.
- The deployed limiter discards `@upstash/ratelimit`'s `reason: "timeout"`. The SDK intentionally returns a successful-looking result on its default timeout. Consequently, routes documented as fail-closed could fail open after a slow Upstash response.
- Local remediation preserves the timeout reason and enforces policy explicitly. Tests prove email/support fail closed, non-email paths fail open, and `/api/check` avoids the daily counter after the timeout.
- Account/database identity, region, latency, quota, spend, and alerting remain blocked.

### Vercel Blob

- Pantry upload source explicitly uses `access: "public"` so the model provider can fetch the image URL. Vercel defines public Blob objects as retrievable by anyone with the URL.
- Pantry images can contain health-adjacent household/food context. Public bearer-URL storage is not an acceptable default for this product.
- The safe design is a private Blob store plus server-side fetch/stream or short-lived authenticated access that is compatible with the model call.
- Source contains age-based cleanup and a store orphan reaper, but the Railway Pantry sweep is stale. Account deletion can also lose the pointer after a failed delete.
- No production upload/delete/GC mutation was authorized; no current Pantry DB rows were found in the read-only inspection.

### Edge Config, cron, push, Play, and PWA

- Edge Config store `revora-launch-controls` has `launch_mode=normal`, `public_checks_enabled=true`, and an empty incident message. Live health agrees. No pause/resume drill or owner/audit proof was authorized.
- Unauthenticated calls to all four hourly cron endpoints return `401`, proving the basic auth boundary only.
- VAPID keys and ownership-scoped push source are present; 404/410 subscriptions are pruned and payloads avoid health details. Nudge delivery is currently dead because the scheduler never reaches it. A transient send error records the send date before success and may suppress a retry until a later cadence.
- Google Play enablement variables are absent; verify returns `503` and unauthenticated RTDN returns `401`. The off-state is proven.
- Manifest, icons, service worker, robots, sitemap, and Open Graph assets return 200, but install/update/offline behavior was not proven in a functioning real browser.

### GitHub, CI/CD, monitoring, and operational dependencies

- The deployed revision's current CI run has successful static, unit/mock-eval, and secret-scan jobs but a failed Playwright job.
- There is no effective branch protection/ruleset, no GitHub environment protection, and required security features (Dependabot alerts, code scanning, secret scanning) are disabled/unavailable.
- Actions use mutable major tags instead of immutable commit SHAs.
- GitHub still lists an active `smoke` workflow even though `.github/workflows/smoke.yml` is absent from the current tree, indicating provider configuration drift.
- Ignored local `.env`, `.env.local`, and `openr.md` are mode `664`; contents were not read. Credential-adjacent files should be owner-only (`600`) and rotated if exposure is suspected.
- No meaningful external uptime/on-call proof was available. `/api/health` returns HTTP 200 and `ok:true` even while four critical jobs are stale, so it cannot be the sole release or uptime signal.

## 8. Cross-service journey results

| Journey | Result | Evidence and blocker |
|---|---|---|
| Public arrival and meal check | `FAIL` | DNS/TLS/Vercel/CSP/load pass; two fresh model calls returned fallback; browser/Umami/Sentry correlation incomplete |
| Magic-link authentication | `FAIL` | Auth source/DB present; email Return-Path MX absent, Resend logs inaccessible, no receipt/replay/expiry proof |
| Subscription/trial billing | `BLOCKED` | Live metadata/source strong; no safe test webhook chain, reconcile cron stale, account-delete cancellation unsafe |
| Pantry one-time workflow | `FAIL` | Public photo storage, stale GC, nondurable post-commit email, no full test transaction |
| Support case | `PARTIAL` | Auth and cooldown source present; no delivery state/receipt; free-form message goes to provider |
| Analytics | `PARTIAL` | Script and gateway accept; real browser and dashboard event visibility blocked |
| Error reporting | `FAIL` | Deployed browser duplicate init is privacy-unsafe; server/provider receipt blocked; local fix pending deploy |
| Scheduled reliability jobs | `FAIL` | Vercel weekly heartbeat fresh; all four Railway hourly jobs stale due redirect false-success |
| Account export/deletion | `FAIL` | Source paths exist; cancellation/delete failure can leave charge/orphan while pointers are lost; browser proof blocked |
| PWA and optional Play | `PARTIAL` | Assets load; browser PWA proof blocked; Play is `INTENTIONAL_OFF` |

## 9. Failure and recovery matrix

| Failure class | Expected behavior | Observed/current behavior | Required correction |
|---|---|---|---|
| Missing public integration env | Build or route fails closed with visible signal | Preview lacks most vars; protected surfaces unavailable | Create a segregated integration preview with nonproduction credentials |
| Model bad credential/route/refusal/malformed result | Cautious fallback, actionable telemetry, budget guard | User gets fallback; upstream cause inaccessible | Fix provider route and expose redacted provider failure telemetry/alert |
| Upstash timeout | Fail closed for email/support; fail open for other paths | Deployed code fails open because timeout reason is discarded | Deploy local fix; test controlled timeout in preview |
| Cron wrong origin/redirect | Job follows canonical endpoint and validates 2xx/body | Redirect logged as `done`; no handler effect | Set canonical origin; use `--location --fail-with-body`; validate expected JSON and alert |
| Duplicate/out-of-order Stripe event | Inbox idempotency and terminal/timestamp protection | Source/tests pass | Prove with test endpoint and signed duplicate/order matrix |
| Missed Stripe webhook | Verify-on-read and scheduled reconcile repair state | Reconcile scheduler stale | Repair scheduler; execute controlled missed-event recovery |
| Paid commit then email failure | Durable outbox/retry and visible failure | Email is best-effort after commit and not retried | Add transactional outbox + Resend event state/retry |
| Stripe cancel unavailable during deletion | Abort deletion or persist durable cancellation task | Error swallowed; local subscription pointer removed | Fail deletion or create durable cancellation outbox before deleting identity |
| Blob delete unavailable | Retain pointer and retry until confirmed | Failure swallowed; DB pointer can be cascaded | Tombstone + durable deletion queue; private storage |
| Provider event PII | Minimized/redacted with finite retention | Failed Stripe payload can remain raw; support email includes free text | Redact/minimize, set retention, encrypt where needed |
| Database restart/pool pressure | Bounded pool/pooler, retries, alerting | Pool max 3/instance but no global pooling proof | Add pooler/connection budget and alert; test controlled restart in preview |
| Backup loss | Scheduled backups/PITR and periodic restore proof | Provider state blocked | Enable/verify schedule and perform restore drill to isolated DB |
| Analytics/Sentry blackout | Synthetic canary and alert | Transport partly proven, provider receipt/alerts blocked | Add scheduled synthetic canaries and owner-routed alert |
| Red CI deployment | Production promotion blocked | Vercel deployed red browser run | Require CI/environment protection before production alias |
| Health degradation | Non-2xx or explicit degraded signal consumed by monitor | 200 and `ok:true` despite four stale jobs | Separate liveness/readiness/dependency health; alert on cron freshness |

## 10. Canonical issue ledger

| ID | Sev | Service/journey | Root cause and evidence | Impact | Remediation / owner | Retest | Status |
|---|---|---|---|---|---|---|---|
| I-01 | P1 | Meal check/model | Two fresh production requests returned `retry`; log model label indicates misrouted/broken compatible provider path | Core product journey unavailable; cost/error invisible | App/provider owner: correct base URL/key/model and verify synthetic schema path | 3 varied synthetic cases + failure modes + provider logs | OPEN |
| I-02 | P1 | Railway hourly jobs | Noncanonical `APP_URL` returns 301; curl treats redirect as success | Reconcile, nudge, precharge, GC all dead | Railway owner: canonical URL and strict final-response validation | Trigger in preview, verify 4 fresh heartbeats and effects | OPEN — external approval required |
| I-03 | P1 | Pantry Blob privacy | Upload source requests public objects | Photo exposure by bearer URL | Storage/app owner: private Blob plus server-side access | Cross-user URL, expiry, deletion, orphan tests | OPEN |
| I-04 | P1 | Auth email | Required Resend Return-Path MX absent; no provider/inbox proof | Users may not sign in | DNS/email owner: publish provider MX, verify domain, send approved synthetic links | Direct + forwarded inbox, replay, expiry, bounce | OPEN — external approval required |
| I-05 | P1 | CI/CD | Deployed SHA has red E2E; no promotion protection | Known broken revision can reach production | Repo/Vercel owner: fix trial-wall/nudge tests and gate production | Red test then protected green deployment | OPEN |
| I-06 | P1 | Stripe E2E proof | No Revora test webhook endpoint; live transaction not authorized | Billing/entitlement chain unproven | Payments owner: create test endpoint and synthetic customer flow | Checkout -> signed events -> inbox -> DB -> entitlement -> portal | BLOCKED — provider mutation/approval |
| I-07 | P1 | Account deletion/billing | Stripe cancel failure swallowed before local pointer deletion | User can be billed after account removal | Payments/data owner: abort or durable cancellation outbox | Inject Stripe outage and prove no orphan charge | OPEN |
| I-08 | P1 | Pantry paid email | Post-commit send is best effort and event becomes processed | Paid customer may never receive claim/report | Payments/email owner: transactional outbox and retry/dead-letter | Inject Resend failure then recover exactly once | OPEN |
| I-09 | P1 | Blob/account deletion | Blob delete error swallowed; database cascade removes pointer | Privacy-retention orphan | Storage/data owner: tombstone and durable delete queue | Inject delete failure and prove eventual cleanup | OPEN |
| I-10 | P1 | Browser Sentry privacy | Second weaker `Sentry.init` restored defaults | Health-adjacent data could enter telemetry | App owner: local patch already removes component | Deploy, safe browser canary, inspect scrubbed event | FIXED_LOCAL / DEPLOYMENT_PENDING |
| I-11 | P1 | Upstash fail-closed | SDK timeout reason discarded | Email/support amplification controls can fail open | App owner: local timeout-reason patch | Deploy and controlled preview timeout test | FIXED_LOCAL / DEPLOYMENT_PENDING |
| I-12 | P1 | Push/nudge | Enabled push depends on dead hourly scheduler | Nudge feature silently inert | Ops/app owner: close I-02 then correlate send/prune/effect | Fresh scheduler -> push -> cleanup proof | OPEN |
| I-13 | P2 | Health/monitoring | Health keeps 200/`ok:true` with stale critical crons | Monitors can report green during outage | App/ops owner: readiness/degraded semantics and freshness alert | Stale fixture must alert/non-green | OPEN |
| I-14 | P2 | DB durability | Backup/PITR/restore evidence inaccessible | Recovery point/time unknown | Railway/data owner: enable/verify and restore to isolated service | Documented restore with timing/checksum | BLOCKED — dashboard/approval |
| I-15 | P2 | DB governance | No migration table; app role can create objects; no pooler proof | Drift, privilege, connection risk | Data owner: reconcile baseline, least privilege, connection budget | Drift/role/pool exhaustion tests | OPEN |
| I-16 | P2 | Preview | Integration env families missing | Safe E2E/failure testing impossible | Vercel owner: nonproduction DB/provider projects and secrets | Full preview journey matrix | OPEN — external approval required |
| I-17 | P2 | Observability | Sentry/Umami/cron/uptime provider receipt and alerts unproven | Silent outages | Ops owner: grant read access, configure canaries/alerts/on-call | Canary receipt and alert ack | BLOCKED |
| I-18 | P2 | Stripe data retention | Failed inbox keeps full raw event payload indefinitely | PII retention/privacy risk | Payments/privacy owner: minimize/redact/encrypt and expire | Failure/replay still debuggable without PII | OPEN |
| I-19 | P2 | Resend delivery state | No webhooks/durable state/suppression processing | Delivery failures invisible; reputation risk | Email owner: signed event webhook and state machine | Delivered/bounced/suppressed/rate-limit matrix | OPEN |
| I-20 | P2 | DNS/email security | DNSSEC/CAA absent; DMARC monitor-only; sender MX incomplete | Spoofing/configuration risk | Domain owner: staged DNS hardening after mail proof | Authoritative + public resolver validation | OPEN — external approval required |
| I-21 | P2 | GitHub controls | No branch/env protection, security scans disabled, mutable actions | Supply-chain/release risk | Repo owner: protections, SHA pins, scanning | Forbidden merge/deploy test | OPEN |
| I-22 | P2 | Orphan resources | Two empty Railway DBs and zombie Vercel footprint | Cost/confusion/wrong binding risk | Platform owner: verify bindings then delete | Inventory shows only canonical resources | OPEN — destructive approval required |
| I-23 | P2 | Push retry | Transient failure stamps send date before success | Retry can be suppressed | App owner: record success only or explicit retry state | Inject 5xx then retry within window | OPEN |
| I-24 | P2 | Local credential hygiene | Ignored credential-adjacent files are mode 664 | Other local users/groups may read secrets | Workstation owner: chmod 600 and rotate if exposure suspected | File modes only; do not print contents | OPEN — owner action |
| I-25 | P3 | Hardening/docs | `security.txt` absent; 19 lint warnings; stale provider/workflow prose | Lower operational clarity | App/docs owner: address after P1/P2 | HTTP 200 security.txt, zero/new-warning budget | OPEN |

No P0 was demonstrated. Open P1s require `NO-GO`.

## 11. Commands and automated-test evidence

| Command/evidence | Revision/state | Exit/result | Unedited count/notes |
|---|---|---|---|
| `npm ci` | baseline local tree | 0 | 627 packages installed |
| `npm run lint` | pre-fix and post-fix | 0 | 19 warnings, 0 errors |
| `npm run typecheck` | pre-fix; post-fix executor; build | 0 | Next route types + `tsc --noEmit` pass |
| `npm test` baseline | before remediation | 0 | 165 files passed, 1 skipped; 1,872 tests passed, 2 skipped |
| Focused Sentry + rate-limit tests | local remediation | 0 | 46/46 passed |
| `npm test` clean-room | after remediation | 0 | 165 files passed, 1 skipped; 1,874 tests passed, 2 skipped |
| `npm run contract` | post-fix | 0 | All listed safety-contract gates passed |
| `npm run build` | post-fix local env | 0 | Next 16.2.10; 86 static pages generated; all routes built |
| `npx drizzle-kit check` | post-fix | 0 | `Everything's fine` |
| Scoped ESLint | remediation paths | 0 | No findings |
| Scoped `git diff --check` | remediation paths | 0 | Pass |
| Repository `git diff --check` | includes user-owned dirty docs | nonzero | Only pre-existing `docs/retention_flow.md:77` trailing whitespace |
| GitHub static job | deployed revision | success | typecheck/lint/contract/build |
| GitHub unit/mock eval | deployed revision | success | Provider-live proof not implied |
| GitHub secret scan | deployed revision | success | Repository scan only |
| GitHub Playwright | deployed revision | failure | 3 failed, 1 flaky, 21 skipped, 21 not run, 191 passed |
| Local browser QA | current workspace | blocked | Browser runtime crashed three times after rebuild; no browser claims made |

Initial failures were not hidden: CI E2E remains red, the production model path remains failed, and the repository-wide whitespace check remains nonzero because user-owned dirty work was preserved.

## 12. Live evidence index

| Time/reference | Evidence | Redacted result |
|---|---|---|
| 2026-07-22 14:27:46-04:00 | Initial Git/worktree snapshot | Local baseline, remote/deploy, dirty paths frozen |
| 2026-07-22 14:02:51-04:00 deployment | Vercel inspect/build logs | READY production deploy from `fc8e9fa…`, Next 16.2.10, Node 24.x |
| Audit window | GitHub run `29944975058` | Production SHA E2E failed; other listed jobs passed |
| Audit window | Production CSP/headers | Umami cloud+gateway and exact Sentry ingest allowed; HSTS present |
| Audit window | Umami synthetic marker | Script 200; gateway event POST 200; dashboard blocked |
| Audit window | Two synthetic model checks | Both HTTP 200 transport, both Revora `kind: retry`; no real user data |
| Audit window | Vercel runtime log | First call `check_completed`, `responseKind=retry`, 439 ms, model `openai/gpt-5.4-mini` |
| 2026-07-21 15:04Z last heartbeats | Production DB read-only | nudge, Pantry sweep, trial precharge, Stripe reconcile stale |
| Audit window | Railway hourly logs | `Redirecting...` followed by false `done` for all four paths |
| Audit window | Production DB read-only | DB healthy; 20 tables; no billing inbox/Pantry objects; no migration table |
| Audit window | Stripe CLI | Live endpoint/prices present; no Revora test endpoint |
| Audit window | DNS/TLS/resolvers | Canonical routing and certificates pass; sender Return-Path MX absent |
| Audit window | Safe negative probes | Cron/support/push unauthorized -> 401; bad Stripe signature -> 400; Play verify -> 503; RTDN no token -> 401 |
| 2026-07-22 16:31:13-04:00 | Final `/api/health` | DB ok; launch normal; BAI weekly ok; all four Railway jobs still stale; endpoint still reports `ok:true` |

Raw sensitive provider responses, secret values, database URLs, and real user data were not stored. The synthetic audit marker and provider object identifiers are intentionally shortened or omitted here.

## 13. Changes made

No provider configuration, DNS, deployment, database row, Stripe object, Resend message, push message, Edge Config value, Blob object, or production migration was changed.

Local source changes:

| File | Change | Why |
|---|---|---|
| `app/layout.tsx` | Removed `ClientErrorReporting` import/mount | Prevent second weaker browser Sentry initialization |
| `components/client-error-reporting.tsx` | Deleted obsolete component | Ensure one privacy-reviewed browser initializer |
| `lib/revora/rate-limit.ts` | Preserved SDK timeout reason and enforced route policy | Make documented fail-closed/fail-open behavior true |
| `tests/unit/revora/sentry-client-scrub.test.ts` | Added single-initializer/layout regression | Prevent reintroduction of duplicate init |
| `tests/unit/revora/rate-limit.test.ts` | Added three timeout behavior tests | Prove email closed, non-email open, and no daily-count increment |
| This report | Added durable evidence ledger | Required audit deliverable |

Permitted minimal external test effects:

- one synthetic Umami event was accepted;
- two minimal synthetic model calls were made with non-user, non-health-identifying fixtures;
- no email, charge, refund, subscription, webhook replay, cron replay, push, Blob upload, or provider mutation occurred.

## 14. Unresolved blockers and exact closing evidence

| Blocker | Owner/action required | Evidence that closes it |
|---|---|---|
| Model path returns fallback | OpenAI/OpenRouter owner: identify actual provider project, correct base/key/model, verify privacy/spend controls | 3 schema-valid synthetic successes plus timeout/refusal/malformed/rate-limit outcomes in provider and app logs |
| Hourly crons dead | Railway owner: canonical app URL and strict curl/body validation | Four fresh DB heartbeats and correlated job-specific effects/logs |
| Auth email DNS incomplete | Namecheap/Resend owner: add exact Resend MX, verify domain | Provider `verified`, direct and forwarded synthetic magic-link receipt, replay/expiry pass |
| Stripe chain unproven | Stripe owner: create Revora test webhook and authorize synthetic flow | Checkout -> signed webhook -> inbox -> DB -> entitlement/email -> portal/cancel -> reconcile |
| Sentry unproven | Sentry owner: grant project read access; deploy local fix | Fresh server/browser canaries in correct env, sensitive fields absent, alert delivered |
| Umami dashboard unproven | Umami owner: grant website read access | Browser action visible exactly once with safe properties and expected route/attribution |
| Blob privacy | Vercel/app owner: private store migration | Unauthorized URL fails; model still processes; delete/GC/account deletion proven |
| Backups/PITR | Railway/data owner: grant dashboard access and approve isolated restore | Current schedule/retention plus timed restore and integrity check |
| Browser/PWA/auth journeys | Tool/workstation owner: repair browser runtime or provide usable browser session | Console/network/CSP/cookie/service-worker evidence for all critical journeys |
| CI production gate | GitHub/Vercel owner: enable protection and required checks | Red build cannot receive production alias; green build can |

## 15. Rollback and incident-response readiness

Current readiness is insufficient:

- Edge Config provides a working read path and source-level kill switch, but no safe pause/resume drill, ownership audit, or alert was proven.
- Vercel can redeploy/rollback, but a rollback can restore code incompatible with the current database schema and does not update cron schedule configuration automatically. No revision+schema rollback drill exists.
- Railway cron is already silently failed; there is no reliable external alert.
- Database backup/restore evidence is unavailable, so recovery-point and recovery-time objectives are unknown.
- Stripe inbox and verify-on-read are strong source-level recovery mechanisms, but the scheduled reconciliation path is dead.
- Pantry Blob cleanup has source recovery paths, but public storage plus a dead scheduler defeats the privacy objective.
- Named on-call owners, provider incident subscriptions, log retention, quota alerts, and escalation acknowledgements were not proven.

Minimum incident readiness before launch: named owner per P1 service, external synthetic monitoring, a canonical degraded/readiness signal, alert acknowledgement, tested kill switch, tested Stripe/DB recovery, and a written rollback compatibility matrix.

## 16. Residual risk and monitoring gaps

- A 200 transport response can conceal a failed model outcome.
- `/api/health` can be green while all hourly recovery jobs are dead.
- Sentry and Umami can silently black out without current provider-side detection proof.
- Email delivery is neither provider-stateful in the app nor externally monitored.
- Shared Stripe-account scope and orphan infrastructure increase wrong-project mistakes.
- Preview cannot reproduce production integrations safely.
- DB connection pressure, backups, restores, and least privilege are not operationally proven.
- Provider data-use/retention settings for the actual OpenAI-compatible route are unknown.
- Browser CSP/script/cookie/service-worker truth is blocked by a broken browser harness.
- Local remediation is not production remediation until committed, reviewed, deployed, and live-retested.

## 17. Ordered action plan

### Next 24 hours

1. Keep launch/billing/Pantry expansion paused; communicate `NO-GO` to the release owner.
2. Repair Railway `APP_URL` and harden the scheduler command; prove all four effects and create stale-heartbeat alerts.
3. Diagnose the actual OpenAI/OpenRouter route from provider logs and restore three synthetic successful structured responses.
4. Add the exact Resend Return-Path MX in Namecheap, obtain full read access, and verify domain/inbox delivery.
5. Review and land the two local fixes; deploy only after CI is green, then run Sentry and Upstash preview/live canaries.
6. Stop accepting Pantry photos until private Blob design is deployed and deletion recovery is proven.
7. Fix the trial-wall E2E regression and flaky nudge test; block production promotion on required CI.

### Next 7 days

1. Create isolated Stripe test-mode webhook/project flow and run the complete subscription and Pantry matrices.
2. Implement durable outboxes for billing email, cancellation, and Blob deletion; add recovery dashboards.
3. Add signed Resend delivery webhooks, suppression/bounce handling, retry/dead-letter ownership, and message minimization.
4. Establish Railway backups/PITR, perform an isolated restore, reconcile Drizzle migration provenance, and restrict the app role.
5. Build a true integration-preview environment with nonproduction DB/provider projects.
6. Add Sentry/Umami synthetic canaries, quotas, owner-routed alerts, source maps if required, and documented retention.
7. Enable GitHub/Vercel protections, SHA-pin Actions, enable available security scanning, and remove stale provider workflow/project resources.

### Before scale

1. Add global DB connection budgeting/pooling, provider cost alerts, and controlled outage exercises.
2. Move DMARC toward enforcement after delivery monitoring; add DNSSEC/CAA and registrar recovery/renewal monitoring.
3. Prove PWA install/update/offline, push across representative browsers, timezone behavior, and transient retry recovery.
4. Run quarterly restore, Stripe replay/reconcile, email deliverability, kill-switch, and account-deletion drills.
5. Define SLOs and external monitoring for model success-kind rate, magic-link receipt, billing inbox age, cron freshness, email outcomes, Sentry/Umami canaries, Blob orphan age, and DB capacity.

## 18. Definition-of-done checklist

- [x] Current source, dirty work, merged branch, deployed revision, and provider truth recorded separately.
- [x] External hosts, SDKs, env-name references, webhooks, crons, DB/storage, and feature-gated providers inventoried.
- [ ] Sentry server and browser canaries arrive in the correct project with no sensitive data.
- [ ] Umami real-browser event arrives once in the correct dashboard with safe properties.
- [ ] Complete Stripe event-to-entitlement/email/reconciliation chain is proven for each enabled product.
- [ ] Resend magic links and operational email reach intended inboxes with verified domain authentication.
- [x] Vercel canonical domain serves the identified merged revision with expected core headers.
- [ ] The deployed revision is green in required CI and includes the local remediation.
- [ ] Railway canonical DB is backed up, restore-tested, migration-reconciled, least-privileged, and capacity-monitored.
- [x] DNS/TLS/canonical web redirects agree for `revora.plus`.
- [ ] Email DNS, Auth.js callbacks, and real magic-link behavior pass end to end.
- [ ] Auth sessions, export/deletion, encryption rotation, and cross-user isolation are live-validated.
- [ ] OpenAI-compatible output succeeds through Revora schema/postprocess/safety and provider privacy/spend controls are proven.
- [ ] Upstash success, limit, timeout, and outage policy is deployed and preview-tested.
- [ ] Blob objects are private and every deletion/GC path is proven.
- [ ] Edge Config pause/resume and all cron recovery paths are proven and monitored.
- [ ] Push is fully proven; Play remains demonstrably off.
- [ ] All critical journeys pass in a real browser with provider/DB correlation.
- [x] Every discovered material issue has severity, root cause, owner/action, and retest evidence requirement.
- [ ] No P1 remains and no launch-critical proof is blocked or inferred.
- [x] No secrets or real user health data were exposed during the audit.
- [x] Required report saved and remediation paths pass `git diff --check`; unrelated user work remains untouched.

## 19. Current official requirements consulted

Access date for every source: 2026-07-22.

| Provider | Official source | Requirement used |
|---|---|---|
| Stripe | [Webhook integration](https://docs.stripe.com/webhooks?lang=node) | Verify signatures, return quickly, handle retries, duplicates, and unordered delivery |
| Resend | [Domains introduction](https://resend.com/docs/dashboard/domains/introduction) and [domain verification troubleshooting](https://resend.com/docs/knowledge-base/what-if-my-domain-is-not-verifying) | DKIM and SPF/Return-Path DNS records must be correctly published and verified |
| Resend | [Webhook event types](https://resend.com/docs/webhooks/event-types) and [storing webhook data](https://resend.com/docs/dashboard/webhooks/how-to-store-webhooks-data) | Observe delivered/bounced/delayed/complained/suppressed outcomes durably |
| Umami | [Tracker configuration](https://docs.umami.is/docs/tracker-configuration) | Script attributes, DNT, host, and event collection behavior |
| Vercel | [Environment variables and security](https://vercel.com/academy/nextjs-foundations/env-and-security) | `NEXT_PUBLIC_*` variables are bundled at build time |
| Vercel | [Cron jobs](https://vercel.com/docs/cron-jobs) and [managing cron jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs) | UTC schedules, auth, idempotency/overlap, and deployment behavior |
| Vercel | [Blob overview](https://vercel.com/docs/vercel-blob), [private storage](https://vercel.com/docs/vercel-blob/private-storage), and [Blob security](https://vercel.com/docs/vercel-blob/security) | Public objects are URL-accessible; private storage is appropriate for controlled access |
| Vercel | [Edge Config get started](https://vercel.com/docs/edge-config/get-started) | Runtime binding and read behavior |
| Railway | [Cron jobs](https://docs.railway.com/cron-jobs) | Schedules are UTC, jobs must exit, and overlapping runs can be skipped |
| Railway | [PostgreSQL](https://docs.railway.com/databases/postgresql), [backups](https://docs.railway.com/volumes/backups), and [PITR](https://docs.railway.com/volumes/point-in-time-recovery) | Database operation, backup scheduling/retention, and point-in-time recovery are explicit owner responsibilities |
| OpenAI | [Data controls by endpoint](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint), [business data](https://openai.com/business-data/), and [GPT-5.4 model](https://developers.openai.com/api/docs/models/gpt-5.4) | Endpoint storage/data-control behavior, no-training defaults, and current model contract; third-party base URLs require separate proof |
| Upstash | [Ratelimit features](https://upstash.com/docs/redis/sdks/ratelimit-ts/features) and [methods](https://upstash.com/docs/redis/sdks/ratelimit-ts/methods) | Timeout results can be fail-open and expose a `reason` that callers must interpret |
| GitHub | [Protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches) | Required status checks and review protections prevent unsafe merges |
| Sentry | [Next.js manual setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/) | Separate runtime initialization and deploy/release integration require explicit configuration |

## Final release decision

`NO-GO` remains mandatory. The release can be reconsidered only after all P1s are closed, the two local fixes are deployed and live-proven, required provider identities/receipts are accessible, the complete critical journeys pass in a real browser and provider/database correlation, and the deployed revision is protected by green CI.
