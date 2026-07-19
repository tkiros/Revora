import { describe, expect, it } from "vitest";

import { targetDimensions } from "../../../lib/client/image";
import {
  composeDraft,
  composeDraftText,
  dedupeDraftItems
} from "../../../lib/client/photo-draft";

describe("targetDimensions", () => {
  it("caps the long edge and keeps aspect ratio", () => {
    expect(targetDimensions(4000, 3000, 1024)).toEqual({ width: 1024, height: 768 });
    expect(targetDimensions(3000, 4000, 1024)).toEqual({ width: 768, height: 1024 });
  });
  it("never upscales", () => {
    expect(targetDimensions(800, 600, 1024)).toEqual({ width: 800, height: 600 });
  });
});

describe("composeDraftText", () => {
  it("joins dish and items with visible portions", () => {
    expect(
      composeDraftText("chicken bowl", [
        { name: "grilled chicken", portion: null, uncertain: false },
        { name: "white rice", portion: "1 cup", uncertain: false }
      ])
    ).toBe("chicken bowl: grilled chicken, white rice (1 cup)");
  });
  it("works without a dish and without items", () => {
    expect(
      composeDraftText(null, [{ name: "apple", portion: null, uncertain: false }])
    ).toBe("apple");
    expect(composeDraftText("soup", [])).toBe("soup");
  });
});

describe("composeDraftText length bounding", () => {
  const longItems = [
    { name: "sesame seed bun", portion: "1 bun", uncertain: false },
    { name: "beef patty", portion: "1 patty", uncertain: false },
    { name: "cheddar cheese", portion: "1 slice", uncertain: false },
    { name: "bacon", portion: "several strips", uncertain: false },
    { name: "mayonnaise", portion: "small amount", uncertain: false },
    { name: "ketchup or sauce", portion: "small amount", uncertain: false }
  ];

  it("keeps portions when the composed text fits", () => {
    const text = composeDraftText("soup", [
      { name: "lentils", portion: "1 cup", uncertain: false }
    ]);
    expect(text).toBe("soup: lentils (1 cup)");
  });

  it("drops portions before item names when over the cap", () => {
    const text = composeDraftText("bacon cheeseburger", longItems);
    expect(text.length).toBeLessThanOrEqual(160);
    expect(text).toContain("bacon cheeseburger");
    expect(text).toContain("beef patty");
    expect(text).not.toContain("(1 patty)");
  });

  it("never exceeds the check schema's food cap", () => {
    const many = Array.from({ length: 20 }, (_, i) => ({
      name: `ingredient number ${i} with a fairly long descriptive name`,
      portion: "1 serving",
      uncertain: false
    }));
    expect(composeDraftText("a very detailed plate", many).length).toBeLessThanOrEqual(160);
  });
});

describe("composeDraft — truncation visibility", () => {
  it("reports no drop when everything fits", () => {
    const result = composeDraft("chicken bowl", [
      { name: "grilled chicken", portion: null, uncertain: false },
      { name: "white rice", portion: "1 cup", uncertain: false }
    ]);
    expect(result.totalItems).toBe(2);
    expect(result.keptItems).toBe(2);
    expect(result.portionsDropped).toBe(false);
  });

  it("flags portions dropped when names still fit but portions don't", () => {
    const items = [
      { name: "sesame seed bun", portion: "1 bun", uncertain: false },
      { name: "beef patty", portion: "1 patty", uncertain: false },
      { name: "cheddar cheese", portion: "1 slice", uncertain: false },
      { name: "bacon", portion: "several strips", uncertain: false },
      { name: "mayonnaise", portion: "small amount", uncertain: false },
      { name: "ketchup or sauce", portion: "small amount", uncertain: false }
    ];
    const result = composeDraft("bacon cheeseburger", items);
    expect(result.portionsDropped).toBe(true);
    expect(result.keptItems).toBe(items.length);
    expect(result.text).not.toContain("(1 patty)");
  });

  it("reports how many items were dropped when even names overflow", () => {
    const many = Array.from({ length: 20 }, (_, i) => ({
      name: `ingredient number ${i} with a fairly long descriptive name`,
      portion: "1 serving",
      uncertain: false
    }));
    const result = composeDraft("a very detailed plate", many);
    expect(result.totalItems).toBe(20);
    expect(result.keptItems).toBeLessThan(20);
    expect(result.text.length).toBeLessThanOrEqual(160);
  });
});

describe("dedupeDraftItems", () => {
  it("collapses exact duplicate name+portion pairs, first wins", () => {
    const { items, collapsed } = dedupeDraftItems([
      { name: "white rice", portion: "1 cup", uncertain: false },
      { name: "White Rice", portion: "1 cup", uncertain: true },
      { name: "grilled chicken", portion: null, uncertain: false }
    ]);
    expect(collapsed).toBe(1);
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ name: "white rice", portion: "1 cup", uncertain: false });
  });

  it("keeps same-name items with different portions distinct", () => {
    const { items, collapsed } = dedupeDraftItems([
      { name: "rice", portion: "1 cup", uncertain: false },
      { name: "rice", portion: "2 cups", uncertain: false }
    ]);
    expect(collapsed).toBe(0);
    expect(items).toHaveLength(2);
  });

  it("reports nothing collapsed for a clean list", () => {
    const { collapsed } = dedupeDraftItems([
      { name: "apple", portion: null, uncertain: false }
    ]);
    expect(collapsed).toBe(0);
  });
});
