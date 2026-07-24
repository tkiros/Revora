import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { createMealVisionClient } from "../../lib/meal/photo-extract";
import { normalizeItemName } from "../../lib/pantry/extract";

/**
 * Live draft-quality gate for the D5 photo-assist input (go/no-go for the
 * feature): recall >= 0.70 across all labeled photos, hallucinations == 0
 * among NON-uncertain items (an uncertain:true item that matches no label is
 * the model correctly flagging its own doubt — that is the design working).
 * Fixtures are the FOUNDER'S OWN meal photos (tests/fixtures/meal-photos,
 * see labels.example.json); like eval:pantry-extract, this skips without them.
 */
const FIXTURES = path.join(process.cwd(), "tests/fixtures/meal-photos");
// WS-7: live model spend requires an EXPLICIT opt-in (EVAL_MEAL_PHOTO_LIVE=1),
// not merely an ambient key + fixture files — a developer with credentials in
// their shell must never buy vision calls by running the suite.
const READY =
  process.env.EVAL_MEAL_PHOTO_LIVE === "1" &&
  fs.existsSync(path.join(FIXTURES, "labels.json")) &&
  !!process.env.OPENAI_API_KEY;

function toDataUrl(file: string): string {
  const buffer = fs.readFileSync(path.join(FIXTURES, file));
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}

function matches(label: string, extracted: string): boolean {
  const a = normalizeItemName(label);
  const b = normalizeItemName(extracted);
  return a.includes(b) || b.includes(a);
}

describe.skipIf(!READY)("eval:meal-photo (live)", () => {
  it("meets recall >= 0.70 with zero confident hallucinations", async () => {
    const labels: Record<string, string[]> = JSON.parse(
      fs.readFileSync(path.join(FIXTURES, "labels.json"), "utf8")
    );
    const client = createMealVisionClient();

    let found = 0;
    let expected = 0;
    let confidentHallucinations = 0;

    for (const [file, labelList] of Object.entries(labels)) {
      const draft = await client.draftFromPhoto(toDataUrl(file));
      expected += labelList.length;
      for (const label of labelList) {
        if (draft.items.some((item) => matches(label, item.name))) found += 1;
      }
      for (const item of draft.items) {
        if (!item.uncertain && !labelList.some((label) => matches(label, item.name))) {
          confidentHallucinations += 1;
          console.error(`confident hallucination in ${file}: "${item.name}"`);
        }
      }
    }

    console.log(
      `meal-photo eval: recall ${(found / expected).toFixed(2)}, confident hallucinations ${confidentHallucinations}`
    );
    expect(found / expected).toBeGreaterThanOrEqual(0.7);
    expect(confidentHallucinations).toBe(0);
  }, 600_000);
});
