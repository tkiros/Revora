# Video Engine — Slice 1

Turns a weekly voice-of-customer (VOC) dump into compliance-linted short-form video specs,
plus a single `REVIEW.md` you approve or reject. Four agents run in sequence:
mine insights → generate angles/hooks → build specs → lint for compliance.

## Weekly run

1. **Paste the dump.** Drop this week's raw material (Reddit threads, support tickets,
   reviews, DMs) into:

   ```
   video-engine/input/<YYYY-MM-DD>-voc-dump.md
   ```

   Use the run date for `<YYYY-MM-DD>` (e.g. `2026-07-09-voc-dump.md`). The file must not
   be empty — the run aborts with a clear error if it's missing or blank.

2. **Run the batch.**

   ```bash
   npm run video-engine -- 2026-07-09
   ```

   The date argument is optional; omit it to default to today:

   ```bash
   npm run video-engine
   ```

   Outputs land in `video-engine/output/<date>/`:

   | File              | What it is                                              |
   | ----------------- | ------------------------------------------------------- |
   | `insights.json`   | Mined pain points / VOC insights                        |
   | `angles.json`     | Content angles                                          |
   | `hooks.json`      | Hooks (mechanism-based, tagged by framework and pillar) |
   | `specs.json`      | Video specs (spoken + visual hook, caption, format)     |
   | `compliance.json` | Per-spec linter reports (`hard_fail` / `flag` / `pass`) |
   | `REVIEW.md`       | The human review sheet — see below                      |

   The console prints a one-line summary, e.g. `2026-07-09: 6 specs, 1 bounced.`

3. **Review and commit — the commit is the audit trail.** Open
   `video-engine/output/<date>/REVIEW.md`. Under **To review**, each spec has:

   ```
   - [ ] approve `spec-id`   - [ ] reject `spec-id`
   ```

   Tick exactly one box per spec, then commit the file. **That commit is the compliance
   audit trail** — it records who approved which spec, when, and against which linter
   report. Advisory `⚠️ FLAG` notes appear inline; they inform your call but don't block.

4. **Fix bounced specs.** Anything that hard-failed the compliance linter is listed under
   the **Bounced — hard-fail, fix and re-run** section, with the offending rule and span.
   Bounced specs are not approvable. Fix the underlying prompt or the input dump, then
   re-run the batch for that date.

## Requirements

- The **`claude` CLI must be installed and authenticated** (Max plan). The engine drives it
  headlessly (`claude -p --output-format json`, prompt piped via STDIN).
- `VIDEO_ENGINE_MODEL` overrides the model, e.g.:

  ```bash
  VIDEO_ENGINE_MODEL=claude-opus-4-8 npm run video-engine -- 2026-07-09
  ```

  Unset, it uses the `claude` CLI default model.

## Deferred (not in Slice 1)

Slice 1 stops at reviewed, compliance-linted specs. Rendering, publishing, and metrics/
performance feedback are **Slices 2–3** and are intentionally not built here. There is also
no automated dump fetcher yet — you paste the VOC material in by hand.

## References

- [`docs/Revora_Video_Engine_Plan.md`](../docs/Revora_Video_Engine_Plan.md) — the full plan.
- [`docs/superpowers/specs/2026-07-09-video-engine-slice-1-design.md`](../docs/superpowers/specs/2026-07-09-video-engine-slice-1-design.md) — the Slice 1 design spec.
