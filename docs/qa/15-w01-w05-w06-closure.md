# 15 — W-01, W-05 and W-06 closure audit

**Date:** 2026-07-12  
**Revision audited:** `71dcf8a` plus dietitian-gate implementation `2266b38`  
**Rule:** code, tests and documents are not substitutes for credentialed clinical
judgment.

## Verdict

| Workstream | Verdict | Why |
|---|---|---|
| **W-01 — clinical-risk router** | **ENGINEERING CLOSED** | The route runs before A1C and food classification, never calls the model, returns a verdict-free clinical schema, and routes all 40 locked clinical prompts correctly. External approval of the fixed route copy remains a W-05 dependency. |
| **W-05 — expert and user validation** | **OPEN — EXTERNAL AUTHORITY** | The repository now contains a fail-closed review workflow, but no real panel artifact, no three verified reviewer signatures, no 240-case independent review, no consent-safe 40-photo set, and no signed ownership of the carbohydrate ontology. |
| **W-06 — runtime forbidden-claims enforcement** | **CLOSED** | Every model-authored user-facing path is checked against forbidden claim, prediction, quantitative and prompt-leak patterns. A violation becomes a retry response that structurally cannot carry a verdict. |

## What changed in this remediation

1. Added three explicit external reviewer roles and a reproducible review protocol.
2. Added versioned governance for all eight clinical-copy routes, including evidence
   IDs, jurisdiction, cadence, approver slots and review dates.
3. Added a checked-in external panel template with credential, conflict, independent
   label, adjudication, clinical-copy, ontology and signed-vote fields.
4. Added `scripts/validate-dietitian-review.mjs` and two commands:
   `review:dietitian:validate` for engineering readiness and
   `review:dietitian:close` for the actual clinical closure gate.
5. Exported and versioned the candidate `CARB_FORWARD_TOKENS` policy so a reviewer
   can approve an exact artifact rather than an informal code concept.
6. Fixed the `shirataki noodles` exclusion: removing only “shirataki” left “noodles”
   behind and incorrectly re-triggered the candidate carbohydrate floor.
7. Added unit coverage proving the closure gate rejects unsigned/conditional reviews
   and accepts only three verified reviewers × 240 unique cases = 720 independent
   review rows with all gates passing.

## W-01 proof

- `lib/revora/service.ts` invokes `classifyClinicalRisk()` before `routeA1C()`, the
  ordinary food precheck and prompt construction.
- `lib/revora/clinical-risk.ts` defines eight precedence-ordered routes with bounded
  patterns.
- Clinical responses contain no `risk` field and use fixed ledger copy.
- The corpus has 40 clinical-risk cases. The focused safety run passed all routing
  assertions, including medical precedence and food-corpus false-positive checks.
- `clinical-copy-governance.json` maps all eight runtime routes to versioned copy and
  evidence IDs. It honestly remains `pending_external_panel`.

Therefore W-01's **engineering control** is closed. The route copy cannot be called
“dietitian approved” until the W-05 panel signs it.

## W-06 proof

`assertNoForbiddenClaims()` compiles and enforces:

- forbidden claim patterns;
- forbidden future/personal predictions;
- prohibited quantitative glycemic language; and
- prompt/instruction leak patterns.

It runs over the post-floor result fields and over model-authored clarification and
not-food fields. Focused tests inject treatment, cure, reversal, prevention,
diagnosis, exact mg/dL, exact GI, future-A1C, glucose-curve and prompt-leak text.
Every case fails closed; normal qualitative output still returns a result.

## W-05 closure boundary

The engineering portion is ready and machine checked:

```text
npm run review:dietitian:validate
→ 8 governed routes, 88 current eval cases, 40 clinical cases, zero packet errors
```

The real closure command currently fails, correctly:

```text
npm run review:dietitian:close
→ missing docs/qa/dietitian-review/panel-review.json
```

That file must not be synthesized. It represents real identities, verified
credentials, independent judgments, conflicts, signatures and clinical approval.
The command also requires 240 unique reviewed cases, three reviews per case, exact
stratum counts, eight signed route-copy approvals, signed RDN/CDCES approval of the
carbohydrate ontology, three unconditional panel votes, and every registered safety
threshold passing overall and by subgroup.

W-05 remains a launch condition. Closing it without those people and artifacts would
be a false clinical claim and would defeat the purpose of the gate.

## Verification snapshot

```text
npx vitest run \
  tests/unit/revora/dietitian-review-gate.test.ts \
  tests/unit/revora/carb-forward-ontology.test.ts \
  tests/unit/revora/clinical-risk.test.ts \
  tests/unit/revora/forbidden-claims.test.ts \
  tests/unit/revora/postprocess.test.ts \
  tests/evals/revora-safety-eval.test.ts
→ 6 files, 68 tests passed

npm run contract
→ safety contract validation passed

npm run build
→ production build passed (66 routes)

npm run typecheck
→ passed

npm run lint
→ 0 errors, 12 pre-existing warnings outside this remediation

npm test
→ 115 files passed, 1 skipped; 1119 tests passed, 2 skipped
```
