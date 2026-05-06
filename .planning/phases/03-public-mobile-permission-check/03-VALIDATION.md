---
phase: 03
slug: public-mobile-permission-check
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-06
---

# Phase 03 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright mobile smoke tests plus Vitest client unit tests |
| **Config file** | `playwright.config.ts`; Vitest config from Phase 2 scaffold |
| **Quick run command** | `npx playwright test tests/smoke/mobile-check.spec.ts --project="Mobile Chrome"` |
| **Full suite command** | `npx vitest run tests/unit/client/validation.test.ts tests/unit/client/ui-state.test.ts && npx playwright test tests/smoke/mobile-check.spec.ts --project="Mobile Chrome"` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test tests/smoke/mobile-check.spec.ts --project="Mobile Chrome"`
- **After every plan wave:** Run `npx vitest run tests/unit/client/validation.test.ts tests/unit/client/ui-state.test.ts && npx playwright test tests/smoke/mobile-check.spec.ts --project="Mobile Chrome"`
- **Before `$gsd-verify-work`:** Full suite must be green, with one manual real-device keyboard/readability check recorded in the phase summary.
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | INPUT-01, INPUT-02, INPUT-03, UX-01, UX-02, UX-03 | unit + smoke | `npx vitest run tests/unit/client/validation.test.ts && npx playwright test tests/smoke/mobile-check.spec.ts -g "public no-login form|invalid submit does not POST|cta label and position|no autofocus mobile inputs" --project="Mobile Chrome"` | no - W0 | pending |
| 03-02-01 | 02 | 2 | GUIDE-08, UX-04, UX-05, UX-06 | unit + smoke | `npx vitest run tests/unit/client/ui-state.test.ts && npx playwright test tests/smoke/mobile-check.spec.ts -g "loading state|slow state after five seconds|friendly retry states|useful response states" --project="Mobile Chrome"` | no - W0 | pending |
| 03-03-01 | 03 | 2 | UX-07, UX-01, UX-03 | smoke + manual | `npx playwright test tests/smoke/mobile-check.spec.ts -g "result readability|single screen flow|cta label and position" --project="Mobile Chrome"` | no - W0 | pending |

*Status: pending, green, red, flaky*

---

## Wave 0 Requirements

- [ ] `playwright.config.ts` - Mobile Chrome project and local webServer command if absent
- [ ] `tests/smoke/mobile-check.spec.ts` - public form, invalid submit, valid submit, slow state, timeout, 429, retry, and readability assertions
- [ ] `tests/unit/client/validation.test.ts` - food/A1C required fields, one-decimal A1C parsing, and malformed submit blocking
- [ ] `tests/unit/client/ui-state.test.ts` - request state helper coverage for loading, slow, success, retry, timeout, and rate-limited outcomes
- [ ] `lib/client/validation.ts` - non-React validation seam for required food and one-decimal A1C
- [ ] `lib/client/ui-state.ts` - non-React request-state seam for 5-second slow-state behavior and friendly retry mapping
- [ ] `lib/client/check.ts` - typed fetch wrapper seam to `POST /api/check`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real mobile keyboard does not obscure the flow | UX-02 | Browser emulation catches attributes but not every physical keyboard/viewport interaction | Open the public page on a phone, tap food then A1C, confirm no autofocus-on-load jump and the A1C keyboard supports decimal input. |
| Bright-environment readability is acceptable | UX-07 | Automated contrast checks do not prove outdoor usability | View a SAFE/MODERATE/HIGH result on a phone at high brightness or near a bright window and record pass/fail in the phase summary. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all missing references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
