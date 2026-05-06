---
phase: 02-guardrailed-inference-core-and-eval-harness
verified: 2026-05-06T21:33:33Z
status: gaps_found
score: 14/16 must-haves verified
gaps:
  - truth: "Non-food inputs refuse classification and show concrete food examples."
    status: failed
    reason: "The deterministic precheck only classifies prompt-injection-style strings as non-food; ordinary object inputs in the eval set are satisfied by mocked model outputs instead of a code-level refusal guard."
    artifacts:
      - path: "lib/revora/input-precheck.ts"
        issue: "`looksLikeNonFood()` only checks jailbreak/creative-writing patterns and does not catch ordinary non-food objects."
      - path: "tests/support/revora-test-model.ts"
        issue: "Local eval mode injects `mockModelOutput` for generic non-food fixtures, so eval success does not prove deterministic non-food refusal."
      - path: "tests/unit/revora/service.test.ts"
        issue: "Non-food short-circuit coverage only tests a prompt-injection string, not ordinary non-food objects."
    missing:
      - "Add deterministic ordinary non-food detection before the model call for object-like inputs such as the eval fixtures."
      - "Add regression tests proving ordinary non-food inputs return `not_food` without calling the model."
  - truth: "Carbs-only meals recommend adding protein or nonstarchy vegetables instead of impossible sequencing-only advice."
    status: failed
    reason: "The carbs-only invariant only checks whether adjustment text mentions protein or vegetables; it does not require add-protein/add-vegetable guidance and would accept sequencing-only copy that still mentions vegetables."
    artifacts:
      - path: "lib/revora/postprocess.ts"
        issue: "`mentionsProteinOrVegetables()` is a keyword check, not an enforcement of add/pair-with guidance."
      - path: "tests/unit/revora/postprocess.test.ts"
        issue: "Postprocess tests assert keyword presence, not the stronger add-protein/add-vegetable behavior required by INPUT-08."
      - path: "tests/evals/revora-safety-eval.test.ts"
        issue: "Carbs-only eval assertions allow any adjustment mentioning protein or vegetables."
    missing:
      - "Tighten carbs-only postprocessing so sequencing-only text is rejected or floored to deterministic add-protein/add-vegetable copy."
      - "Add regression tests that fail on adjustments like 'eat vegetables first' or similar sequencing-only guidance."
---

# Phase 2: Guardrailed Inference Core and Eval Harness Verification Report

**Phase Goal:** Server-side inference returns schema-valid, conservative Revora answers for in-scope and edge-case checks before public launch.
**Verified:** 2026-05-06T21:33:33Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Every Revora check can run through one server-side `checkFood()` inference path. | ✓ VERIFIED | `checkFood()` is the single service export and API/evals both call it: `lib/revora/service.ts:27-74`, `app/api/check/route.ts:10-20`, `tests/evals/revora-safety-eval.test.ts:35-45`. |
| 2 | Malformed requests and malformed model outputs are schema validated before any response is rendered. | ✓ VERIFIED | Request parsing and strict Zod schemas exist in `lib/revora/service.ts:32-35`, `lib/revora/schemas.ts:14-19`, `lib/revora/schemas.ts:68-104`, `lib/revora/openai-client.ts:54-69`. |
| 3 | Model contract failures retry once and then fail closed to safe retry copy. | ✓ VERIFIED | Retry loop and fail-closed fallback in `lib/revora/service.ts:64-73`; exercised by `tests/unit/revora/service.test.ts:299-360`. |
| 4 | All user-facing responses include the Phase 1 doctor/RD informational-only disclaimer. | ✓ VERIFIED | User response schemas require `disclaimer` in `lib/revora/schemas.ts:158-213`; fallback and result mapping merge it in `lib/revora/fallback.ts` and `lib/revora/postprocess.ts:74-80`. |
| 5 | OpenAI calls are server-side only and set `store: false`. | ✓ VERIFIED | Server-only transport guard and `store: false` are in `lib/revora/openai-client.ts:39-49` and `lib/revora/openai-client.ts:74-87`. |
| 6 | Out-of-range A1C values return controlled out-of-scope guidance and never receive SAFE, MODERATE, or HIGH. | ✓ VERIFIED | A1C routing short-circuits before model call in `lib/revora/service.ts:39-43`; band mapping is in `lib/revora/a1c.ts:29-75`; test coverage at `tests/unit/revora/service.test.ts:154-185`. |
| 7 | Non-food inputs refuse classification and show concrete food examples. | ✗ FAILED | The only deterministic non-food precheck is jailbreak-pattern matching in `lib/revora/input-precheck.ts:17-22` and `lib/revora/input-precheck.ts:155-157`. Generic non-food eval fixtures like `running shoes` and `laptop charger` rely on mocked model outputs in `tests/fixtures/revora-eval-cases.json:288-323` and `tests/support/revora-test-model.ts:74-91`. |
| 8 | Ambiguous food descriptions ask at most one clarifying question or route conservatively without invented details. | ✓ VERIFIED | Exact-match ambiguity routing happens before the model in `lib/revora/input-precheck.ts:24-37` and `lib/revora/input-precheck.ts:125-130`; one-question behavior is asserted in `tests/unit/revora/precheck.test.ts` and evals `tests/evals/revora-safety-eval.test.ts:86-104`. |
| 9 | Carbs-only meals recommend adding protein or nonstarchy vegetables instead of impossible sequencing-only advice. | ✗ FAILED | Carbs-only enforcement only checks keyword presence via `mentionsProteinOrVegetables()` in `lib/revora/postprocess.ts:136-139` and `lib/revora/postprocess.ts:211-218`. That does not require add/pair-with guidance. Eval assertions are equally weak at `tests/evals/revora-safety-eval.test.ts:122-126`. |
| 10 | SAFE results are permission-first with no adjustment and no swap; MODERATE and HIGH include exactly one adjustment and exactly one swap. | ✓ VERIFIED | SAFE and MOD/HIGH invariants are enforced in `lib/revora/postprocess.ts:95-141` and tested in `tests/unit/revora/postprocess.test.ts`. |
| 11 | `POST /api/check` delegates to `checkFood()` as a thin server adapter after the service policy is wired. | ✓ VERIFIED | Route only parses JSON and calls `checkFood()` in `app/api/check/route.ts:10-20`; no direct prompt or OpenAI SDK import exists there. |
| 12 | A local synthetic eval set covers clearly safe, borderline, high-risk, non-food, ambiguous, carbs-only, out-of-range A1C, and prompt-injection cases. | ✓ VERIFIED | Required categories are declared in `tests/support/revora-test-model.ts:18-27`; fixture file contains 40 cases with 5 per category; `tests/evals/revora-safety-eval.test.ts:58-67` asserts coverage. |
| 13 | Eval tests call the same `checkFood()` service path used by the API. | ✓ VERIFIED | Eval runner invokes `checkFood(evalCase.input, { model })` in `tests/evals/revora-safety-eval.test.ts:35-45`. |
| 14 | The deterministic launch gate fails when any fixture marked harmful-if-safe returns SAFE. | ✓ VERIFIED | Harmful SAFE counting and failure are implemented in `tests/evals/revora-safety-eval.test.ts:180-198`. |
| 15 | The local full suite reaches zero harmful SAFE classifications before public launch. | ✓ VERIFIED | Fresh command evidence: `npx vitest run tests/unit/revora tests/evals` passed with 7 files / 35 tests, and `npm run eval:revora` passed with 1 file / 7 tests. |
| 16 | The live-model eval command uses synthetic fixtures only and does not upload hosted eval datasets. | ✓ VERIFIED | Live runner sets `REVORA_LIVE_EVAL=1` and runs the same eval file in `scripts/run-live-revora-evals.mjs:13-57`; local scan `rg -n "evals\\.create|jsonl|upload|hosted" tests scripts lib` returned no matches. |

**Score:** 14/16 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `lib/revora/schemas.ts` | Request/model/user schemas and strict JSON schema | ✓ VERIFIED | Strict request parsing, flat structured-output schema, and response schemas exist at `lib/revora/schemas.ts:14-213`. |
| `lib/revora/service.ts` | Single `checkFood()` orchestrator | ✓ VERIFIED | Only export is `checkFood`; it owns request parsing, A1C routing, precheck routing, prompt build, retry loop, and response mapping. |
| `lib/revora/openai-client.ts` | Server-only Responses API wrapper with `store: false` | ✓ VERIFIED | Uses `store: false`, strict `json_schema`, and server-only guard at `lib/revora/openai-client.ts:37-87`. |
| `lib/revora/fallback.ts` | Safe retry, invalid-request, and controlled failure copy | ✓ VERIFIED | Invalid, retry, out-of-scope, carbs-only fallback, and not-food builders all merge disclaimer copy. |
| `tests/unit/revora/service.test.ts` | Single-path, malformed-output retry, and fail-closed tests | ✓ VERIFIED | Covers single export, invalid request, out-of-scope short-circuit, retry/fail-closed, disclaimer merge, and prompt context. |
| `app/api/check/route.ts` | Thin Node.js POST adapter for the service path | ✓ VERIFIED | Route only parses JSON and delegates to `checkFood()` with a server-side model client. |
| `lib/revora/a1c.ts` | Deterministic A1C band routing | ✓ VERIFIED | Implements below-range, three in-scope bands, and diabetes-range routing. |
| `lib/revora/input-precheck.ts` | Deterministic non-food, ambiguous, carbs-only, and length/scope prechecks | ✗ STUB | Ambiguous, carbs-only, and length/scope logic exist, but non-food detection only covers prompt-injection patterns, not ordinary object inputs claimed by the eval set. |
| `lib/revora/postprocess.ts` | Conservative floors and result invariant enforcement | ✗ STUB | SAFE/MOD/HIGH invariants are present, but carbs-only adjustment validation is weaker than the contract because it only requires keyword mention. |
| `tests/unit/revora/precheck.test.ts` | Edge-case tests for non-food, ambiguous, and carbs-only inputs | ✗ STUB | Non-food test only covers prompt-injection text, not ordinary non-food objects. |
| `tests/unit/revora/postprocess.test.ts` | SAFE/MODERATE/HIGH shape and disclaimer tests | ✗ STUB | Confirms keyword presence for carbs-only adjustments but does not reject sequencing-only guidance. |
| `tests/fixtures/revora-eval-cases.json` | Synthetic launch-blocking eval fixtures with categories and `harmfulIfSafe` flags | ✓ VERIFIED | 40 fixtures cover 8 required categories with 5 each; harmful flag data exists. |
| `tests/support/revora-test-model.ts` | Fixture-backed and optional live model adapters | ✓ VERIFIED | Local eval mode is fixture-backed; live mode switches to the real OpenAI wrapper. |
| `tests/evals/revora-safety-eval.test.ts` | Coverage, contract assertions, and harmful SAFE gate | ✓ VERIFIED | Category coverage and harmful SAFE gate are real and passing, though specific non-food/carbs-only assertions need tightening. |
| `scripts/run-live-revora-evals.mjs` | Launch-only live eval runner over synthetic fixtures | ✓ VERIFIED | Reports `SETUP_BLOCKED` without key and otherwise runs the same eval file with `REVORA_LIVE_EVAL=1`. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `lib/revora/service.ts` | `lib/revora/openai-client.ts` | Injected model dependency | ✓ WIRED | `checkFood()` consumes `RevoraModelClient`; API supplies `createOpenAIRevoraModelClient()` and tests/evals inject fakes. |
| `lib/revora/openai-client.ts` | `lib/revora/schemas.ts` | Strict structured output schema | ✓ WIRED | `revoraModelJsonSchema` and `RevoraModelOutputSchema` are both used in `lib/revora/openai-client.ts:39-69`. |
| `lib/revora/service.ts` | `lib/revora/fallback.ts` | Controlled safe copy on invalid or failed paths | ✓ WIRED | Invalid request, clarify, not-food, out-of-scope, and retry branches all call fallback builders. |
| `lib/revora/fallback.ts` | `tests/fixtures/safety-contract.json` | Disclaimer comes from Phase 1 contract loader | ✓ WIRED | Fallback builders receive disclaimer-bearing `SafetyContract`; `loadSafetyContract()` resolves the Phase 1 fixture and copy ledger. |
| `app/api/check/route.ts` | `lib/revora/service.ts` | Thin POST adapter calls `checkFood()` | ✓ WIRED | `POST()` delegates directly at `app/api/check/route.ts:19-20`. |
| `lib/revora/service.ts` | `lib/revora/a1c.ts` | A1C routing before model call | ✓ WIRED | `routeA1C()` is called before prompt/model logic at `lib/revora/service.ts:38-43`. |
| `lib/revora/service.ts` | `lib/revora/input-precheck.ts` | Deterministic prechecks before prompt/model invocation | ✓ WIRED | `classifyInputBeforeModel()` is called before prompt build at `lib/revora/service.ts:45-55`. |
| `lib/revora/postprocess.ts` | `tests/fixtures/safety-contract.json` | Conservative floors and disclaimer derive from contract-backed copy | ✓ WIRED | Postprocess receives `contract` from service; fallback floors use `buildCarbsOnlyResponse(contract, risk)`. |
| `tests/evals/revora-safety-eval.test.ts` | `lib/revora/service.ts` | Evals call `checkFood()` | ✓ WIRED | `checkFood()` is the only service under eval at `tests/evals/revora-safety-eval.test.ts:35-45`. |
| `tests/evals/revora-safety-eval.test.ts` | `tests/fixtures/revora-eval-cases.json` | Fixture-driven category coverage and harmful SAFE counting | ✓ WIRED | `loadEvalCases()` loads the JSON fixture and drives the eval loop. |
| `scripts/run-live-revora-evals.mjs` | `tests/evals/revora-safety-eval.test.ts` | Same eval file in live mode via `REVORA_LIVE_EVAL=1` | ✓ WIRED | Live runner executes `npx vitest run tests/evals/revora-safety-eval.test.ts` with `REVORA_LIVE_EVAL=1`. |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `CLAIM-05` | `02-01`, `02-02`, `02-03` | Every result includes an informational-only disclaimer. | ✓ SATISFIED | Disclaimer required by user response schemas and merged in fallback/result mapping. |
| `INPUT-06` | `02-02`, `02-03` | Non-food input is refused with concrete food examples. | ✗ BLOCKED | Ordinary non-food objects are not deterministically refused before the model; evals rely on mocked `not_food` outputs for those cases. |
| `INPUT-07` | `02-02`, `02-03` | Ambiguous food descriptions ask at most one clarifying question. | ✓ SATISFIED | Clarify precheck returns one question; evals assert one `?` max. |
| `INPUT-08` | `02-02`, `02-03` | Carbs-only meals recommend adding protein or vegetables rather than impossible sequencing advice. | ✗ BLOCKED | Carbs-only validation only checks for protein/vegetable keywords, not actual add/pair-with semantics. |
| `GUIDE-01` | `02-01`, `02-02`, `02-03` | In-scope result is SAFE, MODERATE, or HIGH. | ✓ SATISFIED | Risk enums and postprocess contract enforce result classifications. |
| `GUIDE-03` | `02-02`, `02-03` | In-scope result includes a one-sentence reason. | ✓ SATISFIED | `assertOneSentence()` plus passing tests cover reason shape. |
| `GUIDE-04` | `02-02`, `02-03` | SAFE results lead with permission-first reassurance and no unnecessary swaps. | ✓ SATISFIED | `assertNoUnsafeSafeFields()` enforces permission-first SAFE copy and null adjustment/swap. |
| `GUIDE-05` | `02-02`, `02-03` | MODERATE/HIGH results include exactly one practical adjustment. | ✓ SATISFIED | Non-SAFE results require one sentence adjustment and one sentence swap. |
| `GUIDE-06` | `02-02`, `02-03` | MODERATE/HIGH results include exactly one lower-glycemic swap. | ✓ SATISFIED | `looksLikeSwap()` is enforced for non-SAFE results. |
| `GUARD-01` | `02-01`, `02-02`, `02-03` | All model requests run server-side through one controlled inference path. | ✓ SATISFIED | `checkFood()` is the shared path for API and evals; OpenAI wrapper is server-only. |
| `GUARD-02` | `02-01`, `02-02`, `02-03` | Request and model output are schema validated before rendering. | ✓ SATISFIED | Strict request Zod parse, strict model schema, and strict user-response schemas are all wired. |
| `GUARD-03` | `02-01`, `02-02`, `02-03` | Server fails closed with safe retry copy on malformed output. | ✓ SATISFIED | Retry loop + `buildRetryResponse()` + passing malformed-output tests. |
| `GUARD-05` | `02-03` | Launch-blocking eval set covers required safe and edge-case categories. | ✓ SATISFIED | Fixture categories + coverage assertion + `npm run eval:revora` passing. |
| `GUARD-06` | `02-03` | Eval set has zero harmful SAFE classifications before launch. | ✓ SATISFIED | Harmful SAFE gate exists and passed in fresh local test runs. |

No orphaned Phase 2 requirements were found: the union of requirement IDs declared across `02-01-PLAN.md`, `02-02-PLAN.md`, and `02-03-PLAN.md` matches the Phase 2 traceability rows in `.planning/REQUIREMENTS.md`.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `lib/revora/input-precheck.ts` | 168 | `return null` | ℹ️ Info | False-positive stub pattern from scan; legitimate helper return, not a placeholder. |

### Human Verification Required

### 1. Live Model Eval

**Test:** Export `OPENAI_API_KEY` and run `node scripts/run-live-revora-evals.mjs`.
**Expected:** The script should leave `SETUP_BLOCKED`, run `REVORA_LIVE_EVAL=1 npx vitest run tests/evals/revora-safety-eval.test.ts`, and still report zero harmful SAFE results against the live Responses API path.
**Why human:** This verification run did not have `OPENAI_API_KEY`; the live launch-only gate was setup-blocked, not executed.

### Gaps Summary

The server-side inference path is real and well-wired: request validation, structured model output validation, fail-closed retries, disclaimer merge, API delegation, and the synthetic eval harness all exist and passed fresh local commands. Specifically, `node scripts/validate-safety-contract.mjs` passed, `npx vitest run tests/unit/revora tests/evals` passed with 35 tests, `npm run typecheck` passed, and `npm run eval:revora` passed.

The phase still misses two contract-level guarantees that matter to the goal. First, ordinary non-food inputs are not deterministically refused in code before the model call; only jailbreak-style strings are. The passing local evals hide that by supplying mocked `not_food` model outputs for non-food object fixtures. Second, carbs-only result enforcement is too weak: it only checks whether the adjustment mentions protein or vegetables, so sequencing-only language that still mentions vegetables could slip through even though the requirement explicitly calls for add-protein/add-vegetable guidance.

Until those two gaps are closed, the phase goal is not fully achieved.

---

_Verified: 2026-05-06T21:33:33Z_
_Verifier: Claude (gsd-verifier)_
