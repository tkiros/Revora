import type { RevoraUserResponse } from "../lib/client/ui-state";

export function ResultCard({ response }: { response: RevoraUserResponse }) {
  if (response.kind === "result") {
    return (
      <section
        aria-live="polite"
        className="result-card"
        data-testid="result-card"
        data-kind={response.kind}
        data-risk={response.risk}
      >
        <p className="result-eyebrow">Revora result</p>
        <p className="result-title">{response.risk}</p>
        <p className="result-copy">{response.reason}</p>
        <div className="result-list">
          {response.adjustment ? (
            <p>
              <strong>Adjustment:</strong> {response.adjustment}
            </p>
          ) : null}
          {response.swap ? (
            <p>
              <strong>Swap:</strong> {response.swap}
            </p>
          ) : null}
        </div>
        <p className="result-disclaimer">{response.disclaimer}</p>
      </section>
    );
  }

  const content =
    response.kind === "clarify"
      ? {
          eyebrow: "Need one more detail",
          title: "Revora needs one more detail",
          body: response.question
        }
      : response.kind === "not_food"
        ? {
            eyebrow: "Food description needed",
            title: "Enter a food or meal",
            body: `Revora can help once you enter a food or meal, such as ${response.examples.join(", ")}.`
          }
        : response.kind === "out_of_scope"
          ? {
              eyebrow: "Current scope",
              title: "Outside Revora's current A1C range",
              body: response.reason
            }
          : {
              eyebrow: "Try again",
              title: "Try this check again",
              body: response.message
            };

  return (
    <section
      aria-live="polite"
      className="result-card"
      data-testid="result-card"
      data-kind={response.kind}
    >
      <p className="result-eyebrow">{content.eyebrow}</p>
      <p className="status-title">{content.title}</p>
      <p className="result-copy">{content.body}</p>
      <p className="result-disclaimer">{response.disclaimer}</p>
    </section>
  );
}
