# Revora Evidence Pack

## Purpose

The evidence pack is the review surface for every source that can support active
Revora copy. A source is not blanket permission to make stronger product claims.
Each source must be mapped to a narrow allowed use and an explicit do-not-claim
limit.

## Operating Rules

- Prefer official public-health guidance for range interpretation and basic food
  guidance.
- Use peer-reviewed sequencing studies only for narrow qualitative statements.
- Keep product copy weaker than the strongest plausible reading of the source.
- If evidence does not support a precise outcome claim, Revora must stay
  qualitative.

## Planned Source Coverage

- CDC A1C ranges and prediabetes framing
- NIDDK A1C interpretation and confirmation caveat
- CDC meal-planning, healthy-carb, and fiber guidance
- Food-order studies for practical sequencing ideas
- FDA and FTC guidance for health-adjacent claims boundaries

## Evidence Registry

| Evidence ID | Source | Supports | Allowed Use | Do Not Claim | Confidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `CDC-A1C-RANGES` | CDC, A1C Test for Diabetes and Prediabetes | The below-`5.7%`, `5.7%` to `6.4%`, and `6.5%` or above boundary used by the MVP. | State Revora's supported A1C range and explain that below-range and high-range inputs are outside the prediabetes-only MVP boundary. | Do not diagnose the user or imply that one app input confirms a clinical condition. | HIGH | Supports `product-home-hero`, `prompt-a1c-scope`, `below-range-route`, and `high-range-route`. |
| `NIDDK-A1C-INTERPRETATION` | NIDDK, The A1C Test & Diabetes | A1C interpretation and the confirmation caveat for diagnosis. | Say that `6.5%` or above falls in a range used for diabetes and direct the user to a doctor or registered dietitian for personalized guidance. | Do not say the user has diabetes or imply that Revora confirms diagnosis. | HIGH | Keeps high-range routing informational instead of diagnostic. |
| `CDC-MEAL-PLANNING` | CDC, Diabetes Meal Planning | Carbs raise blood sugar, and pairing carbs with protein, fat, or fiber can slow the rise. Plate-method style balancing is reasonable. | Explain that adding protein, nonstarchy vegetables, or fiber can make a carb-heavy meal more balanced or lower impact. | Do not promise a precise spike reduction or use the source as proof of treatment. | HIGH | Safe for result reasoning, swap framing, and launch copy that mentions cautious meal guidance. |
| `CDC-HEALTHY-CARBS` | CDC, Choosing Healthy Carbs | Less processed carbs and fiber-rich carbs generally have a lower blood-sugar impact than highly refined sugary options. | Suggest less refined carb choices or pairing carbs with protein or fat when Revora gives a swap or adjustment. | Do not assign exact GI, exact GL, or a personalized carb target. | HIGH | Supports qualitative swap language only. |
| `CDC-FIBER-GUIDANCE` | CDC, Fiber: The Carb That Helps You Manage Diabetes | Fiber-rich foods can support a more balanced blood-sugar response and do not behave like fast-acting simple carbs. | Say that fiber-rich additions can help make a meal slower-impact or more balanced. | Do not claim guaranteed prevention, reversal, or exact glucose control outcomes. | HIGH | Supports qualitative add-fiber framing without numeric claims. |
| `SHUKLA-FOOD-ORDER` | Shukla et al., A Randomized Controlled Pilot Study of the Food Order Behavioral Intervention in Prediabetes | Food order, especially protein-rich food and nonstarchy vegetables before concentrated carbs, may reduce post-meal excursions in prediabetes. | Offer an optional sequencing cue such as eating protein or nonstarchy vegetables before concentrated carbs when the meal already includes them. | Do not claim a universal response, exact reduction, or A1C improvement from one tactic. | MEDIUM | Use sparingly and only as practical meal-order guidance. |
| `IMAI-VEGETABLES-FIRST` | Imai et al., Eating Vegetables Before Carbohydrates Improves Postprandial Glucose Excursions | Vegetables-first ordering can be directionally supportive in controlled settings. | Offer vegetables first as an optional sequencing hint when vegetables are already part of the meal. | Do not imply that vegetables first fixes a high-impact meal or works identically for every person. | MEDIUM | Narrow support for sequencing language, not for outcome guarantees. |
| `FDA-GENERAL-WELLNESS` | FDA, General Wellness: Policy for Low Risk Devices | Health-adjacent products should stay in a general-wellness-style lane when they are not making disease-treatment claims. | Keep Revora framed as informational meal guidance and non-medical support rather than diagnosis or disease treatment. | Do not claim FDA approval, FDA clearance, or regulated-device status for the MVP. | HIGH | Supports the informational-only product, result footer, and launch boundary. |
| `FTC-HEALTH-COMPLIANCE` | FTC, Health Products Compliance Guidance | Health claims need substantiation, and disclaimers do not repair stronger contradictory claims. | Keep product and launch copy narrower than the available evidence and avoid unsubstantiated outcome promises. | Do not claim clinical proof, guaranteed results, or rely on a disclaimer to excuse disease claims. | HIGH | Supports copy review discipline and the launch-copy boundary. |
| `CDC-DKA-GUIDANCE` | CDC, Diabetic Ketoacidosis (DKA) | The symptom set that requires urgent care rather than food guidance: vomiting, inability to keep fluids down, confusion, difficulty breathing, fruity breath. | Route a user reporting these symptoms away from any meal verdict and toward urgent care or their local emergency number. | Do not name a condition, do not tell the user what is happening to them, and do not offer any food, fluid, or medicine instruction. | HIGH | Supports `clinical-urgent-symptoms`. Revora states only that the symptoms need a clinician; it never asserts the user has DKA. |
| `NIDDK-HYPOGLYCEMIA` | NIDDK, Low Blood Glucose (Hypoglycemia) | That suspected low blood glucose is handled by the plan a clinician has already given the user, and that severe or worsening symptoms need urgent help. | Tell a user reporting low-blood-sugar symptoms to follow the plan their doctor gave them and to seek urgent help if it worsens. | Do not recommend a specific food, a carbohydrate amount, or any number; do not say the user is having a hypoglycemic episode. | HIGH | Supports `clinical-possible-hypoglycemia`. Revora deliberately gives NO food instruction here — naming a fast carb would be dosing advice. |
