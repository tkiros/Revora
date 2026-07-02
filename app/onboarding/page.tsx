"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { routeA1C } from "../../lib/revora/a1c";
import { profileStore } from "../../lib/client/profile-store";

const DISCLAIMER =
  "Revora is informational only and is not medical advice. Talk with a doctor or registered dietitian for guidance that is specific to you.";

// Approved boundary copy (docs/safety/copy-ledger.md; a1c-band-rubric.md) —
// out-of-range A1C values get guidance, never a verdict.
const BELOW_RANGE_MESSAGE =
  "Revora is designed for the prediabetes A1C range of 5.7% to 6.4%. This value sits below that range, so use a doctor or registered dietitian for guidance that is specific to you.";
const HIGH_RANGE_MESSAGE =
  "This A1C value falls in a range used for diabetes and is outside Revora's prediabetes-only MVP. For personalized next steps, talk with a doctor or registered dietitian.";

type Step = "welcome" | "a1c" | "expectations" | "daily_loop" | "boundary";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [a1cText, setA1cText] = useState("");
  const [a1cError, setA1cError] = useState<string | null>(null);
  const [boundaryMessage, setBoundaryMessage] = useState("");
  const [a1cValue, setA1cValue] = useState<number | null>(null);

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

  function finish() {
    if (a1cValue !== null) {
      profileStore.set({ a1c: a1cValue, onboardedAt: new Date().toISOString() });
    }
    router.push("/");
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
                Reversal is achieved through your dietary choices — Revora
                gives you the clarity to make them.
              </p>
              <p className="page-copy">
                At the moment of a meal, Revora gives you one clear answer —
                Clear, Be careful, or Hold off — with one reason, one
                adjustment, and one safer swap. Never a calorie, never a
                number to track.
              </p>
              <button
                type="button"
                className="primary-button"
                onClick={() => setStep("a1c")}
              >
                Get started
              </button>
            </>
          ) : null}

          {step === "a1c" ? (
            <>
              <p className="hero-eyebrow">Step 2 of 4</p>
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
              <p className="hero-eyebrow">Step 3 of 4</p>
              <h1 className="page-title">What to expect</h1>
              <ul className="page-copy expectation-list">
                <li>
                  Guidance is qualitative — plain words, not glucose numbers
                  or calorie math.
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
                onClick={() => setStep("daily_loop")}
              >
                Continue
              </button>
            </>
          ) : null}

          {step === "daily_loop" ? (
            <>
              <p className="hero-eyebrow">Step 4 of 4</p>
              <h1 className="page-title">Your daily loop</h1>
              <p className="page-copy">
                Check a meal before you eat it — that&apos;s the whole habit.
                Revora remembers your day, keeps your streak, and shows you
                one useful pattern from your own meals.
              </p>
              <ul className="page-copy expectation-list">
                <li>
                  <strong>Type your meal.</strong> The fastest way for most
                  meals.
                </li>
                <li>
                  <strong>Say your meal.</strong> Tap the mic, speak, review
                  the text, submit.
                </li>
              </ul>
              <button
                type="button"
                className="primary-button"
                data-testid="onboarding-finish"
                onClick={finish}
              >
                Check my first meal
              </button>
            </>
          ) : null}
        </section>

        <footer className="page-footer">
          <Link href="/privacy">Privacy</Link>
        </footer>
      </div>
    </main>
  );
}
