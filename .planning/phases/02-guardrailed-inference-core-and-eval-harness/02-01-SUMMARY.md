---
phase: 02-guardrailed-inference-core-and-eval-harness
plan: "01"
subsystem: api
tags: [nextjs, openai, zod, vitest, structured-outputs]
requires:
  - phase: 01-claims-boundary-evidence-pack-and-safety-spec
    provides: Phase 1 safety docs, copy ledger, and the safety-contract fixture consumed by Phase 2
provides:
  - single server-side `checkFood()` inference path for Revora requests
  - strict request, model-output, and user-response schema contracts
  - Phase 1 contract-backed prompt composition, OpenAI wrapper, and fail-closed fallback responses
affects: [02-02, 02-03, 03-public-mobile-permission-check]
tech-stack:
  added: [next@16.2.4, react@19.2.5, react-dom@19.2.5, openai@6.36.0, zod@4.4.3, vitest@4.1.5, typescript@6.0.3]
  patterns: [flat nullable structured outputs, server-only OpenAI wrapper, fail-closed retry orchestration]
key-files:
  created: [package.json, package-lock.json, next.config.ts, next-env.d.ts, vitest.config.ts, lib/revora/schemas.ts, lib/revora/safety-contract.ts, lib/revora/prompt.ts, lib/revora/openai-client.ts, lib/revora/fallback.ts, lib/revora/service.ts, tests/unit/revora/schemas.test.ts, tests/unit/revora/service.test.ts]
  modified: [tsconfig.json]
key-decisions:
  - "Prompt snippets and disclaimer copy are loaded from Phase 1 artifacts instead of being duplicated in Phase 2."
  - "Model output stays a flat strict JSON object with nullable required fields, then converts to richer server-side response types."
  - "The service retries one model or contract failure and then returns controlled retry copy with the Phase 1 disclaimer."
patterns-established:
  - "Single-path orchestration: adapters, tests, and later evals should call checkFood() rather than duplicating prompt logic."
  - "Server-only model boundary: the OpenAI SDK import stays isolated to lib/revora/openai-client.ts."
  - "Fail-closed response shaping: request parse, model parse, and user-response merge all run through explicit schemas."
requirements-completed: [CLAIM-05, GUIDE-01, GUARD-01, GUARD-02, GUARD-03]
duration: 26 min
completed: 2026-05-06
---

# Phase 2 Plan 01: Structured-output check service and server-side guardrails Summary

**Strict Revora `checkFood()` inference path with Phase 1 policy loading, OpenAI structured outputs, and fail-closed retry responses**

## Performance

- **Duration:** 26 min
- **Started:** 2026-05-06T20:04:04Z
- **Completed:** 2026-05-06T20:29:35Z
- **Tasks:** 3
- **Files modified:** 14

## Accomplishments
- Bootstrapped a minimal Next.js, TypeScript, and Vitest workspace for server-side Revora modules without pulling in Phase 3 UI files.
- Added strict request, model-output, and user-response schemas plus a contract loader that reads the Phase 1 fixture and approved copy ledger.
- Implemented the server-only OpenAI wrapper and the single `checkFood()` orchestrator with A1C scope routing, one retry on contract failure, and safe fallback copy.

## Task Commits

Each task was committed atomically:

1. **Task 0: Wave 0 - Verify Phase 1 and bootstrap typed test scaffold** - `00542c3` (test)
2. **Task 0: Wave 0 - Verify Phase 1 and bootstrap typed test scaffold** - `b944b60` (feat)
3. **Task 1: Add safety contract loader, prompt composer, and server-only OpenAI client** - `97af3ef` (feat)
4. **Task 2: Implement single `checkFood()` path and fail-closed retries** - `a1126d7` (test)
5. **Task 2: Implement single `checkFood()` path and fail-closed retries** - `97c0734` (feat)

**Plan metadata:** recorded in the final docs commit after summary and state updates.

_Note: TDD work produced separate red and green commits for Tasks 0 and 2._

## Files Created/Modified
- `package.json` - Minimal runtime and test scaffold with `typecheck`, `test`, and `test:revora` scripts
- `package-lock.json` - Locked dependency tree for Next.js, OpenAI, Zod, Vitest, and TypeScript
- `tsconfig.json` - Strict TypeScript config tuned for server modules and tests without incremental byproducts
- `next-env.d.ts`, `next.config.ts`, `vitest.config.ts` - Baseline Next.js and Vitest configuration
- `lib/revora/schemas.ts` - Strict request, model-output, and user-response schemas plus the flat OpenAI JSON schema
- `lib/revora/safety-contract.ts` - Loader for Phase 1 fixture, copy ledger, and safety docs
- `lib/revora/prompt.ts` - Compact contract-backed prompt composer for structured-output inference
- `lib/revora/openai-client.ts` - Server-only OpenAI Responses API wrapper with `store: false` and strict `json_schema`
- `lib/revora/fallback.ts`, `lib/revora/service.ts` - Controlled fallback copy and the single `checkFood()` orchestrator
- `tests/unit/revora/schemas.test.ts`, `tests/unit/revora/service.test.ts` - Schema, loader, prompt, OpenAI, and service-path coverage

## Decisions Made
- Phase 1 remains the only source of truth for disclaimer and prompt-policy copy, so Phase 2 reads approved rows from `docs/safety/copy-ledger.md` instead of hardcoding a new policy string.
- The model contract stays flat and strict for OpenAI structured outputs, while the server converts it into a richer typed response union for callers.
- `checkFood()` owns request parsing, A1C scope routing, model invocation, disclaimer merge, retry logic, and fail-closed fallback behavior before later plans add richer edge-case handling.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Rebuilt the dependency tree after interrupted installs corrupted local types**
- **Found during:** Task 0 (Wave 0 - Verify Phase 1 and bootstrap typed test scaffold)
- **Issue:** Overlapping and interrupted `npm install` attempts left a truncated `@types/node` file and a missing Vitest native binding, which blocked `tsc` and `vitest`.
- **Fix:** Removed the partial install state, reran a single clean `npm install`, and regenerated a valid `package-lock.json`.
- **Files modified:** `package-lock.json`
- **Verification:** `npm run typecheck`, `npx vitest run tests/unit/revora/schemas.test.ts tests/unit/revora/service.test.ts`
- **Committed in:** `b944b60` (part of task commit)

**2. [Rule 3 - Blocking] Disabled TypeScript incremental output in the minimal scaffold**
- **Found during:** Task 1 (Add safety contract loader, prompt composer, and server-only OpenAI client)
- **Issue:** `tsc --noEmit` was still producing an untracked `tsconfig.tsbuildinfo`, which polluted the repo during plan execution.
- **Fix:** Set `incremental` to `false` in the minimal scaffold.
- **Files modified:** `tsconfig.json`
- **Verification:** `npm run typecheck` no longer creates `tsconfig.tsbuildinfo`
- **Committed in:** `97af3ef` (part of task commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes were required to make the scaffold verifiable. No product scope was added beyond the plan.

## Issues Encountered
- `npm install` initially ran in overlapping partial states and produced a broken local package tree. A single clean reinstall resolved the environment and let the planned code verify cleanly.

## User Setup Required

- Set `OPENAI_API_KEY` for live server-side inference or launch-only live evals.
- Optional: set `REVORA_MODEL` to override the default `gpt-5.4-mini` model.
- Local unit tests and typecheck do not require network access or real credentials.

## Next Phase Readiness
- Plan 02-02 can build on the established `checkFood()` seam to add richer edge-case handling, rubric constraints, and more conservative post-processing without reworking the model boundary.
- No API route or UI files were added here, so Phase 3 still owns the public mobile adapter and rendering states.

## Self-Check: PASSED
