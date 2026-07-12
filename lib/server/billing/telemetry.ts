import { z } from "zod";

// Same transport as lib/revora/telemetry.ts: schema-validated console JSON,
// queryable in Vercel logs. No PII by construction — names + bounded enums only.
// ponytail: log-based metrics; upgrade to a real sink post-launch if log
// querying becomes the bottleneck for the §3 price-test readouts.
const BillingTelemetryEventSchema = z
  .object({
    name: z.enum([
      "trial_started",
      "trial_converted",
      "trial_canceled",
      "pantry_purchased",
      "precharge_email_sent",
      // Churn, server-side (W-10). These live HERE, not in lib/revora/telemetry,
      // because the webhook is the only thing that can see them: a canceled or
      // refunded user is precisely the user who is no longer running our
      // client-side analytics. They were previously declared on the revora
      // SafeTelemetryEvent enum, which the webhook does not import and whose
      // .strict() schema could never have accepted them — two dead enum
      // entries documenting a signal that did not exist.
      "subscription_canceled",
      "subscription_refunded"
    ]),
    priceVariant: z.enum(["999", "1299", "1999"]).optional(),
    environment: z
      .enum(["preview", "production", "development", "test"])
      .optional()
  })
  .strict();

export type BillingTelemetryEvent = z.infer<typeof BillingTelemetryEventSchema>;

function currentEnvironment(): BillingTelemetryEvent["environment"] {
  if (process.env.NODE_ENV === "test") return "test";
  switch (process.env.VERCEL_ENV) {
    case "preview":
      return "preview";
    case "production":
      return "production";
    case "development":
      return "development";
    default:
      return process.env.NODE_ENV === "production" ? "production" : "development";
  }
}

export function emitBillingEvent(event: BillingTelemetryEvent): void {
  const safe = BillingTelemetryEventSchema.parse({
    environment: currentEnvironment(),
    ...event
  });
  console.info(JSON.stringify(safe));
}
