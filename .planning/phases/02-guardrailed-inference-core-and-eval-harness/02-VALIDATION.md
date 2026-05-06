---
phase: 02
slug: guardrailed-inference-core-and-eval-harness
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-06
---

# Phase 02 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.5 for Phase 2 unit/eval tests, plus Phase 1 Node static validator |
| **Config file** | none currently - Wave 0 creates `vitest.config.ts` if no app/test scaffold exists |
| **Quick run command** | `node scripts/validate-safety-contract.mjs && npx vitest run tests/unit/revora` |
| **Full suite command** | `node scripts/validate-safety-contract.mjs && npx vitest run tests/unit/revora tests/evals` |
| **Launch live command** | `REVORA_LIVE_EVAL=1 npx vitest run tests/evals/revora-safety-eval.test.ts` |
| **Estimated runtime** | ~60 seconds for local unit/eval suite |

---

## Sampling Rate

- **After every task commit:** Run `node scripts/validate-safety-contract.mjs && npx vitest run tests/unit/revora`
- **After every plan wave:** Run `node scripts/validate-safety-contract.mjs && npx vitest run tests/unit/revora tests/evals`
- **Before `$gsd-verify-work`:** Full suite must be green, and launch live command must report zero harmful SAFE results when model credentials are available
- **Max feedback latency:** 60 seconds for local checks

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-00 | 01 | 0 | GUARD-01, GUARD-02, GUARD-03 | scaffold/prereq | `node scripts/validate-safety-contract.mjs && npx vitest run tests/unit/revora/schemas.test.ts` | No - Wave 0 | pending |
| 02-01-01 | 01 | 1 | GUARD-01, GUARD-02 | schema/service | `npx vitest run tests/unit/revora/schemas.test.ts tests/unit/revora/service.test.ts -t single-path` | No - Wave 0 | pending |
| 02-01-02 | 01 | 1 | GUARD-03, CLAIM-05 | unit/contract | `npx vitest run tests/unit/revora/service.test.ts -t malformed && npx vitest run tests/unit/revora/postprocess.test.ts -t disclaimer` | No - Wave 0 | pending |
| 02-02-01 | 02 | 2 | INPUT-06, INPUT-07, INPUT-08 | precheck/eval | `npx vitest run tests/unit/revora/precheck.test.ts tests/evals/revora-safety-eval.test.ts -t "non-food|ambiguous|carbs-only"` | No - Wave 0 | pending |
| 02-02-02 | 02 | 2 | GUIDE-01, GUIDE-03, GUIDE-04, GUIDE-05, GUIDE-06 | postprocess/eval | `npx vitest run tests/unit/revora/postprocess.test.ts tests/evals/revora-safety-eval.test.ts -t "safe|adjustment|swap|reason"` | No - Wave 0 | pending |
| 02-03-01 | 03 | 3 | GUARD-05 | eval coverage | `npx vitest run tests/evals/revora-safety-eval.test.ts -t covers` | No - Wave 0 | pending |
| 02-03-02 | 03 | 3 | GUARD-06 | launch gate | `npx vitest run tests/evals/revora-safety-eval.test.ts -t "zero harmful SAFE"` | No - Wave 0 | pending |
| 02-03-03 | 03 | 3 | CLAIM-05, GUARD-01, GUARD-02, GUARD-03, GUARD-05, GUARD-06 | full suite | `node scripts/validate-safety-contract.mjs && npx vitest run tests/unit/revora tests/evals` | No - Wave 0 | pending |

*Status: pending, green, red, flaky*

---

## Wave 0 Requirements

- [ ] Phase 1 prerequisite check: `node scripts/validate-safety-contract.mjs` passes and blocks Phase 2 if Phase 1 safety artifacts are absent.
- [ ] `package.json` and Next.js/TypeScript scaffold if no app/test stack exists.
- [ ] `vitest.config.ts` - local unit/eval test configuration.
- [ ] Runtime dependencies: `openai@6.36.0` and `zod@4.4.3`.
- [ ] Dev dependencies: `vitest@4.1.5`, `typescript@6.0.3`, and `@types/node`.
- [ ] `lib/revora/schemas.ts` - request, model-output, and user-response schemas.
- [ ] `lib/revora/service.ts` - single `checkFood()` orchestrator used by API, tests, and evals.
- [ ] `lib/revora/openai-client.ts` - server-only Responses API wrapper with `store: false`.
- [ ] `lib/revora/postprocess.ts` and `lib/revora/fallback.ts` - disclaimer merge, invariants, retry/refusal copy.
- [ ] `lib/revora/input-precheck.ts` and `lib/revora/a1c.ts` - deterministic edge-case and A1C scope handling from Phase 1 policy.
- [ ] `tests/fixtures/revora-eval-cases.json` - synthetic launch-blocking eval set.
- [ ] `tests/unit/revora/*.test.ts` - schema, policy, post-processing, service, and malformed-output tests.
- [ ] `tests/evals/revora-safety-eval.test.ts` - category coverage and harmful-SAFE gate.
- [ ] `scripts/run-live-revora-evals.mjs` or equivalent npm script - launch-only live model eval command using synthetic fixtures.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live model launch gate | GUARD-06 | Local deterministic fixtures prove orchestration and mocked behavior; launch confidence also needs live Responses API behavior when credentials are available. | Run `REVORA_LIVE_EVAL=1 npx vitest run tests/evals/revora-safety-eval.test.ts` before public launch and record that harmful SAFE count is zero. |
| Food-risk calibration against Phase 1 safety contract | GUIDE-01, GUIDE-04, GUIDE-05, GUIDE-06, GUARD-04 | Phase 1 safety docs are planned but not executed at planning time; final calibration depends on their executed wording and fixtures. | Review result examples against `docs/safety/a1c-band-rubric.md` and `docs/safety/tone-uncertainty-policy.md`; confirm SAFE is not over-reassuring and MODERATE/HIGH include exactly one adjustment and one swap. |
| Privacy posture for hosted evals | GUARD-05 | Phase 2 intentionally keeps evals local and synthetic; hosted eval use depends on Phase 4 privacy decisions. | Do not upload eval datasets or outputs to hosted eval systems during Phase 2 unless a later privacy plan explicitly approves it. |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
