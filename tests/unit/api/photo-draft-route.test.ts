import { describe, expect, it } from "vitest";

import { createPhotoDraftHandler } from "../../../app/api/check/photo-draft/route";
import { STUB_DRAFT } from "../../../lib/meal/photo-extract";

const GOOD_BODY = JSON.stringify({ image: "data:image/jpeg;base64,AAAA" });

function post(body: string) {
  return new Request("http://localhost/api/check/photo-draft", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body
  });
}

const visionOk = { draftFromPhoto: async () => STUB_DRAFT };

describe("POST /api/check/photo-draft", () => {
  it("returns the draft for a valid image (guest)", async () => {
    const handler = createPhotoDraftHandler({
      vision: () => visionOk,
      getSession: async () => null,
      paywallMode: () => "legacy"
    });
    const response = await handler(post(GOOD_BODY));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ kind: "draft", ...STUB_DRAFT });
  });

  it("rejects a non-image payload with 400 and no model call", async () => {
    let called = 0;
    const handler = createPhotoDraftHandler({
      vision: () => ({ draftFromPhoto: async () => ((called += 1), STUB_DRAFT) }),
      getSession: async () => null,
      paywallMode: () => "legacy"
    });
    const response = await handler(post(JSON.stringify({ image: "data:text/html;base64,AAAA" })));
    expect(response.status).toBe(400);
    expect(called).toBe(0);
  });

  it("rejects an oversized image with 400 and no model call", async () => {
    let called = 0;
    const handler = createPhotoDraftHandler({
      vision: () => ({ draftFromPhoto: async () => ((called += 1), STUB_DRAFT) }),
      getSession: async () => null,
      paywallMode: () => "legacy"
    });
    const oversized = `data:image/jpeg;base64,${"A".repeat(4_500_001)}`;
    const response = await handler(post(JSON.stringify({ image: oversized })));
    expect(response.status).toBe(400);
    expect(called).toBe(0);
  });

  it("walls a signed-in non-premium user in trial mode BEFORE model spend", async () => {
    let called = 0;
    const handler = createPhotoDraftHandler({
      vision: () => ({ draftFromPhoto: async () => ((called += 1), STUB_DRAFT) }),
      db: () => ({}) as never,
      getSession: async () => ({ userId: "u1", email: "t@example.com" } as never),
      getEntitlementImpl: async () => ({ tier: "free" }) as never,
      paywallMode: () => "trial"
    });
    const response = await handler(post(GOOD_BODY));
    expect(response.status).toBe(402);
    expect((await response.json()).kind).toBe("upsell");
    expect(called).toBe(0);
  });

  it("returns a calm 200 retry body when the model call throws (mirrors /api/check)", async () => {
    const handler = createPhotoDraftHandler({
      vision: () => ({
        draftFromPhoto: async () => {
          throw new Error("boom");
        }
      }),
      getSession: async () => null,
      paywallMode: () => "legacy"
    });
    const response = await handler(post(GOOD_BODY));
    expect(response.status).toBe(200);
    expect((await response.json()).kind).toBe("retry");
  });
});
