# Revora service-integrations remediation — continuation handoff

> **Status:** `NO-GO / IN PROGRESS`
>
> **Saved:** 2026-07-23 01:07 EDT
>
> **Purpose:** This is the source-first continuation prompt for a new session. It supersedes optimistic summaries, but it does not replace re-checking current source, Git state, provider state, and live runtime evidence.

## Prompt for the next session

You are continuing the Revora service-integrations deep-audit remediation in:

```text
/home/tefera/Desktop/Revora
```

The goal is not merely to make tests pass. The goal is to close every issue, gap, and weakness in:

```text
docs/handoff/2026-07-22-revora-service-integrations-deep-audit-report.md
```

and prove that the exact landed revision works through real end-user journeys, recovery paths, provider receipts, and operational controls.

Start by reopening the current source, this handoff, the original audit, the fix ledger, Git status, current branch/HEAD, and any provider/runtime state you can directly inspect. Do not trust stale prose, previous `FIXED_LOCAL` labels, a green `/health` response, config presence, or a provider dashboard screenshot as sufficient proof.

## Current truth at handoff

| Truth bucket | Current state |
|---|---|
| Working directory | `/home/tefera/Desktop/Revora` |
| Branch | `docs/b1-b2-final-closeout` |
| HEAD | `ef9768d` — `fix(db): separate runtime and migration authority` |
| Local source | Twenty remediation iterations are committed; one supposedly fixed reliability issue has been reopened by the full unit gate |
| Local automated gate | Build, typecheck, zero-warning cold lint, safety contract, and Drizzle check pass; unit gate has exactly one confirmed failure |
| Full Playwright gate | Not rerun after the final remediation series because the unit gate stopped the release gate |
| Merged revision truth | Not proven in this session |
| Production deployment truth | The remediation HEAD is not proven deployed |
| Provider/runtime truth | Multiple required activation, mutation, receipt, recovery, and alert proofs remain open |
| End-user release decision | **NO-GO** |

### Preserve the existing dirty work

At handoff, the checkout contains pre-existing user work. Do not reset, overwrite, clean, or broad-stage it:

```text
 M docs/handoff/2026-07-21-c7-shipped-pr24-deploy-and-residuals-handoff.md
 M docs/retention_flow.md
?? docs/handoff/2026-07-22-pr25-ci-unblock-merge-deploy-umami-csp-handoff.md
?? docs/handoff/2026-07-22-revora-service-integrations-deep-audit-master-prompt.md
?? docs/handoff/2026-07-22-revora-service-integrations-deep-audit-report.md
?? docs/handoff/2026-07-22-stripe-webhook-verified-c7-closeout-handoff.md
?? fix/
?? docs/handoff/2026-07-23-revora-service-integrations-autoresearch-fix-continuation-handoff.md
```

Use explicit path staging only. Repository-wide `git diff --check` also encounters pre-existing user whitespace in `docs/retention_flow.md:77`; do not “fix” that unrelated file unless the user asks.

## What was done

The audit's 25 canonical issues were rehydrated into an autonomous fix ledger under:

```text
fix/260722-2149-service-integrations/
```

Each source remediation was committed before focused verification. The commits from this session, newest first, are:

```text
ef9768d fix(db): separate runtime and migration authority
b9ec6c5 chore(lint): enforce zero-warning state effects
3fc6fa6 fix(ui): defer mount-triggered state loaders
b0c16fb fix(ui): remove hydration state cascades
50ba55d fix(lint): ignore isolated Next build output
6c634c9 docs(ops): align provider runbooks with live topology
858e722 feat(security): publish RFC 9116 contact
af7e29c ci: pin actions and minimize workflow privileges
83520bd test(health): isolate unconfigured dependency case
53d1dfb test(health): make readiness dependencies hermetic
2ccb56e feat(email): track signed delivery and suppressions
278d575 fix(privacy): minimize durable Stripe event payloads
3104187 fix(push): retry transient nudge delivery failures
d618090 fix(health): fail readiness on stale dependencies
f832e18 fix: make paid Pantry email recovery bounded and durable
33e5ee4 fix: retain Blob pointers when deletion fails
ea4a9e1 fix: preserve billing state when account cancellation fails
244bf62 test: bind Blob cleanup to private credential
c0c2851 fix: keep Pantry photos in private storage
d9cdbb1 test: return fresh cron response bodies
1a89d5a fix: make hourly cron execution fail closed
406e29c test: distinguish route and model fallback telemetry
64b6258 fix: reject unvalidated production model routing
ea03fe1 fix: fail closed around auth email stubs
eb84d1f test: precompile browser chunks before smoke workers
e42ef42 test: warm smoke routes before parallel browsers
f4cde57 test: isolate nudge smoke from first-run redirect
996398b fix: isolate concurrent Playwright dist directories
1e1dbb5 fix: honor Upstash timeout policy
4f2b3a3 fix: remove duplicate browser Sentry initializer
```

### Completed local source changes

- Production model routing now rejects unvalidated compatible-provider configurations, and bounded model/provider failure telemetry distinguishes route fallback from model failure.
- The source-controlled Railway hourly runner now invokes all four recovery routes, rejects redirects and false-success bodies, redacts secrets, and fails closed.
- Pantry Blob uploads are private-store-only; model extraction reads through bounded authenticated server access.
- Auth email behavior fails closed in production; local disk mailbox artifacts are owner-only.
- Account deletion no longer removes the local account/billing pointer when charge-capable Stripe cancellation cannot be confirmed.
- Blob deletion failures preserve database pointers and return a retryable failure instead of creating untraceable orphan objects.
- Paid Pantry email remains a durable retry task, and Resend transport calls are bounded/nonthrowing.
- `/api/health` is dependency-aware readiness and returns bounded `503` degradation reasons; `/api/health/live` is a no-store process liveness probe.
- Raw Stripe webhook payload retention was replaced by a minimized replay envelope, safe error codes, bounded legacy backfill, and terminal retention.
- Resend sends now create PII-minimized delivery attempts; signed webhook events update monotonic delivery state; hard bounces, complaints, and suppressions prevent further sends; support free text remains behind an authenticated no-store admin route.
- GitHub Actions and the Postgres CI image are pinned; permissions, checkout credentials, concurrency, CODEOWNERS, and Dependabot policy were tightened locally.
- RFC 9116 `security.txt` is implemented.
- Provider/runbook prose was reconciled with the source topology.
- Nondeterministic generated Next output is excluded from lint.
- All 19 application lint warnings were removed; synchronous state-effect patterns now fail lint.
- `.env`, `.env.local`, and `openr.md` were inspected by metadata only and tightened from `0664` to `0600`.
- Runtime and migration database authority are separated in source tooling; pool size/timeouts are bounded; a PII-safe governance checker validates role separation, grants, DDL denial, and migration hashes.
- Playwright output directories, first-run nudge navigation, cold-route warming, and browser precompilation were hardened in focused tests.
- The duplicate browser Sentry initializer and the Upstash timeout fail-open defect were removed.

## Current 25-issue ledger

`FIXED_LOCAL` below means source and focused tests exist. It does **not** mean merged, deployed, provider-activated, or end-to-end proven.

| ID | Current status | Completed | Exact work still required |
|---|---|---|---|
| I-01 model routing | `FIXED_LOCAL / DEPLOYMENT_AND_PROVIDER_PROOF_OPEN` | `64b6258`, `406e29c` | Deploy the exact landed SHA; prove three varied schema-valid production calls, bounded failure behavior, and corroborating provider/app telemetry |
| I-02 Railway hourly jobs | `FIXED_LOCAL / APPLY_APPROVAL_OPEN` | `1a89d5a`, `d9cdbb1`; zero-destroy plan obtained | With explicit approval, apply the Railway plan; verify four successful job calls, fresh heartbeats, and each real downstream effect |
| I-03 Pantry Blob privacy | `FIXED_LOCAL / PRIVATE_STORE_ACTIVATION_OPEN` | `c0c2851`, `244bf62` | Provision/bind a private Blob store, deploy, then prove authorized processing, unauthorized URL denial, deletion, and orphan recovery |
| I-04 auth email | `FIXED_LOCAL / DNS_AND_INBOX_PROOF_OPEN` | `ea03fe1`; local stub modes `0600` | Publish the exact Resend Return-Path MX, verify provider domain state, and prove direct/forwarded delivery, replay rejection, expiry, and bounce behavior |
| I-05 CI/CD and E2E | `PARTIAL / LOCAL_FULL_GATE_RED` | Four Playwright reliability commits plus pinned CI | Fix the confirmed nudge retry defect, rerun every local gate including full Playwright, then prove a real protected GitHub run and exact-SHA deployment |
| I-06 Stripe end to end | `EXTERNAL_CONTROLLED_TEST_OPEN` | Existing durable inbox/reconcile source and `scripts/e2e-stripe-lifecycle.mjs` | Configure a Revora Stripe **test** webhook endpoint and run the full controlled lifecycle through cleanup |
| I-07 account deletion billing | `FIXED_LOCAL / LIVE_FAILURE_PROOF_OPEN` | `ea4a9e1` | In isolated test/preview, inject cancellation failure and prove no local deletion/orphan charge; prove confirmed-cancel success path |
| I-08 Pantry paid email | `FIXED_LOCAL / PROVIDER_RECOVERY_PROOF_OPEN` | `f832e18` | Use approved synthetic data to prove Resend failure, durable recovery, exact-once delivery, and provider receipt |
| I-09 Blob deletion pointers | `FIXED_LOCAL / LIVE_STORAGE_FAILURE_PROOF_OPEN` | `33e5ee4` | Inject private-store delete failure, verify pointer retention, retry, eventual provider deletion, and cleanup evidence |
| I-10 browser Sentry privacy | `FIXED_LOCAL / DEPLOYMENT_RECEIPT_OPEN` | `4f2b3a3` | Deploy; emit a safe browser canary; prove exactly one scrubbed event in the correct project and an alert path |
| I-11 Upstash timeout | `FIXED_LOCAL / CONTROLLED_OUTAGE_PROOF_OPEN` | `1e1dbb5` | In isolated preview, force timeout/unavailability and prove the intended fail-closed behavior without exposing secrets |
| I-12 push depends on scheduler | `PARTIAL / I-02_AND_I-23_OPEN` | Strict local scheduler runner | Close I-23, apply I-02 with approval, then correlate scheduler call, push receipt, gone-endpoint pruning, effect, and monitoring |
| I-13 health/monitoring | `FIXED_LOCAL / DEPLOYMENT_AND_ALERT_PROOF_OPEN` | `d618090`, `53d1dfb`, `83520bd` | Deploy; prove readiness goes non-green for each stale/unavailable dependency, liveness stays process-only, and the monitor alerts/recovers |
| I-14 DB durability | `EXTERNAL_PROVIDER_PROOF_OPEN` | Runbook boundary documented | Verify backup/PITR settings; perform an isolated restore; record RPO/RTO, timing, and checksums |
| I-15 DB governance | `FIXED_LOCAL / LIVE_ROLE_AND_MIGRATION_PROOF_OPEN` | `ef9768d` | Back up first; create restricted runtime role; keep owner URL out of Vercel; apply migrations 0014–0016 with the protected command; run governance check; inspect connection metrics |
| I-16 preview environment | `EXTERNAL_PROVISIONING_OPEN` | Requirements documented | Build an isolated preview using nonproduction DB, Stripe, Resend, Blob, OpenAI/provider, and safe identities; never copy production provider credentials by default |
| I-17 observability | `EXTERNAL_DASHBOARD_AND_ALERT_PROOF_OPEN` | Local Sentry/health/Umami boundaries improved | Rehydrate current live Sentry/Umami/cron state; prove exactly-once scrubbed canaries, dashboards, blackout/failure alerts, ownership, and acknowledgement |
| I-18 Stripe retention | `FIXED_LOCAL / MIGRATION_AND_REPLAY_PROOF_OPEN` | `278d575` | Apply migration through the owner path; prove valid replay/reconcile without raw PII and verify terminal expiry |
| I-19 Resend state/suppressions | `FIXED_LOCAL / WEBHOOK_ACTIVATION_OPEN` | `2ccb56e`, migration `0016` | Register webhook, bind secret, apply migration, and prove delivered/bounced/complained/suppressed event ordering plus enforcement |
| I-20 DNS/email security | `EXTERNAL_DNS_APPROVAL_OPEN` | Current gap documented | Add required Return-Path MX first; verify current Vercel/Resend requirements before staged DNSSEC/CAA/DMARC mutations; validate authoritatively and publicly |
| I-21 GitHub controls | `FIXED_LOCAL / REPOSITORY_SETTINGS_OPEN` | `af7e29c` | Enable required checks/reviews, CODEOWNERS enforcement, environment approvals, and security scanning; prove forbidden merge/deploy behavior and a real green run |
| I-22 orphan resources | `DESTRUCTIVE_APPROVAL_OPEN` | Suspected resources inventoried | Resolve exact bindings/data first; obtain explicit approval before deleting the two empty Railway DBs or stale Vercel/GitHub resources; re-inventory afterward |
| I-23 transient push retry | **`CONFIRMED LOCAL DEFECT / OPEN`** | `3104187` releases a failed atomic claim | Implement real bounded next-hour retry semantics without weakening the test; see the dedicated blocker below |
| I-24 local credential modes | `FIXED_WORKSTATION` | `.env`, `.env.local`, `openr.md` are `0600` | Rotate only if evidence or policy says prior group-readable exposure requires it; never print values |
| I-25 hardening/docs | `FIXED_LOCAL / LIVE_ENDPOINT_OPEN` | `858e722`, `6c634c9`, `50ba55d`, `b0c16fb`, `3fc6fa6`, `b9ec6c5` | Deploy and prove canonical `security.txt` HTTP/content/expiry; keep cold lint at zero; re-check provider prose after provider mutations |

## Confirmed local release-gate evidence

The latest sequential gate was:

```bash
npm run build \
  && npm run typecheck \
  && npm run lint -- --no-cache \
  && npm run contract \
  && npx drizzle-kit check \
  && npm test
```

Results:

- `npm run build`: passed; Next.js 16.2.10 built 89 routes.
- Integrated build type checking: passed.
- `npm run typecheck`: passed.
- `npm run lint -- --no-cache`: passed with zero warnings and zero errors.
- `npm run contract`: passed every safety-contract check.
- `npx drizzle-kit check`: passed.
- `npm test`: **failed** with 1 failed file, 174 passed, 1 skipped; 1 failed test, 1,942 passed, 2 skipped.
- The gate stopped before the final full Playwright run.

The failure reproduces by itself:

```bash
npx vitest run tests/unit/server/nudge.test.ts \
  -t "releases a transient-failure claim so the next hourly tick retries"
```

Observed focused result on 2026-07-23:

```text
tests/unit/server/nudge.test.ts:212
expected retry.sent to be 1
received 0
```

### Root cause of the remaining local defect

The test's first attempt runs at `2026-07-03T15:00:00Z`, which is 11:00 in New York and matches the user's `nudgeHour = 11`. A provider error correctly restores `lastNudgeDate` to `null`.

The retry runs one hour later at 12:00 New York time. `lib/server/nudge.ts` still contains an exact-hour gate:

```ts
const localHour = hourInTimezone(candidate.timezone)(now);
if (localHour !== candidate.nudgeHour) {
  skipped += 1;
  continue;
}
```

Therefore the released claim cannot be retried on the next hourly tick. Commit `3104187` fixed claim restoration but did not create retry eligibility outside the original exact hour. This is a product reliability defect, not merely a bad assertion.

## Exact next actions, in order

### 1. Rehydrate and protect the workspace

Run:

```bash
cd /home/tefera/Desktop/Revora
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -35
sed -n '1,260p' docs/handoff/2026-07-23-revora-service-integrations-autoresearch-fix-continuation-handoff.md
sed -n '1,560p' docs/handoff/2026-07-22-revora-service-integrations-deep-audit-report.md
sed -n '1,260p' fix/260722-2149-service-integrations/fix-results.tsv
```

Confirm the current truth has not drifted. Preserve every unrelated modification and untracked file.

### 2. Close I-23 with durable retry semantics

Reproduce the focused failure first. Then implement a bounded, concurrency-safe retry state instead of changing the test to use the same hour or simply broadening every user's normal send window.

Required behavior:

1. The configured local hour remains the eligibility point for an initial daily attempt.
2. A confirmed provider error/rejection records retry eligibility for a later hourly tick in the same local day.
3. Retry eligibility is explicit enough to distinguish a failed attempt from a user who was never due. Do not infer all late sends merely from `lastNudgeDate = null`.
4. Retry attempts are bounded by count and/or a same-local-day deadline.
5. Quiet hours, opt-out, premium entitlement, cadence, “already checked today,” journey stop rules, and local-day boundaries remain enforced.
6. Overlapping cron runs use an atomic lease/claim so at most one owns a given attempt.
7. `ok` records the durable successful local date and clears retry state.
8. `gone` deletes the dead endpoint and clears all associated retry state.
9. `error` releases the attempt lease, advances bounded retry metadata, does not write a success heartbeat, and does not block other subscriptions.
10. The next local day does not inherit a stale prior-day retry.

A clean implementation may require an additive schema migration for attempt/retry/lease metadata. If so, update the schema, migration journal/snapshot, production migration runbook, privacy/retention documentation, and concurrency tests. Do not overload a success-only field in a way that recreates the original bug.

Add or retain regression coverage for:

- error at the scheduled hour, success at the next hourly tick;
- repeated errors hitting the retry bound;
- overlapping initial attempts;
- overlapping retries;
- provider acknowledgement ambiguity documented as residual duplicate risk;
- one failed subscription not blocking another;
- `gone` endpoint pruning;
- retry crossing quiet hours;
- retry at local-day boundary;
- user checks a meal between initial failure and retry;
- opt-out or entitlement loss between attempts;
- daily/few-per-week/weekly cadence;
- successful retry dedupe for the rest of the day;
- heartbeat/reporting behavior on partial failure and later recovery.

Commit the atomic source/test change before verification, following the existing autoresearch fix-loop discipline.

### 3. Re-run the complete local release gate

Run focused nudge and route tests first, then the complete gate:

```bash
npx vitest run tests/unit/server/nudge.test.ts tests/unit/server/push-routes.test.ts

npm run build
npm run typecheck
npm run lint -- --no-cache
npm run contract
npx drizzle-kit check
npm test
npx playwright test
```

Also run:

```bash
git diff --check -- <only-the-remediation-paths-you-changed>
```

Do not proceed to merge/deploy unless every required local gate is green with no unexplained skip/flaky/retry masking.

### 4. Land through real repository controls

1. Inspect the complete diff and commit history.
2. Stage only exact remediation paths.
3. Push the branch and run real GitHub Actions.
4. Enable/verify required checks, required review, CODEOWNERS enforcement, protected production environment approval, and security scanning.
5. Demonstrate that an unreviewed or red revision cannot merge/promote.
6. Merge only the reviewed green revision.
7. Record the exact merged SHA.
8. Deploy that exact SHA and verify the production alias resolves to it.

Keep these evidence buckets separate: local checkout, committed branch, GitHub green revision, merged revision, deployed revision, and provider activation.

### 5. Apply and prove Railway scheduler changes

The prior Railway configuration plan reported `0 add, 4 change, 0 destroy`:

1. replace the preserved/hidden `APP_URL` with the canonical literal;
2. replace the ad-hoc curl image source with the GitHub repository;
3. use the committed `Dockerfile.cron`;
4. use the Node hourly runner start command.

The `railway-config` project skill requires a plan first and explicit approval before apply. Re-run the plan against current state. Do not apply without that approval.

After an approved apply:

- inspect at least four consecutive hourly executions;
- prove all four routes returned strict success;
- prove fresh database heartbeats;
- correlate real effects for Stripe reconcile, Pantry sweep, precharge, Blob GC, and nudge where applicable;
- prove redirects/non-JSON/partial failures make the run red and alert;
- verify logs contain no secrets or user data.

### 6. Activate and prove Vercel/private Blob/model paths

1. Provision a dedicated private Vercel Blob store.
2. Bind `PANTRY_BLOB_READ_WRITE_TOKEN` to the correct environments without printing it.
3. Deploy the exact merged SHA.
4. Prove an authenticated Pantry upload/process/delete journey.
5. Prove an unauthenticated or cross-user object fetch cannot retrieve the photo.
6. Inject delete failure and prove pointer retention plus eventual cleanup.
7. Validate production model routing: no unintended `OPENAI_BASE_URL`, no provider-prefixed model for direct OpenAI routing, and no incompatible key/base/model combination.
8. Run at least three varied synthetic, non-sensitive model checks and validate the structured schema, postprocessing, timeout/failure response, and safe telemetry.
9. Prove `/.well-known/security.txt` returns `200`, canonical content location, `text/plain`, one future expiry, and no caching surprise.
10. Prove `/api/health` and `/api/health/live` have their intended, different semantics.

### 7. Activate and prove Resend plus email DNS

1. Follow `docs/runbooks/email-delivery.md`.
2. Apply migration `0016` through the owner migration path.
3. Register the production/preview Resend webhook at `/api/webhooks/resend`.
4. Bind `RESEND_WEBHOOK_SECRET` without exposing it.
5. Publish the exact provider-required Return-Path MX before making broader DNS changes.
6. Use only an approved synthetic test identity.
7. Prove magic-link receipt in direct and forwarded inboxes, replay rejection, expiry, and session creation.
8. Prove delivered, bounced, complained, and suppressed webhook events are signature-verified, monotonic under reordering/duplication, stored without address/body/link content, and enforced on future sends.
9. Prove Pantry and operational mail recover exactly once after a bounded transport failure.
10. Validate provider receipt, local state, alerting, and suppression cleanup ownership.

Do not treat “Resend API returned accepted” as delivered mail.

### 8. Complete database durability and authority proof

Follow `docs/runbooks/database-governance.md` exactly:

1. Verify a current backup first.
2. Create/use a restricted DML runtime role.
3. Keep the owner/migration URL out of Vercel runtime environments.
4. Apply committed migrations 0014–0016 only through the protected owner command.
5. Run `npm run db:governance:check` and require every reported boolean to be true.
6. Prove runtime DML works and runtime DDL fails.
7. Prove exact journal hashes match production.
8. Observe connection count/pressure under representative Vercel concurrency.
9. Verify backup/PITR settings.
10. Restore into an isolated service and record RPO, RTO, duration, and integrity checks.
11. Provision an isolated preview database.

Do not mutate production roles or migrations without the provider owner, backup, rollback plan, and the required approval.

### 9. Complete the Stripe controlled lifecycle

Use Stripe test mode and `scripts/e2e-stripe-lifecycle.mjs`; do not create a real charge.

Prove:

```text
checkout
  -> signed webhook
  -> minimized durable inbox
  -> reducer
  -> entitlement and Pantry state
  -> email attempt/provider receipt
  -> portal
  -> cancellation
  -> missed-webhook reconciliation
  -> duplicate/out-of-order idempotency
  -> terminal cleanup/retention
```

Also inject cancellation failure during account deletion and prove the account/billing pointer remains recoverable. Record provider event IDs and local correlation IDs, but no card, email, health, or free-text data.

### 10. Build a genuinely isolated preview

Preview must use isolated nonproduction:

- PostgreSQL;
- Stripe test mode and webhook;
- Resend test domain/approved identities and webhook;
- private Blob store;
- model/provider project with a spend cap;
- Upstash resources;
- Sentry project/environment;
- Umami site/environment;
- push/VAPID test subscription.

Do not copy production secrets into preview and do not allow preview to charge, email, push, delete, or mutate production users/resources.

Run every critical success, failure, retry, duplicate, timeout, deletion, privacy, and rollback journey there before production.

### 11. Prove observability and operational ownership

- Reconcile current Sentry and Umami provider truth, including newer handoff claims, against the live dashboard.
- Emit safe synthetic server and browser errors and prove exactly one event each, correct project/environment/release, scrubbed request fields, and alert acknowledgement.
- Generate a real Umami browser event through the current CSP path and prove dashboard receipt plus blackout alerting.
- Prove cron/job failure, stale heartbeat, model failure, email suppression, billing dead letter, Blob GC failure, and readiness degradation all have an owner and actionable alert.
- Run a rollback drill from the exact deployed SHA and record the recovery result.

### 12. Resolve DNS and orphan resources safely

- Add/verify the Resend Return-Path MX first.
- Verify current Vercel and Resend documentation before changing CAA, DNSSEC, or DMARC.
- Validate authoritative records and at least two public resolvers after propagation.
- Do not use or redirect to `revora.app`; that domain is not an approved Revora asset in this audit.
- The suspected empty Railway databases are `Postgres-D2oG` and `Postgres-FOMu`.
- Before deletion, prove exact project/service binding, zero required data, backup/rollback posture, and no current environment reference.
- Obtain explicit destructive approval before deleting those databases or any stale Vercel/GitHub workflow resource.
- Re-inventory after deletion and preserve an audit record.

## Hard safety and truth boundaries

- Do not claim “flawless,” “done,” “launch-ready,” or “safe for end users” from local tests alone.
- Do not call a provider surface passed when it is disabled; label it `INTENTIONAL OFF` and prove the off-state is safe.
- Do not use production customer data for synthetic tests.
- Do not send real email/push notifications or create charges without approved test identities, mode, limits, and cleanup.
- Do not expose secrets in terminal output, handoffs, logs, screenshots, or commits.
- Do not broad-stage, reset, clean, force-push, or overwrite the dirty checkout.
- Do not apply Railway configuration without the skill-required explicit approval.
- Do not delete provider resources without exact binding verification and explicit destructive approval.
- Do not weaken a regression test merely to obtain a green gate.
- Engineering proof does not substitute for counsel clearance or real clinical/content approval. Keep those gates separately named.

## Definition of done

The work may be reported `DONE` only when all of the following are true:

- [ ] I-23's next-hour retry defect is fixed with bounded, concurrency-safe semantics and regression coverage.
- [ ] Build, standalone typecheck, cold zero-warning lint, safety contract, Drizzle check, all unit/integration tests, and full Playwright pass on the final committed revision.
- [ ] A real protected GitHub Actions run is green on the exact revision.
- [ ] The reviewed revision is merged and the exact merged SHA is recorded.
- [ ] Production and preview deployments are proven to run that exact SHA.
- [ ] Every provider integration is proven through a real safe journey, provider receipt, local state transition, recovery/failure case, and monitoring signal.
- [ ] Railway's strict scheduler runs all required jobs and alerts on partial failure.
- [ ] Pantry Blob storage is private in live environments and deletion/orphan recovery is proven.
- [ ] Auth and operational email delivery, webhook state, suppressions, DNS, and inbox behavior are proven.
- [ ] Stripe checkout, webhook, inbox, entitlement, portal, cancel, reconcile, duplicate/out-of-order, privacy retention, and cleanup are proven in test mode.
- [ ] Database least privilege, migrations, backup/PITR, connection budget, and isolated restore are proven.
- [ ] Preview resources are isolated from production.
- [ ] Sentry, Umami, uptime/readiness, cron, and provider alerts are received, scrubbed, owned, and acknowledged.
- [ ] Branch protection, environment approvals, CODEOWNERS enforcement, and scanning are active and tested.
- [ ] Orphan resources are either safely removed with approval or explicitly retained with owner/rationale.
- [ ] DNS changes are authoritative, publicly propagated, and mail-safe.
- [ ] Rollback and incident-response drills have current evidence.
- [ ] Legal/counsel and real clinical/content approval gates are explicitly cleared by their actual owners, or the affected launch surface remains disabled.
- [ ] The final report separates local source/test truth, committed/merged truth, deployed runtime truth, and external/provider/legal truth.
- [ ] There are no unexplained `OPEN`, `BLOCKED`, `PARTIAL`, flaky, skipped-critical, config-only, or “could not access” rows left.

If a gate cannot be completed, stop and report `DONE_WITH_CONCERNS` or `BLOCKED`, naming the exact owner, action, approval, evidence, and residual user impact. Never collapse an external gate into a local pass.

## Evidence and source index

Local evidence:

- `docs/handoff/2026-07-22-revora-service-integrations-deep-audit-report.md`
- `fix/260722-2149-service-integrations/fix-results.tsv`
- `fix/260722-2149-service-integrations/impact-assessment.md`
- `fix/260722-2149-service-integrations/summary.md`
- `fix/260722-2149-service-integrations/blocked.md`
- `docs/runbooks/database-governance.md`
- `docs/runbooks/email-delivery.md`
- `scripts/e2e-stripe-lifecycle.mjs`
- `.railway/railway.ts`
- `Dockerfile.cron`
- `scripts/run-hourly-crons.mjs`
- `.github/workflows/ci.yml`

Official requirements consulted during the audit/remediation:

- OpenRouter Responses beta: <https://openrouter.ai/docs/api/reference/responses/overview>
- Railway cron jobs: <https://docs.railway.com/cron-jobs>
- Railway infrastructure as code: <https://github.com/railwayapp/railway-ts-sdk>
- Vercel private Blob storage: <https://vercel.com/docs/vercel-blob/private-storage>
- Vercel Blob overview: <https://vercel.com/docs/vercel-blob>
- Vercel Blob security: <https://vercel.com/docs/vercel-blob/security>
- Resend webhook signatures: <https://resend.com/docs/webhooks/verify-webhooks-requests>
- Resend webhook event types: <https://resend.com/docs/webhooks/event-types>
- Resend send API: <https://resend.com/docs/api-reference/emails/send-email>
- Resend idempotency: <https://resend.com/docs/dashboard/emails/idempotency-keys>
- RFC 9116: <https://www.rfc-editor.org/info/rfc9116/>

Recheck current provider documentation immediately before any mutation because provider requirements can change.

## Required final response from the continuation session

Return:

1. the exact final branch, commit, merged SHA, and deployed SHA;
2. every code/config/provider change made;
3. the complete test and browser evidence with counts;
4. the updated 25-issue ledger with no ambiguous statuses;
5. cross-service journey evidence and provider correlation;
6. deployment, monitoring, recovery, rollback, backup/restore, and security-control proof;
7. any remaining external owner/approval/legal/clinical gate;
8. an honest release decision: `DONE`, `DONE_WITH_CONCERNS`, `BLOCKED`, or `NO-GO`.

Do not end with a narrative claim. End with evidence and an explicit release decision.
