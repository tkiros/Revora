import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";

import { getDb, schema } from "./lib/server/db";
import { checkEmailCooldown } from "./lib/revora/rate-limit";
import { EMAIL_FROM } from "./lib/revora/contact";

/**
 * Auth.js v5 — email magic-link via Resend, database sessions in Railway
 * Postgres (docs/adr/hosting-hybrid.md). DB sessions make sign-out-everywhere
 * and account deletion trivially correct.
 *
 * The adapter is only constructed when DATABASE_URL is present: it is always
 * present at runtime on Vercel (preview/prod) and in dev once Railway
 * Postgres is provisioned (§10); without it, importing this module stays
 * safe (builds, tests) and auth simply isn't available.
 */


const adapter = process.env.DATABASE_URL
  ? DrizzleAdapter(getDb() as unknown as Parameters<typeof DrizzleAdapter>[0], {
      usersTable: schema.users as never,
      accountsTable: schema.accounts as never,
      sessionsTable: schema.sessions as never,
      verificationTokensTable: schema.verificationTokens as never
    })
  : undefined;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter,
  session: { strategy: "database" },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    }
  },
  pages: { signIn: "/signin", verifyRequest: "/signin/check-email" },
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: EMAIL_FROM,
      async sendVerificationRequest(params) {
        // Per-email cooldown (W-11). The Edge proxy limits POST /api/auth/* per
        // IP, but per-IP cannot see the attack that matters most here: a flood
        // spread across many IPs aimed at ONE victim's mailbox. This is the
        // single choke point every magic link passes through — the sign-in form
        // AND the trial funnel's signIn() call both land here. Throwing aborts
        // the send (Auth.js surfaces its error page); trial start swallows it
        // and still returns a checkout url, which is correct: a cooled-down
        // inbox must never block a paying customer.
        const cooldown = await checkEmailCooldown("auth_email", params.identifier);
        if (!cooldown.ok) {
          throw new Error("Too many sign-in emails requested for this address.");
        }

        // Test/dev mailbox stub: write the magic link to disk instead of
        // sending. Set AUTH_EMAIL_STUB_DIR only in dev/preview test setups.
        const stubDir = process.env.AUTH_EMAIL_STUB_DIR;
        if (stubDir) {
          const { writeFile, mkdir } = await import("node:fs/promises");
          const path = await import("node:path");
          await mkdir(stubDir, { recursive: true });
          await writeFile(
            path.join(
              stubDir,
              `${params.identifier.replace(/[^a-z0-9@.]/gi, "_")}.json`
            ),
            JSON.stringify({ email: params.identifier, url: params.url })
          );
          return;
        }

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: EMAIL_FROM,
            to: params.identifier,
            subject: "Your Revora sign-in link",
            text: `Sign in to Revora:\n\n${params.url}\n\nThis link expires in 24 hours. If you didn't request it, you can ignore this email.`
          })
        });

        if (!response.ok) {
          throw new Error(`Resend error: ${response.status}`);
        }
      }
    })
  ]
});
