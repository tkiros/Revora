# 01 — Test Strategy (2026-07-10)

## Principles (inherited from the codebase, kept)

1. **Deterministic first**: the safety engine is tested against a frozen fixture corpus
   with mock model outputs (`tests/fixtures/revora-eval-cases.json` + mock client); live
   model calls are a separate, explicitly-enabled, budget-capped gate.
2. **Fail-closed is the product contract**: every AI-path test asserts that failure ends
   in calm-retry copy, never a fabricated verdict.
3. **Server is the source of truth** for entitlements, disclaimers, and floors — client
   tests never assert safety properties the server doesn't enforce.
4. **Both paywall modes** are first-class E2E targets (:3100 legacy, :3101 trial).

## Layers and ownership

| Layer | Tooling | Gate |
|---|---|---|
| Unit + integration (engine, routes, billing, privacy) | Vitest + PGlite, ~814 tests | `npm run test` — release gate |
| Safety eval (mock) | Vitest over 48-case corpus | included in `npm run test` |
| Safety eval (live) | `npm run eval:revora:live` (graded rubric: zero harmful-SAFE hard gate) | pre-release + before any model/prompt change |
| Model selection | `npm run eval:model-bakeoff:live` (this round's new harness; budget-capped) | before changing `REVORA_MODEL`/provider |
| E2E smoke (mobile web ×2 engines, a11y via axe) | Playwright | pre-release |
| Security | `npm audit`, secret-pattern scans, route-auth review (this round: manual+grep; candidate for CI script) | pre-release |
| Manual | launch walkthrough (`docs/qa/launch-walkthrough-web.md`), screen readers, store flows | release checklist |

## Coverage decisions made this round

- **No new E2E framework**: the existing Playwright smoke suite already covers the highest
  risk journeys (first check, onboarding, offline, dupe-submit, trial wall, billing pages,
  a11y). Gaps are listed in `05-known-risks-and-blockers.md` instead of speculative tests.
- **No duplicated eval corpus**: the master prompt's `eval-cases.jsonl` schema is satisfied
  functionally by `revora-eval-cases.json` (see `test-data-manifest.md` for the field
  mapping). One corpus, one loader, no drift.
- **Live-model spend rules**: dry-run default, explicit `--live`, `BAKEOFF_MAX_USD` +
  `BAKEOFF_MAX_TOKENS_TOTAL` + `BAKEOFF_MAX_CASES` rails, artifacts gitignored.

## What must never be weakened to make tests pass

Safety-contract copy, conservative floors, out-of-scope A1C routing, disclaimer presence,
zero-harmful-SAFE gate, entitlement checks before model spend. Any red test in these areas
is a product incident, not a test problem.
