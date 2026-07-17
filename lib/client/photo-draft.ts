import type { MealDraftItem } from "../meal/photo-extract";
import { FOOD_MAX_LENGTH } from "../revora/schemas";

export type PhotoDraftResult =
  | { kind: "draft"; dish: string | null; items: MealDraftItem[] }
  | { kind: "upsell"; message: string }
  | { kind: "error"; message: string };

const GENERIC_ERROR =
  "The photo didn't come through this time. You can retake it, or just type or dictate the meal instead.";

export function composeDraftText(
  dish: string | null,
  items: MealDraftItem[]
): string {
  // The composed text is submitted to /api/check, whose schema caps food at
  // FOOD_MAX_LENGTH — a detailed vision draft over the cap turned into a
  // fail-closed retry card for a user who just confirmed the app's own draft
  // (found by the 2026-07-17 Tier-1 photo run, case p-home-bacon-cheeseburger).
  // Degrade detail in order: full portions -> names only -> fewer items, so
  // glycemic drivers (component names) outlive exact counts.
  const compose = (list: string) =>
    dish && list ? `${dish}: ${list}` : (dish ?? list);

  const withPortions = compose(
    items
      .map((item) => (item.portion ? `${item.name} (${item.portion})` : item.name))
      .join(", ")
  );
  if (withPortions.length <= FOOD_MAX_LENGTH) return withPortions;

  const names = items.map((item) => item.name);
  for (let keep = names.length; keep >= 1; keep -= 1) {
    const candidate = compose(names.slice(0, keep).join(", "));
    if (candidate.length <= FOOD_MAX_LENGTH) return candidate;
  }
  return compose("").slice(0, FOOD_MAX_LENGTH);
}

export async function requestPhotoDraft(
  imageDataUrl: string
): Promise<PhotoDraftResult> {
  let response: Response;
  try {
    response = await fetch("/api/check/photo-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageDataUrl }),
      signal: AbortSignal.timeout(30_000)
    });
  } catch {
    return { kind: "error", message: GENERIC_ERROR };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { kind: "error", message: GENERIC_ERROR };
  }
  const body = (payload ?? {}) as Record<string, unknown>;

  if (response.status === 402 && typeof body.message === "string") {
    return { kind: "upsell", message: body.message };
  }
  if (response.ok && body.kind === "draft" && Array.isArray(body.items)) {
    return {
      kind: "draft",
      dish: typeof body.dish === "string" ? body.dish : null,
      items: (body.items as MealDraftItem[]).filter(
        (item) => typeof item?.name === "string"
      )
    };
  }
  return {
    kind: "error",
    message: typeof body.message === "string" ? body.message : GENERIC_ERROR
  };
}
