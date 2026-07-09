import React from "react";
import { AbsoluteFill, Sequence, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "./config";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";

// Embed the brand font so headless Chromium doesn't fall back to Arial. Hold the render
// until the weights we use are actually loaded (else early frames render in the fallback).
const fontHandle = delayRender("plus-jakarta-sans");
Promise.all([
  document.fonts.load("500 44px 'Plus Jakarta Sans'"),
  document.fonts.load("700 76px 'Plus Jakarta Sans'"),
  document.fonts.load("800 128px 'Plus Jakarta Sans'"),
])
  .then(() => continueRender(fontHandle))
  .catch(() => continueRender(fontHandle));

export type TextOnScreenProps = {
  durationS: number;
  hookText: string;
  beats: string[];
  disclosureText: string | null;
  disclosureHoldS: number;
};

export const DEFAULT_PROPS: TextOnScreenProps = {
  durationS: 20,
  hookText: "It's not the oats",
  beats: ["A normal bowl of oatmeal.", "The toppings are the lever.", "Swap them, change the read."],
  disclosureText: null,
  disclosureHoldS: 0,
};

const SAFE_TOP = "16%"; // platform UI eats ~10% top / ~35% bottom — keep text in the safe band
const FONT = "'Plus Jakarta Sans', Arial, Helvetica, sans-serif";

/** Fade-up on entry; hook gets a subtle spring scale ("platform-native punch", still confident). */
const Card: React.FC<{ children: React.ReactNode; punch?: boolean }> = ({ children, punch }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 12 });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const y = interpolate(enter, [0, 1], [40, 0]);
  const scale = punch ? interpolate(enter, [0, 1], [0.92, 1]) : 1;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 90px",
        paddingTop: SAFE_TOP,
        opacity,
        transform: `translateY(${y}px) scale(${scale})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const TextOnScreen: React.FC<TextOnScreenProps> = ({ hookText, beats, disclosureText, disclosureHoldS }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const discFrames = disclosureText ? Math.round(disclosureHoldS * fps) : 0;
  const endFrames = Math.round(1.2 * fps);
  const hookFrames = Math.round(2.6 * fps);
  const beatsTotal = Math.max(0, durationInFrames - discFrames - endFrames - hookFrames);
  const beatFrames = beats.length ? Math.floor(beatsTotal / beats.length) : 0;
  const beatsStart = hookFrames;
  const discStart = beatsStart + beatFrames * beats.length;
  const endStart = discStart + discFrames;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.band, fontFamily: FONT }}>
      <Sequence from={0} durationInFrames={hookFrames}>
        <Card punch>
          <div style={{ color: COLORS.onBand, fontWeight: 800, fontSize: 128, lineHeight: 1.05, textAlign: "center" }}>
            {hookText}
          </div>
        </Card>
      </Sequence>

      {beats.map((b, i) => (
        <Sequence key={i} from={beatsStart + i * beatFrames} durationInFrames={beatFrames}>
          <Card>
            <div style={{ color: COLORS.onBand, fontWeight: 700, fontSize: 76, lineHeight: 1.15, textAlign: "center" }}>
              {b}
            </div>
          </Card>
        </Sequence>
      ))}

      {disclosureText && (
        // Disclosure frame: calm, held, light band, document style, left-aligned. No motion beyond a soft fade.
        <Sequence from={discStart} durationInFrames={discFrames}>
          <AbsoluteFill style={{ backgroundColor: COLORS.discBg, padding: "0 90px", paddingTop: SAFE_TOP, justifyContent: "center" }}>
            <div style={{ color: COLORS.textStrong, fontWeight: 700, fontSize: 34, letterSpacing: 2, textTransform: "uppercase", marginBottom: 24 }}>
              A quick note
            </div>
            <div style={{ color: COLORS.textBody, fontWeight: 500, fontSize: 44, lineHeight: 1.35, textAlign: "left" }}>
              {disclosureText}
            </div>
          </AbsoluteFill>
        </Sequence>
      )}

      <Sequence from={endStart} durationInFrames={endFrames}>
        <Card>
          <div style={{ color: COLORS.accent, fontWeight: 800, fontSize: 88, letterSpacing: 1 }}>Revora</div>
        </Card>
      </Sequence>
    </AbsoluteFill>
  );
};
