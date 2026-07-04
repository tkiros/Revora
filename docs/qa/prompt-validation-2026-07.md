# Prompt validation — 2026-07

Evidence record for WS4 tasks 4.1 (Revora judge prompt) and 4.2 (Pantry extraction
prompt). This scaffold captures the offline-gate evidence the agent can produce now
plus the exact commands and empty result tables for the live gates. Live rows are
**BLOCKED-ON-HUMAN**: they need the founder's `OPENAI_API_KEY`, labeled photos
(Appendix A H6), and a deployed preview (Appendix A H13). The agent must NOT run
live-model commands (they spend money); the human runs them and the agent records
the numbers.

Offline-gate evidence below was recorded on **2026-07-04** at commit **cdc4c28**
(branch `launch-hardening`), runner: **agent (offline, no key)**.

---

## 1. Revora judge (lib/revora/prompt.ts) — model: gpt-5.4-mini

> Model source: `DEFAULT_REVORA_MODEL = "gpt-5.4-mini"` in `lib/revora/openai-client.ts`.

### Offline gate (recorded now — must be green before spending)

```bash
npm run eval:revora            # mock gate — must be green before spending
```

Recorded output (2026-07-04, commit cdc4c28):

```
> vitest run tests/evals/revora-safety-eval.test.ts
 Test Files  1 passed (1)
      Tests  8 passed (8)
```

**Status: PASS (offline).** The mock safety gate is green, so the live spend is
authorized to proceed. This does NOT satisfy the live harmful-SAFE target below.

### Live gate — BLOCKED-ON-HUMAN

Command the founder runs (needs the key; the agent then records the numbers):

```bash
OPENAI_API_KEY=<key> npm run eval:revora:live
```

`eval:revora:live` self-reports `SETUP_BLOCKED` without `OPENAI_API_KEY` — that is
the human-handoff signal (Appendix A H6). The consistency-check row additionally
needs a deployed preview URL (Appendix A H13).

Run date: **____** · Commit: **____** · Runner: **____**

| Gate | Target | Measured | Pass | Status |
|---|---|---|---|---|
| Harmful-SAFE (labeled + adversarial) | **0, always** | ____ | ☐ | BLOCKED-ON-HUMAN |
| Risk-class accuracy | ≥ the graded suite's threshold (see `tests/evals/revora-graded-eval.test.ts`) | ____ | ☐ | BLOCKED-ON-HUMAN |
| Usefulness (reason/adjustment/swap quality) | pass per rubric (`lib/revora/eval-rubric.ts`) | ____ | ☐ | BLOCKED-ON-HUMAN |
| Consistency flip-rate (`scripts/consistency-check.mjs` `--n 50`, against preview) | ≥95% modal class | ____ | ☐ | BLOCKED-ON-HUMAN (needs preview, H13) |

Consistency-check command (founder, after preview deploy):

```bash
node scripts/consistency-check.mjs --url https://<preview-url> \
  --food "grilled chicken with rice and vegetables" --a1c 6.1 --n 50
```

**Verdict:** KEEP AS-IS / IMPROVE — ____________________
If IMPROVE: exact change proposed: ____________________
Eval delta required before shipping the change: rerun both gates above; all
targets must hold, harmful-SAFE stays 0. Delta table: ____

---

## 2. Pantry extraction (lib/pantry/extract.ts EXTRACT_PROMPT) — model: gpt-5.4-mini

> Model source: `DEFAULT_VISION_MODEL = "gpt-5.4-mini"` in `lib/pantry/extract.ts`,
> overridable via `REVORA_VISION_MODEL` (extraction only — the judge model is
> untouched, locked decision 1). If the vision probe fails on `gpt-5.4-mini`, the
> chosen sibling model is recorded here: **____**.

### Offline / skip-path gate (recorded now)

```bash
npm run eval:pantry-extract    # skip path when the key/photos/flag are absent
```

Recorded output (2026-07-04, commit cdc4c28, no key / no `REVORA_LIVE_EVAL` / no photos):

```
> vitest run tests/evals/pantry-extract-eval.test.ts
 Test Files  1 passed (1)
      Tests  1 passed | 1 skipped (2)

SETUP_BLOCKED: eval:pantry-extract needs (1) REVORA_LIVE_EVAL=1,
(2) OPENAI_API_KEY, (3) 8-10 founder photos in tests/fixtures/pantry-photos/
with an exhaustive labels.json (see labels.example.json). Skipping.
 ↓ eval:pantry-extract (live) > meets the recall floor with zero hallucinations
 ✓ eval:pantry-extract (setup) > explains what is missing
```

**Status: SKIP PATH VERIFIED (offline).** The setup guard fires correctly and the
live case skips cleanly. `tests/fixtures/pantry-photos/` currently holds only
`labels.example.json` — the real fixtures are the human handoff.

### Live gate — BLOCKED-ON-HUMAN

Step A — human supplies fixtures (Appendix A H6): 8–10 founder pantry/fridge photos
into `tests/fixtures/pantry-photos/`, exhaustively labeled in `labels.json` (mirror
the shape of `labels.example.json`).

Step B — commands the founder runs (probe first, then the eval):

```bash
OPENAI_API_KEY=<key> node scripts/verify-vision-model.mjs
OPENAI_API_KEY=<key> REVORA_LIVE_EVAL=1 npm run eval:pantry-extract
```

If the probe fails on `gpt-5.4-mini`: set `REVORA_VISION_MODEL` to a vision-capable
sibling (extraction only), record the choice in the model note above, re-run.

Run date: **____** · Commit: **____** · Photos: **__** founder photos, labels.json rev **____**

| Gate | Target | Measured | Pass | Status |
|---|---|---|---|---|
| Item recall (all photos) | **≥ 0.70** | ____ | ☐ | BLOCKED-ON-HUMAN |
| Hallucinated items | **0** | ____ | ☐ | BLOCKED-ON-HUMAN |
| Vision-model probe (`scripts/verify-vision-model.mjs`) | OK on gpt-5.4-mini (or `REVORA_VISION_MODEL` recorded above) | ____ | ☐ | BLOCKED-ON-HUMAN |

Per-photo table (paste the eval's console output): ____

**Verdict:** KEEP AS-IS / IMPROVE — ____________________
If IMPROVE: exact change + rerun delta: ____________________
Post-launch real metric: buyer edit-rate on the confirm screen (first 10 orders).

### Day-8 manual-transcription fallback (Task 4.2 verification line)

If the extraction gate (recall ≥0.70, hallucinations=0) cannot be met by **day 8 of
the build cap**, the automated-vision path does NOT ship. Instead the
**manual-transcription fallback** ships (design guardrail 1): the `/admin/pantry`
**mark-manual** flow is the fulfillment path, and a human transcribes the pantry
photo into items. This is a shippable outcome, not a blocker — record it here as the
verdict if the gate fails or stays BLOCKED past day 8.

---

## Commit / recording protocol

- Section 1 live numbers: `git add docs/qa/prompt-validation-2026-07.md` then
  commit `docs(qa): prompt validation record — revora judge live numbers (WS4)`.
- Section 2 live numbers: `git add docs/qa/prompt-validation-2026-07.md tests/fixtures/pantry-photos/labels.json`
  then commit `docs(qa): pantry extraction eval numbers + verdict (WS4)`.
- Do NOT commit the founder's photos if they prefer them private — `labels.json` +
  the recorded numbers are the record; note the photos' location instead.
- Verification bar: real numbers and a ticked verdict, not "looks fine".
