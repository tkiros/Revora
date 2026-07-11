# Handoff — User-Facing Dashboard + Desktop App Shell (M1 built, M2 pending)

**Date:** 2026-07-10
**Session scope:** brainstorm → eng review → design review → external design file → implementation (M1 complete)
**Worktree:** `/home/tefera/Desktop/Revora/.claude/worktrees/app-shell-dashboard` (branch `worktree-app-shell-dashboard`, based on `origin/main` @ 5a96f2c)
**Last commit:** `dfc1580` — "feat(app-shell): M1 — (app) shell, reassurance dashboard, start URL flip"
**Working tree at interrupt:** DESIGN.md amendments UNCOMMITTED in the worktree (edits done, tests/verify not run since)

---

## 1. What was asked

1. Is there a returning-user dashboard (progress, history, dates, customer/billing period)? → **No** — data scattered across `/check`, `/history`, `/progress`, `/account`; `subscriptions.currentPeriodEnd` tracked but never shown to active subscribers.
2. How to build "the web version" — the app looked awkward on desktop. → Root cause: `app/globals.css` `.page-frame` caps every app page at a 480px column; `DESIGN.md` declared "the 480px frame IS the desktop design". Only the marketing landing (`/`) was responsive.
3. Then: "Claude Code should design/build the whole user-facing interface and the web version." An external Claude produced a design file from a features-only prompt; implementation proceeds from it.

## 2. Design pipeline (all APPROVED / CLEAR)

- **Design doc (source of truth, keep updated):** `~/.gstack/projects/Revora/tefera-feat-video-engine-renderer-design-20260710-020331.md` — office-hours doc + 12 eng amendments + 7 design-review amendments (#13–19) + GSTACK REVIEW REPORT. Status APPROVED; eng review CLEAR (27 issues, 0 critical); design review CLEAR (7→9/10).
- **Test plan artifact (for /qa):** `~/.gstack/projects/Revora/tefera-feat-video-engine-renderer-eng-review-test-plan-20260710.md`
- **External design file (visual reference):** `/home/tefera/Downloads/Revora.dc.html` — covers shell, home (3 states), check (all states), onboarding (3 steps), signin, account, subscribe. Uses exact DESIGN.md tokens. Verdict day-markers carry ICONS (shape channel — keep).
- **Approved wireframe (earlier, rough):** `/tmp/gstack-sketch-1783663195.html`

### Locked decisions (do not re-litigate; founder confirmed each)
1. **Approach B**: full `(app)` shell + dashboard; A's composed landing = milestone 1 inside B. Retention bet kept against two independent challenges ("product's soul").
2. **Hybrid guest dashboard (P0 fix):** product is guest-first ("No login for your first checks", localStorage history). Session → server-rendered dashboard; no session → client `GuestDashboard` from `historyStore`; NEVER redirect unauth → /signin. `FirstRunGate` (guest branch only) routes brand-new visitors → `/onboarding`.
3. **Data window:** dashboard uses the SAME 35-day/limit-500 query as `app/api/coach/route.ts` — a 7-day fetch silently caps `computeStreak` at 7 (outside-voice catch). 7-day strip derives in JS.
4. **verdictWeekView** (worst-verdict-per-day) extracted from `app/history/page.tsx` inline logic into `lib/coach/days.ts`, shared client+server. Verdict colors KEPT (information, not decoration).
5. **Plan box = display-only entitlement read:** `getEntitlement` WITHOUT `refreshPlaySubscription` (no Play API in render). Granting paths keep verify-on-read. `Entitlement` type now carries `currentPeriodEnd`.
6. **Insight:** server = `computeCoachView` (daypart-or-null; food-blind by design). Client hydration (`DashboardInsight`) upgrades to `repeat_meal` via `loadHistory()` — swaps text in the existing card only, never adds/removes the card. Below 5 checks (MIN_CHECKS_FOR_INSIGHT, now exported): hidden. Fallback text when ≥5 checks but no daypart insight.
7. **PWA identity:** `manifest.webmanifest` got `"id": "/check"` (pins identity to the OLD start_url so installs aren't orphaned) + `start_url: "/home"`. TWA `.aab` rebuild deferred (TODOS.md).
8. **Start URL = dashboard (`/home`)**, `/check` stays a focused page; at <768px the check CTA is the FIRST interactive element above the fold.
9. **Evidence checkpoint recorded pre-M1:** founder-attested 0 non-founder returning users (prod DB NOT queried — credentials access declined in-session). Re-run as a real query at the pre-M2 gate.
10. **Mobile nav: NO hamburger** — top bar = brand + Account pill; Week/Progress are dashboard sections. Sidebar (280px) appears at exactly ≥1024px.
11. **Streak chip → additive copy:** "N days this week" (`daysThisWeek` prop), never "Day N streak". computeStreak still runs internally for first-win.
12. **Premium tease:** free users see static example bars labeled "Example — this is how it looks" + upgrade link; NO blur/locks. Premium: real BAI bars (adherence/consistency/action + qualitative captions). Hidden entirely below 5 checks, or premium-with-no-baiWeekly-row.
13. **Reassurance not gamification** (binding, now in DESIGN.md §Progress surfaces): additive framing, neutral unchecked days, labeled examples, icons in verdict marks (colorblind channel), per-day sr-only sentences.
14. **Route groups:** `(app)/layout.tsx` nests inside root layout (NEVER a second root layout — full-remount footgun). URLs unchanged by migration.

## 3. Implementation state (worktree)

### DONE — committed in `dfc1580`
| Area | Files |
|---|---|
| verdictWeekView + /history switch | `lib/coach/days.ts` (new fn + types), `app/history/page.tsx` (consumes shared fn) |
| Tests: verdict week (4, incl. legacy-parity REGRESSION) | `tests/unit/coach/verdict-week.test.ts` — all green |
| Entitlement `currentPeriodEnd` | `lib/server/entitlement.ts` (type + 3 return sites); flows to `/api/entitlement` automatically (handler spreads) |
| Tests: entitlement (+3 new incl. display-only read) | `tests/unit/server/entitlement.test.ts` (20 green), `tests/unit/server/billing-routes.test.ts` (updated toEqual, 21 green) |
| (app) shell | `app/(app)/layout.tsx` (server; skip link, sidebar, topbar, plan box), `components/app-nav.tsx` (client, aria-current), `components/plan-box.tsx`, `lib/server/plan-box.ts` (React cache()d display read, degrades to guest box on DB failure) |
| Shell + dashboard CSS | `app/globals.css` — appended "App shell" + "Dashboard" sections; tokens only; breakpoints <1024 / ≥1024(280px sidebar, content 1000) / ≥1440(1120); NOTE: content max 520px mobile (design file value, supersedes the older 480/720/860 table in the design doc) |
| Icons | `components/icons.tsx` + IconHome, IconPerson, IconCheckCircle (11→14 glyphs) |
| Dashboard | `app/(app)/home/page.tsx` (server: 35d query, computeCoachView, verdictWeekView, decrypted today list via safeDecrypt, progress rules, plan box), `components/dashboard-view.tsx` (ONE prop-driven tree, both variants), `components/guest-dashboard.tsx`, `components/dashboard-insight.tsx` (hydration), `app/(app)/home/error.tsx` (error boundary w/ working check CTA) |
| Start URL flip | `public/manifest.webmanifest` (id "/check", start_url "/home"), `app/welcome/page.tsx` (2 redirects → /home), `components/streak-chip.tsx` (additive copy), `components/daily-loop.tsx` (daysThisWeek state) |
| Spec updates | `tests/smoke/pwa-assets.spec.ts` (id + start_url assertions), `tests/smoke/daily-loop.spec.ts` ("1 day this week") |

**Verification so far:** typecheck clean; 209 unit tests green (incl. claims-boundary copy audit over streak-chip); NO smoke/Playwright run yet; NO visual check yet.

### DONE — UNCOMMITTED (DESIGN.md amendments, task #16)
`DESIGN.md` in the worktree: 480px line amended (§Shape & space); class vocabulary extended; §Day-1 "ONLY ornament" line amended; NEW §"Progress surfaces — reassurance, not gamification"; NEW §"App shell" with canonical breakpoint table (520/1000+280/1120, nav flips at 1024); §Icons list +3 glyphs. **Commit this next.**

### Task list state (worktree session tasks #10–19)
- #10 evidence checkpoint ✅ · #11 verdictWeekView ✅ · #12 entitlement ✅ · #13 shell ✅ · #14 dashboard ✅ · #15 start URL ✅ · #16 DESIGN.md ✅ (uncommitted)
- **#18 tests — IN PROGRESS, interrupted.** Was about to write `tests/smoke/dashboard.spec.ts`. Harness notes: baseURL `http://127.0.0.1:3100` (webServer in playwright.config.ts); auth E2E auto-skips without `DATABASE_URL`+`AUTH_EMAIL_STUB_DIR`; a11y spec warms routes first (cold-compile aborts, retries 2); daily-loop spec seeds guest data by stubbing `/api/check` (`stubModerate`) then checking a meal via `/check?stay=1`.
- #17 M2 migration — pending. #19 verify — pending.

## 4. What to do next (in order)

1. **Commit the DESIGN.md amendments** (small commit).
2. **Finish #18 — `tests/smoke/dashboard.spec.ts`:**
   - CRITICAL REGRESSION: brand-new visitor (empty localStorage) at `/home` → redirected to `/onboarding` (FirstRunGate).
   - Guest day-0 with `?stay=1`: `dash-day0-note` visible, `dash-check-cta` visible; at 375×667 viewport the CTA's boundingBox is above the fold; topbar visible, sidebar hidden.
   - Guest with checks (seed via stubModerate + run a check on `/check?stay=1`, then goto `/home?stay=1`): week strip shows a risk-marked day, today-list shows the meal, summary says "1 meal checked this week."
   - 1280px: sidebar visible w/ `aria-current="page"` on Home; skip link focuses `#app-content`.
   - Extend `tests/smoke/a11y.spec.ts`: add `/home` (+ `?stay=1`) to routes and axe-check both shell widths.
   - `/welcome` → `/home` redirect assertion lives in auth.spec.ts (DB-gated; add if env present).
3. **#19 verify M1:** `npm run typecheck && npm test`; targeted `npx playwright test tests/smoke/dashboard.spec.ts tests/smoke/daily-loop.spec.ts tests/smoke/pwa-assets.spec.ts` (webServer boots dev on :3100; note trial-wall :3101 suppression rule in playwright.config.ts comments); then boot dev server and screenshot `/home` at 375/768/1280 in day-0 + established states against `/home/tefera/Downloads/Revora.dc.html`.
4. **#17 M2 — migrate pages into `(app)` + re-skin per the design file**, cluster PRs/commits, existing suites green per cluster, conversion flows LAST:
   - Cluster 1 (static/legal): `privacy`, `terms`, `how-it-works`, `get-the-app`, `demo` — move into `(app)/`, swap `page-shell/page-frame` wrapper for shell content (keep copy).
   - Cluster 2: `history`, `progress` → become dashboard sections; keep routes as redirects to `/home` (or slim pages linking back). Design file folds them into home.
   - Cluster 3: `check` re-skin per design (methods row `.methods`, loading steps `.lsteps`, result card layout, days-chip, daily-limit upgrade card). DO NOT touch `lib/revora/` engine. `checks.inputMethod` photo hint copy in design file is guidance-only.
   - Cluster 4: `account` (add renewal date row — data now in `/api/entitlement`; cancel → "access until" banner exists), `signin` (+check-email), `onboarding` (3-step per design; MUST keep verbatim legal line "Reversal is achieved through your dietary choices — Revora gives you the clarity to make them.").
   - Cluster 5 (LAST, conversion): `subscribe` (adds grid, 3 plan options, trial timeline, promise box), `trial/started`, `canceled`. Playwright `trial-wall.spec.ts`, `billing-pages.spec.ts`, `onboarding.spec.ts` green before merge.
   - Translation law: radii from scale (24/18/14/999), 1px `border-soft` card borders, the one shadow, no `.verbatim` left-border (use `surface-muted` inset), tokens only.
5. **Pre-M2 gate:** run the real count query (non-founder users with checks on ≥2 distinct days) against prod — founder may proceed regardless but the number gets recorded in the design doc.
6. **Ship:** merge worktree branch → PR against main (branch name suggestion: `feat/app-shell-dashboard`). /ship flow; then `/qa` using the test-plan artifact; day-3 user observation assignment (recruit 3 people from `video-engine/input/2026-07-09-voc-dump.md`).

## 5. Codebase facts discovered (save future digging)

- **Guest-first seam:** `lib/client/remote-history.ts` `loadHistory()` = server for signed-in, localStorage fallback; `syncLocalHistory()` merges on sign-in. `components/first-run-gate.tsx` routes new visitors (`?stay=1` escape hatch).
- **Coach compute contract:** `computeCoachView(rows, timezone, now)` expects the 35d/500 window; deliberately food-blind (`food: ""`) so `repeat_meal` never fires server-side. `lib/coach/days.ts` is the one day-math module (profile tz via `profiles.timezone`, default `America/New_York`).
- **Crypto:** `HEALTH_DATA_KEY` is server-held; server components CAN decrypt (`decryptField`); safeDecrypt degrades to "(unreadable entry)".
- **Entitlement:** `PREMIUM_STATUSES = active|trialing|grace|canceled` (canceled counts until paid-through); verify-on-read heals stale Play rows ONLY when `refreshPlaySubscription` is injected.
- **countChecksToday:** fetches last 48h, buckets in profile tz in JS — the pattern for tz-correct day queries.
- **TWA:** `twa-manifest.json` `startUrl` compiled into `.aab`; unchanged (TODOS.md entry exists for rebuild).
- **middleware.ts** only rate-limits `POST /api/check*` — no auth routing anywhere.
- **Codex CLI times out** (5 min, 2×) in this environment — go straight to Claude-subagent fallback for outside voices (learning logged).
- gstack learnings logged: `dashboard-reassurance-surface`, `coach-window-35d-contract`, `guest-first-funnel-constraint`, `revora-progress-surface-rules`, `dashboard-full-shell-by-conviction`.

## 6. Repo/session mechanics for the next session

- Main checkout is on `feat/video-engine-renderer` with UNCOMMITTED video-engine work — DO NOT touch; all dashboard work stays in the worktree.
- Resume: `EnterWorktree` with `path: /home/tefera/Desktop/Revora/.claude/worktrees/app-shell-dashboard` (deps installed; vitest + typecheck work).
- `PRODUCT.md` was created at the MAIN repo root this session (register: product) — currently only in the main checkout's working tree, uncommitted; the worktree doesn't have it. Decide where it lands when merging.
- TODOS.md (main checkout, uncommitted edits): added "TWA .aab rebuild" + "Daily Letter evolution (Approach C)".
- Pricing on the subscribe screen is HYPOTHESIS-grade ($12.99/$99/$249 proposed — see docs/product-marketing.md Open Decisions #1); design file shows these values; don't present them as locked when re-skinning subscribe.
