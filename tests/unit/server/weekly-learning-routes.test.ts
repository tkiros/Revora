import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import { createWeeklyGetHandler } from "../../../app/api/journey/weekly/handlers";
import { createJourneyPostHandler } from "../../../app/api/journey/handlers";
import { WEEKLY_LEARNING_VERSION } from "../../../lib/journey/weekly-learning";
import type { Entitlement } from "../../../lib/server/entitlement";
import { decryptField, encryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const TEST_KEY = Buffer.alloc(32, 9).toString("base64");
const FLAG_ON = { LEARNING_JOURNEY_ENABLED: "1" } as const;
const FLAG_OFF = { LEARNING_JOURNEY_ENABLED: "0" } as const;

// A fixed "now" mid-week: Wed 2026-07-15 (UTC). The current Mon–Sun week starts
// 2026-07-13; the four completed weeks start 07-06, 06-29, 06-22, 06-15.
const NOW = new Date("2026-07-15T12:00:00.000Z");

const PREMIUM: Entitlement = {
  tier: "premium",
  source: "stripe",
  status: "premium",
  currentPeriodEnd: new Date("2026-09-01T00:00:00.000Z")
};
const FREE: Entitlement = {
  tier: "free",
  source: null,
  status: "none",
  currentPeriodEnd: null
};

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let ownerId: string;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = TEST_KEY;
  testDb = await createTestDb();
  const [owner] = await testDb.db
    .insert(schema.users)
    .values({ email: "owner@test.dev" })
    .returning();
  ownerId = owner.id;
  await testDb.db
    .insert(schema.profiles)
    .values({
      userId: ownerId,
      a1cCiphertext: encryptField("6.1"),
      a1cBand: "prediabetes_60_62",
      timezone: "UTC",
      consentedAt: new Date("2026-06-01T00:00:00.000Z")
    });
});

afterAll(async () => {
  delete process.env.HEALTH_DATA_KEY;
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.weeklyReflections);
  await testDb.db.delete(schema.mealMemories);
  await testDb.db.delete(schema.checks);
  await testDb.db.delete(schema.learningJourneys);
});

function deps(
  userId: string | null,
  overrides: {
    entitlement?: Entitlement;
    env?: { LEARNING_JOURNEY_ENABLED?: string };
    now?: () => Date;
  } = {}
) {
  return {
    db: () => testDb.db,
    getSession: async () => (userId ? { userId, email: "owner@test.dev" } : null),
    entitlementOf: async () => overrides.entitlement ?? PREMIUM,
    env: overrides.env ?? FLAG_ON,
    now: overrides.now ?? (() => NOW)
  };
}

async function seedCheck(
  food: string,
  createdAt: Date,
  opts: {
    risk?: "SAFE" | "MODERATE" | "HIGH";
    wasClarified?: boolean;
  } = {}
) {
  await testDb.db.insert(schema.checks).values({
    userId: ownerId,
    foodCiphertext: encryptField(food),
    risk: opts.risk ?? "SAFE",
    a1cBand: "prediabetes_60_62",
    inputMethod: "text",
    wasClarified: opts.wasClarified ?? false,
    createdAt
  });
}

describe("weekly gate order: flag 404 → auth 401 → capability 403", () => {
  it("flag OFF → 404 even for a signed-in premium user", async () => {
    const GET = createWeeklyGetHandler(deps(ownerId, { env: FLAG_OFF }));
    expect((await GET()).status).toBe(404);
  });

  it("flag ON, no session → 401", async () => {
    const GET = createWeeklyGetHandler(deps(null));
    expect((await GET()).status).toBe(401);
  });

  it("flag ON, signed in, free tier → 403", async () => {
    const GET = createWeeklyGetHandler(deps(ownerId, { entitlement: FREE }));
    expect((await GET()).status).toBe(403);
  });
});

describe("GET returns current + history", () => {
  it("empty account: current is a zeroed current-week artifact, history has 4 weeks", async () => {
    const GET = createWeeklyGetHandler(deps(ownerId));
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.version).toBe(WEEKLY_LEARNING_VERSION);
    expect(body.current.weekStart).toBe("2026-07-13");
    expect(body.current.mealsExplored).toBe(0);
    expect(body.current.savedChoices).toBe(0);
    expect(body.history).toHaveLength(4);
    expect(body.history.map((w: { weekStart: string }) => w.weekStart)).toEqual([
      "2026-07-06",
      "2026-06-29",
      "2026-06-22",
      "2026-06-15"
    ]);
  });

  it("current week reflects this week's checks; stage comes from the journey", async () => {
    // Start a journey 3 days ago (day ~4 → stage 1).
    await createJourneyPostHandler(
      deps(ownerId, { now: () => new Date("2026-07-12T12:00:00.000Z") })
    )({ json: async () => ({ action: "start" }) } as unknown as Request);

    await seedCheck("oatmeal", new Date("2026-07-14T09:00:00.000Z"), {
      risk: "MODERATE"
    });
    await seedCheck("oatmeal", new Date("2026-07-15T09:00:00.000Z"), {
      wasClarified: true
    });
    await seedCheck("grilled salmon", new Date("2026-07-14T19:00:00.000Z"));

    const GET = createWeeklyGetHandler(deps(ownerId));
    const body = await (await GET()).json();

    expect(body.stage).toBe(1);
    expect(body.current.mealsExplored).toBe(2); // oatmeal, grilled salmon
    // oatmeal: 2× with clarify/MODERATE → uncertain; user's own text echoed.
    expect(body.current.repeatedUncertainty).toEqual(["oatmeal"]);
    // stage 1, 0 saved this week → save_three unmet.
    expect(body.current.incompleteSteps.length).toBe(1);
  });
});

describe("lazy persistence + idempotent regeneration", () => {
  it("a completed week is persisted once (encrypted) and served identically", async () => {
    // A check in the completed week starting 2026-07-06.
    await seedCheck("brown rice", new Date("2026-07-08T12:00:00.000Z"), {
      risk: "HIGH"
    });

    const GET = createWeeklyGetHandler(deps(ownerId));
    const first = await (await GET()).json();

    const rows = await testDb.db
      .select()
      .from(schema.weeklyReflections)
      .where(eq(schema.weeklyReflections.userId, ownerId));
    // One row per completed week that was requested (4 weeks).
    expect(rows.length).toBe(4);
    const persistedWeek = rows.find((r) => r.weekStart === "2026-07-06");
    expect(persistedWeek).toBeDefined();
    expect(persistedWeek!.version).toBe(WEEKLY_LEARNING_VERSION);
    // Stored as ciphertext, not plaintext JSON.
    expect(persistedWeek!.artifactCiphertext).not.toContain("brown rice");
    const decrypted = JSON.parse(decryptField(persistedWeek!.artifactCiphertext));
    expect(decrypted.weekStart).toBe("2026-07-06");

    // Second GET serves the persisted artifact — byte-identical.
    const second = await (await GET()).json();
    expect(JSON.stringify(second.history)).toBe(JSON.stringify(first.history));

    // No duplicate rows created on the second read.
    const rows2 = await testDb.db
      .select()
      .from(schema.weeklyReflections)
      .where(eq(schema.weeklyReflections.userId, ownerId));
    expect(rows2.length).toBe(4);
  });

  it("a stale-version persisted row is recomputed to the current version", async () => {
    await testDb.db.insert(schema.weeklyReflections).values({
      userId: ownerId,
      weekStart: "2026-07-06",
      version: "0",
      artifactCiphertext: encryptField(JSON.stringify({ stale: true }))
    });

    const GET = createWeeklyGetHandler(deps(ownerId));
    const body = await (await GET()).json();
    const week = body.history.find(
      (w: { weekStart: string }) => w.weekStart === "2026-07-06"
    );
    expect(week.version).toBe(WEEKLY_LEARNING_VERSION);

    const [row] = await testDb.db
      .select()
      .from(schema.weeklyReflections)
      .where(eq(schema.weeklyReflections.userId, ownerId));
    expect(row.version).toBe(WEEKLY_LEARNING_VERSION);
  });
});

describe("completed-week stage uses the tz-aware end-of-week instant (U4)", () => {
  afterEach(async () => {
    // Restore the shared profile's timezone (this suite's other tests assume UTC).
    await testDb.db
      .update(schema.profiles)
      .set({ timezone: "UTC" })
      .where(eq(schema.profiles.userId, ownerId));
  });

  it("attributes a stage boundary that falls in Sunday to the correct (later) stage", async () => {
    // A non-UTC timezone whose local end-of-week (00:00 Mon EDT ≈ 04:00 UTC) sits
    // well after the OLD `keyToUtcMidnight(weekEnd)` = Sun 00:00 UTC.
    await testDb.db
      .update(schema.profiles)
      .set({ timezone: "America/New_York" })
      .where(eq(schema.profiles.userId, ownerId));

    // Journey started Sun 2026-07-05 12:00 UTC. The stage-1→stage-2 boundary
    // (day 7 → day 8, at 7 active days) is 2026-07-12 12:00 UTC — INSIDE the gap
    // between the old Sun-00:00-UTC instant and the true local end-of-week.
    //  - old instant 2026-07-12T00:00Z → 6.5 days → day 7 → stage 1 (wrong)
    //  - new instant ~2026-07-13T03:59:59.999Z → 7.6 days → day 8 → stage 2 (right)
    await createJourneyPostHandler(
      deps(ownerId, { now: () => new Date("2026-07-05T12:00:00.000Z") })
    )({ json: async () => ({ action: "start" }) } as unknown as Request);

    const GET = createWeeklyGetHandler(deps(ownerId));
    const body = await (await GET()).json();
    const week = body.history.find(
      (w: { weekStart: string }) => w.weekStart === "2026-07-06"
    );

    // With an empty week, the sole unmet step is that week's stage headline
    // intent. Stage 2's intent (breakfast/lunch/dinner) — not stage 1's
    // "save three meals" — proves the end-of-week stage was used.
    expect(week.incompleteSteps).toEqual([
      "Save an easy default for breakfast, lunch, and dinner."
    ]);
  });
});

describe("lazy persistence is guarded on consent (E5)", () => {
  it("skips the lazy insert when the profiles (consent) row is gone", async () => {
    // Withdrawal has removed the profile; a racing weekly read must NOT resurrect
    // a reflection behind the erase.
    await testDb.db
      .delete(schema.profiles)
      .where(eq(schema.profiles.userId, ownerId));

    const GET = createWeeklyGetHandler(deps(ownerId));
    expect((await GET()).status).toBe(200);

    const rows = await testDb.db
      .select()
      .from(schema.weeklyReflections)
      .where(eq(schema.weeklyReflections.userId, ownerId));
    expect(rows).toHaveLength(0);

    // Restore the shared profile for the remaining suite.
    await testDb.db.insert(schema.profiles).values({
      userId: ownerId,
      a1cCiphertext: encryptField("6.1"),
      a1cBand: "prediabetes_60_62",
      timezone: "UTC",
      consentedAt: new Date("2026-06-01T00:00:00.000Z")
    });
  });
});
