import Link from "next/link";

import { signIn } from "../../auth";

export const metadata = { title: "Sign in — Revora" };

export default function SignInPage() {
  return (
    <main className="page-shell">
      <div className="page-frame">
        <section className="surface-card hero-card">
          <p className="hero-eyebrow">Revora account</p>
          <h1 className="page-title">Sign in with your email</h1>
          <p className="page-copy">
            No password. We send a one-time sign-in link to your inbox — tap
            it and you&apos;re in. An account keeps your history and coach in
            sync across your devices.
          </p>
          <form
            className="form-grid"
            action={async (formData: FormData) => {
              "use server";
              await signIn("resend", {
                email: String(formData.get("email") ?? ""),
                redirectTo: "/welcome"
              });
            }}
          >
            <div className="field-stack">
              <label htmlFor="email" className="field-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="text-input"
              />
              <p className="field-hint">
                Next you&apos;ll be asked to consent to storing your health
                data before anything is saved.
              </p>
            </div>
            <button type="submit" className="primary-button">
              Email me a sign-in link
            </button>
          </form>
        </section>

        <footer className="page-footer">
          <Link href="/">Home</Link>
          <Link href="/privacy">Privacy</Link>
        </footer>
      </div>
    </main>
  );
}
