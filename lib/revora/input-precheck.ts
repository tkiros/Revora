import type { RevoraPolicyFlag } from "./schemas";

export type InputPrecheck =
  | { kind: "ok"; flags: RevoraPolicyFlag[] }
  | { kind: "not_food"; examples: string[] }
  | { kind: "clarify"; question: string }
  | { kind: "carbs_only"; flags: RevoraPolicyFlag[] };

const MAX_FOOD_LENGTH = 160;

const NON_FOOD_EXAMPLES = [
  "oatmeal with nuts",
  "grilled chicken with rice and vegetables",
  "egg scramble with spinach"
] as const;

const PROMPT_INJECTION_PATTERNS = [
  /\bignore previous instructions\b/i,
  /\bsystem prompt\b/i,
  /\bwrite (?:a|the)?\s*(?:poem|story|essay|joke|haiku)\b/i,
  /\btell me a joke\b/i
];

const ORDINARY_OBJECT_PATTERNS = [
  /\brunning shoes?\b/i,
  /\bsneakers?\b/i,
  /\blaptop charger\b/i,
  /\bphone charger\b/i,
  /\bdish soap\b/i,
  /\bhand soap\b/i,
  /\bwater bottle\b/i,
  /\bphone case\b/i,
  /\btoothbrush\b/i,
  /\bshampoo\b/i
] as const;

const AMBIGUOUS_PLAIN_OR_SWEETENED = [
  "oatmeal",
  "cereal",
  "yogurt",
  "smoothie"
];

const AMBIGUOUS_PROTEIN_OR_VEG = [
  "sandwich",
  "wrap",
  "salad",
  "bowl",
  "pasta"
];

const CARBS_ONLY_PATTERNS = [
  "plain bagel",
  "bagel",
  "white rice",
  "plain rice",
  "pasta",
  "tortilla",
  "cereal",
  "candy",
  "pastry",
  "donut",
  "cookie",
  "cake",
  "brownie",
  "milkshake",
  "soda",
  "juice"
] as const;

const HIGH_RISK_PATTERNS = [
  "candy",
  "pastry",
  "donut",
  "cookie",
  "cake",
  "brownie",
  "milkshake",
  "soda",
  "juice",
  "frappuccino"
] as const;

const PROTEIN_TOKENS = [
  "chicken",
  "salmon",
  "fish",
  "egg",
  "eggs",
  "tofu",
  "beans",
  "lentils",
  "turkey",
  "beef",
  "steak",
  "shrimp",
  "protein"
] as const;

const NONSTARCHY_VEGETABLE_TOKENS = [
  "broccoli",
  "spinach",
  "salad",
  "greens",
  "vegetables",
  "vegetable",
  "cauliflower",
  "zucchini",
  "cucumber",
  "pepper",
  "peppers"
] as const;

export function classifyInputBeforeModel(food: string): InputPrecheck {
  const normalized = normalize(food);

  if (normalized.length === 0) {
    return {
      kind: "clarify",
      question: "What food or meal are you checking?"
    };
  }

  if (normalized.length > MAX_FOOD_LENGTH) {
    return {
      kind: "clarify",
      question: "Can you shorten this to one food or meal?"
    };
  }

  if (looksLikeNonFood(normalized)) {
    return {
      kind: "not_food",
      examples: [...NON_FOOD_EXAMPLES]
    };
  }

  const ambiguousQuestion = getAmbiguousQuestion(normalized);
  if (ambiguousQuestion) {
    return {
      kind: "clarify",
      question: ambiguousQuestion
    };
  }

  if (isCarbsOnlyMeal(normalized)) {
    const flags: RevoraPolicyFlag[] = ["carbs_only", "borderline"];
    if (containsAny(normalized, HIGH_RISK_PATTERNS)) {
      flags[1] = "high_risk";
    }

    return {
      kind: "carbs_only",
      flags
    };
  }

  return {
    kind: "ok",
    flags: []
  };
}

function normalize(food: string): string {
  return food.trim().toLowerCase().replace(/\s+/g, " ");
}

function looksLikeNonFood(food: string): boolean {
  return (
    PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(food)) ||
    ORDINARY_OBJECT_PATTERNS.some((pattern) => pattern.test(food))
  );
}

function getAmbiguousQuestion(food: string): string | null {
  if (AMBIGUOUS_PLAIN_OR_SWEETENED.includes(food)) {
    return "Is this plain or sweetened?";
  }

  if (AMBIGUOUS_PROTEIN_OR_VEG.includes(food)) {
    return "Does this come with protein or nonstarchy vegetables?";
  }

  return null;
}

function isCarbsOnlyMeal(food: string): boolean {
  return containsAny(food, CARBS_ONLY_PATTERNS) && !hasBufferContext(food);
}

function hasBufferContext(food: string): boolean {
  return (
    containsAny(food, PROTEIN_TOKENS) ||
    containsAny(food, NONSTARCHY_VEGETABLE_TOKENS)
  );
}

function containsAny(food: string, terms: readonly string[]): boolean {
  return terms.some((term) => food.includes(term));
}
