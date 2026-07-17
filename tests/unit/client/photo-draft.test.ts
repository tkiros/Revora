import { describe, expect, it } from "vitest";

import { targetDimensions } from "../../../lib/client/image";
import { composeDraftText } from "../../../lib/client/photo-draft";

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
