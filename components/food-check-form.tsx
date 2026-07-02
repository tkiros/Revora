"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { submitCheck } from "../lib/client/check";
import { historyStore } from "../lib/client/history-store";
import { profileStore } from "../lib/client/profile-store";
import { routeA1C } from "../lib/revora/a1c";
import {
  type CheckUiState,
  isSlowThresholdReached,
  mapCheckFailure
} from "../lib/client/ui-state";
import {
  type CheckFormInput,
  validateCheckForm
} from "../lib/client/validation";
import { RequestStatus } from "./request-status";
import { ResultCard } from "./result-card";
import { VoiceInputButton } from "./voice-input-button";

type FieldErrors = Partial<Record<"food" | "a1c", string>>;

export function FoodCheckForm() {
  const [input, setInput] = useState<CheckFormInput>({ food: "", a1c: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [uiState, setUiState] = useState<CheckUiState>({ kind: "idle" });
  const [isHydrated, setIsHydrated] = useState(false);
  const [inputMethod, setInputMethod] = useState<"text" | "voice">("text");
  const [lastCheckId, setLastCheckId] = useState<string | null>(null);
  const [actionDone, setActionDone] = useState(false);

  useEffect(() => {
    setIsHydrated(true);

    // Daily-loop conveniences (P3): remember the onboarding A1C, and honor a
    // one-tap re-check handoff from the history page. Storage reads stay
    // outside the setState updater — updaters must be pure (StrictMode
    // double-invokes them).
    const profile = profileStore.get();
    let recheck: string | null = null;
    try {
      recheck = window.sessionStorage.getItem("revora.recheck");
      if (recheck) {
        window.sessionStorage.removeItem("revora.recheck");
      }
    } catch {
      // best-effort prefill only
    }

    setInput((current) => ({
      food: current.food === "" && recheck ? recheck : current.food,
      a1c:
        current.a1c === "" && profile ? profile.a1c.toFixed(1) : current.a1c
    }));
  }, []);

  const isSubmitting =
    uiState.kind === "submitting" || uiState.kind === "slow";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const result = validateCheckForm(input);

    if (!result.ok) {
      setErrors(
        result.issues.reduce<FieldErrors>((nextErrors, issue) => {
          nextErrors[issue.field] = issue.message;
          return nextErrors;
        }, {})
      );
      setUiState({
        kind: "invalid",
        message: "Fix the highlighted fields before submitting."
      });
      return;
    }

    setErrors({});

    // Offline? Short-circuit to the network copy instead of a hanging fetch.
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setUiState({ kind: "error", message: mapCheckFailure({ code: "network" }) });
      return;
    }

    setUiState({ kind: "submitting" });

    const startedAt = Date.now();
    const slowTimer = window.setTimeout(() => {
      setUiState((currentState) => {
        if (
          currentState.kind !== "submitting" ||
          !isSlowThresholdReached(startedAt)
        ) {
          return currentState;
        }

        return { kind: "slow" };
      });
    }, 5_000);

    try {
      const response = await submitCheck(result.data);

      // Meal memory (P3): persist successful verdicts on-device. Non-result
      // kinds (clarify/not_food/out_of_scope/retry) are moments, not meals.
      if (response.kind === "result") {
        const clientId = crypto.randomUUID();
        historyStore.add({
          clientId,
          food: result.data.food,
          risk: response.risk,
          a1cBand: routeA1C(result.data.a1c).band,
          inputMethod,
          createdAt: new Date().toISOString()
        });
        setLastCheckId(clientId);
        setActionDone(false);
      }

      setUiState({ kind: "done", response });
    } catch (error) {
      setUiState({ kind: "error", message: mapCheckFailure(error) });
    } finally {
      window.clearTimeout(slowTimer);
    }
  }

  function handleChange(field: keyof CheckFormInput, value: string) {
    setInput((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));

    if (uiState.kind === "invalid" || uiState.kind === "error") {
      setUiState({ kind: "idle" });
    }
  }

  function handleVoiceTranscript(transcript: string) {
    // The transcript lands in the same textarea; the user reviews, edits, and
    // submits their own words — the identical text path and engine (§6.2).
    handleChange("food", transcript);
    setInputMethod("voice");
  }

  function handleTypedFoodChange(value: string) {
    handleChange("food", value);
    // ponytail: an emptied field restarts as typed input; small edits after a
    // dictation keep counting as voice — good enough for the method signal.
    if (value.trim().length === 0) {
      setInputMethod("text");
    }
  }

  if (!isHydrated) {
    return (
      <section aria-live="polite" className="placeholder-card">
        <p className="placeholder-title">Preparing form</p>
        <p className="placeholder-copy">
          Revora is getting the mobile check ready on this page.
        </p>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="form-grid"
      data-input-method={inputMethod}
      noValidate
    >
      <div className="field-stack">
        <label htmlFor="food" className="field-label">
          What are you thinking about eating?
        </label>
        <textarea
          id="food"
          name="food"
          rows={3}
          value={input.food}
          onChange={(event) => {
            handleTypedFoodChange(event.target.value);
          }}
          enterKeyHint="go"
          placeholder="Example: grilled chicken with rice and salad"
          aria-describedby={errors.food ? "food-error" : undefined}
          aria-invalid={errors.food ? true : undefined}
          className="text-input"
        />
        {errors.food ? (
          <p id="food-error" className="field-error">
            {errors.food}
          </p>
        ) : null}
        <VoiceInputButton
          onTranscript={handleVoiceTranscript}
          disabled={isSubmitting}
        />
      </div>

      <div className="field-stack">
        <label htmlFor="a1c" className="field-label">
          Latest A1C
        </label>
        <input
          id="a1c"
          name="a1c"
          type="number"
          inputMode="decimal"
          step="0.1"
          value={input.a1c}
          onChange={(event) => {
            handleChange("a1c", event.target.value);
          }}
          enterKeyHint="go"
          placeholder="6.1"
          aria-describedby={errors.a1c ? "a1c-error" : "a1c-help"}
          aria-invalid={errors.a1c ? true : undefined}
          className="text-input"
        />
        <p id="a1c-help" className="field-hint">
          Enter one decimal place, like 6.1.
        </p>
        {errors.a1c ? (
          <p id="a1c-error" className="field-error">
            {errors.a1c}
          </p>
        ) : null}
      </div>

      <button type="submit" disabled={isSubmitting} className="primary-button">
        {isSubmitting ? "Checking..." : "Should I eat this?"}
      </button>

      {uiState.kind === "submitting" ||
      uiState.kind === "slow" ||
      uiState.kind === "error" ? (
        <RequestStatus state={uiState} />
      ) : uiState.kind === "done" ? (
        <ResultCard
          response={uiState.response}
          actionDone={actionDone}
          onActionDone={
            lastCheckId
              ? () => {
                  historyStore.markActionDone(lastCheckId);
                  setActionDone(true);
                }
              : undefined
          }
        />
      ) : (
        <section aria-live="polite" className="placeholder-card">
          <p className="placeholder-title">Response area</p>
          <p className="placeholder-copy">
            {uiState.kind === "invalid"
              ? uiState.message
              : "Your food check result will appear here on this page after you submit."}
          </p>
        </section>
      )}
    </form>
  );
}
