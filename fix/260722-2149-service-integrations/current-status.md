# Revora service-integrations remediation — current status

> Recorded: 2026-07-23 EDT (GO-closeout session 2 — merge, deploy, live proofs)
>
> Release decision: technical gates proven except owner-blocked items (see
> "Owner-only blockers"); final decision statement lives in the closeout report

This document separates local source/test truth, committed branch truth, GitHub
truth, preview runtime truth, production runtime truth, and external-owner
truth. A green item in one bucket does not imply a green item in another.

## Truth buckets

| Bucket | Evidence-backed state |
|---|---|
| Merged revisions | PR #35 → `795d1a374f0acb052c2bed01e1d74781527472e8`; PR #43 (harness fixes + evidence) → `7409afd8ba6ef9d15dfe741581de6ba871a2eb56`; PR #44 (CSP fix) → `210d8898432e974b3a40cda2a4a5a1226cb77730` (current `origin/main`) |
| CI on merged SHAs | main runs 30020772770 (795d1a3), 30032553040 (210d8898) — all green; every PR merged only on a fully green exact-head run |
| Vercel production | alias `revora.plus` → `dpl_4bdyJHK7z8mFXJnKDePkd2bgLUwv` = `210d8898` READY; `/api/health/live` 200 no-store; `/api/health` 200 healthy (all crons ok); `security.txt` 200 canonical; CSP now includes `https://vercel.com` (private-Blob uploads) |
| Vercel preview | branch alias redeployed with full isolated env; `db: ok`; only expected issues: cron `never` (no scheduler targets preview) + `rate_limit_unavailable` (Upstash preview = owner H31, fail-closed) |
| Railway scheduler | strict runner (`Dockerfile.cron` + `run-hourly-crons.mjs`) live; 13:00 and 14:00 runs `completed=4 failed=0`, all `result=ok`; observation window continuing through 16:00; red path proven (`wrong CRON_SECRET → 4×401, failed=4, exit 1`) |
| Production DB | restricted `revora_app` runtime role live in production (first deploy exposed missing `sslmode=no-verify` — fixed, `db: ok`); heartbeats advance hourly |
| GitHub enforcement | unchanged: free-plan private repo blocks protection/rulesets/scanning APIs — owner action H30; merges gated on green CI by discipline, not platform enforcement |

## Live journeys proven this session (correlation ids in closeout report)

| Journey | Result |
|---|---|
| Model routing (I-01) | 3 varied structured calls via repo client, base URL unset, default `gpt-5.4-mini`, direct OpenAI; strict-schema SAFE/MODERATE/SAFE; run with local key (bound prod key is write-only; live-verified session 1); prod health shows no `model_configuration` |
| Auth email (I-04) | production magic link → Resend accept → signed webhook → `delivered` row with provider msg id; `bounced@resend.dev` → `bounced` + suppression row; repeat send → `suppressed` row, signin surfaces error (no false success); replay/expiry + real-inbox legs owner-assisted |
| Sentry (I-10/I-17) | browser canary `REVORA_PROD_CANARY_20260723T114550` accepted by ingest (200), client release = merged SHA, env production; server-event + dashboard/alert-ack legs owner-assisted (DSNs write-only, no Sentry API token) |
| Umami (I-17) | `script.js` 200 + `/api/send` fired through production CSP, zero violations; dashboard receipt owner-assisted (H32) |
| Stripe lifecycle (I-06/I-07/I-18) | local controlled E2E-06 ALL STEPS PASSED: checkout 4242 → signed webhook (500-then-200 retry) → trialing → session → entitlement → pre-charge email (idempotent) → two-step cancel → entitled-until-period-end → portal → deletion lapse; synthetic customers deleted after |
| Pantry live (I-03/I-09) | formerly-gated 12 cases now run: 35/36 green + the single workstation network-flap case re-verified green in isolation; live private-Blob upload, live model judge, emailed report |
| Push/nudge (I-12/I-23) | real Chrome FCM subscription on preview → cron `sent:1` → notification rendered; forced provider error → `ok:false failed:1`, attempt consumed, retry armed, no false success; next-tick retry → `sent:1` + durable local-day stamp; real unsubscribe → `pruned:1`, row deleted; synthetic user cascade-deleted |
| Readiness (I-13) | production readiness correctly 503-degraded (`cron_*_stale`) until first strict run, then 200 healthy; DB outage surfaced as `database_unavailable` when the TLS binding was wrong (real detection, then fixed) |
| Rollback (Phase E) | `vercel rollback` to previous SHA verified by CSP fingerprint (~16 s); `vercel promote` back to final SHA (~20 s); healthy after |

## Defects found and fixed this session

| Fix | Where |
|---|---|
| Production/preview `DATABASE_URL` lacked `sslmode=no-verify` → pg rejected Railway's self-signed TLS → `database_unavailable` | Vercel env rebind (prod + preview) |
| **CSP blocked private-store pantry uploads** (`vercel.com` missing from `connect-src`) — every paid Pantry photo upload failed | PR #44 + regression test |
| Stripe lifecycle harness: waited on readiness (now deliberately 503 on fresh DB), missed the two-step cancel, no reload-on-stall, inherited ambient Upstash → 429 fail-closed | PR #43 |
| Pantry live specs: claim URL host vs session-cookie host mismatch; ambiguous heading selector | PR #44 |

## Cleanup executed

- `Postgres-D2oG` deleted (re-verified 0 tables immediately before); detached volume `postgres-volume-yrjb` deleted
- Duplicate Vercel project `revora-irj3` deleted (re-verified no aliases/custom domains; removes its duplicate PR checks)
- Protection-bypass secret rotated; preview Resend webhook `f2570dde…` and Stripe test endpoint `we_1TwN5WKweWSWjefkp6gDnIr2` repointed to the new secret (both verified: Resend 200, Stripe enabled/livemode:false)
- All synthetic Stripe test customers deleted; synthetic preview nudge user cascade-deleted; Sentry canary is synthetic-only
- `Postgres-FOMu` RETAINED as the dedicated preview database (owner: engineering; rationale: preview isolation)

## Post-addendum state (owner actions landed same day)

- H30 CLOSED: repo public; branch protection (4 required checks strict, enforce_admins, no force-push/deletions), secret scanning + push protection, Dependabot, CodeQL all active; forbidden-merge proven on PR #46 (pending/red/admin-bypass all refused). Review requirement demonstrated, then set for solo operability (re-enable with a second reviewer).
- H26/H27 CLOSED: Return-Path MX + DMARC p=quarantine verified authoritative + two public resolvers. H28/H29 (CAA, DNSSEC) remain absent — hardening-tier.
- H31/H32 + Sentry ack: owner-declined paid/ack legs — recorded as deliberate waivers; Upstash preview stays INTENTIONAL_OFF_SAFE.
- Scheduler observation window COMPLETE (13:00–16:00, 4× completed=4 failed=0).

## Sole open blocker

- **REGRESSION_OPEN: production Resend API key invalid (http_401 on live probe; workstation key also rejected).** Auth email cannot send until the owner mints a new key and RESEND_API_KEY is rebound (Vercel production + preview). Everything else within accepted scope is proven.
