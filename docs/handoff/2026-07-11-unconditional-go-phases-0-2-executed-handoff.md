# Handoff — Unconditional-Go plan, Phases 0–2 executed

**Date:** 2026-07-11 · **Branch:** `feat/video-engine-renderer` · **Base:** `origin/main` (`c04d713`)
**Commits:** 11, ahead of `origin/main`. **Not pushed** (see BLOCKER 1).
**Verdict reached:** **CONDITIONAL GO** (was: NO-GO for broad paid launch)

Source plan: `docs/qa/revora_unconditional_go_implementation_plan.md`
Scorecard (regenerated): `docs/qa/revora_release_scorecard.md`
Baseline (the "before" column): `docs/qa/baseline-2026-07.md`

---

## 1. Read this first — the finding that matters most

Running the graded eval against a **real model for the first time** failed the one hard P0 gate:

```json
{"total":88,"harmfulSafe":1,"riskAccuracy":0.917,"passed":false}
```

`gpt-5.4-mini` returned **SAFE** for a **salmon avocado roll at A1C 6.4** — the top of the range
Revora serves. It would have shipped to the user as **"Clear."**

The conservatism floor that exists to prevent exactly this **could not fire**:

```js
// lib/revora/postprocess.ts (pre-fix)
const upperBandBorderline =
  route.band === "prediabetes_63_64" &&
  (flags.has("borderline") || flags.has("carbs_only"));
```

`flags` = precheckFlags ∪ **the model's own `policy_flags`**. For that meal the deterministic
precheck contributed nothing (salmon is a genuine protein buffer, so it is not carbs-*only*), so the
only possible source of the `borderline` flag was **the model itself**.

> The safety floor whose entire job is to catch a model that wrongly answers SAFE required that same
> model to volunteer that it was unsure.

A model confident enough to return SAFE does not flag itself borderline. The floor was structurally
unreachable in precisely the case it was built for.

**Both prior reviews inspected that control and recorded it as WORKING.** The mock evals were green
throughout, because the mock for that case *supplies the flag the real model omits* — they were
grading the fixture, not the system.

**Fixed** (`isCarbForward()` in `lib/revora/input-precheck.ts` gives the floor a trigger the model
cannot veto) with a regression test that models an adversarial model (returns SAFE, flags nothing).
Full write-up: **`docs/qa/12-live-eval-finding-model-gated-floor.md`**.

⚠️ **The confirming live re-run has NOT been executed** — see BLOCKER 2.

---

## 2. Gates: before → after

| Gate | Before | After |
|---|---|---|
| `npm run typecheck` | clean | **clean** |
| `npx vitest run` | 819 passed / 107 files | **1079 passed / 114 files** (exit 0) |
| `npm run eval:revora` | 48 cases, 9 categories | **88 cases, 10 categories; clinical routing 100%** |
| riskAccuracy 0.85 gate | **never evaluated** (0 labels ⇒ `null` ⇒ auto-pass) | **ACTIVE** — 24 labeled cases |
| Runtime banned-claims check | **never ran** (regexes were prompt *labels* only) | **enforced, fail-closed** |
| `npm run build` | never gated | **gated, passing** |
| `npm run lint` | no config, no script, eslint not installed | **gated, 0 errors** (12 warnings) |
| `npm run e2e` (15 specs incl. axe) | **unreachable from any script** | **62 passed, 0 failed** |
| `npm run contract` | validator existed, wired to nothing | **gated in CI** |
| CI | **never ran** (workflow never committed) | **committed, 4 jobs** |

> Note: a full-suite run that overlaps a Playwright run will show ~13 spurious file failures from
> resource contention (two `next dev` servers). Run them separately. The clean run is 1079/1079.

---

## 3. What was done, by finding ID

### P0s closed (6)

| ID | Fix | Key files |
|---|---|---|
| **F-09/F-10** clinical routing | New deterministic router, 8 classes, word-boundary regexes, strict precedence. Runs **first** in `service.ts` — before `routeA1C` and before the food precheck — which is what gives "medical precedence over meal classification" for free. Non-generative `clinical` response kind with **no `risk` field**, so it is structurally incapable of carrying a verdict. No model call. | `lib/revora/clinical-risk.ts` (new), `schemas.ts`, `fallback.ts`, `service.ts`, `safety-contract.ts`, `telemetry.ts`, `eval-rubric.ts`, `lib/client/{ui-state,check}.ts`, `components/result-card.tsx`, `docs/safety/copy-ledger.md` (8 new approved rows) |
| **F-21** paid-user downgrade | Deleted the nano tiering + `countChecksTotal` (its only caller). Because the trial wall 402s every non-premium session upstream, **only paying/trialing users were ever downgraded**. Pinned test **inverted** so it cannot come back. | `app/api/check/route.ts`, `lib/server/entitlement.ts` |
| **F-13** "steady choice" | Repeat-meal insight now reads `check.risk`. A repeatedly-**flagged** meal gets a swap prompt (`repeat_meal_risk`), never a compliment. Daypart copy no longer calls HIGH meals "be careful". | `lib/coach/insights.ts` |
| **N-23/N-24** blob lifecycle | Single deletion funnel. Blobs deleted **before** the `DELETE users` cascade (which used to orphan them forever). Terminal states + sweep GC + retention ceiling. Fixed latent bug: rows were marked `deleted` even when the Blob API **threw**. Privacy copy now matches verified behaviour. | `lib/server/blob.ts` (new), `app/api/account/delete/route.ts`, `lib/server/pantry/*`, `app/(app)/privacy/page.tsx` |
| **N-30** model-gated floor ⚠️ NEW | See §1. | `lib/revora/input-precheck.ts`, `postprocess.ts`, `tests/unit/revora/upper-band-floor.test.ts` |
| **F-26** legal placeholders | **Code side done.** Paid checkout **503s unless `LEGAL_TERMS_FINAL=1`** (default OFF). Cancel/portal deliberately NOT gated — an existing subscriber must always be able to leave. | `app/api/billing/handlers.ts` |

### P1/P2 closed

- **W-06 (N-01)** — safety-contract regexes now **actually run** on model output (they were prompt
  labels only). Covers the `clarify` arm too, which bypasses postprocess entirely. Fail-closed.
- **W-13 (N-18/N-13)** — `PROMPT_VERSION`, `CONTRACT_VERSION`, `model`, `durationMs` on telemetry.
  p95 is now computable (four buckets never could).
- **W-17 (F-12)** — 6 audited variants per coach slot (was 1, forever, on every flagged meal),
  deterministic rotation via a client counter (never `Math.random()`), drink suppression (the plate
  tip used to attach to a milkshake), honest framing ("A pattern that helps many people").
  Tier 2.1 prompt rule ships ON; its fail-closed enforcement ships **OFF**
  (`REVORA_ENFORCE_COMPONENT_MENTION=1`) until W-07 measures the retry-rate delta.
- **W-21 (N-17)** — word-boundary matching for risk-*suppressing* lists (eggnog no longer reads as
  "egg"); loose matching kept for risk-*raising* lists (so "cookies"/"cupcake" still match);
  `BUFFER_EXCLUSIONS` for confections that hide a whole buffer word ("jelly beans", "protein bar").
- **W-10/W-30 (N-12)** — `onboarding_started`, `result_helpful`, `clinical_route`, `first_check`;
  "Was this practical?" UI. Without these, F-12's repetition problem is invisible in production.
- **W-11/W-12/W-16/W-18/W-20/W-36** — rate limits on `/api/trial/start` + `/api/auth/*`; `refunded`
  is now terminal (out-of-order webhooks can't resurrect it); repeat-trial guard (no migration);
  `invoice.payment_failed` handled; portal provider filter; legacy price unified; constant-time cron
  bearer compare (`lib/server/timing-safe.ts`); history-migrate bounds.
- **W-34 (N-26)** — `HEALTH_DATA_KEY` version byte; GCM auth-tag failure (tampering) no longer masked
  as a benign "(unreadable entry)".
- **W-08/W-22 (N-03/N-21)** — CI committed with lint/build/contract/e2e/secret-scan; client Sentry
  with a strict integration allowlist; `prod-env-check.txt` untracked.
- **W-09/W-15(XS)/W-24** — swap promise hedged (SAFE results are *structurally forbidden* a swap);
  free-tier number derived from `TASTER_LIMIT` everywhere (three surfaces disagreed; the Play listing
  promised "five a day, every day"); DPP claim removed from BAI; "Most popular" deleted;
  `PRODUCT.md:13` reversal North Star annotated; single `RISK_LABELS` source.
- **Phase 0** — `docs/qa/baseline-2026-07.md`; corrected two QA-record rows that their own artifacts
  contradicted (REL-02 "live-verified" — the artifact shows 24/24 provider failures; QA-01 "Fixed" —
  the CI workflow had never been committed); retired `03-release-scorecard.md`.

### Deliberately NOT done (with reasons)

- **`vercel.json` crons** — I initially believed `pantry-sweep`/`nudge`/`trial-precharge` never fire.
  **Wrong.** `docs/ops/env-reference.md:34` documents them running on a Railway `hourly-crons`
  service. Adding them to `vercel.json` would **double-fire** them. Left alone.
- **W-23 photo kill switch** — the finding says it's build-time only. The *enforcement point*
  (`app/api/check/photo-draft/route.ts:62`) reads the env at request time server-side, so flipping
  `NEXT_PUBLIC_PHOTO_INPUT=0` kills the feature immediately; only the button lingers until redeploy.
  The model-tiering flag half of W-23 is moot — W-02 deleted the tiering.
- **Phase 3 L/XL** — W-19, W-25, W-26, W-27, W-28, W-29, W-31, W-32, W-35. Per plan, post-decision.

---

## 4. BLOCKERS — do these first in the new session

### BLOCKER 1 — the branch is NOT pushed (`workflow` scope)

`git push` is rejected:

```
! [remote rejected] refusing to allow an OAuth App to create or update workflow
  `.github/workflows/ci.yml` without `workflow` scope
```

`gh` token scopes are `admin:public_key, gist, read:org, repo` — **no `workflow`**. SSH to
github.com hangs on this machine, so that route is closed too.

**The user agreed to grant the scope but had not yet run it when the session ended.**

```bash
gh auth refresh -s workflow     # opens a browser
git push -u origin feat/video-engine-renderer
gh pr create --base main --title "..." --body-file <PR body — see §6>
```

Fallback if the scope can't be granted: drop `.github/workflows/ci.yml` from commit `95226b3`, push
the other 118 files, and add the workflow by hand. **W-08 then stays half-open** — the gates exist as
npm scripts but nothing enforces them on PRs, which is the exact condition QA-01 was falsely marked
"Fixed" against. Prefer granting the scope.

### BLOCKER 2 — the N-30 fix has NO live confirmation, and the OpenRouter account is empty

`openr.md` (gitignored, untracked) holds the OpenRouter key. **Balance: $7.997 of $8.00 used — the
account is exhausted.** A 1024-token request now 402s.

The N-30 fix is proven **deterministically** (the regression test models a model that returns SAFE
and flags nothing — strictly *worse* than the real model's observed behaviour), but a live
`harmfulSafe: 0` **has not been observed**.

**This is the single most important remaining check.** Top up, then:

```bash
KEY=$(grep -oE 'sk-or-v1-[A-Za-z0-9_-]+' openr.md | head -1)
REVORA_LIVE_EVAL=1 OPENAI_API_KEY="$KEY" \
OPENAI_BASE_URL="https://openrouter.ai/api/v1" \
REVORA_MODEL="openai/gpt-5.4-mini" \
HEALTH_DATA_KEY="$(head -c 32 /dev/zero | base64)" \
npx vitest run tests/evals/revora-graded-eval.test.ts --reporter=verbose 2>&1 | grep graded_eval_summary
```

**Expect `harmfulSafe: 0` and `passed: true`.** If not, do not ship — investigate.

> NB: `npx vitest run` on that file **without `REVORA_LIVE_EVAL=1` runs against MOCKS and passes
> trivially**. That is exactly how N-30 hid. Always set the flag and check the summary JSON.

### BLOCKER 3 — an unfinished tamper-test of the claims audit

Lane C narrowed `tests/unit/revora/claims-boundary-copy.test.ts` to **skip lines whose first
non-space character opens a comment** (rationale: a comment line never renders; JSX text and string
literals never begin with `//`, `/*`, or `*`). Markdown docs and JSX `{/* */}` blocks are still
scanned, and trailing comments on code lines are still scanned.

That reasoning is sound, and the suite is green (108 tests, with `KNOWN_BAD` control samples). **But
I was mid-way through an empirical tamper-test when the session ended and did not finish it.** The
first attempt was a false alarm — my injection string didn't match because Lane C had rewritten the
hero for F-01, so nothing was actually injected and the green result meant nothing.

**Finish this.** Inject a real banned claim into *rendered JSX text* and confirm the audit goes RED:

```bash
cp app/page.tsx /tmp/page.bak
# anchor is the CURRENT hero text:
python3 - <<'PY'
p="app/page.tsx"; s=open(p).read()
old="Should I eat this? One calm verdict, in seconds."
assert old in s, "ANCHOR NOT FOUND"
open(p,"w").write(s.replace(old,"Revora cures prediabetes and will lower your A1C.",1))
PY
npx vitest run tests/unit/revora/claims-boundary-copy.test.ts   # MUST FAIL
cp /tmp/page.bak app/page.tsx && git checkout -- app/page.tsx   # restore
```

If it does **not** fail, the audit has been hollowed out and must be fixed before merge.
**The working tree was left clean and the hero text restored — verify with `git status` first.**

---

## 5. The four human conditions (nothing here is blocked on engineering)

1. **⚖ Counsel (W-04).** Operating entity + governing law/venue. Until `LEGAL_TERMS_FINAL=1`, paid
   checkout 503s **by design** — the app cannot take money under draft Terms.
2. **🩺 Dietitian panel (W-05 / F-06).** *The one that matters.* 2 RDs + 1 CDCES over the ~240-case
   corpus; sign-off on the clinical-route copy (the `clinical-*` rows in the copy ledger are drafted
   from CDC/NIDDK guidance and marked **pending**); and ownership of `CARB_FORWARD_TOKENS`, which is
   a dietary judgment engineering should not be making.
   **N-30 is the argument for this condition.** A control was present, reviewed, code-inspected and
   unanimously reported as working — and could not fire. Only running it against reality found that.
   *No one has ever run a Revora verdict past a dietitian.*
3. **🔒 Key rotation (W-14 / SEC-01, SEC-02).** ~30 min in provider dashboards. **The OpenRouter key
   used for this round's live eval is almost certainly SEC-01 itself** — testing with it did not
   rotate it.
4. **🔌 One OpenAI-direct eval run (W-07 / N-19).** This round's live evidence came via **OpenRouter**
   — which is the *same provider mismatch* N-19 is about (one probe resolved via **Azure**). It
   closes "no post-fix live evidence" and gives thresholds a real number to ratify, but **not**
   prod-provider parity. Run once with `OPENAI_BASE_URL` **unset** against a funded OpenAI key
   (`openai-client.ts` already supports both; unset = OpenAI-direct, which is production's path).

---

## 6. Suggested PR body

> **Title:** `Unconditional-Go plan: Phases 0–2 — six P0s closed, CONDITIONAL GO`
>
> Executes Phases 0–2 of `revora_unconditional_go_implementation_plan.md` plus the cheap P2s.
>
> **Six P0s closed**, including one the plan didn't know about: the upper-band conservatism floor
> was **model-gated** and could not fire. Found by running the graded eval against a real model for
> the first time — it shipped a harmful-SAFE (a salmon avocado roll rated "Clear" at A1C 6.4). Both
> prior reviews had recorded that control as working. See `docs/qa/12`.
>
> **Two P0s remain open, and both are human:** counsel (W-04 — but paid checkout now 503s unless
> `LEGAL_TERMS_FINAL=1`) and the dietitian panel (W-05).
>
> Gates: vitest 819→**1079** · eval corpus 48→**88 cases**, clinical routing **100%** · riskAccuracy
> gate **never evaluated → active** · runtime banned-claims **never ran → enforced** ·
> build/lint/E2E/secret-scan/CI **all gated for the first time**.
>
> **Verdict: CONDITIONAL GO.** Not unconditional — see `docs/qa/revora_release_scorecard.md` §"The
> four conditions". **Do not merge before finishing BLOCKER 2 and BLOCKER 3** in the handoff.

---

## 7. Commit stack (11, oldest last)

```
94ac236 docs(qa): regenerate the release scorecard — CONDITIONAL GO
80ae3c4 docs(qa): baseline, corrected record, and the finding that mattered most
95226b3 ci: make the gates real (W-08/W-22, N-03/N-21)          ← blocked by workflow scope
81e5c48 fix(claims): reconcile every surface with what the engine can actually do
26c00f4 fix(privacy): make the deletion promise true (N-23/N-24/N-26, P0)
0986bc1 fix(payments,security): abuse limits, refund ordering, repeat trials, legal gate
707f9a8 feat(ai): enforce the safety contract at runtime; end coach repetition (W-06/13/17/10/30)
3f00892 fix(safety): the conservatism floor was model-gated and could not fire (N-30, P0)
04a84ce fix(coach): stop praising meals the app rated HIGH (F-13, P0)
6ce3ae7 fix(model): never downgrade a paying user's model (F-21, P0)
13ede1a feat(safety): deterministic clinical-risk router (F-09/F-10, P0)
```

119 files changed, +16,439 / −2,219. Working tree clean.

## 8. New env vars

| Var | Default | Meaning |
|---|---|---|
| `LEGAL_TERMS_FINAL` | unset = **blocked** | `1` unlocks paid checkout. Set only after counsel signs off. |
| `OPENAI_BASE_URL` | unset = **OpenAI-direct** | Eval/failover seam. Production must leave it unset. |
| `REVORA_ENFORCE_COMPONENT_MENTION` | unset = **off** | Turns W-17 Tier-2.1 into a fail-closed rule. Enable only after W-07 measures the retry-rate delta (≤2pt budget). |
| `NEXT_PUBLIC_SENTRY_DSN` | unset = inert | Browser Sentry. Server still reads `SENTRY_DSN`. |
| `LEGAL_ENTITY`, `GOVERNING_LAW`, `SUPPORT_EMAIL` | placeholders | Counsel fills; a smoke test asserts no `[` renders on `/terms` or `/privacy`. |

## 9. The general lesson worth keeping

> **Any safety check whose trigger condition is supplied by the component it is meant to backstop is
> not a safety check.**

That is N-30 in one line, and it is worth grepping for others: a floor, guard, or assertion that
reads `modelOutput.*` to decide whether to inspect `modelOutput.*` has this shape.

The second lesson: **a gate that has never failed may never have run.** The 0.85 riskAccuracy gate
sat in the codebase for months returning `null` (⇒ auto-pass) because no case carried a label. The
CI workflow was marked "Fixed" against a file that was never committed. The safety-contract regexes
were "enforced" as prompt labels. Each was reported as working. Check that a gate can go red.
