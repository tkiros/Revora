> **Superseded for sequencing/positioning by `docs/implementation-plan-to-play.md` (coach-first, 2026-06-30).** Retained for reference; camera/CGM/BAI work is deferred.

<!-- Updated: Revora Amendment Set 1.2 + Brand Positioning v2.0 — April 2026 -->
# Revora Monetization & Revenue Implementation Plan v1.1

**Domain:** Monetization, In-App Purchases, Revenue Operations  
**Owner:** Founder (primary), Person A (IAP technical integration)  
**Stack:** RevenueCat SDK, App Store Connect, Google Play Billing, Stripe (future web payments)  
**Revenue Model:** Freemium (5 scans/day free, $12.99/month / $99.99/year / $249.99 lifetime Premium)  
**Last Updated:** 2026-03-15

### CHANGELOG
**v1.0 → v1.1:** 2026-03-15 (Alignment Audit)
- Fixed: CONFLICT-1 — All pricing corrected: $9.99→$12.99/month, $79.99→$99.99/year
- Fixed: CONFLICT-2 — Added lifetime tier ($249.99) across all App Store/Play Store/RevenueCat config
- Added: GAP-2 — 7-day free trial configuration for annual plan
- Updated: STRUCT-3 — Timeline aligned to Master Plan (RevenueCat SDK Week 12, paywall Week 13)
- Updated: AMBIGUITY-4 — Free user cost calculation updated to 75 scans/month (PRD §9.5)

---

## MONETIZATION MISSION

Own the revenue engine: in-app purchases, subscription management, paywall optimization, pricing strategy, and revenue analytics. Every scan beyond the free tier, every Premium conversion, every revenue dollar depends on monetization tasks executing flawlessly. This domain is the **business viability enabler** — if monetization fails, the product cannot sustain itself.

**Critical Success Factors:**
1. **Week 3: RevenueCat Integration Complete** — IAP infrastructure operational before any paywall code
2. **Week 5: Paywall V1 Live** — Users can upgrade to Premium before beta launch
3. **Week 8: Analytics Dashboard** — Track MRR, conversion rate, churn in real-time
4. **Week 13: Conversion Optimization** — A/B test paywall messaging, validate 5% free-to-paid target
5. **Week 15: Revenue Validation** — $500+ MRR from beta users before production launch

---

## PHASE 0: FOUNDATION (Weeks 1–3)

### App Store Connect & RevenueCat Setup

**MON-001: App Store Connect Account Setup**  
**Effort:** [M] 4 hours  
**Week:** 1  
**Depends on:** SC-005 (legal entity formed)  
**Blocks:** MON-003 (IAP products), MON-007 (RevenueCat config), DO-016 (EAS Submit)  
**Owner:** Founder  
**SPEC/PRD Reference:** PRD §5 (monetization), §9 (pricing)

**Acceptance:**
- Apple Developer account created and paid ($99/year enrollment fee)
- App created in App Store Connect:
  - App name: "Revora"
  - Bundle ID: `com.revora.app`
  - SKU: `revora-ios`
- Banking information configured (required for IAP payouts):
  - Tax forms completed (W-9 for US, W-8BEN for non-US)
  - Bank account added for direct deposit
  - Paid Apps Agreement signed
- App Store Connect API key generated (for EAS Submit and RevenueCat)
- Team member access configured (Person A: Admin, Founder: Admin)

**App Store Connect Setup Steps:**
1. Enroll at https://developer.apple.com/programs/enroll/
   - Entity type: Company (requires D-U-N-S number from SC-005)
   - Payment: $99 USD via credit card
   - Approval: 1-2 business days
2. App Store Connect → My Apps → New App
   - Platform: iOS
   - Name: Revora
   - Primary Language: English (US)
   - Bundle ID: com.revora.app (must match Expo config)
   - SKU: revora-ios (unique identifier)
3. Agreements, Tax, and Banking
   - Paid Apps Agreement: Review and accept
   - Tax Forms: Complete W-9 (US) or W-8BEN (international)
   - Banking: Add bank account details (routing + account number)
4. Users and Access
   - Add Person A: Admin role (technical setup)
   - Add Founder: Admin role (business decisions)
5. App Store Connect API
   - Users and Access → Keys → Generate API Key
   - Name: "Revora EAS Submit"
   - Access: App Manager
   - Download `.p8` file, store securely (GitHub Secrets for EAS)

**Banking Configuration (US Entity Example):**
- **Bank Name:** [Your bank]
- **Routing Number:** [9-digit ABA routing number]
- **Account Number:** [Account number]
- **Account Type:** Checking
- **Bank Address:** [Bank branch address]

**Notes:**
- D-U-N-S number: Apple requires this for company enrollment (free from Dun & Bradstreet, 5-7 days)
- First payout: 45 days after first sale (Apple's standard payment terms)
- Week 1 critical: Must complete before MON-003 (creating IAP products)

---

**MON-002: Google Play Console Account Setup**  
**Effort:** [M] 4 hours  
**Week:** 1  
**Depends on:** SC-005 (legal entity formed)  
**Blocks:** MON-004 (IAP products), MON-007 (RevenueCat config)  
**Owner:** Founder  
**SPEC/PRD Reference:** PRD §5, §9

**Acceptance:**
- Google Play Console account created ($25 one-time registration fee)
- App created in Play Console:
  - App name: "Revora"
  - Package name: `com.revora.app`
  - Default language: English (US)
- Merchant account configured (Google Play Merchant Center):
  - Business information: Company name, address, tax ID (EIN from SC-005)
  - Bank account: Added for payouts
  - Identity verification: Government-issued ID uploaded
- Service Account created (for RevenueCat API access):
  - JSON key generated and stored securely (GitHub Secrets)
- Test users configured: 2 test accounts for IAP testing (Week 3)

**Google Play Console Setup Steps:**
1. Create account at https://play.google.com/console/signup
   - Pay $25 registration fee (one-time, non-refundable)
   - Business account type: Organization (not Individual)
   - Verification: 1-3 days for account approval
2. Create App
   - Play Console → All apps → Create app
   - App name: Revora
   - Default language: English (US)
   - App type: App
   - Free or paid: Free (with in-app purchases)
3. Setup → App access (declare app is free with IAP)
4. Monetization setup
   - Monetize → In-app products (setup after MON-004)
5. Setup → API access
   - Link to Google Cloud project
   - Create Service Account
   - Grant "Finance" permission
   - Create JSON key → download, store in GitHub Secrets
6. Merchant Account (Google Play Merchant Center)
   - Link: https://payments.google.com/merchant
   - Business information: Company name, EIN, address
   - Bank account: Routing + account number
   - Identity verification: Upload government ID (Founder)
   - Approval: 1-3 business days

**Service Account Configuration:**
- **Service Account Name:** `revora-revenuecat@[project-id].iam.gserviceaccount.com`
- **Role:** Finance (required for subscription management)
- **JSON Key:** Downloaded and base64-encoded for GitHub Secrets

**Notes:**
- $25 fee is one-time (covers all future apps under this account)
- Merchant account verification can take 1-3 days (start early)
- Service account is used by RevenueCat to validate purchases server-side

---

**MON-003: App Store In-App Purchase Products Configuration**  
**Effort:** [M] 5 hours  
**Week:** 2  
**Depends on:** MON-001 (App Store Connect account)  
**Blocks:** MON-007 (RevenueCat product mapping), IAP-001 (IAP implementation)  
**Beta Revenue Report (Week 13):**
Revora Beta Revenue Report — Week 13

**MRR:** $1,029.39 (75 premium subscribers)
- Monthly: 60 users × $12.99 = $779.40
- Annual: 15 users × $99.99/12 = $124.99
- Lifetime: 5 users × $249.99 (one-time, not MRR)

**Conversion Rate:** 7.5% (75 premium / 1,000 beta users)
- Target: ≥5% ✅ PASS

**Churn Rate:** 3.2% (2 cancellations out of 62 active previous month)
- Target: <5% ✅ PASS

**LTV:** $234 (estimated, based on 3.2% churn)

**Decision:** PROCEED TO LAUNCH ✅

**Notes:**
- $500 MRR target: Validates product-market fit and monetization viability
- If below target: Consider reducing free tier to 3 scans/day (PRD §9.5 circuit breaker)

---

**MON-014: Subscription Analytics Dashboard (PostHog)**  
**Effort:** [M] 4 hours  
**Week:** 13  
**Depends on:** MON-008 (MRR tracking), PostHog custom events  
**Blocks:** None (observability for post-launch)  
**Owner:** Person A  
**SPEC/PRD Reference:** PRD §9.3

**Acceptance:**
- PostHog dashboard created: "Revora Revenue"
- Metrics visualized:
  - MRR over time (line chart)
  - Active subscriptions over time (line chart)
  - Conversion rate by cohort (funnel)
  - Churn rate over time (line chart)
  - Revenue by plan (monthly vs. annual, pie chart)
- Dashboard shared with Founder (PostHog team access)
- Real-time updates: Refreshes every hour

**PostHog Dashboard Configuration:**
1. PostHog → Dashboards → Create Dashboard: "Revora Revenue"
2. Add Insights:
   - **MRR Over Time**: Line chart, `mrr_calculated` event, property `mrr_usd`
   - **Active Subscriptions**: Line chart, `mrr_calculated` event, property `active_subscriptions`
   - **Conversion Funnel**: Funnel, `paywall_shown` → `paywall_conversion`
   - **Churn Rate**: Line chart, `mrr_calculated` event, property `churn_rate_percent`
   - **Revenue by Plan**: Pie chart, `paywall_conversion` event, grouped by `plan` property
3. Share dashboard: Add Founder as viewer

**Notes:**
- PostHog free tier: sufficient for MVP (10K events/month)
- Week 13 dashboard: Enables real-time revenue monitoring post-launch

---

**MON-015: Free Tier Circuit Breaker Decision (Week 12)**  
**Effort:** [S] 2 hours  
**Week:** 12  
**Depends on:** MON-008 (MRR tracking), DO-027 (free user cost monitoring)  
**Blocks:** Launch gate (cost sustainability check)  
**Owner:** Founder  
**SPEC/PRD Reference:** PRD §9.5 (circuit breaker)

**Acceptance:**
- Free tier cost burden assessed (Week 12):
  - Free users: 1,000 (example)
  - Avg scans/day: 4.5
  - Monthly scans: 1,000 × 4.5 × 30 = 135,000 scans
  - Total cost: 135,000 × $0.02 = $2,700/month
- Conversion rate: 7.5% (75 premium / 1,000 total)
- Premium revenue: $750 MRR
- **Net loss: -$1,950/month** (UNSUSTAINABLE at scale)
- Circuit breaker decision:
  - **If conversion <5%**: Reduce free tier from 5 → 3 scans/day
  - **If conversion ≥5%**: Keep 5 scans/day, monitor
- Implementation: PostHog feature flag `free_tier_scan_limit` (value: 5 or 3)

**Circuit Breaker Logic (PRD §9.5):**
IF (free_user_monthly_cost > $20,000 AND free_to_paid_conversion < 5%)
THEN reduce free tier from 5 → 3 scans/day

**Week 12 Decision Matrix:**
| Conversion Rate | Free User Cost | Action |
|-----------------|----------------|--------|
| <5% | Any | Reduce free tier to 3 scans/day |
| 5-10% | <$10K/month | Keep 5 scans/day |
| 5-10% | >$10K/month | Monitor closely, consider reduction |
| >10% | Any | Keep 5 scans/day (sustainable) |

**Implementation:**
// mobile/app/scan/index.tsx
const freeT tierLimit = useFeatureFlag('free_tier_scan_limit') || 5;

if (userScanCount >= freeTierLimit && subscriptionTier === 'free') {
  // Show paywall
  router.push('/paywall');
}

**Notes:**
- Week 12 timing: Allows 2 weeks to adjust before Week 15 launch
- Circuit breaker: Critical cost control mechanism for profitability

---

### Launch Compliance

**MON-016: App Store Subscription Approval Checklist**  
**Effort:** [S] 2 hours  
**Week:** 14  
**Depends on:** MON-003 (iOS IAP products), IAP-001 (purchase flow), SC-026 (App Store compliance)  
**Blocks:** FE-082 (app submission)  
**Owner:** Founder  
**SPEC/PRD Reference:** App Store Review Guidelines 3.1 (In-App Purchase)

**Acceptance:**
- Subscription approval checklist complete:
  - [ ] IAP products configured in App Store Connect (MON-003)
  - [ ] "Restore Purchases" button visible on paywall (IAP-002)
  - [ ] Subscription terms clearly stated (duration, price, auto-renewal)
  - [ ] Cancellation instructions visible ("Cancel anytime in iOS Settings")
  - [ ] No misleading free trial claims (if offering trial, state duration)
  - [ ] Privacy Policy linked (FE-003, SC-009)
  - [ ] No external payment methods (no "Buy on website" links — App Store only)
- App Store Review: Estimated 2-5 days for approval
- If rejected: Common issues (address in 1 day):
  - Missing restore button → add to paywall
  - Unclear subscription terms → update paywall copy
  - External payment link → remove

**App Store Subscription Requirements (Guideline 3.1.1):**
1. **Restore Purchases**: Must have visible "Restore" button (IAP-002 implemented)
2. **Clear Terms**: Subscription duration, price, and auto-renewal disclosed
3. **Cancellation**: Instructions for canceling ("iOS Settings → Subscriptions")
4. **Free Trial**: If offered, duration clearly stated ("7-day free trial")
5. **No External Payments**: Cannot link to website for payments (violates 3.1.1)

**Paywall Subscription Terms (FE-022):**
<View style={styles.terms}>
  <Text style={styles.termsText}>
    Subscriptions auto-renew unless canceled 24 hours before the end of the current period.
    Manage or cancel your subscription anytime in iOS Settings.
  </Text>
  <TouchableOpacity onPress={() => Linking.openURL('https://revora.app/terms')}>
    <Text style={styles.link}>Terms of Service</Text>
  </TouchableOpacity>
</View>

**Notes:**
- Week 14 timing: Final check before Week 15 submission (FE-082)
- App Store rejection: Adds 1-3 days to launch timeline (plan buffer)

---

**MON-017: Google Play Billing Compliance Checklist**  
**Effort:** [S] 2 hours  
**Week:** 14  
**Depends on:** MON-004 (Android IAP products), IAP-001 (purchase flow)  
**Blocks:** FE-082 (app submission)  
**Owner:** Founder  
**SPEC/PRD Reference:** Google Play Billing Policy

**Acceptance:**
- Google Play billing checklist complete:
  - [ ] Subscriptions configured in Play Console (MON-004)
  - [ ] "Restore Purchases" functionality (IAP-002)
  - [ ] Subscription terms visible (price, duration, cancellation)
  - [ ] Data safety section filled out (declares health data collection)
  - [ ] Privacy Policy linked (SC-009)
  - [ ] No alternative payment methods ("Buy on website" prohibited)
- Play Store Review: Estimated 1-3 days for approval
- If rejected: Common issues:
  - Missing data safety disclosures → update Play Console
  - Unclear subscription terms → update in-app copy

**Google Play Subscription Requirements:**
1. **Clear Pricing**: Display price, billing period, and total cost
2. **Cancellation**: Users can cancel via Play Store subscriptions
3. **Data Safety**: Declare health data collection in Play Console
4. **Privacy Policy**: Must be accessible from app and Play listing
5. **No External Payments**: Cannot bypass Play Billing (violates policy)

**Data Safety Section (Play Console):**
- **Data collected**: A1C values, meal photos, email
- **Data usage**: Personalized health insights
- **Data sharing**: Third-party processors (OpenAI, Cloudflare) — disclosed
- **Encryption**: Data encrypted in transit and at rest

**Notes:**
- Google Play review typically faster than App Store (1-3 days vs. 2-5 days)
- Week 14: Submit alongside iOS for simultaneous launch

---

## CROSS-DOMAIN DEPENDENCIES (Monetization-Specific)

| Dep ID | Producing Task (Monetization) | Consuming Task (Other Domain) | Risk if Late |
|--------|------------------------------|-------------------------------|--------------|
| **DEP-026** | MON-001: App Store Connect account | DO-016: EAS Submit config | Cannot upload builds to App Store Connect |
| **DEP-027** | MON-003: iOS IAP products configured | IAP-001: Purchase flow implementation | No products to purchase (app useless) |
| **DEP-028** | MON-007: RevenueCat SDK integrated | BE-044: Rate limiting by tier | Cannot distinguish free vs. premium users |
| **DEP-029** | IAP-003: Webhook sync | BE-044: Subscription tier enforcement | Backend doesn't know user's subscription status |
| **DEP-030** | MON-013: Revenue target validated | Launch gate (Week 15) | Cannot launch if monetization not viable |

---

## LAUNCH BLOCKERS (Monetization-Specific)

| ID | Blocker | Owner | Target Week | Status |
|----|---------|-------|-------------|--------|
| **BLK-008** | RevenueCat DPA signed (SC-003) | Founder | W1 | NOT STARTED |
| **BLK-009** | IAP products live (iOS + Android) | Founder | W2 | NOT STARTED |
| **BLK-010** | Purchase flow works end-to-end (sandbox → backend) | Person A | W5 | NOT STARTED |
| **BLK-011** | Beta revenue target ≥$500 MRR (50+ premium users) | Founder | W13 | NOT STARTED |

---

## RISK REGISTER (Monetization-Specific)

| Risk ID | Description | Probability | Impact | Mitigation | Status |
|---------|-------------|-------------|--------|------------|--------|
| **RSK-016** | App Store rejects IAP setup (missing restore, unclear terms) | MEDIUM | HIGH | Week 14 compliance checklist (MON-016), pre-submission review with attorney (SC-026) | OPEN |
| **RSK-017** | Beta conversion rate <5% → free tier unsustainable | MEDIUM | CRITICAL | Week 12 circuit breaker decision (MON-015), reduce free tier to 3 scans/day if needed | OPEN |
| **RSK-018** | RevenueCat webhook fails → subscription status out of sync | LOW | HIGH | Idempotency (IAP-003), manual sync endpoint (BE-059), monitoring (DO-012 Sentry) | OPEN |
| **RSK-019** | Churn rate >10% in first month post-launch | LOW | HIGH | Analyze churn reasons (MON-009), user surveys, improve onboarding (FE-002), add 7-day trial | OPEN |

---

## WEEKLY MONETIZATION DELIVERABLES

| Week | Phase | Primary Deliverable | Milestone / Gate |
|------|-------|---------------------|------------------|
| **1** | P0 | App Store Connect + Google Play Console accounts, D-U-N-S number obtained | Foundation for IAP setup |
| **2** | P0 | IAP products configured (iOS + Android), RevenueCat account setup, pricing strategy documented | **BLK-009 target** — IAP products live |
| **3** | P0 | RevenueCat SDK integrated, entitlements configured | SDK ready for purchase flow |
| **4** | P1 | Purchase flow implemented, restore purchases functional | **BLK-010 partial** — Purchase works in sandbox |
| **5** | P1 | Webhook sync complete, paywall V1 live in beta | **BLK-010 resolved** — End-to-end purchase flow validated |
| **6** | P2 | MRR tracking live, churn rate calculation implemented | Revenue analytics operational |
| **7** | P2 | Admin revenue dashboard deployed | Founder can monitor revenue |
| **8** | P2 | Paywall A/B test infrastructure complete | Ready for optimization experiments |
| **10** | P2 | Paywall copy A/B test launched (runs through Week 12) | Conversion optimization active |
| **12** | P3 | A/B test winner declared, circuit breaker decision made | Free tier limit finalized (5 or 3 scans/day) |
| **13** | P3 | **Beta revenue validation (MON-013 — gate)**: $500+ MRR target | **Week 13 gate** — Monetization viability confirmed |
| **14** | P3 | App Store + Play Store subscription compliance checklists complete | Ready for submission |
| **15** | P4 | Production IAP live, revenue monitoring active | **LAUNCH** |

---

## CRITICAL PATH (Monetization)

**Any slip here → launch slips:**

1. **Week 1:** MON-001 (App Store Connect) + MON-002 (Play Console) → accounts active
2. **Week 2:** MON-003 (iOS IAP) + MON-004 (Android IAP) → **BLK-009** resolved
3. **Week 3:** MON-007 (RevenueCat SDK)
4. **Week 4:** IAP-001 (purchase flow)
5. **Week 5:** IAP-003 (webhook sync) → **BLK-010** resolved
6. **Week 12:** MON-015 (circuit breaker decision)
7. **Week 13:** MON-013 (**revenue target validation — BLK-011**) → **GATE**
8. **Week 15:** Production IAP live → **LAUNCH**

---

## SUCCESS METRICS (Monetization-Specific)

**Tracked via RevenueCat, PostHog, backend analytics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| **MRR (beta, Week 13)** | ≥$500 | MON-008 query, PostHog dashboard |
| **MRR (post-launch, Month 1)** | ≥$2,000 | MON-008 query (sustained growth) |
| **Free-to-paid conversion rate** | ≥5% (beta), ≥10% (post-launch) | MON-010 query, PostHog funnel |
| **Churn rate** | <5%/month | MON-009 query, RevenueCat dashboard |
| **LTV (Lifetime Value)** | ≥$100 (beta), ≥$200 (post-launch) | MRR / churn rate (MON-010) |
| **Annual plan adoption** | ≥20% of new subscriptions | RevenueCat product split |
| **Paywall conversion rate** | ≥8% (after A/B test optimization) | PostHog funnel (MON-011) |
| **Free user daily scan avg** | 3-4 scans/day (not hitting 5 limit) | BE-044 rate limiting logs |
| **IAP transaction success rate** | ≥95% (excluding user cancellations) | RevenueCat transaction logs, Sentry errors |

---

## END OF MONETIZATION PLAN

**Version:** 1.0  
**Status:** ACTIVE  
**Next Review:** Week 1 end (2026-03-13)  
**Owner:** Founder (business), Person A (technical)  
**Approver:** Founder

**This document is your revenue roadmap. Monetization is the business viability enabler — if conversion rates fall below targets or free tier costs spiral, the product cannot sustain itself. Track MRR daily, monitor conversion weekly, adjust pricing aggressively if needed. Week 13 revenue validation ($500+ MRR) is the ultimate launch gate — miss this target and launch slips until monetization is fixed.**

