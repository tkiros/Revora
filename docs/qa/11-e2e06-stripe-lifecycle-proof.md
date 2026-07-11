# E2E-06 — Stripe Test-Mode Lifecycle Proof (PASSED)

Run: 2026-07-11, harness `scripts/e2e-stripe-lifecycle.mjs`, evidence
`artifacts/qa/e2e06-2026-07-11T15-05-41-598Z.json` (gitignored).

Closes the E2E-06 gap from `docs/handoff/2026-07-09-e2e-verification-report.md`
("paid/customer lifecycle unproven"). Every step ran against Stripe **test
mode** (sandbox `sk_test_` key), a throwaway dockerized Postgres, and the real
app routes on a local dev server. Zero real emails (AUTH_EMAIL_STUB_DIR), zero
production writes, zero live charges.

## Results

| # | Step | Result | Evidence |
|---|---|---|---|
| 1a | `POST /api/trial/start` returns hosted Checkout URL | PASS | `checkout.stripe.com/c/pay/cs_test_a15yT6…` |
| 1b | Hosted Checkout completed with 4242 test card (headless Chromium) | PASS | Redirected to `/trial/started`; page showed "7 days free, then $12.99/month" |
| 2 | Real `checkout.session.completed` event relayed with valid signature to `/api/billing/stripe/webhook` | PASS | HTTP 200 `{received:true}` |
| 2b | `subscriptions` row upserted `status=trialing`, `provider=stripe`, `price_variant=1299` | PASS | Row `53843ab7…`, `sub_1Ts2Wr…` |
| 3a | Magic-link sign-in produced a DB session cookie | PASS | `authjs.session-token` set via stubbed email |
| 3b | `GET /api/entitlement` with that session | PASS | `{tier:"premium", status:"trialing", currentPeriodEnd:2026-07-18}` |
| 4 | Pre-charge email via real cron route (`/api/cron/trial-precharge` + CRON_SECRET) | PASS | Subject "Your Revora trial ends in about 2 days"; body has $12.99/month, charge date, one-tap cancel link |
| 4b | `pre_charge_email_sent_at` stamped (no double-send) | PASS | timestamp present |
| 5 | Signed-out cancel via emailed token link | PASS | 303 → `/canceled`; Stripe shows `cancel_at_period_end: true` |
| 5b | `customer.subscription.updated` relay keeps row entitled until period end | PASS | status stays `trialing` |
| 6 | `POST /api/billing/stripe/portal` (session-gated) | PASS | Live `billing.stripe.com/p/session/test_…` URL |
| 7 | Subscription deleted → webhook → row `expired` → entitlement `free/lapsed` | PASS | `{tier:"free", status:"lapsed"}` |

## Notes / caveats

- The pre-charge window was reached by setting the LOCAL row's
  `current_period_end` to now+40h (the real trial ends in 7 days); Stripe's
  subscription object was untouched. The sweep, email, token, and cancel flows
  all ran through real code paths.
- Webhook delivery was a signed relay: real events fetched from the Stripe
  Events API and re-signed with the local `STRIPE_WEBHOOK_SECRET`
  (`stripe.webhooks.generateTestHeaderString`). Signature verification in
  `createStripeWebhookHandler` ran for real. Not covered: Stripe's own
  push delivery/retry behavior to the production URL — verify the webhook
  endpoint registration in the live dashboard at launch.
- One relay attempt returned 500 before succeeding on retry (dev-server cold
  compile); the handler itself was idempotent, final state correct.
- Trial→active conversion on first invoice (`invoice.paid` with
  `billing_reason=subscription_cycle`) is not reachable inside a test run
  without test clocks; it remains covered by unit tests
  (`applyStripeEvent`). Everything else in the E2E-06 scope is proven above.
- Machine quirk: docker bridge port-publishing was blackholing connections on
  this host, so the harness runs Postgres with `--network host` on
  127.0.0.1:55440.

## Rerun

```
# .env.e2e (gitignored): STRIPE_SECRET_KEY=sk_test_…
node scripts/e2e-stripe-lifecycle.mjs            # full proof
node scripts/e2e-stripe-lifecycle.mjs --precheck # prerequisites only
```

The harness refuses to run with anything but an `sk_test_`/`rk_test_` key.
