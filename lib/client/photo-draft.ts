import type { MealDraftItem } from "../meal/photo-extract";

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
  const list = items
    .map((item) => (item.portion ? `${item.name} (${item.portion})` : item.name))
    .join(", ");
  if (dish && list) return `${dish}: ${list}`;
  return dish ?? list;
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
