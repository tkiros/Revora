"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { track } from "../lib/client/analytics";
import { submitCheck } from "../lib/client/check";
import { historyStore } from "../lib/client/history-store";
import { profileStore } from "../lib/client/profile-store";
import { tasterStore } from "../lib/client/taster-store";
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
import type { MealDraftItem } from "../lib/meal/photo-extract";
import { photoInputEnabled } from "../lib/photo-input-flag";
import type { PhotoDraftResult } from "../lib/client/photo-draft";
import { PhotoDraftReview } from "./photo-draft-review";
import { PhotoInputButton } from "./photo-input-button";
import { RequestStatus } from "./request-status";
import { ResultCard } from "./result-card";
import { VoiceInputButton } from "./voice-input-button";

type FieldErrors = Partial<Record<"food" | "a1c", string>>;

// Paywall mode mirrors GET /api/paywall + lib/server/pricing.paywallMode().
export type PaywallMode = "legacy" | "trial";
// tasterStore.status() return union (device-local Day-1 allowance state).
export type TasterStatus = "available" | "exhausted" | "expired";

// Pure decision helpers, colocated on the module so they can be unit-tested
// without a jsdom/component harness (this repo has none — Tasks 4.1/4.2).
//
// Gate: only trial mode walls, and only once the anonymous taster has spent or
// aged out their free checks. Legacy mode never gates (fail-open by shape).
export function shouldGateSubmit(mode: PaywallMode, status: TasterStatus): boolean {
  return mode === "trial" && status !== "available";
}

// Record: only trial mode meters, and only for anonymous tasters. The check
// form is session-agnostic, so "anonymous taster" is the only client signal —
// a live taster store, or a sessionless brand-new user with no store yet.
export function shouldRecordTaster(mode: PaywallMode, hasStoreOrAnon: boolean): boolean {
  return mode === "trial" && hasStoreOrAnon;
}

export function FoodCheckForm() {
  const [input, setInput] = useState<CheckFormInput>({ food: "", a1c: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [uiState, setUiState] = useState<CheckUiState>({ kind: "idle" });
  const [isHydrated, setIsHydrated] = useState(false);
  const [inputMethod, setInputMethod] = useState<"text" | "voice" | "photo">("text");
  const [photoDraft, setPhotoDraft] = useState<{
    dish: string | null;
    items: MealDraftItem[];
  } | null>(null);
  const [photoNotice, setPhotoNotice] = useState<string | null>(null);
  const [lastCheckId, setLastCheckId] = useState<string | null>(null);
  const [actionDone, setActionDone] = useState(false);
  const [mode, setMode] = useState<PaywallMode>("legacy");
  const foodInputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    // Day-1 taster: learn the paywall mode once on mount. Fail-open to the
    // "legacy" default on ANY failure (network, non-2xx, bad JSON) — a broken
    // paywall lookup must never wall a user, only ever fall back to legacy.
    let cancelled = false;
    fetch("/api/paywall")
      .then((res) => res.json())
      .then((data: { mode?: unknown }) => {
        if (!cancelled && (data?.mode === "trial" || data?.mode === "legacy")) {
          setMode(data.mode);
        }
      })
      .catch(() => {
        // fail-open: keep the "legacy" default set above.
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

    // Day-1 taster gate (trial mode only): an anonymous user who has spent or
    // aged out their free checks goes to the wall — no /api/check spend here.
    if (shouldGateSubmit(mode, tasterStore.status())) {
      window.location.assign("/subscribe");
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
      // One id shared by the on-device copy and the server row (4B) so the
      // sign-in migration dedupes instead of duplicating.
      const clientId = crypto.randomUUID();
      const response = await submitCheck(result.data, {
        clientId,
        inputMethod
      });

      // Meal memory (P3): persist successful verdicts on-device. Non-result
      // kinds (clarify/not_food/out_of_scope/retry) are moments, not meals.
      if (response.kind === "result") {
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
        track({
          name: "check_completed",
          props: { risk: response.risk, kind: response.kind, input_method: inputMethod }
        });

        // Day-1 taster meter (trial mode): count this check against the free
        // allowance BEFORE the result renders, so a reload can't double-spend.
        // Session-agnostic component → every submitter is an anonymous taster:
        // a live store (tasterStore.get() !== null) OR a sessionless brand-new
        // user with no store yet — both count (Task 5.4 clears the store
        // post-sign-in so entitled users skip this).
        const anonymousTaster = true;
        if (shouldRecordTaster(mode, anonymousTaster)) {
          const used = tasterStore.recordCheck();
          track({ name: "taster_check", props: { used } });
        }
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
    setPhotoNotice(null);

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
    // dictation/photo confirm keep counting as voice/photo — good enough for
    // the method signal.
    if (value.trim().length === 0) {
      setInputMethod("text");
    }
  }

  function handlePhotoDraft(result: PhotoDraftResult) {
    if (result.kind === "draft") {
      setPhotoDraft({ dish: result.dish, items: result.items });
      track({
        name: "photo_draft",
        props: {
          items: result.items.length,
          uncertain: result.items.filter((item) => item.uncertain).length
        }
      });
    } else if (result.kind === "upsell") {
      window.location.assign("/subscribe");
    } else {
      setPhotoNotice(result.message);
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
        {/* The three first-class input methods, visible BEFORE the user
            commits to typing: type, speak, or snap a photo. All three land in
            the same reviewed text path — voice and photo never bypass it. */}
        <div
          className="chip-row"
          role="group"
          aria-label="Three ways to add your meal"
          data-testid="input-method-row"
        >
          <button
            type="button"
            className="selectable-chip"
            aria-pressed={inputMethod === "text"}
            data-testid="type-input-button"
            onClick={() => foodInputRef.current?.focus()}
          >
            Type it
          </button>
          <VoiceInputButton
            onTranscript={handleVoiceTranscript}
            disabled={isSubmitting}
          />
          {photoInputEnabled() ? (
            <PhotoInputButton
              onDraft={handlePhotoDraft}
              onRequestOpen={() => {
                // Same taster gate as handleSubmit: a walled taster never spends
                // a draft call — the picker never opens.
                if (shouldGateSubmit(mode, tasterStore.status())) {
                  window.location.assign("/subscribe");
                  return false;
                }
                return true;
              }}
              disabled={isSubmitting}
            />
          ) : null}
        </div>
        <textarea
          id="food"
          name="food"
          rows={3}
          ref={foodInputRef}
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
        {photoNotice ? <p className="field-hint">{photoNotice}</p> : null}
        {photoDraft ? (
          <PhotoDraftReview
            dish={photoDraft.dish}
            items={photoDraft.items}
            onConfirm={(text) => {
              handleChange("food", text);
              setInputMethod("photo");
              setPhotoDraft(null);
            }}
            onDiscard={() => setPhotoDraft(null)}
          />
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
        <ResultCard
          response={uiState.response}
          actionDone={actionDone}
          onActionDone={
            lastCheckId
              ? () => {
                  historyStore.markActionDone(lastCheckId);
                  setActionDone(true);
                  // Signed-in: mirror the ack server-side (guests get 401 —
                  // fire-and-forget either way).
                  void fetch("/api/history/action", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ clientId: lastCheckId })
                  }).catch(() => undefined);
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
