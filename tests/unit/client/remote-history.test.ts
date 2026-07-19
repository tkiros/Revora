import { afterEach, describe, expect, it, vi } from "vitest";

import { loadHistory } from "../../../lib/client/remote-history";

/**
 * The server-backed read (loadHistory) must carry the true input method
 * (text/voice/photo) into the on-device store. A prior version collapsed
 * anything that was not "voice" to "text", which erased photo checks' method
 * on every cross-device read (plan §4.6 "prove round-trip fidelity").
 */
function stubFetchOnce(body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" }
    })
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loadHistory input-method fidelity", () => {
  const nowIso = new Date().toISOString();

  it("preserves photo and voice methods; unknown methods degrade to text", async () => {
    stubFetchOnce({
      checks: [
        {
          clientId: "a",
          food: "chicken and rice bowl",
          risk: "MODERATE",
          a1cBand: "prediabetes_60_62",
          inputMethod: "photo",
          createdAt: nowIso
        },
        {
          clientId: "b",
          food: "oatmeal",
          risk: "SAFE",
          a1cBand: "prediabetes_57_59",
          inputMethod: "voice",
          createdAt: nowIso
        },
        {
          clientId: "c",
          food: "salad",
          risk: "SAFE",
          a1cBand: "prediabetes_57_59",
          inputMethod: "something-else",
          createdAt: nowIso
        }
      ]
    });

    const { source, checks } = await loadHistory(7);

    expect(source).toBe("server");
    expect(checks.find((c) => c.clientId === "a")?.inputMethod).toBe("photo");
    expect(checks.find((c) => c.clientId === "b")?.inputMethod).toBe("voice");
    expect(checks.find((c) => c.clientId === "c")?.inputMethod).toBe("text");
  });
});
