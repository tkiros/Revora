// video-engine/template.ts
// The one format-specific seam: map an approved VideoSpec → a composition id + props.
// v1 ships a single `text-on-screen` template; a new format adds a branch here, not a new pipeline.
import type { VideoSpec } from "./schema";
import { disclosureLayer } from "./disclosure";
import { FPS } from "./remotion/config";
import type { TextOnScreenProps } from "./remotion/TextOnScreen";

export type Template = { compositionId: string; fps: number; inputProps: TextOnScreenProps };

export function templateFor(spec: VideoSpec): Template {
  const d = disclosureLayer(spec); // compliance-critical; throws if a claim is uncovered
  return {
    compositionId: "text-on-screen",
    fps: FPS,
    inputProps: {
      durationS: spec.duration_s,
      hookText: spec.visual_hook,
      // Prefer short on-screen copy; `beats` holds production/shot directions, not screen text.
      beats: spec.visual_beats && spec.visual_beats.length ? spec.visual_beats : spec.beats,
      disclosureText: d.required ? d.onScreenText : null,
      disclosureHoldS: d.required ? d.holdSeconds : 0,
    },
  };
}
