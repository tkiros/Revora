# 14 — What the plan asked for and what actually shipped

**Date:** 2026-07-12 · **Method:** every phase, workstream and "done when" clause in
`revora_unconditional_go_implementation_plan.md` checked against the merged tree (`8f3557d`, PR #7),
against CI run `29182369644`, and against the running production deployment. Not "does the code
exist" — *is it wired, is it tested, and can it actually fire.*

**Result: 8 gaps.** Seven are closed in this round. One (the live eval) is an owner decision and
stays open. Tagged `rc-2026-07-12`.

---

## Why this pass existed at all

N-30 was a safety floor that was present, reviewed twice, code-inspected, unanimously reported as
working — and structurally could not fire, because its trigger came from the very component it was
built to backstop. That is not a bug about floors. It is a bug about **how we read code**: we
confirmed a control existed and stopped there.

So this audit asked a different question of every item: *what would have to be true for this to be
incapable of working, and is it true?* Two of the eight gaps turned out to be exactly the N-30 shape.

## The eight

| # | Gap | Status |
|---|---|---|
| 1 | **W-10 churn events could never fire.** `subscription_canceled`/`subscription_refunded` lived on `lib/revora/telemetry.ts`'s enum. The billing webhook does not import that module — it uses `lib/server/billing/telemetry.ts`, whose `.strict()` enum does not contain those names and would have *thrown* on them. `emitSafeEvent` has exactly one call site in the app, in the check route. The comment above the two names read "Emitted from the billing webhook." Nothing had ever emitted them. | **CLOSED** |
| 2 | **W-33 orphan reaper did not exist.** The sweep reaps by joining `pantry_photos → pantry_orders`. An orphan is the object whose row is *already deleted* — that is what `DELETE users` used to leave behind. It is unreachable from that join by construction. `@vercel/blob`'s `list()` was never called anywhere in the repo, so the reaper the plan required had no way to find anything. Blobs orphaned before the account-delete fix landed were still live and unreclaimable. | **CLOSED** |
| 3 | **W-04 / Phase 0.2's placeholder test was never written.** Both the phase and the workstream required a test asserting no `[` placeholder renders on `/terms`. None existed. The 503 checkout gate was the only control, and nothing would have failed the day someone set `LEGAL_TERMS_FINAL=1` with a bracket left behind. | **CLOSED** |
| 4 | **W-17 Tier 2.1 shipped off, untested, and deadlocked.** `mentionsMealComponent()` is an exported, fail-closed enforcement primitive with **zero tests**. Worse, its documented unblock condition was "when W-07's live run has measured the retry-rate delta" — and W-07 was *waived*. The flag's key had been thrown away: it could never legitimately be turned on. | **CLOSED** (tested; gate restated in terms of something that can actually happen) |
| 5 | **W-17 daypart conditioning did not exist.** The plan asked the coach bank to condition on risk / daypart / carbs_only. Risk and carbs_only shipped; daypart did not — so "a short walk after this meal" was served identically at 7am and 9pm. | **CLOSED** |
| 6 | **N-21: `prod-env-check.txt` was still tracked.** It was *added to `.gitignore`* — which does nothing for an already-tracked file. It remained in the index, with 12 key/token names and an (expired) `VERCEL_OIDC_TOKEN`, and gitleaks now scans history with `fetch-depth: 0`. | **CLOSED** (`git rm --cached`) |
| 7 | **Phase 0.1's baseline freeze had no immutable ref, and Phase 0.4's axe/Lighthouse baselines were never recorded.** "The frozen baseline" was a commit sha in a prose doc that HEAD had already moved 24 commits past, and criteria 9 had no "before" column to be measured against. | **CLOSED** (tag `rc-2026-07-12`; real Lighthouse + axe numbers in `baseline-2026-07.md` §6b) |
| 8 | **W-07: no valid post-fix live evidence exists — and the artifact on disk is a trap.** | **OPEN — owner** |

## Gap 8, in detail, because it will be misread

`artifacts/qa/2026-07-11T18-37-40-939Z/bakeoff-summary.json` — the only post-fix live bakeoff —
carries `"passed": true` and `"harmfulSafeCount": 0`.

**It graded nothing.** 46 of its 48 model calls failed at the provider (1,506 tokens total,
`schemaValidRate: 0`). `harmfulSafeCount: 0` is zero because the set was empty, not because the
model was safe. Anyone skimming that JSON for a green light will find one, and it is not there.

Separately, the 88-case graded eval that *did* run against a real model returned
`{"harmfulSafe": 1, "riskAccuracy": 0.917, "passed": false}` — the salmon avocado roll rated "Clear"
at A1C 6.4 — and that run **predates the N-30 fix**. It also wrote no artifact to `artifacts/`
(`scripts/run-graded-evals.mjs` has no artifact-writing code at all), so the only record of the one
honest live run in this project's history is prose in `docs/qa/12`.

So: **`harmfulSafe: 0` has never been observed.** The N-30 *mechanism* is closed and pinned by a
regression test that models an adversarial model (returns SAFE, flags nothing — strictly worse than
the real one). The *corpus* has never been re-graded against reality. Those are different claims and
the scorecard must not blur them, which is the entire lesson of this branch.

To close it (~$2, five minutes), with `OPENAI_BASE_URL` unset so it runs OpenAI-direct — production's
own path — closing the provider-parity gap (N-19) in the same run:

```bash
REVORA_LIVE_EVAL=1 OPENAI_API_KEY="<funded key>" \
REVORA_MODEL="gpt-5.4-mini" \
HEALTH_DATA_KEY="$(head -c 32 /dev/zero | base64)" \
npx vitest run tests/evals/revora-graded-eval.test.ts --reporter=verbose 2>&1 | grep graded_eval_summary
# expect: {"harmfulSafe":0, ..., "passed":true}
```

## Still open, and not closeable by engineering

1. **⚖ Counsel (W-04).** Entity, governing law/venue. Checkout 503s until `LEGAL_TERMS_FINAL=1`;
   the new smoke test now fails the build if that flag is set while a placeholder still renders.
2. **🩺 Dietitian panel (W-05 / F-06).** The one that matters. Also owns `CARB_FORWARD_TOKENS`.
3. **🔒 Key rotation (W-14 / SEC-01, SEC-02).** ~30 minutes in provider dashboards. Note the
   OpenRouter key used for the live eval is almost certainly SEC-01 itself.
4. **🔌 The live eval (W-07).** Gap 8 above. Waived by the owner; still unmeasured.
5. **Branch protection.** CI runs but **cannot block a merge**: the repo is private on a free plan,
   and `GET /branches/main/protection` returns *403 Upgrade to GitHub Pro*. W-08's "main protected"
   criterion is therefore **not met and not currently meetable**. This matters more than it sounds —
   `docs/qa/13` records a P0 that re-entered `main` through a *clean* merge, which is exactly what
   branch protection exists to stop. Fix is a plan upgrade or making the repo public, not code.
6. **Stripe test-clock trial→active conversion.** Still unproven (no `STRIPE_SECRET_KEY` available in
   this environment; zero test-clock code in the repo). Plan line 224 flagged it; it is still flagged.
7. **Live vision eval.** `tests/fixtures/meal-photos/labels.json` does not exist, so
   `meal-photo-eval.test.ts` has always `describe.skipIf`'d itself into silence — it has never
   evaluated a single image. It needs the founder's own consent-safe photos. **Fabricating fixtures
   here would be the N-30 mistake performed deliberately**, so nothing was invented.

## Evidence for this round

```
npm run typecheck   → clean
npm run lint        → 0 errors
npm run contract    → passes (9 checks)
npx vitest run      → 1099 passed | 2 skipped (114 files)   [was 1079]
npx playwright test → 15 specs × 2 device projects
Lighthouse (prod)   → perf 71 · a11y 100 · best-practices 100 · SEO 100
```

The 20 new tests are the point of the round, not the line count: three that prove a churn event
reaches the log, five that prove an orphaned blob is reclaimed and an in-flight one is not, nine on
the coach bank and the component-mention rule that had none, and one E2E that binds the legal
placeholders to the checkout gate so the two can never drift apart.
