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
const HOUR_MS = 60 * 60 * 1000;

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
  lastNudgeDate?: string | null;
  nudgeAttemptDate?: string | null;
  nudgeAttemptCount?: number;
  nudgeRetryAfter?: Date | null;
  nudgeLeaseToken?: string | null;
  nudgeLeaseUntil?: Date | null;
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
    lastNudgeDate: options.lastNudgeDate ?? null,
    nudgeAttemptDate: options.nudgeAttemptDate ?? null,
    nudgeAttemptCount: options.nudgeAttemptCount ?? 0,
    nudgeRetryAfter: options.nudgeRetryAfter ?? null,
    nudgeLeaseToken: options.nudgeLeaseToken ?? null,
    nudgeLeaseUntil: options.nudgeLeaseUntil ?? null
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

function runAt(
  now: Date,
  send = vi.fn().mockResolvedValue("ok" as const),
  env?: { LEARNING_JOURNEY_ENABLED?: string }
) {
  return runNudgeCron(testDb.db, { now: () => now, send, env });
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

  it("releases a transient-failure claim so the next hourly tick retries", async () => {
    await seedUser({ email: "err@test.dev", timezone: "America/New_York" });

    const send = vi.fn().mockResolvedValue("error" as const);
    const result = await runNudgeCron(testDb.db, { now: () => NOW, send });

    expect(result.sent).toBe(0);
    expect(result.failed).toBe(1);
    const [row] = await testDb.db.select().from(schema.pushSubscriptions);
    expect(row.lastNudgeDate).toBeNull();
    expect(row.nudgeAttemptDate).toBe("2026-07-03");
    expect(row.nudgeAttemptCount).toBe(1);
    expect(row.nudgeRetryAfter).toEqual(new Date("2026-07-03T16:00:00.000Z"));
    expect(row.nudgeLeaseToken).toBeNull();
    expect(row.nudgeLeaseUntil).toBeNull();
    expect(await testDb.db.select().from(schema.cronHeartbeat)).toHaveLength(0);

    const retrySend = vi.fn().mockResolvedValue("ok" as const);
    const retry = await runNudgeCron(testDb.db, {
      now: () => new Date(NOW.getTime() + 60 * 60 * 1000),
      send: retrySend
    });
    expect(retry.sent).toBe(1);
    expect(retry.failed).toBe(0);
    expect(retrySend).toHaveBeenCalledOnce();
    const [retried] = await testDb.db.select().from(schema.pushSubscriptions);
    expect(retried.lastNudgeDate).toBe("2026-07-03");
    expect(retried.nudgeAttemptDate).toBeNull();
    expect(retried.nudgeAttemptCount).toBe(0);
    expect(retried.nudgeRetryAfter).toBeNull();
    const [heartbeat] = await testDb.db.select().from(schema.cronHeartbeat);
    expect(heartbeat.lastRunAt).toEqual(
      new Date(NOW.getTime() + HOUR_MS)
    );
  });

  it("contains a rejected provider send and retries other subscriptions", async () => {
    await seedUser({ email: "reject-a@test.dev", timezone: "America/New_York" });
    await seedUser({ email: "reject-b@test.dev", timezone: "America/New_York" });
    const send = vi
      .fn()
      .mockRejectedValueOnce(new Error("provider unavailable"))
      .mockResolvedValueOnce("ok" as const);

    const result = await runNudgeCron(testDb.db, { now: () => NOW, send });

    expect(send).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({ sent: 1, failed: 1 });
    expect(await testDb.db.select().from(schema.cronHeartbeat)).toHaveLength(0);
  });

  it("does not turn a never-due user into a late send", async () => {
    await seedUser({ email: "never-due@test.dev", timezone: "America/New_York" });
    const send = vi.fn().mockResolvedValue("ok" as const);

    const result = await runAt(new Date(NOW.getTime() + HOUR_MS), send);

    expect(result.sent).toBe(0);
    expect(result.pending).toBe(0);
    expect(send).not.toHaveBeenCalled();
  });

  it("bounds a local day to three attempts and reports exhaustion", async () => {
    await seedUser({ email: "bounded@test.dev", timezone: "America/New_York" });
    const send = vi.fn().mockResolvedValue("error" as const);

    for (const offset of [0, 1, 2]) {
      const result = await runAt(
        new Date(NOW.getTime() + offset * HOUR_MS),
        send
      );
      expect(result.failed).toBe(1);
    }

    const [row] = await testDb.db.select().from(schema.pushSubscriptions);
    expect(row.nudgeAttemptDate).toBe("2026-07-03");
    expect(row.nudgeAttemptCount).toBe(3);
    expect(row.nudgeRetryAfter).toBeNull();

    const afterBoundSend = vi.fn().mockResolvedValue("ok" as const);
    const afterBound = await runAt(
      new Date(NOW.getTime() + 3 * HOUR_MS),
      afterBoundSend
    );
    expect(afterBound).toMatchObject({
      sent: 0,
      failed: 0,
      pending: 0,
      exhausted: 1
    });
    expect(afterBoundSend).not.toHaveBeenCalled();
    expect(await testDb.db.select().from(schema.cronHeartbeat)).toHaveLength(0);
  });

  it("uses an atomic lease for overlapping initial attempts", async () => {
    await seedUser({ email: "overlap-initial@test.dev", timezone: "America/New_York" });
    let release!: (result: "ok") => void;
    const firstSend = vi.fn(
      () =>
        new Promise<"ok">((resolve) => {
          release = resolve;
        })
    );
    const firstRun = runAt(NOW, firstSend);
    await vi.waitFor(() => expect(firstSend).toHaveBeenCalledOnce());

    const competingSend = vi.fn().mockResolvedValue("ok" as const);
    const competing = await runAt(NOW, competingSend);
    expect(competing.sent).toBe(0);
    expect(competing.pending).toBe(1);
    expect(competingSend).not.toHaveBeenCalled();

    release("ok");
    expect((await firstRun).sent).toBe(1);
  });

  it("uses an atomic lease for overlapping retry attempts", async () => {
    await seedUser({ email: "overlap-retry@test.dev", timezone: "America/New_York" });
    await runAt(NOW, vi.fn().mockResolvedValue("error" as const));

    let release!: (result: "ok") => void;
    const firstRetrySend = vi.fn(
      () =>
        new Promise<"ok">((resolve) => {
          release = resolve;
        })
    );
    const retryAt = new Date(NOW.getTime() + HOUR_MS);
    const firstRetry = runAt(retryAt, firstRetrySend);
    await vi.waitFor(() => expect(firstRetrySend).toHaveBeenCalledOnce());

    const competingSend = vi.fn().mockResolvedValue("ok" as const);
    const competing = await runAt(retryAt, competingSend);
    expect(competing.sent).toBe(0);
    expect(competing.pending).toBe(1);
    expect(competingSend).not.toHaveBeenCalled();

    release("ok");
    expect((await firstRetry).sent).toBe(1);
  });

  it("recovers an expired ambiguous lease within the bounded attempt budget", async () => {
    await seedUser({
      email: "expired-lease@test.dev",
      timezone: "America/New_York",
      nudgeAttemptDate: "2026-07-03",
      nudgeAttemptCount: 1,
      nudgeLeaseToken: "00000000-0000-4000-8000-000000000001",
      nudgeLeaseUntil: new Date(NOW.getTime() + 30 * 60 * 1000)
    });
    const retrySend = vi.fn().mockResolvedValue("ok" as const);

    const result = await runAt(
      new Date(NOW.getTime() + HOUR_MS),
      retrySend
    );

    expect(result.sent).toBe(1);
    expect(retrySend).toHaveBeenCalledOnce();
  });

  it("keeps a retry pending through quiet hours, then sends afterward", async () => {
    await seedUser({
      email: "retry-quiet@test.dev",
      timezone: "America/New_York",
      quietStart: 12,
      quietEnd: 13
    });
    await runAt(NOW, vi.fn().mockResolvedValue("error" as const));

    const quietSend = vi.fn().mockResolvedValue("ok" as const);
    const quiet = await runAt(
      new Date(NOW.getTime() + HOUR_MS),
      quietSend
    );
    expect(quiet).toMatchObject({ sent: 0, pending: 1 });
    expect(quietSend).not.toHaveBeenCalled();

    const recoveredSend = vi.fn().mockResolvedValue("ok" as const);
    const recovered = await runAt(
      new Date(NOW.getTime() + 2 * HOUR_MS),
      recoveredSend
    );
    expect(recovered.sent).toBe(1);
    expect(recoveredSend).toHaveBeenCalledOnce();
  });

  it("does not carry a retry across the user's local-day boundary", async () => {
    const late = new Date("2026-07-04T03:00:00.000Z"); // 23:00 July 3 EDT
    await seedUser({
      email: "day-boundary@test.dev",
      timezone: "America/New_York",
      nudgeHour: 23
    });
    await runAt(late, vi.fn().mockResolvedValue("error" as const));

    const afterMidnightSend = vi.fn().mockResolvedValue("ok" as const);
    const afterMidnight = await runAt(
      new Date(late.getTime() + HOUR_MS),
      afterMidnightSend
    );
    expect(afterMidnight).toMatchObject({
      sent: 0,
      pending: 0,
      exhausted: 0
    });
    expect(afterMidnightSend).not.toHaveBeenCalled();
    const [cleared] = await testDb.db.select().from(schema.pushSubscriptions);
    expect(cleared.nudgeAttemptDate).toBeNull();

    const nextScheduledSend = vi.fn().mockResolvedValue("ok" as const);
    const nextScheduled = await runAt(
      new Date(late.getTime() + 24 * HOUR_MS),
      nextScheduledSend
    );
    expect(nextScheduled.sent).toBe(1);
  });

  it("cancels retry eligibility when the user checks a meal", async () => {
    const user = await seedUser({
      email: "checked-between@test.dev",
      timezone: "America/New_York"
    });
    await runAt(NOW, vi.fn().mockResolvedValue("error" as const));
    await testDb.db.insert(schema.checks).values({
      userId: user.id,
      foodCiphertext: encryptField("later meal"),
      risk: "SAFE",
      a1cBand: "prediabetes_60_62",
      createdAt: new Date(NOW.getTime() + 30 * 60 * 1000)
    });

    const send = vi.fn().mockResolvedValue("ok" as const);
    expect((await runAt(new Date(NOW.getTime() + HOUR_MS), send)).sent).toBe(0);
    expect(send).not.toHaveBeenCalled();
    const [row] = await testDb.db.select().from(schema.pushSubscriptions);
    expect(row.nudgeAttemptDate).toBeNull();
  });

  it("does not retry after opt-out", async () => {
    const user = await seedUser({
      email: "optout-between@test.dev",
      timezone: "America/New_York"
    });
    await runAt(NOW, vi.fn().mockResolvedValue("error" as const));
    await testDb.db
      .update(schema.profiles)
      .set({ nudgeOptIn: false })
      .where(eq(schema.profiles.userId, user.id));

    const send = vi.fn().mockResolvedValue("ok" as const);
    expect((await runAt(new Date(NOW.getTime() + HOUR_MS), send)).sent).toBe(0);
    expect(send).not.toHaveBeenCalled();
  });

  it("cancels retry eligibility after entitlement loss", async () => {
    const user = await seedUser({
      email: "entitlement-between@test.dev",
      timezone: "America/New_York"
    });
    await runAt(NOW, vi.fn().mockResolvedValue("error" as const));
    await testDb.db
      .update(schema.subscriptions)
      .set({ status: "expired" })
      .where(eq(schema.subscriptions.userId, user.id));

    const send = vi.fn().mockResolvedValue("ok" as const);
    expect((await runAt(new Date(NOW.getTime() + HOUR_MS), send)).sent).toBe(0);
    expect(send).not.toHaveBeenCalled();
    const [row] = await testDb.db.select().from(schema.pushSubscriptions);
    expect(row.nudgeAttemptDate).toBeNull();
  });

  it("prunes a gone endpoint during a retry and removes all retry state", async () => {
    await seedUser({ email: "gone-retry@test.dev", timezone: "America/New_York" });
    await runAt(NOW, vi.fn().mockResolvedValue("error" as const));

    const result = await runAt(
      new Date(NOW.getTime() + HOUR_MS),
      vi.fn().mockResolvedValue("gone" as const)
    );

    expect(result.pruned).toBe(1);
    expect(await testDb.db.select().from(schema.pushSubscriptions)).toHaveLength(0);
  });

  it("dedupes a successful retry for the rest of the local day", async () => {
    await seedUser({ email: "retry-dedupe@test.dev", timezone: "America/New_York" });
    await runAt(NOW, vi.fn().mockResolvedValue("error" as const));
    await runAt(
      new Date(NOW.getTime() + HOUR_MS),
      vi.fn().mockResolvedValue("ok" as const)
    );

    const laterSend = vi.fn().mockResolvedValue("ok" as const);
    const later = await runAt(
      new Date(NOW.getTime() + 2 * HOUR_MS),
      laterSend
    );
    expect(later.sent).toBe(0);
    expect(laterSend).not.toHaveBeenCalled();
  });

  it.each([
    ["daily", null],
    ["few_per_week", "2026-07-01"],
    ["weekly", "2026-06-26"]
  ] as const)(
    "preserves %s cadence eligibility from initial failure through retry",
    async (cadence, lastNudgeDate) => {
      await seedUser({
        email: `retry-${cadence}@test.dev`,
        timezone: "America/New_York",
        cadence,
        lastNudgeDate
      });
      await runAt(NOW, vi.fn().mockResolvedValue("error" as const));

      const retrySend = vi.fn().mockResolvedValue("ok" as const);
      const result = await runAt(
        new Date(NOW.getTime() + HOUR_MS),
        retrySend
      );
      expect(result.sent).toBe(1);
      expect(retrySend).toHaveBeenCalledOnce();
    }
  );

  it("cancels retry eligibility when a journey stop rule activates", async () => {
    const user = await seedUser({
      email: "journey-stop-between@test.dev",
      timezone: "America/New_York"
    });
    await seedJourney(user.id);
    await runAt(
      NOW,
      vi.fn().mockResolvedValue("error" as const),
      JOURNEY_ON
    );
    await testDb.db
      .update(schema.learningJourneys)
      .set({ state: "paused", pausedAt: new Date(NOW.getTime() + 30 * 60 * 1000) })
      .where(eq(schema.learningJourneys.userId, user.id));

    const retrySend = vi.fn().mockResolvedValue("ok" as const);
    const result = await runAt(
      new Date(NOW.getTime() + HOUR_MS),
      retrySend,
      JOURNEY_ON
    );
    expect(result.sent).toBe(0);
    expect(retrySend).not.toHaveBeenCalled();
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
    ).resolves.toEqual({
      sent: 1,
      pruned: 0,
      failed: 0,
      pending: 0,
      exhausted: 0,
      skipped: 0
    });

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
