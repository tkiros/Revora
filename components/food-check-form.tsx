"use client";

import type { CSSProperties, FormEvent } from "react";
import { useMemo, useState } from "react";

import { submitCheck } from "../lib/client/check";
import {
  type CheckFormInput,
  validateCheckForm
} from "../lib/client/validation";

type FieldErrors = Partial<Record<"food" | "a1c", string>>;

const fieldStyle = {
  width: "100%",
  minHeight: "48px",
  border: "1px solid #cbd5e1",
  borderRadius: "16px",
  padding: "14px 16px",
  fontSize: "16px",
  lineHeight: 1.5,
  backgroundColor: "#ffffff",
  color: "#0f172a"
} satisfies CSSProperties;

export function FoodCheckForm() {
  const [input, setInput] = useState<CheckFormInput>({ food: "", a1c: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const futureResponseMessage = useMemo(
    () =>
      statusMessage ??
      "Your food check result will appear here on this page after you submit.",
    [statusMessage]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = validateCheckForm(input);

    if (!result.ok) {
      setErrors(
        result.issues.reduce<FieldErrors>((nextErrors, issue) => {
          nextErrors[issue.field] = issue.message;
          return nextErrors;
        }, {})
      );
      setStatusMessage("Fix the highlighted fields before submitting.");
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setStatusMessage("Sending your food check...");

    try {
      await submitCheck(result.data);
      setStatusMessage(
        "Thanks — your request reached Revora. Detailed result states ship in the next plan."
      );
    } catch {
      setStatusMessage(
        "We could not send your check just yet. Please try again in a moment."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "grid", gap: "14px" }}
      noValidate
    >
      <div style={{ display: "grid", gap: "8px" }}>
        <label htmlFor="food" style={{ fontWeight: 600, color: "#0f172a" }}>
          What are you thinking about eating?
        </label>
        <textarea
          id="food"
          name="food"
          rows={3}
          value={input.food}
          onChange={(event) => {
            setInput((current) => ({ ...current, food: event.target.value }));
          }}
          enterKeyHint="go"
          placeholder="Example: grilled chicken with rice and salad"
          aria-describedby={errors.food ? "food-error" : undefined}
          aria-invalid={errors.food ? true : undefined}
          style={{ ...fieldStyle, resize: "vertical" }}
        />
        {errors.food ? (
          <p id="food-error" style={{ margin: 0, color: "#b91c1c", fontSize: "14px" }}>
            {errors.food}
          </p>
        ) : null}
      </div>

      <div style={{ display: "grid", gap: "8px" }}>
        <label htmlFor="a1c" style={{ fontWeight: 600, color: "#0f172a" }}>
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
            setInput((current) => ({ ...current, a1c: event.target.value }));
          }}
          enterKeyHint="go"
          placeholder="6.1"
          aria-describedby={errors.a1c ? "a1c-error" : "a1c-help"}
          aria-invalid={errors.a1c ? true : undefined}
          style={fieldStyle}
        />
        <p id="a1c-help" style={{ margin: 0, color: "#475569", fontSize: "14px" }}>
          Enter one decimal place, like 6.1.
        </p>
        {errors.a1c ? (
          <p id="a1c-error" style={{ margin: 0, color: "#b91c1c", fontSize: "14px" }}>
            {errors.a1c}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          minHeight: "52px",
          border: "none",
          borderRadius: "999px",
          padding: "14px 18px",
          fontSize: "16px",
          fontWeight: 700,
          backgroundColor: isSubmitting ? "#94a3b8" : "#0f172a",
          color: "#f8fafc",
          cursor: isSubmitting ? "progress" : "pointer"
        }}
      >
        Should I eat this?
      </button>

      <section
        aria-live="polite"
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: "20px",
          padding: "16px",
          backgroundColor: "#f8fafc",
          color: "#334155"
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>Response area</p>
        <p style={{ margin: "8px 0 0" }}>{futureResponseMessage}</p>
      </section>
    </form>
  );
}
