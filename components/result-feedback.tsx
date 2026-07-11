"use client";

import { useState } from "react";

import { track } from "../lib/client/analytics";
import type { RevoraRisk } from "../lib/client/ui-state";

/**
 * "Was this practical?" (W-30, pairing with W-10).
 *
 * The product's central quality risk — that the advice is generic and
 * repetitive (F-12) — is currently INVISIBLE in production, because no feedback
 * event exists. There is no way to know whether the coach lines help anyone,
 * which means there is also no way to know whether the variant bank shipped in
 * W-17 improved anything. A fix you cannot measure is a guess.
 *
 * Deliberately minimal: two taps, no free-text box. A free-text field on a
 * health surface is a PII funnel straight into the analytics vendor, and the
 * whole event allowlist exists to make that impossible by construction. The
 * only thing sent is a boolean and the risk class.
 */
export function ResultFeedback({ risk }: { risk: RevoraRisk }) {
  const [answered, setAnswered] = useState<boolean | null>(null);

  if (answered !== null) {
    return (
      <p className="feedback-thanks" data-testid="result-feedback-thanks">
        {answered
          ? "Good — that's the point."
          : "Noted. Revora will keep working on it."}
      </p>
    );
  }

  function answer(helpful: boolean) {
    setAnswered(helpful);
    track({ name: "result_helpful", props: { helpful, risk } });
  }

  return (
    <div className="result-feedback" data-testid="result-feedback">
      <p className="feedback-prompt" id="feedback-prompt">
        Was this practical?
      </p>
      <div className="feedback-buttons" role="group" aria-labelledby="feedback-prompt">
        <button
          className="feedback-button"
          data-testid="feedback-yes"
          onClick={() => answer(true)}
          type="button"
        >
          Yes
        </button>
        <button
          className="feedback-button"
          data-testid="feedback-no"
          onClick={() => answer(false)}
          type="button"
        >
          Not really
        </button>
      </div>
    </div>
  );
}
