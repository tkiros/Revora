> **Superseded for sequencing/positioning by `docs/implementation-plan-to-play.md` (coach-first, 2026-06-30).** Retained for reference; camera/CGM/BAI work is deferred.

<!-- Updated: Revora Amendment Set 1.2 + Brand Positioning v2.0 — April 2026 -->
# Revora Security & Compliance Implementation Plan v1.1

**Domain:** Security, Legal, Compliance  
**Owner:** Founder (primary), Person A (technical security)  
**Stack:** DPA contracts, FTC attorney, encryption (AES-256-GCM), RLS policies, GDPR tooling, penetration testing  
**Compliance Frameworks:** GDPR (primary), FTC Act §5, CCPA, App Store/Play Store policies  
**Last Updated:** 2026-03-15

### CHANGELOG
**v1.0 → v1.1:** 2026-03-15 (Alignment Audit)
- Fixed: CONFLICT-7 — SC-001 renamed from BAA to DPA; HIPAA language replaced with GDPR
- Fixed: CONFLICT-8 — Removed mandatory HIPAA classification; Revora is NOT HIPAA-covered per PRD §10.3
- Fixed: CONFLICT-11 — DPIA (SC-013) moved from Week 3 to Week 10 per Master Plan BLK-003
- Added: GAP-4 — SC-030: Trademark search for "Revora" (Week 1)
- Added: GAP-5 — SC-032: CCPA compliance (Do Not Sell link) (Week 6)
- Added: GAP-7 — SC-031: SCC verification for cross-border transfers (Week 2)
- Added: TASK2-REC — SC-033: Data breach response plan (Week 10)
- Updated: SC-001 effort from 6 hours to 1 hour (self-service DPA, not Enterprise BAA)

---

## SECURITY & COMPLIANCE MISSION

Own the legal, regulatory, and security foundations that enable Revora to operate lawfully and protect user data. Every third-party integration, every data storage decision, every user-facing claim must pass through compliance gates. This domain is the **trust enabler** — if compliance fails, the company faces regulatory action, app store rejection, or loss of user trust.

**Critical Success Factors:**
1. **Week 1-2: DPAs Executed** — OpenAI, Cloudflare, RevenueCat, PostHog DPAs signed before production data flows
2. **Week 10: DPIA Documented** — GDPR Data Protection Impact Assessment complete before launch (per Master Plan BLK-003)
3. **Week 6: Privacy Policy Live** — FTC attorney-reviewed policy published before first public user
4. **Week 13: Penetration Test Complete** — All Critical/High vulnerabilities resolved before launch
5. **Week 15: App Store Compliance** — All claims validated, no "reversal" language, health disclaimers in place

---

## PHASE 0: FOUNDATION (Weeks 1–3)

### Data Processing Agreements (DPAs)

**SC-001: OpenAI Data Processing Agreement (DPA) Execution**  
**Effort:** [S] 1 hour  
**Week:** 1  
**Depends on:** None (can parallel with DO-001)  
**Blocks:** BLK-002 (OpenAI API key cannot be used until DPA accepted), BE-037 (OpenAI integration), BE-046 (scan API)  
**Owner:** Founder  
**SPEC/PRD Reference:** SPEC §2.2 (SEC-009), §11.1 (BLK-002), PRD §10.3 (GDPR — not HIPAA)

**Acceptance:**
- OpenAI DPA accepted via self-service dashboard (no Enterprise sales required)
- Zero data retention policy enabled (no training on Revora data)
- API key generated and stored in GitHub Secrets (DO-003)
- Signed/accepted DPA confirmation screenshot stored in `docs/contracts/OpenAI-DPA-accepted.pdf` (NOT in git — secure storage)
- OpenAI personal data usage documented in `docs/COMPLIANCE.md`:
  - Data sent to OpenAI: meal photos (JPG), no direct identifiers
  - Data received: JSON structured output (food items, GL estimates)
  - Retention: OpenAI retains for 0 days (zero retention policy enabled)
- BLK-002 status: RESOLVED

**OpenAI DPA Acceptance Process (self-service — ~1 hour):**
1. Log in to OpenAI Platform: https://platform.openai.com
2. Navigate to: Settings → Organization → Privacy
3. Click "Accept Data Processing Addendum" (GDPR Article 28 DPA)
4. Enable zero data retention: Settings → Data Controls → Improve the model for everyone: OFF
5. Screenshot confirmation page, store in `docs/contracts/`
6. Generate API key → copy to GitHub Secrets (DO-003)

**OpenAI API Configuration (after DPA accepted):**
# Via OpenAI dashboard
Organization Settings → Data Controls → Data Retention: 0 days
API Keys → Create new key → Copy to GitHub Secrets

**Personal Data Minimization (SPEC §2.2, GDPR Art. 5(1)(c)):**
- Photos uploaded to OpenAI API contain meals only (no faces, no backgrounds with identifiable info)
- No A1C values sent to OpenAI (client-side calculation only)
- No user names, emails, or identifiers in API requests

**Notes:**
- **Critical blocker**: Cannot send real user data to OpenAI until DPA accepted (BLK-002)
- Week 1 priority: accept DPA immediately — self-service, ~1 hour (no negotiation wait time)
- Test API integration using synthetic data until DPA accepted

**GDPR Compliance Context (PRD §10.3):**
Revora is NOT a HIPAA-covered entity. Revora's primary legal obligation is GDPR (EU users) and CCPA (California users). OpenAI, as a data processor under GDPR Article 28, must have a DPA in place before processing any personal data (meal photos associated with user accounts). OpenAI provides a self-service DPA via the dashboard — no Enterprise contract required.

---

**SC-002: Cloudflare R2 Data Processing Agreement (DPA)**  
**Effort:** [S] 2 hours  
**Week:** 1  
**Depends on:** DO-006 (R2 bucket created)  
**Blocks:** BE-035 (R2 photo upload with real user data)  
**Owner:** Founder  
**SPEC/PRD Reference:** SPEC §2.2 (SEC-009)

**Acceptance:**
- Cloudflare DPA signed (available via Cloudflare dashboard or sales team)
- Signed DPA stored in `docs/contracts/Cloudflare-DPA-signed.pdf`
- Cloudflare R2 configured as PHI-compliant storage:
  - Private bucket (no public access — DO-006 validates)
  - Encryption at rest: enabled (AES-256, Cloudflare default)
  - Signed URLs only (1-hour expiry)
- Data flow documented in `docs/COMPLIANCE.md`:
  - Data stored: meal photos (full-res + thumbnails), no A1C data
  - Retention: 90 days full-res (DO-022 lifecycle rule), indefinite thumbnails
  - Deletion: user GDPR delete request → photos purged within 30 days (BE-068)

**Cloudflare DPA Request:**
1. Cloudflare Dashboard → Account Settings → Legal
2. Download standard DPA: https://www.cloudflare.com/cloudflare-customer-dpa/
3. Review terms (GDPR Article 28 compliant)
4. Sign electronically (if required) or accept via dashboard checkbox
5. Store signed copy

**R2 PHI Configuration Validation:**
# Verify encryption at rest
# (Cloudflare R2 encrypts all objects by default with AES-256)

# Verify no public access
aws s3api get-bucket-acl \
  --bucket revora-photos \
  --endpoint-url https://<account-id>.r2.cloudflarestorage.com
# Expected: No public ACLs

**Notes:**
- Cloudflare R2 is GDPR-compliant by default (EU data residency available if needed)
- Photos without faces = lower PHI sensitivity, but still PHI (associated with user health data)

---

**SC-003: RevenueCat Data Processing Agreement (DPA)**  
**Effort:** [S] 2 hours  
**Week:** 1  
**Depends on:** None (can parallel)  
**Blocks:** BE-058 (RevenueCat webhook integration)  
**Owner:** Founder  
**SPEC/PRD Reference:** SPEC §2.2 (SEC-009)

**Acceptance:**
- RevenueCat DPA signed (available in RevenueCat dashboard under Legal)
- Signed DPA stored in `docs/contracts/RevenueCat-DPA-signed.pdf`
- RevenueCat configured:
  - Data sent: user purchase events (app store transaction IDs, no PHI)
  - No A1C or meal data sent to RevenueCat (only subscription status)
- Data minimization validated: RevenueCat receives only:
  - `user_id` (Revora internal UUID, not email)
  - `subscription_tier` (free/premium)
  - App Store/Play Store transaction IDs

**RevenueCat DPA Process:**
1. RevenueCat Dashboard → Settings → Legal & Compliance
2. Download DPA: https://www.revenuecat.com/dpa
3. Review GDPR Article 28 compliance
4. Accept DPA via dashboard (electronic signature)
5. Store confirmation email/PDF

**Data Minimization Implementation (BE-058):**
// backend/src/webhooks/revenuecat.rs
pub struct RevenueCatWebhookPayload {
    pub user_id: Uuid,  // Revora internal ID (not email)
    pub subscription_tier: SubscriptionTier,
    pub transaction_id: String,
    // No PHI fields (no A1C, no meal data)
}

**Notes:**
- RevenueCat handles subscription management only (not health data processor)
- Lower compliance risk than OpenAI/Cloudflare (no PHI), but DPA still required for GDPR

---

**SC-004: PostHog Data Processing Agreement (DPA)**  
**Effort:** [S] 2 hours  
**Week:** 1  
**Depends on:** None  
**Blocks:** BE-004 (PostHog event tracking with real user data)  
**Owner:** Founder  
**SPEC/PRD Reference:** SPEC §2.2 (SEC-009)

**Acceptance:**
- PostHog DPA signed (self-serve via PostHog Cloud or PostHog sales for enterprise)
- Signed DPA stored in `docs/contracts/PostHog-DPA-signed.pdf`
- PostHog configured:
  - **No PHI sent to PostHog** — strict data minimization enforced
  - Events tracked: user actions (scan completed, paywall shown), no A1C values, no meal content
  - User identifier: anonymized user ID (UUID), no emails
- PostHog event schema documented in `docs/COMPLIANCE.md`:
  - Allowed properties: `user_id` (UUID), `subscription_tier`, `scan_count`, `session_duration`
  - Forbidden [REVIEW NEEDED: Replace restriction-framing with permission-first language] properties: `a1c_baseline`, `a1c_goal`, `meal_photo_url`, `food_items`, `email`
- Backend validation: PostHog event payloads inspected in code review (no PHI escapes)

**PostHog DPA Process:**
1. PostHog Cloud dashboard → Organization Settings → Privacy & Security
2. Download DPA: https://posthog.com/dpa
3. Accept DPA electronically
4. Configure data retention: 90 days (default)
5. Enable GDPR features: user deletion API (for BE-069)

**PostHog PHI Exclusion Implementation:**
// backend/src/analytics/mod.rs
pub fn track_event(event_name: &str, properties: serde_json::Value) {
    // Validate no PHI in properties
    let forbidden_keys = ["a1c_baseline", "a1c_goal", "email", "meal_photo_url", "food_items"];
    for key in forbidden_keys {
        if properties.get(key).is_some() {
            tracing::error!("Attempted to send PHI to PostHog: {}", key);
            return;  // Block event
        }
    }
    
    posthog::capture(event_name, properties);
}

**Allowed PostHog Events (examples):**
- `scan_completed` — properties: `{ user_id: "uuid", scan_count: 3, subscription_tier: "free" }`
- `paywall_shown` — properties: `{ user_id: "uuid", trigger: "scan_limit" }`
- `conversion_completed` — properties: `{ user_id: "uuid", plan: "premium_monthly" }`

**Forbidden [REVIEW NEEDED: Replace restriction-framing with permission-first language] Events (would contain PHI):**
- ❌ `scan_result` with `food_items` array
- ❌ `a1c_updated` with `a1c_value`
- ❌ `user_profile` with `email`

**Notes:**
- PostHog is for product analytics only (not health data tracking)
- Code review checklist: every PostHog event must pass PHI exclusion test

---

### Legal Foundations

**SC-005: Company Entity Formation (if not already done)**  
**Effort:** [M] 8 hours  
**Week:** 1  
**Depends on:** None  
**Blocks:** SC-006 (attorney engagement requires legal entity), SC-021 (insurance)  
**Owner:** Founder  
**SPEC/PRD Reference:** PRD §10 (legal foundations)

**Acceptance:**
- Legal entity formed: Delaware C-Corp or LLC (recommended: C-Corp for future fundraising)
- EIN obtained from IRS
- Business bank account opened
- Registered agent service configured (e.g., Stripe Atlas, Clerky, or local attorney)
- Corporate documents stored securely:
  - Certificate of Incorporation
  - Bylaws
  - Stock ledger
  - Board resolutions
- State business licenses obtained (if required by jurisdiction)

**Entity Formation Options:**
1. **DIY via state portal** (Delaware: $90 filing fee, 1-2 weeks)
2. **Stripe Atlas** ($500, includes EIN, bank account, legal templates, 1 week)
3. **Attorney-assisted** ($2,000-$5,000, custom, 2-4 weeks)

**Delaware C-Corp Formation (Stripe Atlas example):**
1. Apply at https://stripe.com/atlas
2. Provide: company name, founder info, initial shares (10M authorized, 8M founder)
3. Stripe files incorporation docs with Delaware
4. Receive: Certificate of Incorporation, EIN, stock ledger
5. Open business bank account (Mercury, Brex, or traditional bank)
6. File 83(b) election within 30 days (if founder equity vests)

**Why Delaware C-Corp:**
- Standard for venture-backed startups
- Favorable corporate law (Court of Chancery)
- Clean cap table for future investors
- Easier to convert stock options to employees

**Notes:**
- If already formed: verify EIN, bank account, good standing
- Week 1 critical: entity must exist to sign DPAs and engage attorney

---

**SC-030: Trademark Search for "Revora"**  
**Effort:** [S] 3 hours  
**Week:** 1 (URGENT — 2-4 week lead time per PRD §10.6)  
**Depends on:** None  
**Blocks:** Marketing materials, App Store listing  
**Owner:** Founder

**Tasks:**
- File USPTO trademark search ($500-$1K per PRD §14)
- Search international databases (WIPO, EU EUIPO)
- If clear: file USPTO application ($250-$350/class)
- If conflict: prepare backup name immediately

**Acceptance:**
- Search results documented. File or escalate by end of Week 2.

---

**SC-006: FTC Attorney Engagement**  
**Effort:** [M] 6 hours  
**Week:** 1  
**Depends on:** SC-005 (legal entity exists)  
**Blocks:** SC-007 (claims validation), SC-009 (Privacy Policy), SC-010 (Terms of Service), SC-022 (final sign-off)  
**Owner:** Founder  
**SPEC/PRD Reference:** SPEC §2.1 (FTC compliance), §11.2 (BLK-006)

**Acceptance:**
- FTC-specialized attorney engaged (healthcare/FTC Act §5 experience required)
- Engagement letter signed, retainer paid
- Attorney scope of work:
  1. Review all user-facing health claims (app copy, marketing, store listings)
  2. Draft Privacy Policy (GDPR + CCPA + FTC compliant)
  3. Draft Terms of Service
  4. Review app screenshots and onboarding flow for FTC compliance
  5. Final sign-off before launch (Week 15)
- Attorney contact info documented in `docs/COMPLIANCE.md`
- Initial consultation completed: attorney briefed on Revora product, prediabetes focus, no "reversal" claims

**Attorney Selection Criteria:**
- **Required experience**: FTC Act §5, health app compliance, GDPR/CCPA
- **Preferred**: App Store/Play Store policy expertise, previous digital health clients
- **Red flag**: General business attorney without health tech experience

**Attorney Sourcing:**
1. **Referrals**: Ask other health tech founders (YC directory, Indie Hackers)
2. **Legal marketplaces**: Priori, Atrium, UpCounsel (filter for FTC + health)
3. **Direct search**: Google "FTC health app attorney" + location

**Cost Estimate:**
- Initial retainer: $5,000-$10,000
- Privacy Policy + ToS: $3,000-$5,000
- Claims review: $2,000-$4,000 (depends on copy volume)
- Final sign-off: $1,000-$2,000
- **Total budget**: $11,000-$21,000

**Initial Consultation Agenda:**
1. **Revora overview**: Prediabetes meal scanning, GL estimation, A1C tracking
2. **FTC compliance concerns**: No "cure/reversal" claims, disclaimer requirements
3. **GDPR requirements**: EU user data, DPIA, right to deletion
4. **Timeline**: Beta launch Week 13, production Week 15
5. **Deliverables**: Privacy Policy (Week 6), ToS (Week 6), claims review (Week 10), final sign-off (Week 15)

**Notes:**
- Week 1 priority: engage attorney immediately (long lead times for legal review)
- BLK-006: attorney must approve all health claims before launch

---

**SC-007: Health Claims Validation Procedure**  
**Effort:** [M] 4 hours  
**Week:** 2  
**Depends on:** SC-006 (attorney engaged)  
**Blocks:** FE-050+ (UI copy finalization), SC-022 (final legal sign-off), BLK-006  
**Owner:** Founder (coordinates), Attorney (reviews)  
**SPEC/PRD Reference:** SPEC §2.1, §11.2 (BLK-006)

**Acceptance:**
- Health claims validation checklist created in `docs/FTC-CLAIMS-CHECKLIST.md`
- All user-facing copy inventoried:
  - App onboarding screens (FE-002)
  - Dashboard advice cards (FE-037, FE-038)
  - Marketing website copy (out of scope for MVP, but note for future)
  - App Store/Play Store listings (FE-081)
- Attorney review process:
  1. Founder compiles all copy in Google Doc
  2. Attorney reviews for FTC compliance (no disease claims, proper disclaimers)
  3. Attorney marks: ✅ Approved, ⚠️ Revise, ❌ Prohibited
  4. Founder revises prohibited/flagged claims
  5. Re-submit for final approval
- Prohibited language grep enforced in CI (DO-007, DO-008 — BLK-014)
- **Zero "reversal/reverse/cure/treat prediabetes" claims** in production

**Health Claims Checklist (docs/FTC-CLAIMS-CHECKLIST.md):**
## Revora FTC Health Claims Checklist

**Review Date:** Week 2  
**Attorney:** [Name]  
**Status:** IN PROGRESS

### Approved Claims (Evidence-Based)
- ✅ "Track your glycemic load to support prediabetes management"
- ✅ "Research suggests lower GL diets may help improve blood sugar control"
- ✅ "This app is a tool to help you make informed meal choices"

### Prohibited Claims (FTC Violation Risk)
- ❌ "Reverse your prediabetes"
- ❌ "Cure prediabetes naturally"
- ❌ "Guaranteed A1C reduction"
- ❌ "Clinically proven to reverse diabetes"
- ❌ "Doctor-recommended treatment"
- ❌ "FDA-approved therapy"

### Required Disclaimers
- ⚠️ **Every advice card must include**: "This is educational information, not medical advice. Consult your doctor before making changes to your diet or treatment plan."
- ⚠️ **Onboarding must include**: "Revora is a wellness tool, not a medical device. It does not diagnose, treat, or cure any disease."

### Copy Review Status
- [ ] Onboarding screens (FE-002) — submitted Week 2
- [ ] Dashboard advice cards (FE-037) — submitted Week 8
- [ ] App Store listing (FE-081) — submitted Week 14
- [ ] Terms of Service disclaimers (SC-010) — submitted Week 6

**Attorney Approval Workflow:**
1. **Founder**: Export all app copy to Google Doc (screenshots + text)
2. **Attorney**: Review within 5 business days, annotate with ✅⚠️❌
3. **Founder**: Revise flagged claims, re-submit
4. **Attorney**: Final approval → Founder updates app code
5. **Code review**: All copy changes require PR review referencing attorney approval

**Example Revision (prohibited → approved):**
- ❌ Original: "Reverse your prediabetes with Revora"
- ✅ Revised: "Revora helps you track glycemic load to support prediabetes management. Not medical advice — consult your doctor."

**CI Enforcement (BLK-014):**
# In DO-007 backend CI and DO-008 frontend CI
grep -rn "reversal\|reverse\|cure\|treat" src/
# Build fails if match found

**Notes:**
- Week 2 initial review: onboarding + core UI copy
- Week 8 review: advice cards (dynamic content, must be pre-approved)
- Week 14 review: App Store copy (final check before submission)
- BLK-006 resolved when attorney signs off on all copy (Week 15)

---

### GDPR Compliance

**SC-008: GDPR Applicability Assessment**  
**Effort:** [S] 2 hours  
**Week:** 2  
**Depends on:** None  
**Blocks:** SC-013 (DPIA only if GDPR applies)  
**Owner:** Founder  
**SPEC/PRD Reference:** SPEC §2.2 (GDPR compliance)

**Acceptance:**
- GDPR applicability documented in `docs/COMPLIANCE.md`
- Decision criteria:
  - **GDPR applies if**: Any users in EU/EEA, OR company targets EU market
  - **GDPR does NOT apply if**: US-only launch, no EU users, no EU marketing
- Revora decision (MVP): **GDPR applies** (App Store/Play Store = worldwide availability, EU users possible)
- GDPR obligations documented:
  1. Privacy Policy with GDPR disclosures (SC-009)
  2. Data Protection Impact Assessment (SC-013)
  3. Right to access (BE-063)
  4. Right to deletion (BE-069)
  5. Right to data portability (BE-063 export)
  6. Consent mechanisms (FE-003 onboarding)
- If future decision: geo-block EU → re-assess GDPR applicability

**GDPR Applicability Decision Tree:**
Does Revora offer services to EU residents?
├─ YES (app available in EU App Store/Play Store) → GDPR applies
└─ NO (geo-blocked or US-only beta) → GDPR may not apply (consult attorney)

Is Revora monitoring behavior of EU residents?
├─ YES (analytics on EU users) → GDPR applies
└─ NO → GDPR may not apply

Decision: MVP = worldwide launch → GDPR applies

**GDPR Compliance Checklist (MVP):**
- [ ] Privacy Policy with GDPR disclosures (SC-009)
- [ ] DPIA documented (SC-013)
- [ ] Lawful basis for processing: user consent (FE-003 checkboxes)
- [ ] Right to access: GDPR export (BE-063)
- [ ] Right to erasure: account deletion (BE-069)
- [ ] Right to data portability: JSON export (BE-063)
- [ ] Data retention: 90 days photos (DO-022), 2 years account data (BE-069)
- [ ] DPAs with processors: OpenAI, Cloudflare, RevenueCat, PostHog (SC-001–004)

**Notes:**
- GDPR fines: up to €20M or 4% of global revenue (whichever higher)
- MVP strategy: build GDPR-compliant from Day 1 (even if US-focused) — easier than retrofitting

---

**SC-031: SCC Verification for Cross-Border Transfers**  
**Effort:** [S] 2 hours  
**Week:** 2  
**Depends on:** SC-001 through SC-004 (DPAs signed)  
**Blocks:** None (verification only)  
**Owner:** Founder

**Tasks:**
- Verify Railway.app DPA includes Standard Contractual Clauses (SCCs) for EU→US transfers
- Verify OpenAI DPA includes SCCs
- Verify Cloudflare DPA includes SCCs
- Document findings in docs/COMPLIANCE.md

**Acceptance:**
- All 3 major processors confirmed to include SCCs or equivalent transfer mechanism

---

**SC-009: Privacy Policy Drafting**  
**Effort:** [L] 12 hours  
**Week:** 6  
**Depends on:** SC-006 (attorney engaged), SC-008 (GDPR applicability)  
**Blocks:** FE-003 (onboarding must link to Privacy Policy), BLK-007 (alpha test gate), Launch (must be live before public users)  
**Owner:** Attorney (drafts), Founder (reviews/approves)  
**SPEC/PRD Reference:** SPEC §2.2, §11.2 (BLK-007)

**Acceptance:**
- Privacy Policy drafted by FTC attorney, covering:
  1. **What data we collect**: A1C values (encrypted), meal photos, scan results, email (hashed), usage analytics
  2. **How we use data**: GL estimation (OpenAI API), dashboard analytics, product improvement
  3. **Data sharing**: Third-party processors (OpenAI, Cloudflare, RevenueCat, PostHog) with DPAs
  4. **Data retention**: 90 days full-res photos, 2 years account data (or until deletion request)
  5. **User rights**: GDPR rights (access, deletion, portability), CCPA rights (if applicable)
  6. **Security measures**: Encryption at rest (AES-256), RLS policies, HTTPS, access controls
  7. **Contact info**: Privacy inquiries email (`privacy@revora.app`)
  8. **Changes to policy**: 30-day notice via email
- Privacy Policy hosted at: `https://revora.app/privacy` (WordPress or static site)
- Privacy Policy linked in:
  - App onboarding (FE-003: checkbox "I agree to Privacy Policy")
  - App settings screen (FE-057: "Privacy Policy" button → WebView)
  - App Store/Play Store listings (FE-081: required field)
- Privacy Policy version tracked: include "Last Updated: YYYY-MM-DD" at top
- BLK-007: Privacy Policy live before alpha test (Week 8)

**Privacy Policy Structure (attorney-drafted, example outline):**
# Revora Privacy Policy

**Last Updated:** 2026-03-15  
**Effective Date:** 2026-03-15

## 1. Introduction
Revora ("we," "us," "our") respects your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use the Revora mobile application (the "App").

## 2. Information We Collect
- **Health Data**: A1C baseline/goal (encrypted), meal photos, scan results (glycemic load estimates)
- **Account Data**: Email address (hashed), name, timezone
- **Usage Data**: App interactions, feature usage (via PostHog, anonymized)
- **Device Data**: Device type, OS version, app version (for debugging)

## 3. How We Use Your Information
- **Primary Purpose**: Provide glycemic load estimates and dietary insights
- **Service Improvement**: Analyze usage patterns to improve app features
- **Communications**: Send app updates, security alerts (opt-out available)
- **Legal Compliance**: Respond to legal requests, prevent fraud

## 4. Data Sharing and Third-Party Services
We share data with trusted service providers under Data Processing Agreements (DPAs):
- **OpenAI**: Meal photo analysis (no A1C data shared, zero retention policy)
- **Cloudflare R2**: Photo storage (encrypted, private bucket)
- **RevenueCat**: Subscription management (no health data shared)
- **PostHog**: Product analytics (anonymized, no PHI)

We do NOT sell your data to third parties.

## 5. Data Retention
- **Meal Photos (full-res)**: 90 days, then deleted
- **Meal Photos (thumbnails)**: Retained indefinitely (for meal history UI)
- **Account Data**: 2 years of inactivity, or until you request deletion
- **A1C Values**: Retained until account deletion

## 6. Your Rights (GDPR/CCPA)
- **Access**: Request a copy of your data (JSON export via app settings)
- **Deletion**: Request account deletion (all data purged within 30 days)
- **Portability**: Export your data in machine-readable format
- **Opt-Out**: Disable analytics tracking (iOS: Settings → Privacy)

To exercise these rights, email: privacy@revora.app

## 7. Security Measures
- **Encryption**: A1C values encrypted at rest (AES-256-GCM)
- **Access Controls**: Row-Level Security (RLS) policies in database
- **HTTPS**: All data in transit encrypted (TLS 1.3)
- **Penetration Testing**: Annual third-party security audits

## 8. Children's Privacy
Revora is not intended for users under 13. We do not knowingly collect data from children.

## 9. Changes to This Policy
We will notify you 30 days before any material changes via email.

## 10. Contact Us
Privacy inquiries: privacy@revora.app  
Mailing address: [Company address]

---

**Privacy Policy Hosting:**
- Option 1: WordPress site at `revora.app/privacy` (recommended for easy updates)
- Option 2: Static HTML hosted on Cloudflare Pages (version-controlled in git)
- Option 3: Notion public page (quick MVP option)

**App Integration (FE-003):**
// mobile/app/onboarding.tsx
<Checkbox
  label="I agree to the Privacy Policy and Terms of Service"
  onPress={() => {
    // Open Privacy Policy in WebView or external browser
    Linking.openURL('https://revora.app/privacy');
  }}
/>

**Notes:**
- Attorney review: 1-2 weeks turnaround
- Week 6 target: allows 2 weeks buffer before alpha test (Week 8)
- Annual review: update Privacy Policy whenever data practices change

---

**SC-010: Terms of Service Drafting**  
**Effort:** [L] 10 hours  
**Week:** 6  
**Depends on:** SC-006 (attorney engaged)  
**Blocks:** FE-003 (onboarding must link to ToS), Launch  
**Owner:** Attorney (drafts), Founder (reviews/approves)  
**SPEC/PRD Reference:** SPEC §2.2

**Acceptance:**
- Terms of Service drafted by attorney, covering:
  1. **Service Description**: Meal scanning, GL estimation, dietary insights (not medical advice)
  2. **User Eligibility**: 13+ years old, prediabetes or wellness use (not diabetes treatment)
  3. **Disclaimers**: Not a medical device, not FDA-approved, consult doctor before diet changes
  4. **User Responsibilities**: Accurate onboarding data, no misuse (e.g., sharing account)
  5. **Subscription Terms**: Free tier (5 scans/day), Premium tier ($12.99/month / $99.99/year / $249.99 lifetime), cancellation policy
  6. **Intellectual Property**: Revora owns app code, user owns their data
  7. **Limitation of Liability**: No liability for health outcomes, medical decisions
  8. **Dispute Resolution**: Arbitration clause (if applicable), governing law (Delaware)
  9. **Termination**: Right to suspend/terminate accounts for ToS violations
  10. **Changes to Terms**: 30-day notice via email
- ToS hosted at: `https://revora.app/terms`
- ToS linked in:
  - App onboarding (FE-003: checkbox "I agree to Terms of Service")
  - App settings (FE-057: "Terms of Service" button)
  - App Store/Play Store listings (FE-081)

**Terms of Service Key Sections (attorney-drafted, example outline):**
# Revora Terms of Service

**Last Updated:** 2026-03-15  
**Effective Date:** 2026-03-15

## 1. Acceptance of Terms
By using Revora, you agree to these Terms of Service ("Terms"). If you do not agree, do not use the App.

## 2. Service Description
Revora is a wellness tool that estimates glycemic load (GL) of meals using AI. **Revora is NOT a medical device, and does NOT diagnose, treat, or cure any disease.** Always consult your doctor before making changes to your diet or treatment plan.

## 3. Eligibility
- **Age**: You must be 13+ years old to use Revora.
- **Health Status**: Revora is intended for prediabetes management or general wellness. If you have diabetes, consult your doctor before relying on Revora for meal planning.

## 4. User Account
- **Registration**: Provide accurate email and onboarding data (A1C values).
- **Security**: Keep your password secure. You are responsible for all activity under your account.
- **Account Sharing**: Do not share your account with others.

## 5. Subscription Terms
- **Free Tier**: 5 scans/day, basic GL estimates
- **Premium Tier**: Unlimited scans, advice cards, progress tracking ($12.99/month or $99.99/year or $249.99 lifetime)
- **Billing**: Subscriptions auto-renew unless canceled 24 hours before renewal.
- **Cancellation**: Cancel anytime via iOS Settings or Google Play subscriptions. No refunds for partial months.
- **Price Changes**: We will notify you 30 days before any price increases.

## 6. Disclaimers and Limitations of Liability
- **Not Medical Advice**: Revora provides educational information only. Consult your doctor for medical advice.
- **Accuracy**: GL estimates are approximations based on AI analysis. Actual glycemic response varies by individual.
- **No Warranty**: Revora is provided "as is" without warranties of any kind.
- **Limitation of Liability**: Revora is not liable for any health outcomes, medical decisions, or damages arising from use of the App. Maximum liability: amount paid for subscription in last 12 months.

## 7. Intellectual Property
- **App Ownership**: Revora owns all rights to the app code, design, and branding.
- **User Data**: You own your health data. We license it only as described in the Privacy Policy.

## 8. Prohibited Uses
You may not:
- Use Revora for illegal purposes
- Reverse-engineer the app
- Scrape or automate access to the API
- Share false health claims about Revora

## 9. Termination
We may suspend or terminate your account if you violate these Terms. You may delete your account anytime via app settings.

## 10. Dispute Resolution
- **Governing Law**: Delaware law
- **Arbitration**: Disputes resolved via binding arbitration (JAMS rules)
- **Class Action Waiver**: You agree to arbitrate disputes individually (no class actions)

## 11. Changes to Terms
We will notify you 30 days before material changes via email.

## 12. Contact Us
Terms inquiries: legal@revora.app

---

**Notes:**
- Arbitration clause: reduces legal risk but may be unenforceable in EU (GDPR overrides)
- Week 6 deadline: same as Privacy Policy (parallel drafting)

---

**SC-032: CCPA Compliance Implementation**  
**Effort:** [M] 4 hours  
**Week:** 6  
**Depends on:** SC-009 (Privacy Policy)  
**Blocks:** None  
**Owner:** Founder + Person B (UI implementation)

**Tasks:**
- Add "Do Not Sell My Personal Information" link in app Settings (per PRD §10.3)
- Add CCPA disclosure in Privacy Policy (SC-009)
- Implement opt-out mechanism (toggle in Settings → blocks data sharing with analytics)
- Document CCPA rights (right to know, delete, opt-out)

**Acceptance:**
- CCPA link visible in Settings, opt-out functional, Privacy Policy updated

---

**SC-011: Cookie Consent Banner (if website launched)**  
**Effort:** [S] 3 hours  
**Week:** 6 (if marketing website launched), otherwise defer  
**Depends on:** SC-009 (Privacy Policy)  
**Blocks:** None (only relevant if website has cookies)  
**Owner:** Founder  
**SPEC/PRD Reference:** SPEC §2.2 (GDPR)

**Acceptance:**
- If Revora marketing website launched (out of scope for MVP app): GDPR cookie consent banner required
- Cookie banner tool: OneTrust, Cookiebot, or custom implementation
- Consent options:
  - **Essential cookies**: Always on (required for site functionality)
  - **Analytics cookies**: Opt-in (Google Analytics, PostHog)
  - **Marketing cookies**: Opt-in (if using Facebook Pixel, etc.)
- Banner shown on first visit, choice stored in localStorage
- Privacy Policy updated with cookie disclosure

**Cookie Banner Implementation (if applicable):**
<!-- Using Cookiebot (GDPR-compliant, free tier) -->
<script id="Cookiebot" src="https://consent.cookiebot.com/uc.js" data-cbid="YOUR-CBID" type="text/javascript" async></script>

**Notes:**
- MVP app (no website): **defer this task** — mobile apps don't use cookies
- If website launched for marketing: implement by Week 6

---

**SC-012: GDPR Representative Appointment (if EU users)**  
**Effort:** [M] 6 hours  
**Week:** 3  
**Depends on:** SC-008 (GDPR applicability)  
**Blocks:** None (required only if no EU establishment)  
**Owner:** Founder  
**SPEC/PRD Reference:** SPEC §2.2 (GDPR Article 27)

**Acceptance:**
- GDPR Article 27: If Revora has no EU establishment (office, subsidiary) but processes EU data → must appoint EU representative
- Decision:
  - **If US-only company with no EU office**: Appoint EU representative (GDPR Rep service: €1,500-€3,000/year)
  - **If founder is EU-based or has EU office**: No representative needed (company is EU "establishment")
- If representative needed: contract with GDPR Rep service (e.g., GDPR Local, DataRep)
- Representative contact info published in Privacy Policy

**GDPR Representative Services:**
- **GDPR Local**: https://gdprlocal.com (€1,500/year)
- **DataRep**: https://datarep.com (€2,000/year)
- **Services include**: EU contact address, handle GDPR inquiries, forward data subject requests

**When to Appoint:**
- **Trigger**: First EU user signs up (Week 8 alpha likely has EU users)
- **Cost**: Budget €2,000/year for GDPR Rep service

**Notes:**
- MVP decision: **defer until first EU user** (save cost if US-only beta)
- If EU user in alpha: appoint by Week 8

---

**SC-013: Data Protection Impact Assessment (DPIA)**  
**Effort:** [L] 16 hours  
**Week:** 10  
**Depends on:** SC-008 (GDPR applies), SC-001–004 (DPAs signed)  
**Blocks:** BLK-003 (DPIA required before processing EU health data), Launch  
**Owner:** Founder (lead), Person A (technical input), Attorney (review)  
**SPEC/PRD Reference:** SPEC §2.2, §11.1 (BLK-003)

**Acceptance:**
- DPIA document created: `docs/GDPR-DPIA.md` (GDPR Article 35 requirement)
- DPIA covers:
  1. **Description of processing**: Meal photo upload → OpenAI analysis → GL estimate → dashboard display
  2. **Necessity and proportionality**: Why we collect A1C data (personalized advice), why photos (meal analysis)
  3. **Risks to data subjects**: Photo leaks, A1C exposure, AI inaccuracies leading to poor dietary choices
  4. **Mitigation measures**: Encryption (BE-053), RLS (BE-012), signed URLs (DO-006), DPAs (SC-001–004), pen test (SC-024)
  5. **Data minimization**: No face photos, no SSN, no full medical records (only A1C)
  6. **Consultation**: Attorney review, user feedback during alpha
- DPIA reviewed by attorney (confirms adequacy)
- DPIA stored securely (not public, but available to regulators on request)
- BLK-003 status: RESOLVED

**DPIA Template (docs/GDPR-DPIA.md — excerpt):**
# Revora Data Protection Impact Assessment (DPIA)

**Date:** 2026-03-13  
**Prepared by:** Founder, Person A  
**Reviewed by:** [Attorney Name]  
**Version:** 1.0

## 1. Description of Processing Activities

**What data do we process?**
- **Health Data (PHI)**: A1C baseline/goal (encrypted), meal photos (full-res + thumbnails), scan results (food items, GL estimates)
- **Account Data**: Email (hashed), name, timezone
- **Usage Data**: Scan timestamps, dashboard views (anonymized in PostHog)

**Why do we process this data?**
- **A1C values**: Personalize dietary advice (e.g., suggest lower GL meals based on user's goal)
- **Meal photos**: Analyze food content using AI (OpenAI GPT-4 Vision API)
- **Scan results**: Display meal history, track progress over time

**Who has access?**
- **Revora backend**: Full access (encrypted A1C, photos in R2)
- **OpenAI API**: Meal photos only (no A1C data sent)
- **Cloudflare R2**: Encrypted photos (no access to A1C)
- **RevenueCat**: Subscription status only (no health data)
- **PostHog**: Anonymized usage events (no PHI)

## 2. Necessity and Proportionality

**Is the data collection necessary?**
- **A1C**: YES — required for personalized GL targets (without A1C, advice is generic and less useful)
- **Meal photos**: YES — required for AI food recognition (no photo = no GL estimate)
- **Email**: YES — required for account recovery, GDPR export delivery

**Could we collect less data?**
- **Alternative considered**: Use food database instead of photos → rejected (lower accuracy, poor UX)
- **Alternative considered**: No A1C tracking → rejected (app becomes generic calorie counter, loses prediabetes focus)

**Conclusion**: Data collection is proportionate to the service provided.

## 3. Risks to Data Subjects

**Risk 1: Photo Leak**
- **Scenario**: R2 bucket misconfigured → photos publicly accessible
- **Impact**: High (meal photos may reveal sensitive info: location, companions, medical conditions via visible medications)
- **Likelihood**: Low (R2 private, signed URLs, DO-024 CORS policy)
- **Mitigation**: DO-006 (private bucket), DO-023 (signed URL testing), SC-024 (pen test validates no public access)

**Risk 2: A1C Value Exposure**
- **Scenario**: Database breach → attacker steals A1C values
- **Impact**: High (A1C = PHI, could be used for identity theft, insurance discrimination)
- **Likelihood**: Low (encryption at rest BE-053, RLS policies BE-012, pen test SC-024)
- **Mitigation**: AES-256-GCM encryption (BE-053), RLS (BE-012), regular pen tests (annual after launch)

**Risk 3: AI Inaccuracy**
- **Scenario**: OpenAI returns incorrect GL estimate → user makes poor dietary choice → health harm
- **Impact**: Medium (user may consume high-GL meal thinking it's low-GL)
- **Likelihood**: Medium (AI is ~85% accurate per VAL-001, but not perfect)
- **Mitigation**: Disclaimer in app (SC-007), encourage doctor consultation, accuracy gate (VAL-001 ≥80%)

**Risk 4: Account Takeover**
- **Scenario**: Weak password → attacker accesses user's A1C data and meal history
- **Impact**: High (PHI exposure)
- **Likelihood**: Low (JWT expiry 15 min, password strength enforced FE-013)
- **Mitigation**: Short JWT expiry (BE-020), password requirements (8+ chars, uppercase, number), optional 2FA (deferred to V1.1)

## 4. Measures to Address Risks

**Technical Measures:**
- Encryption at rest: A1C values (AES-256-GCM), photos (Cloudflare R2 default encryption)
- Encryption in transit: HTTPS (TLS 1.3)
- Access controls: RLS policies (BE-012), JWT authentication (BE-020)
- Data minimization: No face photos, no SSN, no full medical records
- Signed URLs: 1-hour expiry (DO-006, BE-035)
- Penetration testing: Annual (SC-024)

**Organizational Measures:**
- DPAs with all processors (SC-001–004)
- Privacy Policy (SC-009) and Terms of Service (SC-010)
- User consent: explicit opt-in for health data processing (FE-003)
- GDPR rights: access (BE-063), deletion (BE-069), portability (BE-063)
- Attorney review: FTC claims (SC-007), legal docs (SC-009, SC-010)
- Incident response plan: breach notification within 72 hours (SC-020)

## 5. Data Retention

- **Meal photos (full-res)**: 90 days (DO-022 lifecycle rule)
- **Meal photos (thumbnails)**: Indefinite (for meal history UI)
- **A1C values**: Until account deletion (BE-069)
- **Scan results**: Until account deletion
- **Account data**: 2 years inactivity, or until deletion request

## 6. Consultation

- **Attorney review**: [Attorney Name], [Date] — approved
- **User feedback**: Alpha test (Week 8-12) — users asked about privacy concerns in exit survey

## 7. Conclusion

The processing of health data by Revora involves **high risks** (PHI exposure, AI inaccuracies) but these risks are **adequately mitigated** through encryption, access controls, DPAs, disclaimers, and pen testing. The data collection is **necessary** for the service and **proportionate** to the benefits provided to users.

**DPIA Decision**: Proceed with processing, subject to:
1. Encryption implemented (BE-053)
2. RLS policies active (BE-012)
3. Pen test passed (SC-024)
4. DPAs signed (SC-001–004)

**Sign-off:**
- Founder: ________________ Date: ________
- Attorney: ________________ Date: ________

---

**Notes:**
- Week 10 completion: aligns with Master Plan BLK-003 gate (moved from Week 3 per alignment audit)
- DPIA is living document: update annually or when processing activities change
- BLK-003: DPIA complete = blocker resolved

---

**SC-033: Data Breach Response Plan**  
**Effort:** [M] 4 hours  
**Week:** 10  
**Depends on:** SC-009 (Privacy Policy)  
**Blocks:** None (but required pre-launch per PRD §10.3)  
**Owner:** Founder

**Tasks:**
- Create docs/BREACH-RESPONSE-PLAN.md covering:
  - 72-hour GDPR notification requirement
  - Incident classification (severity levels)
  - Communication templates (users, regulators, press)
  - Technical response steps (isolate, investigate, remediate)
  - Contact list (legal counsel, hosting provider, data protection officer)

**Acceptance:**
- Plan documented, reviewed by attorney, team briefed

---

## PHASE 1: OPERATIONAL SECURITY (Weeks 4–8)

### Access Control & Authentication

**SC-014: Password Policy Enforcement**  
**Effort:** [S] 2 hours  
**Week:** 4  
**Depends on:** BE-019 (auth implementation)  
**Blocks:** None (security hardening)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §2.2 (SEC-003)

**Acceptance:**
- Password requirements enforced in backend (BE-019):
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
  - At least 1 special character (optional but recommended)
- Password strength validation in frontend (FE-013)
- Error message: "Password must be at least 8 characters with 1 uppercase and 1 number"
- Password hashing: bcrypt with cost factor 12 (BE-019)
- Test: weak password ("password123") → registration rejected

**Backend Validation (backend/src/auth/mod.rs):**
use regex::Regex;

pub fn validate_password(password: &str) -> Result<(), String> {
    if password.len() < 8 {
        return Err("Password must be at least 8 characters".to_string());
    }
    
    let has_uppercase = Regex::new(r"[A-Z]").unwrap().is_match(password);
    let has_number = Regex::new(r"\d").unwrap().is_match(password);
    
    if !has_uppercase {
        return Err("Password must contain at least 1 uppercase letter".to_string());
    }
    if !has_number {
        return Err("Password must contain at least 1 number".to_string());
    }
    
    Ok(())
}

**Frontend Validation (mobile/app/auth/register.tsx):**
const validatePassword = (password: string): string | null => {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain 1 uppercase letter";
  if (!/\d/.test(password)) return "Password must contain 1 number";
  return null;
};

**Notes:**
- Bcrypt cost 12: balances security (slow brute force) vs. performance (~200ms hashing time)
- Future enhancement (V1.1): password strength meter (zxcvbn library)

---

**SC-015: JWT Security Hardening**  
**Effort:** [S] 2 hours  
**Week:** 4  
**Depends on:** BE-020 (JWT implementation)  
**Blocks:** None (security hardening)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §2.2 (SEC-003)

**Acceptance:**
- JWT configuration validated:
  - **Short expiry**: Access tokens expire in 15 minutes (configurable via `JWT_EXPIRY_SECONDS` env var)
  - **Refresh tokens**: NOT implemented in MVP (guest mode + low-risk data = acceptable trade-off)
  - **Secret rotation procedure**: documented in DO-021 (connection string rotation)
  - **Algorithm**: HS256 (HMAC-SHA256), not RS256 (asymmetric keys unnecessary for MVP)
- JWT payload minimized: only `user_id`, `iat` (issued at), `exp` (expiry) — no PHI
- Frontend: JWT stored in secure storage (iOS Keychain, Android Keystore — FE-010)
- Test: expired JWT → 401 Unauthorized

**JWT Payload (minimal):**
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "iat": 1678886400,
  "exp": 1678887300  // 15 minutes later
}

**JWT Validation (backend/src/middleware/auth.rs):**
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};

pub async fn validate_jwt(token: &str) -> Result<Uuid, AppError> {
    let secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let validation = Validation::new(Algorithm::HS256);
    
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &validation,
    ).map_err(|_| AppError::Unauthorized)?;
    
    Ok(token_data.claims.user_id)
}

**Notes:**
- 15-minute expiry: reduces risk if JWT stolen (short window of validity)
- No refresh tokens MVP: acceptable for guest mode (users re-auth after 15 min)
- V1.1 enhancement: implement refresh tokens for premium users (longer sessions)

---

**SC-016: Admin Access Audit**  
**Effort:** [S] 2 hours  
**Week:** 4  
**Depends on:** DO-005 (Railway database), BE-012 (RLS policies)  
**Blocks:** None (audit for security verification)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §2.2 (SEC-006)

**Acceptance:**
- Admin access to production database documented in `docs/ACCESS-CONTROL.md`
- Who has access:
  - **Person A**: Railway owner, database superuser (via Railway dashboard)
  - **Founder**: Railway collaborator (read-only, if needed for analytics)
- Access method: Railway CLI (`railway run psql $DATABASE_URL`) or Railway dashboard
- Audit log: Railway tracks database connections (Dashboard → PostgreSQL → Activity)
- RLS policies enforce isolation: even superuser queries must respect RLS (unless `SET ROLE` used explicitly)
- Test: Person A queries `SELECT * FROM users;` → only own user row visible (RLS enforced)

**Access Control Matrix (docs/ACCESS-CONTROL.md):**
## Revora Access Control Matrix

| Person | Railway Role | Database Access | Production Deploy | Secrets Access |
|--------|--------------|-----------------|-------------------|----------------|
| Person A | Owner | Superuser (RLS-enforced) | Yes (via GitHub merge) | Yes (Railway env vars) |
| Founder | Collaborator | Read-only (analytics queries) | No | No |

**Audit Procedure:**
- **Weekly review**: Railway Activity log (check for unexpected connections)
- **Quarterly review**: Re-certify access (remove ex-team members)
- **Incident response**: If breach suspected → rotate DATABASE_URL (DO-021), review audit log

**RLS Bypass (for admin queries):**
-- If Person A needs to query all users (e.g., debugging)
SET ROLE postgres;  -- Bypass RLS
SELECT COUNT(*) FROM users;
RESET ROLE;  -- Re-enable RLS

**Notes:**
- Production database access is privileged — log all queries
- RLS policies (BE-012) prevent accidental data leaks even with superuser access

---

### Encryption & Data Protection

**SC-017: A1C Encryption Key Rotation Procedure**  
**Effort:** [S] 3 hours  
**Week:** 5  
**Depends on:** BE-053 (A1C encryption implemented)  
**Blocks:** None (documented procedure for future use)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §2.2 (SEC-006)

**Acceptance:**
- A1C encryption key rotation procedure documented in `docs/RUNBOOKS.md`
- Rotation triggers:
  1. **Annual rotation**: Every 12 months (recommended best practice)
  2. **Compromise suspected**: Immediate rotation if key leaked
  3. **Personnel change**: Rotate if employee with key access leaves
- Rotation steps:
  1. Generate new 32-byte key: `openssl rand -hex 32`
  2. Update `A1C_ENCRYPTION_KEY` in Railway env vars
  3. Deploy new backend version
  4. **Re-encrypt all A1C values**: Run migration script (background job)
  5. Verify: query decrypted A1C values → match original
- Expected downtime: 0 (background re-encryption)

**Rotation Procedure (docs/RUNBOOKS.md):**
## A1C Encryption Key Rotation

**When:** Annually, or if compromise suspected

**Steps:**

1. **Generate new key**
   NEW_KEY=$(openssl rand -hex 32)
   echo "New A1C encryption key: $NEW_KEY"

2. **Store old key temporarily**
   OLD_KEY=$(railway variables get A1C_ENCRYPTION_KEY)

3. **Update Railway env var**
   railway variables set A1C_ENCRYPTION_KEY="$NEW_KEY"

4. **Deploy backend with dual-key support**
   # Backend reads both OLD_KEY (env: A1C_ENCRYPTION_KEY_OLD) and NEW_KEY
   railway variables set A1C_ENCRYPTION_KEY_OLD="$OLD_KEY"
   git push origin main  # Railway auto-deploys

5. **Re-encrypt all A1C values (background job)**
   # Run migration script (backend/scripts/reencrypt-a1c.rs)
   railway run cargo run --bin reencrypt-a1c

6. **Verify re-encryption**
   # Query sample user, decrypt A1C → should match original
   railway run psql -c "SELECT user_id, a1c_baseline_encrypted FROM users LIMIT 5;"

7. **Remove old key**
   railway variables unset A1C_ENCRYPTION_KEY_OLD

**Expected duration:** 30-60 minutes for 10K users

**Re-encryption Script (backend/scripts/reencrypt-a1c.rs):**
// Pseudocode — decrypt with old key, encrypt with new key
for user in users {
    let old_a1c = decrypt(user.a1c_baseline_encrypted, OLD_KEY);
    let new_encrypted = encrypt(old_a1c, NEW_KEY);
    update_user(user.id, new_encrypted);
}

**Notes:**
- No downtime: users can still use app during re-encryption
- Dual-key period: backend supports both keys during migration (typically 1 hour)

---

**SC-018: Database Backup Encryption Verification**  
**Effort:** [S] 2 hours  
**Week:** 5  
**Depends on:** DO-019 (Railway backups configured)  
**Blocks:** None (validation of existing encryption)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §2.2 (SEC-006)

**Acceptance:**
- Railway PostgreSQL backups are encrypted at rest (verified)
- Encryption method: AES-256 (Railway default)
- Backup access: only Railway account owner (Person A) can restore backups
- Test restore procedure (Week 5):
  1. Download backup via Railway dashboard
  2. Restore to test database
  3. Verify A1C values are still encrypted (ciphertext in `a1c_baseline_encrypted` column)
- Backup storage location: Railway-managed S3-compatible storage (AWS us-east-1)

**Verification Steps:**
# 1. Download backup
railway backups download --output backup-2026-03-15.sql

# 2. Inspect backup file (should contain encrypted data)
grep "a1c_baseline_encrypted" backup-2026-03-15.sql
# Expected: Ciphertext strings (base64-encoded), not plaintext A1C values

# 3. Restore to test database
railway run psql $TEST_DATABASE_URL < backup-2026-03-15.sql

# 4. Verify encryption intact
railway run psql $TEST_DATABASE_URL -c "SELECT a1c_baseline_encrypted FROM users LIMIT 1;"
# Expected: Encrypted string (not plaintext)

**Notes:**
- Railway encrypts backups by default — no additional config needed
- Test restore annually (Week 5, then annually) to validate procedure

---

### Incident Response

**SC-019: Security Incident Response Plan**  
**Effort:** [M] 6 hours  
**Week:** 6  
**Depends on:** SC-009 (Privacy Policy includes breach notification)  
**Blocks:** None (preparedness plan)  
**Owner:** Founder (lead), Person A (technical response)  
**SPEC/PRD Reference:** SPEC §2.2 (SEC-010), GDPR Article 33 (72-hour breach notification)

**Acceptance:**
- Incident response plan documented in `docs/INCIDENT-RESPONSE-PLAN.md`
- Incident severity levels defined:
  - **P0 (Critical)**: Data breach, service down, security vulnerability actively exploited
  - **P1 (High)**: Suspected breach, high-severity vulnerability (CVSS ≥7.0)
  - **P2 (Medium)**: Medium-severity vulnerability (CVSS 4.0-6.9), isolated incident
  - **P3 (Low)**: Low-severity vulnerability (CVSS <4.0), potential issue
- Response procedures for each severity:
  - P0: Immediate response (within 1 hour), Founder + Person A notified via SMS
  - P1: Response within 4 hours
  - P2: Response within 24 hours
  - P3: Response within 1 week
- GDPR breach notification: if PHI exposed → notify users + regulators within 72 hours
- Post-mortem template: root cause analysis after every P0/P1 incident

**Incident Response Plan (docs/INCIDENT-RESPONSE-PLAN.md — excerpt):**
# Revora Security Incident Response Plan

**Owner:** Founder (incident commander), Person A (technical lead)  
**Last Updated:** 2026-03-15

## Incident Severity Levels

| Severity | Definition | Response Time | Notification |
|----------|------------|---------------|--------------|
| **P0** | Data breach, service down, active exploit | 1 hour | SMS to Founder + Person A |
| **P1** | Suspected breach, high-severity vuln | 4 hours | Email to Founder + Person A |
| **P2** | Medium-severity vuln, isolated incident | 24 hours | Email to Person A |
| **P3** | Low-severity vuln, potential issue | 1 week | Slack notification |

## P0 Response Procedure (Data Breach)

**Phase 1: Containment (0-1 hour)**
1. **Person A**: Identify breach vector (SQL injection, leaked credentials, etc.)
2. **Person A**: Stop the breach:
   - If credential leak → rotate all secrets (DO-003, DO-021, SC-017)
   - If SQL injection → patch vulnerability, deploy hotfix (DO-036)
   - If R2 bucket public → revert to private (DO-006)
3. **Founder**: Notify attorney (for GDPR breach notification decision)

**Phase 2: Assessment (1-4 hours)**
1. **Person A**: Determine scope:
   - How many users affected?
   - What data exposed? (A1C values, photos, emails?)
   - When did breach occur? (check logs)
2. **Founder**: Document timeline in `docs/INCIDENTS.md`

**Phase 3: Notification (4-72 hours)**
1. **GDPR requirement**: If PHI exposed → notify within 72 hours
   - **Regulator**: Email to relevant Data Protection Authority (DPA)
   - **Users**: Email to affected users (template below)
2. **Attorney**: Draft breach notification (legal review required)
3. **Founder**: Send notifications

**Phase 4: Remediation (Week 1-2)**
1. **Person A**: Fix root cause (patch vulnerability, improve access controls)
2. **Person A**: Deploy fix to production
3. **Person A**: Run pen test to verify fix (SC-024)

**Phase 5: Post-Mortem (Week 2)**
1. **Founder + Person A**: Write post-mortem (`docs/POST-MORTEM-YYYY-MM-DD.md`)
2. **Review**: What went wrong? How to prevent future incidents?
3. **Action items**: Update security policies, improve monitoring

## Breach Notification Template (for users)

Subject: Important Security Notice — Revora Data Breach

Dear [User],

We are writing to inform you of a security incident that may have affected your Revora account.

**What Happened:**
On [Date], we discovered that [brief description of breach]. We immediately took steps to secure our systems and stop the breach.

**What Data Was Affected:**
[List of data exposed: e.g., "Your A1C baseline value and meal photos from the past 30 days may have been accessed by an unauthorized party."]

**What We Are Doing:**
- Fixed the vulnerability and deployed security patches
- Rotated all encryption keys
- Engaged a third-party security firm to audit our systems

**What You Should Do:**
- Change your Revora password immediately
- Monitor your account for suspicious activity
- Contact us if you have questions: security@revora.app

We deeply apologize for this incident and are committed to protecting your data.

Sincerely,
[Founder Name]
Founder, Revora

## Contact Information

- **Security incidents**: security@revora.app
- **Person A (technical)**: [phone number]
- **Founder**: [phone number]
- **Attorney**: [phone number]

---

**Notes:**
- Test incident response: Week 13 (tabletop exercise with Founder + Person A)
- GDPR 72-hour notification: starts from when breach is discovered (not when it occurred)

---

**SC-020: Data Breach Insurance Evaluation**  
**Effort:** [S] 3 hours  
**Week:** 6  
**Depends on:** SC-005 (legal entity formed)  
**Blocks:** None (optional for MVP, required for V1.1)  
**Owner:** Founder  
**SPEC/PRD Reference:** SPEC §2.2 (risk mitigation)

**Acceptance:**
- Cyber liability insurance quotes obtained from 3 providers
- Coverage evaluated:
  - **Data breach response**: Forensics, legal fees, user notification costs
  - **Regulatory fines**: GDPR fines, FTC penalties (may be excluded — check policy)
  - **Business interruption**: Lost revenue if service down due to breach
  - **Cyber extortion**: Ransomware payments (controversial, may incentivize attacks)
- Cost estimate: $2,000-$5,000/year for $1M coverage (startup-tier policy)
- Decision: **Defer to post-launch** (Week 16+) if budget-constrained
- If purchased: policy stored in `docs/contracts/Cyber-Insurance-Policy.pdf`

**Insurance Providers (startup-friendly):**
- **Embroker**: https://embroker.com/cyber-insurance (online quotes, fast approval)
- **Coalition**: https://www.coalitioninc.com (includes security monitoring tools)
- **Cowbell Cyber**: https://cowbell.insure (AI-driven risk assessment)

**Evaluation Criteria:**
- **Coverage limits**: $1M minimum (GDPR fines can be €20M, but $1M is typical for startups)
- **Deductible**: $10,000-$25,000 (higher deductible = lower premium)
- **Exclusions**: Check if GDPR fines covered (some policies exclude regulatory fines)
- **Response services**: 24/7 breach hotline, legal counsel included?

**Notes:**
- MVP decision: **optional** (focus budget on pen test SC-024 instead)
- Post-launch: revisit when revenue >$100K/year or if VC-backed (investors may require)

---

## PHASE 2: PRE-LAUNCH SECURITY (Weeks 10–13)

### Penetration Testing

**SC-021: Penetration Test Vendor Selection**  
**Effort:** [M] 4 hours  
**Week:** 10  
**Depends on:** SC-005 (legal entity for vendor contract)  
**Blocks:** SC-024 (pen test execution), BLK-004  
**Owner:** Founder  
**SPEC/PRD Reference:** SPEC §9.2, §11.1 (BLK-004)

**Acceptance:**
- Penetration test vendor selected from 3+ quotes
- Vendor requirements:
  - **Healthcare experience**: Previous clients in health tech (PHI familiarity)
  - **OWASP expertise**: Test against OWASP Top 10 (SQL injection, XSS, auth bypass, etc.)
  - **Mobile app testing**: iOS + Android (not just web API)
  - **Deliverable**: Detailed report with CVSS scores, remediation guidance
- Scope defined:
  - **In scope**: Backend API (all endpoints), mobile app (iOS + Android), R2 bucket access
  - **Out of scope**: Third-party services (OpenAI, RevenueCat — their responsibility)
- Cost: $8,000-$15,000 (3-5 day engagement)
- Contract signed, test scheduled for Week 13

**Vendor Selection Process:**
1. **RFP**: Send scope document to 3+ vendors (see template below)
2. **Evaluate quotes**: Compare cost, timeline, deliverables
3. **Reference checks**: Ask for 2 previous client references (health tech preferred)
4. **Sign contract**: MSA (Master Service Agreement) + SOW (Statement of Work)
5. **Schedule test**: Week 13 (allows 1 week buffer before launch Week 15)

**Penetration Test Vendors (healthcare-focused):**
- **Coalfire**: https://www.coalfire.com (HIPAA/HITRUST specialists, $15K+)
- **Tevora**: https://www.tevora.com (healthcare focus, $10K-$15K)
- **Bishop Fox**: https://www.bishopfox.com (top-tier, $20K+)
- **Bugcrowd** (crowdsourced): https://www.bugcrowd.com ($5K-$10K, faster turnaround)

**RFP Template (excerpt):**
## Revora Penetration Test — Request for Proposal

**Scope:**
- **Backend API**: Rust/Axum REST API, ~30 endpoints (authentication, scans, dashboard, GDPR)
- **Mobile App**: React Native (Expo), iOS + Android
- **Data Storage**: PostgreSQL (Railway), Cloudflare R2 (photos)

**Goals:**
- Identify vulnerabilities (OWASP Top 10)
- Validate encryption (A1C values, JWT security)
- Test access controls (RLS policies, signed URLs)
- Simulate attacker scenarios (account takeover, data exfiltration)

**Timeline:**
- Test window: Week 13 (2026-04-07 to 2026-04-11)
- Report delivery: 5 business days after test completion

**Deliverables:**
- Detailed report (vulnerabilities with CVSS scores, remediation steps)
- Executive summary (for non-technical stakeholders)
- Re-test included (validate fixes, 2 weeks after initial report)

**Budget:** $8,000-$15,000

**Notes:**
- Week 10 selection: allows 3 weeks to schedule and prep for Week 13 test
- BLK-004: pen test contract signed = blocker partially resolved (full resolution when test passed)

---

**SC-022: FTC Attorney Final Sign-Off**  
**Effort:** [M] 4 hours  
**Week:** 14  
**Depends on:** SC-007 (claims validation), SC-009 (Privacy Policy), SC-010 (ToS), FE-081 (App Store copy)  
**Blocks:** Launch gate (BLK-006 final resolution)  
**Owner:** Founder (coordinates), Attorney (reviews)  
**SPEC/PRD Reference:** SPEC §11.2 (BLK-006)

**Acceptance:**
- Attorney reviews final app state (Week 14 staging build):
  - Onboarding flow (FE-002, FE-003)
  - Dashboard advice cards (FE-037, FE-038)
  - Settings screens (FE-057)
  - App Store/Play Store listings (FE-081)
- Attorney confirms:
  - ✅ No "cure/reversal/treat" claims present
  - ✅ All advice cards include disclaimers ("not medical advice")
  - ✅ Privacy Policy and ToS linked in onboarding
  - ✅ App Store copy complies with FTC Act §5
- Attorney provides written sign-off: email or signed letter
- Sign-off stored in `docs/FTC-ATTORNEY-SIGNOFF.pdf`
- BLK-006 status: RESOLVED

**Attorney Review Checklist (Week 14):**
## Revora FTC Compliance Final Review

**Date:** Week 14 (2026-04-10)  
**Attorney:** [Name]  
**Review Method:** Staging app walkthrough + App Store listing review

### Onboarding Flow
- [ ] Health disclaimer visible: "Revora is a wellness tool, not a medical device. Not intended to diagnose, treat, or cure any disease."
- [ ] Privacy Policy linked (checkbox required)
- [ ] Terms of Service linked (checkbox required)
- [ ] No disease claims in onboarding copy

### Dashboard Advice Cards
- [ ] All cards include disclaimer: "This is educational information, not medical advice. Consult your doctor before making changes."
- [ ] No "reversal/cure/treat" language
- [ ] Evidence-based claims only (e.g., "Research suggests..." not "Guaranteed...")

### App Store Listing
- [ ] App description: No prohibited health claims
- [ ] Screenshots: Disclaimers visible in UI
- [ ] Age rating: 12+ (medical/treatment info)
- [ ] App category: Health & Fitness (not Medical)

### Sign-Off
- ✅ All items reviewed and compliant
- Attorney signature: ________________ Date: ________

**Notes:**
- Week 14 timing: allows 1 week to fix any issues before Week 15 launch
- If attorney finds issues: 1-2 day fix cycle → re-review before launch

---

**SC-023: Pen Test Environment Preparation**  
**Effort:** [S] 3 hours  
**Week:** 12  
**Depends on:** DO-005 (staging environment), SC-021 (vendor selected)  
**Blocks:** SC-024 (pen test execution)  
**Owner:** Person A  
**SPEC/PRD Reference:** SPEC §9.2

**Acceptance:**
- Staging environment prepared for pen test (isolated from production):
  - Staging URL: `https://api-staging.revora.app`
  - Test user accounts created: 10 users (5 free tier, 5 premium) with synthetic data
  - Test meal photos uploaded (no real PHI)
  - Database populated: 100 scans, 50 advice cards, realistic data volumes
- Pen test vendor provided:
  - API documentation (Swagger/OpenAPI spec — BE-082)
  - Test user credentials (via secure channel, e.g., 1Password shared vault)
  - Mobile app builds (iOS IPA, Android APK)
- Logging configured: all pen test activity logged (Railway logs, Sentry disabled for staging during test to avoid noise)
- **Production isolated**: No pen test activity on production (staging only)

**Test Data Generation Script (scripts/generate-test-data.sh):**
#!/bin/bash
# Generate 10 test users with synthetic data

API_URL="https://api-staging.revora.app"

for i in {1..10}; do
  EMAIL="pentest-user-$i@example.com"
  PASSWORD="Test123!"
  
  # Register user
  TOKEN=$(curl -s -X POST $API_URL/api/v1/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Test User $i\"}" \
    | jq -r '.accessToken')
  
  # Complete onboarding
  curl -s -X POST $API_URL/api/v1/onboarding \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"a1cBaseline":6.0,"a1cGoal":5.5,"dietaryProfile":[],"ageConfirmed":true,"healthDataConsent":true,"timezone":"America/New_York"}'
  
  # Upload 10 test scans
  for j in {1..10}; do
    curl -s -X POST $API_URL/api/v1/scan \
      -H "Authorization: Bearer $TOKEN" \
      -F "image=@test-meal-$j.jpg"
  done
  
  echo "Created user: $EMAIL (password: $PASSWORD)"
done

**Pen Test Credentials (1Password shared vault):**
| User | Email | Password | Tier |
|------|-------|----------|------|
| User 1 | pentest-user-1@example.com | Test123! | Free |
| User 2 | pentest-user-2@example.com | Test123! | Free |
| ... | ... | ... | ... |
| User 10 | pentest-user-10@example.com | Test123! | Premium |

**Notes:**
- Week 12 prep: 1 week before pen test (allows time to fix any staging issues)
- Synthetic data: no real PHI in staging (use fake A1C values, stock meal photos)

---

**SC-024: Penetration Test Execution**  
**Effort:** [L] 20 hours (vendor executes, Person A responds to findings)  
**Week:** 13  
**Depends on:** SC-023 (pen test env ready), SC-021 (vendor selected), All BE/FE features complete  
**Blocks:** BLK-004 (pen test gate), Launch  
**Owner:** Pen test vendor (executes), Person A (responds), Founder (signs off)  
**SPEC/PRD Reference:** SPEC §9.2, §11.1 (BLK-004), VAL-024, VAL-025

**Acceptance:**
- Penetration test executed (3-5 day engagement, Week 13)
- Test scope:
  - **Backend API**: All endpoints (authentication, scans, dashboard, GDPR, webhooks)
  - **Mobile app**: iOS + Android (authentication, photo upload, offline mode)
  - **Infrastructure**: R2 bucket access, database RLS bypass attempts, JWT validation
- Test methodology: OWASP Top 10, SANS Top 25, manual testing
- Report received: Within 5 business days of test completion
- **VAL-024 gate**: No Critical vulnerabilities (CVSS ≥9.0)
- **VAL-025 gate**: No High vulnerabilities (CVSS 7.0-8.9), OR all High issues have mitigation plan
- If vulnerabilities found: Person A fixes within 1 week → vendor re-tests
- BLK-004 status: RESOLVED (pen test passed)

**Pen Test Report Expected Sections:**
1. **Executive Summary**: High-level findings (for Founder)
2. **Methodology**: Tools used, test duration, scope
3. **Findings**: Vulnerabilities listed by severity (Critical, High, Medium, Low)
   - For each vulnerability:
     - CVSS score (e.g., 8.5 High)
     - Description (e.g., "SQL injection in /api/v1/scans endpoint")
     - Proof of concept (steps to reproduce)
     - Remediation (e.g., "Use parameterized queries")
4. **Conclusion**: Overall security posture assessment

**Common Vulnerabilities to Expect (and fixes):**
| Vulnerability | CVSS | Fix | Task Reference |
|---------------|------|-----|----------------|
| **SQL Injection** | 9.0 (Critical) | Use sqlx parameterized queries (already in BE-006+) | BE-006 |
| **Broken Authentication** | 8.5 (High) | Enforce JWT expiry, password policy (SC-014, SC-015) | BE-020 |
| **Insecure Direct Object Reference (IDOR)** | 7.5 (High) | Enforce RLS policies (BE-012) | BE-012 |
| **Sensitive Data Exposure** | 7.0 (High) | Encrypt A1C values (BE-053), use HTTPS | BE-053 |
| **Missing Rate Limiting** | 6.5 (Medium) | Implement rate limiting (BE-044) | BE-044 |
| **XSS in advice cards** | 6.0 (Medium) | Sanitize HTML in FE (FE-037) | FE-037 |
| **Weak JWT secret** | 5.5 (Medium) | Use 64-char random secret (DO-003) | DO-003 |

**Remediation Workflow:**
1. **Person A**: Receives pen test report → categorizes findings by severity
2. **Critical (CVSS ≥9.0)**: Fix immediately (within 24 hours), hotfix deploy (DO-036)
3. **High (CVSS 7.0-8.9)**: Fix within 1 week, deploy before launch
4. **Medium (CVSS 4.0-6.9)**: Fix before launch or document mitigation plan
5. **Low (CVSS <4.0)**: Defer to post-launch backlog
6. **Vendor re-test**: After fixes deployed, vendor validates (included in contract)

**VAL-024 and VAL-025 Acceptance:**
- [ ] Zero Critical vulnerabilities (CVSS ≥9.0)
- [ ] Zero High vulnerabilities (CVSS 7.0-8.9) OR all High issues fixed/mitigated
- [ ] Pen test report stored in `docs/pen-test-report-2026-04-11.pdf`
- [ ] Founder sign-off: Pen test passed, approved for launch

**Notes:**
- Week 13 timing: Critical for launch gate (Week 15)
- If Critical found: **launch slips** until fixed (non-negotiable)
- Re-test: Vendor validates fixes at no additional cost (negotiate this in contract SC-021)

---

**SC-025: Penetration Test Findings Remediation**  
**Effort:** [Variable] 8-40 hours (depends on findings)  
**Week:** 13-14  
**Depends on:** SC-024 (pen test report received)  
**Blocks:** Launch gate (must resolve Critical/High before Week 15)  
**Owner:** Person A (fixes), Pen test vendor (validates)  
**SPEC/PRD Reference:** SPEC §9.2

**Acceptance:**
- All Critical vulnerabilities fixed (CVSS ≥9.0)
- All High vulnerabilities fixed OR documented mitigation plan
- Fixes deployed to staging → vendor re-tests → confirms resolved
- Medium/Low vulnerabilities: either fixed or deferred to post-launch backlog (`docs/SECURITY-BACKLOG.md`)
- Post-remediation report: vendor provides updated report ("Re-Test Results")

**Remediation Process (per finding):**
1. **Understand vulnerability**: Read pen test report, reproduce issue locally
2. **Develop fix**: Write code, add test case
3. **Code review**: PR review by Founder (if 2-person team) or self-review checklist
4. **Deploy to staging**: Merge to `main` → Railway auto-deploys staging
5. **Notify vendor**: "Vulnerability X fixed, ready for re-test"
6. **Vendor re-tests**: Confirms issue resolved
7. **Document**: Update `docs/SECURITY-BACKLOG.md` (mark as resolved)

**Example Remediation (SQL Injection):**
# Pen test finding: SQL injection in /api/v1/scans endpoint
# Vulnerable code:
let query = format!("SELECT * FROM scans WHERE user_id = '{}'", user_id);

# Fix: Use sqlx parameterized query
let scans = sqlx::query_as::<_, Scan>("SELECT * FROM scans WHERE user_id = $1")
    .bind(user_id)
    .fetch_all(&pool)
    .await?;

# Test: Attempt SQL injection with payload `' OR '1'='1` → should fail

**Security Backlog (docs/SECURITY-BACKLOG.md):**
## Revora Security Backlog

**Date:** 2026-04-15  
**Status:** Post-remediation

### Resolved (Week 13-14)
- [x] **CRITICAL**: SQL injection in scans endpoint (CVSS 9.0) — Fixed via BE-006 parameterized queries
- [x] **HIGH**: IDOR in dashboard endpoint (CVSS 7.5) — Fixed via BE-012 RLS policies

### Deferred to Post-Launch
- [ ] **MEDIUM**: Weak password reset flow (CVSS 5.5) — Mitigation: Short JWT expiry, defer 2FA to V1.1
- [ ] **LOW**: Missing security headers (CVSS 3.0) — Defer to Week 16 (add Helmet.js headers)

**Notes:**
- Variable effort: 8 hours if no Critical/High findings, up to 40 hours if major issues
- Week 14 deadline: All Critical/High must be resolved before Week 15 launch

---

## PHASE 3: LAUNCH COMPLIANCE (Week 15)

### Final Compliance Checks

**SC-026: App Store Pre-Submission Compliance Review**  
**Effort:** [M] 4 hours  
**Week:** 14  
**Depends on:** FE-080 (screenshots), FE-081 (store copy), SC-007 (claims validated), SC-022 (attorney sign-off)  
**Blocks:** BLK-005 (App Store pre-submission checklist), FE-082 (app submission)  
**Owner:** Founder (lead), Person A (technical validation)  
**SPEC/PRD Reference:** SPEC §11.2 (BLK-005)

**Acceptance:**
- App Store pre-submission checklist complete (all items below verified)
- Google Play pre-submission checklist complete (similar items)
- Any issues identified → fixed before FE-082 (app submission Week 15)
- BLK-005 status: RESOLVED

**App Store Pre-Submission Checklist (docs/APP-STORE-CHECKLIST.md):**
## Revora App Store Pre-Submission Checklist

**Date:** Week 14 (2026-04-10)  
**Owner:** Founder  
**Status:** IN PROGRESS

### App Information
- [ ] App name: "Revora" (unique, no trademark conflicts)
- [ ] Bundle ID: `com.revora.app`
- [ ] Category: Health & Fitness (not Medical — Medical requires stricter approval)
- [ ] Age rating: 12+ (medical/treatment information)
- [ ] Privacy Policy URL: https://revora.app/privacy (live and accessible)
- [ ] Support URL: https://revora.app/support (live with contact form)

### App Description (FE-081)
- [ ] No "cure/reversal/treat" claims (attorney-approved)
- [ ] Includes disclaimer: "This app is for wellness purposes, not medical advice. Consult your doctor before making dietary changes."
- [ ] Keywords: "prediabetes, glycemic load, meal tracking, blood sugar, A1C"

### Screenshots (FE-080)
- [ ] All screenshots show disclaimers ("Not medical advice")
- [ ] No patient testimonials ("I cured my prediabetes!" = prohibited)
- [ ] Screenshots match actual app UI (no mockups)

### Health Data Permissions (FE-029)
- [ ] HealthKit permission request includes clear purpose string: "Revora accesses your blood glucose data to provide personalized dietary insights. This data is stored securely and never shared with third parties."
- [ ] Permission requested only when needed (on first scan, not on app launch)

### Privacy & Security
- [ ] Privacy Policy linked in app settings (FE-057)
- [ ] Terms of Service linked in onboarding (FE-003)
- [ ] No third-party analytics in app without disclosure (PostHog disclosed in Privacy Policy)
- [ ] No ads (Revora is subscription-only)

### Subscription (IAP-001)
- [ ] Subscription clearly described: "Premium: $12.99/month, unlimited scans"
- [ ] Cancellation policy visible: "Cancel anytime in iOS Settings"
- [ ] Free trial (if offered): Duration clearly stated

### Technical Requirements
- [ ] App runs on iOS 14+ (Expo SDK 52 minimum)
- [ ] No crashes in test (Sentry crash-free rate ≥99.5% in staging)
- [ ] App size: <200MB (Revora ~50MB — within limit)
- [ ] IPv6 compatible (Expo handles automatically)

### App Review Guidelines Compliance
- [ ] No placeholder content ("Lorem ipsum" text = rejection)
- [ ] No broken links in app (all external URLs tested)
- [ ] No misleading metadata (screenshots match app)
- [ ] No health misinformation (attorney-validated claims)

### Sign-Off
- [ ] Founder reviewed: All items checked
- [ ] Person A reviewed: Technical items verified
- [ ] Attorney reviewed: Legal compliance confirmed (SC-022)
- [ ] Ready for submission: YES / NO

---

**Google Play Pre-Submission Checklist (similar structure, key differences):**
- Category: Health & Fitness
- Age rating: PEGI 12 (medical information)
- Content rating questionnaire: Disclose health data collection
- Data safety section: List all data collected (A1C, photos, email)

**Notes:**
- Week 14 completion: Allows 1 day buffer to fix issues before Week 15 submission
- BLK-005: Checklist complete + attorney sign-off (SC-022) = blocker resolved

---

**SC-027: Final Security Checklist (Pre-Launch)**  
**Effort:** [M] 4 hours  
**Week:** 15  
**Depends on:** All security tasks (SC-001–025), DO-032 (secrets audit), DO-033 (TLS verification)  
**Blocks:** Launch gate  
**Owner:** Person A (technical), Founder (sign-off)  
**SPEC/PRD Reference:** SPEC §7.1

**Acceptance:**
- Final security checklist reviewed and signed off
- All items below verified in production environment
- Any issues found → fixed before launch (DO-039)
- Founder + Person A sign-off: "Revora is secure and ready for launch"

**Final Security Checklist (docs/FINAL-SECURITY-CHECKLIST.md):**
## Revora Final Security Checklist (Pre-Launch)

**Date:** Week 15 (2026-04-14)  
**Owner:** Person A  
**Sign-Off:** Founder

### Encryption
- [ ] A1C values encrypted at rest (AES-256-GCM, BE-053)
- [ ] Photos encrypted at rest (Cloudflare R2 default AES-256)
- [ ] All data in transit encrypted (HTTPS/TLS 1.3, DO-033)
- [ ] JWT secret is strong (64-char random, DO-003)
- [ ] Encryption keys stored securely (GitHub Secrets + Railway env vars)

### Access Controls
- [ ] RLS policies active on all tables (BE-012)
- [ ] JWT expiry is short (15 minutes, SC-015)
- [ ] Password policy enforced (8+ chars, uppercase, number, SC-014)
- [ ] Rate limiting active (free: 5 scans/day, global: 100 req/min, SC-034)
- [ ] Admin access documented and audited (SC-016)

### Data Protection
- [ ] R2 bucket is private (no public access, DO-006, DO-024)
- [ ] Signed URLs expire in 1 hour (DO-023)
- [ ] Database backups encrypted (SC-018)
- [ ] No secrets in git history (DO-032)

### Compliance
- [ ] Privacy Policy live at revora.app/privacy (SC-009)
- [ ] Terms of Service live at revora.app/terms (SC-010)
- [ ] GDPR DPIA documented (SC-013)
- [ ] DPAs signed: OpenAI, Cloudflare, RevenueCat, PostHog (SC-001–004)
- [ ] FTC attorney final sign-off received (SC-022)

### Testing & Validation
- [ ] Penetration test passed (zero Critical/High vulnerabilities, SC-024)
- [ ] OWASP ZAP scan passed (DO-011)
- [ ] Dependency security scans passing (DO-010)
- [ ] Rate limiting stress test passed (DO-034)

### Monitoring & Incident Response
- [ ] Sentry configured (crash monitoring, DO-012)
- [ ] Railway health checks active (DO-013)
- [ ] BetterUptime monitoring active (DO-014)
- [ ] Incident response plan documented (SC-019)
- [ ] Security contact: security@revora.app (monitored)

### Final Verification
- [ ] All secrets rotated before production deploy (DO-003, DO-021)
- [ ] Production environment isolated from staging (DO-005)
- [ ] Rollback procedure tested (DO-037)
- [ ] Hotfix procedure tested (DO-036)

### Sign-Off
- Person A: ________________ Date: ________
- Founder: ________________ Date: ________

**Decision:** Revora is secure and approved for production launch: YES / NO

---

**Notes:**
- Week 15 final check: Last gate before production deploy (DO-039)
- If any item fails: **launch slips** until resolved

---

## CROSS-DOMAIN DEPENDENCIES (Security-Specific)

| Dep ID | Producing Task (Security) | Consuming Task (Other Domain) | Risk if Late |
|--------|--------------------------|-------------------------------|--------------|
| **DEP-020** | SC-001: OpenAI DPA signed | BE-037: OpenAI integration | Cannot send real user data to OpenAI (GDPR violation) |
| **DEP-021** | SC-006: FTC attorney engaged | SC-007: Claims validation, SC-009: Privacy Policy | No legal review → FTC compliance risk |
| **DEP-022** | SC-009: Privacy Policy live | FE-003: Onboarding checkboxes | Cannot collect user data without Privacy Policy link |
| **DEP-023** | SC-013: DPIA documented | Launch gate (Week 15) | GDPR violation if processing EU data without DPIA |
| **DEP-024** | SC-024: Pen test passed | Launch gate (Week 15) | Cannot launch with Critical/High vulnerabilities |
| **DEP-025** | SC-022: Attorney final sign-off | Launch gate (Week 15) | FTC compliance risk if health claims not approved |

---

## LAUNCH BLOCKERS (Security-Specific)

| ID | Blocker | Owner | Target Week | Status |
|----|---------|-------|-------------|--------|
| **BLK-002** | OpenAI DPA executed, zero retention policy confirmed | Founder | W1 | NOT STARTED |
| **BLK-003** | GDPR DPIA documented (if EU users) | Founder | W10 | NOT STARTED |
| **BLK-004** | Penetration test passed (zero Critical, zero High unmitigated) | Person A | W13 | NOT STARTED |
| **BLK-005** | App Store pre-submission checklist complete (attorney-approved copy) | Founder | W14 | NOT STARTED |
| **BLK-006** | FTC attorney final sign-off (all health claims approved, no "reversal" language) | Founder | W14 | NOT STARTED |

---

## RISK REGISTER (Security-Specific)

| Risk ID | Description | Probability | Impact | Mitigation | Status |
|---------|-------------|-------------|--------|------------|--------|
| **RSK-010** | OpenAI DPA execution delayed → delays beta launch | LOW | HIGH | Start Week 1, DPA is self-service in OpenAI console (~30 min) | OPEN |
| **RSK-011** | Penetration test finds Critical vulnerability Week 13 → launch slips | MEDIUM | CRITICAL | Rigorous code review during dev, OWASP ZAP monthly scans (DO-011) to catch issues early | OPEN |
| **RSK-012** | FTC attorney finds prohibited health claims Week 14 → requires UI rewrites | LOW | HIGH | Early claims validation (SC-007 Week 2), attorney reviews onboarding/advice cards before finalization | OPEN |
| **RSK-013** | GDPR breach notification required post-launch (e.g., R2 bucket misconfigured) | LOW | CRITICAL | Private bucket + signed URLs (DO-006), pen test validates (SC-024), incident response plan (SC-019) | OPEN |

---

## WEEKLY SECURITY DELIVERABLES

| Week | Phase | Primary Deliverable | Milestone / Gate |
|------|-------|---------------------|------------------|
| **1** | P0 | DPAs initiated (OpenAI, Cloudflare, RevenueCat, PostHog), FTC attorney engaged, entity formed | **BLK-002 target** — OpenAI DPA executed |
| **2** | P0 | GDPR applicability assessed, claims validation procedure, health claims checklist | Claims validation active, **BLK-014** (reversal grep) scoped |
| **3** | P0 | GDPR applicability assessed (SC-008), SCC verification (SC-031) | GDPR compliance groundwork |
| **4** | P1 | Password policy, JWT hardening, admin access audit | Security hardening active |
| **5** | P1 | A1C encryption key rotation procedure, backup encryption verified | Encryption validated |
| **6** | P1 | **Privacy Policy live (SC-009)**, **Terms of Service live (SC-010)**, incident response plan | **Week 6 gate** — Privacy Policy must be live before alpha test |
| **10** | P2 | Pen test vendor selected, contract signed | **BLK-004 partial** — test scheduled for Week 13 |
| **12** | P2 | Pen test environment prepared (staging data, test accounts) | Ready for Week 13 pen test |
| **13** | P2 | **Penetration test executed (SC-024 — gate)**, findings remediation started | **Week 13 gate** — Zero Critical/High unmitigated |
| **14** | P3 | Pen test remediation complete, **FTC attorney final sign-off (SC-022 — BLK-006)**, **App Store checklist (SC-026 — BLK-005)** | **Week 14 gate** — All blockers resolved |
| **15** | P3 | **Final security checklist (SC-027 — gate)**, production deploy approved | **LAUNCH** |

---

## CRITICAL PATH (Security)

**Any slip here → launch slips:**

1. **Week 1:** SC-001 (OpenAI DPA executed — **BLK-002**)
2. **Week 10:** SC-013 (DPIA documented — **BLK-003**)
3. **Week 6:** SC-009 (Privacy Policy live before alpha test)
4. **Week 10:** SC-021 (Pen test vendor selected, test scheduled for Week 13)
5. **Week 13:** SC-024 (**pen test passed — BLK-004**)
6. **Week 14:** SC-022 (**FTC attorney sign-off — BLK-006**) + SC-026 (**App Store checklist — BLK-005**)
7. **Week 15:** SC-027 (**final security checklist**) → **LAUNCH**

---

## SUCCESS METRICS (Security-Specific)

**Tracked via pen test reports, Sentry, incident logs:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Penetration test result** | Zero Critical, Zero High unmitigated | SC-024 report (Week 13) |
| **Data breach incidents** | 0 per year | Incident log (SC-019) |
| **GDPR data subject requests** | <5 per month | GDPR export log (BE-063) |
| **Average request resolution time** | ≤7 days | GDPR export automation (BE-063) |
| **Secrets audit pass rate** | 100% (zero secrets in git) | DO-032 quarterly scan |
| **Privacy Policy updates** | Annual review | SC-009 (update on data practice changes) |
| **Crash-free rate** | ≥99.5% | Sentry dashboard (SPEC PER-009) |
| **FTC compliance violations** | 0 per year | Attorney quarterly review |

---

## END OF SECURITY & COMPLIANCE PLAN

**Version:** 1.0  
**Status:** ACTIVE  
**Next Review:** Week 1 end (2026-03-13)  
**Owner:** Founder (overall), Person A (technical security)  
**Approver:** Founder

**This document is your compliance shield. Security and legal foundations are non-negotiable — every blocker (BLK-002 through BLK-006) must be resolved before launch. Any pen test Critical finding or FTC attorney objection = launch slip. Compliance first, features second.**

