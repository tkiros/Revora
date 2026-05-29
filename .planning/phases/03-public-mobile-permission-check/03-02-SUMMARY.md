---
phase: 03-public-mobile-permission-check
plan: "02"
subsystem: ui
tags: [nextjs, react, mobile, playwright, vitest]
requires:
  - phase: 03-public-mobile-permission-check
    provides: public one-screen mobile form, local validation seam, and `/api/check` client boundary from 03-01
provides:
  - inline loading, slow, and friendly retry states on the public mobile page
  - normalized client response mapping for result, clarify, not-food, out-of-scope, and retry payloads
  - mobile smoke coverage for normal responses before five seconds and useful terminal states
affects: [03-03, public-check-flow, mobile-ux]
tech-stack:
  added: []
  patterns: [client request-state seam, response normalization at the `/api/check` boundary, inline terminal response cards]
key-files:
  created: [lib/client/ui-state.ts, tests/unit/client/ui-state.test.ts, components/request-status.tsx, components/result-card.tsx]
  modified: [lib/client/check.ts, components/food-check-form.tsx, tests/smoke/mobile-check.spec.ts]
key-decisions:
  - "Normalize Phase 2 payload drift only inside `lib/client/check.ts` so the UI can keep a stable client-facing response union without touching server inference code."
  - "Keep loading and slow copy in `RequestStatus` while terminal result, clarify, not-food, out-of-scope, and retry states render through a separate `ResultCard` surface on the same page."
  - "Treat transport, timeout, and rate-limit failures as friendly retry errors, while successful server `retry` payloads stay inline as calm terminal guidance."
patterns-established:
  - "Request-state flow: `idle -> submitting -> slow -> done|error` comes from shared `ui-state` helpers instead of React-only ad hoc flags."
  - "Client boundary pattern: map server response fields once in `submitCheck()` and keep components on a normalized UI response contract."
requirements-completed: [GUIDE-08, UX-04, UX-05, UX-06]
duration: 9 min
completed: 2026-05-29
---

# Phase 3 Plan 02: Connect the public API route to result, clarification, and error states Summary

**A single-page mobile Revora flow with inline loading, slow, result, clarify, out-of-scope, not-food, and retry states over the existing `/api/check` route**

## Performance

- **Duration:** 9 min
- **Started:** 2026-05-29T20:01:07Z
- **Completed:** 2026-05-29T20:10:16Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Added a shared client request-state seam with a five-second slow threshold and friendly failure mapping for timeout, network, rate-limit, and fallback errors.
- Wired the public form to the existing `/api/check` route with inline loading and still-running feedback while keeping everything on one mobile page.
- Rendered normalized result, clarify, not-food, out-of-scope, and retry responses inline, with Playwright coverage proving useful terminal states arrive before five seconds under mocked normal conditions.

## Task Commits

Each task was committed atomically:

1. **Task 0: Failing request-state coverage** - `f315baa` (test)
2. **Task 0: Client request-state helpers** - `399a7b7` (feat)
3. **Task 1: Loading, slow-state, and retry-safe status handling** - `9abd539` (feat)
4. **Task 2: Inline result, clarification, and safe error rendering** - `55701a5` (feat)

**Plan metadata:** recorded in the final docs commit after summary and state updates.

_Note: Task 1 and Task 2 used the failing smoke coverage added in Task 0 as their RED step before the UI wiring and response-card implementation commits._

## Files Created/Modified
- `lib/client/ui-state.ts` - Shared request-state contract, slow-threshold helper, and friendly retry-copy mapping
- `tests/unit/client/ui-state.test.ts` - Unit coverage for five-second timing and retry-copy behavior
- `components/request-status.tsx` - Inline loading, still-checking, and retry-safe status surface
- `components/result-card.tsx` - Inline renderer for result, clarify, not-food, out-of-scope, and retry payloads
- `lib/client/check.ts` - Real `/api/check` fetch, timeout signal handling, error normalization, and response-shape mapping
- `components/food-check-form.tsx` - Single-page mobile request orchestration and terminal-state rendering
- `tests/smoke/mobile-check.spec.ts` - Mobile smoke coverage for loading, slow, retry, result, clarify, not-food, and out-of-scope flows

## Decisions Made
- Normalized actual Phase 2 field names in `lib/client/check.ts` so React components only consume the plan’s UI-friendly response union.
- Split pending/error messaging from terminal response rendering to keep status copy explicit without mixing it into result cards.
- Let successful server `retry` payloads render inline with calm copy, while transport and rate-limit failures stay on the friendly retry error surface.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Reverted Next.js-generated TypeScript scaffold edits after smoke verification**
- **Found during:** Task 1 and Task 2 verification
- **Issue:** `next dev` rewrote `tsconfig.json` and `next-env.d.ts` during Playwright runs, which would have expanded the plan beyond its approved files.
- **Fix:** Reverted the generated TypeScript scaffold edits after each verification run and kept all committed changes inside the plan’s UI files.
- **Files modified:** `tsconfig.json`, `next-env.d.ts` (reverted, not committed)
- **Verification:** Re-ran `npm run typecheck` after the revert and confirmed the plan-specific suite still passed.
- **Committed in:** No commit (generated edits were discarded)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The auto-fix only kept verification noise out of the plan. No product scope or server architecture changed.

## Issues Encountered
- Next.js smoke startup continues to warn about multiple lockfiles above the repo root, but the dedicated Playwright port still starts reliably and does not block the plan.
- `gsd-tools state advance-plan` still cannot parse the current `STATE.md` plan-tracking format, so the current-position text and progress summary were updated manually after the other state, roadmap, and requirements commands succeeded.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 03-03 can now focus on bright-environment readability, copy polish, and the human verification checkpoint instead of first-time request wiring.
- The public page already proves useful result, clarify, not-food, out-of-scope, slow, and retry branches on the single route, so the next plan can stay visual and copy-focused.

## Self-Check: PASSED
