# Session handoff — Revora Unconditional-Go, as of 2026-07-12

**Paste this file (or its path) into a new session to continue.**

You are picking up the Revora release-readiness effort. Two rounds of work are complete and merged.
Everything below is verified against the tree, CI, and the running production deployment — not
against prose. Where a claim is unproven, this document says so explicitly, because the entire
lesson of this branch is that **a gate nobody ran is not a gate that passed.**

---

## 0. Ground truth — where things actually are

| Fact | Value |
|---|---|
| Branch | `main` |
| HEAD | `28e81d3` — *fix(qa): close the eight gaps between the plan and the tree (#9)* |
| Prior merge | `8f3557d` — *Unconditional-Go plan: Phases 0–2 (#7)* |
| Immutable ref | tag **`rc-2026-07-12`** (pushed) |
| CI | **green, 4/4** on `main` — run `29185094775` |
| Production | **live on `28e81d3`**, aliased `https://revora-lovat.vercel.app` |
| Verdict | **CONDITIONAL GO** (`docs/qa/revora_release_scorecard.md`) |

**Local gates, all passing on HEAD:**
```
npm run typecheck   → clean
npm run lint        → 0 errors (12 warnings)
npm run contract    → passes (9 checks)
npx vitest run      → 1099 passed | 2 skipped (113 files passed, 1 skipped)
npx playwright test → 15 specs × 2 device projects (Mobile Chrome / Mobile Safari)
```

> ⚠️ **Local E2E caveat.** A full local `npx playwright test` may show ~14 failures. They are **cold-compile
> timeouts** under parallel load (Next dev compiles each route on first hit), *not* real breakage — the
> same specs pass 17/17 in isolation, and CI's Playwright job passes in ~7m30s. **Trust CI, not a loaded
> local box.** Do not "fix" these by changing product code.

**Live production probes (re-run these to confirm nothing drifted):**
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "Content-Type: application/json" -d '{}' \
  https://revora-lovat.vercel.app/api/billing/stripe/checkout      # expect 503 (legal gate)
curl -s https://revora-lovat.vercel.app/api/health                 # expect db:ok, 4 crons ok
```

---

## 1. What has been done

### Round 1 — Phases 0–2 of the plan (merged as `8f3557d`, PR #7)

Six P0s closed, CI stood up for the first time in the repo's history.

| Item | What shipped |
|---|---|
| **W-01** clinical-risk router (F-09/F-10) | `lib/revora/clinical-risk.ts` — 8 classes, word-boundary regexes, runs in `service.ts` **before** prompt construction, so "no model call on a clinical route" is *structural*. 40-case corpus, 100% routing. Ships **fail-closed** (safer than the plan's fail-open). |
| **W-02** paid-user nano downgrade (F-21) | Tiering deleted; `countChecksTotal` removed. The pinned test is **inverted** — it asserts no call in a 25-check session uses a cheaper model. |
| **W-03** "steady choice" (F-13) | Repeat-meal insight filtered to `risk === "SAFE"`; a flagged repeat now earns a swap prompt, never a compliment. |
| **W-04** legal gate (F-26) | `checkoutGate()` — all three paid entry points **503 unless `LEGAL_TERMS_FINAL=1`**, default off. Portal/cancel deliberately exempt (a subscriber must always be able to leave). |
| **W-33** blob lifecycle (N-23/N-24) | Blobs deleted **before** the cascading `DELETE users`; terminal-state + sweep GC; 7-day retention ceiling. Uploads remain **public-read** — the privacy copy was rewritten to be truthful about that (the plan's permitted fallback). **Do not record this as "switched to private access."** |
| **N-30** model-gated floor | Found by running the eval against a real model for the first time. The upper-band floor's trigger came from the model's own `policy_flags` — so a model confident enough to answer SAFE defeated it by construction. Now triggered by `isCarbForward()` in `input-precheck.ts`, which the model cannot veto. |
| **W-06..W-20** | Runtime banned-claims enforcement (N-01), CI, claims/copy reconciliation, rate limits, refund ordering, telemetry versioning, single `RISK_LABELS`, repeat-trial guard, `payment_failed`, portal provider filter. |

### Round 2 — the plan-vs-tree gap audit (merged as `28e81d3`, PR #9)

An audit asked a different question of every item than the previous two reviews: not *does this code
exist* but **can it actually fire**. Eight gaps. Seven closed. Full account:
**`docs/qa/14-plan-vs-tree-gap-audit.md`**.

**Two were the N-30 shape exactly** — a control present, documented, and structurally incapable of working:

1. **W-10 churn events were dead enum entries.** `subscription_canceled` / `subscription_refunded`
   were declared on `lib/revora/telemetry.ts`'s enum. The billing webhook does not import that module —
   it uses `lib/server/billing/telemetry.ts`, whose `.strict()` enum lacked both names and would have
   **thrown** on them. The comment above them read *"Emitted from the billing webhook."* Nothing ever
   had. → Moved to the webhook's own module; emitted off the `RETURNING` rows, so a refund for a
   subscription we don't hold emits nothing. 3 tests drive the real `applyStripeEvent`.
2. **W-33's orphan reaper did not exist.** The sweep reaps by joining `pantry_photos → pantry_orders`,
   but an orphan is *by definition* the blob whose row is already gone — unreachable from that join.
   `list()` was never called anywhere in the repo. → `reapOrphanBlobs()` walks the **store** and deletes
   what the DB cannot account for, with a 1h age floor so an in-flight upload isn't mistaken for garbage.
   Wired into the hourly sweep. This reclaims blobs orphaned *before* the account-delete fix landed.

Also closed:
3. **W-04's placeholder test** (asked for twice, never written). Written as the *invariant* — **if
   checkout is open, the legal pages must carry no placeholder** — so it arms itself automatically the
   day someone sets `LEGAL_TERMS_FINAL=1`. (`tests/smoke/legal-placeholders.spec.ts`)
4. **W-17 Tier 2.1** — `mentionsMealComponent()` was an exported, fail-closed enforcement primitive with
   **zero tests**, and its unblock condition was a live run that had been *waived* (the flag's key was
   thrown away). Now tested; gate restated in terms of something that can actually happen.
5. **W-17 daypart conditioning** — missing entirely, so "a short walk after this meal" served identically
   at 7am and 9pm. Now conditions on the daypart the client already computes, reusing `daypartOfHour`.
6. **N-21** — `prod-env-check.txt` was added to `.gitignore`, which does nothing for an already-tracked
   file. `git rm --cached`'d.
7. **Phase 0 leftovers** — no immutable ref for the "frozen" baseline (now tag `rc-2026-07-12`), and no
   axe/Lighthouse baseline (now measured against production: **perf 71 · a11y 100 · best-practices 100 ·
   SEO 100**; TBT 580ms is the whole of the perf gap — LCP 1.0s, CLS 0).

Suite went 1079 → **1099 passing**.

---

## 2. What must be done next — exact actions

### 🔴 BLOCKER 1 — Run the live eval (W-07). *This is the single most important open item.*

**Status: `harmfulSafe: 0` has NEVER been observed. It is not "passing." It is unmeasured.**

The owner waived this on 2026-07-12. The only live graded run ever executed returned
`{"total":88,"harmfulSafe":1,"riskAccuracy":0.917,"passed":false}` — `gpt-5.4-mini` rated a salmon
avocado roll **SAFE** at A1C 6.4, which would have shipped to the user as **"Clear."** That run
**predates the N-30 fix.** The mechanism is closed and pinned by a regression test that models an
adversarial model (returns SAFE, flags nothing — strictly worse than the real one). The **corpus has
never been re-graded against reality**, so a *different* harmful-SAFE among the other 87 cases would not
have been caught by anything in this branch.

> ⚠️ **TRAP — do not cite this artifact.** `artifacts/qa/2026-07-11T18-37-40-939Z/bakeoff-summary.json`
> reads `"passed": true, "harmfulSafeCount": 0`. **It graded an empty set** — 46 of its 48 model calls
> failed at the provider (1,506 tokens, `schemaValidRate: 0`). Zero harmful-SAFEs because *nothing was
> evaluated*, not because the model was safe. Anyone skimming that JSON for a green light will find one
> that is not there.
>
> ⚠️ A green **mock** run also proves nothing — `npx vitest run tests/evals/revora-graded-eval.test.ts`
> without `REVORA_LIVE_EVAL=1` grades the fixtures, not the system. **That is precisely how N-30 hid.**

**Exact action (~$2, five minutes).** Needs a funded OpenAI key. Leaving `OPENAI_BASE_URL` **unset** runs
OpenAI-direct — production's own path — which closes the provider-parity gap (N-19) in the same run:

```bash
REVORA_LIVE_EVAL=1 OPENAI_API_KEY="<funded key>" \
REVORA_MODEL="gpt-5.4-mini" \
HEALTH_DATA_KEY="$(head -c 32 /dev/zero | base64)" \
npx vitest run tests/evals/revora-graded-eval.test.ts --reporter=verbose 2>&1 | grep graded_eval_summary
# PASS = {"harmfulSafe":0, ..., "passed":true}
```

**Done when:** `harmfulSafe: 0` and `passed: true` observed on the 88-case corpus against a real model,
via OpenAI-direct. **Commit the output** — note `scripts/run-graded-evals.mjs` writes **no artifact**
(it has no artifact-writing code at all), so the result must be pasted into the QA record by hand, or
better: add artifact-writing to that script while you're there.

**If it fails:** that is a genuine P0 and the launch decision reverts to NO-GO until the failing cases
are fixed. Treat a failure as information, not as a problem with the test.

**Unblocks:** also flips criterion 5 (model thresholds) from FAIL, and gives W-17's
`REVORA_ENFORCE_COMPONENT_MENTION` flag a measured retry-rate delta so it can legitimately be turned on
(see §3).

---

### 🔴 BLOCKER 2 — ⚖ Counsel (W-04). External, long lead time — start immediately if not already.

`/terms` renders literal placeholders today: `[Revora's operating entity — counsel to confirm]` and
`[Governing law/venue — counsel to confirm]`, plus a "working draft pending counsel review" banner.

**Exact actions:**
1. Counsel supplies: operating entity, governing law/venue, refund-policy confirmation (Q7), and a
   health-claims review of the result-surface copy (F-14/F-15).
2. Eng replaces the placeholders in `app/(app)/terms/page.tsx:135,167` and clears the banner at `:28`.
3. Set `SUPPORT_EMAIL`.
4. **Then and only then** set `LEGAL_TERMS_FINAL=1` in the production env.

**Safety net already in place:** `tests/smoke/legal-placeholders.spec.ts` fails the build if checkout is
open while *any* placeholder still renders. You cannot flip the flag and leave a bracket behind — CI
will stop you. Until the flag is set, **paid checkout returns 503 by design** (verified live).

**Done when:** sign-off recorded per market; `LEGAL_TERMS_FINAL=1` set; the smoke test still green.

---

### 🔴 BLOCKER 3 — 🩺 Dietitian panel (W-05 / F-06). External, longest pole. *The one that actually matters.*

**No dietitian has ever reviewed a Revora verdict.** The automated risk-accuracy gate now *runs* (24
labeled cases, 0.85 target) but the human validation has not happened at all.

**N-30 is the argument for this condition.** A safety control was present, reviewed twice,
code-inspected, and unanimously reported as working — and could not fire. Only running it against
reality found that. This is the same class of gap, still open.

**Exact actions** (protocol is already specified in `sol_deep_analysis.md` §5 and is sound — adopt it):
1. Recruit **2 RDs + 1 CDCES**.
2. Lock the ~240-case corpus; predefine the disagreement rubric.
3. Gates: **zero dangerous false reassurance · 100% medical routing · ≥85% direction agreement ·
   ≥90% safe/feasible adjustments · <15% generic · ≥95% non-shaming**.
4. Panel must also sign off on:
   - the **clinical-route response copy** (W-01), and
   - **`CARB_FORWARD_TOKENS`** in `lib/revora/input-precheck.ts` — this vocabulary is a *dietary
     judgment* and engineering should not be the one making it. It is currently engineering-authored
     and deliberately conservative.
   - the `acceptableRisks` labels on the 24 eval cases (currently `labelSource: engineering-derived,
     PENDING RD/CDCES review`).
5. Then the 25–30-person real-user week with the stated product gates.

**Done when:** gates pass and are recorded. This converts F-06 from FAIL to PASS and is the last thing
standing between CONDITIONAL and UNCONDITIONAL GO.

---

### 🔴 BLOCKER 4 — 🔒 Key rotation (W-14 / SEC-01, SEC-02). ~30 minutes of human work. Do it today.

**Exact actions:**
1. Rotate the **OpenRouter** key (SEC-01) in the provider dashboard.
2. Rotate the **5 provider keys exposed in git history at commit `213ab8a`** (SEC-02).
3. Verify the old keys are dead (a test call must fail).
4. Write the attestation into `docs/qa/` — there is currently **no attestation document anywhere**.

⚠️ **The OpenRouter key used for the last live eval is almost certainly SEC-01 itself.** Testing with a
key does not rotate it. Also note CI's gitleaks now scans history with `fetch-depth: 0`, so it will keep
finding SEC-02 until this is done.

**Done when:** written attestation in the QA record; old keys confirmed revoked.

---

### 🟠 IMPORTANT — Branch protection. CI runs but **cannot block a merge.**

`GET /repos/tkiros/Revora/branches/main/protection` → **403 "Upgrade to GitHub Pro or make this
repository public."** The repo is private on a free plan, so branch protection **is not available at
all**. W-08's "main protected" criterion is **not met and not currently meetable in code.**

This matters more than it sounds: `docs/qa/13` records a **P0 that re-entered `main` through a *clean*
merge** (a P0 closed by *deletion* has no merge conflict guarding it). Branch protection is exactly the
control that stops that, and it is absent.

**Exact action (owner decision, not code):** upgrade to GitHub Pro/Team, **or** make the repo public.
Then enable branch protection on `main` requiring all 4 CI jobs to pass.

---

## 3. Smaller open items, with exact actions

| # | Item | Action | Blocked on |
|---|---|---|---|
| 1 | **W-17 Tier 2.1 flag is off** | `REVORA_ENFORCE_COMPONENT_MENTION` is `0`. The rule (adjustment must name a component of the user's meal) is fail-closed, so turning it on without measuring its false-positive rate would degrade real users to retry cards at an unknown rate — the F-21 mistake. **Turn it on once any real-model run measures the retry-rate delta at ≤2pts.** A green *mock* run does not qualify and never will. The pure function is now fully unit-tested regardless. | Blocker 1 |
| 2 | **Stripe test-clock trial→active conversion is unproven** | No `STRIPE_SECRET_KEY` was available in this environment, and there is **zero test-clock code in the repo** (`grep -ri test_clock` → nothing outside planning docs). Extend `scripts/e2e-stripe-lifecycle.mjs` with a Stripe **test clock**, advance it past the 7-day trial, and assert the subscription flips `trialing → active` via `invoice.paid`. The E2E harness proves 12/12 steps *except* this one. | Stripe test keys |
| 3 | **Live vision eval has never run a single image** | `tests/evals/meal-photo-eval.test.ts` gates on `tests/fixtures/meal-photos/labels.json`, which **does not exist**, so it has always `describe.skipIf`'d itself into silence. Needs the **founder's own consent-safe meal photos** + labels. **Do NOT fabricate fixtures** — grading authored fixtures is the N-30 mistake performed deliberately. | Real photos |
| 4 | **`scripts/run-graded-evals.mjs` writes no artifact** | Add artifact-writing so a live run leaves evidence on disk. Right now the only record of the one honest live run in this project's history is *prose* in `docs/qa/12`. Fix this while doing Blocker 1. | — |
| 5 | **Perf: TBT 580ms** | Lighthouse perf 71 against production; paint and layout are fine (LCP 1.0s, CLS 0). It is a main-thread/hydration cost. Not a launch blocker; it is the baseline the next round is measured against. | — |
| 6 | **Pantry blobs are still public-read** | `access: "public"` with unguessable-URL security only. The privacy copy was rewritten to say so truthfully (the plan's permitted fallback). If you want the *primary* branch, switch uploads to private access and revert the copy. | Product decision |
| 7 | **Phase 3 backlog (W-18..W-36)** | Post-launch-decision backlog. Not launch-blocking. See the plan's Phase 3 table. | — |

---

## 4. The twelve criteria — current state

| # | Criterion | Status |
|---|---|---|
| 1 | Core journeys reliable | **PARTIAL** — delivered-rate unproven on the prod provider (Blocker 1) |
| 2 | Food analysis useful within limits | **PARTIAL** — the accuracy gate runs; the dietitian panel has not (Blocker 3) |
| 3 | AI output safe; no unsupported claims | **PASS** |
| 4 | Ambiguity → clarify, never fabricated certainty | **PASS** |
| 5 | Model meets approved thresholds | **FAIL — unmeasured** (Blocker 1) |
| 6 | Paywall/entitlements correct | **PASS** |
| 7 | Sensitive data, photos, keys protected | **PARTIAL** — blobs fixed; **key rotation still owed** (Blocker 4) |
| 8 | Privacy controls work as documented | **PASS** — deletion now does what the page promises; orphan reaper added |
| 9 | Accessible; risk never colour-only | **PARTIAL** — axe 0 violations, Lighthouse a11y 100. A11Y-01's CTA *top edge* is on the first screen, but the **whole button still does not fit on either device** — that is a form redesign, still open |
| 10 | Monitoring, analytics, CI sufficient | **PASS** — CI real and green; churn events now actually fire |
| 11 | Claims aligned with capability | **PASS** |
| 12 | P0s resolved | **PARTIAL** — engineering P0s closed; 2 external remain |

**Verdict stays CONDITIONAL GO until Blockers 1–4 are closed.** Blockers 2 and 3 are external calendar
time — **start them today**; they are the critical path. Blockers 1 and 4 are hours of work and are the
cheapest wins on the board.

---

## 5. Working principles for whoever picks this up

These are earned, not stylistic:

1. **A gate nobody ran is not a gate that passed.** Never let a scorecard blur "passing" and
   "unmeasured." That distinction is the only reason N-30 was ever found.
2. **Ask of every control: *can this actually fire?*** Not "does it exist." Two of this round's eight
   gaps were controls that were present, documented, reviewed — and structurally incapable of working.
   Grep for the shape: **any check whose trigger is supplied by the component it is meant to backstop.**
3. **Never grade the fixture.** A green mock run proves the mock is green. The moment a test authors the
   very thing it grades, it has stopped testing the system.
4. **Read `docs/qa/12`, `13`, and `14` before trusting any other doc in this repo.** They are the record
   of what the previous reviews got wrong.

## 6. Reading order

| Doc | What it is |
|---|---|
| `docs/qa/revora_release_scorecard.md` | The verdict. Start here. |
| `docs/qa/14-plan-vs-tree-gap-audit.md` | This round: what the plan asked for vs what shipped. |
| `docs/qa/13-what-ci-found-on-its-first-run.md` | The five defects CI found that every local suite called green. |
| `docs/qa/12-live-eval-finding-model-gated-floor.md` | N-30. The most important document in the repo. |
| `docs/qa/revora_unconditional_go_implementation_plan.md` | The plan (header now flags its 3 stale clauses). |
| `docs/qa/baseline-2026-07.md` | Baselines, incl. the new axe/Lighthouse numbers. |
| `docs/qa/sol_deep_analysis_validation.md` | The finding IDs (F-xx / N-xx) everything references. |
