# Revora service-integrations GO closeout — final report

> **Prepared:** 2026-07-23 EDT (session 2 of the GO-closeout program)
>
> **Governing program:** `docs/handoff/2026-07-23-revora-service-integrations-go-closeout-master-prompt.md`
>
> **Scope note:** this is the technical service-integrations release decision.
> Counsel and clinical/content clearance are out of scope by definition and are
> not gates, blockers, or inputs here.

## 1. Exact release identity

| Item | Value |
|---|---|
| Reviewed branch merge (PR #35) | `795d1a374f0acb052c2bed01e1d74781527472e8` — merge on green run 30014935000 (head `b5c03f4`) + green main run 30020772770 |
| Post-merge harness fixes (PR #43) | `7409afd8ba6ef9d15dfe741581de6ba871a2eb56` — merged on fully green exact-head CI |
| CSP production fix (PR #44) | `210d8898432e974b3a40cda2a4a5a1226cb77730` — merged on fully green exact-head CI; green main run 30032553040 |
| Final production deployment | `dpl_4bdyJHK7z8mFXJnKDePkd2bgLUwv` (`revora-azxyo5pme…`), `meta.githubCommitSha = 210d8898…` |
| Alias→SHA proof | `vercel inspect https://revora.plus` → `dpl_4bdyJHK7z8mFXJnKDePkd2bgLUwv`; CSP fingerprint (`connect-src` contains `https://vercel.com`) additionally distinguishes the final SHA from every predecessor |
| Preview | branch alias `revora-git-docs-b1-b2-final-closeout…` redeployed twice this session; final state `db: ok`, isolated stack bound |
| Production HTTP posture | `/api/health/live` 200 `{ok:true}` no-store; `/api/health` 200 healthy (all five crons `ok`); `/.well-known/security.txt` 200 `text/plain`, canonical URL, expiry 2027-01-19 |

A closeout docs commit (this report + evidence artifacts) merges after this
file is written; it is a docs-only delta on top of `210d8898` and re-deploys
production. Both SHAs are recorded in the PR that lands this file.

## 2. What happened this session (chronological)

1. **Merge + deploy (Phase A).** CI re-verified green on the exact PR #35 head,
   merged with a merge commit, main CI green on the merged SHA, Vercel
   production deployed it.
2. **Production DB regression found and fixed.** First deploy on the restricted
   `revora_app` runtime credential reported `database_unavailable`: the bound
   URL lacked `sslmode=no-verify`, so node-pg required verified TLS against
   Railway's self-signed proxy cert (readiness detected a real outage —
   correct behavior). Rebound prod + preview `DATABASE_URL`; `db: ok`.
3. **Railway strict scheduler (Phase B).** Fresh plan matched the approved
   `0 add / 4 change / 0 destroy` exactly; applied under standing approval.
   The config apply does not build — the GitHub-source auto-build never
   triggered (needs owner-side repo connection), so the identical tree was
   deployed with `railway up` (same `Dockerfile.cron`, byte-identical runner).
   Observed strict runs at 13:00 / 14:00 / 15:00 / 16:00 EDT: every run
   `completed=4 failed=0`, all four routes `result=ok`; `cron_heartbeat` rows
   advance hourly; production readiness flipped degraded→healthy after the
   first run. Red path: wrong `CRON_SECRET` → per-route `http_error 401`,
   `completed=4 failed=4`, exit 1 (a bad run cannot stay green; Railway marks
   nonzero-exit cron runs failed — dashboard alert receipt is owner-assisted).
4. **Production journeys (Phase C).**
   - Model routing: three varied structured calls through
     `lib/revora/openai-client` + `checkFood` with production routing (no base
     URL, default `gpt-5.4-mini`, direct OpenAI): SAFE / MODERATE / SAFE, all
     strict-schema validated. Run used the local key because the bound
     production key is write-only (live-verified in session 1); production
     health reports no `model_configuration` issue on the exact SHA.
   - Auth email: `delivered@resend.dev` magic link → Resend accept → signed
     production webhook → `email_delivery_attempts` row `auth_magic_link |
     delivered` with provider message id. `bounced@resend.dev` → `bounced` row
     + suppression row; repeat send → `suppressed` row recorded pre-provider
     and the signin flow surfaced an error instead of "check your email".
     Replay/expiry and real-inbox/forwarded-inbox legs are owner-assisted.
   - Sentry: browser canary `REVORA_PROD_CANARY_20260723T114550` accepted by
     the ingest endpoint (HTTP 200) from the production page, client options
     verified in-page: release = merged SHA, environment = production.
     Server-side canary, dashboard receipt, and alert acknowledgement are
     owner-assisted (both DSNs are write-only sensitive values; no Sentry API
     token on this machine).
   - Umami: `script.js` 200 and `/api/send` fired through the production CSP
     with zero violations; dashboard receipt needs `UMAMI_API_KEY` (H32).
5. **Stripe controlled lifecycle (Phase D2).** `scripts/e2e-stripe-lifecycle.mjs`
   (test-mode key, self-hosted server + own DB container): **ALL STEPS
   PASSED** — checkout with 4242 → signed webhook (a 500-then-200 delivery
   retry was observed and absorbed) → `trialing` row → magic-link DB session →
   premium entitlement → pre-charge email with amount/date/cancel link +
   idempotent stamp → two-step cancel (GET 303 to confirm page, POST cancels;
   `cancel_at_period_end=true` on Stripe) → row stays entitled until period
   end → portal session → subscription deletion lapses entitlement to free.
   Harness fixes required (PR #43): liveness-probe wait, confirm-POST step,
   reload-on-stall, and blanking ambient Upstash (a store blip fails the email
   cooldown closed → 429).
6. **Pantry live cases (Phase D3) — production bug found.** Running the 12
   formerly provider-gated cases surfaced a real defect: the CSP `connect-src`
   did not allow `https://vercel.com`, which is where `@vercel/blob/client`
   private-store uploads exchange tokens and upload — **every paid Pantry
   photo upload failed under the shipped policy**. Fixed in PR #44 with a
   regression test that fails on the old policy; also fixed two live-spec
   harness truths (session-cookie host is `localhost` under `next start`;
   heading-role selector). Final: 35/36 green in the full run; the single
   failure (Mobile Chrome, upload step) was a workstation interface flap and
   re-verified green in isolation (2 passed, 27 s). CSP fix verified live on
   production headers after deploy.
7. **Push/nudge live chain (Phase D4).** On the isolated preview with a real
   Chrome (CDP-attached; Playwright-launched browsers cannot reach the push
   service): real FCM subscription registered through `/api/push/subscribe`
   (200) for a synthetic seeded user → preview nudge cron `sent:1` → the
   notification rendered in the browser ("A quick check before your next meal
   keeps the day easy."). Forced provider error (endpoint pointed at a
   405-returning URL): run reports `ok:false failed:1`, attempt consumed,
   `nudge_retry_after` armed, **no false success**. Simulated next hourly tick
   (retry hold cleared, endpoint restored from the live browser subscription):
   `sent:1`, durable `last_nudge_date` stamped, attempt state cleared. Real
   browser unsubscribe (endpoint revoked at FCM) → next run `pruned:1`, row
   deleted. Synthetic user cascade-deleted afterwards.
8. **Rollback drill (Phase E).** `vercel rollback` to the previous production
   deployment (`dpl_HBXmrKif…` = `7409afd`) — alias verified serving the old
   SHA by CSP fingerprint, liveness 200, ~16 s. `vercel promote` back to
   `dpl_4bdyJHK…` (~20 s), healthy after. (Free plan limits rollback targets
   to the immediately previous production deployment.)
9. **Cleanup + re-inventory (Phase E).**
   - `Postgres-D2oG` deleted after a same-minute re-check (0 tables); its
     detached volume `postgres-volume-yrjb` deleted. Railway now holds exactly:
     `Postgres` (production DB), `Postgres-FOMu` (retained: dedicated preview
     DB, owner engineering), `hourly-crons`.
   - Duplicate Vercel project `revora-irj3` deleted (re-verified no aliases or
     custom domains); `vercel project ls` now shows only `revora`.
   - Protection-bypass secret rotated; preview Resend webhook `f2570dde…` and
     Stripe test endpoint `we_1TwN5WKweWSWjefkp6gDnIr2` repointed to the new
     secret (Resend PATCH 200; Stripe endpoint enabled, `livemode:false`).
     The old secret had appeared in a local error log, making rotation
     mandatory; the new value exists only in Vercel and session-local scratch.
   - All synthetic Stripe test-mode customers deleted; no active throwaway
     products remain; Sentry canary was synthetic-only; local e2e containers
     and the temporary Chrome profile removed.

## 3. Gates and counts (exact final tree lineage)

- PR #35 head `b5c03f4`: build / typecheck / cold zero-warning lint / safety
  contract / drizzle check green; vitest 1987 passed / 2 skipped / 0 failed
  (178 files); full local Playwright 225 passed / 12 provider-gated skips with
  the single WebKit-under-load workstation stall re-verified 9/9 green; CI
  Playwright green; secret scan green over the full PR range; npm audit 0
  vulnerabilities.
- PR #43 and PR #44 heads: full CI (typecheck·lint·contract·build, unit·evals,
  playwright incl. axe, secret scan, both Vercel checks) green before merge.
- The 12 provider-gated Playwright cases now run live and pass (35/36 + 1
  isolated re-verification), closing the standing skip debt.
- No test was weakened; every defect fix landed with a regression test that
  fails on the old behavior (CSP test verified failing pre-fix).

## 4. Final ledger (deltas from session-1 statuses; allowed vocabulary)

| ID | Final status |
|---|---|
| I-01 model routing | `VERIFIED_PRODUCTION` (config on exact SHA + health) / `VERIFIED_WORKSTATION` (three live structured calls via repo path; bound-key call impossible from workstation — key is write-only, live-verified at bind time) |
| I-02 Railway hourly jobs | `VERIFIED_PRODUCTION` + `VERIFIED_RECOVERY` (4 consecutive strict runs, heartbeats, readiness recovery, red-path exit-1 proof; platform alert-email ack owner-assisted) |
| I-03 Pantry Blob privacy | `VERIFIED_PROVIDER` + `VERIFIED_LOCAL` (private store; live browser upload→judge→report; **CSP defect found and fixed in production**; store rejects public access by policy) |
| I-04 auth email | `VERIFIED_PRODUCTION` (delivered/bounced/suppressed chain with provider receipts) / `BLOCKED_EXTERNAL` (H26 Return-Path MX; real-inbox + replay/expiry legs owner-assisted) |
| I-05 CI/CD + review | `VERIFIED_CI` (all merges on green exact-head runs; independent adversarial review recorded on PR #35) / `BLOCKED_EXTERNAL` (H30: platform enforcement impossible on free plan) |
| I-06 Stripe end to end | `VERIFIED_PROVIDER` (E2E-06 all steps incl. duplicate/retry webhook delivery, reconcile-by-read, cleanup) |
| I-07 account deletion billing | `VERIFIED_LOCAL` (branch fix + regression tests; confirmed-cancel path in E2E-06) |
| I-08 Pantry paid email | `VERIFIED_LOCAL` (durable attempt rows + stub-transport recovery tests; live report email observed in D3 mailbox) |
| I-09 Blob deletion pointers | `VERIFIED_LOCAL` (deletion + pointer retention paths under live store token in D3; injected-failure semantics unit-tested) |
| I-10 browser Sentry privacy | `VERIFIED_PRODUCTION` (transport + release binding on exact SHA; scrub verified in source/tests + session-1 preview event) / owner-assisted dashboard+ack |
| I-11 Upstash timeout | `VERIFIED_LOCAL` + `VERIFIED_RECOVERY` (session-1 outage drill; fail-closed re-observed live this session via the harness 429) |
| I-12 push/scheduler | `VERIFIED_PREVIEW` + `VERIFIED_RECOVERY` (live FCM chain incl. receipt, bounded retry, prune; production correlation via hourly nudge route `result=ok` + heartbeats) |
| I-13 health/monitoring | `VERIFIED_PRODUCTION` (real degradation observed for DB outage and stale crons; recovery to healthy after scheduler activation; liveness process-only) |
| I-14 DB durability | `VERIFIED_PROVIDER` (session-1 backup/restore drill, checksums, RPO/RTO) |
| I-15 DB governance | `VERIFIED_PRODUCTION` (restricted role now live in production runtime and proven by traffic; governance checks all-true; journal 18/18) |
| I-16 preview isolation | `VERIFIED_PREVIEW` (isolated DB/Stripe-test/Resend/Blob/VAPID/secrets exercised by live journeys this session) / Upstash leg `INTENTIONAL_OFF_SAFE` (H31) |
| I-17 observability | `VERIFIED_PRODUCTION` (Sentry ingest + Umami transport on exact SHA) / `BLOCKED_EXTERNAL` (dashboard receipts, blackout alert, acks: H32 + owner mailbox) |
| I-18 Stripe retention | `VERIFIED_PROVIDER` (migration applied via owner path; replay/reconcile in E2E-06 without raw PII) |
| I-19 Resend state/suppressions | `VERIFIED_PRODUCTION` (signed webhook ordering delivered→bounced→suppressed proven live; suppression enforced pre-provider) |
| I-20 DNS/email security | `BLOCKED_EXTERNAL` (H26–H29; MX still absent, DMARC still `p=none` on authoritative NS — re-verified today) |
| I-21 GitHub controls | `BLOCKED_EXTERNAL` (H30) |
| I-22 orphan resources | `VERIFIED_PROVIDER` (D2oG + volume deleted with receipts; `revora-irj3` deleted; FOMu retained with owner+rationale; re-inventory clean) |
| I-23 transient push retry | `VERIFIED_PREVIEW` + `VERIFIED_RECOVERY` (live failure→bounded-retry→success→prune chain; local/CI semantics from session-1 review) |
| I-24 local credential modes | `VERIFIED_WORKSTATION` (unchanged; bypass secret rotated after local log exposure) |
| I-25 hardening/docs | `VERIFIED_PRODUCTION` (canonical security.txt live; zero-warning lint; runbooks/status artifacts updated this session) |

New defects discovered this session (all fixed + regression-tested, statuses
`fixed` in `fix-results.tsv` rows 44–55): DATABASE_URL TLS binding, CSP
private-upload block, lifecycle-harness drift (4 items), live-spec host truth.

## 5. Owner-only blockers standing between this state and `GO`

| # | Item | Impact |
|---|---|---|
| H30 | GitHub Pro (or public repo — forbidden) | Required-review/checks enforcement and forbidden-merge/promotion proof are platform-impossible; I-05/I-21 cannot reach the master prompt's definition of GO |
| H26 | Return-Path MX on Namecheap | I-20/I-04 deliverability legs |
| H27–H29 | DMARC ≥ quarantine, CAA, DNSSEC | I-20 |
| H31 | Upstash paid plan | preview rate-limit isolation (currently fail-closed by design) |
| H32 | Umami API key | dashboard receipt + blackout-alert proof |
| — | Owner mailbox/Sentry login | inbox magic-link receipt, Sentry event/alert acknowledgement |

## 6. Durable evidence artifacts

- `fix/260722-2149-service-integrations/current-status.md` (rewritten this session)
- `fix/260722-2149-service-integrations/fix-results.tsv` (rows 44–55 appended)
- `docs/handoff/2026-07-23-revora-service-integrations-go-closeout-session1-handoff.md` (prior session)
- This report.
- Session-local (non-durable, `/tmp` scratchpads): gate logs, lifecycle logs
  (`stripe-lifecycle*.log`), pantry live logs (`pantry-live*.log`), nudge
  journey logs, prod/preview env name inventories. No secrets in durable files.

## 7. Decision

Every technical definition-of-GO item that can be proven from this machine is
proven and recorded above. The remaining unmet items are exactly the
owner-only blockers in §5 — chiefly H30, which makes platform-enforced
review/merge protection (an explicit definition-of-GO bullet) impossible on
the current GitHub plan, and H26 (provider-required Return-Path MX), which
leaves the full auth-email deliverability leg unprovable.

Because those definition-of-GO items are not actually proven, this report does
not print `GO`.

```text
REVORA TECHNICAL SERVICE-INTEGRATIONS RELEASE DECISION: NO-GO
```

**Sole remaining path to GO (no agent-side work remains):**
1. H30 — owner purchases GitHub Pro (~minutes): agent can then configure
   branch protection/rulesets/scanning and demonstrate the forbidden-merge
   proof, closing I-05/I-21.
2. H26–H29 — owner adds the Return-Path MX (+ staged DMARC/CAA/DNSSEC) at
   Namecheap: agent can then complete propagation + deliverability proofs,
   closing I-20 and the remaining I-04 legs.
3. Owner-assisted acknowledgements (Sentry ack, inbox receipts, H31/H32 if
   full closure of the optional legs is desired).
