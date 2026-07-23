"use client";

import { useEffect, useRef, useState } from "react";

import {
  type DictationHandle,
  isSpeechRecognitionSupported,
  startDictation
} from "../lib/client/speech";
import { useHydrated } from "../lib/client/use-hydrated";
import { IconMic } from "./icons";

type VoiceInputButtonProps = {
  onTranscript(transcript: string): void;
  disabled?: boolean;
};

/**
 * "Say your meal." — a mic toggle for the food field. Rendered only when the
 * browser supports the Web Speech API; unsupported browsers (iOS Safari) get
 * hint copy pointing at the keyboard's own dictation, which uses the same
 * text path with zero extra build.
 */
export function VoiceInputButton({
  onTranscript,
  disabled
}: VoiceInputButtonProps) {
  const hydrated = useHydrated();
  const supported = hydrated ? isSpeechRecognitionSupported() : null;
  const [listening, setListening] = useState(false);
  const [failed, setFailed] = useState(false);
  const handleRef = useRef<DictationHandle | null>(null);

  useEffect(() => {
    return () => {
      handleRef.current?.stop();
    };
  }, []);

  if (supported === null) {
    return null;
  }

  if (!supported) {
    return (
      <p className="field-hint" data-testid="voice-dictation-hint">
        You can also use your keyboard&apos;s mic to dictate.
      </p>
    );
  }

  function stopListening() {
    handleRef.current?.stop();
    handleRef.current = null;
    setListening(false);
  }

  function toggle() {
    if (listening) {
      stopListening();
      return;
    }

    setFailed(false);
    const handle = startDictation({
      onTranscript,
      onEnd: () => {
        handleRef.current = null;
        setListening(false);
      },
      onError: () => {
        handleRef.current = null;
        setListening(false);
        setFailed(true);
      }
    });

    if (handle) {
      handleRef.current = handle;
      setListening(true);
    } else {
      setFailed(true);
    }
  }

  return (
    <div className="voice-input">
      <button
        type="button"
        className="voice-input-button method-chip"
        data-testid="voice-input-button"
        data-listening={listening || undefined}
        aria-pressed={listening}
        disabled={disabled}
        onClick={toggle}
      >
        <IconMic size={20} />
        {listening ? "Stop listening" : "Say your meal"}
      </button>
      <span
        aria-live="polite"
        className="voice-input-status"
        data-testid="voice-input-status"
      >
        {listening
          ? "Listening. Speak your meal, then review the text before you submit."
          : failed
            ? "Voice input didn't start. You can type your meal or use your keyboard's mic."
            : ""}
      </span>
    </div>
  );
}
