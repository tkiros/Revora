import { EMAIL_FROM, SUPPORT_EMAIL } from "../revora/contact";
import { emailStubDirectory, writeEmailStub } from "./email-stub";

/**
 * One transactional-email door for everything that is not a NextAuth magic
 * link (pantry intake, report delivery, founder alerts). Same raw-fetch
 * Resend call and the same AUTH_EMAIL_STUB_DIR test seam as auth.ts, so
 * Playwright reads these from disk exactly like magic links.
 * ponytail: raw fetch, no SDK; add the Resend SDK only if we ever need
 * attachments or templates.
 */


/**
 * Where the app's own notifications (support cases, pantry-sweep alerts) land.
 * SUPPORT_EMAIL stays the public address users write to, but revora.plus's MX
 * is Namecheap email forwarding, whose relays greylist Resend's sending IPs —
 * observed 2026-07-22: 3/3 Resend→support@ sends bounced ("Generic Temporary
 * Delivery Failure") while 4/4 Resend→Gmail sends delivered, and Gmail→support@
 * forwarded fine (real MTAs retry 4xx; Resend gives up). So internal mail goes
 * to a directly-deliverable inbox when SUPPORT_INBOX_EMAIL is set.
 */
export function supportInbox(): string {
  return process.env.SUPPORT_INBOX_EMAIL || SUPPORT_EMAIL;
}

export type SendEmailInput = { to: string; subject: string; text: string };
export type SendEmailResult = { ok: true } | { ok: false; status: number };
export type SendEmailDeps = { fetchImpl?: typeof fetch };

export async function sendEmail(
  input: SendEmailInput,
  deps: SendEmailDeps = {}
): Promise<SendEmailResult> {
  const stubDir = emailStubDirectory(process.env);
  if (stubDir) {
    const name = `${input.to.replace(/[^a-z0-9@.]/gi, "_")}-${Date.now()}.json`;
    await writeEmailStub(stubDir, name, input);
    return { ok: true };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, status: 503 };
  }

  const fetchImpl = deps.fetchImpl ?? fetch;
  const response = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from: EMAIL_FROM, ...input })
  });

  return response.ok ? { ok: true } : { ok: false, status: response.status };
}
