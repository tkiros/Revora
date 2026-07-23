# Revora service-integrations GO closeout — session 1 handoff (review, remediation, provider activation)

> **Prepared:** 2026-07-23 EDT
>
> **Decision state at handoff:** `NO-GO / IN PROGRESS` — all pre-merge gates
> green; merge, deploy, and live-proof phases are next
>
> **Workspace:** `/home/tefera/Desktop/Revora`
>
> **Governing program:** `docs/handoff/2026-07-23-revora-service-integrations-go-closeout-master-prompt.md`
> (read it first — its scope boundary, standing authority, safety limits, and
> definition of GO all remain in force; counsel/clinical clearance stays out of
> scope for this technical decision)

---

## 1. Exact references at handoff

| Ref | Value |
|---|---|
| Branch | `docs/b1-b2-final-closeout` |
| Head at handoff | `0083350e1a073809594c2b607afb90d2a43086aa` (this handoff's own commit will supersede it — re-verify CI on the actual merge head) |
| Base | `origin/main` = `fc8e9fa164bf942ec7b50d14776c7fefa252d3bf` |
| Pull request | https://github.com/tkiros/Revora/pull/35 — OPEN, MERGEABLE, no formal approval possible (author-owned PR, free plan) |
| Green CI on exact head | run `30014935000` — all 4 jobs SUCCESS + both Vercel preview checks |
| Review record | PR #35 comment: https://github.com/tkiros/Revora/pull/35#issuecomment-5059257981 |
| Production (stale) | Vercel `revora` project still serves old SHA `fc8e9fa` — `/api/health/live` 404, `security.txt` 404, legacy `/api/health` falsely green with stale `nudge`/`trialPrecharge` heartbeats |
| Vercel project | `prj_rF6Fef4OQpldRQgKhrw9aNn5WaQC`, team `team_IlBixvuQMskF7lpmeGAhRlbs` |
| Railway project | `revora` (`1b972333-7b60-4b0f-8729-c608f1b8ee17`), env `production` |

## 2. Pre-merge gate results (all on the final code tree)

| Gate | Result |
|---|---|
| build / typecheck / lint (cold, zero warnings) / safety contract / drizzle check | all green |
| Full vitest | **1987 passed / 2 skipped / 0 failed** (178 files) |
| npm audit | **0 vulnerabilities** (GitHub's repo banner reflects old `main`; clears at merge) |
| Full Playwright (local, run 1 on `a485081`) | 225 passed / 12 provider-gated skips / 0 failed |
| Full Playwright (local, final tree) | 224 passed / 12 skips / **1 failed**: `launch-controls.spec.ts:72` Mobile Safari only — 90s timeout while the same case passed Mobile Chrome + Desktop Chrome in the same run; targeted re-run on the idle machine: **9/9 green across all three projects (8.8s)**; CI's full Playwright job on the same tree: green. Verdict: the config-documented WebKit-under-parallel-load workstation stall, not a regression. Recorded honestly, not retried away. |
| Secret scan (full PR range, real head) | green |
| `git diff --check origin/main...HEAD` (excluding user's dirty `docs/retention_flow.md`) | clean |

## 3. Independent adversarial review — done

Four parallel reviewers falsified every remediation claim across the full
`origin/main...HEAD` range (retry state machine incl. migration 0017; CI/deps/
Sentry; e2e isolation/auth/Blob/health; Stripe/Resend/DB-governance/model
routing). All 11 I-23 review axes verified with file:line evidence. 8 defects
found — **all fixed on this branch with regression tests that fail on the old
behavior**:

| Commit | Defect fixed |
|---|---|
| `99ebec8` | Stripe webhook verified signatures under an **empty secret** (fail-open, forgeable entitlements) → 503 fail-closed + new `billing_webhook_unconfigured` readiness gate |
| `424df0a` | governance checker `runtimeDmlReady` used Postgres OR-semantics → per-privilege AND probes (re-proven all-true against the live DB) |
| `5795db5` | nudge heartbeat/route treated `pending`/`exhausted` as failure → chronic false `cron_nudge_stale` 503; also lease-blind attempt clears in profile-PATCH / push-subscribe could double-send |
| `609216f` | signin page showed "check your email" even when the magic-link send failed |
| `385fe5c` | account-deletion retry wedged on Stripe double-cancel after a partial failure |
| `5650bab` | Sentry scrubber didn't cover `threads` frame vars |
| `c734fb3` | secret-scan shell could silently scan nothing on merge-base failure |
| `2243da6` | provider-gated Pantry e2e cases were unrunnable (harness hard-blanked the creds) → explicit `E2E_PANTRY_LIVE=1` opt-in |
| `c004b08` / `660c51a` | test coverage: `VERCEL_ENV=production` base-URL rejection; health payload `billingWebhook` field |

Accepted-as-is with rationale (documented in the PR comment): blob deletion
inside the refund reducer tx (safe-retry failure mode, pantry-refund-bounded);
`--first-parent` scan scope (linear branch); gitleaks binary-on-PATH
(empirically green).

## 4. Provider/infra work completed this session (with proofs)

- **I-01 model routing (config resolved):** production `OPENAI_BASE_URL`,
  `REVORA_MODEL`, `REVORA_VISION_MODEL` removed; `OPENAI_API_KEY` replaced with
  a **live-verified** direct OpenAI project key (200 on `gpt-5.4-mini`). Source
  defaults are the audited `gpt-5.4-mini`. Takes effect at the merge deploy.
- **I-03 private Blob (provisioned + provider-proven):** private store
  `revora-pantry-private` (`store_xg5sMWEFxtWqzdIE`, iad1) created and
  connected as `PANTRY_BLOB_READ_WRITE_TOKEN` (prod/preview/dev). Privacy
  drill: anonymous direct-URL and downloadUrl → **403**; authorized head OK;
  delete verified; drill object cleaned up. Legacy public store untouched.
- **I-11 Upstash (drilled):** with a configured-but-unreachable store, the
  email doors (`/api/auth/signin`) fail **closed** 503 + `Retry-After: 60`
  while `signout` fails open (302); with the real store the same door passes.
  Synthetic TEST-NET IPs only. (Free plan = 1 DB, so preview runs with Upstash
  unbound → fail-closed by design; owner action H31 for a dedicated preview DB.)
- **I-14 durability (proven):** `pg_dump` backup of the main DB (47,956 B,
  sha256 `814eeac0…`, 33.8 s) → isolated restore into a fresh local Postgres 18
  (1.1 s, **zero errors**, 20 tables / 16 migrations / row-for-row match).
  Server is Postgres 18.4; use the `postgres:18` image for any client work.
- **I-15 governance (proven live):** `revora_app` restricted role created with
  the runbook grant block; live DML insert/update/delete proven (and cleaned);
  `CREATE TABLE` → permission denied, `DROP` → must-be-owner; migrations
  **0016–0017 applied via the owner path** (journal now 18/18); governance
  check **all-true** (with the fixed AND-probe); journal hashes **18/18 match
  source**; restricted `DATABASE_URL` bound to Vercel production (superuser URL
  removed from runtime).
- **I-16 preview isolation (bound):** dedicated preview DB = repurposed
  `Postgres-FOMu` (migrated 18/18, host `hayabusa.proxy.rlwy.net:47605`);
  Stripe **test-mode** key + fresh price mirror (lookup keys
  `revora_test_monthly_999/1299/1999`, `revora_test_annual_9999`,
  `revora_test_pantry_49`); fresh preview-only `AUTH_SECRET`,
  `HEALTH_DATA_KEY`, `CRON_SECRET`, VAPID pair; `OPENAI_API_KEY`,
  `RESEND_API_KEY`, `ADMIN_EMAIL=terrykiros@gmail.com`,
  `AUTH_EMAIL_FROM=Revora <signin@contact.revora.plus>`,
  `TRIAL_PRICE_VARIANT=1299`; `RESEND_WEBHOOK_SECRET` + `STRIPE_WEBHOOK_SECRET`
  (preview-specific webhooks below). Applies to the **next** preview deploy.
- **I-19/I-04 Resend webhooks (created, secrets bound):**
  - production: `e0a79b06-d60b-4636-b812-ea60f16ede6b` →
    `https://revora.plus/api/webhooks/resend`, all 7 runbook events; secret
    bound to Vercel production.
  - preview: `f2570dde-0615-4a9d-b29a-7aa995360a75` → branch alias
    `revora-git-docs-b1-b2-final-closeout-tkiros-projects.vercel.app` with the
    protection-bypass query param; secret bound to Vercel preview.
- **I-06 Stripe test endpoint (created):** `we_1TwN5WKweWSWjefkp6gDnIr2`
  (**livemode:false**, 5 events per H21) → preview branch alias
  `/api/billing/stripe/webhook` with bypass; secret bound to preview.
  ⚠ The Stripe **MCP connector is LIVE-mode** on the shared "Vendoval" account
  — never use it for test activity. The **Stripe CLI has an `sk_test` key**
  (`[default]` profile, expires 2026-10-20) — that is the test-mode path.
- **I-02 Railway (verified, deliberately deferred):** fresh
  `railway config plan` = exactly `0 add / 4 change / 0 destroy` (the approved
  shape). **Do not apply before merge**: `railway.ts` builds `hourly-crons`
  from GitHub `main` with `Dockerfile.cron`, which exists **only on the
  branch** — applying pre-merge builds a branch-less Dockerfile and fails. The
  runner (`scripts/run-hourly-crons.mjs`) was reviewed: strict per-route
  success, bounded body, redirect/non-JSON/negative-ack rejection, no secrets
  in logs; cron schedule `0 * * * *`, one-shot, restartPolicy NEVER.
- **I-22 orphans (re-verified):** `Postgres-FOMu` **retained** (repurposed as
  the isolated preview DB — record this as its owner/rationale);
  `Postgres-D2oG` re-verified 0 tables / 0 rows — delete in the cleanup phase.
  Duplicate Vercel project `revora-irj3` (`prj_Btytd2WV0eW3y4tfudg9dHzFbvDh`)
  verified: no aliases, no custom domains beyond its default, preview-only
  deploys — delete in cleanup.
- **Vercel protection bypass for automation:** generated (32-char secret) so
  provider webhooks can reach protected previews; **rotate/revoke during final
  cleanup**.
- **Evidence artifacts updated and committed:**
  `fix/260722-2149-service-integrations/current-status.md` (rewritten) and
  `fix-results.tsv` (rows 30–43 appended). Owner-only actions **H26–H32**
  appended to `docs/handoff/human-actions-required.md`.

## 5. Session-local materials (scratchpad — /tmp, lost on reboot; NO secrets in this doc)

Scratchpad dir:
`/tmp/claude-1000/-home-tefera-Desktop-Revora/bde3714a-998d-44aa-8636-fee2e346054b/scratchpad/`

| File | Content | If lost, re-derive by |
|---|---|---|
| `revora-main-backup-20260723T090022.dump` | prod DB backup (sha256 `814eeac0c2d371acee2423e8184dcfe2a8f8e40edcfff50512dc06e728b5a476`) | take a fresh `pg_dump` via `docker run --rm --network host postgres:18 pg_dump "$OWNER_URL" -Fc` |
| `revora_app.pw`, `runtime-db-url.txt` | restricted-role password / runtime URL | as owner: `ALTER ROLE revora_app PASSWORD '…'`, then update the Vercel production `DATABASE_URL` |
| `railway-pg*.json` | Railway service variable dumps (owner URLs) | `railway variables --service <name> --json` |
| `resend-webhook-{prod,preview}.json`, `stripe-webhook-preview.json` | webhook ids + signing secrets | secrets already bound in Vercel; re-read via provider APIs (Resend `GET /webhooks/{id}`) or recreate endpoints |
| `test-prices.json` | test-mode price ids | `GET /v1/prices?lookup_keys[]=…` with the sk_test key |
| `vercel-bypass.txt` | protection-bypass secret | regenerate: `PATCH /v1/projects/{id}/protection-bypass` |
| `preview-secrets.json`, `upstash-real.env`, `prod.env`, `dev.env` | generated preview secrets / probes | regenerate + rebind if needed |
| `gate/*.log` | all gate logs (both Playwright full runs, vitest, local gates) | re-run gates |

Local e2e DB container `revora-e2e-pg` (postgres:16, port 5432, migrated) is
running; the Stripe lifecycle script `docker rm -f`s a container of the same
name — recreate + `drizzle-kit migrate` afterward if more Playwright runs are
needed.

## 6. EXACT remaining program to GO (in order)

### Phase A — merge and production deploy
1. `git status --short` — confirm only the user's pre-existing dirty files
   remain (preserve them; never broad-stage).
2. Confirm CI green on the **actual** PR head (this handoff's commit):
   `gh pr view 35 --json headRefOid,statusCheckRollup`.
3. Merge with a merge commit: `gh pr merge 35 --merge`. Record the merged SHA
   (`git rev-parse origin/main` after fetch).
4. Watch the `main` CI run (`gh run list --branch main`) — must be green on the
   merged SHA (this is the protected-CI-on-merged-revision evidence).
5. Vercel auto-deploys main → production. Watch
   `vercel ls revora --prod` until READY; verify
   `meta.githubCommitSha == merged SHA` via
   `GET /v6/deployments?projectId=…&target=production`.
6. Alias→SHA proof: resolve `revora.plus` deployment id and its SHA; capture.
7. Production HTTP proofs: `/api/health/live` → 200 `{ok:true}` no-store;
   `/.well-known/security.txt` → 200 text/plain, canonical URL, future expiry;
   `/api/health` → expect 503 with exactly
   `["cron_nudge_stale","cron_trialPrecharge_stale",…]`-class issues until the
   Railway scheduler runs, plus all config fields
   (`upstash/emailDelivery/billingWebhook: "configured"`, `db: "ok"`) — that
   degraded-until-scheduler state is CORRECT and is itself readiness-degradation
   evidence. After the first strict hourly run, expect 200 healthy.

### Phase B — Railway scheduler activation (starts a ~4h observation window)
1. `railway config plan` — must still be exactly `0 add / 4 change / 0 destroy`
   with the same four changes (APP_URL literal `https://revora.plus`, GitHub
   source `tkiros/Revora`, `Dockerfile.cron`, start
   `node scripts/run-hourly-crons.mjs`). Any drift → stop and re-derive.
2. `railway config apply` (standing approval covers exactly this shape).
3. Observe ≥4 consecutive top-of-hour executions (`railway logs` /
   deployments): every run must log 4× `result=ok` + `completed=4 failed=0`.
4. Correlate downstream: `/api/health` crons all `ok`; `cron_heartbeat` rows
   advance hourly (read-only query via runtime role).
5. Red-path proof: trigger one manual run with a deliberately wrong
   `CRON_SECRET` override on a service duplicate — or simpler, verify a failed
   route reddens the run by observing exit-code behavior in a local invocation
   (`APP_URL=https://revora.plus CRON_SECRET=wrong node scripts/run-hourly-crons.mjs`
   → exit 1, `http_error 401` per route). Confirm Railway marks a nonzero-exit
   cron run failed and an alert/notification surfaces (screenshot/receipt).

### Phase C — production journeys (safe synthetic only)
1. **Model (I-01):** three varied non-sensitive structured calls through the
   repo's own client path with production routing (base URL unset, default
   model, the bound key): use `npm run eval:revora`-style harness or a small
   node script importing `lib/revora/openai-client`. Also verify
   `/api/health` no longer reports `model_configuration`.
2. **Auth email (I-04):** request a magic link on production for a synthetic
   address you can receive (owner-approved; `delivered@resend.dev` yields
   provider `delivered` events without an inbox). Prove: Resend accepted →
   webhook events land (delivery rows advance `sent→delivered` — check
   `email_delivery_attempts` via runtime role, HMAC-only), replay of a used
   link rejected, expiry enforced. Bounce path: send to `bounced@resend.dev`
   → `bounced` + suppression row → next send blocked pre-provider.
   Real-inbox + forwarded-inbox proof needs the owner's mailbox (owner-assisted).
3. **Sentry (I-10/I-17):** browser canary — open `https://revora.plus` with the
   browse skill, evaluate `setTimeout(()=>{throw new Error("REVORA_PROD_CANARY_<ts>")})`;
   verify in Sentry: exactly one event, release == merged SHA, environment
   production, scrubbed (no request/breadcrumbs/IP/geo — user.ip `0.0.0.0`).
   Server canary: emit via `captureServerError` with the production `SENTRY_DSN`
   (extractable from the deployed page bundle for the public DSN) + release env
   set — note origin honestly. Alert-email acknowledgement is owner-assisted
   (no Sentry API token on this machine).
4. **Umami:** browse a production page, confirm `script.js` + `/api/send` 200
   through CSP. Dashboard receipt needs `UMAMI_API_KEY` (owner action H32).

### Phase D — preview journeys (fresh preview carries the full isolated env)
1. Push any commit (or `vercel redeploy` the branch) so a NEW preview binds the
   webhook secrets added late. Get its URL + use the bypass secret.
2. Stripe checkout journey through the preview UI with `4242…` (test mode):
   checkout → signed webhook (endpoint `we_1TwN5WKweWSWjefkp6gDnIr2`) → inbox
   row → entitlement → portal → cancel → reconcile. Then the **controlled local
   lifecycle**: `STRIPE_SECRET_KEY=<sk_test from stripe CLI config> node
   scripts/e2e-stripe-lifecycle.mjs` (it self-hosts :3100 + its own DB
   container; run after any Playwright work; it refuses non-test keys).
   Injected cancellation-failure + confirmed-cancel paths are covered by unit
   tests + the new `defaultCancelStripe` semantics; prove the live test-mode
   cancel + missed-webhook reconcile in the lifecycle run. Clean up synthetic
   customers/objects afterward.
3. **Pantry live cases (closes the 12 skips):**
   `E2E_PANTRY_LIVE=1 PANTRY_BLOB_READ_WRITE_TOKEN=<from vercel env pull dev>
   OPENAI_API_KEY=<local> DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/revora_e2e
   npm run e2e -- tests/smoke/pantry.spec.ts tests/smoke/a11y.spec.ts`
   (recreate the e2e DB container first if the lifecycle destroyed it).
4. **Push/nudge (I-12/I-23 live):** on the fresh preview, subscribe a real
   browser push (browse skill grants permission), seed an eligible synthetic
   user in the preview DB, let the flow send via preview VAPID keys; prove ok →
   heartbeat + `lastNudgeDate`; prove a forced provider error consumes an
   attempt and the next tick retries; prove `gone` prunes. (Scheduler-driven
   production correlation comes from Phase B's hourly runs.)

### Phase E — rollback drill + cleanup + re-inventory
1. Rollback drill: `vercel rollback <previous-prod-deployment-url>` → verify
   alias serves old SHA → `vercel promote <merged-SHA-deployment>` back →
   verify again. Record durations.
2. Delete `Postgres-D2oG` (re-check the master prompt's preconditions first:
   still 0 tables/rows, no references) — `railway` dashboard/CLI; keep receipt.
   Record `Postgres-FOMu` as RETAINED (preview DB, owner: engineering).
3. Delete duplicate Vercel project `revora-irj3` (verify again: no aliases/
   custom domains) — removes its duplicate PR checks.
4. Rotate the protection-bypass secret (or remove it) after webhook endpoints
   are repointed/retired; update the two preview webhook URLs accordingly or
   delete the preview webhooks if no longer needed.
5. Re-inventory Railway/Vercel/Stripe/Resend/DNS; update
   `docs/runbooks/*` if topology changed; final `git diff --check` scoped.

### Phase F — final artifacts and decision
1. Update `fix/260722-2149-service-integrations/*` with final statuses (use
   only the master prompt's allowed status vocabulary).
2. Write the final closeout report in `docs/handoff/` (timestamped, exact
   merged SHA + deployment ids + all correlation ids, no secrets/PII), commit.
   Note: a post-merge docs commit re-deploys production with a docs-only
   delta — record both SHAs and the delta explicitly in the report.
3. Emit the final decision **only if** every technical definition-of-GO item
   in the master prompt is proven. Items that CANNOT reach GO without owner
   action (below) must be reported as the exact blockers instead.

## 7. Owner-only blockers (cannot be closed by any agent session)

| # | Item | Why blocked | Unblocks |
|---|---|---|---|
| H26 | Return-Path MX `send.contact` → `feedback-smtp.us-east-1.amazonses.com` prio 10 | DNS is Namecheap BasicDNS; no API credential on this machine; authoritative NS currently serve **no** MX (Resend's "verified" is a stale one-time check) | I-20, full I-04 deliverability proof |
| H27–H29 | DMARC quarantine→reject, apex CAA, DNSSEC | same Namecheap access | I-20 |
| H30 | **GitHub Pro** on `tkiros` | free-plan private repo: branch protection / rulesets / code+secret scanning APIs all 403 — required-review/checks enforcement and forbidden-merge proof are impossible until then | I-05, I-21 — **this alone prevents printing GO** under the master prompt's definition |
| H31 | Upstash payment method | free plan = 1 database; preview Redis isolation impossible | preview Upstash isolation (currently INTENTIONAL_OFF_SAFE, fail-closed) |
| H32 | Umami Cloud API key | dashboard receipt/blackout-alert proof not automatable without it | I-17 Umami closure |
| — | Sentry alert-email acknowledgement; real-inbox + forwarded-inbox magic-link receipt | needs the owner's mailbox / Sentry login | I-04, I-10, I-17 acknowledgement legs |

## 8. Safety rails that bit this session (don't repeat)

- Vercel **sensitive** env values are write-only — never plan around reading
  them back; classify before you overwrite.
- The Stripe **MCP is live-mode** (returned real customer PII once — do not use
  it; nothing was persisted). Test mode = the CLI's `sk_test` profile only.
- `kill $(cat pid)` on an `npx next start` wrapper does NOT kill the server —
  use `fuser -k <port>/tcp` and verify with `ss -ltn`; a stale server on the
  port silently serves your "new" drill (this produced two false negatives in
  the Upstash drill before being caught).
- CI's Playwright needs `npx drizzle-kit migrate` against the loopback DB
  first (my first local run failed 7 tests for skipping it).
- `npm run e2e` blanks provider creds by design; the Pantry-live cases need
  the exact `E2E_PANTRY_LIVE=1` opt-in (value must be exactly "1").
- Railway apply MUST follow the merge (Dockerfile.cron only exists on-branch;
  railway.ts builds from `main`).
- Production readiness will be legitimately 503 (`cron_*_stale/never`) between
  the merge deploy and the first strict Railway run — expected, not a defect.
