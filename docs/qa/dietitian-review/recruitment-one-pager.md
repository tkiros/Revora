# Recruiting the Revora external dietitian panel (W-05/F-06) — one-pager

**What we are asking for.** Three independent, credentialed reviewers to grade
240 frozen outputs of Revora, a consumer app giving educational meal-pattern
feedback (labels "Clear" / "Be careful" / "Hold off") to people who
self-report a prediabetes-range A1C (5.7–6.4%). The app never diagnoses,
treats, doses, or predicts individual glucose response — the review checks
that its outputs actually stay inside that boundary and are nutritionally
sound.

**Who qualifies** (per the locked protocol, `README.md` in this directory):

- 3 reviewers total; at least 2 actively credentialed RDNs; at least 1 dual
  RDN + CDCES;
- credentials verified against the registry (CDR / CBDCE) before review
  starts;
- no undisclosed financial or authorship conflict with the product;
- paid for review time; model identity blinded; no reviewer sees another's
  labels before submitting an independent first pass.

**The work.** 240 cases × 3 reviewers = 720 signed case reviews, each a
12-field structured record (band you'd accept, dangerous elements, required
clinical routing, feasibility, tone). Cases are pre-stratified (ordinary
meals / ambiguous inputs / nutrition-label math / cultural mixed dishes /
clinical-adversarial / meal photos). Expect roughly 3–6 minutes per case
after calibration; the packet ships with a worked rehearsal so calibration is
fast.

**What you get handed on day one** (all already prepared):

- the frozen corpus + captured production outputs (`corpus/`,
  `artifacts/qa/panel-240-live-outputs-*.json`);
- the rehearsal findings brief (doc 17 + doc 18) with the 7 danger cases, the
  8 splits a simulated panel could not resolve, and the one open gate-label
  conflict (`carbs-only-flour-tortilla`);
- the carb-forward ontology change list (v2026-07-16.1) awaiting RD sign-off;
- the eating-disorder route copy and the portion convention
  (`docs/safety/portion-convention.md`) with the three questions the panel
  must answer;
- the signing artifact schema (`panel-review.example.json`) — fail-closed:
  nothing counts as approved until all three reviewers sign unconditional
  votes.

**What this is not.** The simulated rehearsal (LLM personas) does NOT count
toward anything — it exists only to make your work faster. W-05 stays open
until this panel signs.

**Contact / logistics:** owner supplies rate, NDA, and scheduling.
