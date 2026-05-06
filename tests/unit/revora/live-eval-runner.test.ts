import { describe, expect, it } from "vitest";

describe("run-live-revora-evals", () => {
  it("reports SETUP_BLOCKED when OPENAI_API_KEY is missing", async () => {
    const { planLiveEval } = await import("../../../scripts/run-live-revora-evals.mjs");

    const plan = planLiveEval({});

    expect(plan.status).toBe("setup_blocked");
    expect(plan.message).toContain("SETUP_BLOCKED");
    expect(plan.message).toContain("OPENAI_API_KEY");
  });

  it("enables REVORA_LIVE_EVAL when credentials are present", async () => {
    const { planLiveEval } = await import("../../../scripts/run-live-revora-evals.mjs");

    const plan = planLiveEval({ OPENAI_API_KEY: "test-key" });

    expect(plan.status).toBe("ready");
    if (plan.status !== "ready") {
      throw new Error("Expected ready plan.");
    }

    expect(plan.env.REVORA_LIVE_EVAL).toBe("1");
    expect(plan.args).toEqual([
      "vitest",
      "run",
      "tests/evals/revora-safety-eval.test.ts"
    ]);
  });
});
