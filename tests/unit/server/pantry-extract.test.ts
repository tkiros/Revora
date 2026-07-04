import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createPantryVisionClient,
  normalizeItemName,
  MAX_ITEMS_PER_ORDER
} from "../../../lib/pantry/extract";

function transportReturning(payload: unknown) {
  return {
    responses: {
      create: vi.fn().mockResolvedValue({ output_text: JSON.stringify(payload) })
    }
  };
}

describe("pantry vision extraction", () => {
  afterEach(() => {
    delete process.env.PANTRY_EXTRACT_STUB;
    delete process.env.VERCEL_ENV;
  });

  it("parses items from the model and passes store:false + the photo url", async () => {
    const transport = transportReturning({
      items: [
        { name: "Rolled oats", portion: "1 canister" },
        { name: "Orange juice", portion: null }
      ]
    });
    const client = createPantryVisionClient({ client: transport });

    const items = await client.extractFromPhoto("https://blob.test/p1.jpg");

    expect(items).toEqual([
      { name: "Rolled oats", portion: "1 canister" },
      { name: "Orange juice", portion: null }
    ]);
    const params = transport.responses.create.mock.calls[0][0];
    expect(params.store).toBe(false);
    expect(JSON.stringify(params.input)).toContain("https://blob.test/p1.jpg");
    expect(params.text.format.type).toBe("json_schema");
  });

  it("throws on non-JSON output (caller marks the photo failed)", async () => {
    const client = createPantryVisionClient({
      client: {
        responses: { create: vi.fn().mockResolvedValue({ output_text: "nope" }) }
      }
    });
    await expect(client.extractFromPhoto("https://blob.test/x.jpg")).rejects.toThrow();
  });

  it("caps a runaway item list at MAX_ITEMS_PER_ORDER", async () => {
    const many = Array.from({ length: 60 }, (_, index) => ({
      name: `item ${index}`,
      portion: null
    }));
    const client = createPantryVisionClient({
      client: transportReturning({ items: many })
    });
    const items = await client.extractFromPhoto("https://blob.test/y.jpg");
    expect(items).toHaveLength(MAX_ITEMS_PER_ORDER);
  });

  it("stub seam returns fixture items without any transport", async () => {
    process.env.PANTRY_EXTRACT_STUB = "1";
    const client = createPantryVisionClient();
    const items = await client.extractFromPhoto("ignored");
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].name).toBe("rolled oats");
  });

  it("stub seam is refused in production", async () => {
    process.env.PANTRY_EXTRACT_STUB = "1";
    process.env.VERCEL_ENV = "production";
    // Inject a transport whose create rejects. If the stub were (wrongly)
    // active it would return STUB_ITEMS without ever touching the transport;
    // because the call rejects, we prove the live path ran and the stub did
    // NOT activate — independent of any ambient OPENAI_API_KEY.
    const create = vi.fn().mockRejectedValue(new Error("live path reached"));
    const client = createPantryVisionClient({ client: { responses: { create } } });
    await expect(client.extractFromPhoto("ignored")).rejects.toThrow(
      "live path reached"
    );
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("normalizeItemName lowercases, trims, and collapses spaces", () => {
    expect(normalizeItemName("  Rolled   OATS ")).toBe("rolled oats");
  });
});
