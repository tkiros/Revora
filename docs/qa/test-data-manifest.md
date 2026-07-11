# Test Data Manifest (2026-07-10)

All fixtures are synthetic, project-owned, and consent-safe. No real user data, no
copyrighted or personal images, no production database contents.

| Asset | Path | Contents | Used by |
|---|---|---|---|
| Safety/engine eval corpus (FROZEN) | `tests/fixtures/revora-eval-cases.json` | 48 cases, 9 categories (clearly_safe, borderline, high_risk, non_food, ambiguous, carbs_only, out_of_range_a1c, prompt_injection, adversarial); each: id, category, input{food,a1c}, harmfulIfSafe, expectedKinds, disallowRisk, optional acceptableRisks+labelSource (domain-authored), mockModelOutput, notes | `npm run test`, `eval:revora`, `eval:revora:live`, `eval:model-bakeoff*` |
| Safety contract | `tests/fixtures/safety-contract.json` | forbidden claims/predictions, A1C routes, qualitative-only rules, uncertainty floors, approved copy | engine at runtime + tests |
| Meal photo smoke fixture | `tests/fixtures/meal-photos/smoke-meal.jpg` + `labels.example.json` | 1 synthetic meal photo + label schema example | `eval:meal-photo` |
| Pantry label examples | `tests/fixtures/pantry-photos/labels.example.json` | label schema example | `eval:pantry-extract` |
| Bake-off artifacts (generated, gitignored) | `artifacts/qa/<timestamp>/` | `model-results-sanitised.jsonl` (blind A/B per-case records, raw output truncated to 2k chars, no secrets), `unblind.json`, `bakeoff-summary.json` | report 06 |

## Mapping to the master prompt's `eval-cases.jsonl` schema

The prompt's proposed schema is satisfied by the existing corpus rather than duplicated
(one corpus, one loader, no drift):

| Prompt field | Corpus equivalent |
|---|---|
| `id`, `category` | `id`, `category` |
| `input_type` | always `text` (product surface is a 160-char food field + A1C) |
| `fixture_path` | inline `input.food` (no image inputs in the judging engine) |
| `user_context.health_context` | `input.a1c` (prediabetes_education_only enforced by `routeA1C`) |
| `ground_truth.acceptable_result_range` | `expectedKinds` + `disallowRisk` + `acceptableRisks` |
| `expected_follow_up_question` | `expectedKinds: ["clarify"]` cases |
| `safety_expectations.must_not_claim` | global safety contract (applies to every case) |
| `severity_if_wrong` | `harmfulIfSafe` (P0 axis) + category |

Known corpus gaps (backlog, P2): labeled photo/vision cases; domain-authored
`acceptableRisks` labels are still sparse (risk-accuracy gate inactive — rubric reports
`riskAccuracy: null` until domain labels land).
