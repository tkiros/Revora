# Web funnel walkthrough — observed results + triaged punch-list (WS5, Task 5.1)

**Date:** 2026-07-04 · **Branch:** launch-hardening · **Driver:** agent (Playwright, Chromium 1223)
**Viewports:** Mobile Chrome (Pixel 7 emulation) + desktop (1280×900)
**Server:** local `next dev` on :3100, **unprovisioned** — no `DATABASE_URL`, dummy `OPENAI_API_KEY`,
no email provider, no Stripe keys, no Vercel Blob, no VAPID keys.
**Evidence:** `.superpowers/sdd/walkthrough/*.png` · driver script: `.superpowers/sdd/walkthrough/run.mjs`

## Scope note — what this pass can and cannot verify

The unprovisioned local env has no database, mailer, payment provider, blob store, or model
key. That draws a hard line through the funnel:

- **Agent-verifiable here:** the guest/marketing surface, client-side form validation, the calm
  failure contract on `/api/check`, the local-only onboarding wizard, auth/pantry gating, and
  support-path reachability.
- **Blocked on provisioning (documented, not driven):** anything behind a session (free-tier
  metering, magic-link signup, Art. 9 consent capture, daily card/streak/week with real data,
  Stripe checkout + entitlement flip, pantry pre-order/claim, photo upload → confirm → report,
  account deletion). These require the provisioned stack from Task 3.1 or a preview deploy and
  the **founder's real-phone pass** (keyboard, camera, autofill). They are listed in the
  **BLOCKED-ON-HUMAN** section, not counted as agent punch-list rows.

Persona: 52, recently diagnosed (A1C 6.1), non-technical, on a phone, anxious, arrived from the
Reddit post.

## Step-by-step (Expected · Observed · Friction · Severity)

| # | Step | Expected | Observed (agent) | Friction | Severity |
|---|------|----------|------------------|----------|----------|
| 1 | Land on `/` | Understands what this is <5s | `h1` = "Should I eat this?"; sub-copy explains the loop and "No login required"; renders instantly at both widths | None | — |
| 2 | Free scan "white rice with chicken" | Calm result <~12s **or** a specific failure message, never a spinner forever | Submit settled in ~1.1s. With the dummy key the model call fails and the route returns the **calm retry card** ("I couldn't produce a safe answer this time… try again with a simpler food description") + disclaimer. Button re-enables — no infinite spinner. Happy-path verdict needs a real key. | Happy path unverifiable locally (no OpenAI key) | minor (env, not defect) |
| 2b | Client-side form guard | Browser checks form before send | Empty submit blocked client-side: "Fix the highlighted fields before submitting." + field error "Enter a food or meal." No network call. | None | — |
| 3 | Repeat to free-tier limit | Limit copy calm, names tomorrow | Not drivable (metering is server-side and signed-in only, needs DB). Copy inspected in `app/api/check/route.ts`: *"You've used today's five free checks. Premium removes the daily limit… or check back in with your first meal tomorrow."* — calm, names tomorrow. | Cannot exercise the cap | BLOCKED-ON-HUMAN |
| 4 | Sign up (magic link) | Email arrives, link works on phone | `/signin` renders with an email field (magic-link entry). Sending/receiving the link needs a mailer + DB adapter. | Cannot send/click the link | BLOCKED-ON-HUMAN |
| 5 | Onboarding: A1C + consent | Copy plain, no dead ends | Onboarding is a **local-only 4-step wizard** (welcome → A1C → expectations → daily loop → finish → home). Walked end-to-end with A1C 6.1; every step advanced, finish redirected to `/`. Out-of-range A1C (7.5) routes to the boundary screen with guidance copy, never a verdict. **Note:** the wizard has *no* Art. 9 consent checkbox — the disclaimer tells the user data "stays on this device unless you create an account." Explicit Art. 9 consent is captured at account creation, which is DB-gated and not exercised here. | Art. 9 consent not in this wizard (by design; verify at signup) | minor (verify server-side) |
| 6 | Daily card / streak / week | Render with real data | Needs signed-in history in DB. Guest home shows the daily-loop shell + "Take the one-minute tour" affordance, no crash. | Real-data render unverifiable | BLOCKED-ON-HUMAN |
| 7 | Nudge opt-in (two-step) | Works; declines gracefully if push unsupported | For a guest with no prior-day check and no premium, the nudge component correctly stays hidden — no crash, graceful. The two-step opt-in itself is gated on signed-in + premium + push support + VAPID keys. | Opt-in flow unverifiable | BLOCKED-ON-HUMAN |
| 8 | Subscribe (Stripe test) | Checkout → entitlement flips → paywall gone | `/subscribe` renders. Checkout session + webhook entitlement flip need Stripe test keys + DB. | Checkout unverifiable | BLOCKED-ON-HUMAN |
| 9 | Pantry pre-order → intake → claim | Payment Link → email → claim → sign-in round-trip | `/pantry/intake` and `/pantry/claim` correctly gate to `signin?callbackUrl=…` (auth required). Full round-trip needs Payment Link + mailer + DB. | Pre-order round-trip unverifiable | BLOCKED-ON-HUMAN |
| 10 | Photos: upload, thumbnails, oversized error+retry | Inline error, retry works | Behind auth + Vercel Blob + DB. | Unverifiable | BLOCKED-ON-HUMAN |
| 11 | Confirm list edit/delete/add | Count updates → confirm | Behind auth + DB. | Unverifiable | BLOCKED-ON-HUMAN |
| 12 | Wait / processing | "Safe to close"; email; link opens report | Behind auth + worker + mailer. | Unverifiable | BLOCKED-ON-HUMAN |
| 13 | Report | "Enjoy freely" first; swaps; Save as PDF; paywall at end | `/report/[id]` is DB-gated. Support copy confirmed present in `app/report/[id]/page.tsx`. | Unverifiable | BLOCKED-ON-HUMAN |
| 14 | Support path | Every error names a next step; support email reachable | Calm retry card (step 2) names a next step. `/terms` exposes `mailto:support@revora.app`; report + pantry intake pages carry the same support address (code-confirmed). `SUPPORT_EMAIL` falls back to `support@revora.app`. | None (agent-reachable surfaces) | — |
| 15 | Account deletion removes pantry data | Verify via `/account` | Behind auth + DB. Deletion path (`/account/delete`) renders its route but the cascade needs a real account. | Unverifiable | BLOCKED-ON-HUMAN |

## Triaged punch-list (agent-verifiable legs)

| ID | Finding | Location | Severity | Owner | Fix-task |
|----|---------|----------|----------|-------|----------|
| W-1 | Mobile footer links render with no separators/spacing — reads as one run-on string "Your weekProgressPrivacyTerms". Same `.page-footer` on `/` and `/onboarding`. | `app/page.tsx` footer + `.page-footer` CSS | **cosmetic** | agent | Add gap/separators to `.page-footer` (flex gap or `·` dividers); re-run step 1 screenshot. |

**Blocking rows: 0. Non-blocking rows: 0. Cosmetic rows: 1.**

No agent-verifiable leg produced a spinner-forever, a dead end, a crash, or a broken gate.
The single cosmetic issue (W-1) does not stop release.

## BLOCKED-ON-HUMAN (needs provisioned stack + founder real-phone pass)

These are **not** defects — they are legs the unprovisioned local env cannot reach. They must be
run against the Task 3.1 provisioned stack (or a preview deploy) with real keys, and the founder
repeats steps 1–13 once on a real phone (keyboard, camera, autofill — 15 min):

1. **Step 2 happy path** — real OpenAI key → calm verdict card with a real risk band, <~12s.
2. **Step 3** — sign in, run 5 checks, confirm the 6th shows the calm cap copy naming tomorrow.
3. **Step 4** — magic-link email arrives and the link opens/authenticates on the phone.
4. **Step 5 (consent)** — confirm Art. 9 consent is captured and recorded at account creation.
5. **Step 6** — daily card, streak chip, week view render with the account's real checks.
6. **Step 7** — two-step nudge opt-in grants and persists a push subscription (VAPID keys set);
   declines gracefully where push is unsupported (real device catches what emulation cannot).
7. **Step 8** — Stripe **test-mode** checkout → webhook flips entitlement server-side → paywall gone.
8. **Step 9** — pantry Payment Link → intake email → claim → sign-in round-trip returns to intake.
9. **Steps 10–13** — 2 real kitchen photos → upload/thumbnails, oversized-photo inline error +
   working retry, confirm-list edit/delete/add, "safe to close" processing, report email + link,
   "Enjoy freely" ordering, Save-as-PDF print preview, paywall only at the end.
10. **Step 15** — delete the account via `/account`; verify pantry data is removed too.

## How this was run

```
OPENAI_API_KEY=sk-test-dummy node_modules/.bin/next dev -p 3100   # unprovisioned local server
node .superpowers/sdd/walkthrough/run.mjs                          # mobile + desktop driver
```

Screenshots (`.superpowers/sdd/walkthrough/`): `01-land-{mobile,desktop}`,
`02-freescan-result-{mobile,desktop}`, `02b-validation-mobile`, `04-signin-mobile`,
`05a..05d-onboarding-*`, `08-subscribe-desktop`, `09-pantry-gate-mobile`.
