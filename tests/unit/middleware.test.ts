/**
 * Middleware glue tests (launch-hardening Task 1.3).
 *
 * Covers the wiring the pure decision logic (rate-limit.test.ts) cannot:
 *  - non-matching requests pass through untouched
 *  - the happy path still passes through when Upstash is unconfigured in
 *    dev/test (regression: the new abuse gate must not break normal checks)
 *  - the existing launch-mode pause gate still fires (503) ahead of any limit
 *
 * The 429 / daily_cap / prod-fail-closed branches depend on module-load env
 * (rateLimitDeps is built once at import from process.env) and on a live
 * Upstash store, so they are verified by rate-limit.test.ts (decision logic)
 * plus the manual preview-deploy curl in the plan (Task 1.3 Step 3).
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { middleware } from "../../middleware";

function post(path: string, method = "POST"): NextRequest {
  return new NextRequest(new URL(`http://localhost${path}`), { method });
}

function isPassthrough(response: Response): boolean {
  // NextResponse.next() tags the response with this internal header.
  return response.headers.get("x-middleware-next") === "1";
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("middleware", () => {
  it("passes through non-check paths", async () => {
    const response = await middleware(post("/", "GET"));
    expect(isPassthrough(response)).toBe(true);
  });

  it("passes through non-POST requests to /api/check", async () => {
    const response = await middleware(post("/api/check", "GET"));
    expect(isPassthrough(response)).toBe(true);
  });

  it("passes the happy path through when Upstash is unconfigured (dev/test)", async () => {
    const response = await middleware(post("/api/check"));
    expect(isPassthrough(response)).toBe(true);
  });

  it("fails closed (503) on a public deploy when Upstash is unconfigured", async () => {
    // rateLimitDeps was built null at import (no Upstash env). A public preview
    // deploy must NOT run public + unlimited — it fails closed.
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "preview");
    const response = await middleware(post("/api/check"));
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.kind).toBe("retry");
  });

  it("returns a 503 pause response when launch mode is paused", async () => {
    vi.stubEnv("REVORA_LAUNCH_MODE_OVERRIDE", "paused");
    const response = await middleware(post("/api/check"));
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.kind).toBe("retry");
    expect(typeof body.message).toBe("string");
  });
});
