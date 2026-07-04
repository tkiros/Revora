import type { SessionInfo } from "./session";

/** Founder-only gate. No ADMIN_EMAIL configured = nobody is admin. */
export function isAdmin(session: SessionInfo): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  return Boolean(adminEmail && session && session.email === adminEmail);
}
