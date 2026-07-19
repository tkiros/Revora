import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchHistoryPage,
  loadHistory
} from "../../../lib/client/remote-history";

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

describe("fetchHistoryPage — search term never touches a URL (plan §16)", () => {
  function stubFetchCapture() {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fetchMock = vi
      .fn()
      .mockImplementation((url: string, init?: RequestInit) => {
        calls.push({ url, init });
        return Promise.resolve(
          new Response(
            JSON.stringify({ checks: [], nextCursor: null, meta: null }),
            { status: 200, headers: { "content-type": "application/json" } }
          )
        );
      });
    vi.stubGlobal("fetch", fetchMock);
    return calls;
  }

  it("sends the query in a POST body to /api/history/search, not the query string", async () => {
    const calls = stubFetchCapture();

    await fetchHistoryPage({ q: "lentil soup", from: "2026-07-01" });

    expect(calls).toHaveLength(1);
    const { url, init } = calls[0];
    // The meal text must not appear anywhere in the URL.
    expect(url).toBe("/api/history/search");
    expect(url).not.toContain("lentil");
    expect(url).not.toContain("q=");
    expect(init?.method).toBe("POST");
    const body = JSON.parse(String(init?.body));
    expect(body.q).toBe("lentil soup");
    expect(body.from).toBe("2026-07-01");
  });

  it("uses a GET query string when there is no search term", async () => {
    const calls = stubFetchCapture();

    await fetchHistoryPage({ cursor: "abc", from: "2026-07-01" });

    expect(calls).toHaveLength(1);
    const { url, init } = calls[0];
    expect(url.startsWith("/api/history?")).toBe(true);
    expect(url).not.toContain("q=");
    expect(init?.method ?? "GET").toBe("GET");
  });
});
