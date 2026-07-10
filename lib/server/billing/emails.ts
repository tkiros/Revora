/**
 * Task 3.3 — the 2-day pre-charge email. Transparency IS the feature: the
 * subject and body state the exact charge date and amount, and the body
 * carries a one-tap cancel link (no retention screens). Copy is tracked in
 * docs/safety/copy-ledger.md (`precharge-email`) and scanned by the
 * claims-boundary audit via COPY_FILES.
 */
export function prechargeEmailText(
  appUrl: string,
  amountDisplay: string,
  chargeDateText: string,
  cancelToken: string
): { subject: string; text: string } {
  const cancelUrl = `${appUrl}/api/billing/cancel?token=${cancelToken}`;
  return {
    subject: "Your Revora trial ends in about 2 days",
    text: [
      "A heads-up, as promised:",
      "",
      `Your free week ends on ${chargeDateText}. If you do nothing, your card will be charged ${amountDisplay} starting that day.`,
      "",
      "Want to keep going? You don't need to do anything.",
      "",
      `Want to stop? One tap, no questions, no retention screens: ${cancelUrl}`,
      "",
      "You can also cancel any time from your account page:",
      `${appUrl}/account`,
      "",
      "— Revora"
    ].join("\n")
  };
}
