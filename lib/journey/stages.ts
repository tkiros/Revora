import { STAGE_RANGES, type Stage } from "./state";

/**
 * The five Learning Journey stage descriptors (plan §P4.1). Each is the plain,
 * user-facing copy for a stage: a name and a short, NON-clinical line about what
 * the stage is for.
 *
 * The journey never claims to lower A1C, prevent diabetes, predict spikes, or
 * replace care (plan §P4.1, global constraint §3). The copy here is deliberately
 * behavioral ("save", "review", "add choices") — a banned-claims unit test
 * (tests/unit/journey/stage-copy.test.ts) runs every string in this file through
 * the SAME `assertNoForbiddenClaims` regexes the model output is held to, so a
 * future copy edit that smuggles in a clinical claim turns the suite red.
 *
 * Day ranges are NOT re-typed here — they are read from `STAGE_RANGES` in
 * state.ts (the single source), so a descriptor can never disagree with the day
 * math that decides which stage a user is in.
 */

export type StageDescriptor = {
  stage: Stage;
  startDay: number;
  endDay: number;
  /** Short imperative title for the stage. */
  name: string;
  /** One-line, non-clinical description of the stage's focus. */
  focus: string;
};

const STAGE_COPY: Record<Stage, { name: string; focus: string }> = {
  1: {
    name: "Get oriented",
    focus: "Understand the card and save three meals."
  },
  2: {
    name: "Build reliable defaults",
    focus: "Save easy repeat choices across your usual mealtimes."
  },
  3: {
    name: "Handle real life",
    focus: "Restaurant, takeout, a cultural favorite, time pressure, and budget."
  },
  4: {
    name: "Build variety",
    focus: "Avoid over-restriction and add choices, not bans."
  },
  5: {
    name: "Make your playbook",
    focus:
      "Review what you saved, what still feels uncertain, and where professional help may be useful."
  }
};

/**
 * All five descriptors in stage order, day ranges sourced from state.ts. This is
 * the array the API route and UI render from.
 */
export const STAGE_DESCRIPTORS: readonly StageDescriptor[] = STAGE_RANGES.map(
  (range) => ({
    stage: range.stage,
    startDay: range.startDay,
    endDay: range.endDay,
    name: STAGE_COPY[range.stage].name,
    focus: STAGE_COPY[range.stage].focus
  })
);

/** The descriptor for a stage number, or null if out of the 1–5 range. */
export function stageDescriptor(stage: number | null): StageDescriptor | null {
  if (stage === null) {
    return null;
  }
  return STAGE_DESCRIPTORS.find((entry) => entry.stage === stage) ?? null;
}
