/**
 * Browser tests must never inherit provider credentials from `.env` or
 * `.env.local`. Next loads those files even for an optimized local
 * `next start`, so every sensitive integration gets an explicit empty value
 * here. Empty process values win over file loading.
 *
 * The only mutable service the full E2E gate accepts is the caller-provided
 * disposable DATABASE_URL. Email is redirected to an owner-only disk mailbox;
 * all other provider paths are absent, synthetic, or deliberately disabled.
 */
const E2E_AUTH_SECRET = "revora-e2e-smoke-only-secret-0000000000000000";
const E2E_HEALTH_DATA_KEY =
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
const E2E_VAPID_PUBLIC_KEY =
  "BDd3_hVL9fZi9Ybo2UUmA0mNzLFmwEsuJdyxdCLVQV-XFotN0jkNqp7GQ96_2enX0mUeXBIvBqXAiCveKuMhGJ0";

function isolatedDatabaseUrl(value?: string): string {
  const candidate = value?.trim();
  if (!candidate) return "";

  let hostname = "";
  try {
    hostname = new URL(candidate).hostname;
  } catch {
    throw new Error("E2E DATABASE_URL must be a valid loopback Postgres URL.");
  }
  if (!["127.0.0.1", "localhost", "[::1]"].includes(hostname)) {
    throw new Error(
      "E2E DATABASE_URL must target a disposable loopback database."
    );
  }
  return candidate;
}

export function isolatedE2ERuntimeEnv(
  base: NodeJS.ProcessEnv = process.env
): NodeJS.ProcessEnv {
  return {
    ...base,

    // Explicit disposable/local inputs.
    AUTH_EMAIL_FROM: "Revora E2E <signin@revora.test>",
    AUTH_EMAIL_STUB_DIR: base.AUTH_EMAIL_STUB_DIR?.trim() || "",
    AUTH_SECRET: E2E_AUTH_SECRET,
    DATABASE_POOL_MAX: "2",
    DATABASE_URL: isolatedDatabaseUrl(base.DATABASE_URL),
    HEALTH_DATA_KEY: E2E_HEALTH_DATA_KEY,
    LEGAL_ENTITY_NAME: "Revora",
    LEGAL_TERMS_FINAL: "0",
    MEAL_EXTRACT_STUB: "1",
    NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3100",
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: E2E_VAPID_PUBLIC_KEY,
    PANTRY_EXTRACT_STUB: "1",
    PAYWALL_MODE: base.PAYWALL_MODE?.trim() || "legacy",
    REVORA_ALLOW_NO_MEASUREMENT: "1",
    SUPPORT_INBOX_EMAIL: "support@revora.test",
    TRIAL_PRICE_VARIANT: "1299",
    VAPID_PUBLIC_KEY: E2E_VAPID_PUBLIC_KEY,

    // This is an optimized local server, not an internet-reachable preview.
    // `preview` would correctly make missing abuse controls fail closed.
    VERCEL_ENV: "development",

    // Build/runtime provider isolation. Keep these keys present and empty so
    // Next cannot refill them from the developer's local env files.
    ADMIN_EMAIL: "admin@revora.test",
    AUTH_URL: "",
    BLOB_READ_WRITE_TOKEN: "",
    CRON_SECRET: "",
    DATABASE_MIGRATION_URL: "",
    EDGE_CONFIG: "",
    GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: "",
    NEXTAUTH_URL: "",
    NEXT_PUBLIC_LONGITUDINAL_INSIGHTS: "",
    NEXT_PUBLIC_PHOTO_INPUT: "",
    NEXT_PUBLIC_PLAY_BILLING: "",
    NEXT_PUBLIC_REVIEWER_MODE: "",
    NEXT_PUBLIC_SENTRY_DSN: "",
    NEXT_PUBLIC_UMAMI_HOST_URL: "",
    NEXT_PUBLIC_UMAMI_SRC: "",
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: "",
    NEXT_PUBLIC_WAITLIST_URL: "",
    OPENAI_API_KEY: "",
    OPENAI_BASE_URL: "",
    OPENROUTER_API_KEY: "",
    PANTRY_BLOB_READ_WRITE_TOKEN: "",
    PHOTO_INPUT_ENABLED: "",
    PLAY_PACKAGE_NAME: "",
    RESEND_API_KEY: "",
    RESEND_WEBHOOK_SECRET: "",
    REVIEWER_TEST_SECRET: "",
    REVORA_LAUNCH_MODE_OVERRIDE: "",
    RTDN_SHARED_TOKEN: "",
    SENTRY_AUTH_TOKEN: "",
    SENTRY_DSN: "",
    STRIPE_PRICE_MONTHLY: "",
    STRIPE_PRICE_MONTHLY_999: "",
    STRIPE_PRICE_MONTHLY_1299: "",
    STRIPE_PRICE_MONTHLY_1999: "",
    STRIPE_PRICE_ANNUAL: "",
    STRIPE_PRICE_PANTRY: "",
    STRIPE_SECRET_KEY: "",
    STRIPE_WEBHOOK_SECRET: "",
    UPSTASH_REDIS_REST_TOKEN: "",
    UPSTASH_REDIS_REST_URL: "",
    VAPID_PRIVATE_KEY: "",
    VERCEL_OIDC_TOKEN: ""
  };
}
