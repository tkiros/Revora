# 10 — Claims & Safety Audit (2026-07-10)

Method: read `docs/safety/claims-boundary.md` (approved policy), `docs/safety/copy-ledger.md`
(approved copy registry with claim classes + evidence sources), then verified (a) enforcement
in code/tests and (b) absence of banned language in user-facing surfaces.

## Governance already in place (verified EXECUTED)

- **Approved claims policy exists**: claims-boundary.md defines allowed claim classes
  (product-role, prompt-scope, result-qualitative-impact, …) and banned families
  (diagnosis, treatment/prevention/cure/reversal, future-A1C, glucose-curve, exact mg/dL,
  exact GI/GL, FDA, clinical-proof claims).
- **Copy ledger**: every active copy string has an ID, claim class, approval status, and
  evidence source (CDC/NIDDK/FDA-wellness/FTC references).
- **Code enforcement**: approved copy is loaded from the safety contract
  (`lib/revora/safety-contract.ts` + `tests/fixtures/safety-contract.json`) — the model
  prompt itself embeds the claims boundary; forbidden predictions are prompt-banned and
  contract-validated. Tests green this run: `claims-boundary-copy.test.ts`,
  `disclaimer-presence.test.ts`, `schemas.test.ts`, safety eval (48-case corpus).
- **Server-added disclaimer** on every result path: "Revora is informational only and is
  not medical advice. Talk with a doctor or registered dietitian for guidance that is
  specific to you."

## Claim audit table (delta — full registry lives in docs/safety/copy-ledger.md)

| Claim ID | Wording (exact) | Location | Supporting feature | Test | Risk | Status |
|---|---|---|---|---|---|---|
| product-home-hero | "Revora gives informational-only food guidance for people using a prediabetes-range A1C of 5.7% to 6.4%." | home/product copy + model prompt | scope routing (`a1c.ts`) | claims-boundary-copy.test.ts | P0 if breached | PASS |
| result-footer | informational-only disclaimer (above) | every result | `fallback.ts`/`postprocess.ts` add server-side | disclaimer-presence.test.ts | P0 | PASS |
| Verdict language | qualitative only (SAFE/MODERATE/HIGH + one-sentence reason) | result card | postprocess one-sentence + qualitative rules | postprocess.test.ts, live bake-off (0 numeric-claim leaks observed in sampled raw outputs) | P0 | PASS |
| Out-of-scope routing | below 5.7 / above 6.4 → clinician-direction message, never a verdict | check flow | `routeA1C` short-circuit **before model** | a1c.test.ts, eval corpus out_of_range (5 cases, deterministic) | P0 | PASS |
| Trial wall copy | "…card required, unlimited everything, and we email you before any charge…" | `/api/check` 402 | trial-precharge cron + emails | trial-precharge.test.ts, billing tests | P1 (FTC negative-option accuracy) | PASS in code; **precharge email delivery in production is MANUAL VERIFICATION REQUIRED** |

## Banned-language sweep of user-facing surfaces

`grep -riE "(reverse|reversal|prevent|cure|treat|diagnos|guarantee|clinically proven|lower your a1c)"`
over `app/`, `components/`, `marketing/`: **no banned claim language found** (only
`event.preventDefault()` code matches).

## Flags for human review

1. **Internal "Legal North Star" wording** (PRODUCT.md): *"Reversal is achieved through
   your dietary choices — Revora gives you the clarity to make them."* This is internal
   positioning and does NOT appear in any user-facing surface (verified). But it sits one
   copy-paste away from a banned reversal claim. → Keep it out of marketing surfaces;
   counsel-brief review recommended. Owner: product + legal.
2. **Model-output drift**: the engine's qualitative-only rule is enforced by prompt +
   postprocess, and the live bake-off (2 runs, 2 models, 96 live calls) produced **zero**
   harmful-SAFE results and zero observed numeric glycemic claims in delivered responses.
   This is sample-limited (24 model-reaching cases/run); the graded live gate
   (`npm run eval:revora:live`) should stay a release blocker.
3. **No emergency-symptom escalation path exists** ("my CGM says 52", "I feel shaky"):
   the text precheck routes non-food/ambiguous input to refusal/clarify, and out-of-scope
   A1C routes to clinician-direction copy, but there is **no dedicated acute-symptom
   detection**. Input is a *food name* field (160 chars), which bounds the exposure, and
   free-text health questions are not a supported surface. → Documented as a known
   limitation; if a chat/coach surface ever accepts free-text health questions, an
   escalation policy must be authored first (see `docs/qa/05-known-risks-and-blockers.md`).
   **DRAFT policy is NOT created here because the constrained input surface makes it
   out-of-scope for MVP — flagged for clinician review instead.**

## Verdict

Claims/copy boundaries: **PASS** — no unapproved medical claims found on any user-facing
surface; enforcement is code-level and test-covered, not aspirational.
