import {
  computeStreak,
  dayKeyInTimezone,
  hourInTimezone,
  weekView,
  type WeekDay
} from "./days";
import { deriveInsight, type CoachInsight } from "./insights";
import type { StoredCheck } from "../client/history-store";

/**
 * Server-side coach compute (plan 4C). Works on plaintext columns only
 * (createdAt, risk, actionDoneAt) — never decrypts. The same rule modules the
 * guest client uses, fed server rows, in the user's profile timezone.
 */

export type CoachCheckRow = {
  createdAt: Date;
  risk: "SAFE" | "MODERATE" | "HIGH";
  actionDoneAt: Date | null;
};

export type CoachView = {
  streak: number;
  weekView: WeekDay[];
  insight: CoachInsight | null;
};

export function computeCoachView(
  rows: CoachCheckRow[],
  timezone: string,
  now: Date = new Date()
): CoachView {
  const dayKey = dayKeyInTimezone(timezone);
  const hourOf = hourInTimezone(timezone);
  const dates = rows.map((row) => row.createdAt);

  // Feed the shared insight rules server rows (no plaintext food → the
  // repeat-meal rule stays client-side by design).
  const asStoredChecks: StoredCheck[] = rows.map((row, index) => ({
    clientId: String(index),
    food: "",
    risk: row.risk,
    a1cBand: "",
    inputMethod: "text",
    createdAt: row.createdAt.toISOString(),
    actionDoneAt: row.actionDoneAt?.toISOString()
  }));

  return {
    streak: computeStreak(dates, dayKey, now),
    weekView: weekView(dates, dayKey, now),
    insight: deriveInsight(asStoredChecks, {
      hourOf: (createdAt) => hourOf(new Date(createdAt))
    })
  };
}
