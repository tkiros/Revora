import Link from "next/link";

import type { RevoraRisk, RevoraUserResponse } from "../lib/client/ui-state";
import { DisclaimerLine } from "./disclaimer-line";
import {
  IconAlert,
  IconArrowRight,
  IconCheck,
  IconHeart,
  IconLeaf,
  IconPause
} from "./icons";

// Verdict glyphs (DESIGN.md §Icons): calm check / heads-up / pause.
const RISK_ICONS = {
  SAFE: IconCheck,
  MODERATE: IconAlert,
  HIGH: IconPause
} as const;

// §6.3 post-verdict pantry entry. The one-time Pantry Review line attaches ONLY
// to non-SAFE results ("Be careful" / "Hold off") — SAFE never piles on, and no
// non-result kind (upsell/clarify/not_food/out_of_scope/retry) carries it. This
// pure predicate is the single gate the result branch reads.
export function showPantryEntry(
  kind: RevoraUserResponse["kind"],
  risk?: RevoraRisk
): boolean {
  return kind === "result" && risk !== "SAFE";
}

// §6.1 verdict mapping: the card speaks calm decisions, the engine speaks
// risk classes. data-risk keeps the raw class for tests and styling.
const RISK_LABELS = {
  SAFE: "Clear",
  MODERATE: "Be careful",
  HIGH: "Hold off"
} as const;

// §4D upsell variants. The branch renders the server `message` verbatim in
// both cases and only picks its own eyebrow/CTA/data-wall. The server now
// sends a structured `upsellKind`; the message sniff survives only as the
// fallback for older/cached responses that omit it.
// The legacy title's "five" mirrors FREE_DAILY_CHECKS (lib/server/entitlement)
// — result-card-upsell.test.ts pins the two together.
export function upsellVariant(
  message: string,
  upsellKind?: "trial" | "legacy"
): {
  wall: "trial" | null;
  eyebrow: string;
  title: string | null;
  cta: string;
} {
  const kind =
    upsellKind ?? (message.includes("free week") ? "trial" : "legacy");
  if (kind === "trial") {
    return {
      wall: "trial",
      eyebrow: "Where the free taste ends",
      title: null,
      cta: "Start your free week"
    };
  }
  return {
    wall: null,
    eyebrow: "Daily limit reached",
    title: "That's five for today",
    cta: "See what Premium includes"
  };
}

// The one-time Pantry Review cross-sell. Rendered by the caller AFTER the
// verdict card (its own quiet slot), gated by showPantryEntry — the offer
// never sits inside the verdict itself.
export function PantryEntry() {
  return (
    <p className="cross-sell" data-testid="pantry-entry">
      Want your whole kitchen checked once? See{" "}
      <Link className="inline-link" href="/pantry">
        the Pantry Review
      </Link>{" "}
      — one payment, nothing renews.
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
    const VerdictIcon = RISK_ICONS[response.risk];
    return (
      <section
        aria-live="polite"
        className="result-card"
        data-testid="result-card"
        data-kind={response.kind}
        data-risk={response.risk}
      >
        <p className="result-eyebrow">Revora result</p>
        <p className="result-title verdict-title" data-risk={response.risk}>
          <VerdictIcon size={26} />
          {RISK_LABELS[response.risk]}
        </p>
        <p className="result-copy">{response.reason}</p>
        <div className="result-list">
          {response.keepMost ? (
            <p className="result-row" data-testid="keep-most">
              <IconHeart size={16} />
              <span>
                <strong>Enjoy it anyway:</strong> {response.keepMost}
              </span>
            </p>
          ) : null}
          {response.swap ? (
            <p className="result-row">
              <IconArrowRight size={16} />
              <span>
                <strong>Swap:</strong> {response.swap}
              </span>
            </p>
          ) : null}
          {response.adjustment ? (
            <p className="result-row">
              <IconLeaf size={16} />
              <span>
                <strong>Adjustment:</strong> {response.adjustment}
              </span>
            </p>
          ) : null}
          {response.sequencingTip ? (
            <p className="result-row" data-testid="sequencing-tip">
              <IconArrowRight size={16} />
              <span>
                <strong>Eat it in this order:</strong> {response.sequencingTip}
              </span>
            </p>
          ) : null}
          {response.postMealAction ? (
            <div data-testid="post-meal-action">
              <p className="result-row">
                <IconCheck size={16} />
                <span>
                  <strong>After this meal:</strong> {response.postMealAction}
                </span>
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
        <div className="result-fineprint">
          {/* `general-guidance-01` ledger row (docs/safety/copy-ledger.md): the
              T1 honesty line — verdicts are band-general, never a prediction of
              this user's own response. */}
          <p className="result-disclaimer" data-testid="general-guidance">
            Revora&apos;s guidance is general for your A1C range — your own
            response to a food can differ. Only you (and your care team) know
            your body.
          </p>
          <DisclaimerLine disclaimer={response.disclaimer} />
        </div>
      </section>
    );
  }

  if (response.kind === "upsell") {
    const variant = upsellVariant(response.message, response.upsellKind);
    return (
      <section
        aria-live="polite"
        className="result-card"
        data-testid="result-card"
        data-kind="upsell"
        data-wall={variant.wall ?? undefined}
      >
        <p className="result-eyebrow">{variant.eyebrow}</p>
        {variant.title ? (
          <p className="status-title">{variant.title}</p>
        ) : null}
        <p className="result-copy">{response.message}</p>
        <Link className="primary-button link-button" href="/subscribe">
          {variant.cta}
        </Link>
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
