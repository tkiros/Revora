import { describe, expect, it, vi } from "vitest";

import {
  loadPaywallConfig,
  parsePaywallConfig,
  PAYWALL_CONFIG_TIMEOUT_MS
} from "../../../lib/client/paywall-config";

const VALID = {
  mode: "trial",
  variant: "1299",
  priceDisplay: "$12.99",
  annualDisplay: "$99.99",
  annualMonthlyEquivalent: "$8.33",
  entitled: false
} as const;

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body
  } as unknown as Response;
}

describe("parsePaywallConfig — the server commercial contract is the only source", () => {
  it("accepts a well-formed config and returns it verbatim", () => {
    expect(parsePaywallConfig(VALID)).toEqual(VALID);
  });

  it("accepts a null annual (annual not configured)", () => {
    const noAnnual = {
      mode: "trial",
      variant: "999",
      priceDisplay: "$9.99",
      annualDisplay: null,
      annualMonthlyEquivalent: null,
      entitled: false
    };
    expect(parsePaywallConfig(noAnnual)).toEqual(noAnnual);
  });

  it("accepts an entitled session and rejects a missing/non-boolean entitled (AUD-009)", () => {
    expect(parsePaywallConfig({ ...VALID, entitled: true })).toEqual({
      ...VALID,
      entitled: true
    });
    const { entitled: _dropped, ...withoutEntitled } = VALID;
    expect(parsePaywallConfig(withoutEntitled)).toBeNull();
    expect(parsePaywallConfig({ ...VALID, entitled: "yes" })).toBeNull();
  });

  it("rejects a body missing the price (never guesses a fallback)", () => {
    expect(
      parsePaywallConfig({ mode: "trial", variant: "1299" })
    ).toBeNull();
  });

  it("rejects an unknown mode and an unknown variant", () => {
    expect(parsePaywallConfig({ ...VALID, mode: "premium" })).toBeNull();
    expect(parsePaywallConfig({ ...VALID, variant: "699" })).toBeNull();
  });

  it("rejects an empty price string", () => {
    expect(parsePaywallConfig({ ...VALID, priceDisplay: "" })).toBeNull();
  });

  it("rejects non-object input", () => {
    expect(parsePaywallConfig(null)).toBeNull();
    expect(parsePaywallConfig("$12.99")).toBeNull();
    expect(parsePaywallConfig(undefined)).toBeNull();
  });
});

describe("loadPaywallConfig — fetch, bound, validate", () => {
  it("returns the parsed config on success (rendered values == response values)", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(VALID));
    const result = await loadPaywallConfig({
      fetchImpl: fetchImpl as unknown as typeof fetch
    });
    expect(result).toEqual({ status: "ready", config: VALID });
    expect(fetchImpl).toHaveBeenCalledWith(
      "/api/paywall",
      expect.objectContaining({ signal: expect.any(Object) })
    );
  });

  it("returns error (never a default price) on a malformed body", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ garbage: true }));
    const result = await loadPaywallConfig({
      fetchImpl: fetchImpl as unknown as typeof fetch
    });
    expect(result).toEqual({ status: "error" });
  });

  it("returns error on a non-OK response", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(VALID, false));
    const result = await loadPaywallConfig({
      fetchImpl: fetchImpl as unknown as typeof fetch
    });
    expect(result).toEqual({ status: "error" });
  });

  it("returns error when the network throws", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("network down");
    });
    const result = await loadPaywallConfig({
      fetchImpl: fetchImpl as unknown as typeof fetch
    });
    expect(result).toEqual({ status: "error" });
  });

  it("returns error when JSON parsing throws", async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => {
        throw new SyntaxError("bad json");
      }
    }) as unknown as Response);
    const result = await loadPaywallConfig({
      fetchImpl: fetchImpl as unknown as typeof fetch
    });
    expect(result).toEqual({ status: "error" });
  });

  it("aborts and returns error when the request exceeds the timeout", async () => {
    vi.useFakeTimers();
    try {
      const fetchImpl = vi.fn(
        (_url: string, init?: { signal?: AbortSignal }) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError"))
            );
          })
      );
      const promise = loadPaywallConfig({
        fetchImpl: fetchImpl as unknown as typeof fetch,
        timeoutMs: PAYWALL_CONFIG_TIMEOUT_MS
      });
      await vi.advanceTimersByTimeAsync(PAYWALL_CONFIG_TIMEOUT_MS);
      expect(await promise).toEqual({ status: "error" });
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not abort a request that resolves before the timeout", async () => {
    vi.useFakeTimers();
    try {
      const fetchImpl = vi.fn(async () => jsonResponse(VALID));
      const result = await loadPaywallConfig({
        fetchImpl: fetchImpl as unknown as typeof fetch,
        timeoutMs: PAYWALL_CONFIG_TIMEOUT_MS
      });
      expect(result).toEqual({ status: "ready", config: VALID });
    } finally {
      vi.useRealTimers();
    }
  });
});
