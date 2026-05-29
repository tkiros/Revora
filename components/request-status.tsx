import type { CheckUiState } from "../lib/client/ui-state";

export function RequestStatus({
  state
}: {
  state: Extract<CheckUiState, { kind: "submitting" | "slow" | "error" }>;
}) {
  const title =
    state.kind === "submitting"
      ? "Checking..."
      : state.kind === "slow"
        ? "Still checking"
        : "Try again";

  const message =
    state.kind === "submitting"
      ? "Revora is reviewing this food with your A1C range."
      : state.kind === "slow"
        ? "This check takes a little longer sometimes. Stay on this page while Revora finishes."
        : state.message;

  return (
    <section
      aria-live="polite"
      role="status"
      style={{
        border: "1px solid #cbd5e1",
        borderRadius: "20px",
        padding: "16px",
        backgroundColor: state.kind === "error" ? "#fef2f2" : "#f8fafc",
        color: "#334155"
      }}
    >
      <p style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>{title}</p>
      <p style={{ margin: "8px 0 0" }}>{message}</p>
    </section>
  );
}
