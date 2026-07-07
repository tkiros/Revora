import { describe, expect, it, vi } from "vitest";

// The onboarding page is a client component; importing it pulls the profile
// store (which touches window.localStorage) into scope, so — as in
// food-check-form.test.ts — expose a fake storage BEFORE the import.
function fakeStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
    clear: () => void map.clear()
  };
}

const storage = fakeStorage();
vi.stubGlobal("localStorage", storage);
vi.stubGlobal("window", { localStorage: storage });

import { nextStepAfterSegment, STEP_PROGRESS } from "../../../app/onboarding/page";

describe("nextStepAfterSegment (single-source A1C rule)", () => {
  it("routes a device with a saved A1C straight past the A1C step", () => {
    expect(nextStepAfterSegment(true)).toBe("expectations");
  });

  it("asks for the A1C when the device has none", () => {
    expect(nextStepAfterSegment(false)).toBe("a1c");
  });
});

describe("STEP_PROGRESS (goal-gradient bar)", () => {
  it("never shows a visible step at zero — arriving counts as progress", () => {
    const visible = ["welcome", "segment", "a1c", "expectations", "first_check"] as const;
    for (const step of visible) {
      expect(STEP_PROGRESS[step]).toBeGreaterThan(0);
      expect(STEP_PROGRESS[step]).toBeLessThan(100);
    }
  });

  it("only ever moves forward, on both the full and the skip-A1C path", () => {
    const full = ["welcome", "segment", "a1c", "expectations", "first_check"] as const;
    const skipA1c = ["welcome", "segment", "expectations", "first_check"] as const;
    for (const path of [full, skipA1c]) {
      for (let i = 1; i < path.length; i++) {
        expect(STEP_PROGRESS[path[i]]).toBeGreaterThan(STEP_PROGRESS[path[i - 1]]);
      }
    }
  });
});
