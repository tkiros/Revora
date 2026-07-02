# Master Prompt — Verify & Validate Product Direction (before full build)

**Date:** 2026-07-01 · **Repo:** `/home/tefera/Desktop/Revora` · **Type:** decision/validation, **not** a build.
**Gates:** this runs **before** and **decides** `docs/handoff/2026-06-30-execute-full-implementation-plan-handoff.md`. Do not start the full build until this produces a recommendation.

---

## ⚠️ Mission (3 lines)

Determine — **with evidence, not opinion** — which product direction lets Revora **add real value and deliver on its promise for prediabetics without misleading them.** Weigh the candidate directions against the real pain points, the actual codebase, external accuracy evidence, and a **hands-on photo-accuracy spike.** Produce **one decisive recommendation** plus a concrete, honesty-safe input-model spec.

**The non-negotiable constraint:** the app must **never mislead** a prediabetic about a meal's glucose impact. Misleading here is a real health, trust, and FTC harm. Any direction is only acceptable if it is **honest under uncertainty** — an answer it isn't sure of must be surfaced as uncertain or deferred, never delivered as a confident verdict.

---

## The question you must answer

Which direction should Revora take so it addresses the pain points and solves the problem **with as little friction as possible but without misleading information or confusion?**

**Candidate directions (evaluate all; add your own if the evidence points elsewhere):**
- **D1 — Prediabetes-only daily "coach":** text-first decision engine ("should I eat this, now?") + memory/nudge/insight. Camera/CGM/reversal-score deferred.
- **D2 — Original plan:** camera-first meal scanning + CGM + reversal-score (BAI) as hero.
- **D3 — Hybrid:** some blend of coach + camera/CGM/BAI.
- **D4 — Conservative / confidence-gated camera (the owner's proposal — evaluate this seriously):** camera as a *low-friction entry* to cut the work of typing a meal; **but if there is any hint of doubt or ambiguity in the photo, the app must stop and ask the user for ingredients + portion** before giving a recommendation — so accuracy and honesty are never compromised. Photo is an *accelerator*, never the thing that renders an uncertain verdict.
- **D5 — Any other direction** the analysis surfaces (e.g., "photo-assist that always confirms before a verdict," barcode/label scan, voice input, restaurant-menu lookup, etc.).

**Owner's framing you must engage with directly:** the camera was chosen to *remove friction* (instant "is this safe?" answers). But photo→glycemic estimation has a **hard accuracy ceiling — even large companies could not make meal-photo angle/portion estimation reliable.** The tension to resolve is **friction ↔ accuracy ↔ honesty.** Do not hand-wave it; quantify it.

---

## What you must produce

A single decision document: **`docs/direction-validation-2026-07-01.md`** (create it), containing, in this order:

1. **Recommendation (decisive):** one direction, with a **confidence level** and a 3-sentence "why this over the others."
2. **Pain-point coverage matrix:** PP-01…PP-08 × each candidate direction → does it *solve* the pain, at what **accuracy/honesty cost**, at what **friction**. Make explicit which pains are about the *decision/friction* vs *guidance/reassurance/relationship* vs *progress* — i.e., separate "input modality" (camera vs text) from "the value."
3. **The camera accuracy verdict (evidence-based):** external evidence + your own spike results (below). State plainly how often a photo-based estimate would be **confidently wrong in a way that misleads a prediabetic**, and whether a strict confidence-gate can actually prevent that.
4. **Recommended input model (concrete spec):** exactly how a user gives Revora a meal under your recommendation, including — if any camera is involved — the **confidence thresholds, the fallback UX, and how a verdict is gated on user confirmation** so it can never mislead.
5. **What NOT to do:** the specific misleading traps to avoid (false precision, silent portion guesses, confident wrong risk-class, "AI-powered" over-promise).
6. **Validation plan + kill criteria:** the cheapest tests to confirm the recommendation *before* full build, and the signals that would kill it.
7. **Appendix:** the spike data, sources, and the adversarial refutation attempt.

---

## Evidence you must gather (don't skip any)

- **All internal docs** (read, then *verify* — do not just accept prior conclusions):
  `docs/ICP.md`, `docs/product-marketing.md`, `docs/build-vs-recommendation.md`, `docs/coach-mvp.md`, `predict/260629-revora-viability/overview.md`, `docs/audit/Revora_Feasibility_Analysis.md`, `docs/audit/Revora_Deep_Audit_Report.md`, `docs/audit/Revora_Alignment_Audit_CoachPivot_20260630.md`, `docs/safety/claims-boundary.md`, and the amended `PRD/Glucosnap_prd_v2.md` / `Revora_Brand_Positioning_v2.md` (note: coach-first is the current locked positioning; camera/CGM/BAI were demoted — but your job is to *re-examine* that, not rubber-stamp it).
- **The actual codebase:** confirm what exists (a stateless, **text-in** food checker with a safety-hardened engine in `lib/revora/`; **no camera/vision code**). The safe answer engine is reusable regardless of direction.
- **External accuracy evidence (use web research):** real numbers on meal-photo nutrition/carb/portion estimation error (e.g., carb MAPE, portion-size error, the documented accuracy failures of Cal AI / Glycemic Snap / LOGI / SNAQ / January AI), and any evidence on whether vision LLMs are **well-calibrated** (do they *know* when they're unsure?). Cite sources.
- **Regulatory frame:** FTC "reasonable consumer" + FDA wellness-vs-device line + `claims-boundary.md`. A direction that can't be marketed/operated honestly is disqualified.

---

## The empirical spike (the crux — actually run it)

The whole decision hinges on one measurable question: **how often would a photo-based glycemic estimate mislead, and can the model tell when to fall back to text?** Turn this into data:

1. **Assemble a small ground-truth set** (~15–40 real meals) with **known ingredients + portions**, and compute each meal's true glycemic-load / risk class (SAFE/MODERATE/HIGH) from GI/GL tables. Use your own photos, public food images with known recipes, or a standard food-image dataset.
2. **Run the current stack's vision-capable model** (OpenAI, already a dependency) on each **photo only**, using a GL/risk prompt adapted from `lib/revora/` safety logic. Also run the **text path** (known ingredients + portion) as the accuracy ceiling.
3. **Measure:**
   - ingredient-identification accuracy, portion-estimation error;
   - **risk-class agreement** (photo-only vs text-with-known-ingredients);
   - **confidently-wrong rate** — high model confidence but *wrong risk class* (the dangerous, misleading case);
   - **calibration** — does the model's self-reported confidence actually predict correctness? (If it's confidently wrong, the "ask when in doubt" gate fails — this is the make-or-break finding for **D4**.)
   - **fallback rate** — under a strict "any hint of doubt → ask for ingredients" gate, what fraction of photos fall back to text? (If most do, the friction the camera was meant to remove largely returns.)
4. **Conclude:** does a confidence-gated camera (**D4**) genuinely remove the misleading risk while still saving meaningful friction — or does poor calibration / high fallback rate collapse it back toward "just ask for text"?

Keep the spike cheap and honest; even ~20 meals gives a decisive signal. Report N, method, and limitations.

---

## Method & decision criteria

Score each direction against these, honesty first:

| Criterion | Weight | Note |
|---|---|---|
| **Honesty under uncertainty (never mislead)** | **Hard gate** | Fail = disqualified, regardless of other scores. |
| Solves the **critical/high** pains (PP-01/02/03/04/05/07) | High | Coverage matrix. |
| Friction (time-to-useful-answer) | High | The camera's whole reason for existing. |
| Differentiation / defensibility | Med | First-mover is refuted; camera is commoditized + accuracy-capped. |
| Build cost / risk on the current Next.js stack | Med | Reuse `lib/revora/`; camera adds a vision pipeline. |
| Regulatory safety (FTC/FDA/claims) | High | Tied to honesty. |
| Willingness-to-pay / value signal | Med | Hypothesis-grade; note, don't overweight. |

**Rigor requirements:**
- Separate **input modality** (how a meal is entered) from **the value** (an accurate, honest decision + ongoing guidance). Test the hypothesis that most pain points are solved by the *guidance/coaching*, and the camera only affects *input friction on the "what do I eat" decision*.
- **Adversarially refute your own recommendation** before finalizing (spawn a skeptic: "what breaks this?"). If it survives, state the residual risks.
- Be **decisive.** Output one direction + a concrete input-model spec. "It depends" is not an acceptable conclusion.

---

## Operating rules

- **Read-only on product code + cheap spikes only.** Do **not** build the app. You may write throwaway spike scripts (under the scratchpad) and the decision doc.
- Use **subagents / parallel research** for the doc analysis, external evidence, and the spike; **adversarially verify** the recommendation.
- **Cite sources** for every external accuracy number. Label internal claims by confidence.
- Hold `claims-boundary.md` and the 4 guardrails (no calories; prediabetes-only; calm/permission-first/action-ending; "should I eat this, now?") as fixed context.
- End with the decision doc durable on disk; then summarize the recommendation to the user.

## Do NOT
- Rubber-stamp the existing coach-first conclusion **or** the original camera-first PRD — *re-derive* from evidence.
- Recommend any path that delivers a confident verdict on an input the model is not sure about.
- Overclaim accuracy, or lead with "AI-powered." Honesty is the moat, not the camera.
- Start the full build — that's gated on this recommendation.

## First moves
1. Read the internal docs + confirm the codebase reality. 2. Build the PP-01…08 × direction coverage matrix. 3. Run the photo-accuracy + calibration spike. 4. Pull external accuracy/calibration evidence. 5. Score the directions, adversarially refute the winner, write `docs/direction-validation-2026-07-01.md`, and report the recommendation.
