# Revora — Execution Report: Phase 0 code items, C2 billing/reliability fixes, E2E run

**Written:** 2026-07-21 · **Base:** `fbe0d271` on `fix/domain-migration-revora-plus` · **Executes:** `docs/handoff/2026-07-21-revora-phase0-access-billing-e2e-and-finite-program-execution-handoff.md` §C1 (code half), §C2 (complete), §C3 (run + AA-10)

## Verification state (all on this working tree)

| Gate | Result |
|---|---|
| typecheck / lint / contract | PASS (lint: 0 errors, 18 pre-existing warnings) |
| `npm test` | **1804 passed / 2 skipped** (baseline was 1780/2; every fix below added a regression test) |
| `eval:revora` | 11/11 |
| `npm run build` | PASS |
| `npm audit --omit=dev` | 0 vulnerabilities |
| `npm run e2e` (3 projects × 2 servers) | 198 passed / 18 skipped per run. Two full runs each had 2 machine-load flakes — a *different* pair each run, and every failing spec passes in isolation and in the other run. No deterministic failure. |

## C2 fixes applied (each with a regression test)

**Billing:** BC-1/SA-8 (GET cancel is now verify-and-redirect to a new `/canceled/confirm` page; mutation moved to POST, which also accepts the email token) · BC-2 (new `cancel_at_period_end` column, migration `0013`; persisted from webhook + cancel endpoints; UI renders "Access until X — will not renew"; plan-box too) · BC-3 (success URLs carry `{CHECKOUT_SESSION_ID}`; new `POST /api/billing/stripe/sync` retrieves the session server-side and runs the same reducer — entitlement flips without a webhook; wired into /account and /trial/started returns) · BC-4 (Play RTDN: transaction + row lock + terminal guard + monotonic guard, revocations always land) · BC-5 (monotonic paid-through guard on both self-heal writes + reconcile heal — premium-only, downgrades always land) · BC-6 (Play heal now lastVerifiedAt-gated + terminal-guarded, mirroring Stripe) · BC-7 (`/api/billing/:path*` in the proxy matcher, new `billing_ip` bucket 10/h; webhook + RTDN excluded — provider-authenticated) · BC-8/PR-1 (inbox payload PII-redacted on processing — denylist keeps what the charge scan reads; prune extended to failed/dead_letter; inbox listed in the privacy notice) · BC-9 (`expired` terminal in the checkout-replay guard) · RE-03/BC-10 (pre-charge sweep: claim-before-send, stamp released on send failure) ·

**Reliability:** RE-01 (trial wall fails CLOSED — 503 retry card, zero model spend; courtesy cap stays fail-open; new `server_error` reason code) · RE-02 (Edge Config unreachable ≠ unset: fail closed with last-good cache; inverted comment corrected; the two tests that encoded the inverted behavior updated) · RE-04 (`check_user` bucket, 200/24h per userId, enforced in the check handler; env-reference clarified — no ops doc currently misdescribes the cap as per-user, likely fixed since audit) · RE-05 (`emitSafeEvent` never throws — safeParse + `telemetry_schema_miss` counter) · RE-06 (nudge cron claim-before-send lease) · RE-07 (SW cache stamped from `?v=<build id>` registration URL + controllerchange soft-refresh) · RE-08 (CI job: `drizzle-kit check` + no-op-generate drift gate) · RE-10 (server returns `persisted:false` when the history row fails to store; result card shows a quiet "couldn't be saved" note) ·

**Privacy:** PR-2 (`docs/runbooks/health-key-rotation.md` + env-reference rows for `HEALTH_DATA_KEYS_OLD`/`HEALTH_DATA_KEY_VERSION` with the never-drop-a-key invariant) · PR-4 (pantry sweep erases unclaimed paid orders >90d; claim links stop binding at the same age) · PR-5 (`GET /api/account/export` bundles exact A1C, weekly reflections, pantry corpus) · PR-6 (Umami `data-exclude-search` — no query strings like `?health-data-deleted=1` in pageviews; DNT honored; per-browser opt-out toggle on /account).

**P0.3 code half:** `@sentry/browser` was a dependency nothing imported — client errors were fully silent. New `ClientErrorReporting` (env-gated on `NEXT_PUBLIC_SENTRY_DSN`, messages/breadcrumbs/queries stripped). Production builds now FAIL without the measurement env unless `REVORA_ALLOW_NO_MEASUREMENT=1`.

**AA-10:** Desktop Chrome Playwright project added (the desktop sidebar was never exercised).

## P0 infra state observed (externally verified 2026-07-21)

- `https://revora.plus` serves the app publicly, HTTP 200, **no Vercel SSO wall** (DA-6's app-surface half looks resolved).
- **`www.revora.plus` has no DNS record** — P0.1's www/canonical-redirect criterion is unmet.
- MX/SPF on `revora.plus` are Namecheap email-forwarding only; **no Resend DKIM/SPF records exist** → `signin@revora.plus` (the code fallback since `fbe0d27`) **cannot deliver yet**. DMARC is `p=none`.
- **Still the binding blocker:** Resend sending-domain verification + www record + Stripe live webhook registration (BC-3's code half is defense-in-depth, not a replacement) + Umami/Sentry env values + support mailbox monitoring. All are provider-dashboard actions.

## Not done / guarded (unchanged from handoff §D)

Clinical items HS-2/4/5/7 (W-05 RD gate), HS-3 flag, HSTS preload, CSP report-uri, S1/S2 flag flips, pricing-number changes (concierge-tested, not hard-set), the 16-journey E2E authoring beyond the existing smoke suite, RE-08's one-time prod structural comparison vs `0012_snapshot.json` (needs prod DB access).
