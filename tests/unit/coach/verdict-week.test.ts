import { describe, expect, it } from "vitest";

import {
  dayKeyInTimezone,
  dayKeyLocal,
  verdictWeekView,
  type WeekRisk
} from "../../../lib/coach/days";

const NOW = new Date("2026-07-03T02:00:00.000Z");
const utc = dayKeyInTimezone("UTC");

function checkAt(iso: string, risk: WeekRisk) {
  return { createdAt: iso, risk };
}

describe("verdictWeekView", () => {
  it("returns seven unchecked days for empty input", () => {
    const days = verdictWeekView([], utc, NOW);

    expect(days).toHaveLength(7);
    expect(days.every((d) => d.checked === false && d.risk === undefined)).toBe(
      true
    );
    expect(days[6].key).toBe("2026-07-03");
    expect(days[0].key).toBe("2026-06-27");
  });

  it("tints a day by its most careful verdict (worst wins)", () => {
    const days = verdictWeekView(
      [
        checkAt("2026-07-02T08:00:00.000Z", "SAFE"),
        checkAt("2026-07-02T12:00:00.000Z", "HIGH"),
        checkAt("2026-07-02T19:00:00.000Z", "MODERATE"),
        checkAt("2026-07-01T12:00:00.000Z", "SAFE")
      ],
      utc,
      NOW
    );

    expect(days[5]).toEqual({ key: "2026-07-02", checked: true, risk: "HIGH" });
    expect(days[4]).toEqual({ key: "2026-07-01", checked: true, risk: "SAFE" });
    expect(days[6].checked).toBe(false);
  });

  it("buckets checks in the given timezone (boundary check lands on the right dot)", () => {
    // 02:00 UTC on the 3rd is still the evening of the 2nd in Denver.
    const check = [checkAt("2026-07-03T02:00:00.000Z", "MODERATE")];

    const utcDays = verdictWeekView(check, utc, NOW);
    expect(utcDays[6]).toEqual({
      key: "2026-07-03",
      checked: true,
      risk: "MODERATE"
    });

    const denver = dayKeyInTimezone("America/Denver");
    const denverDays = verdictWeekView(check, denver, NOW);
    expect(denverDays[6]).toEqual({
      key: "2026-07-02",
      checked: true,
      risk: "MODERATE"
    });
  });

  it("REGRESSION: matches the previous inline /history aggregation exactly", () => {
    // The rule that used to live inline in app/history/page.tsx:41-56.
    const RISK_RANK = { SAFE: 0, MODERATE: 1, HIGH: 2 } as const;
    function legacyStrip(
      recent: Array<{ createdAt: string; risk: WeekRisk }>,
      now: Date
    ) {
      const dayRisk = new Map<string, WeekRisk>();
      for (const check of recent) {
        const key = dayKeyLocal(new Date(check.createdAt));
        const prev = dayRisk.get(key);
        if (!prev || RISK_RANK[check.risk] > RISK_RANK[prev]) {
          dayRisk.set(key, check.risk);
        }
      }
      return Array.from({ length: 7 }, (_, offset) => {
        const day = new Date(now);
        day.setDate(day.getDate() - (6 - offset));
        const key = dayKeyLocal(day);
        return { key, checked: dayRisk.has(key), risk: dayRisk.get(key) };
      });
    }

    const fixture = [
      checkAt("2026-07-02T08:00:00.000Z", "SAFE"),
      checkAt("2026-07-02T21:30:00.000Z", "HIGH"),
      checkAt("2026-07-01T12:00:00.000Z", "MODERATE"),
      checkAt("2026-06-29T07:15:00.000Z", "SAFE"),
      checkAt("2026-06-20T07:15:00.000Z", "HIGH") // outside the window
    ];

    const shared = verdictWeekView(fixture, dayKeyLocal, NOW).map((d) => ({
      key: d.key,
      checked: d.checked,
      risk: d.risk
    }));

    expect(shared).toEqual(legacyStrip(fixture, NOW));
  });
});
