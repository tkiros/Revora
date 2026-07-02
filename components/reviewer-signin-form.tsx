"use client";

import { useState, type FormEvent } from "react";

/**
 * Preview-only Play-reviewer access form (P9). Only rendered by /signin when
 * NEXT_PUBLIC_REVIEWER_MODE=1 — a build-time constant left unset in
 * production (docs/ops/env-reference.md), so this markup never ships to a
 * production build in the first place.
 *
 * POSTs to the bypass route (app/api/auth/reviewer-signin/route.ts), which
 * 302-redirects into Auth.js's own magic-link callback chain. `fetch`
 * follows that chain by default and the browser applies each response's
 * Set-Cookie along the way, so by the time this resolves the session cookie
 * is already set — this component just navigates home after.
 */
export function ReviewerSigninForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");

    try {
      const response = await fetch("/api/auth/reviewer-signin", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, secret: code })
      });

      if (!response.ok) {
        setState("error");
        return;
      }

      window.location.href = "/";
    } catch {
      setState("error");
    }
  }

  return (
    <details className="reviewer-access-details">
      <summary>Reviewer access</summary>
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field-stack">
          <label htmlFor="reviewer-email" className="field-label">
            Email
          </label>
          <input
            id="reviewer-email"
            name="reviewer-email"
            type="email"
            required
            autoComplete="off"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="text-input"
          />
        </div>
        <div className="field-stack">
          <label htmlFor="reviewer-code" className="field-label">
            Access code
          </label>
          <input
            id="reviewer-code"
            name="reviewer-code"
            type="password"
            required
            autoComplete="off"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="text-input"
          />
        </div>
        {state === "error" ? (
          <p className="field-error">
            That email or access code isn&apos;t valid.
          </p>
        ) : null}
        <button
          type="submit"
          className="primary-button"
          disabled={state === "submitting"}
          data-testid="reviewer-signin-submit"
        >
          {state === "submitting" ? "Signing in…" : "Sign in as reviewer"}
        </button>
      </form>
    </details>
  );
}
