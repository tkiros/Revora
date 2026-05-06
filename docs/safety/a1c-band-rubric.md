# Revora A1C Band Rubric

## Purpose

This rubric gives downstream plans a deterministic A1C routing contract before
prompt logic is implemented. These routes define product scope and conservative
handling. They do not diagnose the user.

## Route Table

| Route ID | A1C Band | Scope | Minimum Behavior | Must Not Say |
| --- | --- | --- | --- | --- |
| `below_prediabetes_range` | Below `5.7%` | Out of scope | Use `responseKind: out_of_scope_below`. Explain that Revora is designed for the prediabetes A1C range of `5.7%` to `6.4%` and should not classify the food or meal as SAFE, MODERATE, or HIGH. | Do not say the user is normal, low risk, or cleared to eat the meal. |
| `prediabetes_57_59` | `5.7%` inclusive to below `6.0%` | In scope | Use the `prediabetes_57_59` band for classification and keep guidance qualitative. | Do not imply exact physiology or personalized glucose forecasting. |
| `prediabetes_60_62` | `6.0%` inclusive to below `6.3%` | In scope | Use the `prediabetes_60_62` band for classification and apply more caution to borderline carb-containing meals. | Do not predict future A1C change or exact glucose effects. |
| `prediabetes_63_64` | `6.3%` inclusive to below `6.5%` | In scope | Use the `prediabetes_63_64` band for classification and avoid overly reassuring SAFE output for borderline foods. | Do not act like Revora can personalize exact physiology from one A1C input. |
| `diabetes_range_out_of_scope` | `6.5%` and above | Out of scope | Use `responseKind: out_of_scope_high`. Explain that this value is in the range clinicians use when evaluating Type 2 diabetes and direct the user to a doctor or registered dietitian instead of classifying the food. | Do not say the user has diabetes or claim Revora can evaluate the meal safely in this range. |

## Scope Notes

- A1C routing happens before any food classification.
- Out-of-scope routes short-circuit the classifier and return boundary guidance
  only.
- The route id names are product policy ids, not clinical labels.

## Approved Out-Of-Scope Guidance

### Below `5.7%`

Use wording equivalent to:

> Revora is designed for the prediabetes A1C range of `5.7%` to `6.4%`. This
> value sits below that range, so Revora should not classify this food or meal.
> Talk with a doctor or registered dietitian for guidance that is specific to
> you.

### `6.5%` And Above

Use wording equivalent to:

> This A1C value falls in the range clinicians use when evaluating Type 2
> diabetes, so it is outside Revora's prediabetes-only scope. Revora should not
> classify this food or meal. For personalized next steps, talk with a doctor
> or registered dietitian.

## In-Scope Calibration Levels

Higher in-scope bands increase conservatism, but they do not turn Revora into a
precise physiology model.

| Band | Conservatism Level | Guidance Effect |
| --- | --- | --- |
| `prediabetes_57_59` | Standard conservatism | SAFE, MODERATE, and HIGH remain available when the food evidence is clear, but borderline foods should still avoid casual reassurance. |
| `prediabetes_60_62` | Elevated conservatism | Borderline foods should lean away from SAFE and toward MODERATE unless the meal is clearly low impact. |
| `prediabetes_63_64` | High conservatism | Upper-band caution applies: uncertain carb-containing meals cannot return SAFE, and borderline foods should default to MODERATE rather than reassuring SAFE. |

## Conservative Floors

- Upper-band A1C plus an uncertain carb-containing meal cannot return SAFE.
- Clearly low-impact foods may still return SAFE in any in-scope band when the
  food evidence is clear and the explanation stays permission-first.
- Borderline foods should move to MODERATE rather than use reassuring SAFE copy.
- The same food can become equally cautious or more cautious as A1C increases,
  but never more reassuring because of a higher A1C band.

## Example Calibration Rows

| A1C Band | Example Food | Expected Classification Shape | Why |
| --- | --- | --- | --- |
| `5.7%` to `5.9%` | Sweetened oatmeal with banana and an unclear portion | `MODERATE` at minimum | This is a borderline carb-containing meal, so standard conservatism still avoids a casual SAFE. |
| `6.0%` to `6.2%` | Sweetened oatmeal with banana and an unclear portion | `MODERATE` with less reassuring language than the lower band | Elevated conservatism keeps the same borderline meal from sounding safer as A1C rises. |
| `6.3%` to `6.4%` | Sweetened oatmeal with banana and an unclear portion | `MODERATE` and never SAFE while uncertainty remains | High conservatism blocks reassuring SAFE output for the same borderline meal in the upper band. |
| `6.3%` to `6.4%` | Egg scramble with nonstarchy vegetables | `SAFE` is still allowed with permission-first reassurance | Clearly low-impact foods can still receive SAFE when the evidence is strong and the explanation stays qualitative. |

## Precision Limits

- Do not predict exact `mg/dL` changes, exact glucose curves, or future A1C
  changes from these bands.
- Do not treat `6.1` versus `6.2` as precise personalization. Both sit inside
  the same broad conservatism bucket.
- Use A1C bands only to calibrate caution, not to imply Revora knows exact
  metabolic response.
