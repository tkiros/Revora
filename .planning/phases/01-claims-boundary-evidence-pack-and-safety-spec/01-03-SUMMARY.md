---
phase: 01-claims-boundary-evidence-pack-and-safety-spec
plan: "03"
subsystem: testing
tags: [safety, tone, uncertainty, copy, markdown, node]
requires:
  - phase: 01-01
    provides: claims boundary, evidence pack, validator scaffold, and active copy ledger structure
  - phase: 01-02
    provides: deterministic A1C routing and qualitative conservatism ladder
provides:
  - Permission-first tone rules for SAFE, MODERATE, HIGH, clarification, refusal, and out-of-scope states
  - Conservative uncertainty floors for ambiguous, carb-only, upper-band, non-food, and high-sugar edge cases
  - Approved prompt, result, refusal, and launch copy examples enforced by the safety validator
affects: [phase-02-guardrailed-inference-core, prompts, result-copy, launch-copy, safety-evals]
tech-stack:
  added: []
  patterns: [permission-first safe framing, conservative uncertainty floors, validator-enforced approved active copy]
key-files:
  created: []
  modified: [docs/safety/tone-uncertainty-policy.md, docs/safety/claims-boundary.md, docs/safety/copy-ledger.md, scripts/validate-safety-contract.mjs]
key-decisions:
  - "SAFE copy should reassure first and should not add an unnecessary swap when the meal already fits."
  - "Uncertain or under-described meals should move toward the more conservative allowed classification rather than toward reassuring SAFE output."
  - "Approved clarification, refusal, and prompt-policy strings need explicit claim classes and validator coverage so the copy contract stays enforceable."
patterns-established:
  - "Tone Gate: SAFE, MODERATE, HIGH, clarification, refusal, and out-of-scope states each use distinct wording rules."
  - "Floor Gate: borderline or conflicting cases escalate to the more conservative allowed path instead of improvised reassurance."
  - "Copy Example Gate: active prompt and result examples are approved rows that the validator now requires."
requirements-completed: [CLAIM-01, CLAIM-02, CLAIM-03, GUIDE-07, GUARD-04]
duration: 5min
completed: 2026-05-06
---

# Phase 01 Plan 03: Tone And Uncertainty Policy Summary

**Permission-first SAFE language, conservative uncertainty floors, and validator-enforced approved copy examples for Revora's active result and launch surfaces**

## Performance

- **Duration:** 5 min
- **Started:** 2026-05-06T19:31:48Z
- **Completed:** 2026-05-06T19:36:57Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Rewrote the tone policy into explicit response-state rules for SAFE, MODERATE, HIGH, clarification, refusal, and out-of-scope cases, plus approved and banned phrase banks.
- Locked a named Conservative Floors section that defines minimum behavior for non-food, ambiguous, carb-only, upper-band, sugary-drink/dessert, and conflicting-evidence scenarios.
- Expanded the active copy ledger with approved prompt-policy, SAFE, MODERATE, HIGH, clarification, refusal, and launch examples, and made the validator require those rows.

## Task Commits

Each task was committed atomically:

1. **Task 1: Freeze qualitative and permission-first tone rules** - `cc946ba` (fix)
2. **Task 2: Define conservative uncertainty floors** - `1e2429b` (fix)
3. **Task 3: Align active copy examples with tone and uncertainty policy** - `f1b1efa` (feat)

**Plan metadata:** recorded separately in the final docs commit after summary and state updates.

## Files Created/Modified

- `docs/safety/tone-uncertainty-policy.md` - Final tone rules, phrase banks, and conservative uncertainty floors.
- `docs/safety/claims-boundary.md` - Added claim classes for prompt-policy, clarification, and refusal copy so the new active strings stay inside the boundary.
- `docs/safety/copy-ledger.md` - Added approved prompt-policy, result, refusal, and launch examples aligned to the tone policy.
- `scripts/validate-safety-contract.mjs` - Requires the expanded approved copy rows during copy-ledger validation.

## Decisions Made

- SAFE copy now prioritizes reassurance and qualitative explanation instead of defaulting to swaps or warnings.
- Conservatism is defined as avoiding unsafe reassurance, not escalating fear or unsupported medical advice.
- Approved active copy examples are part of the safety contract and must be enforced mechanically, not just described in docs.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Extended the boundary and validator to cover new approved copy states**
- **Found during:** Task 3 (Align active copy examples with tone and uncertainty policy)
- **Issue:** The new prompt-policy, clarification, and refusal examples needed explicit claim classes and required-row validation or the copy ledger would approve live strings that the boundary could not name or enforce.
- **Fix:** Added `prompt-policy`, `clarification-route`, and `refusal-route` claim classes in `claims-boundary.md` and expanded `--require-copy-ledger` to require the new approved active rows.
- **Files modified:** `docs/safety/claims-boundary.md`, `scripts/validate-safety-contract.mjs`
- **Verification:** `node scripts/validate-safety-contract.mjs --require-copy-ledger --forbidden-claims --forbidden-predictions --qualitative-only --uncertainty-policy` and `node scripts/validate-safety-contract.mjs`
- **Committed in:** `f1b1efa`

**2. [Rule 1 - Bug] Removed a clarification verb that tripped the treatment-claim ban**
- **Found during:** Task 3 (Align active copy examples with tone and uncertainty policy)
- **Issue:** The clarification example said Revora should "treat" a meal as lower impact or more concentrated, which matched the validator's forbidden treatment pattern.
- **Fix:** Replaced the verb with "read" so the copy stays inside the non-medical boundary while preserving the same clarification meaning.
- **Files modified:** `docs/safety/copy-ledger.md`
- **Verification:** `node scripts/validate-safety-contract.mjs --require-copy-ledger --forbidden-claims --forbidden-predictions --qualitative-only --uncertainty-policy` and `node scripts/validate-safety-contract.mjs`
- **Committed in:** `f1b1efa`

---

**Total deviations:** 2 auto-fixed (1 missing critical functionality, 1 bug)
**Impact on plan:** Both auto-fixes were needed to keep the new active copy contract enforceable and validator-clean. No scope creep.

## Issues Encountered

- The claims validator is intentionally literal, so otherwise harmless wording can still collide with banned medical verbs. Active copy examples need to avoid that vocabulary entirely.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 2 can consume a stable permission-first tone contract, explicit uncertainty floors, and approved active copy examples without rediscovering those rules in prompts.
- The safety validator now checks the exact prompt/result/launch examples that later inference and UI work are expected to inherit.

## Self-Check

PASSED

- Found `.planning/phases/01-claims-boundary-evidence-pack-and-safety-spec/01-03-SUMMARY.md` on disk.
- Verified task commits `cc946ba`, `1e2429b`, and `f1b1efa` in git history.

---
*Phase: 01-claims-boundary-evidence-pack-and-safety-spec*
*Completed: 2026-05-06*
