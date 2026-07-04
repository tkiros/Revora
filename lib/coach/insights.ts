import type { StoredCheck } from "../client/history-store";

/**
 * Rule-based insights (plan P3, F11). Pure rules over StoredCheck[] — no
 * model, no numbers, and forward-permission framing only: the insight always
 * points at the easiest next win, never back at a failure. Reused verbatim
 * by the server-side coach compute in 4C.
 */

export type CoachInsight = {
  id: "daypart" | "repeat_meal";
  text: string;
};

const MIN_CHECKS_FOR_INSIGHT = 5;
const MIN_CAREFUL_FOR_DAYPART = 3;
const MIN_REPEATS_FOR_MEAL = 3;

type Daypart = "breakfast" | "lunch" | "dinner";

export type InsightOptions = {
  // Hour extractor — defaults to the device-local hour; the server passes a
  // profile-timezone extractor (lib/coach/days.ts hourInTimezone) so dayparts
  // match what the user experienced.
  hourOf?: (createdAt: string) => number;
};

function daypartOf(createdAt: string, hourOf?: InsightOptions["hourOf"]): Daypart {
  const hour = hourOf ? hourOf(createdAt) : new Date(createdAt).getHours();
  if (hour < 11) {
    return "breakfast";
  }
  if (hour < 16) {
    return "lunch";
  }
  return "dinner";
}

export function deriveInsight(
  checks: StoredCheck[],
  options: InsightOptions = {}
): CoachInsight | null {
  if (checks.length < MIN_CHECKS_FOR_INSIGHT) {
    return null;
  }

  const daypart = deriveDaypartInsight(checks, options);
  if (daypart) {
    return daypart;
  }

  return deriveRepeatMealInsight(checks);
}

function deriveDaypartInsight(
  checks: StoredCheck[],
  options: InsightOptions
): CoachInsight | null {
  const careful = checks.filter(
    (check) => check.risk === "MODERATE" || check.risk === "HIGH"
  );

  if (careful.length < MIN_CAREFUL_FOR_DAYPART) {
    return null;
  }

  const counts = new Map<Daypart, number>();
  for (const check of careful) {
    const part = daypartOf(check.createdAt, options.hourOf);
    counts.set(part, (counts.get(part) ?? 0) + 1);
  }

  const [topPart, topCount] = [...counts.entries()].sort(
    (a, b) => b[1] - a[1]
  )[0];

  // Only speak when the pattern is a real majority, not noise.
  if (topCount < Math.ceil(careful.length / 2)) {
    return null;
  }

  return {
    id: "daypart",
    text: `Most of your 'be careful' meals are ${topPart} — that's where one swap helps most this week.`
  };
}

function deriveRepeatMealInsight(checks: StoredCheck[]): CoachInsight | null {
  const counts = new Map<string, number>();
  for (const check of checks) {
    const key = check.food.trim().toLowerCase();
    if (key.length === 0) {
      continue; // server rows carry no plaintext food — rule stays client-side
    }
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const repeated = [...counts.entries()]
    .filter(([, count]) => count >= MIN_REPEATS_FOR_MEAL)
    .sort((a, b) => b[1] - a[1])[0];

  if (!repeated) {
    return null;
  }

  return {
    id: "repeat_meal",
    text: `${capitalize(repeated[0])} is one of your go-to meals — a steady choice you already know makes the daily decision easy.`
  };
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
