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
- `Evidence Rows` stays blank until the evidence pack is finalized.

## Ledger

| Copy ID | Surface | Status | Active | Allowed Claim Class | Copy | Evidence Rows | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `product-home-hero` | Product | Draft | No | `product-role` | Revora gives informational-only food guidance for people using the prediabetes A1C range. |  | Seed product row to approve in Task 1. |
| `prompt-a1c-scope` | Prompt | Draft | No | `prompt-scope` | Enter the meal you want to check and an A1C in the prediabetes range. |  | Seed prompt row to approve in Task 1. |
| `result-footer` | Result footer | Draft | No | `disclaimer-footer` | Revora is informational only and is not medical advice. Talk with a doctor or registered dietitian for guidance that is specific to you. |  | Reusable disclaimer seed. |
| `below-range-route` | Result route | Draft | No | `out-of-scope-routing` | Revora is designed for the prediabetes A1C range, so this result is outside the MVP boundary. |  | Final wording locked in Task 1. |
| `high-range-route` | Result route | Draft | No | `out-of-scope-routing` | This A1C value is outside Revora's MVP range, so use clinician guidance for personalized next steps. |  | Final wording locked in Task 1. |
| `launch-community-post` | Launch | Draft | No | `launch-informational` | Revora is a cautious MVP for prediabetes-range meal decisions. |  | Final wording locked in Task 1 and linked in Task 2. |
