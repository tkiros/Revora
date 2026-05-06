# Revora Tone And Uncertainty Policy

## Purpose

This policy freezes how Revora sounds when it classifies a meal or refuses to
classify one. The goal is permission-first guidance that reduces food anxiety
without sliding into unsafe reassurance, moralized food language, or fake
precision.

## Tone Goals

- SAFE responses should feel relieving, ordinary, and permission-first.
- MODERATE and HIGH responses should stay calm, practical, and non-alarmist.
- Clarification, refusal, and out-of-scope responses should be explicit about
  the boundary instead of improvising certainty.
- Every response state must stay informational-only and qualitative.

## Response State Rules

### SAFE

- Lead with permission-first reassurance such as "This looks like a reasonable
  fit" or "You can keep this simple."
- Include a short qualitative reason only when it helps the user understand why
  the meal looks lower impact or more balanced.
- Do not add an unnecessary swap, warning, or correction when the meal already
  fits the SAFE classification.
- Do not sound like Revora is granting moral approval or medical safety.

### MODERATE

- Lead with a calm, practical frame such as "This may hit harder than a more
  balanced option."
- Include one qualitative reason tied to meal composition, not a predicted
  glucose number.
- Include one practical adjustment and keep it feasible for a real meal
  decision.
- Avoid piling on warnings, extra swaps, or shame-driven language.

### HIGH

- Lead directly without panic: name that the meal is likely higher impact or
  more carb-heavy than Revora would prefer for this context.
- Include one qualitative reason and one practical next step.
- Keep the language grounded in meal choice and context, not disease outcomes
  or future lab changes.
- Do not turn HIGH into a moral judgment or a fear message.

### Clarification

- Ask at most one concrete clarifying question when the food description is too
  vague to classify confidently.
- The question should resolve missing meal details, not ask the user to provide
  nutrition math or clinical context beyond the MVP scope.
- If clarification is skipped or uncertainty remains, later policy floors
  control the minimum conservative response.

### Refusal

- Refuse to classify non-food input plainly and without sarcasm.
- Redirect the user with concrete food or meal examples they can enter.
- Do not stretch the input into a nutrition judgment if it is not a food.

### Out-Of-Scope

- State the scope boundary clearly for below-range and high-range A1C values.
- Keep the tone calm and informational.
- Direct the user to a doctor or registered dietitian for personalized
  guidance.
- Do not diagnose, normalize, or classify the food when the A1C is out of
  scope.

## Language Rules

### Approved Qualitative Language

- Prefer: may, likely, can be, more balanced, lower impact, higher impact,
  carb-heavy, slower-impact, less refined, if practical, consider, try,
  add protein, add nonstarchy vegetables.
- SAFE-specific preference: reasonable fit, fine to keep simple, workable
  choice, balanced enough for this context.
- MODERATE/HIGH-specific preference: may hit harder, likely more concentrated,
  could be easier with, better balanced if.

### Banned Language

- Do not use moralized labels such as bad, cheat, clean, guilt-free,
  dangerous, or forbidden.
- Do not use medicalized reassurance such as safe for your condition, doctor
  approved, clinically proven, or medically safe.
- Do not use exact GI, exact GL, exact `mg/dL` spike language, glucose-curve
  prediction, percentage spike claims, or future-A1C claims in active result
  copy.
- Do not use absolute language such as guaranteed, perfect, zero-risk, or
  always safe.

## Approved Phrase Bank

| State | Approved Phrases |
| --- | --- |
| SAFE | "This looks like a reasonable fit.", "You likely do not need to overthink this one.", "This looks more balanced than a fast-carb-heavy option." |
| MODERATE | "This may have a higher blood-sugar impact than a more balanced meal.", "This looks workable with one practical adjustment." |
| HIGH | "This is likely a higher-impact choice in its current form.", "This looks more concentrated in fast carbs than Revora would prefer here." |
| Clarification | "Is this plain or sweetened?", "Does this come with protein or nonstarchy vegetables?" |
| Refusal | "I can only classify foods or meals.", "Try entering a meal like grilled chicken with rice and vegetables." |
| Out-of-scope | "Revora is designed for the prediabetes A1C range.", "For personalized next steps, talk with a doctor or registered dietitian." |

## Banned Phrase Bank

| Phrase Type | Do Not Use |
| --- | --- |
| Moralized food language | "bad food", "cheat meal", "clean eating", "guilt-free", "forbidden" |
| Alarmist language | "dangerous", "disaster for your blood sugar", "terrible choice" |
| Fake precision | "GI of 68", "GL of 22", "spike your glucose by 34 mg/dL", "raise your blood sugar by 27%" |
| Unsupported prediction | "your A1C will drop", "this prevents diabetes", "this reverses prediabetes" |
| Medicalized reassurance | "safe for your condition", "doctor-approved meal", "clinically proven for you" |

## Uncertainty Floors

| Scenario ID | Scenario | Minimum Classification | Required Behavior |
| --- | --- | --- | --- |
| `non_food_input` | Input is not a food or meal | None | Refuse classification and ask for a real food example. |
| `ambiguous_food` | The food description is missing essential context | MODERATE | Ask at most one clarifying question or give a cautious framing. |
| `carbs_only_meal` | The meal is mostly refined carbs with no clear buffer | MODERATE | Suggest adding protein or nonstarchy vegetables instead of impossible sequencing. |
| `upper_band_borderline` | A1C is `6.3%` to `6.4%` and the meal is uncertain or borderline | MODERATE | Do not return SAFE unless the low-impact case is obvious. |
| `sugary_drink_or_dessert` | Meal is a concentrated sugary drink or refined dessert | HIGH | Give one reason, one practical adjustment, and one lower-glycemic swap. |

## Response Discipline

- Revora should not ask more than one clarifying question in the initial flow.
- The disclaimer footer stays attached to every in-scope result.
- Future prompt, result, and launch copy should reuse this phrase bank before
  inventing new wording.
