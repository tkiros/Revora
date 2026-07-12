# Revora — Simulated Legal Counsel Panel Review

**Review date:** 2026-07-12

**Reviewed snapshot:** `feat/app-shell-dashboard` at `b80cd67`

**Source brief:** `docs/legal/counsel-brief.md`

**Status:** **RED — not approved for public or paid launch on this review alone**

> **Important limitation:** This is an AI-assisted issue-spotting review by
> simulated counsel personas. It is not legal advice, does not create an
> attorney-client relationship or privilege, and does **not** satisfy the
> brief's acceptance requirement for a written opinion from licensed counsel.
> US FDA regulatory counsel should review the actual product before launch;
> privacy/consumer counsel should separately clear the data and subscription
> flows.

## Panel personas

### 1. Maya Chen — FDA Digital Health Regulatory Counsel

Former in-house digital-health counsel focused on intended use, device software
functions, general-wellness policy, clinical decision support, labeling, and
enforcement risk. She reads the UI, prompt behavior, onboarding, app-store copy,
and marketing together because intended use is not controlled by a disclaimer.

### 2. Daniel Brooks — FTC Advertising and Subscription Counsel

Consumer-protection specialist focused on express and implied health claims,
competent and reliable scientific evidence, endorsements, negative-option
billing, refund representations, and the net impression of the complete user
journey.

### 3. Sofia Alvarez — Privacy and Health-Data Counsel

Privacy product counsel focused on GDPR special-category data, US consumer
health-data statutes, FTC health-app enforcement, processor contracts,
cross-border transfers, consent, deletion, incident response, and privacy UX.

### 4. Jordan Patel — Product, Platform, and Commercial Counsel

Commercial counsel focused on Terms formation, entity identity, warranty and
liability allocation, Google Play rules, refunds, cancellation, support
representations, and keeping store disclosures consistent with product reality.

### 5. Ruth Okafor — Acting General Counsel / Panel Chair

Synthesizes the specialist reviews into launch gates. Her standard is not
whether a disclaimer exists; it is whether the product, evidence, contracts,
and operations tell one legally defensible story.

## Executive decision

The panel does **not** approve the current “parallel launch” premise. A narrow,
guest-only educational experience may ultimately be defensible, but the product
reviewed here is not the no-account/no-storage MVP described in parts of the
brief. It stores exact A1C and meal history, produces A1C-banded meal
classifications and personalized longitudinal suggestions, sells recurring
subscriptions, and has built photo-assist functionality (currently intended to
be gated). Those facts materially change the analysis.

The largest risk is FDA intended use. The January 2026 FDA materials say that
patient/caregiver recommendation software does not qualify for the statutory
non-device CDS exclusion merely because it is informational. The updated
general-wellness guidance allows some disease-related healthy-lifestyle claims,
but limits them to accepted healthy-lifestyle associations and distinguishes
them from diagnosis, monitoring, medical management, and other clinical
intended uses. Its discussion of physiologic-output products also treats
clinical thresholds and disease-specific clinical functionality as warning
signs. Revora expressly targets prediabetes, uses the clinical A1C thresholds
`5.7%–6.4%`, and changes meal classifications based on the user's A1C band. A
footer cannot determine device status.

The second major risk is FTC substantiation. “No benefit claim” is not an
accurate description of the product. `SAFE`/“Clear,” “Be careful,” “Hold off,”
“lower impact,” “one swap helps most,” and claims that guidance is designed for
people with prediabetes can convey objective health-benefit or safety messages.
Those implied claims need a reasonable basis before dissemination. The current
evidence pack is a useful bibliography and claims boundary, but it is not yet a
product-specific substantiation dossier validating Revora's A1C-banded
classification rules or longitudinal outputs.

**Panel launch posture:**

- **Hard block** benefit-implying, reversal, glucose-impact, “safe meal,” and
  outcome marketing.
- **Hard block** paid launch until the operating entity, actual refund policy,
  clickwrap/acceptance flow, and final Terms are complete.
- **Hard block** account-based health-data launch until the privacy policy,
  consent/withdrawal UX, processor disclosures, state health-data analysis, and
  incident plan are completed.
- **Keep off** longitudinal insights and photo-assist until FDA counsel reviews
  the actual function, labeling, and evidence—not merely the architecture.
- If the owner wants an earlier public release, give outside FDA counsel a
  separately specified fallback: guest-only, no health-data persistence, no
  subscription, no longitudinal insight, no photo input, and general healthy-
  eating education that does not vary recommendations by a clinical A1C
  threshold. Counsel, not this panel, must clear that fallback.

## Question-by-question opinion

### Q1 — FDA SaMD classification

**Opinion: unresolved and high enough to require specialist counsel before
launch. Do not state that Revora is “not a medical device.”**

Factors supporting a lower-risk/general-wellness argument:

- non-invasive software;
- qualitative outputs rather than glucose values, drug doses, or treatment
  plans;
- dietary-choice coaching and user control;
- escalation to a clinician outside the supported range.

Factors cutting strongly the other way:

- the intended audience is defined by a named clinical condition;
- the product ingests an individual laboratory value and clinical thresholds;
- the A1C band changes the level of caution applied to the same meal;
- outputs are patient-facing recommendations used immediately to decide whether
  or how to eat a meal;
- `SAFE`/“Clear,” “Be careful,” and “Hold off” are directive classifications,
  even without a numeric glucose prediction;
- labeling across the legacy brand document repeatedly connects use to
  prediabetes reversal and future test results.

The FDA's January 2026 CDS guidance says software recommendations to patients
or caregivers are not within the HCP-only non-device CDS criteria. The January
2026 general-wellness guidance recognizes disease-related lifestyle coaching in
some circumstances, but Revora's clinical thresholds, disease-specific
functionality, and patient-specific caution logic make reliance on that policy
uncertain. “Informational only” is evidence about intended use; it is not a
safe harbor.

**Line-crossing examples:** predicted glucose/A1C changes, a personalized GL or
carbohydrate target, treatment or prevention framing, medication advice,
diagnostic interpretation, replacement of clinician/CGM judgment, autonomous
clinical alerts, or recommendations whose error could cause clinically
significant harm.

### Q2 — FTC substantiation

**Opinion: reject the premise that current copy needs no substantiation.**

FTC analysis turns on the express and implied net impression. Revora's current
function can imply that it reliably identifies meals that are safer or riskier
for a person with a particular A1C and that suggested swaps improve blood-sugar
impact. Those are objective health-related messages even if the app never says
“lower your A1C.” They need substantiation that matches the specific claim and
the product as used.

Before launch, build a claim-evidence matrix for every classification label,
reason, swap, sequence suggestion, insight, paywall promise, store statement,
and support macro. Public-health guidance can support general nutrition
education; it does not automatically validate a proprietary product's
patient-specific classifications. Future “lower,” “prevent,” “reverse,”
“normal at every test,” “predicted spike,” “exact impact,” or success-rate
claims require substantially stronger, product-relevant evidence and may also
alter the FDA intended-use analysis.

### Q3 — Disclaimer and placement

**Opinion: the full disclaimer is a sensible disclosure, but it does not cure
device status or an otherwise misleading health claim.**

Use the full wording next to substantive results and at decision points where a
reasonable user could treat the output as personalized health guidance. Keep it
readable and prominent. A privacy page is not a substitute for result-level
placement.

The short `“Not medical advice.”` wording on `429`/`503` states is acceptable
because those transient states provide no classification or recommendation;
indeed, no medical disclaimer is legally necessary on a pure service error.
The middleware divergence should not be treated as a material launch defect.
What matters is that no error or fallback path accidentally returns substantive
guidance without the full disclosure.

### Q4 — Parallel-launch risk

**Opinion: do not approve the current account/subscription product for parallel
launch while FDA scope remains open.**

A kill switch limits future exposure but does not undo distribution, consumer
reliance, billing, data collection, or misleading labeling that already
occurred. Public launch should hard-block on any of the following:

1. no written FDA intended-use analysis of the actual product;
2. disease-outcome or reversal copy on any active acquisition/store/product
   surface;
3. incomplete contracting party, refund policy, or Terms assent;
4. incomplete health-data privacy disclosures and processor/incident plan;
5. photo-assist or longitudinal outputs enabled before their function-specific
   review;
6. a substantiation gap for any active health-benefit or safety claim.

### Q5 — Longitudinal insights and SaMD

**Opinion: the rule-based implementation does not make the issue disappear.
Keep it off pending FDA review.**

The current insight—`“Most of your 'be careful' meals are breakfast — that's
where one swap helps most this week.”`—does not diagnose or predict a lab
result. Standing alone, it resembles low-risk coaching. In context, however,
it aggregates classifications already personalized by A1C and turns them into
an ongoing recommendation. That strengthens the inference that Revora monitors
condition-specific behavior and guides management over time. “Rule-based”
versus “AI-generated” is not the controlling legal distinction; intended use,
function, output, and risk are.

### Q6 — GDPR Article 9 consent

**Opinion: do not approve the current checkbox as GDPR-complete.**

The existing text is clear and unchecked by default, which is good. It is still
incomplete because it:

- does not identify the legal controller;
- describes storage but not all collection, analysis, disclosure, and transfer;
- omits the OpenAI recipient/processor category and international-transfer
  context;
- bundles history, insights, and progress without identifying which purposes
  are necessary or optional;
- does not expressly say the user may **withdraw consent**;
- makes account deletion the only withdrawal mechanism, which is not as easy as
  checking one box and also terminates the service relationship;
- does not link the privacy notice at the consent point;
- does not supply the rest of the Article 13 information, retention, rights,
  complaint route, or controller contact details.

Suggested intake copy, subject to entity and data-flow completion:

> I explicitly consent to **[LEGAL ENTITY]** collecting and using my A1C and
> meal information (health data) to provide meal checks, saved history,
> progress, and personalized insights. Revora sends each submitted meal and A1C
> to OpenAI to generate a response and stores my A1C and saved meal text in
> encrypted form. I can withdraw this consent at any time in Account → Privacy
> without affecting earlier lawful processing; I can continue in guest mode
> without saved history. See the Privacy Notice for recipients, retention,
> transfers, and my rights.

Use a separate opt-in for reminders/push. Provide a one-action “withdraw health
data consent and erase saved health data” control distinct from full account
deletion. A US-only launch does not become “GDPR compliant” merely by using an
Article 9 checkbox; if Revora offers the service to people in the EEA or
monitors them there, counsel must address territorial scope, Article 6 plus
Article 9 bases, a DPIA, processor terms, transfers, and any representative/DPO
requirements.

### Q7 — Refunds, negative options, and Play policy

**Opinion: not approved; the policy is unfinished and one statement is too
absolute.**

- The Stripe macro still contains a placeholder. Stripe is the payment
  processor; Revora must state its own merchant refund policy.
- “Refunds for Play purchases go through Google directly” is overbroad. Google
  offers a consumer refund route, but developers can also issue refunds and
  applicable law may require them. Say “Start with Google Play; if it cannot
  resolve the request, contact Revora.”
- Define a concrete web refund window, method, processing time, exclusions, and
  handling of duplicate/unauthorized charges, outages, and statutory rights.
- Show price, billing interval, trial length and conversion date/amount,
  auto-renewal, cancellation method, and refund terms clearly before obtaining
  billing consent.
- Preserve the current direct online cancellation path and test it end to end.

The 2024 federal “Click-to-Cancel” rule was vacated in 2025. As of this review,
the FTC is conducting a new rulemaking; the FTC Act and ROSCA still support
clear disclosure, express informed consent, and a simple cancellation
mechanism. State automatic-renewal laws may impose additional requirements.
Google Play separately requires transparent subscription terms and an easy
online management/cancellation route.

### Q8 — Reversal lines

**Opinion: kill all three lines and do not approve the proposed user-as-agent
sentence as the ceiling.**

Grammar does not control net impression. `“You reverse it,”` `“Start my
reversal,”` and `“Reversal is achieved through your dietary choices — Revora
gives you the clarity to make them”` still connect Revora use to a disease
outcome. The broader legacy document contains many stronger claims—including
`“Normal at every test,”` a `90-day` reversal narrative, personalized GL
thresholds, predicted spikes, and claims that users are already reversing
prediabetes. Keeping the file marked “superseded” reduces but does not eliminate
the risk of reuse.

Approved lower-risk replacements:

| Risky line | Replacement |
| --- | --- |
| `Know what to eat. You reverse it.` | `Clearer meal choices, one at a time.` |
| `Revora gives you everything you need — you're the one who reverses your prediabetes...` | `Revora turns meal details into a clear, practical next step.` |
| `Most people who stay consistent reverse their own prediabetes within a year...` | `Start with one practical meal choice today.` |
| Proposed “user-as-agent” ceiling | `Revora provides general information to help you make more informed meal choices.` |

Add the legacy positioning and archive paths to the claims scanner or move them
into a clearly access-controlled research archive so they cannot seed generated
ads, store listings, support copy, or investor claims.

### Q9 — Imaging input

**Opinion: the brief is stale. Photo-assist is built in this repository and is
described as gated, not merely forward-looking. Keep the production flag off.**

An image input is not automatically a device. Confirm-before-verdict, no image
retention, and routing the confirmed text through the same engine reduce error
and privacy risk. They do not change the intended use of the final
recommendation. The risk increases materially if the vision system identifies
clinically significant facts autonomously, estimates portions or nutrients
presented as clinical measurements, predicts physiology, bypasses meaningful
confirmation, triages a condition, or directly controls a treatment/management
decision.

The binding dietitian-graded evaluation described in the plan is also not shown
as complete. Counsel review and the safety evaluation should both clear before
enabling the feature or mentioning photo-based results in store/marketing copy.

### Q10 — Terms of Service

**Opinion: not approved for paid or public account launch.**

The brief points to `app/terms/page.tsx`, but the current route is
`app/(app)/terms/page.tsx`. The draft exists and has these blockers:

- operating entity and governing law/venue remain placeholders;
- `support@revora.app` is only an environment fallback and may not be an active
  monitored address;
- the statement `“Revora is not a medical device”` is an unsupported legal
  conclusion and should be replaced with a factual intended-use limitation;
- the refund clause incorrectly refers to a “Stripe policy” rather than
  Revora's policy;
- there is no verified clickwrap/assent record, Terms version, or acceptance
  timestamp in the reviewed materials;
- the liability clause excludes only indirect/incidental/consequential damages,
  has no negotiated direct-damages cap, and lacks jurisdiction-specific
  carveouts and exclusions that actual counsel should draft;
- change/termination language needs notice mechanics and treatment of prepaid
  subscriptions;
- the agreement should address feedback, third-party services, export/sanctions
  where applicable, survival, severability, assignment, and the complete
  agreement—not merely IP and availability.

Do not paste generic arbitration, class-waiver, indemnity, or liability language
without a jurisdiction and business-entity decision. Final counsel should make
those choices and ensure the purchase screen, Terms, privacy notice, refund
policy, Play listing, and support macros match.

## Additional issues the brief does not adequately ask

### Privacy policy is not launch-ready

The public privacy page is admirably plain but materially incomplete for a
stateful health app. It lacks the controller/entity identity, effective date,
contact/address, retention schedule, complete service-provider/recipient list,
legal bases, jurisdictional rights/request and appeal mechanics, cross-border
transfer disclosure, and a health-data incident notice description. It also
says `“That is everything Revora asks for”` before later describing pantry
photos and notes, and `“keep anything after you delete your account”` despite a
hashed deletion log and possible provider/legal retention. Those absolute
statements should be corrected.

List the relevant processors/categories and actual purposes, including hosting,
database, OpenAI, authentication email, payment providers, push delivery,
monitoring/error reporting, and analytics. Encryption at rest is a security
control, not a substitute for consent, minimization, retention, or breach
response.

### US health privacy needs its own workstream

HIPAA does not automatically govern a direct-to-consumer app, but that does not
mean the data is unregulated. Determine whether Revora is a vendor of personal
health records or related entity under the FTC Health Breach Notification Rule,
including the “technical capacity to draw from multiple sources” test. Create a
written HBNR applicability memo and incident-notification runbook.

Washington's My Health My Data Act can require a dedicated consumer-health-data
privacy policy, specified-purpose consent, processor controls, access/deletion/
withdrawal rights, and an appeal process. Complete a state-law applicability
matrix before a nationwide US launch; do not assume a small startup is exempt.

### Brief and source truth have drifted

The brief says photo-assist is “NOT built,” while current plans and source show
it was built and gated. It also names a pre-route-group Terms path. Counsel must
receive a generated feature/data/claim inventory from the launch commit, not a
static narrative that can lag implementation.

## Required remediation and evidence

| Priority | Owner | Required evidence before clearance |
| --- | --- | --- |
| P0 | FDA regulatory counsel | Written intended-use/device analysis based on live screens, prompts, outputs, longitudinal insight, photo flow, claims, and store listing; approved labeling boundary |
| P0 | Product + marketing | Removal of all active reversal/outcome/clinical-threshold marketing; repository-wide claim inventory and net-impression review |
| P0 | Corporate/commercial counsel | Legal entity, jurisdiction, final refund policy, final Terms, monitored contact, clickwrap and versioned assent evidence |
| P0 | Privacy counsel | US state-law matrix; final privacy notice; complete processor/transfer map; consent and withdrawal UX; HBNR scope memo and incident plan |
| P0 | Product/ops | Longitudinal and photo flags proven off until their gates clear; no store copy advertising disabled features |
| P1 | Evidence/clinical | Product-specific claim-evidence matrix and validation protocol for each classification, swap, sequence, and insight |
| P1 | Billing/QA | Captures of pre-purchase disclosures, express consent, cancellation, refund handling, renewal notices, and Play management link on real devices |
| P1 | Documentation | Correct the counsel brief's stale photo status and Terms path; generate a launch-commit evidence bundle for outside counsel |

## Primary authorities checked

- FDA, [Clinical Decision Support Software — Final Guidance (January 2026)](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software)
- FDA, [General Wellness: Policy for Low Risk Devices — Final Guidance (January 2026)](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-wellness-policy-low-risk-devices)
- FTC, [Health Products Compliance Guidance](https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance)
- FTC, [Negative Option Rule docket and 2026 rulemaking status](https://www.ftc.gov/legal-library/browse/rules/negative-option-rule)
- FTC, [2026 negative-option status: FTC Act, ROSCA, and current rulemaking](https://www.ftc.gov/business-guidance/blog/2026/03/do-you-have-thoughts-negative-option-related-regulations-share-them-ftc)
- FTC, [Complying with the Health Breach Notification Rule](https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0)
- EUR-Lex, [General Data Protection Regulation — Articles 7, 9, 13, 17, 20 and 22](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)
- Washington Legislature, [My Health My Data Act, chapter 19.373 RCW](https://app.leg.wa.gov/RCW/default.aspx?cite=19.373&full=true)
- Google Play, [Subscriptions policy: disclosure, management, cancellation, and refunds](https://support.google.com/googleplay/android-developer/answer/9900533?hl=en)

## Panel sign-off

| Persona | Disposition |
| --- | --- |
| FDA Digital Health | **Do not launch current function without specialist opinion** |
| FTC Advertising/Subscriptions | **Claims and refund policy not cleared** |
| Privacy/Health Data | **Stateful data posture not cleared** |
| Product/Platform/Commercial | **Terms and paid flow not cleared** |
| Acting GC | **RED; remediate P0 items and send launch-commit evidence to licensed counsel** |
