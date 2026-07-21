# Operator refund runbook (DA-NH-2)

**Owner:** the operator monitoring support@revora.plus · **Written:** 2026-07-21 (C7 branch)
**Policy source:** `/terms` §Refund policy — the page is the user-facing truth; this runbook is the
operator-side procedure. Web window: `WEB_REFUND_WINDOW_DAYS = 7` (`lib/legal/terms.ts`) calendar
days from the FIRST paid charge, first charge only. Also always refundable: verified duplicate or
unauthorized charges; material service failure Revora confirms.

## Where requests arrive

- **In-account form** (`/account` → Help & refunds): creates a `support_cases` row (kind=refund,
  status=open) AND sends the full message to support@revora.plus with the case id in the subject.
  The inbox is the triage queue today (no admin viewer yet — TODOS.md).
- **Direct email** to support@revora.plus: valid too (the terms say so). Ask for the account email
  if it differs from the sender.

## Stripe (web) refunds — dashboard steps

1. **Find the customer:** Stripe Dashboard → Customers → search the account email. Open the
   subscription → latest invoice → the charge.
2. **Check eligibility** against the policy: first charge within 7 calendar days of the first paid
   charge? Duplicate/unauthorized? Confirmed service failure? If none apply, reply with the policy
   line and offer cancel-at-period-end instead (Dashboard → Subscription → Cancel → at period end).
3. **Refund:** open the charge → Refund → full amount → reason `requested_by_customer`
   (`duplicate`/`fraudulent` when that is the truth — the reason feeds Stripe's dispute evidence).
4. **Do NOT touch the database.** The `charge.refunded` webhook is the only writer of the
   `refunded` subscription status (`app/api/billing/handlers.ts`); it drops premium and the status
   is terminal — reconcile can never resurrect it. Manual DB edits are how resurrection bugs
   happen.
5. **Verify:** within a few minutes the user's `/account` shows the free plan. If the webhook is
   down (see §deploy checklist — endpoint registration is pending owner OAuth), the hourly
   `stripe-reconcile` cron is the backstop; confirm on its next run.
6. **Close the loop:** reply from support@ quoting the case id ("Case #xxxxxxxx — refunded, allow
   5–10 business days to appear on your statement"). SLA promised in-product: reply within 2
   business days.

## Google Play purchases

Play refunds run through Google first (terms §Refund policy). If the user comes to us directly:
point them at Play's refund flow; for cases Google bounces back, use the Play Console → Order
management → refund. Entitlement self-heals via the existing Play verify-on-read path.

## Pantry Review (one-off digital good)

Refundable until processing begins; after that only duplicate/unauthorized/material non-delivery/
required-by-law (terms). Same Stripe steps; the charge is a one-off payment, not a subscription
invoice — refunding it does not touch subscription status.

## Ledger hygiene

Until the admin viewer exists, the `support_cases` row stays `open` — the email thread is the
resolution record. When the viewer lands (TODOS.md), backfill status there.
