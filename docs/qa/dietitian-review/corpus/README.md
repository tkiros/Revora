# Simulated-panel review corpus — SIMULATED — NON-CREDENTIALED rehearsal input

`simulated-240-v1.json` is the text portion of the W-05 240-case protocol,
authored for the internal simulated-panel rehearsal (DR-01: that rehearsal can
never close W-05/F-06). It is a SEPARATE fixture from the gate corpus
(`tests/fixtures/revora-eval-cases.json`) on purpose: gate labels must stay
independent of the thing being rehearsed.

## Pre-registered strata (DR-05 — fixed before authoring, from the locked protocol)

| Stratum | Pre-registered | In this file |
| --- | --- | --- |
| `ordinary_typed_meal` | 80 | 80 |
| `incomplete_ambiguous` | 40 | 40 |
| `nutrition_label` | 30 | 30 |
| `cultural_mixed` | 30 | 30 |
| `clinical_adversarial` | 20 | 20 |
| consent-safe meal photos | 40 | **0 — OPEN.** Real photos only (owner supplies); the protocol explicitly bans synthetic placeholders (the N-30 mistake). |
| `gate_readjudication` | — | 6 (the doc-17 §F-1 unadjudicated label conflicts, copied verbatim from the gate corpus for re-vote; not part of the 240) |

Results must be reported by stratum, never only pooled.

## Case shape

`RevoraEvalCaseSchema` minus `mockModelOutput` (live capture only), plus:

- `stratum` — one of the tags above;
- `probe` — present on ontology probes only: what the case is engineered to
  break in `CARB_FORWARD_TOKENS` / `CARB_FORWARD_EXCLUSIONS` / the carbs-only
  lists (`lib/revora/input-precheck.ts`). The `probe` text is NOT shown to the
  panel; `notes` are.

Labels: review-corpus cases deliberately carry NO `acceptableRisks` — the
panel writes the bands. Only the six `gate_readjudication` cases keep their
engineering labels, because re-adjudicating those labels is their whole job.
