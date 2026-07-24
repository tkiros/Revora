import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  createJourneyGetHandler,
  createJourneyPostHandler
} from "../../../app/api/journey/handlers";
import type { Entitlement } from "../../../lib/server/entitlement";
import { schema } from "../../../lib/server/db";
import { encryptField } from "../../../lib/server/crypto";
import { createTestDb } from "../../helpers/test-db";

const DAY_MS = 24 * 60 * 60 * 1000;
const FLAG_ON = { LEARNING_JOURNEY_ENABLED: "1" } as const;
const FLAG_OFF = { LEARNING_JOURNEY_ENABLED: "0" } as const;

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

const TEST_KEY = Buffer.alloc(32, 7).toString("base64");

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = TEST_KEY;
  testDb = await createTestDb();
  const [owner] = await testDb.db
    .insert(schema.users)
    .values({ email: "owner@test.dev" })
    .returning();
  ownerId = owner.id;
});

afterAll(async () => {
  await testDb.close();
  delete process.env.HEALTH_DATA_KEY;
});

beforeEach(async () => {
  await testDb.db.delete(schema.learningJourneys);
  await testDb.db.delete(schema.profiles);
});

/** Insert a minimal profile for the owner with a given nudge cadence. */
async function seedProfile(cadence: "daily" | "few_per_week" | "weekly") {
  await testDb.db.insert(schema.profiles).values({
    userId: ownerId,
    a1cCiphertext: encryptField("6.1"),
    a1cBand: "prediabetes_60_62",
    nudgeCadence: cadence,
    consentedAt: new Date("2026-01-01T00:00:00.000Z")
  });
}

async function ownerCadence() {
  const [row] = await testDb.db
    .select({ cadence: schema.profiles.nudgeCadence })
    .from(schema.profiles)
    .where(eq(schema.profiles.userId, ownerId));
  return row?.cadence ?? null;
}

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
    now: overrides.now ?? (() => new Date("2026-01-01T00:00:00.000Z"))
  };
}

function postRequest(body: unknown) {
  return new Request("http://test/api/journey", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("journey gate order: flag 404 → auth 401 → capability 403", () => {
  it("flag OFF → 404 even for a signed-in premium user", async () => {
    const GET = createJourneyGetHandler(deps(ownerId, { env: FLAG_OFF }));
    expect((await GET()).status).toBe(404);
    const POST = createJourneyPostHandler(deps(ownerId, { env: FLAG_OFF }));
    expect((await POST(postRequest({ action: "start" }))).status).toBe(404);
  });

  it("flag ON, no session → 401", async () => {
    const GET = createJourneyGetHandler(deps(null));
    expect((await GET()).status).toBe(401);
    const POST = createJourneyPostHandler(deps(null));
    expect((await POST(postRequest({ action: "start" }))).status).toBe(401);
  });

  it("flag ON, signed in, free tier → 403", async () => {
    const GET = createJourneyGetHandler(deps(ownerId, { entitlement: FREE }));
    expect((await GET()).status).toBe(403);
    const POST = createJourneyPostHandler(
      deps(ownerId, { entitlement: FREE })
    );
    expect((await POST(postRequest({ action: "start" }))).status).toBe(403);
  });
});

describe("GET returns derived state", () => {
  it("not_started for a user with no row", async () => {
    const GET = createJourneyGetHandler(deps(ownerId));
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.journey.state).toBe("not_started");
    expect(body.journey.day).toBe(0);
    expect(body.journey.stage).toBeNull();
    expect(body.currentStage).toBeNull();
    expect(body.stages).toHaveLength(5);
  });
});

describe("POST applies the state machine and persists", () => {
  it("start creates the singleton row and returns active day 1 stage 1", async () => {
    const POST = createJourneyPostHandler(deps(ownerId));
    const response = await POST(postRequest({ action: "start" }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.journey.state).toBe("active");
    expect(body.journey.day).toBe(1);
    expect(body.journey.stage).toBe(1);
    expect(body.currentStage.name).toBe("Get oriented");

    const rows = await testDb.db
      .select()
      .from(schema.learningJourneys)
      .where(eq(schema.learningJourneys.userId, ownerId));
    expect(rows).toHaveLength(1);
    expect(rows[0].state).toBe("active");
  });

  it("AUD-020: a true concurrent double-start yields one success + one 409, never a 500", async () => {
    const POST = createJourneyPostHandler(deps(ownerId));
    // Promise.all against the real Postgres UNIQUE(user_id): both requests
    // read not_started, both attempt the insert — one row lands, the loser is
    // translated to the same 409 as an illegal transition. No 500, no reset.
    const responses = await Promise.all([
      POST(postRequest({ action: "start" })),
      POST(postRequest({ action: "start" }))
    ]);
    const statuses = responses.map((r) => r.status).sort();
    expect(statuses).toEqual([200, 409]);

    const rows = await testDb.db
      .select()
      .from(schema.learningJourneys)
      .where(eq(schema.learningJourneys.userId, ownerId));
    expect(rows).toHaveLength(1);
    expect(rows[0].state).toBe("active");
  });

  it("pause then resume freezes the day count across the paused span", async () => {
    const start = new Date("2026-01-01T00:00:00.000Z");
    // Start on day 1.
    await createJourneyPostHandler(deps(ownerId, { now: () => start }))(
      postRequest({ action: "start" })
    );
    // On day 4 (3 active days later), pause.
    const pauseAt = new Date(start.getTime() + 3 * DAY_MS);
    const pauseRes = await createJourneyPostHandler(
      deps(ownerId, { now: () => pauseAt })
    )(postRequest({ action: "pause" }));
    expect((await pauseRes.json()).journey.state).toBe("paused");

    // A month later, GET still reports day 4, paused.
    const monthLater = new Date(pauseAt.getTime() + 30 * DAY_MS);
    const midBody = await (
      await createJourneyGetHandler(deps(ownerId, { now: () => monthLater }))()
    ).json();
    expect(midBody.journey.state).toBe("paused");
    expect(midBody.journey.day).toBe(4);

    // Resume 30 days into the pause.
    const resumeRes = await createJourneyPostHandler(
      deps(ownerId, { now: () => monthLater })
    )(postRequest({ action: "resume" }));
    const resumeBody = await resumeRes.json();
    expect(resumeBody.journey.state).toBe("active");
    expect(resumeBody.journey.day).toBe(4);

    // The banked pause persisted (30 days in ms).
    const [row] = await testDb.db
      .select()
      .from(schema.learningJourneys)
      .where(eq(schema.learningJourneys.userId, ownerId));
    expect(row.accumulatedPauseMs).toBe(30 * DAY_MS);
    expect(row.pausedAt).toBeNull();
  });

  it("graduate then maintenance walks the terminal path", async () => {
    await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "start" })
    );
    const gradRes = await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "graduate" })
    );
    expect((await gradRes.json()).journey.state).toBe("graduated");
    const maintRes = await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "maintenance" })
    );
    expect((await maintRes.json()).journey.state).toBe("maintenance");
  });

  it("pause with a bounded reason persists pause_reason (plan §P4.4)", async () => {
    await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "start" })
    );
    const res = await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "pause", reason: "life_event" })
    );
    expect(res.status).toBe(200);
    expect((await res.json()).journey.state).toBe("paused");
    const [row] = await testDb.db
      .select()
      .from(schema.learningJourneys)
      .where(eq(schema.learningJourneys.userId, ownerId));
    expect(row.pauseReason).toBe("life_event");

    // Resuming clears the stored reason (like paused_at).
    const resume = await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "resume" })
    );
    expect(resume.status).toBe(200);
    const [after] = await testDb.db
      .select()
      .from(schema.learningJourneys)
      .where(eq(schema.learningJourneys.userId, ownerId));
    expect(after.pauseReason).toBeNull();
  });

  it("pause with no reason stores null pause_reason", async () => {
    await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "start" })
    );
    await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "pause" })
    );
    const [row] = await testDb.db
      .select()
      .from(schema.learningJourneys)
      .where(eq(schema.learningJourneys.userId, ownerId));
    expect(row.pauseReason).toBeNull();
  });

  it("pause with an out-of-enum reason → 400 (bounded enum only)", async () => {
    await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "start" })
    );
    const res = await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "pause", reason: "just_because" })
    );
    expect(res.status).toBe(400);
  });

  it("graduate_maintenance walks active → maintenance in ONE request", async () => {
    await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "start" })
    );
    const res = await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "graduate_maintenance" })
    );
    expect(res.status).toBe(200);
    expect((await res.json()).journey.state).toBe("maintenance");
    const [row] = await testDb.db
      .select()
      .from(schema.learningJourneys)
      .where(eq(schema.learningJourneys.userId, ownerId));
    expect(row.state).toBe("maintenance");
    expect(row.graduatedAt).not.toBeNull();
    expect(row.maintenanceAt).not.toBeNull();
  });

  it("graduate_maintenance from not_started → 409, no row created", async () => {
    const res = await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "graduate_maintenance" })
    );
    expect(res.status).toBe(409);
    const rows = await testDb.db
      .select()
      .from(schema.learningJourneys)
      .where(eq(schema.learningJourneys.userId, ownerId));
    expect(rows).toHaveLength(0);
  });

  it("entering maintenance relaxes a DAILY nudge cadence to WEEKLY", async () => {
    await seedProfile("daily");
    await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "start" })
    );
    await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "graduate_maintenance" })
    );
    expect(await ownerCadence()).toBe("weekly");
  });

  it("entering maintenance leaves a non-daily cadence untouched", async () => {
    await seedProfile("few_per_week");
    await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "start" })
    );
    await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "graduate" })
    );
    // Cadence unchanged after graduate (not yet maintenance).
    expect(await ownerCadence()).toBe("few_per_week");
    await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "maintenance" })
    );
    // Still untouched — we only ever relax daily → weekly.
    expect(await ownerCadence()).toBe("few_per_week");
  });

  it("illegal transition (resume when not paused) → 409, row unchanged", async () => {
    await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "start" })
    );
    const res = await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "resume" })
    );
    expect(res.status).toBe(409);
    const [row] = await testDb.db
      .select()
      .from(schema.learningJourneys)
      .where(eq(schema.learningJourneys.userId, ownerId));
    expect(row.state).toBe("active");
  });

  it("double start → 409 (one journey per user, no hidden reset)", async () => {
    await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "start" })
    );
    const res = await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "start" })
    );
    expect(res.status).toBe(409);
    const rows = await testDb.db
      .select()
      .from(schema.learningJourneys)
      .where(eq(schema.learningJourneys.userId, ownerId));
    expect(rows).toHaveLength(1);
  });

  it("unknown action → 400", async () => {
    const res = await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "explode" })
    );
    expect(res.status).toBe(400);
  });

  it("CAS miss (a concurrent action already moved the journey) → 409 (U2)", async () => {
    // Start an active journey, then process a legal `pause` against a db whose
    // compare-and-swap UPDATE lands on zero rows — the deterministic stand-in
    // for a concurrent action that already advanced the stored state between our
    // read and our write. It must convert to 409, not a silent clobber.
    await createJourneyPostHandler(deps(ownerId))(
      postRequest({ action: "start" })
    );

    const base = deps(ownerId);
    const stubDb = new Proxy(base.db(), {
      get(target, prop, receiver) {
        if (prop === "update") {
          // Any UPDATE in this handler is the CAS write (pause does not touch
          // profiles) — force it to report zero affected rows.
          return () => ({
            set: () => ({
              where: () => ({ returning: async () => [] })
            })
          });
        }
        return Reflect.get(target, prop, receiver);
      }
    });

    const POST = createJourneyPostHandler({ ...base, db: () => stubDb });
    const res = await POST(postRequest({ action: "pause" }));
    expect(res.status).toBe(409);

    // The real row is untouched — still active (no hidden reset).
    const [row] = await testDb.db
      .select()
      .from(schema.learningJourneys)
      .where(eq(schema.learningJourneys.userId, ownerId));
    expect(row.state).toBe("active");
  });
});
