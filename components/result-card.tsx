import type { RevoraUserResponse } from "../lib/client/ui-state";

export function ResultCard({ response }: { response: RevoraUserResponse }) {
  return (
    <section
      aria-live="polite"
      style={{
        border: "1px solid #cbd5e1",
        borderRadius: "20px",
        padding: "16px",
        backgroundColor: "#f8fafc",
        color: "#334155",
        display: "grid",
        gap: "10px"
      }}
    >
      {response.kind === "result" ? (
        <>
          <p
            style={{
              margin: 0,
              fontWeight: 800,
              color: "#0f172a",
              textTransform: "uppercase",
              letterSpacing: "0.08em"
            }}
          >
            {response.risk}
          </p>
          <p style={{ margin: 0, color: "#0f172a", lineHeight: 1.6 }}>
            {response.reason}
          </p>
          {response.adjustment ? (
            <p style={{ margin: 0 }}>
              <strong>Adjustment:</strong> {response.adjustment}
            </p>
          ) : null}
          {response.swap ? (
            <p style={{ margin: 0 }}>
              <strong>Swap:</strong> {response.swap}
            </p>
          ) : null}
        </>
      ) : null}

      {response.kind === "clarify" ? (
        <>
          <p style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>
            Revora needs one more detail
          </p>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{response.question}</p>
        </>
      ) : null}

      {response.kind === "not_food" ? (
        <>
          <p style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>
            Try a food description instead
          </p>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            Revora can help once you enter a food or meal, such as {response.examples.join(", ")}.
          </p>
        </>
      ) : null}

      {response.kind === "out_of_scope" ? (
        <>
          <p style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>
            Outside Revora&apos;s current scope
          </p>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{response.reason}</p>
        </>
      ) : null}

      {response.kind === "retry" ? (
        <>
          <p style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>
            Try again
          </p>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{response.message}</p>
        </>
      ) : null}

      <p style={{ margin: 0, fontSize: "14px", color: "#475569" }}>
        {response.disclaimer}
      </p>
    </section>
  );
}
