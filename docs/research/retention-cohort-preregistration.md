# Retention Cohort Pre-Registration Protocol (Phase 4 — P4.5 / P4.6)

> **STATUS: PENDING HUMAN EXECUTION** — authored by engineering as a pre-registration
> protocol; requires owner + privacy approval before enrollment. No paid beta participant
> may be enrolled, and no test price may be charged, until the owner decision record (§10)
> and privacy sign-off (§10) are both signed, and until every Phase 0–3 gate in §2 has
> releasable evidence.

**Source of authority:** `docs/handoff/2026-07-18-revora-100-value-95-retention-validation-and-implementation-plan.md`,
sections "P4.5 Retention cohort" (lines ~642–657), "P4.6 Long-term maintenance evidence"
(lines ~659–667), §2.2 "The 95/100 paid-retention-readiness gate" (lines ~72–86), §2.3
"Measured business outcomes remain separate" (lines ~88–101), and §13 SLO rows "Cohort
value" and "Day-30 new value" (lines ~941–942). Boundary language is drawn from §16 "Do
not build or claim" (lines ~1003–1007) and the Phase 4 beta-exit statement (line ~667).

This document is operational: a product researcher plus a privacy approver plus the owner
should be able to **pre-register and run the paid retention cohort from this file alone**.
Every threshold is precommitted here or has an explicit fill-in slot that must be completed
and signed **before** enrollment. Where the plan states a rule or a number, this document
reproduces it verbatim and marks it **[VERBATIM FROM PLAN]**.

**What this document is and is not.** This is a pre-registration protocol for a *measured*
paid cohort — distinct from the Phase 2.6 concierge discovery study
(`docs/research/meal-memory-concierge-protocol.md`), which is formative and cannot award
retention scores. Nothing here awards the 95/100 long-term readiness score; that score
remains unavailable until the Day-180 maintenance evidence passes, and any annual claim
remains unavailable until Day 365 (plan line 667).

---

## 1. Purpose and pre-registration discipline

**Purpose.** Produce credible, pre-registered evidence about whether Revora's Learning
Journey and its optional paid maintenance path earn continued payment from users who still
receive new value — the question the 95/100 paid-retention-readiness gate exists to answer.
**[VERBATIM FROM PLAN, §2.2, line 74]:** the score "means the product has a credible and
tested reason to deserve continued payment. It does not mean 95% of subscribers will
remain."

**Pre-registration discipline.** Every field in §4, every stratum rule in §5, every
denominator rule in §6, and every threshold in §4.9 must be recorded and signed **before
the first participant is enrolled**. No threshold, exclusion, primary value event, or
success/stop rule may be added, removed, or re-defined after enrollment begins. Any change
requires a new dated pre-registration version and a recorded owner rationale; the original
remains in the record. This prevents outcome-shopping and keeps the cohort honest.

**Readiness score vs measured outcome.** **[VERBATIM FROM PLAN, §2.3, line 101]:** "No
readiness score may be presented as measured retention." This cohort produces *measured
outcomes* (§2.3 list). Those outcomes are inputs to the human scoring of §2.2; they are
never themselves reported as the score, and the score is never reported as measured
retention.

---

## 2. Enrollment precondition — Phases 0–3 must pass first

**[VERBATIM FROM PLAN, P4.5, line 644]:** "Enroll an explicit paid beta cohort only after
Phases 0–3 pass."

No enrollment begins until **every** gate below has releasable evidence recorded in the
project. The product researcher confirms each item with the named owning function; the
owner countersigns in §10.

| Gate | Requirement (from plan) | Evidence check (☐) |
|---|---|---|
| **Phase 0 — availability & operational truth** (line 354) | A stranger can reach Revora, receive a sign-in email, get support, and generate measurable events. | ☐ |
| **Phase 1 exit** (line 467) | The 100/100 scorecard's time-to-value, actionability, coverage, emotional-safety, and core trust gates have releasable evidence. | ☐ |
| **Phase 2 exit** (line 513) | No price, renewal, history, capability, cancellation, or refund promise disagrees with production behavior. | ☐ |
| **Phase 2.6 discovery gate** (line 524) | The three-week concierge Meal Memory / weekly-learning discovery gate passed its precommitted go/no-go rule (formative; clears discovery only, does not prove retention). | ☐ |
| **Phase 3 exit** (line 584) | Returning-user usability tests show the memory is correct, understandable, and useful; no reviewer mistakes it for individualized metabolic prediction. | ☐ |
| **Applicable §13 SLOs** (lines 927–940) | Public availability, request routing, first meaningful value, latency, dangerous-false-reassurance (zero), billing entitlement, history, premium contract, analytics privacy, and accessibility gates pass. | ☐ |

**[VERBATIM FROM PLAN, §13, line 944]:** "Any safety, privacy, billing, or public-availability
miss blocks broad distribution regardless of aggregate score." A miss on any of these blocks
enrollment.

---

## 3. Two products, two reporting tracks

**[VERBATIM FROM PLAN, P4.6, line 661]:** "Treat the 90-day journey and paid maintenance as
different products in cohort reporting."

This protocol therefore reports two tracks that are **never blended into a single retention
number**:

1. **Core journey (Track A)** — the 90-day Learning Journey. Retention checkpoints:
   D7 / D30 / D60 / D90.
2. **Paid maintenance (Track B)** — the optional lower-intensity maintenance path offered at
   Day 90 (plan P4.4, line 628). Retention checkpoints: D180 / D365, plus first and second
   renewal.

Graduation from the journey is a **successful outcome of Track A**, not a failure of Track B
(see §6). A user who graduates and declines maintenance is a Track A success and simply not a
Track B subject.

---

## 4. Pre-registration fields (fill-in template)

The owner, product research, and privacy approver complete and sign every field below
**before enrollment**. Blank slots (`________`) are precommitments, not post-hoc entries.

### 4.1 Target segment
- Target segment (observed behavior + user-stated job; see §5): ________
- Recruitment source(s) and channel(s): ________
- Supported audience boundary confirmed against product scope: ☐

### 4.2 Price and refund terms
**[VERBATIM FROM PLAN, P4.5, line 647]:** "price and refund terms."
- Single disclosed price, shown identically to all participants: ________
- Billing mechanic (monthly / 90-day / maintenance / pause — plan P4.4, line 640): ________
- Refund terms (published policy the participant sees): ________
- Cancellation mechanic (must be easy and measured; plan line 1040): ________

> No annual plan is offered or priced in this cohort. **[VERBATIM FROM PLAN, P4.6, line 663]:**
> "Do not make a one-year or annual-plan claim until a Day-365 cohort and annual renewal
> exist." Price tests here are monthly / 90-day / maintenance / pause only (plan line 640).

### 4.3 Primary value event
**[VERBATIM FROM PLAN, P4.5, line 648]:** "primary value event."
- **Primary value event definition** (the single pre-registered event that anchors the power
  calculation and the primary outcome; e.g., "views AND rates a weekly learning artifact
  useful"): ________
- Instrumentation source for the event (named analytics field, privacy-approved, no free
  text): ________
- "Rated useful" scale and the value that counts as useful: ________

### 4.4 Core-journey retention definitions (Track A)
**[VERBATIM FROM PLAN, P4.5, line 649]:** "D7/D30/D60/D90 definitions for the core journey."
For each checkpoint, retention = an active paid subject who meets the pre-registered activity
definition at that day (plan §2.3, line 93: "D7, D30, D60, D90 ... active paid retention").
- **D7 active-retention definition:** ________
- **D30 active-retention definition:** ________
- **D60 active-retention definition:** ________
- **D90 active-retention definition:** ________

### 4.5 Maintenance retention definitions (Track B)
**[VERBATIM FROM PLAN, P4.5, line 649]:** "D180/D365 plus first/second renewal definitions
for maintenance."
- **D180 active-retention definition:** ________
- **D365 active-retention definition:** ________
- **First renewal definition** (event + billing confirmation): ________
- **Second renewal definition** (event + billing confirmation): ________

### 4.6 Graduation and pause treatment
**[VERBATIM FROM PLAN, P4.5, line 650]:** "graduation and pause treatment."
- **Graduation is reported as a SUCCESS, not churn.** **[VERBATIM FROM PLAN, P4.6, line 664]:**
  "Report graduation as a successful journey outcome, not failed retention." A graduated user
  is removed from the churn numerator and recorded as a voluntary graduation (plan §2.3,
  line 95).
- **Pause treatment** (archive retained under the disclosed data policy; plan P4.4, line 627):
  paused subjects are tracked as a distinct state — neither active nor churned — and their
  resume/continue behavior is reported separately: ________
- Graduation trigger and export mechanic offered at Day 90 (plan P4.4, line 626): ________

### 4.7 Cohort exclusions
**[VERBATIM FROM PLAN, P4.5, line 651]:** "cohort exclusions."
- Pre-registered exclusion criteria (e.g., staff, prior concierge-study participants,
  non-supported audience, incomplete consent): ________
- Handling of subjects excluded after enrollment (documented, not silently dropped): ________

### 4.8 Minimum sample and power calculation
**[VERBATIM FROM PLAN, P4.5, line 652 & line 655]:** "minimum sample"; "Use a power
calculation based on the precommitted outcome."

**Formula (one-sample test of a proportion against a pre-registered threshold).** For a
primary outcome expressed as a proportion (the §4.3 primary value event), the minimum
per-track sample is:

```
      ( z_{1-α} · √(p0·(1−p0))  +  z_{1-β} · √(p1·(1−p1)) )²
n  =  ───────────────────────────────────────────────────────
                        ( p1 − p0 )²
```

where `p0` = the stop-threshold proportion (null), `p1` = the success-threshold proportion,
`α` = one-sided significance level, `1−β` = target power, and `z` = the standard-normal
quantile.

**Worked example — ALL INPUTS BELOW ARE ASSUMPTIONS FOR ILLUSTRATION ONLY.** The real
`p0`, `p1`, `α`, and power are set in the fill-in slots and signed before enrollment; do not
treat these numbers as the pre-registered plan.

> **ASSUMPTION (illustrative):** `p0 = 0.40`, `p1 = 0.60` (assumed effect size = 0.20
> absolute), `α = 0.05` one-sided (`z = 1.645`), power `= 0.80` (`z = 0.8416`).
>
> - `√(0.40·0.60) = 0.4899` → `1.645 · 0.4899 = 0.8059`
> - `√(0.60·0.40) = 0.4899` → `0.8416 · 0.4899 = 0.4123`
> - numerator = `(0.8059 + 0.4123)² = (1.2182)² = 1.4840`
> - denominator = `(0.60 − 0.40)² = 0.04`
> - `n = 1.4840 / 0.04 = 37.1` → **round up to 38 analyzable subjects per track.**
>
> Then inflate for expected attrition to the checkpoint and for exclusions (§4.7): if, for
> example, ~30% of enrolled subjects are lost before the primary checkpoint (another labeled
> assumption), enroll `38 / (1 − 0.30) ≈ 55`.

**Fill-in — precommitted power inputs (signed before enrollment):**
- Primary outcome the power calc is based on (must equal §4.3): ________
- `p0` (stop threshold): ________  `p1` (success threshold): ________
- Assumed effect size and its justification (**clearly labeled assumption**): ________
- `α` (one-sided/two-sided): ________  Target power (`1−β`): ________
- Computed minimum analyzable `n` per track: ________
- Assumed attrition/exclusion inflation and enrolled `n` per track: ________

> The maintenance track (Track B) has its own primary outcome and its own power calculation;
> it is not powered by borrowing the Track A sample.

### 4.9 Success / iterate / stop thresholds (precommitted)
**[VERBATIM FROM PLAN, P4.5, line 653]:** "success, iterate, and stop thresholds." These are
decided **before** enrollment and drive the decision record in §10. State each as a numeric
rule on the pre-registered primary outcome (and any pre-registered secondary outcomes).
- **SUCCESS threshold** (outcome ≥ value ⇒ proceed): ________
- **ITERATE band** (outcome between stop and success ⇒ revise product, re-run): ________
- **STOP threshold** (outcome ≤ value ⇒ halt the subscription thesis for this segment): ________
- Decision rule if Track A passes but Track B is inconclusive at the checkpoint: ________

---

## 5. Segmentation and the A1C-band analysis stratum

### 5.1 Segmentation rule
**[VERBATIM FROM PLAN, P4.5, line 657]:** "Segment by observed product behavior and
user-stated job, not inferred health severity." Recruitment, grouping, and reporting segments
are defined by **what the user does in the product and the job they say they are hiring
Revora for** — never by an inferred clinical severity.

### 5.2 A1C band as an analysis stratum only
**[VERBATIM FROM PLAN, P4.5, line 657]:** "Additionally, pre-register supported A1C band — a
variable Revora already collects — as an analysis stratum for D7/D30/D90 retention and check
frequency, so the report's high-band retention hypothesis is tested honestly instead of
silently dropped along with its invalid 45/100 score. Band stratification is analysis only;
it must never drive targeting, pricing, or copy."

Operational consequences, precommitted:
- The **supported A1C band** is pre-registered as a stratification variable for **D7 / D30 /
  D90 retention and check frequency** only.
- This tests the forensic report's high-band retention hypothesis **honestly**, rather than
  silently dropping it. Context — **[VERBATIM FROM PLAN, §1, line 20]:** the report's "45/100
  exception for a persistently-high-glucose subsegment is unsupported. The cited study used
  fasting-glucose quartiles, while Revora collects an A1C band; the study did not measure
  Revora usage, willingness to pay, or product retention."
- **Band stratification is analysis only.** It **must never** drive targeting, pricing, or
  copy. No recruitment, price, offer, nudge, or message may be conditioned on a subject's A1C
  band. The band appears only in the *analysis* of already-collected outcomes.
- No result from this stratum may be reported as a clinical finding, a prevention or
  A1C-improvement claim, or a diagnosis (plan §16, line 1005).

---

## 6. Denominator rules (survivor bias prohibited)

**[VERBATIM FROM PLAN, P4.6, line 665]:** "Report maintenance retention against all users
offered maintenance and against users who selected it; never use only the survivor
denominator."

Precommitted reporting rules:
- **Maintenance retention is reported twice, side by side:** (a) against **all users offered
  maintenance**, and (b) against **users who selected maintenance**. The survivor-only
  denominator (b alone) is **never** reported in isolation.
- **Journey vs maintenance are different products in reporting** (plan line 661); their
  denominators are never merged into a single retention figure.
- **Graduation is a success, not churn** (plan line 664, §4.6): graduated users are excluded
  from the churn numerator and reported as voluntary graduations (plan §2.3, line 95).
- **Every account state is documented separately.** **[VERBATIM FROM PLAN, §11, line 768]:**
  "Document retention separately for guest, free, paid, graduated, refunded, and deleted
  accounts."
- **No annual claim before evidence.** **[VERBATIM FROM PLAN, P4.6, line 663]:** "Do not make
  a one-year or annual-plan claim until a Day-365 cohort and annual renewal exist." Any
  long-term readiness statement waits for Day-180 maintenance evidence; any annual claim waits
  for Day-365 (plan line 667).

---

## 7. Measured outcomes to report (kept separate from the score)

The release dashboard must show both the §2.2 scorecard and the actual cohort outcomes.
**[VERBATIM FROM PLAN, §2.3, lines 92–99]**, the cohort reports:
- activation and first meaningful value;
- D7, D30, D60, D90, D180, and D365 active paid retention;
- first renewal and second renewal;
- voluntary graduation, pause, cancellation, refund, and involuntary churn;
- value events per active subscriber;
- saved-meal-memory adoption and recall;
- helpfulness and "would be disappointed" survey results;
- support contacts and trust failures.

Each is reported with its pre-registered denominator (§6) and, where applicable, by the A1C
analysis stratum (§5.2). **[VERBATIM FROM PLAN, §2.3, line 101]:** "No readiness score may be
presented as measured retention."

---

## 8. SLO tie-ins (§13 release gates)

These two §13 gates are measured inside this cohort. Their pass/fail is reported with the
measured outcomes (§7), not folded into the score.

- **Cohort value gate.** **[VERBATIM FROM PLAN, §13, line 941]:** "At least 80% of eligible
  activated beta users rate the first card useful under a precommitted missing-response rule;
  target finalized before enrollment."
  - Precommitted missing-response rule (how non-responders are counted — this is finalized
    before enrollment, not after): ________
  - Final target confirmed before enrollment: ☐

- **Day-30 new value gate.** **[VERBATIM FROM PLAN, §13, line 942]:** "At least 60% of the
  original eligible paid cohort views and rates a weekly learning artifact useful; also report
  the active-user denominator so survivor bias is visible."
  - Numerator = subjects who **view AND rate** a weekly learning artifact useful.
  - Denominator (primary) = the **original eligible paid cohort** (not survivors).
  - Denominator (also reported) = the **active-user** denominator, so survivor bias is
    visible.

---

## 9. Formative-pilot boundary

**[VERBATIM FROM PLAN, P4.5, line 655]:** "A small formative pilot can shape the product, but
it cannot award the 95/100 long-term score or support population-level retention claims."

Therefore:
- A small pilot may **shape the product** — refine the journey, the weekly artifact, the
  maintenance offer, instrumentation, and this protocol itself.
- A small pilot **cannot** award the 95/100 long-term readiness score and **cannot** support
  any population-level retention claim.
- The **95/100 long-term score remains unavailable until the Day-180 maintenance evidence
  passes, and any annual claim remains unavailable until Day 365** (plan line 667).
- A formative pilot result is never presented as a launch metric, a clinical finding, or
  regulatory evidence (plan §16).

---

## 10. Roles, sign-offs, and decision record

**Roles.**

| Role | Responsibility |
|---|---|
| **Product research (runs the cohort)** | Enrollment against pre-registered criteria, instrumentation, value-event and retention measurement, stratum analysis (§5.2), denominator reporting (§6), and outcome reporting (§7). Runs the cohort; does not decide risk acceptance. |
| **Privacy approver (sign-off before enrollment)** | Approves consent, data-handling, retention/deletion window, approved first-party environment, analytics fields (no free text / no sensitive fields; plan §13 line 939), and access list. **No enrollment begins without this signature.** |
| **Owner (decision authority)** | Confirms all Phase 0–3 gates (§2) have evidence; sets the single disclosed price and billing mechanic; approves launch; records the final success/iterate/stop decision. **[VERBATIM FROM PLAN, §14, line 969]:** owner does "risk acceptance only after the other evidence is visible." |
| **Counsel (as required, plan §3.3 / §14, line 968)** | Reviews any external-facing claim, intended-use, or scope statement before it leaves the research context. No document asserts a medical-device, prevention, or clinical result. |

**[VERBATIM FROM PLAN, §14, line 972]:** "No one role may silently stand in for another."

**Fill-in fields — completed and signed BEFORE enrollment:**
- All Phase 0–3 gates in §2 confirmed with evidence: ☐ (owner countersignature) ________
- All pre-registration fields in §4 completed and signed: ☐
- Segmentation (§5.1) and A1C analysis-stratum rule (§5.2) recorded: ☐
- Denominator rules (§6) recorded: ☐
- §8 SLO targets and missing-response rule finalized: ☐
- Single disclosed price and billing mechanic (shown identically to all): ________
- Approved first-party environment (named system): ________
- Research-data retention window and deletion procedure: ________
- Named staff with raw-meal-history / A1C access: ________
- Privacy approver signature + date: ________
- Owner approval-to-enroll signature + date: ________

**Owner decision record (completed AFTER the pre-registered checkpoint is scored):**
- Track A analyzable subjects (denominator): ____   Primary outcome value: ____
- Track B analyzable subjects, reported against BOTH denominators (§6): all-offered ____ /
  selectors ____   Primary outcome value: ____
- A1C-stratum D7/D30/D90 retention and check-frequency results (analysis only, §5.2): ________
- §8 gates: Cohort value ≥80% ☐   Day-30 new value ≥60% of original cohort ☐
- Decision: ☐ SUCCESS (proceed) ☐ ITERATE (revise + re-run) ☐ STOP (halt subscription thesis
  for this segment) — per pre-registered thresholds (§4.9)
- Confirmation that graduation counted as SUCCESS and no survivor-only denominator was
  reported (§6): ☐
- Confirmation that no 95/100 score and no annual claim was awarded from this cohort alone
  (Day-180 / Day-365 evidence still pending; §9, plan line 667): ☐
- Rationale and key evidence: ________
- Owner signature + date: ________
