# Revora — Session Handoff: C7 Execution In Flight (Lane A mid-implementation)

**Written:** 2026-07-21 (evening) · **For:** the next execution session · **Branch:** `feat/c7-four-jobs-and-audit-residuals` (off `main` @ `2f758e0`, PR #23 MERGED)
**Working tree:** DIRTY — Lane A (UI restructure) is mid-flight and uncommitted. Do NOT reset. Read §C before touching anything.

This continues `docs/handoff/2026-07-21-c7-restructure-and-audit-residuals-master-prompt.md` (the master prompt). The plan of record is **`docs/plans/2026-07-21-c7-four-jobs-plan.md`** — it passed /plan-eng-review AND /plan-design-review (both CLEAR, 0 unresolved; GSTACK REVIEW REPORT at its foot). Every design decision below is already made; do not re-litigate.

---

## A. DONE this session (verified)

### A1. Infra (all verified live)

| Item | State |
|---|---|
| **PR #23** | Merged to main (`2f758e0`, merge-commit convention). Prod deploy Ready, `/api/health` ok. |
| **Migration 0013** | Applied to prod Railway `Postgres` via `drizzle-kit migrate` (journal now 14 rows); `subscriptions.cancel_at_period_end boolean NOT NULL DEFAULT false` verified. |
| **RE-08 prod structural comparison** | **PASS** — introspected prod (`drizzle-kit pull`) and diffed vs `drizzle/meta/0013_snapshot.json`: zero differences (tables/columns/indexes/uniques/checks/FKs). A3.5 CLOSED. |
| **www.revora.plus** | CNAME existed; added the missing **308 canonical redirect → apex** via Vercel API (`PATCH /v9/projects/{id}/domains/www.revora.plus`, `redirect: revora.plus`). Verified live. P0.1 pass criterion met. |
| **Flag server twins in Vercel** | `PHOTO_INPUT_ENABLED=1` + `LONGITUDINAL_INSIGHTS_ENABLED=1` added to **production** (mirrors the sensitive `NEXT_PUBLIC_*` values) — required BEFORE this branch merges (build fails on twin mismatch, see A2). |
| **Stripe webhook (B1)** | **STILL OPEN — blocked on owner OAuth.** `mcp__stripe__authenticate` was called; the owner never completed the browser flow. A `STRIPE_WEBHOOK_SECRET` exists in Vercel prod (15d old, type=sensitive, unreadable) — after OAuth, LIST existing webhook endpoints first; only create + rotate if none matches `https://revora.plus/api/billing/stripe/webhook`. Events: checkout.session.completed, invoice.paid, invoice.payment_failed, customer.subscription.updated, customer.subscription.deleted, charge.refunded. |
| **NEXT_PUBLIC_SENTRY_DSN** | **STILL OPEN — blocked on owner.** `SENTRY_DSN` is type=sensitive (API cannot decrypt); sentry-cli not installed. Owner must paste the client DSN (Sentry → Settings → Client Keys), then: add to Vercel prod+preview. Build warns (not fails) until then. |

Useful facts: Vercel token readable from `~/.local/share/com.vercel.cli/auth.json` (jq .token) for raw API calls; teamId `team_IlBixvuQMskF7lpmeGAhRlbs`, projectId `prj_rF6Fef4OQpldRQgKhrw9aNn5WaQC`. Railway CLI authed; prod DB URL = `railway variables --service Postgres --json | jq -r .DATABASE_PUBLIC_URL` (run from repo dir; the private URL is unreachable from outside Railway). `/api/health` shows crons `nudge/trialPrecharge/pantrySweep/stripeReconcile` STALE — only `bai-weekly` is in vercel.json; NOT in scope this session, flag to owner.

### A2. Committed on this branch (5 commits, each gate-checked when committed)

| Commit | What |
|---|---|
| `9cb57d5` | **Flag server twins**: `lib/photo-input-flag.ts` + `lib/longitudinal-insights-flag.ts` gain `*ServerEnabled(env)` (meal-memory pattern, fail-closed, injectable). Enforced at photo-draft 404 gate (BOTH flags), Home insight render, and **/api/coach (NEW runtime gate — behavior change, regression-tested)**. `next.config.ts` now FAILS the prod build when a NEXT_PUBLIC flag is "1" without its server twin. Tests: `tests/unit/revora/flag-server-twins.test.ts` + updated photo-draft/coach suites. |
| `171a705` | **HS-3 exemption**: `postprocessModelOutput` always passes a LOCAL floor sink (mirrored to the caller's optional `context.snapshot`); component-mention enforcement skips floored drafts via `floorSink.usedFallback` — deterministic for sink-less callers. Flag `REVORA_ENFORCE_COMPONENT_MENTION` stays OFF (gate: real-model retry-delta ≤2pts, unchanged). Test added in postprocess.test.ts. |
| `5273ec3` | **P0.4 backend**: `support_cases` table (migration `drizzle/0014_support-cases.sql`, kind/status CHECKs, cascade FK) + `POST /api/support/case` (`app/api/support/handlers.ts`: 401/400 validation kind∈{help,refund}+trim+2000cap, encrypted row FIRST, then full-copy email to support@ — email failure never loses the case, returns `{caseId, emailed}` 201). Rate limit: new `support_ip` bucket 5/24h **fail-CLOSED** in `lib/revora/rate-limit.ts` + proxy match `/api/support/case`. `/api/account/export` now includes support cases. `captureServerError` gained a "support" stage. |
| `86e71b9` | **Account UI**: `components/support-case-form.tsx` (kind select w/ inline refund-window copy, live char counter → field-error at 2000, submitting state, post-success case-id confirmation + "Send another message", direct-email fallback when `emailed:false`) wired into account page as "Help & refunds" section (above Stored health data) + **"Download your data" link to /api/account/export** (PR-5 residual closed). |
| `8646d12` | **RV-6 v2**: `lib/journey/weekly-learning.ts` VERSION "2"; artifact gains `experiment` + `uncertaintyToClose` (priority: repeated-uncertain food → uncovered mealtime (only when savedChoices>0) → stage exploration / null). Sentence builders exported + their fixed frames added to WEEKLY_LEARNING_COPY (now 30 strings, claims-scanned). Old v1 rows lazily recompute (existing version mechanism). Tests updated + 3 new. |

**⚠ Migration 0014 must be applied to prod at deploy time** (same Railway flow as 0013). Not yet applied.

### A3. Reviews (all logged in ~/.gstack review log; report table at the plan's foot)

- **/plan-eng-review: CLEAR.** Decisions: D1 rename URLs (user overrode keep-URLs rec), D2 PlanBox conditional on Home (attention states only), D3 support email carries full message, D5+D6 TODOs added to TODOS.md (admin case viewer; BAI retire-or-repurpose).
- **/plan-design-review: CLEAR, 6/10→9/10.** Decisions: D3 journey = ONE document (four utility sections — hard-rejection fix), D4 nav = **5 slots** (four jobs + accent center Check). Codex design voice REJECT→fixed (9 findings); two cold-read outside voices delivered 20 more findings — all integrated into the plan (or explicitly declined: OV#5 "drop the table" declined, handoff P0.4 mandates the ledger).
- Codex `codex exec` works but times out at 5m if allowed to roam the repo — constrain it to named files.

---

## B. IN FLIGHT — Lane A working tree (UNCOMMITTED — finish, test, then commit as one or two commits)

Staged renames + unstaged edits. `git status` right now:
`M`: TODOS.md, check/page, home/page, how-it-works/page, journey/page (was progress), layout.tsx, meals/page (was history), api/coach/route, globals.css, robots.ts, app-nav, daily-loop, dashboard-view, guest-dashboard, icons, progress-state, plan-box, next.config, seo-meta.test — `??`: saved-meals-section.tsx, week-strip.tsx, next-action.ts, recap.ts, docs/plans/. `app/(app)/memory/` git-rm'd.

What each piece IS (all typecheck-clean as of handoff):

1. **Icons** — `IconBookmark` (meals) + `IconCompass` (journey) added to `components/icons.tsx`. DESIGN.md §Icons list NOT yet updated (see C-step 4).
2. **Nav** — `components/app-nav.tsx` rewritten: `AppNav({variant: "sidebar"|"tabbar"})`, 5 LINKS (Home /home · My meals /meals · Check /check [action, sidebarLabel "Check a meal"] · My journey /journey · Account /account); active = exact match, plus /subscribe→Account. Layout renders it twice (sidebar + new `.app-tabbar` fixed bottom wrapper); topbar is brand-only now.
3. **CSS** (globals.css) — `.app-tabbar/.app-tabbar-nav/.app-tab/.app-tab-action` (accent-filled center Check, safe-area inset, hidden ≥1024px), `.app-content` mobile bottom padding `calc(96px + env(safe-area-inset-bottom))`, `.dash-next-action`, `.journey-doc` section rules.
4. **Routes** — `git mv` history→meals, progress→journey; memory dir deleted; `next.config.ts` permanent redirects for all three; `app/robots.ts` DISALLOWED_PATHS += /journey /meals /memory (legacy entries kept); seo-meta test pins extended; internal links updated (check page, how-it-works, daily-loop).
5. **/meals** — h1 "My meals", eyebrow "What worked for you"; `components/saved-meals-section.tsx` (the old memory page minus its search/hero: list/edit/delete/export/delete-all, self-hides on 401/403/404 AND flag-off, section-scoped error) inserted between filter card and Recent checks. Native `window.confirm` already guards per-row delete (Codex #9 satisfied).
6. **Home** — `dashboard-view.tsx` rewritten: first-win → greet → hero → next-action line → Today card → conditional PlanBox (`planBoxAttention`). NO week strip / insight / progress / dash-grid. `lib/coach/next-action.ts` = 3-branch helper. `lib/server/plan-box.ts` gains `attention` (trialing ∥ cancelAtPeriodEnd; grace deliberately not wired — ponytail note in file). `home/page.tsx` no longer reads bai_weekly at all; guest-dashboard rewritten to match (no verdictWeekView import anymore).
7. **/journey** — ONE document (`journey-doc` article): JourneyCard (self-gating) → "What you learned this week" (LearningSummary flag-gated ∥ recap ∥ empty-line ∥ free locked-section) → "Try this next" (one line, only when LearningSummary isn't rendering) → "Your week" (count + WeekStrip). `lib/coach/recap.ts` = RV-3 non-scored sentences (`daysCheckedFrom`, `followThroughFrom`, `recapSentences`, `RECAP_POSTURE_LINE`) — NO score/band/percent. All BAI band/bar rendering DELETED from the page.
8. **/api/coach** — response additively gains `verdictWeek` (verdictWeekView, timezone-aware); `lib/coach/progress-state.ts` resolution extended with `verdictWeek` + `insight` (parsed for free AND premium — free /journey shows real week facts + ONE locked section, never a page-lock).
9. **week-strip** — extracted `components/week-strip.tsx` (from old dashboard-view); JUST converted to import RISK_LABELS (legend + sr-text) instead of hardcoding verdict words — **this was the last edit of the session; not yet re-run against copy-pins.**

### Known-failing tests to fix NEXT (all understood, none mysterious)

1. `tests/unit/revora/copy-pins.test.ts` —
   a. remove `components/dashboard-view.tsx` from `ALLOWLIST` (it no longer hardcodes verdict words; the ratchet test "allowlist only shrinks" DEMANDS removal),
   b. change `app/(app)/history/page.tsx` → `app/(app)/meals/page.tsx` in the must-import list,
   c. re-run — week-strip should now pass after the RISK_LABELS conversion.
2. `tests/unit/coach/progress-state.test.ts` — 6 failures, all `toEqual` shape: expected objects need `verdictWeek: null, insight: null` (and the 200-body fixtures can add verdictWeek/insight cases). Update + add: free-tier resolution carries verdictWeek.
3. `tests/unit/coach/verdict-week.test.ts` — re-check after week-strip edit (its failure was the copy-pin scan, likely same fix).
4. `tests/smoke/dashboard.spec.ts` — asserts `dash-week`/`dash-progress`/`dash-insight` on Home; those moved/died BY DESIGN. Rewrite per plan §11 (Home: hero + next-action + Today + conditional PlanBox; no score/band/percent).
5. Sweep for other pinned specs: `grep -rn "dash-progress\|dash-insight\|dash-week\|/history\|/progress\|/memory\|Meal memory" tests/` and update (E2E specs navigate old paths; memory smoke specs target the deleted page — point them at /meals + saved-meals-section, and drop memory-search assertions, search was deliberately removed from the section).

---

## C. Execution order from here (finish Lane A → gates → ship)

1. **Fix the known-failing tests above** (B list). Then run targeted suites: copy-pins, progress-state, verdict-week, coach-route.
2. **Write the plan §11 NEW tests** not yet authored:
   - `lib/coach/next-action` 3 branches; `lib/coach/recap` (daysCheckedFrom inverse 0..7, prompted=0 note swap, no digits-with-% anywhere, posture line);
   - RV-3 DOM regression: journey + home render for a premium fixture contain NO "%" character, no band words (excellent/on track/building/getting started), no `dash-bai`/`bai-bar` testids;
   - PlanBox conditional (trialing/cancel-scheduled shown; steady premium/free hidden) — assert via dashboard-view render or plan-box unit;
   - nav: 5 links, aria-current rules (/subscribe→Account, /check→Check);
   - claims-boundary scan: add `RECAP_POSTURE_LINE` + recap sentence frames + support-form copy if the scanner enumerates sources (check how claims-boundary-copy.test.ts discovers copy — it passed after the account form, so likely fine).
3. **Commit Lane A** (suggested split: "feat(nav+shell)" for icons/nav/layout/css/routes/redirects/robots, "feat(surfaces)" for home/meals/journey/coach/recap + tests. Or one commit — keep the story clear either way).
4. **DESIGN.md amendments** (plan "Design specifications → DESIGN.md amendments", 4 items): breakpoint-table row (bottom tab bar, 5 slots, topbar brand-only, delete the "Week/Progress are dashboard sections, not destinations" clause), plan-box D2 conditional note, §Icons += IconBookmark/IconCompass, §Progress surfaces rewritten to the non-scored recap rule. Commit as docs(design).
5. **E2E updates + new specs** (plan §11 bottom): viewport-conditional — tab-bar specs run on Pixel 5/iPhone 12 projects only, sidebar spec on Desktop Chrome only; redirects land correctly; /meals merged surface (history-ok + memory-error section-scoped); /journey document free + premium; account export link + help/refund round-trip (AUTH_EMAIL_STUB_DIR); at most one `[data-testid="next-action"]` per surface. Remember the harness quirk: ~2 rotating machine-load flakes per full run on this box — rerun in isolation before believing a failure.
6. **Full §D gates** (master prompt): lint, typecheck, `npm test` (baseline 1805/2 WILL shift — deliberate deletions must be named in ship notes; everything else passes), contract, eval:revora (11/11), build (needs the twin env vars locally? no — the twin-mismatch check only fires when VERCEL_ENV=production), e2e (3 projects × 2 servers), `npm audit --omit=dev`, `git diff --check`.
7. **Docs residuals** (master prompt B3): P0.5 truth-index re-verify vs deployed behavior; DA-NH-2 operator refund runbook (Stripe dashboard steps; `charge.refunded` handling already correct in code). Small, do with the docs commit.
8. **/ship** — same evidence discipline as PR #23. Deploy flow must: apply migration **0014** to prod Railway first (same as 0013: `DATABASE_URL=$(railway variables --service Postgres --json | jq -r .DATABASE_PUBLIC_URL) npx drizzle-kit migrate`), confirm twin env vars present, then merge.
9. **After the owner returns**: Stripe OAuth → webhook registration + test event round-trip (E-gate 1); Sentry client DSN → Vercel prod+preview.

## D. Do NOT touch (unchanged from master prompt)

HS-2/4/5 clinical banding; HSTS preload; CSP report-uri; S1/S2 flag flips (`MEAL_MEMORY_*`, `LEARNING_JOURNEY_*` stay OFF — everything built this session ships dark behind them); pricing numbers; DA-NH-1 counsel; human-evidence validators. `REVORA_ENFORCE_COMPONENT_MENTION` stays OFF (exemption is in, flip is measurement-gated). BAI cron/table keep running (S2 measurement; retirement decision = owner, TODOS.md).

## E. Definition of done (from the master prompt, updated)

1. ~~www redirect~~ ✅ · ~~RE-08 comparison~~ ✅ · Stripe webhook + test event ⏳ owner · Sentry client DSN ⏳ owner.
2. Four job surfaces live + coherent ✅ design/eng gates passed at plan level; post-build `/design-review` visual audit recommended after deploy.
3. RV-3 ✅ (recap built; DOM regression test pending §C2) · RV-6 ✅ committed · server twins ✅ committed · HS-3 exemption ✅ committed · P0.4 ✅ committed.
4. Truth-index + runbooks updated (§C7 docs step) · all §D gates green · shipped via /ship.

**One prioritized next action:** §C1 — fix the four known-failing test groups, then commit Lane A. The tree is one focused session away from green gates.
