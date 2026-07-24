# Revora — End-to-End, Promise-Delivery & Paid-Retention Audit (independent run)

> **Report-only.** No product code was fixed, staged, committed, deployed, or
> mutated. No real charge, email, or production change was made. This is a
> parallel/independent execution of the e2e-promise-retention master prompt; a
> **concurrent peer session** is separately writing the canonically-named report
> and CSV matrices in this same directory — see [§12](#12-concurrent-session--divergence).
>
> - Audit window: `2026-07-23T21:36Z – 22:25Z`
> - Auditor model: Claude Opus 4.8 (1M)
> - Method: read-only dimensional fan-out (7 subagents, each with an adversarial
>   refute pass on P0/P1 claims) + full deterministic gate run + on-disk browser
>   E2E evidence. All findings are current source (`file:line`) unless a truth
>   bucket says otherwise.

---

## 1. Decision table

| Decision | Verdict | Confidence | Strongest evidence | Largest remaining gap | Exact next action |
|---|---|---:|---|---|---|
| **Engineering E2E** | **PARTIAL** | 78% | Full deterministic suite green (lint · typecheck · 196-file `vitest` · 9-part safety contract · 3 evals · `build` — all exit 0) and on-disk Playwright E2E `passed` at HEAD across Mobile Chrome/Safari + Desktop Chrome | One page error boundary for 27 pages (OPS-P1-A); 3 `npm audit` vulns (1 high/2 critical) in the live `next-auth` auth chain (DEP-01); state matrix not exhaustively hand-exercised | Add `global-error.tsx` + `(app)/error.tsx`; `npm audit fix` the auth chain; re-run E2E on deployed `24d88ec` |
| **Core promise delivery** | **PARTIAL** (technically demonstrated) | 72% | Deterministic promise *floors* PROVEN (orange-juice can-never-be-Clear, oatmeal-clarifies-first, SAFE-carries-no-adjustment) + zero banned-claim drift in any live surface | No live capture of any promoted card (`lastLiveCaptureAt: null` ×3); the landing demo card is static, never engine-produced; model verdict *quality* + real-user value UNVERIFIED | Capture ≥1 promoted example through the live engine; run a small real-user usability study |
| **Health/claims safety** | **PASS-ENGINEERING / BLOCKED-HUMAN** | 60% | Clinical-first deterministic routing, verdict-isolation (clinical schema has no `risk` field), exact A1C boundaries, fail-closed on invalid model output, 9-part claims contract green | **SAFE-08**: the hypoglycemia route emits a *quantified* 15-15 food/timing first-aid instruction on non-specific triggers, clinically UNVALIDATED (simulated panel only; RD/CDCES W-05 pending) — **P1, candidate-P0**. Plus SAFE-01 (live harmful-SAFE eval owner-waived) | Credentialed RD/CDCES review of the hypoglycemia exception + all clinical copy; execute the live-model harmful-SAFE corpus |
| **Long-term paid retention** | **INSUFFICIENT EVIDENCE** | 88% | Retention *mechanism* is production-grade (fail-closed double gate, CAS transitions, structural engine non-interference, disciplined nudges, no dark patterns) | Zero real paid-cohort / preregistration / outcome data anywhere; founder's own `docs/retention_flow.md` concedes recurring value weakens once users learn their meals | Run the preregistered retention-cohort / meal-memory concierge study with real payers |
| **Production readiness** | **CONDITIONAL GO** (technical layer; live-prod auditor-UNVERIFIED) | 55% | Audited `b5c03f4` is an **ancestor of deployed `24d88ec`**; deterministic + build + E2E green; billing, security, and degraded-mode handling are robust; prod health reported 200/ready per closeout doc | Open P1s (auth vulns, error boundaries, live harmful-SAFE, hypoglycemia clinical review); retention unproven; I did **not** independently verify live-prod runtime | Remediate the P1 code items; independently verify `24d88ec` runtime read-only; keep clinical + retention gates open |

**One-line bottom line:** Revora is an unusually disciplined, well-tested,
already-deployed engineering artifact whose deterministic safety/billing/privacy
machinery is genuinely strong — but it has real open P1 items, a
clinically-unvalidated quantitative first-aid exception, **no** live-captured
promise proof, and **no** real paid-user evidence. It is honestly a
**CONDITIONAL GO on engineering** and **UNPROVEN on user value and paid
retention** — not "ready," "validated," or "flawless."

---

## 2. Opening snapshot (Phase 0)

| Item | Value |
|---|---|
| Branch (audited) | `docs/b1-b2-final-closeout` |
| Local HEAD (candidate) | `b5c03f4666ea793923482b08fd53c45c037467e7` |
| Deployed production revision | `origin/main` = `24d88ec85ba52162544e0336a189db340c18616d` |
| Relationship | Local HEAD is **0 ahead / 10 behind** prod; PR #35 merged this branch into `main`, so **`b5c03f4` is an ancestor of the deployed revision**. The 10 commits on top are 8 docs + 2 additive code commits (`0ece86b` CSP allow `vercel.com` for private-blob upload; `5bdf561` e2e Stripe test alignment). **Code-level findings here apply to production**, modulo those two additive changes. |
| Production URL | `https://revora.plus` (domain migrated `revora.app → .bio → .plus`) |
| Worktree | Dirty: 2 modified + 6 untracked **docs only** — all owner-owned, preserved untouched. |
| `git diff --check` | Trailing whitespace at `docs/retention_flow.md:77` (pre-existing owner edit; P3 cosmetic). |
| Toolchain | Node `v24.10.0`, npm `10.9.4` |
| Extra worktrees | `feat/app-shell-dashboard` (`9bc5cf3`), `main` (`4be486c`, "counsel-gate-candidate") — not audited. |

**Truth buckets kept separate throughout.** What I can attest firsthand: buckets
1 (committed source), 2 (dirty local), 3 (automated tests). Bucket 4 (browser
runtime) = on-disk Playwright artifact at HEAD (not re-executed this session).
Buckets 6/7 (preview/production runtime) = **doc-claimed only, not independently
verified by me** (no prod credentials). Bucket 8 (real user/payment/cohort) =
**absent** (definitively none in repo). Bucket 9 (external/human approval) =
recorded as a separate class; **counsel and dietitian voices do not determine
any verdict here**, per the prompt.

---

## 3. Denominators (Phase 2)

| Surface | Count |
|---|---:|
| Pages (`page.tsx`) | 27 |
| Route handlers (`route.ts`) | 61 |
| Layouts | 4 |
| **Error/loading boundaries** | **1** (only `app/(app)/home/error.tsx`) |
| First-party components | 41 |
| `lib` TS modules | 102 |
| Test files | 196 |
| Playwright smoke specs | 17 (was 16 at prompt-authoring) |
| DB migrations | 18 |
| Feature-flag modules | 6 |
| Repo Markdown corpus | 928 |
| CI workflows | 1 (`ci.yml`) |

Denominator caveat: the promise denominator (27 graded promises) and the
feature/function map were built from source, but the **manual** state matrix
(role × A1C × flag × outage) was **not** exhaustively hand-driven in a browser
this session — it leans on the passing Playwright suite + code tracing. That is
the honest coverage boundary and is why Engineering E2E is PARTIAL, not PASS.

---

## 4. Baseline automated gates (Phase 3 — Bucket 3, run this session)

| Gate | Command | Exit | Detail |
|---|---|---:|---|
| lint | `npm run lint` | 0 | clean (28s) |
| contract | `npm run contract` | 0 | all 9 checks: infrastructure, copy-ledger, forbidden-claims, forbidden-predictions, claims-boundary, evidence-pack, a1c-routes, qualitative-only, uncertainty-policy |
| typecheck | `npm run typecheck` | 0 | route types generated (35s) |
| dietitian:validate | `npm run review:dietitian:validate` | 0 | `requireClose=false`; **`clinicalApprovalStatus=pending_external_panel`**; 159 eval cases / 40 clinical / 8 governance routes |
| **npm audit** | `npm audit` | **1** | **3 vulns (1 high, 2 critical)** — `@auth/core`/`@auth/drizzle-adapter`/`next-auth` |
| test | `npm test` | 0 | **196 files ALL PASS** (877s) |
| eval:revora | mock corpus | 0 | passes (fixture-mock; see SAFE-01) |
| eval:pantry-extract | | 0 | passes |
| eval:meal-photo | | 0 | passes |
| build | `npm run build` | 0 | production build OK (155s) |
| git diff --check | | 2 | whitespace only (owner doc) |

**Every deterministic quality gate is green.** The single red gate is
`npm audit` (DEP-01).

### Browser E2E (Phase 5 — Bucket 4, on-disk at HEAD)
`test-results/.last-run.json` = `{"status":"passed","failedTests":[]}`;
`playwright-report/index.html` mtime (13:42) postdates the HEAD commit (11:07) →
current-HEAD. Projects: **Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12),
Desktop Chrome**; `workers:1`, `retries:0`; global setup warms 21 routes and
fails on any non-OK response. Fully isolated harness (`MEAL_EXTRACT_STUB=1`,
providers blanked, email→disk mailbox).
**Caveat:** I did *not* re-execute the suite this session (the disposable
loopback Postgres, container `revora-e2e-pg`, needs a redacted password +
migration provisioning). The passing artifact is tied to current HEAD but was
produced earlier today, not by me.

---

## 5. Canonical issue ledger

No **P0** was independently confirmed. Severity is my own calibration (see the
peer-session divergence in §12 — the peer stub asserts 1 P0 + 11 P1).

| ID | Sev | Surface | Location | Defect | Root cause | Risk |
|---|---|---|---|---|---|---|
| **SAFE-08** | **P1 (cand-P0)** | Hypoglycemia clinical copy | `lib/revora/clinical-risk.ts:95-117` · `docs/safety/copy-ledger.md:40` | Emits a **quantified 15-15 food/timing first-aid** ("~15 g fast-acting carbs… recheck in 15 min") on **non-specific adrenergic triggers** (bare *shaky/dizzy/sweaty/clammy/lightheaded/heart racing*) | Deliberate documented exception to the no-numbers rule (ADCES roadmap); **clinically UNVALIDATED** — only a *simulated* panel; RD/CDCES W-05 pending | A prediabetes-range user (low true-hypo risk) with anxiety/heat/caffeine symptoms is told "this can be low blood sugar, eat sugar now." Escalates & `urgent_symptoms` outranks it, but severity ceiling is a credentialed-clinical call |
| **SAFE-01** | **P1** | Live harmful-SAFE evidence | `tests/evals/revora-safety-eval.test.ts` · `lib/revora/postprocess.ts:84-107` | The launch-blocking "zero harmful-SAFE" guarantee is **mock-only**; two fixtures (`bbq-ribs`, `leftover-curry`) are `harmfulIfSafe:true, knownGap:true` and **excluded from the hard gate** | Floor coverage for high-GI meals outside the token vocab is delegated to the live model, only exercised with author fixtures in CI; live re-run owner-waived | A composed high-impact meal the live model calls SAFE ships as a reassuring "Clear"; the suite cannot detect it. **(Adversarially CONFIRMED.)** |
| **DEP-01** | **P1** | Auth dependency chain | `auth.ts:1-3` · `package.json` (`next-auth ^5.0.0-beta.31`) | `npm audit`: 1 high + 2 critical in `next-auth@5.0.0-beta.31`/`@auth/core` — incl. homoglyph email-normalization bypass (GHSA-7rqj-j65f-68wh) reachable on the email-magic-link path | Pinned to the top of the vulnerable range; prior "update vulnerable dependencies" commit didn't lift the auth chain | Account-confusion / auth-integrity exposure for a health app. (OAuth-cookie advisory likely inert — no social OAuth configured.) |
| **OPS-P1-A** | **P1** | Error boundaries | `app/(app)/home/error.tsx` (only one) | No `global-error.tsx`, no `(app)`/root `error.tsx` → a Server-Component render throw on `/check`, `/meals`, `/journey`, `/account`, `/subscribe` white-screens on Next's default page | Boundaries never added beyond `/home` | Core PWA loop is exactly those routes; API layer is resilient (calm retry copy) but **page render is not** |
| SAFE-02 | P2 | Clinical routing coverage | `lib/revora/clinical-risk.ts:40-249` | **No pediatric/age routing** — a child's meal + in-range A1C yields an adult prediabetes verdict | 8 adult clinical classes, none pediatric; `routeA1C` keys on A1C only | Adult-band meal verdict presented for a pediatric context with no guard |
| SAFE-03 | P2 | Forbidden-prediction enforcement | `lib/revora/postprocess.ts:151-208` | Prediction regexes are keyword-anchored (`A1C`/`glucose`/`mg/dL`/`GI`/`GL`); a paraphrased prediction ("this will bring your levels down") passes | Fixed keyword set, not semantic | Forbidden forward-looking claim reaches the user unless the (unverified) live model self-censors |
| SEC-01 | P2 | Data-rights export | `app/api/account/export/route.ts` · `schema.ts:210-243` | User-authored feedback comments are **erased** correctly but **absent from the data export** | `check_feedback` added to erasure path, never to any export path | GDPR Art.15/20 self-service completeness gap (safe manual workaround; no data loss) |
| B-1 | P2 | Commercial truth | `app/(app)/terms/page.tsx:67` | **Terms unconditionally promise "annual Premium"** but no `STRIPE_PRICE_ANNUAL` is provisioned (annual is an open owner decision, H1) | Static copy not gated on provisioning | Binding legal doc promises a plan not sold. Contained: purchase walls gate annual, so no user is mischarged |
| B-2 | P2 (latent) | Annual price coupling | `lib/server/pricing.ts:27-41` | Annual `display "$99.99"` is hardcoded, **decoupled** from whatever price `STRIPE_PRICE_ANNUAL` resolves to (unlike amount-keyed monthly); untested | Single env key, no amount encoding, no `resolveAnnualPrice` test | The day annual turns on at ≠$99.99, the wall shows one price while Stripe charges another — unguarded for annual only |
| OPS-P2-A | P2 | Launch kill-switch | `lib/revora/launch-controls.ts:117-119` · `health/route.ts` | When `EDGE_CONFIG` is **absent entirely**, there is no kill switch, and neither the build nor `/api/health` flags its absence (health reports `launch:"ready"`) | `EDGE_CONFIG` presence is un-gated & unmonitored | Prod could ship with no emergency brake, invisibly. (Edge-Config-*unreachable* correctly fails closed to paused.) |
| OPS-P2-B | P2 | CSP | `next.config.ts:141` | `script-src` includes `'unsafe-inline'` (`unsafe-eval` correctly absent) | Next inline runtime; nonce CSP noted as fix-forward | Weakened XSS mitigation on a page that renders model output |
| PROM-P2 | P2 | Landing honesty | `app/page.tsx:221` · `components/demo-check-card.tsx:48-75` | Heading "This is the actual answer you get" sits over a **static, hand-authored** oatmeal card never produced by the engine; `lastLiveCaptureAt: null` | Illustration presented as "actual"; "plain oatmeal" hits no deterministic floor → band is pure model discretion | Mild overstatement — the *format/route* is honest, the specific answer is an illustration |
| DOC-01 | P2 (claims) | Public device-status copy | `docs/release/truth-index.md:90` (C7) | Live public "wellness tool, **not a medical device**" line is **self-flagged "Overstated — must not stand"** pending counsel intended-use classification | Device-status wording shipped before counsel review | Claims-boundary exposure on landing/OG. (Disclosed; counsel gate excluded from verdict per prompt.) |
| SAFE-04 | P3 | Emergency ordering | `lib/revora/service.ts:54-79` | Emergency phrase + missing/malformed A1C → generic invalid-request card (schema parse precedes `classifyClinicalRisk`); loses "get help" routing via API | Clinical classification ordered after request-schema validation | Edge case (API-direct, absent A1C): fail-safe (no verdict) but the urgent redirect is lost |
| SAFE-05 | P3 | Claims false-positives | `lib/revora/postprocess.ts:189-208` | `treat`/`prevent` homograph regex degrades benign SAFE copy ("a balanced treat") to a retry card | Banned-claim patterns match food-vocabulary homographs | Availability/UX degradation; fail-safe direction |
| B-3 | P3 | Cancel idempotency | `app/api/billing/handlers.ts:699-718` | Session cancel path omits the `CANCELABLE` guard the token path has → 500 on an already-terminated sub | Guard missing on one of two entry points | Inconsistent cancel behavior (UI hides cancel when expired, so low-prob) |
| B-4 | P3 | Outage transient wall | `lib/server/entitlement.ts:226-228` | Paid user with a missed renewal **and** a Stripe outage during verify-on-read transiently reads free → hits the wall | Fail-toward-free for past-period rows during provider outage | Narrow; reconcile cron self-heals |
| RETAIN-02/03/04 | P3 | Nudge cadence | `lib/journey/nudge.ts` · `lib/server/nudge.ts` | Inactivity off-by-one (comment vs code); "weekly summary ready" nudge may re-notify a viewed summary; `few_per_week` enforces spacing not a counted cap | Approximations pending per-user viewed-at / send-history columns | Occasional slightly-redundant calm nudge; no safety/privacy impact |
| OPS-P3-A..D | P3 | Ops nits | `check/route.ts:283-286` · `heartbeat.ts:9` · `play-billing-flag.ts` · manifest | Legacy free-cap fails open on DB outage (bounded cost); `CronName` type omits 2 crons; Play flag has no runtime twin; manifest narrow-only screenshots | — | Low-impact; acknowledged in code |
| DIFF-01 | P3 | Repo hygiene | `docs/retention_flow.md:77` | Trailing whitespace (owner's uncommitted edit) | — | Cosmetic |

**Positives worth recording (INFO):** verdict-isolation is structurally sound
(SAFE-07); object-level authorization on every private route with zero P0/P1
authz defects; AES-256-GCM health-data at rest; Sentry/analytics/telemetry
PII-scrubbing verified landed; webhook fail-closed + idempotency/ordering/
dead-letter; entitlement self-heal; consent-before-persistence; complete
erasure; retention mechanism is production-grade with **no** streak/guilt dark
patterns.

---

## 6. Flag / role / state matrix (fail-closed verification)

| Flag | Client build flag | Server twin | Default | Enforcement |
|---|---|---|---|---|
| Meal memory | `NEXT_PUBLIC_MEAL_MEMORY` | `MEAL_MEMORY_ENABLED` | **CLOSED** | API 404 + capability matrix (`premium && serverFlag`) |
| Learning journey | `NEXT_PUBLIC_LEARNING_JOURNEY` | `LEARNING_JOURNEY_ENABLED` | **CLOSED** | API 404 + matrix |
| Photo input | `NEXT_PUBLIC_PHOTO_INPUT` | `PHOTO_INPUT_ENABLED` | **CLOSED** | needs BOTH else 404 |
| Longitudinal insights | `NEXT_PUBLIC_LONGITUDINAL_INSIGHTS` | `LONGITUDINAL_INSIGHTS_ENABLED` | **CLOSED** | coach nulls insight |
| Play billing | `NEXT_PUBLIC_PLAY_BILLING` | (single, by design) | **CLOSED** | Play endpoint 503 |
| Launch controls | Edge Config `launch_mode` | — | normal | unreachable→**paused (fail closed)**; absent→enabled (OPS-P2-A) |

All flags fail closed (only literal `"1"` enables); a production build fails if a
`NEXT_PUBLIC` flag is `"1"` while its server twin is unset (photo + longitudinal).
**Actual production flag values are Bucket 7 — not verifiable from source.** The
`human-actions-required.md` doc states photo-input and longitudinal-insights are
kept unset in prod pending owner approval; Memory/Journey default off.

Role/A1C/outage states were validated by code tracing + the passing E2E warm-up
(anonymous, guest, free, trial, premium, admin, reviewer; A1C boundaries
5.69/5.70/6.39/6.40/6.49/6.50; DB/Redis/model/Stripe/Sentry outages). Degraded
modes are a genuine strength: no outage grants a wrong paid feature; trial-mode
DB outage fails closed (no spend, no false paywall).

---

## 7. Promise-to-proof (Phase 1 / 7)

Verdict input: **PARTIAL** — engineering-demonstrated axis **strong**, live/
real-user axis **unverified**. Full 27-row matrix:
`docs/handoff/2026-07-23-revora-promise-to-proof-matrix-audit.md`.

- **PROVEN (deterministic floors):** orange juice can never be graded "Clear";
  oatmeal clarifies before answering (deploy-blocking `promise-registry.test.ts`);
  a "Clear" verdict structurally carries no adjustment/swap; clinical precedence
  and out-of-scope routing are deterministic; **zero banned-claim drift** in any
  live surface (independent grep of `app/`, `components/`, `lib/`).
- **PARTIAL/UNVERIFIED:** every promoted card has `lastLiveCaptureAt: null` and
  the landing demo is fully static (never engine-produced); model verdict
  *quality* is validated only by mock evals self-stamped "not clinical
  validation"; no real-user value evidence exists.

---

## 8. Safety diagnosis (Phase 6)

**Verdict: PASS-ENGINEERING / BLOCKED-HUMAN.** Deterministic enforcement is
real and re-proven: clinical routing runs first and is verdict-incapable (the
clinical schema has no `risk` field); A1C boundaries are exact; out-of-scope and
invalid input fail closed before the model; invalid model output fails closed to
a calm retry card; the claims contract runs in production on user-visible strings;
conservative floors only ever *raise* severity.

**The two items that keep this from a clean pass are engineering-evidence
gaps, not outsider judgments:**

1. **SAFE-08 (hypoglycemia first-aid) — the single highest-stakes item.** The
   `possible_hypoglycemia` route fires on broad, non-specific adrenergic tokens
   and renders a **quantified 15-15 food/timing first-aid instruction**. This is
   a *deliberate, documented* exception to Revora's own no-numbers rule (ADCES
   roadmap; 2026-07-16 decision), it routes away from a meal verdict, and it
   escalates — so it is not fabrication or a bug, and `urgent_symptoms` outranks
   it. **But** the copy is **clinically unvalidated** (the approving panel was
   *simulated*; RD/CDCES sign-off W-05 is pending), the triggers are
   non-specific, and the target population (prediabetes-range A1C) is generally
   not at true-hypo risk. Whether this is *appropriate* first-aid or *misleading*
   guidance is a credentialed-clinical determination. **I rank it P1 and flag it
   as a candidate P0**: I decline to certify it safe (my initial fan-out
   under-weighted it) and I decline to declare a definitive P0, because that is
   exactly the clinical call the prompt says a coding agent must not make. It is
   the #1 reason the human clinical gate must stay open.
2. **SAFE-01 (live harmful-SAFE) — CONFIRMED.** The "zero harmful-SAFE"
   guarantee is proven only against fixture mocks; two known-gap harmful-SAFE
   fixtures are excluded from the hard gate; the live-model corpus run was
   owner-waived. The guarantee is unproven against the model that actually ships.

No P0 deterministic breach (verdict-isolation, fail-closed, claims contract all
hold). Residual code items SAFE-02/03/04/05 are P2/P3.

---

## 9. Retention diagnosis (Phase 8)

**Verdict: INSUFFICIENT EVIDENCE** (trending *promising-but-unproven* at best,
*unlikely* at the current framing).

- **Mechanism technical-readiness: HIGH.** Fail-closed double gate; journey
  transitions are concurrency-safe (compare-and-swap → 409); pure day/stage
  derivation; weekly-artifact invalidation with a consent-race lock; **structural
  engine non-interference** (the check engine imports no memory/journey module —
  test-enforced); nudge cron respects quiet hours, cadence, 14-day inactivity
  stop, paid-capability gating, and lease idempotency. **No streaks, no
  loss-aversion/guilt copy** (banned + tested); cancellation is independent.
- **Empirical evidence: NONE.** Zero real paid-cohort, preregistration, or
  outcome data anywhere in the repo (definitive). Everything resembling "data" is
  simulated, benchmark, plan, or projection. The founder's own
  `docs/retention_flow.md` concedes the recurring value "is too weak after users
  learn their common meals," which motivated the reframe to a finite 90-day
  program. The recurring loop leans on reflection + gentle reminders, not a
  renewing source of new value.

Retention is a **code hypothesis**, not a measured outcome. It cannot be
answered without the preregistered real-payer study.

---

## 10. Billing & commercial truth (Phase 9)

**Verdict: PARTIAL** (engine PASS-ENGINEERING; commercial truth PARTIAL). No
P0/P1. The money machinery is honest and defensively built: server price
authority; webhook signature fail-closed 503 without the secret (verified,
commit `99ebec8`) + durable dedupe inbox + FOR UPDATE lock + latest-event-wins
ordering + dead-letter; entitlement self-heal (verify-on-read + reconcile cron +
sync-on-return); cancellation preserves earned access and treats already-canceled
as success (`385fe5c`); refund webhook drops premium + deletes pantry blobs;
outage never renders a false paywall (trial fails closed to 503, not 402);
consent checkbox gates checkout with full price/cadence/trial/charge-date/cancel/
refund disclosure; Play verify/RTDN code-correct and flag-gated off.

The one real gap is **annual (B-1 + B-2)**: `/terms` promises an annual plan that
is not provisioned in live Stripe, and the annual display price is hardcoded and
structurally decoupled from the charged price. Contained today by UI gating (no
mischarge), but it is a truthfulness/consumer-terms exposure and an unguarded
future foot-gun. Bucket 8 (live Stripe/Play round-trips) is UNVERIFIED — no
sandbox credentials.

---

## 11. Prior-report re-proof & claim drift (docs dimension)

- **Closest predecessor:** `docs/handoff/2026-07-20-revora-e2e-promise-retention-audit-report.md`
  (prior run of this exact prompt). Its Retention (INSUFFICIENT) and
  clinical/counsel (BLOCKED-HUMAN) verdicts **still hold**. Its Production
  **NO-GO** and "no one can sign in in prod" (DA-6) are **now contradicted at the
  technical layer** (auth email chain resolved; live prod healthy per closeout
  doc) but still valid at the clinical/legal layer.
- The 2026-07-22 deep-audit NO-GO (8 launch-critical fails) is **substantially
  remediated (6/8)** and superseded by the 2026-07-23 GO-closeout final report on
  `origin/main`.
- **Top claim-drift risk (HIGH):** production `main` carries a bounded
  **"TECHNICAL SERVICE-INTEGRATIONS RELEASE DECISION: GO"** whose header excludes
  counsel + clinical — trivially misread as a full launch GO.
- **Overstatement:** the C7 public "not a medical device" line is live and
  self-flagged "must not stand" (DOC-01). Active source-of-truth docs are
  otherwise clean and self-policing.
- **Stale:** `human-actions-required.md` still lists H26/H27/H30 open though the
  closeout addendum closed them; a `revora.bio` domain remnant persists.

**Open human/external gates (none agent-closable, excluded from verdicts per
prompt but disclosed):** RD/CDCES clinical review (only simulated to date;
W-05) · counsel ×9 waived-not-cleared + device-status + Terms placeholders ·
DPIA/privacy-security · accessibility audit + target-user usability · staged
rollout → paid cohort + release dashboard + stop-the-line · monitored support
inbox + named on-call/refund owner · trademark "Revora" · Google Play
(account/keystore/aab/assetlinks/forms/listing) · physical-device QA incl. real
Play purchase/restore.

---

## 12. Concurrent session & divergence

A **separate, concurrent Claude session** is actively writing the
canonically-named deliverables in `docs/handoff/` (the report stub +
`…-issue-ledger.csv` [updated ~22:13Z, 27 KB] + promise/flag/feature CSV matrices
+ document-corpus + run-evidence). **I did not create those files and did not
overwrite them.** Its preliminary decision table is **harsher** than mine:

| Decision | Peer stub | This report |
|---|---|---|
| Engineering E2E | FAIL (65%) | **PARTIAL (78%)** |
| Core promise | FAILED (60%) | **PARTIAL (72%)** |
| Health/claims safety | FAIL (85%), **1 P0** | **PASS-ENGINEERING / BLOCKED-HUMAN (60%)**, hypoglycemia as **P1 candidate-P0** |
| Retention | INSUFFICIENT (10%) | **INSUFFICIENT (88%)** |
| Production | UNVERIFIED (20%) | **CONDITIONAL GO (55%)** |
| Ledger | 1 P0 + 11 P1 + 3 P2 + 2 P3 | 0 confirmed P0 · 4 P1 · 8 P2 · ~10 P3 |

**The core disagreement is the hypoglycemia route (peer P0/FAIL vs my
P1/candidate-P0).** I verified the peer's factual claim is **accurate** — the
route does emit quantified 15-15 first-aid on broad triggers — but I hold that
declaring it a *settled* P0/FAIL requires a clinical determination the prompt
bars a coding agent from making, and the behavior is a *documented, deliberate,
escalation-carrying* exception, not fabrication. I therefore rank it P1 and route
the severity ceiling to the credentialed RD/CDCES gate. **Recommendation: treat
neither report as final until the two are reconciled and the hypoglycemia copy
is reviewed by a credentialed clinician.** I did not attempt to determine which
session the user intended; both analyses should be preserved.

---

## 13. Direct answers

**Does Revora deliver its core first-session promise today?**
*Technically demonstrated, not user-validated.* The deterministic honesty
guarantees (cautious routing, floors, clarification, no banned claims) are real
and enforced. But no promoted example has ever been live-captured, the demo card
is static, model verdict quality is mock-only, and there is no real-user evidence
that the result is understood or useful. → **PARTIAL / TECHNICALLY DEMONSTRATED.**

**Can it keep paying users for 90 / 180 / 365 days?**
*Unknown — unproven.* The retention machinery is production-grade and free of
dark patterns, but there is **zero** real paid-cohort evidence, and the product's
own docs concede the recurring value thins once users learn their meals. D90/
D180/D365 are **empirically unanswerable today**. → **INSUFFICIENT EVIDENCE.**

**What is proven / inferred / forecast / unknown?**
- *Proven (engineering):* deterministic safety enforcement, authz/privacy,
  billing machinery, degraded-mode handling, flag fail-closure, green suites +
  build + on-disk E2E.
- *Inferred:* code findings apply to deployed prod (ancestor relationship).
- *Forecast/hypothesis:* retention loop value; promise usefulness.
- *Unknown:* live-model harmful-SAFE rate; clinical correctness of the
  hypoglycemia + all clinical copy; live-prod runtime (not independently
  verified); any real paid retention.

---

## 14. Single most valuable next action

**Obtain a credentialed RD/CDCES review of the `possible_hypoglycemia` 15-15
first-aid copy and its trigger set (SAFE-08), and execute the live-model
harmful-SAFE corpus run (SAFE-01).** These two resolve the highest-consequence
open question (does the app give safe health guidance to real users?) and
together determine whether the health-safety axis is a genuine pass or flips to
NO-GO. The P1 engineering items (DEP-01 `npm audit fix`, OPS-P1-A error
boundaries, B-1 annual-terms) are cheap, independent follow-ups.

---

## 15. Final recommendation

**CONDITIONAL GO** — for the *engineering/technical* layer only, which is
already deployed and, by the closeout doc, healthy. Conditions before treating
Revora as broadly end-user-ready:

1. Remediate the P1 code items (DEP-01 auth vulns, OPS-P1-A error boundaries).
2. Execute the live-model harmful-SAFE corpus (SAFE-01) and obtain the RD/CDCES
   review of clinical copy including SAFE-08 — **if that review finds the
   hypoglycemia first-aid unsafe, the health axis flips to NO-GO.**
3. Fix the Terms annual promise (B-1) or provision + couple annual pricing (B-2).
4. Independently verify the deployed `24d88ec` runtime (I could not).

**Do not** describe Revora as flawless, validated, ready, clinically approved,
counsel-cleared, or capable of long-term paid retention — none of those evidence
gates are green. It is a strong, honest, well-tested engineering artifact with a
clinically-unvalidated first-aid exception and no user-value or paid-retention
evidence yet.

---

## 16. Self-audit

- Refreshed current source/branch/flags/deployed truth: **yes** (found & verified
  the 10-commit ancestor relationship to prod firsthand).
- Preserved owner work, no unauthorized side effects: **yes** (docs untouched; no
  fixes/commits/deploys; did not clobber the peer session's files).
- Published denominators: **yes.**
- Ran real gates + used real E2E artifact: **yes** (E2E not re-executed — disclosed).
- Kept technical / promise / retention / prod / human-approval buckets separate:
  **yes.**
- Did not infer retention from feature existence or annual prepayment: **yes.**
- Gave explicit evidence-backed verdicts including negatives: **yes.**
- Coverage gaps disclosed: live-model evals not run (deterministic fixtures only);
  live Stripe/Play not exercised; live-prod runtime not independently verified;
  manual state matrix leaned on the passing suite + tracing; the peer session's
  independent ledger (1 P0 + 11 P1) is not reconciled with mine.

*Deliverables produced this run: this report; the promise-to-proof matrix
(`2026-07-23-revora-promise-to-proof-matrix-audit.md`); per-dimension evidence
retained in the audit scratchpad. Canonical-named files were left to the
concurrent peer session.*
