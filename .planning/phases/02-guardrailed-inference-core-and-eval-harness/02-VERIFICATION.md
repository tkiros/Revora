---
phase: 02-guardrailed-inference-core-and-eval-harness
verified: 2026-05-29T18:23:58Z
status: passed
score: "16/16 must-haves verified"
re_verification:
  previous_status: gaps_found
  previous_score: "14/16"
  gaps_closed:
    - "Non-food inputs refuse classification and show concrete food examples."
    - "Carbs-only meals recommend adding protein or nonstarchy vegetables instead of impossible sequencing-only advice."
  gaps_remaining: []
  regressions: []
human_verification_completed:
  approved_at: 2026-05-29T18:36:06Z
  approved_by: user
  note: "Live-model verification checkpoint approved by user."
human_verification:
  - test: "Run live Revora evals with OPENAI_API_KEY"
    status: approved
    expected: "`node scripts/run-live-revora-evals.mjs` should run `REVORA_LIVE_EVAL=1 npx vitest run tests/evals/revora-safety-eval.test.ts` against the same synthetic fixtures and still report zero harmful SAFE results."
    why_human: "This verification environment did not have OPENAI_API_KEY, so the live OpenAI path remained setup-blocked."
---

# Phase 2: Guardrailed Inference Core and Eval Harness Verification Report

**Phase Goal:** Server-side inference returns schema-valid, conservative Revora answers for in-scope and edge-case checks before public launch.
**Verified:** 2026-05-29T18:23:58Z
**Status:** passed
**Re-verification:** Yes — after gap closure

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Every Revora check can run through one server-side `checkFood()` inference path. | ✓ VERIFIED | `checkFood()` remains the only core service export and both API/evals call it: `tests/unit/revora/service.test.ts:131-134`, `app/api/check/route.ts:3-20`, `tests/evals/revora-safety-eval.test.ts:35-44`. |
| 2 | Malformed requests and malformed model outputs are schema validated before any response is rendered. | ✓ VERIFIED | Request parsing is strict in `lib/revora/service.ts:31-35`; schemas are explicit in `lib/revora/schemas.ts:14-153`; live model output is JSON-parsed then Zod-validated in `lib/revora/openai-client.ts:39-70`. |
| 3 | Model contract failures retry once and then fail closed to safe retry copy. | ✓ VERIFIED | Retry/fail-closed logic is in `lib/revora/service.ts:64-73`; regression coverage passes in `tests/unit/revora/service.test.ts:301-346`. |
| 4 | All user-facing responses include the Phase 1 doctor/RD informational-only disclaimer. | ✓ VERIFIED | User response schemas require `disclaimer` in `lib/revora/schemas.ts:158-213`; fallback builders attach it in `lib/revora/fallback.ts:28-102`; service tests assert merge behavior in `tests/unit/revora/service.test.ts:349-417`. |
| 5 | OpenAI calls are server-side only and set `store: false`. | ✓ VERIFIED | The wrapper sets `store: false` in `lib/revora/openai-client.ts:39-50` and throws if used client-side or without `OPENAI_API_KEY` in `lib/revora/openai-client.ts:74-84`. |
| 6 | Out-of-range A1C values return controlled out-of-scope guidance and never receive SAFE, MODERATE, or HIGH. | ✓ VERIFIED | Deterministic routing lives in `lib/revora/a1c.ts:40-82` and short-circuits before the model in `lib/revora/service.ts:39-43`; tests cover both below-range and high-range cases in `tests/unit/revora/service.test.ts:154-184`. |
| 7 | Non-food inputs refuse classification and show concrete food examples. | ✓ VERIFIED | Ordinary-object refusals are now hard-coded before the model in `lib/revora/input-precheck.ts:24-35`, `lib/revora/input-precheck.ts:131-135`, and `lib/revora/input-precheck.ts:168-172`; direct and service-level regressions pass in `tests/unit/revora/precheck.test.ts:13-26` and `tests/unit/revora/non-food-short-circuit.test.ts:13-37`; local eval mode now throws if `non_food` fixtures try to use mocked model output in `tests/support/revora-test-model.ts:69-99`. |
| 8 | Ambiguous food descriptions ask at most one clarifying question or route conservatively without invented details. | ✓ VERIFIED | Ambiguous exact matches still return one question in `lib/revora/input-precheck.ts:138-143` and `lib/revora/input-precheck.ts:175-184`; tests assert a single `?` in `tests/unit/revora/precheck.test.ts:37-47` and `tests/evals/revora-safety-eval.test.ts:120-137`. |
| 9 | Carbs-only meals recommend adding protein or nonstarchy vegetables instead of impossible sequencing-only advice. | ✓ VERIFIED | Carbs-only validation now requires add/pair-with semantics and rejects sequencing-only phrasing in `lib/revora/postprocess.ts:136-170` and `lib/revora/postprocess.ts:205-236`; unit/service/eval regressions pass in `tests/unit/revora/postprocess.test.ts:84-155`, `tests/unit/revora/carbs-only-floor.test.ts:7-34`, and `tests/evals/revora-safety-eval.test.ts:140-172`. |
| 10 | SAFE results are permission-first with no adjustment and no swap; MODERATE and HIGH include exactly one adjustment and exactly one swap. | ✓ VERIFIED | Result invariants remain enforced in `lib/revora/postprocess.ts:84-141`; tests cover SAFE and non-SAFE rules in `tests/unit/revora/postprocess.test.ts:48-82`; eval contract checks remain in `tests/evals/revora-safety-eval.test.ts:189-222`. |
| 11 | `POST /api/check` delegates to `checkFood()` as a thin server adapter after the service policy is wired. | ✓ VERIFIED | The route only parses JSON and calls `checkFood()` in `app/api/check/route.ts:10-20`. |
| 12 | A local synthetic eval set covers clearly safe, borderline, high-risk, non-food, ambiguous, carbs-only, out-of-range A1C, and prompt-injection cases. | ✓ VERIFIED | Required categories are declared in `tests/support/revora-test-model.ts:18-32`; evals assert at least five fixtures per category in `tests/evals/revora-safety-eval.test.ts:92-101`; the local suite passed with 8 eval tests. |
| 13 | Eval tests call the same `checkFood()` service path used by the API. | ✓ VERIFIED | Eval execution loops through `checkFood(evalCase.input, { model })` in `tests/evals/revora-safety-eval.test.ts:35-44`. |
| 14 | The deterministic launch gate fails when any fixture marked harmful-if-safe returns SAFE. | ✓ VERIFIED | Harmful SAFE counting and hard failure remain in `tests/evals/revora-safety-eval.test.ts:225-243`. |
| 15 | The local full suite reaches zero harmful SAFE classifications before public launch. | ✓ VERIFIED | Fresh verification commands passed: `node scripts/validate-safety-contract.mjs`; `npx vitest run tests/unit/revora tests/evals` (10 files, 55 tests); `npm run eval:revora` (1 file, 8 tests); `npm run typecheck`. |
| 16 | The live-model eval command uses synthetic fixtures only and does not upload hosted eval datasets. | ✓ VERIFIED | The live runner reuses `tests/evals/revora-safety-eval.test.ts` with `REVORA_LIVE_EVAL=1` in `scripts/run-live-revora-evals.mjs:7-29` and `scripts/run-live-revora-evals.mjs:41-48`; live mode in `tests/support/revora-test-model.ts:62-63` swaps to the real OpenAI client only; `grep -RInE 'evals\\.create|jsonl|upload|hosted' tests scripts lib` returned no matches. |

**Score:** 16/16 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `lib/revora/schemas.ts` | Strict request/model/user response schemas | ✓ VERIFIED | Explicit request, model, and user schemas plus strict JSON schema at `lib/revora/schemas.ts:14-213`. |
| `lib/revora/service.ts` | Single server-side `checkFood()` orchestrator | ✓ VERIFIED | Owns request parsing, A1C routing, prechecks, retry loop, and response mapping at `lib/revora/service.ts:27-101`. |
| `lib/revora/openai-client.ts` | Server-only Responses API wrapper with `store: false` | ✓ VERIFIED | Enforces server-only execution, `store: false`, strict JSON schema, and Zod parse at `lib/revora/openai-client.ts:27-88`. |
| `lib/revora/fallback.ts` | Controlled retry/out-of-scope/not-food/carbs-only copy with disclaimer | ✓ VERIFIED | Safe fallback builders remain centralized at `lib/revora/fallback.ts:28-123`. |
| `lib/revora/a1c.ts` | Deterministic in-scope vs out-of-scope routing | ✓ VERIFIED | A1C band routing remains explicit at `lib/revora/a1c.ts:40-82`. |
| `lib/revora/input-precheck.ts` | Deterministic non-food, ambiguous, and carbs-only prechecks | ✓ VERIFIED | Now includes narrow ordinary-object non-food patterns and still short-circuits before ambiguity/model logic at `lib/revora/input-precheck.ts:24-35` and `lib/revora/input-precheck.ts:114-199`. |
| `lib/revora/postprocess.ts` | Conservative floors and invariant enforcement | ✓ VERIFIED | Semantic carbs-only guard plus deterministic flooring via `buildCarbsOnlyResponse()` at `lib/revora/postprocess.ts:113-237`. |
| `app/api/check/route.ts` | Thin POST adapter over `checkFood()` | ✓ VERIFIED | Route stays minimal at `app/api/check/route.ts:10-20`. |
| `tests/unit/revora/service.test.ts` | Core path, fail-closed, disclaimer, and routing regressions | ✓ VERIFIED | Covers single export, invalid request, out-of-scope, retry/fail-closed, carbs-only floors, and disclaimer merge at `tests/unit/revora/service.test.ts:131-419`. |
| `tests/unit/revora/precheck.test.ts` | Direct precheck coverage for non-food, ambiguous, and carbs-only inputs | ✓ VERIFIED | Includes ordinary-object refusal and real-food non-match coverage at `tests/unit/revora/precheck.test.ts:13-71`. |
| `tests/unit/revora/non-food-short-circuit.test.ts` | Service-level proof that ordinary objects bypass the model | ✓ VERIFIED | Asserts `not_food` plus zero `model.generate()` calls at `tests/unit/revora/non-food-short-circuit.test.ts:13-37`. |
| `tests/unit/revora/postprocess.test.ts` | Result invariant and carbs-only semantic regressions | ✓ VERIFIED | Rejects sequencing-only copy and accepts add/pair-with guidance at `tests/unit/revora/postprocess.test.ts:84-155`. |
| `tests/unit/revora/carbs-only-floor.test.ts` | Service-level flooring regression for sequencing-only model output | ✓ VERIFIED | `checkFood()` floors invalid carbs-only prose to deterministic fallback at `tests/unit/revora/carbs-only-floor.test.ts:7-34`. |
| `tests/unit/revora/revora-test-model.test.ts` | Eval harness guard regression for deterministic short-circuit categories | ✓ VERIFIED | Confirms local `non_food` fixtures may not define `mockModelOutput` at `tests/unit/revora/revora-test-model.test.ts:12-69`. |
| `tests/fixtures/revora-eval-cases.json` | Synthetic launch-blocking fixture corpus | ✓ VERIFIED | Non-food fixtures at `tests/fixtures/revora-eval-cases.json:288-326` no longer include `mockModelOutput`; local command confirmed all five `non_food` fixtures are mock-free. |
| `tests/support/revora-test-model.ts` | Fixture-backed local eval client and live toggle | ✓ VERIFIED | Rejects mocked outputs for deterministic `non_food` cases in local mode and switches to the live client only when `REVORA_LIVE_EVAL=1` in `tests/support/revora-test-model.ts:59-109`. |
| `tests/evals/revora-safety-eval.test.ts` | Coverage, contract checks, category assertions, harmful SAFE gate | ✓ VERIFIED | Evals assert category coverage, non-food refusal, carbs-only semantics, output contract, and zero harmful SAFE at `tests/evals/revora-safety-eval.test.ts:92-243`. |
| `scripts/run-live-revora-evals.mjs` | Launch-time live eval runner over synthetic fixtures | ✓ VERIFIED | Reuses the same eval file and reports `SETUP_BLOCKED` without a key at `scripts/run-live-revora-evals.mjs:13-57`. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `lib/revora/service.ts` | `lib/revora/input-precheck.ts` | Pre-model short-circuit via `classifyInputBeforeModel()` | ✓ WIRED | `checkFood()` calls the precheck before prompt/model generation at `lib/revora/service.ts:45-55`; ordinary-object bypass is proven in `tests/unit/revora/non-food-short-circuit.test.ts:21-36`. |
| `lib/revora/service.ts` | `lib/revora/a1c.ts` | Deterministic A1C routing before any model call | ✓ WIRED | `routeA1C()` runs before the precheck/model path at `lib/revora/service.ts:38-43`. |
| `lib/revora/service.ts` | `lib/revora/fallback.ts` | Invalid/clarify/not-food/out-of-scope/retry response builders | ✓ WIRED | Fallback builders are used on every controlled branch in `lib/revora/service.ts:34-35`, `lib/revora/service.ts:41-52`, and `lib/revora/service.ts:73`. |
| `lib/revora/openai-client.ts` | `lib/revora/schemas.ts` | Strict structured output schema | ✓ WIRED | The OpenAI wrapper sends `revoraModelJsonSchema` and parses with `RevoraModelOutputSchema` at `lib/revora/openai-client.ts:43-49` and `lib/revora/openai-client.ts:59-70`. |
| `app/api/check/route.ts` | `lib/revora/service.ts` | Thin POST adapter calls `checkFood()` | ✓ WIRED | `POST()` delegates directly at `app/api/check/route.ts:19-20`. |
| `lib/revora/postprocess.ts` | `lib/revora/fallback.ts` | Invalid carbs-only outputs floor to `buildCarbsOnlyResponse()` | ✓ WIRED | Carbs-only floors call `buildFloorDraft()`/`buildCarbsOnlyResponse()` in `lib/revora/postprocess.ts:163-170` and `lib/revora/postprocess.ts:181-196`. |
| `tests/unit/revora/carbs-only-floor.test.ts` | `lib/revora/service.ts` | Sequencing-only model output is floored through `checkFood()` | ✓ WIRED | Service-level regression invokes `checkFood()` and asserts deterministic fallback copy at `tests/unit/revora/carbs-only-floor.test.ts:24-33`. |
| `tests/fixtures/revora-eval-cases.json` | `tests/support/revora-test-model.ts` | Local non-food fixtures omit `mockModelOutput`, so model access would fail | ✓ WIRED | Fixture block at `tests/fixtures/revora-eval-cases.json:288-326` has no mock outputs; local client throws if such a case reaches the model in `tests/support/revora-test-model.ts:96-99`. |
| `tests/support/revora-test-model.ts` | `lib/revora/openai-client.ts` | Live eval mode switches from fixture client to real OpenAI wrapper | ✓ WIRED | `createEvalModelClient()` returns `createOpenAIRevoraModelClient()` only when `REVORA_LIVE_EVAL=1` at `tests/support/revora-test-model.ts:59-64`. |
| `tests/evals/revora-safety-eval.test.ts` | `lib/revora/service.ts` | Evals exercise final user-facing output through `checkFood()` | ✓ WIRED | Eval loop calls `checkFood(evalCase.input, { model })` at `tests/evals/revora-safety-eval.test.ts:35-44`. |
| `tests/evals/revora-safety-eval.test.ts` | `tests/fixtures/revora-eval-cases.json` | Fixture-driven coverage and harmful SAFE gate | ✓ WIRED | `loadEvalCases()` drives category coverage and run generation at `tests/evals/revora-safety-eval.test.ts:35-47` and `tests/evals/revora-safety-eval.test.ts:92-243`. |
| `scripts/run-live-revora-evals.mjs` | `tests/evals/revora-safety-eval.test.ts` | Same eval file in live mode via `REVORA_LIVE_EVAL=1` | ✓ WIRED | Live runner invokes `npx vitest run tests/evals/revora-safety-eval.test.ts` with `REVORA_LIVE_EVAL=1` at `scripts/run-live-revora-evals.mjs:22-29` and `scripts/run-live-revora-evals.mjs:45-48`. |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `CLAIM-05` | `02-01`, `02-02`, `02-03` | Every result includes an informational-only disclaimer that tells the user to consult a doctor or registered dietitian for personalized medical guidance. | ✓ SATISFIED | `lib/revora/schemas.ts:158-213`, `lib/revora/fallback.ts:28-102`, `tests/unit/revora/service.test.ts:349-417`. |
| `INPUT-06` | `02-02`, `02-03`, `02-04` | The app handles non-food input by refusing to classify it and showing concrete food examples. | ✓ SATISFIED | `lib/revora/input-precheck.ts:131-135` and `lib/revora/input-precheck.ts:168-172`; `tests/unit/revora/precheck.test.ts:13-26`; `tests/unit/revora/non-food-short-circuit.test.ts:13-37`; `tests/support/revora-test-model.ts:69-99`. |
| `INPUT-07` | `02-02`, `02-03` | The app handles ambiguous food descriptions by asking at most one clarifying question instead of inventing meal details. | ✓ SATISFIED | `lib/revora/input-precheck.ts:138-143` and `lib/revora/input-precheck.ts:175-184`; `tests/unit/revora/precheck.test.ts:37-47`; `tests/evals/revora-safety-eval.test.ts:120-137`. |
| `INPUT-08` | `02-02`, `02-03`, `02-05` | The app handles carbs-only meals by recommending adding protein or vegetables instead of giving an impossible sequencing instruction. | ✓ SATISFIED | `lib/revora/postprocess.ts:136-170` and `lib/revora/postprocess.ts:205-236`; `tests/unit/revora/postprocess.test.ts:84-155`; `tests/unit/revora/carbs-only-floor.test.ts:7-34`; `tests/evals/revora-safety-eval.test.ts:140-172`. |
| `GUIDE-01` | `02-01`, `02-02`, `02-03` | User receives a result classified as SAFE, MODERATE, or HIGH when the food and A1C inputs are in scope. | ✓ SATISFIED | `lib/revora/schemas.ts:23-40`; `lib/revora/postprocess.ts:32-81`; `tests/unit/revora/postprocess.test.ts:37-46`. |
| `GUIDE-03` | `02-02`, `02-03` | Each in-scope result includes a one-sentence plain-English reason for the classification. | ✓ SATISFIED | `lib/revora/postprocess.ts:84-93`; `tests/evals/revora-safety-eval.test.ts:204-205`. |
| `GUIDE-04` | `02-02`, `02-03` | SAFE results lead with permission-first reassurance and do not include unnecessary swaps. | ✓ SATISFIED | `lib/revora/postprocess.ts:95-111`; `tests/unit/revora/postprocess.test.ts:57-66`. |
| `GUIDE-05` | `02-02`, `02-03`, `02-05` | MODERATE and HIGH results include exactly one practical sequencing, eating-speed, or add-protein/add-vegetable instruction. | ✓ SATISFIED | `lib/revora/postprocess.ts:121-140`; `tests/unit/revora/postprocess.test.ts:68-116`; `tests/evals/revora-safety-eval.test.ts:218-220`. |
| `GUIDE-06` | `02-02`, `02-03`, `02-05` | MODERATE and HIGH results include exactly one practical lower-glycemic swap. | ✓ SATISFIED | `lib/revora/postprocess.ts:130-133`; `lib/revora/postprocess.ts:163-170`; `tests/evals/revora-safety-eval.test.ts:219-221`. |
| `GUARD-01` | `02-01`, `02-02`, `02-03`, `02-04` | All model requests run server-side through a single controlled inference path. | ✓ SATISFIED | `lib/revora/service.ts:27-73`; `app/api/check/route.ts:3-20`; `lib/revora/openai-client.ts:74-84`. |
| `GUARD-02` | `02-01`, `02-02`, `02-03` | The server validates request input and model output against explicit schemas before rendering a result. | ✓ SATISFIED | `lib/revora/service.ts:31-35`; `lib/revora/schemas.ts:14-153`; `lib/revora/openai-client.ts:54-70`. |
| `GUARD-03` | `02-01`, `02-02`, `02-03` | The server fails closed with safe retry copy when model output is malformed, incomplete, or outside the allowed schema. | ✓ SATISFIED | `lib/revora/service.ts:64-73`; `tests/unit/revora/service.test.ts:301-346`. |
| `GUARD-05` | `02-03`, `02-04`, `02-05` | A launch-blocking evaluation set covers clearly safe foods, borderline foods, high-risk foods, non-food input, ambiguous input, carbs-only meals, and out-of-range A1C values. | ✓ SATISFIED | `tests/support/revora-test-model.ts:18-32`; `tests/evals/revora-safety-eval.test.ts:92-101`; `tests/fixtures/revora-eval-cases.json`; local eval run passed. |
| `GUARD-06` | `02-03`, `02-05` | The evaluation set has zero harmful SAFE classifications before public launch. | ✓ SATISFIED | `tests/evals/revora-safety-eval.test.ts:225-243`; `npx vitest run tests/unit/revora tests/evals`; `npm run eval:revora`. |

All 14 requirement IDs declared across `02-01` through `02-05` plans are present in `.planning/REQUIREMENTS.md`; no orphaned Phase 2 requirements were found. Note: the traceability status column in `.planning/REQUIREMENTS.md` still marks `INPUT-06` and `INPUT-08` as Pending, but current code and test evidence above satisfies both requirements.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `None` | - | No TODO/FIXME/placeholder/empty-implementation blockers found in the 02-04 and 02-05 key files. | ℹ️ Info | Automated scan only surfaced `return null` at `lib/revora/input-precheck.ts:184`, which is a normal helper return and not a stub. |

### Human Verification Required

Completed — the live-model verification checkpoint was approved by the user on 2026-05-29T18:36:06Z.

### Gaps Summary

All previously reported code-level gaps are closed. Ordinary object-like non-food inputs now refuse deterministically before the model seam, and carbs-only outputs now reject or floor sequencing-only guidance to deterministic add-protein/add-vegetable copy. Fresh validation, unit/eval, and typecheck commands all passed.

**No gaps found.** Phase goal achieved and approved to proceed.

---

_Verified: 2026-05-29T18:23:58Z_
_Verifier: Claude (gsd-verifier)_
