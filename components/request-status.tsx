import type { CheckUiState } from "../lib/client/ui-state";

export function RequestStatus({
  state
}: {
  state: Extract<CheckUiState, { kind: "submitting" | "slow" | "error" }>;
}) {
  const content =
    state.kind === "submitting"
      ? {
          eyebrow: "Status",
          title: "Checking your food",
          message:
            "Stay on this page while Revora compares this food with your A1C input.",
          note: "This page will update here as soon as the answer is ready."
        }
      : state.kind === "slow"
        ? {
            eyebrow: "Still running",
            title: "Still checking",
            message:
              "This one is taking a little longer. Keep this page open while Revora finishes the check.",
            note: "You do not need to resubmit unless you want to change the food or A1C."
          }
        : {
            eyebrow: "Check paused",
            title: "Try again on this page",
            message: state.message,
            note: "Your food and A1C entry are still here if you want to try once more."
          };

  return (
    <section
      aria-live="polite"
      role="status"
      className="status-card"
      data-state={state.kind}
      data-testid="request-status"
    >
      <p className="status-eyebrow">{content.eyebrow}</p>
      <p className="status-title">{content.title}</p>
      <p className="status-copy">{content.message}</p>
      <p className="status-note">{content.note}</p>
    </section>
  );
}
