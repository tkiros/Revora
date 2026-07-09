# 2026-07-09 Pain-Point Feature Feasibility Report

## Executive Recommendation

Revora should not try to solve the user's whole metabolic life. The buildable near-term product lane is: **qualitative checking, personal notes, gentler loops, and simple food literacy inside the claims boundary.** Anything that predicts a user's glucose response, interprets labs, treats disordered eating, or acts like a CGM replacement must be declined or routed through counsel and clinical review.

Priority split:

- **Eng-buildable after launch:** personal food notes, quick-options ideas, variety prompts, travel/no-streak mode, and ingredient/label literacy.
- **Clinical/counsel-gated:** food-fear and ED-aware off-ramp, underweight/ARFID guardrail, any safety copy that could influence restriction.
- **Decline as product scope:** glucose/A1C prediction, lab interpretation, diagnosis/treatment/reversal language, exact GI/GL or mg/dL claims, CGM replacement behavior.

This report uses the raw target-audience file directly plus the launch-audit pain-point matrix. The raw file contains personal identifying content; this report quotes only the minimum necessary non-identifying snippets.

## Product Framing And Engineering Boundary

**Office-hours judgment:** the strongest user pain is not "I need more numbers." It is "I do not trust generic advice because my body feels different, and the mental load is exhausting." The useful product opportunity is to reduce uncertainty without pretending Revora can know the user's personal glucose curve.

**Plan-eng-review judgment:** the current architecture can support several companion surfaces without touching safety-frozen engine files:

- result/history UI additions,
- encrypted signed-in storage,
- static or model-assisted idea banks,
- profile flags such as travel mode,
- copy-ledger additions and safety tests.

The architecture should not make model verdicts user-specific unless the claims boundary is changed by counsel. Personalization can be recorded as **user-authored notes** and shown back as memory, not used as a predictive engine.

## Necessity x Feasibility Matrix

| Pain point | Necessity evidence | Current coverage | Feasible inside boundary? | Est. cost | Recommendation |
|---|---|---|---|---|---|
| T1 - Unpredictable individual carb reactions | Highest volume and high intensity. Raw voice includes individual contradictions such as oats vs pasta at `/home/tefera/Desktop/Various_files/target_audience_questions.md:22` and "I can't have rice" at lines 33-39. | Partial. Revora gives population-level qualitative checks by food and A1C band, not personal prediction. | **Yes, but only as non-predictive personal notes.** Do not alter verdicts, forecast glucose, import CGM, or say "safe for you." | Surfaces: result/history note editor and recall chip. Data: encrypted note table/column. Model: none. Deps: none. | **Prototype/validate first.** Smallest honest version: "Your note on this food" attached to history. Copy-ledger rows: `personal-note-prompt`, `personal-note-recall`, `personal-note-boundary`. Claims check: notes are user-authored memory, not Revora prediction. |
| T2 - Guilt / all-or-nothing | High intensity. Users describe shame and spirals around food decisions at lines 43-59, 79-86, and 163-170. | Partial to strong. Current result cards use "general guidance" disclaimers, "keep most" framing, and non-judgmental language. | **Yes, limited.** Repair-oriented copy and a "next meal is a reset" moment are safe if not medical advice. | Surfaces: result card, history empty/error states. Data: none. Model: none. | **Build after launch.** Add a small non-punitive repair pattern. Copy-ledger rows: `repair-copy`, `no-shame-history-empty`. Claims check: no treatment/reversal promise. |
| T3 - Fear of food / ED-adjacent restriction | Very high safety intensity. Raw voice includes "this shit is giving me an eating disorder" and fear/hunger language at lines 221-248. | Weak. Disclaimers help but a "Hold off" verdict can reinforce restriction in vulnerable users. | **Partly, but clinical/counsel gated.** Engineering can build an off-ramp and gentler mode; it cannot author ED safety guidance alone. | Surfaces: onboarding safety screen, result de-escalation, support/off-ramp page. Data: ideally minimal; avoid storing sensitive ED status unless necessary and consented. Model: none. | **Clinical/counsel-gated.** MVP after review: "If checking makes eating feel scary, pause Revora and talk to a qualified professional." Copy-ledger rows require clinical/counsel approval. Claims check: no diagnosis, treatment, or medical advice. |
| T4 - Overwhelm / conflicting advice | High volume. Users describe contradictory advice and decision fatigue at lines 118-125 and 138-148. | Strong. This is Revora's core: one qualitative verdict plus short why/next step. | **Yes, but mostly already covered.** Avoid adding complexity that recreates the problem. | Surfaces: onboarding and check result microcopy. Data/model/deps: none. | **No separate feature now.** Keep improving clarity through copy tests. Copy-ledger row only if new copy is added. |
| T5 - Convenience pressure | Medium to high. Time pressure around work/school appears at line 75. | Partial. Voice and photo reduce input friction, but Revora does not offer quick meal ideas. | **Yes.** A lightweight "quick options" surface can stay qualitative and avoid recipes or nutrition claims. | Surfaces: result card drawer or `/ideas`. Data: optional preference tags. Model: optional, but static bank safer. Deps: none. | **Prototype/validate first.** MVP: static "quick, steadier options" by context. Copy-ledger rows: `quick-options-heading`, `quick-options-disclaimer`, `quick-options-card`. Claims check: no exact nutrient/GI/GL numbers or guaranteed glucose effect. |
| T6 - Confusing labs / doctor distrust | High intensity but outside Revora's safe lane. Raw voice includes lab confusion and doctor distrust at lines 118-120 and 186-214. | Deliberately narrow. Revora accepts A1C context but does not interpret labs. | **Mostly no.** Lab interpretation, risk scoring, A1C prediction, and medical coaching cross the claims boundary. A static "what Revora does not do" education page is possible. | Surfaces: help/FAQ only. Data/model/deps: none if static. | **Decline - out of scope** for lab interpretation. Optional counsel-reviewed FAQ after launch. Claims check: no diagnosis, prediction, or treatment. |
| T7 - Boredom with safe meals | Medium. Repetition fatigue appears at lines 218-219. | Partial. Existing `repeat_meal` insight can notice repetition, but there is no variety surface. | **Yes.** Variety ideas can be qualitative and static. Do not become a recipe engine with unsupported nutrition claims. | Surfaces: insights/history card. Data: meal category counts. Model: optional, static bank safer. Deps: none. | **Build after launch.** MVP: "try a different base/protein/fiber side" ideas when repeat meals are detected. Copy-ledger rows: `variety-prompt`, `variety-disclaimer`. Claims check: no guaranteed glucose improvement. |
| T8 - Travel / mental food break | Medium intensity and strategically important. User wants a week off vigilance at lines 280-283. | Not addressed; current product encourages per-meal checking. | **Yes, if framed as pressure reduction, not safety permission.** Travel mode can pause streaks/nudges and soften reminders. | Surfaces: settings/profile toggle, nudge scheduler, history labels. Data: `travel_mode_until` profile field. Model: none. | **Build after launch.** MVP: pause streak pressure and reminders for a date range. Copy-ledger rows: `travel-mode-toggle`, `travel-mode-active`, `travel-mode-boundary`. Claims check: never says food is safe while traveling. |
| T9 - Underweight / ARFID nuance | High safety intensity, lower volume. Raw voice raises underweight/ARFID constraints at lines 287-289. | Not addressed. Current carb-reduction framing could be wrong for this user. | **Partly, but clinical/counsel gated.** Engineering can add a guardrail and non-restrictive branch, but cannot decide clinical thresholds or wording alone. | Surfaces: onboarding safety context, result de-escalation, support copy. Data: avoid storing sensitive status unless reviewed. Model: none. | **Clinical/counsel-gated.** MVP after review: an off-ramp for underweight/ARFID users that avoids restriction language. Copy-ledger rows require counsel/clinical approval. Claims check: no diagnosis or treatment. |
| T10 - Specific ingredient / label literacy | High practical value. Users ask about specific foods and ingredients at lines 92-98, 104-109, 113, 123-125, and 146-148. | Partial. Core check can handle text input; Pantry Review covers deeper package review but is paid/separate. | **Yes.** A label-literacy helper can explain ingredients qualitatively without exact GI/GL or mg/dL. | Surfaces: check input examples, result "ingredient notes," optional Pantry Review bridge. Data: none. Model: same check call or static ingredient glossary. Deps: none. | **Build after launch.** MVP: "ingredient note" section for common label terms. Copy-ledger rows: `ingredient-note-heading`, `ingredient-note-disclaimer`, `pantry-bridge`. Claims check: no exact numbers, no diagnosis, no guaranteed response. |

## Per-Theme Notes

### T1 - Personal Reactions

Necessity is real. The raw audience material directly conflicts with generic advice: one user describes oats as fine and pasta as punishing, while another says rice is impossible for them. A population-level checker will sometimes contradict lived experience.

The safe build is a journal, not an inference engine. Let users attach an encrypted note to a food/result and show it back later: "Your note from last time." The note must not change the verdict, rank foods by predicted glucose, or claim Revora learned the user's glucose response.

### T3 And T9 - Vulnerable-User Safety

These are not ordinary feature gaps. They are safety risks created by the product category. A strict "Hold off" can be harmful for someone already afraid to eat, underweight, or ARFID-adjacent.

Engineering can implement a reviewed flow once counsel/clinical reviewers decide the language:

- a pause/off-ramp,
- a non-restrictive result branch,
- minimal sensitive-data collection,
- no medical advice,
- no diagnosis of ED/ARFID.

Until that review exists, shipping this copy from engineering alone is not acceptable.

### T5, T7, T8 - Reducing Load Without Overclaiming

Convenience, boredom, and travel all point to the same product pattern: reduce pressure. These can be built as optional companion surfaces, not as a smarter medical engine.

Safe examples:

- static quick-option cards,
- variety prompts from repeat-meal history,
- travel mode that pauses streaks and nudges.

Unsafe examples:

- "these are safe for your glucose,"
- "travel without worrying about blood sugar,"
- exact nutrition or GI/GL claims.

### T6 - Labs And Doctor Distrust

This should not become a feature. Users are confused and frustrated, but lab interpretation is exactly where Revora would drift into diagnosis, treatment, prediction, and medical-device risk. The only safe near-term surface is an FAQ that says what Revora does and does not do, reviewed against the claims boundary.

## Prioritized Backlog

### Eng-Buildable After Launch

1. **Personal food notes** - encrypted user-authored memory attached to history, never predictive.
2. **Ingredient/label literacy** - qualitative ingredient notes with no exact GI/GL or glucose numbers.
3. **Quick-options ideas** - static, qualitative, context-based options for busy moments.
4. **Variety prompts** - small ideas triggered by repeat-meal insight.
5. **Travel mode** - pause streak/nudge pressure, not a safety guarantee.
6. **Repair/no-shame copy** - help users recover from all-or-nothing spirals without medical claims.

### Clinical/Counsel-Gated

1. **Food-fear / ED-aware off-ramp** - required before Revora can honestly claim it handles vulnerable users safely.
2. **Underweight / ARFID guardrail** - required before adding more restrictive or substitution-heavy framing.
3. **Any safety copy that detects or responds to restriction behavior** - must be reviewed before implementation.

### Decline Out Of Scope

1. Personal glucose prediction.
2. A1C forecasting or future-A1C claims.
3. CGM replacement or CGM-style individualization.
4. Lab interpretation or doctor-dispute coaching.
5. Diagnosis, treatment, prevention, cure, or reversal claims.
6. Exact mg/dL, exact GI, exact GL, or unsupported clinical certainty.

## Copy-Ledger Additions Required Before Any Build

Each build candidate needs copy-ledger rows before implementation:

| Candidate | Required copy-ledger rows | Boundary check |
|---|---|---|
| Personal food notes | `personal-note-prompt`, `personal-note-recall`, `personal-note-boundary` | User-authored memory only; no prediction or personalized medical inference |
| Repair/no-shame copy | `repair-copy`, `no-shame-history-empty` | No treatment/reversal promise; no pressure to restrict |
| Quick options | `quick-options-heading`, `quick-options-disclaimer`, `quick-options-card` | Qualitative only; no guaranteed glucose effect |
| Variety prompts | `variety-prompt`, `variety-disclaimer` | No guaranteed improvement; no exact nutrition claims |
| Travel mode | `travel-mode-toggle`, `travel-mode-active`, `travel-mode-boundary` | Pauses pressure; never says eating is safe because travel mode is on |
| Ingredient literacy | `ingredient-note-heading`, `ingredient-note-disclaimer`, `pantry-bridge` | No exact GI/GL/mg/dL; no diagnosis or treatment |
| ED/ARFID guardrails | counsel/clinical-owned rows only | Must be reviewed before product copy ships |

## Final Feasibility Call

The product should build memory and pressure-reduction features, not prediction features. The smallest honest next step is a personal-note prototype plus one pressure-reduction surface after current launch blockers are closed. ED/ARFID guardrails are important enough to prioritize, but they are not engineering-only work.
