# Meal-photo intake checklist — the 40-photo stratum (owner supplies)

**Status: OPEN.** The review protocol bans synthetic photo placeholders (N-30),
so the 240-case corpus honestly covers **200/240** until real, consent-safe
photos exist. Only the owner can close this. This checklist is written so the
owner can just drop files and the next session can wire them in without a
decision meeting.

## Two tiers (owner-ordered amendment, 2026-07-17)

The owner supplied ~100 web-sourced meal photos (Reddit/review-site CDN
provenance, confirmed by filename patterns and download timestamps) and
ordered that feature testing not wait months for consent-clean photos. The
amendment keeps purpose and evidence separate instead of pretending one file
set can serve both:

- **Tier 1 — engineering test set (web-sourced allowed).** Used to exercise
  and debug the photo-draft → checkFood path and to run SIMULATED panels on
  photo outputs. Lives OUTSIDE the repo (never committed — the repo must not
  redistribute third-party images), manifest field
  `"consent": "web-sourced-engineering-only"`. Results are engineering
  findings only: they can find and fix bugs, but they can NEVER be listed as
  corpus coverage or enter the credentialed panel packet. Coverage stays
  **200/240** while only Tier 1 exists.
- **Tier 2 — panel stratum (this checklist, unchanged).** The 40 photos the
  human panel grades. Consent rules below hold verbatim; the `consent` field
  is an attestation inside the evidence chain the panel signs, and it is
  never written falsely. Realistic accumulation paths: (a) the owner
  photographs their own meals as eaten — no dedicated shooting, ~40 in a few
  weeks; (b) friends/family photos with one-line written consent; (c) once
  the app has beta users, in-app photo submissions behind an explicit
  QA-consent checkbox — the cleanest long-term source.

## Per-photo requirements (all must hold)

- [ ] **Consent:** you took the photo yourself, or the person who did has
      given written consent for QA/review use. No scraped or stock images.
- [ ] **No faces.** Crop or reshoot; partial faces count.
- [ ] **No PII in frame:** no names, mail, screens, receipts, prescription
      bottles, house numbers, license plates, reflective surfaces showing a
      person.
- [ ] **No minors' plates identifiable as such** (birthday-cake-with-name
      class).
- [ ] **EXIF stripped on intake** (the intake script will strip GPS/serial
      metadata regardless — but don't rely on it).
- [ ] Food is the subject: one meal or plate per photo, roughly centered,
      in focus, real lighting (bad lighting is fine — that's the point of the
      stratum; blur that hides the food is not).

## Stratum mix (40 photos, mirroring DR-05 pre-registration)

| Bucket | Count | What to shoot |
| --- | --- | --- |
| Ordinary home plates | 14 | weeknight meals, breakfasts, leftovers as actually eaten |
| Cultural/mixed dishes | 10 | the same class the text stratum covers (rice/flatbread/noodle-based mixed plates) |
| Restaurant/takeout | 8 | delivery containers, restaurant plating, unclear portions |
| Ambiguous/hard | 8 | partially eaten plates, drinks with unclear sugar, packaged foods with label visible |

## Intake format

Drop files in `docs/qa/dietitian-review/corpus/photos/` named
`p-<bucket>-<slug>.jpg` plus one `photos-manifest.json` row per file:

```json
{
  "id": "p-home-oatmeal-berries",
  "file": "photos/p-home-oatmeal-berries.jpg",
  "bucket": "ordinary_home",
  "consent": "owner-took-photo",
  "a1c": 6.1,
  "notes": "typical breakfast, portion visible"
}
```

The capture harness (`scripts/dietitian-panel/capture-live-outputs.mts`)
extends to photo cases once the manifest exists; until then every report must
keep saying **200/240**.
