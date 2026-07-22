# C7 Four-Jobs Restructure + B3 Residuals — Implementation Plan

**Date:** 2026-07-21 · **Branch:** `feat/c7-four-jobs-and-audit-residuals` (off `main` @ `2f758e0`)
**Spec:** `docs/handoff/2026-07-21-revora-phase0-access-billing-e2e-and-finite-program-execution-handoff.md` §C5/§C7
**Constraint:** engine/billing behavior unchanged; all copy through the claims boundary; flags stay OFF.

## Current state (survey findings)

- Nav (`components/app-nav.tsx`) has 3 links: Home, Check a meal, Account. `/history`, `/progress` reachable only via inline links; `/memory` has **zero** inbound links. Mobile (<1024px) has no nav at all except a topbar Account link.
- `/home` renders: first-win, greet, check hero, week strip, today list, **PlanBox (duplicated — also in sidebar), insight card, BAI progress bars** — the C7 "clutter".
- BAI score (`lib/coach/bai.ts`): adherence (days/7) ×0.50 + consistency (checks/21) ×0.30 + action ×0.20 → **80% usage frequency** (RV-3 defect). Shown on `/home` (bars) and `/progress` (band + bars) via two divergent code paths with different labels.
- Weekly brief (`lib/journey/weekly-learning.ts`) is a deterministic re-count: mealsExplored, savedChoices, contextsCovered, repeatedUncertainty, incompleteSteps, nextExploration (RV-6 defect).
- No support UI anywhere; refund path is prose in /terms. `/api/account/export` linked from no UI.
- `NEXT_PUBLIC_PHOTO_INPUT` / `NEXT_PUBLIC_LONGITUDINAL_INSIGHTS` have no server twins (build-time only kill switch). Both set in Vercel **production only**.
- `/history` h1 is literally "Meal memory" while `/memory` h1 is "Your meal memory" — naming collision.

## Plan

### 1. Nav + shell (four jobs + the core action — design-review D4)

- **Mobile (<1024px):** fixed bottom tab bar, FIVE slots: Home `/home` · My meals `/meals` · **Check** `/check` (center, accent-filled action) · My journey `/journey` · Account `/account`. ≈75px per item at 375px, all ≥44px targets.
- **Desktop sidebar:** Home · Check a meal · My meals · My journey · Account (5 links; current Check link preserved).
- **Tab-state on non-tab routes:** `/check` → center action active; `/subscribe` → Account active; other routes → no active item. `aria-current="page"` only on exact matches.
- Topbar keeps brand; drop the lone Account link (now in tabs). Still no hamburger.
- **Merge-day visibility (flags stay OFF):** what a live user actually sees on deploy: the new nav/tab bar, the decluttered Home + next-action line, /meals (history content; memory section hidden), /journey (recap + week facts; brief/stage sections hidden), the Account help/refund form + export link, and the redirects. Everything flag-gated ships dark, as spec'd.

### 2. Route moves (redirects, no engine change)

| Old | New | How |
|---|---|---|
| `/history` | `/meals` | `git mv` page dir; permanent redirects in `next.config` for `/history`, `/memory`, `/progress` |
| `/memory` | folded into `/meals` | memory list/edit/export as a "Saved meals" section, rendered only when `mealMemoryUiEnabled()`; flag-off shows nothing (no "not on your plan" noise) |
| `/progress` | `/journey` | `git mv` + rename copy |

APIs: no breaking changes; `/api/coach` response extended additively (see §5). Rename collateral (outside voice #9): `app/robots.ts` `DISALLOWED_PATHS` swaps `/history`,`/progress` → `/meals`,`/journey` (and adds `/memory`-era gap closure by covering `/meals`); `tests/unit/revora/seo-meta.test.ts:47` updated; internal links move off the redirect hop (`check/page.tsx:67-68`, `how-it-works:111`, `daily-loop.tsx:152`, progress footer).
**/meals combined-state matrix (design voice #7):** one page-level loading treatment; each section's error is section-scoped and never blanks the sibling; both-empty collapses to ONE merged empty state; search/filter scopes recent checks only (saved list is short and scannable). Test: history-ok + memory-error renders history intact.

### 3. Home — "help me decide now"

Keep: greet, check hero, **Today** list (today's decisions), first-win block.
Add: ONE "next action" line (deterministic: no checks today → "Check your next uncertain meal"; ≥1 check with non-SAFE undone action → "Mark what you did"; else → link to this week's brief on /journey).
Remove from Home: **insight card** (moves to /journey), **BAI ProgressCard** (deleted — see RV-3), **week strip** (moves to /journey as part of the recap).
**PlanBox (eng-review D2):** conditional on Home — rendered only when it carries actionable billing truth (`trialing`, cancel-scheduled, payment-issue); hidden for steady-state "Renews {date}" and free-plan upsell. Sidebar (desktop) and /account keep the always-on version. Rationale: mobile has no sidebar; deleting the card entirely would hide "Trial ends {date}" from the primary mobile surface (BC-2 spirit).
**Day-0 + guest Home (design voice #2 / outside voice #4):** the week strip was Home's sanctioned Day-0 empty state — its replacement is explicit: the Today card's empty state carries the warmth (`dash-preview-note` posture: "Your checks will appear here — today stays quiet until you check a meal, never marked against you.") + the hero as the one CTA. `GuestDashboard` shares `DashboardView`, so guests get the same decluttered composition; the free-tier example-bars upsell (`dashboard-view.tsx:171-186`) is deleted from Home deliberately — the upsell now lives in /journey's single locked section. `tests/smoke/dashboard.spec.ts` (asserts `dash-week`/`dash-progress`/`dash-insight`) is updated in the same commit — the 1805 baseline changes by design here, and §11 owns it.

### 4. My Meals — "help me remember what worked"

`/meals` = current history page reframed: h1 "My meals", sections: search/filter, Saved meals (memory, flag-gated, curated-first when non-empty), recent checks (auto record), export links. Per-row actions: recheck primary; delete secondary behind an inline confirm step (destructive-action hierarchy — Codex #9). One page, one mental area; history/memory stay separate APIs underneath.

### 5. My Journey + RV-3 — "show me what I'm learning"

- `/journey` = current progress page, restructured as ONE document (see Design specifications → Journey composition rules): "Where you are" / "What you learned this week" / "Try this next" / "Your week". The **non-scored recap facts** replace the BAI band; the weekly brief (flag-gated) and insight fold into section 2; the artifact's experiment renders once as section 3's primary action; JourneyCard's pause/graduate/maintenance actions live in section 1.
- **Single-source rule (eng review, corrected per outside voice #1):** the recap renders ONLY from `/api/coach` — but the route as-is cannot supply it (`weekView` lacks per-day verdicts; contexts live only in the flag-gated weekly artifact). Fix: `/api/coach` gains **additive** response fields — `verdictWeek` (from `verdictWeekView`, the same server-side derivation Home uses today) and the recap facts. §2's "APIs unchanged" is amended to "no breaking API changes; `/api/coach` response extended additively." Recap facts are only what the route can serve every tier honestly: days checked + follow-through (when `prompted > 0`, from `latestBai` raw fields) + the verdict week. `contextsCovered` stays in the weekly brief (flag-gated) where it comes from. No direct DB reads from the page.
- **Free-tier /journey (design voice #3 — never a full-page paywall):** streak/week facts come from `computeCoachView` for every signed-in tier, so free users get real content: "Your week" (verdict strip + counts) renders free; the premium brief/recap-extras appear as ONE clearly-labeled locked section (the existing `progress-locked` card demoted from whole-page to section). Guests keep the existing unauthenticated sign-in state. This satisfies DESIGN.md "never dead-end a paid or signed-in user" now that /journey is a permanent tab.
- **Recap shape (design voice #5):** one `surface-card`: `hero-eyebrow` "Week of {date}" + 2–3 plain `page-copy` sentences (typography, not chrome, no bars, no stat tiles). `prompted === 0` is a sentence swap, not a layout change.
- **Next-action precedence (design voice #6):** Home shows exactly ONE next action for *today*; /journey shows exactly ONE experiment for *this week* (the artifact's `experiment`, else the deterministic fallback); stage controls in "Where you are" are not next-actions. Unit test: at most one `[data-testid="next-action"]` element per surface.
- **RV-3 fix (spec option b — replace the scored band with a non-scored recap):** delete the user-facing score/band/percent-bar rendering on both `/home` and `/journey`. The recap states facts that cannot "decline": days you checked, follow-through when prompted (only when `prompted > 0`), contexts covered. No composite, no band word, no percentages. `bai_weekly` cron/table stay (internal S2 measurement); `/api/coach` keeps returning `latestBai` but the UI stops scoring it. Copy asserts the C7 posture: checking less as confidence grows is expected, never framed as decline.
- Kills the "No score to chase." vs percentage-bars contradiction and the two-code-paths label drift (both scored surfaces are deleted).

### 6. RV-6 — make the weekly brief useful

`lib/journey/weekly-learning.ts` artifact gains two derived fields (version bump → "2", lazy recompute already handles old rows):
- `experiment`: one concrete, claims-safe suggestion derived from the user's own data — priority: repeatedUncertainty item (e.g. re-check with portion named) → uncovered context from CONTEXT_LABELS → stage intent fallback.
- `uncertaintyToClose`: the single highest-signal open question (repeated non-SAFE food or missing context), stated as the user's own data, no clinical language.
UI leads with these two instead of the counts; counts become secondary. All copy through `assertNoForbiddenClaims` + contract test.

### 7. Server-twin flags (corrected per outside voice #8)

- `lib/photo-input-flag.ts` + `lib/longitudinal-insights-flag.ts` **already exist** (single `NEXT_PUBLIC_*` read). This work EXTENDS them to the meal-memory twin shape: keep/rename to `photoInputUiEnabled()` + add `photoInputServerEnabled(env)` (`PHOTO_INPUT_ENABLED`); same for longitudinal insights. All existing call sites updated in the same commit (`components/food-check-form.tsx:391` stays UI; `app/api/check/photo-draft/route.ts:62` and `app/(app)/home/page.tsx:160` switch to the server fn).
- `/api/coach` has NO insight flag gate today — adding the server-flag gate there is a **behavior change** (insight nulls when the server flag is off) and gets its own regression test.
- **Rollout guard, enforced:** set `PHOTO_INPUT_ENABLED=1`, `LONGITUDINAL_INSIGHTS_ENABLED=1` in Vercel prod *before* merge, AND extend the existing build-time env check (the one that fails on missing Umami) to fail when a `NEXT_PUBLIC_*` flag is "1" but its server twin is unset — the mismatch can never ship silently.

### 8. HS-3 exemption (flag stays off; mechanism per outside voice #10)

`lib/revora/postprocess.ts`: skip the component-mention throw when a floor replaced the draft (template copy is pre-audited and may legitimately not name a user token). **Mechanism:** the exemption keys off the LOCAL floor decision inside `postprocessModelOutput` (the code path that applies the floor knows it applied) — NOT `context.snapshot?.floorApplied`, which is an optional sink and would make the exemption caller-dependent. Regression tests: floored draft + enforcement on → no `RevoraContractError`, asserted through a sink-less call (the path that would previously throw).

### 9. P0.4 — in-account help/refund flow

- Migration 0014: `support_cases(id, user_id FK **onDelete: cascade** (explicit — schema convention), kind CHECK in ('help','refund'), message_ciphertext, status CHECK in ('open','resolved') default 'open', created_at, resolved_at)`. (Outside voice #5 argued the table earns nothing — the handoff's P0.4 mandates an authenticated case ledger, so it stays; #6's obligations are discharged below.)
- **Data-rights completeness (outside voice #6):** `/api/account/export` gains the user's support cases (decrypted message, kind, status, dates) — user-authored content is a personal-data category, same PR as its creation. Account deletion cascades the rows (explicit `onDelete`); the plan accepts that an open refund case's row dies with a user-initiated deletion — the support-inbox email survives as the operational copy, and the refund itself lives in Stripe. Stated, not accidental.
- **Rate limit (outside voice #7):** new `supportCase` bucket in the `LimitBucket` union + `matchRouteLimit` table entry; **fail-CLOSED** per the file's own policy for email-sending routes (protects Resend sender reputation). Tight budget (e.g. 5/day/user).
- `POST /api/support/case` (session-required, rate-limited via existing limiter pattern): insert row (message encrypted via `encryptField`), `sendEmail` to `SUPPORT_EMAIL` (case id + kind + account email + full message — eng-review D3: same exposure class as users emailing support@ directly per /terms), return `{ caseId }`. Email failure does not lose the case (row is written first; email result logged).
- **Input validation (trust boundary):** kind whitelist `help|refund`, trimmed non-empty message, 2000-char cap; 400 otherwise.
- Account page: new "Help & refunds" section (above delete/danger area): kind select + textarea + submit → inline confirmation with case id + SLA copy ("We reply by email within 2 business days.") + refund-window restatement linking /terms. Copy through claims/contract gates.
- **Form states (design voice #9):** submitting = disabled button with pending label; live character count as `field-hint`, flipping to `field-error` at 2000 (never lose typed text to a server 400); selecting "refund" swaps the refund-window copy inline BEFORE submit; post-success replaces the form with the confirmation (case id retained on screen) + a "Send another message" link that restores the form.
- Ponytail scope: no case-list UI, no admin table (owner works from the support inbox; `status` column exists for a later admin surface).

### 10. Account tidy + export link

Order: Plan → Reminders → Help & refunds → Privacy & data (add **Download your data** → `/api/account/export`; existing health-data withdraw; analytics opt-out) → Session → Delete account. No behavior changes beyond the additions.

### 11. Tests / gates (eng-review complete list — 24 paths, 3 mandatory regressions)

Unit:
- Home: PlanBox conditional (trialing / cancel-scheduled / payment-issue shown; steady + free hidden) — **regression, mandatory**; next-action 3 branches; no score/band/percent for premium fixture (RV-3).
- /meals: flag-off ⇒ no memory section and no upsell noise; flag-on ⇒ saved-meals section (env-injected flag matrix).
- /journey recap: `prompted === 0` note branch — **regression**; recap facts only, no score/band/percent in DOM (RV-3); guest/free/premium states.
- weekly-learning v2: experiment priority (repeatedUncertainty → uncovered context → stage intent); version bump recomputes old row; claims-boundary scan extended to new copy.
- Flag twins: ui×server matrix for both new modules (copy the meal-memory matrix test); photo-draft route 404s on the **server** flag — **regression, mandatory**.
- HS-3: floored draft + enforcement on ⇒ no RevoraContractError; non-floored missing mention + enforcement on ⇒ still throws.
- Support case handler: 401 / 400 (bad kind, empty, >2000) / 429 / success writes row + sends email / email failure still returns caseId.
- Nav: 4 links + aria-current.

E2E (viewport-conditional per project — outside voice: projects are Pixel 5 / iPhone 12 / Desktop Chrome, so tab-bar specs run on the two mobile projects only, sidebar specs on desktop only; shared specs run everywhere):
- Mobile projects: tab bar reaches all five slots (four jobs + Check center); content bottom padding clears the bar.
- Desktop project: 5-link sidebar; no tab bar rendered.
- All projects: old deep links /history, /memory, /progress 308 to the new pages and land on correct content; /meals merged surface (incl. history-ok + memory-error); /journey document (no band word, no percent; free-tier shows week facts + one locked section); account export link present; help/refund submit round-trips a case id (AUTH_EMAIL_STUB_DIR); at most one next-action element per surface.
- Existing specs updated by design: `tests/smoke/dashboard.spec.ts` (week strip/progress/insight moved or deleted), seo-meta path pin, any spec navigating old routes.

Gates: full §D suite; baseline: 1805 passed / 2 skipped — deliberate deletions (dash-progress etc.) are named in the ship notes, everything else must still pass.

### Copy table (design voice #10 — literal strings; all through claims boundary + contract)

| Surface | Element | String |
|---|---|---|
| Nav (all) | tab/side labels | "Home" · "My meals" · "Check" (center; sidebar: "Check a meal") · "My journey" · "Account" — sentence case everywhere, matching existing nav style |
| /meals | h1 | "My meals" |
| /meals | saved section h2 | "Saved meals" (kills the old "Meal memory"/"Your meal memory" collision; "meal memory" wording retired from headings) |
| /meals | recent section h2 | "Recent checks" |
| /meals | merged empty | "Your checked meals will collect here — each one becomes a note you can look back on." + "Check a meal" CTA |
| Home | next-action (3 branches) | "Check your next uncertain meal." / "Mark what you did after today's check." / "See what this week taught you." (link → /journey) |
| Home | Today empty | "Your checks will appear here — today stays quiet until you check a meal, never marked against you." |
| /journey | h1 | "My journey" |
| /journey | section heads | "Where you are" · "What you learned this week" · "Try this next" · "Your week" |
| /journey | recap eyebrow | "Week of {date}" |
| /journey | recap posture line | "Checking less as you get more confident is how this is meant to work." |
| /journey | prompted=0 swap | "No meals needed a follow-up this week." |
| /journey | locked section label | "Part of Premium" + existing upgrade link copy |
| /journey | first-recap empty | "Your first weekly recap arrives after a few days of checks." |
| Account | help section h2 | "Help & refunds" |
| Account | SLA line | "We reply by email within 2 business days." |
| Account | success | "Case #{id} received. We reply by email within 2 business days." |
| Account | email-fail next step | "If you don't hear back, email support@revora.plus directly." |
| Account | export link | "Download your data" |

Exact final strings may be adjusted ONLY to satisfy the claims scanner; any change lands in this table.

## Design specifications (from /plan-design-review 2026-07-21)

### Surface hierarchy (what the user sees first/second/third)

```
HOME (order locked — hero keeps     /MEALS                        /JOURNEY — ONE DOCUMENT, not a
above-fold dominance, Codex #8)     1 h1 "My meals"               card stack (D3, hard-rejection fix)
1 first-win (day 1 only)            2 search/filter + export      1 "Where you are" — stage context
2 greet (date + week line)          3 Saved meals (flag on,         + pause/graduate/maintenance
3 CHECK HERO (first interactive       non-empty; curated first)     actions (from JourneyCard)
  <768px — shell rule)              4 Recent checks (recheck      2 "What you learned this week" —
4 next-action line (one)              primary; delete secondary     brief (flag) or recap facts +
5 Today card (today's decisions)      w/ inline confirm)            insight folded in as a line
6 PlanBox — ONLY trialing/          5 load more                   3 "Try this next" — THE experiment,
  cancel-scheduled/payment-issue    6 disclaimer                    rendered exactly once (primary action)
                                                                  4 "Your week" — week strip + counts
                                                                  5 disclaimer + footer
```

**Journey composition rules (Codex hard-rejection fix):** four utility-headline sections in one document flow; typography, dividers, and rows — a card only where the element is interactive (the experiment action). Existing JourneyCard/LearningSummary render logic is folded into the sections, not stacked as sibling cards. The artifact's `experiment` is the page's single next-action; no second "next experiment" block.

**Card-necessity rule (all four surfaces):** cards are reserved for the meal-check hero, interactive forms, and bounded meal records; everything else is typography in the document flow.

Account order (eng §10): Plan → Reminders → Help & refunds → Privacy & data → Session → Delete.

### Bottom tab bar (<1024px) — the one new assembly

- Fixed bottom; `--surface` background; 1px top border `--border-soft`; 4 equal flex items.
- Item = sanctioned stroke icon (20px) above an 11px/600 label; NO icon-in-circle, no fills, no badges.
- Active: `--accent-strong` text + `aria-current="page"` (mirror sidebar treatment). Inactive: `--text-muted`.
- Targets ≥44px; `padding-bottom: env(safe-area-inset-bottom)`; `app-content` gains ~72px bottom padding at <1024px.
- One `AppNav` component, rendered in sidebar and tab-bar wrappers; the inactive wrapper is `display:none` (removed from the accessibility tree — no duplicate nav landmarks).
- Topbar (<1024px) keeps brand only; the Account pill moves into the tabs.
- Motion: none beyond the sanctioned hover/press layer.

### Icons (closed vocabulary — edit `components/icons.tsx` + DESIGN.md §Icons list)

- `IconBookmark` (My Meals — saved/remembered), `IconCompass` (My Journey — direction). Hand-written 24-viewbox strokes, `currentColor`, aria-hidden, always beside text.

### Interaction states

| Surface | Loading | Empty | Error | Success/partial |
|---|---|---|---|---|
| /meals | existing list skeleton/status | "Your checked meals will collect here — each one becomes a note you can look back on." + Check-a-meal CTA | existing error card | flag-off: memory section simply absent (no upsell noise) |
| /journey recap | existing /api/coach loading | <5 checks or no bai row: "Your first weekly recap arrives after a few days of checks." + CTA (existing empty-state posture) | existing retry + support path preserved | `prompted === 0`: follow-through swaps to "no follow-up prompts this week" note |
| Support form | button pending state | — | inline `field-error` + named next step: "email support@revora.plus directly" | inline confirmation: case id + "We reply by email within 2 business days." |
| Home next-action | server-rendered, no state | day-0 covered by existing `dash-preview-note` | — | one line, never two |

### Emotional arc line (claims-gated copy)

The recap header carries the RV-3 posture explicitly, e.g.: "Checking less as you get more confident is how this is meant to work." Framed additive per DESIGN.md §Progress surfaces; exact copy through `assertNoForbiddenClaims` + contract.

### DESIGN.md amendments (part of this diff)

1. §App shell breakpoint table, <1024px row: navigation becomes "bottom tab bar: Home · My Meals · My Journey · Account; topbar: brand only". Delete "NO hamburger — Week/Progress are dashboard sections, not destinations" (superseded by C7 four jobs; still no hamburger).
2. §App shell plan-box rule: record the D2 conditional — Home renders PlanBox only for actionable billing truth (trialing / cancel-scheduled / payment-issue); sidebar and /account always render the full box with the billing date. The "hiding the renewal date is banned" rule continues to bind every rendered plan box.
3. §Icons: add IconBookmark, IconCompass to the sanctioned list.
4. §Progress surfaces: replace the "weekly progress bars (`dash-bai-*`)" rule with the non-scored recap rule (facts that only grow; no composite, no band words, no percentages — RV-3).

### Out of scope (unchanged gates)

Flag flips (S1/S2), pricing numbers, clinical banding (HS-2/4/5), HSTS preload, DMARC tightening, counsel items. BAI cron/table retirement decision stays with the owner (TODOS.md). Admin support-case viewer deferred (TODOS.md, trigger: ticket volume). 16-journey E2E completion is incremental follow-up, not this PR's gate.

### What already exists (reused, not rebuilt)

History/memory/progress/account pages and their APIs; `lib/meal-memory-flag.ts` twin pattern (copied verbatim for the two new flag modules); `sendEmail` + `AUTH_EMAIL_STUB_DIR` seam; `encryptField`; billing rate-limiter pattern; `check_feedback` reviewed-queue shape (schema precedent for `support_cases`); `/api/coach` (already returns `insight`, `latestBai` raw fields, `prompted` — journey needs zero new API); `JourneyCard`/`LearningSummary` components; claims-boundary copy scanner.

### Failure modes (each has a test + visible error per §11)

| Path | Realistic failure | Covered |
|---|---|---|
| Support case POST | Resend down after row write | caseId still returned; failure logged; test asserts it |
| Support case POST | Rate-limit hit | 429 with visible form error; test |
| /journey recap | `prompted === 0` week | note swap, never blank; regression test |
| Redirects | Stale SW serving old route shell | build-stamped SW (RE fix) invalidates on deploy; E2E hits fresh server |
| Flag twins | Server env var unset at deploy | fail-closed 404 — mirrors current behavior only if Vercel vars set BEFORE merge (plan §7 rollout guard) |
| PlanBox conditional | Entitlement read fails | existing getPlanBox guest-box degradation unchanged; card simply hidden |
| Weekly artifact v2 | Old v1 row in DB | version-gated lazy recompute (existing mechanism); unit test |

No critical gaps: every new path has a test, error handling, and a visible state.

### Parallelization

| Step | Modules touched | Depends on |
|---|---|---|
| Nav + shell + tab bar | components/, app/(app)/layout | — |
| Route moves + redirects | app/(app)/, next.config | — |
| Home declutter + PlanBox conditional | app/(app)/home, components/dashboard-view | Route moves |
| /meals merge | app/(app)/meals | Route moves |
| /journey + RV-3 recap | app/(app)/journey, components/ | Route moves |
| RV-6 artifact v2 | lib/journey/ | — |
| Flag twins | lib/, app/api/check/photo-draft | — |
| HS-3 exemption | lib/revora/postprocess | — |
| P0.4 support flow | drizzle/, lib/server/db/schema, app/api/support, app/(app)/account | — |
| Account tidy + export link | app/(app)/account | P0.4 (section order) |

Lanes: A) routes → home/meals/journey (sequential, shared app/(app)/). B) RV-6 (independent). C) flags + HS-3 (independent, lib/). D) P0.4 → account tidy (sequential). A–D parallelizable in principle; executing sequentially in one session to keep the migration + test baseline coherent.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 1 | issues_found (design voice) | REJECT→fixed: journey card-stack hard rejection + 8 findings, all integrated |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR (PLAN) | 7 issues (D2 PlanBox, D3 case email + 5 notes), 24 test paths, 0 critical gaps |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | CLEAR (FULL) | score 6/10 → 9/10; 4 decisions (D1 depth, D2 voices, D3 one-document journey, D4 5-slot nav); voices: Codex 9 findings + eng cold-read 10 findings + design cold-read 10 findings, all integrated or explicitly declined (OV#5 table stays per handoff P0.4) |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **CROSS-MODEL:** both cold readers independently flagged the nav demotion of "Check a meal" (→ D4: 5-slot bar) and the journey paywall-as-tab (→ free-tier journey section). Codex + Claude agreed on the journey card-stack rejection (→ one-document).
- **UNRESOLVED:** 0
- **VERDICT:** ENG + DESIGN CLEARED — ready to implement
