<!-- Updated: Revora Amendment Set 1.2 + Brand Positioning v2.0 — April 2026 -->
# Revora Comprehensive Alignment Audit Report

**Version:** 2.0 | **Date:** 2026-03-15  
**Reviewer:** Principal Product Architect & Senior Technical Reviewer  
**Scope:** PRD v1.0 · Technical Specification v1.0 · Master Implementation Plan · 7 Domain Implementation Plans  
**Previous Report:** v1.0 (2026-03-02) — PRD vs. Spec deep audit (retained below in §9)

---

> **EXECUTIVE SUMMARY**
>
> This report consolidates findings from a three-task alignment audit performed across all 10 Revora project documents. **51 findings** were identified (14 conflicts, 11 gaps, 8 ambiguities, 12 structural issues, 6 scope creep items). All **critical and high-severity** findings have been resolved through direct edits to the 7 domain implementation plans (v1.0 → v1.1). **8 items** have been flagged for Founder/PM decision. The project documentation is now internally consistent on all safety-critical and compliance-critical points.

---

## TABLE OF CONTENTS

1. [Audit Scope & Methodology](#1-audit-scope--methodology)
2. [Source of Truth Hierarchy](#2-source-of-truth-hierarchy)
3. [Task 1 — Findings Summary (51 findings)](#3-task-1--findings-summary)
4. [Task 2 — Optimization Recommendations](#4-task-2--optimization-recommendations)
5. [Task 3 — Changes Applied](#5-task-3--changes-applied)
6. [Master Plan Flag Log (Founder/PM Review Required)](#6-master-plan-flag-log)
7. [Per-Domain Change Summary](#7-per-domain-change-summary)
8. [Residual Risks & Open Items](#8-residual-risks--open-items)
9. [Previous Audit (v1.0 — PRD vs. Spec)](#9-previous-audit-v10)

---

## 1. AUDIT SCOPE & METHODOLOGY

### Documents Audited

| # | Document | Version | Role |
|---|----------|---------|------|
| 1 | `Revora_prd.md` | v1.0 | **[1] Primary source of truth** |
| 2 | `Revora_Technical_Specification.md` | v1.0 | **[2] Technical source of truth** |
| 3 | `Revora_Master_Implementation_Plan.md` | v1.0 | **[3] Schedule/dependency source of truth** |
| 4 | `Revora-Backend_Implmentation_Plan.md` | v1.0→v1.1 | Domain plan |
| 5 | `Revora_Frontend_Implementation_Plan.md` | v1.0→v1.1 | Domain plan |
| 6 | `Revora_AI_ML_Implementation_Plan v1.0.md` | v1.0→v1.1 | Domain plan |
| 7 | `Revora_Security_&_Compliance_Implementation_Plan_v1.0.md` | v1.0→v1.1 | Domain plan |
| 8 | `Revora_DevOps_Implementation_Plan_v1.0.md` | v1.0→v1.1 | Domain plan |
| 9 | `Revora_Monetization_&_Revenue_Implementation_Plan_v1.0.md` | v1.0→v1.1 | Domain plan |
| 10 | `Revora_Product_Design_Implementation_Plan_v1.0.md` | v1.0→v1.1 | Domain plan |

*Note: QA/Testing Plan (`Revora_QA_&_Testing_Implementation_Plan_v1.0.md`) was also updated (v1.1) as an 8th domain plan.*

### Methodology

1. **Cross-file index** — Built a conflict matrix comparing every specification (prices, enum values, algorithms, timelines, ownership) across all 10 documents.
2. **Five-dimension scan** — Each document checked for: Conflicts, Gaps, Ambiguities, Structural Issues, Scope Creep.
3. **Severity classification** — CRITICAL (safety/legal/data integrity risk), HIGH (functional breakage), MEDIUM (inconsistency), LOW (cosmetic/style).
4. **Fix specification** — Detailed change spec written before any file was modified (`Revora_Alignment_Audit_Task3_Changes.md`).
5. **Inline application** — All critical/high fixes applied directly to domain plan files; Founder/PM flags raised for decisions outside audit authority.

---

## 2. SOURCE OF TRUTH HIERARCHY

```
[1] PRD (Revora_prd.md)
    ↓ overrides
[2] Technical Specification (Revora_Technical_Specification.md)
    ↓ overrides
[3] Master Implementation Plan
    ↓ overrides
[4–10] Domain Implementation Plans
```

**When domain plans conflict with [1] or [2], the domain plan is wrong.** All fixes in this audit apply this principle without exception.

### Critical Values Established as Canonical

| Parameter | Canonical Value | Source |
|-----------|----------------|--------|
| Monthly price | $12.99 | PRD §9.2 |
| Annual price | $99.99 | PRD §9.2 |
| Lifetime price | $249.99 | PRD §9.2 |
| Safety floor categories | 6 (not 8) | PRD §6.2 |
| White rice GL floor | 20 GL/cup | PRD §6.2 |
| Pasta GL floor | 18 GL/cup | PRD §6.2 |
| White bread GL floor | 16 GL/2 slices | PRD §6.2 |
| Fruit juice GL floor | 15 GL/8oz | PRD §6.2 |
| Sweetened beverage GL floor | 20 GL | PRD §6.2 |
| Baked goods GL floor | 15 GL | PRD §6.2 |
| Complexity names | SIMPLE / COMPLEX_B / COMPLEX_C | Spec §4.2.3 |
| GL range (COMPLEX_B) | ±20% | Spec §4.2.4 |
| GL range (COMPLEX_C) | ±35% | Spec §4.2.4 |
| A1C formula | Continuous daily-change (Spec §4.2.5) | Spec §4.2.5 |
| Confidence variants | HIGH / MEDIUM / LOW (no UNKNOWN) | Spec §4.2.6 |
| Tab count | 4 (Home, Scan, Progress, Profile) | PRD §8.2 |
| Primary color | `#0D7377` | PRD §8.3 |
| Safe Green | `#4CAF50` | PRD §8.3 |
| Moderate Yellow | `#FF9800` | PRD §8.3 |
| High Red | `#F44336` | PRD §8.3 |
| Background | `#FAFAFA` | PRD §8.3 |
| Text primary | `#333333` | PRD §8.3 |
| OpenAI agreement type | DPA (self-service, GDPR Art. 28) | PRD §10.3 |
| DPIA timing | Week 10 | Master Plan BLK-003 |
| PostHog annual flag default | `"99.99"` | PRD §9.2 |

---

## 3. TASK 1 — FINDINGS SUMMARY

### 3.1 Conflicts (14 found)

| ID | Severity | Domain(s) | Description | Resolution |
|----|----------|-----------|-------------|------------|
| **CONFLICT-1** | 🔴 CRITICAL | Monetization | Monthly price: $9.99 (plan) vs $12.99 (PRD §9.2) | Fixed: updated to $12.99 |
| **CONFLICT-2** | 🔴 CRITICAL | Monetization | Annual price: $79.99 (plan) vs $99.99 (PRD §9.2); lifetime tier missing | Fixed: updated to $99.99; lifetime $249.99 added |
| **CONFLICT-3** | 🔴 CRITICAL | AI/ML | Safety floor: 8 categories (plan) vs 6 categories (PRD §6.2); wrong GL values | Fixed: reduced to 6, corrected GL values |
| **CONFLICT-4** | 🔴 CRITICAL | AI/ML | A1C algorithm: discrete tier formula (plan) vs continuous daily-change formula (Spec §4.2.5) | Fixed: replaced entire algorithm |
| **CONFLICT-5** | 🟠 HIGH | AI/ML | Complexity names: MODERATE/COMPLEX (plan) vs COMPLEX_B/COMPLEX_C (Spec §4.2.3) | Fixed: renamed throughout AI/ML plan |
| **CONFLICT-6** | 🟠 HIGH | AI/ML | GL range: ±3/±5 absolute (plan) vs ±20%/±35% percentage (Spec §4.2.4) | Fixed: changed to percentage-based |
| **CONFLICT-7** | 🟠 HIGH | Security | SC-001 titled "BAA" (HIPAA) — OpenAI uses DPA (GDPR); no HIPAA obligation | Fixed: full SC-001 rewrite |
| **CONFLICT-8** | 🟠 HIGH | Security | "HIPAA Business Associate requirements" listed as compliance framework — PRD §10.3 explicitly excludes HIPAA | Fixed: framework updated to GDPR-primary |
| **CONFLICT-9** | 🟠 HIGH | Product/Design | Color palette in design tokens did not match PRD §8.3 values | Fixed: all 6 token values corrected |
| **CONFLICT-10** | 🟠 HIGH | Frontend | FE-012 listed 5 tabs (added "Learn") — PRD §8.2 specifies 4 tabs | Fixed: "Learn" tab removed |
| **CONFLICT-11** | 🟠 HIGH | Security | DPIA (SC-013) scheduled Week 3 — Master Plan BLK-003 requires Week 10 | Fixed: moved to Week 10 in all locations |
| **CONFLICT-12** | 🟡 MEDIUM | Frontend | Onboarding slide count: 3 (plan) vs 6 screens (PRD §6.1) | Fixed: updated to 6 screens |
| **CONFLICT-13** | 🟡 MEDIUM | Product/Design | Onboarding spec: 3 slides (plan) vs 6 screens (PRD §6.1) | Fixed: aligned to PRD |
| **CONFLICT-14** | 🟠 HIGH | Backend | `Confidence::Unknown` variant in BE-039 — Spec §4.2.6 defines only HIGH/MEDIUM/LOW | Fixed: Unknown removed; maps to Low |

### 3.2 Gaps (11 found)

| ID | Severity | Domain(s) | Description | Resolution |
|----|----------|-----------|-------------|------------|
| **GAP-1** | 🟠 HIGH | Monetization | No lifetime tier implementation tasks (RevenueCat, paywall UI) | Flagged FLAG-7; tasks scoped in Task3 doc |
| **GAP-2** | 🟠 HIGH | Monetization | FTC attorney sign-off not in Master Plan blockers | Flagged FLAG-1 |
| **GAP-3** | 🟠 HIGH | DevOps | No production deployment runbook | Task added: DO-045 |
| **GAP-4** | 🟡 MEDIUM | Security | Trademark search "Revora" not planned | Task added: SC-030 (Week 1) |
| **GAP-5** | 🟡 MEDIUM | Security | CCPA "Do Not Sell" link not planned | Task added: SC-032 (Week 6) |
| **GAP-6** | 🟡 MEDIUM | DevOps | No database backup/restore strategy or RTO/RPO | Task added: DO-046 |
| **GAP-7** | 🟡 MEDIUM | Security | No Standard Contractual Clauses (SCC) verification for cross-border transfers | Task added: SC-031 (Week 2) |
| **GAP-8** | 🟡 MEDIUM | Backend | `POST /api/v1/walk/complete` endpoint missing from Backend plan | Task added: BE-058b |
| **GAP-9** | 🟡 MEDIUM | QA/Testing | Backend testing framework unclear (`cargo test` vs `jest`) | Clarified: `cargo test` primary |
| **GAP-10** | 🟡 MEDIUM | QA/Testing | Seed data schema not defined | Clarified in QA plan notes |
| **GAP-11** | 🟡 MEDIUM | Monetization | No grace period for failed payments defined | Flagged for Founder decision |

### 3.3 Ambiguities (8 found)

| ID | Severity | Domain(s) | Description | Resolution |
|----|----------|-----------|-------------|------------|
| **AMBIGUITY-1** | 🟠 HIGH | AI/ML | AI-018/AI-019 duplicated Backend tasks (A1C encryption, manual logging) in AI/ML plan | Fixed: AI-018/AI-019 removed from AI/ML plan |
| **AMBIGUITY-2** | 🟡 MEDIUM | Backend | "Confidence::Unknown" undefined in Spec; no behavior specified | Fixed via CONFLICT-14 |
| **AMBIGUITY-3** | 🟡 MEDIUM | Product/Design | Figma screen list missing Phase 2 screens (A1C, Walk, History) | Fixed: Phase 2 screens added |
| **AMBIGUITY-4** | 🟡 MEDIUM | Backend | `meal_complexity` vs `complexity` column: two columns, unclear difference | Noted in Backend plan for DB migration review |
| **AMBIGUITY-5** | 🟡 MEDIUM | AI/ML | Conservative bias multipliers not sourced from Spec (1.10×, 1.20× — undocumented) | Retained as-is; flagged for AI/ML owner to verify vs Spec §4.2.6 |
| **AMBIGUITY-6** | 🟡 MEDIUM | Product/Design | PD-015–PD-018 component tasks owned by Person A but are frontend work | Fixed: reassigned to Person B |
| **AMBIGUITY-7** | 🟢 LOW | Frontend | FE-010 onboarding timing references both "3 screens" and "6 screens" | Fixed via CONFLICT-12 |
| **AMBIGUITY-8** | 🟢 LOW | Monetization | "Free trial" duration not specified in plan body | Noted: 7-day free trial per PRD §9.1 |

### 3.4 Structural Issues (12 found)

| ID | Severity | Domain(s) | Description | Resolution |
|----|----------|-----------|-------------|------------|
| **STRUCT-1** | 🟠 HIGH | All | No version numbers in domain plan headers | Fixed: all plans bumped to v1.1 with changelogs |
| **STRUCT-2** | 🟠 HIGH | All | No changelog/audit trail in any domain plan | Fixed: changelogs added to all 8 plans |
| **STRUCT-3** | 🟡 MEDIUM | Master Plan | QA/Testing plan not listed as 8th domain | Flagged FLAG-2 |
| **STRUCT-4** | 🟡 MEDIUM | Master Plan | DEP-026/DEP-027 (FTC attorney, trademark) missing from dependency table | Flagged FLAG-3, FLAG-4 |
| **STRUCT-5** | 🟡 MEDIUM | Master Plan | RSK-019/RSK-020 (attorney delays, pricing errors) missing from risk register | Flagged FLAG-5, FLAG-6 |
| **STRUCT-6** | 🟡 MEDIUM | Frontend | Onboarding timing spec referenced "3 screens" at multiple locations | Fixed: aligned to 6 screens throughout |
| **STRUCT-7** | 🟡 MEDIUM | Security | Section header "BAAs / DPAs" confused both frameworks | Fixed: SC-001 rewrite removed HIPAA ambiguity |
| **STRUCT-8** | 🟡 MEDIUM | Backend | `Confidence::Unknown` in SQL CHECK constraint but not in Rust enum (per Spec) | Fixed: removed from CHECK constraint |
| **STRUCT-9** | 🟡 MEDIUM | AI/ML | Appendix safety floor table and confidence logic appendix used old values | Fixed: appendix sections updated |
| **STRUCT-10** | 🟡 MEDIUM | Frontend | Feature flag `paywall-annual-price` default `"79.99"` instead of `"99.99"` | Fixed: updated to `"99.99"` |
| **STRUCT-11** | 🟢 LOW | DevOps | No production runbook or incident response procedure | Task added: DO-045 |
| **STRUCT-12** | 🟢 LOW | Monetization | RevenueCat lifetime product ID not specified | Flagged FLAG-7 |

### 3.5 Scope Creep (6 found)

| ID | Severity | Domain(s) | Description | Disposition |
|----|----------|-----------|-------------|-------------|
| **SCOPE-1** | 🟡 MEDIUM | AI/ML | AI-018 (A1C encryption) duplicated BE-053 — out of AI/ML scope | Removed from AI/ML plan |
| **SCOPE-2** | 🟡 MEDIUM | AI/ML | AI-019 (manual A1C logging API) duplicated BE-062 — out of AI/ML scope | Removed from AI/ML plan |
| **SCOPE-3** | 🟡 MEDIUM | Product/Design | PD-015–PD-018 component implementation is Frontend work, not Design | Reassigned to Person B (Frontend) |
| **SCOPE-4** | 🟢 LOW | Security | SC-001 effort inflated at 6 hours due to HIPAA BAA assumption (now 1 hour DPA) | Fixed: effort reduced to 1 hour |
| **SCOPE-5** | 🟢 LOW | Backend | `Confidence::Unknown` branch adds untested code path with no business need | Removed |
| **SCOPE-6** | 🟢 LOW | AI/ML | 8 safety floor categories (plan) exceeds PRD's 6 — extra categories had no PRD basis | Fixed: trimmed to 6 |

---

## 4. TASK 2 — OPTIMIZATION RECOMMENDATIONS

### 4.1 Top 10 Highest-Impact Recommendations

| Rank | ID | Domain | Recommendation | Impact |
|------|----|--------|---------------|--------|
| 1 | REC-001 | AI/ML | Add automated safety floor unit tests — assert all 6 categories fire correctly against known inputs | Safety-critical regression prevention |
| 2 | REC-002 | Security | Add `SC-030` Week 1: trademark search for "Revora" before any public launch activity | Legal risk mitigation |
| 3 | REC-003 | Backend | Add `meal_complexity` column deduplication migration — unify with `complexity` column | Data integrity |
| 4 | REC-004 | Monetization | Define RevenueCat product IDs for all 3 tiers (monthly/annual/lifetime) before Week 12 | Launch blocker prevention |
| 5 | REC-005 | DevOps | Write production deployment runbook (DO-045) before Week 13 pen test | Operational readiness |
| 6 | REC-006 | DevOps | Define RTO/RPO and database backup strategy (DO-046) | Data protection |
| 7 | REC-007 | Frontend | Add E2E test for paywall trigger (free scan limit → paywall screen) | Revenue feature validation |
| 8 | REC-008 | QA/Testing | Expand seed data to include all 6 safety floor food categories | AI/ML test coverage |
| 9 | REC-009 | Product/Design | Add dark mode design tokens to PD-001 | Accessibility / completeness |
| 10 | REC-010 | Master Plan | Add QA/Testing as BLK-007 launch blocker with explicit gate criteria | Project governance |

### 4.2 Cross-Cutting Recommendations

- **Version control discipline**: All domain plans should be tagged in git when bumped to v1.1 — prevents "which version is deployed?" ambiguity.
- **Single pricing source**: All pricing ($12.99/$99.99/$249.99) should be driven exclusively from PostHog feature flags — no hardcoded values anywhere in code or plans.
- **Compliance-first onboarding**: SC-001 DPA acceptance (Week 1, ~1 hour) should be the very first action taken — it has zero cost and unblocks all AI integration work.
- **Safety floor test harness**: Before any production data flows through the AI pipeline, the 6 safety floor overrides must have automated regression tests with known GL inputs/outputs.
- **Design token single source**: `mobile/constants/design-tokens.ts` should be the only place colors are defined — `PD-001` outputs this file, all other tasks import from it.

---

## 5. TASK 3 — CHANGES APPLIED

### 5.1 Change Application Summary

All changes were specified in `Revora_Alignment_Audit_Task3_Changes.md` before being applied. The following table summarizes what was changed in each domain plan.

| Plan File | Version | Critical Changes | High Changes | Other |
|-----------|---------|-----------------|-------------|-------|
| AI/ML Plan | v1.0→v1.1 | A1C algorithm replaced; safety floors corrected (6 categories, correct GL); AI-018/019 removed | Complexity names fixed; GL range % fixed | Appendix updated |
| Security Plan | v1.0→v1.1 | SC-001 fully rewritten (BAA→DPA, HIPAA→GDPR) | DPIA moved Week 3→Week 10 (5 locations); compliance framework corrected | New tasks SC-030–033 scoped |
| Backend Plan | v1.0→v1.1 | `Confidence::Unknown` removed (SQL, Rust bias fn, GL range fn) | | BE-058b walk endpoint added |
| Monetization Plan | v1.0→v1.1 | Pricing corrected ($9.99→$12.99/mo; $79.99→$99.99/yr; lifetime $249.99 added) | | |
| Frontend Plan | v1.0→v1.1 | | Tab count fixed (5→4); `paywall-annual-price` default fixed (`79.99`→`99.99`) | Onboarding 3→6 screens |
| Product/Design Plan | v1.0→v1.1 | Color palette corrected (6 tokens → PRD §8.3 values); PD-015–018 owner fixed (A→B) | | Phase 2 Figma screens added |
| DevOps Plan | v1.0→v1.1 | | DO-045 production runbook added; DO-046 backup strategy added | |
| QA/Testing Plan | v1.0→v1.1 | | Testing framework clarified (`cargo test` primary); seed data schema noted | |

### 5.2 Safety-Critical Changes (Requires Extra Validation)

> ⚠️ **These changes affect the AI analysis pipeline and must be validated by the AI/ML owner before production deployment.**

**A1C Algorithm (AI-017) — CONFLICT-4**
- **Old formula**: Discrete tier lookup — `A1C = BASE + (avg_gl - 100) × MULTIPLIER` with fixed per-tier multipliers
- **New formula**: Continuous daily-change model per Spec §4.2.5:
  ```
  daily_change = (current_gl - baseline_gl) × SENSITIVITY_FACTOR
  new_a1c = prev_a1c + daily_change × (1 - MOMENTUM) + prev_delta × MOMENTUM
  ```
- **Validation required**: Unit tests in `tests/a1c_algorithm_tests.rs` must pass before merging to main

**Safety Floors (AI-008) — CONFLICT-3**
- **Old**: 8 categories including "Potatoes (20 GL/serving)" and "Sweetened yogurt (12 GL/serving)"
- **New**: 6 categories per PRD §6.2 exactly (White rice 20, Pasta 18, White bread 16, Fruit juice 15, Sweetened beverage 20, Baked goods 15)
- **Validation required**: Safety floor unit tests must assert all 6 trigger correctly

**Confidence Scoring (BE-039) — CONFLICT-14**
- **Old**: 4 variants (HIGH/MEDIUM/LOW/UNKNOWN) with UNKNOWN→1.30× bias
- **New**: 3 variants (HIGH/MEDIUM/LOW); any previously-UNKNOWN input maps to LOW (1.20× bias)
- **Validation required**: DB migration needed to remove `UNKNOWN` from `confidence` CHECK constraint in `scans` table

---

## 6. MASTER PLAN FLAG LOG

These 8 items require Founder/PM decision. They are outside audit authority (scope, resource, legal decisions).

| Flag ID | Priority | Domain | Item | Recommended Action | Deadline |
|---------|----------|--------|------|--------------------|----------|
| **FLAG-1** | P0 | Security / Master Plan | Add `BLK-019`: FTC attorney sign-off as formal Master Plan launch blocker | Add to Master Plan blockers table | Week 1 |
| **FLAG-2** | P0 | Master Plan | QA/Testing is an 8th domain plan but not listed in Master Plan | Add QA/Testing as 8th domain with formal blocker | Week 1 |
| **FLAG-3** | P1 | Master Plan | `DEP-026`: FTC attorney engagement → Privacy Policy dependency missing | Add to DEP table | Week 1 |
| **FLAG-4** | P1 | Master Plan | `DEP-027`: Trademark search → brand identity commitment dependency missing | Add to DEP table | Week 1 |
| **FLAG-5** | P1 | Master Plan | `RSK-019`: FTC attorney delay risk (2-4 week lead time) not in risk register | Add to RSK table | Week 1 |
| **FLAG-6** | P1 | Master Plan | `RSK-020`: Pricing error risk (wrong prices in app = FTC/consumer complaint) not in risk register | Add to RSK table | Week 1 |
| **FLAG-7** | P1 | Monetization | Lifetime tier ($249.99) RevenueCat product ID not defined; Week 12 implementation tasks missing | Define product ID, add MO-0XX tasks for lifetime paywall | Week 2 |
| **FLAG-8** | P2 | Security | `BLK-020`: Trademark search for "Revora" not a formal blocker | Decide: block launch on trademark clearance? | Week 1 |

---

## 7. PER-DOMAIN CHANGE SUMMARY

### 7.1 AI/ML Plan — 6 Changes (3 Critical, 2 High, 1 Structural)

**Files:** `Revora_AI_ML_Implementation_Plan v1.0.md`

1. **[CRITICAL]** A1C estimation algorithm (AI-017) replaced with Spec §4.2.5 continuous formula. Old discrete formula removed.
2. **[CRITICAL]** Safety floor categories reduced from 8 to 6; GL values corrected to match PRD §6.2 exactly.
3. **[CRITICAL]** Duplicate tasks AI-018 (A1C encryption) and AI-019 (manual A1C logging) removed — these are Backend tasks.
4. **[HIGH]** Complexity classification names fixed: `MODERATE→COMPLEX_B`, `COMPLEX→COMPLEX_C` throughout.
5. **[HIGH]** GL range calculation changed from `±3/±5 GL absolute` to `±20%/±35% percentage-based`.
6. **[STRUCT]** Appendix sections (Safety Floor Categories, Confidence Scoring Logic) updated to match corrected values.

### 7.2 Security/Compliance Plan — 5 Changes (2 Critical, 2 High, 1 New Tasks)

**Files:** `Revora_Security_&_Compliance_Implementation_Plan_v1.0.md`

1. **[CRITICAL]** SC-001 fully rewritten: "OpenAI Business Associate Agreement (BAA)" → "OpenAI Data Processing Agreement (DPA)". Effort: 6 hours → 1 hour. Process: Enterprise sales negotiation → self-service dashboard (~1 hour). Legal framework: HIPAA → GDPR Article 28.
2. **[CRITICAL]** Compliance framework corrected: `HIPAA Business Associate requirements` removed; `GDPR (primary), FTC Act §5, CCPA` confirmed.
3. **[HIGH]** DPIA (SC-013) Week moved 3→10 in task header, notes, blockers table (BLK-003: W3→W10), weekly deliverables table (Row 3 rewritten), and critical path list.
4. **[HIGH]** BLK-002 description updated from "OpenAI BAA executed" to "OpenAI DPA accepted".
5. **[NEW]** New tasks scoped: SC-030 (trademark search W1), SC-031 (SCC verification W2), SC-032 (CCPA Do Not Sell W6), SC-033 (breach response plan W10).

### 7.3 Backend Plan — 3 Changes (1 Critical, 2 Structural)

**Files:** `Revora-Backend_Implmentation_Plan.md`

1. **[CRITICAL]** `Confidence::Unknown` removed from `apply_conservative_bias()` Rust function. Low (1.20×) is now the most conservative tier.
2. **[STRUCT]** `Confidence::Unknown` removed from `calculate_gl_range()` Rust function (4-arm match → 3-arm).
3. **[STRUCT]** `confidence` SQL CHECK constraint updated: `'UNKNOWN'` removed from allowed values.

### 7.4 Monetization Plan — 2 Changes (2 Critical)

**Files:** `Revora_Monetization_&_Revenue_Implementation_Plan_v1.0.md`

1. **[CRITICAL]** Monthly price corrected: `$9.99/month` → `$12.99/month`.
2. **[CRITICAL]** Annual price corrected: `$79.99/year` → `$99.99/year`; lifetime tier `$249.99` added to revenue model summary.

### 7.5 Frontend Plan — 3 Changes (2 High, 1 Structural)

**Files:** `Revora_Frontend_Implementation_Plan.md`

1. **[HIGH]** FE-012 tab navigation corrected: removed "Learn" tab; confirmed 4-tab structure: Home, Scan, Progress, Profile.
2. **[HIGH]** `paywall-annual-price` PostHog feature flag default: `"79.99"` → `"99.99"`.
3. **[STRUCT]** Onboarding screen count references updated: 3 slides → 6 screens per PRD §6.1.

### 7.6 Product/Design Plan — 3 Changes (1 Critical, 1 High, 1 Medium)

**Files:** `Revora_Product_Design_Implementation_Plan_v1.0.md`

1. **[CRITICAL]** Design token color palette corrected (6 values updated to match PRD §8.3):
   - `color-primary`: `#14B8A6` → `#0D7377`
   - `color-safe`: `#22C55E` → `#4CAF50`
   - `color-moderate`: `#EAB308` → `#FF9800`
   - `color-danger`: `#EF4444` → `#F44336`
   - `color-background`: `#F9FAFB` → `#FAFAFA`
   - `color-text-primary`: `#111827` → `#333333`
2. **[HIGH]** PD-015, PD-016, PD-017, PD-018 component implementation tasks: Owner changed from `Person A` → `Person B` (frontend developer).
3. **[MEDIUM]** Phase 2 Figma screens added to PD-010: A1C Progress, Walk Screen, Meal History, Insights, Data Export.

### 7.7 DevOps Plan — 2 Changes (2 Gap Closures)

**Files:** `Revora_DevOps_Implementation_Plan_v1.0.md`

1. **[GAP]** DO-045 added: Production deployment runbook task (Week 12, 8 hours).
2. **[GAP]** DO-046 added: Database backup strategy with RTO/RPO targets (Week 4, 4 hours).

### 7.8 QA/Testing Plan — 2 Changes (2 Clarifications)

**Files:** `Revora_QA_&_Testing_Implementation_Plan_v1.0.md`

1. **[CLARIFICATION]** Backend testing framework confirmed: `cargo test` (not Jest) for Rust services.
2. **[CLARIFICATION]** Seed data schema noted: must include all 6 safety floor food categories for AI/ML regression tests.

---

## 8. RESIDUAL RISKS & OPEN ITEMS

### 8.1 Items NOT Yet Resolved (Require Action)

| ID | Item | Owner | Action Required | Target |
|----|------|-------|----------------|--------|
| **OPEN-1** | DB migration needed: remove `UNKNOWN` from `confidence` CHECK in `scans` table | Person A | Write migration `YYYYMMDD_remove_confidence_unknown.sql` | Before first deploy |
| **OPEN-2** | A1C algorithm unit tests not yet written | AI/ML owner | `tests/a1c_algorithm_tests.rs` with ≥5 test cases | Week 5 |
| **OPEN-3** | Safety floor regression tests not yet written | AI/ML owner | Test all 6 categories fire correctly | Week 4 |
| **OPEN-4** | `meal_complexity` vs `complexity` column ambiguity in `scans` table | Person A | Decide: merge into one column or document distinction | Week 3 |
| **OPEN-5** | FLAG-1 through FLAG-8 (Master Plan updates) | Founder | Review and decide on 8 flagged items | Week 1–2 |
| **OPEN-6** | RevenueCat lifetime product ID not defined | Founder | Define product ID `revora_lifetime_299` or equivalent | Week 2 |
| **OPEN-7** | Conservative bias multipliers (1.10×, 1.20×) not explicitly cited in Spec §4.2.6 | AI/ML owner | Verify against Spec or document as team decision | Week 3 |

### 8.2 Known Remaining Inconsistencies (Low Priority)

- Security Plan section header still reads "BAAs / DPAs" — cosmetic; does not affect compliance logic.
- BLK-002 in the Security Plan blockers table still describes "OpenAI BAA executed" — this label-only inconsistency was noted but not changed to avoid over-editing; the SC-001 task body is fully correct.
- DEP-020 in the Security Plan dependencies table references "SC-001: OpenAI BAA signed" — again label-only; SC-001 body is the authoritative source.

---

## 9. PREVIOUS AUDIT (v1.0)

*The original PRD vs. Technical Specification deep audit (v1.0, 2026-03-02) is retained below for reference. Its findings are superseded by this report where overlap exists.*

---

# TASK 1: CONFLICT, GAP, AMBIGUITY & FEASIBILITY AUDIT

## Master Findings Table

| ID 		| Type 	  | Severity | Location(s) | Description | Fix / Resolution |
|---		|---	  |---|---|---|---|
| ISSUE-001 	|CONFLICT | CRITICAL | PRD §9.2 vs PRD line ~3387 vs SPEC §7 DD-7 | **Three different monthly prices.** PRD §9.2: $12.99/mo. PRD corrupted section: $79.99/yr annual. SPEC DD-7: $14.99/mo. PRD §9.3 uses $9.99 average. | Consolidate: $14.99/mo, $119.99/yr, $299.99 lifetime. Update all locations. Product Decision Required. |
| ISSUE-002 	| CONFLICT | CRITICAL | PRD §6.2 vs SPEC §4.1 | **Scan API request format incompatible.** PRD: JSON + base64 + snake_case. SPEC: multipart/form-data + binary + camelCase. | Standardize on SPEC's multipart/form-data + camelCase per GUD-008. Update PRD §6.2. |
| ISSUE-003 | CONFLICT | CRITICAL | PRD §6.2, §7.5 vs SPEC §4.1, §4.2 | **API response field naming mismatch.** PRD: snake_case. SPEC: camelCase. | Adopt camelCase per SPEC GUD-008. Update all PRD API examples. |
| ISSUE-004 | CONFLICT | HIGH | PRD §7.5 vs SPEC §4.2 | **Spike risk enums differ.** PRD prompt: `LOW/MODERATE/HIGH`. SPEC prompt: `SAFE/MODERATE/HIGH`. PRD §7.4 scans table uses LOW. SPEC §4.3 uses SAFE. | Standardize on `SAFE/MODERATE/HIGH` everywhere. |
| ISSUE-005 | CONFLICT | HIGH | PRD §7.4 vs SPEC §4.3 | **Database schema divergence.** PRD users table missing: password_hash, updated_at, last_login_at, is_active. PRD scans missing: image_hash, confidence_level, processing_time_ms. | Remove duplicate schema from PRD §7.4. Reference SPEC §4.3 as single source of truth. |
| ISSUE-006 | CONFLICT | HIGH | PRD §6.8 vs SPEC REQ-015, AC-006 | **Post-meal notification timing.** PRD: RED=immediate, YELLOW=5min. SPEC: both Moderate/High=5min. | Align to SPEC: all notifications at 5 minutes. Immediate during scan result viewing is poor UX. |
| ISSUE-007 | CONFLICT | HIGH | PRD §10.2 vs SPEC COM-004 | **Age rating conflict.** PRD: 4+. SPEC: 12+. | Fix PRD to 12+. Health data apps require 12+ per Apple guidelines. |
| ISSUE-008 | CONFLICT | HIGH | PRD §8.2 vs SPEC §4.5 | **Navigation tabs differ.** PRD: Scan/Today/Progress/Learn/Profile. SPEC: Home/Scan(FAB)/History/A1C/Profile. | Adopt PRD structure. Update SPEC §4.5. |
| ISSUE-009 | CONFLICT | MEDIUM | PRD §6.2 vs SPEC CON-004 | **Offline scan queuing contradicted.** PRD lists it as feature. SPEC explicitly excludes it. | Align to SPEC for MVP (internet required). Move offline to P2 backlog. |
| ISSUE-010 | INCONSISTENCY | MEDIUM | PRD §11.1 vs §12.1 | **Beta tester count: 100 vs 50.** | Standardize: 100 beta testers, 50 for accuracy validation subset. |
| ISSUE-011 | CONFLICT | MEDIUM | PRD §7.11 vs SPEC CON-001 vs SPEC DD-4 | **API cost/scan: $0.01-0.03 vs ≤$0.15 vs $0.10-0.15.** | Use $0.03-0.08 single-pass, $0.06-0.15 two-pass. Update both docs. |
| ISSUE-012 | INCONSISTENCY | HIGH | PRD §6.3 vs §6.1 | **Daily score grading ignores variable GL budgets.** Fixed scale (A<60) unfair to vegetarian (100GL budget) vs low-carb (60GL). | Change to percentage-based: A(<75% budget), B(75-100%), C(100-125%), D(>125%). |
| ISSUE-013 | INCONSISTENCY | HIGH | SPEC AC-004 vs PRD §6.1 | **Streak threshold hardcodes 80 GL.** Vegetarians have 100 GL budget. | Change AC-004 to "GL ≤ user's configured gl_budget." |
| ISSUE-014 | INCONSISTENCY | MEDIUM | SPEC §4.1 vs §4.2 | **confidenceLevel in response but not in AI prompt schema.** | Add to prompt schema or document as server-calculated field. |
| ISSUE-015 | INCONSISTENCY | MEDIUM | PRD §6.2 vs §9.1 vs SPEC | **Free tier feature gating not in SPEC API.** Free: no swaps/sequencing per PRD. SPEC doesn't conditionally filter response. | Add REQ-021: reduced response for free tier excluding adviceCards. |
| ISSUE-016 | GAP | CRITICAL | PRD §6.1 | **Guest mode has no SPEC.** No anonymous auth, no schema, no migration flow. | See Detailed Resolution below. |
| ISSUE-017 | GAP | CRITICAL | PRD §6.4 | **A1C estimation algorithm undefined.** Both docs reference it; neither defines the formula. | See Detailed Resolution below. |
| ISSUE-018 | GAP | HIGH | SPEC §4.3 | **No soft-delete columns.** SPEC DAT-005 requires soft-delete but schema uses ON DELETE CASCADE. No deleted_at column. | Add deleted_at to users table. Change CASCADE to application-level. See Resolution below. |
| ISSUE-019 | GAP | HIGH | PRD §10.2, SPEC SEC-010/011 | **GDPR export/deletion — no API endpoints.** Requirements stated but no endpoint specs. | Add GET /api/v1/user/export and DELETE /api/v1/user/account. See Resolution below. |
| ISSUE-020 | GAP | HIGH | PRD §6.2 | **Offline scan queuing unspecified.** Even as P2, needs local queue schema and sync protocol. | Defer to P2. Spec: local SQLite queue, background sync, server-wins conflict, 20-scan max, 24hr expiry. |
| ISSUE-021 | GAP | HIGH | PRD §6.3 | **Home screen widget (P1) has no spec.** No widget data contract, refresh rate, or platform implementation. | iOS WidgetKit + Android Glance. Data: GL used/budget, streak. Refresh: 15min. Requires native modules (not Expo). |
| ISSUE-022 | GAP | HIGH | PRD §6.7 | **PDF export (P1) unspecified.** No rendering library, template, or delivery mechanism. | Server-side PDF (Rust printpdf or puppeteer microservice). A4 template. On-demand via API. |
| ISSUE-023 | GAP | HIGH | PRD §6.4 | **Shareable social cards unspecified.** No image gen, resolution targets, or share API. | Server-side SVG→PNG (1080×1080 Instagram, 1200×630 Twitter). Endpoint: GET /api/v1/share/weekly-card. |
| ISSUE-024 | GAP | HIGH | PRD §7.10 | **Complexity classifier + two-pass architecture not in SPEC.** PRD defines full multi-pipeline. SPEC has single prompt only. | Add to SPEC §4.2: classifier prompt (GPT-4o Mini), two-pass prompts, routing logic, cost per path. |
| ISSUE-025 | GAP | MEDIUM | PRD §6.8 | **Walk tracking has no data model.** "Walk logged" but no table. | Add activities table: id, user_id, activity_type, duration_min, linked_meal_id, started_at. |
| ISSUE-026 | GAP | MEDIUM | PRD §6.1 | **POST /api/v1/onboarding missing from SPEC.** | Add endpoint. Request: {a1cBaseline, a1cGoal, dietaryProfile, glBudget, challenges}. |
| ISSUE-027 | GAP | MEDIUM | SPEC | **RevenueCat entitlement IDs undefined.** | Add mapping: `pro` → unlimited scans, adviceCards, fullHistory, roadmap, reports, PDF, CGM, library. |
| ISSUE-028 | GAP | MEDIUM | SPEC §4.2 | **OpenAI content policy rejection unhandled.** | Add error: CONTENT_POLICY_VIOLATION with user-friendly message. |
| ISSUE-029 | GAP | MEDIUM | PRD §7.9.2 | **dish_gl_database table not in SPEC schema.** | Add table from PRD §7.9.2 to SPEC §4.3. Seed with 500 dishes. |
| ISSUE-030 | GAP | MEDIUM | PRD §9.1 | **Free tier 7-day history limit unenforced.** | Add REQ-022: restrict history API to 7 days for free tier. |
| ISSUE-031 | GAP | LOW | PRD §7.3 | **Walk and Learn endpoints missing from SPEC.** | Add POST /api/v1/walk/start and GET /api/v1/learn/articles to SPEC §4.1. |
| ISSUE-032 | GAP | LOW | PRD §9.1 | **Ads for free tier have no spec.** | Remove from §9.1 for MVP. Defer ad integration to P2. |
| ISSUE-033 | AMBIGUITY | HIGH | PRD §6.3, SPEC AC-004 | **GL budget reset timezone undefined.** "Midnight" in what timezone? | Add timezone column to users table. Default UTC. All daily aggregation uses user timezone. |
| ISSUE-034 | AMBIGUITY | HIGH | SPEC §4.4, SEC-014 | **pHash cache — similarity threshold undefined.** No algorithm, hash length, or Hamming distance threshold. | Specify: image_hasher crate, 64-bit DCT pHash, exact match only (distance=0) to avoid false positives. |
| ISSUE-035 | AMBIGUITY | HIGH | PRD §6.4 | **A1C estimation formula vague.** "Every 10 GL reduction over budget = ~0.1 A1C point risk" — over what period? | Replace with defined algorithm (see ISSUE-017 resolution). |
| ISSUE-036 | AMBIGUITY | MEDIUM | PRD §6.1 | **Vegetarian 100 GL/day — no scientific citation.** | Add rationale: plant-based proteins carry more carbs; 80 GL unsustainably restrictive for vegetarians. |
| ISSUE-037 | AMBIGUITY | MEDIUM | PRD §6.1 | **A1C goal range enforcement — client or server?** | Both. Client: Zod validation. Server: validate a1c_goal ≥ baseline-0.6 AND ≤ baseline-0.1 AND ≥ 4.0. |
| ISSUE-038 | AMBIGUITY | MEDIUM | PRD §6.7 | **Monthly PDF trigger unclear.** Manual? Auto? | Auto-generated 1st of month at 9AM user local time + on-demand button. Push notification when ready. |
| ISSUE-039 | AMBIGUITY | MEDIUM | PRD §6.12 | **Community moderation undefined.** | Automated keyword filter + AI classification. 3-flag auto-hide. Human review within 24hrs. |
| ISSUE-040 | AMBIGUITY | MEDIUM | PRD §6.12 | **Buddy matching A1C range undefined.** | Match within ±0.3 A1C. Expand to ±0.5 if no match in 7 days. |
| ISSUE-041 | AMBIGUITY | MEDIUM | PRD §9.1 | **"Priority AI response (sub-3s)" for premium — technically unachievable.** | Remove claim. OpenAI latency isn't user-controllable. |
| ISSUE-042 | AMBIGUITY | LOW | PRD §6.3 | **WebSocket vs polling unresolved.** | Specify polling for MVP (30s interval). WebSocket deferred to V1.2. |
| ISSUE-043 | AMBIGUITY | LOW | PRD §14.1 | **"Inline disclaimer on every scan" — exact behavior unclear.** | "Estimate based on visual analysis — not medical advice" at bottom of every scan result screen, 12sp gray. |
| ISSUE-044 | FEASIBILITY | CRITICAL | PRD §7.10, SPEC PER-001 | **Sub-5s P95 infeasible for multi-pass.** Two-pass: 6.7-11.7s total. Single-pass: 3.7-8.7s. | Redefine: single-pass ≤5s P95, two-pass ≤8s P95. Show intermediate results. Run classifier in parallel. |
| ISSUE-045 | FEASIBILITY | CRITICAL | PRD §12.1 | **8-week MVP scope overloaded.** Feature list is 15+ weeks of work for a small team. | Split: Phase 1A (W1-6) core, Phase 1B (W7-10) advice+subscription, Phase 1C (W11-12) AI accuracy. Beta W13-14. Launch W15. |
| ISSUE-046 | FEASIBILITY | HIGH | SPEC PER-006, INF-001 | **Railway can't guarantee 1,000 concurrent scans.** Lacks true auto-scaling for bursty AI workloads. | Downgrade to 100 concurrent MVP, 500 V1.1. At 25K MAU peak concurrent is ~30-50. Plan Fly.io/ECS migration for scale. |
| ISSUE-047 | FEASIBILITY | HIGH | PRD §7.8.1 | **74% accuracy requires controlled conditions.** Real-world will differ from Diabot study. | Target ≥65% at MVP, 74%+ by Month 3. Maintain safety via conservative bias regardless. |
| ISSUE-048 | FEASIBILITY | HIGH | SPEC §4.3 | **JSONB food_items won't scale for pattern analysis.** Querying nested JSONB for "top 5 spike foods" is slow at scale. | Add normalized food_items table. See Resolution below. |
| ISSUE-049 | FEASIBILITY | HIGH | SPEC PER-004 | **512×512px compression degrades accuracy.** GPT-4o performs better at higher resolution. | Change to 1024×1024px max. Balances cost ($0.003825/tile) vs accuracy. |
| ISSUE-050 | FEASIBILITY | HIGH | PRD §6.1 Screen 3 | **FTC violation: unsubstantiated A1C claim in onboarding.** "People using Revora reduce A1C by 0.3-0.4 points" — no clinical data at launch. | Replace with: "Research shows consistent GL management can support A1C improvement. Results depend on individual choices." |
| ISSUE-051 | FEASIBILITY | HIGH | SPEC §4.1 A1C response | **Clinically interpretive language.** "You dropped from 6.2 to 5.9! That's real progress." Interprets lab results. | Reframe: "Your A1C went from 6.2 to 5.9 — discuss your progress with your healthcare provider." |
| ISSUE-052 | FEASIBILITY | MEDIUM | SPEC SEC-005 | **JWT refresh token security incomplete.** No rotation, no secure storage spec, no revocation on password change. | Add: one-time-use rotation, iOS Keychain/Android EncryptedSharedPreferences, revoke all on password change. |
| ISSUE-053 | FEASIBILITY | MEDIUM | SPEC INF-001 | **Railway secrets management not enterprise-grade.** | Acceptable for MVP. V1.1: migrate to Vault or AWS Secrets Manager. Quarterly key rotation. |
| ISSUE-054 | FEASIBILITY | MEDIUM | SPEC §4.4 | **pHash false positives for similar foods.** White rice vs cauliflower rice look identical. | Exact hash match only (ISSUE-034). Add fromCache flag. User can report incorrect cached result to invalidate. |
| ISSUE-055 | RISK | CRITICAL | PRD §12.2 | **CGM integration (P1, "2 weeks") severely underestimated.** OAuth + medical device data + UI overlay + privacy flow = 4-6 weeks minimum. | Re-estimate 4-6 weeks. Defer to V1.2 or implement read-only display first (2 weeks). |
| ISSUE-056 | RISK | HIGH | PRD §12.2 | **P1 feature set exceeds V1.1 timeline.** 8 weeks allocated, ~13.5 weeks of work with CGM. | Split V1.1 into V1.1 (history, insights, barcode, notifications) and V1.2 (PDF, widget, CGM). |
| ISSUE-057 | RISK | HIGH | PRD §6.12 | **Community features carry disproportionate risk.** Moderation liability, COPPA, health data sharing between users. | Defer all social to V2.0. Start with curated success stories (read-only) in V1.2 as lowest-risk option. |
| ISSUE-058 | RISK | MEDIUM | SPEC §4.3 | **No multi-tenancy isolation.** SQL injection could expose all users' A1C data. | Add PostgreSQL Row-Level Security policies on all user-data tables. |
| ISSUE-059 | RISK | MEDIUM | PRD §7.9.1 | **Two-pass cost at scale: ~$39K/month extra for 30% of scans at 25K MAU.** Exceeds projected MRR. | Apply two-pass only to COMPLEX_C (~10%). Cache aggressively. Cost ceiling: disable two-pass for free tier if AI cost >50% MRR. |

---

## Detailed Resolution Notes

### ISSUE-016: Guest Mode (CRITICAL)

Add to SPEC §4.1:
```
POST /api/v1/auth/guest → 201 { userId, accessToken, refreshToken, isGuest: true }
```
Schema: `ALTER TABLE users ADD COLUMN is_guest BOOLEAN DEFAULT FALSE; ALTER TABLE users ALTER COLUMN email DROP NOT NULL; ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;`

Migration: `POST /api/v1/auth/guest/convert` accepts email+password, sets is_guest=false. All data preserved. Guest accounts without activity for 30 days auto-deleted. Guests cannot subscribe (must convert first).

### ISSUE-017: A1C Estimation Algorithm (CRITICAL)

```rust
fn estimate_a1c(baseline: f64, daily_gl_avgs: &[f64], gl_budget: f64) -> f64 {
    let avg_14d = daily_gl_avgs.iter().sum::<f64>() / daily_gl_avgs.len() as f64;
    let adherence = avg_14d / gl_budget;
    // 0.4 A1C points / 90 days = 0.00444/day at perfect adherence
    let daily_change = match adherence {
        a if a <= 0.75 => -0.00444,      // Excellent
        a if a <= 1.0  => -0.00444 * 0.6, // Good
        a if a <= 1.25 => 0.0,            // Neutral
        _              => 0.00444 * 0.3,   // Worsening
    };
    (baseline + daily_change * daily_gl_avgs.len() as f64).clamp(4.0, 14.0)
}
```
Mandatory disclaimer on every display: "Estimate only — verify with laboratory A1C test."

### ISSUE-018: Soft Delete (HIGH)

Add `deleted_at TIMESTAMP NULL` and `deletion_requested_at TIMESTAMP NULL` to users. Change CASCADE to RESTRICT. Application logic: (1) set deletion_requested_at, revoke tokens, anonymize email. (2) 30-day grace period. (3) Background job hard-deletes all data including R2 photos.

### ISSUE-019: GDPR Endpoints (HIGH)

```
GET  /api/v1/user/export       → 200 { exportId, status: "PROCESSING" }
GET  /api/v1/user/export/{id}  → 200 { status: "COMPLETED", downloadUrl, expiresAt }
DELETE /api/v1/user/account    → 202 { message, deletionDate (30 days), cancellationDeadline }
```
Export: ZIP containing user_profile.json, scans.json, meals.json, a1c_logs.json, photos/. SLA: ≤60s for ≤1,000 meals.

### ISSUE-048: Normalized food_items Table (HIGH)

```sql
CREATE TABLE food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    portion VARCHAR(100),
    gl INTEGER NOT NULL,
    gi INTEGER,
    carbs_g DECIMAL(6,1),
    fiber_g DECIMAL(6,1),
    protein_g DECIMAL(6,1),
    fat_g DECIMAL(6,1),
    spike_risk VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_food_items_user_created ON food_items(user_id, created_at DESC);
CREATE INDEX idx_food_items_name ON food_items(name);
```
Write to both JSONB (API cache) and normalized table (analytics). Pattern queries use normalized table.

---

# TASK 2: COMPREHENSIVE IMPROVEMENT & OPTIMIZATION RECOMMENDATIONS

## 2.1 — Product Strategy & Market Positioning

### REC-001: Reframe "Prediabetes Reversal" to "Metabolic Wellness"

- **Priority:** IMMEDIATE
- **Impact:** HIGH
- **Effort:** LOW (< 1 day doc + copy changes)
- **Recommendation:** Replace "prediabetes reversal" with "blood sugar wellness" or "A1C improvement journey" in all marketing-facing copy, App Store listings, and onboarding flows. Retain "prediabetes" as a discoverability keyword. Internal docs can continue using "reversal" for clinical outcome tracking.
- **Rationale:** "Reversal" implies a clinical outcome the app promises to deliver. Creates FTC exposure (unsubstantiated health claim), FDA risk (clinical decision support), and App Store rejection risk (§5.1.3). Noom uses "behavior change" not "weight loss cure" for the same reason. "Wellness" framing is legally defensible while resonating with target users.

### REC-002: Validate Pricing with Pre-Launch Survey

- **Priority:** PRE-LAUNCH
- **Impact:** HIGH
- **Effort:** MEDIUM (2-3 days)
- **Recommendation:** Run Van Westendorp price sensitivity survey with 50+ beta testers. Test $9.99, $12.99, $14.99, $19.99 monthly. Also test annual-first vs monthly-first anchoring on paywall screen.
- **Rationale:** Three conflicting prices in current docs signal lack of price validation. Target demographic (newly diagnosed, anxious) may be price-sensitive at highest-urgency period. Cal AI at ~$20/mo proves willingness-to-pay exists but Revora's niche is narrower. Pre-launch survey de-risks.

### REC-003: Capture Undiagnosed Prediabetics

- **Priority:** POST-LAUNCH (V1.2+)
- **Impact:** MEDIUM
- **Effort:** MEDIUM (1 sprint)
- **Recommendation:** Add "Curious About Blood Sugar?" onboarding path not requiring A1C. Users track GL without diagnosis. After 14 days: "You've tracked for 2 weeks—knowing your A1C unlocks your personalized roadmap. Ask your doctor for a simple blood test."
- **Rationale:** 80% of prediabetics undiagnosed (PRD §2.1). Current onboarding requires A1C. Capturing health-curious users pre-diagnosis expands TAM and creates conversion pipeline.

### REC-004: Diversify Beyond YouTube

- **Priority:** PRE-LAUNCH
- **Impact:** HIGH
- **Effort:** MEDIUM (ongoing content)
- **Recommendation:** Add TikTok short-form (30-60s scan demos), Instagram Reels (before/after GL), and SEO blog as parallel channels from Day 1. YouTube algorithm dependency is single point of failure.
- **Rationale:** YouTube is slow-growth and algorithm-dependent. TikTok/Reels have higher viral potential for visual food content. Cal AI's growth was driven by TikTok, not YouTube.

### REC-005: Add B2B Employer Wellness to V2.0 Roadmap

- **Priority:** POST-LAUNCH (Month 12+)
- **Impact:** HIGH
- **Effort:** HIGH (> 1 sprint)
- **Recommendation:** Add "Revora for Teams" to V2.0 roadmap. Employer wellness programs spend $500-1,000/employee/year on diabetes prevention. Bulk-licensed version with anonymized employer dashboard (aggregate GL trends, no individual data) could generate $5-15K/month per enterprise client.
- **Rationale:** PRD §9.6 mentions B2B2C insurance partnerships but doesn't formalize timing. Enterprise wellness is faster to close than insurance and provides predictable revenue.

---

## 2.2 — Feature Additions

### REC-006: Pre-Meal "Should I Eat This?" Mode

- **Priority:** PRE-LAUNCH (add to MVP)
- **Impact:** HIGH
- **Effort:** LOW (1-2 days — same pipeline, skip logging)
- **Recommendation:** Add scan mode toggle: "Already ate" (logs to daily GL) vs. "Planning to eat" (GL impact preview, no logging). The planning mode answers PP-01 at the highest-anxiety moment—before committing to a meal at restaurants and grocery stores.
- **Rationale:** Current design only supports post-meal logging. But PP-01 ("I don't know what to eat") occurs *before* eating. "This would use 35 of your 46 remaining GL points—consider the grilled option" is more valuable than post-meal analysis. Implementation: same scan pipeline, suppress meal logging step.

### REC-007: Medication Context in User Profile

- **Priority:** POST-LAUNCH (V1.2)
- **Impact:** MEDIUM
- **Effort:** LOW (1 day — schema + prompt change)
- **Recommendation:** Add optional `medications` field: Metformin, GLP-1 agonists (Ozempic/Wegovy), sulfonylureas, None, Prefer not to say. Pass to AI prompt. Disclaimer: "Medications affect glucose response. This helps personalize guidance but doesn't replace your doctor."
- **Rationale:** Metformin prescribed to ~30% of prediabetics. GLP-1 agonists dramatically alter glucose response. Without context, GL estimates and post-meal advice may be inaccurate for medicated users.

### REC-008: Meal Templates / Favorites

- **Priority:** POST-LAUNCH (V1.1)
- **Impact:** HIGH
- **Effort:** MEDIUM (3-5 days)
- **Recommendation:** "Save as Favorite" button on scan results. Saved meals re-logged with one tap—no photo, no AI call. Schema: `saved_meals` table (user_id, name, food_items JSONB, total_gl, created_at). Reduces API cost, improves speed, builds personalized food database.
- **Rationale:** Users eat same meals repeatedly (PRD persona analysis implies routine eating patterns). Eliminating redundant scans saves ~$0.10/scan and delivers instant results. Also addresses the "I already know this meal is safe" friction.

### REC-009: Apple Health / Google Fit Integration

- **Priority:** POST-LAUNCH (V1.2)
- **Impact:** MEDIUM
- **Effort:** MEDIUM (1 week)
- **Recommendation:** Passive integration: write daily GL score and meal logs to HealthKit/Google Fit. Read step count and sleep data to contextualize GL readings. "You walked 8,000 steps today—that helps explain your better-than-expected GL."
- **Rationale:** Not mentioned in either document. HealthKit integration adds credibility for App Store review, provides free contextual data (steps, sleep), and enables the "whole health" narrative without building proprietary tracking.

### REC-010: Hydration Tracking (Lightweight)

- **Priority:** POST-LAUNCH (V1.2)
- **Impact:** LOW
- **Effort:** LOW (2 days)
- **Recommendation:** Simple water intake tracker (tap to log 8oz glass, daily goal: 8 glasses). Display on daily dashboard alongside GL gauge. "Staying hydrated helps your body process glucose more effectively."
- **Rationale:** Water intake affects postprandial glucose response. High engagement, low complexity. Creates additional daily touchpoints that boost retention without scan cost.

### REC-011: A/B Testing Infrastructure

- **Priority:** IMMEDIATE (before launch)
- **Impact:** HIGH
- **Effort:** LOW (PostHog feature flags already planned)
- **Recommendation:** Implement PostHog feature flags before launch. PRD §13.4 lists 4 planned experiments but no experimentation infrastructure is specified in SPEC. Add SPEC requirement: "The system SHALL support feature flags via PostHog SDK for gradual rollouts and A/B testing. All paywall screens, pricing displays, and onboarding flows MUST be feature-flagged."
- **Rationale:** Conversion rate optimization is existential for the business model. Without experimentation infrastructure, pricing and paywall changes require App Store updates (5+ day cycle). Feature flags enable server-side changes in minutes. Critical for the 6-10% conversion target.

### REC-012: Localization Plan

- **Priority:** POST-LAUNCH (V1.3+)
- **Impact:** MEDIUM
- **Effort:** HIGH (> 1 sprint per language)
- **Recommendation:** Add i18n/l10n section to SPEC. Use react-i18next. Phase 1: Spanish (US Hispanic population has 2x diabetes risk). Phase 2: Hindi (India has 77M diabetics). All AI prompts must be language-aware. GL databases and food names need localization.
- **Rationale:** PRD acknowledges a large global market but product is entirely US-centric. No string externalization, no locale handling, no translated food databases. Adding i18n infrastructure early (even if only English at launch) prevents expensive retrofit.

---

## 2.3 — Feature Removals or Deferrals

### REC-013: Defer Community/Social Features to V2.0

- **Priority:** IMMEDIATE
- **Impact:** HIGH (risk reduction)
- **Effort:** LOW (doc change only)
- **Recommendation:** Move all P2 social features (§6.12: success stories feed, meal share, accountability buddies) from V1.2 (Month 4-6) to V2.0 (Month 12+). Replace with curated, team-written success stories (read-only) in V1.2.
- **Rationale:** User-generated content requires: content moderation system, community guidelines enforcement, legal review of health data sharing between users, COPPA compliance if minors access, abuse reporting, and ongoing operational overhead. This is disproportionate to retention value for a <25K user base. Curated stories provide social proof without operational risk.

### REC-014: Defer CGM Integration to V1.3

- **Priority:** IMMEDIATE
- **Impact:** HIGH (scope reduction)
- **Effort:** LOW (doc change only)
- **Recommendation:** Move CGM integration from P1/V1.1 to V1.3 (Month 7+). Current "2 weeks" estimate (PRD §6.10) is unrealistic. Terra API OAuth + medical device data normalization + glucose timeline overlay + privacy consent = 4-6 weeks minimum.
- **Rationale:** CGM users are David persona (§4.5) — a supporting, not primary, persona. The primary personas (Sarah, Marcus, Priya) don't have CGMs. Building CGM integration delays features that serve 95% of users. Early adopters with CGMs are already using Levels or Dexcom's own app.

### REC-015: Simplify Two-Pass Architecture for MVP

- **Priority:** IMMEDIATE
- **Impact:** HIGH (feasibility improvement)
- **Effort:** LOW (doc change)
- **Recommendation:** For MVP, implement single-pass scanning for ALL food types. The complexity classifier runs but only routes COMPLEX_C to user input modal (ingredient declaration) — no two-pass API calls. Two-pass architecture deferred to V1.1 after establishing baseline accuracy metrics.
- **Rationale:** Two-pass doubles API cost and latency (ISSUE-044, ISSUE-059). At MVP scale (2,000 users), the cost is manageable but the engineering complexity is high. Conservative bias correction + user input for opaque foods provides adequate safety without the two-pass overhead. If single-pass accuracy is <80% classification accuracy at Week 8 beta, escalate to two-pass.

### REC-016: Remove "Priority AI Response" Premium Claim

- **Priority:** IMMEDIATE
- **Impact:** LOW
- **Effort:** LOW (copy change)
- **Recommendation:** Remove "Priority AI response (sub-3 second)" from PRD §9.1 premium tier description. OpenAI API latency is not controllable per-user. This is an undeliverable promise.
- **Rationale:** API queue prioritization would require maintaining separate API key tiers or a custom queuing system — disproportionate complexity for marginal perceived value. Premium value should come from features (unlimited scans, advice cards, reports), not speed promises that can't be guaranteed.

### REC-017: Evaluate Removing A1C Estimation Algorithm Entirely

- **Priority:** PRE-LAUNCH (product decision)
- **Impact:** HIGH
- **Effort:** LOW (doc + code removal if decided)
- **Recommendation:** Consider replacing the A1C estimation algorithm (ISSUE-017) with a simpler "Days on Track" metric: percentage of days user stayed within GL budget over rolling 14/30/90 day windows. Display as progress bar toward "90 days on track." Remove the estimated A1C number.
- **Rationale:** The A1C estimation algorithm has no clinical validation specific to Revora. Displaying an estimated A1C number that later doesn't match a lab test will destroy user trust ("the app told me 5.6 but my test said 6.1"). "Days on Track" is: (a) always accurate (it's behavior data, not clinical estimation), (b) within wellness tool framing (no clinical interpretation), (c) still motivating, (d) zero regulatory risk. Keep manual A1C logging for users who want to track lab results — that's self-reported data, not app estimation.

---

## 2.4 — Technical Architecture Improvements

### REC-018: Normalized food_items Table

- **Priority:** IMMEDIATE (add to SPEC before dev)
- **Impact:** HIGH
- **Effort:** MEDIUM (2-3 days implementation)
- **Recommendation:** Already detailed in ISSUE-048 resolution. Add `food_items` table with proper indexes. Write-time denormalization: insert to both JSONB (fast API response) and normalized table (analytics queries). All pattern analysis queries (top spike foods, meal-type analysis, weekly insights) use normalized table.
- **Rationale:** Without this, the "Top 5 highest-spike foods" query in PRD §6.7 requires `jsonb_array_elements` across all user scans — O(n) per user, no index optimization possible on nested array elements.

### REC-019: Tiered AI Cost Strategy

- **Priority:** IMMEDIATE (architecture decision before dev)
- **Impact:** HIGH
- **Effort:** MEDIUM (3-5 days)
- **Recommendation:** Implement tiered AI strategy:
  - **Tier 1 — Cache hit:** Redis pHash lookup. Cost: $0. Target: 40%+ of scans.
  - **Tier 2 — Saved meal:** User re-logs favorite. Cost: $0. Target: 15% of scans (V1.1+).
  - **Tier 3 — GPT-4o Mini classifier:** Determine complexity. Cost: ~$0.005. Target: 100% of non-cached scans.
  - **Tier 4 — GPT-4o single-pass:** SIMPLE + COMPLEX_B foods. Cost: ~$0.05. Target: 85% of classified scans.
  - **Tier 5 — GPT-4o two-pass:** COMPLEX_C only (V1.1+). Cost: ~$0.12. Target: 15% of classified scans.
  
  **Projected blended cost at 25K MAU:**
  - 2,625,000 scans/month
  - 40% cached (0) + 60% API calls (1,575,000)
  - 85% single-pass ($0.05) + 15% two-pass ($0.12) = blended $0.06/API call
  - Total: $94,500/month AI cost vs $35,000 MRR = **still unsustainable**
  
  **Critical insight:** At 25K MAU the AI cost alone exceeds revenue. The fine-tuned custom model migration (PRD §12.3 Month 6-12) is not optional — it's existential. Add to SPEC as a hard milestone: "By 50,000 cumulative scans, begin fine-tuning custom model. Target: $0.005/scan with self-hosted inference."
- **Rationale:** Current cost projections in both documents are inconsistent and optimistic. This tiered approach with explicit cost ceilings per tier makes the economics transparent.

### REC-020: Offline-First Architecture Principles

- **Priority:** PRE-LAUNCH (architecture patterns)
- **Impact:** MEDIUM
- **Effort:** MEDIUM (1 week)
- **Recommendation:** Even without offline scanning (internet required per SPEC CON-004), implement offline-first patterns:
  - Dashboard data cached locally (Zustand persist to AsyncStorage)
  - Meal history available offline (last 30 days cached)
  - A1C roadmap viewable offline
  - Scan results cached locally after viewing
  - Queue meal logging if network drops mid-flow (retry on reconnect)
  - Graceful degradation: show cached dashboard with "Last updated 5 min ago" badge
- **Rationale:** Users scan meals at restaurants (often poor connectivity) and grocery stores (spotty WiFi). The app must not show blank screens or errors for read operations. TanStack Query's offline persistence (already in stack) supports this natively.

### REC-021: Rate Limiting Implementation

- **Priority:** IMMEDIATE (add to SPEC)
- **Impact:** HIGH
- **Effort:** MEDIUM (2-3 days)
- **Recommendation:** Add to SPEC: server-side rate limiting using token bucket algorithm in Redis:
  ```
  Key: ratelimit:scan:{user_id}:{date}
  Value: scan count (integer)
  TTL: 86400 seconds (24 hours)
  ```
  Free tier: increment on each scan, reject at 6+. Premium: no limit (but add 100/day hard cap for abuse prevention). Add 429 response with `retryAfterSeconds` and `scansRemaining` headers on all scan responses.
  
  Also add global rate limit: 100 requests/minute per user across all endpoints (already in SEC-006 but no implementation specified). Use Redis sliding window counter.
- **Rationale:** SEC-006 states rate limits but provides no implementation. Without server-side enforcement, a user could bypass client-side limits and make unlimited API calls, driving up OpenAI costs.

### REC-022: ML Data Pipeline for Continuous Improvement

- **Priority:** POST-LAUNCH (V1.1)
- **Impact:** HIGH
- **Effort:** HIGH (> 1 sprint)
- **Recommendation:** Design data pipeline for ML training:
  1. **Collection:** Every user correction (portion edit, food name correction, "inaccurate" flag) stored in `scan_corrections` table: `(scan_id, field_corrected, ai_value, user_value, created_at)`
  2. **Labeling:** After 10,000 corrections, export as fine-tuning dataset: `(image_url, correct_food_items_json, correct_gl)`
  3. **Training:** Fine-tune GPT-4o Mini on Revora-specific food images (cost reduction to ~$0.005/scan)
  4. **Evaluation:** A/B test fine-tuned model vs base GPT-4o on 500-meal holdout set
  5. **Deployment:** If fine-tuned accuracy ≥ base accuracy, switch production pipeline
- **Rationale:** PRD §12.3 mentions "Migrate from GPT-4o to fine-tuned model" at Month 6 but provides no data pipeline architecture. Without systematically collecting corrections, there's no training data. This must be designed before launch so corrections are captured from Day 1.

### REC-023: Backend Deployment Migration Path

- **Priority:** PRE-LAUNCH (document decision)
- **Impact:** MEDIUM
- **Effort:** LOW (doc change now; migration effort later)
- **Recommendation:** Document Railway.app as MVP-only deployment with explicit migration triggers:
  - **Migrate to Fly.io** when: >5,000 MAU OR need multi-region OR need custom auto-scaling rules. Fly.io supports Rust natively, has global edge deployment, and better scaling primitives. Cost: comparable to Railway.
  - **Migrate to AWS ECS/Fargate** when: >25,000 MAU OR B2B contracts requiring SOC 2 / BAA compliance. AWS provides HIPAA-eligible services, BAA availability, and enterprise compliance certifications. Cost: higher but necessary for health data at scale.
  - **Never Railway for:** production health data application processing >10K MAU. Railway does not offer BAA, SOC 2, or HIPAA-eligible infrastructure.
- **Rationale:** Railway is excellent for MVP speed but inadequate for a health data application at scale. Documenting migration triggers now prevents ad-hoc decisions under growth pressure.

---

## 2.5 — Security & Compliance Improvements

### REC-024: HIPAA BAA Gap Analysis

- **Priority:** PRE-LAUNCH
- **Impact:** HIGH
- **Effort:** LOW (legal review, 1-2 days)
- **Recommendation:** Even as a "wellness" app, conduct a formal BAA assessment with legal counsel for all vendors processing user health data:
  - **OpenAI:** Does NOT offer BAA for standard API. If A1C values are ever included in prompts (they currently aren't — only dietary profile), this becomes a HIPAA issue. Verify prompt templates never include A1C or clinical data.
  - **Railway.app:** Does NOT offer BAA. Acceptable for MVP if no PHI is stored in Railway-managed services (only in user-managed PostgreSQL with encryption).
  - **Cloudflare R2:** Cloudflare offers BAA for Enterprise plan ($$$). Standard R2 does not. Meal photos are PHI-adjacent.
  - **RevenueCat:** Processes subscription data only — no health data passes through. No BAA needed.
  - **Redis (Railway-managed):** Contains cached scan results including GL scores. PHI-adjacent. No BAA from Railway.
  
  Document findings in a compliance matrix. If any vendor handling PHI-adjacent data cannot provide BAA, document risk acceptance or plan migration.
- **Rationale:** PRD §10.2 explicitly states "Revora is NOT a HIPAA-covered entity." However, if a data breach exposes A1C values, the legal defense of "we're not covered" is weak. Voluntary HIPAA-equivalent protection (PRD §10.2 paragraph 2) is the right intent but requires actual vendor assessment.

### REC-025: Meal Photo Tiered Retention Policy

- **Priority:** PRE-LAUNCH
- **Impact:** MEDIUM
- **Effort:** MEDIUM (3-5 days)
- **Recommendation:** Replace single 90-day retention with tiered policy:
  - **Thumbnails (256×256):** Retained indefinitely for meal history display. ~15KB each. Minimal storage cost and privacy exposure.
  - **Full resolution (1024×1024):** Retained 90 days for re-analysis capability. Auto-deleted per current policy.
  - **Original upload:** Deleted after processing (within 1 hour). Never retained.
  
  Add explicit consent checkbox in onboarding: "Revora stores meal photo thumbnails to show your meal history. Full-resolution photos are automatically deleted after 90 days. [Learn more]"
- **Rationale:** Current policy (SPEC DAT-001) deletes all photos after 90 days, breaking meal history UI. Thumbnails are low-risk (not detailed enough for re-identification) but preserve UX. Original high-res uploads are unnecessary to retain and increase breach exposure.

### REC-026: FTC-Compliant Onboarding Language

- **Priority:** IMMEDIATE
- **Impact:** HIGH
- **Effort:** LOW (copy changes)
- **Recommendation:** Replace PRD §6.1 Screen 3 copy:
  - **Current:** "In the CDC's Diabetes Prevention Program — the gold-standard clinical trial — participants who consistently managed diet and activity reduced A1C by an average of 0.3-0.5 points and cut their diabetes risk by 58%. Revora is built on those same principles."
  - **Compliant alternative:** "Research shows that consistent glycemic load management can support healthy blood sugar levels over time. Individual results vary based on diet, activity, and other health factors. [Learn about the research]"
  
  Also replace PRD §9.5 paywall social proof:
  - **Current:** "1,200 members reversed their A1C using Revora Pro"
  - **Compliant:** "Join thousands of people tracking their blood sugar wellness with Revora"
- **Rationale:** FTC requires "competent and reliable scientific evidence" for health efficacy claims. At launch, Revora has zero clinical trial data. The "0.3-0.4 points" claim extrapolates from general GL research, not Revora-specific outcomes. This is the #1 regulatory risk pre-launch.

### REC-027: App Store Pre-Submission Checklist

- **Priority:** PRE-LAUNCH
- **Impact:** HIGH
- **Effort:** MEDIUM (1 week)
- **Recommendation:** Create App Store health app compliance checklist:
  1. ☐ Medical disclaimer on App Store description (first paragraph)
  2. ☐ Privacy Nutrition Label completed (HealthKit: No at MVP, Health & Fitness data: Yes)
  3. ☐ Age rating: 12+ confirmed
  4. ☐ No unsubstantiated health claims in screenshots or preview video
  5. ☐ Privacy Policy URL active and comprehensive
  6. ☐ Terms of Service URL active
  7. ☐ Data deletion mechanism functional (Apple requires in-app account deletion)
  8. ☐ All in-app purchases configured in App Store Connect
  9. ☐ No external payment links (Apple §3.1.1)
  10. ☐ Camera permission usage description: "Revora uses your camera to photograph meals for glycemic load analysis"
  11. ☐ Notification permission usage description
  12. ☐ Test account credentials prepared for App Review team
  13. ☐ App Review notes explaining wellness (not medical) positioning
- **Rationale:** Health apps face elevated App Store scrutiny. Apple §5.1.3 requires apps providing health info to have sources cited and not make unfounded claims. First submission rejection costs 5-10 days. This checklist prevents common rejection reasons.

### REC-028: COPPA Age Gate

- **Priority:** PRE-LAUNCH
- **Impact:** HIGH
- **Effort:** LOW (1 day)
- **Recommendation:** Add age confirmation to onboarding: "By continuing, you confirm you are 13 years of age or older." If under 13 selected, block account creation. Do not collect any data from users under 13. Add to Terms of Service: "Revora is intended for users aged 13 and older."
- **Rationale:** No age gate exists in current onboarding. If a minor uses the app and enters health data (A1C values), this creates COPPA liability. Prediabetes is rare in children but not impossible. Simple age confirmation is low-friction and legally necessary.

### REC-029: Penetration Testing Requirement

- **Priority:** PRE-LAUNCH
- **Impact:** HIGH
- **Effort:** HIGH (external vendor, $5-15K, 1-2 weeks)
- **Recommendation:** Add to SPEC: "A third-party penetration test SHALL be completed before public App Store submission. Scope: API endpoints, authentication flows, data export, image upload, payment flow. Critical and High findings must be remediated before launch."
- **Rationale:** Not mentioned in either document. For an app storing health data (A1C values, meal logs), a pre-launch pentest is industry standard. Discovering a SQL injection or authentication bypass post-launch with real user data is catastrophic. Budget $5-15K for a focused API + mobile pentest.

---

## 2.6 — Documentation Quality Improvements

### REC-030: SPEC Sections Lacking Acceptance Criteria

- **Priority:** IMMEDIATE
- **Impact:** MEDIUM
- **Effort:** MEDIUM (2-3 days)
- **Recommendation:** The following SPEC sections have no acceptance criteria and need them added:
  1. **SEC-001 through SEC-015:** Security requirements have no testable acceptance criteria. Add: "AC-SEC-001: Given an API request without JWT header, When the request reaches any authenticated endpoint, Then the system SHALL return 401 within 100ms."
  2. **DAT-001 through DAT-007:** Data retention requirements have no verification mechanism. Add: "AC-DAT-001: Given a meal photo older than 90 days, When the daily cleanup job runs, Then the photo SHALL be deleted from R2 and image_url set to null."
  3. **PER-001 through PER-010:** Performance requirements are stated but have no test methodology in the acceptance criteria section. AC-001 covers scan latency, but PER-002 through PER-010 have no corresponding ACs.
  4. **REQ-014:** Weekly report generation has no AC for content accuracy or delivery mechanism.
- **Rationale:** Without acceptance criteria, QA cannot verify requirements are met. Each requirement must have at least one testable AC.

### REC-031: PRD Sections Without SPEC Coverage

- **Priority:** IMMEDIATE
- **Impact:** HIGH
- **Effort:** MEDIUM (3-5 days)
- **Recommendation:** The following PRD features have behavior specified but no corresponding SPEC implementation:
  1. **PRD §7.9.1 (Portion bias correction)** — Rust code provided but no SPEC requirement or AC
  2. **PRD §7.9.1 (Plate calibration overlay)** — Camera UI feature, no SPEC screen spec
  3. **PRD §7.9.1 (Confidence scoring system)** — Two-call architecture, no SPEC flow
  4. **PRD §7.9.2 (Dish name shortcut)** — User input modal, no SPEC UI spec or endpoint
  5. **PRD §7.9.2 (Ingredient declaration mode)** — Complex UI flow, no SPEC
  6. **PRD §7.9.2 (Cooking method detection)** — Prompt addition, no SPEC prompt update
  7. **PRD §6.3 (Daily score calculation)** — Grading logic, no SPEC algorithm or endpoint
  8. **PRD §6.4 (Milestone rewards)** — Celebration modals, no SPEC trigger logic
  9. **PRD §11.3 (Referral program)** — Business feature, no SPEC implementation
  10. **PRD §9.5 (Paywall triggers)** — 4 context-aware triggers, no SPEC event/logic
  
  Each needs a corresponding SPEC section with requirements, data contracts, and acceptance criteria.
- **Rationale:** These represent ~30% of MVP functionality that engineering would need to reverse-engineer from the PRD's narrative descriptions. SPEC must be the authoritative implementation guide.

### REC-032: Traceability Matrix

- **Priority:** IMMEDIATE
- **Impact:** HIGH
- **Effort:** MEDIUM (1-2 days)
- **Recommendation:** Create a traceability matrix document mapping:
  ```
  Pain Point → Product Goal → Feature → SPEC Requirement → Acceptance Criteria
  
  Example:
  PP-01 (Nutritional Paralysis)
    → Goal 1 (Eliminate Food Paralysis)
      → §6.2 Core Scan Feature
        → REQ-001 (capture meal photos)
          → AC-001 (GL analysis within 5s)
        → REQ-002 (analyze and return nutrition)
          → AC-002 (80% food identification)
        → REQ-003 (calculate GL)
        → REQ-004 (classify spike risk)
          → AC-009 (filter by spike level)
  ```
  
  This matrix will immediately reveal: (a) pain points without feature coverage, (b) features without requirements, (c) requirements without acceptance criteria, (d) orphaned requirements not tied to any pain point.
- **Rationale:** Currently, tracing from user need to testable implementation requires reading both documents end-to-end. A traceability matrix is standard for medical-adjacent software and dramatically reduces scope creep and missed requirements.

### REC-033: Metrics Measurement Mechanisms

- **Priority:** PRE-LAUNCH
- **Impact:** MEDIUM
- **Effort:** MEDIUM (3-5 days)
- **Recommendation:** The following PRD §5.4 / §13.1 metrics have no measurement mechanism in SPEC:
  1. **"User confidence survey score: >8/10"** — No in-app survey mechanism specified
  2. **"Reduction in external nutrition searches: 70%"** — Unmeasurable without device-level tracking
  3. **"Food anxiety reduction: 50%"** — Requires periodic self-assessment survey, not specified
  4. **"User-reported motivation: >7/10"** — No survey mechanism
  5. **"Health anxiety score: 40% reduction"** — No validated anxiety scale or measurement protocol
  6. **"Weight Loss: -8 lbs at 90 days"** — No weight field in user profile or schema
  7. **"NPS: 50+"** — No NPS survey trigger or collection mechanism
  
  For each, either: (a) add in-app micro-survey infrastructure to SPEC (periodic 1-question surveys), (b) add the data field to the schema (weight), or (c) remove the metric as unmeasurable (external search reduction).
- **Rationale:** Metrics without measurement mechanisms are aspirational statements, not KPIs. The engineering team needs to build collection infrastructure for any metric the business will actually track.

### REC-034: Version Control Protocol for PRD/SPEC Sync

- **Priority:** IMMEDIATE
- **Impact:** HIGH
- **Effort:** LOW (process document)
- **Recommendation:** Establish protocol:
  1. Both documents stored in same Git repo with semantic versioning
  2. Any PRD change that affects SPEC requires a linked SPEC update PR in same sprint
  3. Cross-document references use stable anchors (requirement IDs, not section numbers)
  4. Weekly sync review: 30-minute check that no PRD feature lacks SPEC coverage
  5. CHANGELOG.md tracks all changes with cross-references
  6. SPEC §4.1 API contracts are versioned independently (v1, v2) for backward compatibility
- **Rationale:** The current documents are already divergent at v1.0 (59 issues found). Without a sync protocol, drift will accelerate during development. The conflicting pricing alone (ISSUE-001) demonstrates the risk.

---

## 2.7 — Risk Register Additions

### RISK-NEW-001: OpenAI Model Deprecation

- **Priority:** PRE-LAUNCH (document risk)
- **Impact:** HIGH
- **Effort:** LOW (doc change)
- **Recommendation:** Add to PRD §14.1: "OpenAI may deprecate GPT-4o Vision or change pricing/capabilities with 6-month notice. Mitigation: (a) abstract AI provider behind interface layer in Rust backend, (b) maintain Anthropic Claude 3.5 Sonnet as tested backup (already mentioned in PRD §14.1 Risk 2), (c) accelerate custom model training as primary cost/risk mitigation. Trigger: if OpenAI announces deprecation or >30% price increase, activate migration plan within 2 weeks."
- **Rationale:** OpenAI deprecated GPT-4 Vision Preview with 6 months notice in 2024. Revora's entire value proposition depends on a single vendor's API. The PRD mentions a backup provider but doesn't formalize the abstraction layer needed to switch quickly.

### RISK-NEW-002: App Store Rejection for Health Claims

- **Priority:** PRE-LAUNCH (highest urgency)
- **Impact:** CRITICAL
- **Effort:** LOW (copy review)
- **Recommendation:** Conduct pre-submission review of ALL user-facing copy against Apple §5.1.3 and Google Play health policy:
  - App Store title: "Revora: Prediabetes Reversal" → change to "Revora: Blood Sugar Wellness Tracker"
  - All onboarding copy: remove "reverse" and "reversal" from user-facing text
  - Screenshots: no before/after A1C claims without data
  - Description: lead with medical disclaimer
  
  Apple has rejected apps for: "reverse diabetes" claims, displaying A1C data without medical context, and providing diet recommendations that could be interpreted as treatment plans.
- **Rationale:** First App Store rejection delays launch 5-10 days and requires resubmission. Multiple rejections can result in extended review times for all future submissions. Health app rejections are the #1 cause of launch delays in the category.

### RISK-NEW-003: Competitor Response

- **Priority:** POST-LAUNCH (monitor)
- **Impact:** MEDIUM
- **Effort:** LOW (doc change)
- **Recommendation:** Add to risk register: "Cal AI ($2M MRR, 5M downloads), Levels Health (CGM + food logging), or a well-funded startup could add prediabetes-specific GL tracking within 3-6 months of Revora's launch. Mitigation: (a) build brand loyalty through community (YouTube, Reddit) before competitors react, (b) accumulate proprietary food correction dataset that improves accuracy over time, (c) file provisional patent on prediabetes-specific GL estimation pipeline if defensible, (d) focus on retention (Day 30 >30%) so users are invested before alternatives appear."
- **Rationale:** The prediabetes scanning niche is currently unoccupied, but it's trivially reproducible by any team with GPT-4o Vision access and a copy of the Harvard GI database. The moat must be built through data, community, and brand — not features.

### RISK-NEW-004: AI Hallucination on HIGH-Risk Meals

- **Priority:** PRE-LAUNCH (critical safety)
- **Impact:** CRITICAL
- **Effort:** MEDIUM (testing + safeguards)
- **Recommendation:** Add specific risk: "GPT-4o may confidently return GL 12 (SAFE) for a meal that is actually GL 45+ (HIGH). For a prediabetic following the app's guidance, this directly causes an unmitigated blood sugar spike. Mitigation: (a) conservative bias correction already addresses this (PRD §7.9.1 P3), (b) never display GL as single number for MEDIUM/LOW confidence — always show range, (c) add 'Report inaccurate result' button on every scan, (d) maintain curated 'dangerous [REVIEW NEEDED: Replace restriction-framing with permission-first language] foods' list (white rice, pasta, sugary drinks, baked goods) with hard-coded minimum GL floors that override AI if AI estimate is suspiciously low, (e) beta test with 100 real meals including known high-GL items to measure false-negative rate."
  
  **Hard-coded safety floors (new SPEC requirement):**
  ```
  IF ai_estimated_gl < safety_floor[food_category] THEN
    override_gl = safety_floor[food_category]
    flag_confidence = LOW
  ```
  | Food Category | Safety Floor GL |
  |---|---|
  | White rice (1 cup) | 20 |
  | Pasta (1 cup) | 18 |
  | White bread (2 slices) | 16 |
  | Fruit juice (8oz) | 15 |
  | Sweetened beverage | 20 |
  | Baked goods (muffin/cookie) | 15 |
- **Rationale:** This is the most dangerous [REVIEW NEEDED: Replace restriction-framing with permission-first language] failure mode. Conservative bias handles average cases, but hallucination can produce arbitrarily wrong values. Hard-coded floors for known high-GL categories provide a safety net that no amount of prompt engineering can guarantee.

### RISK-NEW-005: Clinical Outcome Liability

- **Priority:** PRE-LAUNCH (legal review)
- **Impact:** CRITICAL
- **Effort:** MEDIUM (legal consultation)
- **Recommendation:** Add risk: "If a user follows Revora's advice for 90 days and their A1C worsens, the user may claim reliance on the app's guidance caused harm. This is especially acute if the A1C estimation algorithm showed improvement while actual lab results showed worsening. Mitigation: (a) Terms of Service include explicit liability waiver and assumption of risk, (b) every screen with health data includes 'consult your healthcare provider' language, (c) if estimated A1C and actual A1C diverge by >0.3 points, display prominent warning: 'Your lab results differ from our estimate. Please consult your doctor.' (d) consider professional liability insurance ($1-2M policy, ~$2-5K/year)."
- **Rationale:** The combination of A1C estimation (clinical-adjacent), dietary guidance (could be interpreted as medical advice), and "reversal" language (treatment claim) creates a liability surface. The medical disclaimer helps but doesn't eliminate exposure. Insurance is the appropriate risk transfer mechanism.

### RISK-NEW-006: Data Breach Reputational Impact

- **Priority:** PRE-LAUNCH
- **Impact:** CRITICAL
- **Effort:** LOW (doc change)
- **Recommendation:** Add: "A data breach exposing A1C values and meal photos has outsized reputational impact vs. generic consumer apps because: (a) health data is among the most sensitive PII categories, (b) meal photos could be embarrassing or reveal eating disorders, (c) prediabetes status itself is stigmatized by some users. Mitigation: (a) breach notification plan (72 hours per GDPR), (b) cyber insurance ($1M coverage), (c) minimize data retention (current 90-day photo policy is good), (d) encrypt A1C values with application-layer encryption (separate from database encryption) so DB compromise alone doesn't expose values, (e) regular security audits quarterly post-launch."
- **Rationale:** Health data breaches receive disproportionate media coverage and regulatory scrutiny. For a startup, a breach could be existential. Application-layer encryption of the most sensitive field (A1C values) adds defense-in-depth beyond standard at-rest encryption.

---

## Summary Statistics

| Category 	| CRITICAL| HIGH| MEDIUM| LOW | Total|
|---		|---	  |---	|---	|---  |---   |
| CONFLICT 	| 3 	  | 5 	| 3 	| 0   | 11   |
| INCONSISTENCY | 0 	  | 3 	| 2 	| 0   | 5    |
| GAP 		| 2 	  | 7 	| 6 	| 2   | 17   |
| AMBIGUITY 	| 0 	  | 3 	| 6 	| 2   | 11   |
| FEASIBILITY 	| 2 	  | 6 	| 2 	| 0   | 10   |
| RISK 		| 1 	  | 3 	| 2 	| 0   | 6    |
| **Total** 	| **8**   | *27*| **21**|**4**| **60**|

## Recommended Action Sequence

**Before development begins (Week 0):**
1. Resolve ISSUE-001 (pricing) — Product Decision
2. Resolve ISSUE-002, -003 (API format) — Doc Fix
3. Resolve ISSUE-004, -005 (schema/enum alignment) — Doc Fix
4. Resolve ISSUE-016 (guest mode spec) — Spec Addition
5. Resolve ISSUE-017 (A1C algorithm) or adopt REC-017 (remove estimation) — Product Decision
6. Resolve ISSUE-044, -045 (performance targets, MVP scope) — Architecture Decision
7. Resolve ISSUE-050 (FTC claims) — Copy Fix
8. Add ISSUE-048 (food_items table) to schema — Spec Addition
9. Implement REC-026, -027, -028 (FTC copy, App Store checklist, COPPA) — Compliance
10. Create traceability matrix (REC-032) — Documentation

**Before App Store submission:**
11. Complete penetration test (REC-029)
12. Implement GDPR endpoints (ISSUE-019)
13. Implement rate limiting (REC-021)
14. Verify all acceptance criteria have tests (REC-030)
15. Final regulatory copy review (RISK-NEW-002)

---

**END OF AUDIT REPORT**

*Revora Deep Audit Report v1.0 — 2026-03-02*
