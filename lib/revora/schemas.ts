import { z } from "zod";

import { CLINICAL_ROUTES } from "./clinical-risk";

const FOOD_MAX_LENGTH = 160;
const RESPONSE_TEXT_MAX_LENGTH = 280;

const TrimmedResponseTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(RESPONSE_TEXT_MAX_LENGTH);

const NullableResponseTextSchema = TrimmedResponseTextSchema.nullable();

export const CheckRequestSchema = z
  .object({
    food: z.string().trim().min(1).max(FOOD_MAX_LENGTH),
    a1c: z.number().finite().gte(0).lte(20)
  })
  .strict();

export type CheckRequest = z.infer<typeof CheckRequestSchema>;

export const RevoraRiskSchema = z.enum(["SAFE", "MODERATE", "HIGH"]);
export type RevoraRisk = z.infer<typeof RevoraRiskSchema>;

export const RevoraClinicalRouteSchema = z.enum(CLINICAL_ROUTES);

export const RevoraResponseKindSchema = z.enum([
  "result",
  "clarify",
  "not_food",
  "out_of_scope",
  "clinical",
  "retry"
]);
export type RevoraResponseKind = z.infer<typeof RevoraResponseKindSchema>;

// The kinds the MODEL may emit. "clinical" is deliberately absent: a clinical
// route is decided before the model runs and answered from approved copy, so
// the model is never given the option of composing a medical response.
export const RevoraModelKindSchema = z.enum([
  "result",
  "clarify",
  "not_food",
  "carbs_only"
]);
export type RevoraModelKind = z.infer<typeof RevoraModelKindSchema>;

export const RevoraPolicyFlagSchema = z.enum([
  "safe_food",
  "borderline",
  "high_risk",
  "ambiguous",
  "carbs_only",
  "non_food"
]);
export type RevoraPolicyFlag = z.infer<typeof RevoraPolicyFlagSchema>;

const ExamplesSchema = z.array(z.string().trim().min(1).max(FOOD_MAX_LENGTH));

const BaseRevoraModelOutputSchema = z
  .object({
    kind: RevoraModelKindSchema,
    risk: RevoraRiskSchema.nullable(),
    reason: NullableResponseTextSchema,
    adjustment: NullableResponseTextSchema,
    swap: NullableResponseTextSchema,
    question: NullableResponseTextSchema,
    examples: ExamplesSchema,
    policy_flags: z.array(RevoraPolicyFlagSchema)
  })
  .strict();

export const RevoraModelOutputSchema = BaseRevoraModelOutputSchema.superRefine(
  (value, ctx) => {
    if (value.kind === "result" || value.kind === "carbs_only") {
      if (value.risk === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["risk"],
          message: "Result outputs must include a risk classification."
        });
      }

      if (value.reason === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["reason"],
          message: "Result outputs must include a qualitative reason."
        });
      }
    }

    if (value.kind === "clarify" && value.question === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["question"],
        message: "Clarification outputs must include one question."
      });
    }

    if (value.kind === "not_food" && value.examples.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["examples"],
        message: "Non-food outputs must include concrete food examples."
      });
    }
  }
);

export type RevoraModelOutput = z.infer<typeof RevoraModelOutputSchema>;

export const revoraModelJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "kind",
    "risk",
    "reason",
    "adjustment",
    "swap",
    "question",
    "examples",
    "policy_flags"
  ],
  properties: {
    kind: {
      type: "string",
      enum: ["result", "clarify", "not_food", "carbs_only"]
    },
    risk: {
      type: ["string", "null"],
      enum: ["SAFE", "MODERATE", "HIGH", null]
    },
    // Length bounds mirror the Zod schema (TrimmedResponseTextSchema /
    // ExamplesSchema) so locally invalid strings — e.g. the benchmarked
    // examples:[""] failure — are rejected by the provider's constrained
    // decoding instead of falling to the retry fallback. Verified accepted by
    // the OpenAI Responses API in strict mode (2026-07-11 probe).
    reason: { type: ["string", "null"], minLength: 1, maxLength: 280 },
    adjustment: { type: ["string", "null"], minLength: 1, maxLength: 280 },
    swap: { type: ["string", "null"], minLength: 1, maxLength: 280 },
    question: { type: ["string", "null"], minLength: 1, maxLength: 280 },
    examples: {
      type: "array",
      items: { type: "string", minLength: 1, maxLength: 160 }
    },
    policy_flags: {
      type: "array",
      items: {
        type: "string",
        enum: [
          "safe_food",
          "borderline",
          "high_risk",
          "ambiguous",
          "carbs_only",
          "non_food"
        ]
      }
    }
  }
} as const;

const DisclaimerSchema = TrimmedResponseTextSchema;
const UserMessageSchema = TrimmedResponseTextSchema;

export const RevoraUserResultSchema = z
  .object({
    kind: z.literal("result"),
    risk: RevoraRiskSchema,
    reason: UserMessageSchema,
    adjustment: NullableResponseTextSchema,
    swap: NullableResponseTextSchema,
    disclaimer: DisclaimerSchema
  })
  .strict();

export const RevoraUserClarifySchema = z
  .object({
    kind: z.literal("clarify"),
    question: UserMessageSchema,
    examples: ExamplesSchema,
    disclaimer: DisclaimerSchema
  })
  .strict();

export const RevoraUserNotFoodSchema = z
  .object({
    kind: z.literal("not_food"),
    message: UserMessageSchema,
    examples: ExamplesSchema,
    disclaimer: DisclaimerSchema
  })
  .strict();

export const RevoraUserOutOfScopeSchema = z
  .object({
    kind: z.literal("out_of_scope"),
    route: z.enum([
      "below_prediabetes_range",
      "diabetes_range_out_of_scope"
    ]),
    message: UserMessageSchema,
    disclaimer: DisclaimerSchema
  })
  .strict();

export const RevoraUserRetrySchema = z
  .object({
    kind: z.literal("retry"),
    message: UserMessageSchema,
    disclaimer: DisclaimerSchema
  })
  .strict();

/**
 * Clinical route (W-01). Structurally incapable of carrying a verdict: there is
 * no `risk` field, so no code path — however broken — can attach "Clear" to a
 * message about insulin dosing or a hypoglycaemic episode.
 */
export const RevoraUserClinicalSchema = z
  .object({
    kind: z.literal("clinical"),
    route: RevoraClinicalRouteSchema,
    message: UserMessageSchema,
    disclaimer: DisclaimerSchema
  })
  .strict();

export const RevoraUserResponseSchema = z.discriminatedUnion("kind", [
  RevoraUserResultSchema,
  RevoraUserClarifySchema,
  RevoraUserNotFoodSchema,
  RevoraUserOutOfScopeSchema,
  RevoraUserClinicalSchema,
  RevoraUserRetrySchema
]);

export type RevoraUserResponse = z.infer<typeof RevoraUserResponseSchema>;
