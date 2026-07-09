// Shared render constants — imported by both the Remotion bundle (Root) and the
// node-side template mapper, so fps/size never drift between them.
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920; // 9:16

// DESIGN.md tokens only (zero additions). Risk colors (green/red) never appear in video.
export const COLORS = {
  band: "#0c332e", // --landing-band, hook/beat background
  onBand: "#f8fafc", // --accent-contrast, text on the dark band
  accent: "#0d5f57", // --accent, the ONE brand color (single highlight per card)
  discBg: "#f8fafc", // disclosure frame: light band
  textStrong: "#0f172a", // --text-strong, disclosure title/eyebrow
  textBody: "#1e293b", // --text-body, disclosure body (NEVER --text-soft for health text)
} as const;
