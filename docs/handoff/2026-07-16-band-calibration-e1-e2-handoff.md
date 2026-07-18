# Session handoff — step E (band calibration + retry cards) DONE; the path from here to a flawless, functional app

**Written:** 2026-07-16, at the end of the session that worked the handoff's
step E worklist end-to-end: rejected bands 17→9, retry cards →0, the
component-mention unblock measurement recorded, and PR #15 opened (all CI
green, unmerged, stacked on #14 which is stacked on #13).

**Use this file as the opening prompt of the next session.** It contains the
complete state, the exact remaining actions, and the measurable definition of
"true done."

---

## The rules that outrank everything (unchanged, re-verified this session)

1. **DR-01:** no simulated or internal review closes W-05/F-06. Everything
   produced this session is stamped `SIMULATED — NON-CREDENTIALED`. W-05
   stays open until a real credentialed panel signs.
2. **Judge model (owner, 2026-07-16):** never opus/large-class. The pinned
   judge is `google/gemini-3.1-flash-lite` (schema-enforced default in
   `run-panel.mjs`; 63 more verdicts this session, 0 errors).
   `PANEL_JUDGE_MODEL` overrides only with owner approval.
3. **Ontology vocabulary is RD-owned (W-05).** `CARB_FORWARD_POLICY_VERSION`
   stays `2026-07-16.1` (untouched this session). Every list change bumps the
   version and goes in the panel packet.
4. **Gate-corpus changes** (`tests/fixtures/revora-eval-cases.json`, 99
   cases — untouched this session) require BOTH eval modes green before
   commit. Review-corpus label changes need ≥2/3-identical-no-dissent.
5. **`main` auto-deploys production — no direct pushes.** Branch → PR → CI
   green → owner merges. The agent NEVER merges.
6. Clinical copy changes go through `clinical-copy-governance.json` bumps
   with evidence-pack updates (none needed this session).

---

## Ground truth — where things are

| Fact | Value |
|---|---|
| Open PRs | **#13** `feat/simulated-240-panel` → **#14** `feat/rehearsal-findings-fixes` → **#15** `feat/band-calibration-e1-e2`. All CI-green, all unmerged. **Merge order: #13, then #14, then #15.** |
| This session's branch | `feat/band-calibration-e1-e2` — 3 commits: `ba74d3c` (E.1 starch anchor + E.2 swap contract + patched artifacts), `0d95fae` (E.3 measurement), `b418f12` (portion convention rule 3b + panel question 4) |
| Findings doc | `docs/qa/19-rehearsal-fixes-2026-07-16.md` — **Addendum section** at the end documents E.1/E.2/E.3 with before/after |
| Adjudication (patched in place, doc-19 pattern) | `artifacts/qa/panel-240-adjudicated-2026-07-16.json` — 202 records; 13 capture rows stamped `recapturedNote`, 39 verdicts stamped `rejudgedNote` (E.1 patch-pass) |
| Live gate evidence (this session, all passed) | `graded-eval-live-2026-07-16T09-47-51-312Z.json` (anchor v1, 93.9%), `T09-59-30-375Z` (final prompt, 93.9%, 2 retries), `T10-02-57-508Z.json` (**final code: 97.0%, 0 harmful-SAFE, 0 retry cards**), `T10-08-48-056Z.json` (E.3 flag-on measurement) |
| Prompt / ontology versions | `PROMPT_VERSION 2026-07-16.2` (starch-count anchor), `CARB_FORWARD_POLICY_VERSION 2026-07-16.1` (unchanged), governance `policyVersion 2026-07-16.2` (unchanged) |
| Model access | OpenRouter key in `openr.md` (gitignored): `OPENAI_API_KEY=$(grep -oP '(?<=openrouter_api=)\S+' openr.md)`, `OPENAI_BASE_URL=https://openrouter.ai/api/v1`, `REVORA_MODEL=openai/gpt-5.4-mini`, `REVORA_LIVE_EVAL=1`. Panel: `OPENROUTER_API_KEY=` same key. **Balance: ~$3.48 of $21** (session cost ~$0.21). Direct OpenAI org key capped 50 req/day — reserved for the production-path confirmation run |
| Uncommitted files (deliberately left) | `docs/handoff/2026-07-12-unconditional-go-handoff.md` (modified, pre-existing), `docs/handoff/2026-07-12-counsel-gate-unlock-session-handoff.md` (untracked, pre-existing), `docs/handoff/2026-07-16-rehearsal-fixes-complete-handoff.md` (untracked, prior session's handoff), `docs/qa/18-simulated-240-panel-2026-07-16.md` (**cosmetic-only** — an editor re-aligned one table with tabs, data unchanged; owner's call to commit or discard), plus this handoff file |

---

## What this session completed (handoff step E, all verified)

### E.1(a) — restaurant-scale starch anchor (`ba74d3c`)

All 8 unanimous rejected-band cases in the re-run panel were one shape:
multi-starch plates or oversized single-starch portions held at MODERATE
(KFC plate, Taco Bell order, chicken parm + spaghetti, half frozen pizza,
three frozen burritos, grilled cheese + canned soup, Subway footlong, Panera
bread bowl). Added a starch-count prompt anchor (`PROMPT_VERSION
2026-07-16.2`): **two or more distinct refined-grain/potato starches, or one
at oversized portion → HIGH at A1C 6.3+, at least MODERATE below.**

- **Refined-only on purpose.** The first wording counted legumes and would
  have over-flagged the cultural staples doc 18 protected. Reworded, then
  verified with a 5-case guard set (dal+rotis, gallo pinto, feijoada,
  turkey wrap+chips, burrito bowl) — all held MODERATE, all panel-accepted.
- Patch-pass per the doc-19 pattern: 13 rows re-captured, 39 verdicts
  re-judged (39/39 accepted, 0 judge errors), re-adjudicated in place.
- Recorded in `docs/safety/portion-convention.md` as **rule 3b** with new
  **panel question 4** (ratify the refined-only definition and the 6.3+
  threshold) — the human panel owns final ratification.

### E.2 — retry-card root cause found and killed (`ba74d3c`)

Instrumented reproduction (one-off harness, raw model calls through the
product postprocess) proved every rotating retry card across every live gate
run was the same assertion: **`looksLikeSwap` rejecting legitimate swaps**
phrased outside its keyword list. Two shapes caught in the act:

1. `"pick a sugar-free or zero-sugar version instead"` — bare "instead",
   verb "pick".
2. `"keep to one serving and add plain Greek yogurt"` — the portion-
   reduction shape the prompt itself mandates for label-math quantities.
   The prompt and the contract disagreed; the contract was the wrong side.

Widened the phrase list (substitution / lower-glycemic variant / reduced
portion) in `lib/revora/postprocess.ts` with regression tests containing the
exact caught strings; a non-swap still matches nothing.

### E.3 — component-mention unblock measurement (`0d95fae`)

Ran the unblock measurement (live gate, `REVORA_ENFORCE_COMPONENT_MENTION=1`,
real model): 1 retry card / 33 calls = **3pts delta > the 2pt condition —
flag stays OFF.** Reproduction (6 calls on `mac and cheese`, 4 trips) shows
the cause is **checker literalism, not model genericness**: the model names
components precisely ("keep the macaroni portion smaller") but
`mentionsMealComponent` token-matches the typed string, so "macaroni"/
"pasta" don't count as mentions of "mac". Unblocking requires a
synonym-aware checker (engineering item, see step E′ below).

### Verification (all green on the shipped commits)

- Full mock suite 1268 passed; typecheck clean; eslint clean on changed
  files; `npm run contract` green; mock eval 9/9.
- Final live gate (`T10-02-57-508Z`): passed, 33/33 calls, **0 harmful-SAFE,
  0 usefulness, 0 adversarial failures, 0 retry cards (first zero in the
  series), riskAccuracy 97.0%** ≥ 85%.
- CI green on all 3 commits of PR #15.

### The headline table

| Metric | Doc 19 (start of session) | Now |
|---|---|---|
| Majority-rejected bands | 17/202 (8.4%) | **9/202 (4.5%)** |
| Dangerous false reassurance | 1 (single 1-of-3 minority: red wine) | **1 (unchanged, parked)** |
| Fabricated drivers | 0 | **0** |
| Shaming | 0 | **0** |
| Band agreement | 86.0% | **86.3%** |
| Live gate riskAccuracy | 87.9% | **97.0%** |
| Live gate retry cards | 1–3 per run | **0** |
| Judge errors / incoherent verdicts | 0 / 0 | **0 / 0** |

**The remaining 9 rejected bands are ALL in explicitly parked buckets:**
- 4 hang on the portion-convention RD questions (tiny-bite cheesecake,
  one-serving ice cream, oatmeal-with-water, rice cakes — product HIGH via
  deterministic floors, judges want MODERATE; the floor carve-out is panel
  question 2).
- 3 are safe-direction over-caution (salmon-quinoa, stuffed peppers,
  apple + PB — product MODERATE, judges say SAFE would be fine).
- 2 are judgment calls reserved for the human panel (2-units-of-wine —
  no alcohol vocabulary exists in the app; chicken biryani).

None is a dangerous-direction miss. **Do not "fix" these 9 — every one is
recorded as the human panel's call.**

---

## THE PATH TO TRUE DONE — exact actions, in order

"True done" = the owner's stated target: **a functional app with <1% error
rate and no misleading info**, with W-05/F-06 closed by a real panel and the
production path confirmed. Steps A–D are owner-gated; E′ is the small
remaining engineering backlog; F is the standing verification loop.

### A. Merge the three PRs (owner, ~15 min)

1. Merge **#13** (`feat/simulated-240-panel`).
2. Merge **#14** (`feat/rehearsal-findings-fixes`). Two copy rows need the
   owner's eyes: `clinical-eating-disorder` v2026-07-16.2 (988 urgency
   framing) and `high-range-route` (A1C ≥6.5 diabetes-tone routing).
3. Merge **#15** (`feat/band-calibration-e1-e2`). Review focus: the
   starch-count anchor wording in `lib/revora/prompt.ts` and the widened
   `looksLikeSwap` list in `lib/revora/postprocess.ts`.
4. Merging into main auto-deploys production. Nothing in the stack changes
   billing or client surfaces; it is engine + copy + QA harness.

### B. Production-path confirmation run (first session after merge, ~$0.05, 15 min)

The entire rehearsal ran through OpenRouter; production calls OpenAI
directly (N-19). Confirm the fixed engine on the real path:

```bash
# DIRECT OpenAI key (NOT the OpenRouter one), fits the 50/day org cap:
export OPENAI_API_KEY=<direct-openai-key>   # do NOT set OPENAI_BASE_URL
unset OPENAI_BASE_URL REVORA_MODEL          # blank means unset — never REVORA_MODEL=""
npm run eval:revora:live
```

- Expect: passed, 0 harmful-SAFE, ~33 calls (fits the cap), and now also
  expect **0 retry cards** (the E.2 fix should hold on the production path;
  if retry cards appear here, the phrasing differs by model — reproduce with
  the instrumented harness pattern from this session before touching code).
- Diff the artifact's per-case kinds/risks against
  `graded-eval-live-2026-07-16T10-02-57-508Z.json`; any band that differs
  between paths goes in the panel packet.
- **Standing launch risk to resurface to the owner:** the 50 req/day org cap
  is incompatible with real traffic. The owner must either raise the OpenAI
  tier or make an explicit routing decision before launch.

### C. Close the photo stratum (owner supplies; engineering wires; ~1 session)

Coverage is honestly **200/240** until this happens. Protocol bans synthetic
photos (N-30).

1. Owner drops 40 photos per
   `docs/qa/dietitian-review/photo-intake-checklist.md` (consent, no
   faces/PII, 14 home / 10 cultural / 8 restaurant / 8 ambiguous) into
   `docs/qa/dietitian-review/corpus/photos/` + `photos-manifest.json`.
2. Engineering: extend `scripts/dietitian-panel/capture-live-outputs.mts`
   to run manifest rows through the photo-draft → checkFood path, strip
   EXIF on intake, capture 40 outputs, run the panel on them (~$0.15),
   adjudicate, append a doc-19 addendum. Coverage becomes 240/240.

### D. The human RD/CDCES panel — closes W-05/F-06 (owner recruits; the ONLY thing that ends "SIMULATED")

Everything is prepared; only recruitment is missing.

1. Recruit per `docs/qa/dietitian-review/recruitment-one-pager.md`:
   3 reviewers (≥2 RDN, ≥1 RDN+CDCES), registry-verified, no conflicts,
   paid, blinded.
2. Hand them the packet (all files exist):
   - doc 17, doc 18, doc 19 **including the E.1/E.2/E.3 addendum** +
     adjudication artifacts (2026-07-15 and -16);
   - the ontology change list `CARB_FORWARD_TOKENS v2026-07-16.1` (sign or
     amend — W-05 requires signing this exact version);
   - `docs/safety/portion-convention.md` and its **4 questions** (label
     math; small-portion carve-out for dessert floors; unstated-portion
     default; **NEW: the restaurant-scale starch-count anchor — refined-only
     definition and the HIGH-at-6.3+ threshold**);
   - the ED copy v2026-07-16.2 and high-range routing copy;
   - open judgment calls: `a-bev-red-wine` (alcohol guidance — minority
     flag, no alcohol vocabulary exists in the app at all),
     `a-probe-cauli-crust-pizza` (two simulated panels split),
     `d-khao-pad` (three-way), `d-biryani` and `e-adv-units-wine` (the two
     majority-rejected judgment calls this session left alone), the six
     gate-label votes where the two simulated panels contradict
     (chocolate-cake and flour-tortilla especially), honey/agave/syrup at
     MODERATE-not-HIGH, the 3 over-caution cases (salmon-quinoa, stuffed
     peppers, apple+PB), and whether fixed clinical templates are
     acceptable refusal UX;
   - 240×3 signed DR-02 reviews → `panel-review.json` →
     `npm run review:dietitian:close` (fail-closed validator; requires
     unconditional signed approvals).
3. Apply whatever the panel orders (label changes then need both eval modes
   re-run green), bump versions, record sign-offs in
   `clinical-copy-governance.json` (`approved_external_panel`).

### E′. Remaining engineering backlog (small, non-blocking, ~1 session)

The step-E worklist from the previous handoff is done. What it spawned:

1. **Synonym-aware `mentionsMealComponent`** (unlocks
   `REVORA_ENFORCE_COMPONENT_MENTION`). The measurement is recorded: 3pts
   delta, all of it checker literalism ("macaroni" not counting as "mac").
   A small food-synonym/stem map in the checker + re-measure; flip the flag
   only when a live run measures ≤2pts. Do NOT flip on the current checker.
2. **Generic-majority residual** (18 overall; 10 of the clinical/adversarial
   ones are fixed templates by owner decision). `a-rest-taco-bell-order`
   picked up a 3/3 generic flag on its new HIGH output this session — the
   swap copy is real but generic-ish; revisit alongside item 1 (component
   mention is the same lever).
3. **Optional cost lever:** `REVORA_REASONING_EFFORT=low` still unset;
   activate only after a live eval confirms zero-harmful-SAFE holds.
4. **17e (3-vote judge self-consistency)** stays designed-and-deferred;
   two full panel sessions at 0 errors without it.

### F. Re-run the full loop after C–E′ land (the standing verification recipe)

```bash
# 0. Balance first (trap: OpenRouter pre-reserves against max_tokens)
curl -s https://openrouter.ai/api/v1/credits -H "Authorization: Bearer $KEY"
# 1. Local gates
npm run typecheck && npx eslint . && env -u REVORA_MODEL -u OPENAI_BASE_URL npm test && npm run contract
# 2. Both eval modes (rule 4)
npm run eval:revora            # mock
OPENAI_API_KEY=... OPENAI_BASE_URL=https://openrouter.ai/api/v1 \
  REVORA_MODEL=openai/gpt-5.4-mini npm run eval:revora:live
# 3. Capture → panel → adjudicate (all resumable; use setsid nohup for >10min)
npx tsx scripts/dietitian-panel/capture-live-outputs.mts \
  artifacts/qa/panel-240-live-outputs-<date>.json \
  docs/qa/dietitian-review/corpus/simulated-240-v1.json
OPENROUTER_API_KEY=... bash scripts/dietitian-panel/run-panel-all.sh \
  artifacts/qa/panel-240-live-outputs-<date>.json
npx tsx scripts/dietitian-panel/adjudicate.mts \
  docs/qa/dietitian-review/corpus/simulated-240-v1.json \
  artifacts/qa/panel-240-live-outputs-<date>.json \
  artifacts/qa/panel-240-adjudicated-<date>.json \
  artifacts/qa/panel-240-simulated-<date>-*.json
# 4. Doc addendum with before/after; branch → PR → owner merges
```

**The measurable definition of TRUE DONE:**
- [ ] #13, #14, #15 merged; production deploy healthy.
- [ ] Production-path (direct OpenAI) gate run: passed, 0 harmful-SAFE,
      0 retry cards, band diffs vs OpenRouter documented; org-cap decision
      made by owner.
- [ ] 240/240 corpus coverage (real photos captured and panel-graded).
- [ ] Human RD/CDCES panel signed: 720 reviews, unconditional approvals,
      ontology version signed, portion convention (all 4 questions)
      ratified, `approved_external_panel` recorded,
      `npm run review:dietitian:close` green → **W-05/F-06 CLOSED**.
- [ ] 0 majority dangerous-false-reassurance on the final measured run;
      majority-rejected bands at the human panel's accepted rate (currently
      4.5%, every remaining case individually parked for their ruling — the
      <1% bar is theirs to confirm or re-set — do not game it).
- [ ] 0 fabricated-driver findings; 0 shaming; non-shaming ≥95% per stratum.
- [ ] Both eval modes green on the shipped commit; every copy string
      governed and signed.

---

## Known traps (carry-forward + new ones from this session)

- A green mock run is NEVER live evidence (N-30/F-21).
- Exporting `REVORA_MODEL`/`OPENAI_BASE_URL` in the shell that spawns
  `npm test` makes `openai-client`/`service` unit tests fail. Run the suite
  with a clean env (`env -u REVORA_MODEL -u OPENAI_BASE_URL npm test`).
- `gh pr checks` output goes stale; trust `gh run list --branch <branch>
  --json status,conclusion,headSha` / `gh run view <id> --json jobs`.
- **NEW:** `gh pr edit` fails on this repo with a GraphQL projectCards
  deprecation error. Update PR bodies via REST:
  `gh api -X PATCH repos/tkiros/Revora/pulls/<n> -f body="..."`.
- **NEW:** `artifacts/` is gitignored; the qa evidence files are
  force-added by convention. New artifact files need `git add -f` — a plain
  `git add` silently skips them (check `git status` staged list, the
  warning is easy to miss in combined commands).
- **NEW:** when a retry card appears in a live run, do NOT guess the cause —
  the artifact stores only `kind: "retry"`. Reproduce with the instrumented
  pattern from this session: build the prompt via `buildRevoraPrompt`, call
  the model N times, feed each raw output through `postprocessModelOutput`,
  and print the `RevoraContractError` message + raw fields. (~$0.01 for 6
  calls; found both root causes this session on the first try.)
- **NEW:** any new band-policy anchor added to the prompt must also be
  recorded in `docs/safety/portion-convention.md` (or its own PENDING-RD
  doc) with a panel question — prompt anchors are policy, and policy is
  RD-ratified.
- **NEW (method):** when widening a prompt rule that raises severity, build
  a guard set of previously-ACCEPTED nearby cases (especially cultural
  staples) and verify they don't flip before shipping. The first wording of
  the starch anchor this session would have over-flagged dal+rotis/gallo
  pinto/feijoada; the guard set caught it pre-commit.
- The patch-pass pattern for partial re-runs: mini-corpus →
  `capture-live-outputs.mts <out> <mini-corpus>` → `run-panel.mjs` on the
  mini capture → surgically replace rows/verdicts (stamp
  `recapturedNote`/`rejudgedNote`) → re-adjudicate. Used twice now (doc 19
  and this session); cost this session ~$0.10 total.
- The `unsafeMajority` free-text metric still over-fires (3 vs 1
  band-based). `summary.dangerousFalseReassurance` remains the only
  reliable measure.
- OpenRouter pre-reserves credits against `max_tokens` — check
  `/api/v1/credits` before any batch.
- Long-running Bash in this harness dies at 10 min — `setsid nohup ... &`
  or `run_in_background` and watch the log.
- Risk-raising lists are SUBSTRING matched on purpose; buffer lists are
  boundary matched on purpose; fixes go through the pre-strip exclusions,
  never by tightening the match (read the long comments in
  `input-precheck.ts` first).
- Blank `REVORA_MODEL` means unset; never reintroduce `REVORA_MODEL=""`.
- Timestamps come from the machine clock; never hand-write dates that
  contradict artifact filenames.
- `main` costs real money on deploy; the owner merges, never the agent.

---

## Reading order for the new session

1. This file.
2. `gh pr view 15` (then #14, #13) — merge state decides whether step A is
   done and which branch to base new work on (if all merged: `main`; if
   not: stack on `feat/band-calibration-e1-e2`).
3. `docs/qa/19-rehearsal-fixes-2026-07-16.md` — read the **addendum** at
   the end first; it is this session's record.
4. `artifacts/qa/panel-240-adjudicated-2026-07-16.json` → `summary` — the
   9 remaining rejected-band cases, every one parked for the human panel.
5. `lib/revora/prompt.ts` (the starch-count anchor + version comment) and
   `lib/revora/postprocess.ts` (`looksLikeSwap` comment,
   `mentionsMealComponent` unblock condition) — read the comments whole
   before touching anything.
6. `docs/safety/portion-convention.md` — now 4 panel questions.
7. `scripts/dietitian-panel/` — capture → panel → adjudicate, all resumable.

**W-05 REMAINS OPEN.** Nothing in this session or file is clinical sign-off.
