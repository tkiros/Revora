/**
 * Day bucketing + streak math shared by the client store (local timezone)
 * and the server coach compute (profile timezone) — one rule set, unit-tested
 * once, parity by construction (plan 4C).
 */

export type DayKeyFn = (date: Date) => string;

export function dayKeyLocal(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function dayKeyInTimezone(timezone: string): DayKeyFn {
  const format = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return (date: Date) => format.format(date);
}

/**
 * Consecutive days with >=1 check, ending today (or yesterday when today has
 * no check yet — today isn't over).
 */
export function computeStreak(
  createdAts: Array<string | Date>,
  dayKey: DayKeyFn,
  now: Date = new Date()
): number {
  const dayKeys = new Set(
    createdAts.map((value) => dayKey(new Date(value)))
  );

  const cursor = new Date(now);
  if (!dayKeys.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (dayKeys.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/**
 * The Day-1 first-win gate (DESIGN.md §Day-1). Shows the calm acknowledgment
 * only on the user's first day, and only once they have a check today.
 * `streak === 1` means the streak is exactly one day long (the first day) —
 * not one check — so a second day (streak >= 2) never shows it, and a first
 * day with no check yet (checksToday === 0) stays quiet.
 */
export function showFirstWin(streak: number, checksToday: number): boolean {
  return streak === 1 && checksToday >= 1;
}

export function hourInTimezone(timezone: string): (date: Date) => number {
  const format = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    hour12: false
  });
  return (date: Date) => Number(format.format(date)) % 24;
}

export type WeekDay = { key: string; checked: boolean };

export type WeekRisk = "SAFE" | "MODERATE" | "HIGH";

export type VerdictWeekDay = {
  key: string;
  checked: boolean;
  /** The day's most careful verdict (worst-of-day); absent when unchecked. */
  risk?: WeekRisk;
};

const RISK_RANK: Record<WeekRisk, number> = { SAFE: 0, MODERATE: 1, HIGH: 2 };

/**
 * Last seven calendar days, oldest first, each carrying its most careful
 * verdict — the strip reads as information, not decoration (risk colors stay
 * semantic). Extracted from app/history/page.tsx so the dashboard (server,
 * profile timezone) and history (client, local timezone) share one rule.
 */
export function verdictWeekView(
  checks: Array<{ createdAt: string | Date; risk: WeekRisk }>,
  dayKey: DayKeyFn,
  now: Date = new Date()
): VerdictWeekDay[] {
  const dayRisk = new Map<string, WeekRisk>();
  for (const check of checks) {
    const key = dayKey(new Date(check.createdAt));
    const prev = dayRisk.get(key);
    if (!prev || RISK_RANK[check.risk] > RISK_RANK[prev]) {
      dayRisk.set(key, check.risk);
    }
  }

  return Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(now);
    day.setDate(day.getDate() - (6 - offset));
    const key = dayKey(day);
    const risk = dayRisk.get(key);
    return risk ? { key, checked: true, risk } : { key, checked: false };
  });
}

/** Last seven calendar days, oldest first. */
export function weekView(
  createdAts: Array<string | Date>,
  dayKey: DayKeyFn,
  now: Date = new Date()
): WeekDay[] {
  const checkedKeys = new Set(
    createdAts.map((value) => dayKey(new Date(value)))
  );

  return Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(now);
    day.setDate(day.getDate() - (6 - offset));
    const key = dayKey(day);
    return { key, checked: checkedKeys.has(key) };
  });
}
