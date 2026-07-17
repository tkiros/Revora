# Doc 20 — Tier-1 photo-path engineering run (2026-07-17)

**ENGINEERING FINDINGS ONLY — web-sourced photos, NOT panel evidence.**
Per the two-tier amendment in
`docs/qa/dietitian-review/photo-intake-checklist.md`, this run used 40
owner-supplied web-sourced photos (Tier 1) to exercise the real photo path:
staged 1024px JPEG → `draftFromPhoto` vision draft → `composeDraftText` →
`checkFood`. Corpus coverage remains **200/240**; nothing here enters the
credentialed panel packet. All photo files, manifests, captures, and panel
outputs live OUTSIDE the repo (`~/Desktop/photos/`) and must never be
committed (third-party image redistribution).

## Set composition

40 photos: 14 ordinary home / 10 cultural-mixed / 8 restaurant-takeout /
8 ambiguous-hard. Screened for faces and PII; excluded during screening: a
delivery receipt with courier details in frame, table spreads with multiple
meals, shots with people in the background, and one photo whose source
context made reuse disrespectful.

## Finding 1 (product bug, FIXED): photo drafts exceeded the check input cap

`composeDraftText` had no length bound while `CheckRequestSchema` caps
`food` at `FOOD_MAX_LENGTH` (160). Detailed vision drafts (a thali, a full
breakfast plate) composed 160+ chars → schema-invalid → **fail-closed retry
card for a user who just confirmed the app's own draft**.

- Blast radius, baseline run: **8/40 (20%) retry cards** (both thalis,
  breakfast plate, corned-beef plate, steak salad, tenders+fries, freezer
  prep bags, peanut-butter block) + borderline-length flapping (the same
  photo passed or failed across runs as draft wording varied).
- Fix: `composeDraftText` now degrades detail to fit the cap — full
  portions → names only → fewer items — so glycemic drivers (component
  names) outlive exact counts. Unit tests cover the caught draft.
- Re-run after fix: **40/40 captured, 0 retry cards, 0 errors**
  (39 results + 1 correct clarify on a genuinely unclear fridge bowl).

## Finding 2 (recorded, not chased): photo-path band quality

Simulated panel (pinned judge, 120 verdicts, 0 errors) on the fixed run:

| Metric | Value |
|---|---|
| Dangerous SAFE (majority) | **0** |
| Shaming votes | **0** (120/120 non-shaming) |
| Generic majority | 1 (`p-rest-tenders-fries`) |
| Majority-rejected bands | **3/39** — chow fun, blended drink, steamed pie: product MODERATE, judges unanimous HIGH |

The 3 under-bands are the same single-starch-bowl calibration class already
parked for the human panel (portion-convention questions); recorded, not
tuned.

## Finding 3 (observed): vision-draft variance and misreads

- The ambiguous bucket produced confident misreads (an oat drink drafted as
  an ice-cream sundae; a peanut-butter block as sweet potato; chicken
  piccata as fish). The downstream banding was still cautious-side in all
  cases, but "confidently wrong draft" is a UX risk the draft-review screen
  must carry — the user sees and can edit the draft before checking.
- The same photo yields different drafts run-to-run, so photo-path bands
  have an extra variance layer text inputs don't. Any future photo eval
  gate should account for this (multiple captures or band-range grading).

## Follow-ups

1. Tier-2 (consent-clean) photos still owed for the panel stratum — the
   only path to 240/240 (accumulate organically; checklist has the paths).
2. Consider a worked example or prompt note for composed draft inputs
   (`dish: item (portion), ...` format) if future runs show format-specific
   banding quirks; none required this run.
3. One transient OpenRouter connection error surfaced retry-loop behavior
   in the harness (recovered on re-run); no action.
