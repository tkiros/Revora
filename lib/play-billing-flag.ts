type PlayBillingEnv = { NEXT_PUBLIC_PLAY_BILLING?: string };

/**
 * Google Play purchases are an independently reviewed launch surface. Keep
 * both the TWA client and server receipt endpoint off unless a build explicitly
 * opts in, so a Web-only Stripe launch cannot accidentally take Play payments.
 */
export function playBillingEnabled(env?: PlayBillingEnv): boolean {
  return (env ?? (process.env as unknown as PlayBillingEnv)).NEXT_PUBLIC_PLAY_BILLING === "1";
}
