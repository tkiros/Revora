import { describe, expect, it } from "vitest";

import { isRestoreDisabled } from "../../../components/paywall-card";

/**
 * B5: "Restore a previous purchase" re-verifies each Play token server-side and
 * has nothing to do with the checkout `config` load. It must stay enabled while
 * the config is erroring/pending so a returning subscriber can still restore —
 * only a live action (busy) or unaccepted terms may block it.
 */
describe("isRestoreDisabled (B5)", () => {
  it("is enabled once terms are accepted and no action is in flight", () => {
    expect(isRestoreDisabled(null, true)).toBe(false);
  });

  it("stays enabled regardless of config state (config is not a factor)", () => {
    // The signature no longer accepts config at all — that is the fix: a
    // config error/pending state cannot disable restore.
    expect(isRestoreDisabled(null, true)).toBe(false);
  });

  it("is disabled while an action is running", () => {
    expect(isRestoreDisabled("restore", true)).toBe(true);
    expect(isRestoreDisabled("monthly", true)).toBe(true);
  });

  it("is disabled until the terms box is checked", () => {
    expect(isRestoreDisabled(null, false)).toBe(true);
  });
});
