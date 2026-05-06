# Revora Claims Boundary

## Purpose

This document is the Phase 1 source of truth for what Revora may say in product
copy, prompt copy, result copy, and launch copy. It exists to keep every active
surface inside one informational-only boundary before any model or UI behavior
expands.

## Current Product Boundary

- Revora is a permission-first food checker for people using an A1C in the
  prediabetes range.
- Revora provides informational-only food guidance, not diagnosis or medical
  treatment.
- Revora must stay qualitative when it talks about blood-sugar impact.
- Any copy outside this boundary is out of scope for the MVP.

## Allowed Claim Classes

| Claim Class | Applies To | Allowed Language | Not Allowed Yet | Notes |
| --- | --- | --- | --- | --- |
| `product-role` | Product and launch copy | Describe Revora as informational-only guidance for prediabetes-range meal decisions. | Disease outcomes, diagnosis, or reversal wording. | Expanded and locked in Task 1. |
| `prompt-scope` | Intake prompt copy | Explain the supported A1C range and what input Revora needs. | Broad wellness promises or unsupported screening claims. | Must remain narrow and explicit. |
| `result-qualitative-impact` | Result body copy | Use qualitative descriptions such as lower impact, more balanced, or carb-heavy. | Exact spike, GI, GL, or future A1C language. | Must match the evidence pack. |
| `result-adjustment` | Result suggestions | Offer one practical meal adjustment or swap when the rubric allows it. | Treatment plan, dosing, or guaranteed outcomes. | Adjustment copy is still qualitative. |
| `out-of-scope-routing` | Below-range and high-range routes | Explain that Revora is designed for a narrower A1C range and point to clinician guidance when needed. | Saying the user is normal or has diabetes. | Final wording is locked in Task 1. |
| `launch-informational` | Founder posts and launch blurbs | Describe Revora as a cautious, informational MVP. | Clinical proof, FDA status, or disease claims. | Must stay aligned with approved copy ledger rows. |
| `disclaimer-footer` | Result footer | Remind users to consult a doctor or registered dietitian for personalized guidance. | Any wording that weakens the informational-only boundary. | Final reusable disclaimer is locked in Task 1. |

## Banned Claim Families

- Diagnosis or screening claims
- Treatment, prevention, cure, or reversal claims
- Future A1C prediction claims
- Glucose-curve or exact spike prediction claims
- Exact GI or GL number claims
- FDA approval, clearance, or unsupported clinical proof claims

## Reusable Disclaimer

Use one result-footer disclaimer across active result surfaces so downstream plans
inherit the same boundary:

> Revora is informational only and is not medical advice. Talk with a doctor or
> registered dietitian for guidance that is specific to you.

## Out-Of-Scope Routes

### Below the Supported Range

When the entered A1C is below the prediabetes range, Revora should explain that
the MVP was designed for prediabetes-range food decisions and should not present
a SAFE, MODERATE, or HIGH classification.

### Above the Supported Range

When the entered A1C is in the diabetes range, Revora should state that the
value is outside the MVP boundary and direct the user to a doctor or registered
dietitian for personalized guidance without diagnosing the user.
