# Slice 1 — "The Script Factory" — Design Spec

**Date:** 2026-07-09
**Parent plan:** `docs/Revora_Video_Engine_Plan.md` (§11 Slice 1, §15 lean build path)
**Subordinate to:** `docs/safety/claims-boundary.md`, `docs/safety/copy-ledger.md`, and the §3.2 compliance pre-flight in `docs/Revora_90-Day_Distribution_Strategy.md`. When they disagree, they win.
**Status:** design approved; ready for implementation plan.

---

## 1. Purpose & scope

Slice 1 is everything **up to the render**: turn a weekly voice-of-customer (VOC) dump into
compliance-pre-checked video scripts, so the founder's hook/script prep drops from ~hours to
~minutes/week with **zero §3.2 violations reaching a published asset**. No rendering, no
publishing, no metrics — the founder still shoots/edits per the 90-day plan, but hooks, specs,
caption text, and compliance flags arrive done.

**Pipeline:** `dump[] → A1 insights → A2 angles+hooks → A3 specs → A4 lint → REVIEW.md (G1)`.

Four agents, each a single prompted LLM call with a typed (zod) output:

- **A1 Research Miner** — normalized dump → `Insight[]`
- **A2 Angle & Hook Strategist** — `Insight[]` → `Angle[]` + `Hook[]`
- **A3 Spec Builder** — `Hook` → `VideoSpec`
- **A4 Compliance Linter** — `VideoSpec` → `ComplianceReport` (deterministic regex + LLM pass)

### Explicitly out of scope (deferred, not this slice)
- Renderer / TTS / captions / per-platform crops / disclosure render-layer — **Slice 2**.
- Metrics ingestion / A5 Pattern Analyst / experiment table / publishing — **Slice 3**.
- **Reddit API fetcher** — a clean seam is left (A1 consumes a normalized `dump[]`), but only the
  paste path is built.
- **M2 embedding-similarity / repetition check** — deferred: there is no 30-day history to compare
  against on the first batches. Add when history exists (YAGNI until it hurts). `Hook` keeps the
  `similarity_max_30d` field nullable so nothing has to change later.

## 2. Key decisions (locked during brainstorming)

1. **State store + G1 review surface = in-repo JSON + a generated `REVIEW.md`.** Git history is the
   append-only `compliance_rev` audit trail for free (§9 requires it kept forever as the defense
   file). No Google Sheet, no Postgres, no UI to build for Slice 1. Migrate the JSON to Postgres in
   Slice 3 *if* status-driven automation needs it.
2. **A1 input = a normalized `dump[]`.** Paste path built now (`/video-engine/input/<date>-voc-dump.md`);
   Reddit fetcher is a later drop-in behind the same `dump[]` shape.
3. **LLM backend = Claude Code headless** (`claude -p --output-format json`) on the existing Max
   subscription. $0 marginal cost, no new key. Schema safety via zod-parse + one retry on miss.
   `llm.ts` is a one-interface adapter with this single implementation — the other backends
   (OpenAI/Anthropic API) are not built.
4. **A4 is the spine — build it first.** It reuses the existing `loadSafetyContract()` +
   `tests/fixtures/safety-contract.json` regexes. Highest risk-reduction, lowest effort.
5. **The linter is advisory; G1 (the human) decides.** Only hard-fail families bounce a spec before
   it reaches the human.

## 3. File layout

```
/video-engine
  config.ts      # model id, paths, brand constants (the "setup node" — one place for all config)
  schema.ts      # zod schemas = §9 entities (Insight, Angle, Hook, VideoSpec, ComplianceReport)
  llm.ts         # adapter: prompt + zod schema -> validated object, via `claude -p`
  store.ts       # JSON read/write under output/<date>/, load input dump, render REVIEW.md
  agents.ts      # miner / hooks / spec / linter — each = load prompt + one llm() call
  linter.ts      # A4 deterministic pass (reuses loadSafetyContract) + hard-fail/flag mapping
  run.ts         # CLI batch: dump -> insights -> hooks -> specs -> lint -> write + REVIEW.md
  /prompts       # a1-miner.md  a2-hooks.md  a3-spec.md  a4-linter.md  (versioned, reviewed like copy)
  /input         # <date>-voc-dump.md  (weekly paste target — kept in git for provenance)
  /output/<date> # insights.json angles.json hooks.json specs.json compliance.json REVIEW.md
```

Collapsed from the plan's per-agent files (§15.4): the agent *code* is trivial glue and lives in
one `agents.ts`; the **prompts** are the governance layer and stay as separate versioned `.md`
files (`§4 rule 3`). `linter.ts` is split out from `agents.ts` because the deterministic pass is
real logic with its own test.

**Running it:** a `package.json` script, e.g. `"video-engine": "node --experimental-strip-types video-engine/run.ts <command>"`
(Node 24 strips TS natively; `tsx` is the fallback if that misbehaves). Commands: `run <date>`
(default = today) walks the whole batch; the seam for `fetch` (Reddit) is left unimplemented.

## 4. The LLM adapter (`llm.ts`)

```
llm(promptText, zodSchema) -> Promise<T>
```

1. Spawn `claude -p --output-format json` (child_process) and write `promptText` to its **stdin** —
   never pass the prompt (which includes the full VOC dump) as an argv argument; a large dump would
   exceed the OS `ARG_MAX` limit. Optionally `--model`.
2. Parse the CLI's JSON envelope, take the result text.
3. Extract the JSON object the prompt asked for (the prompt instructs "output ONLY valid JSON
   matching this shape"), `zodSchema.parse()` it.
4. On parse/validation failure: retry **once** with an appended "your last output was invalid JSON,
   return only the object" instruction. On a second failure, throw — the batch surfaces the failing
   stage (dead-letter visibility, §3-M7). No silent drops.

Every prompt file embeds its output shape as an explicit JSON contract so the model has the schema
in-context (Claude Code print mode has no native tool-forced structured output).

## 5. The A4 linter (`linter.ts` + `agents.ts` linter) — two layers

### Layer 1 — deterministic (blocks or flags before any human sees it)
Runs the `loadSafetyContract().fixture` regexes over **every** text field of the spec: spoken hook,
visual text, every VO beat, caption text, on-screen text, disclosure block.

**HARD-FAIL** (spec never reaches `REVIEW.md`; bounces to A3 with the offending span + rule named):
- From `forbiddenClaims`: `diagnosis`, `cure`, `reversal`, `fda approval`, `unsupported clinical proof`.
- All of `forbiddenPredictions` (future-A1C, glucose-curve, mg/dL spike, exact GI, exact GL).
- All of `qualitativeOnly.forbiddenPatterns` (exact numbers).
- **Video-specific forbidden-hook families (§6.1)** — added here as a small local list in
  `linter.ts` because the fixture is product-copy-tuned and lacks them:
  - polarizing / taboo / shock-value openers,
  - fear / urgency / implied-danger / countdown pattern-interrupts,
  - dramatic-results / testimonial hooks ("this fixed my A1C").

**FLAG** (surfaces in `REVIEW.md`, does *not* block — avoids false-positive hard-fails on innocent
marketing usage): the softer `forbiddenClaims` regexes `treatment` (`\btreat...\b` → "treat
yourself") and `prevention` (`\bprevent...\b`). The human judges these at G1.

### Layer 2 — LLM (advisory)
`a4-linter.md` embeds `claims-boundary.md` + the §6.1 forbidden-hook table + the allowed claim
classes. It flags subtler violations the regex misses, quotes the offending span, and proposes a
compliant rewrite. Output merges into the same `ComplianceReport`. **Advisory only.**

### Output — `ComplianceReport`
```
{ id, spec_id, verdict: "hard_fail" | "flag" | "pass",
  items: [{ layer: "regex"|"llm", severity: "hard_fail"|"flag", rule, span, suggestion? }],
  ts }
```
A spec with any `hard_fail` item does not appear in `REVIEW.md`'s approve list; it appears in a
"bounced — fix and re-run" section with the named violations.

## 6. Data model (`schema.ts`) — the §9 schema as zod

```
Insight   { id, verbatim, source_url, theme, pillar, freq_count, status }
Angle     { id, insight_ids[], premise, enemy, persona, status }
Hook      { id, angle_id, spoken_text, visual_text (<=7 words), framework_tag, cta_type,
            pillar, similarity_max_30d: number|null, status }
VideoSpec { id, hook_id, format, beats[], asset_list[], caption_text, disclosure_block,
            claims_used[], duration_s, status }
ComplianceReport (see §5)
```

- `visual_text` is validated `<= 7 words` (quality floor, §10).
- `duration_s` is validated within the format's band (§6.1): check-demo 15–25, myth/label-trap
  20–30, slideshow 20–30, food 15–25. (Founder-face P5 is out of engine scope.)
- `disclosure_block` is required (non-empty) whenever `claims_used` is non-empty.
- `status` enums follow §9 (`DRAFT→APPROVED→...`), but Slice 1 only sets the early states.

## 7. A2 hook generation — mechanisms, not tones

`a2-hooks.md` embeds the swipe-file **mechanisms** distilled from
`docs/superpowers/plans/video_hooks_scripts_ideas.md`: scenario injection, curiosity gap,
attention anchor, STI visual-text hook (3–7 words, trigger words, borrowed-interest/preview/
before-after image), curiosity reloops (missing-piece / escalation / method), context-lean →
scroll-stop → contrarian-snapback, CTA-after-value placement. Each `Hook` carries a
`framework_tag` naming the mechanism used.

The prompt hard-bans importing a viral pattern's *aggression*: no polarizing/taboo, no
fear/urgency, no dramatic-results. For this ICP (the scared, recently-diagnosed searcher) the
persuasion is **curiosity + relief + specificity, not shock**. A4 enforces this; A2 is told it
up front so hard-fails are rare.

## 8. Testing (ponytail: one runnable check on the security path)

A vitest test on the **linter** — the only non-trivial, security-critical logic in the slice:
- The fixture already ships an `example` string for every banned family → feed each, assert the
  correct span is caught at the correct severity (`hard_fail` for the fatal set, `flag` for
  treatment/prevention).
- Feed one example per §6.1 forbidden-hook family → assert `hard_fail`.
- Feed a clean, approved-ledger-style spec (e.g. built from `result-safe-example` phrasing) →
  assert `pass`.

No framework beyond the existing vitest setup; no live LLM call in the test (Layer 1 is
deterministic and tested in isolation; Layer 2 is advisory and not unit-tested).

## 9. Value test (from plan §11)

Hook/script prep time drops from ~hours to ~minutes/week, with zero §3.2 violations reaching a
published asset. If A2's hooks lose to hand-written hooks in the W4 tournament, fix the prompt
before building Slice 2.

## 10. Risks carried into implementation

- **False-positive hard-fails** blocking legit copy → mitigated by the hard-fail/flag split (§5);
  treatment/prevention are flags, not blocks.
- **Claude Code JSON drift** (print-mode output shape changes) → the envelope parse + zod-parse +
  single retry + throw-on-second-failure keeps failures loud, not silent.
- **Claims-boundary drift** → `a4-linter.md` embeds the doc; when the boundary changes, the prompt
  changes in the same PR (§4 rule 3). Layer 1 always reads the live fixture.
```
