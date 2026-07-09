// video-engine/disclosure.ts
// The compliance-critical render layer. Pure, no LLM, no I/O (§4 rule 1: services act).
import type { VideoSpec } from "./schema";

/** 16 CFR 255 dual-mode floor: an on-screen disclosure must hold at least this long. */
export const MIN_HOLD_S = 2;
/** Cap: the caption carries the durable full text, so the on-screen beat need not hold for a
 *  full read. ponytail: calibration knob — gut-check the render; raise if it flashes too fast. */
export const MAX_HOLD_S = 4;

// ponytail: reading-speed calibration knob for the hold between the floor and the cap.
const WORDS_PER_SECOND = 2.5;

export type DisclosureLayer =
  | { required: false }
  | { required: true; onScreenText: string; holdSeconds: number; captionText: string };

/**
 * Dual-mode disclosure for an approved spec. If `claims_used ≠ ∅`, the `disclosure_block`
 * renders on-screen for ≥ MIN_HOLD_S AND ships in the caption. Fails closed: a spec that
 * cites a claim but carries no disclosure text is a compliance violation, not a silent skip.
 */
export function disclosureLayer(spec: Pick<VideoSpec, "claims_used" | "disclosure_block">): DisclosureLayer {
  if (spec.claims_used.length === 0) return { required: false };

  const text = spec.disclosure_block.trim();
  if (text.length === 0) {
    throw new Error(
      "compliance: claims_used is non-empty but disclosure_block is blank — refusing to render an uncovered claim",
    );
  }

  const words = text.split(/\s+/).filter(Boolean).length;
  const holdSeconds = Math.min(MAX_HOLD_S, Math.max(MIN_HOLD_S, Math.ceil(words / WORDS_PER_SECOND)));
  return { required: true, onScreenText: text, holdSeconds, captionText: text };
}
