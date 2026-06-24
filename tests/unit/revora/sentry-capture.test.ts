/**
 * Pins the load-bearing safety invariant (review finding #1): captureServerError
 * runs on the request's LAST recovery path, so a Sentry SDK fault must NOT
 * propagate — otherwise the catch block loses its calm-retry response and the
 * user gets an uncaught 500. If a future refactor drops the internal guard, this
 * test fails.
 */

import { describe, expect, it, vi } from "vitest";

vi.mock("@sentry/node", () => ({
  captureException: vi.fn(() => {
    throw new Error("SDK boom");
  }),
  flush: vi.fn(() => Promise.resolve(true))
}));

import { captureServerError } from "../../../lib/revora/sentry-capture";

describe("captureServerError", () => {
  it("never throws or rejects even when the Sentry SDK throws", async () => {
    await expect(
      captureServerError(new Error("provider down"), "model")
    ).resolves.toBeUndefined();
  });
});
