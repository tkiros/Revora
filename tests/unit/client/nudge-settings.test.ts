import { describe, expect, it } from "vitest";

import {
  resolveNudgeSave,
  type NudgeSettings
} from "../../../lib/client/nudge-settings";

const PRIOR: NudgeSettings = {
  optIn: true,
  hour: 9,
  cadence: "daily",
  quietStart: null,
  quietEnd: null
};

const NEXT: NudgeSettings = { ...PRIOR, hour: 20 };

describe("resolveNudgeSave — apply-or-rollback reminder save (U9)", () => {
  it("keeps the optimistic value on success and clears the failure flag", () => {
    expect(resolveNudgeSave(PRIOR, NEXT, true)).toEqual({
      nudge: NEXT,
      failed: false
    });
  });

  it("rolls back to the prior value and flags failure on a failed save", () => {
    expect(resolveNudgeSave(PRIOR, NEXT, false)).toEqual({
      nudge: PRIOR,
      failed: true
    });
  });
});
