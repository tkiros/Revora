# Revora — Product Value, Paid Retention, Virality, and First-5,000-User Forensic Audit

**Date:** 2026-07-18 · **Branch:** `qa/launch-live-smoke-2026-07-18` · **HEAD:** `a5424b1` (== `origin/main` after PR #17 squash-merge, 2026-07-18T04:02Z)
**Mode:** Read-only forensic audit. No code, flags, deploys, or money were touched. No live model calls were made (each costs real money against a ~$3 OpenRouter balance); all engine-behavior claims are backed by existing artifacts, source inspection, or a local dev-server probe with a dummy key (free).
**Author's stance:** skeptical outside auditor. Prior product docs, ICPs, and strategies are treated as hypotheses, not verdicts, unless independently re-confirmed here.

---

## 1. Executive verdict — the five direct answers

| Question | Direct verdict | Score/confidence | Decisive evidence | Biggest unknown | Next decision |
|---|---|---:|---|---|---|
| Does Revora deliver its promise and meaningful value? | **PARTIAL — useful but the promise/value gap is material** | 57/100, confidence 70% | The single most-promoted example in the whole funnel (type "oatmeal," see "Be careful") does not reproduce live — it returns a clarifying question instead, because "oatmeal" alone sits on an exact-match ambiguous-food list (`lib/revora/input-precheck.ts`). A 240-case simulated panel also found 5/30 cultural-mixed meals given a false "Clear." Genuine safety-engineering sophistication is real but not what users feel first. | Whether real users experience the "aha" the same way a code trace suggests, absent any live usage data | Fix the oatmeal-reproduction bug and the cultural-meal floor gaps before spending on acquisition that will drive traffic straight at both |
| Can it retain paying users long-term? | **NO — current value is episodic and unlikely to support long-term payment**, with a narrow, unvalidated exception for the persistently high-glucose subsegment | 31/100 median user; 45/100 for the persistently-high-glucose subsegment | The engine is history-blind — `buildRevoraPrompt` takes only `{food, a1c, a1cBand}`; zero code paths read prior checks to change a future answer. Independent evidence: photo-based meal logging drops ~83% in 6 months even inside a supported RCT; comparable digital diabetes tools retain 17.6% at 1 year; independent CGM reviewers converge on a 2–3 month "useful window" | No real Revora cohort exists to confirm or refute this — it is the single most important instrumentation gap | Ship the WTP/retention cohort test before any further distribution spend |
| What one feature most upgrades it? | **NONE** | Best candidate (personal food notes) scores 64/100, below the 75 bar | Personal notes was already scoped internally (2026-07-09) and confirmed unbuilt (repo-wide grep, zero hits); it is real but modest — it does not feed back into the verdict, by design, to stay inside the claims boundary | Whether users would actually return for a notes feature at all — untested | Fix the cultural-meal reliability gap and the retention/business-model structure before building any new feature |
| What are the five strongest viral parts? | Ranked: (1) oatmeal-verdict reveal, (2) photo draft-confirm-then-answer, (3) "keep-most" anti-shame swap, (4) honest clarifying question, (5) out-of-range boundary routing | All CONTENT-VIRAL only | Zero share/referral code exists anywhere in the repo (`navigator.share`, clipboard, invite, referral redemption: 0 hits) | Whether any of these actually stop the scroll for a cold audience — untested | Run the W3–4 format tournament the 90-day plan already specifies before committing production budget to any one asset |
| What one engine gets the first 5,000 activated users fastest? | **Reddit, founder-disclosed, value-first engagement in r/prediabetes and directly adjacent subs** (TikTok as a floor-effort secondary, not primary) | Base case ≈ 5 months to 5,000 activated first-checks | r/prediabetes is verified at 48,083 members, +2.6%/30d (2026-07-16); the SEO-compounding rationale for Reddit is largely invalidated (68% of 2026 Google searches end without a click) but the live-conversation rationale is not | Landing→first-check conversion and Reddit click-through are both benchmark planning ranges, not Revora-measured numbers | Run the 14-day proof test in §10 before scaling any spend |

---

## 2. Snapshot and evidence quality

- **Repo state:** branch `qa/launch-live-smoke-2026-07-18`, HEAD `a5424b1`, clean except one untracked file (this audit's own master-prompt doc). Two other worktrees exist (`feat/app-shell-dashboard`, and a `main`-tracking `counsel-gate-candidate`) — pre-existing, untouched, out of scope for this audit.
- **Recent history:** the last five commits show a WTP-first pivot (2026-07-17), billing opened by default with a kill switch, a photo-path bug fix, a 97.0%-riskAccuracy OpenRouter reproducibility run, and today's live-smoke record with E2E-06 green 12/12 — i.e., the team just finished an intensive "get to launchable" push, not a settled, user-tested product.
- **Deploy/domain state (context, not an action item — the owner's residual list explicitly defers these):** `revora.bio` currently has no nameservers and does not resolve; Resend has zero verified sending domains, so magic-link email cannot currently deliver to a real inbox; the live Stripe webhook endpoint is not yet registered in the Stripe dashboard; no Umami analytics instance exists anywhere. **Practical consequence for this audit:** even though the engineering is live-smoke-tested (`docs/qa/23-launch-live-smoke-2026-07-18.md`), a real stranger cannot yet complete the full account/subscribe/cancel loop end-to-end, and **the acquisition funnel currently has zero analytics instrumentation live** (the code is real and wired; the backend is dark). This is why every retention/funnel number in this report is a benchmark or a code-trace, never a measured Revora number.
- **Feature-flag state, as of the 2026-07-18 launch execution (`docs/qa/23-launch-live-smoke-2026-07-18.md`):** checkout is open by default (`LEGAL_TERMS_FINAL` kill switch not engaged), `PAYWALL_MODE` defaults to `trial` (7-day card-gated trial, $12.99/mo default variant), `NEXT_PUBLIC_PHOTO_INPUT=1` and `NEXT_PUBLIC_LONGITUDINAL_INSIGHTS=1` were set in Vercel production before today's merge. **Note:** the 2026-07-12 owner-risk decision said longitudinal insights "must remain unset" pending a function-specific evidence review; the 2026-07-17 owner statement ("every part of the app should be active... I will take full responsibility") is the explicit written owner decision the gate required, but no separate function-specific evidence review of the insights feature's accuracy was performed — the gate was satisfied by owner authority, not by the originally contemplated review. Recorded as a contradiction, not a violation (§3).
- **Users, payments, cohorts:** `MEASURED-USERS` evidence for this entire product is **UNKNOWN/absent**. The repeated phrase across the team's own handoffs is "zero users, zero revenue" (`docs/Revora_90-Day_Distribution_Strategy.md` §0.1). All safety/quality evidence is `TESTED` (simulated LLM panels, 0 real dietitian review) or `IMPLEMENTED` (source-verified), never `MEASURED-USERS`. This audit does not manufacture retention or WTP numbers to fill that gap — see §13.
- **Clinical/legal state:** the credentialed RD/CDCES panel (W-05/F-06) is **still open** — every safety number in this repo comes from three LLM personas, not licensed dietitians, and the repo's own docs are emphatic that this must never be described as clinical validation. Counsel review was **waived by the owner** on 2026-07-12; `COUNSEL GATE: NOT CLEARED` remains the factual status. The owner has accepted this risk in writing (`docs/legal/owner-risk-launch-decision-5f6abcb.md`, `docs/handoff/2026-07-17-owner-risk-full-launch-session-handoff.md`) — this audit does not re-litigate that decision, only carries its status forward accurately.
- **Evidence-gathering method:** direct git/source inspection (this session); four parallel Explore agents each mapping one code area to file:line evidence (acquisition/check, billing/entitlement, retention loops, growth/analytics plumbing); three parallel research agents (competitor audit, external user-pain literature, distribution-channel policy audit) using live web search, all citations dated 2026-07-18 unless noted. No live model calls were made; no production traffic was generated beyond routine page-load probes against a local dev server (free).

---

## 3. Contradiction ledger and current feature truth

| # | Contradiction | Sources | Resolution |
|---|---|---|---|
| K1 | Landing/onboarding/demo card all advertise typing "oatmeal" → "Be careful" verdict, but the live input-precheck returns a **clarifying question** for that exact string | `app/page.tsx:120`, `components/demo-check-card.tsx:14`, `app/(app)/onboarding/page.tsx:63` vs `lib/revora/input-precheck.ts` (`AMBIGUOUS_PLAIN_OR_SWEETENED` list) | **Real bug, not a documentation error.** The single most-repeated acquisition asset cannot reproduce its own advertised output. See §5. |
| K2 | Onboarding's out-of-range A1C copy (`HIGH_RANGE_MESSAGE`, hardcoded) differs from the current approved `high-range-route` copy-ledger text (revised 2026-07-16) | `app/(app)/onboarding/page.tsx:24-25` vs `docs/safety/copy-ledger.md:38`, served correctly elsewhere via `lib/revora/fallback.ts:147-159` | Two different out-of-scope messages ship for the same clinical condition depending on which surface a user hits. Minor but real copy drift. |
| K3 | Client paywall default (`legacy`) diverges from server default (`trial`) on a failed `/api/paywall` fetch | `components/food-check-form.tsx:67` vs `lib/server/pricing.ts:47-49` | Deliberately fail-open, but means a network hiccup can hide the taster counter while the server still walls the user — a surprise paywall, which the code's own comments say must never happen. |
| K4 | 2026-07-12 owner-risk decision: longitudinal insights "must remain unset" pending function-specific evidence review, vs. 2026-07-17/18: flag turned on in production | `docs/legal/owner-risk-launch-decision-5f6abcb.md:44` vs `docs/qa/23-launch-live-smoke-2026-07-18.md` Step 5 | Not a violation — the later dated owner decision is the explicit written approval the gate contemplated — but the specific "function-specific evidence review" clause was not separately fulfilled. Recorded, not treated as clearance for anything beyond what the owner actually authorized. |
| K5 | The 90-day distribution strategy's POST 3 template asserts "wellness tool, not a medical device" in public, founder-identified copy | `docs/Revora_90-Day_Distribution_Strategy.md` §4.5 vs FDA's revised General Wellness guidance (2026-01-06), which disqualifies products that name a diagnostic threshold, reference a specific clinical condition, or issue directive verdicts — Revora's A1C 5.7–6.4 gate and "Hold off" verdict hit all three | Flagged by the research-distribution agent as the single most serious finding in the whole distribution audit. This is a factual, unsettled legal question being asserted as settled fact, publicly, under a named founder identity. Not resolved here — routed to the same counsel gate everything else in this repo is already waiting on. |
| K6 | The engineering team's own header comment claims "the webhook is an optimization, not a correctness dependency" for entitlement | `lib/server/entitlement.ts:10` vs the actual code: verify-on-read self-healing is gated to `provider === "play"` only (`:82`); Stripe has no equivalent reconciliation | The comment is true for Play and **false for Stripe**. A live card can be charged with the entitlement never flipping, and nothing in the codebase ever recovers it automatically. |
| K7 | `docs/product-marketing.md` and multiple prior handoffs describe photo-assist and longitudinal insights as "not an advertised launch feature," while today's launch execution (doc 23) has both flags live in production | `docs/product-marketing.md:24-32` vs `docs/qa/23-launch-live-smoke-2026-07-18.md` Step 5 | Current truth wins per the priority order in this audit's brief: both are live as of today. Marketing copy has not yet been updated to reflect this — a distinct, smaller drift from K5/K6. |

**Current feature truth, condensed** (full file:line tables are in the four agent appendices this report draws from; only the load-bearing rows are reproduced here):

| Feature/surface | Implementation | Guest/free/paid | Live today? | Evidence class |
|---|---|---|---|---|
| Text meal check | Full pipeline: clinical-risk regex router → A1C route → ambiguity precheck → LLM (`gpt-5.4-mini` via OpenRouter) → conservative floors → contract assertions | Guest (metered), then free/paid tiers | Yes | `IMPLEMENTED`, `TESTED` (240-case simulated panel) |
| Voice-to-text entry | Web Speech API, feature-detected; iOS Safari gets hint copy only, no button | Guest | Yes | `IMPLEMENTED` |
| Photo-to-draft entry | Vision extract → per-item editable/confirmable draft chips → composed plain text into the same textarea; never a direct verdict | Guest, flag-gated | **Yes**, `NEXT_PUBLIC_PHOTO_INPUT=1` set in prod today | `IMPLEMENTED`, `TESTED` (40-photo Tier-1 engineering run, 0 retry cards after fix) |
| A1C out-of-range routing | Deterministic, no model call, no spend | All | Yes | `IMPLEMENTED` |
| Clinical-risk routing (8 classes) | Deterministic regex, runs before any food logic, fixed non-generative copy | All | Yes | `IMPLEMENTED`, `TESTED` (6/6 unanimous panel agreement) |
| History / "week" view | Read-only 7-day list; re-running a check is byte-identical to the first run | Free/paid | Yes | `IMPLEMENTED` — but see §6, it is display, not memory |
| Longitudinal insights | Real read of prior checks exists in `lib/coach/insights.ts`; prints one sentence after ≥5 checks; never feeds back into a future verdict | Paid, flag-gated | **Yes**, flag set in prod today | `IMPLEMENTED` (thin) |
| BAI / weekly progress score | Scores app-usage behavior (days checked, actions acknowledged), not health outcome | Premium only | Yes | `IMPLEMENTED` — self-referential, see §6 |
| Daily nudge | 4 static rotating strings, zero personalization, zero analytics instrumentation | Premium, opt-in | Yes | `IMPLEMENTED` (uninstrumented) |
| Pantry Review | One-time $49 report; fully siloed from meal-check history in both directions | One-time | Yes | `IMPLEMENTED` |
| Share/referral/invite | **Does not exist anywhere in the codebase** | n/a | No | `IMPLEMENTED` (absence confirmed) |
| Public/shareable report link | `/report/[id]` is `noindex`, auth-gated, owner-scoped only | n/a | No (by design) | `IMPLEMENTED` |
| Analytics (Umami) | Real, typed, allowlisted event pipeline; script tag renders only if both env vars are set | — | **Code real, backend dark** — no Umami instance exists anywhere yet | `IMPLEMENTED`, `UNKNOWN` (production activation) |
| Trial billing lifecycle | Checkout → webhook → entitlement → pre-charge email → cancel → lapse | Paid | Yes (mechanics), webhook-dependent | `TESTED` (E2E-06, 12/12, test-mode Stripe) |
| Refund | Only a webhook-driven admin reaction (`charge.refunded`); no user-initiated flow despite a Terms-page promise | Paid | Partial | `DOCUMENTED-CLAIM` (Terms) vs `IMPLEMENTED` (webhook only) — gap |

---

## 4. Real-user journey findings

Twelve journeys were traced against source, the 240-case simulated panel, the Tier-1 photo run, and a local dev-server probe (no spend). Production is not fully reachable by a real stranger yet (§2), so journeys that require magic-link email or a live model call are labeled `UNVERIFIED-LIVE` and backed by the strongest available proxy evidence instead.

| # | Journey | Finding | Evidence class |
|---|---|---|---|
| 1 | Newly diagnosed, A1C 5.7, simple familiar meal ("oatmeal") | **Does not produce a verdict.** Returns a clarifying question ("Is this plain or sweetened?") instead of the advertised "Be careful" card — see K1. A slightly different phrasing ("a bowl of oatmeal") would clear the exact-match list and behave as advertised. | `IMPLEMENTED` (bug), `TESTED` |
| 2 | A1C 6.4, restaurant/takeout meal | Traced via prompt design: composition-first reasoning names the actual dish, the 2026-07-16.2 "starch-count anchor" specifically targets multi-starch restaurant plates. Simulated panel found restaurant-scale portion cases were the main driver of the pre-fix under-banding (now improved, 87.9%→97.0% riskAccuracy). | `IMPLEMENTED`, `TESTED` |
| 3 | Culturally specific mixed meal, uncertain portion | **Confirmed weak spot.** 5 of 30 cultural-mixed cases in the 240-case panel (salmon poke, chicken congee, ugali+sukuma wiki, gallo pinto, chicken kebab+tabbouleh) got a false "Clear" that all three reviewer personas — including a self-grading judge — called dangerous. The carb-forward token ontology has confirmed blind spots on injera, biryani, pho, dosa, pierogi, and more; the model's own food knowledge is the only backstop where the ontology is blind. | `TESTED` (simulated panel), high-confidence gap |
| 4 | Apparently "healthy" meal, surprising result | This is the product's own flagship "aha" (the "healthy food betrayal"), and mechanically it works for meals that survive the ambiguity precheck — but ironically not for the literal word "oatmeal" (journey 1). | `IMPLEMENTED`, partially `TESTED` |
| 5 | Incomplete/ambiguous meal | The ambiguity precheck is an **exact-match list**, not a general capability — `getAmbiguousQuestion` matches only three curated lists (plain-or-sweetened, protein-or-veg, underspecified). A composed description ("leftover fried rice, two cups") bypasses the list entirely and reaches the model directly, which the panel found sometimes graded 10 of 40 deliberately underspecified inputs instead of asking. | `IMPLEMENTED`, `TESTED` (panel F-5) |
| 6 | Low digital-confidence user, 55–65, phone + voice | Voice entry is feature-detected post-hydration; iOS Safari gets no button, only hint copy pointing at keyboard dictation — a real friction point for exactly the ICP's stated demographic (71% of 50+ own a smartphone but only 20% use apps for chronic conditions, per `docs/ICP.md`, AARP 2024). | `IMPLEMENTED` |
| 7 | User outside supported A1C range | Deterministic, no model call, calm boundary copy, correctly short-circuits before any spend. Copy drift exists between onboarding and the live-check route (K2). | `IMPLEMENTED` |
| 8 | Urgent/medication/allergy/pregnancy/ED/diagnosed-diabetes input | Deterministic regex router runs **before** the food model, with an explicit precedence order (urgency beats every other class). 6/6 unique clinical templates routed correctly and unanimously in the simulated panel, including casual paraphrases ("gonna pass out"). This is genuinely sophisticated safety engineering — the strongest single piece of `IMPLEMENTED`+`TESTED` evidence in the whole audit. | `IMPLEMENTED`, `TESTED` |
| 9 | Guest checks several meals, returns later, considers an account | Guest history is device-local only (`localStorage`/`sessionStorage`); creating an account requires a magic-link email, which **cannot currently be delivered** (Resend unverified, §2). This journey is presently broken for a real stranger, independent of product quality. | `UNVERIFIED-LIVE` (email dependency), `IMPLEMENTED` (code) |
| 10 | Paid user returning Day 2/7/30/after anxiety fades | The engine returns byte-identical output for the same food+A1C on day 200 as on day 1 (§6). Nothing in the product changes as the user returns more. | `IMPLEMENTED` (structural finding), `EXTERNAL-EVIDENCE` for expected decay (§7) |
| 11 | User who has learned the patterns asks "why do I still need this?" | No feature in the current product answers this. The BAI/progress score measures app usage, not health outcome or learning; the product's own `/progress` page code comment concedes it structurally cannot show a week-over-week trend. | `IMPLEMENTED` (absence confirmed) |
| 12 | User wants to share a result | **Cannot.** No share button, no `navigator.share` call, no referral code, and `/report/[id]` is `noindex` and session-scoped — pasting the URL to a friend produces a sign-in redirect, not a viewable artifact. | `IMPLEMENTED` (absence confirmed) |

**First-session "aha" test:** the intended activation moment — a genuinely surprising but credible insight on a food the user believed was safe — is real in mechanism (composition-first prompting, grounded-reason checks that block fabricated "sugary" claims on foods with no sugar, HIGH-is-swap-led-not-permission-granting). But the exact example every acquisition surface promotes does not currently produce that moment (journey 1), and the mechanism's accuracy has a confirmed, evidenced gap on exactly the cultural/comfort foods the ICP's own research says matter most (journey 3). Time-to-value is otherwise fast (~5s design intent, no login required for guest checks) where the mechanism actually fires.

---

## 5. Q1 — Promise delivery and real-life value

### 5.1 Promise-to-proof matrix (major active promises)

| Promise | Source | What the product actually does | Verdict |
|---|---|---|---|
| "Check a meal. Understand its balance in seconds." | Landing hero | Real for meals that pass the ambiguity precheck; a clarifying question (itself calm and honest) intervenes for common single-word inputs | `PARTIALLY DELIVERED` |
| Type "oatmeal" → "Be careful" + adjustment + swap | Landing phone mockup, static demo card, onboarding default chip | Returns a clarifying question for the literal string "oatmeal" | `NOT DELIVERED` (for the literal advertised input) |
| "When we're unsure, we say so" / conservative-by-design | Home trust strip, product-marketing.md | Real and well-engineered: grounded-reason checks, conservative floors, fail-closed retry on any banned-claim match | `DELIVERED` |
| "Built only for the prediabetes A1C range... outside it, we say so" | Multiple surfaces | Deterministic, correct, no model call, no spend | `DELIVERED` |
| Cultural/mixed-meal competence (implied by "check any meal") | Implicit in the core positioning | 5/30 simulated-panel cultural dishes produced a dangerous false "Clear" | `MISLEADING OR OVERSTATED` relative to current accuracy |
| One-tap cancel, pre-charge email, transparent billing ("anti-Klinio" positioning) | Copy ledger, trial-wall copy | Two real cancel paths (in-app + email-token), real pre-charge cron | `DELIVERED` (mechanically) |
| Refund window (7 days) | `/terms` | No user-initiated refund code path exists; only a webhook-reactive admin process | `PARTIALLY DELIVERED` / doc-only promise |
| "The moat is the daily relationship: memory, patterns" | `PRODUCT.md` | Zero code paths make a future verdict depend on past checks | `NOT DELIVERED` |
| "No dashboard, no numbers to decode — one card, in plain words" | Landing | True and consistently enforced by the safety contract (regex-blocked exact numbers) | `DELIVERED` |

### 5.2 Value score — 57/100

| Dimension | Weight | Score | Reasoning |
|---|---:|---:|---|
| Pain severity and frequency | 12 | 9 | Real, well-evidenced daily pain (meal-decision uncertainty after a dismissive diagnosis) — strong external literature support (§7) |
| Time to first meaningful value | 12 | 7 | Fast when the mechanism fires; broken for the single most-promoted example |
| Incremental insight | 15 | 8 | Composition-first, grounded reasoning is genuinely more specific than generic advice — but a same-quality answer is available free from GPT-4o today (research-competitors) |
| Actionability and meal specificity | 15 | 9 | Strong by design (adjustment/swap must name a described component); undermined by the cultural-meal accuracy gap |
| Trust, honesty, comprehensibility | 15 | 11 | The standout dimension — deterministic clinical routing, fail-closed contract enforcement, honest "we're unsure" clarify path are all real and well-built |
| Coverage of real contexts | 10 | 4 | Confirmed, evidenced gap on cultural/mixed meals and portion-heavy restaurant plates (improved but not resolved) |
| Emotional value | 8 | 5 | Genuine anti-shame design intent (keep-most framing, defanged streaks); undercut by zero personalization, which the ICP's own research names as the #1 objection |
| Repeat value and learning | 8 | 1 | The engine is history-blind; nothing compounds |
| Friction, reliability, accessibility | 5 | 3 | Real friction points: iOS voice-entry gap, client/server paywall-mode divergence, silent draft truncation on photo path |
| **Total** | **100** | **47** | |

### 5.3 Required direct verdict

**PARTIAL — useful but the promise/value gap is material.**

- **Who receives the value:** a newly-diagnosed adult in the first weeks of anxious uncertainty, checking a food they're genuinely unsure about, who gets a calm, specific, honestly-hedged answer instead of a generic "eat better."
- **The concrete moment:** the first correctly-classified "Be careful"/"Hold off" verdict on a food the user believed was safe, with one concrete swap that preserves the meal.
- **What changes:** for that single decision, uncertainty is replaced with a specific, actionable read — genuinely more than a population-level tracker or an unprompted Google search gives.
- **What Revora does not solve:** it does not personalize to the individual's actual carb tolerance (the #1 stated objection in the ICP's own research), it does not currently handle several classes of cultural/comfort food reliably, and its most-advertised example doesn't work as advertised.
- **Confidence:** 70%. The largest source of uncertainty is that all of this is inferred from code and a simulated panel — no real user has ever used this product, so the actual felt experience is unverified.
- **What would falsify this:** a real cohort showing users routinely get correctly-classified, specific, useful answers on the actual foods they type (not the curated eval corpus), and don't experience the oatmeal-style promise mismatch as a first-session credibility hit.

---

## 6. Q2 — Durable paid retention

### 6.1 The natural need curve (external evidence, not Revora data)

| Stage | New question Revora could answer | Evidence |
|---|---|---|
| Diagnosis day / week 1 | "What do I do right now?" | Strongest fit — matches the acute uncertainty documented across the literature (`EXTERNAL-EVIDENCE`, BMC Public Health 2022 meta-synthesis of 20 studies) |
| Day 30 | "Am I doing this right?" | Still plausible fit, but knowledge saturates fast — one study found young adults already had "strong nutrition knowledge" within weeks; the binding constraint becomes cost/time/environment, not information |
| Day 90 | "Why do I still need to check this?" | The product has no answer here — no progress narrative, no graduation path, no changed behavior from the app itself |
| Day 180 | — | Independent CGM reviewers (a genuinely more data-rich product category) converge on a 2–3 month "useful window" before it's "the same patterns repeating" |
| One year | — | Comparable digital diabetes tools retain 17.6% of users at 1 year on a median of 8 lifetime logins (JMIR 2023, n=9,522) |
| After learning common patterns | "Why not just remember this myself?" | Habit automaticity for eating behaviors plateaus at a median ~59–65 days (Healthcare/MDPI 2024) — directly undercuts any subscription premised on ongoing per-meal uncertainty |
| After the next A1C test | Graduation or escalation, neither served | 36.1% revert to normoglycemia within 10 years (lose the reason to pay); 12.5% progress to diagnosed diabetes (graduate to an explicitly out-of-scope product); the remainder split, with only the high-fasting-glucose quartile (70.5% stay prediabetic) plausibly durable (Lancet Global Health 2025, n=76,092) |

### 6.2 Current retention loops — mapped and classified

Of 13 identified loops/surfaces, **zero were classified as a genuine compounding-value loop.**

| Loop | Classification | Why |
|---|---|---|
| Longitudinal insight | Non-functional-in-effect (flag now on, but structurally thin) | Real read of history exists (`lib/coach/insights.ts`), but only prints one static sentence after ≥5 checks and never feeds back into a future verdict |
| Core meal check | Utility used only when uncertain | `buildRevoraPrompt` takes only `{food, a1c, a1cBand}` — the engine is provably history-blind |
| History / "meal memory" | Engagement decoration | A read-only 7-day list; "Check again" re-runs the identical engine call |
| Week strip / streak chip | Engagement decoration (deliberately defanged) | Loss-aversion pressure intentionally removed by design — which also removes the return pressure |
| BAI / weekly progress score | Paywall mechanism | Scores app usage (days checked, actions acknowledged), not health outcome; band copy is 4 static strings identical for every user in a band, week after week |
| Progress page | Paywall mechanism | The file's own code comment concedes it structurally cannot show a week-over-week trend |
| Daily nudge | Paywall mechanism wrapping a real but non-compounding trigger | 4 static strings rotated by day number; zero personalization; zero analytics instrumentation, so it can't even be measured once live |
| Pantry Review | Temporary, siloed | Never reads check history; never informs a future check — two products sharing only an A1C band |

**Structural finding:** the chain breaks at the same link everywhere — *stored → compounding*. Checks are persisted and displayed, but only one code path reads prior checks to change future output, and it is thin even where active. **There is currently no code path by which using Revora more makes Revora better for a given user.**

### 6.3 Counterfactual subscription test

- If meal checks were free forever, would anything still justify paying? Currently: unlimited checks, cross-device history, and a usage scoreboard (BAI) — none of which is a differentiated reason to keep paying once the free/legacy tier's daily cap stops binding.
- If a user learns the ten most common patterns in 30 days, what remains? Per the external evidence, very little — habit automaticity plateaus near that timeframe, and the product has nothing that gets better with use to replace the novelty.
- If general AI gives a similar answer for free, why use Revora? The competitive research agent found GPT-4o already identifies foods from photos at ~93% precision, for free, with improving persistent memory — Revora's structural safety advantages (deterministic clinical routing, fail-closed contract) are real but invisible to a user comparing "did I get a useful answer."
- Would the product be stronger as a time-boxed program? The external evidence leans this way: a fixed 60–90 day "get through the disorientation" product matches the documented decay curves far better than an indefinite subscription, without pretending the underlying need doesn't taper.

### 6.4 Paid-retention score

| Dimension | Weight | Median user | High-glucose subsegment |
|---|---:|---:|---:|
| Frequency of recurring need | 15 | 6 | 10 |
| New value after month 1 | 20 | 2 | 6 |
| Compounding personalization/memory | 15 | 0 | 2 |
| Demonstrable progress (non-clinical) | 15 | 3 | 5 |
| Differentiation/switching resistance | 10 | 3 | 4 |
| Price-to-frequency fit | 10 | 5 | 6 |
| Trust/reliability over time | 10 | 8 | 8 |
| Ethical, non-anxiety habit strength | 5 | 4 | 4 |
| **Total** | **100** | **31** | **45** |

### 6.5 Required direct verdict

**NO — current value is episodic and unlikely to support long-term payment for the median user, with a narrow, unvalidated conditional exception for the persistently high-glucose subsegment.**

- 30/90/180/365-day forecast (all labeled `HYPOTHESIS` — no Revora cohort exists): expect steep early decay resembling comparable photo-logging tools (a large fraction of Day-30 users disengaged by Day-90); a small persistently-symptomatic subsegment may remain engaged past Day-180, but the product currently has no mechanism to identify, serve, or price for that subsegment differently.
- **Minimum cohort experiment needed:** instrument a real signed-up cohort (once magic-link email actually delivers) for 90 days, tracking check frequency, D7/D30/D90 retention, and — critically — whether retained users are disproportionately in the high-A1C, high-frequency-checking segment the external evidence suggests is the only durable one.

---

## 7. Q3 — Pain coverage, missing features, and the one-feature decision

### 7.1 Pain-point coverage (condensed; full matrix inherited and re-verified from the team's own 2026-07-09 painpoint-feasibility analysis, `docs/handoff/2026-07-09-painpoint-feasibility-report.md`)

| Pain | Severity | Current coverage | Gap |
|---|---:|---|---|
| Unpredictable individual carb reactions ("oats fine, pasta wrecks me") | High | Population-level qualitative check only | No personalization of any kind exists in code (confirmed, §6) |
| Guilt / all-or-nothing spirals | High | Partial — keep-most anti-shame framing is real | Reasonably well covered already |
| Fear of food / ED-adjacent restriction | Very high (safety) | Deterministic ED route exists and is well-built | Clinical/counsel-gated for anything further |
| Overwhelm / conflicting advice | High | Strong — this is the core wedge | Largely already solved |
| Cultural foods / uncertain portions | High | **Confirmed 5/30 dangerous false-reassurance rate in simulated panel** | Real, evidenced, unresolved accuracy gap |
| Logging fatigue | High (external evidence: photo-logging drops ~83%/6mo even in a supported RCT) | Not addressed — no lightweight/low-effort mode exists | Real, evidenced by external literature, not yet acted on |
| "Why do I still need this" (post-learning) | Medium-high | Not addressed at all | No graduation, summary, or de-escalation surface exists |
| Sharing with a spouse/clinician | Medium | **Does not exist** | Zero product-loop plumbing (§ Q4) |

### 7.2–7.3 Candidate scoring

| Candidate | Depth of pain (20) | Recurring value ↑ (20) | Paid-retention impact (15) | Evidence of demand (15) | Differentiation (10) | Fit (5) | Safety/claims (5) | Speed to validate (5) | Simplicity (5) | **Total** |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Personal food notes** (non-predictive, user-authored memory attached to history) | 16 | 10 | 7 | 10 | 4 | 4 | 5 | 4 | 4 | **64** |
| Family/caregiver sharing | 12 | 6 | 4 | 6 | 7 | 3 | 4 | 4 | 3 | **49** |
| Quick-options / variety prompts | 10 | 6 | 4 | 8 | 3 | 4 | 5 | 4 | 4 | **48** |
| Travel mode (pause pressure) | 6 | 3 | 2 | 5 | 2 | 3 | 5 | 4 | 4 | **34** |

None clears the 75-point bar required to name a single winner.

**Why personal notes — the strongest candidate — still falls short:** it directly targets the #1 stated competitive objection ("this is generic, not personalized to me") and was already independently scoped by the team's own 2026-07-09 analysis as safe and buildable (confirmed unbuilt via repo-wide grep — zero matches for `personalNote`/`food journal`/`user note`). But it is, by design, a **display** feature — it must never feed back into the verdict to stay inside the current claims boundary, which caps its plausible retention impact well below what the underlying pain (§6, the history-blind engine) actually requires to fix.

### 7.4 Required decision

> **Single feature recommendation: NONE.**

The constraint that matters more than any single feature: **the retention problem is structural, not a feature gap.** Three things outrank building anything new:

1. **A known, evidenced reliability gap** — the cultural-meal false-reassurance rate found in the team's own simulated panel — sits directly on the ICP's own most-cited pain point (cultural/comfort foods) and should be fixed before any new feature is built on top of an engine known to misfire there.
2. **The core loop is commoditized** — the competitive research found the exact "photo/text → glycemic guidance" loop already shipped by a funded, Medicare-distributed competitor (January AI) and replicated for free by general AI assistants. No single Revora feature changes that; only a genuinely different, currently-nonexistent compounding-memory mechanism would, and that would require exactly the clinical/counsel evidence review the product does not yet have.
3. **The need itself may be front-loaded** (§6.1) — if so, the correct fix is a business-model and positioning decision (a time-boxed program, or an explicit "accountability/contact" pivot, per the external evidence's own conclusion that relational contact, not information, is what sustains behavior), not a feature.

---

## 8. Q4 — Ranked top five viral product moments (current, enabled surfaces only)

**Governing finding:** no candidate below is a `PRODUCT-LOOP`. The growth-plumbing audit found **zero share, referral, invite, or clipboard code anywhere in the repository** — not even a decorative button. Every item below is `CONTENT-VIRAL` at best; several are arguably `SHARE-VIRAL` only in the sense that a *founder* could post them, not that a *user* would spontaneously share them. External evidence reinforces this ceiling: only ~7% of people are willing to share health data with technology companies, and disclosure that does happen stays inside closed peer groups, never public feeds (Rock Health 2023; multiple studies in the user-pain research). Score out of 100 per the required rubric; compliance is pass/fail, not a bonus.

| Rank | Product part | Viral type | Score | Why it works | Why it may fail | Best format | Compliant hook | CTA | Test metric |
|---:|---|---|---:|---|---|---|---|---|---|
| 1 | The "healthy food betrayal" verdict reveal (e.g., a carb-heavy breakfast item scored "Be careful") | CONTENT-VIRAL | 68 | Curiosity gap + surprise + directly on-ICP pain; the mechanism (composition-first reasoning) genuinely explains *why* | **Must not use the literal word "oatmeal"** — it currently fails to reproduce (K1); needs a real, verified-live example filmed against the actual deployed app, not the static demo card | 15–25s screen recording, real app, captions on | "I typed in [food] — watch what it says" | Link in bio → `/check` | 3-sec retention ≥75%, save rate ≥1.5% |
| 2 | Photo → editable draft → confirm → calm card | CONTENT-VIRAL | 61 | Directly inoculates against the accuracy-gotcha criticism that hammers every competitor (Cal AI's "27 million calories" incident, Lingo's app complaints); "it drafts, you confirm" is honest and demonstrable | Slower reveal than a pure text check; requires the flag-on, verified-live photo path, not a mockup | 20–30s, include the confirm-tap explicitly | "It drafts. I confirm. Then it answers." | Link in bio | Same as above + unprompted "what app is this" comments |
| 3 | "Keep-most" anti-shame swap on a HIGH verdict ("Enjoy a smaller portion now, same food, gentler pace") | CONTENT-VIRAL | 55 | Directly counter-programs the shame/restriction hostility this exact audience expresses everywhere in the external research; on-brand, differentiated from competitor tone | Quieter, less "stop the scroll" than a surprise reveal; needs framing to land as content, not just UI | Paired with moment #1 as the second beat of the same video | "Nothing's forbidden here" | Same | Comment sentiment, not just views |
| 4 | The honest clarifying question ("Is this plain or sweetened?") | CONTENT-VIRAL | 48 | Demonstrates the "when we're unsure, we say so" trust plank concretely — a real differentiator vs. AI apps this audience has been burned by | Low novelty on its own; works best as a supporting beat in a founder-trust video, not a standalone hook | Founder-to-camera explainer | "I built an app that admits when it doesn't know" | Same | Saves, not views |
| 5 | Out-of-range A1C boundary routing ("this is outside my scope, see a clinician") | CONTENT-VIRAL | 41 | Restraint-as-credibility is rare in this category and matches the audience's stated skepticism of over-claiming apps | Weakest hook of the five — "the app said no" is a harder scroll-stopper than a surprising yes | Short founder clip, not a standalone ad | "An app that turns you away — on purpose" | Same | Comment quality |

**Platform caveat for all five formats:** post these to TikTok as the primary discovery bet. Instagram's Recommendations Guidelines explicitly exclude "content attempting to sell products or services based on health-related claims" from Explore/Reels/Feed recommendation surfaces — this triggers on commercial framing regardless of accuracy, so Instagram Reels cannot serve as a cold-start discovery channel for any of these five, however well they score. Reels/Shorts cross-posting is fine for an account's existing followers, not as a growth bet.

**What's explicitly excluded and why:** the deterministic clinical-route templates (hypoglycemia, eating disorder, urgent symptoms) are genuinely impressive engineering and were tempting to rank, but dramatizing a medical-emergency response for marketing content fails the compliance/truthfulness gate on its face regardless of score — not included, and should not be used as content.

**Strongest current organic share loop:** none exists. **Missing plumbing:** any share button, referral code, or public/attributable report link at all. **Verdict:** Revora has **content-marketing potential only, not product virality**, today.

---

## 9. Q5 — The one first-5,000-user distribution engine

### 9.1 Bottleneck diagnosis

The dominant constraint is **not** insufficient demand (the external literature confirms real, well-documented pain and an active, searching, growing community) and **not** legal/claims gating in the way the team has already assumed (though a new, more serious claims risk was found — see K5). It is a combination of: (a) **low trust/differentiation against free/commoditized alternatives** (§ Q1/competitive research), (b) **a product-availability gap** (email/DNS not yet live, §2), and (c) **missing measurement** (analytics is real code but a dark backend). Distribution should not scale until (b) is fixed and (c) exists — but a small, disclosed, manual-tracking test can start immediately without either.

### 9.2 Distribution-candidate comparison (condensed)

| Candidate | Speed to 100 | Throughput to 5,000 | ICP fit | Trust | Founder fit | Cost | Policy resilience | Verdict |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Reddit, founder-disclosed, value-first | High | Medium (capped by community goodwill/mod tolerance) | Very high — a verified, growing 48k-member community actively asking this exact question | High if disclosed | High (solo-founder-executable) | $0 | Medium — mods actively remove AI-pattern-matched content (Cornell 2025 study) | **Primary** |
| Short-form video (TikTok, not Instagram Reels) | Medium | High ceiling, slow ramp | Medium | Medium | Medium (production time cost) | Low | **Instagram's Recommendations Guidelines explicitly exclude "content attempting to sell products or services based on health-related claims" from Explore/Reels/Feed discovery surfaces** — this triggers on commercial framing, not on accuracy, so it structurally blocks Revora's demo format from ever being a cold-start discovery channel on Instagram regardless of how careful the content is. TikTok's founder-posting path (as opposed to paid/branded content) carries no equivalent exclusion | Secondary/floor — **TikTok specifically, not Instagram, as the video bet** |
| Facebook Groups | Low-medium | Medium | High (best-evidenced audience fit: 74% of 50–64-year-olds use Facebook, 54% daily, Pew 2025) | Medium | Medium | $0 | The DM-lead-magnet tactic specifically is policy-risky (conflicts with comparable health-community rules) | Supporting only, drop the DM step |
| Creator partnerships | Low | Low near-term | Medium | Variable | Low (requires budget + FTC compliance program, not just a clause) | Medium-high | **Categorically prohibited on TikTok itself**, not just FTC-risky: TikTok's Branded Content Policy (last updated April 2026) bans paid/branded posts for "pharmaceuticals, healthcare and medicine products," explicitly naming "nutritionists... telehealth providers" and "weight loss products or services." A live FTC enforcement precedent also exists in the adjacent metabolic-health space (NextMed, $150k, individually-liable founder, Jul 2025) | **Cut, not gate** — the plan's own ≥$500 MRR gate assumed this was a budget question; it is a platform-eligibility question first |
| Pantry Review as acquisition wedge | Medium | Low | Medium | Medium | Medium | $0 (revenue-generating) | **New risk found:** state scope-of-practice law may restrict unlicensed individualized nutrition reports sold nationally | Hold pending counsel |
| Paid search/social ads | Low (fast if funded) | High if funded | High-intent | Low (unproven creative) | Low (budget-gated, and the team's own plan already gates this behind $800 MRR) | Requires spend | **NO VERDICT — genuinely unverified, not just deprioritized.** Google/Meta/TikTok health-ad policy, any certification requirements, and health-vertical CPC benchmarks were never confirmed against primary sources across four research passes on this row. A historical Meta "Personal Attributes" rule barring ads that imply knowledge of a person's health condition may still apply to any ad copy addressed to "you" as someone with prediabetes — flagged as an untested hypothesis, not a finding | Not now (the team's own $800 MRR / Day-75 gate happens to be correct regardless of how this row resolves, but verify the policy *before* the gate opens, not at it) |
| Clinician/DPP referral | Very slow | Low near-term | Very high | Very high | Low (no relationships built yet) | $0 direct, high time cost | Strong long-term, wrong horizon for "first 5,000 fast" | Not for this phase |

### 9.3 Selected primary mechanism

**Reddit, founder-disclosed, value-first engagement in r/prediabetes and directly adjacent subs (r/diabetes_t2, r/PCOS, r/Menopause, r/CGM), with TikTok run in parallel at a minimum floor as the secondary channel.**

- **Precise audience and trigger:** a person who just received an A1C in the 5.7–6.4 range within the last ~6 months, actively posting or reading "just diagnosed, where do I start" / "is [food] okay" threads.
- **The repeatable asset:** genuinely useful, disclosed answers to real live threads — not polished, citation-dense standalone guides (the Cornell 2025 mod-sentiment study found exactly that format pattern-matches what burned-out moderators now remove on suspicion of AI authorship).
- **Why it earns trust:** founder disclosure + zero-mention value-first warm-up + answering the community's own actual questions in its own actual language.
- **Why someone clicks now:** the trigger already exists (their own diagnosis); the founder is answering the exact question they just asked.
- **Activation event:** a completed first check (guest, no login required).
- **Feedback loop:** which comment threads/questions repeat becomes the next video/post topic (the team's own "content engine is also a QA engine" principle is sound and should be kept).
- **User-to-user sharing loop:** none exists today (§8) — this channel is acquisition, not compounding growth.
- **Founder hours/week:** ~10–15 initially (value-first warm-up), scaling only after the 14-day test clears.
- **Tools/budget:** F5Bot (free, confirmed alive) for keyword alerts; GummySearch is confirmed **dead** (stopped accepting signups 2025-11-30) — do not budget for it. $0 cash otherwise.
- **Constraints:** per-subreddit moderator discretion is the real governing rule, not a platform-wide "90/10" policy (which was retired and is no longer Reddit's stated policy, only a surviving community norm); a backup account "activated on death" is textbook ban evasion and should be dropped from the plan entirely, not used.
- **Prerequisite that must be fixed first:** none, technically — this can start today, disclosed and manual-tracked, even before DNS/email are fixed, since it drives to the guest check flow which already works. Analytics being dark (§2) means tracking must be manual (UTM + eyeballing the attribution enum once a user reaches onboarding) until Umami is live.
- **Why faster than the second-best option (TikTok):** Reddit reaches an already-self-selected, already-searching audience today; video requires a production and format-discovery cycle before it reaches anyone.

### 9.4 The 5,000-user math

Definition used (per this audit's default): **5,000 activated users who complete a real first check** (guest, no account required). All rates below are cited external planning ranges or explicitly labeled hypotheses — **no Revora-measured funnel data exists.**

```
qualified impressions (Reddit comment/post views within r/prediabetes + adjacent subs)
  × profile/link click-through rate
  × landing-to-started-check rate
  × start-to-completed-first-check rate
  × weekly asset volume
= activated first-check users / week
```

| Case | Weekly qualified impressions | CTR to link | Landing→start | Start→complete | Activated/week |
|---|---:|---:|---:|---:|---:|
| Conservative | 5,000 | 3% | 25% | 85% | ≈32 |
| Base | 15,000 | 5% | 35% | 85% | ≈223 |
| Upside (a viral-post week) | 40,000 | 8% | 45% | 85% | ≈1,224 |

**Sourcing and confidence:** subreddit size/growth is `EXTERNAL-EVIDENCE` (verified 2026-07-16, redditli.st). Click-through is a `HYPOTHESIS` planning range — no Reddit CTR benchmark for health-adjacent comment links was found by any agent. Landing→start uses the team's own 90-day-plan target (45%) as the **upside** case per the research-distribution agent's explicit instruction to "keep the metric, halve the confidence" — treated here as achievable only in a strong week, not a baseline. Start→complete (85%) is an inference from the single-field, no-login form design, not measured.

**Cumulative ramp (blending realistic weeks, not assuming every week is upside):**

- **Conservative case** (32/week, flat): 5,000 ÷ 32 ≈ **156 weeks (~3 years)** — this case does not credibly hit the target on any useful timeline and should be treated as a floor, not a plan.
- **Base case** (223/week, flat): 5,000 ÷ 223 ≈ **22–23 weeks (~5 months)**.
- **Realistic-upside blend** (1 viral week/month at 1,224 + 3 base weeks at 223): average ≈473/week → 5,000 ÷ 473 ≈ **10–11 weeks (~2.5 months)**.

**Translating to registered/paid (all `HYPOTHESIS`, no Revora data):**

| Stage | Assumed rate | On 5,000 activated |
|---|---:|---:|
| Registered account (requires magic-link email — blocked until Resend/DNS resolve, §2) | 15–25% | 750–1,250 |
| Day-7 retained (of registered) | 15–25% (photo-logging/digital-diabetes-tool analogues, §6/§7) | ~150–310 |
| Paying (of Day-7 retained, trial→paid) | 20–30% | ~30–95 |

**The two most fragile assumptions:** (1) landing→start conversion (45% is the plan's own aspirational ceiling, not measured; a miss here is as likely to be a measurement gap as a message gap, per research-distribution), and (2) Reddit click-through, for which no external benchmark exists at all.

**Capacity ceiling, stated plainly:** Reddit throughput is naturally bounded — you cannot repeatedly saturate the same 48k-member community without triggering moderator fatigue or the "AI slop" pattern-match moderators are now actively primed to remove (Cornell 2025). This is why the engine must expand into adjacent subs and add the TikTok floor as volume grows, exactly as the team's own 90-day plan already sequences it (Phase 2), but at roughly half the posting-volume assumption the original plan used, since that volume was priced against 2023-era organic reach that has since declined materially on every platform except Reddit and TikTok.

### 9.5 Falsifiable 14-day proof test

- **Hypothesis:** disclosed, value-first Reddit engagement in r/prediabetes converts real searchers into completed first-checks at a measurable, non-negligible rate without moderator removal or a ban.
- **Audience/channel:** r/prediabetes primarily, r/diabetes_t2 secondarily.
- **Assets:** ~15–20 genuine comment replies to real live threads + 1–2 value posts (non-promotional in strict subs; disclosed founder identity everywhere the product is named), over 14 days.
- **Format:** conversational, thread-specific replies — explicitly **not** the polished, citation-dense standalone-guide format the plan originally favored, which the Cornell 2025 mod-sentiment study flags as the highest-removal-risk pattern.
- **Instrumentation:** UTM parameters + the existing onboarding attribution question (already built and confirmed live in code) as the numerator; Reddit's own post-view counts (visible to the poster) as a proxy denominator, since Reddit does not expose views to non-admins for comments. **Precondition:** since Umami is not yet live, tracking must be done manually via the attribution enum values reaching onboarding — this is a real, if small, blocker worth fixing before the test, not a "nice to have."
- **Success threshold (set in advance):** ≥30 attributed first-checks over 14 days, zero moderator removals or account actions, at least one unprompted "what app is this?" question.
- **Iterate threshold:** 10–29 attributed first-checks → revise hook/format per the tournament pattern, re-run for another 14 days.
- **Kill threshold:** <10 attributed first-checks **and** zero unprompted product questions → the signal is about message/product/ICP fit, not volume; stop spending founder time on this channel and revisit positioning before trying a different channel.
- **Max time/spend:** 14 days, ~10–15 founder hours, $0 cash.
- **Day-15 branch:** Success → begin Phase 2 of the existing 90-day plan (adjacent subs + TikTok floor) at the revised, lower posting-volume assumption. Iterate → one more 14-day cycle with a reworked format. Kill → do not scale any distribution spend; the finding is that the product/positioning, not the channel, is the blocker (consistent with the Q1/Q2 findings above).

---

## 10. 14-day validation plan and 5,000-user funnel math

(Covered in full in §9.4–9.5 above; this section exists per the required structure and is not duplicated.)

---

## 11. What not to build or do

1. **Do not film or run any acquisition asset using the literal word "oatmeal"** as the example until K1 is fixed and re-verified live — it is the single most promoted claim in the product and it currently fails.
2. **Do not assert "wellness tool, not a medical device"** in any public copy (POST 3 and equivalents) until counsel has reviewed it against FDA's 2026-01-06 revised General Wellness guidance — this is now a live, evidenced legal exposure, not a stylistic choice (K5).
3. **Do not open the Pantry Review "100-direct-asks" gate** before a state scope-of-practice answer exists — a human-authored individualized nutrition report sold nationally is more exposed than the app's automated output, and several states restrict this without a licensed reviewer of record.
4. **Do not use the Reddit "backup account, activated only on death" tactic** — this is textbook ban evasion under current detection methods (IP/device/writing-style/account-graph analysis) and converts a recoverable removal into a permanent loss of the single best channel.
5. **Do not run paid creator/branded partnerships at all, on TikTok, for this product** — this is not merely FTC-risky (though it is: the FTC's own guidance and a July 2025 enforcement action in the adjacent metabolic-health space, NextMed, $150k, founder individually named, both apply) but categorically prohibited by TikTok's own Branded Content Policy (April 2026), which bars paid/branded posts for "pharmaceuticals, healthcare and medicine products," naming "nutritionists... telehealth providers" and "weight loss products or services" outright. Cut this from the plan; do not merely gate it behind an MRR threshold.
5a. **Do not use Instagram Reels as a cold-start discovery channel for any check-demo video.** Meta's Recommendations Guidelines explicitly exclude "content attempting to sell products or services based on health-related claims" from Explore/Reels/Feed recommendation surfaces — this triggers on commercial framing, not on factual accuracy, so being scrupulously honest does not exempt Revora's demo format. Reels is a place to post for existing followers only; TikTok's founder-posting path carries no equivalent exclusion.
5b. **Do not cite the CDC DPP "58% reduction" figure without its actual conditions, and do not imply DPP/CDC-program alignment.** The number is real and current (Knowler et al., NEJM 2002, still cited unchanged by CDC as of 2024-05-15), but it applies to a 2.8-year, coach-led, ≥16-session program with a 5–7% weight-loss goal — not to using an app. The 2024 National DPP Standards explicitly state that "chat bots and AI forums do not" count as program delivery, so no future copy may imply Revora participates in or is equivalent to the recognized DPP. The "ask about a covered DPP referral" comment template also overstates coverage for the plan's actual 40–60-year-old ICP (MDPP is Medicare; real-world referral-to-enrollment nets roughly 2.3% of eligible patients even inside integrated health systems) — keep the sentiment as a goodwill gesture, not a growth-model input.
6. **Do not build any new feature before fixing the cultural-meal reliability gap** — building on top of a known, evidenced accuracy defect compounds the promise/proof gap this audit already found.
7. **Do not treat the simulated dietitian panel, the OpenRouter live-eval numbers, or today's live-smoke test as clinical, legal, or user-value validation** — they are real, valuable engineering evidence and nothing more; the report's own docs are explicit and consistent on this point, and this audit preserves that discipline.
8. **Do not scale short-form video volume to "2 masters/day across 3 channels"** as originally planned — that assumption was priced against 2023-era organic reach, and burnout is a named risk in the team's own plan.
9a. **Do not add a third-party ad-tracking pixel (Meta Pixel, Google Ads conversion tag, or similar) to any Revora landing or signup page before counsel reviews state consumer-health-data law — Washington's My Health My Data Act specifically.** This is a higher-confidence finding (two independent primary reads of the statute agree) with real teeth: Washington is the one state in this research that kept a private right of action, and its statutory chain arguably classifies a cookie ID, IP address, or device identifier collected on a page seeking to serve people looking for health guidance as "consumer health data" — before any meal or A1C is ever entered. This does not appear to implicate Revora's own already-built, first-party, no-PII, closed-allowlist Umami analytics (§3, feat-growth-plumbing inventory), but it would implicate the 90-day plan's stated intent to add PostHog or a paid-ads conversion pixel. Comparable findings for Connecticut, Nevada, Maryland, California, and Rhode Island were reported at only second- and third-hand confidence in this audit and must be independently verified before being treated as fact — they are flagged here, not established.
9b. **Do not deliver lead-magnet checklists via Facebook DM to strangers** — links are blocked in unaccepted Messenger requests (so the mechanic may not even work), it conflicts with the one comparable health-community rulebook found (DiabetesTeam bans requesting contact info outright, with account deactivation on a second offense), and the resulting spam strike removes group-posting first — the exact capability the channel depends on. Keep join-and-answer in Facebook groups; drop the DM step entirely.

---

## 12. Top five decisions/actions, in priority order

| # | Action | Owner | Evidence required | Pass/fail threshold |
|---|---|---|---|---|
| 1 | Fix the oatmeal-reproduction bug (K1) and re-verify every acquisition surface's advertised example against the live app | Engineering | A screen recording of the literal advertised copy producing the literal advertised verdict | Every promoted example reproduces exactly as shown, or the copy is changed to match reality |
| 2 | Route the "wellness tool, not medical device" distribution copy (K5) and the Pantry Review scope-of-practice question to counsel before either ships further | Owner + counsel | Written counsel guidance on both | Counsel sign-off, or the copy/offer is withdrawn |
| 3 | Run the 14-day Reddit proof test (§9.5) with manual attribution tracking | Founder | Attributed first-check count, mod-action count, unprompted-question count | ≥30 attributed first-checks, 0 mod actions |
| 4 | Instrument and run a real 90-day retention cohort once magic-link email is deliverable | Engineering + Owner | D7/D30/D90 retention by A1C band, check frequency by cohort | Confirms or refutes whether only the high-glucose subsegment retains, per §6 |
| 5 | Fix the cultural-meal false-reassurance gap found in the simulated panel (5/30 dangerous false "Clear") before any further distribution spend | Engineering | Re-run of the 240-case (or expanded) simulated panel showing the gap closed, pending eventual real RD/CDCES review | Zero dangerous false-reassurance cases on the cultural-mixed stratum |

---

## 13. Unknowns, counterevidence, and falsification tests

- **The single largest unknown in this entire audit:** there is no real user, no real payment, no real cohort. Every retention, WTP, and virality conclusion here is built from code, a simulated (non-credentialed) panel, and external literature about comparable products — never from Revora's own users. This is stated plainly per the audit's own governing rule: absence of data is a finding, not something to paper over with confident numbers.
- **Counterevidence to the WEAK retention verdict:** the product's safety/trust engineering is genuinely more sophisticated than most direct-response health apps, and the external literature's own contrarian finding (a New Zealand study, §7 sources) found the diagnosis itself is not experienced as traumatic for most people — if Revora's honest, non-alarmist tone is what differentiates it, a real cohort could show better-than-comparable retention specifically because of that tone. Untested.
- **Counterevidence to the "NONE" feature verdict:** if the team is willing to seek the function-specific evidence review the longitudinal-insights gate always contemplated, a genuinely compounding pattern-memory feature (not just a display note) could plausibly score above 75 — this audit did not evaluate that version because it does not exist and was not proposed as a scoped candidate by any current document.
- **Falsification test for Q1:** a real user cohort routinely reporting the same "aha" and cultural-food accuracy the code trace suggests, on their own actual typed meals (not the eval corpus).
- **Falsification test for Q2:** a real 90-day cohort showing retention meaningfully above the comparable-product benchmarks cited here, without the compounding-memory feature this audit found absent.
- **A late, tangential finding worth carrying at its actual confidence level, not flattened:** state consumer-health-privacy law (Washington's My Health My Data Act in particular) may classify basic tracking identifiers on a health-adjacent landing page as regulated "consumer health data" before any meal or A1C is entered — `EXTERNAL-EVIDENCE`, higher confidence for Washington specifically (independently corroborated statutory reads), but only second/third-hand and explicitly unverified for Connecticut, Nevada, Maryland, California, and Rhode Island. This sits outside this audit's five core questions but bears directly on the measurement layer the Q5 distribution engine depends on — see §11.
- **Explicitly unresolved, by design:** paid-advertising health-content policy (Google/Meta/TikTok) was never verified against primary sources — the research process ran out of search budget and reported this honestly as `NO VERDICT` rather than filling it with inference. This is deliberately preserved here as `UNKNOWN` rather than smoothed into a guess, consistent with this audit's own rule that absence of evidence is a finding. It is low-cost today only because the team's own plan already gates paid spend behind $800 MRR and Day 75+; verify before that gate opens, not at it.
- **Falsification test for Q5:** the 14-day Reddit test itself — if it clears the stated threshold, this audit's ~5-month base-case timeline should be revised downward with real data in hand.

---

## 14. Sources and evidence index

**Internal (repo, read directly this session):** `docs/product-marketing.md`, `PRODUCT.md`, `docs/safety/claims-boundary.md`, `docs/safety/copy-ledger.md`, `docs/safety/evidence-pack.md`, `docs/safety/tone-uncertainty-policy.md`, `docs/safety/a1c-band-rubric.md`, `docs/ICP.md`, `docs/Revora_90-Day_Distribution_Strategy.md`, `docs/ops/env-reference.md`, `docs/handoff/2026-07-17-wtp-first-reprioritization-handoff.md`, `docs/handoff/2026-07-17-revora-true-done-audit-remediation-report.md`, `docs/handoff/2026-07-17-owner-risk-full-launch-session-handoff.md`, `docs/legal/owner-risk-launch-decision-5f6abcb.md`, `docs/qa/17-simulated-dietitian-panel-2026-07-16.md`, `docs/qa/18-simulated-240-panel-2026-07-16.md`, `docs/qa/20-photo-tier1-engineering-2026-07-17.md`, `docs/qa/23-launch-live-smoke-2026-07-18.md`, `docs/qa/launch-walkthrough-web.md`, `docs/handoff/2026-07-09-painpoint-feasibility-report.md`, plus direct source reads of `lib/revora/prompt.ts`, `lib/revora/postprocess.ts`, `lib/revora/clinical-risk.ts`, `components/result-card.tsx`, `components/demo-check-card.tsx`, and a local dev-server route probe (free, no model spend).

**Internal (via four parallel Explore agents, file:line cited in their full reports):** acquisition/onboarding/check feature inventory; billing/entitlement/pricing feature inventory; retention-loop classification; growth-plumbing/analytics/feature-flag inventory.

**External (via three parallel research agents, full citations with access dates in their reports, all accessed 2026-07-18):** competitor audit (16 alternatives — Nutrisense, Signos, January AI, Levels, MyFitnessPal/Cal AI, Cronometer, Virta, Omada, Lark, Dexcom Stelo, Abbott Lingo, Nourish, Fay, r/prediabetes, ChatGPT, do-nothing baseline); prediabetes user-pain literature (peer-reviewed sources including JABFM 2016, PMC6848700, BMC Public Health 2022, J Diabetes Research 2025, BMC Nursing 2017, J Acad Nutr Diet 2019, JMIR Diabetes 2023, Obesity Science & Practice 2022, British Journal of Health Psychology 2025, Diabetes Care 2020, Lancet Diabetes & Endocrinology 2024, Lancet Global Health 2025, FTC/CA-OAG enforcement actions, KFF 2024, Rock Health 2023); distribution-channel policy audit (Reddit self-promotion norms and moderator sentiment, GummySearch shutdown, Google zero-click search data, TikTok/Instagram organic-reach benchmarks, FDA General Wellness guidance revision 2026-01-06, Meta Community Standards and Groups Feed ranking, FTC Health Products Compliance Guidance and the NextMed 2025 enforcement action, Pew Research 2025 social media use by age; two addenda closing the initially-pending rows: Knowler et al. NEJM 2002 and current CDC DPP citation practice, the 2024 National DPP Standards' AI/chatbot exclusion, the RTI 2025 MDPP evaluation and a CDC *Preventing Chronic Disease* 2023 referral-funnel study, Meta's Recommendations Guidelines excluding health-commercial content from recommendation surfaces, and TikTok's April 2026 Branded Content Policy prohibiting healthcare/weight-loss branded content — one row, paid health-ad policy, remains open but is non-blocking since the plan already gates paid ads behind $800 MRR).

**Evidence-class discipline maintained throughout:** `IMPLEMENTED` claims are file:line cited; `TESTED` claims cite the specific simulated-panel or E2E artifact and its explicit non-clinical/non-credentialed labeling; `EXTERNAL-EVIDENCE` claims cite a dated external source; `MEASURED-USERS` was not available for any claim in this report and is labeled `UNKNOWN` throughout rather than inferred from UI design or engineering quality.

---

## Conclusion

- `PRODUCT VALUE: CONDITIONAL`
- `PAID RETENTION: WEAK`
- `ONE FEATURE: NONE`
- `CURRENT PRODUCT VIRALITY: CONTENT POTENTIAL ONLY`
- `FIRST-5,000 ENGINE: Reddit, founder-disclosed, value-first engagement in r/prediabetes and adjacent subs, with a TikTok floor as secondary`
- `OVERALL COMMERCIAL VERDICT: PROCEED WITH A NARROW TEST`

The safety and trust engineering underneath Revora is real and, in places, genuinely sophisticated — more so than most of the funded competitors this audit reviewed. But that engineering has not yet been pointed at the two things that would actually make it durable: a compounding memory the current claims boundary doesn't yet permit, and a reliability floor on the exact cultural/comfort foods its own target user cares most about. Until a real cohort test replaces the simulated evidence this report had to rely on, neither retention nor distribution spend should scale past the narrow, cheap, falsifiable tests specified above.

*************************

 What can be done to improve the below two verdicts 
                                                                                                                         
  1. for revora to fully deliver its promise and meaningful value - with 100/100 score  
                                                                                       
  2. to retain paying users long terms - with at least with 75/100 score   
                                                                                                    
                                                                                                                                                                             
                                                                                                                                                                             
  Does Revora deliver its promise and meaningful value? | **PARTIAL — useful but the promise/value gap is material** | 57/100,   
                                              
                                                                                                                                                                             
  | Can it retain paying users long-term? | **NO — current value is episodic and unlikely to support long-term payment**, with a narrow, unvalidated exception for the  persistently high-glucose subsegment | 31/100 median user; 45/100 for the persistently-high-glucose subsegment                                                             

● Direct answer first: literal 100/100 and 75/100 are not honestly reachable through product/engineering work alone — both hit structural ceilings this audit already found
  (the clinical/counsel-gated personalization requirement, and the external evidence that need itself is front-loaded). But there's a concrete, mostly non-gated punch list
  that gets you close. Breaking both down dimension-by-dimension from the rubrics already in the report.

  Q1 — Value score: 57 → realistic ceiling ~88/100

  ┌────────────────────────────┬─────┬─────────────────────────────────────────────────────────────────────────────┬──────────────────────────────────────┬─────────────┐
  │         Dimension          │ Now │                           Action to close the gap                           │               Blocker                │ Realistic   │
  │                            │     │                                                                             │                                      │   target    │
  ├────────────────────────────┼─────┼─────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────┼─────────────┤
  │ Pain severity/frequency    │   9 │ Little to fix here — this is a property of the market, not the product      │ Natural ceiling; can't manufacture   │          11 │
  │ (12)                       │     │                                                                             │ more severe pain than exists         │             │
  ├────────────────────────────┼─────┼─────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────┼─────────────┤
  │                            │     │ Fix K1 (the oatmeal bug); replace the brittle exact-match ambiguity lists   │                                      │             │
  │ Time to first value (12)   │   7 │ with something that generalizes; kill the client/server paywall-mode        │ None — pure engineering              │          11 │
  │                            │     │ divergence so there's never a surprise wall                                 │                                      │             │
  ├────────────────────────────┼─────┼─────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────┼─────────────┤
  │                            │     │ Close the cultural/composite-meal ontology gaps (§4 journey 3) — this is    │ Full close needs the RD panel to     │             │
  │ Incremental insight (15)   │   8 │ the one lever that beats "generic AI" on a provable axis                    │ confirm; partial close is pure       │          12 │
  │                            │     │                                                                             │ engineering                          │             │
  ├────────────────────────────┼─────┼─────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────┼─────────────┤
  │ Actionability/specificity  │   9 │ Same ontology fix (wrong verdict → wrong advice); fix silent photo-draft    │ Shares root cause with above         │          14 │
  │ (15)                       │     │ truncation so advice matches what was actually confirmed                    │                                      │             │
  ├────────────────────────────┼─────┼─────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────┼─────────────┤
  │                            │     │ Fix K1/K2/K3 (a broken flagship promise and copy drift actively cost        │ Panel recruitment (~2-4 weeks        │             │
  │ Trust/honesty (15)         │  11 │ trust); get the RD/CDCES panel moving so "reviewed by licensed dietitians"  │ calendar, already scoped)            │          15 │
  │                            │     │ becomes true                                                                │                                      │             │
  ├────────────────────────────┼─────┼─────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────┼─────────────┤
  │ Coverage of real contexts  │     │ The single best ROI fix in the whole report — expand CARB_FORWARD_TOKENS to │ None near-term; RD sign-off needed   │             │
  │ (10)                       │   4 │  the confirmed blind spots (injera, biryani, pho, dosa, tamales, etc.),     │ for full clinical confidence         │        9–10 │
  │                            │     │ re-run the simulated panel                                                  │                                      │             │
  ├────────────────────────────┼─────┼─────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────┼─────────────┤
  │ Emotional value (8)        │   5 │ Build an honest "why do I still need this" answer for journey 11 instead of │ None                                 │           7 │
  │                            │     │  ignoring it                                                                │                                      │             │
  ├────────────────────────────┼─────┼─────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────┼─────────────┤
  │                            │     │                                                                             │ Full credit requires the             │             │
  │ Repeat value/learning (8)  │   1 │ Ship "personal notes" (already scoped, unbuilt, safe) for partial credit    │ clinical-gated compounding-memory    │         4–5 │
  │                            │     │                                                                             │ capability                           │             │
  ├────────────────────────────┼─────┼─────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────┼─────────────┤
  │ Friction/reliability (5)   │   3 │ Fix iOS voice gap, add textarea maxLength, harden entitlement fail-open     │ None                                 │           5 │
  └────────────────────────────┴─────┴─────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────┴─────────────┘

  Realistic total: ~88/100. The remaining ~12 points require two things this audit flagged as structural, not incidental: the RD/CDCES panel actually closing W-05 clean, and
  a counsel-cleared personalization capability. Claiming 100/100 without those would be exactly the kind of overclaim this audit was built to catch.

  Q2 — Retention score: 31 → 75 is achievable, but not from engineering alone

  ┌───────────────────────────┬─────┬────────────────────────────────────────────────────────────────────────┬─────────────────────────────────────────┬────────────────┐
  │         Dimension         │ Now │                                 Action                                 │                 Blocker                 │   Non-gated    │
  │                           │     │                                                                        │                                         │    ceiling     │
  ├───────────────────────────┼─────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────┼────────────────┤
  │ Frequency of recurring    │   6 │ Limited — the external evidence (habit plateau ~60 days, photo-logging │ Market reality, not fixable             │              9 │
  │ need (15)                 │     │  -83%/6mo) caps this regardless of build quality                       │                                         │                │
  ├───────────────────────────┼─────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────┼────────────────┤
  │ New value after month 1   │     │ Restructure as a time-boxed program with a defined content arc (8–12   │ Full credit still needs compounding     │                │
  │ (20, biggest lever)       │   2 │ weeks, matching the external "useful window" evidence) instead of      │ memory                                  │          12–14 │
  │                           │     │ pretending indefinite sameness is fine                                 │                                         │                │
  ├───────────────────────────┼─────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────┼────────────────┤
  │ Compounding               │     │ Ship personal notes for partial credit; the real fix is qualitative    │ This is the crux blocker — requires the │ 5 (13 with the │
  │ personalization (15)      │   0 │ pattern-memory ("you've checked 3 similar dinners — here's what's      │  same clinical/counsel evidence review  │  gate cleared) │
  │                           │     │ worked")                                                               │ as Q1's ceiling                         │                │
  ├───────────────────────────┼─────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────┼────────────────┤
  │ Demonstrable progress     │     │ Fix /progress (its own code comment admits it can't show a trend) and  │ None — data already exists, no gate     │                │
  │ (15)                      │   3 │ replace the usage-only BAI score with real, honest behavioral evidence │ needed                                  │             11 │
  │                           │     │  computed from the user's actual history                               │                                         │                │
  ├───────────────────────────┼─────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────┼────────────────┤
  │ Differentiation (10)      │   3 │ Follows directly from the accuracy fix (Q1) + notes — a competitor     │ Partial without full personalization    │              7 │
  │                           │     │ can't copy your history                                                │                                         │                │
  ├───────────────────────────┼─────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────┼────────────────┤
  │ Price-to-frequency fit    │     │ Price to the actual usage curve — a cheaper "maintenance" tier once    │                                         │                │
  │ (10)                      │   5 │ the active period ends, instead of one flat price fighting a           │ None                                    │              8 │
  │                           │     │ declining-frequency reality                                            │                                         │                │
  ├───────────────────────────┼─────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────┼────────────────┤
  │ Trust/reliability (10)    │   8 │ Close the RD panel                                                     │ Panel recruitment                       │             10 │
  ├───────────────────────────┼─────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────┼────────────────┤
  │ Ethical habit strength    │   4 │ Add an honest graduation/de-escalation path (checking less isn't       │ None                                    │              5 │
  │ (5)                       │     │ failure)                                                               │                                         │                │
  └───────────────────────────┴─────┴────────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────┴────────────────┘

  Non-gated total: ~67/100 — short of 75. To responsibly cross 75 you need one of two things, not a bigger punch list:

  1. Clear the personalization evidence-review gate so pattern-memory actually feeds back into verdicts (pushes dimensions 2, 3, and 5 up ~8–10 points combined, landing
  around 80–85), or
  2. Redefine what's being measured — reposition as a time-boxed program rather than an indefinite subscription. That's not a cop-out; it's what your own audit's external
  evidence argues is the honest fit, and the rubric's "long-term" framing was built assuming an ongoing subscription in the first place.

  Bottom line: there's a real, mostly-non-clinical-gated path from 31→~67 and 57→~88. The remaining distance to 75 and 100 respectively runs through the same two things
  every other gap in this audit converges on — the RD/CDCES panel actually closing, and a counsel-cleared compounding-memory capability — not a longer feature list. Want me
  to append this as a section to the saved report, or turn it into a standalone build plan?


