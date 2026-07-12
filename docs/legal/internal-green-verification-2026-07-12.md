# Revora internal legal-safety verification — 2026-07-12

## Status

**GREEN for the implemented internal launch controls in this worktree.** Revora's
core product remains intact: meal checks, the Clear / Be careful / Hold off
labels, optional A1C context, accounts, history, insights, subscriptions, and
Pantry Review.

This is an engineering and product-control verification. It is not an
independent legal opinion, a regulator decision, or a guarantee that no legal
risk exists.

## Intended use and label meaning

Revora provides general educational information about meal patterns. It does
not diagnose, treat, cure, prevent, or reverse a disease; prescribe a diet; or
predict an individual's glucose response or medical suitability.

Clear, Be careful, and Hold off describe general meal-pattern caution. Optional
A1C context only makes the presentation more cautious; it does not turn the
labels into individualized medical advice or a prediction.

## Controls verified in source

- User-facing and active acquisition copy removes disease-reversal, guaranteed
  A1C, personal safety, and eat/don't-eat implications.
- Terms state the educational intended use, renewal and cancellation terms, a
  concrete seven-day first web-charge refund policy, Pantry Review refund
  timing, consumer-rights savings language, and support contact.
- Privacy disclosures identify the data categories, purposes, service
  providers, transfers, retention approach, rights, appeal path, incident
  handling, children's boundary, and consent withdrawal.
- Health-data consent is purpose-bound and identifies storage and AI-provider
  processing. Withdrawal erases saved health data while preserving the login
  and subscription record.
- Meal-check persistence requires an active consent-bearing profile.
- Web subscription, trial, and Pantry Review checkout require affirmative Terms
  acceptance. The server rejects missing, false, or stale acceptance versions,
  and records the accepted version and time.
- Database migrations `0003` and `0004` add the acceptance audit fields.
- Automated claims-boundary coverage scans active product and publishing
  surfaces for the removed high-risk phrases.

## Local verification evidence

| Gate | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 102 files passed, 1 skipped; 783 tests passed, 2 skipped |
| `npm run eval:revora` | PASS — 8 tests |
| `npm run build` | PASS — production build completed; health-data deletion route included |
| Targeted claims/privacy/coach tests | PASS — 115 tests |
| Targeted billing/consent/deletion server tests | PASS — 50 tests |
| Browser smoke: billing and dashboard, Mobile Chrome, one worker | PASS — 8 tests |
| Browser smoke: onboarding and A1C boundaries, Mobile Chrome, one worker | PASS — 6 tests |
| `git diff --check` | PASS |

The smoke server intentionally had no database configured, so Auth.js reported
that its email-login adapter was unavailable while signed-out pages were
tested. The tested routes and assertions passed; authenticated production
behavior is a separate live-environment gate below.

## Required production gates before calling the deployed app GREEN

- [ ] Set the real `LEGAL_ENTITY_NAME` and monitored `SUPPORT_EMAIL` values.
- [ ] Apply database migrations `0003` and `0004` to the production database.
- [ ] Deploy the reviewed revision and prove the exact deployed revision.
- [ ] Verify live Terms, Privacy, consent withdrawal, health-data erasure, and
      the three paid acceptance flows against the production database.
- [ ] Complete a real Google Play purchase, renewal/cancellation, and refund
      path check, including the support escalation path.
- [ ] Confirm every store listing, ad, screenshot, email, and support macro uses
      only approved active copy.
- [ ] Keep any unverified photo-analysis path disabled until its separate QA
      gate is complete.

## Owner residual-risk acceptance

Proceeding without an independent legal opinion is an owner decision. It does
not change the internal GREEN result above, and it must not be described as
outside-counsel clearance.

- [ ] Owner accepts the remaining classification, privacy-jurisdiction, and
      consumer-contract risk for the intended launch markets.
- Owner: ____________________
- Date: ____________________
