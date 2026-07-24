# Revora service-integrations — independent validation, true-done remediation, and GO closeout master prompt

> **Starting decision:** `NO-GO / IN PROGRESS`
>
> **Target decision:** `GO`
>
> **Prepared:** 2026-07-23 EDT
>
> **Workspace:** `/home/tefera/Desktop/Revora`
>
> **Purpose:** Give a fresh model or new session enough current evidence, execution authority, safety boundaries, and completion criteria to independently revalidate all claimed work, fix every regression or remaining gap, activate and prove every required service integration, merge and deploy the exact reviewed revision, and convert the technical service-integrations release decision to `GO`.

---

## Your mission

You are the final accountable engineering and release agent for the Revora
service-integrations remediation.

Do not merely summarize prior work. Do not stop at a green local test suite.
Do not accept `FIXED_LOCAL`, `VERIFIED_PREVIEW`, provider configuration
presence, a dashboard screenshot, or a green `/health` response as proof of a
working production integration.

You must:

1. rehydrate current truth from source, Git, CI, deployments, providers, DNS,
   databases, logs, and browser behavior;
2. independently review and validate every claimed completed change;
3. reproduce and fix any regression, incomplete implementation, unsafe
   behavior, stale documentation, or missing test you discover;
4. complete every remaining technical task in the 25-issue ledger;
5. provision and use a genuinely isolated preview environment;
6. prove real success, failure, retry, recovery, deletion, privacy, monitoring,
   and rollback paths with safe synthetic data;
7. merge only a reviewed, protected, exact green revision;
8. deploy that exact merged revision to preview and production;
9. prove the production alias and provider receipts correlate to that exact
   revision;
10. update the durable evidence artifacts and return an honest final `GO` only
    when every technical service-integration gate below is satisfied.

Keep working while safe, in-scope work remains. Diagnose failures to root cause,
fix them, retest them, and continue. Do not weaken assertions, skip critical
tests, hide flakes with retries, or relabel a missing live proof as passed.

---

## Scope boundary: counsel and clinical/content clearance are not release gates

This master prompt governs the **technical service-integrations release
decision**.

Counsel clearance and real clinical/content-owner clearance are explicitly
**out of scope**. Their presence or absence:

- must not block this prompt's `GO`;
- must not be included in the 25-issue service-integrations ledger;
- must not be listed as a residual blocker, concern, dependency, or condition
  for `GO`;
- must not influence scoring or the final `GO` / `NO-GO` decision.

Do not claim that counsel, a clinician, a dietitian, or a content owner approved
anything unless independently true. Simply exclude those approval domains from
this technical decision. Do not resurrect older handoff language that made
those clearances part of this release gate.

The final verdict should be read as:

```text
Revora technical service-integrations release decision: GO or NO-GO
```

It is not a legal opinion or a clinical-content clearance.

---

## Standing execution authority

The user has granted this continuation session the authority needed to complete
the outstanding technical work. Do not repeatedly stop to ask for approval for
the in-scope actions below.

This document is standing authorization to:

- create, update, and commit source, tests, migrations, runbooks, CI, and
  operator documentation needed to close the ledger;
- push the branch, update the pull request, obtain or configure the required
  repository controls, merge the reviewed green revision, and deploy it;
- configure GitHub required checks, reviews, CODEOWNERS enforcement,
  environments, approvals, dependency/security scanning, and least-privilege
  workflow settings;
- use the lowest sufficient GitHub/provider plan or bounded provider spend
  needed for the required technical controls;
- provision isolated preview resources for PostgreSQL, Stripe test mode,
  Resend, private Blob, model routing, Upstash, Sentry, Umami, web push, and
  scheduler testing;
- back up the production database, create a restricted runtime role, apply
  committed migrations through the protected owner path, inspect grants and
  connections, and perform an isolated restore;
- add or update Vercel environment bindings, create the dedicated private
  Pantry Blob store, deploy previews/production, promote aliases, and roll back
  if a gate fails;
- register Resend and Stripe **test-mode** webhooks, rotate or bind webhook
  secrets without printing them, and use approved synthetic test identities;
- publish the exact provider-required Return-Path MX and make the staged,
  verified DNSSEC/CAA/DMARC changes required by the current provider
  documentation;
- apply the Railway configuration when a fresh plan matches the approved shape
  described below;
- emit safe synthetic Sentry, Umami, readiness, scheduler, email, billing,
  Blob, model, and push canaries and acknowledge/clean them up;
- delete the two named empty Railway databases and other proven stale resources
  only after satisfying the exact destructive preconditions below;
- run bounded test-mode payment activity, synthetic email, and synthetic push
  needed for proof and clean it up afterward.

### Standing Railway apply approval

The current expected Railway plan is:

```text
0 add, 4 change, 0 destroy
```

This prompt is explicit approval to apply it without another user round trip
**only if** a fresh plan still has that exact shape and the four changes are
exactly:

1. replace preserved/hidden `APP_URL` with the canonical literal;
2. replace the ad-hoc curl image source with the Revora GitHub repository;
3. use committed `Dockerfile.cron`;
4. use `node scripts/run-hourly-crons.mjs` as the start command.

Read and follow the repository's `railway-config` skill. Plan first. If the plan
drifts, targets another service/environment, adds or destroys resources, or
contains an unexplained mutation, do not apply it until you resolve the drift
and can produce an equally exact safe plan.

### Standing orphan-resource deletion approval

This prompt grants destructive approval to delete:

- `Postgres-D2oG`;
- `Postgres-FOMu`;

only after a fresh read-only check proves, for each exact service:

- exact project/environment/service identity;
- zero required tables and zero required data;
- no current Vercel, Railway, CI, developer, backup, or runtime reference;
- no required restore or audit purpose;
- backup/rollback posture is recorded;
- the active application database is not the target.

If any precondition is false or ambiguous, do not delete that resource. Resolve
the binding first. After deletion, re-inventory and preserve provider receipts.

Other stale Vercel, GitHub, Railway, webhook, or provider resources may be
removed only after the same exact-target, zero-dependency, rollback, and
post-delete verification discipline.

### Safety limits that remain in force

Broad execution authority does not authorize careless execution:

- never print, log, screenshot, commit, or paste secret values;
- never use production customer data for testing;
- never create a real customer charge;
- never send test email or push to an unapproved real recipient;
- use synthetic identities, test mode, spend caps, and cleanup;
- never make a private repository public merely to obtain a control;
- do not broad-stage, reset, clean, force-push, or overwrite unrelated work;
- verify target identity before every destructive or production mutation;
- back up before database or difficult-to-reverse changes;
- prepare and test rollback before promotion;
- prefer staged changes with immediate validation and provider receipts;
- if current evidence contradicts this prompt, current source/provider/runtime
  truth wins and the discrepancy must be documented.

---

## Current truth at prompt creation

Treat this as a starting snapshot, not current truth. Recheck every value before
acting.

| Truth bucket | Snapshot |
|---|---|
| Working directory | `/home/tefera/Desktop/Revora` |
| Branch | `docs/b1-b2-final-closeout` |
| Final branch/remote HEAD | `a485081aae2cd056dac1e32824f8ac65c81bb71f` |
| Pull request | GitHub PR `#35`, open and mergeable, no review at capture |
| Final-head GitHub CI | Run `30004841788`, all four jobs successful |
| `origin/main` | `fc8e9fa164bf942ec7b50d14776c7fefa252d3bf` |
| Merged remediation SHA | None |
| Production SHA | Old SHA `fc8e9fa164bf942ec7b50d14776c7fefa252d3bf` |
| Exact final primary preview | `dpl_HtuYR3fqBKR6Q6q2VCqPotk4BJ5f`, READY |
| Exact final duplicate-project preview | `dpl_G7epN4UJLcwUzQgHdbkH37oatscH`, READY |
| Production decision | `NO-GO / IN PROGRESS` |

### Confirmed final-head CI snapshot

GitHub run:

```text
https://github.com/tkiros/Revora/actions/runs/30004841788
```

Snapshot results:

- build, typecheck, lint, safety contract, and Drizzle schema check passed;
- Next.js 16.2.11 built 89 routes;
- lint had zero warnings and zero errors;
- 177 test files and 1,975 tests passed;
- one test file and two tests were explicitly skipped;
- Playwright had 225 passed and 12 explicit provider-gated skips;
- no Playwright failure was reported;
- the complete PR range of 49 non-merge commits had no detected secret leak;
- `npm ci`/audit evidence reported zero known vulnerabilities;
- both Vercel preview checks were green on the exact final head.

The 12 Playwright skips are four private-Blob/live-model Pantry cases across
three browser projects. They remain live-provider proof obligations; do not
hide or silently remove them.

### Exact-preview evidence snapshot

Primary final-head preview:

```text
https://revora-k278wamfg-tkiros-projects.vercel.app
```

At capture:

- `/api/health/live` returned `200`, `cache-control: no-store`, `{ok:true}`;
- `/api/health` returned `503`, `cache-control: no-store`, with bounded
  `model_configuration` degradation in preview;
- `/.well-known/security.txt` returned `200`, `text/plain`, one future expiry,
  one contact, and canonical
  `https://revora.plus/.well-known/security.txt`;
- all temporary Vercel protection bypasses used for verification were revoked.

Production still ran the old SHA:

- `/api/health/live` returned `404`;
- `/.well-known/security.txt` returned `404`;
- legacy `/api/health` returned `200/ok:true` even though nudge,
  trial-precharge, Pantry-sweep, and Stripe-reconcile heartbeats were stale.

### Provider snapshot

- Railway scheduler: fresh plan was `0 add / 4 change / 0 destroy`; live runner
  was still the permissive curl runner.
- Main Railway Postgres: 20 application tables, approximately 31 rows, about
  9 MB, 16 recorded migrations versus 18 committed, and the inspected runtime
  credential was superuser/DDL-capable.
- `Postgres-D2oG` and `Postgres-FOMu`: zero tables and zero rows at capture.
- Vercel production had legacy `BLOB_READ_WRITE_TOKEN` and lacked the dedicated
  `PANTRY_BLOB_READ_WRITE_TOKEN`.
- Vercel production named a non-empty `OPENAI_BASE_URL`; current source rejects
  an incompatible direct-production routing combination.
- Resend showed one verified domain, `contact.revora.plus`, and zero webhooks.
- Required Return-Path MX was absent; DMARC was `p=none`; no apex CAA or DS was
  observed.
- Stripe test mode had zero webhook endpoints. A live Revora webhook existed,
  but available account context also contained unrelated Vendoval/legacy
  objects.
- Sentry browser canary issue `REVORA_1-9`, event
  `b7377e3bdf7d4ab4904dd4b1effd8b6a`, was received exactly once with release
  `6215b14b0ddc1ddb34733011756dd06b4e93e322`, preview environment, and no
  request, breadcrumbs, identity, IP, or geo. The synthetic issue was resolved.
- Umami production browser transport loaded the script and returned `200` from
  the event gateway, but dashboard receipt and blackout-alert acknowledgement
  were not proven.
- GitHub CI was green, but no independent review existed; protected
  review/merge/environment/scanning enforcement was unavailable under the
  observed repository-plan/API state.

---

## Preserve the dirty checkout

At prompt creation, these user-owned changes existed:

```text
 M docs/handoff/2026-07-21-c7-shipped-pr24-deploy-and-residuals-handoff.md
 M docs/retention_flow.md
?? docs/handoff/2026-07-22-pr25-ci-unblock-merge-deploy-umami-csp-handoff.md
?? docs/handoff/2026-07-22-revora-service-integrations-deep-audit-master-prompt.md
?? docs/handoff/2026-07-22-revora-service-integrations-deep-audit-report.md
?? docs/handoff/2026-07-22-stripe-webhook-verified-c7-closeout-handoff.md
?? docs/handoff/2026-07-23-revora-service-integrations-autoresearch-fix-continuation-handoff.md
?? docs/handoff/2026-07-23-revora-service-integrations-go-closeout-master-prompt.md
```

`docs/retention_flow.md:77` previously contained unrelated whitespace that can
make a repository-wide `git diff --check` noisy. Do not edit it unless your
actual remediation requires it.

Use explicit path staging. If new remediation overlaps user-owned changes,
inspect both carefully and use an isolated worktree when that is safer. Never
erase or absorb unrelated changes merely to produce a clean status.

---

## Required reading and rehydration order

Read current versions in this order:

1. this master prompt;
2. `fix/260722-2149-service-integrations/current-status.md`;
3. `docs/handoff/2026-07-23-revora-service-integrations-autoresearch-fix-continuation-handoff.md`;
4. `docs/handoff/2026-07-22-revora-service-integrations-deep-audit-report.md`;
5. `fix/260722-2149-service-integrations/fix-results.tsv`;
6. `fix/260722-2149-service-integrations/impact-assessment.md`;
7. `fix/260722-2149-service-integrations/summary.md`;
8. `fix/260722-2149-service-integrations/blocked.md`;
9. `docs/runbooks/database-governance.md`;
10. `docs/runbooks/email-delivery.md`;
11. `docs/handoff/human-actions-required.md`;
12. `.github/workflows/ci.yml`, `CODEOWNERS`, and Dependabot configuration;
13. `.railway/railway.ts`, `Dockerfile.cron`, and
    `scripts/run-hourly-crons.mjs`;
14. `scripts/e2e-stripe-lifecycle.mjs`;
15. the current schema, migration journal/snapshots, nudge implementation,
    Sentry initialization/scrubbing, Blob access paths, model routing, health
    routes, webhook handlers, retention code, and their tests.

Also inspect any newer handoff, PR review, provider receipt, deployment, or
runtime evidence created after this file.

Start with:

```bash
cd /home/tefera/Desktop/Revora
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git log --oneline --decorate -60
git diff --stat origin/main...HEAD
git diff --check origin/main...HEAD
gh pr view 35 --json number,state,url,headRefOid,mergeable,reviewDecision,reviews,statusCheckRollup
gh run list --branch docs/b1-b2-final-closeout --limit 10
```

Then refresh provider truth through the available authenticated CLIs, APIs,
connectors, and dashboards. Inspect secret **names, presence, scope, metadata,
and binding**, never values.

Immediately before a provider mutation, recheck the provider's current official
documentation. Provider requirements are time-sensitive.

---

## Truth model and evidence discipline

Maintain these separate buckets throughout:

1. current working-tree source;
2. unrelated dirty user work;
3. committed branch revision;
4. local automated-test evidence;
5. local browser/runtime evidence;
6. GitHub CI evidence on an exact SHA;
7. independently reviewed and merged SHA;
8. isolated-preview deployment SHA;
9. production deployment SHA and alias;
10. provider activation and receipt evidence;
11. recovery, alert, acknowledgement, rollback, backup, and restore evidence.

Never let a pass in one bucket imply a pass in another.

For each integration, capture:

```text
timestamp
source SHA
deployment ID and environment
provider/project/resource identity
synthetic input identity
request or event correlation ID
local state before
provider action/receipt
local state after
user-visible result
failure/retry/recovery result
monitor/alert/acknowledgement
cleanup result
redaction/privacy check
```

Do not store email addresses, tokens, card data, health data, photos, support
free text, or secret-bearing payloads in evidence artifacts.

### Allowed final statuses

Use only precise statuses:

- `VERIFIED_SOURCE`
- `VERIFIED_LOCAL`
- `VERIFIED_CI`
- `VERIFIED_PREVIEW`
- `VERIFIED_PRODUCTION`
- `VERIFIED_PROVIDER`
- `VERIFIED_RECOVERY`
- `VERIFIED_WORKSTATION`
- `INTENTIONAL_OFF_SAFE`
- `REGRESSION_OPEN`
- `BLOCKED_EXTERNAL`

An issue may contain multiple proof dimensions, but its final ledger row must
say exactly which are satisfied. Do not use a bare `PASS`, `DONE`, `PARTIAL`,
or `FIXED` without its evidence scope.

For final `GO`, every required production integration must reach the applicable
production, provider, recovery, monitoring, and cleanup states. A deliberately
disabled optional surface may use `INTENTIONAL_OFF_SAFE` only if the off-state
is source-controlled, deployed, monitored where appropriate, and safe.

---

## Independent review of completed work

Treat the existing commits and tests as claims to falsify.

Review the complete branch range, including:

```text
4d0451a fix(push): bound same-day nudge retries
0c416f8 test(e2e): run immutable production servers
0483b10 test(e2e): isolate production paywall builds
ebdf92d test(auth): provision isolated preview mailbox
39adc65 fix(auth): keep verification URL on product route
41c7fb9 test(auth): enforce current privacy journeys
f048a07 test(auth): follow post-consent home route
6d77d20 test(e2e): isolate provider credentials
f8fa488 fix(e2e): accept partial isolated environments
80ea9fb ci: cover full PR history on Node 24
feef3bb fix(observability): bind Sentry events to deploy SHA
a675df0 ci: scan the real pull-request head
8608b56 fix(security): update vulnerable dependencies
83ce130 fix(security): force patched image processor
6215b14 fix(observability): suppress Sentry geo enrichment
7e71bc7 docs(blob): require the private Pantry credential
a485081 docs(audit): record branch and provider truth
```

Also review every earlier remediation commit named by the continuation handoff
and audit ledger.

### Required review questions

- Does each fix address the root cause rather than just the observed assertion?
- Can concurrency, retry, time-zone, local-day, idempotency, provider timeout,
  duplicate, reordering, or crash behavior violate the intended invariant?
- Do migrations have forward, replay, partial-application, rollback, and
  production-hash safety?
- Can browser builds or tests accidentally use ambient provider credentials,
  production resources, stale output, shared state, or a mutable server?
- Can privacy data leak through error objects, provider metadata, analytics,
  logs, event payloads, IP/geo enrichment, support text, raw webhooks, or
  evidence artifacts?
- Can a provider return accepted while the real user-visible effect fails?
- Can health/readiness remain green while a required dependency or scheduler
  effect is stale?
- Can a cron route redirect, return malformed/partial success, or fail while the
  aggregate run stays green?
- Can production run a SHA other than the reviewed/merged/deployed SHA claimed?
- Can repository or environment settings allow an unreviewed/red change to
  merge or promote?
- Do runbooks describe the source and live provider topology after mutations?
- Are dependency overrides actually present at every affected transitive edge?
- Is every regression test strong enough to fail on the old behavior?

If you find a defect, add it to the ledger, reproduce it, fix it, add a
regression test, commit the atomic change, rerun focused gates, and then rerun
the complete gate.

### I-23 review minimum

Independently verify:

- the configured local hour controls only the initial daily attempt;
- only a confirmed failed due attempt creates later retry eligibility;
- retry does not arise merely from a null success date;
- retry is same-local-day and bounded to no more than the intended attempts;
- retry never crosses stale local-day state;
- quiet hours and DST transitions are handled deliberately;
- opt-out, entitlement loss, meal completion, cadence, and journey-stop changes
  between attempts are honored;
- overlapping initial runs and retries have one atomic owner;
- `ok` writes the durable successful local date and clears retry state;
- `gone` prunes the endpoint and associated retry state;
- `error` releases/advances the attempt without a false success heartbeat;
- one failing subscription does not block another;
- later recovery produces the right heartbeat/report;
- provider acknowledgement ambiguity and residual duplicate risk are
  documented and bounded.

---

## Current 25-issue starting ledger

Rebuild this from current evidence. Do not merely copy these statuses.

| ID | Starting status | Technical proof required for closure |
|---|---|---|
| I-01 model routing | `BRANCH_FIXED / PRODUCTION_CONFIG_BLOCKED` | Correct production base/key/model combination; exact deployed SHA; three varied structured calls; bounded failure and safe telemetry |
| I-02 Railway hourly jobs | `BRANCH_FIXED / APPLY_APPROVAL_OPEN` | Apply approved plan; four consecutive strict runs; fresh heartbeats; downstream effects; red partial-failure and alert proof |
| I-03 Pantry Blob privacy | `BRANCH_FIXED / PRIVATE_STORE_NOT_PROVISIONED` | Dedicated private store; authorized processing; cross-user and unauthenticated denial; deletion fault; pointer retention; orphan recovery |
| I-04 auth email | `BRANCH_FIXED / DNS_INBOX_PROOF_OPEN` | Return-Path MX; direct/forwarded receipt; replay rejection; expiry; session creation; bounce behavior |
| I-05 CI/CD and E2E | `BRANCH_AND_CI_VERIFIED / REVIEW_ENFORCEMENT_OPEN` | Full exact-head gates; independent review; enforced checks/reviews; merged SHA; exact production promotion |
| I-06 Stripe end to end | `TEST_ENDPOINT_ABSENT / CONTROLLED_LIFECYCLE_OPEN` | Isolated test webhook; checkout-to-cleanup lifecycle; missed/duplicate/out-of-order/cancel/reconcile proof |
| I-07 account deletion billing | `BRANCH_FIXED / ISOLATED_FAILURE_PROOF_OPEN` | Inject cancellation failure and prove retention/recovery; prove confirmed-cancel success |
| I-08 Pantry paid email | `BRANCH_FIXED / PROVIDER_RECOVERY_PROOF_OPEN` | Synthetic transport failure; durable retry; exactly-once outcome; provider receipt |
| I-09 Blob deletion pointers | `BRANCH_FIXED / PRIVATE_STORE_FAILURE_PROOF_OPEN` | Live private-store delete failure; pointer retention; retry; provider deletion and cleanup |
| I-10 browser Sentry privacy | `PREVIEW_BROWSER_CANARY_VERIFIED / PRODUCTION_ACK_OPEN` | Exact production release; exactly-one scrubbed browser event; alert delivery and acknowledgement |
| I-11 Upstash timeout | `BRANCH_FIXED / CONTROLLED_OUTAGE_PROOF_OPEN` | Isolated timeout/unavailability; fail-closed behavior; recovery; no secret leakage |
| I-12 push/scheduler dependency | `BRANCH_FIXED / LIVE_CHAIN_OPEN` | Scheduler call, push receipt, gone pruning, real safe effect, heartbeat, monitor, alert |
| I-13 health/monitoring | `BRANCH_FIXED / PRODUCTION_MONITOR_OPEN` | Production readiness degrades for every stale/unavailable dependency; liveness remains process-only; alert and recovery |
| I-14 DB durability | `BACKUP_RESTORE_EVIDENCE_OPEN` | Current backup/PITR; isolated restore; RPO, RTO, duration, hashes/checksums |
| I-15 DB governance | `BRANCH_FIXED / LIVE_ROLE_AND_MIGRATION_OPEN` | Restricted runtime role; protected owner migrations; DML success; DDL denial; journal hashes; connection budget |
| I-16 preview environment | `NOT_ISOLATED / PROVISIONING_OPEN` | Isolated nonproduction DB, Stripe, Resend, Blob, model, Upstash, Sentry, Umami, and push |
| I-17 observability | `PARTIAL_PROVIDER_PROOF / OWNERSHIP_AND_ALERTS_OPEN` | Server/browser canaries; dashboards; blackouts/provider failures; owner routing; acknowledgement |
| I-18 Stripe retention | `BRANCH_FIXED / MIGRATION_REPLAY_OPEN` | Apply migration; replay/reconcile without raw PII; safe error codes; terminal expiry |
| I-19 Resend state/suppressions | `BRANCH_FIXED / MIGRATION_AND_WEBHOOK_OPEN` | Apply migration; signed webhook; delivered/bounced/complained/suppressed ordering; enforcement and cleanup |
| I-20 DNS/email security | `RETURN_PATH_MX_ABSENT / DNS_APPROVAL_OPEN` | Exact provider MX; staged current DNSSEC/CAA/DMARC; authoritative and two-resolver propagation proof |
| I-21 GitHub controls | `BRANCH_CI_FIXED / PLATFORM_ENFORCEMENT_BLOCKED` | Required reviews/checks/CODEOWNERS/environment controls/scanning; prove forbidden red/unreviewed merge and promotion |
| I-22 orphan resources | `ZERO_DATA_REVERIFIED / DESTRUCTIVE_APPROVAL_OPEN` | Revalidate bindings/data; delete or retain with evidence; re-inventory and receipts |
| I-23 transient push retry | `BRANCH_AND_CI_VERIFIED / LIVE_RECEIPT_OPEN` | Apply migration/scheduler; real safe failure-to-next-hour recovery; dedupe/prune/heartbeat/alert correlation |
| I-24 local credential modes | `FIXED_WORKSTATION` | Reverify owner-only modes and bounded secret-file inventory; rotate only if evidence requires |
| I-25 hardening/docs | `BRANCH_AND_CI_VERIFIED / PRODUCTION_ENDPOINT_OPEN` | Exact production `security.txt`; zero-warning lint; current runbooks after mutations |

The ledger may grow if independent review discovers additional issues. Do not
force new findings into an unrelated ID merely to preserve the number 25.

---

## Execution program

### Phase 0 — Rehydrate and establish a clean evidence baseline

1. Run the Git/source checks above.
2. Reopen all required artifacts and current implementation.
3. Confirm the exact PR head, reviews, CI runs, merge base, main SHA, deployment
   SHAs, production alias, and provider resource identities.
4. Inventory all environment-variable names and scopes without printing values.
5. Re-run the Railway plan without applying until its shape is confirmed.
6. Refresh GitHub settings, environments, rules, security controls, and plan
   capabilities.
7. Refresh Vercel, Railway, Sentry, Umami, Resend, Stripe, DNS, and database
   state.
8. Build a new timestamped evidence ledger separating all truth buckets.
9. Record every drift from this prompt before changing anything.

### Phase 1 — Independent source and regression review

1. Review the complete remediation diff and migration history.
2. Run focused I-23, push-route, health, Blob, billing, Resend, Stripe,
   Sentry-scrubbing, auth, CI-policy, schema, and browser-harness tests.
3. Run:

   ```bash
   npm run build
   npm run typecheck
   npm run lint -- --no-cache
   npm run contract
   npx drizzle-kit check
   npm test
   npx playwright test
   npm audit
   ```

4. Require zero unexplained failure, flake, retry, warning, vulnerability, or
   critical skip.
5. Fix and commit every defect before proceeding.
6. Run `git diff --check` only against exact remediation paths when unrelated
   user whitespace would contaminate a repository-wide result.

### Phase 2 — Build a genuinely isolated preview

Provision or bind dedicated nonproduction:

- PostgreSQL database and restricted runtime role;
- Stripe test account context and signed webhook endpoint;
- Resend test domain/approved recipients and webhook;
- private Pantry Blob store;
- model/provider project with a hard spend cap;
- Upstash resources;
- Sentry project/environment and alert destination;
- Umami site/environment and blackout monitor;
- VAPID/push test subscription;
- Railway/Vercel job and deployment context where necessary.

Prove by identifiers and behavior that preview cannot charge, email, push,
delete, read, or mutate production users or resources. Never copy production
provider secrets into preview by default.

### Phase 3 — Database durability, authority, and migration proof

Follow `docs/runbooks/database-governance.md`:

1. verify a current backup before mutation;
2. capture provider backup/PITR settings;
3. restore into an isolated service and record RPO, RTO, duration, row/table
   integrity, and migration hashes;
4. create/use a restricted DML runtime role;
5. keep owner/migration credentials out of Vercel runtime environments;
6. apply committed migrations `0014`–`0017` as required through the protected
   owner command;
7. run `npm run db:governance:check` and require every boolean to be true;
8. prove runtime DML succeeds and runtime DDL fails;
9. prove production journal hashes exactly match source;
10. measure connection count/pressure under representative Vercel concurrency;
11. validate rollback/recovery for a failed or interrupted migration.

### Phase 4 — Private Blob and model-routing proof

1. Provision a dedicated private Vercel Blob store.
2. Bind `PANTRY_BLOB_READ_WRITE_TOKEN` only to intended environments.
3. Remove or segregate the legacy public binding from the Pantry path.
4. Prove authenticated upload, server-side model read, processing, and deletion.
5. Prove unauthenticated, direct-URL, and cross-user object access is denied.
6. Inject delete failure; prove database pointer retention, retry, eventual
   provider deletion, and orphan cleanup.
7. Resolve production `OPENAI_BASE_URL`/key/model compatibility intentionally.
8. Prove no unintended provider-prefixed model reaches direct OpenAI routing.
9. Run at least three varied non-sensitive structured model calls.
10. Validate schema, postprocessing, timeout, rejection, fallback boundaries,
    spend caps, and PII-safe telemetry.

### Phase 5 — Resend, auth email, delivery state, and DNS

Follow `docs/runbooks/email-delivery.md`:

1. confirm migration `0016` is applied through the owner path;
2. create preview and production Resend webhooks at `/api/webhooks/resend`;
3. bind `RESEND_WEBHOOK_SECRET` without exposing it;
4. publish the exact current provider-required Return-Path MX first;
5. verify provider domain state after propagation;
6. use only approved synthetic identities;
7. prove magic-link receipt in direct and forwarded inboxes;
8. prove replay rejection, expiry, session creation, and bounce behavior;
9. prove signature verification and monotonic handling of delivered, bounced,
   complained, suppressed, duplicate, and reordered events;
10. prove future-send suppression enforcement;
11. prove stored state excludes addresses, bodies, links, and support free text;
12. prove Pantry/operational mail recovers exactly once after bounded transport
    failure;
13. verify provider receipt, local state, alert, acknowledgement, retention, and
    cleanup ownership;
14. recheck official current requirements before staged DNSSEC, CAA, and DMARC
    changes;
15. validate authoritative nameservers and at least two public resolvers.

Do not treat a Resend API `accepted` response as delivered mail.

### Phase 6 — Stripe controlled lifecycle

Use Stripe test mode and `scripts/e2e-stripe-lifecycle.mjs`. First prove the
selected account/project is the intended isolated Revora test context and not a
Vendoval or legacy production surface.

Prove:

```text
checkout
  -> signed webhook
  -> minimized durable inbox
  -> reducer
  -> entitlement and Pantry state
  -> email attempt and provider receipt
  -> portal
  -> cancellation
  -> missed-webhook reconciliation
  -> duplicate and out-of-order idempotency
  -> terminal cleanup and retention
```

Also:

- inject cancellation failure during account deletion and prove the account and
  billing pointer remain recoverable;
- prove confirmed cancellation permits the intended deletion path;
- prove valid replay/reconcile without raw PII;
- verify safe error codes and terminal expiry;
- record provider event IDs and local correlation IDs without card, email,
  health, or free-text data;
- clean up every synthetic customer, subscription, event, and webhook created
  for the test.

Never create a live-mode charge.

### Phase 7 — Railway scheduler, push, and recovery chain

1. Re-run the Railway plan and validate the exact approved shape.
2. Apply it under the standing authorization above.
3. Inspect at least four consecutive hourly executions.
4. Prove all required recovery routes are attempted and strict-success checked.
5. Prove redirects, non-JSON, false-success, timeout, and partial failure make
   the run red.
6. Prove fresh database heartbeats and correlate downstream effects for:
   - Stripe reconciliation;
   - Pantry sweep;
   - trial precharge;
   - Blob garbage collection where applicable;
   - nudge delivery.
7. Execute a safe nudge case where the scheduled attempt receives a confirmed
   provider error and the next eligible hourly tick succeeds.
8. Prove retry bounds, same-day expiry, daily dedupe, quiet hours, opt-out,
   entitlement loss, meal completion, cadence, journey-stop changes, concurrent
   ownership, and gone-endpoint pruning.
9. Prove scheduler logs contain no secrets or user data.
10. Prove failure, stale heartbeat, and recovery alerts reach and are
    acknowledged by the configured owner.

### Phase 8 — Health, Sentry, Umami, and operational ownership

1. Deploy exact preview/production release identifiers into Sentry.
2. Emit safe synthetic browser and server errors.
3. Prove exactly one event each, correct project/environment/release, scrubbed
   request/user/IP/geo/breadcrumb fields, alert delivery, acknowledgement, and
   cleanup.
4. Generate a real Umami browser event through the production CSP path.
5. Prove dashboard receipt in the correct site/environment.
6. Prove analytics blackout monitoring and owner acknowledgement.
7. Prove `/api/health` goes non-green for every required stale or unavailable
   dependency.
8. Prove `/api/health/live` remains a process-only no-store liveness probe.
9. Prove actionable ownership and alert acknowledgement for:
   - cron/job failure;
   - stale heartbeat;
   - model failure;
   - email suppression;
   - billing dead letter;
   - Blob garbage-collection failure;
   - readiness degradation;
   - Sentry browser/server error;
   - Umami blackout.
10. Verify alerts contain no secrets or customer data.

### Phase 9 — GitHub controls, review, merge, and exact deployment

1. Refresh PR #35 and complete an independent review.
2. Resolve every review finding with source/tests and rerun the full gate.
3. Configure required checks and review enforcement.
4. Enforce CODEOWNERS where applicable.
5. Configure a protected production environment with approval.
6. Enable and validate dependency, secret, and code scanning.
7. Keep workflow permissions least-privilege and actions pinned.
8. Demonstrate an unreviewed or red revision cannot merge.
9. Demonstrate an unapproved production promotion cannot proceed.
10. Do not make the private repository public as a workaround. Use the lowest
    sufficient supported plan/control.
11. Merge only the reviewed exact green revision.
12. Record the exact merged SHA.
13. Deploy that exact SHA to preview and production.
14. Prove the production alias resolves to the exact deployed SHA.
15. Verify no duplicate Vercel project or stale deployment can receive the
    canonical alias or production traffic.

### Phase 10 — Production cross-service journeys

Run safe, synthetic end-user journeys against the exact production SHA where
the provider supports a non-customer canary. Keep payment lifecycle testing in
Stripe test mode and the isolated preview; do not switch a live production
account to test credentials and do not create a live charge. For production
billing, prove exact-SHA endpoint/configuration/monitoring readiness without
mutating a real customer.

#### Auth journey

```text
request magic link
  -> provider receipt
  -> direct and forwarded inbox
  -> consume link
  -> session
  -> replay rejection
  -> expiry
  -> bounce/suppression path
```

#### Pantry journey

```text
authenticated private upload
  -> authorized server read
  -> structured model extraction
  -> confirmed Pantry order
  -> durable email attempt
  -> provider delivery receipt
  -> object deletion
  -> injected delete failure
  -> pointer retention
  -> eventual cleanup
```

#### Billing journey

```text
isolated-preview test checkout
  -> signed minimized webhook inbox
  -> entitlement
  -> Pantry/billing state
  -> portal
  -> cancellation
  -> missed-event reconciliation
  -> duplicate/out-of-order handling
  -> account-deletion cancellation failure
  -> recovery
  -> terminal retention cleanup
```

#### Scheduler/push journey

```text
hourly runner
  -> strict route responses
  -> heartbeats
  -> provider failure
  -> bounded next-hour retry
  -> delivery receipt
  -> gone endpoint pruning
  -> alert
  -> acknowledgement
  -> recovery
```

#### Observability journey

```text
browser event + server event + analytics event + readiness fault
  -> provider receipt
  -> correct release/environment
  -> scrubbed payload
  -> dashboard
  -> alert
  -> owner acknowledgement
  -> recovery/cleanup
```

Every journey needs browser/network evidence, provider receipt, local state
transition, user-visible outcome, failure/recovery path, monitoring signal, and
cleanup. Configuration presence is not journey proof.

### Phase 11 — Orphan cleanup and topology reconciliation

1. Re-inventory Railway, Vercel, GitHub, Stripe, Resend, Sentry, Umami, DNS, and
   webhook resources.
2. Apply the exact deletion preconditions above to `Postgres-D2oG` and
   `Postgres-FOMu`.
3. Delete them if every precondition remains true.
4. Resolve the duplicate/error Vercel project and any stale deployment,
   webhook, workflow, environment, or alert resource after proving it is
   unreferenced.
5. Re-inventory after cleanup.
6. Update diagrams, runbooks, operator docs, and the issue ledger to match the
   actual live topology.
7. Preserve resource IDs, deletion receipts, timestamps, and rollback posture
   without secrets.

### Phase 12 — Rollback, incident response, and final clean-room verification

1. Prepare and execute a rollback drill from the exact production SHA.
2. Record rollback target, duration, data compatibility, provider behavior,
   alerting, and recovery.
3. Re-promote the verified release if the drill is successful.
4. Run a clean-room full local gate from the exact final commit.
5. Run a new protected GitHub CI gate on that exact commit.
6. Run production smoke and critical cross-service journeys again.
7. Verify exact SHA across GitHub merge, Vercel deployment, Sentry release, and
   production alias.
8. Verify zero open security advisories/vulnerabilities within the repository's
   supported scope.
9. Run scoped `git diff --check` and inspect the final diff/staging set.
10. Ensure no secrets, synthetic artifacts, test accounts, bypasses, stale
    webhooks, temporary DNS records, test subscriptions, or unowned alerts
    remain.

---

## Technical definition of `GO`

Return `GO` only when all of these are true:

- [ ] Every completed remediation was independently reviewed against current
      source and provider/runtime truth.
- [ ] Every discovered regression or new issue is fixed, tested, committed, and
      closed with evidence.
- [ ] I-23 bounded next-hour retry semantics are verified locally, in CI, and
      through a safe live provider journey.
- [ ] Build, standalone typecheck, cold zero-warning lint, safety contract,
      Drizzle check, all unit/integration tests, and full Playwright pass on the
      exact final revision.
- [ ] All critical provider-gated Playwright cases run in isolated preview and
      pass; no critical skip remains unexplained.
- [ ] Exact-head secret scan and dependency/security scans are green.
- [ ] Required checks, independent review, CODEOWNERS/environment enforcement,
      and security scanning are active and have been tested to reject a
      red/unreviewed/unapproved change.
- [ ] The exact reviewed green SHA is merged.
- [ ] Preview and production run the exact merged SHA.
- [ ] The canonical production alias resolves to that exact SHA.
- [ ] Preview resources are isolated from production.
- [ ] Railway's strict scheduler is applied and proven across consecutive runs,
      downstream effects, failure, alerts, acknowledgement, and recovery.
- [ ] Pantry storage is private and its access, processing, deletion,
      pointer-retention, and orphan-recovery paths are proven.
- [ ] Model routing is deliberately configured and proven through structured
      success and bounded failure.
- [ ] Auth and operational email delivery, Return-Path DNS, webhook state,
      suppressions, retry, inbox behavior, and provider receipts are proven.
- [ ] Stripe's test-mode checkout, webhook, minimized inbox, entitlement,
      portal, cancel, reconcile, duplicate/reordering, retention, deletion
      failure, and cleanup paths are proven.
- [ ] Database least privilege, migrations, DDL denial, DML success, journal
      hashes, backup/PITR, isolated restore, connection budget, and rollback are
      proven.
- [ ] Upstash outage/fail-closed behavior and recovery are proven.
- [ ] Push retry, dedupe, pruning, scheduler correlation, monitoring, and
      recovery are proven.
- [ ] Sentry browser/server events and Umami browser analytics are received
      exactly as intended, scrubbed, release-bound, monitored, owned, and
      acknowledged.
- [ ] Readiness/liveness semantics and every required degradation/alert/recovery
      path are proven in production.
- [ ] `security.txt` is canonical, current, correctly typed, correctly cached,
      and available in production.
- [ ] DNS changes are authoritative, publicly propagated, provider-valid, and
      mail-safe.
- [ ] Orphan resources are deleted safely or explicitly retained with a current
      technical owner and rationale.
- [ ] Rollback and incident-response drills have current evidence.
- [ ] Provider/runbook documentation matches current live topology.
- [ ] No unexplained `OPEN`, `PARTIAL`, `BLOCKED`, `FIXED_LOCAL`, flaky,
      skipped-critical, config-only, dashboard-only, or inaccessible row
      remains.
- [ ] The final report cleanly separates source, local tests, CI, merged SHA,
      preview, production, provider, recovery, monitoring, and cleanup truth.

Counsel and clinical/content-owner clearance are intentionally absent from this
definition. Do not add them.

---

## Required durable artifacts

Continuously update:

- `fix/260722-2149-service-integrations/current-status.md`;
- `fix/260722-2149-service-integrations/fix-results.tsv`;
- `fix/260722-2149-service-integrations/impact-assessment.md`;
- `fix/260722-2149-service-integrations/summary.md`;
- `fix/260722-2149-service-integrations/blocked.md`.

Create a final closeout report under:

```text
docs/handoff/
```

Use a timestamped name that clearly identifies the exact merged and production
release closeout. The report must remain safe to commit: no secret values,
customer data, health data, card data, email addresses, images, or support free
text.

For each provider proof, record sanitized correlation IDs, exact SHA,
environment, timestamps, expected/actual results, recovery, alert,
acknowledgement, and cleanup.

---

## Required final response

Return:

1. exact final branch and commit;
2. pull-request URL, review evidence, and protected CI run;
3. exact merged SHA;
4. exact preview and production deployment IDs and SHAs;
5. production alias-to-SHA proof;
6. every source, migration, CI, config, provider, DNS, database, monitoring,
   and cleanup change made;
7. complete local and CI test counts, including browser projects, skips,
   flakes, retries, lint warnings, audit results, and secret-scan range;
8. the final issue ledger, including any newly discovered issues, with no
   ambiguous statuses;
9. cross-service journey evidence and sanitized provider/local correlation;
10. scheduler, heartbeat, downstream-effect, alert, acknowledgement, and
    recovery evidence;
11. private Blob and model-routing proof;
12. Resend, inbox, webhook, suppression, DNS, and recovery proof;
13. Stripe test lifecycle, retention, failure, reconciliation, and cleanup
    proof;
14. database role, migration, backup/PITR, restore, connection, and rollback
    proof;
15. Sentry, Umami, readiness/liveness, dashboard, alert, and ownership proof;
16. GitHub enforcement and forbidden-merge/promotion proof;
17. orphan-resource deletion/retention and re-inventory evidence;
18. rollback/incident drill evidence;
19. the exact paths of all durable evidence artifacts;
20. one explicit technical release decision: `GO` or `NO-GO`.

Do not include counsel or clinical/content clearance as a gate, blocker,
concern, caveat, condition, or verdict input.

Do not end with a narrative claim. End with the evidence-backed decision in
exactly this form:

```text
REVORA TECHNICAL SERVICE-INTEGRATIONS RELEASE DECISION: GO
```

If any technical definition-of-GO item is not actually proven, do not print
`GO`. Keep working until it is resolved or report the exact technical blocker
with owner, required action, evidence, and user impact.
