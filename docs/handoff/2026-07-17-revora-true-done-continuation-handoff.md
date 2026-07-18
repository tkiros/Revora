# Continuation handoff — true-done audit, 2026-07-17

Read `docs/handoff/2026-07-17-revora-true-done-audit-remediation-report.md`
first (verdict + evidence). This file is only the resume card.

## Exact state

- Branch `feat/photo-path-tier1`, HEAD `be2c441` (== origin/main at audit
  time). **All session fixes are UNCOMMITTED in the working tree by policy**
  (owner reviews, commits, pushes; main auto-deploys and the owner merges,
  never the agent).
- Session-changed files (safe to commit together as the audit batch):
  `app/layout.tsx`, `app/page.tsx`, `app/(app)/onboarding/page.tsx`,
  `app/opengraph-image.tsx`(new), `app/robots.ts`(new), `app/sitemap.ts`(new),
  `app/api/pantry/submit/route.ts`, `app/api/pantry/process/route.ts`,
  `components/attribution-capture.tsx`(new), `lib/client/attribution.ts`(new),
  `lib/client/analytics.ts`, `next.config.ts`, `tsconfig.json` (de-polluted),
  `tests/unit/revora/{env,seo-meta(new),landing-paywall-copy(new)}.test.ts`,
  `tests/unit/client/{analytics,onboarding-flow,attribution(new)}.test.ts`,
  `tests/unit/server/{pantry-submit,csp-umami(new),pantry-process-route(new)}.test.ts`,
  `tests/smoke/{onboarding,billing-pages,trial-wall}.spec.ts`,
  `docs/ops/env-reference.md`, `docs/qa/21-…manifest…`, `docs/qa/22-…ledger…`,
  the report, this file, and an append-only dated correction in
  `docs/handoff/2026-07-17-wtp-first-reprioritization-handoff.md`.
- Pre-existing user dirty files preserved untouched:
  `docs/handoff/2026-07-12-unconditional-go-handoff.md`,
  `docs/qa/18-simulated-240-panel-2026-07-16.md`, prior untracked handoffs.
  `next-env.d.ts` flips dev/build flavor with the last tool run (benign).

## Fixed (proven locally; details report §7)

R-001 CI-red env test · R-002 OG/sitemap/robots/og-image · R-003 mode-aware
landing pricing + single-sourced price · R-004 attribution (onboarding step +
closed-enum event + first-touch UTM) · R-020 CSP↔Umami · R-021 pantry photo
blob-allowlist · R-022 timing-safe process doorway · R-023 tsconfig
de-pollution · R-008 gate-doc corrections.

## Still open (owner; smallest unblock evidence)

1. Commit/push the batch → CI green run URL on main.
2. Rotate keys (OpenRouter in `openr.md` + 5 in history `213ab8a`) → dated
   attestation note.
3. WTP set: DNS A `revora.bio`; Umami env pair; Tally form + waitlist env;
   UTM-tagged links; pass bar written BEFORE posting.
4. Confirm prod `PAYWALL_MODE` (landing self-matches either value now).
5. Railway crons unstick (G2) → `/api/health` shows 4× `ok`.
6. OpenAI tier or routing decision → one clean-env
   `npm run eval:revora:live` on the prod path (expect 0 harmful-SAFE, 0
   retry cards); artifact under `artifacts/qa/` (force-add, dir gitignored).
7. Stripe H21/H23/H20/H24.
8. Day WTP passes: start panel recruitment + Tier-2 in-app consent photos.

## No-go rules (unchanged, non-negotiable)

- W-05/F-06 closes ONLY via `npm run review:dietitian:close` going green on
  authentic signed reviews — never simulate/backfill/weaken.
- `COUNSEL GATE: NOT CLEARED` stands until licensed counsel writes otherwise;
  checkout-open is owner-risk, and `LEGAL_TERMS_FINAL=0` is the kill switch.
- A WTP test that delivers model food guidance to strangers is a launch, not
  a test — stop and route to the owner (WTP handoff §2).
- Clean env for tests: `env -u REVORA_MODEL -u OPENAI_BASE_URL …`.
- Never claim OpenRouter evidence as OpenAI-direct proof.

## First commands next session

```bash
cd /home/tefera/Desktop/Revora
git status --short && git log --oneline -5
env -u REVORA_MODEL -u OPENAI_BASE_URL npm test
env -u REVORA_MODEL -u OPENAI_BASE_URL npx playwright test
npm run review:dietitian:close   # expect exit 1 until the real panel signs
```

---

## Dated supersession — 2026-07-17 (later same day)

Owner decision (recorded in
`docs/handoff/2026-07-17-owner-risk-full-launch-session-handoff.md`, which is
now the operative handoff): the dietitian panel (W-05/F-06) and the counsel
gate are **no longer launch-blocking** — post-launch tracks on the owner's
full responsibility. The integrity halves of the "No-go rules" above still
stand (never simulate/weaken the close validator; never write "counsel
cleared" until counsel does); only their launch-blocking force is removed.
