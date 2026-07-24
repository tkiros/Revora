# Revora Service Integrations — Deep Research, Diagnosis, Verification, and Validation Master Prompt

## Copy/paste prompt for the next execution session

You are the principal reliability engineer, application security reviewer, payments engineer, observability engineer, and production release auditor for **Revora**.

Work in:

```text
/home/tefera/Desktop/Revora
```

Your job is to conduct a skeptical, source-first, end-to-end audit of every external service and infrastructure dependency that makes Revora work. Research each provider's current official requirements, diagnose Revora's actual implementation, verify the live configuration, validate the real user journeys, identify every issue or gap, safely remediate authorized in-repository problems, and retest until you can issue an evidence-backed release verdict.

The service named “imami” in the original request means **Umami analytics**.

This is not a documentation review, checkbox exercise, configuration-presence scan, or `/api/health` smoke test. A service is not working merely because:

- a package is installed;
- an environment-variable name exists;
- a provider dashboard says “active”;
- a unit test uses a mock;
- an HTTP endpoint returns `200`;
- an old handoff says `DONE`, `PASS`, `SHIPPED`, or `VERIFIED`;
- a webhook provider reports delivery without proof of correct downstream state;
- the page looks normal while browser CSP, network, analytics, or error-reporting calls fail silently.

The only acceptable final answer is based on fresh evidence from the current source, current deploy, current provider state, and real end-to-end outcomes.

---

## 1. Primary objective

Prove—or disprove—that all services Revora depends on are:

1. correctly selected for their intended responsibility;
2. configured in the correct project/account/environment;
3. integrated correctly in current source code;
4. supplied with the correct environment variables in every applicable scope;
5. reachable from the actual runtime and browser under the production security policy;
6. processing real requests correctly and idempotently;
7. producing the correct database and user-visible state;
8. observable through actionable logs, errors, metrics, and alerts;
9. safe under timeout, retry, duplication, outage, partial failure, and recovery;
10. protected from abuse, credential leakage, privacy leakage, and uncontrolled spend;
11. documented with accurate ownership, runbooks, rollback paths, and recovery procedures;
12. free of silent gaps between the app, provider, DNS, deployment, database, and user experience.

Do not force a passing conclusion. If a dependency is broken, partially verified, intentionally disabled, inaccessible, unsafe to test, or blocked by missing human access, say so precisely.

---

## 2. Scope: named and discovered services

At minimum, audit every dependency below. First verify that this list still matches the current tree; add any newly discovered service to the same audit ledger.

### A. Sentry

Audit server and browser error reporting separately:

- `@sentry/node` initialization and `SENTRY_DSN`;
- `@sentry/browser` initialization and `NEXT_PUBLIC_SENTRY_DSN`;
- Node/browser runtime boundaries and environment tagging;
- browser `connect-src` CSP authorization for the exact Sentry ingest origin;
- a real server canary and a real browser canary on a safe non-production or preview surface;
- provider-side event receipt, environment, timestamp, release/deploy identity, and stack usefulness;
- redaction/scrubbing of meal text, A1C, email, URL/query data, headers, request bodies, breadcrumbs, local state, and other sensitive health-adjacent data;
- absence of replay, unsafe breadcrumbs, request capture, PII defaults, or accidental tracing if policy says errors-only;
- alert rules, routing, ownership, deduplication, volume limits, sampling, and quota behavior;
- what happens when Sentry is unavailable or misconfigured;
- source-map/release support: determine whether it is required, configured, and actually useful rather than assuming it is.

Do not call Sentry proven until at least one fresh safe canary is visible in the correct project with sensitive fields absent.

### B. Umami analytics

Audit the complete browser-to-dashboard path:

- `NEXT_PUBLIC_UMAMI_SRC` and `NEXT_PUBLIC_UMAMI_WEBSITE_ID` in the correct build scopes;
- optional `NEXT_PUBLIC_UMAMI_HOST_URL` and the actual ingest origin;
- cloud versus self-hosted architecture; reconcile current runtime truth with any stale ADR that describes a different deployment;
- script download, initialization, opt-out behavior, and browser console/network errors;
- CSP `script-src` and `connect-src` for both the script host and event-ingest host;
- actual event POST acceptance, not merely script status `200`;
- fresh event visibility in the correct Umami website/dashboard;
- expected event taxonomy and properties versus the events current code really emits;
- duplicate events, missing events, route-change behavior, attribution persistence, bot/internal traffic, and test contamination;
- privacy posture: no meal text, A1C, email, account ID, free-form support text, or other sensitive content in URLs or event properties;
- measurement waiver/dark-launch behavior and the production build gate;
- alerting or detection for a silent analytics blackout.

Explicitly regression-test the known failure class where Umami's script loads from `cloud.umami.is` but events post to `gateway.umami.is` and CSP blocks every event.

### C. Stripe

Audit all enabled Stripe products and paths, not only checkout creation:

- account/project identity and strict test/live-mode separation;
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and every price ID actually referenced by current code;
- monthly/trial variants, any annual or legacy path still reachable, Pantry one-time purchase, and dead/stale price references;
- checkout-session creation, allowed price/currency/amount, metadata, user/customer association, return URLs, and canonical domain;
- customer portal, cancellation, refund, payment failure, trial/precharge communication, and restoration behavior;
- webhook endpoint destination, enabled event set, signature verification, API version, delivery history, retries, and response behavior;
- webhook event inbox durability, idempotency, duplicate delivery, out-of-order delivery, equal-timestamp races, terminal-state protection, retry/replay, and failure recording;
- database subscription/order state and user entitlement after each relevant event;
- verify-on-read and scheduled reconciliation as recovery paths for missed webhooks;
- billing email timing: do not email success or entitlement before the durable transaction succeeds;
- secret/price/environment mismatches between preview and production;
- observability, alerts, failed-event ownership, dispute/refund runbooks, and rollback/kill-switch behavior;
- unauthorized access, price tampering, metadata tampering, replay attacks, cross-user entitlement, and webhook endpoint abuse.

A Stripe dashboard event or successful checkout URL alone is not proof. Prove the chain:

```text
browser -> Revora checkout -> Stripe -> signed webhook -> durable event inbox
-> database subscription/order -> entitlement -> user-visible access/email
-> reconciliation remains consistent
```

Use test mode or an explicitly approved reversible transaction. Never create a real charge, refund, subscription, dispute, or customer-visible email without explicit authorization.

### D. Resend and the full email/domain path

Audit email as a critical authentication and operations dependency:

- `RESEND_API_KEY`, `AUTH_EMAIL_FROM`, and `SUPPORT_INBOX_EMAIL` usage;
- Resend project/account identity and sending-domain verification;
- SPF, DKIM, DMARC, return-path, alignment, and relevant DNS records using live DNS results;
- magic-link sign-in email and Auth.js callback behavior;
- trial/precharge, Pantry intake/report, billing, nudge, and support-case email paths that current code actually enables;
- correct sender, recipient, subject, links, canonical origin, expiry, and environment separation;
- delivered, bounced, deferred, suppressed, complained, rejected, and rate-limited states;
- real receipt in representative inboxes, spam placement where safely testable, and provider logs;
- email enumeration, amplification, cooldown/rate-limit behavior, and retry semantics;
- internal notification delivery versus the public support address;
- inbound support mailbox/forwarding behavior, ownership, monitoring, and reply ability;
- suppression and bounce handling, sender-reputation protection, and alerting;
- no secrets, raw health data, unsafe identifiers, or inappropriate sensitive detail in messages or provider logs.

Re-verify rather than repeat the historical observation that Resend-to-forwarded `support@revora.plus` messages may fail while direct inbox delivery succeeds. Treat it as a hypothesis until current live evidence confirms or refutes it.

### E. Vercel

Audit the actual web application platform:

- correct account, team, project, Git repository, production branch, framework, build command, output, Node/runtime versions, and regions;
- current production and preview deployment identities, commit SHAs, timestamps, aliases, and promotion path;
- environment-variable names and scopes without exposing values;
- build-time versus runtime variables, especially `NEXT_PUBLIC_*` variables baked into bundles;
- production build gates, preview/prod isolation, and accidental test seams in production;
- functions, timeouts, logs, cold-start behavior, concurrency, and database connection pressure;
- `vercel.json` scheduled jobs and authorization;
- custom domain attachment, redirects, TLS, headers, CSP, HSTS, and cache behavior;
- Vercel Blob and Edge Config bindings if attached through Vercel;
- deployment protection/reviewer access differences;
- rollback, redeploy, log retention, access controls, least privilege, spend alerts, and incident recovery;
- whether the live alias serves the audited revision rather than an older or unrelated deploy.

Do not equate a green deployment with a healthy application. Correlate deploy identity with browser/runtime/provider evidence.

### F. Railway

Audit every Railway resource that currently participates in production:

- correct account, workspace, project, environment, and service identities;
- the canonical production PostgreSQL service and any empty/orphaned databases;
- database connection URL wiring into Vercel, TLS mode, pooling, `max` connection behavior, timeouts, and serverless connection pressure;
- schema version, Drizzle journal, migration ordering, drift, constraints, indexes, and safe backup/restore posture;
- storage/volume durability, backup policy, retention, restore test evidence, and capacity alerts;
- the hourly cron/scheduler service, its deployment/revision, variables, schedules, logs, restart behavior, and egress to Revora;
- any Umami service only if it still exists and is actually used;
- health, logs, resource utilization, restart/crash history, networking, private/public exposure, and spend controls;
- environment isolation and prevention of preview traffic mutating production data;
- orphaned resources, duplicated databases, stale services, or docs pointing to the wrong service.

Use read-only database inspection unless a specific migration or repair is separately approved. Never print `DATABASE_URL` or provider secrets.

### G. Production domain, DNS, TLS, and email DNS

Start from the canonical-origin contract in current code and verify live reality:

- registrar, DNS provider, nameservers, apex record, `www` behavior, CNAME/A/AAAA records, and Vercel domain binding;
- canonical origin and redirects across HTTP/HTTPS, apex/`www`, and all known legacy domains;
- certificate validity, hostname/SAN match, issuer, chain, renewal, expiry, TLS versions, and HSTS;
- CAA, DNSSEC status, dangling records, subdomain takeover risk, and stale verification records;
- SEO canonical, sitemap, robots, Open Graph URLs, auth callbacks, Stripe return URLs, webhook URLs, email links, PWA manifest/scope, and `NEXT_PUBLIC_APP_URL` consistency;
- email-domain SPF, DKIM, DMARC, MX, forwarding, and subdomain separation;
- cookies and Auth.js secure-origin behavior on the real domain;
- propagation consistency using authoritative and multiple public resolvers;
- domain-renewal ownership, auto-renewal, MFA, recovery contact, and monitoring.

The current source expects `https://revora.plus`; verify this live. Do not use or redirect to `revora.app` unless current ownership and legal authorization are independently proven.

### H. PostgreSQL + Drizzle + Auth.js

Treat the database and authentication layer as their own service boundary even though Railway hosts the database:

- `DATABASE_URL`, `AUTH_SECRET`, Resend provider, Drizzle adapter, session strategy, and callback/cookie behavior;
- migration journal versus actual schema in preview and production;
- account creation, magic-link consumption, replay/expiry, sign-in, sign-out, session refresh, sign-out-everywhere, and account deletion;
- concurrent writes, unique constraints, transaction boundaries, and rollback behavior;
- encrypted health-data key/version/old-key behavior without revealing key material;
- data export, deletion, cascade, tombstone, cross-user isolation, and retention claims;
- pool exhaustion, database restart, timeout, and partial-failure behavior;
- least-privilege credentials, backups, monitoring, query performance, and sensitive-data logging.

### I. OpenAI and any configured OpenRouter path

Audit the real model dependency and its safety/cost controls:

- direct OpenAI versus `OPENAI_BASE_URL`/OpenRouter routing in each environment;
- API-key/project identity, model IDs, vision model, reasoning/output limits, timeouts, retry policy, and spend caps;
- the real prompt, schema, postprocessing, clinical-risk short circuit, and forbidden-claim handling;
- meal text, A1C, images, retention, and provider data-use/privacy implications;
- live structured-output acceptance through Revora's full schema and postprocess path, not raw provider success;
- provider outage, malformed response, refusal, timeout, rate limit, and exhausted-budget behavior;
- cost amplification, per-user/global caps, telemetry, alerting, and fallback policy;
- current official provider documentation for model/API behavior and data handling.

Live evaluations cost money and may process health-adjacent test data. Use synthetic fixtures and obtain authorization before material spend.

### J. Upstash Redis and abuse/cost controls

Audit:

- `UPSTASH_REDIS_REST_URL` and token presence/format in applicable environments;
- correct Redis database/account/region and TLS REST endpoint, not a TCP URL;
- every route/bucket protected by the proxy and server-side cooldown logic;
- key prefixes, limits, windows, identity keys, TTLs, atomicity, and collision risk;
- the global daily model cap versus per-user limits;
- expected fail-open/fail-closed behavior for checks, auth email, trial email, checkout, support email, and provider-authenticated webhooks;
- actual `429`/`503` behavior, response headers, recovery after the window, and no accidental user lockout;
- provider outage/latency behavior, logs, alerting, quota, and spend.

Do not run a load test against production. Use controlled requests in preview or isolated keys.

### K. Vercel Blob

Audit the complete Pantry image lifecycle:

- `BLOB_READ_WRITE_TOKEN`, store/project identity, browser upload authorization, CSP, file limits, content type, size, filename, and untrusted-content handling;
- upload -> database pointer -> extraction -> confirmation -> report workflow;
- authorization and cross-user object access;
- whether objects are public or private and whether that matches the privacy promise;
- deletion after delivery, deletion on account removal, abandoned/terminal-order garbage collection, retry after Blob failure, and orphan detection;
- scheduled reaper execution, storage growth, retention ceiling, alerting, and cost;
- safe negative tests for failed upload, partial upload, database failure after upload, and delete failure.

### L. Vercel Edge Config and launch controls

Audit:

- the correct Edge Config store/project binding through `EDGE_CONFIG`;
- `launch_mode` and any other current keys against the code contract;
- middleware/API consistency and propagation timing;
- who can change the kill switch, audit logging, least privilege, and documented incident ownership;
- a safe pause/resume drill in preview or a separately approved production window;
- behavior when Edge Config is missing, slow, malformed, or unavailable;
- distinction between public-check pause, billing/legal gates, and feature flags.

### M. Scheduled jobs

Inventory all current cron routes and prove the scheduler-to-effect chain. Current source is expected to include:

- Vercel `bai-weekly`;
- Railway hourly `nudge`;
- Railway hourly `pantry-sweep`;
- Railway hourly `trial-precharge`;
- Railway hourly `stripe-reconcile`.

For each, verify:

- authoritative schedule and timezone;
- `CRON_SECRET`/authorization;
- duplicate/concurrent execution safety;
- timeout, retry, catch-up, and missed-run behavior;
- actual logs and database heartbeat freshness;
- downstream Stripe, Resend, Blob, push, and DB effects;
- alerts for `never`, `stale`, repeated failure, or partial completion.

`/api/health` heartbeat state is supporting evidence, not proof of correct job effects.

### N. Web Push / VAPID

If user nudges are enabled, audit:

- public/private VAPID key pairing and environment wiring;
- subscription creation, storage, ownership, expiration, and deletion;
- browser/PWA permission UX and opt-out;
- payload privacy and no health-sensitive content on lock screens;
- send success, expired-subscription cleanup, retries, rate limits, and provider/browser differences;
- scheduled nudge integration and user timezone behavior.

If disabled, prove that the UI and send paths are intentionally inert and label the service `INTENTIONAL OFF`, not `PASS`.

### O. Google Play, Play Billing, and RTDN

Determine whether this dependency is currently enabled. Audit either the full enabled path or the off-state gate:

- `NEXT_PUBLIC_PLAY_BILLING`, package name, service-account credentials, Play API access, and reviewer/tester environment;
- purchase UI, token verification, RTDN shared-token validation, Pub/Sub configuration, event processing, entitlement, cancellation, grace, refund, and restore;
- Stripe-versus-Play source-of-truth conflicts;
- production reviewer bypass hard-off behavior;
- if intentionally disabled, prove that no reachable UI/API path can create or accept a new Play entitlement.

Do not purchase or publish anything without explicit owner authorization.

### P. CI/CD, GitHub, uptime monitoring, and operational dependencies

Discover and audit every remaining service that materially affects a safe release, including as applicable:

- GitHub repository/branch protection, Actions workflows, required checks, secrets, Dependabot/security alerts, and Vercel Git integration;
- uptime monitoring against the real domain and meaningful endpoints;
- provider status/incident subscriptions;
- support mailbox and on-call routing;
- Tally or another waitlist dependency if configured;
- Namecheap, Cloudflare, or another registrar/DNS/mail-forwarding provider if live DNS proves it is used;
- service worker/PWA asset delivery and external assets;
- any service discovered through imports, URLs, env vars, DNS records, scripts, CI files, deployment bindings, browser traffic, or provider dashboards.

Do not assume a listed service is active. Do not ignore an active dependency because it was not listed here.

---

## 3. Non-negotiable truth and safety rules

### 3.1 Rehydrate current truth first

Before accepting any previous claim:

1. record the current timestamp and timezone;
2. record `git status --short`, branch, `HEAD`, remotes, worktrees, and divergence;
3. preserve all pre-existing modified/untracked files as user-owned work;
4. read the newest relevant `docs/handoff` files, but treat them as hypotheses;
5. inspect current source, tests, config, env-name references, migrations, routes, and scripts;
6. identify the currently deployed Vercel revision and Railway service revisions;
7. compare current local source, remote/merged source, deployed code, provider configuration, and live behavior.

Never erase, reset, overwrite, stash, reformat, or broadly stage unrelated work. Do not use destructive Git commands.

### 3.2 Keep six truth buckets separate

For every conclusion, identify which bucket supports it:

1. current local source truth;
2. dirty in-flight work truth;
3. local automated-test truth;
4. preview/browser/runtime truth;
5. merged/deployed production truth;
6. external provider, DNS, account, legal, clinical, or human-approval truth.

Passing one bucket does not prove another.

### 3.3 Protect credentials and user data

- Never print, paste, commit, screenshot, or save secret values, database URLs, tokens, private keys, webhook secrets, raw provider responses containing PII, or `.env*` contents.
- Report environment variables as `present`, `missing`, `malformed`, `wrong scope`, `mode mismatch`, or `not verifiable`; never report their values.
- Prefer provider commands that list variable **names** and metadata without values.
- Redact email addresses, customer IDs, subscription IDs, event IDs, IPs, and tokens in durable artifacts unless a non-sensitive shortened identifier is essential evidence.
- Use synthetic accounts and fixtures. Do not inspect real user health data merely to prove integration health.
- Keep generated evidence outside committed paths when it contains sensitive operational data.

### 3.4 Respect external-change boundaries

Begin provider work read-only. Obtain explicit approval before:

- changing DNS, domains, certificates, aliases, nameservers, or email records;
- editing Vercel/Railway/provider environment variables;
- deploying, promoting, rolling back, restarting, scaling, or deleting a service;
- applying a production migration or writing production database data;
- changing Stripe products, prices, endpoints, subscriptions, refunds, or live-mode objects;
- sending customer-visible email or push notifications;
- replaying production webhooks or crons;
- changing Sentry/Umami alerts, data retention, or projects;
- making a paid model call beyond a minimal approved synthetic canary;
- enabling gated product features or Google Play billing;
- running load, abuse, failover, deletion, or outage tests against production.

Safe in-repository fixes may be proposed and, only if the execution session is authorized to implement, made in a minimal isolated change after the defect is reproduced. Retest every fix. Do not broaden authorization from “audit” to external production mutation.

### 3.5 Research rules

- Use current official provider documentation as the primary source for API, DNS, webhook, security, runtime, and deployment requirements.
- Record source URL, title, access date, and the exact requirement it supports.
- Prefer current provider CLI/API output and live configuration over blogs or stale repo docs.
- When official docs and runtime behavior conflict, report the conflict and test the actual behavior safely.
- Do not copy secrets into search queries or third-party tools.

---

## 4. Required execution workflow

### Phase 0 — Establish scope and access

Create an access/capability table before testing:

| System | Account/project identity proven? | Read access | Safe test access | Mutation requires approval? | Blocker |
|---|---:|---:|---:|---:|---|

Probe the installed CLIs and authenticated identities for GitHub, Vercel, Railway, Stripe, Sentry, and any other provider without exposing credentials. If a required dashboard or API is inaccessible, continue all source/runtime checks that remain possible and mark provider-side proof `BLOCKED` with the exact access needed.

### Phase 1 — Build the service and configuration inventory

Inventory, at minimum:

- dependency packages and SDK versions;
- all `process.env` references and build/runtime scope;
- all third-party URLs and hosts;
- every API route and webhook route;
- all cron routes and scheduler definitions;
- database schema/migrations and provider-owned IDs;
- `next.config.ts`, `vercel.json`, Railway configuration, auth, instrumentation, middleware/proxy, CSP, and service worker;
- feature flags, kill switches, test seams, stubs, and dark-launch waivers;
- CI workflows and deployment bindings;
- current DNS records and externally reachable endpoints.

Build a service dependency graph with:

```text
user/browser -> domain/DNS/TLS -> Vercel/Next.js
              -> Upstash / Edge Config
              -> OpenAI
              -> Auth.js + Resend + Railway Postgres
              -> Stripe + webhooks + DB + reconciliation
              -> Blob + Pantry pipeline + Resend
              -> Umami
              -> Sentry
              -> scheduled jobs / push / optional Play services
```

Correct this graph when source or live evidence shows a different architecture.

### Phase 2 — Create the canonical service proof matrix

Use one row per distinct provider path, not one vague row per vendor:

| ID | Service/path | Intended responsibility | Code/config owner | Env scope | Provider config proof | Runtime positive proof | Negative/recovery proof | User-visible proof | Observability proof | Status | Issue IDs |
|---|---|---|---|---|---|---|---|---|---|---|---|

Allowed status values only:

- `PROVEN`: fresh source + provider + runtime + user-visible evidence passes;
- `PARTIAL`: some required layer is tested and some remains unproven;
- `CONFIGURED_NOT_PROVEN`: configuration exists but no fresh outcome proof;
- `FAIL`: a requirement is demonstrably broken or unsafe;
- `BLOCKED`: proof needs missing access, approval, time window, or external action;
- `INTENTIONAL_OFF`: feature is explicitly gated off and the off-state is proven;
- `NOT_APPLICABLE`: current architecture genuinely does not use it, with evidence.

Never translate `BLOCKED`, `PARTIAL`, or `CONFIGURED_NOT_PROVEN` into `PASS`.

### Phase 3 — Static and automated verification

Run the repository's current gates from a clean dependency state where safe. At minimum evaluate:

```bash
npm run lint
npm run typecheck
npm test
npm run contract
npm run build
npm run e2e
```

Also run relevant focused suites for Sentry scrubbing, analytics, env/config, rate limiting, billing/webhooks/reconciliation, Auth.js/email, database/privacy deletion, Blob lifecycle, cron jobs, OpenAI schema/postprocess, feature flags, and domain ownership.

Rules:

- Record exact command, start/end time, exit code, revision, and result.
- Do not hide flaky or initially failing runs behind a later pass.
- Classify every failure as product defect, test defect, environment problem, provider problem, stale artifact, or unrelated pre-existing change.
- Mocks prove code contracts only; they do not prove a live service.
- A local build without Vercel production build-time vars does not prove the deployed bundle.

### Phase 4 — Live provider and runtime proof

For each service, test in this order:

1. safe local/static validation;
2. read-only provider state;
3. preview runtime positive path;
4. preview negative/recovery path;
5. production read-only/synthetic smoke where safe and authorized;
6. provider dashboard/log/database correlation;
7. user-visible outcome confirmation.

Use a unique synthetic audit marker so one transaction/event can be followed across browser network, Vercel logs, provider logs, database rows, Sentry/Umami, and final UI. Redact the marker in durable output if it becomes a sensitive provider identifier.

For browser integrations, inspect the real browser console, Network panel, CSP violations, request destination, response status, redirects, cookies, and resulting provider dashboard. Headless HTTP alone cannot prove browser CSP, client bundles, cookies, service workers, or third-party scripts.

### Phase 5 — Cross-service critical-journey validation

Prove each currently enabled journey end to end:

#### Journey 1: Public arrival and meal check

```text
DNS/TLS -> Vercel -> CSP/assets/PWA -> launch control -> Upstash
-> OpenAI -> Revora schema/postprocess -> UI -> Umami -> Sentry on failure
```

Test success, ambiguous input, provider timeout/error, rate limit, pause mode, and no sensitive telemetry.

#### Journey 2: Magic-link authentication

```text
signin UI -> abuse controls -> Auth.js -> Resend -> DNS-delivered email
-> canonical callback -> Railway Postgres session -> authenticated UI
```

Test valid link, replay, expiry, wrong environment/domain, repeated requests, sign-out, and session revocation.

#### Journey 3: Subscription/trial billing

```text
authenticated user -> paywall/price -> Stripe Checkout -> return
-> signed webhook -> event inbox -> DB subscription -> entitlement
-> billing email -> portal/cancel/refund -> reconciliation
```

Test duplicates, ordering, missed webhook recovery, and failure state without charging a real user.

#### Journey 4: Pantry one-time workflow

```text
checkout -> Stripe -> order -> Blob upload -> extraction -> confirmation
-> processing -> report -> Resend -> photo deletion/GC -> admin/recovery
```

Prove privacy/retention and partial-failure recovery, not only the happy path.

#### Journey 5: Support case

```text
authenticated UI -> support API -> abuse control -> DB if applicable
-> Resend -> directly monitored support inbox -> actionable reply path
```

#### Journey 6: Analytics

```text
real browser action -> Revora track() contract -> Umami script
-> CSP-permitted ingest -> provider acceptance -> correct dashboard event
```

#### Journey 7: Error reporting

```text
safe server/browser canary -> scrubber -> CSP-permitted Sentry transport
-> correct Sentry project/environment -> alert/owner
```

Confirm event usefulness and absence of health-adjacent data.

#### Journey 8: Scheduled reliability jobs

```text
Vercel/Railway scheduler -> authenticated cron route -> DB heartbeat
-> job-specific Stripe/Resend/Blob/push effect -> logs/alerts/retry
```

#### Journey 9: Account export/deletion

```text
authenticated request -> DB/data export or deletion -> session cleanup
-> subscription consequences -> Blob cleanup -> no cross-user data
```

#### Journey 10: PWA and optional Play surface

```text
domain/manifest/service worker -> install/update/offline behavior
-> push if enabled -> Play/TWA/billing/RTDN only if enabled
```

### Phase 6 — Failure-mode and recovery analysis

For every dependency, document expected and observed behavior for:

- missing or malformed configuration;
- wrong project, wrong environment, or test/live mismatch;
- bad credentials or expired/rotated credentials;
- DNS/TLS/CSP failure;
- timeout, `429`, `4xx`, `5xx`, provider outage, and network partition;
- duplicate, delayed, or out-of-order events;
- app success/provider failure and provider success/app failure;
- database failure before/after an irreversible external effect;
- retries and idempotency;
- stale build-time variables after an env change;
- quota/spend exhaustion;
- rollback to an older schema or incompatible deploy;
- recovery-point and recovery-time expectations;
- silent failure detection.

Do not induce destructive failures in production. Use code inspection, provider test modes, dependency injection, controlled preview tests, or documented incident evidence where live fault injection is unsafe.

### Phase 7 — Issue ledger, diagnosis, and remediation loop

Create one canonical issue ledger:

| ID | Severity | Service/journey | Symptom | Root cause | Evidence | User/business impact | Security/privacy/cost impact | Remediation | Owner | Blocker | Retest | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|

Severity definitions:

- `P0`: active security/privacy breach, incorrect billing at scale, destructive data loss, harmful production behavior, or total critical outage;
- `P1`: critical journey broken, entitlement/auth failure, silent observability blackout, serious privacy gap, or unsafe fail-open behavior;
- `P2`: material reliability, recovery, monitoring, data-consistency, or operational gap;
- `P3`: low-risk hardening, cleanup, documentation drift, or maintainability issue.

For every defect:

1. reproduce or demonstrate it;
2. identify the root cause, not merely the symptom;
3. find all instances of the same bug class across services;
4. choose the smallest robust fix;
5. add or strengthen an automated regression test where possible;
6. implement only within the current session's authorization;
7. rerun focused tests and affected cross-service journeys;
8. update the proof matrix and issue ledger;
9. record unresolved external/human steps exactly.

Never mark an issue fixed from code inspection alone. If implementation is not authorized, provide an implementation-ready patch plan without altering the system.

### Phase 8 — Clean-room re-verification

After any remediation:

- reopen the final diff and inspect every changed line;
- confirm no unrelated dirty work was overwritten;
- rerun `git diff --check`;
- rerun focused and full applicable gates;
- repeat live proof for affected services;
- verify the deployed revision if a deployment was separately approved;
- recheck browser console/network/CSP;
- recheck provider receipt and user-visible state;
- recheck secrets/PII did not enter logs, reports, tests, or Git;
- ensure no temporary canaries, test users, webhooks, jobs, or provider objects remain unless explicitly retained and documented.

---

## 5. Required deliverables

Save the durable audit under `docs/handoff` with a date-stamped filename, for example:

```text
docs/handoff/YYYY-MM-DD-revora-service-integrations-deep-audit-report.md
```

The report must be self-contained and include:

1. executive verdict: `GO`, `CONDITIONAL GO`, or `NO-GO`;
2. exact audit timestamp, local `HEAD`, deployed Vercel revision, and Railway service revisions;
3. scope and access/blocker table;
4. as-built service dependency graph;
5. environment/scope matrix using only redacted presence/status values;
6. canonical service proof matrix;
7. provider-by-provider findings;
8. cross-service journey results;
9. failure/recovery matrix;
10. canonical issue ledger with P0–P3 priorities;
11. commands/tests executed and unedited pass/fail counts;
12. live evidence index with timestamps and redacted provider references;
13. changes made, exact files changed, and why;
14. unresolved blockers and the exact owner/provider action needed;
15. rollback and incident-response readiness;
16. residual risk and monitoring gaps;
17. an ordered `next 24 hours / next 7 days / before scale` action plan;
18. final definition-of-done checklist.

Do not include secrets or sensitive user/provider data in the report. If screenshots or raw logs are necessary, store only redacted versions and identify any sensitive evidence that remains outside Git.

---

## 6. Final verdict rules

### `GO`

Allowed only when:

- every currently enabled critical service path is `PROVEN` with fresh live evidence;
- every critical cross-service user journey passes end to end;
- there are no open P0/P1 issues;
- no P2 issue can corrupt billing, entitlement, auth, privacy, health data, or recovery;
- DNS/TLS/canonical URLs, webhooks, email delivery, DB state, analytics, and Sentry receipt are proven;
- scheduled recovery paths and alerts are proven;
- intentional-off features are demonstrably unreachable/fail-closed;
- rollback/kill-switch paths and named operational ownership exist;
- deployed revision truth matches the audited revision.

### `CONDITIONAL GO`

Allowed only for explicit, low-risk P2/P3 items with:

- no impact on critical journeys, billing, entitlement, auth, privacy, or safety;
- named owner and deadline;
- working detection and rollback;
- a written explanation of why launch risk is acceptable.

### `NO-GO`

Required when:

- any enabled critical service is `FAIL`, `BLOCKED`, `PARTIAL`, or merely `CONFIGURED_NOT_PROVEN` on a launch-critical path;
- a P0/P1 remains open;
- real billing, webhook-to-entitlement, magic-link email, database durability, domain/TLS, OpenAI safety path, Sentry canary, Umami ingest, cron recovery, or Blob deletion cannot be proven;
- provider account/environment identity is uncertain;
- critical production env scope or deploy identity is uncertain;
- sensitive data may leak to telemetry, analytics, email, logs, or public storage;
- a prior pass cannot be tied to the currently deployed revision.

Never lower the verdict merely to sound conservative, and never raise it to sound helpful. Make it follow the evidence.

---

## 7. Definition of truly done

The audit is complete only when all of the following are true:

- [ ] Current source, dirty work, merged branch, deployed revision, and provider truth are separately recorded.
- [ ] Every external host, SDK, env variable, webhook, cron, database, storage system, and feature-gated provider is inventoried.
- [ ] Sentry server and browser canaries arrive correctly and contain no sensitive data.
- [ ] Umami script and ingest requests succeed under production CSP and fresh events appear in the correct dashboard.
- [ ] Stripe's complete event-to-entitlement/reconciliation chain is proven for every enabled product.
- [ ] Resend magic links and operational emails reach the intended real inboxes with correct domain authentication.
- [ ] Vercel serves the audited revision on the canonical production domain with correct env scopes and headers.
- [ ] Railway's canonical production database and scheduler services are identified, healthy, backed up, migrated, and correctly wired.
- [ ] DNS, TLS, canonical redirects, auth callbacks, Stripe URLs, email DNS, and PWA origins agree.
- [ ] Auth.js sessions, account export/deletion, database encryption/key contracts, and cross-user isolation are validated.
- [ ] OpenAI/provider output passes Revora's real schema, postprocess, safety, timeout, and spend-control path.
- [ ] Upstash controls behave correctly under success, limit, and provider-failure cases.
- [ ] Blob uploads and every deletion/GC path are proven with no known orphan/privacy gap.
- [ ] Edge Config and all cron recovery paths are proven and monitored.
- [ ] Web push and Play services are either fully proven or proven intentionally off.
- [ ] All critical user journeys pass in a real browser and correlate with provider/database evidence.
- [ ] Every discovered issue has a severity, root cause, owner, remediation, and retest state.
- [ ] No P0/P1 remains and no launch-critical proof is blocked or inferred.
- [ ] No secrets or user health data were exposed during the audit.
- [ ] The final report is saved, `git diff --check` passes, and unrelated work remains untouched.

If any checkbox is not proven, state exactly what remains, why it matters, who must act, what action they must take, and what evidence will close it. Do not use “looks good,” “should work,” “configured,” or “probably” as substitutes for proof.
