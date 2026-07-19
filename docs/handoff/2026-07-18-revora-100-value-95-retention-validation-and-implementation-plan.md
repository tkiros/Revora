# Revora — 100/100 Value and 95/100 Retention Readiness Plan

**Date:** 2026-07-18
**Status:** Implementation-ready product and engineering plan; no application code changed by this review
**Input under review:** <code>docs/handoff/2026-07-18-revora-product-value-retention-virality-distribution-forensic-report.md</code>
**Source snapshot reviewed:** local branch <code>qa/launch-live-smoke-2026-07-18</code> at <code>a5424b1</code>; current <code>origin/main</code> at <code>039a587</code>; the two relevant live-smoke changes are patch-equivalent even though the commit IDs differ
**Target:** make Revora fully deliver a truthful, meaningful promise and create an ethical product that deserves long-term payment from the users who still need it

---

## 1. Executive decision

The forensic report found the right strategic problem: Revora can produce a useful first answer, but its current value does not compound. That makes the product more like an episodic meal checker than a durable paid relationship.

The report is not reliable enough to implement verbatim:

1. Its value table is internally inconsistent. The nine dimension rows sum to **57/100**, matching the headline, but the table's Total row incorrectly says **47/100**.
2. Its cultural-meal and photo-length findings describe pre-fix states. Current engineering evidence shows both regressions were remediated and retested.
3. Its 31/100 retention score is a useful structural warning, but it is not measured retention. Revora has no real D7, D30, D90, renewal, or willingness-to-pay cohort.
4. Its 45/100 exception for a persistently-high-glucose subsegment is unsupported. The cited study used fasting-glucose quartiles, while Revora collects an A1C band; the study did not measure Revora usage, willingness to pay, or product retention.
5. Several platform and legal statements are written as settled conclusions even though the primary sources require a fact-specific classification.
6. It missed current product contradictions in history, Premium entitlements, photo input persistence, result feedback, and outage handling.
7. Its evidence index names many sources and parallel-agent conclusions without preserving direct links or the underlying research outputs. This plan links the primary external sources it actually uses and labels unresolved classifications.

### Corrected current verdict

| Question | Corrected verdict | Current score |
|---|---|---:|
| Does Revora deliver its promise and meaningful value? | **PARTIAL.** The safe meal-check core is real, but the advertised oatmeal path, public availability, cross-device history promise, billing reliability, and compounding value loop are not complete. | **60/100 source-read readiness proxy; measured user value is N/A** |
| Can Revora retain paying users long-term? | **Not yet.** There is no compounding product loop or measured paid cohort. | **About 31/100 structural readiness; measured retention is N/A** |
| Is the report's high-glucose 45/100 exception valid? | **No.** It is a hypothesis built from a non-equivalent population variable and must not be used for targeting or pricing. | **Withdraw the score pending Revora data** |

The corrected 60/100 is not a claim that users experience 60% value. It is a reproducible source-read score on the report's original rubric. Real value remains unmeasured until strangers can use the public product and a cohort reports what changed for them.

### Product architecture decision

Build Revora as a **90-day Learning Journey with a persistent Personal Meal Memory**, followed by an honest graduation, pause, or optional maintenance path.

The product should move through three promises:

1. **Now:** “Check this meal and get a calm, specific next step.”
2. **Over time:** “Build a personal playbook of meals, choices, and patterns you can actually remember.”
3. **At graduation:** “Leave with a useful meal playbook, not a dependency on the app.”

The core meal-balance card must remain separate from user history. Personal memory may show prior cards, user-authored notes, previous choices, and ease/confidence reflections, but it must not infer glucose response, predict an individual outcome, or silently change the card band.

Long-term payment should be earned from users who continue to receive new value through new contexts, saved meal memory, periodic learning reviews, travel/restaurant/seasonal challenges, and private sharing. Users whose need has ended should be allowed to graduate or pause without dark patterns.

---

## 2. What 100/100 and 95/100 mean

These are acceptance scores, not promises of zero defects and not retention percentages.

### 2.1 The 100/100 value gate

Revora receives 100/100 only when every weighted gate below has current evidence. Partial credit can guide work, but a launch claim of 100 requires all rows to pass.

| Value dimension | Weight | Evidence required for full credit |
|---|---:|---|
| Pain severity and frequency | 12 | Real target-user interviews plus observed first-check behavior confirm a frequent, important meal-decision job |
| Time to first meaningful value | 12 | At least 95% of eligible first sessions reach a useful card, including sessions whose clarification is resolved; an unresolved clarification does not count as value. P95 eligible response time is at or below 12 seconds and every promoted demo reproduces. |
| Incremental insight | 15 | Blind comparison shows target users prefer Revora's answer to their current free alternative and can explain the new insight |
| Actionability and specificity | 15 | At least 90% of eligible real-user cards are rated specific and usable; credentialed review finds zero dangerous false reassurance in the release corpus |
| Trust, honesty, comprehension | 15 | Public availability, billing, refund/support, privacy, claims, safety, uncertainty, and copy-source gates all pass |
| Coverage of real contexts | 10 | Cultural, restaurant, ambiguous, voice, photo, accessibility, low-literacy, and supported-A1C strata meet their release thresholds |
| Emotional value | 8 | Usability review confirms calm, non-shaming, non-restrictive language across all verdicts and recovery states |
| Repeat value and learning | 8 | Returning users receive an accurate personal memory and a new weekly learning artifact without changing the history-independent safety verdict |
| Friction, reliability, accessibility | 5 | Domain, sign-in, check, history, paywall, photo, voice, billing, and recovery SLOs pass on supported devices |
| **Total** | **100** | **Every row passes; no averaging away a safety, billing, privacy, or availability failure** |

### 2.2 The 95/100 paid-retention-readiness gate

This score means the product has a credible and tested reason to deserve continued payment. It does not mean 95% of subscribers will remain.

| Retention dimension | Weight | Target score | Full-credit evidence |
|---|---:|---:|---|
| Frequency of recurring need | 15 | 14 | Core and maintenance cohorts show recurring uncertain-meal, restaurant, travel, and household contexts through Day 180 |
| New value after month one | 20 | 19 | A new weekly or stage-level artifact is used and rated useful through Day 90, and maintenance users still report new value through Day 180 |
| Compounding memory | 15 | 15 | Meal memory becomes more useful with use, remains accurate, and is recalled in later sessions |
| Demonstrable non-clinical progress | 15 | 14 | Users can see foods explored, choices saved, confidence, variety, and journey completion without health-outcome claims |
| Differentiation and switching resistance | 10 | 9 | Users identify the trusted safety contract plus their accumulated meal playbook as meaningfully harder to replace |
| Price-to-frequency fit | 10 | 9 | Real price tests show acceptable conversion, first and second renewal, downgrade, refund, and support burden; annual claims wait for Day-365 evidence |
| Trust and reliability over time | 10 | 10 | Entitlement, data, support, privacy, cancellation, and refund SLOs all pass |
| Ethical habit strength | 5 | 5 | No anxiety loop, punitive streak, artificial urgency, or cancellation obstruction is required to retain users |
| **Total** | **100** | **95** | **Target readiness score** |

### 2.3 Measured business outcomes remain separate

The release dashboard must show both scorecards and actual cohort outcomes:

- activation and first meaningful value;
- D7, D30, D60, D90, D180, and D365 active paid retention;
- first renewal and second renewal;
- voluntary graduation, pause, cancellation, refund, and involuntary churn;
- value events per active subscriber;
- saved-meal-memory adoption and recall;
- helpfulness and “would be disappointed” survey results;
- support contacts and trust failures.

No readiness score may be presented as measured retention.

---

## 3. Evidence and truth boundaries

### 3.1 Current local source and tests

- The text meal-check safety pipeline, deterministic A1C boundary, eight clinical-risk routes, conservative floors, contract assertions, voice entry, photo-to-draft flow, history storage, billing handlers, and cancellation paths exist.
- The current carb-forward ontology includes the cultural-food tokens cited as missing in the report, including injera, ugali, biryani, pho, dosa, pierogi, tabbouleh, and gallo pinto.
- The literal input “oatmeal” still intentionally triggers a plain-versus-sweetened clarification before the model. The landing, demo card, and onboarding promise an immediate “Be careful” answer instead.
- The core prompt does not read prior checks. The meal-balance answer is structurally history-independent.
- The history page loads only seven days and tells users it is “on this device,” while the paywall promises full history on every device.
- Guest and signed-in free surfaces can derive and display the same thin longitudinal insight that paywall copy describes as Premium.
- Photo history is degraded to text because both client mapping and the history API schema omit the photo method.
- The daily nudge has a typed analytics event, but no open path emits it.
- Result helpfulness is sent only as anonymous aggregate analytics and is not connected to a check or user.
- The progress page catches all fetch failures as “locked,” so an outage can be misrepresented as a paywall.
- The client defaults to legacy paywall mode on configuration failure while the server defaults to trial mode.
- Play entitlements self-heal on read; Stripe entitlements do not.

Targeted validation on the current checkout passed **262 tests across 10 files with zero failures**, covering input precheck, carb ontology, photo draft, insights, entitlement, history routes, nudges, pricing, analytics, and billing routes. This is engineering evidence only.

### 3.2 Deployed runtime and operations

- The current Vercel deployment is Ready and has aliases configured.
- <code>revora.bio</code> did not resolve to a usable public site during this review: DNS returned no usable NS/A/MX/TXT chain and HTTPS failed during TLS setup.
- The Vercel deployment URL itself redirects to Vercel SSO, so it is not a public fallback for a stranger.
- Resend delivery cannot be established without working domain records; the available key cannot inspect domain status.
- Photo and longitudinal-insight flags are enabled in production.
- The Umami environment variables are absent and no Umami service was found in the Railway project, so product analytics are dark.
- A Stripe webhook secret exists, but that does not prove that the live endpoint is registered, receives events, or meets a latency SLO.
- Railway services were online, including databases and the hourly cron, but that does not prove the end-to-end user journey.

### 3.3 Human and external gates

- The simulated reviewer panel is not a credentialed RD/CDCES review.
- Engineering safety tests are not clinical validation.
- Owner approval is not legal clearance.
- Counsel must classify each software function and each public claim; no document should assert a final medical-device or state-scope result before that review.
- Third-party distribution policy depends on the exact account, content, market, and product classification. Platform guidance supports caution, not blanket certainty.

### 3.4 User and commercial evidence

There is no measured Revora user, payment, renewal, retention, willingness-to-pay, or referral cohort in the reviewed evidence. This is the largest remaining evidence gap.

---

## 4. Full validation ledger

### 4.1 Contradictions K1–K7

| ID | Report finding | Validation | Correct conclusion and required action |
|---|---|---|---|
| K1 | “Oatmeal” acquisition promise does not reproduce | **Confirmed** | Keep the honest clarification. Change the public demo to show the two-step interaction, or use a fully specified, fixture-backed example. Do not weaken ambiguity handling to force a dramatic card. |
| K2 | High-range onboarding copy differs from the copy ledger | **Confirmed** | Remove hardcoded clinical copy. Render every safety/boundary message from one versioned source and add a drift test. |
| K3 | Client paywall fallback differs from server authority | **Confirmed** | Make server configuration authoritative, hydrate it into the page, and show a neutral loading/retry state rather than silently choosing a different commercial contract. |
| K4 | Insights were enabled after an earlier hold | **Confirmed governance gap; not proof of a violation** | The later owner approval is real, but function-specific evidence review is not. Create a feature authorization record linking owner, clinical, legal, eval, rollout, and rollback evidence. |
| K5 | Public “wellness tool, not a medical device” claim is unsafe | **Direction confirmed; legal conclusion overstated** | Remove the public status assertion now. Counsel must assess intended use, labeling, and each function against current FDA guidance. The report cannot itself decide device status. |
| K6 | Stripe entitlement can fail without recovery | **Confirmed** | Add Stripe verify-on-read or authoritative reconciliation, durable event inbox, idempotency, retry/dead-letter handling, pending state, and entitlement SLO monitoring. Correct the misleading source comment. |
| K7 | Product-marketing docs say photo/insights are unadvertised while flags and public copy are live | **Confirmed** | Reconcile docs after the product/claims review. Until then mark old strategy and product-marketing files superseded, not silently current. |

### 4.2 Journey findings 1–12

| Journey | Validation | Plan response |
|---|---|---|
| 1. Literal oatmeal first check | **Confirmed mismatch** | Fixture-backed promise registry and an honest clarify-then-answer demo |
| 2. Restaurant/takeout meal | **Current engineering performance improved; real-user coverage unmeasured** | Add portion, multi-starch, sauce, and restaurant strata to permanent release eval |
| 3. Cultural mixed meal | **Report is stale** | Engineering rerun improved from seven dangerous false-assurance cases to one minority reviewer vote, zero majority/unanimous cases, and zero cultural false-assurance votes (evidence: <code>docs/qa/19-rehearsal-fixes-2026-07-16.md</code>, ontology <code>CARB_FORWARD_TOKENS</code> v2026-07-16.1; live reproducibility: <code>artifacts/qa/graded-eval-live-2026-07-17T18-50-57-231Z.json</code> and <code>artifacts/qa/graded-eval-live-2026-07-17T18-53-03-168Z.json</code>, 97.0% riskAccuracy, 0 harmful-SAFE — simulated/engineering evidence only). Preserve the expanded ontology; now require credentialed review and broader real-food coverage. |
| 4. Surprising “healthy” meal | **Partially confirmed** | Use only live-captured, reproducible examples. Measure whether users find the surprise useful rather than alarming. |
| 5. Ambiguous input | **Confirmed design limitation** | Expand ambiguity detection beyond exact strings, while preserving a bounded, deterministic precheck and measuring over-clarification. |
| 6. Low-digital-confidence voice user | **Confirmed friction** | Test iOS keyboard dictation instructions, Android/Web Speech, large text, screen reader, one-handed use, and fallback text entry with target users. |
| 7. Outside A1C range | **Core behavior confirmed; copy drift confirmed** | Centralize copy and test every entry surface. |
| 8. Urgent/medication/allergy/pregnancy/ED/diagnosed-diabetes input | **Strong engineering evidence confirmed** | Preserve precedence and deterministic routing; add credentialed and adversarial release review. |
| 9. Guest creates an account | **Operationally broken for strangers until domain/email work** | Fix DNS/TLS/email, add magic-link synthetic checks, and give users a recoverable resend/change-email path. |
| 10. Paid user returns over time | **History-independent core confirmed; “byte-identical” wording overstated** | Same inputs produce the same prompt structure but model output may vary. Keep the core independent; add a parallel compounding memory and learning layer. |
| 11. User asks why they still need Revora | **Confirmed** | Ship a staged learning journey, visible non-clinical progress, graduation, pause, and optional maintenance. |
| 12. User wants to share | **Confirmed** | Do not default to public health sharing. Validate and build private, field-selective, revocable, expiring sharing only if users ask for it. |

### 4.3 Promise-to-proof findings

| Promise | Correct current status | Exit condition |
|---|---|---|
| Check a meal and understand its balance in seconds | **Partial** | Supported inputs reach a useful card or honest clarification within the SLO; copy says what clarification may occur |
| Oatmeal produces an immediate “Be careful” card | **Not delivered and should not be forced** | Public demo accurately shows oatmeal clarification followed by a specified answer, or the example changes |
| Conservative and honest when unsure | **Delivered in source; needs credentialed and live proof** | Permanent eval, release canary, and incident review all pass |
| A1C scope boundary | **Delivered in source; copy drift remains** | One source of truth across onboarding and checks |
| “Check any meal” / cultural coverage | **Too broad** | Replace “any” with supported truthful copy until credentialed strata pass |
| One-tap cancel and pre-charge email | **Implemented; end-to-end production proof incomplete** | Live synthetic cancel and pre-charge evidence, staffed recovery |
| Seven-day first-charge refund | **Partially operational, not absent** | Terms already directs users to support and the playbook has refund macros; add a working support address, in-account request, case ledger, SLA, and tested processor path |
| “Full history, every device” | **Not delivered in the UI** | Paid users can paginate/search all retained server history on supported devices |
| “Weekly insights” are Premium | **Not accurately entitled** | Free and paid behavior matches the pricing contract on both server and UI |
| “The moat is memory and patterns” | **Not delivered** | Personal Meal Memory and weekly learning artifacts compound without making health predictions |
| No numbers to decode | **Delivered for core card** | Preserve in all new journey/progress surfaces; counts are allowed only where they describe app activity, not implied health outcomes |

### 4.4 Q1–Q5 conclusions

| Report conclusion | Validation | Replacement decision |
|---|---|---|
| Q1: PARTIAL, 57/100 | **Direction and headline arithmetic valid; table total invalid** | The dimension rows sum to 57, not the printed Total of 47. Current repaired source supports about 60/100 readiness, while measured user value remains N/A. |
| Q2: NO, 31/100 median | **Direction structurally valid; not a cohort result** | Treat 31 as a backlog-severity signal. Run a real paid cohort only after availability, billing, and measurement gates pass. |
| Q2: 45/100 persistently-high-glucose exception | **Unsupported** | Delete the segment score and do not target users from this inference. Revora does not collect the cited study's variable. |
| Q3: no single feature fixes retention | **Valid** | Personal notes alone are insufficient. Build the whole Learning Journey architecture: reliable core + meal memory + weekly learning + graduation/maintenance. |
| Q4: current virality is content-only | **Confirmed** | There is no referral/share loop. Do not bolt on public sharing before privacy and user-demand validation. |
| Q4: five candidate moments | **Plausible, not validated** | Test real app captures. The clarification moment is safer and more truthful than manufacturing a fixed oatmeal verdict. |
| Q5: Reddit is the first 5,000-user engine | **Plausible channel test, not a forecast** | The funnel arithmetic is correct, but the inputs are unmeasured. Availability and instrumentation now precede the test. |
| Q5: Instagram cannot cold-start | **Overstated** | Recommendation eligibility is content/account/classification dependent. Check Account Status and test compliant organic content; do not assume reach. |
| Q5: TikTok branded partnerships are categorically unavailable | **Overstated for Revora's exact classification** | The policy clearly restricts named healthcare categories. Obtain platform/counsel classification before sponsored content; founder organic posting is a separate case. |

### 4.5 External-evidence corrections

| Evidence used in report | What it supports | What it does not support |
|---|---|---|
| myDESMOND: 17.6% used the service at least one year | Digital diabetes engagement can decay substantially | Revora paid retention. myDESMOND was free/routine-care, served type 2 diabetes, and included experts, community, and buddies. |
| Six-month photo-record study | Repeated photo logging can be burdensome and adherence can decay | An exact “83% Revora drop.” The study was small, used a different adherence definition, and involved a different population and intervention. |
| Habit-formation review | Healthy-eating automaticity varies widely and often takes months | That habit necessarily destroys subscription value. A learning product may support, refresh, and preserve a habit. |
| Prediabetes transition cohort | Long-term transitions vary by baseline glucose and other factors | A high-A1C Revora retention segment. The cited subgroup was fasting-glucose quartile and the study measured disease transition, not app payment. |
| FDA General Wellness guidance | Intended use, disease references, labeling, and function matter | A final legal classification of Revora based on a report excerpt |
| Washington MHMDA | Consumer health data and linked identifiers receive broad protection; private enforcement risk exists | That every identifier on every Revora page is automatically regulated. That requires a data-flow and counsel analysis. |
| CDC National DPP standards | An AI/chatbot is not a recognized substitute for the required live coach interaction | That Revora can claim DPP equivalence because it supports eating decisions |
| Reddit spam guidance | Authentic, disclosed participation can be allowed; mass unsolicited engagement and ban evasion are not | Guaranteed moderator acceptance or the report's estimated reach and CTR |

### 4.6 Stale premises and material gaps the report missed

| Item | Correct current truth | Plan treatment |
|---|---|---|
| Photo draft-length failure | The Tier-1 run went from 8/40 retry cards before the fix to 40/40 captured and 0 retry cards after it. The active risks are visual misidentification, user confirmation, and loss of the photo input method in remote history. | Preserve confirmation, repair method persistence, and keep a permanent photo stratum. |
| Refund has no user path | Overstated. Terms tells users to email support and the support playbook contains Stripe/Play handling. The real gap is that the mailbox is not currently deliverable and there is no in-account case/SLA path. | Restore support and add a case-backed request flow. |
| Full history is Premium | Missed contradiction. The paid UI still calls <code>loadHistory(7)</code> and describes the last seven days on this device. | Build the archive the paywall sells, or change the offer. |
| Longitudinal insight is Premium | Missed entitlement gap. Guest and signed-in free surfaces derive the thin insight without a Premium capability check. | Define one capability matrix and decide whether the thin insight is free or replaced. |
| Photo history | Missed data-integrity gap. Remote mapping and API schema collapse photo to text/voice. | Migrate the schema and prove round-trip fidelity. |
| Progress outage | Missed trust gap. Fetch failures can render as “locked,” turning an outage into an upsell. | Use explicit unavailable and retry states. |
| Feedback personalization | Missed evidence gap. Helpful/not-helpful is aggregate analytics, not result-linked learning. | Add result-linked structured feedback and a safety queue. |
| Public Pantry and ICP copy | Missed claims drift. Current strategy/ICP material contains “spike,” individualized-effect, DPP, and regulatory-status language outside the conservative product boundary. | Quarantine and reconcile all active copy before acquisition. |

---

## 5. Corrected current score

This is a present source-read proxy on the report's rubric, not a user outcome.

| Dimension | Weight | Corrected current score | Why |
|---|---:|---:|---|
| Pain severity and frequency | 12 | 9 | The problem is plausible and externally supported, but not yet validated with Revora users |
| Time to first meaningful value | 12 | 7 | The form is fast; oatmeal mismatch and public-domain failure prevent full credit |
| Incremental insight | 15 | 8 | Composition-first output is useful but not yet proven better than free alternatives for real users |
| Actionability and specificity | 15 | 11 | The cultural-food engineering fix raises confidence; real-user and credentialed proof remain |
| Trust, honesty, comprehension | 15 | 10 | Strong safety contract, offset by public availability, billing reconciliation, support, and copy drift |
| Coverage of real contexts | 10 | 7 | Current ontology and rerun are materially better than the report; accessibility and credentialed coverage remain |
| Emotional value | 8 | 5 | Anti-shame framing exists; individual felt value is unmeasured |
| Repeat value and learning | 8 | 1 | Nothing meaningful compounds yet |
| Friction, reliability, accessibility | 5 | 2 | Photo-length fix helps, but domain/email, history, paywall, and device gaps are material |
| **Total** | **100** | **60** | |

Do not publish this 60. It exists only to prioritize the implementation plan.

---

## 6. Target product and system design

### 6.1 Current non-compounding loop

~~~text
landing promise
      |
      v
meal text / voice / photo draft
      |
      v
history-independent meal card
      |
      +------> seven-day display history
      |
      +------> thin static insight / usage score / static nudge
      |
      v
same uncertain meal utility on the next visit

Nothing learned by the user becomes durable product value.
Nothing in the product explains graduation, maintenance, or changed need.
~~~

### 6.2 Target compounding loop

~~~text
truthful, fixture-backed promise
              |
              v
eligible meal check -----> honest clarification when needed
              |
              v
history-independent meal card
              |
              +-----------------------------+
              |                             |
              v                             v
user chooses an action             user-owned meal memory
              |                    - prior card snapshot
              |                    - what I chose
              |                    - would I repeat it
              |                    - optional private note
              |                             |
              +--------------+--------------+
                             |
                             v
                  weekly learning summary
                  - meals explored
                  - choices saved
                  - uncertainty resolved
                  - variety and confidence
                             |
                             v
               next journey stage / maintenance
                             |
                 +-----------+-----------+
                 |                       |
                 v                       v
             graduate/pause       continue by choice
~~~

The memory panel is not an input to the card-band decision. It is a separate product lane rendered next to or after the current card.

### 6.3 Billing and entitlement truth flow

~~~text
checkout provider
      |
      +----> signed webhook ----> durable event inbox ----> idempotent reducer
      |                                                     |
      +----> verify on read / reconciliation cron -----------+
                                                            |
                                                            v
                                                authoritative entitlement
                                                            |
                                         +------------------+------------------+
                                         |                                     |
                                         v                                     v
                                  server route gate                       UI capability
                                         |
                                         v
                               user-visible pending/recovery
~~~

No paid capability may depend on UI-only gating. No charged user may be left without an automatic recovery path.

---

## 7. Implementation program

The phases are ordered by user harm and dependency. Distribution does not begin merely because a code branch is green.

### Phase 0 — Restore public availability and operational truth

**Outcome:** a stranger can reach Revora, receive a sign-in email, get support, and generate measurable events.

#### P0.1 DNS, TLS, and domain

- Restore authoritative nameservers and required A/AAAA/CNAME records for <code>revora.bio</code> and <code>www</code>.
- Confirm Vercel domain ownership and remove unintended deployment protection from the public production surface.
- Configure MX/SPF/DKIM/DMARC records for the chosen email provider.
- Add external DNS, TLS-expiry, HTTP, and redirect synthetic monitoring.
- Capture proof from a clean network and browser with no Vercel session.

**Pass:** public HTTPS is usable from two networks, redirects are canonical, TLS is valid, and the synthetic remains green for 24 hours.

#### P0.2 Authentication email

- Verify the sending domain and From address.
- Test initial link, resend, expired link, already-used link, wrong browser/device, and changed-email recovery.
- Add rate-limit and abuse telemetry without storing email in product analytics.
- Provide a visible fallback and staffed support path.

**Pass:** at least 99% test sends accepted by the provider; seeded Gmail and Outlook inboxes receive links; every failure state is recoverable.

#### P0.3 Minimized, first-party measurement

- Deploy the selected first-party analytics service or remove claims that it is operational.
- Maintain a closed event allowlist.
- Never send meal text, photo, A1C, email, free-form notes, result rationale, or report contents.
- Treat even pseudonymous use of a prediabetes product as potentially regulated consumer health data. “First party” and “no raw text” reduce exposure but do not remove consent, notice, access, deletion, retention, or security obligations.
- Keep safety-review, card-band, clinical-route, model-fallback, and detailed feedback data in the access-controlled operational store, not the general product-analytics stream.
- Add environment validation that fails deployment when measurement is expected but not configured.
- Document retention, access, deletion, and incident ownership.

**Pass:** production events arrive with no prohibited fields; privacy review approves the data map.

#### P0.4 Support and refund operations

- Make the published support address deliverable and monitored.
- Add an in-account “Request help or refund” path with authenticated case ID.
- Record request time, provider, charge, eligibility basis, status, owner, resolution, and user notifications.
- Preserve statutory rights and processor-specific instructions.
- Publish and monitor response and resolution SLAs.

**Pass:** a seeded request travels from user to case ledger to provider action to confirmation; no request depends on an unread mailbox.

#### P0.5 Source-of-truth quarantine

- Mark stale <code>docs/product-marketing.md</code>, <code>docs/ICP.md</code>, and <code>docs/Revora_90-Day_Distribution_Strategy.md</code> passages as superseded where they promise unreviewed features, glucose/spike prediction, DPP equivalence, or regulatory status.
- Create one release truth index linking claims, flags, pricing, support, privacy, safety, and authorization evidence.
- Add a document owner and review date to each launch-critical source.

**Pass:** no active launch document conflicts with deployed behavior or uses unreviewed clinical/regulatory claims.

### Phase 1 — Make the first promise reproduce every time

**Outcome:** every acquisition claim maps to a tested user interaction and every eligible meal gets a safe, specific, understandable result or clarification.

#### P1.1 Promise registry and live fixtures

- Create a typed registry for every promoted meal example.
- Store input, A1C band, expected route type, approved copy intent, evidence owner, and last live-capture time.
- Drive landing demo, onboarding examples, screenshots, content briefs, and canaries from this registry.
- Do not assert exact generative wording. Assert route type and approved meaning.
- Block deployment when a promoted fixture changes route unexpectedly.

**Oatmeal decision:** show the honest sequence:

1. User enters “oatmeal.”
2. Revora asks “plain or sweetened?”
3. User supplies the missing context.
4. Revora returns the resulting card.

This is more trustworthy than weakening the precheck to manufacture the old screenshot.

#### P1.2 One clinical and boundary copy source

- Remove onboarding constants that duplicate the copy ledger.
- Version all deterministic high-risk and out-of-range copy.
- Snapshot every consuming surface in tests.
- Require a safety owner for changes and a migration note when meaning changes.

#### P1.3 Ambiguity capability

- Extend the precheck beyond exact single-string lists with bounded, deterministic food/context rules.
- Ask only for information that can materially change the card: sweetened/plain, portion, preparation, missing meal components, or ambiguous category.
- Set a maximum clarification count of one for normal use.
- Measure clarify rate, resolution rate, abandonment, and false clarification.
- Preserve out-of-scope and urgent-route precedence.

#### P1.4 Permanent cultural and real-world eval

- Expand the release corpus across regional staples, mixed plates, restaurant portions, sauces, beverages, vegetarian dishes, budget meals, and code-switching.
- Record strata and failure types instead of relying on one aggregate accuracy number.
- Add adversarial under-description and multi-starch cases.
- Have a credentialed RD/CDCES panel review the rubric, a blinded sample, all potentially dangerous outputs, and all release regressions.
- Require zero dangerous false reassurance in the release corpus; uncertainty must route conservative or clarify.
- Keep simulated model reviewers labeled as engineering tests.

#### P1.5 Photo and voice integrity

- Preserve <code>photo</code> through remote history schema, serialization, UI, and analytics.
- Keep photo as draft-only and make confirmation explicit.
- Show truncation or item-limit behavior to the user; never silently change meal meaning.
- Add low-confidence, partial-image, duplicate-item, and empty-draft recovery.
- Test iOS keyboard dictation instructions and do not imply native voice support where the API is unavailable.

#### P1.6 Result feedback tied to the result

- Persist a privacy-reviewed result ID and structured feedback:
  - helpful / not helpful;
  - too vague / wrong food / unsafe-feeling / confusing / other;
  - optional private comment stored separately from analytics.
- Add a safety-review queue for “unsafe-feeling” and wrong-direction reports.
- Do not train or alter live behavior automatically from one user's feedback.

**Phase 1 exit:** the 100/100 scorecard's time-to-value, actionability, coverage, emotional-safety, and core trust gates have releasable evidence.

### Phase 2 — Make pricing, history, and entitlements truthful

**Outcome:** the paid contract is identical in copy, UI, API, billing, and recovery.

#### P2.1 Authoritative paywall configuration

- Resolve paywall mode on the server and hydrate it into client state.
- Use an explicit pending state until authority is known.
- Ensure check quota, wall copy, account copy, checkout, and email all use the same pricing object.
- Add contract tests for config timeout and malformed response.

#### P2.2 Stripe self-healing

- Store signed webhook events in a durable inbox before processing.
- Deduplicate by provider event ID.
- Make the entitlement reducer idempotent and order-tolerant.
- Add Stripe verification/reconciliation on account read, checkout return, and scheduled sweep.
- Show “Payment received; access is syncing” rather than a false free state.
- Alert on charge-without-entitlement, entitlement-without-valid-subscription, delayed event, and dead-letter count.
- Correct the source comment that currently generalizes Play self-healing to Stripe.

**SLO:** 99.9% of successful charges produce correct entitlement within 60 seconds; every remaining case self-heals or pages an owner.

#### P2.3 Full cross-device history

- Replace the fixed seven-day paid view with cursor pagination, search, date filtering, and full retained history.
- Make guest/device-local, signed-in free, and paid retention rules explicit.
- Provide export and delete controls.
- Preserve all input methods and immutable result snapshots.
- Do not silently overwrite an old card when models or copy change.

#### P2.4 Premium entitlement matrix

- Define each capability once: daily limit, archive depth, meal memory, weekly journey, nudges, export/share, and support.
- Enforce on server and render from the same capability response.
- Decide whether the current thin insight is free onboarding value or replace it with a genuinely Premium weekly artifact.
- Remove paywall promises that do not exist.

#### P2.5 Error-state truth

- Distinguish unauthenticated, free, locked, loading, unavailable, and corrupted states.
- Do not render a backend outage as an upsell.
- Provide retry, status reference, and support paths.

**Phase 2 exit:** no price, renewal, history, capability, cancellation, or refund promise disagrees with production behavior.

### Phase 2.6 — Validate the compounding-value hypothesis before the full build

**Outcome:** prove that Meal Memory and a weekly learning artifact solve a recurring user job before committing to the full Phase 3–4 system.

- Recruit 12–15 people in the supported audience for formative work; this is discovery, not a statistically representative cohort.
- Give at least eight participants a consented three-week concierge prototype using the existing meal card plus a manually prepared, non-clinical meal-memory and weekly-summary artifact.
- Keep research data in the approved first-party environment; do not paste meal histories into unapproved tools.
- Observe whether participants return to the memory without prompting, use it in a later decision, understand that it is not glucose prediction, and choose to continue at a clearly disclosed test price.
- Interview participants who stop, not only participants who complete.
- Precommit the go/no-go rule. A reasonable discovery gate is that at least five of eight completing participants independently recall the memory at least twice and choose to continue at the disclosed price. This clears discovery only; it does not prove retention.
- If the gate fails, do not build the full journey. Test a simpler fixed-duration guide, a free archive, or stop the subscription thesis.

The core reliability, billing, privacy, and availability repairs remain required even if the product-architecture hypothesis fails.

### Phase 3 — Build Personal Meal Memory safely

**Outcome:** value compounds without claiming individualized glucose prediction.

#### P3.1 Immutable check-result snapshot

Persist, encrypted:

- check ID and user ID;
- normalized input and display input;
- input method;
- A1C band at time of check;
- route type;
- card band, grounded reason, adjustment, and swap;
- clarification asked and answer supplied;
- model/prompt/contract version;
- safety-floor and fallback metadata;
- timestamps.

The snapshot is append-only except for explicit deletion. A rerun creates a new check.

#### P3.2 User-owned memory

Allow the user to attach:

- “What I chose”;
- “Would I choose this again?”;
- ease or confidence reflection;
- private note;
- favorite/saved flag;
- user-defined label such as breakfast, restaurant, travel, or family meal.

Do not:

- infer blood glucose;
- ask for or interpret glucose readings in this phase;
- convert notes into a risk band;
- claim that a choice “worked” medically;
- place raw health text in analytics or search logs.

#### P3.3 Recall in later sessions

- After the current meal card is complete, show exact or user-confirmed related prior meals in a separate “Your meal memory” panel.
- Label the source and date.
- Let the user dismiss incorrect matches.
- Offer a one-tap “Check again” from a recalled or saved meal that pre-fills the stored meal description into the standard input path. This answers the report's evidenced logging-fatigue pain (photo-record adherence decays sharply even in supported studies) without letting history alter the card: the engine still runs history-independent on the pre-filled text, and the user can edit it before submitting.
- Prefer user-confirmed matching over opaque semantic inference at launch.
- If a search index is needed, use a privacy-reviewed keyed index with rotation and deletion support; never use a raw or unsalted hash of meal text.

#### P3.4 Memory controls

- Search, edit user-authored fields, export, delete one entry, and delete all.
- Explain what influences the meal card: current meal description and supported context, not historical notes.
- Record access and deletion failures for operations.

**Phase 3 exit:** returning-user usability tests show the memory is correct, understandable, and useful; no reviewer mistakes it for individualized metabolic prediction.

### Phase 4 — Turn meal checking into a 90-day Learning Journey

**Outcome:** users receive new value after novelty fades and can graduate ethically.

#### P4.1 Journey stages

Use non-clinical, reversible stages such as:

1. **Days 1–7: Get oriented** — understand the card and save three meals.
2. **Days 8–21: Build reliable defaults** — save easy repeat choices across dayparts.
3. **Days 22–45: Handle real life** — restaurant, takeout, cultural favorite, time pressure, and budget.
4. **Days 46–75: Build variety** — avoid over-restriction and add choices, not bans.
5. **Days 76–90: Make your playbook** — review what the user saved, what still feels uncertain, and where professional help may be useful.

The journey never claims to lower A1C, prevent diabetes, predict spikes, or replace care.

#### P4.2 Weekly learning artifact

Generate from app behavior and user-authored memory:

- meals explored;
- saved choices;
- categories or contexts covered;
- repeated uncertainty;
- unused or incomplete journey steps;
- one optional next exploration.

Build the first version as a deterministic, versioned projection rather than another model call. Any later generative summary requires its own privacy, safety, claims, eval, and fallback review. Do not call app usage a health score. Replace BAI with a plainly named learning summary or retire it.

#### P4.3 Personal nudges

- Trigger only from explicit journey state, saved preferences, or incomplete user-chosen actions.
- Let users choose cadence and quiet hours.
- Emit <code>nudge_opened</code>, dismissal, unsubscribe, and downstream value event.
- Stop nudges after inactivity or graduation; never increase anxiety to restore a streak.

#### P4.4 Graduation, pause, and maintenance

At Day 90, offer:

- export and graduate;
- pause with archive retained under the disclosed data policy;
- continue in a lower-intensity maintenance mode;
- seek professional care when the user's question is outside Revora's scope.

Maintenance must have concrete recurring value:

- personal meal archive and search;
- periodic meal-playbook review;
- new restaurant/travel/seasonal contexts;
- private sharing if validated;
- newly reviewed food coverage;
- continued core checks for genuinely uncertain meals.

Do not force every user into an indefinite subscription. Test monthly, 90-day, maintenance, and pause offers with real users before choosing price or an annual plan.

#### P4.5 Retention cohort

Enroll an explicit paid beta cohort only after Phases 0–3 pass. Pre-register:

- target segment;
- price and refund terms;
- primary value event;
- D7/D30/D60/D90 definitions for the core journey and D180/D365 plus first/second renewal definitions for maintenance;
- graduation and pause treatment;
- cohort exclusions;
- minimum sample;
- success, iterate, and stop thresholds.

Use a power calculation based on the precommitted outcome. A small formative pilot can shape the product, but it cannot award the 95/100 long-term score or support population-level retention claims.

Segment by observed product behavior and user-stated job, not inferred health severity. Additionally, pre-register supported A1C band — a variable Revora already collects — as an analysis stratum for D7/D30/D90 retention and check frequency, so the report's high-band retention hypothesis is tested honestly instead of silently dropped along with its invalid 45/100 score. Band stratification is analysis only; it must never drive targeting, pricing, or copy.

#### P4.6 Long-term maintenance evidence

- Treat the 90-day journey and paid maintenance as different products in cohort reporting.
- Follow maintenance users through Day 180 before awarding provisional long-term readiness.
- Do not make a one-year or annual-plan claim until a Day-365 cohort and annual renewal exist.
- Report graduation as a successful journey outcome, not failed retention.
- Report maintenance retention against all users offered maintenance and against users who selected it; never use only the survivor denominator.

**Phase 4 beta exit:** real users receive new, rated-useful value after Day 30; no retention mechanism depends on fear, confusion, or billing friction. The final 95/100 long-term score remains unavailable until the Day-180 maintenance evidence passes, and any annual claim remains unavailable until Day 365.

### Phase 5 — Add private sharing and distribution only after trust works

**Outcome:** growth does not outrun product truth or expose health information.

#### P5.1 Validate sharing demand first

- Interview users about spouse, caregiver, clinician, and personal-record use.
- Ask what exact fields they want to share and for how long.
- Prototype without sending real health data.
- Do not assume sharing equals virality.

#### P5.2 Private sharing design

If validated:

- explicit field selection;
- private recipient or unguessable scoped link;
- expiration;
- revocation;
- noindex and no social preview containing health content;
- view log visible to the owner;
- no download by default;
- clear statement that the artifact is user history, not a clinical report.

Public share cards and referral codes are separate decisions. A generic referral may avoid health-detail exposure, but it still needs abuse, attribution, and privacy review.

#### P5.3 Distribution prerequisites

Before a Reddit or video test:

- domain, check, email, analytics, support, and billing gates are green;
- promoted examples are live-captured from the current deployment;
- UTM and first-check attribution work;
- a rollback/stop owner is on call;
- counsel-approved claims and platform-specific content matrix exist;
- a recorded owner decision ratifies every channel disposition where this plan softened a report prohibition (Instagram cold-start testing, TikTok sponsored content).

#### P5.4 Channel tests

- Reddit: founder-disclosed, community-specific, value-first participation; no mass posting, fake accounts, backup-account ban evasion, or undisclosed promotion.
- TikTok/Instagram: separate organic founder content from paid/branded content; verify current account eligibility and exact product/content classification before spend. Before committing production budget to any single format, run a small format tournament across the report's five ranked content moments (all live-captured from the current deployment) with precommitted per-format metrics — 3-second retention at or above 75%, save rate at or above 1.5%, and comment sentiment — and drop formats that miss.
- Facebook groups: obey each group's rules; do not cold-DM health lead magnets.
- Paid ads: no third-party pixels until the consumer-health-data review approves the exact data flow.
- Pantry Review: no expanded promotion until scope-of-practice and operational review are written. Also record an explicit product decision on Pantry's relationship to Personal Meal Memory — either surface purchased reports in the buyer's memory as display-only records or keep the current two-way silo on purpose; the silo must be a documented choice, not an accident preserved silently.

Treat 30 attributed first checks in 14 days as a test threshold, not proof of a path to 5,000. Precommit all three outcome branches before the test starts, so the result stays falsifiable:

1. **At least 30 attributed first checks, zero moderator actions:** proceed to the next growth gate.
2. **10–29 attributed first checks:** revise hook and format once and run one more 14-day cycle; do not add channels.
3. **Fewer than 10 attributed first checks and zero unprompted product questions:** stop spending founder time on the channel. Treat the result as a message, product, or positioning signal — do not switch to a different channel until positioning is revisited.

Recompute the funnel only from measured impressions, visits, starts, completions, registrations, and retained value events.

Use explicit growth gates:

1. The first 30 attributed checks validate only message/channel signal.
2. The first 100 activated users validate first meaningful value, D7 behavior, safety reports, and support load.
3. Growth into the hundreds requires a passing D30 cohort and stable billing/operations.
4. A deliberate push toward 5,000 requires a passing D90 paid cohort, support capacity, acceptable unit economics, and no unresolved safety/privacy/billing incident.

Do not infer retention from traffic or activation.

### Phase 6 — Controlled release and evidence closure

**Outcome:** each claim has engineering, human, and production proof proportional to risk.

- Credentialed RD/CDCES review and documented disposition.
- Function-specific counsel review for meal check, memory, journey, insights, nudges, sharing, Pantry Review, analytics, and distribution claims.
- Privacy/security review and data-protection impact assessment.
- Accessibility audit and target-user usability sessions.
- Staged rollout: internal, seeded external, small beta, paid cohort, then broader release.
- Daily release dashboard and weekly evidence review.
- Stop-the-line authority for safety, billing, privacy, or availability regressions.

---

## 8. Data model and API work

Names are illustrative; use the existing schema conventions.

| Entity | Purpose | Important constraints |
|---|---|---|
| <code>check_results</code> or extended <code>checks</code> | Immutable card and routing snapshot | Encrypted food/card fields; versioned; append-only |
| <code>check_feedback</code> | Result-level structured feedback and safety review | Separate private text from analytics; reviewer status |
| <code>meal_memories</code> | User-authored choice, repeat preference, note, label | Never an input to card-band logic |
| <code>learning_journeys</code> | Stage, start, pause, graduate, maintenance state | Explicit state machine; no hidden reset |
| <code>weekly_reflections</code> | Versioned weekly learning artifact | Derived only from allowed fields; reproducible |
| <code>billing_event_inbox</code> | Durable signed provider events | Unique provider event ID; retry/dead-letter metadata |
| <code>refund_requests</code> | User-visible support/refund workflow | SLA timestamps, provider action, audit trail |
| <code>private_shares</code> | Optional scoped sharing | Field manifest, expiry, revocation, access audit |

### Migration requirements

- Inventory current encrypted and plaintext fields before schema design.
- Write forward and backward-compatible migrations.
- Backfill only what can be reconstructed truthfully; never invent old card snapshots.
- Preserve photo input method.
- Add deletion/export coverage for every new table before production data is created.
- Test key rotation, partial migration, retry, rollback, and restore.
- Document retention separately for guest, free, paid, graduated, refunded, and deleted accounts.

---

## 9. File-level work map

| Area | Likely files/modules | Required change |
|---|---|---|
| Promoted examples | <code>app/page.tsx</code>, <code>components/demo-check-card.tsx</code>, onboarding | Registry-driven examples and clarify-then-answer oatmeal truth |
| Copy source | onboarding, <code>lib/revora/fallback.ts</code>, safety copy ledger | Remove duplicate boundary copy and add drift tests |
| Ambiguity | <code>lib/revora/input-precheck.ts</code>, prompt and precheck tests | Bounded contextual clarification with metrics |
| History | history page, <code>lib/client/remote-history.ts</code>, history handlers/schema | Full archive, pagination/search, photo method, error truth |
| Insights/progress | <code>lib/coach/insights.ts</code>, BAI/compute, progress, guest dashboard | Replace thin entitlement mismatch with journey learning artifact |
| Nudges | <code>lib/server/nudge.ts</code>, service worker, analytics | Personalized opt-in triggers and opened/outcome events |
| Feedback | result feedback component and new API/table | Result-linked feedback and safety queue |
| Entitlement | <code>lib/server/entitlement.ts</code>, billing handlers, checkout-return/account surfaces | Stripe reconciliation, event inbox, pending UI, SLOs |
| Pricing | <code>lib/server/pricing.ts</code>, food-check form, account and paywall | One server-authoritative contract |
| Data | <code>lib/server/db/schema.ts</code>, migrations, crypto/export/delete | Immutable result, memory, journey, billing/refund entities |
| Analytics | <code>lib/client/analytics.ts</code>, server events, deployment env | Privacy-reviewed, minimized first-party product events; sensitive safety operations remain separate |
| Operations | DNS/Vercel/Resend/Railway/Stripe docs and monitors | Public availability, mail, analytics, webhook and support proof |
| Claims/docs | product marketing, ICP, distribution strategy, claims boundary | Current truth, counsel disposition, supersession |

---

## 10. Instrumentation contract

### 10.1 Product events

Use anonymous/session or internal IDs appropriate to the approved data map. Never attach raw health content. Pseudonymization does not make use of a health product non-sensitive, so the final event list requires privacy/counsel review before production.

| Event | Minimum properties |
|---|---|
| <code>check_started</code> | entry surface, input method |
| <code>clarification_requested</code> | approved generic reason bucket, not meal text |
| <code>clarification_resolved</code> | generic bucket, elapsed time |
| <code>check_completed</code> | latency bucket and direct-versus-post-clarification path; no card band or clinical route |
| <code>first_meaningful_value</code> | emitted only after an eligible meal card renders; direct or post-clarification path |
| <code>result_feedback_submitted</code> | submission presence only; the structured reason remains in the encrypted operational store |
| <code>meal_memory_saved</code> | memory field types, not contents |
| <code>meal_memory_recalled</code> | exact/user-confirmed match class |
| <code>weekly_learning_viewed</code> | journey stage |
| <code>nudge_opened</code> | nudge class, journey stage |
| <code>journey_paused</code> | stage and user-selected reason enum |
| <code>journey_graduated</code> | completed stage count |
| <code>maintenance_selected</code> | offer variant |
| <code>checkout_started/completed</code> | provider, offer ID |
| <code>entitlement_pending/recovered</code> | provider, latency bucket |
| <code>refund_requested/resolved</code> | provider, reason enum, SLA bucket |
| <code>canceled</code> | reason enum, stage, tenure bucket |

### 10.2 Required funnels

1. Landing → check started → clarification if any → check completed → feedback.
2. Guest check → account start → email delivered → authenticated → history migrated.
3. Paywall seen → checkout → payment → entitlement → first Premium value.
4. First check → first memory → first weekly learning → Day 30 value → Day 90 outcome.
5. Nudge sent → opened → meaningful action, with unsubscribe and complaint rate.
6. Refund request → acknowledged → processor action → user confirmation.

### 10.3 Data-quality controls

- Event schema tests in CI.
- Production canary event with a known synthetic identifier.
- Duplicate and missing-step dashboard.
- Time-zone and identity-merge tests.
- Version every offer, experiment, prompt, and journey.
- Maintain a deletion test proving analytics and operational stores follow the approved policy.

---

## 11. Failure map and recovery contract

| Failure | User sees | Automatic recovery | Alert/owner |
|---|---|---|---|
| DNS/TLS failure | Branded status/fallback only if a separate domain exists | Provider retry is insufficient; external monitor opens incident | Operations, immediate |
| Magic-link delivery failure | Resend/change email/support, no dead end | Provider retry with limit | Operations, SLO breach |
| Model timeout or invalid card | Calm retry or safe fallback; never fabricated answer | Bounded retry and circuit breaker | Engineering, rate threshold |
| Potentially dangerous output | Conservative fallback and review capture | Contract/floor blocks response | Safety owner, immediate sample |
| Photo uncertain/misread | Editable draft with confidence cue | Re-take or text entry | Product quality dashboard |
| History unavailable | “History unavailable,” not “Upgrade” | Retry/cache where safe | Engineering |
| Decryption/key error | No partial plaintext; support reference | Keyring retry/read replica | Security, immediate |
| Payment succeeded, webhook delayed | “Access is syncing” | Verify/reconcile | Billing, 60-second SLO |
| Duplicate/out-of-order webhook | No duplicate transition | Idempotent reducer | Billing dead-letter alert |
| Refund request unstaffed | Case ID and published SLA | Escalation timer | Support owner |
| Analytics unavailable | Product remains usable | Buffered or explicitly dropped | Growth/data warning |
| Cron fails | No false pre-charge assurance | Retry and freshness alarm | Operations |
| Share link leaked | Minimal selected fields only | Expiry/revoke immediately | Privacy/security |
| Journey derivation wrong | Hide artifact and preserve source history | Rebuild versioned projection | Product/engineering |

“Flawless” means these failures are bounded, visible, recoverable, and owned. It does not mean pretending failures cannot happen.

---

## 12. Verification plan

### 12.1 Unit and property tests

- Copy-source equality and promoted-fixture route.
- Ambiguity precedence, one-question limit, Unicode, spelling, and code-switching.
- Clinical-route precedence and banned-claim assertions.
- Meal-memory non-interference: changing any historical/user-authored memory cannot change the core card for a fixed current input and deterministic model fixture.
- Billing reducer idempotency and event-order permutations.
- Pricing/capability matrix consistency.
- Journey state transitions, pause, resume, graduate, delete.
- Encryption, key rotation, export, deletion, and field redaction.

### 12.2 Contract and integration tests

- Text, voice, photo-draft, clarification, result persistence, feedback, memory recall.
- Guest-to-account migration and cross-device history.
- Stripe checkout, delayed webhook, missing webhook, duplicate webhook, refund, cancellation, renewal, failed payment, and reconciliation.
- Email deliverability and expired/reused link.
- Analytics schema and prohibited-field rejection.
- Private-share expiry/revocation if built.

### 12.3 Safety and quality eval

- Permanent stratified food corpus.
- Zero dangerous false reassurance in all release-critical strata.
- Separate report for majority, minority, and uncertainty disagreements.
- Credentialed RD/CDCES review of rubric and failures.
- Mother test: would the team show this card to a loved one in the stated scope without adding an oral disclaimer?
- Banned-word, interaction, claims, and visual-accuracy gates.

### 12.4 End-to-end and accessibility

- Clean-browser stranger journey over public DNS.
- Supported iPhone Safari, Android Chrome, desktop Safari/Chrome/Firefox.
- Keyboard-only, screen reader, 200% zoom, reduced motion, contrast, large text, slow network.
- Voice-unavailable and photo-permission-denied recovery.
- Trial/free/paid/refunded/graduated personas.

### 12.5 Production proof

- Synthetic first check without model spend where possible.
- Small controlled real-model canary with cost and safety bounds.
- External email seeds.
- Billing synthetic/test clock plus a tightly controlled live low-value transaction and refund where authorized.
- Dashboard screenshots and raw event IDs retained in the release evidence pack.
- Rollback drill for flags, pricing mode, prompt/model, billing reducer, and journey.

### 12.6 Security, resilience, and capacity

- Authorization tests prove one user cannot read, edit, export, delete, refund, or share another user's data; cover direct-object-reference attacks across every new ID.
- Test magic-link replay, session fixation, CSRF, webhook signature failure, privilege escalation, rate-limit bypass, and enumeration.
- Validate photo MIME/type/size, metadata handling, malformed input, provider retention, and deletion; do not trust a browser filename or content type.
- Threat-model private-share token entropy, referrer leakage, screenshots/downloads, revocation races, and cached pages before building the feature.
- Run dependency and secret scans and review logs for meal, A1C, email, token, and payment leakage.
- Prove database backup and restore, encryption-key recovery, and documented RPO/RTO in a disposable environment.
- Load-test the first-check, history, entitlement, and email paths at the measured 5,000-user scenario plus safety margin.
- Set per-user/provider rate limits, spend ceilings, circuit breakers, and cost-per-completed-check alerts so abuse or provider drift cannot create an unbounded bill.
- Test OpenRouter/model unavailability and model-version rollback without weakening deterministic clinical routes.

---

## 13. SLOs and release gates

| Area | Gate |
|---|---|
| Public availability | 99.9% monthly target; valid TLS; two external probes |
| Request routing reliability | At least 99% of technically valid requests return the correct kind of response: meal card, clarification, or boundary route; no silent failure |
| First meaningful value | At least 95% of eligible first sessions reach a rendered meal card, including sessions with a resolved clarification; an unresolved clarification does not count |
| Check latency | P50 at or below 5 seconds and P95 at or below 12 seconds, measured in production |
| Promoted examples | 100% reproduce route and approved meaning against current deployment |
| Dangerous false reassurance | Zero in release corpus and zero unresolved credible production reports |
| Clarification | At least 80% resolved; abandonment and over-clarification reviewed by stratum |
| Billing entitlement | 99.9% correct within 60 seconds; no unresolved charged-without-access case |
| History | 100% of entitled server history reachable, exportable, and deletable |
| Premium contract | 100% of paid capabilities server-entitled and copy-accurate |
| Email | 99% provider acceptance on non-suppressed test recipients; seed inbox evidence |
| Support/refund | Acknowledge within one business day; processor action within published policy/SLA |
| Analytics privacy | Zero unapproved sensitive or free-text fields; consent/notice, retention, access, and deletion tests pass |
| Accessibility | No open critical/serious issue on core and billing journeys |
| Cohort value | At least 80% of eligible activated beta users rate the first card useful under a precommitted missing-response rule; target finalized before enrollment |
| Day-30 new value | At least 60% of the original eligible paid cohort views and rates a weekly learning artifact useful; also report the active-user denominator so survivor bias is visible |

Any safety, privacy, billing, or public-availability miss blocks broad distribution regardless of aggregate score.

---

## 14. Execution sequence, ownership, and dependency

| Wave | Scope | Indicative duration | Primary owners | Dependency |
|---|---|---:|---|---|
| 0 | DNS/TLS, email, analytics, support, source-truth quarantine | 2–5 working days plus provider propagation | Owner, operations, engineering | Provider access |
| 1 | Promise fixtures, copy source, ambiguity, cultural eval, photo/voice integrity, feedback | 1–2 weeks | Engineering, product, safety reviewer | Wave 0 for live proof |
| 2 | Paywall authority, Stripe reconciliation, full history, entitlement matrix, error truth | 1–2 weeks | Engineering, billing/ops | Stripe and DB access |
| 2.5 | Three-week concierge test of Meal Memory and weekly learning | 3–4 weeks including recruitment | Product research, privacy, owner | Waves 0–2; approved research handling |
| 3 | Immutable results and Personal Meal Memory | 2–3 weeks | Engineering, privacy/security, design | Waves 1–2 and discovery gate |
| 4 | 90-day journey, weekly learning, nudges, graduation/maintenance, cohort | 2–4 weeks to beta; 90 days for core evidence; 180/365 days for long-term evidence | Product, engineering, research | Wave 3 and human approvals |
| 5 | Private sharing validation and measured distribution tests | Parallel after core gates | Product, privacy, growth | Availability, analytics, counsel |
| 6 | Credentialed/counsel closure and staged release | Continuous; broad release only after evidence | Owner and named approvers | All applicable functions |

Durations are planning ranges, not commitments. The 90-day core, Day-180 maintenance, and Day-365 annual evidence cannot be compressed into a code sprint.

### Decision rights

- **Engineering:** implementation, test, observability, rollback proof.
- **Product:** promise, journey, pricing experiment, graduation/maintenance.
- **Safety/clinical reviewer:** food-eval rubric and harmful-output disposition.
- **Counsel:** intended-use, claims, privacy, scope-of-practice, sharing, and channel classification.
- **Owner:** risk acceptance only after the other evidence is visible.
- **Support/operations:** billing, refund, email, incident, and user recovery.

No one role may silently stand in for another.

---

## 15. Recommendation mapping

This closes every action and prohibition in the forensic report without carrying forward stale premises.

| Report recommendation or prohibition | Disposition |
|---|---|
| Fix oatmeal reproduction | **Changed:** preserve clarification and make promotion reproduce the real two-step flow |
| Counsel review of device-status copy | **Accepted:** remove status claim now; run function-specific counsel review |
| Counsel review of Pantry Review | **Accepted:** do not expand promotion until written scope/operations decision |
| Run Reddit test | **Reordered:** first fix domain, measurement, support, promoted fixtures, and claims; then run a falsifiable test |
| Run 90-day retention cohort | **Accepted and expanded:** add paid contract, cohort protocol, value events, graduation, and renewal definitions |
| Fix cultural false reassurance before new features | **Premise updated:** engineering regression is already repaired (<code>docs/qa/19-rehearsal-fixes-2026-07-16.md</code>: 7 dangerous false reassurances → 1 minority vote, 0 majority/unanimous; live rerun <code>artifacts/qa/graded-eval-live-2026-07-17T18-50-57-231Z.json</code>, 0 harmful-SAFE); credentialed review and permanent strata are still required |
| Do not use backup Reddit accounts | **Accepted** |
| Do not treat simulated panel as clinical validation | **Accepted** |
| Do not scale high-volume content blindly | **Accepted** |
| Do not imply CDC DPP equivalence | **Accepted** |
| Do not cold-DM Facebook health leads | **Accepted pending exact group rules; value-first public participation only** |
| Do not add third-party pixels before privacy review | **Accepted:** first-party minimization now; exact counsel/data-flow review before pixels |
| Never use Instagram cold-start | **Rejected as categorical:** verify eligibility and test exact content; do not rely on it. Because this softens an evidence-cited report prohibition (Meta Recommendations Guidelines excluding health-commercial content), a recorded owner ratification acknowledging that evidence is required before any Instagram discovery test |
| Never use TikTok creator partnerships | **Changed:** no sponsored content until platform/counsel classification; organic founder content is separately testable. Because this softens the report's cut-not-gate prohibition (TikTok Branded Content Policy, April 2026, naming healthcare and weight-loss categories), a recorded owner ratification is required in addition to the platform/counsel classification before any sponsored content |
| “One feature: none” | **Accepted strategically:** build a coherent journey architecture, not an isolated notes feature |
| Personal notes candidate | **Included as one part of Personal Meal Memory, with strict non-predictive boundary** |
| Logging-fatigue pain (report §7.1: high severity, previously unanswered) | **Accepted:** one-tap repeat check from Meal Memory (P3.3) plus existing photo/voice entry; measure repeat-check adoption and per-check effort in the cohort |
| Public sharing/referral | **Not a priority:** validate demand and build private sharing first if justified |

---

## 16. Do not build or claim

- No glucose-spike prediction, individual carb-tolerance inference, A1C-improvement claim, prevention claim, diagnosis, treatment, medication advice, or DPP equivalence.
- No history-driven silent change to the meal card's band in this plan.
- No public “not a medical device” assertion without counsel-approved wording.
- No “check any meal” promise until supported coverage is proven.
- No fake clinical panel, simulated-dietitian label presented as credentials, or engineering score presented as clinical proof.
- No health data in third-party analytics, ad pixels, logs, error trackers, URLs, notification previews, or social previews.
- No public-by-default health sharing.
- No punitive streak, anxiety notification, artificial urgency, hidden cancellation, or intentionally difficult refund.
- No annual plan or indefinite-subscription promise before Day-90 and renewal evidence.
- No distribution scale while the public domain, support, measurement, billing, or promoted examples are broken.

---

## 17. Definition of done

### 17.1 Product value is 100/100-ready only when

- all nine value rows in Section 2.1 have current evidence;
- public domain, email, support, analytics, and billing are operational;
- every promoted example is generated from or checked against a live fixture;
- one source controls all deterministic safety and boundary copy;
- permanent cultural/restaurant/ambiguity eval and credentialed review pass;
- target users demonstrate comprehension, actionability, and emotional safety;
- cross-device history and Premium promises are truthful;
- Personal Meal Memory compounds and cannot affect the core card band;
- a real cohort confirms first meaningful value and repeat value;
- no safety, privacy, billing, accessibility, or availability blocker is open.

### 17.2 Paid retention is 95/100-ready only when

- the Section 2.2 weighted evidence score is at least 95;
- real paid users receive new value after Day 30 and through Day 90 in the core journey;
- maintenance users demonstrate voluntary value and retention through Day 180 before the long-term score is awarded, while any annual-plan claim waits for Day-365 evidence;
- personal memory adoption and recall correlate with reported usefulness, not merely more app opens;
- the paid capability contract is server-enforced and self-healing;
- cancellation, pause, graduation, and refund are easy and measured;
- maintenance value is validated separately from the 90-day core journey;
- renewal comes from voluntary value, not confusion or friction;
- actual cohort metrics and confidence intervals are reported next to the readiness score.

### 17.3 “Serve users flawlessly” means

- truthful promise;
- safe scope;
- useful action;
- accessible interaction;
- durable user-controlled memory;
- correct payment and entitlement;
- private, deletable data;
- visible and recoverable failures;
- staffed support;
- honest graduation when the product is no longer needed.

---

## 18. Immediate next actions

1. Restore public DNS/TLS and email; prove the clean-browser stranger journey.
2. Make privacy-approved, minimized measurement and support operational without exporting raw or unapproved sensitive data.
3. Replace the oatmeal static promise with the real clarify-then-answer interaction and create the promoted-fixture registry.
4. Centralize high-range and clinical copy.
5. Build Stripe reconciliation and a durable billing event inbox.
6. Repair full-history, photo-method, Premium-insight, and outage-as-paywall contradictions.
7. Write the Personal Meal Memory data and privacy contract before implementation.
8. Run the three-week concierge Meal Memory/weekly-learning discovery gate before the full build.
9. Prototype the 90-day journey and test it with target users and credentialed reviewers.
10. Run the paid core and maintenance cohorts before claiming durable retention or selecting an annual plan.
11. Start distribution experiments only after the prerequisite gate is green.

---

## 19. Primary external sources used to validate the report

- [FDA General Wellness: Policy for Low Risk Devices, January 2026](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-wellness-policy-low-risk-devices)
- [FDA Digital Health Policy Navigator, healthy-lifestyle software function](https://www.fda.gov/medical-devices/digital-health-center-excellence/step-3-software-function-intended-maintaining-or-encouraging-healthy-lifestyle)
- [Washington My Health My Data Act, RCW 19.373](https://app.leg.wa.gov/RCW/default.aspx?cite=19.373&full=true)
- [Washington Attorney General MHMDA guidance](https://www.atg.wa.gov/protecting-washingtonians-personal-health-data-and-privacy)
- [CDC 2024 Diabetes Prevention Recognition Program Standards](https://www.cdc.gov/diabetes-prevention/media/pdfs/legacy/dprp-standards.pdf)
- [CDC National DPP program requirements](https://www.cdc.gov/diabetes-prevention/php/program-provider/program-requirements.html)
- [myDESMOND real-world engagement study](https://pmc.ncbi.nlm.nih.gov/articles/PMC10403792/)
- [Six-month photographic dietary record adherence study](https://pubmed.ncbi.nlm.nih.gov/29199630/)
- [Systematic review of health-habit formation time](https://pmc.ncbi.nlm.nih.gov/articles/PMC11641623/)
- [Ten-year prediabetes transition study](https://pubmed.ncbi.nlm.nih.gov/40845880/)
- [Reddit spam policy](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam)
- [TikTok branded-content policy](https://ads.tiktok.com/help/article/branded-content-policy-market-specific-requirements-archive)
- [Instagram recommendation eligibility help](https://www.facebook.com/help/instagram/653964212890722?locale=en_GB)

---

## Final product verdict

Revora should proceed, but not as an indefinite meal-check subscription with better marketing.

It should become a reliable learning system:

- the current card resolves today's uncertainty;
- Personal Meal Memory preserves what the user learned;
- the 90-day journey turns isolated checks into a playbook;
- maintenance earns continued payment only when the user still receives new value;
- graduation is a successful outcome, not churn to be prevented.

That architecture is the shortest honest path from the current **60/100 source-read value readiness and approximately 31/100 retention readiness** to evidence-backed **100/100 value readiness and at least 95/100 retention readiness**. The final scores may only be awarded after the real-user, credentialed, legal, billing, privacy, and production gates in this plan pass.
