# Feature, route, and claim inventory

## Launch-state table

| Function | Candidate state | Public routes/surfaces | Enforcing source |
| --- | --- | --- | --- |
| Text meal check | Enabled | `/`, `/check`, `/api/check` | `components/food-check-form.tsx`, `app/api/check/route.ts`, `lib/revora/service.ts` |
| Reviewed voice-to-text | Enabled | `/check` | `components/voice-input-button.tsx`, same text verdict path |
| A1C caution bands | Enabled, limited to `5.7%–6.4%` | onboarding, welcome, check, API | `lib/revora/a1c.ts`, safety contract, clinical-risk router |
| Clear / Be careful / Hold off | Enabled as educational meal-pattern labels | result/demo/listing/support | `lib/revora/labels.ts`, `components/result-card.tsx`, postprocess and copy audits |
| Accounts and encrypted history | Enabled in source; production unproved | `/welcome`, `/history`, `/account`, profile/history APIs | consent-bearing profile check, AES-256-GCM helpers, owner-scoped DB routes |
| Behavior-only progress | Enabled | `/home`, `/progress`, coach API | coach/BAI modules; copy excludes physiologic outcome claims |
| Optional daily reminder | Enabled in source; provider delivery unproved | account/home, push/cron routes | opt-in UI, push subscription, nudge cron |
| Subscription/trial/Play billing | Present but default checkout blocked | `/subscribe`, account, billing APIs | `LEGAL_TERMS_FINAL=1` plus current Terms acceptance/version required |
| Pantry Review | Present; proposed scope requires owner decision and paid-launch facts | `/pantry`, intake, report, purchase APIs | separate assent, encrypted details, blob lifecycle, report workflow |
| Meal photo-assist | **OFF and unadvertised** | control absent; route retained | exact `NEXT_PUBLIC_PHOTO_INPUT=1` required; otherwise route `404` before model use |
| Longitudinal insights | **OFF and unadvertised** | no API output, dashboard card, daily-loop output, or paid promise | exact `NEXT_PUBLIC_LONGITUDINAL_INSIGHTS=1` required; derivation otherwise returns `null` |

## Material public/account routes

`/`, `/onboarding`, `/welcome`, `/check`, `/home`, `/history`, `/progress`,
`/subscribe`, `/account`, `/account/delete`, `/terms`, `/privacy`, `/pantry`,
`/pantry/intake`, `/pantry/thanks`, `/report/[id]`, `/signin`, and `/support`
copy/macros.

Material APIs include check/photo-draft, coach, profile/history, health-data and
account deletion, entitlement, subscription/trial/portal/cancel/webhook/Play,
Pantry purchase/intake/report, reminder, and cron routes. The production build
route list is reproduced in `release-evidence.md` by reference to the successful
build; any future professional reviewer should inspect the actual candidate tree
if route-level scope is dispositive.

## Claim and publishing surfaces

- Product: landing, onboarding, check/result, home/history/progress, paywalls,
  account, Pantry Review, Terms, Privacy.
- Publishing: `docs/ops/play-listing.md`, `docs/product-marketing.md`,
  `docs/runbooks/marketing-assets.md`, support macros, service emails.
- Enforcement: `docs/safety/claims-boundary.md`, `docs/safety/copy-ledger.md`,
  `tests/unit/revora/claims-boundary-copy.test.ts`, schema/postprocess tests,
  safety/eval suites.

No active surface may describe a label as individual safety, predict glucose or
a future lab, promise a disease outcome, claim clinical proof/regulatory status,
or advertise either disabled feature.
