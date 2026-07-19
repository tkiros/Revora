import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  createMemoryListHandler,
  createMemoryUpsertHandler
} from "../../../app/api/memory/handlers";
import { decryptField, encryptField } from "../../../lib/server/crypto";
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
  risk: "SAFE" | "MODERATE" | "HIGH" = "MODERATE"
) {
  const [row] = await testDb.db
    .insert(schema.checks)
    .values({
      userId,
      foodCiphertext: encryptField("white rice"),
      risk,
      a1cBand: "prediabetes_60_62",
      inputMethod: "text"
    })
    .returning({ id: schema.checks.id });
  return row.id;
}

function deps(
  userId: string | null,
  overrides: {
    entitlement?: Entitlement;
    env?: { MEAL_MEMORY_ENABLED?: string };
    now?: () => Date;
  } = {}
) {
  return {
    db: () => testDb.db,
    getSession: async () => (userId ? { userId, email: "owner@test.dev" } : null),
    entitlementOf: async () => overrides.entitlement ?? PREMIUM,
    env: overrides.env ?? FLAG_ON,
    now: overrides.now
  };
}

function postRequest(body: unknown) {
  return new Request("http://test/api/memory", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

function getRequest(query = "") {
  return new Request(`http://test/api/memory${query}`, { method: "GET" });
}

describe("meal memory upsert (POST)", () => {
  it("saves a memory for the caller's own check and encrypts free text", async () => {
    const checkId = await seedCheck(ownerId);
    const POST = createMemoryUpsertHandler(deps(ownerId));

    const response = await POST(
      postRequest({
        checkId,
        choice: "half portion, added eggs",
        wouldRepeat: true,
        ease: "okay",
        note: "felt fine, no crash",
        favorite: true,
        label: "breakfast"
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });

    const [row] = await testDb.db
      .select()
      .from(schema.mealMemories)
      .where(eq(schema.mealMemories.checkId, checkId));

    expect(row.userId).toBe(ownerId);
    expect(row.wouldRepeat).toBe(true);
    expect(row.easeReflection).toBe("okay");
    expect(row.favorite).toBe(true);
    expect(row.label).toBe("breakfast");
    // Encryption round-trip: ciphertext at rest, plaintext only via decrypt.
    expect(row.choiceCiphertext).not.toBeNull();
    expect(row.choiceCiphertext).not.toContain("eggs");
    expect(decryptField(row.choiceCiphertext as string)).toBe(
      "half portion, added eggs"
    );
    expect(decryptField(row.noteCiphertext as string)).toBe("felt fine, no crash");
  });

  it("upserts the single (user, check) row on re-save", async () => {
    const checkId = await seedCheck(ownerId);
    const POST = createMemoryUpsertHandler(deps(ownerId));

    await POST(postRequest({ checkId, ease: "easy", favorite: true }));
    await POST(postRequest({ checkId, ease: "hard", note: "second take" }));

    const rows = await testDb.db
      .select()
      .from(schema.mealMemories)
      .where(eq(schema.mealMemories.checkId, checkId));

    expect(rows).toHaveLength(1);
    // Wholesale replace: the latest save wins, and omitted fields reset.
    expect(rows[0].easeReflection).toBe("hard");
    expect(rows[0].favorite).toBe(false);
    expect(decryptField(rows[0].noteCiphertext as string)).toBe("second take");
  });

  it("404s when the server flag is off (feature not in this build)", async () => {
    const checkId = await seedCheck(ownerId);
    const POST = createMemoryUpsertHandler(deps(ownerId, { env: {} }));
    const response = await POST(postRequest({ checkId, favorite: true }));
    expect(response.status).toBe(404);
    expect(await testDb.db.select().from(schema.mealMemories)).toHaveLength(0);
  });

  it("401s a signed-out caller", async () => {
    const POST = createMemoryUpsertHandler(deps(null));
    const response = await POST(postRequest({ checkId: crypto.randomUUID() }));
    expect(response.status).toBe(401);
  });

  it("403s a caller without the mealMemory capability (free tier)", async () => {
    const checkId = await seedCheck(ownerId);
    const POST = createMemoryUpsertHandler(
      deps(ownerId, { entitlement: FREE })
    );
    const response = await POST(postRequest({ checkId, favorite: true }));
    expect(response.status).toBe(403);
    expect(await testDb.db.select().from(schema.mealMemories)).toHaveLength(0);
  });

  it("404s when the check does not exist", async () => {
    const POST = createMemoryUpsertHandler(deps(ownerId));
    const response = await POST(
      postRequest({ checkId: crypto.randomUUID(), favorite: true })
    );
    expect(response.status).toBe(404);
  });

  it("403s when the check belongs to another user (no cross-user memory)", async () => {
    const foreignCheck = await seedCheck(otherId);
    const POST = createMemoryUpsertHandler(deps(ownerId));
    const response = await POST(
      postRequest({ checkId: foreignCheck, favorite: true })
    );
    expect(response.status).toBe(403);
    expect(await testDb.db.select().from(schema.mealMemories)).toHaveLength(0);
  });

  it("400s an out-of-vocabulary ease or label (bounded enums, not free text)", async () => {
    const checkId = await seedCheck(ownerId);
    const POST = createMemoryUpsertHandler(deps(ownerId));

    const badEase = await POST(
      postRequest({ checkId, ease: "medically fine" })
    );
    expect(badEase.status).toBe(400);

    const badLabel = await POST(postRequest({ checkId, label: "dessert" }));
    expect(badLabel.status).toBe(400);

    expect(await testDb.db.select().from(schema.mealMemories)).toHaveLength(0);
  });

  it("400s free text past the caps", async () => {
    const checkId = await seedCheck(ownerId);
    const POST = createMemoryUpsertHandler(deps(ownerId));
    const tooLongNote = await POST(
      postRequest({ checkId, note: "x".repeat(501) })
    );
    expect(tooLongNote.status).toBe(400);
    const tooLongChoice = await POST(
      postRequest({ checkId, choice: "y".repeat(201) })
    );
    expect(tooLongChoice.status).toBe(400);
  });

  it("stamps updatedAt from the injectable clock on conflict", async () => {
    const checkId = await seedCheck(ownerId);
    const t1 = new Date("2026-07-01T00:00:00.000Z");
    const t2 = new Date("2026-07-05T00:00:00.000Z");

    await createMemoryUpsertHandler(deps(ownerId, { now: () => t1 }))(
      postRequest({ checkId, favorite: true })
    );
    await createMemoryUpsertHandler(deps(ownerId, { now: () => t2 }))(
      postRequest({ checkId, favorite: false })
    );

    const [row] = await testDb.db
      .select()
      .from(schema.mealMemories)
      .where(eq(schema.mealMemories.checkId, checkId));
    expect(row.updatedAt.toISOString()).toBe(t2.toISOString());
  });
});

describe("meal memory list (GET)", () => {
  it("returns the caller's memories with decrypted food + band, newest first", async () => {
    const older = await seedCheck(ownerId, "SAFE");
    const newer = await seedCheck(ownerId, "HIGH");
    const POST = createMemoryUpsertHandler(deps(ownerId));
    await POST(
      postRequest({ checkId: older, choice: "oatmeal plain", label: "breakfast" })
    );
    await POST(
      postRequest({ checkId: newer, note: "big portion", favorite: true })
    );

    const GET = createMemoryListHandler(deps(ownerId));
    const response = await GET(getRequest());
    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body.memories).toHaveLength(2);
    // Newest check saved last → first in the list.
    expect(body.memories[0].risk).toBe("HIGH");
    expect(body.memories[0].food).toBe("white rice");
    expect(body.memories[0].note).toBe("big portion");
    expect(body.memories[0].favorite).toBe(true);
    expect(body.memories[1].choice).toBe("oatmeal plain");
    expect(body.memories[1].label).toBe("breakfast");
  });

  it("never returns another user's memories", async () => {
    const mine = await seedCheck(ownerId);
    const theirs = await seedCheck(otherId);
    await createMemoryUpsertHandler(deps(ownerId))(
      postRequest({ checkId: mine, favorite: true })
    );
    await createMemoryUpsertHandler(deps(otherId, { entitlement: PREMIUM }))(
      postRequest({ checkId: theirs, favorite: true })
    );

    const GET = createMemoryListHandler(deps(ownerId));
    const body = await (await GET(getRequest())).json();
    expect(body.memories).toHaveLength(1);
    expect(body.memories[0].checkId).toBe(mine);
  });

  it("404s (flag off) / 401s (guest) / 403s (free) with the same gate order", async () => {
    expect(
      (await createMemoryListHandler(deps(ownerId, { env: {} }))(getRequest()))
        .status
    ).toBe(404);
    expect(
      (await createMemoryListHandler(deps(null))(getRequest())).status
    ).toBe(401);
    expect(
      (
        await createMemoryListHandler(deps(ownerId, { entitlement: FREE }))(
          getRequest()
        )
      ).status
    ).toBe(403);
  });
});
