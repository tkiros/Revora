---
phase: 04-privacy-minimal-launch-controls
plan: "01"
subsystem: infra
tags: [nextjs, openai, telemetry, privacy, vercel, vitest]
requires:
  - phase: 02-guardrailed-inference-core-and-eval-harness
    provides: single server-side `checkFood()` seam and the one OpenAI Responses wrapper
  - phase: 03-public-mobile-permission-check
    provides: public `/api/check` request path and mobile flow this hardens
provides:
  - frozen privacy-minimal data-flow contract (no default storage of raw food/A1C, store:false required)
  - hardened single server-only OpenAI wrapper with explicit `store: false`
  - allowlisted coarse telemetry seam (emitSafeEvent) that rejects raw health-adjacent fields
  - Preview/Production/dev/test env validation via getRevoraEnv()
  - safe /api/health probe exposing only non-secret launch metadata
affects: [04-02, launch-controls, telemetry, deployment]
tech-stack:
  added: []
  patterns: [single-wrapper provider-storage opt-out, allowlist-only telemetry, static no-default-storage audit test, env-contract parser]
key-files:
  created: [lib/revora/telemetry.ts, lib/revora/env.ts, app/api/health/route.ts, tests/unit/revora/privacy-minimal.test.ts, tests/unit/revora/openai-client.test.ts, tests/unit/revora/telemetry.test.ts, tests/unit/revora/env.test.ts]
  modified: [docs/privacy/data-flow.md, lib/revora/openai-client.ts, lib/revora/service.ts, app/api/check/route.ts, package.json]
key-decisions:
  - "Every Responses call stays inside one server-only wrapper that always sets store:false; routes/components never import the SDK directly."
  - "Telemetry is allowlist-only (event name, environment, response kind, risk, latency bucket, coarse reason code) and never accepts raw food, raw A1C, prompt text, or full model output."
  - "A dedicated privacy-minimal.test.ts statically audits the route -> service -> wrapper + telemetry path so new persistence or raw-logging seams fail CI."
  - "OPENAI_API_KEY is required in all server environments; EDGE_CONFIG stays optional and is reserved for Plan 04-02 launch controls."
  - "The data-flow doc explicitly avoids overclaiming zero retention by noting provider-side abuse-monitoring logs can still exist."
patterns-established:
  - "Privacy boundary as executable proof: a static audit test, not just documentation, guards the no-default-storage contract."
  - "Safe probe pattern: /api/health returns ok/environment/launch only, with a 503 missing_config fallback and no secret exposure."
requirements-completed: [PRIV-01, PRIV-02, PRIV-03, PRIV-04, OPS-01]
duration: resumed
completed: 2026-06-19
---

# Phase 4 Plan 01: Privacy-minimal data flow, telemetry, and deployment contract Summary

**A frozen privacy boundary for Revora: one server-only OpenAI wrapper with `store: false`, allowlist-only coarse telemetry, Preview/Production env validation, and a secret-free `/api/health` probe — all backed by a static no-default-storage audit test**

## Performance

- **Duration:** Resumed (implementation done in a prior interrupted Codex session on 2026-05-29; closed out 2026-06-19)
- **Tasks:** 3
- **Files modified:** 11 (created 7, modified 4)

## Accomplishments
- Documented and froze the privacy-minimal data-flow contract: raw food/A1C live only inside the in-flight request and the single model call, no auth/history/DB persistence or raw request logging, `store: false` required, and an explicit note that provider abuse-monitoring logs may still exist (no zero-retention overclaim).
- Hardened the single server-only OpenAI wrapper so every Responses call sets `store: false`, and added an allowlisted telemetry seam (`emitSafeEvent`) wired into `/api/check` that emits coarse operational events only.
- Added `getRevoraEnv()` env validation (Preview/Production/dev/test, required `OPENAI_API_KEY`, optional `EDGE_CONFIG`) and a safe `/api/health` probe returning only `ok`/`environment`/`launch`.
- Locked the boundary with `privacy-minimal.test.ts`, a static audit of the `route -> service -> wrapper` + telemetry path that fails if raw logging or new persistence seams appear.

## Task Commits

Each task was committed atomically:

1. **Task 0: Dependency gate + lock privacy data-flow contract** - `79fef8a` (docs)
2. **Task 1: Harden OpenAI wrapper + coarse telemetry allowlist** - `715b042` (test, RED) → `9172e07` (feat, GREEN)
3. **Task 2: Preview/Production env validation + safe health probe** - `3d67185` (test, RED) → `3a86e2d` (feat, GREEN)

_Note: Tasks 1 and 2 followed RED→GREEN TDD. Task 2's GREEN (`3a86e2d`) was committed during close-out of this interrupted plan; see Deviations._

## Files Created/Modified
- `docs/privacy/data-flow.md` - Frozen privacy contract: raw-input lifetime, telemetry allowlist, provider-storage posture, Preview/Production env boundary, and health-probe states
- `lib/revora/openai-client.ts` - Single server-only Responses wrapper, always `store: false`
- `lib/revora/service.ts` - Preserved single `checkFood()` seam between route and wrapper
- `lib/revora/telemetry.ts` - Allowlisted coarse telemetry builder/emitter (`emitSafeEvent`)
- `lib/revora/env.ts` - `getRevoraEnv()` env parser (Preview/Production/dev/test; required `OPENAI_API_KEY`, optional `EDGE_CONFIG`)
- `app/api/check/route.ts` - Emits coarse success/failure events after `checkFood()`; no raw body/prompt/output logging
- `app/api/health/route.ts` - Safe probe returning `ok`/`environment`/`launch`, 503 `missing_config` fallback
- `tests/unit/revora/privacy-minimal.test.ts` - Static no-default-storage audit over the full request path
- `tests/unit/revora/openai-client.test.ts` - `store: false` + single-wrapper coverage
- `tests/unit/revora/telemetry.test.ts` - Allowlist enforcement; rejects raw health-adjacent fields
- `tests/unit/revora/env.test.ts` - Env parsing, required-var failure, optional EDGE_CONFIG coverage
- `package.json` - Added `build` script for the Vercel build gate

## Decisions Made
- Kept one server-only OpenAI wrapper as the only Responses call site; the static audit test enforces it rather than relying on review.
- Made telemetry allowlist-only by construction so raw food, raw A1C, prompt text, and model output cannot be emitted.
- Deferred `EDGE_CONFIG` to Plan 04-02 (optional now) so the env contract can ship without launch-control infrastructure.

## Deviations from Plan

### Auto-fixed Issues

**1. [Close-out] Committed Task 2 GREEN during interrupted-plan recovery**
- **Found during:** Plan resume (safe-resume gate tripped: production commits present, no SUMMARY.md)
- **Issue:** The prior session committed Task 2's RED test (`3d67185`) but left the GREEN implementation (`lib/revora/env.ts`, `app/api/health/route.ts`, `docs/privacy/data-flow.md` update, `package.json` build script) uncommitted.
- **Fix:** Verified the working tree passed all gates, then committed the GREEN as `3a86e2d`.
- **Verification:** `vitest run` of the four 04-01 unit suites (11/11 pass), `npm run typecheck` (clean), `npm run build` (clean; `/api/health` present in route manifest).
- **Committed in:** `3a86e2d`

---

**Total deviations:** 1 (close-out recovery of an interrupted plan)
**Impact on plan:** No product scope changed. All plan verification gates pass except `npx vercel build` (see Issues).

## Issues Encountered
- The plan's Task 2 / verification block specifies `npx vercel build` in addition to `npm run build`. Only `npm run build` (Next production build) was run during close-out; it passes and includes the `/api/health` route. `npx vercel build` was not executed (requires Vercel CLI/auth) — flagged here so the gate is not silently recorded as fully met.
- Next.js dev/build auto-edited `tsconfig.json` and `next-env.d.ts`; those generated edits were left out of the phase commits as tooling side-effects.

## User Setup Required

**External services require manual configuration before deployment:**
- `OPENAI_API_KEY` — required in every server environment (OpenAI dashboard).
- Vercel — create separate Preview and Production environment-variable scopes (Project → Settings → Environment Variables).

## Next Phase Readiness
- Plan 04-02 can build abuse-cost thresholds and rollback/kill-switch procedures on top of the `getRevoraEnv()` contract (consuming the reserved optional `EDGE_CONFIG`), the `/api/health` probe, and the `emitSafeEvent` telemetry seam.
- Before public launch: run the live eval with `OPENAI_API_KEY` and record a zero-harmful-SAFE result; optionally run `npx vercel build` to fully satisfy the deployment gate.

---
*Phase: 04-privacy-minimal-launch-controls*
*Completed: 2026-06-19*
