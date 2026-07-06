# ADR: Billing — Play Billing in the TWA + Stripe web fallback

**Date:** 2026-07-01 · **Status:** Accepted · **Phase:** 4D

## Decision

- **Primary (TWA/Android):** Google Play Billing via the **Digital Goods API**
  (`window.getDigitalGoodsService('https://play.google.com/billing')`) inside
  the TWA. Purchases yield a `purchaseToken` that the server verifies against
  the **Play Developer API** (`purchases.subscriptionsv2.get`) before granting
  entitlement. The Play API is called with plain `fetch` and an RS256
  service-account JWT signed with `node:crypto` — **no `googleapis`
  dependency** (it is a very large package for one endpoint).
- **Lifecycle:** Real-Time Developer Notifications (RTDN) via a Pub/Sub push
  endpoint (`POST /api/billing/play/rtdn`, shared-token auth) for
  renew/cancel/refund/grace, plus **verify-on-read** whenever a stored
  `current_period_end` is stale — the webhook is an optimization, not a
  correctness dependency.
- **Fallback (browser/PWA users):** **Stripe** Checkout + webhooks + Billing
  Portal for cancel/manage. Same products, same prices.
- **Unified state:** one `subscriptions` table
  (`provider IN ('play','stripe')`, `provider_ref` unique) and one
  `getEntitlement(userId)` read path. The rest of the app never knows which
  provider granted premium.
- **SKUs:** `premium_monthly` ($12.99/mo) and `premium_annual` ($99.99/yr) —
  owner confirms before Play products are created. Lifetime is deferred
  post-launch (one-time products complicate Play review).
- **Free tier:** 5 result-checks/day, enforced server-side for signed-in users
  (counted from `checks`), best-effort client-side for guests with the
  existing Upstash IP rate limit as the abuse backstop.

## Why

Play Billing is mandatory for subscriptions sold inside a Play-distributed
app. Stripe covers the web installability path without forcing Android
packaging on web users. Server receipt verification (never trusting the
client) plus verify-on-read gives billing correctness even across webhook
outages. Epic-v-Google alternative-billing options exist but are
policy-volatile — counsel verifies before we rely on them (plan §12).

## Consequences

- Two providers to test (sandbox + Stripe test mode; real-device license-tester
  purchase closes at P8).
- RTDN requires a Google Cloud Pub/Sub topic and service account (human, §10).
- Cancellation is deliberately frictionless (account page deep-links) — the
  anti-Klinio stance is a product feature.

## Amendment 2026-07-05

The **Free tier** decision above (5 result-checks/day) is **superseded by
Decision D**: a Day-1 anonymous taster converts into a **card-gated 7-day free
trial** at **$12.99/mo** (price-testing variants **$9.99** and **$19.99**),
rather than an ongoing free allowance. The change is gated behind the
`PAYWALL_MODE` environment flag: `legacy` (the default, and any unset value)
retains the original 5-checks/day behavior for instant rollback, while `trial`
activates the taster → card-gated trial flow. The rest of this ADR — Play
Billing, Stripe fallback, unified `subscriptions` state, and verify-on-read —
is unchanged.

See the strategy handoff
(`docs/handoff/2026-07-05-paywall-pricing-pantry-strategy-handoff.md`) and the
implementation plan
(`docs/superpowers/plans/2026-07-05-launch-readiness-paywall-pantry.md`).

## Amendment 2026-07-06 — refund policy (launch audit BUG-17)

`charge.refunded` handling: a **full** refund of a subscription invoice charge
sets the subscription row to `refunded` (the only writer of that enum value),
dropping premium immediately instead of at period-end. **Partial** refunds
leave the entitlement untouched (a goodwill credit is not a cancellation). A
refund issued together with a cancellation also flows through
`customer.subscription.deleted`; the two updates are idempotent. Pantry Review
(one-time payment) refunds continue to cancel the matching `pantry_orders` row
by payment intent.
