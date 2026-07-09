# Master Prompt — Full Plan-Execution Audit, End-to-End QA, and Pain-Point Validation

**Purpose:** paste this prompt into a capable agent (Claude Code, `/gsd-audit-milestone`, `/gsd-verify-work`, or equivalent) to answer three questions with evidence, not confidence: (1) were the three named implementation plans actually and correctly executed and deployed, (2) does the live app work end-to-end without errors, ready for a real paying client, and (3) does what shipped actually solve the pain points real prediabetic users describe. Output is a single written audit report — do not silently "fix and move on"; report first, then hand off fixes as a separate reviewed step unless a finding is a one-line, zero-risk correction.

**How to use:** run from the repo root (`/home/tefera/Desktop/Revora`) on the current branch (`photo-assist-check-input`, or whatever branch is `HEAD` at run time — record it in the report). Read every source-of-truth doc below before forming conclusions. Do not trust plan documents' own "DONE"/"COMPLETE" markers — verify against the actual code, tests, and running app.

---

## 0. Source of truth (read first, in this order)

1. `docs/superpowers/plans/2026-07-05-launch-readiness-paywall-pantry.md` — paywall/trial/pantry plan (Phases 0–8).
2. `docs/superpowers/plans/2026-06-21-revora-launch-hardening.md` — abuse/cost/quality/legal/PWA hardening plan.
3. `docs/production-implementation-plan-2026-07-01.md` — full-build plan (accounts, DB, billing, PWA→TWA, Play).
4. `docs/handoff/2026-07-05-launch-readiness-sdd-session-handoff.md` — most recent execution status; as of this handoff, Phases 0–7 of plan #1 were reported complete and Phase 8 (final QA, runbooks, merge) was still outstanding. Treat this as a claim to verify, not a fact.
5. `docs/handoff/2026-07-05-implementation-plan-master-prompt.md` — the prompt that produced plan #1; use it to understand locked product/pricing decisions (card-gated trial, no standing free tier, $9.99/$12.99/$19.99 ladder, in-app Pantry purchase, "Enjoy it anyway" copy).
6. `docs/safety/claims-boundary.md` and `docs/safety/copy-ledger.md` — the non-negotiable claims boundary. Any user-facing copy must be checked against this.
7. `docs/privacy/data-flow.md` — the privacy posture that must match whatever is actually deployed (no-DB claims are stale the moment accounts/history ship — confirm `/privacy` copy matches reality).
8. `docs/superpowers/plans/2026-07-06-photo-assist-check-input.md` plus the current branch's own commits (`232d5c1`…`14295fc`) — Photo-assist (D5) was explicitly **deferred/not-built** in both plan #1 and plan #3, yet the current branch has built and merged it. Reconcile this: is Photo-assist now in scope, is it gated correctly (rate-limited, trial-walled, no photo persistence per the branch's own commit messages), and do the older plans' "not built" statements need a correction note?
9. `/home/tefera/Desktop/Various_files/target_audience_questions.md` — raw target-audience voice (prediabetes subreddit/forum posts and questions) for Part 3.
10. `package.json` scripts, `.env.example`, and any `docs/ops/*runbook*.md` — for how to actually run, build, test, and deploy the app.

If a plan document and the actual code disagree, the code wins for "what shipped"; the plan wins for "what was supposed to ship" — the gap between them is itself a finding.

---

## Task — three deliverables, in order

### Part 1 — Plan-execution audit (did it actually ship, correctly, and is it deployed?)

For **each** of the three plans, build a compliance table: `Phase/Task → claimed status → verified status (file:line or command output as evidence) → deployed? (yes/no/unknown, with how you checked) → verdict (DONE / PARTIAL / NOT DONE / DONE-BUT-BROKEN / SCOPE-DRIFT)`.

Concretely:
- Grep and read the actual files each plan says it touches (entitlement, billing/webhook handlers, DB schema/migrations, auth, onboarding, PWA manifest/service worker, Photo-assist route, coach-outputs, result-card, etc.) and confirm the described behavior exists, not just that a file with the right name exists.
- Run the test suites the plans reference (`npm run typecheck`, `npx vitest run`, `npx playwright test tests/smoke/...`, `npm run eval:revora` if it doesn't spend real money — check first) and report pass/fail counts, not just "tests exist."
- Check `PAYWALL_MODE` and other feature flags: what is the **actual configured value** in `.env`/Vercel env (list what you can inspect locally; flag what needs a human to confirm in the Vercel dashboard since you may not have production env access)? A flag left at `legacy` means the entire paywall rewrite in plan #1 is built but dormant — that's a critical distinction for "is it deployed" vs "does it work."
- Confirm the Stripe side: are the products/prices actually provisioned (the SDD handoff flagged that the connected Stripe account had **zero** Revora products/prices as of 2026-07-05) or is this still a human-action blocker? Use the Stripe MCP tools (read-only calls only — `stripe_api_read`, `fetch_stripe_resources`, `get_stripe_account_info`) to check current state; do not create/modify live Stripe objects without explicit user confirmation.
- Confirm the DB migration state (`drizzle/` migrations applied vs. defined) and that schema matches what code expects.
- Confirm Google Play / TWA claims: is `public/.well-known/assetlinks.json` present, is there a signed `.aab`, is the app actually listed on Play — or is this still human-gated (per plan #3 §10, pushing/spending/submitting are explicitly human-only actions)? Don't assume "not done" is a bug — cross-check against each plan's own "human actions" section before flagging it as incomplete.
- Explicitly reconcile the Photo-assist scope drift noted in source #8 above.
- Note every place a plan's "done when" criteria cannot be verified from this environment (e.g., needs production Vercel access, needs live Play Console, needs counsel sign-off) and say so plainly rather than guessing.

### Part 2 — End-to-end functional QA (does it actually work, flawlessly, for a real client?)

Treat this as a pre-launch QA pass a paying client would need to survive. Start the app locally (`npm run dev` or the documented equivalent) and, where a public/staging URL exists, test that too — state which environment each result came from.

Walk every user-facing flow to completion, noting any error, console warning, broken link, layout break, or claims-boundary violation:
- **Core check flow**: text input → result card (SAFE/MODERATE/HIGH), voice input → transcript-in-textarea → result, Photo-assist draft → confirm → result. Confirm the disclaimer renders every time, the ≤1-clarify contract holds, and no exact mg-dL/GI/GL numbers leak into copy.
- **Onboarding**: first-run redirect, segmentation chips, guided first check (oatmeal/banana/orange juice), A1C capture, consent capture — confirm A1C is collected exactly once, not twice.
- **Taster → trial → paywall**: Day-1 anonymous taster limit, Day-2 hard wall, trial checkout (Stripe test mode only — do not use live card data or spend real money), trial-started page, 2-day pre-charge email (check the cron/email-stub path), one-tap cancel link, canceled page.
- **Pantry Review**: landing page, in-app purchase flow (test mode), the post-verdict entry point that should only appear on Be-careful/Hold-off results, claim/intake flow, sample report claims-audit.
- **Account/auth**: magic-link sign-in, `/welcome`, profile GET/POST/PATCH, history migration from guest localStorage to server on first sign-in.
- **Daily loop / history / streaks / insights / BAI progress view**: confirm data persists, encrypted fields are actually encrypted at rest (spot-check the DB row, not just the code path), and the progress view stays within claims-boundary language.
- **Error/edge states**: rate-limited, provider timeout, offline (PWA), paused/kill-switch, malformed input, non-food input, out-of-scope input, expired session, canceled subscription trying to check.
- **Cross-cutting**: mobile viewport + touch targets, `axe` a11y pass, PWA installability, Sentry capture on a forced error (confirm scrubbing — no raw food/A1C text in captured events), `/api/health` endpoint.
- Grep for `TODO`, `FIXME`, `console.log` of sensitive data, and any `NEXT_PUBLIC_` prefix on a secret-sounding env var as a fast sweep for leftover debt.

Produce a **bug/issue list**: `ID, area, severity (blocker/major/minor/cosmetic), repro steps, expected vs actual, evidence (screenshot/log/file:line)`. Do not fix anything non-trivial inline — list it. A one-line, zero-risk fix (typo, dead link) may be corrected and noted as such.

### Part 3 — Pain-point / burning-question coverage (does it solve what real users actually struggle with?)

Read `/home/tefera/Desktop/Various_files/target_audience_questions.md` closely — it's raw forum/subreddit voice from people managing prediabetes. Extract the **recurring themes**, e.g. (confirm against the actual file rather than trusting this list — it's a starting point, not the full extraction):
- Individual, unpredictable carb reactions ("this makes zero sense on paper" — same carb count, wildly different response by food/person).
- Guilt, shame, and "all-or-nothing" spirals after a single higher-carb meal.
- Fear of food / orthorexia-adjacent anxiety ("I feel like this is giving me an eating disorder").
- Overwhelm at diagnosis — "where do I even start," conflicting advice (oils, sourdough, resistant starch, "zero sugar" drinks with maltodextrin).
- Convenience pressure — quick, on-the-go meals around school/work schedules.
- Confusing/contradictory lab results (A1C rising despite low-carb effort; insulin resistance doubling on Metformin) driving anxiety and doctor-distrust.
- Boredom/repetition fatigue with "safe" meals; wanting variety without risk.
- Travel/vacation — wanting a mental break from constant vigilance.
- Underweight or disordered-eating-adjacent users needing nuance beyond generic carb-cutting.

For each theme, map it against what's **actually shipped** (per Part 1's verified findings, not the aspirational plan copy): does the decision card, the "Enjoy it anyway" keep-most/swap copy, the sequencing tip, the streak/insights/BAI view, the Pantry Review, or anything else in the product directly address it? Where the product explicitly and deliberately does **not** address a theme (e.g., it's informational-only and cannot diagnose, predict A1C, or replace a CGM — per the claims boundary), say that plainly as a scoped-out limitation rather than a gap, but flag if marketing/onboarding copy risks overpromising against it (e.g., implying it replaces a CGM or predicts glucose response, which the claims boundary forbids).

Produce a **coverage matrix**: `Pain point → addressed by (feature/copy, file ref) → strength (strong/partial/not addressed/deliberately out of scope) → risk notes`.

---

## Deliverable

Write one report to `docs/handoff/<today's date>-launch-audit-report.md` with these sections, in this order:
1. **Executive verdict** — one paragraph: is this ready for real client use today, yes/no/conditionally, and the top 3 blockers if not.
2. **Part 1 — Plan compliance matrices** (one per plan) + the Photo-assist scope-drift reconciliation.
3. **Part 2 — Bug/issue list**, sorted by severity, blockers first.
4. **Part 3 — Pain-point coverage matrix.**
5. **Recommended next actions**, ordered, distinguishing engineering work from human-only actions (Stripe live provisioning, Play Console submission, counsel sign-off, DNS/domain, etc.).

## Constraints

- Do not modify `lib/revora/postprocess.ts`, `service.ts`, `prompt.ts`, `schemas.ts`, or `a1c.ts` — these are safety-frozen per every plan above; report on them, don't touch them.
- Stripe: read-only account inspection only. Never create live charges, never use real card numbers, never modify live product/price objects without explicit user sign-off in this conversation.
- Do not push to production, do not deploy, do not submit anything to Google Play, do not send real emails to real users.
- If something requires credentials, environment access, or a decision you don't have (e.g., production Vercel env vars, Play Console access, counsel's actual sign-off status), say so explicitly in the report instead of guessing or assuming pass.
- Use `superpowers:systematic-debugging` for any bug investigated in depth, and `superpowers:verification-before-completion` before declaring any single item DONE in the report.
