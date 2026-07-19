import { describe, expect, it, vi } from "vitest";

import { recallMealMemory } from "../../../lib/client/memory";

function jsonFetch(body: unknown, status = 200) {
  return vi.fn(
    async () => new Response(JSON.stringify(body), { status })
  );
}

function callOf(mock: ReturnType<typeof jsonFetch>) {
  const [url, init] = mock.mock.calls[0] as unknown as [string, RequestInit];
  return { url, body: JSON.parse(init.body as string), method: init.method };
}

const MATCH = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  checkId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  food: "white rice",
  risk: "HIGH" as const,
  band: "prediabetes_60_62",
  choice: "half portion",
  wouldRepeat: true,
  ease: "okay" as const,
  note: null,
  favorite: true,
  label: "dinner" as const,
  savedAt: "2026-07-01T00:00:00.000Z",
  checkedAt: "2026-07-01T00:00:00.000Z"
};

describe("recallMealMemory", () => {
  it("POSTs the trimmed meal in the body, never the URL", async () => {
    const fetchImpl = jsonFetch({ matches: [MATCH] });
    const matches = await recallMealMemory("  white rice ", fetchImpl);

    const { url, body, method } = callOf(fetchImpl);
    expect(url).toBe("/api/memory/recall");
    expect(url).not.toContain("rice");
    expect(method).toBe("POST");
    expect(body).toEqual({ food: "white rice" });
    expect(matches).toEqual([MATCH]);
  });

  it("returns [] for empty/whitespace food without calling the network", async () => {
    const fetchImpl = jsonFetch({ matches: [MATCH] });
    expect(await recallMealMemory("   ", fetchImpl)).toEqual([]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("fails soft to [] on a non-2xx (403 free / 404 flag-off / 401 guest)", async () => {
    for (const status of [401, 403, 404, 500]) {
      const fetchImpl = jsonFetch({ error: "nope" }, status);
      expect(await recallMealMemory("white rice", fetchImpl)).toEqual([]);
    }
  });

  it("fails soft to [] on a network throw", async () => {
    const throwing = vi.fn(async () => {
      throw new Error("offline");
    });
    expect(await recallMealMemory("white rice", throwing)).toEqual([]);
  });

  it("fails soft to [] on a malformed body (no matches array)", async () => {
    const fetchImpl = jsonFetch({ nope: true });
    expect(await recallMealMemory("white rice", fetchImpl)).toEqual([]);
  });
});
