import { describe, expect, it } from "vitest";

import {
  createMealVisionClient,
  MAX_DRAFT_ITEMS,
  STUB_DRAFT,
  type MealVisionTransport
} from "../../../lib/meal/photo-extract";

const DATA_URL = "data:image/jpeg;base64,AAAA";

function fakeTransport(outputText: string | undefined): MealVisionTransport {
  return {
    responses: {
      create: async () => ({ output_text: outputText })
    }
  };
}

describe("createMealVisionClient", () => {
  it("parses a valid draft and clamps items to MAX_DRAFT_ITEMS", async () => {
    const items = Array.from({ length: MAX_DRAFT_ITEMS + 5 }, (_, i) => ({
      name: `item ${i}`,
      portion: null,
      uncertain: false
    }));
    const client = createMealVisionClient({
      apiKey: "test",
      client: fakeTransport(JSON.stringify({ dish: "rice bowl", items }))
    });

    const draft = await client.draftFromPhoto(DATA_URL);

    expect(draft.dish).toBe("rice bowl");
    expect(draft.items).toHaveLength(MAX_DRAFT_ITEMS);
    expect(draft.items[0]).toEqual({ name: "item 0", portion: null, uncertain: false });
  });

  it("throws when output_text is missing", async () => {
    const client = createMealVisionClient({ apiKey: "test", client: fakeTransport(undefined) });
    await expect(client.draftFromPhoto(DATA_URL)).rejects.toThrow(/output_text/);
  });

  it("throws when output_text is not the draft shape", async () => {
    const client = createMealVisionClient({
      apiKey: "test",
      client: fakeTransport(JSON.stringify({ nope: true }))
    });
    await expect(client.draftFromPhoto(DATA_URL)).rejects.toThrow();
  });

  it("returns STUB_DRAFT under MEAL_EXTRACT_STUB=1 outside production", async () => {
    process.env.MEAL_EXTRACT_STUB = "1";
    try {
      const client = createMealVisionClient({ apiKey: "test", client: fakeTransport(undefined) });
      await expect(client.draftFromPhoto(DATA_URL)).resolves.toEqual(STUB_DRAFT);
    } finally {
      delete process.env.MEAL_EXTRACT_STUB;
    }
  });
});
