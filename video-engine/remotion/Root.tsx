import React from "react";
import { Composition } from "remotion";
import { FPS, WIDTH, HEIGHT } from "./config";
import { TextOnScreen, DEFAULT_PROPS, type TextOnScreenProps } from "./TextOnScreen";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="text-on-screen"
    component={TextOnScreen}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    durationInFrames={Math.round(DEFAULT_PROPS.durationS * FPS)}
    defaultProps={DEFAULT_PROPS}
    // duration is a function of the approved spec — derive it from props at render time.
    calculateMetadata={({ props }: { props: TextOnScreenProps }) => ({
      durationInFrames: Math.round(props.durationS * FPS),
    })}
  />
);
