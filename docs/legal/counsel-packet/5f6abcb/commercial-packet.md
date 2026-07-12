# Commercial and assent packet

## Candidate facts

- Premium source prices currently represented as `$12.99/month` and
  `$99.99/year`, subject to the live price resolver and checkout.
- Trial copy states seven days free, first-charge date/amount disclosure, email
  reminder, automatic renewal, cancellation, and refund notice.
- Pantry Review is represented as `$49`, one-time and non-renewing.
- Web subscription, trial, Play verification, and Pantry purchase handlers
  require `termsAccepted: true` and `termsVersion: 2026-07-12` and persist
  acceptance evidence.
- All paid entry points fail closed unless `LEGAL_TERMS_FINAL=1`. Portal and
  cancellation remain available so an existing subscriber can leave.
- Repeat-trial protection survives integration: any prior subscription row
  suppresses a second free trial while retaining Terms-version metadata.

## Local captures

- `screenshots/subscribe-insights-disabled.png` — price/offer surface with no
  longitudinal-insight promise.
- `screenshots/terms.png` and `screenshots/privacy.png` — local rendered legal
  pages using fallback identity values, not acceptable live operator proof.
- `screenshots/account-delete.png` — public deletion information surface.
- `screenshots/pantry.png` — public Pantry offer; authenticated intake and
  payment evidence remain missing.

## Not proved

- Real entity/merchant, address, venue, inbox, refund and incident owners.
- Live Stripe/Play price parity, trial conversion, successful purchase,
  entitlement, cancellation, refund, chargeback, or receipt/service email.
- Production Terms/Privacy render and acceptance record.
- Authorized migration/application and real account/database behavior.

The later owner WTP decision authorizes `LEGAL_TERMS_FINAL=1` for real Stripe
Premium/trial and Pantry charges once the deployed candidate renders no drafting
placeholders and records current-version acceptance. The remaining entity,
address, jurisdiction, merchant, and incident facts remain accepted owner risk,
not facts engineering may invent.
