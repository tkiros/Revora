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
  /** Focuses the food field so the OS keyboard (and its mic key) comes up. */
  onDictateFallback?(): void;
};

/**
 * "Say your meal." — a mic toggle for the food field. Where the Web Speech
 * API is missing (iOS Safari — the most common device for the 55–65 audience,
 * forensic 2026-07-27 J6) the button still renders: tapping it focuses the
 * food field so the keyboard and its own mic key come up, and the live region
 * says to use that. Same text path, audio still never reaches Revora servers.
 */
export function VoiceInputButton({
  onTranscript,
  disabled,
  onDictateFallback
}: VoiceInputButtonProps) {
  const hydrated = useHydrated();
  const supported = hydrated ? isSpeechRecognitionSupported() : null;
  const [listening, setListening] = useState(false);
  const [failed, setFailed] = useState(false);
  const [fallbackPrompted, setFallbackPrompted] = useState(false);
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
      <div className="voice-input">
        <button
          type="button"
          className="voice-input-button method-chip"
          data-testid="voice-dictation-fallback-button"
          disabled={disabled}
          onClick={() => {
            setFallbackPrompted(true);
            onDictateFallback?.();
          }}
        >
          <IconMic size={20} />
          Say your meal
        </button>
        <span
          aria-live="polite"
          className="voice-input-status"
          data-testid="voice-input-status"
        >
          {fallbackPrompted
            ? "Tap the mic on your keyboard to dictate, then review the text before you submit."
            : ""}
        </span>
      </div>
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
