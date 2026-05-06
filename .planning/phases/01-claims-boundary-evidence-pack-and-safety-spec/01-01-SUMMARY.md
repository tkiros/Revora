---
phase: 01-claims-boundary-evidence-pack-and-safety-spec
plan: "01"
subsystem: testing
tags: [safety, claims, markdown, node, validation]
requires: []
provides:
  - Informational-only claims boundary for product, prompt, result, and launch copy
  - Evidence registry with allowed-use and do-not-claim limits
  - Machine-readable safety contract fixtures and a dependency-free validator
affects: [phase-01-plan-02, phase-01-plan-03, phase-02-guardrailed-inference-core, copy, prompts, launch]
tech-stack:
  added: [Node.js built-ins only]
  patterns: [markdown safety contract, approved-copy ledger linting, evidence-id cross references]
key-files:
  created: [docs/safety/claims-boundary.md, docs/safety/evidence-pack.md, docs/safety/a1c-band-rubric.md, docs/safety/tone-uncertainty-policy.md, docs/safety/copy-ledger.md, tests/fixtures/safety-contract.json, scripts/validate-safety-contract.mjs]
  modified: []
key-decisions:
  - "Active claims validation scans only approved active ledger rows so policy docs can record banned language without false positives."
  - "Evidence sources stay attached to narrow allowed-use statements and explicit do-not-claim limits rather than acting as broad citation permission."
  - "The validator remains dependency-free and relies only on Node.js built-ins so Phase 1 has no package-install requirement."
patterns-established:
  - "Copy Ledger Gate: only approved active rows represent live claim surfaces."
  - "Evidence Registry Gate: copy references evidence ids, and each id must declare allowed use plus do-not-claim limits."
  - "Safety Contract Gate: no-flag validator runs the full claims, evidence, A1C, qualitative-language, and uncertainty-policy suite."
requirements-completed: [CLAIM-01, CLAIM-02, CLAIM-03, CLAIM-04]
duration: 10min
completed: 2026-05-06
---

# Phase 01 Plan 01: Claims Boundary Summary

**Informational-only claims boundary, evidence-limited copy controls, and a built-in safety validator for Revora's prediabetes-only MVP**

## Performance

- **Duration:** 10 min
- **Started:** 2026-05-06T19:13:59Z
- **Completed:** 2026-05-06T19:23:42Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Created the full `docs/safety/` contract set, seeded A1C routing and tone docs, and added the canonical JSON fixture plus validator scaffold.
- Locked the informational-only claims boundary, reusable disclaimer, and approved active copy rows for product, prompt, result routes, footer, and launch copy.
- Replaced draft source notes with a final evidence registry that enforces narrow allowed-use and do-not-claim limits and links approved copy to evidence ids.

## Task Commits

Each task was committed atomically:

1. **Task 0: Wave 0 - Create safety validation infrastructure** - `efe6318` (feat)
2. **Task 1: Lock claims boundary and disclaimer language** - `cb69a77` (fix)
3. **Task 2: Lock evidence pack and allowed-use limits** - `b7170ec` (feat)

**Plan metadata:** recorded separately in the final docs commit after summary and state updates.

## Files Created/Modified

- `docs/safety/claims-boundary.md` - Approved informational-only boundary, banned claims, disclaimer, and out-of-scope route wording.
- `docs/safety/evidence-pack.md` - Evidence registry with source-backed allowed-use and do-not-claim limits.
- `docs/safety/a1c-band-rubric.md` - Seeded deterministic A1C route table for downstream plans.
- `docs/safety/tone-uncertainty-policy.md` - Seeded conservative uncertainty floors and tone rules.
- `docs/safety/copy-ledger.md` - Active copy inventory with claim classes and evidence-id links.
- `tests/fixtures/safety-contract.json` - Machine-readable forbidden-claim, prediction, A1C-route, qualitative-only, and uncertainty fixtures.
- `scripts/validate-safety-contract.mjs` - Dependency-free validator for the Phase 1 safety contract.

## Decisions Made

- Locked one shared informational-only boundary across product, prompt, result, and launch surfaces instead of letting each surface carry its own safety wording.
- Treated evidence as a narrow permissions system, not as generic support for stronger clinical or predictive copy.
- Kept validation dependency-free so Phase 1 can run in any stock Node environment without package-install drift.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed validator path handling so infrastructure checks fail cleanly instead of crashing**
- **Found during:** Task 0 (Wave 0 - Create safety validation infrastructure)
- **Issue:** The first validator run resolved the fixture path twice, which caused an `ENOENT` crash before infrastructure validation could report anything useful.
- **Fix:** Switched the loader to safe file readers and JSON parsing so missing or malformed files become validator failures instead of unhandled Node errors.
- **Files modified:** `scripts/validate-safety-contract.mjs`
- **Verification:** `node scripts/validate-safety-contract.mjs --infrastructure`
- **Committed in:** `efe6318`

**2. [Rule 3 - Blocking] Normalized markdown table parsing for approved-row and claims-boundary checks**
- **Found during:** Task 1 (Lock claims boundary and disclaimer language)
- **Issue:** Markdown code spans in table cells caused claim-class and row-id comparisons to fail, and the phrase gate treated case differences as missing policy text.
- **Fix:** Normalized code-span-wrapped table values and made the required phrase check case-insensitive.
- **Files modified:** `scripts/validate-safety-contract.mjs`
- **Verification:** `node scripts/validate-safety-contract.mjs --require-copy-ledger --forbidden-claims --forbidden-predictions --claims-boundary`
- **Committed in:** `cb69a77`

**3. [Rule 3 - Blocking] Aligned evidence-id parsing for multi-value copy-ledger references**
- **Found during:** Task 2 (Lock evidence pack and allowed-use limits)
- **Issue:** Evidence-row references written as multiple inline code spans were parsed as malformed ids, so the evidence-link check failed even though the source rows existed.
- **Fix:** Flattened the copy-ledger evidence cells to plain CSV ids and kept the validator's CSV normalization consistent with the markdown table format.
- **Files modified:** `docs/safety/copy-ledger.md`, `scripts/validate-safety-contract.mjs`
- **Verification:** `node scripts/validate-safety-contract.mjs --evidence-pack` and `node scripts/validate-safety-contract.mjs`
- **Committed in:** `b7170ec`

---

**Total deviations:** 3 auto-fixed (3 blocking)
**Impact on plan:** All deviations were validator-hardening fixes required to complete the planned safety contract and keep the checks trustworthy. No scope creep.

## Issues Encountered

- Markdown presentation choices in tables can leak into validation logic if ids are not normalized consistently. The validator now handles those cases explicitly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plans `01-02` and `01-03` can now refine the A1C rubric and uncertainty policy against a stable claims boundary, copy ledger, evidence pack, and validator contract.
- Phase 2 can consume the validator and fixture as a safety gate for prompt and inference work without re-deriving the claims rules.

## Self-Check

PASSED

- Found summary and all seven plan-scope safety artifacts on disk.
- Verified task commits `efe6318`, `cb69a77`, and `b7170ec` in repo history.

---
*Phase: 01-claims-boundary-evidence-pack-and-safety-spec*
*Completed: 2026-05-06*
