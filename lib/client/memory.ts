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
