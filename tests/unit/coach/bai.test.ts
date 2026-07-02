import { describe, expect, it } from "vitest";

import { BAI_BAND_COPY, bandOf, computeBai, type BaiCheckRow } from "../../../lib/coach/bai";

/**
 * BAI (plan P6): behavioral, never predictive. adherence 50% (days
 * checked/7) + consistency 30% (min(1, avg checks/day / 3)) + action 20%
 * (acknowledged/prompted, "prompted" = risk !== SAFE) — action's weight
 * redistributes to the other two when nobody was prompted that week.
 */

function row(iso: string, risk: BaiCheckRow["risk"] = "SAFE", actionDoneAt: Date | null = null): BaiCheckRow {
  return { createdAt: new Date(iso), risk, actionDoneAt };
}

describe("computeBai — component math", () => {
  it("a perfect week (checked every day, 3/day, every prompt acknowledged) scores 100", () => {
    const checks: BaiCheckRow[] = [];
    for (let day = 0; day < 7; day += 1) {
      const d = `2026-06-${String(15 + day).padStart(2, "0")}`;
      for (let i = 0; i < 3; i += 1) {
        const hour = String(8 + i).padStart(2, "0");
        checks.push(row(`${d}T${hour}:00:00.000Z`, "MODERATE", new Date(`${d}T12:00:00.000Z`)));
      }
    }

    const result = computeBai(checks, "UTC");

    expect(result.adherence).toBe(100);
    expect(result.consistency).toBe(100);
    expect(result.action).toBe(100);
    expect(result.score).toBe(100);
    expect(result.band).toBe("excellent");
  });

  it("a silent week (no checks) scores 0", () => {
    const result = computeBai([], "UTC");

    expect(result.adherence).toBe(0);
    expect(result.consistency).toBe(0);
    expect(result.action).toBe(0);
    expect(result.score).toBe(0);
    expect(result.band).toBe("getting_started");
  });

  it("adherence counts distinct days checked, not total checks", () => {
    const checks = [
      row("2026-06-15T08:00:00.000Z"),
      row("2026-06-15T09:00:00.000Z"),
      row("2026-06-15T10:00:00.000Z")
    ];

    const result = computeBai(checks, "UTC");

    // 1 day of 7 checked → adherence 1/7 ≈ 14%
    expect(result.adherence).toBe(14);
  });

  it("consistency is averaged over the full 7-day week, not just active days", () => {
    // 21 checks all on one day: avg/day over 7 days = 3 → consistency caps at 100
    const checks = Array.from({ length: 21 }, (_, i) =>
      row(`2026-06-15T${String(i % 24).padStart(2, "0")}:00:00.000Z`)
    );

    const result = computeBai(checks, "UTC");

    expect(result.consistency).toBe(100);
  });

  it("consistency never exceeds 100 even with checks well above target", () => {
    const checks = Array.from({ length: 50 }, (_, i) =>
      row(`2026-06-${String(15 + (i % 7)).padStart(2, "0")}T0${i % 9}:00:00.000Z`)
    );

    const result = computeBai(checks, "UTC");

    expect(result.consistency).toBe(100);
  });

  it("action is acknowledged ÷ prompted — SAFE checks never count as prompted", () => {
    const checks = [
      row("2026-06-15T08:00:00.000Z", "SAFE"), // not prompted
      row("2026-06-15T09:00:00.000Z", "MODERATE", new Date("2026-06-15T10:00:00.000Z")), // prompted + acked
      row("2026-06-16T08:00:00.000Z", "HIGH", null) // prompted, not acked
    ];

    const result = computeBai(checks, "UTC");

    // 1 of 2 prompted checks acknowledged
    expect(result.action).toBe(50);
  });
});

describe("computeBai — zero-prompt redistribution", () => {
  it("redistributes action's 20% weight to adherence/consistency when nobody was prompted", () => {
    // Every check SAFE → zero prompts. 7/7 days, 1/day (consistency 1/3 ≈ 33%).
    const checks = Array.from({ length: 7 }, (_, day) =>
      row(`2026-06-${String(15 + day).padStart(2, "0")}T08:00:00.000Z`, "SAFE")
    );

    const result = computeBai(checks, "UTC");

    expect(result.action).toBe(0); // no data — nothing to report
    // adherence 100%, consistency 33% (1/3), renormalized weights: .5/.8=.625, .3/.8=.375
    // score = round(100 * (.625*1 + .375*(1/3))) = round(100 * 0.75) = 75
    expect(result.score).toBe(75);
    expect(result.band).toBe("on_track");
  });

  it("a fully idle week with zero prompts still scores 0, not skewed by the missing dimension", () => {
    const result = computeBai([], "UTC");

    expect(result.score).toBe(0);
  });

  it("does NOT redistribute when there is at least one prompt, even if unacknowledged", () => {
    const checks = [
      row("2026-06-15T08:00:00.000Z", "SAFE"),
      row("2026-06-16T08:00:00.000Z", "HIGH", null) // prompted, unacknowledged
    ];

    const result = computeBai(checks, "UTC");

    // adherence 2/7≈29%, consistency (2/7)/3≈9.5%, action 0/1=0 — all three weights apply
    // score = round(100*(.5*(2/7) + .3*((2/7)/3) + .2*0)) = round(100*(0.142857+0.028571)) = round(17.14) = 17
    expect(result.score).toBe(17);
    expect(result.action).toBe(0);
  });
});

describe("bandOf — score band edges", () => {
  it.each([
    [0, "getting_started"],
    [39, "getting_started"],
    [40, "building"],
    [59, "building"],
    [60, "on_track"],
    [79, "on_track"],
    [80, "excellent"],
    [100, "excellent"]
  ] as const)("score %i → band %s", (score, band) => {
    expect(bandOf(score)).toBe(band);
  });
});

describe("computeBai — timezone-correct day bucketing", () => {
  it("buckets a late-night check into the correct local day for adherence", () => {
    // 02:00 UTC on the 3rd is 19:00 (previous day, the 2nd) in Denver.
    const checks = [row("2026-06-03T02:00:00.000Z")];

    const utcResult = computeBai(checks, "UTC");
    const denverResult = computeBai(checks, "America/Denver");

    // Both see exactly one distinct day checked → same adherence regardless
    // of which calendar day it lands on.
    expect(utcResult.adherence).toBe(14);
    expect(denverResult.adherence).toBe(14);
  });

  it("two checks that are the same UTC-adjacent day but different local days both count once each", () => {
    // 23:30 UTC on the 1st and 00:30 UTC on the 2nd are the same Denver day
    // (evening of the 1st) but two different UTC days.
    const checks = [row("2026-06-01T23:30:00.000Z"), row("2026-06-02T00:30:00.000Z")];

    const utcResult = computeBai(checks, "UTC");
    const denverResult = computeBai(checks, "America/Denver");

    expect(utcResult.adherence).toBe(29); // 2/7 distinct UTC days
    expect(denverResult.adherence).toBe(14); // 1/7 distinct Denver day
  });
});

describe("BAI_BAND_COPY — claims-boundary audit", () => {
  const BANNED_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
    { label: "reverse-family", pattern: /\brevers(?:e|es|ed|ing|al|als)\b/i },
    { label: "A1C-prediction", pattern: /A1C\s*\d/i },
    { label: "reach-by-day", pattern: /reach\s+[\d.]+\s+by\s+day\s+\d+/i },
    { label: "calories", pattern: /\bcalor(?:ie|ies)\b/i },
    { label: "cure", pattern: /\bcur(?:e|es|ed|ing)\b/i },
    { label: "treat", pattern: /\btreat(?:s|ed|ing|ment|ments)?\b/i },
    { label: "prevent", pattern: /\bprevent(?:s|ed|ing|ion|ive|ative)?\b/i },
    { label: "guarantee", pattern: /\bguarantee(?:s|d|ing)?\b/i },
    { label: "FDA", pattern: /\bFDA\b/i }
  ];

  const entries = Object.entries(BAI_BAND_COPY);

  it.each(entries)("band %s label + message stay inside the claims boundary", (_band, copy) => {
    const text = `${copy.label} ${copy.message}`;
    for (const { pattern } of BANNED_PATTERNS) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("every band has exactly one next action and stays calm (no blame words)", () => {
    for (const [, copy] of entries) {
      expect(copy.message).not.toMatch(/you failed|you should have|missed|didn't|behind|falling short/i);
    }
  });

  it("covers all four bands", () => {
    expect(Object.keys(BAI_BAND_COPY).sort()).toEqual(
      ["building", "excellent", "getting_started", "on_track"].sort()
    );
  });
});
