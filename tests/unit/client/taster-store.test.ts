import { beforeEach, describe, expect, it, vi } from "vitest";

// The taster store is a device-local singleton that reads window.localStorage
// directly (mirroring profile-store.ts). Vitest runs under the "node"
// environment, so we expose the same Map-backed fake storage the history-store
// tests use as the globals the store touches (localStorage + window.localStorage).
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

import { tasterStore, TASTER_LIMIT } from "../../../lib/client/taster-store";

describe("tasterStore", () => {
  beforeEach(() => localStorage.clear());

  it("is available with 0 used before first check, stamps firstDay on first record", () => {
    expect(tasterStore.status()).toBe("available");
    expect(tasterStore.recordCheck()).toBe(1);
    expect(tasterStore.get()?.firstDay).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("exhausts at the 10th check on Day 1", () => {
    for (let i = 0; i < TASTER_LIMIT; i++) tasterStore.recordCheck();
    expect(tasterStore.status()).toBe("exhausted");
  });

  it("expires on Day 2 regardless of remaining checks", () => {
    tasterStore.recordCheck();
    const tomorrow = new Date(Date.now() + 26 * 3600_000);
    expect(tasterStore.status(tomorrow)).toBe("expired");
  });

  it("clear() removes stored state so the device resets to available", () => {
    tasterStore.recordCheck();
    expect(tasterStore.get()).not.toBeNull();
    tasterStore.clear();
    expect(tasterStore.get()).toBeNull();
    expect(tasterStore.status()).toBe("available");
  });
});
