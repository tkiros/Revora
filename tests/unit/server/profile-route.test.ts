import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  createProfilePatchHandler,
  createProfileRouteHandlers
} from "../../../app/api/profile/route";
import { decryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const TEST_KEY = Buffer.alloc(32, 9).toString("base64");

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let userId: string;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = TEST_KEY;
  testDb = await createTestDb();
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: "profile@test.dev" })
    .returning();
  userId = user.id;
});

afterAll(async () => {
  delete process.env.HEALTH_DATA_KEY;
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db
    .delete(schema.pushSubscriptions)
    .where(eq(schema.pushSubscriptions.userId, userId));
  await testDb.db
    .delete(schema.profiles)
    .where(eq(schema.profiles.userId, userId));
});

function handlersAs(sessionUserId: string | null) {
  return createProfileRouteHandlers({
    db: () => testDb.db,
    getSession: async () =>
      sessionUserId ? { userId: sessionUserId, email: "profile@test.dev" } : null
  });
}

function postRequest(body: unknown) {
  return new Request("http://test/api/profile", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

function patchRequest(body: unknown) {
  return new Request("http://test/api/profile", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("POST /api/profile", () => {
  it("rejects unauthenticated requests", async () => {
    const { POST } = handlersAs(null);
    const response = await POST(
      postRequest({ a1c: 6.1, consent: true, timezone: "America/New_York" })
    );

    expect(response.status).toBe(401);
  });

  it("refuses to create a profile without explicit consent", async () => {
    const { POST } = handlersAs(userId);
    const response = await POST(
      postRequest({ a1c: 6.1, consent: false, timezone: "America/New_York" })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/consent/i);
  });

  it("returns boundary guidance (never a verdict) for out-of-range A1C", async () => {
    const { POST } = handlersAs(userId);
    const response = await POST(
      postRequest({ a1c: 7.2, consent: true, timezone: "America/New_York" })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(
      /range clinicians use when evaluating Type 2 diabetes/i
    );
  });

  it("creates the profile with encrypted A1C, band, timezone, consent stamp", async () => {
    const { POST } = handlersAs(userId);
    const response = await POST(
      postRequest({ a1c: 6.1, consent: true, timezone: "America/Denver" })
    );

    expect(response.status).toBe(200);

    const [row] = await testDb.db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, userId));

    expect(row.a1cBand).toBe("prediabetes_60_62");
    expect(row.timezone).toBe("America/Denver");
    expect(row.consentedAt).toBeTruthy();
    expect(row.onboardedAt).toBeTruthy();
    // encrypted at rest; decrypts to the exact value for the owner
    expect(row.a1cCiphertext).not.toContain("6.1");
    expect(decryptField(row.a1cCiphertext)).toBe("6.1");
  });

  it("updates the existing profile on re-submit (idempotent upsert)", async () => {
    const { POST } = handlersAs(userId);
    await POST(postRequest({ a1c: 6.1, consent: true, timezone: "UTC" }));
    const response = await POST(
      postRequest({ a1c: 6.3, consent: true, timezone: "UTC" })
    );

    expect(response.status).toBe(200);

    const rows = await testDb.db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, userId));

    expect(rows).toHaveLength(1);
    expect(rows[0].a1cBand).toBe("prediabetes_63_64");
  });
});

describe("GET /api/profile", () => {
  it("returns hasProfile=false before creation", async () => {
    const { GET } = handlersAs(userId);
    const response = await GET();

    expect(await response.json()).toMatchObject({ hasProfile: false });
  });

  it("returns coarse profile data — never the exact A1C", async () => {
    const { POST, GET } = handlersAs(userId);
    await POST(postRequest({ a1c: 6.1, consent: true, timezone: "UTC" }));

    const response = await GET();
    const body = await response.json();

    expect(body).toMatchObject({
      hasProfile: true,
      a1cBand: "prediabetes_60_62",
      nudgeOptIn: false
    });
    expect(JSON.stringify(body)).not.toContain("6.1");
  });

  it("401s when signed out", async () => {
    const { GET } = handlersAs(null);
    const response = await GET();

    expect(response.status).toBe(401);
  });
});

describe("PATCH /api/profile", () => {
  it("cancels pending nudge state when preferences change", async () => {
    const { POST } = handlersAs(userId);
    await POST(postRequest({ a1c: 6.1, consent: true, timezone: "UTC" }));
    await testDb.db.insert(schema.pushSubscriptions).values({
      userId,
      endpoint: "https://push.example/profile-prefs",
      p256dh: "key",
      auth: "auth",
      lastNudgeDate: "2026-07-02",
      nudgeAttemptDate: "2026-07-03",
      nudgeAttemptCount: 1,
      nudgeRetryAfter: new Date("2026-07-03T16:00:00.000Z")
    });
    const PATCH = createProfilePatchHandler({
      db: () => testDb.db,
      getSession: async () => ({
        userId,
        email: "profile@test.dev"
      })
    });

    const response = await PATCH(
      patchRequest({ nudgeOptIn: false, nudgeCadence: "weekly" })
    );

    expect(response.status).toBe(200);
    const [profile] = await testDb.db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, userId));
    expect(profile.nudgeOptIn).toBe(false);
    expect(profile.nudgeCadence).toBe("weekly");
    const [subscription] = await testDb.db
      .select()
      .from(schema.pushSubscriptions)
      .where(eq(schema.pushSubscriptions.userId, userId));
    expect(subscription.lastNudgeDate).toBe("2026-07-02");
    expect(subscription.nudgeAttemptDate).toBeNull();
    expect(subscription.nudgeAttemptCount).toBe(0);
    expect(subscription.nudgeRetryAfter).toBeNull();
  });
});
