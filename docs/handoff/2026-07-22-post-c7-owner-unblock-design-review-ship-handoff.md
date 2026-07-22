# Revora — Session Handoff: Owner-unblock + C7 deploy + post-deploy design review SHIPPED (PR #25 open, CI pending)

**Written:** 2026-07-22 (early morning) · **For:** the next session · **Branch:** `fix/design-review-post-c7` (pushed, 18 commits ahead of `main`)
**PR:** **https://github.com/tkiros/Revora/pull/25** — OPEN, CI was PENDING at session end (secret scan + Vercel preview already green). Working tree: **CLEAN.**

This closes out `docs/handoff/2026-07-21-c7-shipped-deploy-residuals.md` §B (deploy flow) and §C1/C2 (owner blocks), and executes the C7 plan's §B4 deferred post-deploy design review. Plan of record for the C7 cycle stays `docs/plans/2026-07-21-c7-four-jobs-plan.md`.

---

## A. DONE this session (all verified)

### A1. Owner blocks closed (were §C of the previous handoff)

1. **Sentry client DSN — DONE end to end.** Owner pasted the client DSN; `NEXT_PUBLIC_SENTRY_DSN` set in Vercel **Production + Preview** (via `vercel env add`; the raw REST API 401s with the CLI token — use the CLI). Verified live in shipped JS chunks after the PR #24 deploy. **BUT** the probe then found CSP `connect-src` blocked the ingest origin — every envelope POST died in console. Fixed on PR #25 (see A4). Until #25 deploys, Sentry client is armed but mute.
2. **Stripe webhook — DONE except one owner click.** The MCP OAuth was NOT actually authenticated before (only the `authenticate` stub was exposed — the "authorization URL" comes from *calling* that tool). Owner completed OAuth. Account verified as the right one: **acct_14W8GFKweWSWjefk** ("Vendoval") — carries the live `Revora Premium` / `Revora Pantry Review` products (`metadata.app=revora`). Existing endpoint found: **`we_1TqNZLKweWSWjefk1MkEUChd`** → `https://revora.plus/api/billing/stripe/webhook`, Active, 0% error rate — so NO new endpoint, NO secret rotation (handoff rule respected). It listened to 5 events; owner added the missing **`invoice.payment_failed`** in the dashboard (event-list edit, secret unchanged). All 6 events now bound.
   ⚠ The Stripe MCP's allowlist has NO webhook-endpoint operations (list/create) — dashboard is the only path for webhook management. `stripe_api_search` for webhook/event resources returns empty; this is deliberate (signing secrets).
3. **Migrations 0014 + 0015 applied to prod Railway.** `DATABASE_URL=$(railway variables --service Postgres --json | jq -r .DATABASE_PUBLIC_URL) npx drizzle-kit migrate` → journal **14 → 16 rows**; verified `support_cases_user` composite index `(user_id, created_at DESC)` exists on prod and matches `drizzle/0015_support-cases-user-index.sql` exactly.

### A2. PR #24 merged + deploy verified

Merged `23387cf` (merge-commit convention). Vercel prod build green (= the twin-flag check). Verified on revora.plus: `/api/health` ok (db ok, upstash configured, checkout open) · `/home` `/meals` `/journey` 200 · `/progress`→`/journey`, `/history`→`/meals`, `/memory`→`/meals` all **308** · desktop `app-nav` + mobile `app-tabbar-nav` both render · `/api/support/case` 401s unauthenticated. Crons still stale (`nudge`/`trialPrecharge`/`pantrySweep`/`stripeReconcile`) — pre-existing owner item, only `bai-weekly` in vercel.json.

### A3. Post-deploy /design-review (C7 §B4) — executed, fixes on this branch

**Scores: Design B+ · AI Slop A.** Full report + 13 screenshots: `~/.gstack/projects/Revora/designs/design-audit-20260721/` (`design-audit-revora.plus.md`, `design-baseline.json` for regression mode). Live audit + Codex source audit + Claude consistency subagent (29 findings, 6 critical).

**User-reported issues resolved:**
- **"A1C asked twice" — CONFIRMED bug, fixed.** Root cause: `profileStore.set` only ran on the step-6 classic tap; entering an A1C at step 4 and leaving via "Skip setup and check a meal" dropped it → /check re-asked, breaking step 4's "It stays on this device" promise. Final design (post-adversarial rework, see A4): persist fires in `skipTour()` and `startGuidedCheck()` — the two INTENTIONAL exits — never mid-tour, because `FirstRunGate` keys on a non-null profile and a mid-tour persist would mark tab-close abandoners as onboarded forever. Playwright regression pins the skip path (`tests/smoke/onboarding.spec.ts`).
- **"No voice input" — NOT A BUG.** `voice-input-button.tsx:45` hides "Say your meal" on browsers without the Web Speech API (iOS Safari, Firefox) and shows the keyboard-mic dictation hint instead. All three methods render in Chrome. Tell the owner which browser they tested in if it comes up again.
- **"Font should be different, not Times New Roman" — CONFIRMED, the biggest find of the session.** Production served correct CSS (`body{font-family:var(--font-sans),Arial,...}`, variable defined, bytes pristine across all encodings) yet Chromium computed body font as Times New Roman and the woff files never downloaded. A byte-identical rule inserted fresh via CSSOM applied fine — the var() indirection through the built stylesheet is what breaks (mechanism never fully explained; reproduced on a local production build). **Fix: `className={sans.className}` on `<body>`** (app/layout.tsx) — verified on local prod build: computed family = Plus Jakarta Sans, `document.fonts.check()` true. DESIGN.md §Type now documents this so nobody reverts to the var()-only path.

**Fixed on the branch (18 commits):** A1C persistence + regression e2e · step-6 copy honesty ("check runs right on the home screen" was false twice) · 44px touch floors (`.recheck-button`/`.action-done-button`/`.plan-box-link`, were 40px) · undefined `var(--text)` ×3 → `--text-body` · skip-link `top` animation removed · Home h1 (`dash-greet-date` p→h1, visually inert) · Home error card heading order AND its title is the h1 (boundary replaces the page h1) · /meals footer Home → `/home` (was `/`, exited the shell) · /meals + /journey document titles via thin metadata layouts · dead `.app-topbar-account` CSS deleted · **Sentry CSP fix**: `connect-src` gains the DSN's https origin via a shared `originFromEnv` helper (https-only; non-special schemes yield literal `"null"` origin) + positive/negative CSP tests · DESIGN.md (skeleton shimmer sanctioned, `dash-cta-button` rename ×2, §Type font mechanism) · docs/ops/env-reference.md DSN row · TODOS.md entries.

**Deferred to TODOS.md (structural, need a DESIGN.md decision each):** legacy `.week-strip` on /meals vs compliant `<WeekStrip>` (+ /check "See your week" routes to /meals) · `.app-content--narrow` 640px captured 3 of 4 surfaces vs the §App shell 1000/1120 table · journey nested cards / meals card mosaic · spacing/radius/type/icon drift · off-token colors (Home hero `#a9d2cb`/`#cfe4e0`, orange error pair, pasted moderate hexes) · /meals zero aria-live · `.check-hero` hides orientation copy at ≤430px · PlanBox can render without a billing date · **HARD GATE: saved-meals section is entirely unstyled (13 undefined CSS classes incl. `risk-chip` — verdict badges render as plain text) + hardcoded `★` glyph — invisible today ONLY because `MEAL_MEMORY_*` is OFF; must be styled before that flag ever flips.**
**Refuted from the audits:** tab-bar accent Check puck is NOT icon-in-circle slop — §App shell explicitly sanctions it.

### A4. /ship executed → PR #25

Review army on the branch diff (~200 lines): performance NO FINDINGS · design NO FINDINGS · testing 1 informational (Sentry CSP negative paths — fixed) · maintainability 1 informational (duplicated origin derivation — fixed, shared helper) · checklist pass clean.

**Adversarial (Claude + Codex), convergent P1 that changed the design:** the original fix persisted the A1C at step-4 Continue → permanently marks abandoners onboarded + redefines `onboardedAt`. Reworked to intentional-exit persistence (commit `18d829a`). Documented-not-fixed (accepted/pre-existing): `profileStore.set` swallows storage failures (documented contract); `new URL` vs Sentry-SDK DSN parser asymmetry (theoretical); date-as-h1 semantic weakness (tracked with the Today-card TODO).

**Gates, all fresh on the final tree:** typecheck ✓ · lint 0 errors (19 pre-existing warnings) · full unit suite ✓ (165 files) · contract all 9 gates ✓ · production build ✓ · e2e onboarding+dashboard+daily-loop+journey **24/24** (one cold-compile flake passed in isolation). Coverage audit: both risk-bearing fixes regression-locked; 5 cosmetic gaps closed with one-line pins; /home error-boundary heading intentionally uncovered (not e2e-reachable).

Docs sync (subagent): commit `74412b5` — DESIGN.md §Type + env-reference DSN row; truth-index deliberately unchanged (Sentry owner line still accurate until #25 deploys). No VERSION/CHANGELOG in this repo — N/A by convention.

---

## B. IMMEDIATE next actions (in order — this is the path to DONE)

1. **Check PR #25 CI** (was pending at session end): `gh pr checks 25`. All 4 checks must be green (typecheck·lint·contract·build / unit·evals / playwright / secret scan). If playwright fails, remember the flake discipline (§E) before believing it.
2. **Merge PR #25** (merge-commit convention, same as #23/#24): `gh pr merge 25 --merge`. No migrations on this branch — nothing to apply first.
3. **Post-deploy verification on revora.plus:**
   - **Font:** browse to `/home`, run `getComputedStyle(document.body).fontFamily` → must be `"Plus Jakarta Sans", "Plus Jakarta Sans Fallback"` (NOT Times New Roman) and `document.fonts.check('16px "Plus Jakarta Sans"')` → true. Also just LOOK at a screenshot.
   - **Sentry CSP:** `curl -sI https://revora.plus/home | grep -i content-security` → `connect-src` must contain `https://o4511672801820672.ingest.us.sentry.io`. Then confirm no CSP-blocked Sentry errors in the browser console.
   - **Titles:** `/meals` tab shows "My meals — Revora", `/journey` shows "My journey — Revora".
   - **A1C flow:** clear storage → walkthrough → enter 6.1 at step 4 → "Skip setup and check a meal" → /check shows 6.1 prefilled.
   - Legacy 308s + `/api/health` still ok (30 seconds).
4. **Owner browser actions (only the owner can do these):**
   - **Stripe test round-trip:** dashboard → the `revora.plus/api/billing/stripe/webhook` endpoint → **⋯ → Send test event** → `charge.refunded` → expect 2xx delivery.
   - **Support-case round-trip:** sign in on revora.plus/account (magic-link email — the login wall IS the flow, no password), submit a help case, confirm email lands in support@ and a case id renders.
5. **Update `docs/release/truth-index.md`** Sentry line once #25 is deployed and the console shows envelopes flowing (the owner-blocked item is then fully closed).

## C. OWNER-BLOCKED / OUT OF SCOPE (unchanged)

1. `/api/health` crons `nudge/trialPrecharge/pantrySweep/stripeReconcile` STALE — only `bai-weekly` is in vercel.json. Flagged repeatedly; still open.
2. Master-prompt ledger: everything else ✅ (www redirect, RE-08, four surfaces + §B4 review now done, RV-3/RV-6, twins, HS-3, P0.4, truth-index, runbooks). Stripe webhook + Sentry DSN move to ✅ after §B3/§B4 above.

## D. TODOS.md — current top of file (priority order)

1. **Design-system drift residuals** (post-C7 review — week-strip dedup, 640px width contract, off-token colors, aria-live, ≤430px hidden copy; each needs a DESIGN.md decision; refutation note included)
2. **PlanBox can render without a billing date** (lib/server/plan-box.ts meta branches; DESIGN.md ban; small, next billing touch)
3. **Today-card "I did it" affordance** (pre-existing, red-team critical's real fix)
4. **Saved-meals must be styled before MEAL_MEMORY flips** (13 undefined classes, unstyled risk-chip, ★ glyph — BLOCKS the flag flip)
5. Pre-existing HIGH coverage gaps (client-error-reporting `defaultIntegrations` — inspect first, possible live privacy leak; profile PATCH; restorePurchases)
6. Support limiter per-user keying · export GET throttling · admin support viewer (D5) · BAI retire-or-repurpose (D6)

## E. Operational facts learned/confirmed this session (read before touching anything)

- **gstack lives at `~/.claude/skills/igstack/`** on this machine (NOT `~/.claude/skills/gstack/` — the skill preambles' bin calls fail silently). Browse binary: `~/.claude/skills/igstack/browse/dist/browse`; review checklists: `~/.claude/skills/igstack/review/`.
- Browse screenshots may only be written under `/tmp` or the repo. If a page probe returns nonsense (empty head, 0 stylesheets), the tab is a corpse — `$B close` (or kill) and re-goto before trusting ANY reading.
- **Never run `npm run build` (or a second next process) concurrently with Playwright's dev servers** — they share `.next` and you get the documented whole-app-404/22-failures false alarm. Remedy: `pkill -f "next de[v]"` (bracket trick — plain `pkill -f "next dev"` matches its own command line and kills your shell, exit 144), `rm -rf .next`, rerun alone.
- E2E flake discipline unchanged: ~1-2 cold-compile/machine-load flakes per run (`daily-loop.spec.ts:36` is the usual suspect); rerun in isolation before believing. Never pipe e2e to tail; write to a file, `echo EXIT=$?`.
- **Vercel:** sensitive env values decrypt as EMPTY via `vercel env pull` — you cannot read `STRIPE_SECRET_KEY`/`DATABASE_URL` etc. from Vercel. CLI is authed (`vercel whoami` = tkiros); raw REST with the CLI token 401s — use the CLI. `NEXT_PUBLIC_*` additions need a redeploy to take effect.
- **Railway:** CLI authed, run from repo dir, use `DATABASE_PUBLIC_URL` (private URL unreachable from outside Railway).
- **Stripe MCP:** OAuth now completed for this machine; tools are a curated allowlist (payments/customers/products/refunds + docs/search) — NO webhook management, NO events listing. `get_stripe_account_info` for identity. If the MCP shows only `authenticate`/`complete_authentication`, it is NOT authenticated — call `authenticate` and give the user the URL it returns.
- The `main` worktree is checked out at `.claude/worktrees/counsel-gate-candidate` — you cannot `git checkout main` in the repo root; branch from `origin/main` instead (`git checkout -b X origin/main`).
- Design audit artifacts (report, baseline, screenshots): `~/.gstack/projects/Revora/designs/design-audit-20260721/`. Ship metrics: `~/.gstack/projects/Revora/fix-design-review-post-c7-reviews.jsonl`.

## F. Do NOT touch (unchanged from previous handoffs)

HS-2/4/5 clinical banding · HSTS preload · CSP report-uri · `MEAL_MEMORY_*` / `LEARNING_JOURNEY_*` stay OFF (and saved-meals styling now GATES the MEAL_MEMORY flip — see D4) · pricing numbers · DA-NH-1 counsel · human-evidence validators · `REVORA_ENFORCE_COMPONENT_MENTION` stays OFF · BAI cron/table keep running (S2 measurement).

## G. Definition of done for THIS handoff

1. PR #25 CI green → merged → deployed. ⏳
2. Post-deploy: font = Plus Jakarta Sans, Sentry CSP passes + envelopes flow, titles, A1C skip-path, 308s/health. ⏳
3. Owner: Stripe `charge.refunded` test event 2xx · support-case round-trip email + case id. ⏳
4. truth-index Sentry line updated. ⏳
5. Everything else from the C7 cycle: ✅ done and verified this session.

**One prioritized next action:** §B1 — `gh pr checks 25`, then merge and run the post-deploy verification.
