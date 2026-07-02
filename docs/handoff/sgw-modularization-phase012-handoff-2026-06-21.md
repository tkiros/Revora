# SGW Modularization — Phase 0/1/2 Session Handoff

**Date:** 2026-06-21
**Author:** previous session (Claude Opus 4.8, subagent-driven-development)
**Plan executed:** `plans/sgw-modularization-finish-plan.md` (validated against `bd23b15`)
**Crate:** `services/signal_generation_worker` (SGW)

---

## TL;DR

Phase 0 (baseline), Phase 1 (R1 stale-actor invalidation), Phase 2 (R2 sweep→mailbox)
are **CODE-COMPLETE, REVIEWED, and MERGED**. They are **NOT yet "true done"** in the
plan's runtime sense — two things remain:

1. **Phase 3 (P3)** must land to turn the static `sgw_true_done_actor_state` gate GREEN
   (it is RED 6/7 *by design* until P3 relocates the phantom-clear write). This is the
   static fingerprint of the R1/R2 ownership contract.
2. **Phase 5 (P4)** must run the data-plane proof harness against a live build to
   *runtime-verify* the R1/R2 fixes. The unit/source-scan tests are necessary but NOT
   sufficient — the races' "self-heal on next candle" behavior is only provable against
   real infra.

**The new session CAN start Phase 3 and Phase 4 immediately** (Phase 2 is merged — the
plan's hard precondition for P3). **Phase 5 needs a live Redis/PG/SGW stack** and is the
deploy-time gate. Phase 6 (P5 ops) follows Phase 5.

---

## Coordinates

- **Repo root:** `/home/tefera/Desktop/bcb` (a worktree-based checkout; do NOT cd to the
  original root — operate inside worktrees).
- **Plan's source-of-truth branch:** `mdp-candle-v2-cutover`, was at `bd23b15`, **now
  fast-forwarded to `bdcc911`** (this work merged in).
- **Feature branch:** `sgw-modularization-finish` @ `bdcc911` (== `mdp-candle-v2-cutover`).
  Lives in worktree `/home/tefera/Desktop/bcb/.claude/worktrees/sgw-modularization-finish`.
- **Commits delivered (on top of `bd23b15`):**
  - `65c43b0` — `fix(sgw): generation guard invalidates stale actors on restart (R1)`
  - `bdcc911` — `refactor(sgw): route time-stop sweep through the actor mailbox (R2)`
- **Progress ledger:** `<feature-worktree>/.git`-path `sdd/progress.md`
  (run `git rev-parse --git-path sdd` inside the feature worktree). Per-task briefs/reports
  are in the feature worktree's `.sdd/` dir (untracked).

---

## What was done

### Phase 0 — baseline (no code change)
Established the green/red truth:
- `cargo fmt -p signal_generation_worker -- --check` → CLEAN
- `cargo clippy -p signal_generation_worker --all-targets --all-features -- -D warnings` → exit 0 (only a pre-existing `redis v0.25.4` future-incompat *dependency* note)
- 15 source gates GREEN; `sgw_true_done_actor_state` RED **6/7** (sole offender
  `src/signal_emitter.rs` — the phantom-clear `save_token_state` at the SGW-TEW-002 path).
- Matches the plan's asserted baseline exactly. No discrepancies.

### Phase 1 — R1 CRITICAL: stale-actor invalidation (option **b**, generation guard) — `65c43b0`
Root cause: `restart_actors()` cleared the registry but left spawned `TokenActor` tasks
running fire-and-forget (`tokio::spawn(actor.run())`, no `JoinHandle`/`.abort()`), so a
stale actor A and a freshly-spawned actor B could both write the same mint's `token_state`
(last-write-wins corruption) after a `RestartActors` remediation command.

Implementation:
- `src/coordinator.rs`: added `actor_generation: Arc<AtomicU64>` (init 0). In
  `restart_actor_registry`, `generation.fetch_add(1, SeqCst)` **in the same locked section**
  as `map.clear()` (only when `removed > 0`). `get_or_spawn` snapshots `spawn_generation`
  and passes `actor_generation.clone()` + snapshot into `TokenActor::new`. 2 new unit tests.
- `src/actor.rs`: `pub(crate) fn is_stale(current, spawn)` + `TokenActor::is_stale(&self)` +
  `terminate_stale()`. `run()` checks staleness at top-of-loop AND before the result match
  (skip write via 3 save-site guards → on stale, fail the ack [no XACK → redeliver to fresh
  actor B] + `terminate_stale()` + break). WRONGTYPE-retry path also stale-checked.
- `src/metrics.rs`: `+sgw_actor_stale_generation_terminations_total`;
  `sgw_actor_terminations_total` gained a `stale_generation` reason label.
- **Design choice (load-bearing):** `handle_candle` intentionally keeps `-> Result<()>`
  (NOT an enum) so the source-scan test `sgw_true_done_actor_state::insufficient_history_...`
  which greps for the literal `return Ok(())` keeps passing.

**HONEST RISK GRADE (do not overstate):** R1 CRITICAL → **bounded residual that self-heals
on the next candle for the mint**; stale-generation terminations counted. The race is **NOT
eliminated** — a stale actor's already-in-flight `save_token_state().await` can still land
once before the next candle re-derives correct state (the documented option-(b) trade-off).

### Phase 2 — R2 HIGH: time-stop sweep → actor mailbox — `bdcc911`
Root cause: `runtime/time_stop_sweep.rs` did `coordinator.is_actor_active(mint)` (sync check,
lock released) then `emit_time_stop_exit().await` — a check-then-emit TOCTOU; an actor spawned
in the gap became a second writer (divergent EXIT `signal_id`s; the 5-min cross-window dedup is
a confirmed no-op in shadow mode).

Implementation:
- `src/coordinator.rs`: `ActorMessage` type alias → **enum** `Candle(CandleEvent, ack)` |
  `TimeStop { position: OpenPositionRow, ack_tx }` (unboxed — variants balanced to avoid
  `clippy::large_enum_variant`; slot size unchanged vs the old tuple). `dispatch_with_ack`
  sends `Candle`. New `dispatch_time_stop_with_ack(position)` reserves via the **same**
  `get_or_spawn` singleflight → actor is sole writer. On spawn-pressure / full / closed mailbox
  → Err-ack + `sgw_time_stop_sweep_dispatch_deferred_total` (deferred, retried next 300s pass;
  NOT replay_debt, which is candle-shaped). Deleted `is_actor_active`.
- `src/actor.rs`: `run()` matches `Candle` (existing path) vs `TimeStop` (stale-check →
  `handle_time_stop` → post stale-check → ack; `EMITTED_TOTAL` counted in run()'s Ok arm so the
  metric and the sweep log never diverge under a restart race). `handle_time_stop` restores
  token_state from the position, reuses the sweep's `pub(crate)` signal builders, stale-checks,
  emits via `signal_emitter::emit_exit` (re-reads authoritative state → position-closed guard).
  **No new `save_token_state` in actor.rs** — sole-writer comes from mailbox serialization.
- `src/runtime/time_stop_sweep.rs`: sweep now dispatches + awaits per expired position; deleted
  `is_actor_active` check / `emit_time_stop_exit` / `skipped_active` inc / the `token_state`
  gateway param; `MissedTickBehavior::Skip` so a slow pass never bursts back-to-back. Module
  doc rewritten.
- `src/bootstrap/mod.rs`: dropped the now-unused `time_stop_token_state` construction.
- `src/metrics.rs`: kept `sgw_time_stop_sweep_skipped_active_total` defined-but-unused for
  metric-inventory stability.
- `tests/snapshots/wave2/metrics_namespace_inventory.json`: re-seeded for the new metrics.

**RISK GRADE:** R2 HIGH → **closed** — a single writer per mint, so the duplicate-EXIT and
token_state-divergence harms are eliminated for the time-stop path. Residual: a time-stop
superseded by a restart inherits Phase 1's bounded self-heal.

### Reviews (`/code-review` skill — one read-only finder per pass)
- Phase 1: 2 findings (WRONGTYPE-retry ack-after-stale; metric help text) → **fixed**.
- Phase 2: 2 fixed (stale ownership comment; interval burst-mode), 1 documented (emitted-counter
  semantics — pre-existing, out of R2 scope).
- Final whole-branch (R1×R2 seam): **NO critical/important.** 3 minor — 1 fixed (EMITTED metric/
  log divergence), 2 accepted (TimeStop Err path matches prior behavior; `spawn_gen`-loaded-
  outside-lock is reviewer-confirmed safe via the activate backstop + monotonic generation).

---

## Final verification state (@ `bdcc911`)
- `cargo test -p signal_generation_worker --lib` → **307 passed**, 0 failed, 13 ignored.
- **15 source gates GREEN.** `sgw_true_done_actor_state` **RED 6/7** (offender `signal_emitter.rs`,
  unchanged from baseline — Phase 3 greens it; this is EXPECTED, not a regression).
- `cargo fmt -- --check` CLEAN; `cargo clippy --all-targets --all-features -- -D warnings` exit 0.

### The full gate set (run all after any change)
```
cargo test --no-fail-fast -p signal_generation_worker --lib \
  --test sgw_runtime_owner --test sgw_true_done_ack_frontier --test sgw_true_done_actor_singleflight \
  --test sgw_true_done_actor_state --test sgw_true_done_config_boundaries \
  --test sgw_true_done_data_plane_proof_contract --test sgw_true_done_latency_contract \
  --test sgw_true_done_signal_emission_contract --test sgw_wave2_contract_lock \
  --test sgw_wave2_format_snapshots --test sgw_wave2_p1_candle_intake --test sgw_wave2_p2_state_gateway \
  --test sgw_wave2_p3_signal_emission --test sgw_wave2_p4_token_engine \
  --test sgw_wave2_p5_runtime_health --test sgw_wave2_p6_legacy_deletion
```
Expected today: all GREEN except `sgw_true_done_actor_state` (6/7). After Phase 3: ALL GREEN.

---

## ⚠️ ENVIRONMENT GOTCHAS (read before doing anything — these bit the previous session)

1. **Edit/Write are PINNED to the harness's active worktree.** The session's primary working
   dir is `.claude/worktrees/mdp-candle-truth`. To edit files in the feature worktree you MUST
   `EnterWorktree({path: "/home/tefera/Desktop/bcb/.claude/worktrees/sgw-modularization-finish"})`
   first, or Edit/Write reject the path. Bash reaches any path; Edit/Write do not.
2. **Disk is chronically near-full (~few GB free on a 230G disk at 100%).** A second full
   `target/` (~3GB) can exhaust it; `cargo clippy --all-features` mid-build hit
   `No space left on device`. If you create a worktree, watch `df -h /home`. Regenerable
   `target/` caches of *other* worktrees are the safe thing to reclaim if needed.
3. **Subagents time out on long builds** ("Stream idle timeout") — an implementer running
   `cargo clippy --all-features` (2+ min) idled the stream and produced ZERO durable output.
   Mitigation used: implement directly (controller has full context), keep review finders
   **read-only** (no cargo) so they don't idle. Do the same.
4. **cargo runs auto-background.** Long `cargo` commands return a task-id and notify on
   completion; read the captured output file rather than re-running.
5. **Source-scan gate markers are brittle** — several gates read `.rs` as strings:
   - `sgw_true_done_actor_singleflight.rs` asserts `get_or_spawn` ordering
     (reserve < `redis_state.read().await` < `tokio::spawn`) and finds the fn end via the
     `\n    /// Garbage-collect` doc comment on `gc()`. Keep both.
   - `sgw_true_done_actor_state.rs` asserts the exact normalized text of the
     `should_materialize_missing_token_state_before_history_skip` let-binding + its `if`, AND
     that `.save_token_state(` appears ONLY in the 4-file allowlist
     (`actor.rs`, `signal_emission/effects.rs`, `state_gateway/token_state.rs`,
     `runtime/position_read_model.rs`).
   - `sgw_wave2_p4_token_engine.rs` asserts the actor `rx` field literally contains
     `mpsc::Receiver<crate::coordinator::ActorMessage>`.
6. **Metric-inventory snapshot lock:** ANY metric add/remove/label-change must re-seed
   `tests/snapshots/wave2/metrics_namespace_inventory.json` via
   `UPDATE_SNAPSHOTS=1 cargo test -p signal_generation_worker --test sgw_wave2_format_snapshots`,
   then verify the JSON git-diff is ONLY the intended change. (The previous session initially
   MISSED this and shipped a latent RED gate; caught + amended.) `extract_metric_inventory`
   source-scans `src/metrics.rs` + `src/phase3_metrics.rs` — keeping a metric *defined* keeps
   it in the inventory even if unused.

---

## "TRUE DONE" for Phase 0/1/2 — what's left and exact actions

Phases 0/1/2 are code/static-complete. To reach *true done* (the plan's exit-gate philosophy
+ repo CLAUDE.md: do NOT treat `/health` green or fake tests as the gate — the data plane is
the gate):

### A. Green the static ownership contract → **Phase 3 (P3)** — REQUIRED, do this FIRST
`sgw_true_done_actor_state` is the static fingerprint of "actor owns all per-mint token_state".
It is RED 6/7 until the lone offending write in `signal_emitter.rs` is relocated. Exact actions
(from the plan, P3):
1. In `src/runtime/position_read_model.rs` (already allowlisted; it owns
   `restore_token_state_from_open_position` and token_state↔PG reconciliation), add e.g.
   `pub(crate) async fn clear_phantom_token_state(mint, token_state, gateway)` containing the
   phantom-clear write currently at `src/signal_emitter.rs` (the SGW-TEW-002 path, ~`:491-513`,
   the `.save_token_state(` near the "Ownership: emit_exit only runs on the per-mint actor path"
   comment — that comment was updated in Phase 2).
2. In `src/signal_emitter.rs`, call the new function and REMOVE its `.save_token_state(`.
3. **DO NOT** move it to `signal_emission/effects.rs` (that file is insert-gated post-commit
   effects; the phantom-clear is a *no-insert suppression* path — wrong semantics).
   **DO NOT** widen the test allowlist (that rubber-stamps the bypass).
4. Exit: `sgw_true_done_actor_state` → **PASS 7/7**; ALL gates green; fmt + clippy clean.
- **Sequencing note from the plan:** relocation ONLY greens the static test; it is independent
  of the (already-landed) race fixes. After Phase 2 the phantom-clear is reachable only via the
  actor (sole owner), so P3 is test-cosmetic — but it MUST run to green the gate.

### B. Runtime-prove the race fixes → **Phase 5 (P4)** — REQUIRED for true-done, needs live stack
Static tests (unit + source-scan) cannot prove "self-heals on next candle". The plan's exit gate
is the **data-plane proof**. The scripts EXIST and are git-tracked (do NOT recreate them):
- `scripts/sgw_true_done_data_plane_proof.sh` (411 LOC)
- `scripts/sgw_true_done_recovery_proof.sh` (257 LOC)
They are NOT wired into any gate and have NOT been run against this build. Exact actions:
1. Add a `Makefile` target (e.g. `sgw-true-done-proof`) invoking both scripts with documented
   env (`SGW_CONTAINER`, `METRICS_URL`, `POSTGRES_*`, `REDIS_PASS`); reference it from
   `scripts/sgw_production_gate_check.sh`.
2. Build a fresh image from `bdcc911` (or `mdp-candle-v2-cutover` HEAD), deploy the live stack
   (Redis/PG/SGW), run the proof: signal-row growth, PEL non-growth, bounded replay-debt,
   in-contract latency, recovery. `tests/sgw_true_done_data_plane_proof_contract.rs` stays as
   the shape guard.
- Until B passes, P1/P2 are "merged + statically green" but not runtime-certified true-done.

> Bottom line: **A (Phase 3) is the immediate next step and is cheap + offline. B (Phase 5)
> is the real true-done runtime gate and needs infra.**

---

## Can the new session start Phase 3, 4, 5?

- **Phase 3 (P3): YES — start now.** The plan's hard precondition ("do not start before Phase 2
  is merged") is satisfied (Phase 2 is merged into `mdp-candle-v2-cutover` @ `bdcc911`). This is
  the recommended immediate next task; it greens `actor_state` → all gates green.
- **Phase 4 (cleanup): YES — independent, low-risk, can run anytime after Phase 2.** Exact actions:
  - `src/coordinator_tests.rs` → move to `tests/` ONLY if it compiles without loosening
    visibility (it may touch private items — if so, LEAVE it and document why).
  - `src/intake/` (`mod.rs` 8 LOC, `recovery.rs` 24 LOC) + `tests/sgw_phase3_intake.rs`: confirm
    its coverage is subsumed by `sgw_wave2_p1_candle_intake`, then delete BOTH together (one
    reviewable commit), OR keep both. (Only importer is `tests/sgw_phase3_intake.rs:15`.)
  - Delete or comment the unreachable `AckAuthority::drain()` block at
    `decision_loop.rs:201-205` (inside `#[allow(unreachable_code)]`). XACK is idempotent on
    redeliver, so abandoned waiters are harmless — cosmetic.
  - Each batch = one commit; build + all gates green after each.
- **Phase 5 (P4): NOT until a live stack is available.** It is the deploy-time gate (Redis/PG/SGW
  containers + image build). Do A and B-prep (Makefile wiring) offline, but the *run* needs infra.
- **Phase 6 (P5 ops):** after Phase 5 — roll the `bdcc911` image, then investigate the ACK-waiter
  concurrency ceiling (`sgw_ack_handler_saturated_total`) and `postgres_signal_insert_failed`
  on the NEW binary as a separate runtime task. Do NOT debug the old `orderflow-6cbea99` image.

**Recommended order for the new session:** Phase 3 → Phase 4 → (when infra available) Phase 5 → Phase 6.

---

## Workflow the previous session followed (continue it)
Per-task: implement → test/verify → `/code-review` (one read-only finder) → fix all findings →
re-verify → commit. After the tier: full-gate verify + whole-branch `/code-review` → merge.
- Use the `/code-review` skill (NOT Superpowers code/spec reviewers).
- Do NOT treat `/health` green, `18/18`, or fake tests as the gate (repo CLAUDE.md execution-gate
  policy). The data-plane proof is the gate.
- Commit messages end with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Branch is `mdp-candle-v2-cutover` (NOT `main`); the user merges feature branches into it.

---

## Cleanup items left for the user (not auto-done)
- The feature worktree `.claude/worktrees/sgw-modularization-finish` (~3GB `target/`) and its
  branch are now redundant (branch == `mdp-candle-v2-cutover`). Safe to
  `git worktree remove` + delete the branch + `git worktree prune` once you don't need the
  `.sdd/` reports. Frees disk (helpful given the disk pressure above).
- If continuing in the same repo, you may want to create a FRESH worktree for Phase 3/4 off
  `mdp-candle-v2-cutover` @ `bdcc911`, OR work directly in an existing worktree on that branch.

## Key file references
- `src/coordinator.rs` — registry, `ActorMessage` enum, `actor_generation`, `dispatch_with_ack`,
  `dispatch_time_stop_with_ack`, `restart_actor_registry`.
- `src/actor.rs` — `TokenActor`, `is_stale`/`terminate_stale`, `run()` Candle/TimeStop arms,
  `handle_candle` (3 save-site guards), `handle_time_stop`.
- `src/runtime/time_stop_sweep.rs` — `run_time_stop_sweep_once` (dispatch+await), `pub(crate)`
  signal builders reused by the actor.
- `src/signal_emitter.rs` — phantom-clear `save_token_state` (**Phase 3 target**, the actor_state offender).
- `src/runtime/position_read_model.rs` — Phase 3 destination for the relocated write.
- `tests/sgw_true_done_actor_state.rs` — the ownership-contract gate (greens after Phase 3).
- `scripts/sgw_true_done_data_plane_proof.sh`, `scripts/sgw_true_done_recovery_proof.sh` — Phase 5 proof.
