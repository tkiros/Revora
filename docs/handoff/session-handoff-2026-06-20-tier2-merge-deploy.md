# Session Handoff — MDP/EW Candle-Pipeline **Tier 2**: code COMPLETE → merge + deploy remain

**Date:** 2026-06-20
**Repo:** `/home/tefera/Desktop/bcb`
**Branch:** `wave3-production-hardening` · **HEAD:** `68ac8c7`
**Plan:** `docs/audits/2026-06-19-mdp-ew-candle-pipeline-REMEDIATION-PLAN.md` (§4 = Tier 2)
**Durable ledger (authoritative per-task detail):** `.git/sdd/progress.md`

---

## 0. TL;DR

All **9 Tier-2 tasks (T2-1…T2-9)** are **implemented, tested, code-reviewed, and committed atomically** on `wave3-production-hardening`. The remaining work to reach *true* Tier-2 done is **(1) the clean-PR-branch merge to `main`** (semantic conflicts must be resolved — recipe below) and **(2) the deploy** (build MDP image + bump pin → **you** run the staged prod recreate). Tier 1 (T1-1…T1-5) was completed in a prior session and merges/deploys **together** with Tier 2 (never merged/deployed yet).

> **Do ONLY the merge + deploy. Do NOT start Tier 3.**

---

## 1. What "DONE" looks like for Tier 2 (definition of done)

Tier 2 is **truly done** when all of these hold:

1. ✅ **All 9 task commits exist** with runnable tests green + per-task review. — **DONE** (this session).
2. ⬜ **A clean PR** containing **Tier 1 + Tier 2** (14 commits, *excluding* the pre-existing `72d673a` checkpoint and `9829356` chore) is **opened against `main`, compiles, and is merged** (after your confirmation).
   - The resolved PR branch **compiles**: `cargo check -p market_data_processor --lib` **and** `-p enrichment_worker` both clean.
   - The pre-existing broken test target is handled (see §5) so merge CI doesn't fail to build.
3. ⬜ **MDP image is rebuilt** from the merged code and the **image pin is bumped** in `infra/docker/docker-compose.workers.yml` (current pin `wave2-stopv1-38467ff` predates these fixes), committed.
4. ⬜ **Prod is recreated** via the staged canary→50%→100% scripts — **run by you (the user)**, not autonomously (live-trading system).
5. **Env-gated items are explicitly deferred, never faked** (per CLAUDE.md execution-gate policy): the `wc_015` migration *apply*, DB integration tests, and the live alert-firing drill. These do NOT block merge; they are applied/validated against the live env at/after deploy.

"Done" is **NOT** `/health 18/18`, not "service healthy", not fake green — it is: the 14 commits merged into a compiling `main`, the image rebuilt + pinned, and the staged recreate run by you.

---

## 2. What was completed THIS session (Tier 2 — all 9 tasks)

Each task: **implement → runnable test (green) → inline `/code-review` → fix findings → per-task `cargo check` → atomic commit.** Compile-bound env (MDP `--lib` check ≈ 35s–2m incremental; full ≈ 50m). DB-backed tests are env-gated (host→container sqlx hangs) and were written `#[ignore]`/SQL-fragment style — **not faked**.

| Task | ID | Commit | Summary | Runnable tests (ran green here) |
|---|---|---|---|---|
| **T2-1** | C2/C3/C5 | `707337a` | Finiteness/ordering guard in the **live** delivery funnel (`CandleDeliveryAuthority::commit`): reject non-finite/mis-ordered OHLCV before any write, discard the ledger row (mirrors T1-1), `candle_envelope_rejected_nonfinite_total`. `candle_buffer::write_candle` guards `sol_price_usd`. EW evaluator rejects non-finite `volume_usd` before the floor. | `commit_nonfinite_close` / `commit_misorder_ohlc` / **`commit_zero_market_cap_is_not_rejected`** (MDP 28); `nan_/infinite_volume_usd` (EW 13) |
| **T2-2** | E0 | `b811961` | `EW_DEGRADED_ADMISSION_ENABLED` master kill-switch (default true) AND-gates **both** `InferredNoTrader` (evaluator) and `DegradedPass` (mod.rs). Surfaced in startup log. | `master_kill_switch_gates_inferred_no_trader` (table), `master_kill_switch_blocks_degraded_pass` |
| **T2-3** | E1 | `f771254` | SQL-side exponential debt-retry backoff (`base*2^retry_count` capped) + per-reason **Jupiter** cap (`reason ILIKE '%jupiter%'` → 20 vs non-jupiter 5). New envs `EW_STAGE1_DEBT_RETRY_BACKOFF_BASE_SECS/_MAX_SECS/_JUPITER_MAX_ATTEMPTS`. Runtime debt-cfg hoisted+shared. | `backoff_is_monotone_and_capped`, `jupiter_debt_survives_a_60s_outage`, `record_debt_query_uses_capped_exponential_backoff`, claim/exhausted jupiter-cap fragments |
| **T2-4** | R3/S2 | `7ce3ede` | Reject-cleanup loop: `break` → **always advance the cursor**; bounded per-mint retries (3) via generic `attempt_with_retries`; `mdp_reject_unsubscribe_giveup_total`. One durably-failing unsubscribe no longer wedges all later mints. | `unsubscribe_succeeds_on_first_attempt` / `_recovers_from_transient_failure` / `_gives_up_after_cap_on_durable_failure` |
| **T2-5** | R2/R5 | `c1e6f8b` | **R2**: `token_enriched` XADD `MAXLEN ~ N` (default 1M, env `CONSISTENCY_TOKEN_ENRICHED_STREAM_MAXLEN`). **R5**: hourly-throttled retention sweep on the replay tick — DELETE rows terminal on **both** destinations and older than `MDP_LEDGER_RETENTION_HOURS` (default 72); `make_interval(hours=>$1)`; pending/gate_pending never touched. | `token_enriched_xadd_includes_maxlen_cap` (+default); `ledger_retention_delete_targets_only_aged_terminal_rows` |
| **T2-6** | H4 | `e12f3e0` | **Advisor-gated redesign.** Did **NOT** add `pending_replay` to the `tracking_state` CHECK (would destroy the bonding-curve-vs-migrated subscription encoding + wide blast radius). Instead an **additive nullable column `replay_pending_at_ms`** (migration `db/migrations/wc_015_mdp_tracking_replay_pending.sql`, no CHECK change). Set on PendingReplay entry, cleared on Passed/Rejected; seed rehydrates flagged rows regardless of tracking_state (covers diverged/reaped-to-`stopped`). **Forensic:** live PASS already persists `active_*`+`passed` **before** the gate mutation (`enrichment_consumer.rs:1652 < :1684`), so the common case was already durable; the marker closes the residual. | `stage1_seed_query_rehydrates_durable_replay_pending_marker` |
| **T2-7** | A3 | `e8148ba` | Per-mint stuck-PendingReplay reaper (rides the replay tick, 60s, keyed on the T2-6 marker): detect stuck > `MDP_PENDING_REPLAY_REAP_SECS` (600) → `mdp_mint_stuck_pending_replay_total` + warn → forced drain-promotion (T1-1/T1-2 path) → terminalize backlog if stuck > 2× threshold. Closes the single-mint dark-mint stall the global watchdog can't see. | `find_stuck_pending_replay_query_targets_aged_marker_rows` |
| **T2-8** | P3 | `7161dca` | `candle_pipeline_hardening_alerts` group in `infra/monitoring/prometheus/alerts.yml`: `MintStuckPendingReplay`(crit), `GatePendingResidual`, `ObservationSummaryPublishFailing`, `CandleEnvelopeRejectedNonFinite`, + poison/reject-giveup/candle-gap. `CandleReplayBacklogGrowing` is covered by residual+stuck+poison (no depth gauge yet — honest note in the file). | YAML validated (2 groups, 16 rules) |
| **T2-9** | H5/H6 | `68ac8c7` | **H5 forensic:** the scan already `ORDER BY mint, boundary_ts` **globally before LIMIT** + single-task scanner ⇒ per-mint order already preserved across ticks (plan premise outdated) — locked with a regression test, no behavior change. **H6:** opt-in per-mint pending-backlog cap (`MDP_MAX_PENDING_REPLAY_WINDOWS_PER_MINT`, **default 0 = unbounded**, preserves prod). Evicts oldest **fully-pending** rows only. `mdp_pending_replay_windows_evicted_total`. | `replay_scan_orders_per_mint_by_boundary_ts`, `pending_replay_cap_retains_recent_and_evicts_only_fully_pending` |

**Review caught real bugs (the gate earned its keep):**
- **T2-1:** the prior checkpoint `fd56d47` had committed the EW C5 guard **removed** ("guard REMOVED temporarily for red-test capture") — the report falsely claimed green. Re-added. Also `market_cap > 0` would discard legit zero-supply/zero-mcap candles (plan says `>= 0`) — fixed.
- The whole T2-1 report was treated as untrustworthy after that; every "green" was re-verified by running tests, not trusting pasted output.

**New counters shipped this tier (all defined AND registered — grep-verified):**
`candle_envelope_rejected_nonfinite_total` (T2-1), `mdp_reject_unsubscribe_giveup_total` (T2-4), `mdp_mint_stuck_pending_replay_total` (T2-7), `mdp_pending_replay_windows_evicted_total` (T2-9). Plus Tier-1: `mdp_candle_replay_poison_discarded_total`, `mdp_candle_gate_pending_reactivated_total`, `mdp_observation_summary_publish_failed_total`, `mdp_self_test_nonblocking_failed_total`.

---

## 3. Git state (start of next session)

```
68ac8c7  fix(mdp): T2-9 (H5/H6)                         <-- HEAD (wave3-production-hardening)
7161dca  feat(infra): T2-8 (P3) alert rules
e8148ba  fix(mdp): T2-7 (A3) reaper
e12f3e0  fix(mdp): T2-6 (H4) durable PendingReplay marker
c1e6f8b  fix(mdp/consistency): T2-5 (R2/R5)
7ce3ede  fix(mdp): T2-4 (R3/S2)
f771254  fix(ew): T2-3 (E1)
b811961  fix(ew): T2-2 (E0)
b5e5898  docs(handoff): re-add Tier-2 handoff            (SKIP from PR — session artifact)
707337a  fix(mdp/ew): T2-1 (C2/C3/C5)
c47ce26  fix(deploy): DEP1 (T1-5)
b3ce67a  fix(mdp): P1 (T1-4)
e75952c  fix(mdp): O1 (T1-3)
09eda78  fix(mdp): H2 (T1-2)
466fac7  fix(mdp): H1 (T1-1)
72d673a  wip: checkpoint                                 (SKIP from PR — pre-existing)
9829356  chore(sgw): delete cruft                        (SKIP from PR — pre-existing)
```

- **`wave3-production-hardening` is 55 behind / 17 ahead of `origin/main` (`3944366`).** Merge-base = `77045ed`.
- **First action next session:** `git fetch --all --prune` and re-check (origin/main may have advanced past `3944366`).
- Working tree carries **pre-existing cruft** (deletions of `*.ps1`/docs under `services/market_data_processor/`, `*.bak` files, modified `.planning/STATE.md` + audit doc). **NOT ours — never `git add` them into commits; `git stash -u` them before switching branches.**

---

## 4. NEXT — the MERGE (the real remaining work; **empirically measured this session**)

**Method (user already chose "clean PR branch"):** branch off `origin/main`, cherry-pick the 14 task commits, resolve conflicts, compile-verify, open PR, confirm, merge.

### 4.1 Exact commands

```bash
cd /home/tefera/Desktop/bcb
git fetch --all --prune
git stash push -u -m "session-artifacts"            # clean the tree so checkout works (cruft + .planning)
git checkout -b candle-pipeline-tier1-2 origin/main
git cherry-pick 466fac7 09eda78 e75952c b3ce67a c47ce26 \
                707337a b811961 f771254 7ce3ede c1e6f8b \
                e12f3e0 e8148ba 7161dca 68ac8c7
# ^ resolves cleanly through T1-4; then stops at conflicts — resolve per §4.2, `git add`, `git cherry-pick --continue`
```

### 4.2 Conflict map (measured — this is the value of this handoff)

- **T1-1…T1-4 (`466fac7`…`b3ce67a`): cherry-pick CLEAN onto `origin/main`.** No conflicts.
- **T1-5 (`c47ce26`): trivial.** One additive conflict in `infra/docker/docker-compose.workers.yml` — `origin/main` lacked the DEP1 comment block at the top of `discovery-worker`. **Resolution = keep the DEP1 comment**; the `env_file:` addition and the secret-`${VAR}` removal apply cleanly to the rest. **Verify the DEP1 invariant after:** no `REDIS_URL:`/`REDIS_FAILOVER_URL:`/`REDIS_PASSWORD:`/`PUMPPORTAL_API_KEY:` `${VAR}` expansions remain in the `discovery-worker` `environment:` block.
- **T2-1 onward (`707337a`+): SEMANTIC conflicts — the real blocker.** `origin/main` **independently added** a `jupiter_stats5m_window_alignment_enabled` field to `Stage1Config` and new `EW-04/SYS-013` temporal-alignment tests in `evaluator.rs`. This overlaps T2-1/T2-2/T2-3 (which touch `config.rs`, `evaluator.rs`, `mod.rs`, `runtime.rs`) and `metrics.rs` is multi-touched (T2-1/T2-4/T2-7/T2-9 each add counters vs `origin/main`'s ~+94).

  **Resolution recipe:**
  1. **Tests:** keep BOTH sets (origin/main's temporal-alignment tests **and** my NaN/Inf/master-switch tests — they're independent).
  2. **`Stage1Config`:** the merged struct must carry **both** `jupiter_stats5m_window_alignment_enabled` (origin/main) **and** `degraded_admission_enabled` (T2-2). Then **every constructor** must set both fields:
     - `config.rs::from_env` (real), `evaluator.rs::stage1_config` (test helper), `mod.rs::test_config` + `mod.rs::degraded_pass_config` (test helpers). (`runtime.rs` `BridgeClientConfig` is a *different* struct — only carries `inferred_mode_enabled`.)
  3. **`metrics.rs`:** union both sides — keep origin/main's additions **and** my counter `lazy_static!` defs + their `register_metrics()` lines (`candle_envelope_rejected_nonfinite_total`, `mdp_reject_unsubscribe_giveup_total`, `mdp_mint_stuck_pending_replay_total`, `mdp_pending_replay_windows_evicted_total`).
  4. **`stage1_lifecycle.rs` / `postgres.rs` / `replay.rs` / `authority.rs`:** mostly additive (new SQL consts, new fns, new sweeps) — union; watch for origin/main edits to the *same* SQL strings (esp. the debt SQL T2-3 rewrote and the scan/eviction SQL).

### 4.3 Compile-verify the resolved branch (mandatory before PR)

```bash
cargo check -p market_data_processor --lib      # ~4–11m cold; catches any Stage1Config ctor missing a field
cargo check -p enrichment_worker                # ~2–3m
```
A missing config field in any constructor **will** surface here — fix and re-check until both are clean.

### 4.4 Open the PR

```bash
git push -u origin candle-pipeline-tier1-2
gh pr create --base main --head candle-pipeline-tier1-2 \
  --title "MDP/EW candle-pipeline remediation — Tier 1 + Tier 2 (15 fixes)" \
  --body "..."   # summarize T1-1..T2-9; note env-gated items deferred (wc_015 apply, DB tests, alert drill)
```
**Confirm with the user, then merge.**

### 4.5 Merge-CI blocker (pre-existing, NOT ours — decide before merge)

`services/market_data_processor/tests/mdp_wave1_authority_contract.rs` **fails to BUILD** (missing `data_quality` field on `Candle`, from commit `431fbac`). `cargo test` over **all** targets fails → merge CI fails on this target. **Either** fix it as incidental (add the field to the test's `Candle` construction) **or** flag it explicitly. `--lib`/`--bins` tests are unaffected.

---

## 5. THEN — the DEPLOY (you run the live recreate)

The MDP fixes only reach prod via a **freshly built image** (~50 min). After merge:

1. Build the image: `services/market_data_processor/Dockerfile` → tag (e.g. `bct-market-data-processor:tier1-2-<shortsha>`).
2. **Bump the pin** in `infra/docker/docker-compose.workers.yml` `market-data-processor.image` (current `wave2-stopv1-38467ff` predates the fixes), commit the pin bump.
3. **Apply the DB migration** `db/migrations/wc_015_mdp_tracking_replay_pending.sql` against the live `trading` DB (additive nullable column — safe; idempotent `ADD COLUMN IF NOT EXISTS`). No `cargo sqlx prepare` needed (MDP/EW use runtime `sqlx::query`/`tokio_postgres`, **not** `query!` macros).
4. **Hand the staged prod recreate to the user** — canary → 50% → 100% via the scripts in `scripts/`. **Do NOT run the live-trading recreate autonomously.**

**Apply on recreate/reload without an MDP rebuild:** T1-5 (`env_file`), T2-5-R2 (`consistency_checker` image), T2-8 (Prometheus alert rules reload).

**Then STOP. Do not start Tier 3.**

---

## 6. Deferred / env-gated (marked, never faked — per CLAUDE.md)

- `wc_015` migration **apply** → needs live `trading` DB (do at deploy §5.3).
- All DB-backed integration tests (`#[ignore]`/SQL-fragment style) → need live DB reachable from host.
- **T2-8 live alert-firing drill** in staging (force each condition once, confirm in Alertmanager) → needs running env; the rules themselves are written/validated.
- Actual prod-push deploy verification → user runs the staged recreate.

---

## 7. Key artifacts

- **Authoritative progress:** `.git/sdd/progress.md` (per-task notes, the full MERGE STATUS block with the same conflict recipe, boundary decisions).
- **Plan:** `docs/audits/2026-06-19-mdp-ew-candle-pipeline-REMEDIATION-PLAN.md` (§4 Tier 2; §6 sequencing/gates).
- **Audit:** `docs/audits/2026-06-19-mdp-ew-candle-pipeline-production-audit.md`.
- **Prior Tier-1 handoff:** `docs/superpowers/session-handoff-2026-06-20-tier2-candle-pipeline.md`.
- **Migration added:** `db/migrations/wc_015_mdp_tracking_replay_pending.sql`.

---

## 8. Discipline reminders

- `git fetch --all --prune` at session start; rebasing optional (the agreed plan is the clean-PR-branch at the end).
- Resolve conflicts **carefully** — `origin/main` may have changed semantics on the 6 touched files; the config-field merge is the one that bites.
- `git worktree prune` if you touch worktrees; never `rm -rf` a worktree.
- Don't sweep pre-existing cruft (`*.ps1` deletions, `*.bak`, `.planning/STATE.md`) into commits — `git add` named files only.
