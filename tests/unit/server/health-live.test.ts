import { describe, expect, it } from "vitest";

import { GET } from "../../../app/api/health/live/route";

describe("GET /api/health/live", () => {
  it("reports process liveness without claiming product readiness", async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ ok: true });
  });
});
