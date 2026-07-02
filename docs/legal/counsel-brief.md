> **Status note (2026-07-01, full build 4B):** the posture change has landed —
> accounts (email magic-link), server-side history, subscription billing, and
> an opt-in daily push now ship. A1C + meal text are stored **encrypted at
> rest (AES-256-GCM)** only after an explicit consent checkbox; deletion is
> in-app plus a public URL. `/privacy`, `docs/privacy/data-flow.md`, and the
> Play Data Safety mapping were updated in the same PR (the lockstep rule).
> Questions 5–9 below are NEW and arise from this change and from the launch
> plan (`docs/production-implementation-plan-2026-07-01.md` §7 B1).

# Revora — Legal Counsel Brief (Phase 4 · Task 4.4)

> **Status: OPEN — NON-CODE GATE.** This is a legal question, not an engineering
> task. Per the stakeholder decision (Blocker **B5**), counsel review runs **in
> parallel** and is **not** a hard pre-launch gate: the informational-only PWA
> may launch with enforced disclaimers and the kill-switch armed. Counsel must,
> however, conclude **before any benefit-implying marketing**. Do not implement
> anything from this document.

## Why counsel is engaged

Revora gives condition-specific (prediabetes-range A1C) dietary guidance to a
self-identified at-risk audience. That sits near two regulated edges — FDA
software-as-a-medical-device (SaMD) and FTC health-claim substantiation — even
though the product is positioned as informational-only.

## Questions for counsel

1. **FDA SaMD classification.** Does informational-only, qualitative food
   guidance keyed to a user-entered A1C band (5.7–6.4%) fall inside or outside
   the medical-device definition? What, if anything, would push it across the
   line (e.g., numeric glucose prediction, treatment framing)?
2. **FTC substantiation.** The MVP makes no benefit/outcome claim. Confirm that
   the current informational-only copy needs no clinical substantiation, and
   identify which future claims (any "lower/reverse/prevent" framing) would
   trigger a substantiation duty.
3. **Disclaimer + positioning adequacy.** Is the single contract disclaimer
   ("informational only … not medical advice … talk with a doctor or registered
   dietitian") adequate for the public, no-account, no-storage MVP, and is its
   placement (every result surface + the `/privacy` page) sufficient?
   - **Known divergence:** the middleware pause / rate-limit responses (HTTP
     503/429) carry the short disclaimer `"Not medical advice."` rather than the
     full contract disclaimer, because middleware runs on the Edge runtime and
     cannot read the contract file (`loadSafetyContract` uses `node:fs`). Please
     confirm the short form is acceptable for these transient, no-classification
     states.
4. **Parallel-launch risk.** Confirm the residual regulatory risk of launching
   informational-only while review is ongoing is understood and acceptable, and
   flag any condition that should hard-block launch.
5. **Longitudinal insights & SaMD (NEW).** The app now derives rule-based
   patterns from a user's tracked meal history ("Most of your 'be careful'
   meals are breakfast — that's where one swap helps most this week"). An
   adversarial internal review rated this closer to the device line than the
   one-shot check. Does personalized longitudinal insight over stored health
   data change the SaMD analysis? (If flagged, the insight surface is
   feature-flagged via launch-controls without touching the rest.)
6. **GDPR Art. 9 consent wording (NEW).** A1C is special-category health
   data. Review/approve the explicit-consent checkbox wording used at account
   setup (marked `COUNSEL-DRAFT` in `app/welcome/page.tsx`): storage purpose,
   encryption, revocability via deletion. US-only launch is the default, but
   the consent structure is built to GDPR standard.
7. **Refund-policy adequacy (NEW).** Subscriptions via Google Play Billing
   (primary) + Stripe web fallback. Review the refund stance in
   `docs/ops/support-playbook.md` for FTC/negative-option and Play-policy
   adequacy, including the frictionless-cancellation path.
8. **The three "reversal" lines (NEW).** `Revora_Brand_Positioning_v2.md`
   L240/287/295 contain app-as-agent "reversal" phrasings. Product copy uses
   only the user-as-agent line ("Reversal is achieved through your dietary
   choices — Revora gives you the clarity to make them."). Rewrite or kill the
   three flagged lines; confirm the user-as-agent line is the ceiling.
9. **Imaging input & SaMD (forward-looking only — NEW).** A photo-assist
   input (vision model drafts a meal description; the user must confirm every
   class-critical detail before the unchanged text engine judges) is fully
   specified but NOT built. What would push an imaging input across the SaMD
   line? This answer gates any future build (plan §6.3); nothing ships now.

## Homework already done (provide to counsel)

- `docs/safety/claims-boundary.md` — the enforced product/prompt/result/launch
  copy boundary and the **Banned Claim Families** list.
- `docs/safety/evidence-pack.md` — evidence basis for the qualitative guidance.
- `docs/privacy/data-flow.md` + the public `/privacy` page — the data posture
  (meal text + A1C → OpenAI Responses API, `store: false`, no Revora retention,
  honest provider abuse-log caveat).
- `docs/safety/a1c-band-rubric.md`, `docs/safety/tone-uncertainty-policy.md` —
  how risk bands and tone are constrained.

## What the codebase already enforces (so counsel can rely on it)

- **No banned claims in user-facing copy** — automated audit
  `tests/unit/revora/claims-boundary-copy.test.ts` fails CI on any
  diagnose/treat/cure/prevent/reverse/FDA/guarantee/future-lowering match
  outside the disclaimer.
- **Disclaimer on every response** — `tests/unit/revora/disclaimer-presence.test.ts`
  locks the single contract disclaimer onto every response kind.
- **Informational-only, qualitative** — no numeric glucose/GI/GL/future-A1C
  output (safety-contract fixture + eval tests).
- **Privacy, stateful posture (updated 4B)** — guests: nothing stored;
  accounts: A1C + meal text encrypted at rest (AES-256-GCM), consent-gated,
  owner-scoped reads (cross-user 401/403 tested), cascade deletion with a
  public URL; raw food/A1C/email excluded from logs, Sentry, and analytics by
  automated tests (`privacy-stateful.test.ts`, `sentry-scrub.test.ts`);
  `store: false` still on every model call.

## Acceptance

- Written counsel opinion on file (attach or link here when received).
- Any counsel-required copy change flows through `docs/safety/copy-ledger.md`
  (the approved-copy source of truth), not ad hoc edits.
- Counsel sign-off recorded before any benefit-implying marketing.
