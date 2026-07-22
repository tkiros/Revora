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

  it("nudges follow-through when today's check has an unmarked step", () => {
    const action = nextAction({ checkedToday: true, undoneActionToday: true });
    expect(action.href).toBe("/meals");
    // Red-team regression (2026-07-21): the line must not promise a marking
    // UI — no post-check surface renders action-done-button yet (TODOS.md).
    expect(action.text).toBe("Today's check suggested a step — did it happen?");
    expect(action.text).not.toMatch(/mark/i);
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
