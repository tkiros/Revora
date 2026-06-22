import { afterEach, describe, expect, it, vi } from "vitest";

import {
  type SafeTelemetryEvent,
  emitSafeEvent
} from "../../../lib/revora/telemetry";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("emitSafeEvent", () => {
  it("emits allowlisted coarse fields only", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const event: SafeTelemetryEvent = {
      name: "check_completed",
      environment: "preview",
      responseKind: "result",
      risk: "SAFE",
      latencyBucket: "<2s"
    };

    emitSafeEvent(event);

    expect(info).toHaveBeenCalledWith(
      JSON.stringify({
        name: "check_completed",
        environment: "preview",
        responseKind: "result",
        risk: "SAFE",
        latencyBucket: "<2s"
      })
    );
  });

  it("accepts the daily_cap reason code", () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    expect(() =>
      emitSafeEvent({
        name: "check_failed",
        environment: "test",
        reasonCode: "daily_cap"
      })
    ).not.toThrow();
  });

  it("rejects raw food text, raw A1C, prompt text, and full model output fields", () => {
    const unsafeFields = [
      { food: "sweetened cereal" },
      { a1c: 6.4 },
      { promptText: "Food: sweetened cereal\nA1C: 6.4" },
      {
        modelOutput:
          '{"kind":"result","risk":"SAFE","reason":"Looks fine."}'
      }
    ];

    for (const unsafeField of unsafeFields) {
      expect(() =>
        emitSafeEvent({
          name: "check_failed",
          environment: "production",
          reasonCode: "provider_error",
          ...unsafeField
        } as SafeTelemetryEvent)
      ).toThrow();
    }
  });
});
