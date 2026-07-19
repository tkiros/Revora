# Session Handoff — Value & Retention Plan Execution (2026-07-19)

**Use:** paste/point a new Claude Code session at this file to continue the work. It is the authoritative record of what was executed from `docs/handoff/2026-07-18-revora-100-value-95-retention-validation-and-implementation-plan.md` ("the plan"), what state the repo is in, and the exact ordered actions remaining to reach true done.

**Status:** Phases 1–4 engineering COMPLETE + externally-reviewed + remediated. **PR #19 open.** Phase 0 DEFERRED by owner instruction. Phases 2.6, 5, 6 are human-gated: protocols authored, execution pending humans.

---

## 1. What was done

### Branch and PR

- Branch: `feat/value-retention-plan-2026-07-18` (base `a5424b1`, on top of `qa/launch-live-smoke-2026-07-18`).
- **PR #19: https://github.com/tkiros/Revora/pull/19** (head `fc8417f`, pushed). ~33 commits, 170+ files, +36k lines.
- Durable execution ledger: `.superpowers/sdd/progress.md` (section "feat/value-retention-plan-2026-07-18") — per-task commits, review outcomes, remediation record. Trust it over memory.
- One commit (`c91fb4b`, "Spruce Bento" home-hero/result-card redesign) came from a **concurrent human session sharing this checkout** — not part of the plan execution, but included in the PR.

### Phase 1 — first promise reproduces (T1–T6)

| Done | Where |
|---|---|
| Single boundary-copy source + drift tests; fixed REAL high-range copy drift in onboarding + profile route (ledger wins) | `lib/revora/boundary-copy.ts`, `tests/unit/revora/boundary-copy-drift.test.ts` |
| Promise registry + honest two-step oatmeal demo (clarify → answer); deploy-blocking fixture test runs the real precheck | `lib/revora/promise-registry.ts`, `app/page.tsx`, `components/demo-check-card.tsx`, onboarding |
| Word-boundary ambiguity + resolution guards + ONE-clarification cap (suppresses only the question, never floors/clinical); clarify metrics (bounded enums) | `lib/revora/input-precheck.ts`, `lib/revora/clarify.ts` |
| Photo method survives every read path (`normalizeInputMethod`); honest draft truncation/dedupe/empty states | `lib/client/history-store.ts`, `lib/client/photo-draft.ts` |
| Result-linked feedback `check_feedback` + admin safety queue (oldest-first) | `app/api/feedback/*`, `/admin/feedback`, migration 0005 |
| Stratified eval corpus: 60 cases / 10 strata, zero-wrong-SAFE hard gate, `known_gaps` (bbq-sauce, leftover-curry) — ENGINEERING evidence only | `tests/fixtures/revora-eval-cases.json`, `tests/evals/` |

### Phase 2 — pricing/history/entitlement truth (T7–T11)

| Done | Where |
|---|---|
| No prices rendered without server authority; pending/retry states; strict zod contract | `lib/client/paywall-config.ts`, `components/paywall-card.tsx`, `trial-wall.tsx` |
| Stripe self-healing: durable `billing_event_inbox` (mig 0006), FOR-UPDATE idempotent order-tolerant reducer, `refunded` + `expired` terminal guards, verify-on-read (stale+1h-gated, incl. check route), reconcile cron + route, post-commit email dispatch, "access is syncing" UI | `lib/server/billing/{inbox,reconcile}.ts`, `app/api/billing/handlers.ts`, `lib/server/entitlement.ts`, `app/api/cron/stripe-reconcile/` |
| Full cross-device history: keyset pagination, POST-body search (no meal text in URLs — hard rule), UTC date filter, export = data right (all tiers, all rows), owner-scoped per-check delete + local tombstone | `app/api/history/handlers.ts`, `app/(app)/history/page.tsx`, `lib/client/remote-history.ts` |
| Single capability matrix, server-enforced; paywall bullets pinned to matrix truth; unshipped "weekly insights" promises removed; thin insight FREE (recorded decision) | `lib/server/capabilities.ts`, `/api/entitlement` |
| Error truth: outage never renders as upsell/empty (progress 6-state resolver, account, daily-loop, history) | `lib/coach/progress-state.ts`, `lib/client/account-load-state.ts` |

### Phase 3 — Personal Meal Memory (T13–T16, **flag-gated OFF**)

- Immutable encrypted check snapshots (card, clarify Q&A, versions, floor metadata; append-only; mig 0007).
- `meal_memories` (mig 0008): user-authored fields, gate order flag 404 → auth 401 → capability 403; engine non-interference enforced by source-scan test (`lib/revora` imports no memory module).
- Exact-match recall panel (POST body, bounded scan) + one-tap re-check via `revora.recheck` (engine stays history-independent).
- Memory controls: POST-body search, whitelist-merge edit, delete one/all, export (**auth-only — data right, no tier/flag gate**), health-data withdrawal coverage.

### Phase 4 — 90-day Learning Journey (T17–T20, **flag-gated OFF**)

- Pure derived-stage state machine (pause-frozen day math, no hidden reset, CAS on transitions → 409; mig 0009, 0012).
- Deterministic versioned weekly learning artifact (no model call, no health score; encrypted lazy persistence w/ consent guard + source-mutation invalidation; mig 0010); replaces BAI surface when flag on, BAI falls back whenever the summary doesn't render.
- Journey-aware nudges: trigger classes, cadence + quiet hours (mig 0011), stop rules (graduated/paused/14-day inactivity), tone-tested copy bank, `nudge_opened` emitted via `?nudge=` read-and-strip.
- Graduation/pause/maintenance: four honest paths at day 90, bounded pause reasons, atomic graduate→maintenance, cancellation independence, zero dark patterns (copy-tested).

### Human-gated protocols authored (PENDING HUMAN EXECUTION)

- `docs/research/meal-memory-concierge-protocol.md` — Phase 2.6 discovery gate (verbatim go/no-go: ≥5 of 8 completers recall ≥2× AND continue at disclosed price).
- `docs/research/retention-cohort-preregistration.md` — P4.5/4.6 cohort pre-registration (A1C band = analysis-only stratum; survivor-bias denominators; no annual claim before D365).
- `docs/growth/private-sharing-validation.md` + `docs/growth/distribution-prerequisites-and-channel-gates.md` — Phase 5 (channel gates, precommitted 14-day branches, IG/TikTok owner-ratification slots).
- `docs/release/truth-index.md` — claims-to-truth table, two-column flag ledger (code default vs prod state), Phase 6 evidence checklist, deferred-Phase-0 register. **This is the §P0.5 source-of-truth artifact.**

### External review remediation (post-PR)

An external review raised 20 findings. Three independent verifiers confirmed **19, rejected 1** (U5: UTC-naive date filters — documented accepted tradeoff, kept as follow-up). Fixed in `a2751b5` (server: billing concurrency B1–B4, privacy erasure E2–E5, journey CAS, week-end timezone, queue order) and `fc8417f` (client: awaited safety feedback, delete tombstone, Play-restore decoupling, clarify commit-after-success, memory pagination, week-strip source, nudge rollback, BAI fallback). Adversarial re-review: all 19 CLOSED, Approved. Suite: **1768 passed / 2 skipped**; typecheck/lint/contract/eval green.

---

## 2. Current repo state and cautions

- **Shared checkout:** a concurrent session works in this same directory. Uncommitted foreign files (`.gitignore` `.gstack/` line, `next-env.d.ts`, untracked `docs/handoff/2026-07-18-*.md`) belong to it — DO NOT commit, reset, stash, or checkout them. Always stage by explicit path.
- Migrations 0000–0012 committed and applied by the PGlite test-db helper (`tests/helpers/test-db.ts`).
- All Phase 3/4 features are OFF: `MEAL_MEMORY_ENABLED` / `NEXT_PUBLIC_MEAL_MEMORY`, `LEARNING_JOURNEY_ENABLED` / `NEXT_PUBLIC_LEARNING_JOURNEY` unset. Flag ledger + enablement gates: `docs/release/truth-index.md`.
- Playwright/e2e was NOT run in this effort (vitest-only gates). `tests/smoke/billing-pages.spec.ts` annual assertions changed (T7) — needs a real-env run.

---

## 3. Exact next actions to reach true done

### A. Immediate (this week, mostly human/ops)

1. **Merge PR #19** after human review — https://github.com/tkiros/Revora/pull/19. Note c91fb4b (concurrent design work) rides along; confirm the other session is done with it.
2. **Register the `stripe-reconcile` cron** in the Railway hourly scheduler (route exists: `app/api/cron/stripe-reconcile`; env notes in `docs/ops/env-reference.md`). Without this, inbox retry + reconciliation sweeps never run — the self-healing guarantee is inert.
3. **Run Playwright smoke on a provisioned env**, minimum `billing-pages.spec.ts` (annual pricing assertions) and the onboarding/mobile-check specs touched during execution.
4. **Execute Phase 0** (was deferred; plan §P0.1–P0.5 — pass criteria also in `docs/release/truth-index.md` §deferred-Phase-0 register):
   - P0.1 DNS/TLS for `revora.bio` + remove Vercel SSO from public surface + external synthetics (pass: public HTTPS from two networks, 24h green).
   - P0.2 Resend domain verification + magic-link E2E (initial/resend/expired/reused link; pass: ≥99% acceptance, seeded Gmail/Outlook inboxes receive).
   - P0.3 Deploy Umami (or drop the claim); closed event allowlist already implemented client-side; add env validation that fails deploy when measurement expected but unconfigured; privacy review of the data map.
   - P0.4 Deliverable, monitored support address + in-account help/refund path with case IDs and SLAs.
   - P0.5 Quarantine stale claims — the claims-to-truth table in `docs/release/truth-index.md` lists every drifted doc (notably `docs/Revora_90-Day_Distribution_Strategy.md` SCRIPT 1 lines 327/225/268 still promise the false immediate-oatmeal answer → rewrite to the two-step flow).

### B. Code follow-ups (small, non-blocking; from review minors)

5. Guard `expired` (not just `refunded`) on the two Stripe heal write paths (`lib/server/billing/reconcile.ts`, `lib/server/entitlement.ts`) — mirrors the B2 terminal guard.
6. Invalidate weekly reflections on memory **upsert** too (currently: edit/delete/delete-all only) — `app/api/memory/handlers.ts`.
7. Surface `searchScanned`/`searchCapped` in memory + history search UIs (silent truncation past cap).
8. Precheck clarify rule for bare "leftover X" (eval `known_gaps`: leftover-curry) + sugary-condiment ontology decision (bbq-ribs) — RD-gated.
9. Optional hardening backlog (accepted-for-now): dunning-email re-send sweep; `few_per_week` hard 3/wk cap (needs send-history column); first-class `entry:"nudge"` attribution on `check_completed`; `nudge_dismissed` SW beacon; hoist per-result-card entitlement fetch; timezone-aware history date filters (U5); design pass on unstyled `memory-recall*` + quiet-hours CSS before flag-on.

### C. Human gates (the plan's actual "done" — engineering cannot do these)

10. **Phase 2.6 discovery study** — run `docs/research/meal-memory-concierge-protocol.md` (needs owner + privacy sign-off, then recruit 12–15). Its precommitted gate decides whether Phase 3/4 flags EVER turn on. Gate fail → do NOT enable journey; test simpler alternatives (protocol §7.1).
11. **Credentialed RD/CDCES review** of the eval rubric, blinded sample, `known_gaps`, and stage/nudge copy (evidence rows in `docs/release/truth-index.md` §3).
12. **Function-specific counsel review** (meal check, memory, journey, insights, nudges, sharing, Pantry, analytics, distribution claims) + privacy/DPIA + accessibility audit — same checklist.
13. **Flag enablement sequence** (only after 10–12 pass): enable `MEAL_MEMORY_*` → observe → enable `LEARNING_JOURNEY_*` → weekly artifact becomes the Premium value (paywall copy may then re-add a truthful weekly-summary bullet, pinned to the capability matrix).
14. **Retention cohort** — run `docs/research/retention-cohort-preregistration.md` after Phases 0–3 gates pass. 90-day core → D180 maintenance → D365 annual evidence. **The 95/100 retention score and 100/100 value score can only be awarded by these cohorts + gates (plan §17), never by code.**
15. **Distribution** — only after §5 prerequisite gates are green: run `docs/growth/distribution-prerequisites-and-channel-gates.md` (Reddit first; precommitted 30/10-29/<10 branches; IG/TikTok need recorded owner ratifications).

### D. Definition of true done (from plan §17 — track in `docs/release/truth-index.md`)

- All nine §2.1 value rows have current evidence; public domain/email/support/analytics/billing operational; every promoted example live-captured; credentialed + counsel + privacy + accessibility closure; real cohort confirms first + repeat value; §2.2 weighted retention evidence ≥95 with D180 maintenance data; no safety/privacy/billing/availability blocker.

---

## 4. Conventions for the continuing session

- Read `.superpowers/sdd/progress.md` before doing anything — it is the durable ledger (scratchpad triage files from the prior session do NOT persist).
- Shared-tree protocol (still in force): explicit-path staging only; never `git add -A`; never destructive git ops; tolerate foreign modified files.
- Test conventions: handler factories with injected `{db, getSession, now, ...}`; PGlite `createTestDb()` applies real `drizzle/*.sql`; closed analytics union + `ALLOWED_EVENT_NAMES` + no-PII source scan (prop names `reason`/`question` forbidden); banned-claims tests run copy through the real safety contract.
- Hard rules that bind all future work: core meal card is history-independent; no health text in URLs/analytics/Sentry/push payloads; encrypted-at-rest health fields; server-enforced capabilities; error ≠ upsell; one clarification max; no dark patterns; deletion must be real (tombstone + invalidation patterns now exist — follow them).
