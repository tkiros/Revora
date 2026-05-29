import { describe, expect, it } from "vitest";

import { validateCheckForm } from "../../../lib/client/validation";

describe("validateCheckForm", () => {
  it("accepts a food description with a one decimal A1C value", () => {
    expect(
      validateCheckForm({
        food: "lentil soup",
        a1c: "6.1"
      })
    ).toEqual({
      ok: true,
      data: {
        food: "lentil soup",
        a1c: 6.1
      }
    });
  });

  it("rejects empty food input", () => {
    expect(
      validateCheckForm({
        food: "   ",
        a1c: "6.1"
      })
    ).toEqual({
      ok: false,
      issues: [{ field: "food", message: "Enter a food or meal." }]
    });
  });

  it("rejects empty A1C input", () => {
    expect(
      validateCheckForm({
        food: "lentil soup",
        a1c: "  "
      })
    ).toEqual({
      ok: false,
      issues: [{ field: "a1c", message: "Enter your A1C with one decimal." }]
    });
  });

  it("rejects nonnumeric A1C input", () => {
    expect(
      validateCheckForm({
        food: "lentil soup",
        a1c: "six.one"
      })
    ).toEqual({
      ok: false,
      issues: [{ field: "a1c", message: "Use numbers only, like 6.1." }]
    });
  });

  it("rejects multiple decimal points", () => {
    expect(
      validateCheckForm({
        food: "lentil soup",
        a1c: "6.1.2"
      })
    ).toEqual({
      ok: false,
      issues: [{ field: "a1c", message: "Use one decimal place, like 6.1." }]
    });
  });

  it("rejects more than one decimal place", () => {
    expect(
      validateCheckForm({
        food: "lentil soup",
        a1c: "6.12"
      })
    ).toEqual({
      ok: false,
      issues: [{ field: "a1c", message: "Use one decimal place, like 6.1." }]
    });
  });

  it("rejects an A1C without one decimal place", () => {
    expect(
      validateCheckForm({
        food: "lentil soup",
        a1c: "6"
      })
    ).toEqual({
      ok: false,
      issues: [{ field: "a1c", message: "Use one decimal place, like 6.1." }]
    });
  });
});
