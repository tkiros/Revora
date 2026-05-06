---
phase: 01-claims-boundary-evidence-pack-and-safety-spec
verified: 2026-05-06T19:45:35Z
status: passed
score: 12/12 must-haves verified
---

# Phase 1: Claims Boundary, Evidence Pack, and Safety Spec Verification Report

**Phase Goal:** Revora has a locked safety contract for prediabetes-only guidance before model and UI behavior expand.
**Verified:** 2026-05-06T19:45:35Z
**Status:** passed
**Re-verification:** No - initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Active product, prompt, result, and launch copy is governed by one informational-only claims boundary. | ✓ VERIFIED | `docs/safety/claims-boundary.md:5-32` defines one boundary and claim-class table across product, prompt, result, launch, disclaimer, clarification, refusal, and out-of-scope surfaces; `docs/safety/copy-ledger.md:20-34` maps every active row to an allowed claim class. |
| 2 | Active MVP copy does not claim to diagnose, treat, prevent, cure, or reverse diabetes or prediabetes. | ✓ VERIFIED | `docs/safety/claims-boundary.md:34-43` bans these claim families; `tests/fixtures/safety-contract.json:2-38` defines forbidden claim regexes; `node scripts/validate-safety-contract.mjs` passed the `--forbidden-claims` check in the full suite. |
| 3 | Active MVP copy does not predict future A1C values, glucose curves, exact glucose spikes, GI, or GL numbers. | ✓ VERIFIED | `docs/safety/claims-boundary.md:26,38-41` and `docs/safety/tone-uncertainty-policy.md:89-95` ban these claims; `tests/fixtures/safety-contract.json:39-94` defines prediction and exact-number patterns; the full validator suite passed. |
| 4 | Evidence-backed guidance has a documented source, allowed-use statement, do-not-claim limit, and confidence level. | ✓ VERIFIED | `docs/safety/evidence-pack.md:27-39` contains a complete evidence registry with `Source`, `Supports`, `Allowed Use`, `Do Not Claim`, `Confidence`, and `Notes`, covering CDC, NIDDK, Shukla, Imai, FDA, and FTC rows. |
| 5 | A1C values below 5.7 route to out-of-scope prediabetes-only guidance instead of SAFE, MODERATE, or HIGH. | ✓ VERIFIED | `docs/safety/a1c-band-rubric.md:11-17,26-35` defines `below_prediabetes_range` with `responseKind: out_of_scope_below`; `docs/safety/copy-ledger.md:32` provides the approved below-range copy. |
| 6 | A1C values from 5.7 through 6.4 are grouped into explicit bands 5.7-5.9, 6.0-6.2, and 6.3-6.4. | ✓ VERIFIED | `docs/safety/a1c-band-rubric.md:13-16,51-55` defines the three in-scope bands; `tests/fixtures/safety-contract.json:66-74` requires the corresponding route ids; `scripts/validate-safety-contract.mjs:300-315` verifies them. |
| 7 | A1C values of 6.5 or above route to clinician/RD guidance without diagnosing the user. | ✓ VERIFIED | `docs/safety/a1c-band-rubric.md:17,37-44` defines `diabetes_range_out_of_scope`; `docs/safety/claims-boundary.md:72-80` and `docs/safety/copy-ledger.md:33` keep the route informational and non-diagnostic. |
| 8 | Higher A1C bands increase conservative calibration without pretending to personalize exact physiology. | ✓ VERIFIED | `docs/safety/a1c-band-rubric.md:46-82` defines standard/elevated/high conservatism, conservative floors, example rows, and precision limits that explicitly reject exact physiology claims. |
| 9 | SAFE guidance stays permission-first and does not add unnecessary swaps or anxiety-producing warnings. | ✓ VERIFIED | `docs/safety/tone-uncertainty-policy.md:20-29` defines SAFE rules; `docs/safety/copy-ledger.md:26` includes an approved SAFE example that reassures without adding a swap. |
| 10 | MODERATE and HIGH guidance remains direct, practical, and qualitative rather than numeric or alarmist. | ✓ VERIFIED | `docs/safety/tone-uncertainty-policy.md:30-47,75-116` defines qualitative, non-alarmist rules and banned numeric phrasing; `docs/safety/copy-ledger.md:27-28` provides approved MODERATE and HIGH examples; the full validator suite passed `--qualitative-only`. |
| 11 | Uncertain or borderline cases are classified more conservatively instead of returning unsafe reassurance. | ✓ VERIFIED | `docs/safety/tone-uncertainty-policy.md:118-149` defines conservative floors for ambiguous, carb-only, upper-band, sugary, and conflicting-evidence cases; `tests/fixtures/safety-contract.json:95-116` records the floor scenarios; `scripts/validate-safety-contract.mjs:331-353` verifies the policy table. |
| 12 | Active result and launch copy avoids exact GI, GL, glucose-spike, future-A1C, diagnosis, treatment, prevention, cure, or reversal claims. | ✓ VERIFIED | `docs/safety/copy-ledger.md:26-34` contains the approved active result/footer/route/launch rows; the validator passed `--require-copy-ledger`, `--forbidden-claims`, `--forbidden-predictions`, and `--qualitative-only`. |

**Score:** 12/12 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `docs/safety/claims-boundary.md` | Approved informational-only boundary, banned medical claims, reusable disclaimer, out-of-scope wording | ✓ VERIFIED | 80 lines; substantive sections at `:3-80`; claim-class table at `:21-32`; banned families at `:34-43`; disclaimer and out-of-scope routes at `:45-80`. |
| `docs/safety/evidence-pack.md` | Evidence registry with narrow allowed-use and do-not-claim limits | ✓ VERIFIED | 39 lines; full registry table at `:27-39`; every required evidence row present. |
| `docs/safety/a1c-band-rubric.md` | Deterministic A1C routing table, conservative calibration, precision limits | ✓ VERIFIED | 82 lines; route table at `:11-17`; out-of-scope copy at `:26-44`; calibration and limits at `:46-82`. |
| `docs/safety/tone-uncertainty-policy.md` | Permission-first tone rules, qualitative language rules, conservative floors | ✓ VERIFIED | 150 lines; response-state rules at `:18-71`; approved/banned phrase banks at `:97-116`; conservative floors at `:118-149`. |
| `docs/safety/copy-ledger.md` | Approved active product, prompt, result, refusal, footer, route, and launch copy inventory | ✓ VERIFIED | 34 lines; approval rules at `:10-16`; 13 approved active rows at `:20-34`; every row includes status, active flag, claim class, evidence rows, and notes. |
| `tests/fixtures/safety-contract.json` | Machine-readable forbidden-claims, forbidden-predictions, A1C routes, qualitative-only, and uncertainty-floor fixtures | ✓ VERIFIED | 117 lines; top-level keys present at `:2-116`; route ids at `:66-74`; uncertainty floors at `:95-116`. |
| `scripts/validate-safety-contract.mjs` | Dependency-free validator that loads the fixture and checks all safety-contract sections | ✓ VERIFIED | 489 lines; only Node built-ins imported at `:3-5`; fixture/doc loading at `:71-87`; full flag suite at `:20-32`; all checks executed successfully with `node scripts/validate-safety-contract.mjs`. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `docs/safety/copy-ledger.md` | `docs/safety/claims-boundary.md` | Each active copy row names an allowed claim class from the claims boundary | WIRED | `copy-ledger.md:14,20-34` requires `Allowed Claim Class`; `claims-boundary.md:21-32` defines the classes; `validate-safety-contract.mjs:217-236` cross-checks approved rows against the claim-class table. |
| `docs/safety/evidence-pack.md` | `docs/safety/claims-boundary.md` | Evidence allowed-use statements stay inside the informational-only boundary | WIRED | `evidence-pack.md:5-17,29-39` keeps evidence limited to narrow allowed use and explicit do-not-claim limits; those limits align with the claims boundary at `claims-boundary.md:12-17,34-43`. |
| `scripts/validate-safety-contract.mjs` | `tests/fixtures/safety-contract.json` | Validator loads fixtures and applies all enabled checks without external dependencies | WIRED | `validate-safety-contract.mjs:8,72,109-119,165-190,300-354` loads `tests/fixtures/safety-contract.json` and uses it across forbidden-claim, prediction, route, qualitative, and uncertainty checks. |
| `docs/safety/a1c-band-rubric.md` | `tests/fixtures/safety-contract.json` | Human-readable route table uses the same band ids and response kinds as fixture examples | WIRED | `a1c-band-rubric.md:13-17` and `safety-contract.json:66-74` share the same required route ids; `validate-safety-contract.mjs:300-315` enforces the match. |
| `scripts/validate-safety-contract.mjs` | `docs/safety/a1c-band-rubric.md` | `--a1c-routes` verifies required bands and out-of-scope routes | WIRED | `validate-safety-contract.mjs:75,300-315` loads `a1c-band-rubric.md` and verifies the required route table entries from the fixture. |
| `docs/safety/tone-uncertainty-policy.md` | `docs/safety/copy-ledger.md` | Approved result and launch copy examples follow the same qualitative tone and conservative floors | WIRED | `tone-uncertainty-policy.md:20-47,97-149` defines SAFE/MODERATE/HIGH/clarification/refusal/out-of-scope wording and floors; `copy-ledger.md:24-34` mirrors those rules in approved active prompt/result/route/launch rows. |
| `scripts/validate-safety-contract.mjs` | `docs/safety/tone-uncertainty-policy.md` | `--qualitative-only` and `--uncertainty-policy` enforce the tone contract | WIRED | `validate-safety-contract.mjs:76,317-353` loads `tone-uncertainty-policy.md`; `--uncertainty-policy` verifies the conservative-floor table directly, and `--qualitative-only` enforces the same qualitative/no-exact-number contract through approved active copy rows derived from that policy. |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `CLAIM-01` | `01-01`, `01-03` | Product, prompt, result, and launch copy use an approved claims boundary with allowed informational guidance and banned medical claims. | ✓ SATISFIED | `claims-boundary.md:5-32`; `copy-ledger.md:20-34`; validator claim-class cross-check at `validate-safety-contract.mjs:217-236`. |
| `CLAIM-02` | `01-01`, `01-03` | The product never claims to diagnose, treat, prevent, cure, or reverse diabetes or prediabetes. | ✓ SATISFIED | Banned claim families at `claims-boundary.md:34-43`; forbidden claim regexes at `safety-contract.json:2-38`; full validator suite passed. |
| `CLAIM-03` | `01-01`, `01-03` | The product never predicts a user's future A1C or blood glucose curve. | ✓ SATISFIED | Prediction bans at `claims-boundary.md:38-41` and `tone-uncertainty-policy.md:91-95`; fixture patterns at `safety-contract.json:39-64`; full validator suite passed. |
| `CLAIM-04` | `01-01` | Sequencing, swap, and blood-sugar-impact guidance is grounded in documented evidence sources or kept qualitative when evidence is insufficient. | ✓ SATISFIED | `evidence-pack.md:29-39` contains source, allowed use, do-not-claim, and confidence fields; `copy-ledger.md:24-34` ties active copy to evidence ids. |
| `INPUT-04` | `01-02` | The app handles A1C values below 5.7 by explaining that Revora is designed for the prediabetes range. | ✓ SATISFIED | `a1c-band-rubric.md:13,28-35`; `copy-ledger.md:32`. |
| `INPUT-05` | `01-02` | The app handles A1C values of 6.5 or above by explaining that the value is in the Type 2 diabetes range and directing the user to clinician guidance. | ✓ SATISFIED | `a1c-band-rubric.md:17,37-44`; `claims-boundary.md:72-80`; `copy-ledger.md:33`. |
| `GUIDE-02` | `01-02` | The risk rubric calibrates guidance across A1C bands 5.7-5.9, 6.0-6.2, and 6.3-6.4. | ✓ SATISFIED | `a1c-band-rubric.md:14-16,51-55,68-74`. |
| `GUIDE-07` | `01-03` | Results use qualitative glycemic-impact language and never invent exact GI, GL, or glucose-spike numbers. | ✓ SATISFIED | `tone-uncertainty-policy.md:75-116`; `copy-ledger.md:26-34`; `safety-contract.json:75-94`; full validator suite passed. |
| `GUARD-04` | `01-03` | The prompt and policy layer classify uncertain or borderline cases conservatively rather than returning unsafe reassurance. | ✓ SATISFIED | `tone-uncertainty-policy.md:118-149`; `copy-ledger.md:24-25,29-33`; `validate-safety-contract.mjs:331-353`. |

No orphaned Phase 1 requirement IDs were found. The phase requirement set in `ROADMAP.md:23-31` matches the union of plan-frontmatter requirements in `01-01-PLAN.md`, `01-02-PLAN.md`, and `01-03-PLAN.md`.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| None | - | No TODO/FIXME/placeholder/stub patterns found in the phase-owned safety docs, fixture, or validator. | - | No blocker or warning-level anti-patterns were detected in the verified artifact set. |

### Human Verification Required

No additional repo-level human verification is blocking Phase 1 goal achievement.

`01-VALIDATION.md:64-69` correctly notes that legal/compliance judgment and evidence-strength interpretation are broader review disciplines than static linting. This verification checked the actual repo artifacts and found the implemented boundary, evidence wording, copy inventory, routes, and validator to be internally consistent and phase-complete.

### Gaps Summary

No gaps found.

The phase goal is achieved in the codebase: the safety contract artifacts exist, are substantive, are wired together, the active copy inventory stays inside the informational-only boundary, the A1C scope routes and conservative floors are explicit, all nine Phase 1 requirement IDs are accounted for, and `node scripts/validate-safety-contract.mjs` passed the full suite during verification.

---

_Verified: 2026-05-06T19:45:35Z_
_Verifier: Claude (gsd-verifier)_
