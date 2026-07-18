import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../lib/server/pantry/process", () => ({
  defaultProcessDeps: vi.fn(() => ({})),
  processPantryOrder: vi.fn(async () => ({ done: true }))
}));

import { createPantryProcessHandler } from "../../../app/api/pantry/process/route";
import { processPantryOrder } from "../../../lib/server/pantry/process";

const ORDER_ID = "3b241101-e2bb-4255-8caf-4136c566a962";

function processRequest(authorization?: string) {
  return new Request("http://t/api/pantry/process", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(authorization ? { authorization } : {})
    },
    body: JSON.stringify({ orderId: ORDER_ID })
  });
}

afterEach(() => {
  delete process.env.CRON_SECRET;
  vi.clearAllMocks();
});

/**
 * The cron doorway on /api/pantry/process must behave exactly like the
 * app/api/cron/* routes: timing-safe compare, and an unset/wrong secret can
 * never be cron — it falls through to the session path (401 when signed out).
 */
describe("POST /api/pantry/process cron doorway", () => {
  it("accepts the exact bearer secret without consulting the session", async () => {
    process.env.CRON_SECRET = "sweep-secret";
    const getSession = vi.fn();
    // db() is still used to BUILD process deps on the cron path — what cron
    // skips is the session + ownership lookup.
    const POST = createPantryProcessHandler({
      db: (() => ({})) as never,
      getSession: getSession as never,
      makeProcessDeps: () => ({}) as never
    });

    const response = await POST(processRequest("Bearer sweep-secret"));

    expect(response.status).toBe(202);
    expect(getSession).not.toHaveBeenCalled();
    expect(processPantryOrder).toHaveBeenCalledWith({}, ORDER_ID);
  });

  it.each([
    ["wrong secret", "Bearer wrong"],
    ["missing header", undefined],
    ["non-bearer scheme", "Basic sweep-secret"]
  ])("%s falls through to the session path and 401s signed-out", async (_label, header) => {
    process.env.CRON_SECRET = "sweep-secret";
    const POST = createPantryProcessHandler({
      getSession: (async () => null) as never,
      makeProcessDeps: () => ({}) as never
    });

    const response = await POST(processRequest(header));

    expect(response.status).toBe(401);
    expect(processPantryOrder).not.toHaveBeenCalled();
  });

  it("an unset CRON_SECRET can never be cron, even with an empty bearer", async () => {
    const POST = createPantryProcessHandler({
      getSession: (async () => null) as never,
      makeProcessDeps: () => ({}) as never
    });

    const response = await POST(processRequest("Bearer "));

    expect(response.status).toBe(401);
  });
});
