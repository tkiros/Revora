---
phase: 04
slug: privacy-minimal-launch-controls
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-06
---

# Phase 04 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest for privacy/launch-control units; Playwright for public shutdown smoke; Vercel build/deploy checks |
| **Config file** | Vitest config from Phase 2 scaffold; `playwright.config.ts`; Vercel project settings |
| **Quick run command** | `npx vitest run tests/unit/revora/openai-client.test.ts tests/unit/revora/telemetry.test.ts tests/unit/revora/launch-controls.test.ts` |
| **Full suite command** | `npm run typecheck && npm run build && npx vitest run tests/unit/revora/openai-client.test.ts tests/unit/revora/telemetry.test.ts tests/unit/revora/env.test.ts tests/unit/revora/launch-controls.test.ts && npx playwright test tests/smoke/launch-controls.spec.ts --project="Mobile Chrome"` |
| **Estimated runtime** | ~90 seconds locally, excluding Vercel Preview deployment |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/unit/revora/openai-client.test.ts tests/unit/revora/telemetry.test.ts tests/unit/revora/launch-controls.test.ts`
- **After every plan wave:** Run `npm run typecheck && npm run build && npx vitest run tests/unit/revora/openai-client.test.ts tests/unit/revora/telemetry.test.ts tests/unit/revora/env.test.ts tests/unit/revora/launch-controls.test.ts && npx playwright test tests/smoke/launch-controls.spec.ts --project="Mobile Chrome"`
- **Before `$gsd-verify-work`:** Full suite must be green, Vercel Preview deploy must be verified, and the rollback/kill-switch drill must have recorded command evidence.
- **Max feedback latency:** 120 seconds locally, excluding provider-side Preview deployment time.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | PRIV-01, PRIV-02 | unit + static | `npx vitest run tests/unit/revora/openai-client.test.ts -t "store false|single OpenAI client"` | no - W0 | pending |
| 04-01-02 | 01 | 1 | PRIV-03, PRIV-04 | unit + static | `npx vitest run tests/unit/revora/telemetry.test.ts -t "allowlist|redacts raw"` | no - W0 | pending |
| 04-01-03 | 01 | 1 | OPS-01 | build + config | `npm run typecheck && npm run build && npx vercel build` | no - W0 | pending |
| 04-02-01 | 02 | 2 | OPS-02 | unit + smoke | `npx vitest run tests/unit/revora/launch-controls.test.ts -t "rate limit|pause" && npx playwright test tests/smoke/launch-controls.spec.ts -g "maintenance mode|rate limit" --project="Mobile Chrome"` | no - W0 | pending |
| 04-02-02 | 02 | 2 | OPS-03 | smoke + manual drill | `npx playwright test tests/smoke/launch-controls.spec.ts -g "maintenance mode" --project="Mobile Chrome"` | no - W0 | pending |

*Status: pending, green, red, flaky*

---

## Wave 0 Requirements

- [ ] `package.json` - existing Phase 2/3 app scaffold with scripts for `typecheck`, `build`, Vitest, and Playwright
- [ ] `lib/revora/openai-client.ts` - single server-only OpenAI wrapper that can be tested for `store: false`
- [ ] `lib/revora/telemetry.ts` - allowlisted coarse telemetry event builder with no raw food/A1C fields
- [ ] `lib/revora/env.ts` - Preview/Production environment validation and documented required env names
- [ ] `lib/revora/launch-controls.ts` - Edge Config launch-mode and incident threshold helper seam
- [ ] `middleware.ts` or route-level launch gate - public check pause behavior before model spend
- [ ] `tests/unit/revora/openai-client.test.ts` - proves explicit provider-side storage opt-out
- [ ] `tests/unit/revora/telemetry.test.ts` - proves telemetry excludes raw food, raw A1C, prompt text, and full model output
- [ ] `tests/unit/revora/env.test.ts` - proves Preview/Production env separation and required variables
- [ ] `tests/unit/revora/launch-controls.test.ts` - proves pause/rate-limit decisions and incident threshold behavior
- [ ] `tests/smoke/launch-controls.spec.ts` - proves public maintenance/rate-limit UI never leaks raw errors
- [ ] `docs/ops/launch-controls.md` - Vercel env, WAF, kill-switch, and rollback runbook
- [ ] `docs/privacy/data-flow.md` - raw-input lifetime, telemetry allowlist, provider-storage posture, and no-default-storage boundary

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Vercel Preview deployment uses Preview-only env and no production secret leakage | OPS-01 | Requires provider dashboard or CLI access | Deploy Preview, inspect configured env scope, and record the deployment URL plus env-shape check in the plan summary. |
| WAF rate-limit rule is published for `/api/check` in Production | OPS-02 | Vercel WAF configuration is provider-side | Capture the rule name, path matcher, limit/window, and publish state in `docs/ops/launch-controls.md`. |
| Edge Config kill switch pauses public checks without redeploy | OPS-02, OPS-03 | Requires provider-side Edge Config mutation | Toggle `public_checks_enabled=false`, hit the public check path, confirm friendly pause response, then restore normal mode. |
| Rollback command path is executable and verified | OPS-03 | Requires Vercel deployment history and CLI access | Run or rehearse `vercel rollback`, `vercel rollback status`, and post-rollback log/health checks; record exact command evidence or mark the drill blocked. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all missing references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s locally
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
