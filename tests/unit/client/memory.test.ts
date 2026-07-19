import { describe, expect, it, vi } from "vitest";

import {
  deleteAllMealMemories,
  deleteMealMemory,
  editMealMemory,
  recallMealMemory,
  searchMealMemories,
  shouldEmitRecalled
} from "../../../lib/client/memory";

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

describe("searchMealMemories", () => {
  it("POSTs the trimmed term in the body, never the URL", async () => {
    const fetchImpl = jsonFetch({ memories: [], searchScanned: 0 });
    await searchMealMemories("  rice ", fetchImpl);
    const { url, body, method } = callOf(fetchImpl);
    expect(url).toBe("/api/memory/search");
    expect(url).not.toContain("rice");
    expect(method).toBe("POST");
    expect(body).toEqual({ q: "rice" });
  });

  it("returns ok:true with the memories on success", async () => {
    const fetchImpl = jsonFetch({ memories: [{ id: "1" }], searchScanned: 1 });
    const result = await searchMealMemories("rice", fetchImpl);
    expect(result).toEqual({
      ok: true,
      memories: [{ id: "1" }],
      searchScanned: 1,
      searchCapped: false
    });
  });

  it("passes the honest scan bounds through when the scan hit the cap", async () => {
    const fetchImpl = jsonFetch({
      memories: [{ id: "1" }],
      searchScanned: 500,
      searchCapped: true
    });
    const result = await searchMealMemories("rice", fetchImpl);
    expect(result).toMatchObject({ searchScanned: 500, searchCapped: true });
  });

  it("does NOT hit the network for a blank term", async () => {
    const fetchImpl = jsonFetch({ memories: [] });
    expect(await searchMealMemories("   ", fetchImpl)).toEqual({ ok: false });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns ok:false (a real failure, not empty) on non-2xx or throw", async () => {
    for (const status of [401, 403, 404, 500]) {
      const fetchImpl = jsonFetch({ error: "nope" }, status);
      expect(await searchMealMemories("rice", fetchImpl)).toEqual({ ok: false });
    }
    const throwing = vi.fn(async () => {
      throw new Error("offline");
    });
    expect(await searchMealMemories("rice", throwing)).toEqual({ ok: false });
  });
});

describe("editMealMemory", () => {
  it("PATCHes only the provided fields, trimming free text", async () => {
    const fetchImpl = jsonFetch({ ok: true });
    await editMealMemory("mem-1", { ease: "hard", note: "  kept " }, fetchImpl);
    const { url, body, method } = callOf(fetchImpl);
    expect(url).toBe("/api/memory/mem-1");
    expect(method).toBe("PATCH");
    expect(body).toEqual({ ease: "hard", note: "kept" });
  });

  it("sends null to clear a field emptied by the user", async () => {
    const fetchImpl = jsonFetch({ ok: true });
    await editMealMemory("mem-1", { note: "   " }, fetchImpl);
    const { body } = callOf(fetchImpl);
    expect(body).toEqual({ note: null });
  });

  it("resolves false on a failure without throwing", async () => {
    const fetchImpl = jsonFetch({ error: "x" }, 500);
    expect(await editMealMemory("mem-1", { favorite: true }, fetchImpl)).toBe(
      false
    );
  });
});

describe("deleteMealMemory", () => {
  it("DELETEs the single memory by id", async () => {
    const fetchImpl = jsonFetch({ ok: true });
    expect(await deleteMealMemory("mem-9", fetchImpl)).toBe(true);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [
      string,
      RequestInit
    ];
    expect(url).toBe("/api/memory/mem-9");
    expect(init.method).toBe("DELETE");
  });
});

describe("deleteAllMealMemories", () => {
  it("DELETEs /api/memory with the explicit confirm the server requires", async () => {
    const fetchImpl = jsonFetch({ ok: true, deleted: 3 });
    expect(await deleteAllMealMemories(fetchImpl)).toBe(true);
    const { url, body, method } = callOf(fetchImpl);
    expect(url).toBe("/api/memory");
    expect(method).toBe("DELETE");
    expect(body).toEqual({ confirm: true });
  });
});

describe("shouldEmitRecalled — meal_memory_recalled emit gate", () => {
  it("emits on the first meal with ≥1 visible match", () => {
    expect(shouldEmitRecalled("white rice", 1, null)).toBe(true);
  });

  it("does NOT re-emit for the same meal (StrictMode / re-render dedupe)", () => {
    // Already emitted for this exact food → suppressed.
    expect(shouldEmitRecalled("white rice", 1, "white rice")).toBe(false);
  });

  it("emits again for a SECOND, different recalled meal in the same session", () => {
    // Last emit was for "white rice"; a new meal recalls and must emit again.
    expect(shouldEmitRecalled("oatmeal", 2, "white rice")).toBe(true);
  });

  it("re-emits when the user returns to a prior meal after checking another", () => {
    // Panel last emitted for "oatmeal"; back to "white rice" → emit again.
    expect(shouldEmitRecalled("white rice", 1, "oatmeal")).toBe(true);
  });

  it("does NOT emit when every match was session-dismissed (renders null)", () => {
    // Matches exist server-side but all are dismissed → 0 visible → no emit.
    expect(shouldEmitRecalled("white rice", 0, null)).toBe(false);
    expect(shouldEmitRecalled("white rice", 0, "oatmeal")).toBe(false);
  });
});
