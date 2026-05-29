import { z } from "zod";

const SafeTelemetryEventSchema = z
  .object({
    name: z.enum(["check_completed", "check_failed", "launch_probe"]),
    environment: z.enum(["preview", "production", "development", "test"]),
    responseKind: z
      .enum(["result", "clarify", "not_food", "out_of_scope", "retry"])
      .optional(),
    risk: z.enum(["SAFE", "MODERATE", "HIGH"]).optional(),
    latencyBucket: z.enum(["<2s", "2-5s", "5-12s", ">12s"]).optional(),
    reasonCode: z
      .enum(["rate_limited", "provider_error", "schema_error", "paused"])
      .optional()
  })
  .strict();

export type SafeTelemetryEvent = z.infer<typeof SafeTelemetryEventSchema>;

export function emitSafeEvent(event: SafeTelemetryEvent): void {
  const safeEvent = SafeTelemetryEventSchema.parse(event);
  console.info(JSON.stringify(safeEvent));
}
