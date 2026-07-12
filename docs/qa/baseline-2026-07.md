# Revora — Release Baseline (Phase 0.1 / 0.4)

**Frozen:** 2026-07-11 · **Base commit:** `c04d713` · **Branch:** `feat/video-engine-renderer`

This is the "before" column. Every claim in the post-remediation scorecard is measured against it.
It exists because the previous QA round reported numbers with no artifact behind them (F-23), and a
number you cannot reproduce is not evidence.

---

## 1. Versioned artifacts

Before this freeze, **nothing in the system carried a version** (N-18): telemetry recorded neither
the model that answered nor the prompt that produced it, and two models served the same endpoint. A
user reporting a bad answer could not be attributed or reproduced. Both constants below are now
stamped onto every `check_completed` event (W-13).

| Artifact | Version / hash (sha256, first 16) |
|---|---|
| `PROMPT_VERSION` (`lib/revora/prompt.ts`) | `2026-07-11.1` |
| `CONTRACT_VERSION` (`lib/revora/safety-contract.ts`) | `2026-07-11.1` |
| `tests/fixtures/safety-contract.json` | `31a893d779476279` |
| `docs/safety/copy-ledger.md` | `78d25846b6a47075` (pre-clinical-rows: bumped by W-01) |
| `lib/revora/prompt.ts` | `4f7236c9c5ec797e` |
| `lib/revora/schemas.ts` (`revoraModelJsonSchema`) | `c2bd0ce319c2c976` |
| `tests/fixtures/revora-eval-cases.json` | `38e9132430e16a96` |

## 2. Models

| | Value |
|---|---|
| Production model | `gpt-5.4-mini` (`DEFAULT_REVORA_MODEL`, overridable via `REVORA_MODEL`) |
| Provider path | **OpenAI-direct** — `openai-client.ts` sets no `baseURL` unless `OPENAI_BASE_URL` is set |
| Outage fallback | `gpt-5.4-nano`, manual + whole-fleet via `REVORA_MODEL`. **No per-user routing** (W-02) |
| Paywall mode | `trial` (`PAYWALL_MODE` default) |

**Removed at this baseline (F-21):** the per-user downgrade to `gpt-5.4-nano` after 10 stored
checks. Because the trial wall 402s every non-premium session upstream of it, the only sessions that
could reach it were paying and trialing ones — the downgrade applied *exclusively to customers*, and
to a model the repo's own bakeoff had failed on schema-validity.

## 3. Test baseline (pre-remediation, measured 2026-07-11)

```
npm run typecheck   → clean
npx vitest run      → 819 passed | 2 skipped (821)
                      106 files passed | 1 skipped (107)
                      duration 470s
```

**After Phases 0–2 + the 2026-07-12 gap-closing round** (measured, not estimated):

```
npm run typecheck   → clean
npm run lint        → 0 errors (12 warnings)
npm run contract    → passes (9 checks)
npx vitest run      → 1099 passed | 2 skipped (1101)
                      113 files passed | 1 skipped (114)
npx playwright test → 15 specs × 2 device projects
```

The `rc-2026-07-12` tag is the immutable ref for all of the above. Phase 0.1 asked for one and none
was ever cut — "the frozen baseline" was a commit sha in a prose document that HEAD had already
moved 24 commits past.

Corrects F-23, which claimed "110 test files, 86 safety/claims tests, 19 mobile smoke" — none of
which is reproducible. Mobile smoke is 13 tests × 2 devices = 26. The "86" and "19" appear nowhere.

## 4. Eval corpus

| | Before | After Phase 0.5 |
|---|---|---|
| Cases | 48 | **88** |
| Categories | 9 (schema-locked, food-only) | **10** (`clinical_risk` added) |
| Cases carrying `acceptableRisks` | **0** | **24** |
| `riskAccuracy` gate (target 0.85) | **`null` → auto-pass. Never once evaluated.** | **ACTIVE** |

The 0.85 risk-accuracy gate has sat in `eval-rubric.ts` since it was written and has **never
evaluated a single case**, because `scoreRun` treats `riskAccuracy === null` as a pass and no case
carried a label (F-06). It now measures over 24 labeled cases.

Labels are **engineering-derived** — `acceptableRisks = {SAFE, MODERATE, HIGH} \ disallowRisk`,
i.e. they make explicit what the corpus authors already asserted rather than inventing new clinical
judgment. They are marked as such in `labelSource` and are **pending RD/CDCES review under W-05**.
A dietitian will likely tighten them (a `high_risk` case currently accepts MODERATE).

## 5. Cost and latency (from the 2026-07-09 bakeoff)

| | gpt-5.4-nano | gpt-5.4-mini |
|---|---|---|
| Harmful-SAFE | 0 | 0 |
| Schema-valid rate | ~95% (**below the 98% threshold**) | 100% |
| p50 / p95 latency | ~1.7s / ~2.5s | ~1.9s / **3.5–5.1s** |
| Median cost/call | $0.00028 | $0.00097 |

mini's p95 already touches the proposed ≤5s SLO. The SLO must be set *from* the re-run data, not
before it — and it was **unmeasurable** until W-13, because telemetry emitted four latency buckets
and never a raw duration (N-13).

## 6. Delivered-result rate — the number the fix must beat

**58–70%** on model-reaching checks, pre-REL-02-fix. The fix is in the tree; the post-fix live
re-validation **has no passing artifact on disk** (N-02) — the only attempt
(`artifacts/qa/2026-07-11T18-37-40-939Z/`) shows **24/24 provider failures, 0 tokens**, i.e. it ran
without credentials and proved nothing. The remediation record nonetheless marked it "live-verified".

**Target: ≥90%.**

## 6b. Accessibility and performance (added 2026-07-12 — Phase 0.4 was missing these)

Phase 0.4 asked for an axe and a Lighthouse baseline and neither was ever recorded, so criteria 9
and the performance work had no "before" column to be measured against. Both are now real
measurements, not estimates.

**axe** — `@axe-core/playwright`, run inside the E2E suite against `/`, `/privacy`, `/terms`,
`/signin`, `/check` and the result card, across both device projects. **0 violations**, and it is
now gated in CI (it was previously unreachable from any npm script).

**Lighthouse** — run 2026-07-12 against the live production deployment
(`https://revora-lovat.vercel.app`, commit `8f3557d`), desktop preset:

| Category | Score |
|---|---|
| Performance | **71** |
| Accessibility | **100** |
| Best practices | **100** |
| SEO | **100** |

| Web vital | Measured |
|---|---|
| First contentful paint | 0.8 s |
| Largest contentful paint | 1.0 s |
| Total blocking time | **580 ms** |
| Cumulative layout shift | 0 |
| Speed index | 2.0 s |

Performance is the one number below par, and TBT is the whole of it — paint and layout stability are
good (LCP 1.0s, CLS 0). That is a main-thread/hydration cost, not a rendering one. It is **not** a
launch blocker and it is **not** silently fine either: it is the perf baseline the next round is
measured against, which is precisely what this section existed to provide and did not.

## 7. What this baseline does NOT contain

Stated explicitly, because the failure mode this document exists to prevent is a confident number
with nothing behind it:

- **No live model evidence.** Every eval figure above is from mocks or the pre-fix bakeoff.
- **No dietitian review.** Zero clinical validation artifacts exist anywhere in the repo (F-06).
- **No prod-provider parity run.** The bakeoff went through OpenRouter; production calls OpenAI
  directly (N-19).
- **No CI.** `.github/workflows/ci.yml` has never been committed, so it has never run (N-03) —
  while the QA record marks it "Fixed".
