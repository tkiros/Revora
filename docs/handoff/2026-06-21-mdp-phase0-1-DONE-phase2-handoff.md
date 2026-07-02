# Session Handoff — MDP Phase 0 + Phase 1 DONE → Phase 2 ready

**Date:** 2026-06-21
**Service:** `services/market_data_processor` (MDP)
**Worktree:** `/home/tefera/.config/superpowers/worktrees/bcb/mdp-finish-phase01-20260620`
**Branch:** `mdp-finish-phase01-20260620` (forked from `main` @ `2a73d27`)
**HEAD:** `2853f83` — **clean tree, everything committed, NOTHING pushed/merged** (26 commits ahead of `origin/main`)
**Governing plan:** `/home/tefera/Desktop/bcb/docs/audits/2026-06-20-mdp-modularization-FINISH-PLAN.md` (read §2, §4, §7, §9 before any deletion)

> ### FIRST ACTIONS in the new session
> ```bash
> cd /home/tefera/.config/superpowers/worktrees/bcb/mdp-finish-phase01-20260620
> git fetch --all --prune
> git log --oneline -1            # must show 2853f83
> git status --short             # must be clean
> ```
> Do **NOT** start from the main checkout at `/home/tefera/Desktop/bcb` — the work lives on the branch in the worktree above. The FINISH-PLAN doc lives in the main checkout's `docs/audits/` (untracked) — read it from there.

---

## 0. TL;DR — one-line status

**Phase 0 (A1–A9 + Rule-8 gate): functionally complete & committed; one user-gated decision (A5/1.1 metric wiring) + deploy/merge remain. Phase 1 (B1 dead-code strip): COMPLETE and fully verified (319→0 `dead_code` warnings, `-D dead_code` build clean, all contract locks green). Phase 2 (M2 delete the dead set) is UNBLOCKED and safe to execute now. Phases 3–5 need product/design sign-off (do NOT start without it).**

---

## 1. What "Phase 0 / Phase 1 / Phase 2 …" mean (FINISH-PLAN §9)

| Phase | Name | What it is | Sign-off needed? |
|---|---|---|---|
| **0** | Durability & correctness (Tier A) | A1–A9 fixes + Boundary-Rule-8 gate. **No deletions.** | No (done) |
| **1** | M1 dead-code strip (B1) | Remove blanket `#[allow(dead_code)]`; allow-or-delete each item under `-D dead_code`. | No (done) |
| **2** | M2 delete the §4 dead set (B2) | Delete the proven-dead items atomically with their test-allowlist updates. | **No — safe now** |
| **3** | Fake/inert-boundary decisions (B4/B5/B6) | `src/lifecycle/`, ProviderRouter replay leg, `replication_debt` — wire-or-delete *decisions*. | **Yes — product/design** |
| **4** | M3 30s consolidation (B3) + DomainSpawner cancellation (B7) | Remove `candle_aggregator_30s`; add cancellation arm. | Light (design) |
| **5** | God-file decomposition (Tier C, optional/last) | Pure extraction splits of metrics/postgres/redis/enrichment behind contract tests. | Light (design) |

> **FINISH-PLAN §9 verdict:** "Phases 0–2 are independent and safe to land now. 3–5 need product/design sign-off and are sequenced to avoid concurrent edits to the same files."

---

## 2. PHASE 1 — COMPLETE ✅ (this session)

**319 → 0 `dead_code` warnings.** Verified by the strict exit gate. 6 commits this session (`115376c`..`3815252`), preceded by the prior session's `(1/N)`–`(10/N)`.

### Verification (all green — re-run to confirm)
```bash
cd /home/tefera/.config/superpowers/worktrees/bcb/mdp-finish-phase01-20260620
# (1) strict build — MUST succeed:
RUSTFLAGS="-D dead_code" SQLX_OFFLINE=true cargo build -p market_data_processor     # exit 0
# (2) test-target gate — MUST emit 0:
SQLX_OFFLINE=true cargo test -p market_data_processor --no-run | rg -ci 'never used|never read|never constructed'   # 0
# (3) all contract locks green:
SQLX_OFFLINE=true cargo test -p market_data_processor \
  --test mdp_wave2_structural_contract --test mdp_wave2_provider_subscription_true_done \
  --test mdp_wave6_health_redis_control_plane --test mdp_wave7_final_true_done \
  --test legacy_keys_removed --test runtime_surface_gate \
  --test mdp_true_done_legacy_quarantine --test mdp_a2_freshness_single_source \
  --test mdp_a4_shared_observation_cache --test mdp_wave5_runtime_supervision_shutdown
```
Last run: strict build `Finished` (exit 0); `--no-run` = 0 dead-code warnings; locks = **125 tests, 0 failed**; **0 non-documented allows**; 3 `MDP-08` inline allows preserved.

### How Phase 1 was done (method — important for Phase 2)
- **Authoritative item list = full human-format build** (`cargo test --no-run` without `--message-format=short`). The short format *under-counts* bundled warnings — e.g. one `connection_pool` warning line was actually **8** dead methods; `RedisClient` had **41**. Always use the full format to expand `"multiple associated items"` bundles.
- **9 genuine deletes** (all proven `ref==1`, plain, no cascade — all in `helius/`): `write_candle_direct`, `get_capacity_pct`, `resolve_batch`, `get_health_status`, `get_subscription_handle`.
- **Everything else = targeted `#[allow(dead_code)] // <reason>`.** Delete-vs-allow per the official rule: delete only `ref==1` plain items with no channel/dispatch/`match`/boot-path/lock-pin role; otherwise allow.
- **Each allow comment encodes its Phase-2 disposition** — this is the key handoff signal:
  - `// dead … — Phase 2` / `// legacy …` / `// dead <subsystem> — Phase 2` → **Phase 2 deletion candidate** (~205 allows).
  - `// test_support …` → **KEEP** (lib code the binary flags dead but the test suite needs; ~232 allows).
  - `// dead field — Phase 2 trim` → field-level trim candidate.
- **Corrections to the prior handoff discovered this session** (carry forward):
  - `PoolResolver` is **live** (constructed in `connection_manager.rs:208` + `helius_orchestrator.rs:427`) — NOT whole-module dead.
  - `shutdown_window_inventory` is **lock-pinned** by `mdp_wave5_runtime_supervision_shutdown.rs:448` (`src.contains(...)`) — never delete, keep the name.
  - `RedisClient` impl = 69 methods, ~41 dead but **28 live** → mixed impl → **per-method allows, NOT a blanket impl allow** (blinding dead-code detection on a core client is wrong; advisor-confirmed no scale exception).
  - `candle_engine` is live, but the `TradeCandleBuilder`-using engine in `thirty_second.rs` is a **dead legacy path** (live one = `CanonicalThirtySecondEngine`).

---

## 3. PHASE 0 — status & EXACT remaining actions for TRUE-DONE

### Done & committed (prior session + this one)
- **A1–A9** landed as isolated commits (`b5f2b16`..`9563437`): durable `stop_v1`, freshness single-source, supervised vault_monitor (both spawns), shared observation Arc, zero-throughput-green health, supervised enrichment reclaimer + orphan group removal, `recovery.rs` v1-ILP gated on `stop_v1`, A5 partial (registered the written pumpportal-age metric, deleted one dead one).
- **A5 / 1.2 — Boundary-Rule-8 CI gate: DONE this session** (`2853f83`). `tests/mdp_metrics_rule8_gate.rs`. Vec-aware write detection (`NAME.with_label_values(&[..]).inc()`), excludes `#[cfg(test)]` writes. **Green (2 passed).**

### ⚠ Phase-0 strict-true-done gaps remaining

**(1.1) A5 metric-wiring decision — USER / OBSERVABILITY-OWNER GATED. Do NOT auto-apply.**
The Rule-8 gate surfaced that `mdp_health_status` (`HEALTH_STATUS`) and `mdp_candles_written_total` (`CANDLES_WRITTEN_TOTAL`) are **defined but never written/registered**, yet **alert YAML references them** (`alerts_mdp_critical.yml:7,49`, `alerts_mdp_bulletproofing.yml:46`). So the alerts are currently **blind/stale**. Two valid resolutions — this is a product/observability call, not a silent default:
  - **(a) Retire (recommended if no live consumer):** delete the two metric defs + retire/repoint the stale alert rules. The candle alert filters `table="candles_5s_pumpportal"` — a **v1 table A1 suppressed** — so it is stale regardless of wiring.
  - **(b) Wire + register:** add write sites + register; this **activates dormant alerts** (must be an explicit owner decision).
  - Either way, **file a follow-up to fix/retire the `candles_5s_pumpportal` alert** — it is stale independent of (a)/(b). Do not repoint alert YAML inside the metric change.

**(1.3) Deploy + merge — human-gated.** Per `CLAUDE.md` Execution Gate Policy, do NOT treat `/health` green as the gate. Deploy with the durable `stop_v1`, confirm the A1 startup log `Candle-writer cutover mode resolved … mode=v2-only` (i.e. `to_dual_ilp()` returns v2-only), then merge `mdp-finish-phase01-20260620`.

> **Phase 0 is "done enough to merge" today.** 1.1 is the only strict-true-done code gap and it is gated on an observability-owner decision; 1.3 is human-gated.

### Bonus finding from the Rule-8 gate (observability debt — not blocking)
The gate found **61 registered metrics with no production write site** (orphaned by past refactors — the writing code was deleted, the registration stranded → permanently-zero exported series). Handled honestly:
- **Deleted 2** cleanly-orphaned, alert-unreferenced metrics (`HELIUS_TRANSACTIONS_FAILED`, `HELIUS_TRANSACTIONS_FETCH_FAILED`).
- **Baselined the remaining 59** in `KNOWN_UNWRITTEN` (a **ratchet**: blocks new permanently-zero series, list may only shrink). Burn-down is an observability-owner task (wire or retire each, checking alert YAML first) — a good standalone follow-up, independent of Phase 2.

---

## 4. PHASE 2 — UNBLOCKED, SAFE TO EXECUTE NOW (M2 / B2)

**Goal:** delete the proven-dead set so the lib shrinks and the god-file splits unlock. Phase 1 made dead-vs-live **visible** (every `// dead … — Phase 2` allow is a deletion candidate; every `// test_support` allow is KEEP). Phase 2 turns those into deletions.

### The authoritative deletion list = FINISH-PLAN §4 Deletion Matrix + §3.2 "dead" set
`delete_now` items (zero-caller proven by the plan — re-verify each with a fresh `rg` before deleting):
- `candles/registry.rs` (orphan, not in mod tree)
- **`candles/gap_detector.rs` + `candles/mod.rs:5-7` re-export** (superseded by `monitoring_tasks::CandleGapDetector`). ⚠ Phase 1 **allowed** this as `test_support` because of its inline `#[cfg(test)]` tests — Phase 2 deletes the **file + its tests + the re-export** as a unit (D6).
- `redis_health.rs` (`RedisHealthChecker`)
- `fallback_coordinator::RecoveryCoordinator` (Phase-1 allowed; delete now)
- `websocket_client::SubscriptionHandle` (Phase-1 allowed struct; `get_subscription_handle` already deleted)
- `pumpportal::trade_buffer.rs` (already deleted in prior `(4/N)` — confirm gone)
- `trade_candle_builder::{MdpTimelineSink, NormalizedTradeEvent}` (the 2 types only — **keep `process_trade`/`TradeCandle5s`**, they are test_support)
- `redis.rs` zero-caller cluster (the 41 Phase-1-allowed `// test_support/legacy: redis API` methods — re-verify each is truly caller-free; **delete `get_last_candle_time`/`update_last_candle_time` as a pair**)
- `redis_sync::sync_bonding_curve_tokens`
- `delivery::replay::spawn_replay_scanner` (non-supervised twin — `_supervised` is live; Phase-1 allowed it)
- `metrics.rs` FD block (`update_fd_metrics`/`get_open_fd_count`/`get_fd_limit` — Phase-1 allowed)
- `metrics.rs` never-written counters — **cross-check each against alert rules first** (the 59 `KNOWN_UNWRITTEN` from the Rule-8 gate are the candidate list; A5 lesson)
- `pumpportal::migration_handler` / `migration_handoff` dead subsystems (Phase-1 allowed `// dead pumpportal migration … — Phase 2`)
- The various `// dead … — Phase 2` allows across `observation/`, `subscription/`, `solana_provider/router.rs`, `postgres.rs`, `provider/connection_manager.rs` — each is a candidate; verify zero callers, then delete def + registration/usages together.

### Phase 2 HARD guardrails (FINISH-PLAN §7 — violating these breaks locked tests)
- **Every deletion needs a zero-caller `rg` proof in the commit message.**
- **Atomic test-allowlist updates.** Deleting a path-pinned file requires editing its allowlist(s) **in the same commit**:
  - `stream_cleanup.rs` is pinned by **both** `mdp_wave2_structural_contract.rs:89` (g5) **and** `mdp_wave6_health_redis_control_plane.rs:569` (`candles:stream` approved-map) — edit both. (And do **A7** first: verify producer-side stream trim.)
- **Deleted files stay deleted:** never recreate `src/trade_processor.rs` / `src/subscription_sync.rs` (`mdp_wave7_final_true_done.rs:162`).
- **Keep `pumpportal::legacy` namespace** in `lib.rs` (`legacy_keys_removed.rs`).
- **Keep the `runtime/supervisor.rs` file** even when gutting its dead fns (README-pinned by `runtime_surface_gate.rs`); keep `panic_payload_message` (live).
- **README seam strings** pinned by `runtime_surface_gate.rs:214-229` — any rename/relocation must keep the strings + update tests atomically.
- **Keep `LegacyHeliusProviderConfig`** (live default boot path until all deploys set `SOLANA_PROVIDERS`) and **`ProviderRouter` the struct** (live for selection/rotation — only its *replay leg* is dead, and that is Phase 3).
- **Do NOT delete any `// test_support` item or its test in Phase 2** — those are kept (deleting test_support modules + their tests is Phase 2's `delete_now` set only where §4 says so, e.g. gap_detector; otherwise Phase 3 decisions).
- **Exit gate per phase:** `cargo build` clean under `-D dead_code` + zero-caller proof + `g2/g5/g7/wave6/wave7` green. **NOT** `/health` green / 18-of-18.

### Phase 2 loop (proven shape)
```bash
# per dead item:
rg -wn SYMBOL services/market_data_processor/src services/market_data_processor/tests | wc -l   # confirm zero external callers
# delete def + registration + usages together
SQLX_OFFLINE=true cargo test -p market_data_processor --no-run 2>&1 | rg -i 'error\['            # must stay clean (a wrong delete fails to compile)
# run the locks touched (g5/wave2, wave6, wave7, legacy_keys_removed, runtime_surface_gate)
# commit per module with the rg zero-caller proof in the message
```

---

## 5. PHASES 3, 4, 5 — CAN the new session start them?

**Short answer: NOT without explicit product/design sign-off. Phase 2 first.**

### Phase 3 — Fake/inert-boundary decisions (B4, B5, B6) — **needs product decision**
- **B4 `src/lifecycle/`:** stranded test_support tree (only consumer is `tests/lifecycle_restart_restore.rs`). Default = **delete tree + that test** unless MDP-FREE-DATA.B is genuinely being shipped. → needs a "is this feature alive?" call.
- **B5 ProviderRouter replay leg:** the router is **LIVE** (selection/rotation) but a rotation **does not re-subscribe** (`cutover_after_failure`/`replay_desired_subscriptions` inert). Default = **delete the replay leg** (`router.rs:43-102,261-378` + `mod.rs:12` re-exports + `SubscriptionManager::replay_after_provider_cutover` + `tests/solana_provider_router_task3.rs`), **keep the router**. → needs a "is multi-provider failover a real direction?" call. **Never delete the router struct.**
- **B6 `replication_debt`:** drain task live, **zero producers** (`postgres.rs:1422`). Default = delete producer+drain+metric **unless an external service writes the table**. → needs a "does anything external write `replication_debt`?" precondition check.

### Phase 4 — M3 30s consolidation (B3) + DomainSpawner cancellation (B7) — **light design, do after Phase 2**
- **B3:** remove `candle_aggregator_30s` (`main.rs:185-194` spawn + file), keep the two `g8`-locked canonical paths. Needs a 30s end-to-end test + `g8` green. Interacts with `stop_v1`.
- **B7:** add a `task_token.cancelled()→Shutdown` arm to `DomainSpawner`; migrate `main.rs` per-task token glue.

### Phase 5 — God-file decomposition (Tier C, optional/LAST) — **only after B2; pure extraction**
C1 `persistence::candle_ledger` from `postgres.rs`; C2 split `metrics.rs` (must preserve `RuntimeHealthSnapshot` wiring); C3 `redis.rs` (after B2 removes the zero-caller cluster); C4 `enrichment_consumer` (after A8); C5 relocate `provider/connection_manager.rs`→`helius/connection_manager.rs` (must NOT add env reads — `wave7:186`). **Do these last, behind contract tests, no behavior change.**

> **Recommended order for the new session:** (i) finish Phase 0 strict-true-done — resolve the A5/1.1 metric decision (get the observability owner's call) and deploy+merge **OR** keep going on code; (ii) **execute Phase 2** (safe, high-value, unblocks the rest); (iii) only then bring B4/B5/B6 decisions to the product owner for Phase 3. Do not start Phase 3+ speculatively — the plan explicitly warns against building the ProviderRouter replay leg or reviving `src/lifecycle/` "to finish the abstraction" (§6b).

---

## 6. Commits this session (on `mdp-finish-phase01-20260620`, oldest→newest)
```
115376c  refactor(mdp): B1/Phase1 (11/N) — helius/ dead-code resolution        (5 deletes + ~30 allows)
dd60848  refactor(mdp): B1/Phase1 (12/N) — candles/ dead-code resolution
ef3b23a  refactor(mdp): B1/Phase1 (13/N) — observation/ dead-code resolution
51a03dc  refactor(mdp): B1/Phase1 (14/N) — subscription/ dead-code resolution
7c81e95  refactor(mdp): B1/Phase1 (15/N) — runtime/ + pumpportal/ dead-code resolution
3815252  refactor(mdp): B1/Phase1 (16/N) — providers/postgres/redis/misc dead-code resolution  (Phase 1 EXIT GATE: 0 warnings)
2853f83  test(mdp): Phase 0 (1.2) — Boundary-Rule-8 metric reconciliation gate
```
Prior-session commits on the branch: `b5f2b16`..`5cce485` (A1–A9 + B1 1–10/N + progress checkpoint). Branch is **26 commits ahead of `origin/main`, unpushed**.

---

## 7. Key gotchas / lock map (carry forward)
- **Lock-pinned strings — never delete:** `shutdown_window_inventory` (`mdp_wave5:448`), `batch_poller "price_only_fallback"` (`mdp_true_done_legacy_quarantine`), `decision_gate mark_passed` (← `launch_phase_buffer_replay`), `monitor.rs BondingCurveMonitor` (`runtime_surface_gate:770`), `SyntheticMigrationProcessor` (`legacy_keys_removed` + `mdp_true_done_legacy_quarantine`).
- **Do NOT:** reanimate `recovery.rs write_ilp` (A9 gates it); add `stage1_decision_gate::global()` in prod (`wave7:179`); add env reads in `provider/connection_manager.rs` (`wave7:186`); delete `ProviderRouter` (live).
- **`cargo test --no-run` is the authoritative dead-code gate** (not `cargo check`/`build` — those skip test-target reachability). Use the **full** message format to expand bundles.
- **3 `MDP-08` inline allows in `postgres.rs`** (lines ~1928/2020/2087) are intentional — leave them.
- The `mdp_metrics_rule8_gate` `KNOWN_UNWRITTEN` baseline (59 entries) must be **shrunk** as metrics are wired/retired — the test fails if an entry is resolved but left in the list (ratchet).

---

## 8. One-paragraph status for the next operator
Phase 1 (B1 dead-code strip) is **complete and verified** — 319→0 `dead_code` warnings, `-D dead_code` build clean, all 10 contract locks green, only documented allows remain, branch clean and committed (`2853f83`). Phase 0 is **functionally complete**: A1–A9 committed, the Boundary-Rule-8 CI gate added and green; the only strict-true-done code gap is the **A5/1.1 observability decision** (retire-vs-wire `mdp_health_status` + `mdp_candles_written_total`, which back currently-blind alerts), and then a human-gated deploy+merge. The Rule-8 gate also surfaced **59 orphaned permanently-zero metrics** (ratcheted baseline; standalone burn-down). **Phase 2 (delete the §4 dead set) is unblocked and safe to execute now** — every `// dead … — Phase 2` allow is a deletion candidate, every `// test_support` allow is KEEP; delete with zero-caller proofs and atomic test-allowlist updates per FINISH-PLAN §4/§7. **Phases 3–5 require product/design sign-off** (especially B4 lifecycle delete, B5 ProviderRouter replay leg, B6 replication_debt) and must not be started speculatively. Nothing is pushed or merged.
