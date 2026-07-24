# Revora repository-owned Markdown corpus

> Snapshot: `2026-07-23`, local committed source
> `b5c03f4666ea793923482b08fd53c45c037467e7`, plus the seven pre-existing
> nonignored untracked Markdown files present when the audit opened. This is a
> classification inventory, not proof that a document's claims are current.

## Denominator and exclusions

| Classification | Files |
|---|---:|
| Active product, safety, legal, or operations source of truth | 19 |
| Current execution plan or handoff | 11 |
| Historical evidence | 149 |
| Superseded or archive | 44 |
| Research or hypothesis | 23 |
| Test, runbook, or reference | 65 |
| Unknown or conflicting | 9 |
| **Total** | **320** |

The denominator is 313 tracked Markdown files plus seven nonignored untracked
Markdown files. It excludes `.git`, `.next`, `node_modules`, vendored/build/
distribution/coverage/test artifacts, `.claude` worktrees, 133 ignored
`.superpowers` Markdown files, and ignored `openr.md`. The ignored credential
file was not opened.

The following grouping rules are exact and mutually exclusive; together they
classify every file in the 320-file denominator.

## Active source of truth — 19

- `CLAUDE.md`, `DESIGN.md`, and `PRODUCT.md`
- `docs/adr/analytics-umami.md`, `docs/adr/billing.md`,
  `docs/adr/hosting-hybrid.md`, and `docs/adr/stack.md`
- `docs/ops/env-reference.md`, `docs/ops/launch-controls.md`,
  `docs/ops/play-listing.md`, and `docs/ops/support-playbook.md`
- `docs/privacy/data-flow.md`
- `docs/release/truth-index.md`
- all six files under `docs/safety/`

## Current execution plan or handoff — 11

- `TODOS.md`
- all four Markdown files under `fix/260722-2149-service-integrations/`
- `docs/handoff/2026-07-20-revora-end-to-end-promise-and-paid-retention-validation-master-prompt.md`
- `docs/handoff/2026-07-23-revora-e2e-promise-retention-audit-report.md`
- `docs/handoff/2026-07-23-revora-service-integrations-autoresearch-fix-continuation-handoff.md`
- `docs/handoff/2026-07-23-revora-service-integrations-go-closeout-master-prompt.md`
- `docs/handoff/2026-07-23-service-integrations-go-closeout-session1-handoff.md`
- `docs/handoff/human-actions-required.md`

## Historical evidence — 149

- Under `.planning/phases/**`: all 13 summary files and all ten validation,
  verification, or UAT files
- `docs/Revora_90-Day_Distribution_Strategy_Master_Prompt.md`
- `docs/Revora_Video_Engine_Plan.md`
- `docs/build-vs-recommendation.md`
- `docs/direction-validation-2026-07-01.md`
- `docs/production-implementation-plan-2026-07-01.md`
- all seven files under `docs/audit/`
- the 65 files under `docs/handoff/` not classified as current above
- all 11 files under `docs/legal/` except `docs/legal/counsel-brief.md`
- `docs/plans/2026-07-21-c7-four-jobs-plan.md`
- all 30 files under `docs/qa/` except the six reference files classified below
- all six files under `docs/superpowers/plans/` and
  `docs/superpowers/specs/`
- `video-engine/output/2026-07-09/REVIEW.md`

## Superseded or archive — 44

- all 15 `*-PLAN.md` files under `.planning/phases/`
- all 11 files under `PRD/`
- `Revora_Brand_Positioning_v2.md`
- `Revora_PRD_Amendments.md`
- `Revora_Traceability_Matrix.md`
- all 12 files under `docs/archive/`
- `docs/ICP.md`
- `docs/implementation-plan-to-play.md`
- `docs/revora-design-20260404-070350.md`

## Research or hypothesis — 23

- all five `*-RESEARCH.md` files under `.planning/phases/`
- all five files under `.planning/research/`
- `docs/coach-mvp.md`
- `docs/retention_flow.md`
- both files under `docs/content_mate/`
- both files under `docs/growth/`
- both files under `docs/research/`
- all four files under `predict/`
- `video-engine/input/2026-07-09-voc-dump.md`

## Test, runbook, or reference — 65

- `.agents/skills/railway-config/SKILL.md`
- all 41 Markdown files under `agent/agents/` and `agent/skills/`
- `.railway/README.md`
- `docs/legal/counsel-brief.md`
- `docs/ops/device-qa-checklist.md`, `docs/ops/launch-checklist.md`,
  `docs/ops/openai-cost-model.md`, and `docs/ops/play-twa-runbook.md`
- `docs/qa/01-test-strategy.md`
- `docs/qa/test-data-manifest.md`
- all four files under `docs/qa/dietitian-review/`
- all six files under `docs/runbooks/`
- `video-engine/README.md`
- all four files under `video-engine/prompts/`

Counsel and dietitian materials are inventoried here only. They do not decide
any audit verdict.

## Unknown or conflicting — 9

- `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`,
  `.planning/ROADMAP.md`, and `.planning/STATE.md`
- `nexxt_steps_phase2_gaps.md`
- `docs/product-marketing.md`
- `docs/Revora_90-Day_Distribution_Strategy.md`
- `docs/qoutes.md`
- `docs/adr/launch-scope.md`

## Material conflicts

- `.planning/*` still describes a text-only product without accounts,
  persistence, history, or billing and calls the June milestone current.
  Current source contains all of those systems.
- `docs/adr/launch-scope.md` says photo assist is unbuilt/deferred. Current
  source implements it behind a client/server flag pair, and production
  currently renders the control.
- `docs/product-marketing.md` calls itself active while
  `docs/release/truth-index.md` marks it superseded and awaiting quarantine.
- `docs/implementation-plan-to-play.md` says to execute only that file, while
  `docs/production-implementation-plan-2026-07-01.md` explicitly supersedes it.
- `docs/qa/02-traceability-matrix.md` calls the root traceability matrix
  authoritative; that root file marks portions historical and superseded.
- `TODOS.md` says the Umami ADR describes the wrong deployment, but the ADR has
  since been updated to Umami Cloud.
- Dirty `docs/retention_flow.md` recommends withholding annual promotion and
  testing a lower price, while active marketing and billing expose monthly and
  annual offers. The dirty file is a hypothesis, not commercial authority.
- Earlier “unconditional GO,” “flawless,” and “true done” documents are
  historical claims contradicted by newer partial/no-go/open-gate evidence.
- The earlier 408-file manifest used a different denominator that included
  ignored generated artifacts; it is not comparable to this 320-file corpus.
- Four files in `docs/handoff/` contain BCB/foreign-project evidence and cannot
  support Revora claims:
  `2026-06-21-mdp-phase0-1-DONE-phase2-handoff.md`,
  `2026-07-02-sgw-tew-audit-to-unconditional-GO-handoff.md`,
  `session-handoff-2026-06-20-tier2-merge-deploy.md`, and
  `sgw-modularization-phase012-handoff-2026-06-21.md`.
- `nexxt_steps_phase2_gaps.md` mixes old Revora notes with an unrelated
  Bitquery/Helius request.
- The July 20 master prompt authorizes fixes. The active conversation's
  report-only rule supersedes that authorization.
