---
phase: 01-claims-boundary-evidence-pack-and-safety-spec
plan: "02"
subsystem: testing
tags: [safety, a1c, rubric, markdown]
requires:
  - phase: 01-01
    provides: claims boundary, evidence pack, validator, and canonical A1C route ids
provides:
  - Deterministic A1C routing for below-range, three prediabetes bands, and 6.5+ inputs
  - Qualitative conservatism ladder for `5.7-5.9`, `6.0-6.2`, and `6.3-6.4`
  - Safe out-of-scope wording that never classifies food outside Revora's prediabetes-only scope
affects: [phase-01-plan-03, phase-02-guardrailed-inference-core, prompts, copy, intake-routing]
tech-stack:
  added: []
  patterns: [deterministic scope routing, qualitative conservatism ladder]
key-files:
  created: []
  modified: [docs/safety/a1c-band-rubric.md]
key-decisions:
  - "A1C routing is a pre-classification scope gate, not a model judgment or diagnosis."
  - "Higher A1C bands increase caution qualitatively without implying exact glucose or future-A1C prediction."
  - "Out-of-scope A1C values below 5.7 and 6.5+ never return SAFE, MODERATE, or HIGH."
patterns-established:
  - "Route Gate: below-range and 6.5+ A1C values short-circuit food classification."
  - "Band Ladder: 5.7-5.9, 6.0-6.2, and 6.3-6.4 use standard, elevated, and high conservatism."
requirements-completed: [INPUT-04, INPUT-05, GUIDE-02]
duration: 2min
completed: 2026-05-06
---

# Phase 01 Plan 02: A1C Band Rubric Summary

**Deterministic A1C route table with below-range and 6.5+ out-of-scope handling plus qualitative conservatism across prediabetes bands**

## Performance

- **Duration:** 2 min
- **Started:** 2026-05-06T19:30:23Z
- **Completed:** 2026-05-06T19:32:47Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Locked all five A1C route ids with exact scope boundaries and non-diagnostic out-of-scope wording.
- Added a qualitative conservatism ladder across `5.7-5.9`, `6.0-6.2`, and `6.3-6.4` with explicit SAFE floors for uncertain or borderline meals.
- Verified the route-specific contract and the full safety-contract suite after the rubric changes.

## Task Commits

Each task was committed atomically:

1. **Task 1: Define deterministic A1C routes** - `bf31bc5` (feat)
2. **Task 2: Calibrate band conservatism without false precision** - `5c74ef1` (feat)

**Plan metadata:** recorded separately in the final docs commit after summary and state updates.

## Files Created/Modified

- `docs/safety/a1c-band-rubric.md` - Final A1C route table, out-of-scope wording, qualitative conservatism levels, and example calibration rows.

## Decisions Made

- Treated A1C routing as deterministic policy that runs before classification so later prompt or UI work cannot widen scope accidentally.
- Used qualitative conservatism levels instead of numeric physiology claims to keep the rubric conservative without pretending to personalize exact response.
- Allowed clearly low-impact foods to remain SAFE across in-scope bands while blocking reassuring SAFE output for upper-band uncertain carb-containing meals.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The branch already contained newer `01-03` task commits without `01-03` summary/state artifacts. This plan stayed scoped to its owned rubric file and its own tracking updates.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan `01-03` can freeze tone and uncertainty policy against a now-locked A1C route gate and conservatism ladder.
- Phase 2 can consume the route ids and calibration rules without asking the model to decide whether an A1C value is in scope.

## Self-Check

PASSED

- Found `.planning/phases/01-claims-boundary-evidence-pack-and-safety-spec/01-02-SUMMARY.md` on disk.
- Found `docs/safety/a1c-band-rubric.md` on disk.
- Verified task commits `bf31bc5` and `5c74ef1` in git history.

---
*Phase: 01-claims-boundary-evidence-pack-and-safety-spec*
*Completed: 2026-05-06*
