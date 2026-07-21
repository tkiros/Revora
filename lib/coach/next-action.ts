/**
 * Home's ONE next-action line (C7 plan §3; design-review DV6 precedence:
 * Home = one action for TODAY; /journey owns the weekly experiment).
 * Deterministic three-branch helper — no scoring, no scolding: every branch
 * is an invitation, none reads as a missed obligation.
 */

export type NextActionInput = {
  /** True when the user has at least one check today. */
  checkedToday: boolean;
  /** True when a non-SAFE check today still has no "I did it" mark. */
  undoneActionToday: boolean;
};

export type NextAction = { text: string; href: string };

export function nextAction(input: NextActionInput): NextAction {
  if (!input.checkedToday) {
    return { text: "Check your next uncertain meal.", href: "/check" };
  }
  if (input.undoneActionToday) {
    return { text: "Mark what you did after today's check.", href: "/meals" };
  }
  return { text: "See what this week taught you.", href: "/journey" };
}
