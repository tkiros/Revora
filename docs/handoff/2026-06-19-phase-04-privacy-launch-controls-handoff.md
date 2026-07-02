# Session Handoff — Phase 4: Privacy-Minimal Launch Controls

**Date:** 2026-06-19
**Repo:** `/home/tefera/Desktop/Revora`
**Branch:** `main`
**HEAD at handoff:** `85c5350`
**Project:** Revora — permission-first "Can I eat this?" answer for prediabetes (text-only MVP)
**GSD workflow:** `/gsd-execute-phase 4` (wave-based execution)

---

## TL;DR — Current Status

Phase 4 is **EXECUTION COMPLETE and CODE-VERIFIED, but NOT yet "done."**

- Both plans (04-01, 04-02) are executed, committed, and independently re-verified.
- `gsd-verifier` verdict: **9/9 must-haves verified by code; all 7 requirements (PRIV-01..04, OPS-01..03) satisfied.** Status = `human_needed`.
- **4 deployment-time UAT items remain** — all require a human with **Vercel project access**. None are code gaps.
- The phase is intentionally **not auto-advanced**. The final transition to "verified/complete" is owned by `/gsd-verify-work 4`.

**The single next action:** run `/gsd-verify-work 4`, complete the 4 manual Vercel tasks, and let verify-work mark the phase passed.

---

## What "Done" Looks Like (Definition of Done)

Phase 4 reaches **true done** when ALL of the following are true:

1. `npx vercel build` (after `vercel login`) completes clean, showing `/api/check`, `/api/health`, and the middleware (Proxy) in the route manifest.
2. A Vercel **Edge Config** store exists with keys `launch_mode`, `public_checks_enabled`, `incident_message`, and `EDGE_CONFIG` is set in **both** Preview and Production scopes. The kill switch is proven: toggling `public_checks_enabled=false` makes `/api/check` return a friendly 503 and `/api/health` report `launch:"paused"` **within ~30s, no redeploy**; restoring it returns `launch:"ready"`.
3. A Vercel **WAF** rate-limit rule (`10 req/10 min/IP`, Block 429) is published on `/api/check`, and the 11th rapid request from one IP is verifiably blocked. Rule ID + publish timestamp recorded.
4. The **rollback drill** has been executed end-to-end against a live Production deployment, with all five post-rollback checks passing, and evidence recorded in `docs/ops/launch-controls.md` §5 `SETUP_BLOCKED` slots.
5. `04-UAT.md` shows `status: passed` / all 4 tests `passed`, and `04-VERIFICATION.md` status flips from `human_needed` to `passed` on re-verify.
6. STATE.md / ROADMAP.md reflect Phase 4 **verified complete**, clearing the path to Phase 5.

Until items 1–4 are physically done in Vercel and recorded, the phase is *code-correct but not launch-proven*. That gap is by design — the app correctly defers abuse/rollback control to provider infrastructure and ships fail-closed defaults.

---

## Exact Next Actions (to reach true done)

> All four require `vercel login` and access to the Revora Vercel project. The app code is already correct; these prove the provider wiring. Full step-by-step expectations live in `.planning/phases/04-privacy-minimal-launch-controls/04-UAT.md` and `docs/ops/launch-controls.md`.

### 0. Drive it through GSD (recommended)
```
/gsd-verify-work 4
```
This walks each UAT item interactively and auto-transitions the phase to complete when all pass. Do the 4 tasks below as it prompts.

### 1. Vercel build gate
```bash
vercel login
npx vercel build
```
**Pass:** build completes with no errors; output lists `/api/check`, `/api/health`, middleware (Proxy).

### 2. Edge Config store + kill-switch drill
- Vercel Dashboard → Storage → Edge Config → create store.
- Set keys: `launch_mode="normal"`, `public_checks_enabled=true`, `incident_message="Revora checks are temporarily paused."`
- Set `EDGE_CONFIG=ecfg_<connection-string>` in **Preview** and **Production** env scopes.
- Drill: set `public_checks_enabled=false` →
  - `GET /api/health` → `{"ok":false,"launch":"paused","launchMode":"paused"}`
  - `POST /api/check` → `503` with friendly pause copy, **no stack traces**
- Restore `public_checks_enabled=true` → `/api/health` → `{"ok":true,"launch":"ready"}`.

**Pass:** toggle works in <30s with no redeploy.

### 3. WAF rate-limit rule
- Vercel Dashboard → Security → WAF → new rule:
  - name `revora-check-rate-limit`, path `/api/check`, limit `10 requests / 10 minutes / IP`, action Block (429).
- Publish. Send 11 rapid `POST /api/check` from one IP.

**Pass:** 11th request returns 429; record rule ID + timestamp in the runbook.

### 4. Rollback drill (needs a live Production deploy)
```bash
vercel rollback
vercel rollback status                                   # wait for COMPLETE
vercel logs --environment production --status-code 5xx --since 5m   # 5xx at baseline
curl https://<prod-domain>/api/health                    # {"ok":true,"launch":"ready","launchMode":"normal"}
curl -s -X POST https://<prod-domain>/api/check -H 'Content-Type: application/json' \
  -d '{"food":"apple","a1c":"6.1"}' | jq .kind           # "result" or "retry"
```
**Pass:** all five checks pass. Record evidence in `docs/ops/launch-controls.md` §5. "Rollback is not recovery until all five pass."

### 5. After all four pass
- `04-UAT.md` → all `passed`; re-run verification so `04-VERIFICATION.md` flips to `passed`.
- Confirm STATE.md / ROADMAP.md show Phase 4 verified complete.
- Then Phase 5 (Community Launch and Founder Review Loop) is unblocked.

---

## What Was Done This Session

### Starting condition (interrupted prior run)
Phase 4 had been **partially executed by a prior (Codex) session and interrupted**. 04-01 had 4 commits but **no SUMMARY.md**, and Task 2's implementation (`lib/revora/env.ts`, `app/api/health/route.ts`, a `docs/privacy/data-flow.md` edit) was sitting **uncommitted** in the working tree. STATE.md was stale (`ready_to_plan`).

### 1. Safe-resume gate (04-01) → closed out
- The gate (production commits + missing SUMMARY) tripped; user chose **close out** over re-execute.
- Verified working tree: 11/11 unit tests, typecheck, `next build` all green; `/api/health` in the route manifest.
- Committed Task 2 GREEN (`env.ts`, health route, doc, `package.json` build script) → `3a86e2d`.
- Wrote `04-01-SUMMARY.md`; advanced STATE/ROADMAP → `3113f50`.
- Stray files resolved: committed the `package.json` build-script line (needed by the build gate, cleared 04-02 collision); left Next-managed `tsconfig.json`/`next-env.d.ts` noise uncommitted (tooling side-effects).

### 2. 04-02 (Wave 2) → executed via gsd-executor
- Worktree isolation **auto-degraded to sequential on main** (`worktree.base-check` → `shouldDegrade: true`, no git remote / `origin/HEAD` unresolved). This is the sanctioned path; no merge-back machinery.
- First `gsd-executor` dispatch dropped on a **transient connection error after only context reads** (spot-check confirmed zero partial work). **Resumed the same agent** via SendMessage rather than redo 16 reads.
- Delivered: launch-control seam, `@vercel/edge-config` integration (fail-closed), `middleware.ts` pre-model pause gate, `/api/health` wired to launch state, Playwright smoke coverage, ops runbook. 6 commits (`7d4a584`→`fe6f494`).

### 3. Independent regression gate (re-run by hand)
- **97/97 unit tests pass** (16 files), typecheck clean, `next build` clean (middleware registered as `ƒ Proxy`).
- Commit hygiene confirmed: each 04-02 commit touched **only** plan files (no tsconfig/next-env noise).
- Note: the safety classifier had intermittent outages during the session; **every test/build gate was re-run manually once Bash recovered** — nothing was accepted on an unverified subagent claim.

### 4. Phase verification (gsd-verifier)
- `04-VERIFICATION.md`: **9/9 truths verified, 7/7 requirements satisfied, 0 anti-patterns.**
- Self-reported `middleware-bypass` threat flag assessed **non-exploitable** — `app/api/check/route.ts` exports `POST` only; no GET surface exists.
- Status `human_needed`; persisted 4 items to `04-UAT.md`; corrected STATE.md (was prematurely "ready for Phase 5") → `85c5350`.

---

## Phase 4 Commit Map (range `21bed21..85c5350`)

```
85c5350 test(04): phase verification (9/9 code-verified) + persist human UAT items
fe6f494 docs(04-02): update STATE.md and ROADMAP.md — Phase 4 complete
1aac243 docs(04-02): complete launch-controls plan summary
e1b14d4 feat(04-02): gate public checks before model spend, wire health launchMode
674c7cc test(04-02): add failing middleware gate, health launchMode, and smoke coverage
9d61647 feat(04-02): implement launch-control contracts, thresholds, and ops runbook
7d4a584 test(04-02): add failing launch-control contracts and threshold coverage
3113f50 docs(04-01): complete plan — close out env/health probe and update state
3a86e2d feat(04-01): complete env validation and safe health probe
3d67185 test(04-01): add failing env and health probe coverage
9172e07 feat(04-01): add privacy-minimal telemetry boundary
715b042 test(04-01): add failing privacy telemetry coverage
79fef8a docs(04-01): lock privacy data-flow contract
```

---

## Key Files (Phase 4 surface)

**Implementation**
- `lib/revora/openai-client.ts` — sole OpenAI Responses wrapper; `store: false` (line 43).
- `lib/revora/telemetry.ts` — `emitSafeEvent`; Zod `.strict()` schema rejects raw food/A1C/prompt/output at parse time.
- `lib/revora/env.ts` — `getRevoraEnv()`; Preview/Production/dev/test; `OPENAI_API_KEY` required, `EDGE_CONFIG` optional.
- `lib/revora/launch-controls.ts` — `getLaunchControls()`, `evaluateLaunchMode()`, `shouldPauseForOps()` (2,000 checks/24h); Edge Config fail-closed; `REVORA_LAUNCH_MODE_OVERRIDE` non-prod test seam.
- `app/api/check/route.ts` — `POST` only; delegates to `checkFood`, emits coarse telemetry.
- `app/api/health/route.ts` — `GET`; returns `ok/environment/launch/launchMode`; never exposes secrets.
- `middleware.ts` — pre-model pause gate on `POST /api/check`; uses never-throwing `getLaunchControls()` (NOT `getRevoraEnv()`, which throws in edge runtime without the key).

**Docs / contracts**
- `docs/privacy/data-flow.md` — privacy contract (no default storage, `store:false`, abuse-monitoring caveat, env boundary).
- `docs/ops/launch-controls.md` — operator runbook (thresholds, WAF, Edge Config drill, rollback procedure with evidence slots).

**Tests**
- `tests/unit/revora/{privacy-minimal,openai-client,telemetry,env,launch-controls}.test.ts`
- `tests/smoke/launch-controls.spec.ts` (Playwright; normal/maintenance/rate-limit via route stubs).

**GSD tracking**
- `.planning/phases/04-privacy-minimal-launch-controls/{04-01,04-02}-PLAN.md`, `{04-01,04-02}-SUMMARY.md`, `04-VERIFICATION.md`, `04-UAT.md`, `04-RESEARCH.md`, `04-VALIDATION.md`
- `.planning/STATE.md`, `.planning/ROADMAP.md`

---

## Gotchas / Context for the Next Session

- **No git remote.** `origin/HEAD` is unresolved → GSD worktree isolation auto-degrades to sequential-on-main. Expected; if you want parallel worktrees later, set `worktree.baseRef:"head"` in `.claude/settings.local.json`.
- **Pre-existing repo noise (not Phase 4):** `tsconfig.json` + `next-env.d.ts` show as modified (Next.js auto-edits); many untracked files (`PRD/`, `agent/`, `docs/audit/`, `docs/archive/`, `CLAUDE.md`, `.next/`, `test-results/`, etc.). These predate this work — **do not commit them as Phase 4**.
- **Next.js 16 deprecation (cosmetic):** build warns `middleware.ts` → prefer `proxy.ts`. Plan specified `middleware.ts`; build succeeds. Rename to `proxy.ts` only when upgrading Next.
- **Build gate substitution:** `npx vercel build` was NOT run (needs `vercel login`); `npm run build` was substituted and passes. This is the OPS-01 partial — UAT item #1 closes it.
- **Pre-launch (separate, from STATE blockers):** run the live safety eval with `OPENAI_API_KEY` and record a **zero-harmful-SAFE** result before public release. (`node scripts/run-live-revora-evals.mjs` / `npm run eval:revora`.) This is a launch blocker tracked in PROJECT/STATE, beyond Phase 4's verification.
- Commits in this repo are authored as **Codex** (git user); session adds a Claude co-author trailer.

---

## Paste-Ready Prompt for a New Session

```
Continue Revora Phase 4 (Privacy-Minimal Launch Controls) from handoff
docs/handoff/2026-06-19-phase-04-privacy-launch-controls-handoff.md.

State: both plans executed, committed (HEAD 85c5350 on main), and code-verified
by gsd-verifier (9/9 must-haves, 7/7 requirements). Status is human_needed — 4
deployment-time UAT items remain in
.planning/phases/04-privacy-minimal-launch-controls/04-UAT.md, all requiring
Vercel access:
  1) npx vercel build (after vercel login)
  2) Edge Config store + kill-switch drill
  3) WAF rate-limit rule (10/10min/IP, Block 429)
  4) Rollback drill against live Production

Run /gsd-verify-work 4 and walk me through these items. As each passes, record
evidence in docs/ops/launch-controls.md §5 and mark 04-UAT.md. When all 4 pass,
re-verify so 04-VERIFICATION.md flips to passed and STATE/ROADMAP show Phase 4
verified complete — then Phase 5 is unblocked. Do NOT mark the phase complete
before the 4 items are physically done in Vercel and recorded.

Also pending before public launch (tracked separately in STATE blockers): run the
live safety eval with OPENAI_API_KEY and record a zero-harmful-SAFE result.
```

---

*Generated at HEAD `85c5350`. Source of truth for status: `.planning/phases/04-privacy-minimal-launch-controls/04-VERIFICATION.md` (run `gsd-tools query verification.status <phase_dir>`).*
