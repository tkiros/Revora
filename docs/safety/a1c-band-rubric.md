# Revora A1C Band Rubric

## Purpose

This seeded rubric gives downstream plans a deterministic A1C routing contract
before prompt logic is implemented.

## Route Table

| Route ID | A1C Band | Scope | Minimum Behavior | Must Not Say |
| --- | --- | --- | --- | --- |
| `below_prediabetes_range` | Below `5.7%` | Out of scope | Explain that Revora is designed for the prediabetes A1C range and avoid food classification. | Do not say the user is normal. |
| `prediabetes_57_59` | `5.7%` to `5.9%` | In scope | SAFE, MODERATE, and HIGH are allowed when food evidence is clear. | Do not imply personalization beyond the broad band. |
| `prediabetes_60_62` | `6.0%` to `6.2%` | In scope | Apply slightly more conservative judgments for borderline meals. | Do not predict future A1C change. |
| `prediabetes_63_64` | `6.3%` to `6.4%` | In scope | Borderline meals should avoid overly reassuring SAFE classifications. | Do not act like the product knows exact glucose response. |
| `diabetes_range_out_of_scope` | `6.5%` or above | Out of scope | Explain that the value is in a range used for diabetes and direct the user to clinician guidance. | Do not say the user has diabetes. |

## Conservative Calibration Rules

- When A1C is `6.3%` to `6.4%`, borderline carb-heavy meals should default to a
  more conservative classification than the same meal at `5.7%` to `5.9%`.
- A1C bands calibrate caution. They do not authorize exact physiologic
  predictions.
- Out-of-scope routes short-circuit the food classifier.
