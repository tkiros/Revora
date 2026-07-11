# 02 — Traceability Matrix (delta, 2026-07-10)

The authoritative product traceability matrix lives at the repo root
(`Revora_Traceability_Matrix.md`). This delta maps the master QA prompt's required
journeys to the *current implementation* and this round's evidence. Statuses:
EXECUTED / NOT EXECUTED / BLOCKED / N/A (feature does not exist — see recon §4).

| Promise / journey | Surface | Test(s) | Risk | Status | Evidence |
|---|---|---|---|---|---|
| Sign up / magic-link sign-in / sign-out | `/signin`, NextAuth | `auth.spec.ts`, `reviewer-signin.test.ts` | P0 | EXECUTED — PASS | smoke run 2026-07-10 |
| Onboarding (welcome→segment→A1C→expectations→first check) | `/onboarding` | `onboarding.spec.ts` (incl. invalid A1C, out-of-range boundary, skip-tour) | P0 | EXECUTED — PASS | smoke run |
| First check, understandable result, one action | `/check` | `mobile-check.spec.ts` (result readability, single-screen flow), unit `result-card` tests | P0 | EXECUTED — PASS except CTA fold on WebKit (A11Y-01, P2) | smoke run |
| Out-of-scope A1C never gets a verdict | engine + onboarding | `a1c.test.ts`, eval corpus (10 cases), `onboarding.spec.ts` boundary tests | P0 | EXECUTED — PASS | unit+smoke+live bake-off |
| Ambiguous meal → one clarifying question, skippable | engine | precheck + eval `ambiguous` category (5 cases) | P1 | EXECUTED — PASS (deterministic clarify) | eval runs |
| No exact numbers / no diagnosis / disclaimer always | engine + copy | claims/disclaimer/postprocess tests; live outputs sampled | P0 | EXECUTED — PASS | see report 10 |
| Photo → draft → user confirms (extractor never judges) | `/check` photo, pantry | `photo-draft-route.test.ts`, `photo-check.spec.ts`, `meal-photo` eval | P1 | EXECUTED — PASS (unit+smoke; live vision eval NOT EXECUTED) | suite run |
| Offline / timeout / dupe-submit / retry honesty | `/check` | `mobile-check.spec.ts` (offline, retry states), `check.test.ts`, dupe via clientId conflict | P0 | EXECUTED — PASS | smoke+unit |
| Free cap & trial wall before model spend; no bypass | `/api/check`, proxy | `trial-wall.spec.ts`, `entitlement.test.ts`, `billing-routes.test.ts`, `launch-controls.spec.ts` | P0 | EXECUTED — PASS (sandbox/unit level) | suite run |
| Stripe checkout/portal/webhook; Play verify/RTDN | `/api/billing/*` | unit suites (webhook sigs, cancel, precharge) | P0 | EXECUTED (unit) — live sandbox E2E NOT EXECUTED | suite run |
| Restore/cross-device entitlement | server entitlement | `entitlement.test.ts` | P0 | EXECUTED (unit) — device-level MANUAL | |
| History save/return, free-tier 7-day window | `/history` | `history-routes.test.ts`, `daily-loop.spec.ts`, `dashboard.spec.ts` | P1 | EXECUTED — PASS | suite run |
| Account deletion, data export | `/account/delete` | `account-delete.test.ts`, `billing-pages.spec.ts` | P0 | EXECUTED (deletion) — **export flow does not exist** (P2 gap, see 05) | |
| Analytics: no sensitive data, no dupes | telemetry | `telemetry.test.ts`, `analytics.test.ts`, `privacy-*.test.ts` | P1 | EXECUTED — PASS | suite run |
| Nudge opt-in never shown to fresh users/guests | push | `nudge-opt-in.spec.ts`, `push-routes.test.ts`, `nudge.test.ts` | P1 | EXECUTED — PASS | smoke run |
| A11y: no critical/serious violations on core path | all | `a11y.spec.ts` + embedded axe | P1 | EXECUTED — PASS (see report 08 for manual gaps) | smoke run |
| Model choice justified | engine | bake-off harness (new) | P1 | EXECUTED — see report 06 | artifacts/qa |
| Barcode scan, nutrition-label OCR math, per-100g serving math, UK locale | — | — | — | **N/A — features do not exist** (recon §4) | |
| CGM/insulin/medical chat questions | — | input is a 160-char food field; no chat surface | — | N/A + boundary documented (report 10 flag 3) | |

Owners: engineering = tkiros; clinical/legal sign-offs tracked in `docs/safety/` +
`docs/legal/counsel-brief.md`.
