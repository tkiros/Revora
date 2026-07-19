import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
  NUDGE_COPY_BANK,
  runNudgeCron
} from "../../../lib/server/nudge";
import { encryptField } from "../../../lib/server/crypto";
import { schema, type Db } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const TEST_KEY = Buffer.alloc(32, 11).toString("base64");
// 15:00 UTC = 11:00 in New York (EDT), 09:00 in Denver (MDT)
const NOW = new Date("2026-07-03T15:00:00.000Z");

let testDb: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  process.env.HEALTH_DATA_KEY = TEST_KEY;
  testDb = await createTestDb();
});

afterAll(async () => {
  delete process.env.HEALTH_DATA_KEY;
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.users); // cascades everything
  await testDb.db.delete(schema.cronHeartbeat); // P7: not user-scoped, cleared separately
});

async function seedUser(options: {
  email: string;
  timezone: string;
  nudgeHour?: number;
  optIn?: boolean;
  premium?: boolean;
  checkedTodayAt?: Date;
  lastNudgeDate?: string;
  cadence?: "daily" | "few_per_week" | "weekly";
  quietStart?: number | null;
  quietEnd?: number | null;
}) {
  const [user] = await testDb.db
    .insert(schema.users)
    .values({ email: options.email })
    .returning();

  await testDb.db.insert(schema.profiles).values({
    userId: user.id,
    a1cCiphertext: encryptField("6.1"),
    a1cBand: "prediabetes_60_62",
    timezone: options.timezone,
    nudgeOptIn: options.optIn ?? true,
    nudgeHour: options.nudgeHour ?? 11,
    nudgeCadence: options.cadence ?? "daily",
    nudgeQuietStart: options.quietStart ?? null,
    nudgeQuietEnd: options.quietEnd ?? null,
    consentedAt: NOW
  });

  await testDb.db.insert(schema.pushSubscriptions).values({
    userId: user.id,
    endpoint: `https://push.example/${options.email}`,
    p256dh: "k",
    auth: "a",
    lastNudgeDate: options.lastNudgeDate ?? null
  });

  if (options.premium ?? true) {
    await testDb.db.insert(schema.subscriptions).values({
      userId: user.id,
      provider: "stripe",
      providerRef: `sub_${options.email}`,
      productId: "premium_monthly",
      status: "active",
      currentPeriodEnd: new Date("2026-08-01T00:00:00.000Z")
    });
  }

  if (options.checkedTodayAt) {
    await testDb.db.insert(schema.checks).values({
      userId: user.id,
      foodCiphertext: encryptField("meal"),
      risk: "SAFE",
      a1cBand: "prediabetes_60_62",
      createdAt: options.checkedTodayAt
    });
  }

  return user;
}

function runWith(send = vi.fn().mockResolvedValue("ok" as const)) {
  return {
    send,
    run: () => runNudgeCron(testDb.db, { now: () => NOW, send })
  };
}

const JOURNEY_ON = { LEARNING_JOURNEY_ENABLED: "1" };

async function seedJourney(
  userId: string,
  options: {
    state?: "active" | "paused" | "graduated" | "maintenance";
    startedAt?: Date;
  } = {}
) {
  await testDb.db.insert(schema.learningJourneys).values({
    userId,
    state: options.state ?? "active",
    // Default: started 2 days before NOW → day 3 → stage 1.
    startedAt: options.startedAt ?? new Date("2026-07-01T15:00:00.000Z"),
    accumulatedPauseMs: 0
  });
}

describe("runNudgeCron", () => {
  it("sends exactly one nudge to a matching-hour premium user with no check today", async () => {
    await seedUser({ email: "ny@test.dev", timezone: "America/New_York" }); // 11:00 local

    const { send, run } = runWith();
    const result = await run();

    expect(result.sent).toBe(1);
    expect(send).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(send.mock.calls[0][1] as string);
    expect(NUDGE_COPY_BANK).toContain(payload.body);
  });

  it("skips users whose local hour doesn't match", async () => {
    await seedUser({ email: "denver@test.dev", timezone: "America/Denver" }); // 09:00 local ≠ 11

    const { send, run } = runWith();
    const result = await run();

    expect(result.sent).toBe(0);
    expect(send).not.toHaveBeenCalled();
  });

  it("skips users who already checked today (their timezone)", async () => {
    await seedUser({
      email: "checked@test.dev",
      timezone: "America/New_York",
      checkedTodayAt: new Date("2026-07-03T12:00:00.000Z")
    });

    const { run } = runWith();
    expect((await run()).sent).toBe(0);
  });

  it("skips opted-out users", async () => {
    await seedUser({
      email: "optout@test.dev",
      timezone: "America/New_York",
      optIn: false
    });

    const { run } = runWith();
    expect((await run()).sent).toBe(0);
  });

  it("skips free users (nudge is premium)", async () => {
    await seedUser({
      email: "free@test.dev",
      timezone: "America/New_York",
      premium: false
    });

    const { run } = runWith();
    expect((await run()).sent).toBe(0);
  });

  it("never sends twice in one local day (dedupe by last_nudge_date)", async () => {
    await seedUser({ email: "dedupe@test.dev", timezone: "America/New_York" });

    const { run } = runWith();
    expect((await run()).sent).toBe(1);
    expect((await run()).sent).toBe(0); // second hourly tick, same day
  });

  it("prunes dead endpoints (410) without failing the run", async () => {
    await seedUser({ email: "gone@test.dev", timezone: "America/New_York" });

    const send = vi.fn().mockResolvedValue("gone" as const);
    const result = await runNudgeCron(testDb.db, { now: () => NOW, send });

    expect(result.pruned).toBe(1);
    const rows = await testDb.db.select().from(schema.pushSubscriptions);
    expect(rows).toHaveLength(0);
  });

  it("a transient send error skips silently — never a double-send retry", async () => {
    await seedUser({ email: "err@test.dev", timezone: "America/New_York" });

    const send = vi.fn().mockResolvedValue("error" as const);
    const result = await runNudgeCron(testDb.db, { now: () => NOW, send });

    expect(result.sent).toBe(0);
    // last_nudge_date was still stamped so the next hourly tick won't retry
    const [row] = await testDb.db.select().from(schema.pushSubscriptions);
    expect(row.lastNudgeDate).toBe("2026-07-03");
  });
});

describe("runNudgeCron — heartbeat (P7)", () => {
  it("upserts a 'nudge' heartbeat row stamped with the run's `now` on a successful run", async () => {
    await seedUser({ email: "hb@test.dev", timezone: "America/New_York" });

    const { run } = runWith();
    await run();

    const rows = await testDb.db.select().from(schema.cronHeartbeat);
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("nudge");
    expect(rows[0].lastRunAt).toEqual(NOW);
  });

  it("upserts (not duplicates) on repeated runs, always the latest run time", async () => {
    await seedUser({ email: "hb2@test.dev", timezone: "America/New_York" });

    const { run } = runWith();
    await run();
    const later = new Date(NOW.getTime() + 60 * 60 * 1000);
    await runNudgeCron(testDb.db, {
      now: () => later,
      send: vi.fn().mockResolvedValue("ok" as const)
    });

    const rows = await testDb.db.select().from(schema.cronHeartbeat);
    expect(rows).toHaveLength(1);
    expect(rows[0].lastRunAt).toEqual(later);
  });

  it("stamps the heartbeat even when there are no eligible candidates (still a successful run)", async () => {
    const { run } = runWith();
    const result = await run();

    expect(result.sent).toBe(0);
    const rows = await testDb.db.select().from(schema.cronHeartbeat);
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("nudge");
  });

  it("fail-soft: a heartbeat write error never fails the cron run or its result", async () => {
    await seedUser({ email: "hbfail@test.dev", timezone: "America/New_York" });

    // Every op delegates to the real test db except inserting into
    // cron_heartbeat, which throws — simulating a write failure on the
    // heartbeat table specifically without breaking the rest of the run.
    const brokenHeartbeatDb: Db = {
      select: testDb.db.select.bind(testDb.db),
      insert: ((table: unknown) => {
        if (table === schema.cronHeartbeat) {
          throw new Error("simulated heartbeat write failure");
        }
        return testDb.db.insert(table as never);
      }) as Db["insert"],
      update: testDb.db.update.bind(testDb.db),
      delete: testDb.db.delete.bind(testDb.db),
      query: testDb.db.query,
      transaction: testDb.db.transaction.bind(testDb.db)
    };

    await expect(
      runNudgeCron(brokenHeartbeatDb, {
        now: () => NOW,
        send: vi.fn().mockResolvedValue("ok" as const)
      })
    ).resolves.toEqual({ sent: 1, pruned: 0, skipped: 0 });

    // No row was written (the insert threw), and that's fine — the response
    // above already proves the run itself didn't fail.
    const rows = await testDb.db.select().from(schema.cronHeartbeat);
    expect(rows).toHaveLength(0);
  });
});

describe("runNudgeCron — journey-aware triggers (flag on)", () => {
  it("active journey, unmet stage intent → journey_step with the stage", async () => {
    const user = await seedUser({ email: "js@test.dev", timezone: "America/New_York" });
    await seedJourney(user.id); // active, stage 1, no saved memories → intent unmet

    const send = vi.fn().mockResolvedValue("ok" as const);
    const result = await runNudgeCron(testDb.db, {
      now: () => NOW,
      env: JOURNEY_ON,
      send
    });

    expect(result.sent).toBe(1);
    const payload = JSON.parse(send.mock.calls[0][1] as string);
    expect(payload.class).toBe("journey_step");
    expect(payload.stage).toBe("1");
  });

  it("a fresh weekly artifact outranks the stage step → weekly_learning_ready", async () => {
    const user = await seedUser({ email: "wk@test.dev", timezone: "America/New_York" });
    await seedJourney(user.id);
    // Persisted completed-week artifact; user never nudged → fresh.
    await testDb.db.insert(schema.weeklyReflections).values({
      userId: user.id,
      weekStart: "2026-06-22",
      version: "1",
      artifactCiphertext: encryptField("{}"),
      createdAt: new Date("2026-06-29T12:00:00.000Z")
    });

    const send = vi.fn().mockResolvedValue("ok" as const);
    const result = await runNudgeCron(testDb.db, {
      now: () => NOW,
      env: JOURNEY_ON,
      send
    });

    expect(result.sent).toBe(1);
    const payload = JSON.parse(send.mock.calls[0][1] as string);
    expect(payload.class).toBe("weekly_learning_ready");
  });

  it("STOP: a paused journey sends nothing", async () => {
    const user = await seedUser({ email: "pz@test.dev", timezone: "America/New_York" });
    await seedJourney(user.id, { state: "paused" });

    const result = await runNudgeCron(testDb.db, {
      now: () => NOW,
      env: JOURNEY_ON,
      send: vi.fn().mockResolvedValue("ok" as const)
    });
    expect(result.sent).toBe(0);
  });

  it("STOP: a graduated journey sends nothing", async () => {
    const user = await seedUser({ email: "gr@test.dev", timezone: "America/New_York" });
    await seedJourney(user.id, { state: "graduated" });

    const result = await runNudgeCron(testDb.db, {
      now: () => NOW,
      env: JOURNEY_ON,
      send: vi.fn().mockResolvedValue("ok" as const)
    });
    expect(result.sent).toBe(0);
  });

  it("STOP: 14-day inactivity winds nudges down", async () => {
    const user = await seedUser({
      email: "inactive@test.dev",
      timezone: "America/New_York",
      // Last (and only) check 20 days before NOW — not today, so it passes the
      // "checked today" gate but trips the inactivity wind-down.
      checkedTodayAt: new Date("2026-06-13T12:00:00.000Z")
    });
    await seedJourney(user.id);

    const result = await runNudgeCron(testDb.db, {
      now: () => NOW,
      env: JOURNEY_ON,
      send: vi.fn().mockResolvedValue("ok" as const)
    });
    expect(result.sent).toBe(0);
  });

  it("flag OFF leaves behavior generic even with a paused journey", async () => {
    const user = await seedUser({ email: "off@test.dev", timezone: "America/New_York" });
    await seedJourney(user.id, { state: "paused" });

    const send = vi.fn().mockResolvedValue("ok" as const);
    // No env → flag off → journey stop rules do not apply.
    const result = await runNudgeCron(testDb.db, { now: () => NOW, send });

    expect(result.sent).toBe(1);
    const payload = JSON.parse(send.mock.calls[0][1] as string);
    expect(payload.class).toBe("generic");
    expect(payload.stage).toBe("none");
  });
});

describe("runNudgeCron — cadence + quiet hours", () => {
  it("weekly cadence: a nudge 5 days ago is too soon (needs ≥7)", async () => {
    await seedUser({
      email: "weekly@test.dev",
      timezone: "America/New_York",
      cadence: "weekly",
      lastNudgeDate: "2026-06-28" // 5 days before NOW
    });

    expect((await runWith().run()).sent).toBe(0);
  });

  it("few_per_week cadence: a nudge yesterday is too soon (needs ≥2)", async () => {
    await seedUser({
      email: "few@test.dev",
      timezone: "America/New_York",
      cadence: "few_per_week",
      lastNudgeDate: "2026-07-02" // 1 day before NOW
    });

    expect((await runWith().run()).sent).toBe(0);
  });

  it("few_per_week cadence: a 2-day gap sends", async () => {
    await seedUser({
      email: "few2@test.dev",
      timezone: "America/New_York",
      cadence: "few_per_week",
      lastNudgeDate: "2026-07-01" // 2 days before NOW
    });

    expect((await runWith().run()).sent).toBe(1);
  });

  it("quiet hours covering the chosen hour suppress the send", async () => {
    await seedUser({
      email: "quiet@test.dev",
      timezone: "America/New_York", // 11:00 local
      quietStart: 9,
      quietEnd: 17
    });

    expect((await runWith().run()).sent).toBe(0);
  });
});

describe("nudge copy bank", () => {
  it("is calm — no guilt, no banned claims", () => {
    expect(NUDGE_COPY_BANK.length).toBeGreaterThanOrEqual(3);
    for (const copy of NUDGE_COPY_BANK) {
      expect(copy).not.toMatch(
        /you failed|you should have|don't forget|missed|streak.*(lost|broken)|last chance|revers|cure|treat|prevent|guarantee/i
      );
    }
  });
});
