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
