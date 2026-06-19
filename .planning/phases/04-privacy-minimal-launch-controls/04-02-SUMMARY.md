---
phase: 04-privacy-minimal-launch-controls
plan: "02"
subsystem: infra
tags: [nextjs, vercel, edge-config, launch-controls, middleware, playwright, vitest, ops-runbook]
requires:
  - phase: 04-01
    provides: getRevoraEnv(), emitSafeEvent(), /api/health probe, EDGE_CONFIG optional contract
provides:
  - pre-model pause gate in middleware.ts using evaluateLaunchMode()
  - launch-control seam (getLaunchControls, evaluateLaunchMode, shouldPauseForOps)
  - Edge Config keys launch_mode / public_checks_enabled / incident_message with fail-closed defaults
  - REVORA_LAUNCH_MODE_OVERRIDE non-production test seam
  - /api/health reports launchMode from shared launch-control state
  - unit coverage (29 tests) and Playwright smoke coverage (3 tests) for launch-control behavior
  - ops runbook with threshold table, WAF setup, Edge Config pause/restore drill, and rollback procedure
affects: [05-community-launch, deployment, middleware]
tech-stack:
  added: ["@vercel/edge-config@^1.4.3"]
  patterns: [fail-closed-edge-config, pre-model-pause-gate, operator-threshold-helper, non-production-override-seam]
key-files:
  created:
    - lib/revora/launch-controls.ts
    - middleware.ts
    - tests/unit/revora/launch-controls.test.ts
    - tests/smoke/launch-controls.spec.ts
    - docs/ops/launch-controls.md
  modified:
    - app/api/health/route.ts
    - tests/unit/revora/env.test.ts
    - package.json
    - package-lock.json
key-decisions:
  - "shouldPauseForOps() takes operator-supplied checksLast24h as input; no durable counter is built in. WAF handles automated rate limiting."
  - "Middleware reads launch state via evaluateLaunchMode() which never calls getRevoraEnv() (avoids OPENAI_API_KEY throw in edge context)."
  - "REVORA_LAUNCH_MODE_OVERRIDE is ignored in production/VERCEL_ENV=production to prevent accidental pauses."
  - "Edge Config SDK is dynamically imported and guarded behind EDGE_CONFIG presence check; absent = safe defaults."
  - "npx vercel build requires Vercel auth (SETUP_BLOCKED); npm run build substituted and passes cleanly."
  - "middleware.ts deprecated in Next.js 16 (prefer proxy.ts) but plan specifies middleware.ts and build succeeds with a warning."
requirements: [OPS-02, OPS-03]
duration: ~75 min
completed: 2026-06-19
---

# Phase 4 Plan 02: Launch Controls and Kill-Switch Runbook Summary

**Pre-model pause gate, operator thresholds, Edge Config integration, and a complete rollback runbook — Revora can now be paused in seconds without redeploying, and operators have explicit evidence slots for WAF, Edge Config, Preview verification, and post-rollback confirmation**

## Performance

- **Duration:** ~75 min
- **Tasks:** 3 (Task 0: contracts + threshold seam, Task 1: middleware gate + health probe + smoke, Task 2: runbook finalization)
- **Files modified:** 9 (5 created, 4 modified)

## Accomplishments

- Built `lib/revora/launch-controls.ts` with the `LaunchControls` type contract, `getLaunchControls()`, `evaluateLaunchMode()`, and `shouldPauseForOps()` threshold helper encoding the 2,000 checks/24h operator gate.
- Installed `@vercel/edge-config` and wired it with fail-closed defaults: when `EDGE_CONFIG` is absent or the SDK errors, the module returns normal mode and enabled checks without throwing.
- Added `REVORA_LAUNCH_MODE_OVERRIDE=paused` as a non-production test seam so unit and smoke tests can simulate incidents without touching live Edge Config.
- Implemented `middleware.ts` (pre-model pause gate) for `/api/check`: when `evaluateLaunchMode()` returns paused, requests are blocked before any OpenAI call and receive friendly 503 copy with no raw errors or stack traces.
- Updated `app/api/health/route.ts` to report `launchMode` from the shared launch-control seam so the health probe and middleware always reflect the same state.
- Added 29 unit tests covering dependency gate, default mode, pause path, threshold helper, missing Edge Config fail-closed, health `launchMode`, and middleware gate behavior.
- Added 3 Playwright smoke tests proving normal-mode passthrough, maintenance-mode pause, and rate-limit (429) behavior through the public path without mutating live Edge Config.
- Finalized `docs/ops/launch-controls.md` as the complete operator runbook: threshold table (WAF 10req/10min/IP, 2,000 checks/24h), Edge Config setup, pause and restore drill, Preview deploy checklist, and rollback procedure with `vercel rollback` → `vercel rollback status` → `vercel logs --environment production --status-code 5xx --since 5m` → `/api/health` probe → synthetic public-check verification.

## Task Commits

Each task was committed atomically (TDD RED→GREEN for Tasks 0 and 1):

1. **Task 0 RED:** `7d4a584` — `test(04-02)`: add failing launch-control contracts and threshold coverage
2. **Task 0 GREEN:** `9d61647` — `feat(04-02)`: implement launch-control contracts, thresholds, and ops runbook
3. **Task 1 RED:** `674c7cc` — `test(04-02)`: add failing middleware gate, health launchMode, and smoke coverage
4. **Task 1 GREEN:** `e1b14d4` — `feat(04-02)`: gate public checks before model spend, wire health launchMode
5. **Task 2:** No additional commit needed — runbook was finalized as part of Task 0 GREEN; Task 2 verify passed against that commit.

## Files Created/Modified

- `lib/revora/launch-controls.ts` — LaunchControls type, getLaunchControls(), evaluateLaunchMode(), shouldPauseForOps() with 2,000 checks/24h threshold; Edge Config keys launch_mode/public_checks_enabled/incident_message with fail-closed defaults
- `middleware.ts` — Pre-model pause gate for /api/check; returns friendly 503 retry copy when paused; public page and /api/health remain accessible
- `tests/unit/revora/launch-controls.test.ts` — 29 tests: 04-01 dependency gate, default mode, pause path, threshold helper (harmful-guidance, provider-failure, 2,000 checks), missing Edge Config fail-closed, health launchMode, middleware gate
- `tests/smoke/launch-controls.spec.ts` — 3 Playwright tests: normal mode passthrough, maintenance mode (503 pause copy visible, no raw errors), rate limit (429 friendly retry copy visible)
- `docs/ops/launch-controls.md` — Complete operator runbook: threshold table, WAF rule config, Edge Config setup/pause/restore drill, Preview deploy checklist, rollback procedure with all required evidence slots
- `app/api/health/route.ts` — Wired to getLaunchControls(); response now includes `launchMode` field; launch field reflects actual pause state
- `tests/unit/revora/env.test.ts` — Updated toEqual assertions to include new `launchMode` field in both success and 503 missing_config responses [Rule 1 deviation]
- `package.json` — Added @vercel/edge-config dependency
- `package-lock.json` — Updated lockfile

## Decisions Made

- The pause gate reads only launch-control state in middleware, never calls `getRevoraEnv()`. This avoids an OPENAI_API_KEY throw in the edge runtime where the key is not needed for the pause decision.
- `shouldPauseForOps()` takes operator-supplied `checksLast24h` as input — there is no durable counter. Operators read the aggregate from Vercel logs; WAF handles automated rate limiting at the provider level.
- Vercel WAF rate-limit rule (`10 requests / 10 minutes / IP`) is documented in the runbook as a Vercel Dashboard task with explicit evidence slots; no WAF SDK integration in the app code.
- Edge Config SDK dynamically imported to avoid hard failures in environments where EDGE_CONFIG is not set.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated env.test.ts assertions for new launchMode field**
- **Found during:** Task 1 (implementing health route changes)
- **Issue:** `tests/unit/revora/env.test.ts` had two `toEqual` assertions on the health response payload that used exact shape matching. Adding `launchMode` to the health route would cause both to fail since the plan spec requires `launchMode` in the response but `env.test.ts` is not in `files_modified`.
- **Fix:** Updated both exact assertions (success path and missing_config path) to include `launchMode`.
- **Files modified:** `tests/unit/revora/env.test.ts`

**2. [Rule 3 - Blocker] Fixed Playwright locator strict-mode violations**
- **Found during:** Task 1 smoke test runs
- **Issue:** Regex-based `getByText` locators (`/paused|try again/i`, `/try again|a lot of people right now|too many requests/i`) matched multiple elements, causing Playwright strict-mode violations.
- **Fix:** Used exact text `"Try again on this page"` (matching the copy in `RequestStatus`) and `page.getByText(/a lot of people right now/i)` for the rate-limit assertion.
- **Files modified:** `tests/smoke/launch-controls.spec.ts`

### Build Gate Substitution

- **`npx vercel build`**: Vercel CLI is available (`54.14.2`) but requires `vercel login` auth — returned "The specified token is not valid." Substituted `npm run build` (Next.js production build) which passes cleanly and produces `/api/check` and `/api/health` routes plus the middleware (`ƒ Proxy`). Noted as `SETUP_BLOCKED` per plan notes.

### Informational (Not Deviations)

- Next.js 16 deprecates `middleware.ts` in favor of `proxy.ts`, producing a build warning. The plan explicitly specifies `middleware.ts` as the artifact; the build succeeds and the functionality works. Renamed to `proxy.ts` when upgrading Next.js.
- `vi.mock` hoisting inside `it()` blocks was refactored to avoid Vitest warning; tests now use real SDK error paths (fake EDGE_CONFIG strings fail at the SDK network level) which are caught by the module's try/catch.

## Known Stubs

None — all launch-control values read from real Edge Config (when configured) or safe defaults. No hardcoded placeholder data flows to UI rendering.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: middleware-bypass | middleware.ts | Only `POST /api/check` is gated; GET /api/check would bypass if it existed (currently not a route). Confirm route.ts export list stays POST-only. |

## User Setup Required

**External services require manual configuration before deployment:**

- **Vercel Edge Config store** — Create a store in Vercel Dashboard → Storage → Edge Config. Set keys:
  - `launch_mode` = `"normal"` (or `"paused"` to activate kill switch)
  - `public_checks_enabled` = `true` (set to `false` to pause all public checks)
  - `incident_message` = `"Revora checks are temporarily paused. Please try again later."` (or custom copy)
  - Obtain the connection string and set `EDGE_CONFIG=ecfg_<string>` in Vercel Project → Settings → Environment Variables for Preview and Production scopes.

- **Vercel WAF rate-limit rule** — Vercel Dashboard → Security → WAF:
  - Rule name: `revora-check-rate-limit`
  - Path: `/api/check`
  - Limit: 10 requests / 10 minutes / IP
  - Action: Block (429)
  - Publish and record rule ID + publication timestamp

- **`vercel login`** — Required before `npx vercel build`, `vercel rollback`, `vercel rollback status`, and `vercel logs` can execute.

## Self-Check: PASSED

- `lib/revora/launch-controls.ts` — FOUND
- `middleware.ts` — FOUND
- `tests/unit/revora/launch-controls.test.ts` — FOUND
- `tests/smoke/launch-controls.spec.ts` — FOUND
- `docs/ops/launch-controls.md` — FOUND
- `app/api/health/route.ts` — FOUND (modified)
- Commits: 7d4a584, 9d61647, 674c7cc, e1b14d4 — all present in git log
- Unit tests: 87/87 pass (full suite)
- Playwright smoke tests: 3/3 pass (normal mode, maintenance mode, rate limit)
- Typecheck: clean
- Build: clean (`npm run build`)

---
*Phase: 04-privacy-minimal-launch-controls*
*Completed: 2026-06-19*
