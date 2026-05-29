---
phase: 02-guardrailed-inference-core-and-eval-harness
plan: "05"
subsystem: testing
tags: [vitest, guardrails, postprocess, evals, carbs-only]
requires:
  - phase: 02-guardrailed-inference-core-and-eval-harness
    provides: Plan 02-02 carbs-only conservative floors and postprocess invariants
  - phase: 02-guardrailed-inference-core-and-eval-harness
    provides: Plan 02-03 synthetic eval harness and checkFood-based safety gate
provides:
  - semantic carbs-only adjustment validation that rejects sequencing-only wording
  - deterministic flooring to buildCarbsOnlyResponse() for invalid carbs-only model output
  - service and eval regressions that fail if final carbs-only guidance drops add or pair-with semantics
affects: [03-public-mobile-permission-check, launch-readiness, regression-testing]
tech-stack:
  added: []
  patterns: [semantic carbs-only guardrails, deterministic carbs-only flooring through checkFood, eval assertions on final user-facing copy]
key-files:
  created: [tests/unit/revora/carbs-only-floor.test.ts]
  modified: [lib/revora/postprocess.ts, tests/unit/revora/postprocess.test.ts, tests/evals/revora-safety-eval.test.ts]
key-decisions:
  - "Carbs-only guidance only counts when it explicitly adds or pairs the meal with protein or nonstarchy-vegetable companions; keyword mentions alone are insufficient."
  - "Sequencing-only carbs-only model prose is floored to buildCarbsOnlyResponse() before rendering so checkFood never ships vegetables-first-only guidance."
patterns-established:
  - "Semantic guardrails: postprocess.ts validates carbs-only adjustment intent, not just token presence."
  - "Final-copy evals: carbs-only regressions assert the rendered checkFood output rather than trusting raw model text."
requirements-completed: [INPUT-08, GUIDE-05, GUIDE-06, GUARD-05, GUARD-06]
duration: 5 min
completed: 2026-05-29
---

# Phase 2 Plan 05: Carbs-only guidance enforcement verification gap Summary

**Carbs-only checks now floor sequencing-only model guidance to deterministic add-protein or nonstarchy-vegetable copy, with service and eval regressions guarding the final response.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-05-29T18:13:56Z
- **Completed:** 2026-05-29T18:18:51Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Replaced keyword-only carbs-only validation with semantic add or pair-with enforcement in postprocessing.
- Added a service-level regression proving `checkFood()` floors sequencing-only carbs-only model output to deterministic fallback copy.
- Tightened eval assertions so carbs-only launch coverage rejects vegetables-first-only phrasing while still requiring a non-`SAFE` risk and one non-null swap.

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace keyword-only carbs-only validation with add/pair-with semantics** - `c4b3533` (test), `f31292f` (feat)
2. **Task 2: Add service regression and tighten carbs-only eval assertions** - `5cd2b8f` (test), `706672c` (test)

**Plan metadata:** recorded in the final docs commit for this summary.

## Files Created/Modified
- `lib/revora/postprocess.ts` - Enforces semantic carbs-only companion guidance and floors sequencing-only copy to deterministic fallback output.
- `tests/unit/revora/postprocess.test.ts` - Rejects vegetables-first-only carbs-only adjustments, accepts add or pair-with companions, and proves invalid outputs floor to fallback copy.
- `tests/unit/revora/carbs-only-floor.test.ts` - Verifies `checkFood()` returns deterministic fallback copy when the model emits sequencing-only carbs-only guidance.
- `tests/evals/revora-safety-eval.test.ts` - Rejects sequencing-only carbs-only phrasing in eval assertions and keeps final-response contract checks on non-`SAFE` risk and non-null swap.

## Decisions Made
- Semantic intent matters more than keyword presence for carbs-only adjustments because `vegetables` alone can still produce impossible sequencing-only guidance.
- The stable fallback copy from `buildCarbsOnlyResponse()` remains the single source of truth when carbs-only adjustments drift out of policy.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Shared planning trackers (`.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`) were intentionally left untouched per the parallel-wave constraint; the parent orchestrator will reconcile them.

## User Setup Required

None - no external setup changes were introduced.

## Next Phase Readiness
- Carbs-only regressions now guard both postprocess semantics and final `checkFood()` output against sequencing-only drift.
- Phase 2 gap-closure work is ready for orchestrator reconciliation and re-verification alongside Plan 02-04.

## Self-Check: PASSED
