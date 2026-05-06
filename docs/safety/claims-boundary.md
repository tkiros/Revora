# Revora Claims Boundary

## Purpose

This document is the Phase 1 source of truth for what Revora may say in product
copy, prompt copy, result copy, and launch copy. It exists to keep every active
surface inside one Informational-only boundary before any model or UI behavior
expands.

## Current Product Boundary

- Revora is a permission-first food checker for people using an A1C in the
  prediabetes range of `5.7%` to `6.4%`.
- Revora provides informational-only food guidance, not diagnosis or medical
  treatment.
- Revora must stay qualitative when it talks about blood-sugar impact.
- Any copy outside this boundary is out of scope for the MVP.

## Allowed Claim Classes

| Claim Class | Applies To | Allowed Language | Not Allowed Yet | Notes |
| --- | --- | --- | --- | --- |
| `product-role` | Product copy | Describe Revora as informational-only food guidance for people using a prediabetes-range A1C. | Claims that Revora diagnoses, treats, prevents, cures, or reverses prediabetes or diabetes. | Use this for hero copy, product summary copy, and feature labels. |
| `prompt-scope` | Prompt and intake copy | Explain that Revora checks a food or meal using an A1C in the `5.7%` to `6.4%` range. | Broad screening, wellness, or disease-management promises. | Prompt copy should explain input scope, not make clinical promises. |
| `result-qualitative-impact` | Result body copy | Use qualitative descriptions such as lower impact, more balanced, carb-heavy, or likely higher impact. | Exact glucose-curve prediction, future-A1C prediction, exact GI, exact GL, or exact `mg/dL` spike claims. | Result language can explain why a meal is classified but must stay non-numeric. |
| `result-adjustment` | Result suggestions | Offer one practical, food-level adjustment or swap such as adding protein, adding nonstarchy vegetables, or picking a less refined option. | Treatment plans, dosing, medication language, or guaranteed outcome claims. | Adjustments stay at the meal-choice level. |
| `out-of-scope-routing` | Below-range and high-range routes | Explain that Revora is built for prediabetes-range A1C values and direct the user to clinician guidance when the input is outside scope. | Saying the user is normal, saying the user has diabetes, or offering a SAFE, MODERATE, or HIGH result outside scope. | Out-of-scope routes explain the boundary without diagnosing. |
| `launch-informational` | Launch, founder, and community copy | Describe Revora as a cautious MVP for informational meal decisions in the prediabetes range. | Unsupported clinical proof, FDA approval or clearance, doctor endorsement, or disease-outcome guarantees. | Launch copy must not imply the MVP is medically validated. |
| `disclaimer-footer` | Result footer | Repeat one stable informational-only disclaimer that sends users to a doctor or registered dietitian for personalized guidance. | Any wording that dilutes the boundary or promises personalized medical safety. | Use the same footer on all in-scope result states. |

## Banned Claim Families

- Diagnosis or screening claims
- Treatment, prevention, cure, or reversal claims
- Future A1C prediction claims
- Glucose-curve prediction claims
- Exact `mg/dL` spike prediction claims
- Exact GI or GL number claims
- FDA approval or clearance claims
- Unsupported clinical proof or clinical-outcome guarantee claims

## Reusable Disclaimer

Use one result-footer disclaimer across active result surfaces so downstream plans
inherit the same boundary:

> Revora is informational only and is not medical advice. Talk with a doctor or
> registered dietitian for guidance that is specific to you.

This disclaimer does not expand the allowed claim boundary. It only reinforces
that Revora is not a source of personalized medical advice.

## Out-Of-Scope Routes

### Below the Supported Range

When the entered A1C is below `5.7%`, Revora should explain that the MVP was
designed for prediabetes-range food decisions and should not present a SAFE,
MODERATE, or HIGH classification.

Approved route wording:

> Revora is designed for the prediabetes A1C range of `5.7%` to `6.4%`. This
> value sits below that range, so use a doctor or registered dietitian for
> guidance that is specific to you.

### Above the Supported Range

When the entered A1C is `6.5%` or above, Revora should state that the value is
outside the MVP boundary and direct the user to a doctor or registered
dietitian for personalized guidance without diagnosing the user.

Approved route wording:

> This A1C value falls in a range used for diabetes and is outside Revora's
> prediabetes-only MVP. For personalized next steps, talk with a doctor or
> registered dietitian.
