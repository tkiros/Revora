export type StorePlatform = "android" | "ios";

/**
 * Store-waitlist demand capture: two separate signup URLs so Android vs iOS
 * demand is measurable (90-day distribution plan). Per-store env vars win;
 * a single shared NEXT_PUBLIC_WAITLIST_URL still segments via ?platform= so
 * one form can serve both. No URL configured → the caller renders plain
 * "coming soon" copy instead of a link.
 */
export function storeWaitlistUrl(
  platform: StorePlatform,
  env: Partial<NodeJS.ProcessEnv> = process.env
): string | null {
  const direct =
    platform === "android"
      ? env.NEXT_PUBLIC_WAITLIST_ANDROID_URL
      : env.NEXT_PUBLIC_WAITLIST_IOS_URL;
  if (direct) return direct;

  const shared = env.NEXT_PUBLIC_WAITLIST_URL;
  if (!shared) return null;
  return `${shared}${shared.includes("?") ? "&" : "?"}platform=${platform}`;
}
