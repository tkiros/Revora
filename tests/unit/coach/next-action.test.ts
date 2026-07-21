import { describe, expect, it } from "vitest";

import { nextAction } from "../../../lib/coach/next-action";

/**
 * Home's ONE next-action line (C7 plan §3): three deterministic branches,
 * every one an invitation — no scoring, no scolding.
 */
describe("nextAction", () => {
  it("invites a check when nothing was checked today", () => {
    expect(nextAction({ checkedToday: false, undoneActionToday: false })).toEqual({
      text: "Check your next uncertain meal.",
      href: "/check"
    });
    // No-check wins even if a stale undone flag rides along.
    expect(
      nextAction({ checkedToday: false, undoneActionToday: true }).href
    ).toBe("/check");
  });

  it("points at /meals when today's check has an unmarked follow-through", () => {
    expect(nextAction({ checkedToday: true, undoneActionToday: true })).toEqual({
      text: "Mark what you did after today's check.",
      href: "/meals"
    });
  });

  it("points at /journey when today is done", () => {
    expect(nextAction({ checkedToday: true, undoneActionToday: false })).toEqual({
      text: "See what this week taught you.",
      href: "/journey"
    });
  });

  it("never scolds: no branch mentions missing, failing, or streaks", () => {
    const all = [
      nextAction({ checkedToday: false, undoneActionToday: false }),
      nextAction({ checkedToday: true, undoneActionToday: true }),
      nextAction({ checkedToday: true, undoneActionToday: false })
    ];
    for (const action of all) {
      expect(action.text).not.toMatch(/miss|fail|streak|behind|should have/i);
      expect(action.text).not.toMatch(/%/);
    }
  });
});
