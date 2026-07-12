import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  computeStreak,
  dayKeyInTimezone,
  dayKeyLocal,
  showFirstWin,
  weekView
} from "../../../lib/coach/days";
import { computeCoachView } from "../../../lib/coach/compute";
import { deriveInsight } from "../../../lib/coach/insights";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_LONGITUDINAL_INSIGHTS", "1");
});
import type { StoredCheck } from "../../../lib/client/history-store";

// 2026-07-03 02:00 UTC — evening of 07-02 in Denver, morning of 07-03 in UTC.
const NOW = new Date("2026-07-03T02:00:00.000Z");

function rowAt(iso: string, risk: "SAFE" | "MODERATE" | "HIGH" = "SAFE") {
  return { createdAt: new Date(iso), risk, actionDoneAt: null };
}

describe("timezone-correct day math", () => {
  it("buckets the same instant into different days by timezone", () => {
    const instant = new Date("2026-07-03T02:00:00.000Z");

    expect(dayKeyInTimezone("UTC")(instant)).toBe("2026-07-03");
    expect(dayKeyInTimezone("America/Denver")(instant)).toBe("2026-07-02");
  });

  it("streak differs correctly across timezones for boundary checks", () => {
    // Checks at 02:00 UTC on the 2nd and 3rd: two UTC days, but in Denver
    // they are the evenings of the 1st and 2nd.
    const rows = [
      rowAt("2026-07-02T02:00:00.000Z"),
      rowAt("2026-07-03T02:00:00.000Z")
    ];
    const dates = rows.map((row) => row.createdAt);

    expect(computeStreak(dates, dayKeyInTimezone("UTC"), NOW)).toBe(2);
    // Denver "today" is 07-02; checked 07-01 and 07-02 → streak 2 as well
    expect(computeStreak(dates, dayKeyInTimezone("America/Denver"), NOW)).toBe(2);

    // Tokyo (UTC+9): checks land on 07-02 11:00 and 07-03 11:00; "now" is
    // 07-03 11:00 → streak 2. Add a gap case: only the older check.
    expect(
      computeStreak(
        [dates[0]],
        dayKeyInTimezone("Asia/Tokyo"),
        NOW
      )
    ).toBe(1);
  });

  it("weekView returns seven days, oldest first, flagged correctly", () => {
    const tz = dayKeyInTimezone("UTC");
    const days = weekView(
      [new Date("2026-07-03T01:00:00.000Z"), new Date("2026-07-01T01:00:00.000Z")],
      tz,
      NOW
    );

    expect(days).toHaveLength(7);
    expect(days[6]).toEqual({ key: "2026-07-03", checked: true });
    expect(days[4]).toEqual({ key: "2026-07-01", checked: true });
    expect(days[5]).toEqual({ key: "2026-07-02", checked: false });
  });
});

describe("showFirstWin (Day-1 first-win gate)", () => {
  it("shows on the first day once there is a check today", () => {
    // streak === 1 means the streak is exactly one day long (the first day),
    // and today has at least one check.
    expect(showFirstWin(1, 1)).toBe(true);
    expect(showFirstWin(1, 3)).toBe(true);
  });

  it("does not show past the first day", () => {
    expect(showFirstWin(2, 1)).toBe(false);
    expect(showFirstWin(7, 5)).toBe(false);
  });

  it("does not show on the first day with no check today", () => {
    // streak can be 1 counting yesterday when today is still empty.
    expect(showFirstWin(1, 0)).toBe(false);
    expect(showFirstWin(0, 0)).toBe(false);
  });
});

describe("computeCoachView", () => {
  it("computes streak, week view, and the daypart insight from plaintext rows", () => {
    const rows = [
      rowAt("2026-07-03T00:30:00.000Z", "MODERATE"), // UTC breakfastless: 00:30 → breakfast bucket? hour 0 <11 → breakfast
      rowAt("2026-07-02T08:00:00.000Z", "HIGH"),
      rowAt("2026-07-01T09:00:00.000Z", "MODERATE"),
      rowAt("2026-06-30T13:00:00.000Z", "SAFE"),
      rowAt("2026-06-29T19:00:00.000Z", "SAFE")
    ];

    const view = computeCoachView(rows, "UTC", NOW);

    expect(view.streak).toBeGreaterThanOrEqual(1);
    expect(view.weekView).toHaveLength(7);
    expect(view.insight?.id).toBe("daypart");
  });

  it("returns a null insight under five checks", () => {
    const view = computeCoachView(
      [rowAt("2026-07-03T00:30:00.000Z", "HIGH")],
      "UTC",
      NOW
    );

    expect(view.insight).toBeNull();
  });
});

describe("guest/server parity", () => {
  it("the same checks give the same streak through the client store math and server compute", () => {
    const isoDates = [
      "2026-07-02T15:00:00.000Z",
      "2026-07-01T15:00:00.000Z",
      "2026-06-30T15:00:00.000Z"
    ];

    const clientStreak = computeStreak(isoDates, dayKeyLocal, NOW);
    const serverStreak = computeStreak(
      isoDates.map((iso) => new Date(iso)),
      dayKeyInTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone),
      NOW
    );

    expect(serverStreak).toBe(clientStreak);
  });

  it("the daypart insight is identical whether fed local StoredChecks or server rows", () => {
    const mk = (iso: string, risk: "SAFE" | "MODERATE" | "HIGH"): StoredCheck => ({
      clientId: iso,
      food: "some meal",
      risk,
      a1cBand: "prediabetes_60_62",
      inputMethod: "text",
      createdAt: iso
    });
    const isoRows: Array<[string, "SAFE" | "MODERATE" | "HIGH"]> = [
      ["2026-07-02T08:00:00.000Z", "MODERATE"],
      ["2026-07-01T08:30:00.000Z", "HIGH"],
      ["2026-06-30T07:45:00.000Z", "MODERATE"],
      ["2026-06-30T13:00:00.000Z", "SAFE"],
      ["2026-06-29T19:00:00.000Z", "SAFE"]
    ];

    const local = deriveInsight(isoRows.map(([iso, risk]) => mk(iso, risk)));
    const server = computeCoachView(
      isoRows.map(([iso, risk]) => rowAt(iso, risk)),
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      NOW
    ).insight;

    expect(server?.id).toBe(local?.id);
    expect(server?.text).toBe(local?.text);
  });
});
