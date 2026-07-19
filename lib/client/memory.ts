import type { MemoryLabel } from "./analytics";

/**
 * Meal memory client seam (plan §P3.2).
 *
 * Kept out of the React component so the wire contract is unit-testable and the
 * component never has to know it. Free text is trimmed and dropped when empty;
 * every unset field is omitted — the server zod schema is `.strict()`, so a
 * stray/empty field would 400.
 *
 * Fail-soft: a network error resolves `false` rather than throwing. Saving a
 * memory is a courtesy, never something whose failure should surface an error.
 */

export const MEMORY_CHOICE_MAX = 200;
export const MEMORY_NOTE_MAX = 500;

export type MemoryEase = "easy" | "okay" | "hard";
export type { MemoryLabel };

export const MEMORY_EASE_OPTIONS: ReadonlyArray<{
  value: MemoryEase;
  label: string;
}> = [
  { value: "easy", label: "Easy" },
  { value: "okay", label: "Okay" },
  { value: "hard", label: "Hard" }
];

// Human labels for the closed vocabulary. `family_meal` is the only value whose
// display differs from a title-cased key.
export const MEMORY_LABEL_OPTIONS: ReadonlyArray<{
  value: MemoryLabel;
  label: string;
}> = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
  { value: "restaurant", label: "Restaurant" },
  { value: "travel", label: "Travel" },
  { value: "family_meal", label: "Family meal" },
  { value: "other", label: "Other" }
];

export type MemoryInput = {
  choice?: string;
  wouldRepeat?: boolean;
  ease?: MemoryEase;
  note?: string;
  favorite?: boolean;
  label?: MemoryLabel;
};

export async function saveMealMemory(
  checkId: string,
  input: MemoryInput,
  fetchImpl: typeof fetch = fetch
): Promise<boolean> {
  const choice = input.choice?.trim();
  const note = input.note?.trim();

  try {
    const response = await fetchImpl("/api/memory", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        checkId,
        ...(choice ? { choice } : {}),
        ...(typeof input.wouldRepeat === "boolean"
          ? { wouldRepeat: input.wouldRepeat }
          : {}),
        ...(input.ease ? { ease: input.ease } : {}),
        ...(note ? { note } : {}),
        ...(input.favorite ? { favorite: input.favorite } : {}),
        ...(input.label ? { label: input.label } : {})
      })
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * A prior saved memory the recall endpoint matched to the just-checked meal
 * (plan §P3.3). All owner-only free text is already decrypted server-side; the
 * client only renders it back to its owner. `food` is the stored meal text used
 * to pre-fill a one-tap re-check.
 */
export type RecalledMemory = {
  id: string;
  checkId: string;
  food: string | null;
  risk: "SAFE" | "MODERATE" | "HIGH";
  band: string;
  choice: string | null;
  wouldRepeat: boolean | null;
  ease: MemoryEase | null;
  note: string | null;
  favorite: boolean;
  label: MemoryLabel | null;
  savedAt: string;
  checkedAt: string;
};

/**
 * Recall the caller's prior saved memories matching a just-checked meal (§P3.3).
 * The meal text rides the POST BODY, never a URL (global constraint §5). Called
 * only AFTER a result renders (render-after-result) so recall never precedes the
 * check. Fail-soft: any error or non-2xx (403 free, 404 flag-off, 401 guest,
 * network) resolves to an empty list — recall is a courtesy, never an error or a
 * paywall (global constraint §7).
 */
export async function recallMealMemory(
  food: string,
  fetchImpl: typeof fetch = fetch
): Promise<RecalledMemory[]> {
  const trimmed = food.trim();
  if (!trimmed) {
    return [];
  }
  try {
    const response = await fetchImpl("/api/memory/recall", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ food: trimmed })
    });
    if (!response.ok) {
      return [];
    }
    const body: unknown = await response.json();
    if (
      typeof body === "object" &&
      body !== null &&
      Array.isArray((body as { matches?: unknown }).matches)
    ) {
      return (body as { matches: RecalledMemory[] }).matches;
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Bounded analytics summary of a save — memory FIELD TYPES, never their contents
 * (plan §P3.2/§10.1). Kept next to the seam so both the component's props and the
 * event stay in one place; the choice/note strings are reduced to a boolean here
 * and can never reach the vendor.
 */
export function memorySavedProps(input: MemoryInput): {
  hasChoice: boolean;
  hasNote: boolean;
  wouldRepeat: "yes" | "no" | "unset";
  favorite: boolean;
  label: MemoryLabel | "none";
} {
  return {
    hasChoice: Boolean(input.choice?.trim()),
    hasNote: Boolean(input.note?.trim()),
    wouldRepeat:
      input.wouldRepeat === true
        ? "yes"
        : input.wouldRepeat === false
          ? "no"
          : "unset",
    favorite: Boolean(input.favorite),
    label: input.label ?? "none"
  };
}
