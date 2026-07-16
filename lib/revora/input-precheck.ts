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

// W-21: structural patterns, not exact phrases. Each targets a manipulation
// SHAPE (override verb + instruction noun, prompt exfiltration, persona
// hijack, forced verdict) so paraphrases land too. Every pattern requires an
// instruction-domain word a meal description has no reason to contain — the
// false-positive surface on real food inputs is deliberately near-zero, and
// the model-side schema + postprocess contract remain the backstop for
// anything that slips past.
const PROMPT_INJECTION_PATTERNS = [
  // "ignore/disregard/forget/override … instructions/rules/prompt/safety"
  /\b(?:ignore|disregard|forget|override|bypass|skip)\b[^.,;!?]{0,40}\b(?:instructions?|rules?|guidelines?|prompts?|polic(?:y|ies)|safety)\b/i,
  // naming the hidden prompt/config at all
  /\b(?:system|developer|hidden|initial)\s+(?:prompt|message|instructions?)\b/i,
  // exfiltration: "reveal/show/print/repeat/leak … prompt/instructions"
  /\b(?:reveal|show|print|repeat|output|leak|display)\b[^.,;!?]{0,40}\b(?:prompts?|instructions?|system message)\b/i,
  // persona hijack
  /\byou are now\b/i,
  /\bpretend\s+(?:to be|you(?:'re| are))\b/i,
  /\b(?:act|behave|respond)\s+as\s+(?:a|an|the)\b/i,
  /\bjailbreak/i,
  /\bdeveloper mode\b/i,
  // Deliberately NOT here: forced-verdict coaxing ("just say SAFE"). The
  // frozen corpus pins that a real food with a coax bolted on still gets a
  // cautious VERDICT (adversarial-coax-energy-drink expects `result`) — the
  // deterministic floors and postprocess contract absorb the coercion, and a
  // refusal there would punish users who merely quote something they read.
  // off-task generation
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

// Matched with substring semantics (containsAnyLoose), which is why singulars
// cover most plurals for free ("cookie" ⊂ "cookies") — but NOT irregular ones:
// "pastry" is not a substring of "pastries", so both forms must be listed.
// N-17 named three foods that slipped through; two of them ("jelly beans",
// "eggnog") were never on these lists at all, so no amount of matching-semantics
// work would have caught them. Sugar has to be *named* to be floored.
const CARBS_ONLY_PATTERNS = [
  "plain bagel",
  "bagel",
  "white rice",
  "plain rice",
  "pasta",
  "tortilla",
  "cereal",
  "candy",
  "candies",
  "pastry",
  "pastries",
  "donut",
  "doughnut",
  "cookie",
  "cake",
  "brownie",
  "milkshake",
  "soda",
  "juice",
  "jelly bean",
  "jellybean",
  "eggnog",
  "ice cream"
] as const;

const HIGH_RISK_PATTERNS = [
  "candy",
  "candies",
  "pastry",
  "pastries",
  "donut",
  "doughnut",
  "cookie",
  "cake",
  "brownie",
  "milkshake",
  "soda",
  "juice",
  "frappuccino",
  "jelly bean",
  "jellybean",
  "eggnog",
  "ice cream"
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
    if (containsAnyLoose(normalized, HIGH_RISK_PATTERNS)) {
      flags[1] = "high_risk";
    }

    return {
      kind: "carbs_only",
      flags
    };
  }

  // Carb-forward but buffered (protein/veg present): NOT carbs-only, so it goes
  // to the model as normal — but it now carries a deterministic `borderline`
  // flag the model cannot veto. In the top band that flag is what fires the
  // SAFE→MODERATE floor; in the lower bands it is inert. See isCarbForward.
  if (isCarbForward(normalized)) {
    return {
      kind: "ok",
      flags: ["borderline"]
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
  return containsAnyLoose(food, CARBS_ONLY_PATTERNS) && !hasBufferContext(food);
}

/**
 * Carb-FORWARD, as distinct from carbs-ONLY (2026-07-11 live-eval finding).
 *
 * A meal can be built on refined carbs and still carry protein — a salmon
 * avocado roll, a chicken sandwich with fries. `isCarbsOnlyMeal` deliberately
 * says no to those, because the buffer is real. But "not carbs-only" is not the
 * same as "unremarkable", and in the top A1C band (6.3–6.4) the difference
 * decides whether a conservatism floor fires at all.
 *
 * WHY THIS EXISTS — the defect it closes is worth stating plainly:
 *
 *   postprocess's upper-band floor triggers on
 *     band === "prediabetes_63_64" && (flags.has("borderline") || flags.has("carbs_only"))
 *   where `flags` is precheckFlags ∪ **the model's own policy_flags**.
 *
 *   For "salmon avocado roll" the precheck contributed NO flags, so the only
 *   possible source of "borderline" was the model itself. Which means: the
 *   safety floor whose entire job is to catch a model that wrongly answers SAFE
 *   required that same model to volunteer that it was unsure. A model confident
 *   enough to return SAFE does not flag itself borderline — so the floor was
 *   unreachable in precisely the case it was built for.
 *
 *   The live eval proved it: gpt-5.4-mini returned SAFE for a salmon avocado
 *   roll at A1C 6.4, nothing floored it, and it shipped as "Clear" — a
 *   harmful-SAFE, the one hard P0 gate. Every mock eval was green, because the
 *   mocks supply the borderline flag the real model does not.
 *
 * This detector gives the floor a trigger the model cannot veto. It is
 * word-boundary matched (so "roll" does not fire on "rolled oats") and its only
 * consequence is the SAFE→MODERATE floor in the top band — it can never raise a
 * verdict to HIGH, and it is inert in the lower bands.
 *
 * The VOCABULARY below is a dietary judgment and belongs to the RD panel
 * (W-05), not to engineering. It is deliberately conservative: at the top of the
 * prediabetes range, "Be careful" instead of "Clear" on a carb-forward plate is
 * the documented meaning of conservativeLevel "high".
 */
/**
 * Engineering candidate vocabulary for the N-30 upper-band safety floor.
 *
 * Version changes are review-significant. W-05 is not closed until an external
 * RDN/CDCES signs this exact version in the dietitian panel artifact.
 */
export const CARB_FORWARD_POLICY_VERSION = "2026-07-12.2";

export const CARB_FORWARD_TOKENS = [
  "sushi",
  "maki",
  "roll",
  "rolls",
  "sandwich",
  "sandwiches",
  "burger",
  "bun",
  "buns",
  "wrap",
  "wraps",
  "burrito",
  "taco",
  "tacos",
  "pizza",
  "fries",
  "chips",
  "crisps",
  "noodles",
  "ramen",
  "udon",
  "spaghetti",
  "lasagna",
  "bread",
  "toast",
  "baguette",
  "naan",
  "roti",
  "pita",
  "tortilla",
  "potato",
  "potatoes",
  "rice",
  "pasta",
  "bagel",
  "cereal",
  "croissant",
  "muffin",
  "waffle",
  "waffles",
  "pancake",
  "pancakes",
  "congee",
  "couscous"
] as const;

/** Low-carb impostors that contain a carb word but are not carb-forward. */
export const CARB_FORWARD_EXCLUSIONS = [
  "cauliflower rice",
  "konjac rice",
  "shirataki noodles",
  "shirataki",
  "cauliflower crust",
  "lettuce wrap",
  "lettuce wraps",
  // Both forms: boundary matching means the singular exclusion does not cover
  // the plural, but "potatoes" is a token — "sweet potatoes" escaped (G7).
  "sweet potato",
  "sweet potatoes"
] as const;

export function isCarbForward(food: string): boolean {
  let text = food;
  for (const phrase of CARB_FORWARD_EXCLUSIONS) {
    text = text.replace(termPattern(phrase, "gu"), " ");
  }

  return containsAny(text, CARB_FORWARD_TOKENS);
}

/**
 * Compound foods that CONTAIN a buffer token but are not buffered foods
 * (N-17). This is the other half of the word-boundary fix, and the half that
 * boundaries alone cannot solve: "jelly beans" contains the whole word "beans",
 * and "protein bar" the whole word "protein", so both satisfy the protein
 * buffer under any boundary rule — and satisfying the buffer SUPPRESSES the
 * carbs-only floor. Sugar was disabling a safety floor by claiming to be a
 * legume.
 *
 * These phrases are removed from the text before the buffer test runs, so the
 * confection can no longer vouch for itself.
 */
const BUFFER_EXCLUSIONS = [
  "jelly bean",
  "jelly beans",
  "jellybean",
  "jellybeans",
  "protein bar",
  "protein bars",
  "protein shake",
  "protein shakes",
  "protein cookie",
  "protein cookies",
  "protein ball",
  "protein balls",
  "egg roll",
  "egg rolls",
  "egg tart",
  "egg tarts",
  "candy bean",
  "vanilla bean",
  "vanilla beans",
  "coffee bean",
  "coffee beans",
  "cocoa bean",
  "cocoa beans",
  "pepper jelly",
  "candied pepper"
] as const;

function hasBufferContext(food: string): boolean {
  let text = food;
  for (const phrase of BUFFER_EXCLUSIONS) {
    text = text.replace(termPattern(phrase, "gu"), " ");
  }

  return (
    containsAny(text, PROTEIN_TOKENS) ||
    containsAny(text, NONSTARCHY_VEGETABLE_TOKENS)
  );
}

/**
 * Word-boundary term matching (N-17 / W-21).
 *
 * Used for the BUFFER lists only, and the asymmetry is the whole point.
 *
 * The two kinds of list in this file err in opposite directions:
 *
 *  - CARBS_ONLY / HIGH_RISK are risk-RAISING. An over-match only ever floors a
 *    verdict upward, so loose substring matching there is safe-erring — and it
 *    is what makes "cookies", "cupcake" and "brownies" match at all. Tightening
 *    those to word boundaries would silently DROP every plural from the safety
 *    floors, which is a regression dressed up as a fix.
 *
 *  - PROTEIN / NONSTARCHY_VEGETABLE are risk-SUPPRESSING: matching one disables
 *    the carbs-only floor. Here an over-match is the hazard, so these are
 *    anchored — "eggnog" no longer reads as "egg".
 *
 * Boundaries alone do not finish the job (a whole-word "beans" still hides
 * inside "jelly beans"), which is what BUFFER_EXCLUSIONS above handles.
 */
const BOUNDARY_CACHE = new Map<string, RegExp>();

function termPattern(term: string, flags = "iu"): RegExp {
  const key = `${flags}:${term}`;
  let pattern = BOUNDARY_CACHE.get(key);

  if (!pattern) {
    const escaped = term
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\s+/g, "\\s+");
    pattern = new RegExp(
      `(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`,
      flags
    );
    BOUNDARY_CACHE.set(key, pattern);
  }

  return pattern;
}

/** Word-boundary matching — for the risk-suppressing buffer lists. */
function containsAny(food: string, terms: readonly string[]): boolean {
  return terms.some((term) => termPattern(term).test(food));
}

/** Substring matching — for the risk-raising lists, where over-matching is safe. */
function containsAnyLoose(food: string, terms: readonly string[]): boolean {
  return terms.some((term) => food.includes(term));
}
