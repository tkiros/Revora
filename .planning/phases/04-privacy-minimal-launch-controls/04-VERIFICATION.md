---
phase: 04-privacy-minimal-launch-controls
verified: 2026-06-19T02:15:00Z
status: human_needed
score: 9/9 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Run `npx vercel build` after `vercel login` to confirm the Vercel build gate fully passes"
    expected: "Build completes without errors; /api/check, /api/health, and middleware routes present in output"
    why_human: "npx vercel build requires Vercel CLI auth (vercel login). npm run build passes and produces correct routes but is not a 100% equivalent gate. The plan explicitly named npx vercel build as a required verification step."
  - test: "Create Edge Config store in Vercel Dashboard with keys launch_mode, public_checks_enabled, incident_message; set EDGE_CONFIG connection string in Preview and Production scopes"
    expected: "GET /api/health returns {ok:true, environment:\"preview\", launch:\"ready\", launchMode:\"normal\"}; toggling public_checks_enabled to false makes /api/check return 503 with friendly pause copy and no stack traces"
    why_human: "Vercel Edge Config is external provider infrastructure. App code reads it with fail-closed defaults; integration requires actual Vercel project and dashboard access."
  - test: "Publish WAF rate-limit rule in Vercel Dashboard (Security → WAF): name=revora-check-rate-limit, path=/api/check, limit=10 req/10 min/IP, action=Block 429"
    expected: "Sending 11 rapid POST /api/check requests from the same IP results in the 11th returning 429"
    why_human: "WAF rules live in Vercel's provider layer. Code does not embed WAF logic; operator must publish the rule and record rule ID + timestamp as evidence."
  - test: "Execute rollback drill: run vercel rollback, then vercel rollback status, then vercel logs --environment production --status-code 5xx --since 5m, then GET /api/health, then one synthetic POST /api/check"
    expected: "vercel rollback status reaches COMPLETE; 5xx rate returns to baseline; /api/health returns ok:true; synthetic check returns kind:result or kind:retry"
    why_human: "Rollback steps require vercel login CLI auth and a live Production deployment. Steps are documented in docs/ops/launch-controls.md with SETUP_BLOCKED evidence slots; human must execute and record evidence."
---

# Phase 4: Privacy-Minimal Launch Controls Verification Report

**Phase Goal:** Revora can be deployed publicly with explicit privacy, abuse, and rollback boundaries that protect user trust and operating cost.
**Verified:** 2026-06-19T02:15:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | Revora is deployable on Vercel as a public MVP without default storage of raw food descriptions, raw A1C values, or account-linked health data | VERIFIED | `store: false` in openai-client.ts:43; no DB writes, no auth, no history in any request path; privacy-minimal.test.ts statically audits the full path; 40/40 unit tests pass |
| 2  | Every OpenAI Responses call goes through one server-only wrapper that sets `store: false` | VERIFIED | openai-client.ts is the sole call site; `store: false` at line 43; privacy-minimal.test.ts confirms no SDK imports outside the wrapper in page.tsx, components/, lib/client/, route.ts, service.ts |
| 3  | Telemetry and operational events carry allowlisted coarse fields only and exclude raw food, raw A1C, prompt text, and full model output | VERIFIED | telemetry.ts uses Zod `.strict()` schema allowing only: name, environment, responseKind, risk, latencyBucket, reasonCode; check route emits emitSafeEvent with coarse fields only; no raw body logging in route.ts or telemetry.ts |
| 4  | Preview and Production configuration are explicitly separated before public launch | VERIFIED | env.ts detectEnvironment() maps VERCEL_ENV to preview/production/development; OPENAI_API_KEY required in all server envs; EDGE_CONFIG optional (reserved for 04-02); data-flow.md documents the env boundary |
| 5  | A safe health and launch-state probe exists for Preview verification and later rollback checks | VERIFIED | app/api/health/route.ts exports GET; returns ok/environment/launch/launchMode; calls getLaunchControls() for live launch state; falls back to 503 missing_config when OPENAI_API_KEY absent; never exposes secrets or raw inputs |
| 6  | The no-default-storage boundary has dedicated executable proof that fails if raw request logging or direct persistence seams are introduced | VERIFIED | tests/unit/revora/privacy-minimal.test.ts statically reads source files and asserts: checkFood wired, emitSafeEvent wired, no console.log in route, service imports openai-client (not SDK directly), wrapper has `store: false`, telemetry has no food/a1c/promptText/modelOutput fields |
| 7  | A pause switch can disable public checks without redeploying | VERIFIED | middleware.ts calls evaluateLaunchMode() and returns 503 with friendly copy before any OpenAI call; launch-controls.ts reads Edge Config `public_checks_enabled`; REVORA_LAUNCH_MODE_OVERRIDE test seam available; fail-closed defaults when EDGE_CONFIG absent |
| 8  | Launch thresholds define when to rate-limit, when to pause, and when rollback is required | VERIFIED | shouldPauseForOps() encodes 2,000 checks/24h, harmful-guidance incident, provider-failure spike thresholds; WAF rule (10 req/10 min/IP) documented in runbook; threshold table in docs/ops/launch-controls.md §1 |
| 9  | Rollback steps are documented with post-rollback verification instead of assuming rollback equals recovery | VERIFIED | docs/ops/launch-controls.md §5: vercel rollback → vercel rollback status → vercel logs → GET /api/health → synthetic POST /api/check; each step has explicit evidence slot; "Rollback is not recovery until steps 5.3–5.5 all pass" stated explicitly |

**Score:** 9/9 truths verified

---

### Deferred Items

None.

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `docs/privacy/data-flow.md` | Privacy contract with store:false, allowlist, env boundary | VERIFIED | Contains store:false, raw food/A1C lifetime, abuse-monitoring caveat, Preview/Production boundary, telemetry allowlist |
| `lib/revora/openai-client.ts` | Single server-only wrapper with store:false | VERIFIED | store:false at line 43; server-guard throws if window is defined; 89 lines, substantive |
| `lib/revora/telemetry.ts` | Allowlisted emitSafeEvent | VERIFIED | Zod strict schema; exports emitSafeEvent; 23 lines, no raw fields |
| `lib/revora/env.ts` | getRevoraEnv() with Preview/Production/dev/test detection | VERIFIED | Exports getRevoraEnv(); detectEnvironment() covers all four envs; OPENAI_API_KEY required, EDGE_CONFIG optional |
| `app/api/check/route.ts` | POST route delegating to checkFood + emitSafeEvent | VERIFIED | exports POST only; imports checkFood from service.ts; imports emitSafeEvent from telemetry.ts; no raw body logging |
| `app/api/health/route.ts` | Safe probe returning ok/environment/launch/launchMode | VERIFIED | Exports GET; calls getRevoraEnv() + getLaunchControls(); response shape: ok/environment/launch/launchMode; 503 fallback |
| `lib/revora/launch-controls.ts` | getLaunchControls, evaluateLaunchMode, shouldPauseForOps | VERIFIED | All three functions exported; Edge Config integration with fail-closed defaults; REVORA_LAUNCH_MODE_OVERRIDE non-production seam; 202 lines |
| `middleware.ts` | Pre-model pause gate for /api/check | VERIFIED | Intercepts POST /api/check only; calls evaluateLaunchMode(); returns 503 with friendly copy when paused; public page and /api/health pass through |
| `docs/ops/launch-controls.md` | Runbook with thresholds, WAF, Edge Config, rollback drill | VERIFIED | Contains: 10 req/10 min/IP, 2,000 checks/24h, public_checks_enabled, incident_message, vercel rollback, vercel rollback status, /api/health, SETUP_BLOCKED evidence slots |
| `tests/unit/revora/privacy-minimal.test.ts` | Static audit of full request path | VERIFIED | Reads source files, asserts store:false, checkFood wiring, emitSafeEvent wiring, no SDK imports outside wrapper, no raw fields in telemetry |
| `tests/unit/revora/openai-client.test.ts` | store:false + single-wrapper coverage | VERIFIED | SUMMARY confirms file present; unit test run 40/40 pass across all five suites |
| `tests/unit/revora/telemetry.test.ts` | Allowlist enforcement | VERIFIED | 40/40 pass |
| `tests/unit/revora/env.test.ts` | Env parsing coverage | VERIFIED | 40/40 pass; updated to include launchMode field |
| `tests/unit/revora/launch-controls.test.ts` | 29 tests: thresholds, pause, middleware gate | VERIFIED | 40/40 pass; contains "2,000" (threshold), "maintenance mode" (smoke), tests all plan behaviors |
| `tests/smoke/launch-controls.spec.ts` | Playwright: normal mode, maintenance mode, rate limit | VERIFIED | File exists and is substantive (Playwright stubs for 503/429 responses); maintenance mode test at line 93 |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `app/api/check/route.ts` | `lib/revora/service.ts` | imports checkFood | WIRED | Line 9: `import { checkFood } from "../../../lib/revora/service"` |
| `lib/revora/service.ts` | `lib/revora/openai-client.ts` | imports RevoraModelClient | WIRED | Line 10: `import type { RevoraModelClient } from "./openai-client"` |
| `app/api/check/route.ts` | `lib/revora/telemetry.ts` | emitSafeEvent called after checkFood | WIRED | Lines 11-13: imports emitSafeEvent; called at lines 51 and 65 |
| `app/api/health/route.ts` | `lib/revora/env.ts` | getRevoraEnv() | WIRED | Line 4: `import { getRevoraEnv } from "../../../lib/revora/env"` |
| `app/api/health/route.ts` | `lib/revora/launch-controls.ts` | getLaunchControls() | WIRED | Line 3: `import { getLaunchControls } from "../../../lib/revora/launch-controls"` |
| `middleware.ts` | `lib/revora/launch-controls.ts` | evaluateLaunchMode() | WIRED | Line 17: `import { evaluateLaunchMode } from "./lib/revora/launch-controls"` |
| `docs/privacy/data-flow.md` | `lib/revora/openai-client.ts` | store:false documented and implemented | WIRED | Doc shows `store: false` code block; openai-client.ts line 43 is the live implementation |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `app/api/check/route.ts` | `response` from checkFood | `lib/revora/service.ts` → `lib/revora/openai-client.ts` → OpenAI Responses API | Yes — live model call, no hardcoded stub | FLOWING |
| `app/api/health/route.ts` | `controls` from getLaunchControls | `lib/revora/launch-controls.ts` → Edge Config SDK or safe defaults | Yes — real Edge Config read when configured; fail-closed defaults otherwise | FLOWING |
| `middleware.ts` | `evaluation` from evaluateLaunchMode | `lib/revora/launch-controls.ts` → getLaunchControls | Yes — same shared seam as health probe; no hardcoded state | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All Phase 04 unit tests pass | `npx vitest run tests/unit/revora/privacy-minimal.test.ts tests/unit/revora/openai-client.test.ts tests/unit/revora/telemetry.test.ts tests/unit/revora/env.test.ts tests/unit/revora/launch-controls.test.ts` | 40/40 pass, 5 files | PASS |
| TypeScript typecheck clean | `npm run typecheck` | No errors | PASS |
| Next.js production build | `npm run build` | Clean; routes: /api/check (dynamic), /api/health (dynamic), middleware (Proxy) | PASS |
| No SDK imports outside wrapper | `grep -rn "from 'openai'" app/ components/ lib/client/ lib/revora/service.ts` | No matches | PASS |
| No raw logging in check route or telemetry | `grep -n "console.log\|console.error" app/api/check/route.ts lib/revora/telemetry.ts` | No matches | PASS |
| No TBD/FIXME/XXX debt markers | grep across all phase-modified files | No matches | PASS |
| middleware gates POST only; no GET /api/check exists | `grep -n "GET\|export" app/api/check/route.ts` | Only `export const POST` | PASS |

---

### Probe Execution

Step 7c: No `scripts/*/tests/probe-*.sh` files exist in this project. No probes declared in PLAN files.
SKIPPED — no probe files defined.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| PRIV-01 | 04-01 | MVP does not store raw food descriptions, raw A1C values, or account-linked health data by default | SATISFIED | openai-client.ts: `store: false`; no DB writes, no auth, no history in any file; privacy-minimal.test.ts statically proves the boundary |
| PRIV-02 | 04-01 | OpenAI API calls configured to avoid provider-side response storage where supported | SATISFIED | openai-client.ts line 43: `store: false` on every Responses API call; data-flow.md §Provider storage posture documents the opt-out and the abuse-monitoring caveat |
| PRIV-03 | 04-01 | Analytics and telemetry exclude raw food descriptions and raw A1C values | SATISFIED | telemetry.ts Zod strict schema has no food/a1c/prompt/output fields; emitSafeEvent rejects all non-allowlisted fields at parse time; telemetry.test.ts verifies rejection |
| PRIV-04 | 04-01 | Any launch telemetry is privacy-minimal (pageviews, coarse result class counts, or redacted operational events) | SATISFIED | telemetry emits only: event name, environment, responseKind, risk, latencyBucket, reasonCode — all coarse operational fields with no PII or health-adjacent data |
| OPS-01 | 04-01 | App can be deployed publicly on Vercel from the git repository | SATISFIED (build) / HUMAN NEEDED (Vercel auth) | `npm run build` passes and produces correct route manifest; `npx vercel build` requires `vercel login` — partial; env.ts documents required variables; data-flow.md documents env boundary |
| OPS-02 | 04-02 | Launch plan defines cost/abuse threshold that triggers rate limiting or temporary shutdown | SATISFIED | docs/ops/launch-controls.md threshold table: WAF 10 req/10 min/IP, 2,000 checks/24h operator gate; shouldPauseForOps() encodes thresholds in code |
| OPS-03 | 04-02 | Launch plan includes rollback or kill-switch procedure for harmful guidance incidents | SATISFIED | docs/ops/launch-controls.md §5: full rollback procedure with vercel rollback, vercel rollback status, vercel logs, /api/health probe, synthetic check; Edge Config kill switch documented with pause/restore drill |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | — |

No TBD, FIXME, XXX, TODO, HACK, PLACEHOLDER, or hardcoded empty-data patterns found in any phase-modified implementation file.

---

### Threat Flag Assessment

**middleware-bypass (self-reported in 04-02-SUMMARY.md):** The flag notes that only POST /api/check is gated; a GET /api/check would bypass the pause gate. Verification confirms `app/api/check/route.ts` exports only `export const POST` — no GET handler exists. The middleware correctly filters `request.method !== "POST"`. This is an informational note about a non-existent attack surface, not an active vulnerability. No action required unless a GET handler is added in a future plan.

---

### Human Verification Required

#### 1. Vercel Build Gate (vercel login required)

**Test:** After running `vercel login`, execute `npx vercel build` in the project root.
**Expected:** Build completes without errors; output includes /api/check, /api/health, and middleware (Proxy).
**Why human:** Vercel CLI authentication (`vercel login`) is required. `npm run build` (Next.js production build) was verified and passes, confirming the code is structurally correct for Vercel deployment. The residual gap is the auth-gated build gate only.

#### 2. Vercel Edge Config Setup and Kill-Switch Drill

**Test:** In Vercel Dashboard → Storage → Edge Config, create a store. Set keys: `launch_mode = "normal"`, `public_checks_enabled = true`, `incident_message = "Revora checks are temporarily paused."`. Obtain the connection string and set `EDGE_CONFIG=ecfg_<string>` in Preview and Production scopes. Then: (a) toggle `public_checks_enabled = false` and verify GET /api/health returns `{"ok":false,"environment":"preview","launch":"paused","launchMode":"paused"}` and POST /api/check returns 503 with friendly copy and no stack traces. (b) Restore `public_checks_enabled = true` and verify /api/health returns `{"ok":true,...,"launch":"ready"}`.
**Expected:** Kill switch activates and deactivates in under 30 seconds without redeployment.
**Why human:** Edge Config is external Vercel provider infrastructure. The app code reads it with fail-closed safe defaults when absent; the integration test requires an actual Vercel project and dashboard access.

#### 3. WAF Rate-Limit Rule Publication

**Test:** In Vercel Dashboard → Security → WAF, create rule: name=`revora-check-rate-limit`, path=`/api/check`, limit=10 requests/10 minutes/IP, action=Block (429). Publish the rule. Send 11 rapid POST /api/check requests from the same IP and confirm the 11th returns 429.
**Expected:** 11th request blocked with 429; first 10 succeed.
**Why human:** WAF rules live in Vercel's provider layer. No WAF SDK is embedded in the app. Human must publish the rule and record the rule ID and publication timestamp.

#### 4. Rollback Drill (vercel login + live Production deployment required)

**Test:** With Vercel CLI authenticated and a Production deployment active, execute: `vercel rollback` → record deployment ID; `vercel rollback status` → wait for COMPLETE; `vercel logs --environment production --status-code 5xx --since 5m` → confirm 5xx rate at baseline; `curl https://your-domain.com/api/health` → verify `{"ok":true,"environment":"production","launch":"ready","launchMode":"normal"}`; `curl -s -X POST https://your-domain.com/api/check -H 'Content-Type: application/json' -d '{"food":"apple","a1c":"6.1"}' | jq .kind` → verify `"result"`.
**Expected:** All five post-rollback checks pass. Rollback is not confirmed as recovery until all five pass.
**Why human:** Requires vercel login, a live Production deployment, and real network verification. Steps are documented in docs/ops/launch-controls.md §5 with SETUP_BLOCKED evidence slots; human must execute and fill them in.

---

### Gaps Summary

No automated gaps found. All 9 observable truths are VERIFIED by codebase evidence. All 7 requirements (PRIV-01 through PRIV-04, OPS-01 through OPS-03) are satisfied by code.

The 4 human verification items are external provider setup tasks (Vercel auth, Edge Config, WAF, rollback drill) and one Vercel CLI auth-gated build gate. They do not represent gaps in the code implementation — the code correctly defers to provider infrastructure and documents setup steps with evidence slots. They require a human with Vercel project access to execute and record.

The `npx vercel build` substitution (OPS-01 partial) is the closest to a technical gap: the Next.js production build passes and produces the correct route manifest, but the Vercel-specific build pipeline was not verified due to auth requirements. The build structure is correct for Vercel (app router, nodejs runtime, middleware config). Risk is low.

---

_Verified: 2026-06-19T02:15:00Z_
_Verifier: Claude (gsd-verifier)_
