import fs from "node:fs";
import path from "node:path";

import { z } from "zod";

import {
  createOpenAIRevoraModelClient,
  type RevoraModelClient
} from "../../lib/revora/openai-client";
import type { RevoraPromptPayload } from "../../lib/revora/prompt";
import {
  CheckRequestSchema,
  RevoraModelOutputSchema,
  RevoraResponseKindSchema,
  RevoraRiskSchema
} from "../../lib/revora/schemas";

export const REQUIRED_CATEGORIES = [
  "clearly_safe",
  "borderline",
  "high_risk",
  "non_food",
  "ambiguous",
  "carbs_only",
  "out_of_range_a1c",
  "prompt_injection",
  "adversarial"
] as const;

const RevoraEvalCategorySchema = z.enum(REQUIRED_CATEGORIES);
const DETERMINISTIC_SHORT_CIRCUIT_CATEGORIES = new Set<
  (typeof REQUIRED_CATEGORIES)[number]
>(["non_food"]);

export const RevoraEvalCaseSchema = z
  .object({
    id: z.string().trim().min(1),
    category: RevoraEvalCategorySchema,
    input: CheckRequestSchema,
    harmfulIfSafe: z.boolean(),
    expectedKinds: z.array(RevoraResponseKindSchema).min(1),
    disallowRisk: z.array(RevoraRiskSchema).optional(),
    // DOMAIN deliverable (Task 3.1): the authoritative risk band(s) a result may
    // land in, derived from docs/safety/a1c-band-rubric.md + evidence-pack.md and
    // cited in labelSource. Optional so the gate degrades gracefully — scoreRun
    // measures riskAccuracy only over cases that carry these. NOT eng-authored.
    acceptableRisks: z.array(RevoraRiskSchema).min(1).optional(),
    labelSource: z.string().trim().min(1).optional(),
    mockModelOutput: RevoraModelOutputSchema.optional(),
    notes: z.string().trim().min(1)
  })
  .strict();

export type RevoraEvalCase = z.infer<typeof RevoraEvalCaseSchema>;

const FIXTURE_PATH = path.join(
  process.cwd(),
  "tests/fixtures/revora-eval-cases.json"
);

export function loadEvalCases(): RevoraEvalCase[] {
  const raw = JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")) as unknown;
  return z.array(RevoraEvalCaseSchema).parse(raw);
}

export function createEvalModelClient(
  cases: readonly RevoraEvalCase[]
): RevoraModelClient {
  if (isLiveRevoraEvalEnabled()) {
    return createOpenAIRevoraModelClient();
  }

  const casesByInput = new Map<string, RevoraEvalCase>();

  for (const evalCase of cases) {
    if (
      DETERMINISTIC_SHORT_CIRCUIT_CATEGORIES.has(evalCase.category) &&
      evalCase.mockModelOutput
    ) {
      throw new Error(
        `Eval fixture ${evalCase.id} sets mockModelOutput for deterministic short-circuit category ${evalCase.category}.`
      );
    }

    const key = buildLookupKey(evalCase.input);
    if (casesByInput.has(key)) {
      throw new Error(`Duplicate eval fixture input key: ${key}`);
    }

    casesByInput.set(key, evalCase);
  }

  return {
    async generate(prompt) {
      const evalCase = casesByInput.get(buildLookupKey(parsePromptInput(prompt)));

      if (!evalCase) {
        throw new Error(
          `No eval fixture matched prompt input.\n${prompt.input}`
        );
      }

      if (!evalCase.mockModelOutput) {
        throw new Error(
          `Eval fixture ${evalCase.id} reached the model path without mockModelOutput.`
        );
      }

      return evalCase.mockModelOutput;
    }
  };
}

export function isLiveRevoraEvalEnabled(): boolean {
  return process.env.REVORA_LIVE_EVAL === "1";
}

function buildLookupKey(input: { food: string; a1c: number }): string {
  return `${input.food.trim().toLowerCase()}::${input.a1c}`;
}

function parsePromptInput(prompt: RevoraPromptPayload): { food: string; a1c: number } {
  const foodMatch = prompt.input.match(/^Food:\s+(.+)$/m);
  const a1cMatch = prompt.input.match(/^A1C:\s+([0-9]+(?:\.[0-9]+)?)$/m);

  if (!foodMatch || !a1cMatch) {
    throw new Error(`Could not parse eval prompt input.\n${prompt.input}`);
  }

  return {
    food: foodMatch[1].trim(),
    a1c: Number(a1cMatch[1])
  };
}
