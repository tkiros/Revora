# Revora owner-risk launch decision — candidate `5f6abcb`

**Recorded:** 2026-07-12

**Code candidate:** `5f6abcb31c175fdc6840b74c2c602dc5b3fc7ad8`

**Evidence/documentation commit before this decision:**
`72a9190fd124636060d0b55a4c3af9eb3bf67af0`

## Decision

On 2026-07-12, the authenticated workspace owner stated that the business
cannot afford professional counsel, launch speed is important, and Revora
should proceed using the information and evidence already assembled.

**COUNSEL REVIEW: WAIVED BY OWNER**

**COUNSEL GATE: NOT CLEARED**

**OWNER-RISK LAUNCH GATE: ACCEPTED**

This record replaces professional review as an internal operational launch
prerequisite. It is an owner waiver and risk decision, not a legal opinion,
attorney-client advice, regulator determination, or finding of compliance.

## Scope of the decision

The owner-risk decision covers the locally verified candidate's constrained
core product:

- guest text and reviewed voice-to-text meal descriptions;
- qualitative educational meal-pattern labels, reasons, adjustments, and
  alternatives within the active claims boundary;
- A1C context that changes presentation caution only and does not claim an
  individualized prediction or medical suitability determination;
- accounts, consent-bearing saved checks, history, behavior-only progress,
  reminders, health-data erasure, and account deletion, subject to real
  preview/production proof.

It does not authorize these functions:

- Meal photo-assist stays **OFF**. `NEXT_PUBLIC_PHOTO_INPUT` must remain unset.
- Longitudinal insights stay **OFF**.
  `NEXT_PUBLIC_LONGITUDINAL_INSIGHTS` must remain unset.
- No advertising or paid promise may imply that either disabled function is
  available.

Enabling either disabled function requires a function-specific evidence
review, an explicit written owner decision, a new reviewed build, and new
deployment proof.

## Paid launch remains separately fail-closed

This decision does not authorize `LEGAL_TERMS_FINAL=1`. Web subscription,
trial, Google Play, and Pantry purchase entry points must remain closed until
the owner supplies and approves all of the following without placeholders:

- real legal operating entity/person and consumer-contact address;
- launch jurisdiction, governing law/venue, and merchant/contracting party;
- final refund, renewal, cancellation, and channel-role choices;
- monitored support inbox and named refund/privacy/incident owners;
- live Terms and Privacy rendering for the exact candidate;
- verified current-version assent records and real paid/cancel/refund flows.

Engineering may not invent these business facts or treat this waiver as their
substitute.

## Known regulatory and legal uncertainty accepted by the owner

The owner accepts proceeding without an independent opinion addressing:

- FDA intended-use/device uncertainty for patient-facing health software and
  whether every active net impression remains within a low-risk general
  wellness boundary;
- FTC claim-substantiation and deceptive-practice risk;
- FTC Health Breach Notification Rule applicability to the app's health data,
  vendors, unauthorized access, and disclosures;
- state consumer-health-data, privacy, consent, processor/transfer, retention,
  deletion, and incident-notification obligations;
- contract formation, renewal, cancellation, refund, merchant, venue, and
  platform-specific requirements.

Current primary-source background retained for this decision:

- FDA, *Clinical Decision Support Software: Guidance for Industry and Food and
  Drug Administration Staff* (January 2026):
  https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software
- FDA, *General Wellness: Policy for Low Risk Devices* (January 2026):
  https://www.fda.gov/media/90652/download?attachment=
- FTC, *Health Breach Notification Rule*:
  https://www.ftc.gov/legal-library/browse/rules/health-breach-notification-rule
- FTC, *Complying with FTC's Health Breach Notification Rule*:
  https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0

These sources inform containment; they do not decide Revora's legal status.

## Gates not closed by this decision

- No preview or production deployment/proof exists for this candidate.
- Migrations `0003` and `0004` are not proved in preview or production.
- Real authenticated database, consent withdrawal/erasure, email, reminders,
  Stripe, Play, Pantry, cancellation, and refund flows are not proved live.
- Real entity, address, jurisdiction, support, merchant, and incident-owner
  facts remain incomplete.
- Live-model safety, clinical/dietitian validation, key/provider readiness, and
  other current-main launch controls remain separate.

## Record integrity

This record may be amended only by a later dated owner decision tied to an
exact candidate SHA. It must never be renamed or summarized as licensed-counsel
clearance.
