# Prompt — Author the Unified Revora Completion & Launch Plan

**What this file is:** the *brief* you give an agent so it produces **one** implementation
plan that carries Revora to true "fully-fledged, usable by real people on web + Android."
It is **not** the plan itself. Paste the "PROMPT" section below into a fresh session (or hand
it to a planning skill); everything above it is orientation for whoever runs it.

**Author it against:** branch `launch-hardening`, repo `/home/tefera/Desktop/Revora`.
**Save the resulting plan to:** `docs/handoff/2026-07-04-unified-completion-plan.md`.

---

## Why the raw ask needed rewriting

The original request ("make one plan for the remaining features + tasks") is correct in intent
but would misfire without three corrections, because the repo has **multiple overlapping planning
docs written at different times**:

1. **Authority hierarchy is undefined.** The June-21 `docs/superpowers/plans/2026-06-21-revora-launch-hardening.md`
   plan scopes V1 as *text-only, no accounts, no DB* — that scope is **superseded**: the full
   P0–P10 build (accounts, encrypted history, billing, voice, onboarding, PWA→TWA) is **already
   merged** (commit `e37cf3e`). A plan that treats the June-21 doc as current will re-plan finished
   work. The prompt must state which doc wins.
2. **Agent-vs-human work is conflated.** Half of what's "remaining" is human-only (Play submission,
   counsel sign-off, keystore, physical-device QA, DNS) — an agent cannot do these and must not
   pretend to. The plan must tag every task's owner.
3. **"Done" was never defined as testable.** "Full-fledged" needs a checklist a reviewer can tick,
   or it's unfalsifiable.

The five numbered goals from the raw ask are preserved verbatim in scope, just sharpened into
acceptance criteria.

---

# PROMPT

## Role & objective

You are the lead engineer + release owner for **Revora** (Next.js 16 / React 19 / Vercel / OpenAI
Responses `gpt-5.4-mini` prediabetes decision-coach; branch `launch-hardening`). Produce **one
unified, dependency-ordered implementation plan** that takes the app from its current state to
**true done: a real, non-technical prediabetic can reach it publicly on the web and as an installed
Android app, use it safely, and pay — with support, monitoring, and incident response live.**

The plan is the deliverable. Write it to `docs/handoff/2026-07-04-unified-completion-plan.md`.
Do **not** start implementing while authoring it — plan first.

## Read before planning (in this order)

1. `docs/handoff/2026-07-04-pantry-review-pipeline-session-handoff.md` — **current live state; highest authority for what's in-flight.**
2. `docs/handoff/human-actions-required.md` — human/ops/legal checklist. **Founder reports most items now done — re-verify each and update the file; do not assume the checkboxes are current.**
3. `~/.gstack/projects/Revora/tefera-launch-hardening-design-20260704-082028.md` — APPROVED pantry design doc + UI spec + guardrails (**locked decisions — do not relitigate**).
4. `~/.gstack/projects/Revora/tefera-launch-hardening-eng-review-test-plan-20260704.md` — the pantry test plan (every gap here needs a test when its code lands).
5. `docs/production-implementation-plan-2026-07-01.md` — the full-build P0–P10 plan (**mostly executed/merged**; mine it for the human-action inventory §10 and the launch-ready bar §11, not for re-building shipped phases).
6. `DESIGN.md` (repo root) — canonical design system. `TODOS.md` (repo root) — 2 captured deferrals.
7. `docs/superpowers/plans/2026-06-21-revora-launch-hardening.md` — **SUPERSEDED for scope**; useful only as reference for the already-shipped rate-limit/PWA/observability patterns. Its "no accounts / no DB / photo deferred" V1 posture is **no longer true.**

## Authority hierarchy (resolve conflicts in this order)

Live handoff (1) > approved design doc (3) > production plan (5) > June-21 plan (7).
When two docs disagree, the newer/higher one wins and you say so in one line in the plan.
**Known stale references:** the design doc (3) says "GPT-4o" and implies a PDF report — both
outdated; the current truth is **`gpt-5.4-mini`** and a **tokenless HTML report** (`window.print()`
for "Save as PDF", no PDF library). Use the current values.

## Ground truth (verify against the working tree; don't take on faith)

- **Merged & shipped (do NOT re-plan):** text + voice input, extended decision card, onboarding,
  magic-link accounts, encrypted server history, streaks/week-view, rule-based insights, BAI
  progress, subscription billing (Stripe web + Play Billing scaffolding), PWA, rate-limiting,
  Sentry wiring, `/api/health`, terms/privacy drafts, reviewer test-login. Confirm via git log +
  grep before declaring anything "remaining."
- **In-flight (the biggest remaining code chunk) — Pantry Review pipeline:** schema + migration +
  tests are **done** (`drizzle/0001_pantry-review.sql`, `tests/unit/server/pantry-schema.test.ts`,
  12/12 green). Lanes **A2 (webhook branch + claim tokens) → E (email util) → B (intake/confirm UI)
  → C (vision extraction + eval) → D (report + admin) → A3 (batch processor + cron sweep)** are
  **not built.** `@vercel/blob` is **not installed.**
- **Blocking hazard:** the working-tree `.env.example` has contained **live keys** — treat scrubbing
  it to placeholders (and flagging key rotation as a human action) as a **hard gate before any `git add`.**

## Non-negotiable constraints (inherit into every task)

- **One engine, never bypassed:** all judgments run through `lib/revora/service.ts:checkFood()`
  (+ `postprocess.ts` floors). Vision is an **extractor only, never a judge**; the buyer
  **confirms/edits the item list before any verdict.** Do not modify the safety engine.
- **Safety invariant:** zero harmful-SAFE across the eval set, always (`tests/evals/`).
- **Claims boundary:** informational-only copy; banned families diagnose/treat/cure/prevent/**reverse**/
  future-A1C/exact-numbers (`docs/safety/claims-boundary.md`); single contract disclaimer only.
- **Privacy:** health-adjacent fields (exact A1C, food/item text, report payload) **encrypted at rest**
  (AES-256-GCM, `HEALTH_DATA_KEY`); pantry photos deleted from Blob on delivery; `store:false` on OpenAI.
- **Webhook regression is the highest-priority test:** modifying `applyStripeEvent` for the pantry
  price ID must leave existing subscription events **behaving identically.**
- **No new UI framework** (hand-written CSS + DESIGN.md tokens only). **TDD**; keep vitest + Playwright
  + axe green at every commit; conventional commits; one atomic commit per task.
- **Never** push to production, spend money, submit to Play, or execute legal steps — those are human actions.

## Scope — the five workstreams (each must appear in the plan with acceptance criteria)

**WS1 — Finish the remaining tasks.** Reconcile `human-actions-required.md` and the P7–P10
appendix into a single deduplicated remaining-work list. Separate **agent-executable code gaps**
(e.g. the `public/manifest.webmanifest` `screenshots` array flagged in P8; any consistency-check
wiring) from **human-only ops/legal** (Railway/Umami provision, secrets in Vercel, counsel Q1–Q10,
keystore, assetlinks-after-first-upload, Play forms). Each gets an owner and a "done when."

**WS2 — Build the Pantry Review feature.** Full lane plan A2→E→B→C→D→A3 per the live handoff §4
and the 12 locked decisions §3. Include: install `@vercel/blob`; verify `gpt-5.4-mini` image-input
support at build time (fall back to a vision-capable sibling for *extraction only* if unsupported);
handle HEIC/EXIF; caps (≤10 photos/order, ≤5MB, ≤40 items); `maxDuration=300` + lease column +
cron sweep; `/admin/pantry` ops page; Stripe Payment Link webhook branch idempotent on session id;
claim-token binding (not email equality); intake collects A1C band + Art. 9 consent. A test per
test-plan gap as each lane lands.

**WS3 — Test everything end-to-end.** Full green gate: `npm run typecheck`, `npm test`,
`npm run eval:revora`, Playwright smoke, axe. Add the E2E happy path (simulated webhook → magic-link
sign-in → upload → edit drafts → confirm → report ready → email) and the critical regression
(subscription billing unaffected). Enumerate every edge case from the test plan (wrong-user access,
cap rejections, partial/total item failure, stuck-order sweep, ciphertext-at-rest assertion).

**WS4 — Test, verify & validate the prompts.** Evaluate the **two** LLM prompts against real runs:
(a) the existing revora judge prompt (`lib/revora/prompt.ts`) via `eval:revora:live` — record
harmful-SAFE=0, risk accuracy ≥ target, usefulness pass; (b) the **new** pantry vision-extraction
prompt via `eval:pantry-extract` (8–10 hand-labeled founder photos, ≥70% recall, zero hallucinations).
Deliverable is an **evidence-backed verdict per prompt: keep as-is or improve, with the specific
change** — not "looks fine." No prompt edit ships without an eval delta.

**WS5 — Human-simulated end-to-end testing.** A scripted walkthrough performed *as a real
non-technical prediabetic user*, on **both surfaces**: (i) web (mobile Chrome + desktop), (ii)
installed Android app (TWA / device-QA checklist `docs/ops/device-qa-checklist.md`). Cover the full
funnel: land → free scan → sign up → onboard → daily card → nudge → pay → pantry pre-order →
upload → confirm → receive report. Capture friction, confusing copy, and dead-ends as a punch-list.
Note which steps need a human/hardware (real Play purchase/restore) vs. can be Playwright-simulated.

## Explicitly OUT of scope — do NOT relitigate or rebuild

- The **strategy/portfolio/pricing/day-45-gate decisions** in the design doc (founder-approved, on record).
- **Photo-assist inside the main scan flow (D5)** and **CGM correlation** — deferred by owner; not this plan.
- Anything already merged in P0–P10 (see Ground Truth) — verify it works, don't re-architect it.
- Adding Tailwind/analytics-beyond-Umami/new deps the shipped plan already declined.

## Definition of "true done" (make this a testable checklist in the plan)

A reviewer can tick every box before the link + app go public. **Split into two groups so the plan
author doesn't treat human/hardware gates as its own completion target** (the agent finishes Group A;
Group B waits on human/hardware and is the release owner's checklist):

**Group A — agent-completable (the plan's actual done bar):**
- [ ] Non-technical user completes a scan on mobile web and gets a calm result in <~12s or a specific failure message.
- [ ] Sign-up → onboarding → encrypted history → daily nudge works for a real account end-to-end.
- [ ] Web Stripe subscription purchase enforces entitlement (server receipt verification).
- [ ] Pantry: pay via Payment Link → intake → confirm → report emailed; refund cancels; stuck orders self-heal.
- [ ] Both eval gates pass on the live model (revora judge + pantry extraction) with recorded numbers.
- [ ] Abuse/cost controls hold (per-IP 429, daily cap; OpenAI dashboard hard cap = human, see Group B).
- [ ] Claims-boundary + disclaimer-presence + privacy-minimal tests green; health data encrypted at rest (verified).
- [ ] `typecheck`/`test`/`eval:revora`/Playwright/axe all green on the release commit.
- [ ] Human-simulated funnel walkthrough (web) produces zero blocking defects; punch-list triaged.

**Group B — launch gates (human/hardware/ops — cannot be closed by the agent):**
- [ ] OpenAI dashboard hard spend cap set; secrets provisioned in Vercel; Railway/Umami stood up.
- [ ] Play Billing purchase/restore verified on a **real device** (emulators can't test billing).
- [ ] Installable Android app launches with no URL bar (assetlinks validated post first-upload) and passes device-QA.
- [ ] Counsel sign-off (Q1–Q10) on file; store listing + Data Safety submitted; support inbox + uptime monitor live.
- [ ] Operator can pause (<60s Edge Config) and roll back (<5min Vercel), both rehearsed.

## Plan format requirements

- **Dependency-ordered phases** with a one-page **critical path** table up top (shortest chain to a
  real paying user on both surfaces).
- **Per task:** Action · Files/services · **Owner (agent | human | human+agent)** · Effort · Verification.
  Code tasks embed test-first steps + exact commands; audit/legal/ops tasks use action + acceptance
  criteria (no code, by design) and are clearly flagged human-only.
- A consolidated **Human-Actions appendix** (the plan's single source of "what only you can do"),
  reconciled against and used to update `human-actions-required.md`.
- A short **"superseded / already-done"** note so no one re-plans shipped work.
- Call out the `.env.example` live-key scrub + key rotation as the **first gate.**

## First moves (do these before writing phases)

1. `git log` + grep the tree to confirm what's actually merged vs. still open (don't trust checkboxes).
2. Re-verify every item in `human-actions-required.md`; mark what's truly still open.
3. Confirm the `.env.example` state and make its scrub the plan's gate-0.
4. Then author the phased plan against the Definition of Done above.
