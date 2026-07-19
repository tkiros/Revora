/**
 * Result-linked feedback client seam (§P1.6).
 *
 * Kept out of the React component so the request shape is unit-testable and so
 * the component never has to know the wire contract. The private comment is
 * trimmed and dropped when empty; the reason is omitted when unset — the server
 * zod schema is `.strict()`, so a stray/empty field would 400.
 *
 * Fail-soft: a network error resolves `false` rather than throwing. Feedback is
 * a courtesy signal, never something whose failure should surface an error to a
 * user who just answered a one-tap question.
 */

export type FeedbackReason =
  | "too_vague"
  | "wrong_food"
  | "unsafe_feeling"
  | "confusing"
  | "other";

export const FEEDBACK_REASON_OPTIONS: ReadonlyArray<{
  value: FeedbackReason;
  label: string;
}> = [
  { value: "too_vague", label: "Too vague" },
  { value: "wrong_food", label: "Wrong food" },
  { value: "unsafe_feeling", label: "Felt unsafe" },
  { value: "confusing", label: "Confusing" },
  { value: "other", label: "Something else" }
];

export const FEEDBACK_COMMENT_MAX = 500;

export async function submitResultFeedback(
  checkId: string,
  input: { helpful: boolean; reason?: FeedbackReason; comment?: string },
  fetchImpl: typeof fetch = fetch
): Promise<boolean> {
  const comment = input.comment?.trim();

  try {
    const response = await fetchImpl("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        checkId,
        helpful: input.helpful,
        ...(input.reason ? { reason: input.reason } : {}),
        ...(comment ? { comment } : {})
      })
    });
    return response.ok;
  } catch {
    return false;
  }
}
