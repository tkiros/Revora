# Session handoff — WTP-first reprioritization; panel + Tier-2 photos deferred behind demand

**Written:** 2026-07-17, after the session that fixed the photo-path bug
(PR #16) and received the owner's reprioritization: **Tier-2 consent-clean
photos and RD/CDCES panel recruitment are deferred until a willingness-to-pay
(WTP) test passes. Priority is speed of testing and distribution.**

**Use this file as the opening prompt of the next session.**

---

## 1. The owner's decision, recorded

> "Tier-2 consent-clean photo and panel recruitment should be completely
> deferred after the WTP test pass. These should not be a blocking gate
> without knowing whether people want to use and pay for the app or not. The
> current priority is speed of testing and distribution."

**This is sound sequencing and the roadmap below implements it.** Spending
weeks and real money on a credentialed panel for a product nobody has paid
for is the wrong order. The panel is expensive, slow (recruitment is calendar
time, not work time), and its findings are worthless if the product dies of
no demand. Demand first is correct.

**It is also mostly free to do**, because the panel and the WTP question are
nearly orthogonal — see §2. The plan below gets the WTP answer *faster* than
any plan that waits on the panel, without breaking anything.

---

## 2. The one line that does not move (read this once, then act)

The repo contains two statements that this reprioritization forces into the
open. Do not let a future session "resolve" this by quietly picking one.

| Source | Says |
|---|---|
| `docs/qa/15-w01-w05-w06-closure.md` | "**W-05 remains a launch condition.**" |
| `docs/Revora_90-Day_Distribution_Strategy.md` §0.2 | Day-0 preflight lists 7 blockers — **W-05 is not among them** |

**They are not actually in conflict once you separate two different things
that both get called "launch":**

- **Measuring demand** (landing page, pricing, waitlist, fake-door, pre-order
  intent) — **no model call reaches a stranger, no food guidance is
  delivered. The panel gate is not engaged. Ship this now.**
- **Delivering model food guidance to strangers with real A1C values acting
  on it** — this is the exact event W-05 exists for. The gate binds *here*,
  not at the WTP test.

So: **deferring the panel behind the WTP test is correct and safe. Deferring
it behind shipping the working app to real prediabetic strangers is a
different decision** — one that is the owner's to make, with counsel, not one
an agent should make by omission. The roadmap below is built so that the WTP
answer arrives *before* that decision ever has to be faced.

**Practical consequence for the next session:** if the WTP test you are asked
to build delivers guidance to strangers, stop and say so — that is the
gate-bearing variant, and §4 Option C covers it. If it is a landing/waitlist/
pricing test, build it at full speed and do not mention the panel again.

**Timing note that makes this cheap:** panel recruitment is ~2–4 weeks of
*calendar* time (recruiting, scheduling, blinding), not agent work. So the
optimal move is: **the day WTP passes, start recruitment in parallel with the
launch build.** It costs nothing to run alongside and it is the long pole for
the real launch. Deferring it past that point is what costs weeks.

---

## 3. Where things stand (ground truth, 2026-07-17)

### Engineering: the product is built and the engine is in good shape

| Fact | Value |
|---|---|
| Open PRs | **#13 → #14 → #15 → #16**, stacked in that order, **all CI-green, all unmerged**. Merge in order. |
| Live gate (final code) | **passed, 0 harmful-SAFE, 0 retry cards, riskAccuracy 97.0%** (`artifacts/qa/graded-eval-live-2026-07-16T10-02-57-508Z.json`) |
| Simulated panel | 202 cases, majority-rejected bands **9/202 (4.5%)**, 0 fabricated drivers, 0 shaming, 1 minority false-reassurance — all 9 individually parked for the human panel |
| Photo path | **Works.** 40/40 captured, 0 retry cards after the fix; 0 dangerous SAFE, 0 shaming (120 verdicts) |
| Test suite | 1271 passed; typecheck/eslint/contract green |
| Corpus coverage | **200/240** (honest — photo stratum is Tier-1 engineering only) |
| Model access | OpenRouter ~**$3.19** left of $21. Direct OpenAI org key **capped 50 req/day** |
| App surfaces built | onboarding, check, history, progress, subscribe, trial, billing, terms, account, get-the-app, privacy, how-it-works, demo |

### What the last three sessions delivered

- **#14** — every doc-18 rehearsal finding fixed (7→1 false reassurance, 0
  fabricated drivers, 0 shaming), governed copy for ED urgency + A1C≥6.5
  routing, small-model judge hardening.
- **#15** — step E: restaurant-scale starch anchor (rejected bands 17→9,
  riskAccuracy 87.9%→97.0%); **retry-card root cause found and killed**
  (`looksLikeSwap` was rejecting legitimate swaps — 0 retry cards now);
  component-mention flag measured (3pts, stays off, blocker is checker
  literalism not model quality).
- **#16** — two-tier photo protocol + **a real product bug found on photo #1**:
  `composeDraftText` had no length bound while the check schema caps food at
  160 chars, so detailed vision drafts became **fail-closed retry cards for
  users confirming the app's own draft — 8/40 (20%)**. Fixed; 40/40 clean.

### Photos: what exists and what it is

- `~/Desktop/photos/` — ~100 owner-supplied **web-sourced** meal photos
  (Reddit/review-site CDN provenance). **Tier 1: engineering test set only.**
  Never committed (third-party images), never counted as coverage, never in a
  panel packet. Manifest of the 40 selected: `photos-manifest-tier1.json`.
- **Tier 2 (consent-clean) is deferred per this reprioritization.** When it
  resumes, the cheapest source by far is **in-app photo submission behind an
  explicit QA-consent checkbox once beta users exist** — real users' real
  photos, consent captured at source, zero owner shooting time. This is why
  deferring is *also* the cheaper path: WTP → users → photos arrive free.

---

## 4. THE PATH TO TRUE DONE — reordered, WTP first

### PHASE 1 — Get the WTP answer (days, not weeks). Touches NO clinical gate.

The fastest high-signal test that delivers no guidance to strangers. Nothing
here needs the panel, Tier-2 photos, or even a funded OpenAI account.

**A. Merge the stack (owner, ~15 min).** #13 → #14 → #15 → #16. Merging
auto-deploys production. Engine + copy + QA harness only; no billing or
client-surface changes.

**B. Ship the demand surface (build, ~1 session).** From the strategy's Day-0
preflight (`docs/Revora_90-Day_Distribution_Strategy.md` §0.2) — these are the
items the WTP test *itself* depends on:

| # | Item | State (verified 2026-07-17) | Why it gates the WTP test |
|---|---|---|---|
| 6 | **Attribution** — "Where did you hear about us?" + UTMs on every link | **MISSING** | Without it you cannot read the result. Every decision rule in Part 10 needs it. **Build first.** |
| 7 | **OG/Twitter meta + og:image + sitemap/robots** | **MISSING** (`app/layout.tsx` has title only) | Every WTP channel is link-sharing. A bare preview card taxes every post. |
| 3 | **Custom domain** (`revora.bio` → A record 76.76.21.21) | Owner action | `.vercel.app` in a health subreddit reads as a weekend project |
| 4 | **Landing copy vs live config mismatch** — landing describes 7-day trial, paywall runs legacy | Owner decision | Promise-breaking in session 1 is the one thing this audience never forgives. Strategy recommends launching **legacy**; either is fine, mismatch is not. |

**C. Choose the WTP instrument (owner decides; all three defer the panel).**

| Option | What it measures | Gates touched | Speed |
|---|---|---|---|
| **A. Landing + waitlist / fake-door** — "Start free" → email capture / "coming soon" | Click-through intent, email conversion by channel | **None** | **Days. Recommended first.** |
| **B. Pre-order / "reserve your spot"** with card capture | Real money intent — the strongest WTP signal short of usage | Checkout → **`LEGAL_TERMS_FINAL=1`** counsel gate (default-blocked, 503; `app/api/billing/handlers.ts:104`). Terms page reads clean of placeholders — **verify with counsel before flipping** | Days, after terms sign-off |
| **C. Full app to strangers** | Usage + retention + payment (the real answer) | **W-05 + checkout gate + OpenAI cap.** This is the gate-bearing variant — see §2 | Weeks (needs the panel) |

**Recommendation: A now, B immediately after if A converts.** Together they
answer "do people want this and will they pay" without touching the clinical
gate at all. **If you want usage signal before the panel**, the defensible
middle is an **informed alpha** — a small group told explicitly that it is an
experimental test and not medical advice, ideally people not making clinical
decisions on it. Strangers relying on it is what the gate exists for; that is
the owner's call with counsel, not a default.

**D. Read the result.** Decision rules live in
`docs/Revora_90-Day_Distribution_Strategy.md` Part 10. Set the pass bar
*before* the test, in writing, so the result cannot be rationalized after.

### PHASE 2 — If WTP passes: parallel tracks (start the same day)

**Track 1 (calendar-bound — start immediately, it is the long pole):**
- **Recruit the RD/CDCES panel** per
  `docs/qa/dietitian-review/recruitment-one-pager.md` — 3 reviewers (≥2 RDN,
  ≥1 RDN+CDCES), registry-verified, paid, blinded. Everything else is
  prepared; only recruitment is missing. **~2–4 weeks of calendar time — this
  is why it starts on day 1 of Phase 2, not after the build.**
- **Tier-2 photos** — ship the in-app QA-consent checkbox with the beta so
  photos accumulate from real users at zero owner cost.

**Track 2 (engineering, runs alongside):**
1. **OpenAI org tier** — **the 50 req/day cap is incompatible with any real
   traffic.** This is Day-0 blocker #1 in the strategy and has been a standing
   risk across three handoffs. **Owner must raise the tier or make an explicit
   routing decision (OpenRouter in prod?) before a single stranger uses it.**
2. **Production-path confirmation run** (~$0.05, 15 min) — the entire
   rehearsal ran through OpenRouter; production calls OpenAI directly (N-19):
   ```bash
   export OPENAI_API_KEY=<direct-openai-key>   # NOT the OpenRouter key
   unset OPENAI_BASE_URL REVORA_MODEL          # blank means unset — never REVORA_MODEL=""
   npm run eval:revora:live
   ```
   Expect: passed, 0 harmful-SAFE, **0 retry cards** (the E.2 fix should hold;
   if cards appear, reproduce with the instrumented harness before touching
   code — see §6). Diff bands vs `graded-eval-live-2026-07-16T10-02-57-508Z.json`;
   any path difference goes in the panel packet.
3. **Release gates on `main`** (strategy #5) — verify green after the stack
   merges; we need fast weekly copy/funnel shipping without fear.

### PHASE 3 — Real launch (panel closed)

- Panel returns 240×3 signed DR-02 reviews → `panel-review.json` →
  `npm run review:dietitian:close` (fail-closed; requires unconditional signed
  approvals). Apply orders, bump versions, record `approved_external_panel`.
- Packet contents are ready: docs 17/18/19 (+E.1/E.2/E.3 addendum) and doc 20,
  ontology `v2026-07-16.1`, portion convention (**4 questions** — label math,
  dessert-floor carve-out, unstated-portion default, **starch-count anchor**),
  ED + high-range copy, and the parked judgment calls (wine, biryani,
  cauli-crust, khao-pad, honey/agave, the 3 over-caution cases, fixed
  clinical templates as refusal UX).

---

## 5. The measurable definition of TRUE DONE (revised for this order)

**Gate 1 — WTP answered (Phase 1):**
- [ ] Stack #13–#16 merged; production deploy healthy
- [ ] Attribution + UTMs live; OG/meta live; domain live; landing/paywall mismatch resolved
- [ ] WTP instrument shipped, pass bar written down *in advance*, result read against Part 10 rules
- [ ] **Explicit go/no-go recorded.** If no-go: stop. The panel is never run, and that is the plan working.

**Gate 2 — Safe to serve strangers (Phase 2, only if Gate 1 passes):**
- [ ] OpenAI tier raised or routing decided — 50/day cap resolved
- [ ] Production-path gate run: passed, 0 harmful-SAFE, 0 retry cards, band diffs documented
- [ ] Panel recruited and running (started day 1 of Phase 2)

**Gate 3 — Flawless and functional (Phase 3):**
- [ ] Panel signed: 240×3 reviews, unconditional, ontology signed, portion convention ratified, `review:dietitian:close` green → **W-05/F-06 CLOSED**
- [ ] 240/240 coverage (Tier-2 photos via in-app consent)
- [ ] 0 majority dangerous-false-reassurance; rejected bands at the panel's accepted rate (now 4.5%, every case parked for their ruling — **the <1% bar is theirs to confirm or re-set; do not game it**)
- [ ] 0 fabricated drivers; 0 shaming; non-shaming ≥95% per stratum
- [ ] Both eval modes green on the shipped commit; every copy string governed and signed

---

## 6. Known traps (carry-forward)

- **A green mock run is NEVER live evidence** (N-30/F-21).
- Run the suite with a clean env: `env -u REVORA_MODEL -u OPENAI_BASE_URL npm test` — otherwise `openai-client`/`service` unit tests fail on the pinned default model id.
- `gh pr checks` goes stale; trust `gh run list --branch <b> --json status,conclusion,headSha`.
- `gh pr edit` fails here (GraphQL projectCards deprecation). Use `gh api -X PATCH repos/tkiros/Revora/pulls/<n> -f body="..."`.
- `artifacts/` is gitignored; qa evidence is **force-added** by convention (`git add -f`) — a plain `git add` silently skips it.
- **Retry cards: never guess the cause.** The artifact stores only `kind: "retry"`. Reproduce with the instrumented harness (build prompt via `buildRevoraPrompt` → call model N times → feed raw output through `postprocessModelOutput` → print the `RevoraContractError` + raw fields). ~$0.01 for 6 calls; found both root causes on the first try.
- **Any new band-policy anchor in the prompt must also land in `docs/safety/portion-convention.md` with a panel question** — prompt anchors are policy, and policy is RD-ratified.
- **When widening a severity-raising rule, build a guard set of previously-accepted nearby cases** (especially cultural staples) and verify they don't flip before shipping. The first starch-anchor wording would have over-flagged dal+rotis/gallo pinto/feijoada; the guard set caught it pre-commit.
- **Third-party photos are never committed to the repo** and never carry a `consent` value implying otherwise.
- The `unsafeMajority` free-text metric over-fires; `summary.dangerousFalseReassurance` is the only reliable measure.
- OpenRouter pre-reserves credits against `max_tokens` — check `/api/v1/credits` before any batch.
- Long Bash dies at 10 min — use `run_in_background` / `setsid nohup`.
- Risk-raising lists are SUBSTRING matched on purpose; buffer lists are boundary matched on purpose. Fix via pre-strip exclusions, never by tightening the match (read the comments in `input-precheck.ts` first).
- Blank `REVORA_MODEL` means unset; never `REVORA_MODEL=""`.
- **`main` auto-deploys and costs real money. The owner merges, never the agent.**

---

## 7. Uncommitted / left alone

- `docs/handoff/2026-07-12-unconditional-go-handoff.md` (modified, pre-existing)
- `docs/handoff/2026-07-12-counsel-gate-unlock-session-handoff.md` (untracked, pre-existing)
- `docs/handoff/2026-07-16-*-handoff.md` (prior handoffs)
- `docs/qa/18-simulated-240-panel-2026-07-16.md` — **cosmetic only**: an editor re-aligned one table with tabs; data unchanged. Commit or discard, owner's call.
- Plus this file.

---

## 8. Reading order for the new session

1. **This file** — §2 first (the gate line), then §4 (the reordered roadmap).
2. `gh pr view 16` (then #15, #14, #13) — merge state decides where to branch from.
3. `docs/Revora_90-Day_Distribution_Strategy.md` §0.2 (Day-0 preflight) and Part 10 (decision rules) — the WTP test's actual spec.
4. `docs/qa/20-photo-tier1-engineering-2026-07-17.md` — photo path state + the two-tier protocol.
5. `docs/qa/19-rehearsal-fixes-2026-07-16.md` (addendum at the end) — engine state.
6. `lib/revora/prompt.ts` + `lib/revora/postprocess.ts` — read the comments whole before touching lists or floors.

**W-05 REMAINS OPEN — deferred by owner decision behind the WTP test, not
closed.** Nothing in this session or file is clinical sign-off. Re-enter the
panel the day WTP passes; it is the long pole for the real launch.

---

## Dated correction — 2026-07-17 (later same day, audit session)

§4 Option B above says checkout is "default-blocked, 503" behind
`LEGAL_TERMS_FINAL=1`. That was true when written; it is now stale. Owner
commit `8c30265` (2026-07-17) inverted the gate: **checkout is OPEN by
default and `LEGAL_TERMS_FINAL=0` is the kill switch** (see
`docs/ops/env-reference.md`). The counsel gate itself remains NOT CLEARED —
only the enforcement default moved. Also stale: "PRs #13–#16 all unmerged" —
the stack was merged; `origin/main` is at `be2c441`.
