# Revora — Direction Validation & Recommendation

**Date:** 2026-07-01 · **Type:** decision document (gates the full-build handoff)
**Method:** internal-doc re-derivation (4 parallel readers) + external accuracy/calibration evidence (cited) + a 31-meal empirical photo-accuracy spike (blind estimator fleet) + adversarial refutation.
**Status of inputs:** codebase verified at `launch-hardening` (text-in checker, no vision code, safety engine in `lib/revora/`); claims-boundary and the 4 guardrails held as fixed constraints.

---

## 1. Recommendation

**Ship the coach (D1) now, exactly as kill-gated in `docs/coach-mvp.md`, with three cheap text-friction mitigations added; re-introduce the camera later only as D5 "photo-assist, confirm-before-verdict" — a draft-writer for the existing text engine, never a verdict-renderer — gated on the coach's Step-2 retention gate passing. Reject D2 (camera-hero) outright. Reject D4 as literally proposed (verdict-when-confident, ask-when-in-doubt): the spike shows an honesty-compatible doubt gate fires on ~71% of real meals, which deletes the friction win the camera exists to deliver, and the residual false-SAFE risk of the ungated slice cannot be bounded at launch-grade confidence.**

**Confidence: HIGH** on the direction split (coach now; no verdict ever rendered on unconfirmed photo perception). **MEDIUM** on D5's parameters (ship timing, draft-acceptance threshold) — those are set as testable gates, not assumptions.

**Evidence-status caveat (hold this doc to the product's own honesty bar):** every input here is synthetic or document-derived — Reddit-mined VOC (not behavior), a simulated red-team, a 31-meal spike run on Claude-family models over recipe-grade photos. **Zero real prediabetics have touched any version of this product.** This is the strongest *pre-launch derivation* available, not validation; the recommendation itself is the cheapest path to real validation, and §6 is where "decisive" becomes "tested."

**Why this over the others (3 sentences).** The evidence separates cleanly: 7 of the 8 pain points are solved by the *guidance and relationship layers* (verdict quality, tone, memory, progress), and the camera touches only the input friction of PP-01 — so the camera is an accelerator, not the value, and building it first optimizes the wrong variable. The spike plus the published record shows photo-only glycemic estimation has a physics problem (invisible sweeteners, sauces, lookalike swaps, portion depth) that no confidence gate can honestly bridge: at the strictness honesty requires, the camera stops being instant for ~7 in 10 meals, and the meals where it stays instant are the ones users least need help with. D5 keeps the owner's actual goal — cut the typing, never compromise honesty — by making the photo *write the description* and the user confirm it, so the verdict always rests on user-confirmed input and the hardened text engine ships unchanged.

**One honest narrowing (from the adversarial pass):** the *friction* advantage of text is weaker than the coach docs assumed — even with perfect recipe-card descriptions, the text arm's own doubt gate fired on 45% of meals, and real freeform descriptions will be noisier, so 45% is a floor. What actually decides D1-over-D4 is the **honesty asymmetry** (a verdict on your own words is shared ground and floor-governed; a verdict on the system's perception is claimed authority it cannot back), plus coverage and build cost — not "typing is fast." In production, either modality's fallback is one bounded question (the engine's ≤1-clarify contract), so the modality war is narrower than both the PRD and the coach docs framed it.

**What this honors from the owner's framing:** the instinct behind D4 is validated by the data — a strict "any hint of doubt → ask" rule *did* prevent every misleading verdict in the spike (0/31 residual). What the data kills is the *mechanism of trusting the gate to decide when a photo-only verdict is allowed*: the gate that is strict enough to be safe is too strict to be fast, and the one time it waved through a perception-based SAFE at confidence 90 (zoodles, meal-17) it was right only because the photo happened to be genuinely distinctive. Confirm-always is the same honesty bar with a better friction trade.

---

## 2. Pain-point coverage matrix

Pain points are PRD §3.2 canonical (the Traceability Matrix uses a different, unreconciled PP-01..15 set — flagged in §7.4). The load-bearing analytical split, now evidence-tested: **which pains are about the decision/input, vs guidance/reassurance/relationship, vs progress.**

| PP | Pain (prevalence, severity) | What actually solves it | D1 coach | D2 camera-hero | D3 hybrid-now | D4 conf-gated camera | D1 + D5 later |
|---|---|---|---|---|---|---|---|
| PP-01 | Nutritional paralysis — "I don't know what to eat" (60%, Critical) | **Decision engine** (verdict+adjustment+swap); input modality affects only the *cost of asking* | Solved; friction = typing (~15–40s; voice/repeat-meal cut to ~5s) | Solved *when trusted*; instant only if ungated | Solved | Solved but instant on only ~29% of meals (spike); rest = photo+interrogation | Solved; photo drafts, ~1-tap confirm |
| PP-02 | Fear of progression (45%, Critical) | **Reassurance + progress + relationship** (calm tone, memory, streaks) | Directly targeted (memory/insight/streak) | Weak at MVP (no memory); BAI was the fix and was fabricated-metric risk | Partial | Not addressed by camera at all | Directly targeted |
| PP-03 | Inadequate medical guidance (55%, High) | **Guidance engine + daily companion** | Solved (structured guidance > "eat better") | Solved per-scan, no continuity | Solved | Solved per-answer | Solved |
| PP-04 | Information overload (40%, High) | **One answer, one action** (already the engine contract) | Solved | Solved | Solved | Solved *except* fallback interrogations add questions back | Solved |
| PP-05 | Loss of food enjoyment (35%, High) | **Permission-first framing, swaps, sequencing** | Solved | **Actively harmed by over-warning:** all 3 spike photo misses were false alarms on low-carb lookalikes (your cauliflower pizza flagged HIGH) | Mixed | Harmed: conservative floors on ambiguous photos → chronic over-warning | Solved (confirm step removes false alarms before verdict) |
| PP-06 | Plateau frustration (25%, Med) | **History + insight** (needs memory) | Step 3 insight | Only via P1 history (not MVP) | Partial | Not addressed | Step 3 insight |
| PP-07 | A1C discouragement (20%, High) | **Progress reframing over time** (within claims boundary) | Streak/week-view (qualitative, compliant) | BAI (superseded; regulatory risk) | Partial | Not addressed | Same as D1 |
| PP-08 | Isolation (30%, Med) | **Relationship/companionship** | Partial ("in your corner daily") | No | Partial | No | Partial |

**Reading:** no pain point is *solved by the camera*; PP-01 is solved by the answer and merely accelerated by input modality; PP-05 is the pain a camera actively damages when it is honest (over-warning) — a point the coach-pivot docs never made and the spike demonstrated. The "camera = friction killer" argument survives only for PP-01's input cost, and §4 shows D5 captures most of that without the honesty cost.

---

## 3. The camera accuracy verdict

### 3.1 External evidence (all cited; full list §7.2)

- **Real-world photo→carb error is 30–44%+.** SNAQ, the best validated diabetes photo app: 5.5 g mean carb error in the lab but **44.3% MAPE on real-world canteen meals** (J Diabetes Sci Technol 2024, N=53 T1D). GPT-4V meal-level carb MAE **33.1 g** (arXiv 2312.08592). ChatGPT-5 image-only calorie MAPE **30.5%**; even with the full ingredient list supplied, carb MAPE stayed **23.5%** (PMC12655113, N=195). Frontier VLM image-only calorie MAE ~166–211 kcal (arXiv 2507.07048, N=806).
- **Portion/volume from a single photo is the hard, unsolved part** — worst on amorphous/mixed foods (soups, curries, casseroles), i.e., ordinary prediabetic dinners (PMC5448987 et al.). GPT-4V portion MAE 54.6 g vs dietitians' 43.6 g.
- **The classification bands are narrower than the error.** The MODERATE band is 8 GL points wide; a 25% carb error on a GL-15 meal is ±3.75 points — routine class flips (arithmetic on Linus-Pauling-Institute band definitions).
- **VLMs are systematically overconfident under exactly the conditions that make food photos hard.** GPT-4V ECE 11.3, Gemini 38.4, both net-overconfident (NAACL 2024, arXiv 2405.02917); confidence stays in the 80–100 range under visual degradation/ambiguity (arXiv 2504.03440). **No published study measures VLM calibration on food specifically — our spike is that measurement.**
- **Every photo→GL competitor carries public accuracy scars:** Glycemic Snap ignored portion edits; LOGI returns different GL for the same meal on different days; January AI predicted 192 mg/dL vs an actual 145; Cal AI's 27-million-calorie candy bar — and Cal AI ($30M ARR) now belongs to MyFitnessPal, which can bolt a GL toggle onto a 20M-food database at will.
- **The counterweight (do not overcorrect):** photo AI ≈ dietitian-level for carb grams and **2.3× better than patients' own estimates** (GoCARB, Nutrients 2018/JDST) — the photo is *useful evidence*, just not *sufficient authority*. And Zeevi 2015 (N=800, Cell) shows large inter-individual glycemic variability for identical meals — so even a perfect estimator could not honestly promise individual outcomes; qualitative bands + conservatism are the only honest output *regardless of modality* (which the engine already enforces).

### 3.2 Our spike (N=31 meals, ground-truth ingredients/portions/source-published carbs; blind vision estimators; method & table in §7.1)

| Metric | Photo-only | Text (known ingredients) |
|---|---|---|
| Risk-class agreement | **28/31 (90%)** | 29/31 (94%) |
| Misses, direction | 3 — **all over-warnings** (false alarms on low-carb lookalikes) | 2 (1 boundary-conservative, 1 GI-table dispute; both gated) |
| Dangerous misses (true MOD/HIGH → said SAFE) | **0** | 0 |
| Confidently wrong (conf ≥70) | **0** | 0 |
| Carb error | median **33%** / mean 84% on reliable-truth subset (n=26); median 38.7% all 31 (traps hit 4–9×) | median 21%, mean 27% (n=26) |
| **Strict doubt-gate fallback rate** (prompt-sensitive point estimate; see §7.3 #6) | **22/31 = 71%** | 14/31 = 45% — *a floor: this arm got perfect recipe-card descriptions* |
| Gate recall on wrong verdicts | 3/3 caught | 2/2 caught |
| Instant-verdict slice (ungated) | 9/31 = **29%**, all correct — but almost all trivially obvious meals (Big Mac meal, bread bowl, steak salad, plain frittatas) | — |
| Retest consistency (13 re-runs) | 11/13 same class; 1 gate flip | — |

**Plain statement of the verdict:**

1. **How often would a photo-based estimate be confidently wrong in a way that misleads a prediabetic?** In our run: never at confidence ≥70 — *when the estimator is explicitly prompted to be humble and a strict doubt gate is enforced*. But the price is that the gate fires on 71% of meals, and the observed zero under-warns at N=31 only bounds the true dangerous-miss rate below ~9.5% (rule of three, 95% CI) — not remotely a launch-grade safety bound for a health product. One ungated SAFE was granted at confidence 90 purely on visual texture (zoodles) — correct this time, structurally indistinguishable from a future false-SAFE on styled real pasta.
2. **Can a strict confidence gate prevent misleading verdicts?** Yes — *at a strictness that returns the friction the camera was meant to remove.* The instant-answer promise survives on ~3 meals in 10, and those are disproportionately the meals (Big Mac, bread bowl) whose answer the user already knows. Honesty and instant-ness are directly at war; you can pick either, not both.
3. **Where photos fail, they fail on exactly Revora's signature cases.** The "healthy food betrayal" foods (smoothies — liquid base invisible; oatmeal — sweetener invisible; parfaits; sauce-glazed bowls) and the swap-foods Revora itself recommends (cauliflower rice, zoodles, cauliflower crust) are the cases where the photo either interrogates or false-alarms. A camera that flags your cauliflower pizza as HIGH (spike meal-08: estimated 32 g carbs vs true 3.4 g) punishes the exact behavior the coach teaches — and over-warning is not "safe": it feeds PP-05 (food fear) and erodes the trust that is the entire moat.
4. **The photo is a good *reporter* and a bad *judge*.** Dish-family identification was right in 29/31 drafts, with the model's own doubt notes correctly naming what it couldn't see. That is precisely the profile of a useful draft-writer for a confirm step — and of an unsafe autonomous verdict-renderer.

---

## 4. Recommended input model (concrete spec)

### 4.1 Now (D1 coach, text-first) — how a user gives Revora a meal

1. **Type it** (existing flow, 160-char description + A1C, unchanged engine contract: SAFE/MODERATE/HIGH, ≤1 clarifying question, ambiguous → MODERATE floor, carbs-only → floor, upper-band → no SAFE on uncertain carbs).
2. **Say it** — add browser voice dictation (Web Speech API / native keyboard dictation; ~zero build cost on the PWA) → same text path. Cuts input to ~5–10 s at the meal.
3. **Repeat it** — once localStorage memory exists (coach Step 1), "same as yesterday's breakfast" / favorites list = 2-tap re-check. **Memory makes text input cheaper every week; modality friction is not static.** This is also the honest answer to dining-out repetition (ICP §5.2).

Epistemic frame (this is why text is honesty-cheap): the verdict is rendered *on the user's own description* — "based on what you told me" is shared ground, and the engine's uncertainty floors already govern under-description. The system never claims to know what it wasn't told.

### 4.2 Later (D5 photo-assist) — ship only when ALL of:
- Coach **Step-2 gate passed** (nudge lifts D7 return — the loop is worth accelerating input into);
- **Counsel has answered** counsel-brief Q1 (what pushes across the SaMD line) for an imaging input; no camera marketing before that;
- **Pre-ship eval passed** (§6.2).

*(Consistency note from the adversarial pass: the counsel gate is NOT camera-specific. Coach Step 3 — personalized longitudinal insights over tracked meal history — is arguably closer to the SaMD line than a one-shot qualitative check, and gets its own counsel gate in §6.1.)*

**The D5 contract (the input model):**
1. User snaps a photo. The vision model produces a **draft description, not a verdict**: dish name, ingredient list, portion in household measures, each rendered as editable chips — plus its doubt list ("can't tell if the yogurt is sweetened") pre-converted into the highlighted chips to check.
2. **Confirmation is unconditional — and class-critical doubts are not blanket-acceptable.** One tap accepts an undisputed draft; but any chip the model itself flagged as class-changing (sweetened-or-not, which-noodle, portion on a carb-dense dish) must be explicitly resolved — it cannot ride through on the accept-all tap. This is the defense against rubber-stamping: a hungry user tap-confirming a wrong draft would otherwise silently convert the system's bad perception into "the user's confirmed statement," and the honesty guarantee would be fictive.
3. The confirmed description is submitted to the **existing text engine unchanged** (`lib/revora/service.ts` path: precheck → prompt → floors → postprocess). The verdict's provenance is always a user-confirmed description; every result can truthfully say "based on what you confirmed."
4. **Portions are never silently guessed.** The portion chip is always present and always confirmable; an unconfirmable portion (batch photo, buffet) keeps the ambiguity flag → the MODERATE floor governs, exactly as for vague text today.
5. **No numeric output surfaces** (no GL numbers, no carb grams in the UI) — qualitative classes only, per claims-boundary. The draft's internal numbers are for the engine, not the user.
6. Copy rule: the camera is "the fast way to fill in the form," never "AI that reads your meal." No accuracy claims anywhere, per the positioning lock.

Why this beats D4's gate mechanically: D4 at honest strictness = photo + *open-ended interrogation* on 71% of meals (compose an answer ≈ typing anyway). D5 = photo + *closed-choice confirmation* on 100% of meals (~1 tap when the draft is right, which the spike's 29/31 dish-ID rate and 60%+ chip-accept target make plausible). D5 has strictly better worst-case honesty (no perception-only verdicts exist at all) and better expected friction.

---

## 5. What NOT to do (the misleading traps, each observed in evidence)

1. **Never render any verdict — including SAFE — on photo-only input.** SAFE is the dangerous one: a false SAFE is the direct harm case, and our zero-observed under-warn rate is statistically compatible with ~1-in-10. (Spike §3.2; VLM overconfidence literature.)
2. **No numeric precision theater.** No GL numbers, carb grams, mg/dL, spike percentages, or "your meal scored 14" — banned by claims-boundary and refuted by ±33% median error. Qualitative classes only.
3. **No silent portion assumptions.** Glycemic Snap's portion-ignored reviews show this failure is *noticed* and punished publicly. Portion is confirmed or the ambiguity floor governs.
4. **No "AI-powered" lead, no accuracy marketing** ("most accurate," "precise," "clinically proven") — locked already; the spike adds the substantiation angle: an 85%-accuracy claim would be an FTC-substantiation liability (Feasibility §5.2) that our own N=31 could not support.
5. **No trusting the confidence gate as the safety mechanism** — calibration was good *in our prompted setup*; the literature says it does not transfer by default; confirmation is the mechanism, confidence only tunes UX.
6. **No camera-first build or marketing before the coach retention gates pass** — sequencing lock, and the spike removes the last reason to revisit it.
7. **Don't over-warn as a "safe" default in the product UX.** Chronic false alarms on the user's own swap-foods (cauliflower crust flagged HIGH) attack PP-05 and the honesty moat from the other side. The confirm step exists to prevent both directions of error.
8. **Don't let "reversal" copy resurface** (3 lines still flagged in `Revora_Brand_Positioning_v2.md` L240/287/295, unresolved for counsel) and don't ship coach Step 4 without the privacy/data-safety lockstep update (stateless promise breaks at the backend).

---

## 6. Validation plan + kill criteria

### 6.1 Before/while building D1 (cheapest first)
1. **Text-friction test (validates the one unproven load-bearing claim "text works").** Instrument the current form: time-to-submit, abandonment, completion on mobile; ship voice dictation + measure share who use it. Additionally, **re-run the spike's text arm with freeform, memory-quality descriptions** (no recipe card) to bound real-world text fallback and accuracy — the 45%/94% text numbers in §3.2 are a best-case ceiling. *Kill signal:* if median time-to-answer >60 s or form abandonment >40% on mobile after voice ships, input friction is a real adoption blocker → pull D5 forward (still confirm-before-verdict, never D4).
2. **Coach Step 1–2 gates (already defined in coach-mvp.md, unchanged):** D1/D7 return after localStorage memory + streak; nudge lift on D7. **Instrument the denominators** — PWA install rate and notification opt-in rate alongside the D7 lift, because the opt-in cliff (two-step permission on iOS, 40–65 demographic) makes the nudge cohort self-selected; a "pass" measured only on opted-in survivors can be false. *Kill:* no return → coach thesis dead; do NOT reach for the camera as a rescue — the spike shows it isn't one.
3. **Step-3 counsel + shame-check gates (new, from the adversarial pass):** (a) put the already-open SaMD counsel question to the *insight feature specifically* before Step 3 ships — personalized longitudinal inference over meal history is closer to the device line than the one-shot checker; (b) user-test actual insight copy with 5–10 target-demographic prediabetics watching specifically for **shame/surveillance reactions** ("the app is flagging my failures") — the streak/insight mechanic is the habit-tracker playbook this audience fled, and copy tone alone may not defuse it. Insights must read forward-permission ("breakfast is where a swap helps most this week"), never backward-judgment.
4. **Production-path consistency check:** re-submit identical meal descriptions N=50 through the live `/api/check` path and measure class flip-rate. The spike saw ~15% class instability on bare repeat queries (2/13 retests flipped); the shipped engine must be measured, not assumed stable, before any verdict is treated as authoritative UX.
5. **Fake-door camera demand probe (optional, small cohort):** "📷 Snap instead (coming soon)" button; measure tap-rate at the moment of meal entry. Cheap, quantifies how much users *want* photo input before any vision code is written.
6. **Step 4 price-ladder** ($6.99/$9.99/$12.99) exactly as specced; WTP remains hypothesis-grade until then.
7. **Standing competitive trigger (no pre-launch mitigation exists):** if MyFitnessPal/Cal AI ships a prediabetes mode, the coach is threatened at least as much as the camera would be — MFP already owns meal history, habit loop, and a photo pipeline. Revora's only durable defenses are the prediabetes-exclusive identity and the honesty position MFP's calorie-brand can't credibly copy. Monitor; revisit positioning within 30 days of such a launch.

### 6.2 Before shipping D5 photo-assist
- **100-meal blind eval** on user-grade phone photos (not recipe photography), production model + production prompt: require **(a) zero under-warned verdicts after the confirm flow** with a dietitian-graded reference, **(b) draft accepted-without-edit ≥60%**, **(c) median portion error after confirmation ≤25%**, **(d) draft dish-family ID ≥90%**. Fail any → don't ship; re-run quarterly (models drift).
- **Silent-error-passthrough test (the metric that catches rubber-stamping):** moderated usability sessions where some drafts are deliberately wrong; measure the rate at which users confirm a wrong draft *without reading it* (wrong draft + unedited + user can't recall what it said). Raw accept-rate cannot distinguish accurate drafts from rubber-stamped wrong ones — this test can. Ship bar: silent passthrough on class-critical chips ≈ 0 (the forced-resolution UI in §4.2 exists to make this structurally true; verify it works with real, hungry, impatient users).
- **Counsel Q1 answered** for the imaging modality; Play data-safety and privacy docs updated in lockstep.
### 6.3 After D5 ships (kill criteria)
- Dogfood + first-cohort audit: if **≥2% of confirmed verdicts are class-wrong** against dietitian grading, or draft-accept falls below 40% (users fighting the drafts = anchoring risk), pull the feature behind the flag and return to text.
- Same-meal consistency: re-submission of an identical confirmed description must be deterministic-class (engine is; watch the draft layer).

---

## 7. Appendix

### 7.1 Spike method & full per-meal table

**Design.** 31 real meals with source-published per-serving carbohydrates/fiber and known ingredients+portions: 22 recipe-site meals (Skinnytaste, Budget Bytes, ADA Diabetes Food Hub, Wholesome Yum, Cookie+Kate, Spend With Pennies) across 4 buckets (A clear-low-carb, B clear-high-carb, C invisible-carb traps, D lookalike swaps), 5 chain items (Chipotle bowl summed from the official nutrition PDF, Starbucks Classic Oatmeal, Big Mac meal, Panera bread bowl, Subway 6" turkey), 4 paired lookalike traps (cauliflower vs brown fried rice; zoodles vs whole-wheat spaghetti). Images downloaded, EXIF-stripped, re-encoded ≤1024px, blind-renamed `meal-NN`. Ground truth: available carbs (total − fiber) × carb-weighted meal GI (Atkinson 2021 tables; per-meal GI documented) → GL; classes SAFE <10 / MODERATE 10–19.9 / HIGH ≥20; meals within ±3 GL of a band edge tagged `boundary` (7/31). **Estimators:** one fresh, blind vision agent per meal (Claude Fable 5 family) given only the image path and a rubric adapted from `lib/revora/prompt.ts` semantics; forced-schema output: ingredients, portion, carbs, GL, class, confidence 0–100, and a strict-gate decision ("ANY doubt that could plausibly change the class → ask"). Text-path agents received the true ingredients+portions as a ceiling condition. 13 photo re-runs measured consistency. **Raw data (manifest, all 75 estimates, retests) preserved at `docs/validation-spike-2026-07-01-data.json`** for re-scoring and for designing the §6.2 pre-ship eval.

**Headline numbers** are in §3.2. Per-meal (\* = boundary; conf = self-reported; GO = ungated verdict, ask = gate fired; ✓/✗ vs truth):

| # | Meal | Bucket | True GL | True class | Photo: class/conf/gate | Text: class/conf/gate | Photo carbs est vs true |
|---|---|---|---|---|---|---|---|
| 01 | Whole Wheat Pancakes, banana + syrup | D | 25.1 | HIGH | HIGH✓ 78 GO | HIGH✓ 50 ask | 105 vs 37.5 |
| 02 | Baked Ziti (plated w/ garlic bread) | B | 28.1 | HIGH | HIGH✓ 82 GO | HIGH✓ 55 ask | 85 vs 51 |
| 03 | Asparagus Frittata | A | 0.6 | SAFE | SAFE✓ 85 GO | SAFE✓ 93 GO | 4 vs 4 |
| 04 | Creamy Mushroom Soup | C | 7.0* | SAFE | MODERATE✗ 45 ask | SAFE✓ 60 ask | 20 vs 14 |
| 05 | Homemade Waffles | B | 29.6 | HIGH | HIGH✓ 72 ask | HIGH✓ 60 ask | 65 vs 39 |
| 06 | Oatmeal, strawberries + fruit spread | C | 13.2 | MODERATE | MODERATE✓ 45 ask | MODERATE✓ 75 GO | 32 vs 24 |
| 07 | Cauliflower Fried Rice (DFH) | D | 1.5 | SAFE | SAFE✓ 50 ask | SAFE✓ 88 GO | 9 vs 6 |
| 08 | Cauliflower Pizza Crust Slice | D | 1.0 | SAFE | **HIGH✗ 45 ask** | SAFE✓ 85 GO | **32 vs 3.4** |
| 09 | Coconut Chicken Rice Bowl | B | 28.1 | HIGH | HIGH✓ 65 ask | HIGH✓ 65 GO | 55 vs 38.5 |
| 10 | Teriyaki Salmon Rice Bowl | C | 42.8 | HIGH | HIGH✓ 72 ask | HIGH✓ 65 ask | 55 vs 59.5 |
| 11 | Spaghetti Squash Crust Pizza | D | 3.8 | SAFE | SAFE✓ 50 ask | SAFE✓ 60 ask | 9 vs 12.5 |
| 12 | Creamy Lentil Vegetable Soup | C | 9.3* | SAFE | **HIGH✗ 45 ask** | MODERATE✗ 50 ask | 45 vs 29 |
| 13 | Superfood Smoothie | C | 12.5* | MODERATE | MODERATE✓ 50 ask | MODERATE✓ 55 ask | 24 vs 24 |
| 14 | Grilled Balsamic Steak + arugula | A | 0.6 | SAFE | SAFE✓ 88 GO | SAFE✓ 90 GO | 6 vs 2 |
| 15 | Blueberry Lemon Yogurt Parfait | C | 6.7 | SAFE | SAFE✓ 55 ask | SAFE✓ 85 GO | 14 vs 19 |
| 16 | Antipasto Salad | A | 1.8 | SAFE | SAFE✓ 58 ask | SAFE✓ 80 GO | 10 vs 6 |
| 17 | Zucchini Noodles w/ Pesto | D | 1.2 | SAFE | SAFE✓ **90 GO** | SAFE✓ 93 GO | 7 vs 6 |
| 18 | Oven Roasted Potatoes | B | 30.4 | HIGH | HIGH✓ 50 ask | HIGH✓ 62 ask | 26 vs 38 |
| 19 | Air Fryer Meatball Sub | B | 26.2 | HIGH | HIGH✓ 65 ask | HIGH✓ 65 ask | 52 vs 37.5 |
| 20 | Grilled Tuna over Arugula | A | 0.7 | SAFE | SAFE✓ 78 ask | SAFE✓ 96 GO | 5 vs 2.4 |
| 21 | Asparagus & Swiss Frittata | A | 2.4 | SAFE | SAFE✓ 90 GO | SAFE✓ 92 GO | 7 vs 8 |
| 22 | Shirataki Noodles, cream sauce | D | 0.5 | SAFE | SAFE✓ 45 ask | SAFE✓ 88 GO | 18 vs 3.4 |
| 23 | Chipotle Chicken Burrito Bowl | CHAIN | 34.8 | HIGH | HIGH✓ 50 ask | HIGH✓ 85 GO | 48 vs 58 |
| 24 | Starbucks Classic Oatmeal (cup) | CHAIN | 13.2 | MODERATE | MODERATE✓ 35 ask | MODERATE✓ 72 GO | 30 vs 24 |
| 25 | Big Mac Meal (med fries + Coke) | CHAIN | 91.7 | HIGH | HIGH✓ 90 GO | HIGH✓ 95 GO | 120 vs 141 |
| 26 | Panera Broccoli Cheddar Bread Bowl | CHAIN | 74.7 | HIGH | HIGH✓ 90 GO | HIGH✓ 94 GO | 125 vs 141 |
| 27 | Subway 6" Turkey, 9-grain wheat | CHAIN | 21.0* | HIGH | HIGH✓ 58 ask | HIGH✓ 50 ask | 42 vs 35 |
| 28 | Cauliflower Fried Rice (ST, pair-low) | TRAP | 2.8 | SAFE | SAFE✓ 50 ask | SAFE✓ 85 GO | 12 vs 8 |
| 29 | Fried Brown Rice (pair-high) | TRAP | 26.5 | HIGH | HIGH✓ 60 ask | MODERATE✗ 55 ask | 58 vs 39 |
| 30 | Zoodles & Turkey Meatballs (pair-low) | TRAP | 6.3 | SAFE | SAFE✓ 48 ask | SAFE✓ 62 ask | 18 vs 18 |
| 31 | WW Spaghetti & Meatballs (pair-high) | TRAP | 21.3* | HIGH | HIGH✓ 78 GO | HIGH✓ 65 ask | 72 vs 48.5 |

**Notable single results.** meal-25/26: gate logic worked *correctly* in the confident direction — the estimator saw the invisible soda but reasoned the class couldn't change, so it didn't ask (the right behavior). meal-08: the signature failure — cauliflower crust read as wheat crust at 9.4× true carbs (gated, but a D2-style product would have shown HIGH). meal-17: SAFE at conf 90, ungated, on visual texture alone — right here, unbounded in general. Retest: 11/13 same class; meal-06 MODERATE→HIGH and meal-12 HIGH→MODERATE flips (both gated both times); meal-31 gate flipped run-to-run — the LOGI "same meal, different answer" complaint reproduced at ~15% for anything not locked behind confirmation.

**Limitations (owned):** N=31; estimators are Claude-family (production stack is OpenAI — our numbers matched published GPT-4V/4o/5 results, but re-run §6.2 on the production model); recipe/pro photos likely *flatter* photo accuracy vs user phone pics; ground-truth GI assignment carries ±1-class judgment near boundaries (7 boundary meals tagged; both text "misses" are defensible as GI-table disputes); 5 batch photos have normative-portion ambiguity (excluded from reliable-MAPE); MODERATE class thin (3/31) because the honest GL math makes MODERATE a narrow band; calibration result (+20 gap, zero confident-wrong) is *prompted-humility* calibration and must not be assumed to transfer to any default prompt.

### 7.2 External sources (load-bearing)
- SNAQ lab 5.5 g carb error: JMIR mHealth 2020 · SNAQ real-world 44.3% vs human 71.0% MAPE: Baumgartner et al., J Diabetes Sci Technol 2024, DOI 10.1177/19322968241264744 · SNAQ RCT: eClinicalMedicine 2025 (PIIS2589-5370(25)00470-5)
- GoCARB ≈ dietitians (MAE 14.8 g vs 14.9 g): Rhyner et al., Nutrients 2018 (PMC6024682) · GoCARB 12.28 g vs patient 27.89 g: PMC4880742
- GPT-4V dietary assessment (carb item MAE 12.3 g, meal 33.1 g; portion MAE 54.6 g): arXiv 2312.08592 · ChatGPT-5 image-only MAPE 30.5% / +ingredients carb MAPE 23.5%: PMC12655113 · multi-VLM controlled-feeding benchmark: arXiv 2507.07048 · Nutrition5k baselines (~26% cal MAPE; olive-oil dishes 52%): google-research-datasets/Nutrition5k, PMC10706621
- Portion/volume single-image struggles, amorphous-food worst-case: PMC5448987, PMC5035274, PMC4152011
- VLM overconfidence: arXiv 2405.02917 (NAACL 2024; GPT-4V ECE 11.3, Gemini 38.4), arXiv 2504.03440, 2603.26769; calibration-fix literature as evidence of unsolved problem: arXiv 2604.09529, 2504.14848
- GL bands: Linus Pauling Institute (lpi.oregonstate.edu) · GI tables: Atkinson et al., AJCN 2021 · Individual variability: Zeevi et al., Cell 2015; GI reproducibility intra-individual CV 33–80%: Diabetes Care 30(6):1412, PMID 2760355
- Competitor accuracy scars: Cal AI reviews (fuelnutrition.app, eesel.ai; "27 million calories"), Cal AI→MFP acquisition (TechCrunch 2026-03-02), January AI Trustpilot (192-predicted vs 145-actual), Glycemic Snap App Store reviews (portion edits ignored), LOGI App Store (same meal, different GL)
- Regulatory: FTC Health Products Compliance Guidance 2023; FTC v. Cerebral (2024), v. BetterHelp (2023); Operation AI Comply (2024–) — no AI-nutrition accuracy case yet = live, untested exposure, not a green light; FDA General Wellness guidance (2016) + counsel-brief Q1 (unanswered for imaging)

### 7.3 Adversarial refutation (run 2026-07-01, independent skeptic agent with access to the raw artifacts)

The skeptic re-read the primary docs, re-ran the scoring script against the raw spike data, and returned 10 ranked objections. None flipped the recommendation; five changed this document. Disposition:

| # | Objection (severity) | Disposition |
|---|---|---|
| 1 | "Text is low-friction/safe" was never measured; the text arm used recipe-card input, and even so its doubt gate fired 45% — a floor for real freeform input (**WOUND, near-KILL for the friction argument**) | **Accepted.** §1 now states the honest narrowing: D1-over-D4 rests on the honesty asymmetry + coverage + cost, not typing speed. Freeform text re-run added to §6.1.1. |
| 2 | Counsel gate inconsistent — Step-3 longitudinal insights are closer to the SaMD line than the camera draft (**WOUND**) | **Accepted.** Step-3 counsel gate added (§6.1.3a); "D1 regulatory clean" claim withdrawn in favor of per-feature gating. |
| 3 | D5's honesty guarantee is defeated by rubber-stamped confirmations; the ≥60% accept metric can't detect it (**WOUND**) | **Accepted.** Spec changed: class-critical chips cannot ride the accept-all tap (§4.2.2); silent-error-passthrough test added as a ship bar (§6.2). |
| 4 | MFP/Cal AI threatens the coach at least as much as the camera (**WOUND**) | **Accepted as standing risk** — no pre-launch mitigation exists; monitoring trigger added (§6.1.7). Defense is the brand position MFP can't copy, not the feature set. |
| 5 | Streaks/insights replicate the surveillance-judgment mechanic this audience fled (**WOUND**) | **Accepted.** Shame-check user test added before Step 3 (§6.1.3b); insight copy constrained to forward-permission framing. |
| 6 | The 71% fallback is prompt-wording-sensitive (**WOUND on precision**) | **Accepted on precision, rejected on conclusion** — the skeptic itself verified that tuning can't merge the disjoint sets (confident slice ≈ meals nobody needs help with). Number now reported as prompt-sensitive; multi-wording re-run listed under §6.2 eval design. |
| 7 | Class-flip instability on identical re-queries (~15% in retests, incl. one "confident" meal's gate flipping) applies to the shipped text engine too (**SCRATCH/WOUND**) | **Accepted.** Production-path consistency check added (§6.1.4). |
| 8 | iOS PWA push opt-in cliff → Step-2 gate can pass on survivors only (**SCRATCH**) | **Accepted.** Denominators added to the gate instrumentation (§6.1.2). |
| 9 | Median carb error 33% (briefing) vs 38.7% (raw) (**SCRATCH**) | **Reconciled** — 38.7% is all 31 meals; 33.3% is the reliable-ground-truth subset (n=26, batch-photo meals excluded). Both now reported (§3.2, §7.1). |
| 10 | All evidence is synthetic; "decisive" must not read as "validated" (**SCRATCH, meta**) | **Accepted.** Evidence-status caveat added to §1. |

Attacks the skeptic raised and killed itself (recorded so they aren't re-litigated): "trap-heavy meal set is unrepresentative" (trap meals ARE the decision-moments Revora exists for); "just tune the gate looser" (see #6); "the 3 over-warns are over-weighted" (over-warning is the intended failure direction of a safety-floored system — though §2/PP-05 records its real product cost).

### 7.4 Internal-doc corrections surfaced during validation (fix before external use)
- Traceability Matrix PP-01..15 ≠ PRD §3.2 PP-01..08 (two incompatible taxonomies coexist).
- "96 million prediabetics" survives in Brand Positioning §14 and Amendment 8 despite the "corrected everywhere" banner (CDC: 115.2M).
- PRD §7.8 accuracy figures ("Diabot 74%", "Gothenburg 47.9% MAPE") are not tied to bibliography entries — treat as unverified; our external evidence base (§7.2) supersedes them for decision purposes.
- 3 "reversal" marketing lines still awaiting counsel (Brand Positioning L240/287/295).
- The coach-first direction had never received feasibility scoring equivalent to the camera plan's 5-dimension audit — this document plus the coach kill-gates now constitutes that check.
