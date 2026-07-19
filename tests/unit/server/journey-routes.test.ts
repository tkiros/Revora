import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  createJourneyGetHandler,
  createJourneyPostHandler
} from "../../../app/api/journey/handlers";
import type { Entitlement } from "../../../lib/server/entitlement";
import { schema } from "../../../lib/server/db";
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

beforeAll(async () => {
  testDb = await createTestDb();
  const [owner] = await testDb.db
    .insert(schema.users)
    .values({ email: "owner@test.dev" })
    .returning();
  ownerId = owner.id;
});

afterAll(async () => {
  await testDb.close();
});

beforeEach(async () => {
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
});
