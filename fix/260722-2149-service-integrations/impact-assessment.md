# Fix impact assessments

Session: `fix/260722-2149-service-integrations`

Each retained change is assessed before modification and verified according to its blast radius.

## Iteration 1 - I-10 duplicate browser Sentry initializer

- Paths: `app/layout.tsx`, `components/client-error-reporting.tsx`, `tests/unit/revora/sentry-client-scrub.test.ts`
- Dependents: the obsolete component was mounted only by the root layout; the canonical initializer remains `instrumentation-client.ts`.
- Critical path: yes - browser telemetry on every page and health-adjacent privacy scrubbing.
- Risk: high because telemetry configuration can expose user context, but the functional blast radius is narrow because the removed component duplicated an existing initializer.
- Coverage: source-scan contract plus Sentry option/scrubber unit tests; full build and unit baseline already green.
- Verification: focused Sentry test, scoped lint, build/type guard later in the full gate.

## Iteration 2 - I-11 Upstash timeout policy

- Paths: `lib/revora/rate-limit.ts`, `tests/unit/revora/rate-limit.test.ts`
- Dependents: `proxy.ts`, `auth.ts`, check, billing, support, and health paths.
- Critical path: yes - abuse prevention, email amplification controls, model-spend protection, and public availability.
- Risk: high because a wrong branch can either expose an email-sending route or deny healthy public traffic.
- Coverage: pure decision tests cover SDK timeout, thrown store failure, blocked requests, counter ordering, and fail-open/fail-closed route classes; proxy wiring has separate tests.
- Verification: full rate-limit unit file plus scoped lint, followed by typecheck after both pre-existing P1 remediations are landed.

## Iteration 3 - I-05 concurrent Next E2E distDir collision

- Paths: `.gitignore`, `playwright.config.ts`, `next.config.ts`, `tests/smoke/global-teardown.ts`, `tests/unit/smoke-global-teardown.test.ts`, `tests/smoke/trial-wall.spec.ts`
- Dependents: the entire Playwright release gate, especially the second trial-mode server on port 3101.
- Critical path: yes - a red or flaky required E2E gate cannot protect production promotion.
- Risk: medium; runtime product code is unchanged, but an incorrect distDir or teardown marker can dirty the tree or make the trial suite unusable.
- Root cause: `.next/e2e-trial` was nested beneath the default server's disposable `.next` tree, allowing concurrent dev-server invalidation and 404s.
- Verification: teardown unit contract, typecheck, focused trial-wall Playwright run, and clean `tsconfig.json` diff after the run.

## Iteration 4 - I-05 nudge smoke races FirstRunGate

- Path: `tests/smoke/nudge-opt-in.spec.ts`
- Dependents: required Playwright CI only; no production source changes.
- Critical path: yes - the test is part of the release gate and intermittently produced false red/green outcomes.
- Risk: low; the assertion remains unchanged and the navigation now uses the product's documented `stay=1` bypass to test the intended stable check surface.
- Root cause: a fresh `/check` visit intentionally redirects to onboarding, so the test raced `daily-loop-empty` against FirstRunGate.
- Verification: run the exact case without retries in all three Playwright projects and confirm no tracked test artifacts remain.

## Iteration 5 - I-05 cold-route E2E readiness race

- Paths: `playwright.config.ts`, `tests/smoke/global-setup.ts`, `tests/smoke/a11y.spec.ts`, `tests/unit/smoke-global-setup.test.ts`
- Dependents: all always-on Playwright projects and CI promotion evidence.
- Critical path: yes - 3 hard failures and 13 flakes shared a server-ready-but-route-cold loading shell.
- Risk: medium; setup time increases, but product code, assertion timeouts, retries, and test expectations are unchanged.
- Root cause: Next dev's server-ready probe compiles only `/`; an HTTP warmup compiled server routes but not browser chunks. The captured Chrome trace showed a core client chunk fail with `net::ERR_NETWORK_CHANGED`, leaving the page permanently on its SSR loading shell.
- Coverage: unit tests prove route uniqueness, serial HTTP/browser warming, timeout propagation, fail-fast non-2xx behavior, and a final real-browser hydration assertion. The a11y file's local retry override and catch-and-ignore warmup were removed.
- Verification: 5 focused unit tests, scoped lint, and typecheck passed; all 6 previously hard-failing Chrome/Safari cases then passed together with `--retries=0`. Full Playwright remains the final gate.

## Iteration 6 - I-04 authentication email fail-closed boundary

- Paths: `auth.ts`, `lib/server/email.ts`, a shared email-stub policy helper, and focused unit tests.
- Dependents: Auth.js magic links, Pantry/support operational email, preview E2E mailboxes, and every server path that calls `auth()`.
- Critical path: yes - a production stub can exfiltrate one-time login URLs, while an email provider without an adapter makes every unauthenticated session check emit a configuration error.
- Risk: high; a wrong production classifier could disable legitimate preview tests or allow a test mailbox in production.
- Intended boundary: exact Vercel production or non-Vercel `NODE_ENV=production` rejects a configured stub; explicit Vercel preview/development remains testable. With no database adapter, omit the email provider so ordinary signed-out reads return null cleanly instead of constructing an invalid Auth.js configuration.
- Verification: focused policy/sender units, scoped lint and typecheck, then a signed-out browser route proving no `MissingAdapter` errors before the final full gate.

## Iteration 7 - I-01 production model routing and failure truth

- Paths: `lib/revora/openai-client.ts`, `lib/revora/service.ts`, `app/api/check/route.ts`, safe telemetry schema, environment docs, and focused tests.
- Dependents: every meal check, Pantry judging, live evals, model-cost telemetry, Sentry triage, and health/config reporting.
- Critical path: yes - the audited production path returns only fallback cards, and currently labels those swallowed model failures as `check_completed`.
- Risk: high; provider routing touches the core health-adjacent classifier and a permissive base URL can send prompts and API credentials to an unintended compatible endpoint.
- Current contract check: OpenRouter documents its Responses API as beta and cautions against production use; this repo's validated production comment and eval path specify direct OpenAI. Production will therefore reject any compatible `OPENAI_BASE_URL` and any provider-prefixed model ID, while preview/test retain an explicit HTTPS-compatible-provider path for evaluation.
- Observability boundary: model fallback remains calm and PII-free for users, but the route must emit `check_failed` with only bounded provider/model/reason fields; it must never count a swallowed provider error as completion.
- Verification: provider-matrix units, service fallback callback tests, route telemetry/privacy tests, scoped lint/typecheck/build; real three-case provider proof remains an external configuration/deployment gate.

## Iteration 8 - I-02 source-controlled strict Railway cron runner

- Paths: `.railway/railway.ts`, `scripts/run-hourly-crons.mjs`, its focused unit tests, `package.json`, and the lockfile.
- Dependents: nudge delivery, Pantry photo cleanup, trial pre-charge reminders, Stripe entitlement reconciliation, and the cron freshness reported by `/api/health`.
- Critical path: yes - the live curl runner follows neither the canonical origin nor a response-body success contract, so all four handlers can be skipped while Railway reports a successful run.
- Risk: high; a malformed IaC graph could unintentionally change unrelated Railway resources, while a runner that exits early could starve later jobs.
- Intended boundary: import the linked project into the supported Railway TypeScript DSL, preserve existing secret values, pin the cron to `https://revora.plus`, reject redirects, require authenticated JSON `{ ok: true }`, attempt every route, redact secrets, and exit nonzero if any route fails.
- Verification: focused runner tests and lint, Node execution contract, typecheck, then `railway config plan`; the Railway skill forbids applying the plan without separate explicit approval.

## Iteration 9 - I-03 private Pantry photo boundary

- Paths: Pantry client upload, upload authorization, submit URL validation, server-side Blob reader, vision extraction, lifecycle access, privacy copy, environment docs, and focused tests.
- Dependents: the complete paid Pantry intake/extraction flow, Blob cleanup/account deletion, OpenAI vision input, CSP, privacy promises, and provisioned Pantry E2E.
- Critical path: yes - the current production store is public-read and Pantry photos can reveal household and health-adjacent context.
- Risk: high; Vercel documents that store access mode is immutable, so code must use a new private-store credential and fail closed instead of silently falling back to the legacy public store.
- Intended boundary: upload only to a private store through `PANTRY_BLOB_READ_WRITE_TOKEN`; bind each upload pathname to the authenticated order; accept only that order's private Blob URL; authenticate the server-side read; bound type and size; inline bytes as a data URL for OpenAI; never expose the storage token or public URL to the model.
- Verification: upload-scope, URL/provenance, bounded private-read, vision payload, privacy-contract, submit, Blob lifecycle, lint, and typecheck tests. A real unauthorized-fetch/upload/delete proof requires provisioning the separate private store and deploying the credential.

## Iteration 10 - I-07 account deletion billing safety

- Paths: `app/api/account/delete/route.ts` and focused account-deletion tests.
- Dependents: account deletion, Stripe cancellation, historical Google Play subscribers, local subscription-pointer retention, sessions, and privacy UX.
- Critical path: yes - deleting local state after an unconfirmed provider cancellation can leave a former user billable with no in-app recovery pointer.
- Risk: high; the route must still delete promptly when cancellation is confirmed, but must preserve the entire account atomically enough for a safe retry when billing cannot be stopped.
- Intended boundary: only charge-capable Stripe states require immediate provider cancellation; missing credentials or a provider error return a retryable non-success before Blob/user deletion; an active Play subscription returns a user-action conflict because cancellation is store-owned; already nonrenewing provider states do not block deletion.
- Verification: injected Stripe outage, missing-key path, active Play conflict, success cascade, Blob call ordering, hashed audit row, lint, and typecheck.

## Iteration 11 - I-09 deletion pointer retention on Blob outage

- Paths: shared Blob lifecycle deletion, full-account deletion, health-data withdrawal, and their focused tests.
- Dependents: the privacy deletion promise, Pantry order/photo cascades, account sessions, login retention during consent withdrawal, and the orphan reaper.
- Critical path: yes - swallowing a failed Blob deletion and then cascading the row makes the private object permanently untraceable.
- Risk: high; a fail-closed response temporarily delays deletion during a storage outage, but it preserves the exact pointer and every local row for a safe retry instead of falsely reporting completion.
- Intended boundary: `deleteUserBlobs` propagates provider failure; both destructive routes capture it, return 503, and perform no database cascade. A successful confirmed delete retains the current order-before-cascade behavior.
- Verification: injected Blob outage at helper, account, and health-data routes; pointer/account preservation; successful delete ordering; lint and typecheck.

## Iteration 12 - I-08 paid Pantry email recovery

- Paths: the shared Resend sender, billing-inbox recovery documentation, and an end-to-end inbox-to-Pantry-sweep regression test.
- Dependents: Pantry claim and report delivery, billing dunning, pre-charge reminders, support notifications, Auth-independent operational mail, and cron completion.
- Critical path: yes - a paid buyer must not lose the claim path when the post-commit email request fails.
- Risk: medium; the existing `pantry_orders` row with a null sent timestamp is already a durable delivery task, but an unbounded/rejected network fetch can throw through a worker and the cross-service recovery invariant was not tested.
- Intended boundary: every Resend request has a bounded timeout and converts transport rejection into `{ ok: false }`; the committed paid order remains retryable; the Pantry sweep rotates the claim token, sends once after recovery, stamps success, and does not resend on later sweeps.
- Verification: sender success/status/rejection/timeout contract, production inbox failure, durable row state, successful sweep recovery, no duplicate resend, token/hash match, focused lint and typecheck.

## Iteration 13 - I-13 truthful readiness semantics

- Paths: `/api/health`, the new `/api/health/live` route, readiness documentation, and focused health/launch tests.
- Dependents: uptime alerts, release checks, database-backed user journeys, all five scheduled recovery jobs, and the public rate-limit fail-closed boundary.
- Critical path: yes - the audited deployment returned HTTP 200 and `ok:true` while every hourly heartbeat was stale, so monitoring could not detect broken billing, Pantry, or push recovery.
- Risk: medium; monitors that previously used `/api/health` as a process probe will now alert on real dependency degradation and should use `/api/health/live` only when they intentionally want liveness.
- Intended boundary: readiness fails with bounded reason codes when the database is absent/unreachable, any required heartbeat is `stale`/`never`, or a public deployment lacks valid Upstash REST configuration. The response remains no-store and discloses no timestamps, URLs, secrets, or user counts.
- Verification: 49 focused readiness, environment, launch-control, and liveness tests plus scoped lint passed. Live behavior still requires deployment and fresh scheduler heartbeats.

## Iteration 14 - I-23 retryable nudge delivery claims

- Paths: the nudge worker, authenticated cron route, and focused push/cron tests.
- Dependents: opted-in premium users, concurrent hourly invocations, the strict Railway runner, cron freshness monitoring, and dead-endpoint cleanup.
- Critical path: yes - a transient provider failure was stamped as if delivery succeeded, permanently suppressing every retry for that local day.
- Risk: medium; retrying a provider result explicitly classified as failure can still duplicate a notification if the provider delivered but lost its acknowledgement, an unavoidable boundary without provider idempotency. The atomic pre-send claim still prevents overlapping jobs from double-sending.
- Intended boundary: claim before send; retain the date on success; delete a gone endpoint; conditionally restore only the failed claim on a bounded error/rejection; continue the remaining cohort; report 503 plus a count; do not stamp a successful heartbeat for a partially failed run.
- Verification: 40 focused nudge, push-route, and timing-safe tests plus scoped lint passed.

## Iteration 15 - I-18 minimized Stripe recovery data

- Paths: Stripe inbox ingestion/processing, reconciliation, the Pantry reducer, billing schema documentation, and focused billing/privacy tests.
- Dependents: webhook retries, dead letters, entitlement recovery, Pantry claim delivery, charge-without-entitlement detection, privacy deletion posture, and support diagnosis.
- Critical path: yes - failed rows retained the provider's full event and free-form error text, neither of which is reachable by account deletion because the inbox has no user foreign key.
- Risk: high; over-minimizing a replay envelope can make a valid payment event unrecoverable. The allowlist therefore follows every reducer branch and retains only event identity/time, provider references, status/period fields, billing reason, and terms version.
- Intended boundary: raw provider payloads never enter durable storage; unknown/free-text/customer fields are dropped; legacy rows are migrated in bounded hourly pages; diagnostics retain only safe error class/provider codes; Pantry retries retrieve the buyer email directly from Stripe; processed, failed, and dead-letter rows remain subject to the existing 30-day terminal retention cleanup.
- Verification: 47 focused inbox, reconciliation, Pantry webhook, and checkout tests plus scoped lint passed. Full billing and migration gates remain in the final suite.

## Iteration 16 - I-19 signed Resend delivery state

- Paths: shared email transport, Auth.js magic-link sender, signed Resend webhook, delivery/suppression tables and migration, Pantry/billing/support callers, authenticated support queue, readiness health, environment/runbook docs, and focused tests.
- Dependents: passwordless sign-in, Pantry intake/report delivery, dunning and pre-charge notices, internal operational alerts, support privacy, sender reputation, uptime monitoring, and every workflow that previously equated HTTP acceptance with delivery.
- Critical path: yes - the app had no provider message id, no signed-event receiver, no durable state machine, and no local suppression enforcement, so bounces and complaints were invisible while a passwordless login outage could look successful.
- Risk: high; webhook order is not guaranteed, a webhook may beat the local acceptance update, and blind resend after delivery delay can duplicate mail or worsen reputation. The implementation locks each message row, rejects stale/regressive states, merges an early webhook with its later local attempt, and never auto-retries provider-terminal outcomes.
- Privacy boundary: delivery rows contain a recipient HMAC, category, hashed idempotency key, provider id, bounded status/error code, and timestamps only. They never contain addresses, subjects, bodies, magic links, or support text. Support notifications now carry only case id/type; message and account email are revealed through a no-store, founder-authenticated queue.
- Retention/ownership: attempts expire after 30 days during send/webhook traffic; permanent suppression HMACs remain until deliberate owner remediation. Rate-limit/transport failures stay owned by each durable caller workflow; bounce/complaint/suppression stops further automated mail.
- Verification: 86 focused email, support, health, Pantry, billing, and reconciliation tests passed after fixture isolation; scoped lint, full typecheck, and `drizzle-kit check` passed. Resend endpoint creation/secret binding, DNS, provider receipt, and approved inbox/bounce proofs remain external activation gates.

## Iteration 17 - I-21 immutable CI dependencies and least privilege

- Paths: the CI workflow, Dependabot policy, CODEOWNERS, and a source-level regression test.
- Dependents: every merge gate, secret scanning, migration drift checks, browser evidence artifacts, repository token exposure, and future dependency updates.
- Critical path: yes - mutable action tags can change executed code without a repository diff, persisted checkout credentials widen token exposure, and obsolete runs can race/waste protected capacity.
- Risk: low; the workflow remains on each action's existing major version, pinned to the current official release commit. `ubuntu-latest` becomes the explicit 24.04 image, the Postgres 16 multi-architecture image is digest-pinned, and the secret-scan job retains its narrowly required pull-request read override.
- Intended boundary: top-level `contents: read`, job-specific expansion only for gitleaks, no persisted checkout credential in any job, cancel superseded branch/PR runs, and automate reviewable pin refreshes for npm, Actions, and Docker. CODEOWNERS names the repository owner for workflows, migrations, DB, billing, and webhook code; enforcement still depends on GitHub settings.
- Verification: four policy tests, scoped lint, and independent YAML parsing passed. Action SHAs were resolved from the official Git repositories. Required reviews, branch protection, environment approvals, secret rotation, and a real GitHub Actions run remain external.

## Iteration 18 - I-25 operational contact, current-truth docs, and zero-warning lint

- Paths: `/.well-known/security.txt`, its unit contract, authoritative analytics/hosting/runbook docs, the ESLint boundary, hydration/loading state flows across twelve client surfaces, and focused regression tests.
- Dependents: security reporters, production operators, CI, every Playwright-created Next build directory, checkout return recovery, meal/history/journey initial loads, browser-only capability detection, and analytics/Play configuration.
- Critical path: medium - none of the original warnings alone proved a user outage, but generated-output traversal could make lint fail nondeterministically and several synchronous effect writes added StrictMode-sensitive cascading renders.
- Risk: medium; client-only reads must preserve server/hydration equality, checkout return handling must survive StrictMode after stripping its query string, and a stale deployment diagram can send an operator toward the wrong provider.
- Intended boundary: RFC 9116 content has one current `Expires` and canonical HTTPS location; current docs distinguish Umami Cloud from optional future self-hosting; generated `.next-*` trees never enter lint; `useSyncExternalStore` provides hydration-safe client snapshots; mount loaders defer until effect commit; future synchronous effect state writes are lint errors.
- Verification: security and provider-doc contracts passed; 25 focused hydration/paywall/onboarding tests passed; two full typechecks passed; a cold repository-wide lint passed with zero errors and zero warnings. Live HTTP 200 proof requires deployment.

## Iteration 19 - I-24 owner-only local credential files

- Paths: ignored workstation files `.env`, `.env.local`, and `openr.md`; no contents were opened or emitted.
- Dependents: every local/provider CLI and development process that reads credentials from those files.
- Critical path: yes for workstation secret hygiene, no application-source blast radius.
- Risk: low; tightening group/other access can only affect a deliberately shared local-user workflow, and all three files are owned by the active workstation user.
- Intended boundary: private credential material is readable/writable only by its owner (`0600`). Tracked examples remain shareable and contain no real credentials.
- Verification: exact pre-state was `0664`; `chmod 600` succeeded; exact post-state and a bounded filename-only scan show all matching private workspace files at `0600`. Rotation is not inferred without evidence that another principal accessed the old files.

## Iteration 20 - I-15 database authority and connection governance

- Paths: database pool construction, Drizzle configuration, protected migration command, governance checker, baseline helper, environment contract, ADR/runbook, and focused schema/config tests.
- Dependents: every stateful request, Auth.js, billing inbox locks, production migrations, Vercel connection pressure, and release/restore procedures.
- Critical path: yes - the audited runtime credential could create objects, source and live migration truth were easy to confuse, and unbounded connection establishment can strand every stateful journey.
- Risk: high; revoking the wrong live privilege can take down auth/billing, while leaving owner credentials in Vercel defeats least privilege. Therefore source enforcement and the exact operator procedure are retained locally, but the live role mutation is not applied without provider-owner coordination and a backup.
- Intended boundary: Vercel receives only a DML runtime URL; production Drizzle commands require a distinct owner URL; pool size is an integer `1..10` (default 3) with five-second connect and ten-second idle bounds; the live checker emits booleans/counts only and verifies exact committed migration hashes without printing identities, URLs, or rows.
- Verification: 10 database config/schema tests passed with every migration through 0016 applied in PGlite; scoped lint, full typecheck, and protected-environment `drizzle-kit check` passed; the checker fails closed when either credential is absent. Live role split, migrations 0014-0016, connection metrics, backup/PITR, and restore timing remain provider evidence.

## Iteration 21 - final-gate rework of I-23 next-hour retry

- Paths inspected: `lib/server/nudge.ts` and `tests/unit/server/nudge.test.ts`; no source code was changed during the handoff capture.
- Dependents: every opted-in premium push user, the hourly Railway runner, readiness/heartbeat monitoring, local-time scheduling, quiet hours, cadence, and overlapping cron invocations.
- Critical path: yes - the earlier change restores the failed atomic claim, but the next cron tick occurs at a different local hour and is rejected before the subscription is loaded.
- Root cause: the first attempt at 11:00 local returns a provider error and restores `lastNudgeDate`; the retry at 12:00 local encounters `localHour !== nudgeHour`, so `retry.sent` remains zero.
- Required boundary: initial sends remain tied to the configured local hour, while a confirmed transient failure receives explicit bounded same-local-day retry eligibility. Retry state must remain atomic, quiet-hour/cadence/entitlement/check-aware, and must not turn every missed initial send into a late notification.
- Verification: the complete unit gate failed only this assertion after build, typecheck, zero-warning lint, contract, and Drizzle passed. A standalone focused rerun reproduced `expected 1, received 0` at `tests/unit/server/nudge.test.ts:212`.

## Iteration 22 - I-23 bounded same-local-day retry

- Paths: nudge worker, push-subscription schema, migration `0017_nudge-delivery-retries.sql`, migration journal/snapshot, database governance runbook, retention documentation, and focused nudge/profile/push tests.
- Dependents: every opted-in premium push subscription, overlapping Railway hourly executions, readiness heartbeat truth, migration governance, and dead-endpoint cleanup.
- Critical path: yes - this closes the confirmed release-gate defect rather than moving the assertion into the original hour.
- Risk: high; a broad late-send rule would notify users who were never due, while a non-atomic retry can duplicate sends under overlapping cron runs.
- Intended boundary: only the configured local hour creates an initial attempt. A confirmed provider error records an explicit same-day retry and releases its lease. Each subscription gets at most three attempts; retries re-check quiet hours, same-local-day, cadence, a same-day meal check, opt-in, premium entitlement, and journey stop rules. Success writes the durable local date and clears retry state; `gone` removes the endpoint; errors never stamp a success heartbeat. A lost provider acknowledgement remains an explicitly documented at-least-once duplicate risk.
- Verification: the original next-hour regression passes; repeated-error bound, initial/retry overlap, expired lease, quiet hours, local-day rollover, intervening meal, opt-out, entitlement loss, `gone`, success dedupe, daily/few-per-week/weekly cadence, journey stop, partial-failure isolation, and heartbeat recovery cases pass. The focused nudge/profile/push gate passed 58 tests before the full gate.

## Iteration 23 - immutable, provider-isolated Playwright runtime

- Paths: E2E runner, shared isolated-runtime environment, Playwright config, Next dist selection, proxy public-runtime classification, CI comments, and focused harness/proxy tests.
- Dependents: every browser release assertion, local developer credentials, CI evidence, Auth.js, rate limiting, model spend, email, billing, Blob, Edge Config, Sentry, and Umami.
- Critical path: yes - the earlier dev-server suite mixed Fast Refresh/chunk races with product assertions, and optimized local servers could still load real provider variables from `.env`.
- Risk: high; a browser gate must not mutate production providers, and a permissive database input could run destructive account/support journeys against a remote database.
- Intended boundary: build separate immutable legacy/trial outputs; run `next start` on ports 3100/3101 with one worker and zero retries; preserve only a caller-provided disposable loopback database; create/remove an owner-only disk mailbox; force synthetic crypto/auth/VAPID values; blank model, Resend, Stripe, Upstash, Blob, Edge Config, Sentry, Umami, Google Play, and migration credentials before Next loads env files. Vercel `preview` and `production` remain public/fail-closed; only explicit `development` represents the optimized local runner.
- Verification: 23 harness, config, proxy, and mailbox policy tests pass. A focused disposable-Postgres auth/support run passed 9/9 across all three browser projects. The full exact-SHA browser run then passed 225 with 12 explicit provider-gated Pantry skips, zero failure, zero retry, and zero flaky classification.

## Iteration 24 - authenticated journey and support-privacy truth

- Paths: sign-in server action, auth and account-support browser specs, current release truth index, and the shared E2E mailbox/runtime boundary.
- Dependents: passwordless sign-in, custom check-email UX, consent/profile onboarding, support-case operations, user data export, and operational email privacy.
- Critical path: yes - these tests were previously skipped in CI despite a configured database, leaving the complete passwordless journey unproven.
- Risk: medium; manually overriding Auth.js navigation must still surface provider errors, and a stale full-copy support assertion would reverse the audit's PII minimization.
- Intended boundary: request the magic link with Auth.js navigation disabled, then redirect to `/signin/check-email` only after the send succeeds. The support notice contains case identity and the authenticated admin-queue path, never the user's email or free text; the authenticated user's export contains the exact message.
- Verification: every project proves check-email URL, disk-link creation/consumption, database session, explicit health-data consent, profile persistence, post-consent `/home`, support `201`, exact short case id, minimized notice, exact user export, and form restoration.

## Iteration 25 - exact-SHA complete local release gate

- Final local SHA: `f8fa488c6da1ecf956082924394aba2e287903d1`.
- Build: Next.js 16.2.10 optimized build passed with 89 routes; integrated type checking passed.
- Static/data gates: standalone typecheck passed; cold repository lint passed with zero warnings/errors; safety contract passed every configured check; `drizzle-kit check` passed.
- Unit/integration: 176 files passed, 1 skipped; 1,968 tests passed, 2 skipped.
- Browser: 225 passed, 12 skipped, 0 failed, 0 flaky, 0 retries across Mobile Chrome, Mobile Safari, and Desktop Chrome. The 12 skips are the four explicitly unprovisioned private-Blob/live-judge Pantry surfaces in each browser and remain external provider gates.
- Cleanup: the owner-only automatic mailboxes were removed after each run; the named disposable Postgres container shut down cleanly and was removed.
- Truth boundary: local source/test evidence is green. No GitHub protected run, merge, exact-SHA deployment, provider activation, DNS, backup/restore, monitoring receipt, legal approval, or clinical/content approval is inferred from it.

## Iteration 26 - full-range pull-request secret scanning

- Paths: `.github/workflows/ci.yml` and its CI policy contract.
- Dependents: every remediation commit in PR #35 and any future multi-commit pull request.
- Critical path: yes - the action's default scan covered only part of the branch, and the first explicit range implementation resolved GitHub's synthetic merge checkout to zero commits.
- Intended boundary: resolve the merge base from `github.base_ref`, scan through `github.event.pull_request.head.sha`, fail if the range is empty, and never trust the synthetic merge SHA as the feature head.
- Verification: run `30003920371` scanned all 47 non-merge commits from `origin/main` to exact head and reported no leaks. GitHub-hosted action and explicit range scans both passed.

## Iteration 27 - dependency security closure

- Paths: `package.json` and `package-lock.json`.
- Dependents: the Next.js production server, image processing, validation tooling, and build-only transitive code.
- Critical path: yes - GitHub reported six high and six moderate default-branch alerts, including Next.js and Sharp runtime advisories.
- Intended boundary: update to patched upstream versions without replacing application behavior; use narrow overrides only where an upstream dependency still selected a vulnerable compatible range.
- Verification: Next.js/eslint-config-next 16.2.11, Sharp 0.35.0 throughout the tree, fast-uri 3.1.4, and the affected esbuild edge 0.25.12; clean `npm ci`, zero-result `npm audit`, full local gate, and green GitHub CI. Default-branch alerts remain visible until the branch is reviewed and merged.

## Iteration 28 - exact deploy-SHA Sentry releases

- Paths: `lib/revora/sentry-release.ts`, browser/server Sentry initializers, Next build injection, and focused tests.
- Dependents: every browser/server issue, release regression comparison, rollback diagnosis, and alert triage.
- Critical path: yes - provider events without an exact release cannot be correlated to a deployed revision.
- Intended boundary: Vercel Git SHA is authoritative; a manual release is fallback only; local/test events stay release-less when no authority exists.
- Verification: focused unit tests and a synthetic SHA build passed. Exact-preview browser issue `REVORA_1-9` stored release `6215b14b0ddc1ddb34733011756dd06b4e93e322` and environment `preview`.

## Iteration 29 - Sentry IP and geolocation suppression

- Paths: `lib/revora/sentry-scrub.ts` and server/browser privacy tests.
- Dependents: every Sentry browser/server event from health-adjacent product surfaces.
- Critical path: yes - the initial safe canary contained no user fields but Sentry still derived and retained city/region/country from the ingest IP.
- Root cause: deleting `event.user` allows Sentry to infer location from the transport IP. Project-level IP scrubbing removes the raw address but not the already-derived geo object; an advanced `user.geo` scrub rule also executes too early to remove that enrichment.
- Intended boundary: overwrite every user field with the non-routable `0.0.0.0` sentinel before transport. Sentry's project IP scrubber removes the sentinel, and the explicit address prevents transport-IP geo inference.
- Verification: 22 focused tests passed. A provider CLI canary with the sentinel stored both IP and geo as null. The real exact-preview browser canary produced one envelope `200`; event `b7377e3bdf7d4ab4904dd4b1effd8b6a` retained only the safe exception type and trace context, with redacted value, no request/breadcrumbs, and null identity/IP/geo. The high-priority email rule triggered, the temporary Vercel bypass was revoked, and all synthetic issues were resolved.

## Iteration 30 - exact-code GitHub release gate

- Runtime SHA: `6215b14b0ddc1ddb34733011756dd06b4e93e322`.
- Build/static: Next.js 16.2.11 built 89 routes; typecheck, zero-warning lint, safety contract, Drizzle check, and dependency install passed.
- Unit/eval: 177 files passed, 1 skipped; 1,974 tests passed, 2 skipped.
- Browser: 225 passed, 12 explicit private-Blob/live-judge Pantry skips, 0 failed, 0 flaky, 0 retries across three projects with disposable Postgres and an owner-only mailbox.
- Security: both secret scans passed, including all 47 non-merge PR commits; `npm ci` found zero vulnerabilities.
- Truth boundary: run `30003920371` is a real green GitHub-hosted run, but the repository plan does not expose enforceable branch/ruleset/code-scanning controls for this private repository, and PR #35 has no review. This is verified branch truth, not reviewed/merged/deployed production truth.

## Iteration 31 - private Pantry Blob operator contract

- Paths: `.env.example`, `docs/handoff/human-actions-required.md`, and the authoritative-provider documentation test.
- Dependents: any operator provisioning preview/production Pantry storage and every browser case gated on `PANTRY_BLOB_READ_WRITE_TOKEN`.
- Critical path: yes - runtime correctly rejected the legacy public-store token, but two operator surfaces still instructed humans to bind it.
- Intended boundary: provision a dedicated private Vercel Blob store, bind only `PANTRY_BLOB_READ_WRITE_TOKEN`, and require authorized process/delete plus unauthorized/cross-user denial and delete-failure recovery.
- Verification: 14 focused documentation/storage tests and scoped lint passed. Live Vercel metadata confirms the production project still lacks the new credential and retains the legacy binding, so Pantry stays an external activation gate.
