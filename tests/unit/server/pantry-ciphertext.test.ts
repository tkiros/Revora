import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { encryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

/** Test-plan critical path: "Health data never plaintext at rest: A1C band
 *  value, item text, report payload." Scans the RAW rows (pglite) for the
 *  plaintext strings. checks.foodCiphertext already has the same test —
 *  this covers the three pantry tables. */

const SECRETS = {
  itemName: "very identifiable rye crispbread",
  portion: "two boxes",
  notes: "my doctor said 6.1 exactly",
  a1c: "6.1",
  reportReason: "identifiable report sentence"
};

let testDb: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = Buffer.alloc(32, 15).toString("base64");
  testDb = await createTestDb();

  const [order] = await testDb.db
    .insert(schema.pantryOrders)
    .values({
      email: "cipher@test.dev",
      stripeSessionId: "cs_cipher",
      claimToken: "hash_cipher",
      status: "ready",
      a1cBand: "prediabetes_60_62",
      a1cCiphertext: encryptField(SECRETS.a1c),
      notesCiphertext: encryptField(SECRETS.notes),
      reportCiphertext: encryptField(
        JSON.stringify({ reason: SECRETS.reportReason })
      )
    })
    .returning();
  await testDb.db.insert(schema.pantryItems).values({
    orderId: order.id,
    nameCiphertext: encryptField(SECRETS.itemName),
    portionCiphertext: encryptField(SECRETS.portion),
    resultCiphertext: encryptField(JSON.stringify({ reason: SECRETS.reportReason })),
    status: "judged",
    risk: "SAFE"
  });
});

afterAll(async () => {
  await testDb.close();
});

describe("pantry health data at rest", () => {
  it("no plaintext health-adjacent string appears in any pantry row", async () => {
    for (const table of ["pantry_orders", "pantry_items", "pantry_photos"]) {
      const result = await testDb.raw.query(`SELECT * FROM ${table}`);

      // Drop timestamp columns before the substring scan. They come back as
      // Date objects from a timestamptz column, so they cannot physically hold
      // health text — but serialising them made this a CLOCK-DEPENDENT test:
      // SECRETS.a1c is "6.1", and an ISO timestamp written at 04:36:06.177Z
      // contains "...06.177Z" — i.e. the substring "6.1". The assertion failed
      // in CI on a row it had itself just inserted, and passed on the earlier
      // runs purely because of what second they happened to start on.
      //
      // Every column that could actually carry health data is still scanned.
      const dump = JSON.stringify(
        result.rows.map((row) =>
          Object.fromEntries(
            Object.entries(row as Record<string, unknown>).filter(
              ([, value]) => !(value instanceof Date)
            )
          )
        )
      );

      for (const secret of Object.values(SECRETS)) {
        expect(dump).not.toContain(secret);
      }
    }
  });
});
