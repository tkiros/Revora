# Revora — Pain-Point Necessity × Feasibility Report (2026-07-06)

Part B of `docs/handoff/2026-07-06-e2e-verification-and-painpoint-feasibility-master-prompt.md`.
Companion report: `docs/handoff/2026-07-06-e2e-verification-report.md` (Part A).

- **Sources:** `/home/tefera/Desktop/Various_files/target_audience_questions.md` (324 lines, read in full this session — all line refs below re-verified against the raw file, not the §5 summary); `docs/handoff/2026-07-06-launch-audit-report.md` §5; `docs/safety/claims-boundary.md`; `docs/safety/copy-ledger.md`; live code on `main` @ `4a22f0c`.
- **Method:** product framing per the `office-hours` skill (demand evidence, status quo, narrowest wedge, interest ≠ demand, premise challenge, alternatives); buildability per the `plan-eng-review` skill (architecture fit, data/migration cost, edge cases, test surface, failure modes). Both were run in autonomous mode against cited evidence — no interactive founder session; every judgment below states its evidence.
- **Standing product context (from the approved 2026-07-04 office-hours design doc, `~/.gstack/projects/Revora/tefera-launch-hardening-design-20260704-082028.md`):** solo founder, <2 months runway, **zero outside users to date**, "market contact — not more building — is the scarce resource," Pantry Review is the revenue wedge, kill-criterion = no payment after 100 direct asks. Every recommendation below is weighed against that: **a feature only earns "Build now" if it is near-zero effort or removes a launch hazard.** Everything else waits for real users to confirm the pain in-product.
- **Hard constraints honored:** claims boundary is absolute (no diagnosis / prediction / CGM replacement / banned language); safety-frozen files (`lib/revora/postprocess.ts`, `service.ts`, `prompt.ts`, `schemas.ts`, `a1c.ts`) untouched by every sketch below; T3/T9 routed through clinical + counsel gates, never eng-only.

---

## 1. Theme extraction (from the raw file, this session)

All nine launch-audit themes re-confirmed directly in the raw file; T10 (added by the audit) also confirmed. Volume = distinct voices in the file; intensity = strength of language.

| Theme | Voices | Representative evidence (line refs) |
|---|---|---|
| T1 Unpredictable individual carb reactions | ~6 (highest) | L7–19 (OP: oat flour fine, reheated wholewheat pasta "utter shit"), L22 ("oats are like a warm hug… pasta feels like I've been mildly poisoned"), L25 (jacket potato fine, brown rice "foggy slump every single time"), L33–39 ("I can't have rice, full stop… French fries… totally fine"), L98 ("You need to test this with a CGM"), L206–214 (CGM data contradicting A1C) |
| T2 Guilt / all-or-nothing | 3 | L43–59 ("avoid snacks for a few days, then eventually binge"), L61–63, L79–87 ("now I feeling so bad and guilty… I am spiralling") |
| T3 Fear-of-food / orthorexia-adjacent | 2–3, extreme intensity | L221–249 ("this shit is giving me an eating disorder… genuinely afraid to eat food", "I literally sit around hungry half the time" L239, "constant anxiety about food. I feel like a total failure" L248), L61–63 ("maybe I have an eating disorder, but my family… says that I'm just a pig") |
| T4 Overwhelm / conflicting advice | ~5 | L104–113 (oils confusion), L118–125 ("almost broke down. I don't even know where to start"), L144–148 ("carbs, sugar, glycemic index or all of the above?"), L153–163, L294–323 ("Where do I start?") |
| T5 Convenience pressure | 1–2 | L73–75 (19-year-old, class→work→10pm: "quick meals I can put together when I'm doing alot of stuff at once"), L120 ("I love snacks… I'm lost") |
| T6 Confusing labs / doctor distrust | ~6 | L118 (PCP said "normal" at A1C 6 + untreated symptoms), L155 (casual diagnosis phone call), L166–172, L175–183 (A1C down, insulin doubled), L186–192 ("5.6 to 7.4 in four months?… I'm literally at a loss"), L195–214, L264–277 |
| T7 Boredom with safe meals | 1 | L218–219 ("so bored with my standard dinner menu… Chicken, eggs, tuna, beans, lettuce") |
| T8 Travel / "mental food break" | 1 | L280–283 ("I would like a mental food break for one week — is that possible??") |
| T9 Underweight / ARFID nuance | 1, high harm potential | L287–289 ("already underweight with arfid… if i lose even 5 pounds, my doctor would refer me to an inpatient clinic") |
| T10 "Is this specific food/ingredient OK?" | 3–4 | L92–94 ("Is sourdough okay…?"), L113 (goat milk carbs), L123–125 (Crystal Light maltodextrin surprise), L69 (label-reading was the useful part of a class) |

Notable side-finding: the audience *itself* uses reversal language ("I want to reverse this in 3 months," L316) — context for the counsel Q8 adjudication of the removed onboarding line, **not** a license to restore it; the claims boundary bans the reversal family regardless of audience vocabulary (`docs/safety/claims-boundary.md:37`).

---

## 2. Necessity × feasibility matrix

| Pain point | Necessity (volume + intensity, evidence) | Current coverage | Feasible inside boundary? (how / blockers) | Est. cost (surfaces / data / model / deps) | Recommendation |
|---|---|---|---|---|---|
| **T1** Individual carb reactions | **Highest** — #1 by volume (≈6 voices), visceral language (L22, L33) | Partial → structural limit: verdict is population-level (`lib/revora/prompt.ts` band framing); CGM-style individualization banned (`claims-boundary.md:38–40`) | **Yes, as a non-predictive personal journal** ("your note on this food," user's own words replayed verbatim, verdict never adjusted) + **yes, immediately, as one honesty framing line** on results/onboarding. Blocker for anything more: any Revora-authored personalization = prediction = banned | Framing line: 1 ledger row, 2 files. Journal: 1 additive migration (`note_ciphertext`), `StoredCheck.note`, result-card + history UI, 0 model calls, 0 deps | **Framing line: Build now. Journal: Build after launch** (first retention feature once real users exist) |

| **T2** Guilt / all-or-nothing | High (3 voices, "spiralling" L81) | **Strong** — keep-most "Enjoy it anyway" (`lib/revora/coach-outputs.ts:38–52`), SAFE gets no homework, "no streak guilt" (`components/nudge-opt-in.tsx:117–119`) | n/a — already inside boundary | 0 | **Decline (already covered)** — monitor with real users |

| **T3** Fear-of-food / orthorexia | **High intensity** (L221–249 is the most distressing text in the file), 2–3 voices | **Not addressed — safety risk**: "Hold off" to a food-fearful user can reinforce restriction; no screening/de-escalation (`lib/revora/input-precheck.ts` has no anxiety path) | **Partially, and only through a clinical + counsel gate.** Eng shell (route + copy slot) is trivial; the screening question and de-escalation copy are clinical instruments that eng must not author | Gated: clinical advisor + counsel review; then ~2 surfaces + ledger rows + tests | **Clinical/counsel-gated** (gate named in §3.3) — do not ship any ED copy unreviewed |

| **T4** Overwhelm / conflicting advice | High (~5 voices) | **Strong** — one calm verdict, one reason, one swap, never a number (`app/onboarding/page.tsx:120–125`) | n/a | 0 | **Decline (already covered)** — this is the product's core counter-position |

| **T5** Convenience / quick meals | Moderate (1–2 voices, but L75 is desperate-specific) | Partial — voice + photo lower *input* friction; no meal-*ideas* output (swaps are tweaks, not recipes) | **Constrained.** A model-generated ideas surface = new claims class + spend + recipe-engine drift; a static curated list is buildable but is a new claims-review burden and not the wedge | Content-first experiment: 0 product surfaces (blog/PDF/email); product version later: 1 page + ledger audit | **Prototype/validate first** (content before product) |

| **T6** Confusing labs / doctor distrust | High (~6 voices) | **Deliberately out of scope** — lab interpretation = diagnosis/prediction family (`claims-boundary.md:36–39`); out-of-range A1C routed to clinician (verified live this session, verbatim approved wording) | **No.** Any "explain my labs" feature crosses the diagnosis boundary. Not a challenge to solve | — | **Decline — out of scope** (boundary-banned; keep the honest clinician redirects) |

| **T7** Boredom with safe meals | Low (1 voice) | Reframe only (`repeat_meal` insight, `lib/coach/insights.ts:106–109`) | Same constraints as T5 (variety surface = idea generation) | Folds into the T5 content experiment | **Prototype/validate first** (bundle with T5; low priority) |

| **T8** Travel / mental food break | Low volume (1 voice), sharp want | Not addressed; keep-most helps at the margin | **Yes — a coherent, honest "break week" exists**: pause nudges (reuses `nudge_opt_in`), suppress streak/first-win framing (`lib/coach/days.ts:57` gate), one permission-first line. No verdict change, no new claims | 1 client flag + 2 conditionals + 1 ledger row; 0 model, 0 deps | **Build after launch** (small trust-builder; decided *in* scope, just not now) |

| **T9** Underweight / ARFID | 1 voice, **high harm potential** (carb-restriction swaps counter-indicated; app cannot detect) | **Not addressed — safety risk** (onboarding collects A1C only, `app/onboarding/page.tsx:21` step machine) | **Partially, clinical + counsel gated** (same shape as T3): optional onboarding context → non-restrictive framing branch + clinician redirect. The screening wording is the hazard | Gated: 1 onboarding step + 1 framing branch + ledger rows after clinical sign-off | **Clinical/counsel-gated** (same gate as T3; scope split in §3.3) |

| **T10** Specific-food/ingredient OK? | High (3–4 voices) | **Strong** — this *is* the core check; ingredient-level free text already works; Pantry Review covers whole-kitchen triage | n/a | 0 | **Decline (already covered)** — a marketing angle, not a feature gap |

---

## 3. Per-theme write-ups

### 3.1 T1 — Unpredictable individual carb reactions (the big one)

**Necessity.** This is the file's dominant theme and its opening thread. Six distinct voices describe body-specific reactions that contradict GI/GL theory (L13–15: cooked-cooled-reheated wholewheat pasta worse than refined oat flour). Intensity is high and the language is somatic ("mildly poisoned" L22, "foggy slump every single time" L25). The community's own answer is a CGM (L33, L98, L206) — exactly the instrument the claims boundary forbids Revora to imitate.

**Premise challenge (office-hours).** The naive feature ("Revora learns your reactions and personalizes verdicts") is a **banned product** — it is glucose-response prediction per `claims-boundary.md:39–40`. The honest reframe: Revora cannot *know* your reaction, but it can *remember what you told it*. That is a journal, not a prediction. The user stays the authority on their own body; Revora replays their words verbatim and never moves the verdict.

**Two-tier recommendation.**

1. **Build now — the honesty framing line (near-zero cost, removes a live hazard).** The launch audit §5 flagged that the flagship oatmeal example ("Be careful") directly contradicts the audience's lead quotes (oat-tolerant, rice/pasta-reactive people). One ledgered sentence on the result card / onboarding expectations step — e.g. draft `general-guidance-01`: *"Revora's guidance is general for your A1C range — your own response to a food can differ. Only you (and your care team) know your body."* — turns the #1 objection into an honesty signal. Claims check: qualitative, non-predictive, reinforces the boundary; passes all 8 banned families and the `result-qualitative-impact` class. Copy-ledger row: `general-guidance-01` (new claim class row under `result-qualitative-impact`, Pending → counsel glance). Files: `components/result-card.tsx` (or the shared `disclaimer-line.tsx` area) + `app/onboarding/page.tsx` expectations step; both already in COPY_FILES (post-BUG-08 fix), so the claims CI covers them automatically.
2. **Build after launch — the personal food journal ("Your notes").** Smallest honest version (ponytail-lean):
   - **Data:** optional `note` on a check. Guests: add `note?: string` to `StoredCheck` (`lib/client/history-store.ts:12–20`, the designed seam). Signed-in: one additive migration adding `note_ciphertext` to `checks` — free-text about one's body is health-adjacent, so it gets AES-256-GCM like `food_ciphertext` (`lib/server/crypto.ts`), joins the never-in-telemetry allowlist (`docs/privacy/data-flow.md` stored-data table gets one row), and the Sentry scrub already structurally covers it.
   - **Surfaces:** (a) after a result, one low-key affordance: "Add a note about how this went for you (only you see this)"; (b) on `/history` and on re-check of a matching food (normalized string match, client-side after owner-scoped decrypt): "Your note from last time: '…'" — user's words, quoted, visually distinct from the verdict.
   - **Hard rules (the claims-boundary check it must pass):** the note never feeds the model, never alters the verdict, never generates Revora-authored interpretation ("you seem to tolerate oats" is banned — that's a prediction). Frozen files untouched: the journal lives entirely in client stores, one schema column, history handlers, and UI. The framing line from tier 1 renders beside every note display.
   - **Copy-ledger rows:** `journal-invite-01` (entry affordance), `journal-display-01` ("Your note from last time" label + privacy clause), `journal-frame-01` (the "your note, not our verdict" companion line). All three → COPY_FILES + ledger with counsel review before ship.
   - **Eng-review verdict (plan-eng-review lenses):** architecture fit clean (reuses the localStorage→server seam built for exactly this kind of growth); migration additive like `0002`; edge cases to test = note on guest→server history migration, decryption-failure placeholder, note length clamp, XSS-safe rendering of user text, matching against re-checks with different casing/whitespace; test surface = unit (store round-trip, encryption, match normalization) + one smoke spec. ~6–8 files touched. No new deps, no model calls, no new failure modes in the check path (journal writes are fail-soft like check persistence).
   - **Why not now:** zero users; the journal is a *retention* feature whose value depends on repeat usage that doesn't yet exist. Per the standing design doc, market contact outranks it. It should be the first feature built once real users are checking daily.

### 3.2 T5 + T7 — Convenience and variety (bundled)

The desperate-specific voice is real (L75: 19-year-old, class→work→10pm, "the only thing setting me back is the convenience part"). But the product mechanism the audience asks for is *meal ideas* — and Revora's boundary allows food-level **adjustments to a meal the user proposes** (`result-adjustment` class), not proactive meal generation. A generated "safer quick options" surface would need: a new claims class, new model spend on the currently starved OpenAI account, and per-output claims audit (each idea is a nutrition claim). A static curated list avoids the model but still creates a claims-review burden and drifts toward a recipe product Revora is not.

**Recommendation: Prototype/validate first, content-first.** Ship a "10 quick checks people run before grab-and-go meals" style artifact (blog post / PDF / the existing waitlist email) that routes readers into the *existing* check flow. Zero product surface, zero ledger rows (launch copy class applies, `launch-informational`), and it tests whether convenience-seekers convert before any build. If real users then ask for it in-product, revisit with counsel. T7 (boredom, 1 voice) folds into the same experiment; its in-product floor already exists (`repeat_meal` insight).

### 3.3 T3 + T9 — The safety pair (fear-of-food; underweight/ARFID)

These are not feature gaps; they are populations for whom the core product output can be actively harmful. L221–249 describes restriction, hunger, and food panic in a 5.9-A1C user — a person to whom "Hold off" is gasoline. L287–289 is an underweight ARFID user one 5-lb loss away from inpatient referral, for whom carb-restriction swaps are counter-indicated. The app cannot currently detect either.

**Necessity: high — but the deliverable is a safety guardrail, not a growth feature.**

**Eng vs. clinical split (the gate, named):**

| Piece | Owner | Why |
|---|---|---|
| Screening/context question wording (onboarding or precheck) | **Clinical** (RD/psychologist with ED experience) | A mis-worded screen is worse than none; eng must not author it |
| De-escalation / "food is not the enemy" copy + resource routing (e.g., helpline) | **Clinical + counsel** | ED-adjacent product copy is quasi-clinical speech; counsel must clear liability posture |
| Non-restrictive framing branch (suppress swaps/keep-most homework for flagged contexts) | **Eng shell after clinical spec** | Mechanically trivial: onboarding `Step` union (`app/onboarding/page.tsx:21`) takes one more step; result card already branches on gated props |
| Detection of ED signals in free text | **Decline** | Inferring an eating disorder from meal text is diagnosis — banned family, and clinically reckless |
| Copy-ledger rows + claims CI wiring | Eng, after sign-off | Standard process |

**Recommendation: Clinical/counsel-gated for both.** Concretely: commission one clinical review session covering both themes (they share the reviewer profile), have counsel clear the resulting copy, then the eng work is ~1–2 days. Until that gate clears, ship **nothing** ED-flavored — including well-intentioned onboarding lines. Interim honesty: the existing universal disclaimer and permission-first tone are the only mitigations, and that should be stated plainly in any risk register. This is the single highest-leverage *human* action Part B surfaces.

### 3.4 T6 — Labs/doctor distrust: decline, and mean it

Six voices, real pain (L186: "5.6 to 7.4 in four months?… I'm literally at a loss"), and a hard **no**. Explaining lab discordance, questioning a clinician's read, or reassuring "your CGM average looks fine" are all diagnosis/prediction-family outputs (`claims-boundary.md:36–39`). The product already does the only honest thing: out-of-range routing with approved wording (verified live this session on `/api/check`, byte-identical to the boundary doc's approved routes) and the "Only a blood test…" honesty on `/how-it-works`. The known wrinkle stands: Revora redirects to the party some of these users distrust. That is the correct behavior for an informational-only product; the alternative is practicing medicine.

### 3.5 T8 — Travel "break week": in scope, later

One voice, but the master prompt demanded a decision, not a hand-wave: **it is coherent and in scope.** The honest version does not change verdicts or promise safety-while-away; it removes *product pressure*: pause nudges (column exists: `nudge_opt_in`, `lib/server/db/schema.ts:87`), suppress streak/first-win framing for the window (`showFirstWin`, `lib/coach/days.ts:57`), one ledgered permission-first line ("Taking a break is allowed. Revora will be here when you're back."). No model, no new data, ~3 files. Claims check: no banned families touched; the line is `product-role`-class copy. It is a retention/trust feature for users who do not yet exist — **Build after launch**, behind the T1 journal in priority.

### 3.6 T2, T4, T10 — Already covered (no build)

The product's strongest position is that its core mechanics already answer three confirmed themes: T10 is the product (core check + Pantry Review), T4 is the product's framing thesis (one calm verdict against advice-overload), T2 is deliberately engineered in (keep-most gated to MODERATE/HIGH only, SAFE gets no homework, no-streak-guilt copy). Part A verified the load-bearing pieces live. The correct action is marketing that leads with these (the audience's own words are the ad copy), not new surfaces.

---

## 4. Prioritized recommendations

**Eng-buildable now (near-zero cost):**
1. **T1 framing line** (`general-guidance-01`): one ledgered sentence on result card + onboarding expectations — defuses the oatmeal-contradiction hazard and honestly addresses the #1 theme. 2 files, 1 ledger row, counsel glance.

**Build after launch (first two post-launch features, in order):**
2. **T1 personal food journal ("Your notes")** — the flagship answer to the #1 pain, fully inside the boundary because the user authors every word. ~6–8 files, 1 additive migration, 0 model calls. Ledger rows `journal-invite-01`, `journal-display-01`, `journal-frame-01`.
3. **T8 break week** — 3 files, 1 ledger row, pure trust.

**Prototype/validate first (no product surface yet):**
4. **T5/T7 quick-options content experiment** — blog/PDF/email routing into the existing check; build in-product only if it demonstrably converts.

**Clinical/counsel-gated (do not ship unreviewed; highest-leverage human action):**
5. **T3 ED-aware path + T9 ARFID guardrail** — one shared clinical review (ED-experienced RD/psychologist) + counsel clearance, then a small eng shell. Until cleared: nothing ships.

**Decline (state why):**
6. **T6 lab interpretation** — diagnosis/prediction banned families; the honest clinician redirect is the product's answer.
7. **T1 verdict personalization / CGM-style learning** — prediction banned family; the journal is the boundary-respecting maximum.
8. **T2 / T4 / T10 new builds** — already covered by shipped, verified mechanics; the gap is distribution, not product.

---

## 5. Self-check

- Every necessity claim cites raw-file line refs re-verified this session; every feasibility claim cites `file:line` in live code.
- Every recommendation is justified against the claims boundary explicitly; both "Build" items name their copy-ledger rows and the claims check they must pass; both safety themes name their human gate.
- No code, ledger row, or copy was changed by this investigation; safety-frozen files untouched.
- Framework compliance: office-hours (product framing) and plan-eng-review (buildability) were invoked and applied in autonomous mode; their interactive checkpoints were replaced by cited evidence, as commissioned.
