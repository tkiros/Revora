# 08 — Accessibility Report (2026-07-10)

## Executed (automated)

Playwright smoke run of 2026-07-10 (Pixel 5 + iPhone 12 profiles, reduced-motion
contexts), including the `@axe-core/playwright` suite (`tests/smoke/a11y.spec.ts`,
plus embedded axe assertions in `dashboard.spec.ts` and `voice-input.spec.ts`):

- **All axe checks passed** (no critical/serious violations) on: the check flow surface,
  error/status surface, terms page, signed-out `/pantry/intake` redirect target, dashboard
  at both shell widths, and the voice-input listening state. Several axe specs were flaky
  under WebKit parallel load and passed on retry — environment noise (this QA session ran
  model evals concurrently on the same box), not violations. EXECUTED / PASS.
- Screen-reader-relevant behaviors covered by passing specs: listening state announced
  (`voice-input.spec.ts`), field errors shown as field errors (`onboarding.spec.ts`),
  no autofocus traps on mobile inputs (`mobile-check.spec.ts`).

## Verified by design/code (EXECUTED as static review)

- **Verdict color is never the only channel** — SAFE/MODERATE/HIGH always carries a text
  label (PRODUCT.md commitment; `result-card.tsx` renders text labels; axe color-contrast
  checks pass on the surfaces tested). The scan-to-guidance path is completable without
  color perception.
- `prefers-reduced-motion: reduce` zeroes motion (used by the E2E config itself, so every
  smoke test exercises the reduced-motion path).
- Skip-to-content link present (visible in test snapshots), 44px touch-target and WCAG AA
  contrast commitments documented in PRODUCT.md/DESIGN.md.

## Findings

- **A11Y-01 (P2)**: On iPhone 12 (Mobile Safari), the primary `/check` CTA renders at
  y≈753px, below the 720px above-the-fold budget the latest commit (`c04d713`) set —
  deterministic failure of `mobile-check.spec.ts:143` (failed on retry too; passes on
  Pixel 5). WebKit text metrics push the form taller. Not an axe violation, but a
  low-vision/zoom usability regression on the primary action. **Fix: spacing diet must be
  re-verified on WebKit, not just Chromium.**

## Not executed / manual verification required

- **VoiceOver / TalkBack** end-to-end passes: no simulator/device in this environment.
  MANUAL VERIFICATION REQUIRED (checklist: complete onboarding → check → result → history
  with screen reader; verify verdict announcement includes the text label and disclaimer).
- **Dynamic Type / 200% zoom reflow**, high-contrast mode, keyboard-only desktop
  navigation: NOT EXECUTED this round (no automated coverage exists yet). Recommend one
  Playwright spec with `page.emulateMedia`/viewport zoom for reflow smoke. P2 backlog.
- Locale/units: product is US-A1C-based by design (`5.7–6.4%`); no UK/localisation surface
  exists yet — N/A rather than untested.
