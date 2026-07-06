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
