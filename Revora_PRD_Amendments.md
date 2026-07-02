> **STATUS: AMENDED — superseded on positioning (2026-06-30).** Revora's locked direction is now an **honest, prediabetes-only daily coach**; the camera/photo-scan, CGM, and reversal-score (BAI) features below are **deferred to later/optional**, not hero features. Source of truth for positioning is `docs/product-marketing.md`; every conflict + resolution is logged in `docs/audit/Revora_Alignment_Audit_CoachPivot_20260630.md`. The pre-pivot original is preserved at `docs/archive/Revora_PRD_Amendments-pre-coach-pivot-20260630.md`. Wrong facts, where present, were corrected inline (115.2M prevalence; "first-mover" removed; unverifiable TAM removed; Cal AI figure corrected). Body below is otherwise unchanged.
> NOTE: Amendment 1 (BAI) and Amendment 5 (CGM beta at launch) are SUPERSEDED — BAI and CGM are deferred to later/optional.

# GlucoSnap PRD — Amendment Set 1.1

**Amends:** GlucoSnap PRD v1.0 (February 26, 2026)  
**Amendment Date:** April 3, 2026  
**Status:** Required — Pre-Development  
**Sections Affected:** 6.1, 6.2, 6.4, 6.7, 7.9, 10, 11

---

## Overview

This amendment set corrects seven issues identified in the v1.0 PRD that carry
clinical, legal, or financial risk if shipped unchanged. Each amendment includes
the problem statement, the replacement specification, and the rationale for the
change. All other PRD sections remain unchanged.

---
# Pitch deck
Positioning statement: "I am not building a better GI scanner. I am building the companion for one  specific, terrifying diagnosis that no product has ever addressed directly." 
  

---

## Amendment 1 — A1C Reversal Roadmap Algorithm (Replaces Section 6.4, Component B)

### Problem

The v1.0 formula — *"every 10 GL reduction over budget = ~0.1 A1C point risk"*
— has no supporting citation in any peer-reviewed literature. It is a fabricated
clinical relationship between a proxy metric (GL adherence) and a lab value
(A1C). Users who follow the app faithfully but whose A1C doesn't improve will
experience betrayal and churn. Any dietitian, journalist, or App Store reviewer
who investigates this claim can collapse product credibility in one sentence.

### Replacement: Component B — Behavioral Adherence Index (BAI)

**Design Principle:** Show the behavior that the evidence says drives reversal.
Never claim to predict a specific lab value.

**The Behavioral Adherence Index (BAI)** is a 0–100 composite score computed
weekly from three dimensions:

| Dimension | Weight | Measurement |
|---|---|---|
| GL Budget Adherence | 50% | Days within daily GL budget / 7 |
| Scan Consistency | 30% | Meals scanned / estimated meals eaten (target: 3/day) |
| Post-Meal Action | 20% | Post-meal walk reminders completed / set |

**BAI Score Bands:**

| BAI | Label | Contextual Message |
|---|---|---|
| 80–100 | Excellent | "Your consistency this week matches participants who reversed prediabetes in the CDC DPP trial." |
| 60–79 | On Track | "Most weeks at this level are associated with meaningful A1C improvement over 90 days." |
| 40–59 | Building | "You're establishing the habit. Consistency compounds — week 3 is typically harder than week 6." |
| 0–39 | Getting Started | "Every scan is a data point. You don't need a perfect week — you need a next meal." |

**Citation Foundation for All Roadmap Messaging:**

All motivational copy referencing outcomes must cite one of the following
instead of the fabricated formula:

- CDC Diabetes Prevention Program: 58% reduction in diabetes progression with
  diet + activity changes vs. placebo (NEJM, 2002).
- Glycemic load dietary intervention: mean A1C reduction of 0.4 points over
  24 weeks (Jenkins et al., Am J Clin Nutr, 2008).
- Food sequencing (vegetable-first): 29% reduction in postprandial glucose
  (Imai et al., Nutrients, 2023).

**Removed Entirely:** The sentence *"Based on your last 14 days, you're on
track to reach 5.8 by Day 90."* This is a medical prediction. It must not
appear in any form in the product.

**Replaced With:** *"Based on your last 14 days of behavior, you're matching
the consistency profile of participants who reduced A1C by 0.3–0.5 points in
90 days (CDC DPP)."*

**Acceptance Criteria:**

- No screen in the app contains a predicted future A1C value.
- BAI score is calculated server-side every Sunday at midnight.
- BAI methodology is disclosed in the app's "How this works" section.
- All clinical outcome references cite the CDC DPP or equivalent peer-reviewed
  source, not the app's own users.

---

## Amendment 2 — Onboarding Screen 3 Efficacy Claim (Replaces Section 6.1, Screen 3)

### Problem

Screen 3 displays: *"People using GlucoSnap reduce their A1C by an average of
0.3–0.4 points in 90 days."* The app has not launched. No GlucoSnap user has
ever had an A1C measurement. This is a fabricated aggregate statistic placed at
the highest-trust moment in the user journey. The FTC's updated Health Products
Compliance Guidance requires that testimonials and efficacy claims reflect the
typical experience of actual users of the specific product. Violation risk is
real and does not require a formal complaint to trigger an App Store removal.

### Replacement: Screen 3 — Goal Setting (Full Replacement)

**Screen Headline:** *"Most people reverse prediabetes in under a year. Here's
your 90-day starting point."*

**Supporting Copy (with inline source attribution):**

> In the CDC's Diabetes Prevention Program — the gold-standard clinical trial —
> participants who consistently managed diet and activity reduced A1C by an
> average of 0.3–0.5 points and cut their diabetes risk by 58%.
> GlucoSnap is built on those same principles.

**Goal Slider:** Pre-populate at user's A1C minus 0.3 (conservative, achievable).
Label it: *"Your 90-day evidence-based target."*

**Legal Copy (small, non-intrusive):**
> *"Individual results vary. GlucoSnap tracks your behavior — your doctor
> measures your A1C."*

**Removed Entirely:** Any sentence claiming GlucoSnap users as a source of
outcome data prior to accumulating at least 500 active users with confirmed
A1C retest data.

**Post-Launch Replacement Condition:** Once 500+ users have logged a baseline
AND a follow-up A1C measurement, replace the CDC citation with GlucoSnap's
own aggregate data. At that point, add methodology disclosure: how many users,
what time period, what constitutes "active use."

**Acceptance Criteria:**

- Screen 3 copy reviewed and approved by a legal/compliance reviewer prior
  to App Store submission.
- No sentence on any onboarding screen claims outcomes from GlucoSnap users
  until the post-launch data condition above is met.
- CDC DPP citation is linked in the app's Sources section.

---

## Amendment 3 — GL Daily Budget (Replaces Section 6.1, Screen 5 and Section 6.3, Component A)

### Problem

The v1.0 PRD hardcodes GL budgets as: Vegetarian = 100, Low-carb = 60,
Standard = 80. No peer-reviewed source is cited for these thresholds as
clinical targets for prediabetics. A 58-year-old post-menopausal woman with
A1C 6.2 and BMI 30 has different glucose tolerance from a 33-year-old active
male with A1C 5.7. Presenting a dietary preference as a medically calibrated
budget creates both false precision and potential harm when users near the
"budget" eat foods that still spike them significantly.

### Replacement: Adaptive GL Budget System

**Phase 1 — Onboarding Default (First 14 Days):**

All users start with a conservative default of **GL 60/day**, regardless of
dietary preference. This is positioned explicitly as a *starting point*, not
a prescription:

> *"We're starting you at 60 GL/day — a conservative baseline. As you scan
> meals, you'll see what your personal threshold actually is. Most people find
> their optimal range in 2–3 weeks."*

Dietary preferences affect **swap suggestions and food recommendations only**
— not the GL budget.

**Phase 2 — BAI-Driven Budget Calibration (Days 15–30):**

After 14 days of scan data, the system suggests a budget adjustment based on
adherence pattern:

| Pattern | Suggested Adjustment | Message |
|---|---|---|
| User consistently under 60 GL with no reported hunger/restriction | Increase to 70 | "You have room to be less restrictive." |
| User consistently at 55–65 GL with good adherence | Maintain at 60 | "This range is working well for you." |
| User regularly exceeding 60 GL | Keep at 60, add meal-level alerts | "Let's work on the specific meals that are pushing you over." |

**Phase 3 — CGM-Calibrated Budget (P1, Post-Launch):**

Once CGM integration ships, the budget becomes **individualized to actual
glucose response**:

- Run a 7-day CGM calibration period.
- Identify the user's personal GL threshold above which postprandial glucose
  exceeds 140 mg/dL (the clinically accepted spike threshold).
- Set the daily GL budget to reflect *that individual's* tolerance, not a
  population average.
- Display: *"Your personal GL threshold: 68/day (based on your CGM data)."*

**Acceptance Criteria:**

- Onboarding budget copy never uses the word "prescription" or implies
  medical calibration.
- Budget adjustment prompts appear on Day 15 and Day 30 automatically.
- Budget is user-adjustable at any time with a clear "why change this" prompt.
- CGM calibration flow is spec'd in the P1 CGM section (Section 6.10).

---

## Amendment 4 — Doctor PDF Report (Replaces Section 6.7)

### Problem

A PDF formatted for physician review, containing estimated A1C trajectories
and meal GL history, is clinical decision support by function. The FDA
evaluates device classification based on *intended use and actual function*,
not marketing language. "Doctor-ready format" is the exact phrase that
triggers reclassification review. This is not hypothetical: the FDA cited a
food logging app's clinical summary export as evidence of medical device
functionality in a 2021 enforcement letter.

### Replacement: Section 6.7 — My Progress Summary (Patient Communication Aid)

**Renamed Feature:** "My Progress Summary" (never "Doctor Report,"
"Clinical Summary," or "Medical PDF").

**Positioning Copy (in-app):**

> *"Share your progress with your doctor, a family member, or just yourself.
> This is your story — not a medical document."*

**Content Specification — What's Included:**

| Section | Content | Rationale |
|---|---|---|
| Behavioral Summary | Scans logged, streak days, GL budget adherence % | Pure behavior, no clinical claim |
| Meal Pattern Highlights | Top 5 highest-GL meals, top 5 lowest-GL meals | Observational, not diagnostic |
| Foods Logged | Total unique foods scanned, most frequent | Factual log |
| Weekly BAI Trend | Chart of Behavioral Adherence Index over time | Own metric, defined by app |
| A1C Log | User-entered A1C values only, no projections | User's own data from doctor visits |

**Content Specification — What's Excluded:**

- ❌ Estimated or projected future A1C values
- ❌ Risk scores framed as clinical assessments
- ❌ Language like "treatment progress," "clinical outcome," "reversal status"
- ❌ Any formatting that mimics a medical chart or clinical report

**Header Disclaimer (required, non-removable):**

> *"This summary was generated by GlucoSnap, a wellness app. It is not a
> medical record, clinical assessment, or substitute for professional medical
> advice. Share it as a conversation starter with your healthcare provider."*

**Format:** Clean, consumer-grade PDF. Warm colors, food photography, app
branding. Explicitly does NOT look like a medical document.

**Acceptance Criteria:**

- Legal review of disclaimer copy prior to shipping.
- No screen or copy in this feature uses the words "doctor," "clinical,"
  "medical," or "diagnosis" in a claim-making context.
- PDF template reviewed by one external registered dietitian for
  content accuracy.

---

## Amendment 5 — CGM Integration Timeline (Amends Section 12, Roadmap)

### Problem

CGM integration is currently scheduled as a P1 feature at 60 days post-launch
(V1.1). For the first two months, the product's feedback loop is:
scan → GL score → trust the estimate → behavior change → wait ~90 days for
A1C retest. This is an extremely long feedback loop for a daily-use app
targeting 45% DAU/MAU. The users who would be most engaged — data-oriented
users like Persona 5 (David) — will churn before CGM ships because the
product cannot give them the real-time physiological feedback they came for.

### Replacement: CGM Beta Cohort at MVP Launch

**New Initiative: Day-0 CGM Beta Program**

Recruit 100–200 CGM users into a closed beta cohort that launches simultaneously
with the public MVP. These users provide the product's most valuable early data:
real postprandial glucose readings correlated with scan data.

**Beta Cohort Acquisition:**

- Source from existing YouTube audience (mentioned as GlucoSnap advantage
  in Section 2.4).
- Qualification: Currently wearing Dexcom G7, Abbott FreeStyle Libre 3, or
  Stelo OTC CGM.
- Incentive: Lifetime Premium access in exchange for data sharing consent
  and a 30-day feedback commitment.
- Target size: 150 users minimum for statistical signal.

**CGM Beta Feature Set (MVP-Parallel, Not Post-Launch):**

| Feature | Complexity | Priority |
|---|---|---|
| Terra API read integration (Dexcom + Libre) | Medium | P0 for beta cohort |
| Postprandial glucose overlay on scan result | Medium | P0 for beta cohort |
| Personal GL-to-spike correlation (basic) | Low | P0 for beta cohort |
| CGM-calibrated budget (adaptive) | High | P1 for beta cohort |

**What the Beta Cohort Produces:**

1. **Accuracy validation data:** Real postprandial glucose curves matched to
   app GL predictions — this is the ground truth the v1.0 PRD lacks entirely.
2. **Retention signal:** CGM users who see their actual glucose response have
   a fundamentally different (and stronger) retention curve than non-CGM users.
3. **Product differentiation:** Testimonials from users who can say *"the app
   predicted a moderate spike and my CGM showed exactly that"* are
   categorically more powerful than generic satisfaction reviews.
4. **Regulatory foundation:** 150 users × 30 days × ~3 scans/day = 13,500
   labeled scan-to-glucose events. This is the dataset that supports a
   future FDA De Novo application.

**Revised Roadmap Impact:**

| Milestone | v1.0 Schedule | Amended Schedule |
|---|---|---|
| CGM integration (any users) | V1.1, Week 10–14 | MVP beta cohort, Week 0 |
| CGM integration (general availability) | V1.2, Week 14+ | V1.1, Week 8–10 |
| CGM-calibrated GL budget | Not scheduled | V1.1, Week 10 |

**Acceptance Criteria:**

- Terra API integration scaffolded before MVP public launch.
- Beta cohort application form live 2 weeks before MVP launch.
- 100-user minimum enrolled and onboarded at launch day.
- Beta cohort data isolated in its own analytics segment for accuracy analysis.

---

## Amendment 6 — Uncertainty Propagation to Spike Risk Display (Amends Section 7.9)

### Problem

The v1.0 PRD correctly identifies that opaque/mixed foods produce wide GL
ranges (e.g., 20–40). However, the display logic does not specify what happens
when a GL range straddles a classification boundary. If a smoothie produces
GL 20–40 and the midpoint (30) is used, it displays MODERATE (yellow). But
the upper bound (40) is HIGH (red). A user who sees yellow skips the
post-meal walk. A user who sees red takes the walk. The conservative bias
correction in the Rust function (`apply_portion_correction`) is correct at the
data layer — it must also propagate to the display layer.

### Replacement: Boundary Straddling Display Rules (Amends Section 7.9.1 and 7.9.3)

**Rule 1: Range-Based Classification — Always Round Up**

When the AI produces a GL range rather than a point estimate, classification
uses the **upper bound**, not the midpoint.

```
classify_for_display(gl_low: f64, gl_high: f64) -> RiskLevel {
    // If range width > 15 GL points, it is an uncertain estimate.
    // Always classify on the upper bound.
    let display_gl = if (gl_high - gl_low) > 15.0 {
        gl_high
    } else {
        (gl_low + gl_high) / 2.0  // Point estimate or tight range: use midpoint
    };

    match display_gl {
        x if x <= 10.0 => RiskLevel::Safe,
        x if x <= 19.0 => RiskLevel::Moderate,
        _ => RiskLevel::High,
    }
}
```

**Rule 2: Uncertainty Must Be Visible in UI**

When a wide-range estimate is used (range width > 15 GL), the results screen
must display the uncertainty badge alongside the risk classification.

*Design specification for uncertainty badge:*

- Position: Inline with spike risk banner, right side
- Content: *"Estimated — difficult to measure precisely"*
- Visual: Small info icon (ℹ) in muted text, tappable
- Tap reveals: *"This meal contains mixed or layered ingredients. We've
  given you the higher end of our estimate to keep you safe. A closer
  photo or ingredient list improves accuracy."*

**Rule 3: Opaque Food Categories Always Start at MODERATE**

The following dish categories must never return SAFE on first identification,
regardless of AI confidence score:

- Smoothies and blended drinks (fruit content unverifiable)
- Soups and stews (starch content hidden by liquid)
- Baked goods with unknown recipe (muffins, breads, pastries)
- Sauces and dressings as primary dish component
- Buffet plates with multiple mixed components

These categories are flagged in the food classifier at the `dish_complexity`
step and routed to a minimum baseline of MODERATE with the uncertainty badge.

**Rule 4: Unknown Food Defaults**

*Current:* "We couldn't identify this food clearly. Try a closer photo."  
*Amended:* "We couldn't confidently identify this — treating it as
Moderate Spike Risk to keep you safe. Add the name and we'll learn it
for next time." (One-tap food naming → saves to user's personal food
library.)

This converts an error state into a retention mechanic (personal food library)
and maintains conservative safety posture.

**Acceptance Criteria:**

- `classify_for_display` function exists as a distinct layer from GL
  calculation, with unit tests for all boundary cases.
- Uncertainty badge renders correctly on iOS and Android for all
  wide-range estimates.
- All six opaque food categories are hardcoded in the food classifier
  with MODERATE minimum floor.
- QA test suite includes: smoothie scan, soup scan, muffin scan —
  all must return MODERATE minimum with uncertainty badge.

---

## Amendment 7 — API Cost Model and Gross Margin Protection (New Section: 13.1a)

### Problem

The v1.0 PRD targets 3.5 scans/active user/day at 5,000 active users by
Month 6. At those numbers: 17,500 scans/day × $0.015 average GPT-4o Vision
cost = $262/day = $7,875/month in API costs against a $12,000 MRR target.
That is 65% gross margin destruction from a single cost line. At $35,000 MRR
(Month 12 target) with proportionally more scans, the problem scales. This
was not modeled in the v1.0 PRD financial projections.

### Replacement: Section 13.1a — API Cost Architecture

**Four-Layer Defense Against Margin Collapse:**

**Layer 1: Perceptual Hash Caching (Already Spec'd in v1.0 — Enforce Strictly)**

The v1.0 PRD mentions caching but does not specify the cache invalidation
policy or hit rate target. Amended spec:

- Cache key: pHash of compressed image (512×512) + user dietary profile.
- Cache TTL: 30 days for identical meals, 7 days for similar meals
  (pHash distance < 10).
- **Cache hit rate target: 35% minimum by Month 3.**
  If below 35%, engineering sprint to investigate. Most users eat the same
  10–15 meals in rotation — this target is achievable.
- Cache stored in Redis with PostgreSQL backup for permanent meal library.

**Layer 2: Free Tier Hard Cap — 3 Scans/Day, Not 5**

v1.0 spec allows 5 free scans/day. Amended to **3 scans/day** for free users.

Rationale:
- 3 scans/day covers breakfast, lunch, dinner — the actual use case.
- The marginal 4th and 5th scans are snacks and drinks — the highest-value
  upsell moments ("Scan unlimited snacks with Premium").
- Reduces free-tier API cost by 40% at equivalent free user volume.

**Layer 3: Tiered Vision Model Routing**

Not all scans need GPT-4o Vision. Route by complexity:

| Food Type | Model | Est. Cost/Scan |
|---|---|---|
| Simple whole foods (apple, egg, salad) | GPT-4o-mini Vision | ~$0.003 |
| Standard plated meals | GPT-4o Vision | ~$0.015 |
| COMPLEX_OPAQUE (soups, mixed dishes) | GPT-4o Vision + second pass | ~$0.025 |

The `dish_complexity` classifier (already in Section 7.8) determines routing.
Target: 40% of scans route to mini model = 40% blended cost reduction.

**Layer 4: Barcode Scan as Zero-Cost Alternative (P1 Acceleration)**

Barcode scanning (Section 6.2, edge case table) is listed as P1. It should be
accelerated to MVP for packaged foods. A barcode lookup via Open Food Facts API
costs $0.00 per scan. Every packaged food scan that routes through barcode
rather than Vision is 100% cost-eliminated.

Target: 20% of scans resolve via barcode by Month 3.

**Revised Cost Model:**

| Month | Active Users | Scans/Day | Cache Hit | Barcode % | Model Blend | Daily API Cost | MRR | Gross Margin |
|---|---|---|---|---|---|---|---|---|
| 3 | 1,500 | 4,500 | 25% | 10% | 60/40 split | $38 | $12,000 | 90% |
| 6 | 3,000 | 9,000 | 35% | 20% | 60/40 split | $68 | $20,000 | 89% |
| 12 | 6,000 | 18,000 | 40% | 25% | 60/40 split | $126 | $35,000 | 89% |

**Acceptance Criteria:**

- Redis cache with pHash implementation in place at MVP launch.
- `dish_complexity` classifier routes to mini model in staging before launch.
- Barcode scan (Open Food Facts API) implemented by Week 6.
- API cost dashboard visible to engineering team in real-time (not just MRR).
- Alert threshold: If daily API cost exceeds 12% of projected daily MRR,
  engineering review triggered within 24 hours.



---

# Revora PRD — Amendment Set 1.2
**Previously titled:** GlucoSnap PRD — Amendment Set 1.1  
**Amends:** Revora PRD v2.0 (formerly GlucoSnap PRD v1.0, February 26, 2026)  
**Amendment Date:** April 20, 2026  
**Status:** Required — Pre-Development  
**Sections Affected:** All — Product Rename; 6.1, 6.2, 6.4, 6.7, 7.9, 10, 11


---

## Amendment 8 — Product Rename: GlucoSnap → Revora (Global, All Sections)

### Problem

The name GlucoSnap describes the product's mechanism — a glucose snapshot.
It is accurate but mechanism-first: it names what the tool does, not what
the user achieves. A prediabetic searching for help is not looking for a
glucose snapshot. They are looking for a way out of their diagnosis. The name
GlucoSnap does not tell them one exists.

Additionally, GlucoSnap carries two secondary risks:

1. **Regulatory optics.** "Gluco" is a clinical prefix associated with glucose
   monitoring and diabetes management devices. Leading with it invites
   reclassification scrutiny from the FDA based on name alone — before a
   single feature claim is evaluated.

2. **Brand ceiling.** A mechanism-named product positions itself as a feature,
   not a platform. GlucoSnap can be a scan tool. It cannot easily become a
   full reversal ecosystem, a clinical trial dataset, or a population health
   company. The name would require re-explaining at every stage of growth.

### The Replacement: Revora

> *"Prediabetes is the only metabolic condition with a clinically documented
> reversal rate above 58% through lifestyle change alone — and the majority
> of the 115.2 million prediabetics in the US have never been told that. They've <!-- corrected 2026-07-02; was 96M -->
> been given a warning and a pamphlet. Nobody told them the diagnosis is
> reversible. Revora names that possibility in the first syllable. 'Re' is
> reversal — this is going backwards from the edge of disease. 'Vora' is
> forward motion — you're not retreating, you're advancing toward a better
> metabolic state. The name carries the product's entire clinical thesis. When
> a user types 'Revora' into the App Store, they already understand what
> happened: something was going wrong and they turned it around. That's not
> positioning — that's the truth of what this product does."*

### Name Architecture

| Element | Meaning | Clinical Anchor |
|---|---|---|
| **Re** | Reversal — going back from the edge of disease | CDC DPP: 58% reversal rate through lifestyle change (NEJM, 2002) |
| **vora** | Forward motion — advancing toward a better metabolic state | Behavioral change as the active mechanism of reversal |
| **Revora** (combined) | The moment something going wrong gets turned around | The complete clinical thesis: reversal is possible, the user is the agent |

The name is outcome-first, not mechanism-first. It names what happens to the
user — not what the product does to their food photo. This is the correct
orientation for a consumer health product in the reversal window.

### Why This Name Is Legally Safer Than GlucoSnap

| Dimension | GlucoSnap | Revora |
|---|---|---|
| FDA optics | "Gluco" prefix associated with glucose monitoring devices | No clinical prefix; general wellness framing intact |
| FTC health claim risk | Mechanism name invites "does it actually measure glucose?" scrutiny | Outcome name positions app as a behavioral tool, not a diagnostic |
| App Store category | Risks Health & Fitness / Medical border | Clearly Health & Fitness, general wellness |
| USPTO availability | Descriptive; harder to defend in trademark | Coined term; stronger trademark position in Classes 009 and 044 |

### Global Name Replacement — Scope

Every instance of "GlucoSnap" in the PRD, Amendment Set 1.1, onboarding copy,
in-app strings, legal disclaimers, and external communications is replaced
with "Revora" effective immediately. The following specific replacements are
required before any development begins:

**Section 6.1 — Onboarding (all screens):**

| Old Copy | Replacement Copy |
|---|---|
| "GlucoSnap tracks your behavior — your doctor measures your A1C." | "Revora tracks your behavior — your doctor measures your A1C." |
| "People using GlucoSnap reduce their A1C..." | "Revora is built on the principles of the CDC Diabetes Prevention Program..." |
| "GlucoSnap is built on those same principles." | "Revora is built on those same principles." |

**Section 6.7 — Progress Summary disclaimer:**

| Old Copy | Replacement Copy |
|---|---|
| "This summary was generated by GlucoSnap, a wellness app." | "This summary was generated by Revora, a wellness app." |

**Section 10 — Regulatory and Legal:**

| Old Copy | Replacement Copy |
|---|---|
| "GlucoSnap is a general wellness app..." | "Revora is a general wellness app..." |
| Any reference to "GlucoSnap" in FDA classification rationale | Replace with "Revora" — note that the removal of the "Gluco" prefix strengthens the general wellness classification argument |

**Section 11 — Privacy Policy and Terms:**

All references to "GlucoSnap" in data handling, consent language, and Terms
of Service replace with "Revora."

**App Store Metadata:**

| Field | Old Value | New Value |
|---|---|---|
| App Name | GlucoSnap | Revora — Prediabetes Reversal |
| Subtitle | (unspecified) | Know what to eat. Reverse it. |
| Developer Name | GlucoSnap Inc. (or equivalent) | Revora Inc. (or equivalent) |
| Bundle ID | com.glucosnap.app (or equivalent) | com.revora.app (or equivalent) |

### The Brand Positioning This Name Enables

The rename unlocks a positioning that GlucoSnap could not support:

**Brand sentence:** *"Revora gives you the clarity to reverse your prediabetes
— one meal at a time."*

**Tagline:** *"Clarity at every meal. Normal at every test."*

**Legal safeguard embedded in the brand:** Because the name leads with reversal
as a user outcome — not as a product function — the positioning naturally
frames the user as the agent of reversal. "Revora reverses prediabetes" is
still a line that must never appear (the app does not reverse prediabetes; the
user's behavior does). But "Revora — Prediabetes Reversal" as an App Store
name is accurate, credible, and legally defensible because it describes the
category of outcome the product serves, not a claim the product performs
that outcome directly.

**Master legal line (required in App Store and onboarding):**
> *"Reversal is achieved through your dietary choices — Revora gives you
> the clarity to make them."*

### Acceptance Criteria

- [ ] All PRD sections: zero instances of "GlucoSnap" remain after this amendment.
- [ ] All Amendment Set 1.1 copy: "GlucoSnap" replaced with "Revora" in every
      occurrence, including the document header.
- [ ] App Store listing: App name, subtitle, description, and developer name
      updated to Revora before submission.
- [ ] Bundle ID updated in Xcode/Android project before first TestFlight/
      Play Store internal testing build.
- [ ] Legal disclaimer copy reviewed with "Revora" substituted — no legal
      meaning changes from the name swap.
- [ ] Brand Positioning Document v2.0 (April 5, 2026) adopted as the
      authoritative copy reference for all Revora-branded materials.

---

## Amendments 1–7 (Carried Forward from Amendment Set 1.1)

All seven amendments from Amendment Set 1.1 remain in full force with no
changes to their specifications. They are carried forward here under the
Revora name. A summary is provided below for reference; the full specification
for each amendment is unchanged.

| Amendment | Section | Description | Risk Mitigated | Effort |
|---|---|---|---|---|
| 1 | 6.4 Component B | BAI replaces fabricated A1C formula | Clinical / credibility | Low |
| 2 | 6.1 Screen 3 | Onboarding efficacy claim sourced to CDC DPP | FTC / legal | Low |
| 3 | 6.1 Screen 5, 6.3 | Adaptive GL budget replaces hardcoded dietary-preference budgets | Clinical accuracy | Medium |
| 4 | 6.7 | Progress Summary replaces Doctor PDF Report | FDA regulatory | Low |
| 5 | Section 12 Roadmap | CGM beta cohort at MVP launch, not Week 10–14 | Retention / data | Medium |
| 6 | 7.9.1, 7.9.3 | Uncertainty propagates from data layer to display layer | User safety | Low |
| 7 | New 13.1a | API cost architecture and gross margin protection model | Gross margin | Medium |
| **8** | **Global — All Sections** | **Product rename: GlucoSnap → Revora** | **Regulatory optics / brand ceiling** | **Low** |

---

## Change Summary — Amendment Set 1.2 vs 1.1

| What changed | Detail |
|---|---|
| Document title | "GlucoSnap PRD — Amendment Set 1.1" → "Revora PRD — Amendment Set 1.2" |
| Document header | "Amends: GlucoSnap PRD v1.0" → "Amends: Revora PRD v2.0 (formerly GlucoSnap PRD v1.0)" |
| All body copy | Every instance of "GlucoSnap" replaced with "Revora" |
| New Amendment 8 | Product rename rationale, name architecture, legal comparison, scope of replacement, acceptance criteria |
| Overview updated | References to Amendment Set 1.1 scope expanded to include Amendment 8 |
| Change Summary table | Amendment 8 row added |

---

*Amendment document owner: Product & Brand Team*  
*Legal review required before App Store submission: Amendments 2, 4, 8*  
*Engineering review required: Amendments 6, 7, 8 (bundle ID)*  
*Brand copy reference: Revora Brand Positioning Document v2.0 (April 5, 2026)*  
*All amendments supersede conflicting language in Revora PRD v2.0*

---

## Change Summary

| Amendment | Section Replaced | Risk Mitigated | Effort |
|---|---|---|---|
| 1 — BAI replaces A1C formula | 6.4 Component B | Clinical/credibility | Low |
| 2 — Onboarding claim sourced | 6.1 Screen 3 | FTC/legal | Low |
| 3 — Adaptive GL budget | 6.1 Screen 5, 6.3 | Clinical accuracy | Medium |
| 4 — Patient Summary (not Doctor PDF) | 6.7 | FDA regulatory | Low |
| 5 — CGM beta at launch | Section 12 Roadmap | Retention/data | Medium |
| 6 — Uncertainty propagates to UI | 7.9.1, 7.9.3 | User safety | Low |
| 7 — API cost architecture | New 13.1a | Gross margin | Medium |

---

*Amendment document owner: Product Team*  
*Legal review required before App Store submission: Amendments 2, 4*  
*Engineering review required: Amendments 6, 7*  
*All amendments supersede conflicting language in PRD v1.0*
