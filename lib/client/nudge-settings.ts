/**
 * Nudge (daily reminder) settings apply-or-rollback reducer (U9).
 *
 * The account page updates a reminder field optimistically, then PATCHes it.
 * The three inline handlers (hour, cadence, quiet start/end) previously ignored
 * the PATCH result entirely — a failed save left the UI showing a setting that
 * never persisted, with no signal to the user (in contrast to `turnOffNudges`,
 * which already only commits on success). This is the honest reducer: keep the
 * optimistic `next` on success, roll back to `prior` on failure and flag it so
 * the page can surface a calm "couldn't save — try again" hint.
 *
 * Pure + colocated on the client seam so the rollback decision is unit-testable
 * without a jsdom/component harness (this repo has none).
 */

export type NudgeCadence = "daily" | "few_per_week" | "weekly";

export type NudgeSettings = {
  optIn: boolean;
  hour: number;
  cadence: NudgeCadence;
  quietStart: number | null;
  quietEnd: number | null;
};

export type NudgeSaveResolution = {
  nudge: NudgeSettings;
  failed: boolean;
};

export function resolveNudgeSave(
  prior: NudgeSettings,
  next: NudgeSettings,
  ok: boolean
): NudgeSaveResolution {
  return ok ? { nudge: next, failed: false } : { nudge: prior, failed: true };
}
