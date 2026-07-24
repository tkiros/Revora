# Revora — Promise-to-Proof Matrix (Forensic Audit)

**Date:** 2026-07-23
**Scope:** Every CURRENT user-facing promise, graded against CURRENT source with file:line evidence.
**Mode:** Report-only, read-only. No code changed.
**Engine ground truth:** `app/api/check/route.ts` → `lib/revora/service.ts::checkFood` →
`classifyClinicalRisk` (first) → `routeA1C` → `classifyInputBeforeModel` (precheck) → model →
`postprocessModelOutput` (conservative floors + `assertNoForbiddenClaims` + `assertNoUnsafeSafeFields`).

---

## Method & grading key

- **Enforcement source** = the code/test that makes the promise true (or the surface that makes it).
- **Verdict** separates two kinds of proof the reader must never conflate:
  - **PROVEN** — enforced in code AND guarded by a test that exercises *real deterministic behavior*
    (precheck routing, structural floors, claims scan). Engineering-demonstrated.
  - **PARTIAL** — partly enforced; some material aspect is static illustration or model-discretionary.
  - **UNVERIFIED** — coded and plausible, but NO evidence it holds for the live model / live infra /
    real users. Absence of evidence = UNVERIFIED (per brief).
  - **FAILED** — contradicted by source.
  - **NA** — not applicable / not a promise.
- **Critical caveat that colors the whole matrix:** `lib/revora/promise-registry.ts` sets
  `lastLiveCaptureAt: null` for **all three** promoted examples (oatmeal L82, banana L94, orange
  juice L107). The eval corpus (`tests/fixtures/revora-eval-cases.json`, 159 cases) is **mock-model**
  (`mockModelOutput`), and every relevant label is stamped *"ENGINEERING/SIMULATED evidence, NOT
  clinical validation; PENDING RD/CDCES review under W-05."* **There is zero live-capture or
  real-user validation of any card the product PROMOTES.** Everything below that depends on model
  output is therefore, at best, UNVERIFIED for the live path.

---

## A. Promoted-example promises (the prospect meets these before their first check)

| # | Promise | Surface | Intended user | Required behavior | Enforcement source (file:line) | Required evidence | Current evidence | Verdict |
|---|---------|---------|---------------|-------------------|--------------------------------|-------------------|------------------|---------|
| P1 | Typing an ambiguous food ("oatmeal") makes Revora **ask one question, not guess** | Landing phone mockup `app/page.tsx:126-134`; `components/demo-check-card.tsx:33-40`; onboarding chip `app/(app)/onboarding/page.tsx:65,437-461` | Prospect | Precheck returns `clarify` with exactly `"Is this plain or sweetened?"` | `lib/revora/input-precheck.ts:61-66,332-340,409-416`; `lib/revora/clarify.ts:25`; registry `promise-registry.ts:74-84`; **deploy-blocking** test `tests/unit/revora/promise-registry.test.ts:88-124` re-runs the real precheck | Real precheck asserts route+question | Precheck genuinely returns clarify + the pinned question; test blocks deploy on drift | **PROVEN** (engineering) |
| P2 | "**This is the actual answer you get**" — oatmeal→answer→ a **"Be careful"** card w/ add-protein adjustment + steel-cut swap | Landing `app/page.tsx:219-228` (heading L221) + `DemoCheckCard`; `app/(app)/demo/page.tsx:86-89` | Prospect | The promoted card equals what the engine actually returns for the follow-up | Card is **static JSX**: `components/demo-check-card.tsx:48-75`; verified **no `checkFood`/`fetch`** in the demo card or `/demo`. "plain oatmeal" gets precheck `kind:"ok", flags:[]` → **NO deterministic floor** (`input-precheck.ts:358-368`); band is 100% model discretion. Demo prose pinned only to **itself** (`tests/unit/client/demo-check-card.test.ts:32,38`) | A live capture of "plain oatmeal"→MODERATE | `lastLiveCaptureAt=null`; no eval case for the "plain oatmeal" follow-up (corpus only has "oatmeal with banana", mock MODERATE, PENDING RD). Heading says "actual answer" over a hand-authored fixture | **PARTIAL** (format real; verdict/copy unproven & mildly over-claimed) |
| P3 | Banana is a "surprising" first check the model grades on its own merits | Onboarding chip `onboarding/page.tsx:65,73` (registry `promise-registry.ts:88-96`) | New user | Reaches model path with no floor; model writes band | `input-precheck.ts` → banana ∉ any list → `kind:"ok", flags:[]`; `promise-registry.test.ts:88-110` pins route=`result` | Route proof (have) + a real band (don't) | Route to model proven; **band unproven** and self-described as "no deterministic floor; the model writes the band" (`promise-registry.ts:91-93`) | **PARTIAL** (route PROVEN; outcome UNVERIFIED) |
| P4 | Orange juice (named sugary drink) **can never be graded "Clear"** | Onboarding chip; registry `promise-registry.ts:98-109` | New user | Deterministic `carbs_only`+`high_risk` floor carried into result | `input-precheck.ts:113-167,342-352` (`juice` ∈ CARBS_ONLY & HIGH_RISK); floor `postprocess.ts:397-445`; eval `revora-eval-cases.json` case `stratum-sauce-orange-juice-mixer` (mockRisk SAFE **forced off SAFE**) | Structural guarantee not-SAFE | Floor is deterministic + model-vetoable-proof; eval demonstrates SAFE→floored | **PROVEN** (engineering; strongest promoted example) |

---

## B. Core engine / decision promises

| # | Promise | Surface | Intended user | Required behavior | Enforcement source (file:line) | Required evidence | Current evidence | Verdict |
|---|---------|---------|---------------|-------------------|--------------------------------|-------------------|------------------|---------|
| P5 | One label of exactly three: **Clear / Be careful / Hold off** | Landing `app/page.tsx:82-86,199`; onboarding `onboarding/page.tsx:254-273` | All | Verdict maps to the 3 labels, single-sourced | `lib/revora/labels.ts:12-16` (`RISK_LABELS`), interpolated not retyped | Single source + schema | Labels single-sourced; schema-bounded risk enum | **PROVEN** (engineering) |
| P6 | "one reason and, **when appropriate**, an adjustment and one practical alternative" (adjustment/swap are **conditional**) | Landing `app/page.tsx:82-87,199-204`; onboarding `onboarding/page.tsx:254-259`; welcome `welcome/page.tsx` | All | Every surface that promises a swap/adjustment must hedge | `claims-boundary-copy.test.ts:222-225` (`unconditional-swap` family) scans all `app/**`+`components/**` | Enforced hedge across surfaces | Hedge enforced by test; controls at L530-537 | **PROVEN** (engineering) |
| P7 | A **"Clear" (SAFE) result carries no adjustment and no swap** | PRODUCT.md §Product Purpose (F-04); demo SAFE fixture `demo/page.tsx:44-48` | All | SAFE with adjustment/swap is structurally impossible | `postprocess.ts:287-288,330-346` (`assertNoUnsafeSafeFields` **throws**); demo `demo/page.tsx:29-42` gives SAFE null coach | Fail-closed structural guarantee | Throw path proven; SAFE fixture renders null fields | **PROVEN** (engineering) |
| P8 | "**When we're unsure, we say so**" — asks one question instead of guessing, errs careful | Landing `app/page.tsx:261-265`; onboarding `onboarding/page.tsx:410-412`; how-it-works | All | Ambiguous inputs clarify; one-clarify cap; floors not suppressed | `input-precheck.ts:305-369` (clarify families + resolvers); one-clarify cap `service.ts:88-102`, `input-precheck.ts:332-340` | Deterministic clarify behavior | Clarify + resolver logic present & unit-tested | **PROVEN** (engineering) |
| P9 | Labels **describe general meal patterns, not your individual glucose response** | Landing `app/page.tsx:84-86,200-204,404-406`; onboarding `onboarding/page.tsx:419-423`; terms `terms/page.tsx:36-40`; result-card `components/result-card.tsx:255` | All | Boundary copy present; no prediction claims anywhere | Copy present at cited lines; `claims-boundary-copy.test.ts` `future-claim`/prediction families; grep sweep found only **negations** ("never a prediction", "does not predict") | No prediction drift | Sweep clean — every "predict" hit is a boundary affirmation | **PROVEN** (engineering) |
| P10 | A1C range used **only to tune conservatism / avoid over-reassurance**, not to predict | Landing `app/page.tsx:200-204,400-407`; onboarding `onboarding/page.tsx:345-348` | In-range user | Band drives `conservativeLevel`; upper-band SAFE→MODERATE floor | `lib/revora/a1c.ts:40-83`; borderline floor `postprocess.ts:397-451`; carb-forward detector `input-precheck.ts:585-786` | Band→conservatism wired | Wired deterministically (floor covers full range per `postprocess.ts:403-411`) | **PROVEN** (engineering) |
| P11 | Out-of-scope A1C (<5.7 or ≥6.5) → boundary message, **no verdict** | Onboarding `onboarding/page.tsx:179-187,390-402`; boundary copy | Out-of-range | Route out_of_scope, single-sourced copy | `a1c.ts:41-48,77-82`; `service.ts:82-86`; `boundary-copy.ts:30-39`; drift test referenced in `boundary-copy.ts:11-18` | Route + pinned copy | Deterministic; copy single-sourced + drift-tested | **PROVEN** (engineering) |
| P12 | **Clinical/emergency precedence** — acute symptoms → "see a person", never a meal verdict, never preempted by paywall | `service.ts:63-80`; route `app/api/check/route.ts:164-173,191` | At-risk user | Clinical classify runs first; clinical card has no risk field; skips paywall | `service.ts:76-79`; route `check/route.ts:171-173` (`clinicalPreempt`); eval `clinical-*` cases disallow all risks | Ordering-as-policy | Clinical-first ordering + paywall bypass proven in code + mock evals | **PROVEN** (engineering; live model recall UNVERIFIED) |
| P13 | "**Informational only / not medical advice**" on every result surface | Footer `app/page.tsx:497`; every legal/result surface via `BOUNDARY_DISCLAIMER` | All | Stable disclaimer everywhere | `boundary-copy.ts:38-39`; imported across surfaces; contract disclaimer | Disclaimer present | Present + single-sourced | **PROVEN** (engineering) |

---

## C. Privacy / data promises

| # | Promise | Surface | Intended user | Required behavior | Enforcement source (file:line) | Required evidence | Current evidence | Verdict |
|---|---------|---------|---------------|-------------------|--------------------------------|-------------------|------------------|---------|
| P14 | A1C + meal text **encrypted at rest** (AES-256-GCM) | Landing `app/page.tsx:279-284`; welcome `welcome/page.tsx:154-158`; privacy `privacy/page.tsx:128-135` | Account user | Encrypt before insert | `check/route.ts:503-513,531` (`encryptField`); privacy states AES-256-GCM | Encryption at call site + prod keys | Call-site encryption **proven in code**; live-DB/key config not runtime-verified here | **PROVEN** (code path); live/runtime UNVERIFIED |
| P15 | Stored **only with explicit consent** | Landing `app/page.tsx:281`; welcome consent `welcome/page.tsx:177-202` | Account user | Persist gated on `consentedAt` | `check/route.ts:486-493` (returns undefined w/o consent); welcome blocks on checkbox `welcome/page.tsx:69-72` | Consent gate | Consent gate proven in persist path | **PROVEN** (engineering) |
| P16 | "**Deleted — all of it — in one tap**" / withdraw consent from Account | Landing `app/page.tsx:281-283`; privacy `privacy/page.tsx:171-177`; terms `terms/page.tsx:99-107` | Account user | One-tap erase + consent withdrawal | Route exists `app/api/account/delete/route.ts`; page `app/(app)/account/delete/page.tsx` | Working deletion + residual policy | Routes exist but **deletion internals not inspected this pass** | **UNVERIFIED** (not read) |
| P17 | Never sells/shares data, no ads, no health data w/o consent | Privacy `privacy/page.tsx:137-147` | All | Policy statement + no ad/sale code | Copy at cited lines; providers list `privacy/page.tsx:106-126` | Negative guarantee | Copy present; provider list matches purposes | **PARTIAL** (copy PROVEN; negative not independently verifiable) |
| P18 | OpenAI calls set `store:false` | Privacy `privacy/page.tsx:44-53,96-99` | All | API calls disable storage | Claimed in copy; client `lib/revora/openai-client.ts` not read this pass | Actual flag in API call | **Not inspected this pass** | **UNVERIFIED** (not read) |
| P19 | Photos not kept as history | Privacy `privacy/page.tsx:100-104`; landing FAQ (photo-gated) | Photo user | Photo draft in-memory only | Gated on `photoInputEnabled()` — **currently disabled** ("Meal photo-assist is disabled in this release" `privacy/page.tsx:52,103`) | N/A while disabled | Feature off; copy conditionally hidden | **NA** (feature-flagged off) |

---

## D. Paywall / funnel promises (mode-dependent: `paywallMode()` = legacy | trial)

| # | Promise | Surface | Intended user | Required behavior | Enforcement source (file:line) | Required evidence | Current evidence | Verdict |
|---|---------|---------|---------------|-------------------|--------------------------------|-------------------|------------------|---------|
| P20 | "No login. No card. **N free checks on your first day**" (device-local) | Landing `app/page.tsx:93-96,336-346` | Guest | Day-1 taster metered device-local; number single-sourced | `TASTER_LIMIT` from `lib/client/taster-store` interpolated `app/page.tsx:7,94`; pinned by `copy-pins.test.ts` (ref'd) + claims test L460-470 | Number never retyped | Constant interpolated; store-listing drift test enforces | **PROVEN** (engineering) |
| P21 | Free tier persists (legacy) **or** 7-day free trial, card required, nothing charged, email before charge (trial) | Landing pricing `app/page.tsx:315-389`; TrialWall `components/trial-wall.tsx:162-191,248-251` | Prospect | Landing funnel copy = server flags checkout runs | `app/page.tsx:49-50` reads same `paywallMode()`+`resolvePriceVariant()`; trial wall server-authoritative `trial-wall.tsx:100-135` | Copy = live config | Landing renders from the same server flags; hard wall `check/route.ts:106-110,229-250` | **PROVEN** (engineering) |
| P22 | "**Cancel in one tap**, on your account page — not behind an email, no retention screens" | Landing FAQ `app/page.tsx:447-454`; TrialWall `trial-wall.tsx:185-190`; PaywallCard `paywall-card.tsx:244-248`; terms `terms/page.tsx:73-79` | Subscriber | Account-page cancel, effective end-of-period | Copy consistent across surfaces; cancel route not inspected this pass | Working one-tap cancel | Copy consistent + internally non-contradictory; **cancel route not read** | **PARTIAL** (copy consistent; mechanism UNVERIFIED) |
| P23 | **Price shown = price charged** (no guessed ladder) | TrialWall `trial-wall.tsx:100-135,138-155`; PaywallCard `paywall-card.tsx:222-232,316-336` | Prospect | No price until server config passes zod; annual only if authorized | `trial-wall.tsx:23,102-135`; `paywall-card.tsx:47-55,319` | Server-authoritative price | Neutral pending/retry, no hard-coded ladder — proven in code | **PROVEN** (engineering) |
| P24 | Web/Stripe refund window | Terms `terms/page.tsx:81-97` | Web buyer | Refund of first charge within N days | `WEB_REFUND_WINDOW_DAYS` from `lib/legal/terms` `terms/page.tsx:4,83-85` | Constant-driven copy | Constant interpolated | **PARTIAL** (copy PROVEN; refund ops UNVERIFIED) |
| P25 | Pantry Review "$49, one payment, **nothing renews**" | Landing `app/page.tsx:296-311`; TrialWall declined note `trial-wall.tsx:88-96` | Buyer | One-time charge, no subscription | Copy at cited lines; pantry billing not inspected this pass | One-time charge in code | Copy consistent; **billing internals not read** | **UNVERIFIED** (not read) |

---

## E. Claim-boundary meta-promises (the "we don't over-claim" promise)

| # | Promise | Surface | Required behavior | Enforcement source (file:line) | Current evidence | Verdict |
|---|---------|---------|-------------------|--------------------------------|------------------|---------|
| P26 | **No banned claims** on any surface (diagnose/treat/cure/reverse/prevent/predict/FDA/mg-dL/GI-GL) | All `app/**` + `components/**` + extra sources + fenced docs | Glob-based scan, deny-list with reasons, control samples | `tests/unit/revora/claims-boundary-copy.test.ts:124-238` (11 verb families + 4 claim families), `284-311` glob, `474-537` controls; runtime guard `postprocess.ts:189-208` (`assertNoForbiddenClaims` fail-closed) | Independent grep sweep of `app/`,`components/`,`lib/` returned **only negations/affirmations** — no drift found | **PROVEN** (engineering) |
| P27 | **No fabricated social proof** (Revora has zero users) | Paywall/landing | No "most popular", star counts, "trusted by N" | `claims-boundary-copy.test.ts:156-187` (`social-proof` family); `paywall-card.tsx:199-208` documents removal of old "Most popular" flag | "Best value" retained only because computed from live prices (`paywall-card.tsx:284-297`), an arithmetic fact | **PROVEN** (engineering) |

---

## F. Claim-DRIFT hunt (banned families across ALL current surfaces)

**Method:** grep of `app/`, `components/`, `lib/` (`.ts`/`.tsx`) for diagnose/treat/cure/reverse/prevent,
predict, "safe for you/your", accurate/accuracy, "clinically/FDA approved", `mg/dL`, `GI/GL + number`,
plus review of every legal/paywall/onboarding/email surface.

**Result: NO banned-claim drift found in any current live surface.** Specifics:

- Every `predict*` occurrence is a **boundary affirmation**, e.g. landing `app/page.tsx:203`
  ("not an individual-response prediction"), `:404` ("does not predict your response"); onboarding
  `:422`; terms `:38`; result-card `components/result-card.tsx:255`; learning-summary `:250`. No positive
  prediction claim exists.
- The only `accurate` hit is Terms `terms/page.tsx:53` — asking that **user-submitted info** be accurate,
  not an accuracy claim about the product. No "accurate/accuracy" product claim anywhere.
- No `mg/dL`, no GI/GL-with-number, no diagnose/cure/reverse/treat/prevent in rendered copy.
- No "safe for you", no "FDA/clinically approved/validated", no personal-safety claim.
- The historical banned positioning is **neutralized**: `Revora_Brand_Positioning_v2.md` is fully
  gutted (L1-18, "Superseded — Do Not Reuse"); PRODUCT.md's rejected "Legal North Star" line is
  outside the audit fence and explicitly labeled REJECTED (`PRODUCT.md:19-29`).
- **No email surface carries health/meal claims.** `lib/server/email.ts` is transport only; no meal-copy
  templates exist under a `marketing/`/`emails/` tree (`marketing/` holds only captured screenshots).

**One truthfulness soft-spot (not a banned claim):** the landing **"This is the actual answer you
get"** heading (`app/page.tsx:221`) sits above a **static, hand-authored** MODERATE card
(`components/demo-check-card.tsx:48-75`) that (a) is never produced by the engine at render, (b) is
pinned only to *itself* by `demo-check-card.test.ts` (a self-referential snapshot, not an engine
equivalence), and (c) has **no live capture** backing it (`lastLiveCaptureAt=null`). The *format* and
the *clarify route* are real; the specific verdict/reason/adjustment/swap is illustration presented as
"actual."

---

## G. Does the promoted demo reproduce through the REAL engine? — NO (by design, with a caveat)

- `DemoCheckCard` and `/demo` are **fully static** — verified no `checkFood`/`classifyInputBeforeModel`/`fetch`
  in `components/demo-check-card.tsx` or `app/(app)/demo/page.tsx`. The `marketing/screenshots/*`
  assets are captured from these static fixtures. **The engine never runs on the promoted card.**
- The **only** real-engine link is the deploy-blocking `promise-registry.test.ts`, which re-runs the
  real precheck over the promoted *inputs* to pin the **route SHAPE** (clarify vs result) and the exact
  clarify question — **not** the card prose, band, adjustment, or swap.
- Consequence: the *interaction shape* (oatmeal → "Is this plain or sweetened?" → result-eligible) is
  genuinely reproduced; the *answer content* the prospect is shown is not, and cannot be until a live
  capture exists. `lastLiveCaptureAt` is `null` for all three examples and has **never** been set (single
  commit `bb8620c` in the file's history; no non-null value anywhere in-repo).
- Minor internal drift: `/demo`'s `CLARIFY_FIXTURE` question (`demo/page.tsx:64-69`, the longer
  "…changes whether Revora should read it as lower impact or more concentrated") does **not** equal the
  live precheck question the landing/demo-card render ("Is this plain or sweetened?", `clarify.ts:25`).
  Two different clarify strings are shown to users; only the short one is engine-true. `/demo` is
  `noindex` (`demo/page.tsx:20-23`).

---

## (a) Strongest PROVEN promises

- **P4 — Orange juice can never be graded "Clear."** Deterministic `carbs_only`+`high_risk` floor,
  model-vetoable-proof, with an eval showing a mock SAFE forced off SAFE. The single best-proven
  promoted claim.
- **P1 — Oatmeal clarifies before answering.** Real precheck + a **deploy-blocking** fixture test.
- **P7 — "Clear" structurally has no adjustment/swap.** `assertNoUnsafeSafeFields` throws (fail-closed).
- **P6 / P26 / P27 — Claims discipline.** Glob-scanned banned families + fail-closed runtime
  `assertNoForbiddenClaims`; independent grep sweep found zero drift.
- **P11 / P12 — Out-of-scope + clinical precedence** are ordering-as-policy, deterministic, no model
  needed to be safe.
- **P23 / P20 — Price and free-tier numbers can't drift** from what checkout charges (server-authoritative
  + constant-interpolated + pinned).

## (b) FAILED / PARTIAL promises, ranked by severity

- **P0 — none.** No promise is contradicted by source; no banned claim ships.
- **P2 — P1: "This is the actual answer you get" over a static, uncaptured MODERATE card.** The
  promoted verdict/copy is not engine output, not live-captured (`lastLiveCaptureAt=null`), and "plain
  oatmeal" carries **no deterministic floor** so its band is pure model discretion — yet the heading
  asserts it is the *actual* answer. Format/route are honest; the specific answer is illustration.
  *Fix lever: soften the heading to "an example of the answer," or add a real live capture.*
  `app/page.tsx:221`, `components/demo-check-card.tsx:48-75`.
- **P3 — Model-dependent verdict quality is entirely UNVERIFIED (P2/P3 whole-class).** Every card the
  model writes (bands for banana, plain oatmeal, and all free-text meals) is validated only by
  **mock** evals stamped "NOT clinical validation; PENDING RD/CDCES W-05." No live/real-user evidence
  exists. Structural *floors* are proven; *model judgment quality* is not. `promise-registry.ts:82,94,107`;
  `tests/fixtures/revora-eval-cases.json` labelSource fields.
- **P3 — `/demo` clarify-fixture string ≠ live precheck string.** Two different "plain or sweetened?"
  questions shown to users; `/demo` is noindex so blast radius is small. `demo/page.tsx:64-69` vs
  `clarify.ts:25`.
- **P3 — Not-inspected-this-pass (honest UNVERIFIED, not failures):** account deletion internals
  (P16), `store:false` flag in the OpenAI client (P18), cancel mechanism (P22), Pantry one-time
  billing (P25). Copy for each is present and internally consistent; the *mechanisms* were out of this
  pass's read set.

## (c) Overall Core-Promise-Delivery verdict input

**PARTIAL.**

Justification: On the **engineering-demonstrated** axis, Revora's *safety and honesty* promises are
unusually well-proven — the deterministic spine (clinical-first ordering, A1C routing, carbs-only /
high-risk / borderline floors, `assertNoUnsafeSafeFields`, `assertNoForbiddenClaims`) is enforced in
code and guarded by tests that exercise real behavior, and the claims boundary is glob-scanned with a
fail-closed runtime backstop. An independent grep sweep of all live surfaces found **no banned-claim
drift** and no P0. That is the PROVEN half. On the **live / real-user-validated** axis, the picture is
UNVERIFIED by the project's own admission: the product PROMOTES a specific "Be careful" oatmeal card
under the heading "the actual answer you get," yet that card is a static fixture, "plain oatmeal" hits
no floor, the model's band is undetermined, `lastLiveCaptureAt` is `null` for every promoted example,
and the entire eval corpus is mock-model, self-labeled "NOT clinical validation." So the promises that
depend only on *code* are largely PROVEN; the promises that depend on the *model's answer* or on
*infra/runtime* (encryption in prod, deletion, cancel, refunds, `store:false`) are engineering-plausible
but not live-validated. Net: **PARTIAL** — strong engineering proof of the guardrails, absent proof of
the promoted answer itself. Absence of a live capture is, per the brief, UNVERIFIED — not proof of
failure, but the single most load-bearing gap before this can be called PROVEN end-to-end.
