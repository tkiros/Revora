import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { schema, type Db } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

const ORIGINAL_ENV = { ...process.env };
const NOW = new Date("2026-07-06T04:30:00.000Z");

let testDb: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  testDb = await createTestDb();
});

afterAll(async () => {
  await testDb.close();
});

beforeEach(async () => {
  await testDb.db.delete(schema.cronHeartbeat);
  process.env = {
    ...ORIGINAL_ENV,
    NODE_ENV: "production",
    VERCEL_ENV: "preview",
    OPENAI_API_KEY: "sk-preview-test"
  };
  delete process.env.EDGE_CONFIG;
  delete process.env.REVORA_LAUNCH_MODE_OVERRIDE;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

async function importHandler() {
  // Fresh module registry isn't needed here (no top-level env reads in this
  // route file), but importing per-test keeps this file independent of
  // import order from the other health-focused test files.
  const mod = await import("../../../app/api/health/route");
  return mod.createHealthHandler;
}

describe("createHealthHandler — db + cron probes (P7)", () => {
  it("reports db:ok and crons:never when the db is reachable but no cron has ever run", async () => {
    const createHealthHandler = await importHandler();
    const GET = createHealthHandler({ db: () => testDb.db, now: () => NOW });

    const payload = await (await GET()).json();

    expect(payload.ok).toBe(true);
    expect(payload.db).toBe("ok");
    expect(payload.crons).toEqual({
      nudge: "never",
      baiWeekly: "never",
      trialPrecharge: "never",
      pantrySweep: "never"
    });
  });

  // G8: checkout 401s unauthenticated before the legal gate runs, so this
  // boolean is the only external way to see W-04's state. Same predicate as
  // checkoutGate(): anything but exactly "1" reads closed.
  it("reports the W-04 checkout gate state, closed unless LEGAL_TERMS_FINAL is exactly '1'", async () => {
    const createHealthHandler = await importHandler();
    const GET = createHealthHandler({ db: () => testDb.db, now: () => NOW });

    vi.stubEnv("LEGAL_TERMS_FINAL", "");
    expect((await (await GET()).json()).checkoutGate).toBe("closed");

    vi.stubEnv("LEGAL_TERMS_FINAL", "true");
    expect((await (await GET()).json()).checkoutGate).toBe("closed");

    vi.stubEnv("LEGAL_TERMS_FINAL", "1");
    expect((await (await GET()).json()).checkoutGate).toBe("open");

    vi.unstubAllEnvs();
  });

  it("reports crons:ok when all four heartbeats are fresh", async () => {
    await testDb.db.insert(schema.cronHeartbeat).values([
      { name: "nudge", lastRunAt: new Date(NOW.getTime() - 30 * 60 * 1000) }, // 30m ago
      { name: "bai-weekly", lastRunAt: new Date(NOW.getTime() - 24 * 60 * 60 * 1000) }, // 1 day ago
      { name: "trial-precharge", lastRunAt: new Date(NOW.getTime() - 30 * 60 * 1000) }, // 30m ago
      { name: "pantry-sweep", lastRunAt: new Date(NOW.getTime() - 30 * 60 * 1000) } // 30m ago
    ]);

    const createHealthHandler = await importHandler();
    const GET = createHealthHandler({ db: () => testDb.db, now: () => NOW });

    const payload = await (await GET()).json();

    expect(payload.db).toBe("ok");
    expect(payload.crons).toEqual({
      nudge: "ok",
      baiWeekly: "ok",
      trialPrecharge: "ok",
      pantrySweep: "ok"
    });
  });

  it("reports crons:stale past each job's own staleness window", async () => {
    await testDb.db.insert(schema.cronHeartbeat).values([
      // nudge stale past 2h
      { name: "nudge", lastRunAt: new Date(NOW.getTime() - 3 * 60 * 60 * 1000) },
      // bai-weekly stale past 8 days
      { name: "bai-weekly", lastRunAt: new Date(NOW.getTime() - 9 * 24 * 60 * 60 * 1000) },
      // trial-precharge stale past 2h
      { name: "trial-precharge", lastRunAt: new Date(NOW.getTime() - 3 * 60 * 60 * 1000) },
      // pantry-sweep stale past 2h
      { name: "pantry-sweep", lastRunAt: new Date(NOW.getTime() - 3 * 60 * 60 * 1000) }
    ]);

    const createHealthHandler = await importHandler();
    const GET = createHealthHandler({ db: () => testDb.db, now: () => NOW });

    const payload = await (await GET()).json();

    expect(payload.crons).toEqual({
      nudge: "stale",
      baiWeekly: "stale",
      trialPrecharge: "stale",
      pantrySweep: "stale"
    });
  });

  it("stays db:ok/crons:ok exactly at the staleness boundary (not yet stale)", async () => {
    await testDb.db.insert(schema.cronHeartbeat).values([
      { name: "nudge", lastRunAt: new Date(NOW.getTime() - 2 * 60 * 60 * 1000) }
    ]);

    const createHealthHandler = await importHandler();
    const GET = createHealthHandler({ db: () => testDb.db, now: () => NOW });

    const payload = await (await GET()).json();

    expect(payload.crons.nudge).toBe("ok");
  });

  it("reports db:unconfigured and crons:unknown/unknown when no DATABASE_URL is set (default deps)", async () => {
    delete process.env.DATABASE_URL;
    const createHealthHandler = await importHandler();
    const GET = createHealthHandler(); // real getDb(), no override

    const payload = await (await GET()).json();

    expect(payload.ok).toBe(true); // db being unconfigured never flips ok
    expect(payload.db).toBe("unconfigured");
    expect(payload.crons).toEqual({
      nudge: "unknown",
      baiWeekly: "unknown",
      trialPrecharge: "unknown",
      pantrySweep: "unknown"
    });
  });

  it("reports db:error (and never flips ok) when the db accessor throws mid-query", async () => {
    const createHealthHandler = await importHandler();
    const brokenDb = {
      select: () => {
        throw new Error("connection reset");
      }
    } as unknown as Db;

    const GET = createHealthHandler({ db: () => brokenDb, now: () => NOW });
    const payload = await (await GET()).json();

    expect(payload.ok).toBe(true);
    expect(payload.db).toBe("error");
    expect(payload.crons).toEqual({
      nudge: "unknown",
      baiWeekly: "unknown",
      trialPrecharge: "unknown",
      pantrySweep: "unknown"
    });
  });

  it("never includes secrets, URLs, or user counts in the response", async () => {
    process.env.DATABASE_URL = "postgres://user:secret-pw@railway.example/db";
    const createHealthHandler = await importHandler();
    const GET = createHealthHandler({ db: () => testDb.db, now: () => NOW });

    const body = JSON.stringify(await (await GET()).json());

    expect(body).not.toContain("secret-pw");
    expect(body).not.toContain("railway.example");
    expect(body).not.toContain("postgres://");
  });
});
