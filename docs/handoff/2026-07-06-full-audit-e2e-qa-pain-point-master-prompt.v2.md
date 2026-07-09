# Master Prompt — Full Plan-Execution Audit, End-to-End QA, and Pain-Point Validation (v2)

**Purpose.** Paste this into a capable agent (Claude Code, `/gsd-audit-milestone`, `/gsd-verify-work`, or equivalent) to answer three questions **with evidence, not confidence**:

1. Were the three named implementation plans actually and correctly executed **and deployed**?
2. Does the app work end-to-end, without errors, ready for a real **paying** client?
3. Does what actually shipped solve the pain points real prediabetic users describe?

The output is **one written audit report**. Do not silently "fix and move on": report first, hand off fixes as a separate reviewed step. The only exception is a one-line, zero-risk correction (typo, dead link), which you may fix inline and must label as such.

**How to run.**
- Repo root: `/home/tefera/Desktop/Revora`. Record the actual `HEAD` in the report — run `git rev-parse --abbrev-ref HEAD` and `git log --oneline -10`; do not trust this doc's branch name.
- As of writing, Photo-assist (D5) has been **merged to `main`** (merge commit `7727a31`; feature commits `232d5c1…14295fc`). If `HEAD` differs at run time, re-resolve the range yourself.
- Read every source-of-truth doc in §0 **before** forming conclusions.
- **Never trust a plan's own `DONE`/`COMPLETE` marker.** A file existing with the right name is not evidence the behavior exists. Verify against code, tests, and the running app.

**Legends (defined once; every table below references these).**

- *Verdict (Part 1):* `DONE` (built + wired + evidenced) · `PARTIAL` (some sub-tasks missing/stubbed) · `NOT DONE` · `DONE-BUT-BROKEN` (exists but fails at runtime/test) · `SCOPE-DRIFT` (shipped something the plan didn't call for, or vice-versa) · `BLOCKED-HUMAN` (correctly incomplete because it's a human-only action per the plan) · `UNVERIFIABLE` (cannot check from this environment — say why).
- *Severity (Part 2):* `blocker` (prevents launch / loses money / violates claims-boundary or privacy) · `major` (core flow broken or wrong, workaround exists) · `minor` (degraded but functional) · `cosmetic`.
- *Strength (Part 3):* `strong` · `partial` · `not addressed` · `deliberately out of scope`.

---

## 0. Source of truth (read first, in this order)

1. `docs/superpowers/plans/2026-07-05-launch-readiness-paywall-pantry.md` — paywall/trial/pantry plan (Phases 0–8). **[Plan #1]**
2. `docs/superpowers/plans/2026-06-21-revora-launch-hardening.md` — abuse/cost/quality/legal/PWA hardening plan. **[Plan #2]**
3. `docs/production-implementation-plan-2026-07-01.md` — full-build plan (accounts, DB, billing, PWA→TWA, Play). **[Plan #3]**
4. `docs/handoff/2026-07-05-launch-readiness-sdd-session-handoff.md` — most recent execution status. As of it, Plan #1 Phases 0–7 were *reported* complete and Phase 8 (final QA, runbooks, merge) outstanding. **Treat as a claim to verify, not a fact.**
5. `docs/handoff/2026-07-05-implementation-plan-master-prompt.md` — the prompt that produced Plan #1; use it for the **locked** product/pricing decisions (card-gated trial, no standing free tier, $9.99/$12.99/$19.99 ladder, in-app Pantry purchase, "Enjoy it anyway" copy).
6. `docs/safety/claims-boundary.md` and `docs/safety/copy-ledger.md` — the **non-negotiable** claims boundary. Every user-facing string is checked against this.
7. `docs/privacy/data-flow.md` — the privacy posture that must match what is actually deployed. No-DB claims go stale the moment accounts/history ship — confirm `/privacy` copy matches reality.
8. `docs/superpowers/plans/2026-07-06-photo-assist-check-input.md` + the Photo-assist commits (`232d5c1…14295fc`) — D5 was explicitly **deferred/not-built** in Plans #1 and #3, yet it is now built and merged. Reconcile (see Part 1's Photo-assist task).
9. `/home/tefera/Desktop/Various_files/target_audience_questions.md` — raw target-audience voice for Part 3. (Confirmed present at time of writing; if absent, say so and proceed with what you can.)
10. `package.json` scripts, `.env.example`, and `docs/ops/play-twa-runbook.md` (plus any other `docs/ops/*runbook*.md`) — for how to run, build, test, and deploy.

**Tie-break rule:** if a plan and the code disagree, **code wins for "what shipped," the plan wins for "what was supposed to ship," and the gap between them is itself a finding.**

---

## Working method (do this in order — don't thrash)

1. **Orient.** Resolve `HEAD`/commits, read all §0 docs, read `package.json` scripts and `.env.example`. Build a scratch list of every file each plan claims to touch.
2. **Static verify (Part 1).** Grep/read those files; run the read-only test suites. Cheap, no side effects — do it before spinning anything up.
3. **Run it (Part 2).** Start the app (`npm run dev` or documented equivalent). Record which environment each result came from in an **Environments table**: `env (local/staging/prod) → URL/port → commit → how reached`.
4. **If you cannot run or reach something, do not stop — degrade gracefully and label it.** Every blocked capability has a fallback that still produces audit value:
   - Can't start the app → static-trace the route/handler and record `UNVERIFIABLE (runtime)`.
   - No production/Vercel env access → inspect local `.env`/`.env.example` and code defaults; flag the exact env var a human must confirm in the dashboard.
   - No live Play Console / counsel access → check the artifacts in-repo (`assetlinks.json`, `.aab`, sign-off docs) and mark the rest `BLOCKED-HUMAN`.
   State the blocker plainly in the report; never guess a pass.
5. **Map to pain points (Part 3)** using Part 1's *verified* findings, not plan aspirations.
6. **Write the report**, then run the report self-check in the Deliverable section before declaring done.

---

## Part 1 — Plan-execution audit (did it ship, correctly, and is it deployed?)

For **each** of the three plans, produce a compliance table (markdown, one row per phase/task):

| Phase/Task | Claimed status | Verified status (evidence: `file:line` or command output) | Deployed? (yes/no/unknown + how checked) | Verdict |
|---|---|---|---|---|

Concretely:

- **Read the behavior, not the filename.** For each file a plan says it touches (entitlement, billing/webhook handlers, DB schema/migrations, auth, onboarding, PWA manifest/service worker, Photo-assist route, coach-outputs, result-card, etc.), confirm the *described behavior* is present.
- **Run the referenced suites and report pass/fail counts** (not "tests exist"): `npm run typecheck`, `npx vitest run`, `npx playwright test tests/smoke/...`, and `npm run eval:revora` **only if it does not spend real money — check the script first.**
- **Feature flags.** Report the **actual configured value** of `PAYWALL_MODE` and any other flags in local `.env`/`.env.example`; flag what needs human confirmation in Vercel. A flag left at `legacy` means Plan #1's paywall rewrite is *built but dormant* — that is the whole "deployed vs. works" distinction, so call it out explicitly.
- **Stripe (read-only).** Are the products/prices actually provisioned? The SDD handoff flagged **zero** Revora products/prices on the connected account as of 2026-07-05. Check current state with read-only MCP calls only — `stripe_api_read`, `fetch_stripe_resources`, `get_stripe_account_info`. **Never create or modify live Stripe objects** without explicit user sign-off in this conversation.
- **DB migrations.** Confirm `drizzle/` migrations *applied* vs. *defined*, and that the schema matches what the code expects.
- **Google Play / TWA.** Is `public/.well-known/assetlinks.json` present? Is there a signed `.aab`? Is the app actually listed on Play? Cross-check Plan #3 §10's "human actions" section **before** flagging incomplete — pushing/spending/submitting are explicitly human-only, so mark them `BLOCKED-HUMAN`, not `NOT DONE`.
- **Photo-assist scope-drift reconciliation (required sub-section).** D5 was "not built" in Plans #1/#3 but is now merged. Answer, with evidence: (a) is it now in scope; (b) is it gated correctly — rate-limited, trial-walled, **no photo persistence** per commit `232d5c1`; (c) do Plans #1/#3 need a correction note appended? Produce the exact one-liner you'd add to each plan.
- **Name every `UNVERIFIABLE` gap** (needs prod Vercel access, live Play Console, counsel sign-off, etc.) plainly rather than guessing.

---

## Part 2 — End-to-end functional QA (does it work, flawlessly, for a paying client?)

Treat this as the pre-launch pass a paying client must survive. Test locally, and any staging/public URL that exists — **state the environment per result.**

Walk every flow to completion, logging any error, console warning, broken link, layout break, or claims-boundary violation:

- **Core check flow:** text → result card (SAFE/MODERATE/HIGH); voice → transcript-in-textarea → result; Photo-assist draft → confirm → result. Confirm the disclaimer renders **every** time, the **≤1-clarify** contract holds, and **no exact mg/dL, GI, or GL numbers** leak into copy.
- **Onboarding:** first-run redirect, segmentation chips, guided first check (oatmeal/banana/orange juice), A1C capture, consent capture. Confirm **A1C is collected exactly once**, not twice.
- **Taster → trial → paywall:** Day-1 anonymous taster limit, Day-2 hard wall, trial checkout (**Stripe test mode only — no live cards, no real spend**), trial-started page, 2-day pre-charge email (check the cron/email-stub path), one-tap cancel link, canceled page.
- **Pantry Review:** landing page, in-app purchase (test mode), the post-verdict entry point that should appear **only** on Be-careful/Hold-off results, claim/intake flow, sample-report claims audit.
- **Account/auth:** magic-link sign-in, `/welcome`, profile GET/POST/PATCH, history migration from guest `localStorage` to server on first sign-in.
- **Daily loop / history / streaks / insights / BAI progress:** data persists; **encrypted fields are actually encrypted at rest — spot-check a real DB row, not just the code path**; progress view stays inside claims-boundary language.
- **Error/edge states:** rate-limited, provider timeout, offline (PWA), paused/kill-switch, malformed input, non-food input, out-of-scope input, expired session, canceled subscription attempting a check.
- **Cross-cutting:** mobile viewport + touch targets, `axe` a11y pass, PWA installability, Sentry capture on a forced error (**confirm scrubbing — no raw food/A1C text in captured events**), `/api/health`.
- **Fast debt sweep:** grep for `TODO`, `FIXME`, `console.log` of sensitive data, and any `NEXT_PUBLIC_` prefix on a secret-sounding env var.

Produce a **bug/issue list** (markdown, sorted by severity, blockers first):

| ID | Area | Severity | Repro steps | Expected vs actual | Evidence (`file:line` / log / screenshot) |
|---|---|---|---|---|---|

Do not fix anything non-trivial inline — list it. One-line, zero-risk fixes (typo, dead link) may be corrected and must be noted as such.

---

## Part 3 — Pain-point / burning-question coverage (does it solve what users struggle with?)

Read `/home/tefera/Desktop/Various_files/target_audience_questions.md` closely and **extract the recurring themes yourself** — the list below is a starting hypothesis, not the answer. Confirm, add, or drop themes based on the actual file:

- Individual, unpredictable carb reactions ("makes zero sense on paper" — same carb count, wildly different response).
- Guilt/shame and all-or-nothing spirals after one higher-carb meal.
- Fear of food / orthorexia-adjacent anxiety ("this is giving me an eating disorder").
- Overwhelm at diagnosis — "where do I start," conflicting advice (oils, sourdough, resistant starch, "zero sugar" drinks with maltodextrin).
- Convenience pressure — quick, on-the-go meals around school/work.
- Confusing/contradictory labs (A1C rising despite low-carb effort; IR doubling on Metformin) → anxiety and doctor-distrust.
- Boredom/repetition fatigue with "safe" meals; wanting variety without risk.
- Travel/vacation — wanting a mental break from constant vigilance.
- Underweight / disordered-eating-adjacent users needing nuance beyond generic carb-cutting.

For each theme, map it against **what actually shipped** (Part 1's verified findings, not aspirational plan copy): does the decision card, "Enjoy it anyway" keep-most/swap copy, the sequencing tip, streak/insights/BAI view, Pantry Review, or anything else directly address it? Where the product **deliberately** does not (it is informational-only — cannot diagnose, predict A1C, or replace a CGM, per the claims boundary), say so as a scoped-out limitation, **not** a gap. But flag any marketing/onboarding copy that risks overpromising against the boundary (implying CGM replacement or glucose-response prediction).

Produce a **coverage matrix:**

| Pain point | Addressed by (feature/copy + `file` ref) | Strength | Risk notes |
|---|---|---|---|

---

## Deliverable

Write one report to `docs/handoff/2026-07-06-launch-audit-report.md` (use the actual run date if later), with these sections in this order:

1. **Executive verdict** — one paragraph: ready for real client use today? yes / no / conditionally, + the top 3 blockers if not.
2. **Environments tested** — the table from the Working Method step 3.
3. **Part 1 — Plan compliance matrices** (one per plan) + the Photo-assist scope-drift reconciliation.
4. **Part 2 — Bug/issue list**, sorted by severity, blockers first.
5. **Part 3 — Pain-point coverage matrix.**
6. **Recommended next actions**, ordered, clearly split into **engineering work** vs **human-only actions** (Stripe live provisioning, Play Console submission, counsel sign-off, DNS/domain, Vercel env config, etc.).

**Report self-check before declaring done** (run `superpowers:verification-before-completion`):
- [ ] Every Part 1 verdict cites concrete evidence (`file:line` or command output), not a plan's self-report.
- [ ] Every test claim reports **pass/fail counts**, not "tests exist."
- [ ] Every `UNVERIFIABLE` / `BLOCKED-HUMAN` item names *what* is needed and *who* must do it.
- [ ] No Stripe write occurred; no deploy/push/Play-submit/real-email occurred.
- [ ] The executive verdict's top-3 blockers each trace to a specific row in Part 1 or Part 2.

---

## Constraints (hard)

- **Do not modify** `lib/revora/postprocess.ts`, `service.ts`, `prompt.ts`, `schemas.ts`, or `a1c.ts` — safety-frozen per every plan. Report on them; never touch them.
- **Stripe: read-only inspection only.** Never create live charges, never use real card numbers, never modify live product/price objects without explicit user sign-off in this conversation.
- **Do not** push to production, deploy, submit to Google Play, or send real emails to real users.
- If something needs credentials, environment access, or a decision you don't have (prod Vercel env, Play Console, counsel's actual sign-off), **say so explicitly in the report** — never guess or assume pass.
- Use `superpowers:systematic-debugging` for any bug you investigate in depth, and `superpowers:verification-before-completion` before marking any single item `DONE`.
