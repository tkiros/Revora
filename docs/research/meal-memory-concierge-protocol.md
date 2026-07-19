# Meal Memory Concierge Discovery Protocol (Phase 2.6)

> **STATUS: PENDING HUMAN EXECUTION** — authored by engineering as protocol; requires
> owner + privacy approval before recruitment. No participant may be contacted, and no
> test price may be charged, until the owner decision record (§9) and privacy sign-off
> (§3, §9) are both signed.

**Source of authority:** `docs/handoff/2026-07-18-revora-100-value-95-retention-validation-and-implementation-plan.md`,
section "Phase 2.6 — Validate the compounding-value hypothesis before the full build"
(lines ~515–527), with boundary language from §3.3 (human and external gates) and §16
(do not build or claim).

This document is operational: a product researcher plus a privacy approver should be able
to run the study from this file alone. Where the plan states a number or the go/no-go gate,
this document reproduces it verbatim and marks it **[VERBATIM FROM PLAN]**.

---

## 1. Purpose and hypothesis under test

**Purpose.** Prove that Meal Memory and a weekly learning artifact solve a recurring user
job *before* committing to the full Phase 3–4 system. **[VERBATIM FROM PLAN, line 517]:**
"prove that Meal Memory and a weekly learning artifact solve a recurring user job before
committing to the full Phase 3–4 system."

**Hypothesis under test.** When a participant accumulates a personal Meal Memory (their own
explored meals, saved choices, and resolved uncertainty) plus a weekly summary of what they
learned, the memory becomes something they return to and use in later meal decisions — a
recurring job worth paying for — rather than a one-time novelty.

**Explicit framing — what this study is and is not.**

- This is **discovery, not a statistically representative cohort.** **[VERBATIM FROM PLAN,
  line 519]:** "this is discovery, not a statistically representative cohort."
- A pass **clears discovery only; it does not prove retention.** **[VERBATIM FROM PLAN,
  line 524]:** "This clears discovery only; it does not prove retention."
- This study does **not** measure D30/D90 retention, willingness-to-pay at scale, renewal,
  or referral. Those remain open evidence gaps (plan §3.4) that only a real, measured cohort
  can close.
- This study is formative: its output is a **go/no-go decision on whether to build the full
  journey**, not a launch metric and not clinical evidence.

**Boundary this study must never cross.** The concierge memory and weekly artifact are
**non-clinical**. They must contain **no glucose-spike prediction, no individual
carb-tolerance inference, no A1C-improvement or prevention claim, no diagnosis, treatment, or
medication advice** (plan §16, line 1005). Everything a participant sees is a record of what
they explored and chose — never a forecast of a health outcome.

---

## 2. Recruitment

**Target size.** Recruit **12–15 people** in the supported audience for formative work.
**[VERBATIM FROM PLAN, line 519.]** Of those, **at least eight** participants receive the
consented three-week concierge prototype (§4). The extra 4–7 recruits provide a buffer for
no-shows and screener failures and a small comparison set of people who saw the product but
did not enter the prototype.

**Supported audience.** People in the product's supported range: **prediabetes / supported
A1C bands** (the A1C band is a variable Revora already collects; plan lines 412, 657).

**Screener — include only if ALL are true:**

1. Self-reports being in a **prediabetes / supported A1C band**, or is actively managing
   blood-sugar risk under a clinician without a diabetes diagnosis.
2. Makes their own day-to-day meal decisions at least several times a week (there is a
   recurring meal-decision job to observe).
3. Willing to use the existing meal-check card and share meal history with a concierge
   researcher for three weeks.
4. Can communicate in the study's supported language and complete a 20–30 minute intake and
   a stop/exit interview.
5. Provides informed consent (§3), including consent to the disclosed test price mechanic.

**Exclusions — screen OUT if ANY are true:**

1. **Diagnosed diabetes (Type 1 or Type 2) — out of scope per product boundary.** Diagnosed
   diabetes routes to a distinct safety path in the product (plan line 174) and is outside
   the supported audience for this discovery study. Screen out and refer to no clinical claim.
2. Pregnancy, active eating disorder, or any state the product routes to urgent/precedence
   handling (plan line 174) — out of scope for formative product discovery; do not enroll.
3. Current Revora employee, contractor, investor, or someone with a conflict of interest.
4. Anyone who cannot consent freely (e.g., a relationship of dependence on the research team).

**Recruitment hygiene.**

- Recruit for the *job*, not for enthusiasm; avoid only recruiting existing fans, which would
  bias the recall/continue signal.
- Do not promise any health benefit, outcome, or clinical value in recruitment materials.
- Record how each participant was sourced so selection bias is visible in the decision record.

---

## 3. Consent and data handling

**No recruitment or data collection begins until privacy sign-off (§9) is recorded.**

### 3.1 What participants agree to

Each participant reviews and signs a consent form covering:

- **Concierge handling of their meal history.** A researcher will manually review the meals
  they check and prepare a non-clinical Meal Memory and weekly summary artifact from that
  history.
- **Disclosed test price.** They are told the exact test price and billing mechanic in plain
  language *before* the study starts (the specific figure is set by the owner in §9 and must
  be the same figure shown to every participant). At the end of the three weeks they choose
  whether to continue at that clearly disclosed price. **[Plan line 522/524: "a clearly
  disclosed test price" / "choose to continue at the disclosed price."]**
- **Withdrawal at any time,** without penalty and without needing to give a reason, including
  a right to request deletion of their research data.
- **What is observed** (§5) and that they may be interviewed if they stop early (§6).

### 3.2 Data handling commitments

- **Research data stays in the approved first-party environment.** **[VERBATIM FROM PLAN,
  line 521]:** "Keep research data in the approved first-party environment; do not paste meal
  histories into unapproved tools."
- **No pasting meal histories into unapproved tools** — no third-party LLMs, spreadsheets,
  chat tools, note apps, or ad/analytics systems. The concierge artifacts are prepared by hand
  inside the approved environment only.
- **No health data in third-party analytics, ad pixels, logs, error trackers, URLs,
  notification previews, or social previews** (plan §16, line 1010).
- Treat even pseudonymous use as **potentially regulated consumer health data**; "first party"
  and "no raw text" reduce exposure but do not remove consent, notice, access, deletion,
  retention, or security obligations (plan line 380).
- **Retention and deletion.** State a fixed retention window for research data, honor deletion
  requests within it, and destroy raw meal histories and concierge notes at the end of the
  study unless the participant consents in writing to a longer, specified retention. Record the
  window in §9 before recruiting.
- **Access control.** Only named research staff on the approved environment may view raw meal
  histories. The owner decision record (§9) lists them.

---

## 4. Study design

**Prototype cohort.** **At least eight participants** receive a **consented three-week
concierge prototype.** **[VERBATIM FROM PLAN, line 520]:** "Give at least eight participants a
consented three-week concierge prototype using the existing meal card plus a manually prepared,
non-clinical meal-memory and weekly-summary artifact."

**What the prototype is:**

1. **Existing meal card.** Participants use the current, unmodified meal-check card for their
   real meals over three weeks. No new model behavior; the core card band is never changed by
   memory (plan §16, line 1006 — "No history-driven silent change to the meal card's band").
2. **Manually prepared, non-clinical Meal Memory.** A researcher curates, by hand, a record of
   the participant's explored meals, saved choices, and resolved uncertainty from their check
   history — inside the approved first-party environment.
3. **Weekly summary artifact.** Once a week the participant receives a summary of what they
   explored and learned (template in §4.1).

**Weekly cadence.** Three weekly artifacts total (end of week 1, 2, 3). Concierge review of new
checks happens throughout; the summary is delivered on a fixed weekly day per participant.

**At the end of week 3,** each participant is asked whether they choose to continue at the
clearly disclosed test price (§3.1, §5).

### 4.1 Weekly summary artifact template

The artifact contains **only** the four content areas below. **It must contain no glucose
inference, no glucose-spike prediction, no carb-tolerance inference, no A1C or health-outcome
claim, and no diagnosis or treatment language** (plan §16, line 1005). If a sentence could be
read as predicting a health result, it does not belong in the artifact.

```
─────────────────────────────────────────────
  YOUR WEEK WITH REVORA — Week [N] of 3
  Participant: [pseudonymous ID]        Prepared: [date]
─────────────────────────────────────────────

1. MEALS EXPLORED
   Meals you checked this week:
   • [meal]  — [neutral one-line note: what you were deciding]
   • [meal]  — [...]
   (A simple count and list. No scoring of your health.)

2. SAVED CHOICES
   Choices you kept or came back to:
   • [meal / swap you chose]  — [why you said you picked it, in your words]

3. UNCERTAINTY RESOLVED
   Questions you had that got answered this week:
   • You weren't sure about [X]; after checking, you decided [Y].

4. VARIETY & CONFIDENCE
   • Different meals explored this week: [count]
   • Where you told us you felt more confident deciding: [participant's own words]

─────────────────────────────────────────────
  This is a record of what you explored and chose.
  It is NOT a prediction of your blood sugar or any
  health outcome, and it is not medical advice.
─────────────────────────────────────────────
```

**Permitted language:** descriptive records of what the participant explored, chose, asked, and
said. Counts of meals and variety. The participant's own reported confidence, in their words.

**Prohibited language (reject the artifact if present):** any spike/glucose forecast; "this
meal will/won't raise your sugar"; carb-tolerance inference ("you handle X well"); A1C
improvement or prevention; diagnosis or treatment; medication or dosing advice; any implied
clinical result. When in doubt, cut it.

---

## 5. Per-participant observation checklist

For each prototype participant, the researcher records, with a date and a short evidence note
(quote or observed action), whether each of the four signals occurred. These four map directly
to plan line 522.

| # | Signal | What counts as YES | Evidence to record |
|---|---|---|---|
| O1 | **Returns to the memory unprompted** | Participant opens/refers to their Meal Memory or a weekly artifact without the researcher asking them to. | Date, trigger, what they looked at |
| O2 | **Uses it in a later decision** | Participant cites a past saved choice / resolved uncertainty when deciding a *new* meal. | Date, the earlier memory referenced, the new decision |
| O3 | **Understands it is not glucose prediction** | Participant articulates, unprompted or when asked, that the memory records what they explored and is not a blood-sugar/health forecast. | Their own words |
| O4 | **Chooses to continue at the disclosed price** | At end of week 3, participant says yes to continuing at the clearly disclosed test price (§3.1). | Yes/No, price shown, date, any conditions they stated |

**Recall count (feeds the gate).** For the go/no-go gate (§7), track how many times each
participant **independently recalls the memory** — i.e., unprompted returns (O1) and unprompted
uses in a later decision (O2). The gate requires **independent recall at least twice**. Record
each recall event separately (date + evidence) so "at least twice" is auditable, not inferred.

**Guardrails for honest observation:**

- Do not prompt or lead ("have you looked at your memory today?") before logging O1/O2; a
  prompted return does not count as independent recall.
- Log the price shown for O4 verbatim; it must be the single disclosed figure from §9.
- If a participant expresses that the memory feels like a health prediction, that is a **failed
  O3** and a comprehension/safety flag — record it and surface it in the decision record.

---

## 6. Stop-interviews

**Interview participants who stop, not only participants who complete.** **[VERBATIM FROM PLAN,
line 523.]** Every participant who withdraws, disengages, or declines to continue is invited to
a short interview. Completers who decline to continue at the price are also interviewed about
that decision.

**Stop-interview guide (5–8 questions):**

1. Tell me about the point where Revora stopped being worth your time — what was happening?
2. In the last week you used it, did you ever go back and look at your Meal Memory or weekly
   summary on your own? What made you (or stopped you from) doing that?
3. Was there a moment the memory helped you decide a meal — or a moment you expected it to help
   and it didn't?
4. In your own words, what did you think the weekly summary was *for*? Did it ever feel like it
   was predicting your blood sugar or health? (Comprehension / O3 check.)
5. When we showed you the price to continue, what went through your mind? What would have made
   it feel worth it — or clearly not?
6. If a friend in your situation asked, would you tell them to use this? Why or why not?
7. Was anything about how your meal history was handled uncomfortable or unclear?
8. What is the one thing that would have had to be different for you to keep going?

Keep it non-leading, let silences run, and record verbatim quotes for the decision record.

---

## 7. Precommitted go/no-go gate

**This gate is precommitted before recruitment. It is not revised after seeing results.**

**Gate — [VERBATIM FROM PLAN, line 524]:** "A reasonable discovery gate is that at least five
of eight completing participants independently recall the memory at least twice and choose to
continue at the disclosed price. This clears discovery only; it does not prove retention."

Stated operationally for this study:

> **PASS** requires **≥ 5 of 8 completing participants** to *both*:
> (a) **independently recall the memory at least twice** (§5, recall count — unprompted O1/O2
> events, at least two distinct events each), **AND**
> (b) **choose to continue at the disclosed price** (§5, O4 = Yes at the single §9 price).
>
> Both conditions must hold for a participant to count toward the five. "Completing
> participants" means those who finished the three-week prototype; if fewer than eight complete,
> record the actual denominator and do not dilute the threshold — five successes remain required.

### 7.1 Gate outcomes

**PASS → proceed to Phase 3 full build.** Build Personal Meal Memory and the staged learning
journey per plan Phase 3–4, under all existing safety, privacy, and non-clinical constraints.

**FAIL → do NOT build the full journey.** **[VERBATIM FROM PLAN, line 525]:** "If the gate
fails, do not build the full journey. Test a simpler fixed-duration guide, a free archive, or
stop the subscription thesis." Concretely, on FAIL, choose among:

- a **simpler fixed-duration guide** (a bounded, finite-length experience, not an
  indefinite subscription), or
- a **free archive** (keep the memory as a free feature, drop the paid-recurring thesis), or
- **stop the subscription thesis** entirely for this product direction.

### 7.2 What proceeds regardless of the gate

**[VERBATIM FROM PLAN, line 527]:** "The core reliability, billing, privacy, and availability
repairs remain required even if the product-architecture hypothesis fails." A FAIL does **not**
pause or deprioritize the Phase 1–2 reliability, billing, privacy, and availability work — those
repairs are required independently of this discovery result.

---

## 8. What this study will not claim (boundary checklist)

Before publishing any internal summary of results, confirm none of the following appear in the
artifacts, the memory, the recruitment materials, or the write-up (plan §16, §3.3):

- [ ] No glucose-spike prediction, carb-tolerance inference, A1C-improvement, or prevention claim.
- [ ] No diagnosis, treatment, medication, or DPP-equivalence claim.
- [ ] No presentation of this discovery result as retention, clinical, or regulatory evidence.
- [ ] No "not a medical device" or device-status assertion (that is counsel's call, plan §3.3, §16).
- [ ] No health data in third-party tools, analytics, logs, URLs, or previews.
- [ ] Simulated/engineering panels are not clinical validation; owner approval is not legal
      clearance (plan §3.3).

---

## 9. Roles, sign-offs, and decision record

**Roles.**

| Role | Responsibility |
|---|---|
| **Product research (runs the study)** | Recruitment, concierge artifact preparation, observation logging, stop-interviews, gate scoring. |
| **Privacy approver (sign-off before recruitment)** | Approves consent form, data-handling plan, retention/deletion window, approved first-party environment, and access list. **No recruitment begins without this signature.** |
| **Owner (decision authority)** | Sets the single disclosed test price and billing mechanic; approves launch of the study; records the final go/no-go decision and its rationale. |
| **Counsel (as required, plan §3.3)** | Reviews any external-facing claim before it leaves the research context. No document asserts a final medical-device or state-scope result before counsel review. |

**Fill-in fields — the owner and privacy approver complete these BEFORE recruitment:**

- Disclosed test price and billing mechanic (single figure, shown identically to all): ________
- Approved first-party environment (named system): ________
- Research-data retention window and deletion procedure: ________
- Named staff with raw-meal-history access: ________
- Privacy approver signature + date: ________
- Owner approval-to-recruit signature + date: ________

**Owner decision record (completed AFTER the gate is scored):**

- Completing participants (denominator): ____ of 8
- Participants meeting BOTH gate conditions (recall ≥ 2 AND continue at price): ____
- Gate outcome: ☐ PASS → Phase 3 full build   ☐ FAIL → [ ] simpler fixed-duration guide /
  [ ] free archive / [ ] stop subscription thesis
- Rationale and key evidence (quotes, recall logs): ________
- Confirmation that core reliability/billing/privacy/availability repairs continue regardless
  (§7.2): ☐
- Owner signature + date: ________
