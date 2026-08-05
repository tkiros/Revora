/**
 * The marketing surface's card: the product's own result card, rendered in the
 * live classes (DESIGN.md §11 — "the page's unit of composition is the
 * product's own artifact"). It is the same Meal / Signal / Why / Try anatomy
 * `components/result-card.tsx` renders on `/check`, minus the slots that only
 * make sense for a check that actually ran: no `aria-live` (nothing arrives),
 * no permission-first lead (nothing was computed), no feedback or save-to-
 * memory widgets (there is no `checkId`).
 *
 * Before this component the landing hand-built `.landing-verdict` articles —
 * tinted 24px boxes that borrowed the verdict colours without being the card.
 * That made the page's central claim ("marketing shows the product's card,
 * unmodified") false in the one place it is most load-bearing.
 *
 * ⛔ The three fixtures live HERE, not at the call sites. The hero card and
 * block 4's first card are byte-identical by construction — block 4's lede
 * says so in as many words ("The first card is the one from the top of this
 * page"), and two hand-typed copies would drift.
 *
 * ⛔ The SAFE fixture carries no adjustment and no swap. `postprocess.ts
 * assertNoUnsafeSafeFields` throws on a SAFE result that has either, so the
 * engine cannot produce one — the layout has to survive the empty slot, and
 * that survival is the argument the block exists to make.
 */
import type { RevoraRisk } from "../lib/client/ui-state";
import { RISK_LABELS } from "../lib/revora/labels";
import { demoExampleEyebrow } from "./demo-check-card";
import { DisclaimerLine } from "./disclaimer-line";
import {
  IconAlert,
  IconArrowRight,
  IconCheck,
  IconHeart,
  IconPause
} from "./icons";

// DESIGN.md §Icons: calm check / heads-up / pause. Same map result-card.tsx
// reads — three surfaces, one vocabulary.
const RISK_ICONS = {
  SAFE: IconCheck,
  MODERATE: IconAlert,
  HIGH: IconPause
} as const;

/**
 * Meal names are ledger copy (`landing-three-answers`); the reasons are the
 * approved `result-safe-example` / `result-moderate-example` /
 * `result-high-example` rows. Nothing here is invented card copy.
 */
export const EXAMPLE_RESULTS: Record<
  RevoraRisk,
  { meal: string; why: string; adjustment?: string; swap?: string }
> = {
  SAFE: {
    meal: "Grilled chicken, brown rice, and a side salad",
    why: "This looks like a reasonable fit. The meal already has protein and vegetables, so it looks more balanced than a fast-carb-heavy option."
  },
  MODERATE: {
    meal: "A bagel with jam and a glass of orange juice",
    why: "This may have a higher blood-sugar impact than a more balanced meal because it leans heavily on refined carbs.",
    adjustment:
      "If practical, add protein or nonstarchy vegetables to make it easier to handle."
  },
  HIGH: {
    meal: "A large soda with fries on the side",
    why: "This is likely a higher-impact choice in its current form because it is mostly sugary or refined carbs.",
    swap: "A smaller portion with protein or nonstarchy vegetables would be a steadier fit here."
  }
};

export function ExampleResultCard({
  risk,
  labelled = false,
  withFineprint = false
}: {
  risk: RevoraRisk;
  /**
   * AUD-008. ⛔ The label is COMPUTED, never typed: the day an authorised live
   * capture lands, `demoExampleEyebrow` returns "A real check, captured
   * <date>" and any hand-written "An illustrated example" silently becomes a
   * false claim. Block 4 leaves this off — its closing note labels all three
   * at once, and three copies of the same eyebrow is the fine-print pattern.
   */
  labelled?: boolean;
  /** The hero card carries the boundary line; block 4's note carries it once
   * for all three, so they render without it. */
  withFineprint?: boolean;
}) {
  const example = EXAMPLE_RESULTS[risk];
  const VerdictIcon = RISK_ICONS[risk];
  return (
    <section
      className="result-card result-anatomy"
      data-kind="result"
      data-risk={risk}
      data-testid="example-result-card"
    >
      {labelled ? (
        <header className="result-permission">
          <p className="result-eyebrow">{demoExampleEyebrow(null)}</p>
        </header>
      ) : null}
      <div className="anatomy-row">
        <span className="anatomy-label">Meal</span>
        <span className="anatomy-meal">{example.meal}</span>
      </div>
      {/* The ONLY tinted row (DESIGN.md §10): verdict colour is information,
          so it appears on the border and here, nowhere else. */}
      <div className="anatomy-row" data-risk={risk}>
        <span className="anatomy-label">Signal</span>
        <span className="anatomy-signal" data-risk={risk}>
          <VerdictIcon size={20} />
          {RISK_LABELS[risk]}
        </span>
      </div>
      <div className="anatomy-row">
        <span className="anatomy-label">Why</span>
        <p className="anatomy-copy">{example.why}</p>
      </div>
      {example.adjustment || example.swap ? (
        <div className="anatomy-row">
          <span className="anatomy-label">Try</span>
          <div className="result-list">
            {example.adjustment ? (
              <p className="result-row">
                <IconHeart size={16} />
                <span>
                  <strong>Adjustment:</strong> {example.adjustment}
                </span>
              </p>
            ) : null}
            {example.swap ? (
              <p className="result-row">
                <IconArrowRight size={16} />
                <span>
                  <strong>Swap:</strong> {example.swap}
                </span>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
      {withFineprint ? (
        <div className="result-fineprint">
          <DisclaimerLine />
        </div>
      ) : null}
    </section>
  );
}
