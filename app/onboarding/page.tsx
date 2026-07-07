"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { routeA1C } from "../../lib/revora/a1c";
import { track } from "../../lib/client/analytics";
import { profileStore } from "../../lib/client/profile-store";

const DISCLAIMER =
  "Revora is informational only and is not medical advice. Talk with a doctor or registered dietitian for guidance that is specific to you.";

// Approved boundary copy (docs/safety/copy-ledger.md; a1c-band-rubric.md) —
// out-of-range A1C values get guidance, never a verdict.
const BELOW_RANGE_MESSAGE =
  "Revora is designed for the prediabetes A1C range of 5.7% to 6.4%. This value sits below that range, so use a doctor or registered dietitian for guidance that is specific to you.";
const HIGH_RANGE_MESSAGE =
  "This A1C value falls in a range used for diabetes and is outside Revora's prediabetes-only MVP. For personalized next steps, talk with a doctor or registered dietitian.";

type Step = "welcome" | "segment" | "a1c" | "expectations" | "first_check" | "boundary";

// Segmentation prompt — one tap, stored NOWHERE (no server write, no analytics
// event). It exists only to make the tour feel like it's listening; each tap
// (or "Skip") just advances. Segmentation analytics is a post-launch YAGNI.
const SEGMENT_CHIPS = [
  "New A1C result",
  "Doctor's advice",
  "Family history",
  "Just checking"
] as const;

// The guided-first-check foods — three everyday items whose impact surprises
// almost everyone, so the very first check earns an "oh, huh" moment.
const FIRST_CHECK_CHIPS = ["oatmeal", "banana", "orange juice"] as const;

// Single-source rule (P3): the tour never re-asks what the device already knows.
// A guest who has an on-device A1C skips the A1C step entirely. Pure so the
// branch is unit-testable in node without a component harness.
export function nextStepAfterSegment(hasProfile: boolean): Step {
  return hasProfile ? "expectations" : "a1c";
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [a1cText, setA1cText] = useState("");
  const [a1cError, setA1cError] = useState<string | null>(null);
  const [boundaryMessage, setBoundaryMessage] = useState("");
  const [a1cValue, setA1cValue] = useState<number | null>(null);

  function advanceFromSegment() {
    setStep(nextStepAfterSegment(profileStore.get() !== null));
  }

  function skipTour() {
    // 5.1's escape hatch: ?stay=1 tells FirstRunGate not to bounce the user
    // straight back into the tour, so "skip" never loops.
    router.push("/check?stay=1");
  }

  function handleA1cContinue() {
    const value = Number.parseFloat(a1cText);

    if (!Number.isFinite(value) || value < 0 || value > 20) {
      setA1cError("Enter your latest A1C with one decimal, like 6.1.");
      return;
    }

    setA1cError(null);
    const route = routeA1C(value);

    if (route.kind === "out_of_scope") {
      setBoundaryMessage(
        route.band === "below_prediabetes_range"
          ? BELOW_RANGE_MESSAGE
          : HIGH_RANGE_MESSAGE
      );
      setStep("boundary");
      return;
    }

    setA1cValue(value);
    setStep("expectations");
  }

  function startGuidedCheck(food: string) {
    // Hand the chosen food to the home form via the same prefill path a
    // one-tap re-check uses (food-check-form.tsx reads + clears revora.recheck).
    try {
      window.sessionStorage.setItem("revora.recheck", food);
    } catch {
      // storage unavailable — land on the form without a prefill
    }
    if (a1cValue !== null) {
      profileStore.set({ a1c: a1cValue, onboardedAt: new Date().toISOString() });
    }
    track({ name: "onboarding_completed" });
    router.push("/check");
  }

  return (
    <main className="page-shell">
      <div className="page-frame">
        <section
          className="surface-card hero-card"
          data-testid="onboarding-step"
          data-step={step}
        >
          {step === "welcome" ? (
            <>
              <p className="hero-eyebrow">Welcome to Revora</p>
              <h1 className="page-title">
                Should I eat this, now? Get a calm answer.
              </h1>
              <p className="page-copy">
                At the moment of a meal, Revora gives you one clear answer —
                Clear, Be careful, or Hold off — with one reason, one
                adjustment, and one safer swap. Never a calorie, never a
                number to track.
              </p>
              <button
                type="button"
                className="primary-button"
                onClick={() => setStep("segment")}
              >
                Get started
              </button>
            </>
          ) : null}

          {step === "segment" ? (
            <>
              <p className="hero-eyebrow">One quick question</p>
              <h1 className="page-title">What brought you here?</h1>
              <div className="chip-row" role="group" aria-label="What brought you here?">
                {SEGMENT_CHIPS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="selectable-chip"
                    onClick={advanceFromSegment}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="inline-link onboarding-skip"
                onClick={advanceFromSegment}
              >
                Skip
              </button>
            </>
          ) : null}

          {step === "a1c" ? (
            <>
              <p className="hero-eyebrow">Your A1C</p>
              <h1 className="page-title">Your latest A1C</h1>
              <p className="page-copy">
                Revora is built only for the prediabetes range — an A1C of
                5.7% to 6.4%. Your number tunes how careful the answers are.
              </p>
              <div className="field-stack">
                <label htmlFor="onboarding-a1c" className="field-label">
                  Latest A1C
                </label>
                <input
                  id="onboarding-a1c"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={a1cText}
                  onChange={(event) => {
                    setA1cText(event.target.value);
                    setA1cError(null);
                  }}
                  placeholder="6.1"
                  aria-describedby={
                    a1cError ? "onboarding-a1c-error" : "onboarding-a1c-help"
                  }
                  aria-invalid={a1cError ? true : undefined}
                  className="text-input"
                />
                <p id="onboarding-a1c-help" className="field-hint">
                  Enter one decimal place, like 6.1. It stays on this device
                  unless you create an account.
                </p>
                {a1cError ? (
                  <p id="onboarding-a1c-error" className="field-error">
                    {a1cError}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                className="primary-button"
                onClick={handleA1cContinue}
              >
                Continue
              </button>
            </>
          ) : null}

          {step === "boundary" ? (
            <>
              <p className="hero-eyebrow">A quick heads-up</p>
              <h1 className="page-title">Revora isn&apos;t built for this range</h1>
              <p className="page-copy" data-testid="boundary-message">
                {boundaryMessage}
              </p>
              <p className="result-disclaimer">{DISCLAIMER}</p>
              <Link className="primary-button link-button" href="/">
                Back to the home page
              </Link>
            </>
          ) : null}

          {step === "expectations" ? (
            <>
              <p className="hero-eyebrow">How Revora works</p>
              <h1 className="page-title">What to expect</h1>
              <ul className="page-copy expectation-list">
                <li>
                  When we&apos;re unsure, we say so — you&apos;ll see it in the
                  result.
                </li>
                <li>
                  Guidance is qualitative — plain words, not glucose numbers
                  or calorie math.
                </li>
                {/* `general-guidance-01` ledger row — same line as the result
                    card renders. */}
                <li>
                  Revora&apos;s guidance is general for your A1C range — your
                  own response to a food can differ. Only you (and your care
                  team) know your body.
                </li>
                <li>
                  When Revora isn&apos;t sure, it says so and errs on the careful
                  side.
                </li>
                <li>It is information to decide with, not medical advice.</li>
              </ul>
              <p className="result-disclaimer">{DISCLAIMER}</p>
              <button
                type="button"
                className="primary-button"
                onClick={() => setStep("first_check")}
              >
                Continue
              </button>
            </>
          ) : null}

          {step === "first_check" ? (
            <>
              <p className="hero-eyebrow">Your first check</p>
              <h1 className="page-title">Try one of the classics</h1>
              <p className="page-copy">
                These three surprise almost everyone. Tap one — the check runs
                right on the home screen.
              </p>
              <div
                className="chip-row"
                role="group"
                aria-label="Try one of the classics"
              >
                {FIRST_CHECK_CHIPS.map((food) => (
                  <button
                    key={food}
                    type="button"
                    className="selectable-chip"
                    data-testid={`first-check-${food.replace(/\s+/g, "-")}`}
                    onClick={() => startGuidedCheck(food)}
                  >
                    {food}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {step !== "boundary" ? (
            <button
              type="button"
              className="inline-link onboarding-skip-tour"
              onClick={skipTour}
            >
              Skip the tour
            </button>
          ) : null}
        </section>

        <footer className="page-footer">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </footer>
      </div>
    </main>
  );
}
