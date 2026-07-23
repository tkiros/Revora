# Revora service-integrations remediation — current status

> Recorded: 2026-07-23 EDT
>
> Release decision: `NO-GO / IN PROGRESS`

This document separates local source/test truth, committed branch truth, GitHub
truth, preview runtime truth, production runtime truth, and external-owner
truth. A green item in one bucket does not imply a green item in another.

## Truth buckets

| Bucket | Evidence-backed state |
|---|---|
| Working checkout | `docs/b1-b2-final-closeout`; unrelated modified and untracked user files remain preserved |
| Fully gated runtime source | `6215b14b0ddc1ddb34733011756dd06b4e93e322` |
| Latest source/config snapshot at capture | `7e71bc7`; only private-Blob operator templates/tests changed after the full runtime gate |
| Local gate | 89-route Next.js 16.2.11 build; typecheck; zero-warning lint; safety contract; Drizzle check; 177 files/1,974 tests pass with 1 file/2 tests skipped; database-backed Playwright 225 pass, 12 explicit provider-gated skips, no failure/flaky/retry |
| GitHub branch | PR #35 open. Run `30003920371` green on exact runtime SHA; 47-commit secret scan clean; no review |
| GitHub enforcement | Branch protection, rulesets, code scanning, and secret scanning APIs return plan `403`; all five environments have zero protection rules and allow admin bypass |
| Vercel preview | Deployment `dpl_RUEyCZGG7xFEGc62zXHzNsjna7Kv` is `READY` on exact runtime SHA; `/api/health/live` returned `200` through a revoked one-use automation bypass |
| Vercel production | Deployment `dpl_GsPyPVuYLpWmhCe9N5KRb89P2GWc` runs old SHA `fc8e9fa164bf942ec7b50d14776c7fefa252d3bf`; no remediation SHA is production-deployed |
| Production HTTP | `/api/health/live` `404`; `/.well-known/security.txt` `404`; legacy `/api/health` returns `200/ok:true` while nudge, precharge, Pantry sweep, and Stripe reconcile are stale |
| Merged revision | None; `origin/main` remains the old production lineage |
| End-user release | `NO-GO` |

## Verification evidence

- GitHub run: `https://github.com/tkiros/Revora/actions/runs/30003920371`
- Pull request: `https://github.com/tkiros/Revora/pull/35`
- Sentry exact-preview browser issue: `https://revora.sentry.io/issues/7628773941/`
  - event `b7377e3bdf7d4ab4904dd4b1effd8b6a`
  - one browser envelope returned `200`
  - release `6215b14b0ddc1ddb34733011756dd06b4e93e322`
  - environment `preview`
  - exception value redacted
  - no request entry, breadcrumbs, user id/email, IP, or geo
  - high-priority email rule last-triggered at `2026-07-23T11:47:52Z`
  - alert acknowledgement not proven; synthetic issues resolved after capture
- Umami production browser transport: `cloud.umami.is/script.js` returned `200`
  and `gateway.umami.is/api/send` returned `200`; dashboard receipt and blackout
  alert were not proven.

## Current provider truth

| Provider/control | Directly observed | Still required |
|---|---|---|
| Railway scheduler | Fresh plan: `0 add, 4 change, 0 destroy`; current runner is the curl image/loop | Explicit apply approval, four consecutive strict runs, heartbeats, downstream effects, and failure alert |
| Railway Postgres | Main: 20 public app tables, about 31 estimated rows, 16/18 migrations, inspected credential is superuser/owner; `Postgres-FOMu` and `Postgres-D2oG` each have 0 tables/rows | Backup first, restricted runtime role, migrations 0016–0017, governance check, PITR/restore/RPO/RTO, connection-pressure proof |
| Vercel Blob | Production has legacy `BLOB_READ_WRITE_TOKEN`; no `PANTRY_BLOB_READ_WRITE_TOKEN` | Dedicated private store plus authorized/unauthorized/delete/orphan proof |
| Model | Production has direct key/model variables and also a non-empty `OPENAI_BASE_URL` variable name | Resolve/remove incompatible production route before deploy; three safe structured calls plus bounded failure telemetry |
| Resend | `contact.revora.plus` reports verified; zero provider webhooks | Bind webhook secret, apply 0016, Return-Path MX, direct/forwarded inbox, reordering/duplicate/suppression/recovery receipts |
| DNS | No MX at `send.contact.revora.plus`; DMARC is `p=none`; no apex CAA or DS | Provider-required MX first; approved staged DNSSEC/CAA/DMARC work and public propagation proof |
| Stripe | Revora live webhook exists; test mode has zero webhook endpoints | Confirm controlled account context, create test endpoint, run the full no-real-charge lifecycle and failure/reconcile/retention cases |
| Sentry | Exact release, browser envelope, scrubbed state, and email-rule trigger proven; project IP scrubbing enabled | Server canary, actual alert acknowledgement, ownership rules, cron monitors, production release proof |
| Umami | Browser script and event transport returned `200` through current CSP | Dashboard receipt, correct site/environment, blackout alert, owner acknowledgement |
| GitHub | Real green CI; Actions restricted to GitHub-owned plus pinned Gitleaks pattern; vulnerability alerts/automated fixes enabled | Reviewed merge, enforceable checks/reviews/CODEOWNERS/environment approval/scanning or a plan/repository change that supports them |

## Unambiguous 25-issue ledger

| ID | Status | Evidence closed | Exact remaining gate |
|---|---|---|---|
| I-01 model routing | `BRANCH_FIXED / PRODUCTION_CONFIG_BLOCKED` | Production rejects unvalidated compatible routing; safe failure telemetry tested | Production still names `OPENAI_BASE_URL`; resolve config, deploy reviewed SHA, run three structured calls and failure telemetry |
| I-02 Railway hourly jobs | `BRANCH_FIXED / APPLY_APPROVAL_OPEN` | Strict all-route runner and zero-destroy plan | Explicit approval, apply, four consecutive runs, effects, heartbeats, and alerts |
| I-03 Pantry Blob privacy | `BRANCH_FIXED / PRIVATE_STORE_NOT_PROVISIONED` | Private-only runtime path and operator contract | New private store/token, deploy, authorized processing, cross-user denial, deletion, orphan recovery |
| I-04 auth email | `BRANCH_FIXED / DNS_INBOX_PROOF_OPEN` | Production stub fails closed; authenticated local journey passes | Return-Path MX, direct/forwarded delivery, replay, expiry, bounce, and session proof |
| I-05 CI/CD and E2E | `BRANCH_AND_CI_VERIFIED / REVIEW_ENFORCEMENT_OPEN` | Full local gate and exact-code GitHub run green | Review plus enforceable merge/deploy controls; merge and exact-SHA production promotion |
| I-06 Stripe end to end | `TEST_ENDPOINT_ABSENT / CONTROLLED_LIFECYCLE_OPEN` | Durable local source and harness exist | Test webhook endpoint and complete safe lifecycle through cleanup |
| I-07 account deletion billing | `BRANCH_FIXED / ISOLATED_FAILURE_PROOF_OPEN` | Cancellation failure preserves local account in tests | Preview provider-injected cancellation failure and confirmed-cancel success |
| I-08 Pantry paid email | `BRANCH_FIXED / PROVIDER_RECOVERY_PROOF_OPEN` | Durable bounded recovery tested | Approved synthetic Resend failure, exact-once recovery, provider receipt |
| I-09 Blob deletion pointers | `BRANCH_FIXED / PRIVATE_STORE_FAILURE_PROOF_OPEN` | Pointer retention/retry source tested | Live private-store delete fault, retained pointer, retry, provider deletion |
| I-10 browser Sentry privacy | `PREVIEW_BROWSER_CANARY_VERIFIED / PRODUCTION_ACK_OPEN` | Exact release, one envelope, redaction, null IP/geo, no request/breadcrumbs, alert trigger | Production deployment, safe production canary, actual alert acknowledgement |
| I-11 Upstash timeout | `BRANCH_FIXED / CONTROLLED_OUTAGE_PROOF_OPEN` | Timeout policy regression tested | Isolated preview timeout/unavailability proof and recovery |
| I-12 push/scheduler dependency | `BRANCH_FIXED / LIVE_CHAIN_OPEN` | Strict scheduler and bounded nudge retries exist | I-02 apply plus scheduler/push receipt/pruning/effect/monitor correlation |
| I-13 health/monitoring | `BRANCH_FIXED / PRODUCTION_MONITOR_OPEN` | Dependency-aware readiness and process liveness tested; preview liveness `200` | Deploy; prove each dependency degradation, alert, acknowledgement, and recovery |
| I-14 DB durability | `BACKUP_RESTORE_EVIDENCE_OPEN` | Source/runbook boundary only | PITR settings, isolated restore, RPO/RTO/duration/checksums |
| I-15 DB governance | `BRANCH_FIXED / LIVE_ROLE_AND_MIGRATION_OPEN` | Source separation, pool bounds, checker, and 18-migration journal | Backup; restricted role; owner URL out of runtime; apply 0016–0017; DML/DDL/hash/connection proof |
| I-16 preview environment | `NOT_ISOLATED / PROVISIONING_OPEN` | Exact-SHA Vercel preview only | Dedicated DB, Stripe, Resend, private Blob, model, Upstash, Sentry, Umami, push resources |
| I-17 observability | `PARTIAL_PROVIDER_PROOF / OWNERSHIP_AND_ALERTS_OPEN` | Sentry browser receipt/scrub/trigger and Umami transport receipt | Server canary, dashboards, blackouts/failures, owner routing, acknowledgement |
| I-18 Stripe retention | `BRANCH_FIXED / MIGRATION_REPLAY_OPEN` | Minimized envelope/retention tested | Apply 0016 path as applicable, live replay/reconcile without raw PII, terminal expiry |
| I-19 Resend state/suppressions | `BRANCH_FIXED / MIGRATION_AND_WEBHOOK_OPEN` | Signed monotonic state and suppression enforcement tested | Apply 0016, register webhook, bind secret, prove delivered/bounced/complained/suppressed ordering |
| I-20 DNS/email security | `RETURN_PATH_MX_ABSENT / DNS_APPROVAL_OPEN` | Gap reverified publicly | Required MX first, then approved DNSSEC/CAA/DMARC changes and multi-resolver proof |
| I-21 GitHub controls | `BRANCH_CI_FIXED / PLATFORM_ENFORCEMENT_BLOCKED` | Pinned CI, least privilege, full-range scan, clean dependency tree, real green run | Plan/repository capability plus required review/checks/CODEOWNERS/environment/scanning enforcement |
| I-22 orphan resources | `ZERO_DATA_REVERIFIED / DESTRUCTIVE_APPROVAL_OPEN` | Both suspected Railway DBs have zero tables/rows | Exact binding/backups/references, explicit delete approval, re-inventory |
| I-23 transient push retry | `BRANCH_AND_CI_VERIFIED / LIVE_RECEIPT_OPEN` | Bounded same-day retry, lease, eligibility, rollover, cadence, heartbeat regressions pass | Apply 0017 and scheduler config; correlate real safe push retry/prune/monitor |
| I-24 local credential modes | `FIXED_WORKSTATION` | `.env`, `.env.local`, and `openr.md` are owner-only | Rotate only if separate evidence/policy requires it |
| I-25 hardening/docs | `BRANCH_AND_CI_VERIFIED / PRODUCTION_ENDPOINT_OPEN` | Zero-warning lint, provider docs, RFC 9116 route, private-Blob operator contract | Production deploy; security.txt HTTP/content/expiry/cache proof; recheck docs after provider mutations |

## Release blockers

1. PR #35 is unreviewed and the current GitHub plan cannot enforce the required
   branch/environment controls for this private repository.
2. No remediation revision is merged or production-deployed.
3. Railway apply, production DB roles/migrations, DNS, and orphan deletion need
   explicit approval and/or provider-owner coordination.
4. Private Blob, isolated preview, Resend webhook/inbox, Stripe test lifecycle,
   backup/restore, complete alert ownership/acknowledgement, and rollback proof
   are absent.
5. Legal/counsel and real clinical/content approvals remain external gates; any
   affected surface must stay disabled until its actual owner clears it.

## Decision

`NO-GO / IN PROGRESS`
