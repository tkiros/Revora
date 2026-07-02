import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
  NUDGE_COPY_BANK,
  runNudgeCron
} from "../../../lib/server/nudge";
import { encryptField } from "../../../lib/server/crypto";
import { schema } from "../../../lib/server/db";
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
});

async function seedUser(options: {
  email: string;
  timezone: string;
  nudgeHour?: number;
  optIn?: boolean;
  premium?: boolean;
  checkedTodayAt?: Date;
  lastNudgeDate?: string;
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
