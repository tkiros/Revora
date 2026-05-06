---
phase: 02-guardrailed-inference-core-and-eval-harness
plan: "02"
subsystem: api
tags: [nextjs, vitest, guardrails, structured-outputs, safety-policy]
requires:
  - phase: 01-claims-boundary-evidence-pack-and-safety-spec
    provides: Phase 1 A1C, copy, and tone-policy artifacts consumed as deterministic policy inputs
  - phase: 02-guardrailed-inference-core-and-eval-harness
    provides: Plan 02-01 single-path checkFood service, schema contracts, and OpenAI wrapper
provides:
  - deterministic A1C routing and input prechecks before any model call
  - SAFE/MODERATE/HIGH invariant enforcement with conservative carbs-only and upper-band floors
  - a thin Next.js POST adapter over checkFood plus compile-only Phase 3 placeholders
affects: [02-03, 03-public-mobile-permission-check]
tech-stack:
  added: [@types/react, @types/react-dom]
  patterns: [pre-model deterministic guardrails, post-model conservative floors, thin app-router adapter]
key-files:
  created: [app/api/check/route.ts, app/layout.tsx, app/page.tsx, lib/revora/a1c.ts, lib/revora/input-precheck.ts, lib/revora/postprocess.ts, tests/unit/revora/a1c.test.ts, tests/unit/revora/precheck.test.ts, tests/unit/revora/postprocess.test.ts]
  modified: [lib/revora/fallback.ts, lib/revora/prompt.ts, lib/revora/service.ts, tests/unit/revora/service.test.ts, package.json, package-lock.json]
key-decisions:
  - "A1C routing and high-confidence non-food or ambiguous checks run deterministically before prompt/model invocation; only in-scope ok or carbs-only cases reach the model."
  - "Unsafe SAFE outputs are corrected with deterministic conservative floors for carbs-only and upper-band borderline contexts instead of trusting prompt obedience."
  - "The public adapter stays a thin Node.js POST route over checkFood while app/page and app/layout remain compile-only until Phase 3."
patterns-established:
  - "Deterministic-first orchestration: service.ts imports routeA1C and classifyInputBeforeModel before any prompt work."
  - "Result hardening: postprocess.ts owns one-sentence checks, SAFE null-field rules, MODERATE/HIGH shape checks, and retry-triggering contract errors."
  - "Adapter discipline: app/api/check/route.ts delegates to checkFood and the local model wrapper without route-level prompt logic."
requirements-completed: [CLAIM-05, INPUT-06, INPUT-07, INPUT-08, GUIDE-01, GUIDE-03, GUIDE-04, GUIDE-05, GUIDE-06, GUARD-01, GUARD-02, GUARD-03]
duration: 17 min
completed: 2026-05-06
---

# Phase 2 Plan 02: Edge-case guardrails, conservative floors, and thin API adapter Summary

**Deterministic A1C and input guardrails, conservative SAFE or carbs-only result hardening, and a thin `/api/check` adapter over `checkFood()`**

## Performance

- **Duration:** 17 min
- **Started:** 2026-05-06T20:40:49Z
- **Completed:** 2026-05-06T20:57:39Z
- **Tasks:** 3
- **Files modified:** 15

## Accomplishments
- Added Phase 1-backed A1C routing and narrow deterministic prechecks so out-of-scope, non-food, and ambiguous requests short-circuit before the model.
- Added post-model invariant enforcement and conservative floors so SAFE, MODERATE, and HIGH outputs stay one-sentence, shape-valid, and more cautious for carbs-only or upper-band cases.
- Wired the single service path into a thin Next.js API route and compile-only app placeholders without pulling any Phase 3 UI behavior into this plan.

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement deterministic A1C routing and input prechecks** - `4a880f0` (test)
2. **Task 1: Implement deterministic A1C routing and input prechecks** - `e015474` (feat)
3. **Task 2: Enforce result rubric, one-sentence fields, and conservative floors** - `476a458` (test)
4. **Task 2: Enforce result rubric, one-sentence fields, and conservative floors** - `144ff8a` (feat)
5. **Task 3: Align prompt instructions, service integration, and API adapter with edge-case policy** - `b86a0cb` (test)
6. **Task 3: Align prompt instructions, service integration, and API adapter with edge-case policy** - `903ccba` (feat)
7. **Task 3: Align prompt instructions, service integration, and API adapter with edge-case policy** - `986b210` (chore)

**Plan metadata:** recorded in the final docs commit after summary and state updates.

_Note: TDD work produced separate red and green commits for each task, plus one blocking follow-up chore to persist the React type packages required by the new TSX placeholders._

## Files Created/Modified
- `lib/revora/a1c.ts` - Deterministic Phase 1 A1C band router with explicit out-of-scope response ids and in-scope conservatism levels.
- `lib/revora/input-precheck.ts` - Narrow non-food, ambiguity, and carbs-only classifier used before prompt/model invocation.
- `lib/revora/fallback.ts` - Clarify builder, stronger non-food examples, and deterministic carbs-only floor copy.
- `lib/revora/postprocess.ts` - Typed contract errors, one-sentence checks, SAFE or MODERATE/HIGH invariants, and conservative floor enforcement.
- `lib/revora/prompt.ts`, `lib/revora/service.ts` - Prompt policy expansion plus A1C-band and precheck-context wiring through the single `checkFood()` path.
- `app/api/check/route.ts` - Thin Node.js `POST` adapter that delegates to `checkFood()` through the local model wrapper.
- `app/layout.tsx`, `app/page.tsx` - Compile-only Next.js placeholders so Phase 2 builds without pulling in Phase 3 public UI work.
- `tests/unit/revora/a1c.test.ts`, `tests/unit/revora/precheck.test.ts`, `tests/unit/revora/postprocess.test.ts`, `tests/unit/revora/service.test.ts` - TDD coverage for A1C gates, prechecks, conservative floors, prompt policy, disclaimer merge, and retry behavior.
- `package.json`, `package-lock.json` - Persisted React type packages needed for TSX typecheck with the new app placeholders.

## Decisions Made
- Pre-model deterministic gates stay intentionally narrow and only target high-confidence scope, non-food, ambiguity, and carbs-only cases instead of broad food parsing.
- Conservative floors use deterministic fallback phrasing for carbs-only or upper-band unsafe SAFE cases rather than trying to salvage ambiguous model output with ad hoc mutations.
- The API route owns only JSON parsing and delegation; model policy, prompt building, and result hardening remain inside `lib/revora/service.ts`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Persisted React type dependencies for the new Next.js placeholder files**
- **Found during:** Task 3 (Align prompt instructions, service integration, and API adapter with edge-case policy)
- **Issue:** `npm run typecheck` failed after adding `app/layout.tsx` and `app/page.tsx` because the repo did not declare the React TS type packages needed for TSX compilation.
- **Fix:** Installed and committed `@types/react` and `@types/react-dom` so the placeholder app files stay reproducible from a clean install.
- **Files modified:** `package.json`, `package-lock.json`
- **Verification:** `npm run typecheck`
- **Committed in:** `986b210` (part of task commit chain)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The fix was required to keep the new compile-only app placeholders type-safe. No product scope was added beyond the plan.

## Issues Encountered
- A transient `.git/index.lock` blocked the first Task 3 commit attempt. The lock was already gone on inspection, and the scoped retry commit succeeded without repo changes.

## User Setup Required

None - no new external setup was introduced in this plan beyond the existing `OPENAI_API_KEY` requirement for live model calls.

## Next Phase Readiness
- Plan 02-03 can now evaluate the full guarded path through `checkFood()`, including deterministic short-circuits and postprocess conservative floors, without duplicating logic in its eval harness.
- Phase 3 can build the public mobile flow against the existing `/api/check` route and placeholder app structure without revisiting prompt or service policy ownership.

## Self-Check: PASSED
