"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { submitCheck } from "../lib/client/check";
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

type FieldErrors = Partial<Record<"food" | "a1c", string>>;

export function FoodCheckForm() {
  const [input, setInput] = useState<CheckFormInput>({ food: "", a1c: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [uiState, setUiState] = useState<CheckUiState>({ kind: "idle" });

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

  return (
    <form onSubmit={handleSubmit} className="form-grid" noValidate>
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
            handleChange("food", event.target.value);
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
        <ResultCard response={uiState.response} />
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
