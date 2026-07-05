import { describe, expect, it, vi } from "vitest";

// FirstRunGate is a client component that reads the device-local stores, which
// touch window.localStorage directly. Vitest runs under the "node" environment,
// so — exactly like taster-store.test.ts / food-check-form.test.ts — we expose a
// Map-backed fake storage as the globals the stores touch BEFORE importing the
// module under test (importing the gate pulls the three stores into scope).
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
vi.stubGlobal("window", { localStorage: storage, location: { search: "" } });

import { isFirstRun } from "../../../components/first-run-gate";

// A brand-new visitor has: no stored checks, no guest profile, no taster state,
// and did not arrive via the ?stay=1 escape hatch. Any single signal → not new.
describe("isFirstRun (redirect decision)", () => {
  it("redirects when every signal is empty and there is no ?stay=1", () => {
    expect(isFirstRun(0, null, null, null)).toBe(true);
  });

  it("is suppressed by prior history (a saved check)", () => {
    expect(isFirstRun(1, null, null, null)).toBe(false);
  });

  it("is suppressed by a saved guest profile (an A1C)", () => {
    expect(isFirstRun(0, { a1c: 6.4, onboardedAt: "x" }, null, null)).toBe(false);
  });

  it("is suppressed by a started taster", () => {
    expect(isFirstRun(0, null, { firstDay: "2026-07-05", used: 1 }, null)).toBe(
      false
    );
  });

  it("is suppressed by the ?stay=1 escape hatch even when otherwise new", () => {
    expect(isFirstRun(0, null, null, "1")).toBe(false);
  });

  it("treats any non-'1' stay value as no escape (still redirects)", () => {
    expect(isFirstRun(0, null, null, "0")).toBe(true);
    expect(isFirstRun(0, null, null, "yes")).toBe(true);
  });
});
