import { describe, expect, it } from "vitest";

import {
  activeElapsedMs,
  applyAction,
  completedStages,
  currentDay,
  currentStage,
  isComplete,
  JourneyTransitionError,
  JOURNEY_LENGTH_DAYS,
  NOT_STARTED,
  type Journey,
  type JourneyAction,
  type JourneyState
} from "../../../lib/journey/state";

const DAY_MS = 24 * 60 * 60 * 1000;
const START = new Date("2026-01-01T00:00:00.000Z");

/** now = start + n active days (with `extraMs` fractional offset). */
function atDay(n: number, extraMs = 0): Date {
  return new Date(START.getTime() + n * DAY_MS + extraMs);
}

function active(overrides: Partial<Journey> = {}): Journey {
  return {
    state: "active",
    startedAt: START,
    pausedAt: null,
    accumulatedPauseMs: 0,
    graduatedAt: null,
    maintenanceAt: null,
    ...overrides
  };
}

describe("applyAction — legal transitions", () => {
  it("start: not_started → active, stamps startedAt, zeroes counters", () => {
    const next = applyAction(NOT_STARTED, "start", START);
    expect(next.state).toBe("active");
    expect(next.startedAt).toEqual(START);
    expect(next.pausedAt).toBeNull();
    expect(next.accumulatedPauseMs).toBe(0);
    expect(next.graduatedAt).toBeNull();
    expect(next.maintenanceAt).toBeNull();
  });

  it("pause: active → paused, records pausedAt", () => {
    const pausedAt = atDay(3);
    const next = applyAction(active(), "pause", pausedAt);
    expect(next.state).toBe("paused");
    expect(next.pausedAt).toEqual(pausedAt);
    // start untouched — no hidden reset.
    expect(next.startedAt).toEqual(START);
  });

  it("resume: paused → active, banks the paused span, clears pausedAt", () => {
    const pausedAt = atDay(3);
    const paused = applyAction(active(), "pause", pausedAt);
    const resumedAt = new Date(pausedAt.getTime() + 5 * DAY_MS);
    const next = applyAction(paused, "resume", resumedAt);
    expect(next.state).toBe("active");
    expect(next.pausedAt).toBeNull();
    expect(next.accumulatedPauseMs).toBe(5 * DAY_MS);
  });

  it("resume accumulates across multiple pauses", () => {
    let j = active();
    j = applyAction(j, "pause", atDay(2));
    j = applyAction(j, "resume", atDay(2, 2 * DAY_MS)); // +2 days paused
    j = applyAction(j, "pause", atDay(10));
    j = applyAction(j, "resume", atDay(10, 3 * DAY_MS)); // +3 days paused
    expect(j.accumulatedPauseMs).toBe(5 * DAY_MS);
  });

  it("resume clamps a backwards clock to zero (never credits active time)", () => {
    const paused = applyAction(active(), "pause", atDay(3));
    const next = applyAction(paused, "resume", atDay(3, -1000));
    expect(next.accumulatedPauseMs).toBe(0);
  });

  it("graduate: active → graduated at any day ≥ 1, stamps graduatedAt", () => {
    const at = atDay(2);
    const next = applyAction(active(), "graduate", at);
    expect(next.state).toBe("graduated");
    expect(next.graduatedAt).toEqual(at);
  });

  it("maintenance: graduated → maintenance, stamps maintenanceAt", () => {
    const graduated = applyAction(active(), "graduate", atDay(90));
    const at = atDay(91);
    const next = applyAction(graduated, "maintenance", at);
    expect(next.state).toBe("maintenance");
    expect(next.maintenanceAt).toEqual(at);
  });
});

describe("applyAction — illegal transitions all throw", () => {
  const cases: Array<{ state: JourneyState; action: JourneyAction }> = [
    // start only from not_started
    { state: "active", action: "start" },
    { state: "paused", action: "start" },
    { state: "graduated", action: "start" },
    { state: "maintenance", action: "start" },
    // pause only from active
    { state: "not_started", action: "pause" },
    { state: "paused", action: "pause" },
    { state: "graduated", action: "pause" },
    { state: "maintenance", action: "pause" },
    // resume only from paused
    { state: "not_started", action: "resume" },
    { state: "active", action: "resume" },
    { state: "graduated", action: "resume" },
    { state: "maintenance", action: "resume" },
    // graduate only from active (NOT from paused — must resume first)
    { state: "not_started", action: "graduate" },
    { state: "paused", action: "graduate" },
    { state: "graduated", action: "graduate" },
    { state: "maintenance", action: "graduate" },
    // maintenance only from graduated (NOT direct from active)
    { state: "not_started", action: "maintenance" },
    { state: "active", action: "maintenance" },
    { state: "paused", action: "maintenance" },
    { state: "maintenance", action: "maintenance" }
  ];

  for (const { state, action } of cases) {
    it(`rejects ${action} from ${state}`, () => {
      const journey: Journey = {
        ...active(),
        state,
        startedAt: state === "not_started" ? null : START,
        pausedAt: state === "paused" ? atDay(1) : null
      };
      expect(() => applyAction(journey, action, atDay(5))).toThrow(
        JourneyTransitionError
      );
    });
  }

  it("the thrown error carries from + action", () => {
    try {
      applyAction(active(), "start", START);
      throw new Error("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(JourneyTransitionError);
      const e = error as JourneyTransitionError;
      expect(e.from).toBe("active");
      expect(e.action).toBe("start");
    }
  });
});

describe("day derivation and pause-freeze arithmetic", () => {
  it("not_started has day 0 and null stage", () => {
    expect(currentDay(NOT_STARTED, atDay(5))).toBe(0);
    expect(currentStage(NOT_STARTED, atDay(5))).toBeNull();
  });

  it("day 1 on the very first active moment", () => {
    expect(currentDay(active(), START)).toBe(1);
    expect(currentDay(active(), atDay(0, DAY_MS - 1))).toBe(1);
  });

  it("day count is frozen while paused and resumes from the same day", () => {
    // Paused on day 4 (3 active days elapsed).
    const paused = applyAction(active(), "pause", atDay(3));
    // A month later, still day 4.
    expect(currentDay(paused, atDay(3, 30 * DAY_MS))).toBe(4);
    // Resume after 30 paused days; 30 days banked.
    const resumed = applyAction(paused, "resume", atDay(3, 30 * DAY_MS));
    expect(resumed.accumulatedPauseMs).toBe(30 * DAY_MS);
    // Immediately after resume: still day 4 (wall clock is start + 33 days).
    expect(currentDay(resumed, atDay(3, 30 * DAY_MS))).toBe(4);
    // One more active day → day 5.
    expect(currentDay(resumed, atDay(4, 30 * DAY_MS))).toBe(5);
  });

  it("activeElapsedMs subtracts the live ongoing pause span", () => {
    const paused = applyAction(active(), "pause", atDay(10));
    // 10 active days banked; being paused adds nothing.
    expect(activeElapsedMs(paused, atDay(10, 5 * DAY_MS))).toBe(10 * DAY_MS);
  });
});

describe("stage boundaries 7/8, 21/22, 45/46, 75/76, 90", () => {
  const boundaries: Array<{
    lastDayOfStage: number;
    lowerStage: number;
    upperStage: number;
  }> = [
    { lastDayOfStage: 7, lowerStage: 1, upperStage: 2 },
    { lastDayOfStage: 21, lowerStage: 2, upperStage: 3 },
    { lastDayOfStage: 45, lowerStage: 3, upperStage: 4 },
    { lastDayOfStage: 75, lowerStage: 4, upperStage: 5 }
  ];

  for (const { lastDayOfStage, lowerStage, upperStage } of boundaries) {
    it(`day ${lastDayOfStage} is stage ${lowerStage}, day ${lastDayOfStage + 1} is stage ${upperStage}`, () => {
      // Just before the roll: still on the last day of the lower stage.
      const stillLower = atDay(lastDayOfStage - 1, DAY_MS - 1);
      expect(currentDay(active(), stillLower)).toBe(lastDayOfStage);
      expect(currentStage(active(), stillLower)).toBe(lowerStage);

      // Exactly at N active days elapsed → day N+1, upper stage.
      const rolled = atDay(lastDayOfStage);
      expect(currentDay(active(), rolled)).toBe(lastDayOfStage + 1);
      expect(currentStage(active(), rolled)).toBe(upperStage);
    });
  }

  it("stage 5 spans days 76–90 and holds past day 90", () => {
    expect(currentStage(active(), atDay(75))).toBe(5); // day 76
    expect(currentStage(active(), atDay(89))).toBe(5); // day 90
    expect(currentStage(active(), atDay(120))).toBe(5); // day 121, still stage 5
  });

  it("day 90 marks completion; day 89 does not", () => {
    expect(currentDay(active(), atDay(88))).toBe(89);
    expect(isComplete(active(), atDay(88))).toBe(false);
    expect(currentDay(active(), atDay(89))).toBe(90);
    expect(isComplete(active(), atDay(89))).toBe(true);
    expect(JOURNEY_LENGTH_DAYS).toBe(90);
  });
});

describe("completedStages count for graduation event", () => {
  it("counts only stages fully behind the current day", () => {
    expect(completedStages(active(), START)).toBe(0); // day 1
    expect(completedStages(active(), atDay(7))).toBe(1); // day 8 → stage 1 done
    expect(completedStages(active(), atDay(21))).toBe(2); // day 22 → stages 1,2 done
    expect(completedStages(active(), atDay(45))).toBe(3);
    expect(completedStages(active(), atDay(75))).toBe(4);
    expect(completedStages(active(), atDay(89))).toBe(4); // day 90, stage 5 not "past"
    expect(completedStages(active(), atDay(120))).toBe(5); // all five behind
  });
});
