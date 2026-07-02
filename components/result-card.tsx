import Link from "next/link";

import type { RevoraUserResponse } from "../lib/client/ui-state";

// §6.1 verdict mapping: the card speaks calm decisions, the engine speaks
// risk classes. data-risk keeps the raw class for tests and styling.
const RISK_LABELS = {
  SAFE: "Clear",
  MODERATE: "Be careful",
  HIGH: "Hold off"
} as const;

function DisclaimerLine({ disclaimer }: { disclaimer: string }) {
  return (
    <p className="result-disclaimer">
      {disclaimer}{" "}
      <Link className="result-disclaimer-link" href="/privacy">
        Privacy
      </Link>
    </p>
  );
}

export function ResultCard({
  response,
  actionDone,
  onActionDone
}: {
  response: RevoraUserResponse;
  actionDone?: boolean;
  onActionDone?: () => void;
}) {
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
        <p className="result-title">{RISK_LABELS[response.risk]}</p>
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
          {response.sequencingTip ? (
            <p data-testid="sequencing-tip">
              <strong>Eat it in this order:</strong> {response.sequencingTip}
            </p>
          ) : null}
          {response.postMealAction ? (
            <div data-testid="post-meal-action">
              <p>
                <strong>After this meal:</strong> {response.postMealAction}
              </p>
              {onActionDone ? (
                actionDone ? (
                  <p className="action-done-note" data-testid="action-done-note">
                    Nice — logged for your week.
                  </p>
                ) : (
                  <button
                    type="button"
                    className="action-done-button"
                    data-testid="action-done-button"
                    onClick={onActionDone}
                  >
                    I did it
                  </button>
                )
              ) : null}
            </div>
          ) : null}
        </div>
        <DisclaimerLine disclaimer={response.disclaimer} />
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
      <DisclaimerLine disclaimer={response.disclaimer} />
    </section>
  );
}
