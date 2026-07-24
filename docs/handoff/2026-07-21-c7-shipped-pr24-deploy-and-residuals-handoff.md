# Revora — Session Handoff: C7 SHIPPED (PR #24 open, deploy pending)

**Written:** 2026-07-21 (late evening) · **For:** the next session · **Branch:** `feat/c7-four-jobs-and-audit-residuals` (pushed, 13 commits ahead of `main`)
**PR:** **https://github.com/tkiros/Revora/pull/24** — OPEN, full evidence in the PR body. Working tree: **CLEAN.**

This closes out `docs/handoff/2026-07-21-c7-execution-mid-flight-handoff.md` (all of its §C1–C8 are done). Plan of record stays `docs/plans/2026-07-21-c7-four-jobs-plan.md` (eng + design review CLEAR, report at its foot).

---

## A. DONE this session (all verified, all committed + pushed)

### A1. Lane A finished (the mid-flight handoff's §C1–C3)

| Commit | What |
|---|---|
| `53ab62f` | **feat(shell)** — 5-slot nav (Home · My meals · Check [accent] · My journey · Account), `<1024px` bottom tab bar, topbar brand-only, route renames `/history`→`/meals` `/progress`→`/journey` `/memory`→`/meals` with permanent redirects, robots + seo-meta pins, internal links, IconBookmark/IconCompass, app-nav source-pin test. |
| `bce8905` | **feat(surfaces)** — Home decide-now (next-action 3 branches, PlanBox `attention` conditional via extracted `planBoxAttention()`, day-0 warmth **wired into the Today card** — was a dead `isDay0` prop, plan §3 mandated it); /meals merged saved-meals section; /journey ONE document with RV-3 non-scored recap; `/api/coach` additive `verdictWeek`; progress-state carries verdictWeek+insight for free AND premium. All known-failing tests fixed (copy-pins allowlist shrunk to demo-check-card only, progress-state shapes, dashboard smoke rewritten, progress.spec→journey.spec, daily-loop→/meals). New unit suites: next-action, recap (inverse 0..7, prompted=0 swap, RV-3 copy scan), plan-box-attention, app-nav; recap + next-action registered in the claims scanner (EXTRA_SOURCES). |
| `b4bbf19` | **docs(design)** — all 4 DESIGN.md amendments (breakpoint row + tab bar, D2 plan-box conditional, §Icons, §Progress → non-scored recap rule) + plan + mid-flight handoff checked in. |
| `aeac266` | **test(e2e)** — env-gated `tests/smoke/account-support.spec.ts` (magic-link sign-in → export link + `/api/account/export` has `supportCases` → refund form round-trip → case-id confirmation → full-copy email via `AUTH_EMAIL_STUB_DIR` → form restore); journey.spec covers all 3 legacy redirects; daily-loop asserts saved-meals section absent flag-off. |
| `cd71398` | **docs(ops)** — `docs/runbooks/refunds.md` (DA-NH-2: Stripe dashboard steps, do-NOT-touch-the-DB rule — `charge.refunded` webhook is the only writer of the terminal status, hourly reconcile is the backstop) + truth-index re-verified (review date 2026-07-21; **P0.1 DONE** on revora.plus, **P0.4 SHIPPED**, 0013 applied + RE-08 PASS recorded, 0014 pending deploy noted). |

### A2. /ship executed (gstack skill, full evidence discipline)

Dashboard: **CLEARED** (plan-level eng + design reviews, logged at the plan's foot). Base merge: already up to date.

**Subagent audits:**
- **Plan completion:** 50 items — **46 DONE, 2 CHANGED, 2 deferred-by-design, 0 NOT DONE**; all 3 mandatory regressions present. CHANGED: support limit is proxy per-IP not per-user; journey h1 is "What you're learning" (eyebrow "My journey").
- **Coverage:** **76%** (418/550 paths, 6 cluster traces). Safety engine / billing reducers / coach / analytics all ★★★. The 3 HIGH gaps are in files **this branch never touched** → TODOS.md (see D2 — one may be a live privacy bug).

**Review army (6 specialists + Codex adversarial + Claude adversarial + red team) — 2 CRITICAL, both fixed:**

| Commit | Fixes |
|---|---|
| `ca3a827` | **CRITICAL: `/api/support/case` missing from `proxy.ts config.matcher`** — the fail-closed `support_ip` rate limit was DEAD CODE; the email-amplifying door shipped unlimited. Added to matcher + regression test pinning the matcher↔`matchRouteLimit` integration edge for EVERY limited route. Also: twin-mismatch build gate moved OUTSIDE the `REVORA_ALLOW_NO_MEASUREMENT` waiver (waiving analytics must never waive flag safety); **migration `0015_support-cases-user-index.sql`** — composite `(user_id, created_at desc)` index (multi-specialist confirmed; Postgres doesn't auto-index FKs). |
| `5a9a8a5` | **CRITICAL: next-action dead-end** — "Mark what you did" → /meals, but NO post-check surface renders `action-done-button` (it only exists on the result card at check time). Reworded to "Today's check suggested a step — did it happen?" + regression pin; real affordance is TODOS.md top item. Also: journey week count said "N meals" but `verdictWeek` counts DAYS → "You checked in on N days this week" (journey.spec updated); recap fallback now renders when LearningSummary self-nulls (`!learningEnabled \|\| !learningShown` — section 2 can never blank); `resolveProgressState` maps unknown `tier` on a 2xx → `unavailable`, never the free upsell; guest weekCount now uses shared `weekView` calendar-day keys (was rolling 168h — diverged from Home); `SUPPORT_MESSAGE_MAX` single-sourced in `lib/revora/contact.ts`; export route reads via `Promise.all`; dead `shouldShowBai` removed + its tests; coach-route now asserts `verdictWeek` wire shape for premium AND free; TODOS.md entries (see D). |
| `c723758` | **docs(release)** — device-qa-checklist §7 `/history`→`/meals`, §9 `/progress`→`/journey` (document-release subagent; verified `/api/history` etc. are API routes C7 did NOT rename — left alone). |

**Skipped review findings (documented decisions, all in PR body + review log):** 201-on-create (intentional, client uses `response.ok`); 308 permanence (IA is the locked plan); support limiter IP-keying, export GET throttling, plan-box catch→guest-box → TODOS.md. Codex's "telemetry can 500 after persist" was **refuted** (`captureServerError` never throws — documented contract).

### A3. Gates — ALL GREEN at ship (fresh evidence after the review fixes)

typecheck ✓ · lint 0 errors (19 pre-existing warnings) · **unit 1857 passed / 2 skipped** (baseline was 1805 — deliberate deletions: old dash-week/insight/progress assertions + shouldShowBai suite; named in PR) · contract (all 9 gates) ✓ · eval:revora 11/11 ✓ · claims scan ✓ (recap + next-action newly registered) · production build ✓ · `npm audit --omit=dev` 0 ✓ · `git diff --check` ✓ · **Playwright 3 projects × 2 servers green.**

**⚠ E2E false-alarm postmortem (important operational learning):** the first full e2e run reported 53 Mobile Safari failures with exit 0 — BOTH signals were wrong. (1) `npm run e2e | tail` masks the exit code — never pipe the run; (2) all app routes 404'd because the **turbopack dev cache (`.next/dev`) was corrupted** (killed servers mid-compile + a stray second `next dev` sharing the distDir). `rm -rf .next` fixed it; every Safari chunk then passed in isolation (62 passed, 4 flaky-passed, 5 env-skipped). If Playwright ever shows whole-app 404s again: check for stray `next dev` processes, nuke `.next`, rerun — it is not your code.

---

## B. IMMEDIATE next actions (deploy flow — do these in order)

1. **Apply migrations 0014 + 0015 to prod Railway** (BEFORE merging — same flow as 0013):
   ```bash
   cd /home/tefera/Desktop/Revora
   DATABASE_URL=$(railway variables --service Postgres --json | jq -r .DATABASE_PUBLIC_URL) npx drizzle-kit migrate
   ```
   Expect journal to go 14 → 16 rows. The private URL is unreachable from outside Railway; use DATABASE_PUBLIC_URL. Optionally re-verify with `drizzle-kit pull` diff vs `drizzle/meta/0015_snapshot.json` (RE-08 pattern).
2. **Merge PR #24** (merge-commit convention, same as PR #23). Twin env vars are already in Vercel prod (`PHOTO_INPUT_ENABLED=1`, `LONGITUDINAL_INSIGHTS_ENABLED=1`) — the build FAILS without them, so a green Vercel build is itself the twin check.
3. **Post-deploy verification:** `/api/health` ok; spot-check `revora.plus/journey`, `/meals`, `/home` (tab bar on mobile width); legacy `/progress` `/history` `/memory` 308 to the new routes; submit a real help case from `/account` and confirm the email lands in support@ + case id renders.
4. **Post-deploy `/design-review` visual audit** of the four surfaces (recommended by the plan; was explicitly deferred to after deploy).

## C. OWNER-BLOCKED (unchanged — needs the owner in the room)

1. **Stripe webhook (B1/E-gate 1):** `mcp__stripe__authenticate` OAuth was never completed. After OAuth: LIST existing webhook endpoints FIRST — a `STRIPE_WEBHOOK_SECRET` already exists in Vercel prod (type=sensitive, unreadable); only create + rotate if none matches `https://revora.plus/api/billing/stripe/webhook`. Events: checkout.session.completed, invoice.paid, invoice.payment_failed, customer.subscription.updated, customer.subscription.deleted, charge.refunded. Then a test-event round-trip.
2. **Sentry client DSN:** `SENTRY_DSN` is type=sensitive (API can't decrypt); owner must paste the CLIENT DSN (Sentry → Settings → Client Keys) → add `NEXT_PUBLIC_SENTRY_DSN` to Vercel prod+preview. Build warns (not fails) until then.
3. `/api/health` crons `nudge/trialPrecharge/pantrySweep/stripeReconcile` show STALE — only `bai-weekly` is in vercel.json. Flagged to owner previously; still open, still out of scope.

## D. TODOS.md — new entries this session (prioritized)

1. **Today-card "I did it" affordance** (red-team critical's real fix): both write paths already exist (`historyStore.markActionDone` + `POST /api/history/action`); needs a small client wrapper (TodayList is presentational, DashboardView server-rendered) + design pass. Restores the stronger "Mark what you did" next-action line.
2. **Pre-existing HIGH coverage gaps** — `components/client-error-reporting.tsx` omits `defaultIntegrations:false` (Breadcrumbs/HttpContext stay ON — the exact health-data leak `instrumentation-client.ts` forbids) — **inspect this one first, it may be leaking today**; `app/api/profile/route.ts` PATCH untested; `paywall-card restorePurchases()` untested.
3. **Support limiter keying** — per-user (handler-level) instead of/alongside per-IP; reconsider fail-closed for the refund door (chargeback risk when locked out).
4. **Throttle `/api/account/export`** — proxy ignores GETs; authenticated loop = 4 queries + full decrypt per hit.
5. (Pre-existing, from plan review): admin support-case viewer (D5), BAI retire-or-repurpose (D6).

## E. Do NOT touch (unchanged)

HS-2/4/5 clinical banding · HSTS preload · CSP report-uri · `MEAL_MEMORY_*` / `LEARNING_JOURNEY_*` stay OFF (everything ships dark behind them) · pricing numbers · DA-NH-1 counsel · human-evidence validators · `REVORA_ENFORCE_COMPONENT_MENTION` stays OFF (HS-3 exemption is in; flip is measurement-gated) · BAI cron/table keep running (S2 measurement).

## F. Useful operational facts

- Vercel token: `~/.local/share/com.vercel.cli/auth.json` (`jq .token`); teamId `team_IlBixvuQMskF7lpmeGAhRlbs`, projectId `prj_rF6Fef4OQpldRQgKhrw9aNn5WaQC`.
- Railway CLI authed; run from repo dir.
- E2E box quirks: ~2 rotating machine-load flakes per full run (rerun in isolation before believing a failure); `billing-pages.spec` "signed-out account offers sign-in" is flake-prone on cold Safari (account page now also compiles the support form); the trial server (:3101) only boots for non-concrete/whole-suite filters — concrete `.spec.ts` filters skip it.
- Never `npm run e2e | tail` — it eats the exit code. Write to a file, `echo EXIT=$?`.
- gstack review log for this ship: `~/.gstack/projects/Revora/` + branch reviews.jsonl (coverage 76, plan 48/50, verification pass).

## G. Definition of done (master-prompt ledger, updated)

1. www redirect ✅ · RE-08 ✅ · Stripe webhook ⏳ owner · Sentry client DSN ⏳ owner.
2. Four job surfaces ✅ built, reviewed, shipped to PR; post-deploy visual audit pending (§B4).
3. RV-3 ✅ (incl. DOM regression tests) · RV-6 ✅ · server twins ✅ (+ decoupled build gate) · HS-3 ✅ · P0.4 ✅ (+ matcher fix, + 0015 index, + refund runbook).
4. Truth-index + runbooks ✅ · all §D gates ✅ green with fresh evidence · **shipped via /ship → PR #24**.

**One prioritized next action:** §B1 — apply 0014+0015 to prod Railway, then merge PR #24.

****

Owner blocs

I am not sure what you mean by  "1. Stripe OAuth — open the authorization URL", i don't see this url anywhere. The mcp is authonticated, can you setup everything that need to setup with stripe?
  DSN
  https://823a9763757cc5c4be2c7b131d88bce7@o4511672801820672.ingest.us.sentry.io/4511691306696704
