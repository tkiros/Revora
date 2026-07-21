/**
 * Single source of truth for the domains Revora puts in front of a user.
 *
 * These were copy-pasted literals across twelve call sites, and they drifted
 * onto two domains we did not control: `signin@revora.app` (owned by an
 * unrelated company — every magic link was sent from a third party's domain,
 * one DMARC policy change away from a total sign-in outage) and
 * `support@revora.bio` (registered to nobody — anyone could have taken it and
 * received user support mail). Same failure mode as the verdict labels in
 * `labels.ts`: a literal in N places is a guarantee in zero places.
 *
 * Change the address here and every surface moves atomically. Anything added
 * here must be on a domain we own — `tests/unit/revora/owned-domains.test.ts`
 * fails the build otherwise.
 */

/** Public support inbox. Rendered in Terms, Privacy, reports, and pantry mail. */
export const SUPPORT_EMAIL = "support@revora.plus";

/**
 * Envelope sender for every transactional send (magic links included).
 * Overridable so preview can send from a subdomain with its own DKIM key
 * without touching production's reputation.
 */
export const EMAIL_FROM =
  process.env.AUTH_EMAIL_FROM ?? "Revora <signin@revora.plus>";
