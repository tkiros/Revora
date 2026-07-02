import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";

import { getDb, schema } from "./lib/server/db";

/**
 * Auth.js v5 — email magic-link via Resend, database sessions in Neon
 * (docs/adr/stack.md). DB sessions make sign-out-everywhere and account
 * deletion trivially correct.
 *
 * The adapter is only constructed when DATABASE_URL is present: it is always
 * present at runtime on Vercel (preview/prod) and in dev once Neon is
 * provisioned (§10); without it, importing this module stays safe (builds,
 * tests) and auth simply isn't available.
 */

const EMAIL_FROM = process.env.AUTH_EMAIL_FROM ?? "Revora <signin@revora.app>";

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
