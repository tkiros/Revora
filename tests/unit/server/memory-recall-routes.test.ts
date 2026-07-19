import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  createMemoryRecallHandler,
  createMemoryUpsertHandler,
  RECALL_SCAN_LIMIT
} from "../../../app/api/memory/handlers";
import { encryptField } from "../../../lib/server/crypto";
import type { Entitlement } from "../../../lib/server/entitlement";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const TEST_KEY = Buffer.alloc(32, 9).toString("base64");
const FLAG_ON = { MEAL_MEMORY_ENABLED: "1" } as const;

const PREMIUM: Entitlement = {
  tier: "premium",
  source: "stripe",
  status: "premium",
  currentPeriodEnd: new Date("2026-08-01T00:00:00.000Z")
};
const FREE: Entitlement = {
  tier: "free",
  source: null,
  status: "none",
  currentPeriodEnd: null
};

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let ownerId: string;
let otherId: string;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = TEST_KEY;
  testDb = await createTestDb();
  const [owner] = await testDb.db
    .insert(schema.users)
    .values({ email: "owner@test.dev" })
    .returning();
  const [other] = await testDb.db
    .insert(schema.users)
    .values({ email: "other@test.dev" })
    .returning();
  ownerId = owner.id;
  otherId = other.id;
});

afterAll(async () => {
  delete process.env.HEALTH_DATA_KEY;
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.mealMemories);
  await testDb.db.delete(schema.checks);
});

async function seedCheck(
  userId: string,
  food: string,
  {
    risk = "MODERATE",
    createdAt
  }: { risk?: "SAFE" | "MODERATE" | "HIGH"; createdAt?: Date } = {}
) {
  const [row] = await testDb.db
    .insert(schema.checks)
    .values({
      userId,
      foodCiphertext: encryptField(food),
      risk,
      a1cBand: "prediabetes_60_62",
      inputMethod: "text",
      ...(createdAt ? { createdAt } : {})
    })
    .returning({ id: schema.checks.id });
  return row.id;
}

function deps(
  userId: string | null,
  overrides: {
    entitlement?: Entitlement;
    env?: { MEAL_MEMORY_ENABLED?: string };
  } = {}
) {
  return {
    db: () => testDb.db,
    getSession: async () =>
      userId ? { userId, email: "owner@test.dev" } : null,
    entitlementOf: async () => overrides.entitlement ?? PREMIUM,
    env: overrides.env ?? FLAG_ON
  };
}

function recallRequest(body: unknown) {
  return new Request("http://test/api/memory/recall", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

// Save a memory the same way a user would (via the upsert handler), so the
// recall path reads exactly what the save path wrote.
async function saveMemory(
  userId: string,
  checkId: string,
  body: Record<string, unknown> = { favorite: true }
) {
  const POST = createMemoryUpsertHandler(deps(userId));
  const res = await POST(
    new Request("http://test/api/memory", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ checkId, ...body })
    })
  );
  expect(res.status).toBe(200);
}

describe("meal memory recall (POST /api/memory/recall)", () => {
  it("returns the saved memory for an exact normalized-string match", async () => {
    const checkId = await seedCheck(ownerId, "white rice", { risk: "HIGH" });
    await saveMemory(ownerId, checkId, {
      choice: "half portion, added eggs",
      wouldRepeat: true,
      ease: "okay",
      note: "felt fine",
      favorite: true,
      label: "dinner"
    });

    const POST = createMemoryRecallHandler(deps(ownerId));
    const response = await POST(recallRequest({ food: "white rice" }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.matches).toHaveLength(1);
    const match = body.matches[0];
    expect(match.checkId).toBe(checkId);
    expect(match.food).toBe("white rice");
    expect(match.risk).toBe("HIGH");
    // Decrypted, owner-only free text is echoed back for the panel.
    expect(match.choice).toBe("half portion, added eggs");
    expect(match.note).toBe("felt fine");
    expect(match.wouldRepeat).toBe(true);
    expect(match.ease).toBe("okay");
    expect(match.favorite).toBe(true);
    expect(match.label).toBe("dinner");
    // Source/date labels: when the memory was saved + when the check ran.
    expect(typeof match.savedAt).toBe("string");
    expect(typeof match.checkedAt).toBe("string");
  });

  it("matches case- and whitespace-insensitively (same normalizer as precheck)", async () => {
    const checkId = await seedCheck(ownerId, "White  Rice");
    await saveMemory(ownerId, checkId);

    const POST = createMemoryRecallHandler(deps(ownerId));
    const response = await POST(recallRequest({ food: "  white rice " }));

    const body = await response.json();
    expect(body.matches).toHaveLength(1);
    expect(body.matches[0].checkId).toBe(checkId);
  });

  it("returns no matches when nothing normalizes equal (miss)", async () => {
    const checkId = await seedCheck(ownerId, "white rice and beans");
    await saveMemory(ownerId, checkId);

    const POST = createMemoryRecallHandler(deps(ownerId));
    const response = await POST(recallRequest({ food: "white rice" }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.matches).toEqual([]);
  });

  it("does not do fuzzy/substring matching — only exact normalized equality", async () => {
    const checkId = await seedCheck(ownerId, "rice");
    await saveMemory(ownerId, checkId);

    const POST = createMemoryRecallHandler(deps(ownerId));
    // "fried rice" contains "rice" but is not an exact match.
    const body = await (
      await POST(recallRequest({ food: "fried rice" }))
    ).json();
    expect(body.matches).toEqual([]);
    void checkId;
  });

  it("only scans the memory itself — a matching check with no saved memory is not recalled", async () => {
    // Check exists and its food matches, but the user never saved a memory.
    await seedCheck(ownerId, "white rice");

    const POST = createMemoryRecallHandler(deps(ownerId));
    const body = await (
      await POST(recallRequest({ food: "white rice" }))
    ).json();
    expect(body.matches).toEqual([]);
  });

  it("returns every matching memory, newest saved first", async () => {
    const older = await seedCheck(ownerId, "white rice", { risk: "SAFE" });
    const newer = await seedCheck(ownerId, "WHITE RICE", { risk: "HIGH" });
    await saveMemory(ownerId, older, { note: "first time", label: "lunch" });
    await saveMemory(ownerId, newer, { note: "again", favorite: true });

    const POST = createMemoryRecallHandler(deps(ownerId));
    const body = await (
      await POST(recallRequest({ food: "white rice" }))
    ).json();

    expect(body.matches).toHaveLength(2);
    // Newest saved memory first.
    expect(body.matches[0].checkId).toBe(newer);
    expect(body.matches[1].checkId).toBe(older);
  });

  it("never recalls another user's memory (ownership)", async () => {
    const mine = await seedCheck(ownerId, "quinoa bowl");
    const theirs = await seedCheck(otherId, "quinoa bowl");
    await saveMemory(ownerId, mine, { favorite: true });
    await saveMemory(otherId, theirs, { favorite: true });

    const POST = createMemoryRecallHandler(deps(ownerId));
    const body = await (
      await POST(recallRequest({ food: "quinoa bowl" }))
    ).json();
    expect(body.matches).toHaveLength(1);
    expect(body.matches[0].checkId).toBe(mine);
  });

  it("bounds the scan to the most recent RECALL_SCAN_LIMIT memories", async () => {
    // The single matching memory is the OLDEST; RECALL_SCAN_LIMIT newer
    // non-matching memories bury it past the honest cap, so it is not found.
    const target = await seedCheck(ownerId, "target meal", {
      createdAt: new Date("2020-01-01T00:00:00.000Z")
    });
    await saveMemory(ownerId, target, { favorite: true });

    for (let i = 0; i < RECALL_SCAN_LIMIT; i += 1) {
      const noise = await seedCheck(ownerId, `noise meal ${i}`, {
        createdAt: new Date(`2026-07-${String((i % 27) + 1).padStart(2, "0")}T00:00:00.000Z`)
      });
      await saveMemory(ownerId, noise, { favorite: true });
    }

    const POST = createMemoryRecallHandler(deps(ownerId));
    const body = await (
      await POST(recallRequest({ food: "target meal" }))
    ).json();
    // Buried beyond the bounded scan → not recalled.
    expect(body.matches).toEqual([]);
  });

  it("404s (flag off) / 401s (guest) / 403s (free) in the same gate order", async () => {
    expect(
      (
        await createMemoryRecallHandler(deps(ownerId, { env: {} }))(
          recallRequest({ food: "white rice" })
        )
      ).status
    ).toBe(404);
    expect(
      (
        await createMemoryRecallHandler(deps(null))(
          recallRequest({ food: "white rice" })
        )
      ).status
    ).toBe(401);
    expect(
      (
        await createMemoryRecallHandler(deps(ownerId, { entitlement: FREE }))(
          recallRequest({ food: "white rice" })
        )
      ).status
    ).toBe(403);
  });

  it("400s an empty or oversized food (bounded, POST-body transport)", async () => {
    const POST = createMemoryRecallHandler(deps(ownerId));
    expect((await POST(recallRequest({ food: "" }))).status).toBe(400);
    expect((await POST(recallRequest({ food: "  " }))).status).toBe(400);
    expect(
      (await POST(recallRequest({ food: "x".repeat(161) }))).status
    ).toBe(400);
    expect((await POST(recallRequest({}))).status).toBe(400);
  });

  it("carries the meal text in the POST body, never in the URL", async () => {
    // The route path itself is meal-free; the food only ever rides the body.
    const request = recallRequest({ food: "grilled salmon and asparagus" });
    expect(request.url).toBe("http://test/api/memory/recall");
    expect(request.url).not.toContain("salmon");

    const checkId = await seedCheck(ownerId, "grilled salmon and asparagus");
    await saveMemory(ownerId, checkId);
    const POST = createMemoryRecallHandler(deps(ownerId));
    const body = await (await POST(request)).json();
    expect(body.matches).toHaveLength(1);
  });
});
