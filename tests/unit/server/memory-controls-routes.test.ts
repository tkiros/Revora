import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  createMemoryDeleteAllHandler,
  createMemoryDeleteHandler,
  createMemoryEditHandler,
  createMemoryExportHandler,
  createMemorySearchHandler,
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
  await testDb.db.delete(schema.weeklyReflections);
  await testDb.db.delete(schema.mealMemories);
  await testDb.db.delete(schema.checks);
});

async function seedCheck(userId: string, food = "white rice") {
  const [row] = await testDb.db
    .insert(schema.checks)
    .values({
      userId,
      foodCiphertext: encryptField(food),
      risk: "MODERATE",
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
    getSession: async () =>
      userId ? { userId, email: "owner@test.dev" } : null,
    entitlementOf: async () => overrides.entitlement ?? PREMIUM,
    env: overrides.env ?? FLAG_ON,
    now: overrides.now
  };
}

async function saveMemory(userId: string, checkId: string, body: unknown) {
  const POST = createMemoryUpsertHandler(deps(userId));
  const response = await POST(
    new Request("http://test/api/memory", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ checkId, ...(body as object) })
    })
  );
  expect(response.status).toBe(200);
  const [row] = await testDb.db
    .select({ id: schema.mealMemories.id })
    .from(schema.mealMemories)
    .where(eq(schema.mealMemories.checkId, checkId));
  return row.id;
}

function jsonRequest(url: string, method: string, body?: unknown) {
  return new Request(url, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

describe("meal memory search (POST)", () => {
  it("matches the caller's own memories by decrypted meal text, POST body only", async () => {
    const rice = await seedCheck(ownerId, "white rice");
    const oats = await seedCheck(ownerId, "oatmeal");
    await saveMemory(ownerId, rice, { favorite: true });
    await saveMemory(ownerId, oats, { note: "plain" });

    const SEARCH = createMemorySearchHandler(deps(ownerId));
    const response = await SEARCH(
      jsonRequest("http://test/api/memory/search", "POST", { q: "rice" })
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.memories).toHaveLength(1);
    expect(body.memories[0].food).toBe("white rice");
    expect(typeof body.searchScanned).toBe("number");
  });

  it("matches on the user's own note/choice words too", async () => {
    const rice = await seedCheck(ownerId, "white rice");
    await saveMemory(ownerId, rice, { note: "birthday dinner" });

    const SEARCH = createMemorySearchHandler(deps(ownerId));
    const body = await (
      await SEARCH(
        jsonRequest("http://test/api/memory/search", "POST", {
          q: "birthday"
        })
      )
    ).json();
    expect(body.memories).toHaveLength(1);
  });

  it("never returns another user's memories", async () => {
    const mine = await seedCheck(ownerId, "white rice");
    const theirs = await seedCheck(otherId, "white rice");
    await saveMemory(ownerId, mine, { favorite: true });
    await createMemoryUpsertHandler(deps(otherId))(
      jsonRequest("http://test/api/memory", "POST", {
        checkId: theirs,
        favorite: true
      })
    );

    const SEARCH = createMemorySearchHandler(deps(ownerId));
    const body = await (
      await SEARCH(
        jsonRequest("http://test/api/memory/search", "POST", { q: "rice" })
      )
    ).json();
    expect(body.memories).toHaveLength(1);
    expect(body.memories[0].checkId).toBe(mine);
  });

  it("gates flag 404 → session 401 → capability 403", async () => {
    const req = () =>
      jsonRequest("http://test/api/memory/search", "POST", { q: "x" });
    expect(
      (await createMemorySearchHandler(deps(ownerId, { env: {} }))(req()))
        .status
    ).toBe(404);
    expect(
      (await createMemorySearchHandler(deps(null))(req())).status
    ).toBe(401);
    expect(
      (
        await createMemorySearchHandler(deps(ownerId, { entitlement: FREE }))(
          req()
        )
      ).status
    ).toBe(403);
  });

  it("400s an empty query (meal text is required, POST body only)", async () => {
    const SEARCH = createMemorySearchHandler(deps(ownerId));
    expect(
      (
        await SEARCH(
          jsonRequest("http://test/api/memory/search", "POST", { q: "" })
        )
      ).status
    ).toBe(400);
  });
});

describe("meal memory edit (PATCH)", () => {
  it("merges only the provided user-authored fields, leaving the rest intact", async () => {
    const check = await seedCheck(ownerId);
    const id = await saveMemory(ownerId, check, {
      choice: "half portion",
      ease: "okay",
      favorite: true,
      note: "kept"
    });

    const PATCH = createMemoryEditHandler(deps(ownerId));
    const response = await PATCH(
      jsonRequest(`http://test/api/memory/${id}`, "PATCH", {
        ease: "hard",
        label: "dinner"
      })
    );
    expect(response.status).toBe(200);

    const [row] = await testDb.db
      .select()
      .from(schema.mealMemories)
      .where(eq(schema.mealMemories.id, id));
    // Merged: ease changed, label set, but choice/favorite/note untouched.
    expect(row.easeReflection).toBe("hard");
    expect(row.label).toBe("dinner");
    expect(row.favorite).toBe(true);
    expect(decryptField(row.choiceCiphertext as string)).toBe("half portion");
    expect(decryptField(row.noteCiphertext as string)).toBe("kept");
  });

  it("clears a field when null is sent explicitly", async () => {
    const check = await seedCheck(ownerId);
    const id = await saveMemory(ownerId, check, { note: "old note" });

    const PATCH = createMemoryEditHandler(deps(ownerId));
    await PATCH(
      jsonRequest(`http://test/api/memory/${id}`, "PATCH", { note: null })
    );

    const [row] = await testDb.db
      .select()
      .from(schema.mealMemories)
      .where(eq(schema.mealMemories.id, id));
    expect(row.noteCiphertext).toBeNull();
  });

  it("re-encrypts edited free text (never plaintext at rest)", async () => {
    const check = await seedCheck(ownerId);
    const id = await saveMemory(ownerId, check, { note: "first" });

    await createMemoryEditHandler(deps(ownerId))(
      jsonRequest(`http://test/api/memory/${id}`, "PATCH", {
        note: "second secret"
      })
    );
    const [row] = await testDb.db
      .select()
      .from(schema.mealMemories)
      .where(eq(schema.mealMemories.id, id));
    expect(row.noteCiphertext).not.toContain("secret");
    expect(decryptField(row.noteCiphertext as string)).toBe("second secret");
  });

  it("rejects an attempt to edit a snapshot/check field (whitelist)", async () => {
    const check = await seedCheck(ownerId);
    const id = await saveMemory(ownerId, check, { favorite: true });
    const PATCH = createMemoryEditHandler(deps(ownerId));

    for (const bad of [
      { checkId: crypto.randomUUID() },
      { risk: "SAFE" },
      { food: "something else" },
      { a1cBand: "diabetes_range_out_of_scope" }
    ]) {
      const response = await PATCH(
        jsonRequest(`http://test/api/memory/${id}`, "PATCH", bad)
      );
      expect(response.status).toBe(400);
    }

    // The check row is untouched by any of the rejected edits.
    const [chk] = await testDb.db
      .select()
      .from(schema.checks)
      .where(eq(schema.checks.id, check));
    expect(chk.risk).toBe("MODERATE");
  });

  it("400s an out-of-vocabulary enum on edit", async () => {
    const check = await seedCheck(ownerId);
    const id = await saveMemory(ownerId, check, { favorite: true });
    const PATCH = createMemoryEditHandler(deps(ownerId));
    expect(
      (
        await PATCH(
          jsonRequest(`http://test/api/memory/${id}`, "PATCH", {
            ease: "medically fine"
          })
        )
      ).status
    ).toBe(400);
  });

  it("404s editing a memory owned by someone else", async () => {
    const theirCheck = await seedCheck(otherId);
    const theirId = await saveMemory(otherId, theirCheck, { favorite: true });
    const PATCH = createMemoryEditHandler(deps(ownerId));
    const response = await PATCH(
      jsonRequest(`http://test/api/memory/${theirId}`, "PATCH", {
        favorite: false
      })
    );
    expect(response.status).toBe(404);

    // Their row is unchanged.
    const [row] = await testDb.db
      .select()
      .from(schema.mealMemories)
      .where(eq(schema.mealMemories.id, theirId));
    expect(row.favorite).toBe(true);
  });

  it("gates flag 404 → session 401 → capability 403 before touching data", async () => {
    const check = await seedCheck(ownerId);
    const id = await saveMemory(ownerId, check, { favorite: true });
    const req = () =>
      jsonRequest(`http://test/api/memory/${id}`, "PATCH", { favorite: false });
    expect(
      (await createMemoryEditHandler(deps(ownerId, { env: {} }))(req())).status
    ).toBe(404);
    expect(
      (await createMemoryEditHandler(deps(null))(req())).status
    ).toBe(401);
    expect(
      (
        await createMemoryEditHandler(deps(ownerId, { entitlement: FREE }))(
          req()
        )
      ).status
    ).toBe(403);
  });
});

describe("meal memory delete one (DELETE /:id)", () => {
  it("deletes only the caller's own memory", async () => {
    const check = await seedCheck(ownerId);
    const id = await saveMemory(ownerId, check, { favorite: true });
    const DELETE = createMemoryDeleteHandler(deps(ownerId));
    const response = await DELETE(
      jsonRequest(`http://test/api/memory/${id}`, "DELETE")
    );
    expect(response.status).toBe(200);
    expect(await testDb.db.select().from(schema.mealMemories)).toHaveLength(0);
    // The underlying check is NOT deleted with the memory.
    expect(
      await testDb.db
        .select()
        .from(schema.checks)
        .where(eq(schema.checks.id, check))
    ).toHaveLength(1);
  });

  it("404s deleting another user's memory (leaves it intact)", async () => {
    const theirCheck = await seedCheck(otherId);
    const theirId = await saveMemory(otherId, theirCheck, { favorite: true });
    const DELETE = createMemoryDeleteHandler(deps(ownerId));
    const response = await DELETE(
      jsonRequest(`http://test/api/memory/${theirId}`, "DELETE")
    );
    expect(response.status).toBe(404);
    expect(await testDb.db.select().from(schema.mealMemories)).toHaveLength(1);
  });
});

describe("weekly-artifact invalidation on memory mutation (E4)", () => {
  async function seedReflection() {
    await testDb.db.insert(schema.weeklyReflections).values({
      userId: ownerId,
      weekStart: "2026-07-06",
      version: "1",
      artifactCiphertext: encryptField(JSON.stringify({ weekStart: "2026-07-06" }))
    });
  }
  async function ownerReflectionCount() {
    return (
      await testDb.db
        .select()
        .from(schema.weeklyReflections)
        .where(eq(schema.weeklyReflections.userId, ownerId))
    ).length;
  }

  it("a memory EDIT drops the caller's cached weekly reflections", async () => {
    const check = await seedCheck(ownerId);
    const id = await saveMemory(ownerId, check, { favorite: true });
    await seedReflection();

    const PATCH = createMemoryEditHandler(deps(ownerId));
    const res = await PATCH(
      jsonRequest(`http://test/api/memory/${id}`, "PATCH", { label: "dinner" })
    );
    expect(res.status).toBe(200);
    expect(await ownerReflectionCount()).toBe(0);
  });

  it("a memory DELETE drops the caller's cached weekly reflections", async () => {
    const check = await seedCheck(ownerId);
    const id = await saveMemory(ownerId, check, { favorite: true });
    await seedReflection();

    const DELETE = createMemoryDeleteHandler(deps(ownerId));
    const res = await DELETE(jsonRequest(`http://test/api/memory/${id}`, "DELETE"));
    expect(res.status).toBe(200);
    expect(await ownerReflectionCount()).toBe(0);
  });

  it("a memory DELETE-ALL drops the caller's cached weekly reflections", async () => {
    const check = await seedCheck(ownerId);
    await saveMemory(ownerId, check, { favorite: true });
    await seedReflection();

    const DELETE = createMemoryDeleteAllHandler(deps(ownerId));
    const res = await DELETE(
      jsonRequest("http://test/api/memory", "DELETE", { confirm: true })
    );
    expect(res.status).toBe(200);
    expect(await ownerReflectionCount()).toBe(0);
  });
});

describe("meal memory delete all (DELETE)", () => {
  it("deletes every memory the caller owns, and only theirs", async () => {
    const c1 = await seedCheck(ownerId, "rice");
    const c2 = await seedCheck(ownerId, "oats");
    const theirs = await seedCheck(otherId, "rice");
    await saveMemory(ownerId, c1, { favorite: true });
    await saveMemory(ownerId, c2, { favorite: true });
    await createMemoryUpsertHandler(deps(otherId))(
      jsonRequest("http://test/api/memory", "POST", {
        checkId: theirs,
        favorite: true
      })
    );

    const DELETE = createMemoryDeleteAllHandler(deps(ownerId));
    const response = await DELETE(
      jsonRequest("http://test/api/memory", "DELETE", { confirm: true })
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ deleted: 2 });

    // Owner wiped; other user's memory survives.
    expect(
      await testDb.db
        .select()
        .from(schema.mealMemories)
        .where(eq(schema.mealMemories.userId, ownerId))
    ).toHaveLength(0);
    expect(
      await testDb.db
        .select()
        .from(schema.mealMemories)
        .where(eq(schema.mealMemories.userId, otherId))
    ).toHaveLength(1);
  });

  it("400s without an explicit confirm (guards an accidental full wipe)", async () => {
    const c1 = await seedCheck(ownerId);
    await saveMemory(ownerId, c1, { favorite: true });
    const DELETE = createMemoryDeleteAllHandler(deps(ownerId));
    const response = await DELETE(
      jsonRequest("http://test/api/memory", "DELETE", {})
    );
    expect(response.status).toBe(400);
    expect(await testDb.db.select().from(schema.mealMemories)).toHaveLength(1);
  });
});

describe("meal memory export (GET)", () => {
  it("returns all the caller's memories with decrypted fields as a JSON attachment", async () => {
    const c1 = await seedCheck(ownerId, "white rice");
    const c2 = await seedCheck(ownerId, "oatmeal");
    await saveMemory(ownerId, c1, {
      choice: "half portion",
      note: "with eggs",
      ease: "okay",
      favorite: true,
      label: "breakfast"
    });
    await saveMemory(ownerId, c2, { wouldRepeat: false });

    const EXPORT = createMemoryExportHandler(deps(ownerId));
    const response = await EXPORT(
      jsonRequest("http://test/api/memory/export", "GET")
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(response.headers.get("content-disposition")).toContain("attachment");

    const body = await response.json();
    expect(body.count).toBe(2);
    expect(body.memories).toHaveLength(2);
    const riceEntry = body.memories.find(
      (m: { food: string }) => m.food === "white rice"
    );
    expect(riceEntry.choice).toBe("half portion");
    expect(riceEntry.note).toBe("with eggs");
    expect(riceEntry.band).toBe("prediabetes_60_62");
    expect(riceEntry.risk).toBe("MODERATE");
    expect(typeof body.exportedAt).toBe("string");
  });

  it("never exports another user's memories", async () => {
    const theirs = await seedCheck(otherId, "rice");
    await createMemoryUpsertHandler(deps(otherId))(
      jsonRequest("http://test/api/memory", "POST", {
        checkId: theirs,
        favorite: true
      })
    );

    const EXPORT = createMemoryExportHandler(deps(ownerId));
    const body = await (
      await EXPORT(jsonRequest("http://test/api/memory/export", "GET"))
    ).json();
    expect(body.count).toBe(0);
    expect(body.memories).toHaveLength(0);
  });

  // E3: the data-rights export is the ONE memory route that is NOT gated on the
  // feature flag or the premium capability — only the session. A person must be
  // able to get their own data back even with the flag off or a lapsed plan.
  it("export gates on the session ONLY (401), never the flag or capability", async () => {
    const req = () => jsonRequest("http://test/api/memory/export", "GET");

    // Unauthenticated → 401.
    expect(
      (await createMemoryExportHandler(deps(null))(req())).status
    ).toBe(401);

    // Flag OFF but signed in → 200 (not 404).
    expect(
      (await createMemoryExportHandler(deps(ownerId, { env: {} }))(req()))
        .status
    ).toBe(200);

    // Free (non-premium) but signed in → 200 (not 403).
    expect(
      (
        await createMemoryExportHandler(deps(ownerId, { entitlement: FREE }))(
          req()
        )
      ).status
    ).toBe(200);
  });
});
