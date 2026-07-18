# Revora — Counsel-Gate Unlock Session Handoff

**Created:** 2026-07-12  
**Goal for the next session:** produce a truthful, launch-candidate evidence
bundle; obtain and record the necessary licensed-counsel decision; implement
any redlines; then prove the counsel gate is actually closed. Do not describe
this as closed merely because local tests pass.

## Start here

You are resuming two divergent local truths. Reconcile them before changing
anything.

| Location | Current state | Meaning |
| --- | --- | --- |
| `/home/tefera/Desktop/Revora` | `main` at `eb28ef7`; user-owned uncommitted edits in `docs/handoff/2026-07-12-unconditional-go-handoff.md` and `tests/evals/revora-graded-eval.test.ts` | Do **not** reset, checkout, or overwrite these edits. This branch also contains a separate conditional-go effort and a checkout gate absent from the legal worktree. |
| `/home/tefera/Desktop/Revora/.claude/worktrees/app-shell-dashboard` | `feat/app-shell-dashboard` at `b80cd67`; large **uncommitted** legal-remediation package | This is where the 2026-07-12 legal controls were implemented and locally verified. It is not yet integrated into `main`. |

The current user request is to unlock the **counsel gate**. That requires more
than code: actual outside licensed-counsel review of a precise launch candidate
and written disposition. Engineering can make the package review-ready and
implement redlines; it cannot honestly self-approve the legal gate.

## Non-negotiable rules

- Preserve the dirty root checkout and the `.scratch/` directory in the legal
  worktree. Never use `git reset --hard`, `git checkout --`, or `git add .`.
- Do not rely on stale prose, historical claims, `/api/health`, a simulated
  panel, or a passing mock evaluation as closure proof. Re-open the current
  source, candidate diff, deployed revision, and live configuration first.
- Keep distinct truth buckets: legal worktree source/tests; clean integration
  worktree; merged revision; deployed runtime; external counsel decision.
- Do not enable meal photo-assist or longitudinal insights, advertise either,
  or open paid checkout while the corresponding counsel/evidence gates remain
  unresolved.
- Do not tell the user the app must be killed. Preserve the core product unless
  actual licensed counsel directs a narrower scope or a feature must remain
  disabled.

## What was implemented in the legal-remediation worktree

The following changes are present only in
`/home/tefera/Desktop/Revora/.claude/worktrees/app-shell-dashboard` and are
uncommitted.

### Product and claims boundary

- Preserved the meal-check product, A1C context, Clear / Be careful / Hold off
  labels, account/history/insight surfaces, subscription flows, and Pantry
  Review.
- Replaced outcome, reversal, individual-safety, and “Should I eat this?”
  framing with general educational meal-pattern language.
- Made the label meaning explicit: A1C changes caution presentation only; it
  is not an individualized prediction or medical suitability determination.
- Retired the old `Revora_Brand_Positioning_v2.md` into a tombstone and made
  active marketing/listing/runbook copy safer.
- Added claims-boundary regression coverage for active product/publishing
  surfaces.

### Privacy, consent, Terms, refunds, and paid assent

- Rewrote `/terms` and `/privacy` with intended-use, data categories,
  recipients, retention, rights, refund, cancellation, and support language.
- Added purpose-bound health-data consent in onboarding and Pantry Review,
  including OpenAI disclosure and a Privacy link.
- Added `DELETE /api/account/health-data`: it deletes saved health data,
  checks, profile, insights, pushes, and Pantry data while preserving login and
  subscription records.
- Made persistence of a signed-in meal check depend on an active
  consent-bearing profile.
- Added required Terms/Privacy checkboxes to web subscription, trial, and
  Pantry Review purchase paths. Server handlers reject absent/false/stale
  acceptance and save version/timestamp evidence.
- Added `lib/legal/terms.ts` (`TERMS_VERSION = "2026-07-12"`) and schema
  migrations `drizzle/0003_hesitant_frog_thor.sql` and
  `drizzle/0004_aspiring_jocasta.sql`.

### Verification already run in that worktree

These are **local worktree results**, not merged or deployed proof:

- `npm run typecheck` — PASS.
- `npm test` — PASS: 102 files passed, 1 skipped; 783 tests passed, 2 skipped.
- `npm run eval:revora` — PASS: 8 tests.
- `npm run build` — PASS; static build completed and includes
  `/api/account/health-data`.
- Targeted claims/privacy/coach tests — PASS: 115 tests.
- Targeted billing/consent/deletion server tests — PASS: 50 tests.
- Browser smoke, Mobile Chrome/one worker — billing/dashboard: 8 passed;
  onboarding/A1C boundary: 6 passed.
- `git diff --check` — PASS.

The browser server had no database, so signed-out smoke tests emitted expected
Auth.js `MissingAdapter` logs. That does not prove authenticated production
behavior; production data/auth flows must be tested after deployment.

## Critical source conflicts found after the internal GREEN record

These conflicts mean the prior internal GREEN record is useful evidence, but
**not sufficient to unlock counsel or launch**.

1. **Meal photo-assist is ON by default in actual source.**
   `lib/photo-input-flag.ts` currently returns
   `process.env.NEXT_PUBLIC_PHOTO_INPUT !== "0"`; the component and
   `/api/check/photo-draft` therefore expose the feature unless an operator
   explicitly sets `0`. This contradicts `docs/ops/env-reference.md`, which
   says photo is dormant unless set to `1`, and contradicts the legal review
   assumption that it is off.

2. **Longitudinal insights are active and have no production gate.**
   `lib/coach/insights.ts`, `lib/coach/compute.ts`, dashboard/guest dashboard,
   daily loop, and paywall surfaces actively derive/display them. The simulated
   FDA persona explicitly says to keep them off pending function-specific
   review.

3. **The counsel brief contains stale, self-contradictory premises.**
   It still says an informational PWA may launch in parallel and retains
   historical description/path assumptions. The simulated panel rejects that
   premise. Never send the brief unchanged to real counsel.

4. **The branch split is material.**
   Root `main` has a `LEGAL_TERMS_FINAL` checkout gate and a newer conditional-
   go/eval line; the legal worktree does not represent that complete current
   main state. Do not merge it blindly or call either branch the launch
   candidate until a clean integration build is proven.

## Exact execution plan

### Phase 0 — establish a clean candidate and contain the currently unreviewed features

1. Inspect relationship and dirtiness before staging:

   ```bash
   cd /home/tefera/Desktop/Revora
   git worktree list --porcelain
   git status --short
   git log --oneline --decorate -8
   git merge-base main feat/app-shell-dashboard
   git log --left-right --cherry-pick --oneline main...feat/app-shell-dashboard

   cd /home/tefera/Desktop/Revora/.claude/worktrees/app-shell-dashboard
   git status --short
   git diff --check
   ```

2. In the legal worktree, make meal photo-assist fail closed in production.
   The safe contract is: unset or any value other than explicit `1` means
   hidden client UI **and** `404` from `/api/check/photo-draft` in production.
   Keep a deliberate dev/test opt-in only if test configuration makes it
   explicit. Update `lib/photo-input-flag.ts`, relevant smoke/unit tests,
   `docs/ops/env-reference.md`, active landing/check/listing copy, and the
   counsel packet. Do not merely change documentation.

3. Add an equivalent production-off gate for longitudinal insights. It must
   be enforced at each output boundary, not merely hidden with CSS: server
   coach computation/API payload, guest/local dashboard, signed-in dashboard,
   daily loop, and paid-copy promises. Default production state must be off
   until written counsel clearance plus evidence review. Add regression tests
   proving no insight content is returned/rendered when the gate is off.

4. Rewrite `docs/legal/counsel-brief.md` into a generated/current launch-
   candidate brief. It must state the exact branch/commit, actual routes,
   enabled vs disabled features, data flows, processor list, paid flows, and
   all known limits. Delete the obsolete parallel-launch permission. Link the
   panel issue-spotting review as non-legal-advice background only.

5. Re-run the focused feature-flag, claims, consent, billing, and deletion
   tests; then run the full local gates in Phase 4 below. Save exact outputs
   in a dated candidate evidence folder. A passing test without a candidate
   commit hash is not counsel evidence.

### Phase 1 — integrate safely, without disturbing user work

1. Commit only the intended legal-remediation package in its own worktree.
   Stage tracked changes explicitly (or `git add -u` only after reviewing the
   list), then explicitly add the intended new routes/docs/migrations/tests.
   Do not stage `.scratch/`.

2. Create a **new clean integration worktree from current `main`**, not the
   dirty root checkout. Merge/cherry-pick the legal-remediation commit there.
   Resolve conflicts from current source behavior, especially:

   - root `LEGAL_TERMS_FINAL` paid-checkout gate;
   - root eval/conditional-go changes;
   - terms/privacy/refund/claims files changed on both lines;
   - photo and longitudinal gates introduced in Phase 0.

3. Do not overwrite the root checkout's modified handoff or eval test. Once
   the clean integration worktree passes all gates, present the exact commit,
   diff, and merge plan to the user before landing if a branch/PR action is
   required.

### Phase 2 — make a real counsel evidence packet

Create `docs/legal/counsel-packet/<candidate-short-sha>/` in the clean
integration worktree. It must be sourced from the candidate, not hand-written
from old docs. Include:

1. **Feature, route, and claim inventory** — landing/onboarding/check/result,
   dashboards and insights, photo route, Pantry Review, paywalls, Terms,
   Privacy, support macros, Play listing, emails, and public APIs. Mark every
   feature enabled/disabled and show the enforcing source/flag.
2. **Screenshots/video captures** of all substantive public and paid decision
   surfaces, including each label, A1C boundary states, consent, withdrawal,
   cancellation, refund, and disabled photo/insight states.
3. **Claim-to-evidence matrix** for every active label/reason/adjustment/swap,
   sequence or insight, paywall statement, support macro, store statement, and
   ad. For each: exact wording, intended net impression, evidence basis,
   limitation, owner, and whether it is disabled pending counsel.
4. **Data/processor map** — controller/legal entity, A1C/meal/photos/notes,
   storage locations and encryption, OpenAI, hosting/database, auth email,
   Stripe, Google Play, push, analytics, Sentry, support, transfers,
   retention/deletion, and incident-response owners.
5. **Commercial packet** — pre-purchase screenshots/captures showing price,
   trial and conversion, renewal, cancellation, refund language, checkboxes,
   Terms version/time records, Stripe/Play roles, support routing, and real
   operator/contact values.
6. **Release evidence** — exact candidate SHA, migration list, test outputs,
   launch-flag table, and a clearly labeled list of things not tested against
   production.

### Phase 3 — obtain the human decisions and outside review

The next agent must ask the owner for these facts; do not invent any of them:

- legal operating entity and registered/contact address;
- launch jurisdiction and whether launch is genuinely US-only;
- governing law/venue and the final merchant/refund policy choices;
- monitored support inbox and named refund/incident owner;
- whether accounts, paid subscriptions, Pantry Review, meal photo-assist, and
  longitudinal insights are in the proposed launch scope;
- whether the owner wants FDA digital-health counsel, privacy/consumer counsel,
  or a firm that covers both; and authority to send the packet.

Then provide the packet to qualified counsel. The written response must answer,
at minimum:

1. FDA intended-use/device analysis of the actual candidate, A1C handling,
   result labels, insight function, and photo function;
2. permitted/prohibited labeling and store/marketing language;
3. FTC substantiation requirements and acceptance of the claim-evidence
   matrix;
4. Terms, clickwrap, refund, renewal, cancellation, entity, and jurisdiction;
5. state consumer-health-data/HBNR applicability, privacy notice, processor/
   transfer terms, consent/withdrawal, retention, and incident plan;
6. explicit conditions for ever enabling meal photo-assist or longitudinal
   insights.

### Phase 4 — close, prove, and record the gate

1. Implement every counsel redline in the clean candidate; keep rejected or
   unreviewed features disabled. Update the claims ledger and generated packet.
2. Apply migrations `0003` and `0004` to preview, then production only during
   authorized deployment. Set real `LEGAL_ENTITY_NAME` and `SUPPORT_EMAIL`.
3. Preserve root `LEGAL_TERMS_FINAL` fail-closed behavior. Set it to `1` only
   after final Terms are counsel-cleared, rendered on the live candidate, and
   the paid-flow acceptance record is verified.
4. Run and record:

   ```bash
   npm run typecheck
   npm test
   npm run eval:revora
   npm run build
   git diff --check
   npx playwright test tests/smoke/billing-pages.spec.ts tests/smoke/onboarding.spec.ts tests/smoke/dashboard.spec.ts --project='Mobile Chrome' --workers=1
   ```

   Treat mock eval output as code-regression evidence only. The live model and
   clinical/dietitian validation gates documented on `main` remain separate;
   do not conflate them with counsel clearance.

5. Deploy the exact reviewed SHA to preview, then prove live Terms/Privacy,
   consent withdrawal/erasure, disabled feature routes, checkout disclosures,
   real account flows, and paid/cancel/refund flows. Record environment, time,
   and evidence links.
6. Add a dated `docs/legal/counsel-clearance-<sha>.md` containing the counsel
   opinion/reference, scope, conditions, implemented redlines, candidate SHA,
   production proof, owner acceptance of any residual risk, and the explicit
   statement `COUNSEL GATE: CLEARED` only after counsel has said so in writing.

## Counsel-gate definition of done

The gate is **not** done until every item below is true:

- [ ] A clean integrated candidate SHA exists; legal remediation and current
      `main` controls both survive in it.
- [ ] Meal photo-assist and longitudinal insights are fail-closed/off in the
      proposed production candidate unless each has explicit written clearance.
- [ ] Active claims, store copy, support copy, and paid flows match a reviewed
      claim/data/feature inventory.
- [ ] Real entity, contact, refund, consent, privacy, Terms, and clickwrap
      facts are present; no placeholders or fallback identity are used.
- [ ] Candidate packet and exact live/preview evidence were supplied to
      licensed counsel.
- [ ] Written counsel response covers FDA intended use, FTC claims,
      consumer-contract/refund, and privacy/health-data scope for the actual
      candidate.
- [ ] Every redline is implemented and retested; any rejected feature is
      disabled in source and production configuration.
- [ ] Counsel decision, owner acceptance of residual risk, and exact cleared
      SHA are recorded on disk.

## Required reading, in order

1. `docs/legal/counsel-panel-review-2026-07-12.md` in the legal worktree —
   issue inventory and evidence requirements; not legal advice.
2. `docs/legal/internal-green-verification-2026-07-12.md` in the legal
   worktree — implemented-control inventory and local evidence.
3. `docs/legal/counsel-brief.md` in the legal worktree — must be corrected for
   current truth before it is sent externally.
4. `docs/handoff/human-actions-required.md` and `docs/ops/launch-checklist.md`
   in the legal worktree — external provisioning and live validation gates.
5. `docs/handoff/2026-07-12-unconditional-go-handoff.md` on `main` — separate
   live-model, dietitian, key-rotation, and conditional-go blockers. Treat its
   claimed branch/deploy facts as time-sensitive and re-verify them.

## First response expected from the next session

State the two checkout truths, acknowledge the photo/insight contradictions,
show the merge-base/divergence output, and present the proposed containment
patch and candidate-integration plan. Do not start with a generic legal
summary, and do not claim the counsel gate is green before the external written
decision exists.

