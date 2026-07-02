import { describe, expect, it, vi } from "vitest";

import {
  isSpeechRecognitionSupported,
  startDictation
} from "../../../lib/client/speech";

class FakeRecognition {
  static instances: FakeRecognition[] = [];

  lang = "";
  interimResults = false;
  continuous = true;
  onresult: ((event: unknown) => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  start = vi.fn();
  stop = vi.fn();

  constructor() {
    FakeRecognition.instances.push(this);
  }
}

function fakeHost(overrides: Record<string, unknown> = {}) {
  FakeRecognition.instances = [];
  return {
    SpeechRecognition: FakeRecognition as unknown,
    navigator: { language: "en-US" },
    ...overrides
  } as never;
}

function resultEvent(transcripts: Array<{ text: string; isFinal: boolean }>) {
  return {
    results: transcripts.map(({ text, isFinal }) => ({
      0: { transcript: text },
      isFinal,
      length: 1
    }))
  };
}

describe("isSpeechRecognitionSupported", () => {
  it("detects the standard constructor", () => {
    expect(isSpeechRecognitionSupported(fakeHost())).toBe(true);
  });

  it("detects the webkit-prefixed constructor", () => {
    expect(
      isSpeechRecognitionSupported(
        fakeHost({ SpeechRecognition: undefined, webkitSpeechRecognition: FakeRecognition })
      )
    ).toBe(true);
  });

  it("returns false when neither exists (iOS Safari path)", () => {
    expect(
      isSpeechRecognitionSupported(
        fakeHost({ SpeechRecognition: undefined })
      )
    ).toBe(false);
  });
});

describe("startDictation", () => {
  it("returns null and calls nothing on unsupported hosts", () => {
    const onTranscript = vi.fn();
    const handle = startDictation(
      { onTranscript, onEnd: vi.fn(), onError: vi.fn() },
      fakeHost({ SpeechRecognition: undefined })
    );

    expect(handle).toBeNull();
    expect(onTranscript).not.toHaveBeenCalled();
  });

  it("configures a single-utterance recognizer with interim results and the navigator language", () => {
    startDictation(
      { onTranscript: vi.fn(), onEnd: vi.fn(), onError: vi.fn() },
      fakeHost()
    );

    const recognition = FakeRecognition.instances[0];
    expect(recognition.start).toHaveBeenCalledTimes(1);
    expect(recognition.lang).toBe("en-US");
    expect(recognition.interimResults).toBe(true);
    expect(recognition.continuous).toBe(false);
  });

  it("streams accumulated transcripts to onTranscript", () => {
    const onTranscript = vi.fn();
    startDictation(
      { onTranscript, onEnd: vi.fn(), onError: vi.fn() },
      fakeHost()
    );

    const recognition = FakeRecognition.instances[0];
    recognition.onresult?.(
      resultEvent([{ text: "grilled chicken", isFinal: false }])
    );
    recognition.onresult?.(
      resultEvent([{ text: "grilled chicken with rice", isFinal: true }])
    );

    expect(onTranscript).toHaveBeenNthCalledWith(1, "grilled chicken");
    expect(onTranscript).toHaveBeenNthCalledWith(2, "grilled chicken with rice");
  });

  it("joins multi-segment results into one transcript", () => {
    const onTranscript = vi.fn();
    startDictation(
      { onTranscript, onEnd: vi.fn(), onError: vi.fn() },
      fakeHost()
    );

    FakeRecognition.instances[0].onresult?.(
      resultEvent([
        { text: "oatmeal ", isFinal: true },
        { text: "with berries", isFinal: false }
      ])
    );

    expect(onTranscript).toHaveBeenCalledWith("oatmeal with berries");
  });

  it("fires onEnd when recognition ends and onError with the error code", () => {
    const onEnd = vi.fn();
    const onError = vi.fn();
    startDictation(
      { onTranscript: vi.fn(), onEnd, onError },
      fakeHost()
    );

    const recognition = FakeRecognition.instances[0];
    recognition.onerror?.({ error: "not-allowed" });
    recognition.onend?.();

    expect(onError).toHaveBeenCalledWith("not-allowed");
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it("stop() stops the recognizer", () => {
    const handle = startDictation(
      { onTranscript: vi.fn(), onEnd: vi.fn(), onError: vi.fn() },
      fakeHost()
    );

    handle?.stop();
    expect(FakeRecognition.instances[0].stop).toHaveBeenCalledTimes(1);
  });

  it("falls back to en-US when navigator.language is missing", () => {
    startDictation(
      { onTranscript: vi.fn(), onEnd: vi.fn(), onError: vi.fn() },
      fakeHost({ navigator: {} })
    );

    expect(FakeRecognition.instances[0].lang).toBe("en-US");
  });
});
