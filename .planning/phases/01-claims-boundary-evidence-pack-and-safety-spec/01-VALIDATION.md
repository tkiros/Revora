---
phase: 01
slug: claims-boundary-evidence-pack-and-safety-spec
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-04
---

# Phase 01 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js static validation script using built-in modules |
| **Config file** | none - Wave 0 creates `scripts/validate-safety-contract.mjs` |
| **Quick run command** | `node scripts/validate-safety-contract.mjs` |
| **Full suite command** | `node scripts/validate-safety-contract.mjs` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node scripts/validate-safety-contract.mjs`
- **After every plan wave:** Run `node scripts/validate-safety-contract.mjs`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 0 | CLAIM-01, CLAIM-02, CLAIM-03 | static contract/lint | `node scripts/validate-safety-contract.mjs --require-copy-ledger --forbidden-claims --forbidden-predictions` | No - Wave 0 | pending |
| 01-01-02 | 01 | 1 | CLAIM-01, CLAIM-02, CLAIM-03, CLAIM-04 | static contract/lint | `node scripts/validate-safety-contract.mjs --claims-boundary --evidence-pack --forbidden-claims --forbidden-predictions` | No - Wave 0 | pending |
| 01-02-01 | 02 | 1 | INPUT-04, INPUT-05, GUIDE-02 | fixture/static | `node scripts/validate-safety-contract.mjs --a1c-routes` | No - Wave 0 | pending |
| 01-03-01 | 03 | 1 | GUIDE-07, GUARD-04 | fixture/static | `node scripts/validate-safety-contract.mjs --qualitative-only --uncertainty-policy` | No - Wave 0 | pending |
| 01-03-02 | 03 | 2 | CLAIM-01, CLAIM-02, CLAIM-03, GUIDE-07, GUARD-04 | full static suite | `node scripts/validate-safety-contract.mjs` | No - Wave 0 | pending |

*Status: pending, green, red, flaky*

---

## Wave 0 Requirements

- [ ] `docs/safety/claims-boundary.md` - allowed informational claims, banned medical claims, disclaimer, and out-of-scope language.
- [ ] `docs/safety/evidence-pack.md` - evidence registry with source, supports, allowed use, do-not-claim, and confidence fields.
- [ ] `docs/safety/a1c-band-rubric.md` - below-range route, three prediabetes bands, high-range route, and conservative calibration rules.
- [ ] `docs/safety/tone-uncertainty-policy.md` - permission-first tone, qualitative wording, and conservative uncertainty floors.
- [ ] `docs/safety/copy-ledger.md` - active product, prompt, result, and launch copy inventory with approval status.
- [ ] `tests/fixtures/safety-contract.json` - machine-readable examples for A1C routes, banned copy, qualitative-only checks, and uncertainty floors.
- [ ] `scripts/validate-safety-contract.mjs` - dependency-free validator for safety contract completeness and banned claims.
- [ ] Framework install: none for Phase 1; use Node.js built-ins and `rg` if available.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Claims boundary legal/compliance judgment | CLAIM-01, CLAIM-02, CLAIM-03 | Static lint can catch banned phrases but cannot provide legal advice or assess total net impression. | Review `docs/safety/claims-boundary.md` and `docs/safety/copy-ledger.md`; confirm active MVP copy does not imply diagnosis, treatment, prevention, cure, reversal, future A1C, or glucose-curve prediction. |
| Evidence interpretation strength | CLAIM-04, GUIDE-07 | The validator can require source fields, but a human must confirm allowed-use statements are not stronger than the evidence. | Review every `docs/safety/evidence-pack.md` entry; confirm result and launch copy remains qualitative and does not quote exact GI, GL, spike, or outcome numbers. |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
