import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createPushSubscribeHandlers } from "../../../app/api/push/subscribe/route";
import { createNudgeCronHandler } from "../../../app/api/cron/nudge/route";
import { encryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const TEST_KEY = Buffer.alloc(32, 12).toString("base64");

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let userId: string;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = TEST_KEY;
  process.env.CRON_SECRET = "cron-secret";
  testDb = await createTestDb();
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: "push@test.dev" })
    .returning();
  userId = user.id;
  await testDb.db.insert(schema.profiles).values({
    userId,
    a1cCiphertext: encryptField("6.1"),
    a1cBand: "prediabetes_60_62",
    timezone: "UTC",
    consentedAt: new Date()
  });
});

afterAll(async () => {
  delete process.env.HEALTH_DATA_KEY;
  delete process.env.CRON_SECRET;
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.pushSubscriptions);
});

const SUBSCRIPTION = {
  endpoint: "https://push.example/e1",
  keys: { p256dh: "key", auth: "auth" }
};

function handlers(sessionUserId: string | null = userId) {
  return createPushSubscribeHandlers({
    db: () => testDb.db,
    getSession: async () =>
      sessionUserId ? { userId: sessionUserId, email: "push@test.dev" } : null
  });
}

function request(method: string, body: unknown) {
  return new Request("http://t/api/push/subscribe", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("push subscribe/unsubscribe", () => {
  it("401s signed-out requests", async () => {
    const { POST } = handlers(null);
    expect((await POST(request("POST", SUBSCRIPTION))).status).toBe(401);
  });

  it("stores the subscription and flips nudge opt-in on", async () => {
    const { POST } = handlers();
    const response = await POST(request("POST", SUBSCRIPTION));

    expect(response.status).toBe(200);
    const [row] = await testDb.db.select().from(schema.pushSubscriptions);
    expect(row.endpoint).toBe(SUBSCRIPTION.endpoint);

    const [profile] = await testDb.db.select().from(schema.profiles);
    expect(profile.nudgeOptIn).toBe(true);
  });

  it("re-subscribing the same endpoint upserts instead of duplicating", async () => {
    const { POST } = handlers();
    await POST(request("POST", SUBSCRIPTION));
    await POST(request("POST", SUBSCRIPTION));

    expect(await testDb.db.select().from(schema.pushSubscriptions)).toHaveLength(1);
  });

  it("DELETE removes the subscription and flips opt-in off", async () => {
    const { POST, DELETE } = handlers();
    await POST(request("POST", SUBSCRIPTION));

    const response = await DELETE(
      request("DELETE", { endpoint: SUBSCRIPTION.endpoint })
    );

    expect(response.status).toBe(200);
    expect(await testDb.db.select().from(schema.pushSubscriptions)).toHaveLength(0);
    const [profile] = await testDb.db.select().from(schema.profiles);
    expect(profile.nudgeOptIn).toBe(false);
  });
});

describe("GET /api/cron/nudge auth", () => {
  it("401s without the CRON_SECRET bearer", async () => {
    const GET = createNudgeCronHandler({
      db: () => testDb.db,
      send: vi.fn()
    });

    const response = await GET(new Request("http://t/api/cron/nudge"));
    expect(response.status).toBe(401);

    const wrong = await GET(
      new Request("http://t/api/cron/nudge", {
        headers: { authorization: "Bearer wrong" }
      })
    );
    expect(wrong.status).toBe(401);
  });

  it("runs the cron with the correct bearer", async () => {
    const GET = createNudgeCronHandler({
      db: () => testDb.db,
      send: vi.fn().mockResolvedValue("ok")
    });

    const response = await GET(
      new Request("http://t/api/cron/nudge", {
        headers: { authorization: "Bearer cron-secret" }
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(typeof body.sent).toBe("number");
  });

  it("returns 503 and a bounded failure count when push delivery fails", async () => {
    await testDb.db
      .update(schema.profiles)
      .set({ nudgeOptIn: true, nudgeHour: new Date().getUTCHours() })
      .where(eq(schema.profiles.userId, userId));
    await testDb.db.insert(schema.pushSubscriptions).values({
      userId,
      endpoint: SUBSCRIPTION.endpoint,
      p256dh: SUBSCRIPTION.keys.p256dh,
      auth: SUBSCRIPTION.keys.auth
    });
    await testDb.db.insert(schema.subscriptions).values({
      userId,
      provider: "stripe",
      providerRef: "sub_push_route_failure",
      productId: "premium_monthly",
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }).onConflictDoNothing();
    const GET = createNudgeCronHandler({
      db: () => testDb.db,
      send: vi.fn().mockResolvedValue("error")
    });

    const response = await GET(
      new Request("http://t/api/cron/nudge", {
        headers: { authorization: "Bearer cron-secret" }
      })
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      ok: false,
      sent: 0,
      failed: 1
    });
  });
});
