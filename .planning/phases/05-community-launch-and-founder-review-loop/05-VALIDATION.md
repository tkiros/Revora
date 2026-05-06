---
phase: 05
slug: community-launch-and-founder-review-loop
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-06
---

# Phase 05 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest for launch-copy, aggregate-metric, review-record, and scanner-gate units; Playwright for public launch/share/pause smoke; static Markdown validator for launch and review evidence |
| **Config file** | `vitest.config.ts`, `playwright.config.ts`; missing in this checkout until earlier phase execution artifacts exist |
| **Quick run command** | `node scripts/validate-community-launch.mjs && npx vitest run tests/unit/revora/launch-copy.test.ts tests/unit/revora/launch-metrics.test.ts tests/unit/revora/review-record.test.ts tests/unit/revora/scanner-gate.test.ts -x` |
| **Full suite command** | `npm run typecheck && npm run build && npx vitest run tests/unit/revora && npx playwright test tests/smoke/community-launch.spec.ts --project="Mobile Chrome" && node scripts/validate-community-launch.mjs` |
| **Estimated runtime** | ~120 seconds locally, excluding provider setup and manual launch evidence collection |

---

## Sampling Rate

- **After every task commit:** Run the relevant Vitest file plus `node scripts/validate-community-launch.mjs` for touched launch, demand, review, incident, or gate docs.
- **After Plan 05-01:** Run `node scripts/validate-community-launch.mjs --section launch-copy --section demand-ledger && npx vitest run tests/unit/revora/launch-copy.test.ts tests/unit/revora/launch-metrics.test.ts -x`.
- **After Plan 05-02:** Run `node scripts/validate-community-launch.mjs --section founder-review --section scanner-gate && npx vitest run tests/unit/revora/review-record.test.ts tests/unit/revora/scanner-gate.test.ts -x`.
- **Before `$gsd-verify-work`:** Full suite must be green, moderator/equivalent-channel outcome must be recorded, first-week demand counters must have an evidence path, first-50 review workflow must be executable, incident feedback must link to eval backfill and Phase 4 rollback decisions, and the scanner-next decision record must be filled or explicitly marked not yet earned.
- **Max feedback latency:** 120 seconds locally, excluding manual community/moderator responses and production traffic collection.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | VALID-01 | static + unit | `node scripts/validate-community-launch.mjs --section launch-copy && npx vitest run tests/unit/revora/launch-copy.test.ts -x` | no - W0 | pending |
| 05-01-02 | 01 | 1 | VALID-02 | unit + manual evidence | `npx vitest run tests/unit/revora/launch-metrics.test.ts -t "query_completed" -x` | no - W0 | pending |
| 05-01-03 | 01 | 1 | VALID-03, VALID-04, VALID-05 | static + unit + manual evidence | `node scripts/validate-community-launch.mjs --section demand-ledger && npx vitest run tests/unit/revora/launch-metrics.test.ts -t "organic share|paid|wtp" -x` | no - W0 | pending |
| 05-02-01 | 02 | 2 | GUARD-07 | unit + static + manual evidence | `node scripts/validate-community-launch.mjs --section founder-review && npx vitest run tests/unit/revora/review-record.test.ts -x` | no - W0 | pending |
| 05-02-02 | 02 | 2 | GUARD-07 | static + existing safety suite | `node scripts/validate-community-launch.mjs --section incident-feedback` | no - W0 | pending |
| 05-02-03 | 02 | 2 | VALID-06 | unit + static | `node scripts/validate-community-launch.mjs --section scanner-gate && npx vitest run tests/unit/revora/scanner-gate.test.ts -x` | no - W0 | pending |

*Status: pending, green, red, flaky*

---

## Wave 0 Requirements

- [ ] Earlier phase execution artifacts: `package.json`, `vitest.config.ts`, `playwright.config.ts`, `app/page.tsx`, `app/api/check/route.ts`, `app/api/health/route.ts`, `lib/revora/telemetry.ts`, `lib/revora/launch-controls.ts`, and Phase 2/3/4 unit and smoke tests.
- [ ] Phase 4 privacy and rollback docs: `docs/privacy/data-flow.md` and `docs/ops/launch-controls.md`.
- [ ] `docs/launch/community-rules-snapshot.md` - current `r/prediabetes` or equivalent-channel rules snapshot.
- [ ] `docs/launch/modmail-request.md` - moderator permission request and outcome slot.
- [ ] `docs/launch/community-post.md` - evidence-aware, non-promotional launch artifact.
- [ ] `docs/validation/demand-ledger.md` - weekly query, share, paid-version ask, and WTP evidence ledger.
- [ ] `docs/validation/founder-review-loop.md` - first-50 and daily spot-check checklist.
- [ ] `docs/validation/scanner-next-gate.md` - deterministic expansion decision record.
- [ ] `docs/ops/incident-feedback-loop.md` - severity rubric, eval backfill, and rollback trigger path.
- [ ] `lib/revora/launch-metrics.ts` - aggregate counters that exclude raw food, raw A1C, prompt text, model output, IP, and user-agent identifiers.
- [ ] `lib/revora/review-record.ts` - redacted review-record schema.
- [ ] `lib/revora/scanner-gate.ts` - deterministic `VALID-06` gate evaluator.
- [ ] `scripts/validate-community-launch.mjs` - static validator for launch, demand, review, incident, and scanner-gate artifacts.
- [ ] `tests/unit/revora/launch-copy.test.ts` - claims, disclosure, moderator-gate, and community-rule checks.
- [ ] `tests/unit/revora/launch-metrics.test.ts` - aggregate-only counter and demand-ledger checks.
- [ ] `tests/unit/revora/review-record.test.ts` - no raw food, raw A1C, prompt text, full model output, username, or contact info fields.
- [ ] `tests/unit/revora/scanner-gate.test.ts` - `3/5` WTP and `10+` organic-share threshold coverage.
- [ ] `tests/smoke/community-launch.spec.ts` - public launch link, share button, and friendly pause/incident UX.
- [ ] Provider setup if aggregate counters are adopted: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Moderator approval or equivalent-channel selection | VALID-01 | Depends on community moderator response and channel rules | Record modmail timestamp/outcome, approved post URL, or fallback-channel rationale in `docs/launch/modmail-request.md`. |
| First-week query volume reaches or misses 50 queries | VALID-02 | Requires production traffic after launch | Record daily aggregate counter snapshots and first-week total in `docs/validation/demand-ledger.md`. |
| At least 5 verified organic shares happened | VALID-03 | Human-to-human sharing may happen outside app telemetry | Record redacted evidence notes with count and channel; do not count share-intent clicks as verified organic shares. |
| At least 3 paid-version asks happened | VALID-04 | Signals appear in comments, DMs, or conversations | Record redacted demand-ledger rows without usernames, contact info, or full message text. |
| Five direct WTP conversations completed | VALID-05 | Requires founder conversations | Record yes/no/maybe outcomes for the `$5/month` question with non-identifying rationale. |
| First-50 and daily review completed | GUARD-07 | Requires founder judgment over production outputs | Complete review checklist, severity classification, incident links, and eval-backfill status in `docs/validation/founder-review-loop.md`. |
| Scanner-next decision signed | VALID-06 | Final product decision depends on launch evidence | Fill `docs/validation/scanner-next-gate.md` with WTP yeses, organic shares, final decision, and deferred-feature status. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all missing references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s locally
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
