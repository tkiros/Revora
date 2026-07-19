import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  createHistoryGetHandler,
  createHistoryMigrateHandler,
  createHistoryActionHandler,
  createHistoryDeleteHandler,
  createHistoryExportHandler,
  createHistorySearchHandler
} from "../../../app/api/history/handlers";
import { encryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const TEST_KEY = Buffer.alloc(32, 5).toString("base64");

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
  await testDb.db.delete(schema.checks);
});

function asUser(userId: string | null) {
  return {
    db: () => testDb.db,
    getSession: async () =>
      userId ? { userId, email: "owner@test.dev" } : null
  };
}

// The default getEntitlement (no subscription rows) reports free; inject a
// premium entitlement to exercise the full-archive path.
function asPremium(userId: string) {
  return {
    ...asUser(userId),
    entitlementOf: async () => ({
      tier: "premium" as const,
      source: "stripe" as const,
      status: "premium" as const,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    })
  };
}

async function seedAt(
  userId: string,
  food: string,
  createdAt: Date,
  clientId?: string
) {
  await testDb.db.insert(schema.checks).values({
    userId,
    foodCiphertext: encryptField(food),
    risk: "MODERATE",
    a1cBand: "prediabetes_60_62",
    inputMethod: "text",
    clientId: clientId ?? null,
    createdAt
  });
}

const DAY_MS = 24 * 60 * 60 * 1000;

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

async function seedCheck(
  userId: string,
  food: string,
  clientId?: string,
  inputMethod: "text" | "voice" | "photo" = "text"
) {
  await testDb.db.insert(schema.checks).values({
    userId,
    foodCiphertext: encryptField(food),
    risk: "MODERATE",
    a1cBand: "prediabetes_60_62",
    inputMethod,
    clientId: clientId ?? null
  });
}

describe("GET /api/history", () => {
  it("401s signed-out requests", async () => {
    const GET = createHistoryGetHandler(asUser(null));
    const response = await GET(new Request("http://test/api/history"));

    expect(response.status).toBe(401);
  });

  it("returns only the owner's checks, food decrypted", async () => {
    await seedCheck(ownerId, "lentil soup");
    await seedCheck(otherId, "other users pasta");

    const GET = createHistoryGetHandler(asUser(ownerId));
    const response = await GET(new Request("http://test/api/history"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.checks).toHaveLength(1);
    expect(body.checks[0].food).toBe("lentil soup");
    expect(JSON.stringify(body)).not.toContain("other users pasta");
  });

  it("round-trips the photo input method through DB → API (no collapse to text)", async () => {
    await seedCheck(ownerId, "chicken and rice bowl", "photo-1", "photo");

    const GET = createHistoryGetHandler(asUser(ownerId));
    const response = await GET(new Request("http://test/api/history"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.checks).toHaveLength(1);
    expect(body.checks[0].inputMethod).toBe("photo");
  });

  it("caps the page size", async () => {
    for (let i = 0; i < 5; i += 1) {
      await seedCheck(ownerId, `meal ${i}`);
    }

    const GET = createHistoryGetHandler(asUser(ownerId));
    const response = await GET(
      new Request("http://test/api/history?limit=2")
    );
    const body = await response.json();

    expect(body.checks).toHaveLength(2);
  });
});

describe("POST /api/history/migrate", () => {
  const storedCheck = (clientId: string, food = "oatmeal with nuts") => ({
    clientId,
    food,
    risk: "MODERATE",
    a1cBand: "prediabetes_60_62",
    inputMethod: "text",
    createdAt: "2026-06-30T12:00:00.000Z"
  });

  it("401s signed-out requests", async () => {
    const POST = createHistoryMigrateHandler(asUser(null));
    const response = await POST(
      jsonRequest("http://test/api/history/migrate", {
        checks: [storedCheck("a")]
      })
    );

    expect(response.status).toBe(401);
  });

  it("imports local checks encrypted, keeping the original timestamps", async () => {
    const POST = createHistoryMigrateHandler(asUser(ownerId));
    const response = await POST(
      jsonRequest("http://test/api/history/migrate", {
        checks: [storedCheck("local-1"), storedCheck("local-2", "salad bowl")]
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.imported).toBe(2);

    const rows = await testDb.db
      .select()
      .from(schema.checks)
      .where(eq(schema.checks.userId, ownerId));
    expect(rows).toHaveLength(2);
    // encrypted at rest — no plaintext food in any column
    for (const row of rows) {
      expect(JSON.stringify(row)).not.toMatch(/oatmeal|salad/);
    }
    expect(rows[0].createdAt.toISOString()).toBe("2026-06-30T12:00:00.000Z");
  });

  it("is idempotent — re-running the same migration imports nothing new", async () => {
    const POST = createHistoryMigrateHandler(asUser(ownerId));
    const payload = { checks: [storedCheck("dup-1")] };

    await POST(jsonRequest("http://test/api/history/migrate", payload));
    const second = await POST(
      jsonRequest("http://test/api/history/migrate", payload)
    );
    const body = await second.json();

    expect(body.imported).toBe(0);

    const rows = await testDb.db
      .select()
      .from(schema.checks)
      .where(eq(schema.checks.userId, ownerId));
    expect(rows).toHaveLength(1);
  });

  /**
   * N-27 — migrate imports rows the CLIENT authored (localStorage is freely
   * editable). Self-affecting only, but a forged timeline still corrupts the
   * streak and BAI series we later hand back as if we had observed them.
   */
  describe("server-side sanity bounds (N-27)", () => {
    const iso = (offsetMs: number) => new Date(Date.now() + offsetMs).toISOString();
    const DAY = 24 * 60 * 60 * 1000;

    async function migrate(check: Record<string, unknown>) {
      const POST = createHistoryMigrateHandler(asUser(ownerId));
      return POST(
        jsonRequest("http://test/api/history/migrate", { checks: [check] })
      );
    }

    it("rejects a createdAt in the future — nobody ate tomorrow's lunch", async () => {
      const response = await migrate({
        ...storedCheck("future-1"),
        createdAt: iso(2 * DAY)
      });

      expect(response.status).toBe(400);
      const rows = await testDb.db
        .select()
        .from(schema.checks)
        .where(eq(schema.checks.userId, ownerId));
      expect(rows).toHaveLength(0);
    });

    it("rejects an absurdly old createdAt", async () => {
      const response = await migrate({
        ...storedCheck("ancient-1"),
        createdAt: iso(-3 * 365 * DAY)
      });

      expect(response.status).toBe(400);
    });

    it("tolerates ordinary client-clock skew (a few minutes fast)", async () => {
      // Real devices drift. Rejecting them would silently drop honest history.
      const response = await migrate({
        ...storedCheck("skew-1"),
        createdAt: iso(60 * 1000)
      });

      expect(response.status).toBe(200);
      expect((await response.json()).imported).toBe(1);
    });

    it("rejects a future actionDoneAt (it forges the BAI follow-through metric)", async () => {
      const response = await migrate({
        ...storedCheck("future-action"),
        actionDoneAt: iso(5 * DAY)
      });

      expect(response.status).toBe(400);
    });

    it("rejects an a1cBand the app itself would never write", async () => {
      const response = await migrate({
        ...storedCheck("bad-band"),
        a1cBand: "totally_healthy_lol"
      });

      expect(response.status).toBe(400);
    });

    it("still accepts every band the app DOES write", async () => {
      const bands = [
        "below_prediabetes_range",
        "prediabetes_57_59",
        "prediabetes_60_62",
        "prediabetes_63_64",
        "diabetes_range_out_of_scope"
      ];
      const POST = createHistoryMigrateHandler(asUser(ownerId));
      const response = await POST(
        jsonRequest("http://test/api/history/migrate", {
          checks: bands.map((band, i) => ({
            ...storedCheck(`band-${i}`),
            a1cBand: band
          }))
        })
      );

      expect(response.status).toBe(200);
      expect((await response.json()).imported).toBe(bands.length);
    });
  });

  it("accepts a photo-method entry and stores it as photo (no collapse to text)", async () => {
    const POST = createHistoryMigrateHandler(asUser(ownerId));
    const response = await POST(
      jsonRequest("http://test/api/history/migrate", {
        checks: [{ ...storedCheck("photo-mig-1"), inputMethod: "photo" }]
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.imported).toBe(1);

    const rows = await testDb.db
      .select()
      .from(schema.checks)
      .where(eq(schema.checks.userId, ownerId));
    expect(rows).toHaveLength(1);
    expect(rows[0].inputMethod).toBe("photo");
  });

  it("rejects an inputMethod the app itself would never write", async () => {
    const POST = createHistoryMigrateHandler(asUser(ownerId));
    const response = await POST(
      jsonRequest("http://test/api/history/migrate", {
        checks: [{ ...storedCheck("bad-method"), inputMethod: "telepathy" }]
      })
    );

    expect(response.status).toBe(400);
  });

  it("rejects oversized payloads", async () => {
    const POST = createHistoryMigrateHandler(asUser(ownerId));
    const response = await POST(
      jsonRequest("http://test/api/history/migrate", {
        checks: Array.from({ length: 501 }, (_, i) => storedCheck(`c${i}`))
      })
    );

    expect(response.status).toBe(400);
  });

  it("carries actionDoneAt through the migration", async () => {
    const POST = createHistoryMigrateHandler(asUser(ownerId));
    await POST(
      jsonRequest("http://test/api/history/migrate", {
        checks: [
          {
            ...storedCheck("acted-1"),
            actionDoneAt: "2026-06-30T13:00:00.000Z"
          }
        ]
      })
    );

    const rows = await testDb.db
      .select()
      .from(schema.checks)
      .where(eq(schema.checks.userId, ownerId));
    expect(rows[0].actionDoneAt?.toISOString()).toBe(
      "2026-06-30T13:00:00.000Z"
    );
  });
});

describe("POST /api/history/action", () => {
  it("marks the owner's check done and never another user's", async () => {
    await seedCheck(ownerId, "walk meal", "act-1");
    await seedCheck(otherId, "other meal", "act-1");

    const POST = createHistoryActionHandler(asUser(ownerId));
    const response = await POST(
      jsonRequest("http://test/api/history/action", { clientId: "act-1" })
    );

    expect(response.status).toBe(200);

    const ownerRows = await testDb.db
      .select()
      .from(schema.checks)
      .where(eq(schema.checks.userId, ownerId));
    const otherRows = await testDb.db
      .select()
      .from(schema.checks)
      .where(eq(schema.checks.userId, otherId));

    expect(ownerRows[0].actionDoneAt).toBeTruthy();
    expect(otherRows[0].actionDoneAt).toBeNull();
  });
});

describe("GET /api/history — keyset pagination", () => {
  it("walks every row exactly once across page boundaries, even at a shared timestamp", async () => {
    // Three rows share one millisecond — a timestamp-only keyset would skip or
    // duplicate them at a page boundary; the (createdAt, id) tiebreaker must not.
    const shared = new Date("2026-07-10T12:00:00.000Z");
    await seedAt(ownerId, "food-a", shared);
    await seedAt(ownerId, "food-b", shared);
    await seedAt(ownerId, "food-c", shared);
    await seedAt(ownerId, "food-d", new Date("2026-07-10T09:00:00.000Z"));
    await seedAt(ownerId, "food-e", new Date("2026-07-09T09:00:00.000Z"));

    const GET = createHistoryGetHandler(asPremium(ownerId));
    const seen: string[] = [];
    let cursor: string | null = null;
    let guard = 0;

    do {
      const url = new URL("http://test/api/history");
      url.searchParams.set("limit", "2");
      if (cursor) url.searchParams.set("cursor", cursor);
      const body = await (await GET(new Request(url))).json();
      for (const c of body.checks) seen.push(c.food);
      cursor = body.nextCursor;
      guard += 1;
    } while (cursor && guard < 20);

    expect(seen.sort()).toEqual([
      "food-a",
      "food-b",
      "food-c",
      "food-d",
      "food-e"
    ]);
    // No row returned twice.
    expect(new Set(seen).size).toBe(seen.length);
  });

  it("returns a null cursor on the final (short) page", async () => {
    await seedAt(ownerId, "only-one", new Date("2026-07-10T12:00:00.000Z"));
    const GET = createHistoryGetHandler(asPremium(ownerId));
    const body = await (
      await GET(new Request("http://test/api/history?limit=5"))
    ).json();

    expect(body.checks).toHaveLength(1);
    expect(body.nextCursor).toBeNull();
  });
});

describe("GET /api/history — retention window", () => {
  it("free tier hides rows older than the 7-day window; premium sees them", async () => {
    await seedAt(ownerId, "recent meal", new Date());
    await seedAt(ownerId, "old meal", new Date(Date.now() - 30 * DAY_MS));

    const freeBody = await (
      await createHistoryGetHandler(asUser(ownerId))(
        new Request("http://test/api/history")
      )
    ).json();
    expect(freeBody.checks.map((c: { food: string }) => c.food)).toEqual([
      "recent meal"
    ]);
    expect(freeBody.meta.tier).toBe("free");
    expect(freeBody.meta.retention.windowDays).toBe(7);

    const premiumBody = await (
      await createHistoryGetHandler(asPremium(ownerId))(
        new Request("http://test/api/history")
      )
    ).json();
    expect(
      premiumBody.checks.map((c: { food: string }) => c.food).sort()
    ).toEqual(["old meal", "recent meal"]);
    expect(premiumBody.meta.tier).toBe("premium");
    expect(premiumBody.meta.retention.scope).toBe("full");
    expect(premiumBody.meta.retention.windowDays).toBeNull();
  });
});

describe("POST /api/history/search", () => {
  // Search is POST-only: the query term is meal text (health data), which plan
  // §16 forbids in URLs/logs — so it travels in the request body, never a URL.
  it("matches decrypted food case-insensitively and reports the scan bound", async () => {
    await seedAt(ownerId, "Lentil Soup", new Date("2026-07-10T12:00:00.000Z"));
    await seedAt(ownerId, "chicken rice", new Date("2026-07-10T11:00:00.000Z"));
    await seedAt(ownerId, "lentil dahl", new Date("2026-07-10T10:00:00.000Z"));

    const POST = createHistorySearchHandler(asPremium(ownerId));
    const body = await (
      await POST(
        jsonRequest("http://test/api/history/search", { q: "LENTIL" })
      )
    ).json();

    expect(body.checks.map((c: { food: string }) => c.food).sort()).toEqual([
      "Lentil Soup",
      "lentil dahl"
    ]);
    expect(body.searchScanned).toBe(3);
    expect(body.searchCapped).toBe(false);
    // Search is a single bounded scan — no pagination cursor.
    expect(body.nextCursor).toBeNull();
  });

  it("still honors the free window while searching", async () => {
    await seedAt(ownerId, "lentil recent", new Date());
    await seedAt(ownerId, "lentil ancient", new Date(Date.now() - 30 * DAY_MS));

    const POST = createHistorySearchHandler(asUser(ownerId));
    const body = await (
      await POST(
        jsonRequest("http://test/api/history/search", { q: "lentil" })
      )
    ).json();

    expect(body.checks.map((c: { food: string }) => c.food)).toEqual([
      "lentil recent"
    ]);
  });

  it("honors a date filter passed in the body", async () => {
    await seedAt(ownerId, "lentil in range", new Date("2026-07-09T12:00:00.000Z"));
    await seedAt(ownerId, "lentil out of range", new Date("2026-07-20T12:00:00.000Z"));

    const POST = createHistorySearchHandler(asPremium(ownerId));
    const body = await (
      await POST(
        jsonRequest("http://test/api/history/search", {
          q: "lentil",
          from: "2026-07-09",
          to: "2026-07-09"
        })
      )
    ).json();

    expect(body.checks.map((c: { food: string }) => c.food)).toEqual([
      "lentil in range"
    ]);
  });

  it("401s signed-out search and 400s an empty query", async () => {
    const signedOut = createHistorySearchHandler(asUser(null));
    expect(
      (
        await signedOut(
          jsonRequest("http://test/api/history/search", { q: "x" })
        )
      ).status
    ).toBe(401);

    const POST = createHistorySearchHandler(asPremium(ownerId));
    expect(
      (
        await POST(jsonRequest("http://test/api/history/search", { q: "" }))
      ).status
    ).toBe(400);
  });

  it("GET /api/history ignores any q on the query string (search is POST-only)", async () => {
    await seedAt(ownerId, "chicken rice", new Date("2026-07-10T12:00:00.000Z"));
    await seedAt(ownerId, "lentil dahl", new Date("2026-07-10T11:00:00.000Z"));

    // A stray ?q= must NOT filter — it is simply ignored by the paginated read.
    const GET = createHistoryGetHandler(asPremium(ownerId));
    const body = await (
      await GET(new Request("http://test/api/history?q=lentil"))
    ).json();

    expect(body.checks).toHaveLength(2);
    expect(body.searchScanned).toBeUndefined();
  });
});

describe("GET /api/history — date filter", () => {
  it("filters to the inclusive UTC day range", async () => {
    await seedAt(ownerId, "before range", new Date("2026-07-08T23:59:00.000Z"));
    await seedAt(ownerId, "start of range", new Date("2026-07-09T00:00:00.000Z"));
    await seedAt(ownerId, "end of range", new Date("2026-07-10T23:59:00.000Z"));
    await seedAt(ownerId, "after range", new Date("2026-07-11T00:00:00.000Z"));

    const GET = createHistoryGetHandler(asPremium(ownerId));
    const body = await (
      await GET(
        new Request("http://test/api/history?from=2026-07-09&to=2026-07-10")
      )
    ).json();

    expect(body.checks.map((c: { food: string }) => c.food).sort()).toEqual([
      "end of range",
      "start of range"
    ]);
  });
});

describe("DELETE /api/history/:id", () => {
  it("hard-deletes the owner's row", async () => {
    await seedAt(ownerId, "to delete", new Date());
    const [row] = await testDb.db
      .select()
      .from(schema.checks)
      .where(eq(schema.checks.userId, ownerId));

    const DELETE = createHistoryDeleteHandler(asUser(ownerId));
    const response = await DELETE(
      new Request(`http://test/api/history/${row.id}`, { method: "DELETE" })
    );

    expect(response.status).toBe(200);
    const remaining = await testDb.db
      .select()
      .from(schema.checks)
      .where(eq(schema.checks.userId, ownerId));
    expect(remaining).toHaveLength(0);
  });

  it("404s and preserves the row when a user targets someone else's check", async () => {
    await seedAt(otherId, "not yours", new Date());
    const [victim] = await testDb.db
      .select()
      .from(schema.checks)
      .where(eq(schema.checks.userId, otherId));

    const DELETE = createHistoryDeleteHandler(asUser(ownerId));
    const response = await DELETE(
      new Request(`http://test/api/history/${victim.id}`, { method: "DELETE" })
    );

    expect(response.status).toBe(404);
    const stillThere = await testDb.db
      .select()
      .from(schema.checks)
      .where(eq(schema.checks.id, victim.id));
    expect(stillThere).toHaveLength(1);
  });

  it("401s signed-out delete", async () => {
    const DELETE = createHistoryDeleteHandler(asUser(null));
    const response = await DELETE(
      new Request("http://test/api/history/anything", { method: "DELETE" })
    );
    expect(response.status).toBe(401);
  });

  it("invalidates the caller's cached weekly artifacts (E4)", async () => {
    // A persisted weekly artifact can embed this check's meal text; deleting the
    // source check must drop the reflection so the next weekly GET regenerates
    // from current sources (no stale food surviving inside a cached artifact).
    await seedAt(ownerId, "brown rice", new Date());
    const [row] = await testDb.db
      .select()
      .from(schema.checks)
      .where(eq(schema.checks.userId, ownerId));
    await testDb.db.insert(schema.weeklyReflections).values({
      userId: ownerId,
      weekStart: "2026-07-06",
      version: "1",
      artifactCiphertext: encryptField(
        JSON.stringify({ weekStart: "2026-07-06", repeatedUncertainty: ["brown rice"] })
      )
    });

    const DELETE = createHistoryDeleteHandler(asUser(ownerId));
    const response = await DELETE(
      new Request(`http://test/api/history/${row.id}`, { method: "DELETE" })
    );
    expect(response.status).toBe(200);

    const reflections = await testDb.db
      .select()
      .from(schema.weeklyReflections)
      .where(eq(schema.weeklyReflections.userId, ownerId));
    expect(reflections).toHaveLength(0);
  });
});

describe("GET /api/history/export", () => {
  it("returns ALL retained rows regardless of the free view window", async () => {
    await seedAt(ownerId, "recent meal", new Date());
    await seedAt(ownerId, "very old meal", new Date(Date.now() - 60 * DAY_MS));
    await seedCheck(otherId, "other user meal");

    // Free-tier caller: the VIEW is 7 days, but export is a data right.
    const GET = createHistoryExportHandler(asUser(ownerId));
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-disposition")).toContain("attachment");
    const body = await response.json();
    expect(body.count).toBe(2);
    expect(body.checks.map((c: { food: string }) => c.food).sort()).toEqual([
      "recent meal",
      "very old meal"
    ]);
    expect(JSON.stringify(body)).not.toContain("other user meal");
  });

  it("401s signed-out export", async () => {
    const GET = createHistoryExportHandler(asUser(null));
    expect((await GET()).status).toBe(401);
  });
});
