import { describe, expect, it } from "vitest";

import {
  capabilitiesFor,
  PREMIUM_CAPABILITY_KEYS,
  type Capabilities
} from "../../../lib/server/capabilities";
import type { Entitlement } from "../../../lib/server/entitlement";
import { FREE_DAILY_CHECKS, FREE_HISTORY_DAYS } from "../../../lib/free-tier";

/**
 * The one place the paid/free split is defined (plan §P2.4). Every enforcing
 * route derives from these same values, so a test that pins the matrix pins the
 * whole product's entitlement behaviour.
 */

const FREE: Entitlement = {
  tier: "free",
  source: null,
  status: "none",
  currentPeriodEnd: null
};

const LAPSED: Entitlement = {
  tier: "free",
  source: "stripe",
  status: "lapsed",
  currentPeriodEnd: null
};

const PREMIUM: Entitlement = {
  tier: "premium",
  source: "stripe",
  status: "premium",
  currentPeriodEnd: new Date("2026-08-01T00:00:00.000Z")
};

const TRIALING: Entitlement = {
  tier: "premium",
  source: "stripe",
  status: "trialing",
  currentPeriodEnd: new Date("2026-08-01T00:00:00.000Z")
};

// Features T14 / T17-18 have not shipped; their flags are absent by default.
const NO_FLAGS = {} as const;

describe("capabilitiesFor", () => {
  it("free: metered checks + 7-day window, no premium capabilities", () => {
    expect(capabilitiesFor(FREE, NO_FLAGS)).toEqual<Capabilities>({
      dailyChecks: FREE_DAILY_CHECKS,
      historyDays: FREE_HISTORY_DAYS,
      export: true,
      mealMemory: false,
      weeklyLearning: false,
      progress: false,
      nudges: false,
      thinInsight: true,
      support: "standard"
    });
  });

  it("lapsed reads exactly like free (rows exist but none valid)", () => {
    expect(capabilitiesFor(LAPSED, NO_FLAGS)).toEqual(
      capabilitiesFor(FREE, NO_FLAGS)
    );
  });

  it("premium: unlimited checks, full archive, progress + nudges", () => {
    expect(capabilitiesFor(PREMIUM, NO_FLAGS)).toEqual<Capabilities>({
      dailyChecks: "unlimited",
      historyDays: "all",
      export: true,
      // Flag-gated features stay OFF until T14 / T17-18 ship, even for premium.
      mealMemory: false,
      weeklyLearning: false,
      progress: true,
      nudges: true,
      thinInsight: true,
      support: "standard"
    });
  });

  it("trialing is entitled exactly like premium", () => {
    expect(capabilitiesFor(TRIALING, NO_FLAGS)).toEqual(
      capabilitiesFor(PREMIUM, NO_FLAGS)
    );
  });

  it("thin insight is free for every tier (controller decision 2026-07-18)", () => {
    expect(capabilitiesFor(FREE, NO_FLAGS).thinInsight).toBe(true);
    expect(capabilitiesFor(PREMIUM, NO_FLAGS).thinInsight).toBe(true);
  });

  it("export is a data right for every tier", () => {
    expect(capabilitiesFor(FREE, NO_FLAGS).export).toBe(true);
    expect(capabilitiesFor(PREMIUM, NO_FLAGS).export).toBe(true);
  });

  it("numbers are the shared constants, never retyped", () => {
    const free = capabilitiesFor(FREE, NO_FLAGS);
    expect(free.dailyChecks).toBe(FREE_DAILY_CHECKS);
    expect(free.historyDays).toBe(FREE_HISTORY_DAYS);
  });

  describe("flag-gated premium features (T14 mealMemory, T17-18 weeklyLearning)", () => {
    it("mealMemory: premium AND flag → true; either missing → false", () => {
      expect(
        capabilitiesFor(PREMIUM, { MEAL_MEMORY_ENABLED: "1" }).mealMemory
      ).toBe(true);
      // Premium but flag off.
      expect(capabilitiesFor(PREMIUM, NO_FLAGS).mealMemory).toBe(false);
      // Flag on but free — it is premium-gated first.
      expect(
        capabilitiesFor(FREE, { MEAL_MEMORY_ENABLED: "1" }).mealMemory
      ).toBe(false);
    });

    it("weeklyLearning: premium AND flag → true; either missing → false", () => {
      expect(
        capabilitiesFor(PREMIUM, { LEARNING_JOURNEY_ENABLED: "1" })
          .weeklyLearning
      ).toBe(true);
      expect(capabilitiesFor(PREMIUM, NO_FLAGS).weeklyLearning).toBe(false);
      expect(
        capabilitiesFor(FREE, { LEARNING_JOURNEY_ENABLED: "1" }).weeklyLearning
      ).toBe(false);
    });
  });

  describe("PREMIUM_CAPABILITY_KEYS", () => {
    it("lists exactly the capabilities that differ between free and premium today", () => {
      const free = capabilitiesFor(FREE, NO_FLAGS);
      const premium = capabilitiesFor(PREMIUM, NO_FLAGS);
      const differing = (
        Object.keys(premium) as (keyof Capabilities)[]
      ).filter((key) => free[key] !== premium[key]);
      expect(new Set(differing)).toEqual(new Set(PREMIUM_CAPABILITY_KEYS));
    });
  });
});
