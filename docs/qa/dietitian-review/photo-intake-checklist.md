# Meal-photo intake checklist — the 40-photo stratum (owner supplies)

**Status: OPEN.** The review protocol bans synthetic photo placeholders (N-30),
so the 240-case corpus honestly covers **200/240** until real, consent-safe
photos exist. Only the owner can close this. This checklist is written so the
owner can just drop files and the next session can wire them in without a
decision meeting.

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
