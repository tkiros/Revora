# Session Handoff — SGW+TEW Audit Complete → Drive NO-GO to Unconditional GO

**Date:** 2026-07-02
**Repo:** `/home/tefera/Desktop/bcb` (branch `main`, audit committed at/after `3ae6b7f7`)
**Deployed prod image:** `five-worker-a400e74bef0d` — built from **unmerged** branch `five-worker-go-20260629` (commit `a400e74b`, a `wip:` checkpoint). Worktree: `~/.config/superpowers/worktrees/bcb/five-worker-go-20260629`
**Runtime mode:** `TEW_EXECUTION_MODE=shadow` (no capital at risk today)

---

## PART 1 — WHAT WAS DONE THIS SESSION

A five-expert-persona forensic audit of the full **MDP candle → SGW → signal persistence → TEW → shadow/live execution → position close → PnL** pipeline. Six parallel deep code sweeps (~92k LoC Rust, 136 migrations, 17 compose files, 7 CI workflows), then cross-verified against the **live production Postgres, Prometheus, and running containers**. 39 consolidated findings, 11 runtime-proven.

### Deliverables (committed to bcb main — read these first in the new session)

| File | Content |
|---|---|
| `docs/audits/SGW_TEW_SIGNAL_TO_POSITION_CLOSE_EXPERT_PANEL_AUDIT.md` | **Canonical.** Executive verdict, real system map, persona findings, 10 expert debates, 39-finding issue register (SGW-TEW-001..039), 20-dimension scorecard (overall **3.5/10**), target architecture, P0–P3 roadmap, verification Gates A & B, go/no-go |
| `predict/260702-1900-sgw-tew-panel/` | overview.md, findings.md, **hypothesis-queue.md** (H-01..H-06 already runtime-confirmed; H-07..H-12 open), persona-debates.md, handoff.json, knowledge files |

Commit message: `docs(audit): SGW+TEW signal-to-position-close expert panel audit + predict artifacts`.

### Headline results

**VERDICT: NO-GO for live capital. Current shadow evidence is INVALID (pipeline broken in the running deployment).**

**Active production incident discovered & fully characterized (runtime-proven):**
- Last successful `signal_execution`: **2026-07-01 06:52:57** — the exact minute the current image came up. Since then **100% of signals (14 ENTRY + 85 EXIT) terminated `cancelled`**.
- ENTRIES: execute (shadow fills written) but the shadow branch never writes `MARK_SUCCESS` and never releases the Redis `PendingTracker` claim → row abandoned in `processing` → 90s stale-sweep marks `failed` → retry hits its own leaked Redis claim → error string falls into catch-all → `cancelled / intake_malformed_signal` (**TEW-EX-9**, `signal_executor.rs:990-1247`; success machinery is `#[cfg(feature="live_executor")]`-gated so the shadow binary physically lacks it).
- EXITS: all refused `intake_duplicate_exit_already_closed` while **all 9 affected mints have OPEN `shadow_positions` rows** — the exit-intake position check consults the live `positions` table (empty since 2026-04-20, shadow mode) instead of `shadow_positions`. **12 shadow positions stuck open, zero sells, zero PnL accrued since deploy.**
- Root cause lineage: the correct transactional shadow implementation **`commit/shadow_commit.rs::commit_shadow_outcome`** (CAS-replace upsert, stale-closed-row deletion, route-failure→100%-loss, `realized_pnl_sol`, MARK_SUCCESS) was wired in commit `03afc07d`, **unwired in `faa65e6d`** ("salvage production hardening"), zero callers now. The inline replacement (`signal_executor.rs:1104-1175`) has the known pyramiding bug (`current_quantity = current + EXCLUDED`, the exact bug comment SGW-TEW-016 says was fixed), no Exit arm, no PnL. The static guard test `p0_5_static_architecture_guards.rs::p0_shadow_fill_insert_writers_are_sanctioned` **fails on HEAD** and catches exactly this — but TEW tests never run in CI.

**Other confirmed criticals:**
1. **No live execution path exists at all** — `signal_executor.rs:1401-1413` hard-refusal stub; `SolanaExecutor::execute` is a self-transfer testnet placeholder; `JupiterClient::execute()` has zero call sites. Live trading is impossible by construction.
2. **Postgres backups silently failing 107 days** — `scripts/postgres_backup.sh` mode 0664 (not executable), 2 duplicate cron entries, log full of `Permission denied`, last artifact `trading_20260317_120001.sql.gz`.
3. **retention_worker DOWN since 2026-06-30** (OOM Exited 137; `unless-stopped` did not recover it). `mdp_candle_delivery_ledger` at **515 MB / 242,835 rows in 3 days**, unbounded.
4. **Wallet keypair `.config/solana/id.json` mode 0777** (real 64-byte keypair; correctly gitignored). Also stray empty root-owned dir `infra/docker/wallet_keypair.json` (docker bind-mount artifact).
5. **Deploy truth not on main** — the compose file that launched prod (`docker-compose.five-worker-shadow.yml`, pins `${FIVE_WORKER_IMAGE_TAG}`) exists only in the unmerged worktree branch; main's compose files pin 3 different stale tags. No working rollback (script targets dead systemd model).
6. **TEW test suite runs in NO CI pipeline** (ci.yml only builds + greps binary symbols; workspace tests only on `v*.*.*` tags, last cut 2026-04-18). Two P0 tests fail on HEAD undetected: `capital_safety_tests.rs::wallet_actor_uses_rpc_balance_and_periodic_sync` and the p0_5 shadow guard.
7. **`wc_024` migration never applied** — `stage1_shadow_outcomes` table missing; monitoring_worker F9 tracker silently fails every tick.
8. **No PnL/drawdown/max-position alerts loaded** — all such rules live in orphaned files not in `prometheus.yml`'s `rule_files`. Alertmanager silently degrades to a local log without secrets (real prior incident 2026-06-11).

**High-severity latent (dormant only because live path doesn't exist):**
- WalletActor starts at hardcoded **0.5 SOL, never chain-synced** (`main.rs:614-627`; `sync_balance` zero call sites).
- **`pending_tx_signature` never written** → crash between tx submit and fill record would re-submit on restart (double-swap) (`signal_executor.rs:1316-1398`; only `SET NULL` writes at :1363,:1427).
- **Realized PnL never subtracts fees/priority fees**; token decimals hardcoded 6 (`signal_executor.rs:1539-1623`; `solana_executor.rs:809,854`). Three "single source of truth" PnL implementations — only the inline copy is live; `pnl.rs` and `position/pnl_calculator.rs` are dead.
- Shadow cost model optimistic: static 100 SOL liquidity, static 5000-lamport priority fee, `platform_fee_bps: 0` hardcoded (`signal_executor.rs:1067`) despite configured 8bps, **route failures silently dropped** = survivorship bias.
- Re-entering a previously-closed mint inherits stale `entry_mcap/entry_quantity/opened_at_ms/strategy` (`20260506_000001_positions_entry_invariants.sql:85-94` ON CONFLICT field list).
- `expires_at` extension trigger applies flat **+25s** vs the now-5-minute baseline — *shortens* deadlines (`20260126_extend_signal_ttl.sql` vs `0072`); 1 live cancellation observed.
- Live SGW scenarios **F/G bypass the validated BoS detector** (blowoff velocity + swing-age checks) using a synthetic single-check BoS (`token_engine/entry.rs:152-170`), and mix two different swing-high sources between entry trigger and stop/TP anchors. Rug filter (`rug_state_reader.rs`) and CVD engine fully unwired.
- SGW Redis circuit breaker dead code (all 14 hot-path sites use `.inner_mut()`); TEW poll-loop circuit breaker never receives outcomes (decorative).
- SGW drift detector (60s) **warns but never corrects** `has_open_position` divergence → up to ~24h without SGW-side protective exits (TEW backstops bound it).

**What is GOOD (do not churn):** signal emission boundary (atomic `signals_audit`+`signal_execution` insert strictly before any external effect, typed outcomes, contract-test-enforced); layered idempotency (UUIDv5 signal_id + unique indexes + atomic claim SQL + per-mint advisory lock + CAS `WHERE current_quantity >= $1`); three-layer live-mode gate + multi-trigger kill switch (exempts protective exits); restart recovery (stateless PG pollers; SGW blocks startup on rehydration); partial-close cost-basis math (hand-verified correct); bounded actor model; Redis stream/TTL hygiene.

### Runtime facts verified this session (re-verify cheaply if stale)
- `SGW_CANDLE_SOURCE=v2`, `REDIS_STREAM_SIGNALS_ENABLED=false`, `TEW_EXECUTION_MODE=shadow` (docker exec).
- Replay debt: all rows terminal (661 out_of_order / 496 stale / 30 duplicate) — zero backpressure rows; drain-path gate bypass is latent.
- Live `fills` table: **no partition trigger** (POS-4 disproved live), `simulated DEFAULT false` (contradicts migration `v41_003 DEFAULT true` → live schema ≠ migration replay → DR replay would fail).
- `schema_migrations` lacks `0080_pnl_ledger_fill_id_unique` (never ran).
- 7d signal stats: success=1261 (all pre-deploy), cancelled=112, dead_letter=39.

---

## PART 2 — MISSION FOR THE NEXT SESSION

**Goal: move the verdict from NO-GO to UNCONDITIONAL GO.** That means passing **Gate A** (valid shadow baseline), then **Gate B** (live-capital readiness) — both defined with exact commands in audit §9. Work strictly in this order; each item names its acceptance proof. Do not claim done without the proof.

### PHASE 0 — Session setup (15 min)
1. `cd /home/tefera/Desktop/bcb && git fetch --all --prune && git status`
2. Read `docs/audits/SGW_TEW_SIGNAL_TO_POSITION_CLOSE_EXPERT_PANEL_AUDIT.md` (at minimum §1, §5, §8, §9).
3. Reconcile the deploy branch: diff `five-worker-go-20260629` vs main (`git log HEAD..a400e74b`, 9 commits) — decide merge-or-rebase so fixes land in ONE lineage that both main and prod share. **Do not fix code on main while prod runs an unmerged branch without a plan to redeploy.**

### PHASE 1 — P0: stop the bleeding + restore truth (target: this week)

| # | Action | Files/commands | Acceptance proof |
|---|---|---|---|
| 1.1 | **Restart retention_worker**, raise its memory limit (it OOM'd), investigate why `unless-stopped` didn't recover it | `docker start bct-retention-worker`; compose mem limit; check `docker events`/daemon logs | Container healthy 48h; `mdp_candle_delivery_ledger` size flat/declining; add liveness alert that fires on manual `docker stop` test |
| 1.2 | **Fix backups**: `chmod +x scripts/postgres_backup.sh`; dedupe the two cron entries (`crontab -l`: `0 3 * * *` and `0 */6 * * *`); add backup-age Prometheus alert | host cron + script | Fresh artifact in `~/bcb-backups/postgres/` today; **restore drill into a scratch DB succeeds and is documented** |
| 1.3 | **Wallet hygiene**: `chmod 600 .config/solana/id.json`; `rmdir infra/docker/wallet_keypair.json`; add TEW boot assertion refusing live mode unless keypair file mode is 0600/0400 | `signer.rs` boot check | `stat` shows 600; unit test: live-mode boot refuses a 0644 file |
| 1.4 | **Re-wire `commit_shadow_outcome`** into the shadow branch of `SignalExecutor::execute` for BOTH Entry and Exit; delete the inline `INSERT INTO shadow_fills/shadow_positions` SQL from `signal_executor.rs:1104-1175`; call `pending_tracker.release()` on the success path | `services/trade_execution_worker/src/executor/signal_executor.rs`, `commit/shadow_commit.rs` | `cargo test --test p0_5_static_architecture_guards` passes ON MERIT; after deploy: signals reach `execution_status='success'`; new shadow sells carry `realized_pnl_sol` |
| 1.5 | **Fix shadow exit-intake position check** to consult `shadow_positions` (not `positions`) when mode=shadow — find the `intake_duplicate_exit_already_closed` check in TEW signal_intake and make it mode-aware (a `PositionStore` trait with live/shadow impls is the clean shape) | TEW `signal_intake/` | The 12 stuck-open shadow positions become closeable; exit signals stop dying with that reason while shadow rows are open. Verify SQL: `SELECT count(*) FROM shadow_positions WHERE status='open';` trends to ~active-only |
| 1.6 | **Apply `wc_024`** + reconcile: `bash scripts/deploy/apply_migrations.sh`; then diff all `wc_*.sql` filenames vs `SELECT version FROM schema_migrations` and apply stragglers; add a post-deploy CI check failing on unapplied `wc_*` | db/migrations | `stage1_shadow_outcomes` exists; monitoring_worker F9 metric (`STAGE1_FALSE_REJECT_RATE`) emits real data |
| 1.7 | **Deploy truth to main**: merge/port `docker-compose.five-worker-shadow.yml` (or introduce `infra/docker/DEPLOYED_VERSIONS.env` single pinned-tag file written only by the deploy script); update stale tags in `docker-compose.workers.yml`/`prod.yml`/`tew-hardening.yml`; write + drill a compose rollback script (retire systemd `rollback_full.sh`) | infra/docker, scripts/deploy | `docker inspect` image tags == file on main; one documented rollback executed against the running stack |
| 1.8 | **TEW CI job**: mirror `signal-generation-ci.yml` with `services:` postgres/redis; run `cargo test -p trade_execution_worker` + the `--ignored` DB proof tests; ALSO fix `signal-generation-ci.yml` ordering (tests currently run BEFORE DB containers start at line 70) and add an `--ignored` live-DB pass (pattern exists in `enrichment-ci.yml:110`). Fix the 2 failing P0 tests **by fixing the code they guard** (1.4 fixes the shadow guard; wallet-sync test needs item 2.2 — until then mark it `#[ignore]` with a linked issue, never delete) | .github/workflows | CI demonstrably red when 1.4's fix is reverted on a branch; green on main |
| 1.9 | **Redeploy + reset the shadow clock**: build/tag/deploy the fixed image via the now-on-main compose; **declare all prior shadow data inadmissible**; start the Gate-A 48h observation window | deploy | Gate A queries below |

**GATE A — valid shadow baseline (all must hold over 48h):**
```bash
docker exec bct-postgres psql -U postgres -d trading -c \
 "SELECT execution_status, failure_reason, count(*) FROM signal_execution
  WHERE created_at > now()-interval '48 hours' GROUP BY 1,2;"
# expect: success > 0; zero intake_malformed_signal; no 100%-cancelled pattern
docker exec bct-postgres psql -U postgres -d trading -c \
 "SELECT count(*) FROM shadow_fills WHERE side='sell' AND realized_pnl_sol IS NOT NULL
   AND created_at > now()-interval '48 hours';"   # expect > 0
docker exec bct-postgres psql -U postgres -d trading -c \
 "SELECT count(*) FROM shadow_positions WHERE status='open';"  # expect ≈ genuinely-active only
cargo test -p trade_execution_worker --test p0_5_static_architecture_guards  # green
ls -t ~/bcb-backups/postgres/*.sql.gz | head -1  # dated today
docker ps | grep retention  # Up + healthy
```

### PHASE 2 — P1: production-readiness (2–6 weeks; required for GO)

| # | Action | Key files | Acceptance proof |
|---|---|---|---|
| 2.1 | **Single fee-inclusive PnL function** in `shared/` (`exit_value − basis×fraction − fee_sol − priority_fee − rent/ATA amortization`), decimals from `token_reference`/on-chain `getMint`; call it from live commit, shadow commit, dashboard; DELETE `pnl.rs` dead copy + `position/pnl_calculator.rs` | signal_executor.rs:1539-1623 → shared fn | Golden-file tests (fees, partials, decimals, re-entry); grep proves exactly one call site per mode; recompute 1 week of shadow PnL from fills alone and match ledger |
| 2.2 | **WalletActor chain sync**: fetch real balance at startup (kill the `0.5_f64` literal, main.rs:614-627); thread the handle into `WalletBalanceMonitor::check_and_refill` and call `wallet_actor.sync_balance(balance_sol)` on its 5-min tick | main.rs, monitoring/wallet_balance.rs, wallet_actor.rs | `capital_safety_tests.rs::wallet_actor_uses_rpc_balance_and_periodic_sync` passes un-ignored; 24h soak: actor balance == chain balance within tolerance |
| 2.3 | **Tx-level idempotency**: persist `pending_tx_signature` + Jupiter `request_id` to `signal_execution` in the same transaction that enters submitting state, BEFORE awaiting confirmation; recovery (`recovery_simple.rs` `classify_stale_claim`) checks chain by signature before allowing retry | signal_executor.rs:1316-1398, recovery_simple.rs | Devnet drill: `kill -9` between submit and record → restart → NO duplicate on-chain action |
| 2.4 | **Build the real live execution path** (currently nonexistent): Jupiter Ultra `/order`+`/execute` behind `live_executor` feature, pre-send simulation, priority fee/compute budget, blockhash refresh, confirmation polling, failure classification; remove the `is_live_mode()` refusal stub (signal_executor.rs:1401-1409) in ONE reviewed PR that also lands 2.3; fix the vacuous regression test in `live_authority_tests.rs` (string-match defeated by rustfmt line-wrap — use whitespace-normalized matching) | executor/{jupiter,solana_executor,signal_executor}.rs | Devnet E2E: entry+exit round trip, fills recorded, PnL correct incl. fees; explicit review sign-off documented |
| 2.5 | **Exit ownership split** (audit D3): SGW owns strategy exits; TEW `stop_loss_monitor` becomes protective backstop only with explicitly coarser thresholds + new `tew_backstop_exit_won_total` metric + alert on any occurrence | risk/stop_loss_monitor.rs, docs | 1 week shadow with 0 unexplained backstop wins |
| 2.6 | **Shadow realism v2**: route-failure recorded as full-loss shadow trade (logic already in shadow_commit.rs — keep when wiring 1.4); wire `shadow_modeled_jupiter_fee_bps` (kill hardcoded `platform_fee_bps: 0`, signal_executor.rs:1067); priority fee from `getRecentPrioritizationFees` p75 (fallback HIGH not low); liquidity from observed pool depth (fallback conservative floor, not 100 SOL); stamp cost-model version on every shadow fill | config.rs:478-482, cost_model | Route failures visible as losses in shadow ledger; cost-model version on new fills |
| 2.7 | **Fix `expires_at` extension trigger**: pending→processing extension proportional to current baseline (not flat +25s) | 20260126_extend_signal_ttl.sql successor migration | No more "expired - not executed within 25 seconds" cancellations |
| 2.8 | **Re-entry attribution fix**: on BUY where prior `current_quantity=0`, reset `entry_mcap/entry_quantity/opened_at_ms/strategy` in the upsert | 20260506_000001 upsert (queries.rs) | 2-cycle integration test: close mint fully, re-enter, verify fresh attribution |
| 2.9 | **F/G through validated BoS** or a written re-derivation signed off by strategy owner; single swing source for trigger AND stop/TP anchors within one signal | token_engine/entry.rs:152-170, scenario_efg_entry.rs:389-422 | Scenario spec doc == code; BoS gets real unit tests (currently zero — `bos_detector_test.rs` is an empty `#[ignore]` stub) |
| 2.10 | **Alerting spine**: move PnL/drawdown/max-position rules from orphaned files (`alerts_production.yml:153`, `alerts_phase4.yml:26`, `alerts_scenario_monitoring.yml:203`) into a file listed in `infra/observability/prometheus/prometheus.yml` `rule_files:`; fix `TEW_ServiceDown` job-label mismatch (underscore vs hyphen); add `promtool check rules` + `test rules` to CI; Alertmanager dead-man's-switch canary observed end-to-end in Slack; add backup-age + retention-worker-liveness alerts; runbook sections for `TEW_StuckPositionsDetected` / `TEW_WalletBalanceLow` | infra/observability | promtool green in CI; canary alert seen in Slack/pager; rules fire in a synthetic test |
| 2.11 | **Corrective reconciliation**: SGW 60s drift detector corrects `has_open_position` after N consecutive disagreements (today warn-only, position_read_model.rs:326,348); route replay-debt drain through the intake gate (runtime/replay_debt.rs:39); tag MDP-replayed candles `replayed=true` for history-only handling vs the 240s quarantine | SGW runtime/ | Injected-drift test corrects <5min; drained stale candle rejected by gate |
| 2.12 | **Wire-or-delete both circuit breakers**: SGW `ResilientRedis` (all 14 hot-path call sites currently bypass via `.inner_mut()`) and TEW poll-loop CB (feed it real outcomes; carve out protective exits so an open breaker never blocks stop-losses) | redis_circuit_breaker.rs, consumer.rs:338, main.rs:799 | Fault-injection: breaker opens; exits still flow |
| 2.13 | **`execution_mode` column** on `signal_execution` outcomes (today `success` is ambiguous shadow/live — every consumer reading it as real-trade has been wrong since 4/20); audit every `fills/trades` INSERT binds `simulated` explicitly (live default is FALSE — an unlabeled shadow insert would masquerade as real) | migration + recorder code | Dashboard distinguishes modes; insert-site checklist complete |
| 2.14 | **Capital config sanity**: fix default inversion `POSITION_SIZE_SOL=0.25 > MAX_POSITION_SIZE_SOL=0.1` (config.rs:323,412); kill-switch fire drill; daily-loss cap wired to an alert | config.rs | Boot-validation test rejects size>max; drill documented |

### PHASE 3 — P2 hardening (parallel where possible; required before GO is *unconditional*)
- **Migration re-baseline**: squash the 136-file/3-lineage history into a `pg_dump --schema-only` baseline captured FROM production; one runner, one tracking table, content-hash verification; CI drill: fresh-DB replay + schema diff vs prod == empty. (Today replay provably ≠ prod: live `fills.simulated DEFAULT false` vs migration `DEFAULT true`.)
- Fix `signal_dlq` FK (`ON DELETE SET NULL` on a NOT NULL PK — swap to CASCADE or RESTRICT) before adding any `signal_execution` retention.
- Retention coverage for `signals_audit`/`signal_execution`(dead_letter)/`trades`/`pnl_ledger`/`shadow_*`; delete the 3 dead QuestDB retention scripts + fix or remove the nightly-failing `infra/scripts/bct_retention.sh` cron; reconcile `partition_manager.rs` 7d/14d vs `retention_policy.json` 72h (pick one source of truth).
- **Load test** TEW at 10× current volume vs real PG/Redis with p99 claim-to-outcome assertions (zero TEW load tests exist; SGW's are `assert!(true)` stubs).
- Commit-rollback integration test against real Postgres with injected mid-tx failure (the current "rollback" test is an in-memory HashSet simulation; this codebase has already had 2 real non-atomicity corruption incidents: s1_005 orphan trades, s1_006 missing pnl_ledger rows).
- Test-theater purge: delete or implement every `assert!(true)` stub, string-match "capital safety" test, the stale-spec `exit_logic_test.rs` (asserts TP distribution that contradicts production), and the empty `bos_detector_test.rs`.
- Wire-or-drop `positions.status` (unmaintained, lies to readers); schema-version range check (TEW pins literal `"1.0.0"` — any bump kills all signals) + MDP actually transmitting its version field; consumer name from `HOSTNAME` (hardcoded `sgw_1` breaks >1 replica); `chmod`-style pre-flight `test -f` on secret mounts in deploy script.
- Dead-code deletion (audit SGW-TEW-038): `strategy/{bonding_curve,registry,isolation}.rs`, defeated `StrategyManager::has_active_position` guard, `src/intake/` shim, duplicate outcome-routing pipeline (`domain/execution.rs` + `executor/outcome.rs` + double-defined `route_execution_outcome`), `retry::ExponentialBackoff`, `position_opens` table, `positions` USD column set, orphaned alert files, `deploy_production.yml` (non-functional theater: nonexistent ansible/ dir, placeholder AWS ARN) — delete or rebuild honestly; rename `docker-compose.live.yml` (it's enrichment API mode, not live trading).

### GATE B — UNCONDITIONAL GO checklist (all 10; audit §9 has full detail)
1. Live path exists, devnet round-trip proven, code-reviewed, stub consciously removed in one PR.
2. Crash-idempotency drill passed (kill -9 submit-window → no double-submit).
3. Wallet: 0600 + boot assertion; actor balance == chain 24h.
4. PnL: single fee-inclusive function; week of shadow PnL reproducible from fills alone.
5. **≥4 weeks of VALID conservative shadow** (post-1.9 clock, cost-model-versioned, route-failures-as-losses) meeting a **pre-registered, written** risk-adjusted threshold — get the user to set this number BEFORE looking at results.
6. Alert spine loaded + promtool-checked + canary observed end-to-end.
7. Rollback drill from main-committed deploy file; backup restore drill within 30 days of go-live.
8. Caps re-validated (size≤max, daily-loss alert, kill-switch drill).
9. Load test at 10× volume, p99 recorded and accepted.
10. First live phase: minimum size, 1–2 concurrent positions max, human-attended, pre-written abort criterion.

---

## PART 3 — OPERATING NOTES FOR THE NEXT SESSION

- **Evidence base**: every claim above is file:line-cited in the audit doc §2/§5; original forensic IDs (SGW-IN-*, SGW-SIG-*, TEW-EX-*, POS-*, DATA-*, OPS-*) map to the six sweep reports. The session scratchpad copies do NOT survive; the committed audit + `predict/` dir are the durable record.
- **Branch discipline first**: prod runs unmerged `five-worker-go-20260629` (9 commits main lacks; main has 10 commits prod lacks, none touching SGW/TEW). Unify before shipping fixes or you'll fix the wrong lineage.
- **Don't trust green**: `/health/complete` is green while all of the above is true (project CLAUDE.md execution-gate policy explicitly warns about this). Health dimension 8 structurally cannot fail on Redis (dead CB). Only the Gate A/B SQL + drills count as proof.
- **`.env` files are read-blocked** by permission policy — verify env via `docker exec <container> env | grep VAR` instead.
- **Live DB access**: `docker exec bct-postgres psql -U postgres -d trading`. Prometheus: `http://localhost:9090`. Containers: `bct-signal-generation-worker`, `bct-trade-execution-worker`, `bct-market-data-processor`, `bct-postgres`, `bct-redis-master`, `bct-questdb`, `bct-prometheus`.
- **Two subagent session-limit failures** occurred near the end of the audit session (tew-exec, data-layer) — their reports were delivered in full before failing; nothing is missing.
- Open verification items intentionally left for this session: `USE_JUPITER_SWAP` live value; whether `state_machine.rs` enum is vestigial; Alertmanager Slack/email secrets are non-placeholder (check via canary, not by reading .env); rug/CVD dormancy is intended (confirm vs S2-2/CBCX roadmap before deleting).

**Suggested opening move for the new session:** read the audit §5 + §8, run the Gate A queries to capture the current (still-broken) baseline, then start Phase 1 items 1.1–1.3 (pure ops, zero code risk) while planning the 1.4/1.5 TEW PR.
