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

import { nextStepAfterSegment } from "../../../app/onboarding/page";

describe("nextStepAfterSegment (single-source A1C rule)", () => {
  it("routes a device with a saved A1C straight past the A1C step", () => {
    expect(nextStepAfterSegment(true)).toBe("expectations");
  });

  it("asks for the A1C when the device has none", () => {
    expect(nextStepAfterSegment(false)).toBe("a1c");
  });
});
