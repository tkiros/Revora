import { z } from "zod";

import { CLINICAL_ROUTES } from "./clinical-risk";

/**
 * PII-free server telemetry.
 *
 * Every field is a bounded enum or a number — there is deliberately no
 * free-text field anywhere in this schema, and `.strict()` rejects any key not
 * listed, so a future caller cannot smuggle a food description or an A1C into
 * the log by adding a property. That property is what makes it safe to emit
 * these events for health-adjacent traffic at all, and it is asserted by
 * tests/unit/revora/privacy-minimal.test.ts.
 *
 * Note the trap this schema sets for callers: `emitSafeEvent` PARSES, so an
 * event carrying a `responseKind` missing from the enum below THROWS. In the
 * check route that throw is caught and degrades the user to a retry card — so
 * a new response kind that is added to the engine but not to this enum fails
 * silently and looks like a model problem. Keep the two in lockstep.
 */
const SafeTelemetryEventSchema = z
  .object({
    name: z.enum(["check_completed", "check_failed", "launch_probe"]),
    environment: z.enum(["preview", "production", "development", "test"]),
    responseKind: z
      .enum([
        "result",
        "clarify",
        "not_food",
        "out_of_scope",
        "clinical",
        "retry"
      ])
      .optional(),
    risk: z.enum(["SAFE", "MODERATE", "HIGH"]).optional(),
    /** Which clinical class routed (W-01/W-10). Never the input that matched. */
    clinicalRoute: z.enum(CLINICAL_ROUTES).optional(),
    latencyBucket: z.enum(["<2s", "2-5s", "5-12s", ">12s"]).optional(),
    // W-13 / N-13: the buckets above cannot produce a p95, so the proposed
    // ≤5s SLO was literally unmeasurable. Raw duration is still PII-free.
    durationMs: z.number().int().nonnegative().optional(),
    // W-13 / N-18: without these, a user reporting a bad answer could not be
    // attributed to a model or reproduced — two models served the same endpoint
    // and nothing recorded which one answered.
    model: z.string().regex(/^[\w.\-/]{1,60}$/).optional(),
    promptVersion: z.string().regex(/^[\w.\-]{1,30}$/).optional(),
    contractVersion: z.string().regex(/^[\w.\-]{1,30}$/).optional(),
    reasonCode: z
      .enum([
        "rate_limited",
        "daily_cap",
        "provider_error",
        "schema_error",
        "paused",
        // Connection never reached the provider (nothing billed) and one
        // retry also failed — split from provider_error so ops can tell a
        // network blip from a real outage (QA round 2026-07-10, REL-01).
        "connection_blip"
      ])
      .optional()
  })
  .strict();

export type SafeTelemetryEvent = z.infer<typeof SafeTelemetryEventSchema>;

export function emitSafeEvent(event: SafeTelemetryEvent): void {
  const safeEvent = SafeTelemetryEventSchema.parse(event);
  console.info(JSON.stringify(safeEvent));
}
