# Prompt — Validate the Revora E2E audit corpus and produce the end-to-end readiness implementation plan

Created: 2026-07-24 · Working directory: `/home/tefera/Desktop/Revora`

---

## Role

You are the release engineer for Revora. A prior report-only audit produced the
corpus listed below and returned **Engineering E2E FAIL / Core promise FAILED /
Health-claims FAIL / Paid retention INSUFFICIENT EVIDENCE / Production NO-GO**.

Your job has two halves, in order:

1. **Validate** — independently re-verify every finding in that corpus against
   the live repository and live production. The corpus is a set of *claims*, not
   facts. Do not inherit any verdict.
2. **Synthesize and plan** — turn the surviving findings into one comprehensive,
   sequenced implementation plan that makes the app work end to end and be ready
   for real end users.

Report-only ends here: the deliverable is a plan you could hand to an executor
and have shipped. Do **not** apply code fixes in this pass unless explicitly
told to; the output is the validated ledger plus the plan.

## Input corpus (read all of these)

| # | File |
|---|---|
| 1 | `docs/handoff/2026-07-23-revora-e2e-promise-retention-audit-report.md` (canonical) |
| 2 | `docs/handoff/2026-07-23-revora-e2e-promise-retention-audit-report-opus48-b5c03f4.md` |
| 3 | `docs/handoff/2026-07-23-revora-e2e-promise-retention-continuation-handoff.md` |
| 4 | `docs/handoff/2026-07-23-revora-e2e-issue-ledger.csv` (AUD-001 … AUD-031) |
| 5 | `docs/handoff/2026-07-23-revora-e2e-promise-to-proof-matrix.csv` |
| 6 | `docs/handoff/2026-07-23-revora-promise-to-proof-matrix-audit.md` |
| 7 | `docs/handoff/2026-07-23-revora-e2e-api-contract-matrix.csv` |
| 8 | `docs/handoff/2026-07-23-revora-e2e-feature-function-route-test-matrix.csv` |
| 9 | `docs/handoff/2026-07-23-revora-e2e-flag-role-state-matrix.csv` |
| 10 | `docs/handoff/2026-07-23-revora-e2e-run-evidence.csv` |
| 11 | `docs/handoff/2026-07-23-revora-e2e-test-inventory.md` |
| 12 | `docs/handoff/2026-07-23-revora-e2e-test-cases.json` |
| 13 | `docs/handoff/2026-07-23-revora-e2e-source-inventory.md` |
| 14 | `docs/handoff/2026-07-23-revora-e2e-document-corpus.md` |

Verify the artifact SHA-256 table at the end of file 3 first. If a hash does not
match, say so and treat that artifact as untrusted input.

---

## Phase 1 — Refresh the ground truth

Before validating anything, re-establish the facts the corpus was written
against, because they have moved:

- current branch, local `HEAD`, dirty/uncommitted state, ahead/behind vs `main`;
- the SHA currently deployed to production and the deployment ID/state;
- the live values (present/absent, not secrets) of every feature flag and every
  provider/environment variable named in the corpus;
- current Stripe mode and subscription/checkout counts; current production data
  counts (checks, subscriptions, memories, journeys, weekly artifacts);
- CI status of the deployed SHA.

The corpus was written at local `b5c03f4666ea793923482b08fd53c45c037467e7`
against production `24d88ec85ba52162544e0336a189db340c18616d`. State explicitly
what changed since, and mark any finding whose reproduction path no longer
exists as **STALE** rather than closed.

## Phase 2 — Validate every finding

Work the ledger `AUD-001` … `AUD-031` in severity order (3 × P0, 19 × P1,
5 × P2, 4 × P3), then the FAILED/PARTIAL rows of the promise, API, feature, and
flag/role matrices.

For each item, do not accept the ledger's own reasoning. Reproduce it:

- open the exact cited file and line range and confirm the code still says what
  the finding says it says;
- run the cited command from a clean checkout at the current candidate SHA;
- for runtime/behavioral claims, drive the real path (unit, contract, eval, or
  browser) and capture the actual output;
- for security advisories, confirm both the advisory's presence **and** its
  reachability in this codebase's actual call path.

Assign exactly one verdict per finding, with the evidence that decided it:

| Verdict | Meaning |
|---|---|
| `CONFIRMED` | Reproduced at the current candidate. Real, still open. |
| `PARTIAL` | Real but narrower, less severe, or differently caused than described. Restate it correctly. |
| `REFUTED` | Could not be reproduced; the original evidence does not support the claim. Explain why. |
| `STALE` | The code, flag, or dependency has changed; the finding no longer applies as written. |
| `NEW` | A defect you found during validation that the corpus missed. Add it with the ledger's column schema. |

Re-rank severity yourself. If the corpus called something P1 that is actually a
launch blocker (or vice versa), say so and justify it. Explicit attention to the
three claimed P0s — treat them as hypotheses to be tested, not as settled:

- **AUD-015** — broad symptom route emitting ~15 g carbohydrate / 15-minute
  recheck treatment instruction.
- **AUD-024** — reachable Auth.js Unicode email-normalization advisory
  (GHSA-7rqj-j65f-68wh) in the passwordless sign-in chain.
- **AUD-025** — missing model configuration preempting clinical / A1C-boundary /
  invalid-input deterministic routing.

Also independently test the two claims that decide whether the product is honest
with users: the harmful-if-`Clear` release-corpus fixtures, and the absence of
deterministic pediatric exclusion.

Run the full gate from a clean worktree at the current candidate SHA with a
disposable loopback Postgres and no inherited provider routes:

```bash
env -u REVORA_MODEL -u OPENAI_BASE_URL npm ci
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run lint
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run typecheck
env -u REVORA_MODEL -u OPENAI_BASE_URL npm test
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run contract
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run build
env -u REVORA_MODEL -u OPENAI_BASE_URL npm run eval:revora
env -u REVORA_MODEL -u OPENAI_BASE_URL -u OPENAI_API_KEY -u REVORA_LIVE_EVAL npm run eval:pantry-extract
env -u REVORA_MODEL -u OPENAI_BASE_URL -u OPENAI_API_KEY npm run eval:meal-photo
npm run e2e
npm audit --omit=dev
npm audit
git diff --check
```

A skipped live-provider eval is not a pass — record it as a gap. Do not run any
live-provider eval without an explicit budget, non-user fixtures, a known
provider route, and authorization.

## Phase 3 — Synthesize

Collapse the validated set into a coherent picture, not a list:

- group `CONFIRMED`/`PARTIAL` findings into **root causes** — several ledger
  rows almost certainly share one cause (e.g. the flag/env allowlists never
  extended to the retention features; provider construction not lazy behind
  deterministic routes; claims-gate phrase coverage);
- state each root cause once, with every finding ID it explains;
- order the causes by user-facing risk, then by unblocking power (what has to be
  true before other work can even be tested);
- name the true launch-blocking set, and explicitly list what is *not* blocking
  and can ship after.

## Phase 4 — Implementation plan

Produce one plan that takes the app from its current state to
**works end to end, ready for end users**. Requirements for the plan:

- **Sequenced workstreams**, each with: the root cause it closes, finding IDs
  covered, exact files/modules to change, the approach, dependencies on other
  workstreams, and rough effort.
- **A regression test per fix.** No fix lands without a test that fails before
  it and passes after. Name the test file and the assertion.
- **Exact verification commands** per workstream and one final release gate,
  with the pass criteria stated as observable output, not adjectives.
- **Owner-action items separated out** — anything needing a human (budgets,
  credentials, sandbox devices, DNS, mailbox, licensed Play device, disposable
  production-like accounts) goes in its own table with what unlocks on completion.
- **Rollout and rollback** — flag order, canary/verification steps in production,
  and the exact revert path per workstream.
- **A definition of done for "ready for end users"** — the concrete checklist
  that flips Production from NO-GO to GO, including which currently
  unverified areas (live-model quality, photo/Pantry, Play billing, email
  delivery, signed-in cross-user journeys, production browser crawl,
  accessibility, service worker) must be closed versus consciously deferred with
  user-safe containment.
- **Honest residuals** — what will still be unproven at launch, and how it is
  contained.

---

## Standing decisions that constrain this work

These are decided. Do not re-open them; plan around them.

### 1. Production model provider is OpenRouter, not OpenAI

`REVORA_MODEL` in production routes through **OpenRouter**. The plan must cover
the full switch, not just the key swap:

- provider/base-URL configuration, model ID naming, and auth headers for
  OpenRouter across every call site (check, photo, Pantry extract, evals);
- every environment reference updated in lockstep: `.env.example`,
  `docs/ops/env-reference.md`, `next.config.ts`, `scripts/e2e-runtime-env.ts`,
  CI, and Vercel production/preview environments;
- the AUD-025 fix must hold under the new provider: deterministic clinical /
  A1C-boundary / invalid-input routes must never construct a provider client and
  must behave identically with the credential missing, invalid, or unreachable —
  add the OpenRouter cases to that regression test;
- failure, timeout, rate-limit, and model-unavailable behavior on OpenRouter,
  plus whatever fallback policy you recommend (state it explicitly);
- cost/latency implications and how the eval corpora are re-baselined against
  the new provider before any quality claim is made;
- privacy/data-retention posture of the chosen route, and what the user-facing
  copy must say if it changes.

### 2. All features ship activated — coordinated, no friction, no confusion

Meal Memory, Learning Journey, history, and the rest are to be **on**, not held
off. The prior handoff's "keep retention features off" instruction is
superseded. The plan must therefore make activation safe and coherent:

- close the flag-contract defect first (AUD-002 and siblings): all four
  Memory/Journey client/server variables documented, guarded against asymmetric
  client-on/server-off production activation, and blanked in isolated E2E so
  runs stop inheriting ambient flags;
- specify the **all-on** state as the default test matrix — every row of the
  flag/role/state matrix re-derived for flags on, for anonymous, guest, free
  signed-in, and paid users;
- design the coordinated journey explicitly: what a user sees first, how a
  check flows into history, how history feeds Memory, how Memory feeds the
  Journey, and where each surface hands off to the next. Name every place two
  features could contradict each other (duplicate prompts, competing empty
  states, two sources of truth for the same fact, overlapping CTAs) and resolve
  it in the plan;
- state the empty/first-run behavior for each feature so a new user with no data
  never sees a broken or confusing surface;
- a friction/confusion pass is a deliverable: one walkthrough of the full
  activated journey with the specific copy, ordering, and navigation changes
  needed to make it feel like one product.

### 3. Outsider voices decide nothing

Counsel, dietitian, clinical-reviewer, simulated-reviewer, and any other
outsider material may be **inventoried as an evidence class only**. None of it
may influence any verdict, severity, confidence, priority, or the release
decision. Safety and claims verdicts are decided by reproducible engineering
evidence — code, tests, runtime output — and nothing else. If such material
appears in the corpus, label it and set it aside; do not cite it as
justification anywhere in the plan.

---

## Deliverables

Write these to `docs/handoff/` with today's date prefix:

1. `…-validated-issue-ledger.csv` — the original ledger schema plus columns
   `Validation verdict`, `Validation evidence`, `Re-ranked severity`,
   `Root cause group`. Every `AUD-0xx` row present, plus any `NEW-0xx`.
2. `…-e2e-readiness-implementation-plan.md` — Phases 3 and 4 above: root-cause
   synthesis, sequenced workstreams, tests, verification commands, owner
   actions, rollout/rollback, definition of done, residuals.
3. `…-validation-run-evidence.csv` — same schema as the existing run-evidence
   file, one row per command you actually ran, with exit codes and artifact
   paths.

Rules for all output:

- Every claim carries its evidence — a `file:line`, a command with its exit
  code, or a captured artifact path. No assertion without a source.
- Say "not verified" where you did not verify. Never present an untested path as
  working. A skipped test is a gap, not a pass.
- Where you disagree with the prior audit, say so plainly and show why.
- Do not mutate production, real user data, payment objects, live flags, or send
  real email. Do not commit or deploy.
- If something is blocked on a human, finish everything that is not blocked,
  then list precisely what you could not do and what would unblock it.

Open with a one-paragraph bottom line: is the app closer to end-user-ready than
the prior audit concluded, or not, and what is the single thing standing in the
way.
