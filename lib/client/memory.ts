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
 * A saved memory as the list/search/export endpoints return it (plan §P3.2/§P3.4).
 * All owner-only free text is already decrypted server-side; the client only
 * renders it back to its owner. Shared by the memory page and the client seams so
 * the wire shape lives in one place.
 */
export type SavedMemory = {
  id: string;
  checkId: string;
  food: string | null;
  risk: "SAFE" | "MODERATE" | "HIGH";
  choice: string | null;
  wouldRepeat: boolean | null;
  ease: MemoryEase | null;
  note: string | null;
  favorite: boolean;
  label: MemoryLabel | null;
  createdAt: string;
  updatedAt: string;
};

// User-authored fields only (plan §P3.4). Absent → left unchanged; `null` clears a
// nullable field; the server whitelist rejects any snapshot/check field. `favorite`
// is never null.
export type MemoryEditInput = {
  choice?: string | null;
  wouldRepeat?: boolean | null;
  ease?: MemoryEase | null;
  note?: string | null;
  favorite?: boolean;
  label?: MemoryLabel | null;
};

/**
 * Search the caller's own memories by a meal-text term (plan §P3.4). The term is
 * health data and rides the POST BODY, never a URL (global constraint §5). Returns
 * a discriminated result so the page can tell an EMPTY search from a FAILED one
 * (error-truth, global constraint §7): `{ ok:false }` is a real failure to surface
 * as a retry state, never an empty list. Caller must not call with a blank term.
 */
export async function searchMealMemories(
  q: string,
  fetchImpl: typeof fetch = fetch
): Promise<
  | {
      ok: true;
      memories: SavedMemory[];
      searchScanned: number | null;
      searchCapped: boolean;
    }
  | { ok: false }
> {
  const trimmed = q.trim();
  if (!trimmed) {
    return { ok: false };
  }
  try {
    const response = await fetchImpl("/api/memory/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ q: trimmed })
    });
    if (!response.ok) {
      return { ok: false };
    }
    const body: unknown = await response.json();
    if (
      typeof body === "object" &&
      body !== null &&
      Array.isArray((body as { memories?: unknown }).memories)
    ) {
      const parsed = body as {
        memories: SavedMemory[];
        searchScanned?: unknown;
        searchCapped?: unknown;
      };
      return {
        ok: true,
        memories: parsed.memories,
        // Honest-bounds passthrough: the server scans a bounded window and
        // reports it — the page must never present a capped scan as complete.
        searchScanned:
          typeof parsed.searchScanned === "number" ? parsed.searchScanned : null,
        searchCapped: parsed.searchCapped === true
      };
    }
    return { ok: false };
  } catch {
    return { ok: false };
  }
}

/**
 * Field-level edit of a memory's user-authored fields (plan §P3.4). Only the keys
 * present in `patch` are sent, so the server merges rather than replacing. Free
 * text is trimmed; an emptied field is sent as `null` to clear it. Resolves the
 * boolean ok so the page can surface a calm failure without throwing.
 */
export async function editMealMemory(
  id: string,
  patch: MemoryEditInput,
  fetchImpl: typeof fetch = fetch
): Promise<boolean> {
  const body: Record<string, unknown> = {};
  if (patch.choice !== undefined) {
    const trimmed = patch.choice?.trim();
    body.choice = trimmed ? trimmed : null;
  }
  if (patch.note !== undefined) {
    const trimmed = patch.note?.trim();
    body.note = trimmed ? trimmed : null;
  }
  if (patch.wouldRepeat !== undefined) {
    body.wouldRepeat = patch.wouldRepeat;
  }
  if (patch.ease !== undefined) {
    body.ease = patch.ease;
  }
  if (patch.favorite !== undefined) {
    body.favorite = patch.favorite;
  }
  if (patch.label !== undefined) {
    body.label = patch.label;
  }

  try {
    const response = await fetchImpl(`/api/memory/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    return response.ok;
  } catch {
    return false;
  }
}

/** Delete a single memory the caller owns (plan §P3.4). */
export async function deleteMealMemory(
  id: string,
  fetchImpl: typeof fetch = fetch
): Promise<boolean> {
  try {
    const response = await fetchImpl(`/api/memory/${id}`, { method: "DELETE" });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Delete every memory the caller owns (plan §P3.4). Sends the explicit
 * `{ confirm: true }` the server requires; the page gates this behind a calm
 * two-step confirm (no dark pattern).
 */
export async function deleteAllMealMemories(
  fetchImpl: typeof fetch = fetch
): Promise<boolean> {
  try {
    const response = await fetchImpl("/api/memory", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ confirm: true })
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
 * Whether the recall panel should emit `meal_memory_recalled` for this render
 * (plan §P3.3/§10.1). The event fires each time the panel renders with ≥1 VISIBLE
 * match — so:
 *  - `visibleMatchCount` (matches AFTER session-dismissals) must be ≥1: a meal
 *    whose only matches were dismissed renders nothing and must not emit.
 *  - it is keyed on `food`, not a once-per-session boolean: a SECOND, different
 *    recalled meal in the same session emits again. `lastEmittedFood` is the food
 *    the panel last emitted for; re-emitting only when the meal changed also
 *    dedupes a StrictMode double-invoke for the same meal.
 *
 * Pure + colocated on the seam so it is unit-testable without a jsdom/component
 * harness (this repo has none — same pattern as food-check-form's gate helpers).
 */
export function shouldEmitRecalled(
  food: string,
  visibleMatchCount: number,
  lastEmittedFood: string | null
): boolean {
  return visibleMatchCount >= 1 && food !== lastEmittedFood;
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
