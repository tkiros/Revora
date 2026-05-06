# Revora Copy Ledger

## Purpose

This ledger tracks every active or planned product, prompt, result, and launch
string against the approved claims boundary. The validator only scans rows that
are both approved and active so policy documents can still record banned
language safely.

## Approval Rules

- `Status` shows whether the row is still draft, approved, or retired.
- `Active` shows whether the row is part of the current MVP surface.
- `Allowed Claim Class` must match a class in `claims-boundary.md`.
- `Evidence Rows` points to the evidence pack rows that justify the narrow
  allowed-use statement behind that string.

## Ledger

| Copy ID | Surface | Status | Active | Allowed Claim Class | Copy | Evidence Rows | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `product-home-hero` | Product | Approved | Yes | `product-role` | Revora gives informational-only food guidance for people using a prediabetes-range A1C of `5.7%` to `6.4%`. | CDC-A1C-RANGES, NIDDK-A1C-INTERPRETATION | Approved MVP product positioning. |
| `prompt-a1c-scope` | Prompt | Approved | Yes | `prompt-scope` | Enter a food or meal plus an A1C from `5.7%` to `6.4%` to get informational-only meal guidance. | CDC-A1C-RANGES, NIDDK-A1C-INTERPRETATION | Active intake copy for the supported scope. |
| `result-footer` | Result footer | Approved | Yes | `disclaimer-footer` | Revora is informational only and is not medical advice. Talk with a doctor or registered dietitian for guidance that is specific to you. | FDA-GENERAL-WELLNESS, FTC-HEALTH-COMPLIANCE | Stable footer for every in-scope result. |
| `below-range-route` | Result route | Approved | Yes | `out-of-scope-routing` | Revora is designed for the prediabetes A1C range of `5.7%` to `6.4%`. This value sits below that range, so use a doctor or registered dietitian for guidance that is specific to you. | CDC-A1C-RANGES, NIDDK-A1C-INTERPRETATION | Out-of-scope route for inputs below `5.7%`. |
| `high-range-route` | Result route | Approved | Yes | `out-of-scope-routing` | This A1C value falls in a range used for diabetes and is outside Revora's prediabetes-only MVP. For personalized next steps, talk with a doctor or registered dietitian. | CDC-A1C-RANGES, NIDDK-A1C-INTERPRETATION | Out-of-scope route for inputs `6.5%` or above. |
| `launch-community-post` | Launch | Approved | Yes | `launch-informational` | Revora is a cautious MVP that offers informational-only meal guidance for people using a prediabetes-range A1C. | FDA-GENERAL-WELLNESS, FTC-HEALTH-COMPLIANCE, CDC-MEAL-PLANNING | Approved short launch description. |
