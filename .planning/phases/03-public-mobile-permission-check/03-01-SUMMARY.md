---
phase: 03-public-mobile-permission-check
plan: "01"
subsystem: ui
tags: [nextjs, react, mobile, playwright, vitest]
requires:
  - phase: 02-guardrailed-inference-core-and-eval-harness
    provides: guarded `/api/check` route, `CheckRequest` schema, and server-only inference boundary
provides:
  - single-screen public mobile form with food and A1C inputs
  - local one-decimal validation before any `/api/check` request
  - mobile smoke and unit seams for later Phase 3 UI states
affects: [03-02, mobile-ux, public-check-flow]
tech-stack:
  added: [@playwright/test]
  patterns: [string-backed client form validation, single-route client-to-server check seam, mobile smoke harness]
key-files:
  created: [components/food-check-form.tsx, lib/client/check.ts, lib/client/validation.ts, tests/unit/client/validation.test.ts, tests/smoke/mobile-check.spec.ts, playwright.config.ts]
  modified: [app/page.tsx, package.json, package-lock.json]
key-decisions:
  - "Client validation requires an exact one-decimal A1C string locally, while range and safety routing stay on the Phase 2 server boundary."
  - "The response area stays inline on the same page now so later loading and result states can ship without adding routes or modals."
  - "Playwright smoke runs use a dedicated local port and fresh server startup to avoid stale local-server reuse during mobile checks."
patterns-established:
  - "Client form contract: validate with `validateCheckForm()` first, then submit only typed `{ food, a1c }` data through `submitCheck()`."
  - "Mobile smoke baseline: assert public access, invalid-submit blocking, thumb-reachable CTA, and no autofocus before richer async states land."
requirements-completed: [INPUT-01, INPUT-02, INPUT-03, UX-01, UX-02, UX-03]
duration: 36 min
completed: 2026-05-29
---

# Phase 3 Plan 01: Single-screen mobile form and local validation flow Summary

**A public one-screen Revora form with exact one-decimal A1C validation, a typed `/api/check` client seam, and mobile smoke coverage**

## Performance

- **Duration:** 36 min
- **Started:** 2026-05-29T19:18:31Z
- **Completed:** 2026-05-29T19:54:45Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Replaced the placeholder homepage with a mobile-first public shell that keeps explanation copy, inputs, CTA, and response area on one screen.
- Added string-backed client validation plus a thin typed `submitCheck()` wrapper so malformed food or A1C input never posts to `/api/check`.
- Added Playwright mobile smoke coverage and Vitest validation coverage to lock the no-login flow, invalid-submit blocking, CTA label, and no-autofocus behavior.

## Task Commits

Each task was committed atomically:

1. **Task 0: Playwright mobile smoke infrastructure** - `967dbe2` (chore)
2. **Task 0: Failing validation and mobile smoke tests** - `26344d7` (test)
3. **Task 0: Client validation and `/api/check` seam** - `d690dd6` (feat)
4. **Task 1: Public single-screen mobile form** - `fc8a9a7` (feat)

**Plan metadata:** recorded in the final docs commit after summary and state updates.

_Note: Task 1 used the failing smoke tests added in Task 0 as its RED step before the UI implementation commit._

## Files Created/Modified
- `playwright.config.ts` - Mobile Chrome and Mobile Safari smoke config with a dedicated local Next server
- `tests/unit/client/validation.test.ts` - Exact one-decimal food/A1C validation coverage
- `tests/smoke/mobile-check.spec.ts` - Public no-login mobile smoke checks for CTA reachability, invalid-submit blocking, and no autofocus
- `lib/client/validation.ts` - String-backed client parsing and typed field issues for food and A1C
- `lib/client/check.ts` - Thin `POST /api/check` client wrapper for later async UI states
- `components/food-check-form.tsx` - Client mobile form with inline errors, keyboard hints, and inline response placeholder
- `app/page.tsx` - Public one-screen mobile page shell that composes the form
- `package.json` - Playwright dev dependency for mobile smoke coverage
- `package-lock.json` - Lockfile update for Playwright installation

## Decisions Made
- Kept local validation narrowly focused on required food input plus exact one-decimal A1C formatting, leaving band routing and other safety logic on the existing server contract.
- Reserved a same-page response area now instead of inventing a second route, modal, or temporary page transition before Plan 03-02.
- Switched Playwright smoke execution to port `3100` with a fresh web server per run after stale local server reuse blocked reliable mobile checks on the default port.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Moved Playwright smoke runs off the default port and disabled server reuse**
- **Found during:** Task 1 (Replace the placeholder page with the single-screen public mobile form)
- **Issue:** Mobile smoke runs were reusing a stale local server and colliding with an occupied default port, which produced false failures even after the UI was implemented.
- **Fix:** Updated `playwright.config.ts` to use port `3100` and `reuseExistingServer: false` so each smoke run starts a fresh Next server for this plan.
- **Files modified:** `playwright.config.ts`
- **Verification:** `npx playwright test tests/smoke/mobile-check.spec.ts -g "public no-login form|invalid submit does not POST|cta label and position|no autofocus mobile inputs" --project="Mobile Chrome"`
- **Committed in:** `fc8a9a7` (part of task commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The fix only stabilized local smoke execution. No product scope changed.

## Issues Encountered
- Next.js dev startup auto-edited `tsconfig.json` and `next-env.d.ts` during smoke runs. Those generated edits were reverted after verification so the plan stayed confined to its approved files.
- `gsd-tools state advance-plan` could not parse the current `STATE.md` format, so the current-position and progress text were updated manually after the other state/roadmap CLI updates succeeded.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 03-02 can now wire the existing `/api/check` route into loading, slow, result, and retry states without reworking the public form contract.
- Mobile smoke and validation seams are in place for expanding coverage to useful response states in the next plan.

## Self-Check: PASSED
