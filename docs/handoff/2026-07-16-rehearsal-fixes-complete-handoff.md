# Session handoff — rehearsal fixes DONE; the path from here to a flawless, functional app

**Written:** 2026-07-16, at the end of the session that implemented every
engineering item from the doc-18 handoff, re-ran the full 206-case simulated
panel against the fixed engine, wrote doc 19, and opened PR #14 (all CI
green, unmerged, stacked on PR #13).

**Use this file as the opening prompt of the next session.** It contains the
complete state, the exact remaining actions, and the measurable definition of
"true done."

---

## The rules that outrank everything (unchanged, re-verified this session)

1. **DR-01:** no simulated or internal review closes W-05/F-06. Everything
   produced this session is stamped `SIMULATED — NON-CREDENTIALED`. W-05
   stays open until a real credentialed panel signs.
2. **Judge model (owner, 2026-07-16):** never opus/large-class. The pinned
   judge is `google/gemini-3.1-flash-lite` (default in `run-panel.mjs`,
   now schema-enforced; ran 684 verdicts this session with 0 errors).
   `PANEL_JUDGE_MODEL` overrides only with owner approval.
3. **Ontology vocabulary is RD-owned (W-05).** `CARB_FORWARD_POLICY_VERSION`
   is now `2026-07-16.1`, marked PENDING RD. Every list change bumps the
   version and goes in the panel packet.
4. **Gate-corpus changes** (`tests/fixtures/revora-eval-cases.json`, now 99
   cases) require BOTH eval modes green before commit (done twice this
   session). Review-corpus label changes need ≥2/3-identical-no-dissent.
5. **`main` auto-deploys production — no direct pushes.** Branch → PR → CI
   green → owner merges.
6. Clinical copy changes go through `clinical-copy-governance.json` bumps
   with evidence-pack updates (two done this session: ED urgency, high-range
   routing).

---

## Ground truth — where things are

| Fact | Value |
|---|---|
| Open PRs | **#13** `feat/simulated-240-panel` (doc 18 + first rehearsal) and **#14** `feat/rehearsal-findings-fixes` (this session's fixes, STACKED on #13). Both all-CI-green, both unmerged. **Merge order: #13, then #14.** |
| This session's branch | `feat/rehearsal-findings-fixes` — 5 commits: `368f0a5` (engine fixes), `45cedeb` (governed copy), `29df228` (judge hardening + prep docs), `4fa89c1` (re-run findings fixes), `8ee62b3` (doc 19 + artifacts) |
| Findings doc | `docs/qa/19-rehearsal-fixes-2026-07-16.md` — full before/after per work item, decisions recorded, W-05 open |
| Re-run adjudication | `artifacts/qa/panel-240-adjudicated-2026-07-16.json` (202 case records, every raw verdict) |
| Re-run capture | `artifacts/qa/panel-240-live-outputs-2026-07-16.json` — 206/206, **0 retry-cards**; 26 rows stamped `recapturedNote` (patch pass after in-session fixes) |
| Panel verdicts | `artifacts/qa/panel-240-simulated-2026-07-16-<stratum>.json` × 6 — 606+78 verdicts, 0 errors, `schemaEnforced: true` |
| Live gate evidence | `artifacts/qa/graded-eval-live-2026-07-16T07-51-00-276Z.json` and `...T08-16-14-069Z.json` (final code) — both passed |
| Prompt / ontology versions | `PROMPT_VERSION 2026-07-16.1`, `CARB_FORWARD_POLICY_VERSION 2026-07-16.1`, governance `policyVersion 2026-07-16.2` |
| Model access | OpenRouter key in `openr.md` (gitignored): `OPENAI_API_KEY=$(grep -oP '(?<=openrouter_api=)\S+' openr.md)`, `OPENAI_BASE_URL=https://openrouter.ai/api/v1`, `REVORA_MODEL=openai/gpt-5.4-mini`, `REVORA_LIVE_EVAL=1`. Panel: `OPENROUTER_API_KEY=` same key. **Balance: ~$3.69 of $21.** Direct OpenAI org key capped 50 req/day — reserved for the production-path confirmation run |
| Uncommitted files | `docs/handoff/2026-07-12-unconditional-go-handoff.md` (modified) and `docs/handoff/2026-07-12-counsel-gate-unlock-session-handoff.md` (untracked) predate this session and were deliberately left alone; plus this handoff file |

---

## What this session completed (all 17 doc-18 work items)

### Engineering (implemented + verified, in PR #14)

1. **Cultural-staple ontology stage** — poke, injera, ugali, biryani, pho,
   bibimbap, arroz, nasi, khao, pancit, dosa, pierogi, tamale, pupusa,
   mochi, plov, gnocchi, tabbouleh, plantain, quinoa, samosa, pad thai,
   banh mi, gallo pinto, raisin bran + more. Every `carbForward:false`
   probe from doc 18 now has a token or a recorded reason.
2. **Full-range SAFE→MODERATE carb-forward floor** (was 6.3–6.4 only) with
   its own honest draft copy (no more "leans heavily on refined carbs" on
   buffered dishes).
3. **Mechanical plurals** for every boundary-matched term (the `rotis`
   class is closed structurally); brand/synonym/beverage risk patterns
   (oreo, sprite, cola, fanta, boba, bubble tea, horchata, sweet tea,
   gatorade, powerade, honey, agave, syrup, cinnamon roll, penne, macaroni,
   mac and cheese, fettuccine, linguine, rigatoni, raisins, dried fruit).
4. **False floor-positives closed** — exclusions (shirataki rice, zoodles,
   almond-flour pancakes, keto bread, low-carb tortilla, egg wraps,
   bunless-burger idioms), negation pre-pass (`no X`/`without X`/`X-free`).
5. **`RISK_PATTERN_EXCLUSIONS` pre-strip** — pancakes/rice cakes/crab cakes
   stop flooring HIGH via the `cake` substring; chocolate/fantastic/honeydew
   guard the new cola/fanta/honey patterns; sugar-negation strip makes
   diet/zero drinks gradeable.
6. **Grounded reasons** — composition-first schema fields (`components` +
   `glycemic_driver`, generated BEFORE `risk`), worked examples, band and
   portion anchors in the prompt; code-side replacement of ungrounded sugar
   claims; **sugar-aware HIGH floor copy**; floors never lower model
   severity anymore.
7. **Underspecified inputs clarify deterministically** (leftovers, takeout,
   dinner, a snack, fruit, toast, soup, granola, crackers, a shake, a bar,
   protein and vegetables, mcdonald's, chinese food, my usual…).
8. **`diet coke` gradeable** (prompt scope rule + negation strip; gate case).
9. **A1C ≥6.5 routes with diagnosed-diabetes tone** (governed copy, in
   `scopeRoutes` because the clinical `routes` array is validator-pinned).
10. **Label numbers must be USED** (prompt); clinical templates deliberately
    stay fixed — recorded as a decision, not silently changed.
11. **ED template reframed** — "call or text 988 now — live support, any
    hour, and eating struggles count" + talk-to-a-professional-soon;
    `SAMHSA-988-LIFELINE` evidence row; flagged for human panel.
12. **Portion convention** — `docs/safety/portion-convention.md` (DRAFT,
    PENDING RD, with 3 questions the panel must answer); prompt anchors;
    4 gate cases; severity-preserving carbs-only floor.
13–14. **Photo intake checklist** and **panel recruitment one-pager** ready
    (`docs/qa/dietitian-review/photo-intake-checklist.md`,
    `recruitment-one-pager.md`).
16–17. **Judge hardening (17a–d)**: strict DR-02 JSON schema (with graceful
    fallback + `schemaEnforced` stamp), few-shot verdict anchors, shared
    rubric anchors, code coherence gate (1 corrective retry +
    `coherenceFlag`). 17e (3-vote self-consistency) deliberately deferred —
    a–d alone got 0 errors/0 flags. 17j: the Responses call sets no
    temperature (GPT-5.x reasoning models take none) — confirmed
    behavior-neutral.

### Verification (all green)

- Full mock suite: 1257+ tests, 118 files. Lint 0 errors. Typecheck clean.
  `npm run contract` passes. Governance validator passes (8 routes + new
  `scopeRoutes`).
- Live graded gate (OpenRouter): passed TWICE (before and after the
  in-session fixes) — 33/33 calls, **0 harmful-SAFE**, 0 usefulness, 0
  adversarial failures, riskAccuracy 87.9% ≥ 85%.
- Full re-run panel (206 re-captured, 684 verdicts, in-code adjudication):

| Metric | Doc 18 | This run |
|---|---|---|
| Dangerous false reassurance | 7 (5 unanimous) | **1** (single 1-of-3 minority vote: red wine) |
| Majority-rejected bands | 26/202 (12.9%) | **17/202 (8.4%)** |
| Fabricated drivers (50 probes) | ~8 | **0** |
| Generic majority | 39 | **18** |
| UNRESOLVED | 8 | **1** (`d-khao-pad`) |
| Shaming | 0 | **0** |
| Band agreement | 75.9% (label stratum 60%) | **86.0%** (label stratum 84.4%) |
| Judge errors / incoherent verdicts | many | **0 / 0** |

### Two NEW findings surfaced and fixed in-session (commit `4fa89c1`)

1. Carbs-only HIGH template fabricated "mostly sugary" on non-sugar foods
   (injera + doro wat; food-pantry box) → HIGH floor is now sugar-aware.
2. Cauliflower-crust pizza: the two simulated panels contradict each other →
   cautious side shipped (pizza token survives, floor reachable); human
   panel owns the final call.

---

## THE PATH TO TRUE DONE — exact actions, in order

"True done" = the owner's stated target: **a functional app with <1% error
rate and no misleading info**, with W-05/F-06 closed by a real panel and the
production path confirmed. Six gates remain. Items A–B are owner-minutes;
C–F are the real work.

### A. Merge the two PRs (owner, ~10 min)

1. Merge **#13** (`feat/simulated-240-panel`) — doc 18 + first rehearsal.
2. Review then merge **#14** (`feat/rehearsal-findings-fixes`). Two copy
   rows need the owner's eyes specifically (both governance-bumped, both
   PENDING external panel):
   - `clinical-eating-disorder` v2026-07-16.2 (988 urgency framing),
   - `high-range-route` (A1C ≥6.5 diabetes-tone routing).
3. Merging #14 into main auto-deploys production. Nothing in it changes
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

- Expect: passed, 0 harmful-SAFE, ~33 calls (fits the cap).
- Diff the artifact's per-case kinds/risks against
  `graded-eval-live-2026-07-16T08-16-14-069Z.json`; any band that differs
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
   EXIF on intake, capture 40 outputs, run the panel on them
   (~$0.15), adjudicate, append a doc-19 addendum. Coverage becomes 240/240.

### D. The human RD/CDCES panel — closes W-05/F-06 (owner recruits; the ONLY thing that ends "SIMULATED")

Everything is prepared; only recruitment is missing.

1. Recruit per `docs/qa/dietitian-review/recruitment-one-pager.md`:
   3 reviewers (≥2 RDN, ≥1 RDN+CDCES), registry-verified, no conflicts,
   paid, blinded.
2. Hand them the packet (all files exist):
   - doc 17, doc 18, doc 19 + adjudication artifacts (2026-07-15 and -16);
   - the ontology change list `CARB_FORWARD_TOKENS v2026-07-16.1` (sign or
     amend — W-05 requires signing this exact version);
   - `docs/safety/portion-convention.md` and its 3 questions (label math;
     small-portion carve-out for dessert floors — tiny-bite cheesecake and
     one-serving ice cream hang on it; unstated-portion default);
   - the ED copy v2026-07-16.2 and high-range routing copy;
   - open judgment calls: `a-bev-red-wine` (alcohol guidance — minority
     flag, no alcohol vocabulary exists in the app at all),
     `a-probe-cauli-crust-pizza` (two simulated panels split),
     `d-khao-pad` (three-way), the six gate-label votes where the two
     simulated panels contradict (chocolate-cake and flour-tortilla
     especially), honey/agave/syrup at MODERATE-not-HIGH, and whether
     fixed clinical templates are acceptable refusal UX;
   - 240×3 signed DR-02 reviews → `panel-review.json` →
     `npm run review:dietitian:close` (fail-closed validator; requires
     unconditional signed approvals).
3. Apply whatever the panel orders (label changes then need both eval modes
   re-run green), bump versions, record sign-offs in
   `clinical-copy-governance.json` (`approved_external_panel`).

### E. Drive the residual error rate toward <1% (engineering, 1–2 sessions, ~$1.50)

The honest number is 8.4% majority-rejected bands (was 12.9%). The residual
is band calibration, not safety: none of the 17 is a majority-supported
SAFE-side error. Exact worklist:

1. `jq '.caseRecords[] | select(.productBandAccepted.value == false)'
   artifacts/qa/panel-240-adjudicated-2026-07-16.json` — 17 cases, mostly
   ordinary meals where the judge wants HIGH where the product says
   MODERATE (heavy restaurant plates). Options, in priority order:
   (a) add portion-anchored exemplars for restaurant-scale meals to the
   prompt; (b) propose band anchors for "restaurant default portion" in the
   portion convention (RD question); (c) accept as calibration variance and
   let the human panel rule. Do NOT loosen the rubric to make the number
   move.
2. The 2 fail-closed retry cards from the live gate run
   (`adversarial-coax-energy-drink`, `label-math-two-servings-granola`):
   reproduce each with a one-off `checkFood` call and find which contract
   assertion the raw model output tripped (likely `looksLikeSwap` or
   one-sentence). If it recurs, add a worked exemplar to the prompt; a
   retry card is safe but is still a failed answer.
3. Generic-majority is 18 (was 39); 10 of the 16 clinical/adversarial ones
   are the fixed templates (owner decision recorded). The residual ~8 are
   real: check them against the W-17 component-mention rule and consider
   measuring the retry-rate delta so `REVORA_ENFORCE_COMPONENT_MENTION=1`
   can finally be flipped (unblock condition in `postprocess.ts`: any live
   run measuring the delta ≤2pts).
4. Optional cost lever: `REVORA_REASONING_EFFORT=low` is still unset;
   activate only after a live eval confirms zero-harmful-SAFE holds.
5. If judge quality ever wobbles on a future run, 17e (3-vote flash-lite
   self-consistency, ~$0.003/verdict) is designed and deferred, not
   rejected.

### F. Re-run the full loop after C–E land (the standing verification recipe)

```bash
# 0. Balance first (trap: OpenRouter pre-reserves against max_tokens)
curl -s https://openrouter.ai/api/v1/credits -H "Authorization: Bearer $KEY"
# 1. Local gates
npm run typecheck && npx eslint . && npm test && npm run contract
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
- [ ] #13 and #14 merged; production deploy healthy.
- [ ] Production-path (direct OpenAI) gate run: passed, 0 harmful-SAFE,
      band diffs vs OpenRouter documented; org-cap decision made by owner.
- [ ] 240/240 corpus coverage (real photos captured and panel-graded).
- [ ] Human RD/CDCES panel signed: 720 reviews, unconditional approvals,
      ontology version signed, `approved_external_panel` recorded,
      `npm run review:dietitian:close` green → **W-05/F-06 CLOSED**.
- [ ] 0 majority dangerous-false-reassurance on the final measured run;
      majority-rejected bands at the human panel's accepted rate (the <1%
      bar is theirs to confirm or re-set — do not game it).
- [ ] 0 fabricated-driver findings; 0 shaming; non-shaming ≥95% per stratum.
- [ ] Both eval modes green on the shipped commit; every copy string
      governed and signed.

---

## Known traps (carry-forward + new ones from this session)

- A green mock run is NEVER live evidence (N-30/F-21).
- **NEW:** exporting `REVORA_MODEL`/`OPENAI_BASE_URL` in the shell that
  spawns `npm test` makes `openai-client`/`service` unit tests fail (they
  pin the default model id). Run the suite with a clean env
  (`env -u REVORA_MODEL -u OPENAI_BASE_URL npm test`).
- **NEW:** `gh pr checks` output goes stale; trust
  `gh run view <id> --json jobs`. This session's playwright showed
  "pending" ~50 min after it had actually passed in 7m19s. Don't panic-
  cancel without checking the run JSON first.
- **NEW:** the patch-pass pattern for partial re-runs is established and
  cheap: mini-corpus → `capture-live-outputs.mts <out> <mini-corpus>` →
  `run-panel.mjs` on the mini capture → surgically replace rows/verdicts
  (stamp `recapturedNote`/`rejudgedNote`) → re-adjudicate. See doc 19.
- **NEW:** the `unsafeMajority` free-text metric still over-fires (11 vs 1
  band-based). The band-based enumeration in
  `summary.dangerousFalseReassurance` remains the only reliable measure.
- OpenRouter pre-reserves credits against `max_tokens` — check
  `/api/v1/credits` before any batch.
- Long-running Bash in this harness dies at 10 min — `setsid nohup ... &`
  and watch the log.
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
2. `docs/qa/19-rehearsal-fixes-2026-07-16.md` — every fix, decision, and
   before/after this handoff summarizes.
3. `gh pr view 14` (and #13) — merge state decides whether step A is done.
4. `artifacts/qa/panel-240-adjudicated-2026-07-16.json` → `summary` — the
   17 rejected-band cases for step E.
5. `lib/revora/input-precheck.ts` + `lib/revora/postprocess.ts` — read the
   comments whole before touching any list or floor.
6. `docs/safety/portion-convention.md` + `docs/qa/dietitian-review/README.md`
   — what the human panel ratifies and the fail-closed close command.
7. `scripts/dietitian-panel/` — capture → panel → adjudicate, all resumable.

**W-05 REMAINS OPEN.** Nothing in this session or file is clinical sign-off.
