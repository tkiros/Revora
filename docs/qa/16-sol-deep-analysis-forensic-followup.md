# 16 — Forensic follow-up: have the `sol_deep_analysis` findings actually been fixed?

**Date:** 2026-07-12 · **Investigator:** forensic pass over source, git, artifacts, and the live production deployment — every claim below is re-derived from primary evidence, not from prior QA prose.
**Scope:** all findings in `docs/qa/sol_deep_analysis.md` and `docs/qa/sol_deep_analysis_validation.md` (F-01…F-32, N-01…N-29, carried-forward SEC/REL/PRIV/QA items, and the 12 Unconditional-Go criteria).
**Revisions examined:** working tree = branch `fix/graded-eval-empty-set-gates` @ `d1b7e24` · `origin/main` @ `4be486c` (PR #11, "launch constrained Revora WTP candidate") · live production `https://revora-lovat.vercel.app` (probed 2026-07-12).

---

## Verdict

**The overwhelming majority of engineering findings are genuinely fixed, with code-level evidence.** Of the ~61 tracked findings: **~43 verified fixed or resolved-as-designed, 8 partial, 7 open** (5 of them external human processes), plus **9 new gaps** surfaced by this pass (§4). The remediation work is real — the clinical router, runtime claims enforcement, paid-model downgrade removal, blob lifecycle, payments hardening, CI, telemetry, and the PR #11 claims/legal rewrite all verify against source.

**But the app is NOT ready for unrestricted real users.** What remains open is exactly the set that determines whether the guidance is safe and the operation trustworthy:

1. **No live safety eval has ever passed** (all 5 artifacts `passed: false`; owner waived — waiver ≠ pass).
2. **No dietitian/expert validation has occurred** (gate correctly fail-closed; `panel-review.json` correctly absent).
3. **Exposed provider keys remain unrotated with zero attestation** (SEC-01/SEC-02).
4. **Two of four production crons are stale** — including the **trial pre-charge email**, while real card-gated trials are live.
5. **The branch and `main` have diverged** — a production-relevant fix (empty `REVORA_MODEL` → 400s every check) is stranded on this branch, and this branch's stale copy would regress PR #11's claims fixes if merged carelessly.

Current honest posture: **CONDITIONAL GO for the owner-waived, constrained WTP test only** (photo OFF, insights OFF, Play OFF, Stripe-web-only). **NO-GO for broad launch** until §5 items close.

---

## 1. Disposition of the six P0 blockers from the validation

| P0 | Status | Evidence |
|---|---|---|
| F-09/F-10 clinical routing | **FIXED (engineering)** | `lib/revora/clinical-risk.ts:40-49` — 8 precedence-ordered routes, `\b`-anchored patterns; runs in `service.ts:60-63` **before** A1C routing, precheck, prompt build; clinical schema has **no risk field** (`schemas.ts:221-228`), so a verdict on a clinical route is structurally impossible. 40 clinical cases in the 88-case corpus; `clinical_risk` is a REQUIRED_CATEGORY. Route copy still awaits panel sign-off (W-05). |
| F-21 paid-model downgrade | **FIXED** | Tiering deleted from `app/api/check/route.ts:85-101`; `countChecksTotal()` removed (`lib/server/entitlement.ts:121-125` tombstone); inverted pin test `tests/unit/server/check-persistence.test.ts:322` (25-check session never downgraded). |
| F-13 "steady choice" | **FIXED** | `lib/coach/insights.ts:115` filters repeats to `risk === "SAFE"`; flagged repeats route to a separate `repeat_meal_risk` rule (`:128-135`). |
| F-26 legal placeholders | **FIXED on `main`/production; NOT on this branch** | Live `/terms` renders zero placeholders; real refund policy, `support@revora.bio`, TERMS_VERSION assent enforced server-side (`z.literal` in all 4 paid handlers). **However**: no legal operating entity exists — owner chose brand-only identification; counsel review **waived**, gate recorded `COUNSEL GATE: NOT CLEARED` (`docs/legal/owner-risk-launch-decision-5f6abcb.md`). The branch's terms page still carries both `[counsel to confirm]` brackets. |
| F-06 validation gate | **OPEN — external** | Risk-accuracy gate now runs on 24 engineering-labeled cases (64 of 88 unlabeled; labels marked `PENDING RD/CDCES review`). Fail-closed dietitian gate (`scripts/validate-dietitian-review.mjs`, `review:dietitian:close`) exists **on this branch only** and correctly fails on the missing `panel-review.json`. No panel has ever reviewed a Revora verdict. |
| N-23 blob lifecycle | **FIXED in code; NOT operating in production** | `deleteUserBlobs()` before the cascade (`app/api/account/delete/route.ts:83`); terminal-state deletion (`process.ts:227,247`); `reapOrphanBlobs()` with 1h age floor wired into the sweep (`sweep.ts:136`). **But the live `/api/health` probe shows `pantrySweep: "stale"`** — the external Railway cron is not firing, so GC/orphan-reaping is effectively down (§4-G2). |

---

## 2. Full disposition table

Verdicts are stated against **what ships (`origin/main` + live prod)**; branch drift noted where material.

### Original findings (F-xx)

| ID | Finding | Status | Evidence |
|---|---|---|---|
| F-01 | Hero overstates capability | **FIXED (main)** | main `app/page.tsx:67` "Check a meal. Understand its balance in seconds."; live landing confirmed — zero hits for "Should I eat this". Branch still has the old hero. |
| F-02 | "Tuned to your A1C" | **FIXED (main)** | main `app/page.tsx:175-177` "broad A1C-range context only … not an individual prediction". |
| F-03 | Photo transcription design | RESOLVED (as designed) — and photo-assist is now **fail-closed OFF** in production (`photo-input-flag.ts` `=== "1"`; live `/api/check/photo-draft` → 404, verified). |
| F-04 | Swap promise vs Clear meals | **FIXED** | "when appropriate, an adjustment and one practical alternative" (main `app/page.tsx:74`, onboarding `:199-200`). |
| F-05 | "Personal patterns" oversell | **FIXED via gating** | Longitudinal insights default OFF (`lib/longitudinal-insights-flag.ts`, counsel gate); landing pattern clause conditional on the flag — with it off, no pattern claim ships. |
| F-06 | No clinical validation | **OPEN — external** (§1). |
| F-07 | Free-offer numbers inconsistent | **PARTIAL** | Landing pinned to `TASTER_LIMIT = 10` with copy-pin test; Play listing "five a day" gone. **Residual: `FREE_DAILY_CHECKS = 5` is a live, reachable path** (signed-in, no subscription → 5/day at `route.ts:181`, surfaced by `plan-box.ts:83-86`) that no marketing surface discloses. Two free-tier numbers still coexist. |
| F-08 | Verdict labels too definitive | **OPEN (deliberate product decision)** | Labels remain Clear/Be careful/Hold off, now single-sourced in `lib/revora/labels.ts` with an explicit note deferring relabel to dietitian sign-off (W-15/W-05). Every result carries the disclaimer + band caveat (`result-card.tsx:199-205`). |
| F-09/F-10 | Clinical routing/eval | **FIXED (engineering)** (§1). |
| F-11 | Photo confirm gate | RESOLVED (as designed). |
| F-12 | Fixed repeated advice | **FIXED** | `coach-outputs.ts:31` — 6 audited variants per slot, deterministic rotation, daypart-conditioned action bank reusing `daypartOfHour`. |
| F-13 | "Steady choice" on HIGH | **FIXED** (§1). |
| F-14 | BAI DPP claim | **FIXED** | `lib/coach/bai.ts:141-144` rewritten without trial association; banned by the "study-association" family in `claims-boundary-copy.test.ts`. |
| F-15 | Landing 58% stat | **FIXED (main)** | Giant stat removed entirely; proof block now "Sources" with explicit "not evidence that Revora produces a particular health result". Branch still shows 58%. |
| F-16/F-17 | Pricing math/variants | RESOLVED (accurate, unchanged). |
| F-18 | Trial design | RESOLVED — **but see G2: the pre-charge cron is stale in production**, which undermines the very trust property F-18 was credited for. |
| F-19 | Day-two wall | OPEN (product decision, unchanged). Constrained-WTP launch is itself the experiment. |
| F-20 | Unit economics | RESOLVED. |
| F-21 | Paid downgrade | **FIXED** (§1). |
| F-22 | Funnel estimates | ACCEPTED RISK (labeled hypotheses). |
| F-23 | Wrong test counts in analysis doc | **NOT FIXED** | `sol_deep_analysis.md:473-474` still claims 110 files / 86 safety / 19 smoke — identical on main. |
| F-24 | "Most popular" badge | **FIXED** | zero hits in `paywall-card.tsx` on both branches. |
| F-25 | PRODUCT.md reversal North Star | **FIXED** | line replaced with a **REJECTED** annotation; `Revora_Brand_Positioning_v2.md` tombstoned on main. |
| F-26 | Legal placeholders | **FIXED on main/prod with owner-waiver caveat** (§1). |
| F-27/N-23/N-24 | Photo retention/privacy | Meal-check photos never retained (unchanged ✔). Pantry blobs: lifecycle **fixed in code** (§1); still `access:"public"` — **but privacy copy now truthful** ("public but unlisted", `privacy/page.tsx:77`) with deletion promises matching code. |
| F-28/F-30 | A1C gate, precheck | RESOLVED — re-verified intact (`service.ts:66,72`). |
| F-29 | Citation errors in analysis doc | **NOT FIXED** | all four bad citations still present, identical on main. |
| F-31 | Prompt prohibitions unenforced | **FIXED** | see N-01. |
| F-32 | Trial copy trust | RESOLVED (verified E2E-06) — **but G2 (stale pre-charge cron) currently breaks the pre-charge email in production.** |

### New findings from the validation (N-xx)

| ID | Status | Evidence |
|---|---|---|
| N-01 runtime claims regexes | **FIXED** | `assertNoForbiddenClaims()` (`postprocess.ts:159`) runs post-floor at `:218` in the prod path (`service.ts:123`); clarify/not_food arms separately guarded (`service.ts:135,149`); violation → `RevoraContractError` → retry card (fail-closed). Includes prompt-leak patterns. |
| N-02 mock-based eval claims | **FIXED mechanically, still red** | Artifacts now written per run; **Gate 0** (`revora-graded-eval.test.ts:157-163`) fails the run if any model call failed. **All 5 live artifacts are `passed: false`** (24/24, 9/24, 24/24, 24/24, 15/24 provider failures; best riskAccuracy 0.583 vs 0.85). The gate works; the pass is still owed. |
| N-03 CI inactive | **FIXED** | `ci.yml` tracked on origin/main: typecheck·lint·contract·build / unit+mock-bakeoff / Playwright (chromium+webkit, postgres, migrations) / gitleaks with `fetch-depth: 0`. ESLint config exists. **Caveat: branch protection unavailable** (private repo, free plan) — CI cannot block a merge; a P0 already re-entered main once through a clean merge (`docs/qa/13`). |
| N-04 trial/start abuse | **FIXED** | per-IP `trial_ip` fail-closed bucket (`rate-limit.ts:96-98`, matcher `proxy.ts:187`) + per-email cooldown before any side effect (`handlers.ts:1043-1053`). |
| N-05 repeat trials | **FIXED** | any prior subscription row disqualifies (`handlers.ts:1096-1115`). |
| N-06 refund-ordering | **FIXED** | `refunded` never overwritten (`handlers.ts:746-753`). |
| N-07 payment_failed | **FIXED** | dunning grace capped, idempotent, user emailed (`handlers.ts:678-728`). |
| N-08 restore purchases | **NOT FIXED** (both branches) | no `listPurchases()` in `lib/client/digital-goods.ts`, no UI affordance. Mitigated: Play billing is hard-OFF on main (`playBillingEnabled` 503 unless `NEXT_PUBLIC_PLAY_BILLING === "1"`), and Play launch not authorized. Must be fixed before any Play launch. |
| N-09 portal filter | **FIXED** (`handlers.ts:383-393` + cancel paths). |
| N-10 legacy price env | **FIXED** (`handlers.ts:309-318` derives from `resolvePriceVariant`). |
| N-11 guest metering | OPEN (accepted-by-design, unchanged; limiter still fail-open `rate-limit.ts:135-137`). |
| N-12 analytics gaps | **FIXED** | onboarding_started, first-check, result_helpful, clinical_route in the client allowlist; churn events emitted from the real webhook module off RETURNING rows, with tests incl. negative case. |
| N-13 p95 unmeasurable | **FIXED** | raw `durationMs` in telemetry (`telemetry.ts:41`, stamped `route.ts:209,222`). |
| N-14 client Sentry / alerting | **PARTIAL** | browser Sentry exists (`instrumentation-client.ts:91`, errors-only, no-DSN no-op); `/api/health` returns db+cron status with 503 on DB failure. **No alerting-as-code, no uptime monitor** — and nothing noticed the two stale crons (G2). |
| N-15 kill switches | **PARTIAL** | photo flag now fail-closed but still build-time `NEXT_PUBLIC_` (flip = redeploy); `shouldPauseForOps` still has **zero callers** (dead code); auto-pause unwired. |
| N-16 injection patterns | OPEN (as planned, W-21) — still the 4 exact-phrase regexes. |
| N-17 substring false-negatives | **PARTIAL — code fixed, regression untested** | boundary-anchored `containsAny` for risk-suppressing lists + `BUFFER_EXCLUSIONS` for "jelly beans"/"protein bar"; risk-raising lists deliberately loose (safe-erring). **Zero tests for the named adversarial cases** (eggnog/jelly beans/protein bar) — a refactor could silently reopen it with a green suite. |
| N-18 versioning/attribution | **FIXED minus correlation id** | model/promptVersion/contractVersion in telemetry; per-request id confirmed absent (open decision). |
| N-19 provider parity | **PARTIAL — worse than filed for the bakeoff** | prod + graded eval are OpenAI-direct ✔. But `scripts/model-bakeoff.ts:130` still hard-defaults to OpenRouter, has **no pass gate at all**, and its artifacts publish `passed: true` over 24/24 provider failures — the exact empty-set pathology Gate 0 just fixed elsewhere (G3). No OpenAI-direct bakeoff artifact exists. |
| N-20 label triplication | **FIXED** (`lib/revora/labels.ts`, all consumers import it). |
| N-21 tracked env snapshot | **FIXED** (`git rm --cached`'d, ignored; history not rewritten — expired dev token, low residual). |
| N-22 contradictory QA docs | **FIXED** (03 retired with DO-NOT-CITE banner; plan header flags stale clauses). |
| N-23/N-24 | See §1 / F-27. |
| N-25 auth rate limits | **FIXED** (`auth_signin_ip` fail-closed + matcher `/api/auth/:path*`, POST-only by design). |
| N-26 key rotation path | **FIXED** (versioned `v<n>:` payloads, `HEALTH_DATA_KEYS_OLD` keyring, tampered/unknown_key/malformed distinguished). |
| N-27 history-migrate forgery | **FIXED** (`boundedTimestamp` clamps, strict enums, batch cap). |
| N-28 OpenAI DPA/ZDR | **PARTIAL** — posture honestly recorded (`docs/privacy/data-flow.md:91-92`), DPA itself unexecuted (human action). |
| N-29 cron token compare | **FIXED** (`lib/server/timing-safe.ts`, all 4 cron routes; fails closed when `CRON_SECRET` unset). |
| N-30 model-gated floor | **FIXED** | floor triggered by deterministic `isCarbForward()`; flags merged as a **union** (`postprocess.ts:196-199`) — the model can add flags, never remove one. |

### Carried-forward items

| ID | Status |
|---|---|
| SEC-01/SEC-02 key rotation | **OPEN — the single worst item.** Live provider keys in git history at `213ab8a`, unrotated, **no attestation anywhere in docs/**, old keys never confirmed dead. gitleaks in CI will keep flagging it. Pure human action (~30 min). |
| SEC-03/04/05, REL-01 | RESOLVED (re-verified previously; unchanged). |
| REL-02 live re-validation | **OPEN** — folded into the live-eval blocker (no passing live run exists). |
| A11Y-01 | **PARTIAL, honestly tested** — spec now asserts the CTA *top edge* is on the first screen per-device and documents that the full button cannot fit without a form redesign. |
| PRIV-01 data export | OPEN (counsel/owner decision) — **partial mitigation shipped**: `DELETE /api/account/health-data` (erasure without account loss) exists and is consent-integrated; export still absent. |
| QA-01 CI | **FIXED** (see N-03), minus branch protection. |
| E2E-03 photo default | **FIXED** — now fail-closed OFF in production (verified live 404). |

---

## 3. The 12 Unconditional-Go criteria — re-verified state

| # | Criterion | State | Blocking item |
|---|---|---|---|
| 1 | Core journeys reliable | **PARTIAL** | no passing live eval; trial→active conversion unproven (no test-clock code); **pre-charge cron stale in prod** |
| 2 | Food analysis useful within limits | **FAIL** | dietitian panel never run (W-05) |
| 3 | AI output safe, no unsupported claims | **PASS (engineering)** | runtime enforcement verified wired |
| 4 | Ambiguity → clarify, never certainty | **PASS** | re-verified intact |
| 5 | Model meets approved thresholds | **FAIL — unmeasured** | all 5 live eval artifacts `passed:false` (quota/timeouts); bakeoff evidence vacuous (G3) |
| 6 | Paywall/entitlements correct | **PASS** (Stripe-web); Play hard-off; N-08 owed before any Play launch |
| 7 | Sensitive data/keys protected | **FAIL** | SEC-01/02 unrotated; blobs public-by-URL (disclosed) |
| 8 | Privacy controls as documented | **PASS in code / AT RISK in ops** | deletion + erasure routes verified; **pantry-sweep GC not firing in prod (G2)** |
| 9 | Accessible | **PARTIAL** | axe/Lighthouse a11y 100; CTA full-fit + manual screen-reader passes open |
| 10 | Monitoring/analytics/CI | **PARTIAL** | CI real; analytics real; **no alerting/uptime monitor — stale crons went unnoticed (G2)**; no branch protection |
| 11 | Claims aligned with capability | **PASS (main/prod)** | branch is stale (G1) |
| 12 | P0s resolved | **PARTIAL** | engineering P0s closed; external P0s (eval, panel, keys) open |

---

## 4. NEW gaps surfaced by this forensic pass (G-xx)

| ID | Severity | Finding | Smallest safe fix |
|---|---|---|---|
| **G1** | **P0 (process)** | **Branch/main divergence with production-relevant code stranded both ways.** This branch carries the empty-`REVORA_MODEL` product fix (`openai-client.ts` — on main, a declared-but-empty `REVORA_MODEL` env makes **every meal check 400**; main still has the bare `??` coalesce at `:21`) plus the entire fail-closed dietitian-review gate; meanwhile the branch lacks PR #11, so its landing still says "Should I eat this?" / 58% / unhedged patterns and its terms still carry counsel brackets. A careless merge in either direction regresses something. | Merge `origin/main` into this branch (main's copy/legal files win; branch's eval/client/dietitian files win — agents confirmed no path conflicts), run gates, land promptly. Confirm prod env has a non-empty `REVORA_MODEL` until the fix deploys. |
| **G2** | **P0 (operational)** | **Two of four production crons are stale** (live `/api/health`: `trialPrecharge: "stale"`, `pantrySweep: "stale"`). Consequences while real charges are live: (a) **pre-charge emails are not being sent** for card-gated trials — the exact trust/compliance property the trial design was credited for (F-18/F-32); (b) blob GC + orphan reaper (the N-23 remediation) is not actually running. Nothing alerted on this (N-14 gap made real). | Restart/verify the Railway scheduler jobs today; then add a minimal uptime check that pages on `crons.*: stale\|never` in `/api/health`. |
| **G3** | **P1** | **`scripts/model-bakeoff.ts` still has the empty-set vacuous-pass bug** fixed in the graded eval: hard-defaults to OpenRouter (`:130`), has no pass gate, and its artifacts publish `rubric.passed: true` over 24/24 provider failures. Any decision citing "bakeoff passed" rests on an empty set. | Port Gate 0 into the bakeoff; default `baseURL` to OpenAI-direct; re-run live before any model change. |
| **G4** | **P1** | **The live graded eval is blocked by provider quota, not code**: the org key is limited to 50 requests/day (`gpt-5.4-mini` RPD); runs 429 their own tails. Two newest artifacts also recorded `model: ""` (pre-fix). The launch decision's central measurement is stuck behind ~$2 of quota. | Fund/raise the key limit, re-run `REVORA_LIVE_EVAL=1` once, commit the artifact. If it fails on substance, verdict reverts to NO-GO per the plan. |
| **G5** | **P1** | **F-07 residual:** `FREE_DAILY_CHECKS = 5` is a live, undisclosed entitlement path (signed-in, no trial) coexisting with the advertised "10 on day one". | Disclose it ("then 5 free checks/day with an account") or delete the path; extend the copy-pin test to reconcile both numbers. |
| **G6** | **P2** | **N-17 regression untested** — the adversarial cases the finding names (eggnog, jelly beans, protein bar) have no test; only the other half of the mechanism (`isCarbForward`) is covered. | ~10-line test on `hasBufferContext` suppression. |
| **G7** | **P2** | **Carb-ontology exclusion escape:** `CARB_FORWARD_EXCLUSIONS` has "sweet potato" (singular) but tokens list "potatoes" — "sweet potatoes" escapes the exclusion and trips the floor. Safe-erring, but the panel is being asked to sign `CARB_FORWARD_POLICY_VERSION 2026-07-12.1` with this drift. | Add plural to the exclusion (or singularize matching) before panel sign-off. |
| **G8** | **P2** | **Checkout gate state unverifiable from outside**: live checkout now returns **401** (auth/assent precedes the legal gate), so external probes can no longer confirm whether `LEGAL_TERMS_FINAL=1` is set — the handoff's documented "expect 503" probe is stale. | Update the runbook probe (authenticated probe or a health field exposing the gate state, boolean only). |
| **G9** | **P3** | Analysis-doc corrections (F-23 test counts, F-29 citations) never applied — the evidentiary base others cite still carries known-wrong numbers. | 15-minute doc edit. |

---

## 5. What must still happen before real users get real value

**Hard blockers (launch-gating even for the constrained WTP test):**
1. **Rotate SEC-01/SEC-02 keys + write the attestation** (~30 min human work; overdue since 2026-07-10).
2. **Fix the stale production crons (G2)** — pre-charge email is a live trust/compliance obligation *right now* if any trial is active.
3. **Merge the divergent lines (G1)** so production gets the empty-model guard and the branch's dietitian gate, and the branch's stale copy can never regress main.

**Blockers for charging beyond the constrained test:**
4. **One passing live graded eval** (G4) — quota, then a single $2 run; commit the artifact.
5. **Dietitian/CDCES panel (W-05/F-06)** — the longest pole; the fail-closed gate and 240-case protocol are ready; only real humans are missing. Panel must also sign the clinical route copy, `CARB_FORWARD_TOKENS` (fix G7 first), and the 24 `acceptableRisks` labels.
6. **Counsel** — currently *waived, not cleared*. The owner's recorded risk acceptance covers the WTP test only; broad launch re-opens it.
7. **Branch protection** (GitHub plan decision) — a P0 has already re-entered main once through a clean merge.

**Owed before specific expansions:** N-08 restore-purchases before any Play launch · Stripe test-clock trial→active proof · vision eval with real consented photos before photo-assist ever turns on · alerting/uptime monitoring (G2 proved the cost of its absence) · W-21 injection-pattern broadening · runtime kill switches (N-15).

---

## 6. Method note

Six evidence streams: (1) five parallel read-only source-verification agents (AI-safety, payments/legal, privacy/security, claims/copy, ops/CI/telemetry), each requiring file:line proof and branch-vs-main diffs; (2) direct git archaeology (`merge-base`, `ls-tree`, per-commit diffs); (3) all 10 graded-eval/bakeoff artifacts read raw; (4) live production probes (checkout, `/api/health`, `/terms`, landing, photo-draft, health-data routes); (5) the legal/waiver record on `origin/main`; (6) local gates run fresh on the working tree — `tsc --noEmit` clean, `vitest run` **1119 passed / 2 skipped (115 files passed, 1 skipped)**, matching the claimed state in `docs/qa/15`. Prior QA prose was treated as hypothesis only; where this report contradicts a prior doc (e.g. the handoff's "expect 503" probe, "4 crons ok"), the live evidence above governs.
