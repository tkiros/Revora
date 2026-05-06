---
phase: 02-guardrailed-inference-core-and-eval-harness
plan: "03"
subsystem: testing
tags: [vitest, zod, evals, openai, launch-gate]
requires:
  - phase: 01-claims-boundary-evidence-pack-and-safety-spec
    provides: Safety contract fixture, copy ledger, A1C routes, and launch-safe claims boundaries
  - phase: 02-guardrailed-inference-core-and-eval-harness
    provides: Single-path `checkFood()` service, deterministic prechecks, conservative floors, and the server-side OpenAI wrapper
provides:
  - synthetic launch-blocking Revora eval fixtures covering all required Phase 2 categories
  - deterministic and optional live eval adapters that drive the existing `checkFood()` path
  - local and launch-only commands that fail the eval gate on any harmful SAFE result
affects: [03-public-mobile-permission-check, launch-readiness, regression-testing]
tech-stack:
  added: []
  patterns: [synthetic fixture eval harness, input-keyed deterministic model adapter, setup-blocked live launch gate]
key-files:
  created: [tests/fixtures/revora-eval-cases.json, tests/support/revora-test-model.ts, tests/unit/revora/live-eval-runner.test.ts, scripts/run-live-revora-evals.mjs]
  modified: [package.json, tests/evals/revora-safety-eval.test.ts]
key-decisions:
  - "Phase 2 evals stay synthetic-fixture based and local; optional live checks reuse the same fixture set instead of hosted eval uploads."
  - "The eval harness keys deterministic model responses by the exact `checkFood()` input so tests exercise the production prompt and service path without a second classifier."
  - "Missing `OPENAI_API_KEY` is treated as a setup-blocked launch check, not as a failure of the local deterministic safety gate."
patterns-established:
  - "Eval discipline: call `checkFood()` for every safety case and let deterministic prechecks or postprocess floors produce the real user response."
  - "Live mode switch: `REVORA_LIVE_EVAL=1` is the only path that swaps fixture responses for the server-only OpenAI wrapper."
requirements-completed: [CLAIM-05, INPUT-06, INPUT-07, INPUT-08, GUIDE-01, GUIDE-03, GUIDE-04, GUIDE-05, GUIDE-06, GUARD-01, GUARD-02, GUARD-03, GUARD-05, GUARD-06]
duration: 17 min
completed: 2026-05-06
---

# Phase 2 Plan 03: Safety evaluation suite and harmful-SAFE launch gate Summary

**Synthetic Revora safety fixtures, a deterministic `checkFood()` eval harness, and a setup-blocked live runner that blocks launch on harmful SAFE results**

## Performance

- **Duration:** 17 min
- **Started:** 2026-05-06T21:04:25Z
- **Completed:** 2026-05-06T21:21:13Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Added a 40-case synthetic eval corpus covering clearly safe, borderline, high-risk, non-food, ambiguous, carbs-only, out-of-range A1C, and prompt-injection scenarios with harmful-if-safe metadata.
- Built a Zod-validated eval adapter and Vitest gate that routes every case through the production `checkFood()` service and enforces zero harmful SAFE results.
- Added `npm run eval:revora` plus `scripts/run-live-revora-evals.mjs`, which reuses the same synthetic fixtures for launch-only live checks and reports `SETUP_BLOCKED` when `OPENAI_API_KEY` is absent.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create synthetic launch-blocking eval fixtures** - `1667b55` (test)
2. **Task 1: Create synthetic launch-blocking eval fixtures** - `b733879` (feat)
3. **Task 2: Implement deterministic Vitest eval gate against `checkFood()`** - `11a83e9` (test)
4. **Task 2: Implement deterministic Vitest eval gate against `checkFood()`** - `7dd0454` (feat)
5. **Task 3: Add launch eval command and full Phase 2 verification gate** - `3660309` (test)
6. **Task 3: Add launch eval command and full Phase 2 verification gate** - `d00b0e5` (feat)

**Plan metadata:** recorded in the final docs commit after summary and state updates.

_Note: All three TDD tasks produced separate red and green commits._

## Files Created/Modified
- `tests/fixtures/revora-eval-cases.json` - 40 synthetic launch-blocking fixtures with category coverage, harmful-if-safe markers, and fixture-backed model outputs where needed
- `tests/support/revora-test-model.ts` - Zod-backed fixture loader plus deterministic-or-live model adapter used by evals
- `tests/evals/revora-safety-eval.test.ts` - category coverage, controlled-response assertions, result-contract checks, and harmful SAFE launch gate through `checkFood()`
- `scripts/run-live-revora-evals.mjs` - executable launch-only live eval runner with `SETUP_BLOCKED` handling and `REVORA_LIVE_EVAL=1` switching
- `tests/unit/revora/live-eval-runner.test.ts` - contract checks for setup-blocked and live-ready runner planning
- `package.json` - `eval:revora` script for the local deterministic safety gate

## Decisions Made
- Local and launch checks both stay anchored to synthetic fixtures so Phase 2 avoids hosted eval uploads, real-user data, and a second judging layer.
- The deterministic model adapter matches cases by the exact `Food:` and `A1C:` prompt inputs, which keeps evals on the production `checkFood()` path instead of a parallel classifier seam.
- The live runner exits successfully with `SETUP_BLOCKED` when `OPENAI_API_KEY` is missing because that condition blocks launch verification, not local safety regression verification.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Reworked the live-runner test import to satisfy TypeScript under Bundler module resolution**
- **Found during:** Task 3 (Add launch eval command and full Phase 2 verification gate)
- **Issue:** The new `.mjs` live runner worked at runtime, but the new TS unit test failed `npm run typecheck` because TypeScript would not resolve declarations for the dynamic `.mjs` import under the repo's `moduleResolution: "Bundler"` config.
- **Fix:** Replaced the statically-resolved string-literal import in the test with a widened dynamic import helper so runtime coverage remained intact without declaration-file churn.
- **Files modified:** `tests/unit/revora/live-eval-runner.test.ts`
- **Verification:** `npm run typecheck`, `npx vitest run tests/unit/revora/live-eval-runner.test.ts`
- **Committed in:** `d00b0e5` (part of task commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The fix was required to keep the launch-runner tests type-safe. No product scope was added beyond the plan.

## Issues Encountered
- The optional live launch check remained setup-blocked because `OPENAI_API_KEY` was not configured locally. This was expected and is now surfaced by the new runner as a non-failing setup condition.

## User Setup Required

- Set `OPENAI_API_KEY` to run the launch-only live eval path: `node scripts/run-live-revora-evals.mjs`
- The deterministic local gate does not require credentials and remains available through `npm run eval:revora`

## Next Phase Readiness
- Phase 2 now has a local regression gate and a launch-only live gate, so Phase 3 can build the public mobile flow against `/api/check` without losing coverage of harmful SAFE regressions.
- The remaining launch-only step is to rerun `node scripts/run-live-revora-evals.mjs` in an environment with `OPENAI_API_KEY` and record the live zero-harmful-SAFE result before public release.

## Self-Check: PASSED
