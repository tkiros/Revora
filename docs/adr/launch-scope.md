# ADR: Launch scope — region, audience, pricing, inputs

**Date:** 2026-07-01 · **Status:** Accepted (owner decision; not re-litigated)

## Decision

- **Full build now.** Every §4 feature of
  `docs/production-implementation-plan-2026-07-01.md` ships in this release.
  There are **no** validation/kill gates (WTP smoke test, D1/D7 retention);
  the former gates are ordinary build milestones. Accepted risk, stated once
  in the plan §1: full paid backend + store release before market proof.
- **Exactly three input methods:** Text (ships), Voice (ships),
  **Photo-assist (D5) — deferred**: fully specified in plan §6.3, not built,
  no vision/camera code, no photo marketing. Its counsel + eval ship-gates
  stand for a later release. **CGM correlation is excluded** (post-launch
  increment 1, plan §13) — it is not an input method.
- **Region: US-only launch.** Defers DPIA, EU consent banner, and SCC work;
  GDPR-grade practices (Art. 9 explicit consent, encryption at rest, deletion
  rights) are still built because they are also the right CCPA/Play posture.
  Revisit before any EU rollout.
- **Audience: 18+.** Play target audience = adults; no child-directed
  content or ads (ads = none).
- **Pricing default:** $12.99/mo · $99.99/yr (owner confirms SKUs before Play
  product creation; lifetime deferred). **Free tier:** 5 result-checks/day;
  free keeps daily checks + today view; premium = history + insights +
  progress + nudge + unlimited checks.
- **Voice:** browser Web Speech API only; keyboard-dictation fallback where
  unsupported; **no audio ever reaches Revora servers**.

## Consequences

- Funnel metrics (installs, D1/D7, conversion) are instrumented from day 1 as
  **measurement, not gates**.
- Any deviation from these defaults requires a new note in `docs/adr/`.
