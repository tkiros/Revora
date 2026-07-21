import { describe, expect, it } from "vitest";

import {
  daysCheckedFrom,
  followThroughFrom,
  RECAP_POSTURE_LINE,
  recapSentences
} from "../../../lib/coach/recap";
import type { LatestBai } from "../../../lib/coach/progress-state";

/**
 * RV-3: the non-scored weekly recap. Facts that cannot "decline" — counts in
 * plain sentences; no composite score, no band words, no percentages.
 */

function latest(overrides: Partial<LatestBai> = {}): LatestBai {
  return {
    weekStart: "2026-07-13",
    score: 72,
    adherence: 71,
    consistency: 60,
    action: 100,
    prompted: 5,
    ...overrides
  };
}

describe("daysCheckedFrom", () => {
  it("is the exact inverse of adherence = round(min(1, days/7) * 100) for 0..7", () => {
    for (let days = 0; days <= 7; days += 1) {
      const adherence = Math.round(Math.min(1, days / 7) * 100);
      expect(daysCheckedFrom(adherence)).toBe(days);
    }
  });

  it("clamps overflow to 7", () => {
    expect(daysCheckedFrom(100)).toBe(7);
    expect(daysCheckedFrom(120)).toBe(7);
  });
});

describe("followThroughFrom", () => {
  it("is the exact inverse of action = round(followed/prompted * 100)", () => {
    for (let prompted = 1; prompted <= 7; prompted += 1) {
      for (let followed = 0; followed <= prompted; followed += 1) {
        const action = Math.round((followed / prompted) * 100);
        expect(followThroughFrom(action, prompted)).toBe(followed);
      }
    }
  });

  it("never exceeds prompted", () => {
    expect(followThroughFrom(100, 3)).toBe(3);
    expect(followThroughFrom(150, 3)).toBe(3);
  });
});

describe("recapSentences", () => {
  it("states days checked as a plain count", () => {
    expect(recapSentences(latest({ adherence: 71 }))[0]).toBe(
      "You checked in on 5 of 7 days last week."
    );
  });

  it("uses the singular form for one day", () => {
    expect(recapSentences(latest({ adherence: 14 }))[0]).toBe(
      "You checked in on 1 day last week."
    );
  });

  it("a zero-check week reads quiet, never as a failure", () => {
    const [first] = recapSentences(latest({ adherence: 0 }));
    expect(first).toBe("A quiet week — no checks, and nothing counted against you.");
  });

  it("prompted > 0 states follow-through as counts", () => {
    const sentences = recapSentences(latest({ action: 60, prompted: 5 }));
    expect(sentences[1]).toBe(
      "When a check suggested a step, you followed through 3 of 5 times."
    );
  });

  it("prompted = 0 swaps to the no-prompts note instead of a 0-of-0 line", () => {
    const sentences = recapSentences(latest({ action: 0, prompted: 0 }));
    expect(sentences[1]).toBe("No meals needed a follow-up last week.");
  });

  it("RV-3: no percentages, no band words, no score anywhere", () => {
    const fixtures = [
      latest(),
      latest({ adherence: 0, action: 0, prompted: 0 }),
      latest({ adherence: 100, action: 40, prompted: 5 }),
      latest({ adherence: 14, action: 100, prompted: 1 })
    ];
    for (const fixture of fixtures) {
      for (const sentence of [...recapSentences(fixture), RECAP_POSTURE_LINE]) {
        expect(sentence).not.toMatch(/%/);
        expect(sentence).not.toMatch(/\d+\s*percent/i);
        expect(sentence).not.toMatch(/excellent|on track|building|getting started/i);
        expect(sentence).not.toMatch(/\bscore\b/i);
        expect(sentence).not.toMatch(/declin|dropped|worse|behind/i);
      }
    }
  });

  it("pins the posture line", () => {
    expect(RECAP_POSTURE_LINE).toBe(
      "Checking less as you get more confident is how this is meant to work."
    );
  });
});
