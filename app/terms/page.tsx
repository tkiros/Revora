import type { Metadata } from "next";
import Link from "next/link";

import { loadSafetyContract } from "../../lib/revora/safety-contract";

export const metadata: Metadata = {
  title: "Terms · Revora",
  description: "The agreement between you and Revora, in plain language."
};

// COUNSEL-DRAFT (Track B B1, counsel-brief Q7 refund adequacy + governing
// law): this whole page is a working draft. Structure and plain-language
// framing are final; the bracketed placeholders below need counsel sign-off
// before Play submission (docs/handoff/human-actions-required.md).
export default function TermsPage() {
  const { copy } = loadSafetyContract();
  // Same fallback pattern as app/api/cron/nudge/route.ts:32 — override via
  // SUPPORT_EMAIL, default to the placeholder until a domain is final.
  const supportEmail = process.env.SUPPORT_EMAIL ?? "support@revora.app";

  return (
    <main className="page-shell">
      <div className="page-frame">
        <section className="surface-card hero-card">
          <p className="hero-eyebrow">Terms</p>
          <h1 className="page-title">Terms of Service</h1>
          <p className="page-copy">
            This is the plain-language agreement between you and Revora. It
            is a working draft, pending counsel review, and will be
            finalized before Revora leaves testing.
          </p>
          <p className="page-copy">Last updated: 2026-07-02</p>
        </section>

        <section className="surface-card legal-card">
          <h2>What Revora is</h2>
          <p>
            Revora is an informational food-decision coach for adults with
            prediabetes. Before you eat something, it looks at the food and
            your latest A1C and gives you calm, plain-language guidance —
            clear, be careful, or hold off — plus a next step.
          </p>

          <h2>What Revora is not</h2>
          <p>
            Revora is not a medical device. It does not give medical advice,
            does not identify or evaluate any medical condition, and does
            not replace your doctor or registered dietitian. Decisions about
            your health stay with you and your clinician — Revora exists to
            give you clarity for the choices you make, not to make them for
            you.
          </p>

          <h2>Who Revora is for</h2>
          <p>
            You must be 18 or older to create an account. Revora is built
            for adults with an A1C in the prediabetes range — 5.7% to 6.4%.
            If your latest A1C falls outside that range, Revora will tell
            you so and point you to a doctor or registered dietitian instead
            of a result.
          </p>

          <h2>Your account</h2>
          <p>
            You sign in with a one-time link sent to your email — there is
            no password to manage or lose. Keep your email account secure:
            anyone with access to it, or to a still-valid sign-in link, can
            access your Revora account.
          </p>

          <h2>Acceptable use</h2>
          <p>
            Use Revora for its intended purpose — personal, informational
            food-decision support. Do not use it to look up someone else's
            health information without their consent, attempt to disrupt or
            probe the service, or resell or redistribute what it gives you.
          </p>

          <h2>What you enter</h2>
          <p>
            The A1C and meal details you enter should be accurate and your
            own. Revora's guidance is only as useful as the information you
            give it.
          </p>

          <h2>Subscriptions and billing</h2>
          <p>
            Revora offers a free tier and an optional Premium subscription,
            billed monthly or annually. On Android, Premium is purchased and
            managed through Google Play Billing inside the app; on the web,
            through Stripe. Subscriptions renew automatically at the end of
            each billing period unless you cancel first.
          </p>
          <p>
            You can cancel any time from your account settings or the store
            you subscribed through. Cancellation takes effect at the end of
            the period you have already paid for — you keep Premium access
            until then; it is not removed early.
          </p>
          <p>
            Refunds follow the policy of whichever store processed your
            payment (Google Play or Stripe), plus any statutory right you
            hold under the law where you live. If Revora changes
            subscription prices, current subscribers get notice before the
            new price applies to their next renewal.
          </p>

          <h2>Free tier limits</h2>
          <p>
            The free tier includes a limited number of checks per day.
            Revora may change this limit, or other free-tier features, with
            notice posted in the app or sent to your email.
          </p>

          <h2>Your health data and privacy</h2>
          <p>
            See Revora&apos;s{" "}
            <Link className="inline-link" href="/privacy">
              Privacy Policy
            </Link>{" "}
            for exactly what Revora collects, why, and how it is protected.
            Before Revora stores anything health-related — your A1C or the
            meals you check — it asks for your separate, explicit consent,
            consistent with Article 9 of the GDPR for special-category data.
            You can withdraw consent at any time by deleting your account at{" "}
            <Link className="inline-link" href="/account/delete">
              /account/delete
            </Link>
            , which removes your profile, history, subscriptions, and push
            registrations.
          </p>

          <h2>Ownership and license</h2>
          <p>
            Revora&apos;s app, design, and underlying software belong to
            [Revora&apos;s operating entity — counsel to confirm] and are
            licensed to you personally, for your own use, for as long as
            your account is active. You may not copy, resell, decompile, or
            redistribute the app or its outputs.
          </p>

          <h2>Ending your access</h2>
          <p>
            You can stop using Revora and delete your account at any time.
            Revora may suspend or end an account that misuses the service —
            for example, abusing the free tier, attempting to bypass its
            limits, or violating the acceptable-use terms above.
          </p>

          <h2>Service availability and changes</h2>
          <p>
            Revora is provided on an as-available basis. Occasional downtime
            or interruptions can happen, and no specific uptime commitment
            is made. Revora may add, change, or remove features over time;
            material changes to these Terms will be posted here with an
            updated date.
          </p>

          <h2>Limits on liability</h2>
          <p>
            To the extent the law allows, Revora is provided &quot;as
            is,&quot; without warranties of any kind, express or implied.
            Revora and its team are not liable for indirect, incidental, or
            consequential damages arising from your use of the service.
            Nothing here limits any statutory right you hold as a consumer
            that cannot be waived by contract.
          </p>
          <p>[Governing law/venue — counsel to confirm]</p>

          <h2>Contact</h2>
          <p>
            Questions about these Terms? Email{" "}
            <a className="inline-link" href={`mailto:${supportEmail}`}>
              {supportEmail}
            </a>
            .
          </p>

          <p className="result-disclaimer">{copy.disclaimer}</p>
        </section>

        <footer className="page-footer">
          <Link href="/">Back to Revora</Link>
          <Link href="/privacy">Privacy</Link>
        </footer>
      </div>
    </main>
  );
}
