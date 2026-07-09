# Session Handoff — Launch-Readiness Paywall+Pantry (SDD execution)

**Date:** 2026-07-05
**Branch:** `launch-readiness` (off `main` @ `67bc55b`)
**HEAD:** `2558bf4`
**Plan:** `docs/superpowers/plans/2026-07-05-launch-readiness-paywall-pantry.md`
**Skill in use:** `superpowers:subagent-driven-development` (fresh implementer subagent per task → review-package → task reviewer → fix loop → ledger).
**Progress ledger (source of truth):** `.superpowers/sdd/progress.md` (git-ignored; recover from `git log` if lost). Per-task briefs/reports live in `.superpowers/sdd/lr/`.

---

## 1. Where we are

**Phases 0–7 are COMPLETE** (28 tasks: 0.1, 1.1–1.3, 2.1–2.7, 3.1–3.3, 4.1–4.6, 5.1–5.6, 6.1–6.3, 7.1–7.3). Every task passed a task reviewer clean or clean-after-fix. Phase 8 (launch readiness: smoke spec, manual DoR walkthrough, runbooks, /demo pipeline) plus the final whole-branch review + merge + deploy remain.

**Production behavior is unchanged** by all of this: `PAYWALL_MODE` defaults to `legacy`, so the entire taster→wall→trial machine is dormant until a founder flips the flag per the (still-to-be-written) runbook.

### Commit trail (Phases 0–7), oldest→newest
```
78e4aaa docs(plan): launch-readiness paywall+pantry plan + strategy handoffs
55a17be docs(design): selectable-chip + Day-1 first-win patterns          [0.1]
0f9ba9e feat(analytics): taster/wall/trial/pantry funnel events            [1.1]
d1f14ab feat(telemetry): server-side billing events                        [1.2]
d9d9817 test(claims): scan pantry email templates                          [1.3]
b9d92a3 docs(billing): stripe provisioning record + human actions          [2.1]
b015ccb feat(db): trialing status + pre-charge/price-variant cols (0002)    [2.2]
30eee6d feat(entitlement): trialing/premium/lapsed/none status             [2.3]
48938a4 fix(entitlement): restore Play self-heal reachability (status-gated)[2.3 fix]
daad222 feat(billing): trial lifecycle in stripe webhook                    [2.4]
a032988 fix(billing): race-safe trial conversion                           [2.4 fix]
512df25 feat(pricing): env-driven variant + public /api/paywall            [2.5]
6b9db05 feat(billing): email-first trial checkout                          [2.6]
bf8baeb feat(trial): /trial/started success page                           [2.7]
32cb407 feat(billing): stateless HMAC cancel token                         [3.1]
80d1977 feat(billing): one-tap cancel (GET token + account POST) + /canceled[3.2]
37ddf80 feat(billing): 2-day pre-charge email cron                         [3.3]
c00d004 feat(taster): device-local Day-1 taster store                      [4.1]
3dd0a5b feat(wall): multi-step card-gated trial wall behind PAYWALL_MODE    [4.2]
4967155 feat(taster): client-side Day-1 gate + taster_check event          [4.3]
342d0d5 feat(wall): hard 402 for non-entitled signed-in users under trial  [4.4]
6f066f3 feat(wall): trial-mode upsell card renders the wall CTA            [4.5]
7da26f5 docs(adr): billing amendment — Decision D card-gated trial         [4.6]
3d2f3d7 feat(onboarding): first-run auto-redirect                          [5.1]
c34d836 feat(onboarding): segmentation + guided first check chips          [5.2]
b66c9b3 fix(onboarding): drop false numeric step counters                  [5.2 fix]
e1c7833 feat(onboarding): calm Day-1 first-win treatment                   [5.3]
82a0200 fix(taster): clear device taster state once account takes over     [5.4]
79ac700 feat(landing): static betrayal-aha demo card + trust strip         [5.5]
eb6a7f0 fix(landing): demo card pixel-true to live result card             [5.5 fix]
62ed2ac feat(pwa): get-the-app install page + store-intent waitlist        [5.6]
a0adf0e feat(pantry): in-app one-time checkout through existing webhook     [6.1]
0fa45c1 feat(pantry): landing page with claims-audited sample report        [6.2]
aa1f6e0 feat(pantry): post-verdict entry point (Be careful/Hold off only)   [6.3]
bce641e docs(claims): enjoy-it-anyway keep-most phrasebank (Approach B gate)[7.1]
1d7474c docs(claims): correct keep-most audit notes                        [7.1 fix]
3b85f29 feat(coach): deterministic keepMost output                         [7.2]
2558bf4 feat(coach): render enjoy-it-anyway keep-most line on cards         [7.3]  ← HEAD
```

---

## 2. Owner decisions in force (do not re-litigate)

1. **OQ-1 (Stripe account):** Provision on the connected **Vendoval livemode account** (`acct_14W8GFKweWSWjefk`) with per-product `statement_descriptor: REVORA`. **DONE** — products/prices created live (see §4).
2. **Deploy scope:** Push the feature branch (Vercel preview), **merge to `main`, push `main`** → production deploys with `PAYWALL_MODE=legacy`, so live behavior is unchanged. The trial flip is a separate founder runbook action, NOT part of this execution.
3. **Task 2.3:** Adding the required `status` field to `Entitlement` necessarily touched 3 pre-existing strict `toEqual` assertions — controller authorized EXTENDING them (keeping `toEqual`, adding the exact `status` value), not relaxing to `toMatchObject`.
4. **Task 7.1/7.2 keep-most winner:** The plan's example constant used a REJECTED candidate. The ledger-approved, controller-selected winner is `keep-most-02`, character-exact:
   `"Enjoy a smaller portion now and set the rest aside for later — same food, gentler pace."`
5. **Tally form (5.6):** Tally MCP exposes only auth endpoints (no form-creation) → logged as human action H25.

---

## 3. Environment gotchas (critical for the next session)

- **Full-suite vitest melts down on this machine** under contention — `npx vitest run tests/unit` or even a whole directory triggers mass `Hook timed out in 45000ms` in `createTestDb` (pglite cold-compile + resource contention), 20+ files fail environmentally. **This is NOT a regression signal.** Run tests **per-file** in the FOREGROUND; a broken migration/schema throws SQL errors, not hook timeouts. Re-run a single timing-out file in isolation to distinguish flake from real failure.
- **No jsdom / no component-test harness** in the repo (vitest runs `node` env). Established pattern for UI tasks: extract a tiny pure helper (`showFirstWin`, `upsellVariant`, `isFirstRun`, `showPantryEntry`, etc.) that the component CALLS, and unit-test that + do source-scan assertions. Full behavioral coverage is deferred to Playwright smoke. Do NOT add jsdom/testing-library.
- **Subagents must run every test command as a single plain FOREGROUND Bash call.** Background runs / `tail -f` / monitors / sleep-poll caused a stuck agent early on. Instruct each dispatched agent explicitly.
- **Playwright smoke:** Mobile Chrome is the gate; WebKit timeouts are known-environmental (report, don't chase). Re-run once on cold-compile timeout before judging.
- **`.superpowers/sdd/lr/` is git-ignored** — reports live on disk only, not committed. That's expected.
- The untracked file `docs/superpowers/plans/video_hooks_scripts_ideas.md` is the USER's — never commit or touch it.
- **Commit messages** in this SDD flow use the plan's exact strings (no Co-Authored-By trailer) for determinism. (If the user later wants the trailer on the merge commit, add it there.)

---

## 4. Stripe state (LIVE, provisioned Task 2.1) — recorded in `docs/handoff/human-actions-required.md` WS3

| Object | ID | Detail |
|---|---|---|
| Product | `prod_UpYMfliiN8R9DW` | Revora Premium, `statement_descriptor REVORA`, `metadata.app=revora` |
| Price | `price_1TptGbKweWSWjefkCeYyknna` | $9.99/mo, lookup `revora_monthly_999`, `price_variant=999` |
| Price | `price_1TptH2KweWSWjefkouRiU8KE` | $12.99/mo, lookup `revora_monthly_1299`, `price_variant=1299` (default) |
| Price | `price_1TptHYKweWSWjefkscWTlAfo` | $19.99/mo, lookup `revora_monthly_1999`, `price_variant=1999` |
| Product | `prod_UpYOONypmsbqiZ` | Revora Pantry Review, `statement_descriptor REVORA PANTRY` |
| Price | `price_1TptIOKweWSWjefkNlWbC1qH` | $49 one-time, lookup `revora_pantry_49` |

No `trial_period_days` on any price (trial is set per Checkout Session).

**Open human actions (in `docs/handoff/human-actions-required.md`):**
- **H20** — Configure Billing Portal default config (cancel enabled, `at_period_end`, no reason survey, PM update on) — MCP has no portal API.
- **H21** — Create prod webhook endpoint `/api/billing/stripe/webhook` subscribed to exactly: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `charge.refunded`; set `STRIPE_WEBHOOK_SECRET`. (Blocked on final prod domain.)
- **H22** — Set Vercel env: `STRIPE_PRICE_MONTHLY_999/1299/1999`, `STRIPE_PRICE_PANTRY` = the four IDs above; `STRIPE_PRICE_MONTHLY` = the 1299 ID (legacy 503 guard); `PAYWALL_MODE=legacy`; `TRIAL_PRICE_VARIANT=1299`.
- **H23** — OQ-2: provision a TEST-MODE mirror of the products + test keys for the QA/DoR walkthrough (Task 8.2).
- **H24** — Verify the webhook endpoint API version is `2025-03-31.basil`+ (else `invoice.paid` payloads lack `parent.subscription_details`; code has a legacy top-level fallback but pinning removes ambiguity).
- **H25** — Create the Tally waitlist form (email + platform Android/iPhone + purpose line) and set `NEXT_PUBLIC_WAITLIST_URL` in Vercel.

---

## 5. WHAT TO DO NEXT — exact tasks

Resume the SDD loop. For each: `scripts/task-brief PLAN N .superpowers/sdd/lr/task-N-brief.md` → dispatch implementer (foreground-test instructions, per-file test rules from §3) → `scripts/review-package BASE HEAD` → dispatch task reviewer → fix loop → append to `.superpowers/sdd/progress.md`. Scripts dir: `/home/tefera/.claude/plugins/cache/claude-plugins-official/superpowers/6.1.0/skills/subagent-driven-development/scripts/`.

### ▶ Task 8.1 — DoR smoke spec (NOT STARTED; prior agent died at session limit before committing — tree is clean, redo from scratch)
Create `tests/smoke/trial-wall.spec.ts` (study `tests/smoke/onboarding.spec.ts` + the playwright config first). Runs under `PAYWALL_MODE=trial`; pick the least-invasive env mechanism (webServer env / a separate playwright project) and document it. **7 scenarios (map 1:1 to plan §8 Task 8.1):**
1. Taster: fresh ctx → `/` redirects `/onboarding` → tap "oatmeal" chip → form prefilled → submit (stubbed engine) → result → `localStorage["revora.taster.v1"].used === 1`.
2. Exhaustion: seed `{firstDay: today, used: 10}` → submit → `/subscribe` + `[data-testid="trial-wall"]` visible.
3. Day 2: seed `{firstDay: "2020-01-01", used: 2}` → submit → wall.
4. Wall→checkout: value→proof→start, enter email, assert `POST /api/trial/start` fires + nav to stubbed checkout URL (`page.route` the API).
5. Decline catch: `/subscribe?declined=1` → `[data-testid="pantry-catch"]` linking `/pantry`.
6. Pantry: `/pantry` renders sample sections + `[data-testid="pantry-buy"]`.
7. Legacy guard: `PAYWALL_MODE=legacy` → `/subscribe` shows legacy `[data-testid="paywall-card"]` (verify marker in `components/paywall-card.tsx`); `/` does NOT redirect a seeded returning user.
Gate: `npx playwright test tests/smoke/trial-wall.spec.ts --project="Mobile Chrome" 2>&1 | tail -12`. Commit: `test(smoke): definition-of-ready trial wall + taster + pantry walkthrough`.

### ▶ Task 8.2 — Manual DoR walkthrough (release gate; MOSTLY HUMAN-GATED)
Requires a preview deploy + Stripe TEST mode (H23) + test clocks — the founder must run the live legs. The agent-doable part: scaffold `docs/handoff/2026-07-05-dor-walkthrough.md` with the exact step script + evidence placeholders (fresh taster → 11th check wall; simulated Day 2; wall→email→test checkout `4242…`→`/trial/started`→magic link→`/welcome`→unlimited + `subscriptions` row `status=trialing price_variant=1299`; test-clock advance→cron `curl -H "Authorization: Bearer $CRON_SECRET" <preview>/api/cron/trial-precharge`→pre-charge email→one-tap cancel→`/canceled`→`cancel_at_period_end=true`; separate no-cancel trial→test-clock past end→`invoice.paid`→`active`→`trial_converted` log; pantry buy→intake→claim→upload (`PANTRY_EXTRACT_STUB=1`)→confirm→report; full `npx vitest run tests/unit` note re env; Play untouched). Mark live legs BLOCKED-ON-HUMAN. Commit the doc.

### ▶ Task 8.3 — Price-test runbook + flip procedure (agent-doable, docs)
Create `docs/runbooks/price-test.md` with real content: cohorting (one `TRIAL_PRICE_VARIANT` per window, never two prices to one community); metrics (trial-start rate = `trial_started`÷`wall_viewed` via Umami; NEW-ONLY conversion SQL over `subscriptions` grouped by `price_variant` filtering `status='active'`; margin/user); guardrails; decision rule (~2 weeks or ~100 activated/arm); **flip procedure** (verify 0002 applied → 4 price env IDs + `STRIPE_WEBHOOK_SECRET` live + webhook events (H21) → Phase-3 cron in `vercel.json` + heartbeat row → set `PAYWALL_MODE=trial`, `TRIAL_PRICE_VARIANT=1299` → deploy → run one real card end-to-end + one-tap cancel → watch logs for `trial_started`); **rollback** (`PAYWALL_MODE=legacy` → redeploy; trialing/premium rows keep working; no data loss); existing-free-user-hits-wall-at-flip note (Decision D by design). Commit: `docs(launch): price-test runbook + flag-flip/rollback procedure`.

### ▶ Task 8.4 — /demo fixtures + screenshot pipeline (agent-doable)
`app/demo/page.tsx` (`robots: noindex`) with `data-shot`-tagged sections rendering ONLY ledger-approved fixture copy: `<DemoCheckCard/>`; `<ResultCard/>` SAFE/MODERATE(+keepMost)/HIGH fixtures; the clarify state; the Day-1 `.first-win` block — every string copied verbatim from the ledger / `coach-outputs.ts`, page invents no copy. `scripts/capture-marketing-shots.mjs` (manual-run Playwright, phone + store viewports). `docs/runbooks/marketing-assets.md` (outcome principle, caption formula, per-surface guidance, hard bans, ledger-row-per-caption rule). `COPY_FILES += "app/demo/page.tsx"`; claims green. Commit: `feat(marketing): /demo fixtures route + screenshot capture script + asset rules runbook`.

### ▶ FINAL — whole-branch review + merge + deploy
1. Run the final whole-branch review on the **most capable model**: `scripts/review-package $(git merge-base main HEAD) HEAD` → dispatch `superpowers:requesting-code-review`'s `code-reviewer.md`, pointing it at the **Minor findings roll-up** in `.superpowers/sdd/progress.md` (accumulated per-task minors — reviewer triages which must be fixed before merge). Notable roll-up items to surface: `emitBillingEvent` env-override spread shape (1.2); pantry-sweep heartbeat not on `/api/health`; `trial_canceled` re-emit on repeated updated events (2.4, tolerated); pre-charge window boundaries untested (3.3); the several no-jsdom source-scan test proxies; `taster_check used:1` under blocked storage; POST `/api/billing/cancel` first-row-not-provider-scoped (3.2).
2. If findings: ONE fix subagent with the complete list (not per-finding).
3. Then `superpowers:finishing-a-development-branch`.
4. **Deploy per §2 decision:** push `launch-readiness` (preview), merge to `main` (`--no-ff`), push `main` → prod deploys with `PAYWALL_MODE` unset/legacy. Confirm `main` push is what the user wants at that moment (it triggers a Vercel prod deploy; behavior stays legacy). Tag as appropriate.

---

## 6. Key invariants honored throughout (keep honoring them)

- **Claims boundary absolute:** every new user-facing string is in `docs/safety/copy-ledger.md` AND `COPY_FILES` in `tests/unit/revora/claims-boundary-copy.test.ts`. Claims test green at HEAD (55 files scanned).
- **Engine frozen:** `lib/revora/{postprocess,service,prompt,schemas,a1c}.ts` have zero hunks this branch. Only `coach-outputs.ts` (route-layer seam) was touched.
- **Play/TWA billing byte-identical:** every entitlement/webhook task re-ran the Play + pantry-webhook test files unchanged.
- **Additive/reversible:** one migration `drizzle/0002_trial-billing.sql` (nullable cols + additive enum value). `PAYWALL_MODE=legacy` default keeps prod dormant.
- **Trust rails before the wall:** pre-charge email cron + one-tap cancel (Phase 3) shipped before Phase 4 — the flag must never go `trial` in prod without them (they're live).

---

## 7. Quick-start for the next session

```
cd /home/tefera/Desktop/Revora
git branch --show-current            # expect launch-readiness
git log --oneline -1                 # expect 2558bf4
cat .superpowers/sdd/progress.md     # the ledger — trust it over memory
```
Then resume at **Task 8.1** using the SDD loop described in §5. Invoke `superpowers:subagent-driven-development` to re-establish the workflow.
