<!-- Updated: Revora Amendment Set 1.2 + Brand Positioning v2.0 — April 2026 -->
# Revora Five-Dimension Feasibility Analysis

**Version:** 1.0  
**Date:** March 2026  
**Classification:** Board-Level Deliverable — Decision-Ready  
**Source Documents:** Revora PRD v1.0, Revora Technical Specification v1.0, Revora Deep Audit Report  
**Prepared by:** Strategic Analysis Team

---

## How to Read This Document

Each dimension is scored on a 1–10 scale. Scores ≥7 = **GO**, 5–6 = **CONDITIONAL GO** (fixable risks), ≤4 = **NO-GO** (blockers present). Every claim cites a document section or external benchmark. Blockers vs. risks are explicitly distinguished.

**Scoring Legend:**
- **9–10:** Strong advantage, minimal risk
- **7–8:** Feasible with manageable risk
- **5–6:** Feasible but significant risks require mitigation before launch
- **3–4:** Serious concerns; pivot or restructure recommended
- **1–2:** Non-viable without fundamental redesign

---

# DIMENSION 1: DEVELOPMENT FEASIBILITY

**Question answered:** Can this team build this product, at this quality level, in this timeline, with this stack?

**Dimension Score: 6.5 / 10 — CONDITIONAL GO**

---

## 1.1 Technical Stack Assessment

### 1.1.1 Frontend: React Native (Expo SDK 52)

| Factor 			| Assessment 											| Risk 	|
|--------			|-----------											|------|
| Framework maturity 		| Expo SDK 52, React Native ≥0.74 (New Architecture) — PRD §7.1, Spec §PLT-001 			| Low |
| Cross-platform coverage 	| Single codebase for iOS 15+ / Android 11+ — Spec §REQ-019 					| Low |
| Camera integration 		| Expo Camera + Image Picker — PRD §7.1 							| Low–Medium |
| Bundle size constraint 	| ≤50MB target (Spec §CON-003); Spec §7 notes 45MB estimate 					| Low |
| Native module risk 		| Expo managed workflow limits native modules; camera, barcode, CGM may require ejection 	| **Medium** |
| State management 		| Zustand — lightweight, proven — PRD §7.1 							| Low |

**Assessment:** React Native with Expo is a sound choice for MVP speed. The 40–50% development time reduction vs. native (Spec §7, Design Decision 1) is validated by industry benchmarks. **Key risk:** Expo managed workflow may constrain advanced camera features (plate overlay calibration — PRD §7.9.1 Tier 1) and CGM integration (PRD §6.10, Terra SDK). If ejection to bare workflow becomes necessary, add 1–2 weeks to timeline.

**External benchmark:** Cal AI, the closest comparable product ($2M MRR — PRD §2.2), ships on React Native, validating the framework choice for photo-based food scanning apps.

### 1.1.2 Backend: Rust + Axum

| Factor | Assessment | Risk |
|--------|-----------|------|
| Performance fit | Compiled Rust critical for sub-5s scan latency (Spec §PER-001) | Advantage |
| Concurrency | Tokio async runtime handles 1,000+ concurrent scans (Spec §PER-006) | Advantage |
| Memory safety | Zero-cost abstractions, no GC pauses — critical for health data (Spec §7, DD2) | Advantage |
| Ecosystem maturity | Axum stable, SQLx proven, but ecosystem smaller than Node.js/Go | **Medium** |
| Hiring/contributor risk | Rust developer pool ~3% of Node.js pool (Stack Overflow 2024 Survey) | **Medium–High** |
| Compile times | 10–15 min full build acknowledged (Spec §7, DD2) | Low (CI mitigates) |

**Assessment:** Rust is technically superior for this workload but creates a **key-person dependency** — Spec §7 DD2 notes "Backend engineer has Rust production experience from previous trading bot project." If this person becomes unavailable (Risk 8, PRD §14.4), Rust backend maintenance becomes a blocker. The hiring pool for Rust developers is shallow and expensive.

**Verdict:** Technically excellent, organizationally risky. **Recommendation:** Document architecture decisions and maintain comprehensive API documentation from Day 1 to reduce bus factor.

### 1.1.3 Database & Infrastructure

| Component | Choice | Risk Assessment |
|-----------|--------|----------------|
| PostgreSQL 16 | ACID compliance essential for health data, JSONB hybrid approach — Spec §4.3, §7 DD3 | Low |
| Redis 7 | Cache-aside pattern for scan results, 7-day TTL — Spec §4.4 | Low |
| Cloudflare R2 | S3-compatible, signed URLs, $0.015/GB/mo — Spec §SVC-003 | Low |
| Railway.app | Docker hosting, auto-scaling — Spec §INF-001. $20/mo base | Low–Medium |

**Assessment:** Infrastructure choices are appropriate and cost-effective for MVP scale. Railway.app is the weakest link — it's a smaller platform vs. AWS/GCP. At 10K+ MAU, migration to a Tier-1 cloud provider may be necessary. **Not a blocker.**

### 1.1.4 AI Integration: OpenAI GPT-4o Vision

| Factor | Assessment | Risk |
|--------|-----------|------|
| Food recognition accuracy | 74% with optimized prompts (Diabot study, PRD §7.8.1 [16]) | **Medium** |
| Carbohydrate MAPE | 15–20% with custom config (PRD §7.8.1) vs. 47.9% raw (PRD §7.8.2 [18]) | **Medium–High** |
| Vendor lock-in | Single-provider dependency on OpenAI — PRD §14.1 Risk 2 | **Medium** |
| Cost per scan | $0.01–$0.15 range cited inconsistently (PRD §7.11 vs. §9.4 vs. Spec §CON-001) | **Medium** |
| Latency | 2–5 seconds API response (Spec §7, DD4) within 5s P95 budget (Spec §PER-001) | Low–Medium |
| Two-pass architecture cost | +$0.02–0.04/scan for ~30% of scans (PRD §7.9.2 H6) | Low |

**BLOCKER IDENTIFIED — Accuracy Floor:**

The 74% food recognition accuracy (PRD §7.8.1) means **1 in 4 foods may be misidentified**. For a health-critical application where underestimation is the dangerous [REVIEW NEEDED: Replace restriction-framing with permission-first language] direction (PRD §7.8.2), this creates a safety and trust risk. The PRD's own mitigation architecture (complexity classifier, bias correction, confidence scoring, human-in-the-loop — PRD §7.9) is well-designed but adds significant implementation complexity to an 8-week MVP timeline.

**Specific concern:** The Gothenburg study shows 47.9% carbohydrate MAPE (PRD §7.8.2 [18]), meaning a 50g carb meal could range 26–74g. While the PRD correctly argues directional accuracy (Safe/Moderate/High) matters more than precision (PRD §7.8.3), boundary cases (GL 18 vs. GL 22 — Safe vs. Moderate) will produce frequent misclassifications.

**Mitigation path:** The PRD's layered accuracy solutions (§7.9.1–7.9.2) are sound. Implementing the top 3 (complexity classifier, master prompt, conservative fallback — PRD §12.1 Table) in Day 1 as specified is achievable and addresses the worst failure modes. The remaining solutions add 1–2 weeks of effort beyond the stated estimates.

---

## 1.2 Timeline Realism Assessment

### 1.2.1 PRD's 8-Week MVP Sprint (PRD §12.1)

| Week | Planned Work | Realistic Estimate | Delta |
|------|-------------|-------------------|-------|
| 1 | Backend API scaffold, PostgreSQL, auth, Redis | 1.5 weeks | +0.5w |
| 2 | OpenAI integration, complexity classifier, R2 storage | 1.5 weeks | +0.5w |
| 3 | RN/Expo setup, camera, plate overlay, scan results UI | 1.5 weeks | +0.5w |
| 4 | Dashboard, meal history, onboarding, confidence scoring | 1 week | On track |
| 5 | A1C roadmap, sequencing, swaps, bias correction | 1.5 weeks | +0.5w |
| 6 | RevenueCat, paywall, subscriptions, dish name shortcut | 1 week | On track |
| 7 | Push notifications, walk reminders, streaks, editable portions | 1 week | On track |
| 8 | Beta testing (50 users), accuracy validation, bug fixes, App Store submission | 2 weeks | **+1w** |

**Realistic MVP timeline: 11–12 weeks** (vs. 8 weeks planned)

**Key discrepancies:**

1. **Week 8 is critically under-scoped.** Beta testing with 50 users, accuracy validation against 50 real meals, bug fixes, AND App Store submission cannot fit in 1 week. App Store review alone takes 2–5 days (Spec §CON-005). Realistically: 2 weeks for beta + fixes, then 1 week for store submission.

2. **Accuracy features add hidden work.** PRD §12.1 lists 9 accuracy features totaling ~12 days of estimated effort. Several are scheduled in Weeks 2–4 concurrent with core feature development. On a solo/small team, parallelizing these with core features is unrealistic.

3. **Integration testing gap.** No time allocated for end-to-end integration testing between frontend ↔ backend ↔ OpenAI ↔ RevenueCat. This typically requires 3–5 days for a system with this many external dependencies.

4. **The PRD contains two different development roadmaps** — §12.1 (8-week sprint with accuracy features) and the earlier §12.1 (15-week, 4-phase plan at lines 2870–2943). These are internally inconsistent. The 8-week sprint appears to be a compressed version that omits Phase 3 (monetization + polish) and Phase 4 (launch), which together add 3 weeks.

**Verdict: The 8-week timeline is optimistic by 30–50%.** A realistic MVP delivery is **11–13 weeks** for a solo developer or **9–10 weeks** for a 2-person team. This is a **risk, not a blocker** — the work is achievable, just not in the stated timeframe.

### 1.2.2 Team Size Assessment

The PRD references a "Product and Engineering Team" (PRD §1.0 Document Owner) but Risk 8 (PRD §14.4) explicitly identifies **solo founder risk**. The technical specification requires expertise across:

- Rust backend development
- React Native / Expo frontend
- OpenAI API prompt engineering
- PostgreSQL database design
- DevOps (GitHub Actions, EAS Build, Railway)
- RevenueCat integration
- App Store submission compliance

**Assessment:** A single full-stack developer with Rust + React Native experience can build this MVP, but the **quality and timeline claims are incompatible with solo execution.** The PRD's own hiring plan (PRD §14.4) — part-time support at Month 2, contract designer at Month 3, fractional RN developer at Month 6 — confirms the team is undersized for the ambition.

**Recommendation:** Budget for 1 additional contract developer (React Native) for Weeks 3–8 to parallelize frontend and backend work. Estimated cost: $15,000–$25,000. This investment compresses the timeline back toward the 8–9 week target.

---

## 1.3 Technical Debt & Scalability

### 1.3.1 Known Technical Debt at Launch

| Debt Item | Source | Severity | When to Address |
|-----------|--------|----------|----------------|
| camelCase vs. snake_case API inconsistency | PRD §7.5 uses snake_case, Spec §4.1 uses camelCase | Medium | Pre-launch (establish convention) |
| Spike risk terminology inconsistency | PRD uses LOW/MODERATE/HIGH; Spec uses SAFE/MODERATE/HIGH | Medium | Pre-launch |
| Pricing inconsistency | $9.99 (§9.4), $12.99 (§9.2), $14.99 (Spec §7 DD7) across document | High | Pre-launch (single source of truth) |
| No WebSocket implementation | PRD §6.3 mentions optional WebSocket for live GL tracking | Low | Post-MVP |
| Missing database migrations strategy | No versioned migration tooling specified | Medium | Week 1 |
| No rate limiting implementation detail | Spec §SEC-006 states requirement but no implementation approach | Medium | Pre-launch |

### 1.3.2 Scalability Path

The architecture is well-designed for growth to 25K MAU (Month 12 target):

- **Railway auto-scaling** handles compute (Spec §INF-001)
- **Redis caching** at ≥40% hit rate (Spec §PER-010) reduces OpenAI costs
- **PostgreSQL 16** scales vertically to 16GB RAM / 4 vCPU for 10K MAU (Spec §INF-002)
- **Cloudflare R2** CDN provides global image delivery

**Scaling ceiling:** At ~50K MAU, Railway.app and single-region PostgreSQL become bottlenecks. PRD §12.3 correctly identifies multi-region deployment at Month 12. **Not an MVP concern.**

---

## 1.4 Dimension 1 Summary

### Blockers (must fix before development)

| # | Blocker | Fix | Effort |
|---|---------|-----|--------|
| B1 | AI accuracy floor (74% recognition, 47.9% carb MAPE) creates safety risk | Implement Day-1 accuracy features (classifier + prompt + fallback) as non-negotiable MVP gates; define minimum accuracy threshold for launch (e.g., ≥85% spike risk classification on 100-meal test set per Spec §VAL-001) | 2–3 days |
| B2 | Internal document inconsistencies (pricing, API conventions, terminology) create implementation ambiguity | Resolve all audit findings (see Deep Audit Report) in a single pre-development alignment session | 1 day |

### Risks (manage during development)

| # | Risk | Probability | Impact | Mitigation |
|---|------|------------|--------|------------|
| R1 | 8-week timeline slips to 12+ weeks | High | Medium | Add 1 contract developer; re-plan as 11-week sprint |
| R2 | Solo founder burnout / key-person dependency | Medium | High | Document everything; hire fractional support by Month 2 |
| R3 | Expo managed workflow requires ejection for camera/CGM features | Medium | Medium | Prototype camera overlay and Terra SDK in Week 1 spike |
| R4 | OpenAI API cost variance ($0.01–$0.15/scan range) | Medium | Medium | Instrument cost tracking from Day 1; set alert at $0.05/scan average |
| R5 | Rust hiring pool limits team scaling | Low (MVP) / High (growth) | Medium | Maintain comprehensive documentation; evaluate Go migration path for V2 |

---

# DIMENSION 2: PRODUCT DELIVERY FEASIBILITY

**Question answered:** Can this product actually deliver on its promises to users? Will it solve the pain points it claims to address?

**Dimension Score: 7.0 / 10 — GO (with conditions)**

---

## 2.1 Pain Point ↔ Feature Mapping Validation

The PRD identifies 8 pain points (PRD §3.2) and maps them to features. This section validates whether each feature can realistically deliver on its promise.

### 2.1.1 PP-01: Nutritional Paralysis ("I don't know what to eat")

| Claim | Feature | Evidence | Delivery Confidence |
|-------|---------|----------|-------------------|
| "Instant clarity through photo-based scanning" | Core Scan (PRD §6.2) | Cal AI proves photo-first model works at scale ($2M MRR — PRD §2.2) | **High** |
| "Within 5 seconds" | Scan API P95 ≤5s (Spec §PER-001) | OpenAI API latency 2–5s (Spec §7 DD4) + network + processing. Tight but achievable on 4G | **Medium–High** |
| "Safe/Moderate/High classification" | Spike risk engine (PRD §6.2) | GL-based classification is scientifically valid (Harvard GI list [4][5]). Accuracy depends on AI performance (see Dim 1) | **Medium** |
| "Safer food swaps" | Swap Engine (PRD §6.6) | GPT-4o can generate contextual swaps. Quality depends on prompt engineering | **Medium–High** |
| "Food sequencing advice" | Sequencing Coach (PRD §6.5) | Clinically validated: Shukla et al. 2019 [6], Imai et al. 2023 [7] show 30% spike reduction | **High** |

**Verdict: PP-01 is well-addressed.** The core value proposition (scan → instant answer) is proven by Cal AI's market success. Food sequencing is Revora's strongest differentiator with robust clinical backing. The risk is accuracy, not concept.

### 2.1.2 PP-02: Fear of Disease Progression

| Claim | Feature | Evidence | Delivery Confidence |
|-------|---------|----------|-------------------|
| "90-day A1C reversal roadmap" | A1C Roadmap (PRD §6.4) | Conceptually strong. Clinical basis: GL management reduces A1C 0.3–0.4 points/90 days [4] | **Medium** |
| "Estimated A1C calculator" | A1C Estimation Algorithm (PRD §6.4 Component B) | **No validated algorithm specified.** PRD §6.4 states "Algorithm models A1C reduction based on: average daily GL, days in streak, week-over-week GL trend" but provides no formula, no validation study, no error bounds | **Low–Medium** |
| "Celebration milestones" | Milestone Rewards (PRD §6.4 Component E) | UX pattern validated by fitness apps (Strava, Duolingo). Effective for engagement | **High** |

**RISK IDENTIFIED — A1C Estimation Algorithm:**

The A1C estimation feature is a core emotional hook (transforms fear into measurable progress) but has **no specified algorithm or clinical validation methodology.** The PRD correctly includes a disclaimer ("This is an estimate based on research averages, not a medical diagnosis" — PRD §6.4 Component B) but the algorithm itself could produce misleading projections.

**Specific concern:** If the algorithm overestimates improvement, users may delay actual A1C blood tests, missing a window for medical intervention. If it underestimates, users may lose motivation and churn.

**Fix:** Commission a literature review on GL-to-A1C correlation models. Use the Thomas & Elliott 2009 Cochrane review [4] as a baseline. Define error bounds (e.g., ±0.2 A1C points) and display them to users. Effort: 1 week research + 2 days implementation.

### 2.1.3 PP-03: Inadequate Medical Guidance

| Claim | Feature | Evidence | Delivery Confidence |
|-------|---------|----------|-------------------|
| "Replace missing doctor guidance" | All advice cards + educational content | App provides more specific guidance than "eat better and come back in 6 months" | **High** |
| "Doctor-ready PDF reports" | Monthly Report (PRD §6.7, Premium) | Practical value for PCP conversations. P1 feature, not MVP | **Medium** |

**Verdict: Strongly addressed.** This is where Revora fills a genuine vacuum. Even with imperfect AI accuracy, providing *any* structured, personalized guidance exceeds what 55% of prediabetics currently receive from their doctors (PRD §3.2 PP-03).

### 2.1.4 PP-04: Information Overload

| Claim | Feature | Evidence | Delivery Confidence |
|-------|---------|----------|-------------------|
| "Single source of truth" | Curated educational library (PRD §6.9, P1) | 20+ articles addressing common questions | **Medium–High** |
| "Scientific citations visible" | Advice cards with citations (PRD §6.5) | Builds trust, reduces contradictory information seeking | **High** |
| "Clarity over completeness" | UX Principle 1 (PRD §8.1) | Design philosophy is correct; execution depends on discipline | **Medium** |

**Verdict: Well-addressed** by design philosophy. The risk is feature creep diluting simplicity over time.

### 2.1.5 PP-05: Loss of Food Enjoyment

| Claim | Feature | Evidence | Delivery Confidence |
|-------|---------|----------|-------------------|
| "App never says 'you can't eat this'" | Swap Engine tone (PRD §6.6) | Correct positioning. "Here's how to make this work" framing | **High** |
| "Warm, appetizing food photography" | Design Principle 4 (PRD §8.1) | UX standard; execution depends on asset quality | **Medium** |
| "Taste tips with every swap" | Swap card format (PRD §6.6) | Differentiator vs. clinical apps. GPT-4o can generate these | **Medium–High** |

**Verdict: Strongly addressed** at the design level. This emotional positioning is Revora's strongest product-market fit signal.

### 2.1.6 PP-06, PP-07, PP-08: Plateau, Discouragement, Burnout

These are addressed by P1 features (meal history patterns, weekly insights — PRD §6.7) and engagement mechanics (streaks, milestones, daily scores — PRD §6.3). These features are **standard mobile engagement patterns** with high confidence of functional delivery but uncertain clinical impact.

**Key gap:** PP-06 (weight loss plateau) and PP-07 (A1C discouragement) require **personalized insight** ("your breakfasts are causing 60% of your GL spend" — PRD §6.7). This requires sufficient meal data (14+ days) before value delivery. Users who churn before Day 14 never experience this value.

---

## 2.2 Clinical Promise Assessment

### 2.2.1 "Average A1C improvement: -0.4 points over 90 days" (PRD §Executive Summary)

**Evidence basis:**
- The PRD cites Thomas & Elliott 2009 Cochrane review [4] for low-GL diets reducing A1C
- The -0.4 point claim appears as a Month 12 target (PRD §5.4), not a guaranteed outcome
- No powered clinical trial has tested a GL-tracking *app* specifically for this outcome

**External benchmarks:**
- CDC Diabetes Prevention Program (DPP): Average -0.2 A1C reduction over 12 months with intensive coaching
- Noom clinical trial (2024): -0.3 A1C reduction at 6 months with behavior coaching
- CGM-based interventions (Levels Health): -0.3 to -0.5 A1C reduction (but with real-time glucose data)

**Assessment:** The -0.4 point target is **aspirational but within clinical plausibility** for highly engaged users. The PRD's Month 3 target of -0.2 (PRD §5.4) is more realistic for an app-only intervention. **The claim should be hedged**: "Users who follow Revora guidance consistently may see A1C improvements of 0.2–0.4 points" rather than presented as an average.

**Regulatory risk:** If marketed as "-0.4 point average reduction," this becomes a health outcome claim that may trigger FTC scrutiny (see Dimension 5). The PRD's own §10.1 correctly avoids disease prevention claims — the A1C improvement metric must be positioned as an observation, not a promise.

### 2.2.2 Glycemic Load as Primary Metric

**Scientific validity:** GL is a validated predictor of postprandial glucose response. The Harvard Medical School GI database (1,300+ foods — Spec §DAT-001) provides the reference data. The GL formula (GL = GI × net_carbs / 100 — Spec §REQ-003) is standard.

**Limitation:** GL does not account for:
- Individual glycemic variability (same food, different people, different responses)
- Meal timing effects (same food at breakfast vs. dinner → different response)
- Sleep, stress, exercise interactions with glucose
- Insulin resistance severity variation within prediabetes range (A1C 5.7 vs. 6.4 = very different conditions)

**Verdict:** GL is the **best available proxy** for an app-only solution without CGM. It is scientifically defensible as a primary metric. The PRD's planned CGM integration (P1 — PRD §6.10) correctly addresses the personalization gap over time. **No concern.**

---

## 2.3 User Experience Delivery Assessment

### 2.3.1 Onboarding (PRD §6.1)

**Target:** First scan within 90 seconds (PRD §8.5, Spec §VAL-002)

| Element | Assessment |
|---------|-----------|
| 5-screen flow | Appropriate length. Industry benchmark: 3–5 screens |
| Emotional acknowledgment screen | Strong differentiation vs. clinical intake forms |
| Guest mode (scan before account) | Excellent friction reduction |
| Skip options | Correct — analytics tracks skips |

**Confidence: High.** The onboarding design follows proven patterns (Headspace, Noom, Calm) adapted for a health context. The "scary diagnosis → we'll help you reverse it" framing directly addresses PP-02.

### 2.3.2 Core Scan Loop

**Target flow:** Open camera → photo → results in ≤5 seconds

**Assessment:** This is the make-or-break interaction. The flow must be:
1. **Fast** — 5 seconds max (Spec §PER-001) ✓ Achievable
2. **Accurate enough** — ≥85% correct spike classification (Spec §VAL-001) ⚠️ Conditional on accuracy work
3. **Actionable** — immediate advice (sequencing, swaps, post-meal action) ✓ Well-designed
4. **Non-judgmental** — "Hope, not fear" principle (PRD §8.1) ✓ Strong design philosophy

**Key risk:** The scan results screen (PRD §6.2) contains 5 sections (banner + food breakdown + 3 advice cards + GL budget + log button). On a mobile screen, this is information-dense. The PRD's "Clarity Over Completeness" principle (§8.1) may conflict with the desire to show everything. **Recommend:** Progressive disclosure by default; show only banner + GL budget + log button; expand advice cards on tap.

### 2.3.3 Retention Mechanics

| Mechanic | Source | Industry Validation | Concern |
|----------|--------|-------------------|---------|
| Streak counter | PRD §6.3 Component D | Duolingo: streaks drive 2.3× retention | None |
| Daily GL budget | PRD §6.3 Component A | Gamification of health metrics proven effective | None |
| Weekly reports | PRD §6.4 Component D | Standard engagement tool | None |
| Push notifications (post-meal walk) | PRD §6.8 | Effective if not over-sent | Low — quiet hours needed |
| A1C progress bar | PRD §6.4 Component A | Long-term motivation | Risk: stale if user doesn't log A1C tests |

---

## 2.4 Free vs. Premium Value Balance

### 2.4.1 Free Tier (PRD §9.1)

| Free Feature | Retention Value | Conversion Pressure |
|-------------|----------------|-------------------|
| 5 scans/day | Enough for habit formation | Creates natural limit (3.5 avg scans/day target — PRD §Executive Summary) |
| Basic results (GL + spike risk only) | Core value delivered | Missing advice cards create curiosity |
| 7-day meal history | Minimal pattern insight | Premium unlocks full history |
| No sequencing/swaps | Still useful without advice | Blurred advice cards (PRD §9.3) drive upgrade |

**Assessment:** The free tier is well-calibrated. 5 scans/day covers the 3.5 scans/day average (PRD §Executive Summary) but power users will hit the wall. The key design risk is **whether basic results (GL + spike risk without sequencing/swaps) deliver enough value to retain free users until conversion.**

**External benchmark:** Cal AI's free tier also limits scans; its founder-reported figure is ~20–25% trial conversion (a different metric — the prior 8–12% citation was unsourced). Revora's health urgency should drive higher conversion than a general calorie tracker.

**Verdict:** Free tier balance is sound. **10% conversion target (Month 12) is aggressive but plausible** given the high-urgency health condition.

---

## 2.5 Dimension 2 Summary

### Blockers

| # | Blocker | Fix | Effort |
|---|---------|-----|--------|
| B3 | A1C estimation algorithm unspecified — core emotional feature with no validation | Research GL-to-A1C correlation models; define algorithm with error bounds; add prominent uncertainty display | 1.5 weeks |

### Risks

| # | Risk | Probability | Impact | Mitigation |
|---|------|------------|--------|------------|
| R6 | AI accuracy insufficient for reliable spike classification at boundary cases | Medium | High | Conservative bias + human-in-the-loop (PRD §7.9 already planned) |
| R7 | A1C improvement claims trigger regulatory/reputational risk | Medium | High | Hedge all claims; never promise specific outcomes |
| R8 | Information-dense scan results overwhelm users (conflicts with Principle 1) | Medium | Medium | Default to progressive disclosure; user-test with beta testers |
| R9 | Day 14 engagement cliff — pattern insights require 2+ weeks of data | Medium | Medium | Provide immediate value via standalone scan results; add "preview" insights from Day 3 |
| R10 | Free tier too generous or too restrictive — wrong balance kills either retention or conversion | Medium | High | A/B test scan limits (3 vs. 5 vs. 7) in first 90 days (PRD §13.4 Experiment 2 framework) |

---

---

# DIMENSION 3: MARKET FEASIBILITY

**Question answered:** Is there a real, reachable, monetizable market for this product? Can Revora acquire and retain users at sustainable cost?

**Dimension Score: 7.5 / 10 — GO**

---

## 3.1 Market Size Validation

### 3.1.1 Total Addressable Market (TAM)

| Metric | PRD Claim | External Validation | Assessment |
|--------|-----------|-------------------|-----------|
| US prediabetic population | 88 million (PRD §2.1 [1]) | CDC Diabetes Statistics 2026: 115.2 million adults have prediabetes | **Confirmed** — market large; PRD figure conservative |
| Global prediabetes market | (PRD §2.1 [2] cited $8.81B→$15.1B) | Not independently reproducible — published estimates range widely | **Unverified** — specific $ figures not citable; see docs/ICP.md |
| Digital health diabetes apps | $42.7B → $61.2B (PRD §2.1 [8]) | Fortune Business Insights 2024 report for broader digital diabetes management | **Confirmed** — though this includes Type 1/2, not prediabetes-specific |
| Undiagnosed rate | 80% (PRD §2.1) | CDC 2024: 80.2% of prediabetics are unaware of their condition | **Confirmed** |

**TAM Assessment:** The market is massive and real. 115.2 million Americans with prediabetes (CDC 2026) — more than 2 in 5 US adults — is not a niche. The market is also **growing** due to rising obesity rates and earlier diagnostic screening. (Specific $ TAM figures are unverified; see docs/ICP.md.)

### 3.1.2 Serviceable Addressable Market (SAM)

The PRD does not explicitly segment the SAM. Let's construct it:

| Filter | Population | Source |
|--------|-----------|--------|
| US prediabetics | 115.2 million | CDC 2026 |
| Aware of diagnosis (20%) | 23.0 million | CDC undiagnosed rate (PRD §2.1) |
| Smartphone owners (85%) | 19.6 million | PRD §2.1 |
| Health app users (35% of smartphone owners) | 6.9 million | Pew Research 2024: 35% of adults use health apps |
| Willing to try new health app (25%) | 1.7 million | Industry benchmark for app trial willingness |
| **SAM** | **~1.7 million** | |

### 3.1.3 Serviceable Obtainable Market (SOM) — Year 1

| Metric | PRD Target | Realism Check |
|--------|-----------|--------------|
| Total downloads | 25,000 (PRD §Executive Summary, §5.4) | **0.0017% of SAM — very conservative and achievable** |
| Premium subscribers | 2,500 (PRD §9.3) | 10% of 25K downloads — aggressive but within health app benchmarks |
| MRR at Month 12 | $35,000 (PRD §5.4) | $32,500 at $13 ARPU (PRD §9.3) — internally consistent |

**Verdict:** The 25,000-download Year 1 target is **highly achievable** given the ~1.7M SAM. The challenge is not market size — it is distribution and acquisition (see §3.3).

---

## 3.2 Competitive Landscape Deep Dive

### 3.2.1 Direct Threat Assessment

| Competitor | Threat Level | Why | Revora Advantage |
|-----------|-------------|-----|-------------------|
| **Cal AI** | **High** | Proven photo-first model, $2M MRR, 5M+ downloads (PRD §2.2 [9]) | Cal AI is general-purpose calorie tracking, not prediabetes-specific. No GL tracking, no sequencing, no A1C roadmap |
| **GlycoAI** | **Medium** | AI-powered, partial GL tracking (PRD §2.2) | Generic GI interest audience, not prediabetes-focused |
| **mySugr** | **Low** | Established brand, comprehensive (PRD §2.2) | Diabetes-focused (Type 1/2), manual entry, complex UI — wrong audience |
| **MyFitnessPal** | **Low** | Massive user base, calorie tracking (PRD §2.2) | Not glucose-specific; manual entry heavy |
| **Noom** | **Low–Medium** | Behavior change coaching, clinical evidence | $60/month (PRD §2.2), time-intensive; different model |

### 3.2.2 Emerging Threat: CGM-App Convergence

**The most significant competitive threat is NOT listed in the PRD's competitive analysis.**

Consumer CGMs are rapidly entering the prediabetes market:
- **Dexcom Stelo:** FDA-cleared OTC CGM, ~$99/month, launched 2024
- **Abbott Lingo:** Consumer biosensor, similar price point
- **Levels Health:** CGM + app with metabolic scoring (closed 2023 but concept validated)
- **Nutrisense:** CGM + dietitian coaching, $225/month

**Why this matters:** CGMs provide *actual* glucose response data, making AI-estimated GL inherently less valuable. As CGM prices drop (projected $30–50/month by 2027), the "estimated GL" value proposition weakens.

**Revora's defense:**
1. **Price point:** $12.99/month vs. $99+/month for CGMs — 8× cheaper (PRD §9.2)
2. **Friction:** No hardware, no prescription, no adhesive patches — pure software
3. **Complementary positioning:** CGM tells you *what happened*; Revora tells you *what to do about it* (sequencing, swaps, budget)
4. **CGM integration planned:** PRD §6.10 turns CGMs from competitor to data source

**Verdict:** CGM convergence is a **3–5 year strategic risk, not a 12-month blocker.** Revora's price and accessibility advantage holds for the MVP window. The CGM integration (P1) is strategically important — should be prioritized to Version 1.1.

### 3.2.3 Defensibility Analysis

| Moat Type | Strength | Timeline |
|-----------|----------|----------|
| **Niche focus** (prediabetes-only) | Medium | Immediate — competitors would need to build prediabetes-specific features |
| **Data moat** (50K labeled meal scans — Spec §DAT-002) | High | 6–12 months to accumulate meaningful dataset |
| **Community moat** (YouTube channel, Reddit engagement) | Medium | Exists now — leverageable for launch |
| **Switching costs** (meal history, streaks, A1C progress) | Medium | Builds over 30–90 days of usage |
| **Network effects** | None at MVP | P2 community features (PRD §6.12) could create weak network effects |
| **Brand trust** (health category requires trust) | Low at launch | Grows with reviews, testimonials, clinical outcomes |

**Assessment:** Revora's moat is **thin at launch but deepens over time.** The biggest defensibility risk is that a well-funded competitor (Cal AI, Noom, or a CGM company) could build prediabetes-specific features in 3–6 months. The mitigation is **speed** — be the first to establish brand and community in this niche.

---

## 3.3 User Acquisition Feasibility

### 3.3.1 Distribution Channels Assessment

| Channel | PRD Reference | Expected CAC | Volume Potential | Timeline |
|---------|-------------|-------------|-----------------|----------|
| **YouTube (owned)** | PRD §11.3, §11.5 | $0 (organic) | 200 downloads/month at 10K views (2% CTR — PRD §11.3) | Day 0 |
| **Reddit (r/prediabetes)** | PRD §11.3 | $0 (organic) | 47K members (PRD §3.1); expect 50–100 downloads/month | Day 0 |
| **App Store Organic (ASO)** | PRD §11.3 | $0 | Depends on keyword ranking; "prediabetes app" = moderate volume | Month 1+ |
| **Product Hunt** | PRD §11.2 | $0 | 100–500 downloads (one-time spike) | Launch day |
| **Referral program** | PRD §11.3 | $5/referral (PRD §11.3) | 10–15% of users refer (health app benchmark) | Month 2+ |
| **Paid acquisition (FB/IG)** | PRD §11.3 | <$30 target (PRD §11.3) | Scalable but expensive | Month 6+ |

### 3.3.2 Customer Acquisition Cost (CAC) Analysis

**PRD Target:** CAC < $30, LTV:CAC ratio ≥ 5:1 (PRD §11.3)

**Reality check by channel:**

| Channel | Realistic CAC | LTV:CAC at $156 LTV |
|---------|-------------|---------------------|
| YouTube organic | $0–2 (content creation cost amortized) | 78:1 — **Excellent** |
| Reddit organic | $0–5 (time investment) | 31:1 — **Excellent** |
| ASO organic | $0–3 (optimization effort) | 52:1 — **Excellent** |
| Referral | $5 (credit cost) | 31:1 — **Excellent** |
| Facebook/Instagram ads | $15–45 (health app CPI benchmark 2024) | 3.5–10:1 — **Acceptable to Good** |
| Google Search ads | $20–60 (health keyword CPCs are high) | 2.6–7.8:1 — **Marginal to Good** |

**Assessment:** The organic distribution strategy is Revora's **strongest market advantage.** The existing YouTube channel provides free, high-intent user acquisition that competitors must pay for. The $30 CAC target is achievable for blended organic + paid channels.

**Key concern:** Organic channels (YouTube, Reddit) are **non-scalable** past ~500 downloads/month without content investment. Reaching 25,000 downloads by Month 12 requires either viral growth (unpredictable) or paid acquisition starting Month 4–6 (earlier than PRD's Month 6+ plan — PRD §11.3 Channel 5).

**Recommendation:** Model two scenarios:
- **Organic-heavy:** 15,000 downloads Year 1, $15K MRR — still profitable, slower growth
- **Paid-assisted:** 25,000+ downloads Year 1, $35K MRR — requires $30–50K marketing budget

### 3.3.3 Retention Benchmarks

| Metric | Revora Target (Month 12, PRD §5.4) | Health App Benchmark (2024) | Assessment |
|--------|---------------------------------------|---------------------------|-----------|
| Day 1 retention | 60% (PRD §13.2) | 25–30% (average), 40–50% (top quartile health apps) | **Aggressive** — achievable with strong onboarding |
| Day 7 retention | 45% (PRD §5.4) | 15–20% (average), 30–40% (top quartile) | **Very aggressive** — top 10% of health apps |
| Day 30 retention | 30% (PRD §5.4) | 8–12% (average), 20–25% (top quartile) | **Very aggressive** — top 5% |
| DAU/MAU ratio | 45% (PRD §Executive Summary) | 20% (average), 30–35% (top quartile) | **Extremely aggressive** — Duolingo-tier |

**RISK IDENTIFIED — Retention targets are top-decile aspirational:**

The PRD's retention targets (45% DAU/MAU, 30% Day 30) are **benchmarked against the best consumer apps in any category**, not health app averages. For context:
- Duolingo: ~50% DAU/MAU (gamification leader)
- MyFitnessPal: ~25% DAU/MAU
- Noom: ~20% DAU/MAU
- Average health app: ~15% DAU/MAU

The 45% DAU/MAU target implies Revora would be **more engaging than almost every health app ever built.** This is plausible only if the core scan loop becomes truly habitual AND the health urgency sustains daily engagement.

**Realistic alternative targets:**

| Metric | Realistic Target | Stretch Target |
|--------|-----------------|---------------|
| Day 7 retention | 35% | 45% |
| Day 30 retention | 20% | 30% |
| DAU/MAU | 30% | 40% |

**Impact of revised retention on revenue:** At 20% Day 30 retention instead of 30%, MRR at Month 12 drops from $35K to ~$23K. Still viable, but extends runway to profitability.

---

## 3.4 Product-Market Fit Signals

### 3.4.1 Pre-Launch Validation Evidence

| Signal | Evidence | Strength |
|--------|----------|----------|
| Pain point frequency | 60% of newly diagnosed posts express nutritional paralysis (PRD §3.2 PP-01) | **Strong** |
| Willingness to pay | "Will pay anything that gives certainty" — Primary persona Sarah (PRD §4.1) | **Strong** (qualitative) |
| Community size | r/prediabetes: 47,000+ members (PRD §3.1) | **Medium** |
| Comparable success | Cal AI: $2M MRR from photo-first scanning for general audience (PRD §2.2 [9]) | **Strong** |
| YouTube audience | Existing prediabetes channel (PRD §11.5) — size not specified | **Medium** (unquantified) |

### 3.4.2 Missing Validation

| Gap | Impact | Fix |
|-----|--------|-----|
| **No landing page signup data** | Can't quantify demand from channel | Create landing page with email waitlist pre-launch (PRD §11.1 Week 8 mentions this) |
| **No willingness-to-pay survey** | $12.99/month pricing is untested | Run price sensitivity survey with 200+ r/prediabetes members |
| **YouTube channel size undisclosed** | Can't estimate organic acquisition volume | Disclose subscriber count for realistic channel modeling |
| **No prototype user testing** | UX assumptions untested | Run 10 user tests with clickable prototype before development |

**Verdict:** Product-market fit signals are **qualitatively strong but quantitatively thin.** The pain point is real and severe. The solution concept is proven (Cal AI). The specific price point and feature mix are untested. **Recommendation:** Invest 2 weeks in pre-development validation (waitlist, pricing survey, prototype tests) before committing to full build.

---

## 3.5 Dimension 3 Summary

### Blockers

**None.** The market exists, is large, growing, and underserved. No market-level blocker prevents proceeding.

### Risks

| # | Risk | Probability | Impact | Mitigation |
|---|------|------------|--------|------------|
| R11 | Retention targets unrealistic (45% DAU/MAU is top-decile) | High | High | Model with 30% DAU/MAU; adjust revenue projections accordingly |
| R12 | Organic channels plateau at ~500 downloads/month | Medium | Medium | Budget $30–50K for paid acquisition starting Month 4 |
| R13 | CGM price drops erode GL-estimation value proposition in 3–5 years | Medium | High | Prioritize CGM integration (P1); position as complementary, not competing |
| R14 | Cal AI or Noom adds prediabetes-specific features | Medium | High | Speed to market; build community moat; leverage niche trust |
| R15 | No quantitative pre-launch demand validation | Medium | Medium | Run waitlist + pricing survey before development commit |

---

# DIMENSION 4: ECONOMIC & FINANCIAL FEASIBILITY

**Question answered:** Do the unit economics work? Can this business sustain itself? What funding is needed?

**Dimension Score: 6.0 / 10 — CONDITIONAL GO**

---

## 4.1 Revenue Model Analysis

### 4.1.1 Pricing Architecture

**CRITICAL ISSUE: The PRD contains three different pricing structures.**

| Source | Monthly Price | Annual Price | Lifetime |
|--------|-------------|-------------|---------|
| PRD §9.2 (lines 2403–2414) | $12.99/month | $99.99/year | $299.99 |
| PRD §9.4 (lines 3426–3446) | $9.99/month | — | — |
| Spec §7 DD7 (line 1007) | $14.99/month | — | — |
| PRD §9.5 (lines 3448–3477) | $9.99/month | — | — |
| PRD late §9 (lines 3387–3392) | $12.99/month | $79.99/year | $149.99 |

**This is a blocker for financial modeling.** Revenue projections vary by 50% depending on which price is used ($9.99 vs. $14.99). The analysis below uses **$12.99/month** (§9.2, most detailed section) as the primary scenario with sensitivity analysis.

### 4.1.2 Revenue Projections — Three Scenarios

**Assumptions held constant across scenarios:**
- Subscription mix: 70% monthly, 25% annual, 5% lifetime (PRD §9.3)
- Churn rate: 5% monthly (PRD §9.3)
- Blended ARPU: $13/month at $12.99 price point

**Scenario A: Conservative (PRD §9.4 "Conservative")**

| Metric | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| Total downloads | 2,000 | 5,000 | 10,000 |
| Conversion rate | 6% | 7% | 8% |
| Premium subscribers | 120 | 350 | 800 |
| MRR | $1,560 | $4,550 | $10,400 |
| ARR | $18,720 | $54,600 | $124,800 |

**Scenario B: Moderate (PRD §9.3 projections)**

| Metric 		| Month 3 | Month 6 | Month 12 |
|--------		|---------|---------|----------|
| Total downloads 	| 2,000   | 8,000   | 25,000   |
| Conversion rate 	| 6%      | 8%      | 10%      |
| Premium subscribers 	| 120     | 800     | 2,500    |
| MRR 			| $1,560  | $10,400 | $32,500  |
| ARR 			| $18,720 | $124,800| $390,000 |

**Scenario C: Optimistic (PRD §9.4 "Moderate" — confusingly named)**

| Metric 		| Month 3 	| Month 6 | Month 12 |
|--------		|---------	|---------|----------|
| Total downloads 	| 3,000 	| 12,000  | 30,000 |
| Conversion rate 	| 8% 		| 10%     | 12% |
| Premium subscribers 	| 240 		| 1,200   | 3,600 |
| MRR 			| $3,120 	| $15,600 | $46,800 |
| ARR 			| $37,440 	| $187,200| $561,600|

**Assessment:** Scenario B (Moderate) is the PRD's primary plan. The jump from 2,000 downloads at Month 3 to 25,000 at Month 12 requires **12.5× growth in 9 months** — achievable only with successful paid acquisition starting Month 4–6 or viral organic growth.

### 4.1.3 Churn Analysis

**PRD assumption:** 5% monthly churn (PRD §9.3)

**External benchmarks:**
- Health app average: 8–12% monthly churn
- Consumer subscription apps: 6–8% monthly churn
- Noom: ~7% monthly churn
- Duolingo Plus: ~5% monthly churn

**Assessment:** 5% churn is **best-in-class** for health apps. More realistic: **7–8% monthly churn** for Year 1, potentially improving to 5% as product matures and retention features ship.

**Impact of 8% churn vs. 5% churn on Month 12 MRR:**

| Churn Rate | Retained Subscribers (Month 12) | MRR Impact |
|-----------|-------------------------------|------------|
| 5% (PRD assumption) | 2,500 | $32,500 |
| 8% (realistic) | 1,800 | $23,400 |
| **Delta** | **-700 subscribers** | **-$9,100/month (-28%)** |

**This is significant.** At 8% churn, Month 12 MRR drops from $32,500 to $23,400. Still viable, but extends the path to profitability.

---

## 4.2 Cost Structure Analysis

### 4.2.1 Variable Costs per User

**CRITICAL ISSUE: The PRD contains contradictory cost-per-scan figures.**

| Source | Cost per Scan | Context |
|--------|-------------|---------|
| PRD §7.11 (line 2254) | $0.01–$0.03 | Third-party integrations table |
| PRD §9.4 (COGS table, line 2488) | $0.03 | "100 scans/month @ $0.03/scan = $3.00" |
| Spec §CON-001 (line 188) | ≤$0.15 | Constraint target (includes image processing + structured output) |
| Spec §7 DD4 (line 975) | $0.10–$0.15 | "at scale (10K scans/month)" |
| PRD §7.9.2 H6 (line 2185) | +$0.02–$0.04 | Additional cost for two-pass architecture on complex scans |

**Reconciliation:** The actual OpenAI GPT-4o Vision cost depends on:
- Input tokens (image ~765 tokens at 512px = ~$0.004)
- Output tokens (structured JSON ~500 tokens = ~$0.005)
- Two-pass scans add another ~$0.005–$0.008
- **Realistic cost per scan: $0.01–$0.02 for simple scans, $0.03–$0.04 for two-pass scans**
- **Blended average: ~$0.02/scan** (assuming 30% complex scans per PRD §7.9.2)

The $0.10–$0.15/scan figure in Spec §CON-001 and §7 DD4 appears to be from an older GPT-4o pricing model or includes overhead. At current (March 2026) pricing, $0.02/scan is realistic.

### 4.2.2 Revised Variable Cost per Premium User/Month

| Cost Category | PRD §9.4 Estimate 			| Revised Estimate 	   | Notes |
|-------------		|-------------------		|-----------------	   |------- |
| OpenAI API 		| $3.00 (100 scans × $0.03) 	| $2.00 (100 scans × $0.02)| Updated pricing, blended simple/complex |
| App Store commission  | Not listed in §9.4 		| **$3.90** 		   | **Apple/Google take 30% of $12.99 in Year 1 (15% after Year 1 or <$1M)** |
| RevenueCat 		| $0.13 			| $0.13 		   | 1% of subscription |
| Stripe fees 		| $0.67 			| $0.00 		   | Stripe not used for IAP — RevenueCat handles via Apple/Google billing |
| Cloudflare R2 	| $0.10 			| $0.10 		   | Image storage |
| Backend hosting 	| $0.50 			| $0.50 		   | Railway per-user allocation |
| CGM integration 	| $0.40 			| $0.20 		   | Terra API; assume 25% adoption (not 50%) at launch |
| **Total COGS** 	| **$4.80** 			| **$6.83**     	   | 							|
| **Gross margin** 	| **63%** 			| **47%** 		   | **Significantly worse due to App Store commission** |

### 4.2.3 THE APP STORE COMMISSION PROBLEM

**BLOCKER IDENTIFIED:**

The PRD's COGS analysis (§9.4, line 2482–2499) **omits App Store commission entirely.** This is the single largest variable cost:

- **Year 1:** Apple and Google take **30%** of subscription revenue for apps under $1M annual revenue through the App Store Small Business Program (15% after Year 1 or once enrolled)
- At $12.99/month, Apple takes **$3.90/month per subscriber** in Year 1
- After qualifying for Small Business Program (< $1M revenue): **$1.95/month (15%)**

**Revised gross margin analysis:**

| Period | Revenue/User | COGS (inc. App Store) | Gross Margin |
|--------|-------------|----------------------|-------------|
| Year 1 (30% commission) | $12.99 | $6.83 | **47%** |
| Year 2+ (15% commission) | $12.99 | $4.88 | **62%** |

**The PRD's claimed 63% gross margin (§9.4 line 2501) is overstated by 16 percentage points in Year 1.** At 47% gross margin, contribution margin per user drops from $8.19 to $6.16 — pushing breakeven from 163 users to **217 users** and extending breakeven timeline.

**Annual subscribers partially mitigate this:** At $99.99/year ($8.33/month), the App Store takes $2.50/month (30%) or $1.25/month (15%), improving blended gross margin if annual plan adoption is high.

---

## 4.3 Unit Economics Deep Dive

### 4.3.1 Lifetime Value (LTV) Calculation

**PRD claims:** LTV = $156 (12 months × $13 ARPU — PRD §13.2)

**Revised LTV at different churn rates:**

| Monthly Churn | Avg Lifetime (months) | LTV (Gross) | LTV (Net of COGS) |
|--------------|----------------------|-------------|-------------------|
| 5% (PRD assumption) | 20 months | $260 | $123 (at 47% margin Y1) |
| 7% (moderate) | 14.3 months | $186 | $87 |
| 8% (realistic Y1) | 12.5 months | $162 | $76 |
| 10% (pessimistic) | 10 months | $130 | $61 |

**Assessment:** The PRD's $156 LTV is reasonable at 5–7% churn but uses gross revenue, not contribution margin. **Net LTV (after COGS) is $76–$123** depending on churn and commission period. This is critical for CAC payback calculations.

### 4.3.2 CAC Payback Period

| Channel | CAC | Net LTV | Payback Period | LTV:CAC Ratio |
|---------|-----|---------|---------------|--------------|
| Organic (YouTube, Reddit) | $2–5 | $87 | <1 month | 17–44× |
| Referral program | $5 | $87 | <1 month | 17× |
| Facebook/Instagram ads | $25–45 | $87 | 4–7 months | 1.9–3.5× |
| Google Search ads | $30–60 | $87 | 5–10 months | 1.5–2.9× |

**Assessment:** Organic channels have exceptional economics. Paid channels are **marginal** — at $45 CAC with $87 net LTV, the 1.9× ratio is below the 3× minimum typically required for sustainable growth. **Paid acquisition only works if:** (a) CAC can be brought below $25, or (b) churn is brought below 5%, or (c) ARPU is increased.

### 4.3.3 Free User Cost Burden

**Often overlooked:** Free users consume infrastructure resources without paying.

| Metric | Calculation | Monthly Cost |
|--------|-----------|-------------|
| Free users at Month 12 | 22,500 (PRD §9.3) | |
| Scans per free user/day | 2.5 (conservative — capped at 5) | |
| Monthly scans per free user | 75 | |
| Cost per scan | $0.02 | |
| **Monthly cost per free user** | | **$1.50** |
| **Total free user cost (Month 12)** | 22,500 × $1.50 | **$33,750/month** |

**RISK IDENTIFIED — Free User Subsidy:**

At Month 12, the PRD projects 22,500 free users costing **$33,750/month** in OpenAI API calls alone. Premium revenue at that point is $32,500/month. **Free users cost more than premium users generate in revenue.**

This is sustainable only if:
1. Conversion rate exceeds 10% (more premium revenue to offset free costs)
2. Free users are aggressively limited (reduce from 5 to 3 scans/day — saves $13,500/month)
3. Caching reduces actual API costs (40% cache hit rate per Spec §PER-010 — saves $13,500/month)

**With caching:** Effective free user cost drops to ~$0.90/user/month → $20,250/month total. This brings the economics to approximate breakeven at Month 12.

---

## 4.4 Funding & Runway Analysis

### 4.4.1 Pre-Revenue Cost Estimation

| Phase | Duration | Costs | Total |
|-------|----------|-------|-------|
| Development (MVP) | 11–13 weeks | Developer time (opportunity cost or salary), tools, infrastructure | $5,000–$15,000 (bootstrapped) or $25,000–$40,000 (with contractor) |
| Pre-launch (beta) | 2–4 weeks | Hosting, API testing costs, beta incentives | $1,000–$3,000 |
| Launch marketing | 4 weeks | Landing page, content creation, Product Hunt | $500–$2,000 |
| **Total pre-revenue** | | | **$6,500–$45,000** |

### 4.4.2 Monthly Burn Rate (Post-Launch)

| Cost Category | Month 1–3 | Month 4–6 | Month 7–12 |
|-------------|----------|----------|-----------|
| OpenAI API (free + premium users) | $800 | $4,000 | $15,000 |
| Backend hosting (Railway) | $50 | $200 | $500 |
| App Store fees (annual) | $10/mo amortized | $10/mo | $10/mo |
| Expo EAS | $29 | $29 | $29 |
| Content creation | $500 | $500 | $500 |
| Customer support (part-time) | $0 | $800 | $800 |
| Marketing (paid acquisition) | $0 | $2,000 | $5,000 |
| Sentry + PostHog | $0 | $0 | $50 |
| **Total monthly burn** | **$1,389** | **$7,539** | **$21,889** |

### 4.4.3 Revenue vs. Burn — Path to Profitability

| Month | MRR (Scenario B) | Monthly Burn | Net Cash Flow | Cumulative |
|-------|-----------------|-------------|--------------|-----------|
| 1 | $200 | $1,389 | -$1,189 | -$1,189 |
| 3 | $1,560 | $1,389 | +$171 | -$3,200 |
| 6 | $10,400 | $7,539 | +$2,861 | -$5,000 |
| 9 | $20,000 | $15,000 | +$5,000 | +$5,000 |
| 12 | $32,500 | $21,889 | +$10,611 | +$35,000 |

**Assessment:** Under Scenario B (moderate), the business reaches **monthly cash flow positive around Month 3** and **cumulative breakeven around Month 8–9.** Maximum cash deficit is approximately **$5,000–$8,000** — manageable for a bootstrapped founder.

**Under Scenario A (conservative):** Monthly cash flow stays negative through Month 6, cumulative deficit reaches ~$15,000, breakeven at Month 10–12. Requires $20,000–$30,000 runway.

### 4.4.4 Funding Requirements

| Scenario | Pre-Revenue Investment | Working Capital (to breakeven) | Total Funding Needed |
|----------|----------------------|-------------------------------|---------------------|
| Bootstrapped (solo dev) | $6,500 | $8,000 | **$15,000** |
| With contractor | $30,000 | $8,000 | **$38,000** |
| With paid acquisition push | $30,000 | $50,000 | **$80,000** |

**Verdict:** Revora is **bootstrappable** at the solo-founder level with $15K–$40K of capital. This is a strength — no external funding dependency, no dilution, no investor pressure. However, the PRD's Month 12 revenue targets ($35K MRR) likely require the paid acquisition push, which needs $80K+ total investment.

**Recommendation:** The founder should target **$40K initial capital** (covers contractor + working capital) and plan for a **$30K–$50K paid acquisition budget** to deploy at Month 4–6 if organic growth validates product-market fit.

---

## 4.5 Sensitivity Analysis — What Breaks the Model?

| Variable | Base Case | Break-Even Threshold | Risk Level |
|----------|-----------|---------------------|-----------|
| Conversion rate | 10% | 4% (below this, free user costs exceed premium revenue) | **Medium** |
| Monthly churn | 5% | 12% (above this, LTV < CAC for paid channels) | **Medium** |
| OpenAI cost/scan | $0.02 | $0.08 (above this, free user subsidy becomes unsustainable) | **Low** (trending down) |
| Pricing | $12.99 | $7.99 (below this, margin insufficient after App Store cut) | **Low** |
| Downloads (Year 1) | 25,000 | 5,000 (below this, insufficient revenue for even fixed costs) | **Medium** |

**Most dangerous [REVIEW NEEDED: Replace restriction-framing with permission-first language] failure mode:** Low conversion (3–4%) combined with high free-user volume. If 25,000 users download the app but only 3% convert (750 subscribers), MRR = $9,750 while API costs for 24,250 free users = $36,375/month. **This burns $26,625/month.**

**Circuit breaker (per PRD §14.1 Risk 3):** Reduce free tier from 5 to 3 scans/day if conversion stays below 5% for 60 days. This cuts free user costs by 40%.

---

## 4.6 Dimension 4 Summary

### Blockers

| # | Blocker | Fix | Effort |
|---|---------|-----|--------|
| B4 | App Store commission (30%) omitted from COGS — gross margin overstated by 16 points | Rebuild financial model with correct COGS including 30% Year 1 commission; adjust all revenue projections | 1 day |
| B5 | Pricing inconsistency ($9.99 / $12.99 / $14.99) — cannot build financial model on contradictory inputs | Select single pricing strategy and update all document references | 2 hours |

### Risks

| # | Risk | Probability | Impact | Mitigation |
|---|------|------------|--------|------------|
| R16 | Free user API costs exceed premium revenue if conversion < 4% | Medium | Critical | Circuit breaker: reduce free scans from 5 → 3; aggressive caching (40%+ hit rate) |
| R17 | Month 12 MRR target ($35K) requires paid acquisition not budgeted in cost model | High | Medium | Budget $30–50K for Month 4–6 paid acquisition; model organic-only scenario as fallback |
| R18 | 5% monthly churn is best-in-class assumption; realistic 7–8% drops MRR 28% | High | High | Budget retention features early; track churn weekly from Day 1 |
| R19 | Paid acquisition CAC ($25–45) yields marginal LTV:CAC (1.9–3.5×) | Medium | High | Focus organic channels; only scale paid if CAC < $25 |
| R20 | OpenAI price increases could deteriorate unit economics | Low | Medium | Plan migration to fine-tuned model after 50K labeled scans (PRD §12.3 Month 6) |

---

---

# DIMENSION 5: LEGAL & REGULATORY FEASIBILITY

**Question answered:** Can Revora legally operate, market its claims, handle user data, and survive regulatory scrutiny in the US and internationally?

**Dimension Score: 7.0 / 10 — GO (with mandatory pre-launch legal work)**

---

## 5.1 FDA Regulatory Classification

### 5.1.1 Current Positioning: Wellness Tool (Non-Device)

The PRD positions Revora as a wellness tool, not a medical device (PRD §10.1, lines 2619–2650). This classification rests on FDA's 2022 Clinical Decision Support (CDS) guidance [26].

**FDA CDS Exemption Criteria — Revora Compliance Assessment:**

| FDA Criterion | Revora Status | Evidence | Risk |
|--------------|-----------------|---------|------|
| Does NOT diagnose disease | ✅ Compliant | No "you have prediabetes" claims (PRD §10.1) | Low |
| Does NOT treat, cure, or mitigate disease | ⚠️ **Borderline** | A1C "reversal roadmap" (PRD §6.4) implies treatment trajectory | **Medium** |
| Provides general wellness guidance | ✅ Compliant | Food sequencing, swap suggestions are educational | Low |
| User retains decision-making agency | ✅ Compliant | "App suggests, user decides" (PRD §10.1) | Low |
| Intended for generally healthy population | ⚠️ **Borderline** | Prediabetes is a clinical condition (A1C 5.7–6.4%) — not "generally healthy" | **Medium** |
| Displays data/information without interpretation | ❌ **Non-compliant** | Revora actively interprets food photos and provides spike risk classification + action recommendations | **Medium–High** |

### 5.1.2 RISK IDENTIFIED — CDS Exemption Is Fragile

**The FDA's CDS exemption requires ALL four criteria from §3060(o)(1)(E) of the 21st Century Cures Act to be met simultaneously:**

1. Not intended to acquire, process, or analyze a medical image/signal ✅
2. Intended to display, analyze, or print medical information ⚠️ (GL is nutritional, not medical, but A1C tracking is medical data)
3. Intended to be used by a healthcare professional who can independently review the basis ❌ (Revora is DTC, no HCP in the loop)
4. Intended only as a tool to enable the HCP to independently review the basis ❌ (same issue)

**Critical issue:** The CDS exemption pathway described in PRD §10.1 applies to **HCP-facing tools**, not direct-to-consumer apps. Revora's actual exemption basis is the **general wellness / low risk** pathway under FDA's 2016 General Wellness guidance, which requires:

- Claims are limited to general wellness (weight management, physical fitness, relaxation, mental acuity, self-esteem, sleep management, sexual function)
- The product does NOT make disease-related claims

**Assessment:** Revora's wellness positioning is legally defensible **as long as** it avoids any disease-specific claims. The current PRD language is mostly compliant, but several features and marketing phrases create exposure:

### 5.1.3 Language Compliance Audit

| Location | Current Language | Risk | Fix |
|----------|----------------|------|-----|
| PRD §Executive Summary (line 12) | "prediabetes reversal companion" | **High** — "reversal" implies treatment | "prediabetes wellness companion" or "blood sugar management companion" |
| PRD §6.4 title | "A1C Reversal Roadmap" | **High** — "reversal" is a clinical outcome claim | "A1C Progress Tracker" or "A1C Wellness Roadmap" |
| App Store title (PRD §11.3) | "Revora: Prediabetes Reversal" | **Critical** — App Store listing with disease treatment claim visible to regulators | "Revora: Smart Meal Scanner" or "Revora: Glycemic Load Tracker" |
| PRD §9.5 paywall | "1,200 members reversed their A1C using Revora Pro" | **Critical** — specific health outcome claim tied to product | "1,200 members use Revora Pro to track their meals" |
| PRD §2.1 | "40% reversal rate at 90 days" | **High** — implied product efficacy claim without clinical trial | Remove or qualify: "40% of engaged users who tracked A1C reported improvement" |
| PRD §11.3 YouTube | "How to reverse prediabetes using Revora" | **High** — direct disease treatment claim in marketing | "How I track my meals and blood sugar with Revora" |
| PRD §6.4 Component B | "Estimated A1C calculator" | **Medium** — calculating A1C from non-clinical data could be seen as diagnostic function | Add prominent disclaimer; rename to "A1C Goal Tracker" |

**Verdict:** The wellness positioning is architecturally sound but the **current language throughout the PRD repeatedly violates its own regulatory framework.** The word "reversal" appears in core feature names, marketing copy, and the App Store listing. This creates an **FTC/FDA enforcement surface** that must be remediated before any public-facing content is created.

---

## 5.2 FTC Health Claims Enforcement

### 5.2.1 FTC Scrutiny Environment

The FTC has increased enforcement against health app claims since 2022:
- **FTC v. Cerebral (2024):** $7M settlement for misleading mental health claims
- **FTC v. BetterHelp (2023):** $7.8M for misrepresenting data practices
- **FTC Health Products Compliance Guidance (2023):** Requires "competent and reliable scientific evidence" for health claims

### 5.2.2 Revora FTC Exposure Assessment

| Claim Type | Revora Examples | FTC Standard | Compliance |
|-----------|-------------------|-------------|-----------|
| **Efficacy claims** | "40% reversal rate" (PRD §2.1, §5.4) | Requires RCT or equivalent clinical evidence | ❌ **Non-compliant** — no clinical trial |
| **Testimonials** | "Sarah went from 6.4 to 5.6" (PRD §6.12) | Must be representative of typical results; disclaim if not | ⚠️ **Risky** — implies product caused outcome |
| **Comparative claims** | "30% spike reduction from food sequencing" (PRD §6.5) | Must cite primary research | ✅ **Compliant** — cites Shukla et al. 2019 [6] |
| **AI accuracy claims** | "85% spike risk accuracy" (Spec §VAL-001) | Must be substantiated by testing | ⚠️ **Conditional** — only compliant if validated on test dataset |

### 5.2.3 FTC Risk Mitigation

**Mandatory pre-launch actions:**

1. **Remove all unsubstantiated efficacy claims** from marketing materials, App Store listings, and in-app copy
2. **Add "Results may vary" disclaimer** to all user testimonials and success stories
3. **Never quantify health outcomes** (A1C reduction) in marketing without a completed clinical study
4. **Cite primary research** for every scientific claim (food sequencing, GL impact, etc.)
5. **Engage FTC health claims attorney** for review of all public-facing content before launch ($3,000–$5,000 one-time cost)

---

## 5.3 Data Privacy & Protection

### 5.3.1 Data Classification

| Data Type | Classification | Regulatory Regime | PRD Reference |
|-----------|---------------|------------------|--------------|
| A1C values | Health data / PHI-equivalent | HIPAA (voluntary), GDPR Art. 9, CCPA sensitive | PRD §10.2 (line 2651) |
| Meal photos | Personal data + health inference | GDPR, CCPA | PRD §7.7 (line 1726) |
| Dietary restrictions | Health data | GDPR Art. 9, CCPA sensitive | Spec §4.3 users table |
| GL scores / meal logs | Health data | GDPR Art. 9, CCPA sensitive | Spec §4.3 scans table |
| Email / auth tokens | Personal data | GDPR, CCPA | Spec §4.3 users table |
| Device identifiers | Personal data | GDPR, CCPA, Apple ATT | PostHog integration |

### 5.3.2 HIPAA Analysis

**PRD Position (§10.2, line 2653):** Revora is NOT a HIPAA-covered entity.

**Assessment:** Correct. Revora is not a healthcare provider, health plan, or clearinghouse, and does not transmit EHRs to covered entities. HIPAA does not apply.

**However:** The PRD correctly notes (§10.2, line 2662) that A1C values and meal logs are "PHI in spirit" and applies HIPAA-equivalent protections voluntarily. This is **best practice** and should be maintained.

**Risk scenario:** If Revora pursues the B2B2C insurance partnership strategy (PRD §9.6 Stream 1, line 2568), it may become a Business Associate under HIPAA, triggering full HIPAA compliance requirements (BAA, security rule compliance, breach notification). **This is a P2 concern, not MVP.**

### 5.3.3 GDPR Compliance Assessment

| GDPR Requirement | Revora Implementation | Status |
|-----------------|------------------------|--------|
| Lawful basis for processing | Consent (account creation) + Legitimate interest (service delivery) | ✅ Planned |
| Special category data (Art. 9) | Health data requires explicit consent | ⚠️ **Not explicitly addressed** — need separate consent for health data processing |
| Data minimization | PRD §10.2: "Collect only essential data" | ✅ Compliant |
| Right to access / export | PRD §10.2: JSON export within 10 seconds (Spec §VAL-010) | ✅ Compliant |
| Right to deletion | PRD §10.2: "Complete account + data deletion within 30 days" | ✅ Compliant |
| Data Protection Impact Assessment (DPIA) | **Not mentioned anywhere** | ❌ **Required** for health data processing at scale |
| Data Processing Agreement with OpenAI | **Not mentioned** | ⚠️ **Required** — meal photos sent to OpenAI constitute data transfer to processor |
| Cross-border data transfer | US-based infrastructure; EU users' data in US servers | ⚠️ **Requires Standard Contractual Clauses (SCCs) or equivalent** |
| Cookie/tracking consent | PostHog analytics integration | ⚠️ **Requires consent banner for EU users** |

### 5.3.4 GDPR Compliance Gaps

| Gap | Severity | Fix | Effort |
|-----|---------|-----|--------|
| No DPIA documented | High (regulatory requirement for health data) | Conduct and document DPIA before launch | 1 week (can be done in parallel with development) |
| No DPA with OpenAI | High (data processor requirement) | Execute OpenAI DPA (available on OpenAI's website) | 1 day |
| No explicit health data consent flow | Medium | Add separate consent checkbox for health data during onboarding | 2 hours dev work |
| No cross-border transfer mechanism | Medium (for EU users) | Implement SCCs with Railway.app, OpenAI, Cloudflare | 1 week legal work |
| No analytics consent banner | Medium | Implement GDPR consent banner for EU users; conditionally load PostHog | 1 day dev work |

### 5.3.5 CCPA Compliance Assessment

| CCPA Requirement | Status |
|-----------------|--------|
| Right to know | ✅ Covered by data export (PRD §10.2) |
| Right to delete | ✅ Covered by account deletion (PRD §10.2) |
| Right to opt-out of sale | ✅ PRD §7.7: "No health data sold to third parties" |
| Privacy policy disclosure | ⚠️ Policy content specified but actual document not drafted |
| "Do Not Sell" link | ⚠️ Required for California users; not mentioned in PRD |

**Assessment:** CCPA compliance is straightforward and mostly addressed. Minor gaps are easily fixed.

### 5.3.6 OpenAI Data Processing Risk

**Specific concern:** Every meal photo is sent to OpenAI's API for analysis. This means:

1. **User health data (food photos + dietary context) leaves Revora's infrastructure** to a third party
2. OpenAI's data usage policy must be verified — as of 2024, API data is NOT used for training by default, but terms can change
3. GDPR requires a Data Processing Agreement (DPA) between Revora and OpenAI
4. Users must be informed that their photos are processed by a third-party AI service

**PRD coverage:** §7.7 (line 1736) states "OpenAI API keys stored server-side only" (security) but does **not address** the data processing relationship, user notification of third-party processing, or DPA requirement.

**Fix:** Add explicit disclosure in privacy policy: "Your meal photos are processed by OpenAI's AI services to provide nutritional analysis. Photos are transmitted securely and are not used by OpenAI for model training." Execute OpenAI's standard DPA.

---

## 5.4 App Store Compliance

### 5.4.1 Apple App Store

| Requirement | Status | Notes |
|------------|--------|-------|
| Health app category approval | ⚠️ **High-scrutiny review expected** | Apple reviews health apps more rigorously; have medical review contact ready (PRD §10.2) |
| Medical disclaimer | ✅ Planned (PRD §10.4) | Must be prominent in App Store listing AND in-app |
| Privacy Nutrition Label | ⚠️ Must be accurately completed | Health data, camera, identifiers — complex label |
| In-App Purchase compliance | ✅ RevenueCat handles Apple IAP requirements | |
| Age rating | ⚠️ **Inconsistency** | PRD §10.4 (line 2717): "12+" vs. PRD late §10.2 (line 3506): "4+" — must resolve |
| HealthKit integration | Optional (PRD §10.4) | If implemented, additional review requirements apply |

### 5.4.2 Google Play Store

| Requirement | Status | Notes |
|------------|--------|-------|
| Health app declaration | ⚠️ Required since 2024 | Must complete Health Apps Policy form |
| Data safety section | ⚠️ Must accurately disclose all data collection | Camera, health data, third-party sharing (OpenAI) |
| Sensitive permissions | ✅ Camera justification straightforward | |
| Content rating | ✅ "Everyone" rating appropriate | |

### 5.4.3 App Store Rejection Risk

**Probability: Medium.** Health apps with AI-powered analysis face increased scrutiny. Common rejection reasons:

1. **Medical claims in listing** — "prediabetes reversal" could trigger rejection
2. **Insufficient medical disclaimer** — must be visible before first use
3. **Privacy label inaccuracy** — any mismatch between declared and actual data practices

**Mitigation:** Submit with conservative language. Prepare for 1–2 rejection rounds. Budget 2–3 weeks for App Store approval process (PRD §11.1 already allocates 7-day buffer at line 2757, which may be insufficient).

---

## 5.5 Intellectual Property

### 5.5.1 IP Risks

| Risk | Assessment | Mitigation |
|------|-----------|-----------|
| Patent infringement (food scanning) | Low — method is standard (photo → AI API → result) | No novel patentable method; common implementation |
| Trademark "Revora" | ⚠️ **Not verified** | Must conduct trademark search before brand investment; "Gluco" prefix is common in diabetes space |
| Open source license compliance | Low — all listed dependencies (Axum, React Native, Expo) use permissive licenses | Maintain license inventory |
| Trade secret (prompt engineering) | Medium — prompts are core competitive advantage | Store prompts server-side only; include in confidentiality agreements |

### 5.5.2 Trademark Concern

"Revora" combines "Gluco" (glucose) with "Snap" (photo). The diabetes/glucose space has numerous "Gluco-" trademarks (GlucoTrack, GlucoMe, GlucoRx). A trademark search is **mandatory** before launch to avoid:
- Cease and desist from existing trademark holders
- App Store name disputes
- Domain name conflicts

**Effort:** Trademark search: $500–$1,000 (attorney) or $100 (self-service). Filing: $250–$350 per class via USPTO. **Timeline: 2–4 weeks for search, 8–12 months for registration.**

---

## 5.6 Liability & Insurance

### 5.6.1 Liability Exposure

| Scenario | Probability | Exposure | PRD Coverage |
|----------|-----------|---------|-------------|
| User relies on false "Safe" classification, has glucose emergency | Low–Medium | Personal injury claim; potential class action | PRD §14.1 Risk 1 — mitigated by disclaimers, conservative bias |
| AI generates dangerous [REVIEW NEEDED: Replace restriction-framing with permission-first language] dietary advice (e.g., severe allergic reaction food swap) | Low | Personal injury; product liability | PRD §6.6 — dietary restriction respect at 100% (Spec §VAL-008) |
| Data breach exposing A1C/health data | Low | GDPR fines (up to 4% revenue); CCPA fines; class action | PRD §14.3 Risk 7 — mitigated by encryption, security audit |
| FTC enforcement for unsubstantiated health claims | Medium | FTC fines, injunction, consent decree | PRD §10.1 — partially mitigated but language gaps exist (see §5.1.3) |

### 5.6.2 Insurance Requirements

| Policy | PRD Coverage | Recommended |
|--------|------------|------------|
| General liability | Not mentioned | Required — $1M minimum |
| Cyber/data breach insurance | PRD §14.3: "$1M coverage" (line 3274) | ✅ Covered |
| Professional liability (E&O) | Not mentioned | **Recommended** — covers AI advice errors; $1M minimum |
| D&O insurance | Not mentioned | Not needed at solo founder stage; required if taking investment |

---

## 5.7 Dimension 5 Summary

### Blockers

| # | Blocker | Fix | Effort |
|---|---------|-----|--------|
| B6 | "Reversal" language throughout PRD and planned marketing violates own FDA wellness positioning — creates FTC and App Store rejection risk | Comprehensive language audit; replace "reversal" with "management/progress/tracking" in all features, marketing, and App Store listing | 1 day |
| B7 | No GDPR Data Protection Impact Assessment (DPIA) — legally required before processing health data at scale | Conduct and document DPIA | 1 week |
| B8 | No Data Processing Agreement (DPA) with OpenAI — GDPR violation for EU users | Execute OpenAI's standard DPA | 1 day |

### Risks

| # | Risk | Probability | Impact | Mitigation |
|---|------|------------|--------|------------|
| R21 | Apple App Store rejects app for medical claims in listing | Medium | Medium | Submit with conservative language; budget 3 weeks for approval |
| R22 | FTC challenge on A1C improvement claims or user testimonials | Low–Medium | High | Engage health claims attorney ($3–5K); remove all unsubstantiated outcome claims |
| R23 | "Revora" trademark conflict with existing "Gluco-" marks | Medium | Medium | Conduct trademark search immediately; have backup name ready |
| R24 | FDA reclassification if app crosses into clinical territory | Low | Critical | Maintain strict wellness language; legal review of every new feature |
| R25 | GDPR cross-border transfer challenge for EU users | Low | Medium | Implement SCCs; consider EU data residency for V2 |

---
---

# MASTER FEASIBILITY VERDICT

## Overall Score: 6.8 / 10 — CONDITIONAL GO

---

## Dimension Score Summary

| Dimension 				| Score | Verdict 		| Key Factor 									|
|-----------				|-------|---------		|-----------									|
| 1. Development Feasibility 		| 6.5 	| Conditional GO 	| Timeline optimistic; AI accuracy floor; solo founder risk 			|
| 2. Product Delivery Feasibility 	| 7.0 	| GO (with conditions) 	| Strong pain-point alignment; A1C algorithm unspecified 			|
| 3. Market Feasibility 		| 7.5 	| GO 			| Large real market; organic distribution advantage; retention targets aspirational |
| 4. Economic & Financial Feasibility 	| 6.0 	| Conditional GO 	| App Store commission omitted; free user subsidy risk; pricing inconsistency 	|
| 5. Legal & Regulatory Feasibility 	| 7.0 	| GO (with pre-launch work) | Wellness positioning sound but language violations throughout; GDPR gaps 	|
| **Weighted Average** 			| **6.8** | **CONDITIONAL GO** 	| 										|

---

## Integrated Risk/Opportunity Matrix

### Critical Path Risks (Blockers — Must Resolve Before Proceeding)

| ID | Blocker 									| Dimension 	| Fix Time 	| Owner 	|
|----|---------									|-----------	|----------	|-------	|
| B1 | AI accuracy floor — 74% recognition creates safety risk 			| Dev 		| 2–3 days 	| Engineering 	|
| B2 | Document inconsistencies (pricing, conventions, terminology) 		| Dev 		| 1 day 	| Product 	|
| B3 | A1C estimation algorithm unspecified — core feature with no validation 	| Product 	| 1.5 weeks 	| Product + Clinical Advisor |
| B4 | App Store commission (30%) omitted from financial model 			| Financial 	| 1 day 	| Finance 	|
| B5 | Pricing inconsistency ($9.99 / $12.99 / $14.99) across documents 	| Financial 	| 2 hours 	| Product 	|
| B6 | "Reversal" language violates FDA wellness positioning 			| Legal 	| 1 day 	| Legal + Product |
| B7 | No GDPR DPIA documented 							| Legal 	| 1 week 	| Legal 	|
| B8 | No DPA with OpenAI for data processing 					| Legal 	| 1 day 	| Legal 	|

**Total blocker resolution time: ~3 weeks** (many can run in parallel; critical path is ~2 weeks)

### High-Impact Risks (Manage During Development)

| ID  | Risk 						| Prob.  | Impact | Dimension |
|---- |------						|------- |--------|-----------|
| R1  | Timeline slips from 8 to 12+ weeks 		| High   | Medium | Dev |
| R2  | Solo founder burnout / key-person dependency 	| Medium | High   | Dev |
| R6  | AI accuracy insufficient at boundary cases 	| Medium | High   | Product |
| R11 | Retention targets unrealistic (45% DAU/MAU) 	| High   | High   | Market |
| R16 | Free user API costs exceed premium revenue 	| Medium | Critical | Financial |
| R18 | 5% churn assumption too optimistic 		| High   | High   | Financial |
| R22 | FTC challenge on health outcome claims 		| Low–Med| High   | Legal |

### Opportunities

| # | Opportunity | Impact | Timeline | Source |
|---|-----------|--------|----------|--------|
| O1 | Existing YouTube channel = $0 CAC for early users | High | Immediate | PRD §11.5 |
| O2 | No direct competitor in prediabetes-specific GL scanning | High | 6–12 month window | PRD §2.2 analysis |
| O3 | 97.6M US prediabetics; 80% undiagnosed = massive growth ceiling | High | Years | CDC data |
| O4 | Food sequencing advice is clinically validated differentiator | High | MVP | Shukla et al. 2019 |
| O5 | Bootstrappable with $15–40K capital | Medium | Immediate | §4.4 analysis |
| O6 | B2B2C insurance channel (CDC DPP) = premium pricing at scale | High | Year 2+ | PRD §9.6 |
| O7 | Fine-tuned model (Month 6) reduces AI costs 60% | High | Month 6 | PRD §12.3 |
| O8 | Data moat deepens with scale — 50K labeled scans becomes competitive advantage | High | 6–12 months | Spec §DAT-002 |

---

## Prioritized Pre-Development Action List

### Phase 0: Pre-Development (2–3 weeks before coding starts)

| Priority | Action | Owner | Duration | Dependencies |
|----------|--------|-------|----------|-------------|
| **P0-1** | Resolve all pricing inconsistencies — select single pricing strategy | Product | 2 hours | None |
| **P0-2** | Language audit — replace "reversal" with compliant wellness language across all docs | Product + Legal | 1 day | None |
| **P0-3** | Resolve API convention inconsistencies (camelCase vs. snake_case, spike risk terminology) | Engineering | 4 hours | None |
| **P0-4** | Conduct trademark search for "Revora" | Legal | 2 weeks (external) | Budget $500–$1,000 |
| **P0-5** | Execute OpenAI Data Processing Agreement | Legal | 1 day | None |
| **P0-6** | Conduct and document GDPR DPIA | Legal | 1 week | None |
| **P0-7** | Rebuild financial model with App Store commission, realistic churn (7–8%), and two-scenario approach | Finance | 1 day | P0-1 complete |
| **P0-8** | Define minimum accuracy gate for MVP launch (e.g., ≥85% spike classification on 100-meal test) | Engineering + Product | 2 hours | None |
| **P0-9** | Research and specify A1C estimation algorithm with error bounds | Product + Clinical | 1 week | Optional: recruit clinical advisor |
| **P0-10** | Create email waitlist landing page to quantify demand pre-launch | Marketing | 2 days | None |
| **P0-11** | Run price sensitivity survey with 200+ r/prediabetes members | Product | 1 week | None |

### Phase 1: Development Adjustments (Integrated into build sprint)

| Priority | Action | When | Impact |
|----------|--------|------|--------|
| **P1-1** | Implement Day-1 accuracy features (complexity classifier + master prompt + conservative fallback) as non-negotiable MVP gates | Week 1 | Eliminates worst safety failures |
| **P1-2** | Add explicit health data consent in onboarding flow (GDPR Art. 9) | Week 3 (onboarding) | GDPR compliance |
| **P1-3** | Implement GDPR consent banner for EU analytics | Week 3 | GDPR compliance |
| **P1-4** | Add third-party processing disclosure (OpenAI) to privacy policy | Pre-launch | GDPR + trust |
| **P1-5** | Instrument cost-per-scan tracking from Day 1 | Week 1 | Financial monitoring |
| **P1-6** | Budget 3 weeks for App Store approval (not 1 week) | Week 10+ | Realistic timeline |
| **P1-7** | Plan for 11–13 week MVP timeline, not 8 weeks | Sprint planning | Realistic expectations |

### Phase 2: Post-Launch Monitoring Triggers

| Trigger | Action | Threshold |
|---------|--------|----------|
| Conversion rate < 5% for 60 days | Reduce free tier from 5 → 3 scans/day | Month 2 |
| Monthly churn > 8% | Prioritize retention features over new features | Month 2 |
| Paid acquisition CAC > $35 | Pause paid spend; double down on organic | Month 6 |
| App Store rejection | Engage App Store consultant; revise all health claims | Pre-launch |
| API costs > $0.05/scan average | Accelerate caching optimization and fine-tuning timeline | Any |
| A1C estimation complaints | Widen uncertainty display; add more disclaimers | Any |

---

## Final Recommendation

### PROCEED — with the following conditions:

1. **Resolve all 8 blockers** (B1–B8) before writing the first line of production code. Estimated total: **2 weeks of parallel work.** None are technically difficult — they require decisions, not engineering.

2. **Replan the timeline** from 8 weeks to **11–13 weeks** for solo development, or **9–10 weeks** with a contract React Native developer ($15–25K investment).

3. **Rebuild the financial model** with corrected COGS (App Store commission), realistic churn (7–8%), and scenario-based planning (organic-only vs. paid-assisted growth).

4. **Invest $5–10K in pre-launch legal work:** FTC health claims attorney review, trademark search, GDPR DPIA, OpenAI DPA. This is non-negotiable insurance against regulatory risk.

5. **Set kill criteria:** If Day 30 retention is below 15% AND conversion is below 3% after 90 days of operation, the product-market fit hypothesis is invalidated. Pivot to B2B (white-label for DPP providers) or restructure the value proposition.

### Why PROCEED despite conditions:

- **The market is real, large, and underserved.** 115.2 million prediabetics (CDC 2026), ~80% unaware, a large underserved market (specific $ TAM unverified). The prediabetes-specific GL+coaching space is uncrowded but **not** uncontested (Glycemic Snap, LOGI, SNAQ, January AI do photo→GL).
- **The core value proposition is proven.** Cal AI demonstrated $2M MRR from photo-first food scanning. Revora adds clinical specificity (GL, sequencing, A1C tracking) that Cal AI lacks.
- **The business is bootstrappable.** $15–40K capital requirement with a clear path to monthly profitability by Month 3–6. No VC dependency.
- **The technology works.** AI accuracy is imperfect (74% recognition, 47.9% carb MAPE) but the PRD's layered mitigation architecture (complexity classifier, conservative bias, confidence scoring, human-in-the-loop) is well-designed and addresses the worst failure modes.
- **The founding team has distribution advantage.** An existing YouTube channel in the prediabetes niche provides $0 CAC user acquisition that competitors cannot replicate without months of content investment.

### Why NOT unconditional GO:

- **Financial model has errors** (App Store commission omission, inconsistent pricing) that must be corrected before investor or board presentations.
- **Regulatory language is sloppy** — the word "reversal" appears in core feature names and marketing copy, contradicting the PRD's own FDA compliance framework.
- **Retention and churn assumptions are aspirational** — the difference between 5% and 8% monthly churn is $9,100/month in lost MRR by Month 12.
- **Solo founder risk is real** — the bus factor is 1, the tech stack (Rust) is niche, and the timeline is aggressive.

**Bottom line: Revora is a viable product in a massive market with a proven model and a capable founding team. The conditions listed above are speed bumps, not roadblocks. Address them systematically before development begins, and the path to a $30K+ MRR SaaS business within 12 months is realistic.**

---

**END OF FEASIBILITY ANALYSIS**

*Document Version 1.0 | Prepared for Board Review*
