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

export type WeekDay = { key: string; checked: boolean };

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
