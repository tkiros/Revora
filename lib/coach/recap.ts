import type { LatestBai } from "./progress-state";

/**
 * RV-3: the non-scored weekly recap. Replaces the BAI band + percentage bars
 * with facts that cannot "decline" — counts stated in plain sentences, no
 * composite, no band words, no percentages. A more-confident user who checks
 * less must never read "progress declined" (C7 §5; DESIGN.md §Progress
 * surfaces, amended 2026-07-21). The bai_weekly pipeline still computes the
 * score for internal S2 measurement; it is simply never rendered.
 */

/** Exact inverse of adherence = round(min(1, days/7) * 100) for days 0..7. */
export function daysCheckedFrom(adherencePercent: number): number {
  return Math.min(7, Math.round((adherencePercent * 7) / 100));
}

/** How many prompted checks were followed through (inverse of action %). */
export function followThroughFrom(actionPercent: number, prompted: number): number {
  return Math.min(prompted, Math.round((actionPercent * prompted) / 100));
}

/** The recap's plain sentences, in render order. */
export function recapSentences(latest: LatestBai): string[] {
  const days = daysCheckedFrom(latest.adherence);
  const sentences: string[] = [];

  sentences.push(
    days === 0
      ? "A quiet week — no checks, and nothing counted against you."
      : days === 1
        ? "You checked in on 1 day last week."
        : `You checked in on ${days} of 7 days last week.`
  );

  if (latest.prompted > 0) {
    const followed = followThroughFrom(latest.action, latest.prompted);
    sentences.push(
      `When a check suggested a step, you followed through ${followed} of ${latest.prompted} times.`
    );
  } else {
    sentences.push("No meals needed a follow-up last week.");
  }

  return sentences;
}

/** The RV-3 posture line — the recap header's standing reassurance. */
export const RECAP_POSTURE_LINE =
  "Checking less as you get more confident is how this is meant to work.";
