# Revora service-integrations remediation — current status

> Recorded: 2026-07-23 EDT (GO-closeout session, pre-merge checkpoint)
>
> Release decision: `NO-GO / IN PROGRESS` — merge/deploy/live-proof phases executing

This document separates local source/test truth, committed branch truth, GitHub
truth, preview runtime truth, production runtime truth, and external-owner
truth. A green item in one bucket does not imply a green item in another.

## Truth buckets

| Bucket | Evidence-backed state |
|---|---|
| Working checkout | `docs/b1-b2-final-closeout`; unrelated modified and untracked user files preserved untouched |
| Branch head | `660c51a664cfed21615e815d4e2d6a70fcb96f77` (10 review-fix commits on top of `a485081`) |
| Independent review | Four parallel adversarial passes over the full `origin/main...HEAD` range; all remediation claims verified with file:line evidence; 8 defects found, fixed, and regression-tested (see fix-results.tsv rows 30–38); review trail posted on PR #35 |
| Local gate (a485081) | build/typecheck/zero-warning lint/contract/Drizzle green; 1975 unit tests; Playwright 225 passed / 12 provider-gated skips / 0 failures; npm audit 0 vulnerabilities |
| Local gate (post-fix) | build/typecheck/lint/contract/Drizzle green; full vitest re-running on `660c51a`; final full Playwright pending as the clean-room step |
| GitHub | PR #35 open; CI running on `660c51a`; secret scan already green |
| GitHub enforcement | Free-plan private repo: branch protection/rulesets/scanning APIs return 403 ("Upgrade to GitHub Pro or make this repository public") — owner action H30; environments carry zero protection rules |
| Vercel preview | Fresh preview building for head with the new isolated preview environment |
| Vercel production | Still old SHA `fc8e9fa`; env corrections staged and bind at the merge deploy |
| Merged revision | None yet |

## Provider state changed this session (all receipts in session evidence)

| Provider | Action | Proof |
|---|---|---|
| Vercel Blob | Created **private** store `revora-pantry-private` (`store_xg5sMWEFxtWqzdIE`, iad1); connected under `PANTRY_BLOB_READ_WRITE_TOKEN` (prod/preview/dev) | Anonymous direct-URL and downloadUrl fetches 403; authorized head/delete verified; drill object deleted |
| Vercel env (production) | Removed `OPENAI_BASE_URL`, `REVORA_MODEL`, `REVORA_VISION_MODEL`; replaced `OPENAI_API_KEY` with a live-verified direct key; replaced `DATABASE_URL` with the restricted `revora_app` credential; bound `RESEND_WEBHOOK_SECRET` | Applies at next production deploy (running deployment unaffected) |
| Vercel env (preview) | Bound isolated stack: dedicated preview `DATABASE_URL`, test-mode `STRIPE_SECRET_KEY` + 6 mirror price ids, fresh `AUTH_SECRET`/`HEALTH_DATA_KEY`/`CRON_SECRET`/VAPID pair, `OPENAI_API_KEY`, `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `STRIPE_WEBHOOK_SECRET` | Names inventoried; values never printed |
| Railway Postgres (main) | Backup (47,956 B, sha256-recorded, 33.8 s); isolated restore drill (1.1 s, tables/migrations/rows exact); `revora_app` role + runbook grants; migrations 0016–0017 via owner path; governance check all-true 18/18 (with the fixed AND-semantics probe); journal hashes 18/18 match source | Live DML insert/update/delete proven and cleaned; CREATE/DROP denied |
| Railway Postgres-FOMu | Repurposed as the dedicated preview database: migrated to 18/18 | Retained with owner rationale (preview isolation) instead of deletion |
| Railway Postgres-D2oG | Re-verified zero tables/rows | Deletion deferred to post-merge cleanup phase per preconditions |
| Railway scheduler | Fresh plan re-verified exactly `0 add / 4 change / 0 destroy` | Apply deliberately deferred: `Dockerfile.cron` exists only on the branch and railway.ts builds from `main` — apply follows the merge |
| Stripe (test mode) | Test product/price mirror with lookup keys; test webhook `we_1TwN5WKweWSWjefkp6gDnIr2` (livemode:false, 5 events) at the preview branch alias | Live-mode never touched; the live-mode MCP surface was identified and not used |
| Resend | Production webhook `e0a79b06…` at `https://revora.plus/api/webhooks/resend` and preview webhook `f2570dde…` at the branch alias, each with all 7 runbook events; signing secrets bound | Delivery/bounce/suppression journeys follow the production deploy |
| Upstash | Outage drill: fail-closed 503+Retry-After on email doors, fail-open elsewhere, recovery proven | Free plan caps at one database — preview isolation needs owner billing (H31) |

## Unambiguous ledger deltas vs the 2026-07-23 starting table

- I-01 `VERIFIED_PROVIDER (config)` — production routing deliberately direct-OpenAI; three live structured calls remain a post-deploy gate.
- I-03 `VERIFIED_PROVIDER (store)` — private store + privacy drill done; app-journey proof rides the provider-gated Playwright cases (now runnable via `E2E_PANTRY_LIVE=1`).
- I-11 `VERIFIED_LOCAL` outage/recovery drill complete.
- I-14 `VERIFIED_PROVIDER` backup/restore/RPO/RTO/checksum evidence complete; Railway console PITR settings remain dashboard-only.
- I-15 `VERIFIED_PROVIDER` role split, migrations, DML/DDL, journal hashes complete; connection-pressure measurement under live traffic remains open.
- I-16 `VERIFIED_PROVIDER (bindings)` — isolated preview stack bound; journey proofs follow the fresh preview.
- I-23 heartbeat/route semantics corrected after review (D1) — live scheduler correlation still follows the Railway apply.
- New review defects (rows 31–38) all `fixed` with regression tests.
- I-21 remains `BLOCKED_EXTERNAL` on the GitHub plan (owner action H30).
- I-20 remains `BLOCKED_EXTERNAL` on Namecheap DNS access (owner actions H26–H29).

## Remaining before GO

1. CI green on `660c51a`; clean-room full vitest + Playwright on the final head.
2. Merge PR #35; production deploy; alias→SHA proof; production readiness/security.txt/liveness.
3. Railway apply + four consecutive hourly runs with heartbeats, downstream effects, and red-path proof.
4. Production journeys: model calls, auth email + Resend events, Sentry canaries on the exact release, Umami transport.
5. Stripe test-mode lifecycle (local controlled run) + preview checkout journey.
6. Provider-gated Pantry Playwright cases under `E2E_PANTRY_LIVE=1`.
7. Rollback drill; orphan deletion (D2oG, duplicate Vercel project) with receipts; re-inventory; final closeout handoff.
8. Owner-only: GitHub Pro enforcement (H30), Return-Path MX + DNS hardening (H26–H29), Upstash preview billing (H31), Umami API key (H32).
