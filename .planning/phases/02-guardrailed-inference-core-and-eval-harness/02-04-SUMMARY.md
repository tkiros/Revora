---
phase: 02-guardrailed-inference-core-and-eval-harness
plan: "04"
subsystem: api
tags: [vitest, guardrails, non-food, evals]
requires:
  - phase: 01-claims-boundary-evidence-pack-and-safety-spec
    provides: Phase 1 refusal copy and disclaimer contract reused by deterministic not_food responses
  - phase: 02-guardrailed-inference-core-and-eval-harness
    provides: Plan 02-02 pre-model input prechecks and Plan 02-03 fixture-backed eval harness
provides:
  - deterministic ordinary-object non-food refusals before any model call
  - service-level regression coverage proving ordinary non-food inputs bypass model.generate
  - local eval fixtures and guards that fail if non_food cases rely on mocked model output
affects: [02-05, 03-public-mobile-permission-check, launch-readiness, regression-testing]
tech-stack:
  added: []
  patterns: [curated ordinary-object non-food lexicon, deterministic eval short-circuit guard]
key-files:
  created: [tests/unit/revora/non-food-short-circuit.test.ts, tests/unit/revora/revora-test-model.test.ts]
  modified: [lib/revora/input-precheck.ts, tests/unit/revora/precheck.test.ts, tests/fixtures/revora-eval-cases.json, tests/support/revora-test-model.ts]
key-decisions:
  - "Ordinary object-like non-food detection stays a narrow curated lexicon layered onto the existing prompt-injection refusal path instead of a broad noun blacklist."
  - "Local non_food eval fixtures may not define mockModelOutput, so passing non-food evals now proves checkFood short-circuits before the model seam."
patterns-established:
  - "Deterministic refusal first: classifyInputBeforeModel handles obvious ordinary objects before ambiguity or model routing."
  - "Eval seam integrity: fixture-backed local evals reject mocked outputs for categories expected to resolve before model.generate()."
requirements-completed: [INPUT-06, GUARD-01, GUARD-05]
duration: 3 min
completed: 2026-05-29
---

# Phase 2 Plan 04: Ordinary non-food refusal verification gap Summary

**Curated ordinary-object non-food refusal in `checkFood()` plus eval guards that fail if non-food fixtures ever hit the mock model seam**

## Performance

- **Duration:** 3 min
- **Started:** 2026-05-29T18:13:24Z
- **Completed:** 2026-05-29T18:16:53Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Added a narrow ordinary-object non-food lexicon so obvious objects like running shoes or laptop chargers resolve to `not_food` before ambiguity checks or model access.
- Added service-level and precheck-level regression coverage proving those ordinary objects return concrete refusal examples without calling `model.generate()`.
- Removed mocked `non_food` eval outputs and added a local eval guard so future regressions fail immediately if ordinary non-food fixtures ever reach the model seam.

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand ordinary-object non-food precheck and prove model bypass** - `b3e06d5` (test)
2. **Task 1: Expand ordinary-object non-food precheck and prove model bypass** - `3e8d606` (feat)
3. **Task 2: Remove non-food eval model crutches and lock the short-circuit gate** - `16ee64d` (test)
4. **Task 2: Remove non-food eval model crutches and lock the short-circuit gate** - `9c2875d` (feat)

**Plan metadata:** recorded in the final docs commit for this summary.

_Note: Both tasks followed a RED → GREEN cycle._

## Files Created/Modified
- `lib/revora/input-precheck.ts` - Adds the curated ordinary-object non-food patterns alongside the existing prompt-injection refusal path.
- `tests/unit/revora/precheck.test.ts` - Covers ordinary object refusals, preserved prompt-injection handling, and real-food non-matches.
- `tests/unit/revora/non-food-short-circuit.test.ts` - Verifies `checkFood()` returns `not_food` and never calls the model for ordinary objects.
- `tests/fixtures/revora-eval-cases.json` - Removes `mockModelOutput` from the five ordinary-object `non_food` fixtures.
- `tests/support/revora-test-model.ts` - Rejects mocked outputs for deterministic local `non_food` fixtures while leaving live eval mode unchanged.
- `tests/unit/revora/revora-test-model.test.ts` - Guards the local eval client contract for deterministic short-circuit categories.

## Decisions Made
- Kept ordinary non-food detection narrow and phrase-based so obvious accessories or household objects are refused without broadening into generic noun filtering.
- Put the new eval guard inside the existing local model adapter instead of adding a second classifier seam, which keeps non-food proof anchored to the production `checkFood()` path.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required

None - no new external service setup was introduced in this plan.

## Next Phase Readiness
- The ordinary non-food verification gap is closed, so Phase 2 now has deterministic proof for `INPUT-06` through both unit tests and local evals.
- The remaining Phase 2 gap is the carbs-only enforcement follow-up in `02-05-PLAN.md`.

## Self-Check: PASSED

---
*Phase: 02-guardrailed-inference-core-and-eval-harness*
*Completed: 2026-05-29*
