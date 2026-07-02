import { createSign } from "node:crypto";

import type { PlayRefreshResult } from "./entitlement";

/**
 * Play Developer API via plain fetch + a service-account RS256 JWT — no
 * `googleapis` dependency (docs/adr/billing.md). One endpoint:
 * purchases.subscriptionsv2.get, used for purchase verification and
 * verify-on-read refresh.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/androidpublisher";

type ServiceAccount = { client_email: string; private_key: string };

type FetchLike = typeof fetch;

function loadServiceAccount(): ServiceAccount {
  const raw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error("GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is not set.");
  }

  const parsed = JSON.parse(raw) as Partial<ServiceAccount>;
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("Service account JSON is missing client_email/private_key.");
  }

  return parsed as ServiceAccount;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function buildServiceAccountJwt(
  account: ServiceAccount,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): string {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: account.client_email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: nowSeconds,
      exp: nowSeconds + 3600
    })
  );

  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = base64url(signer.sign(account.private_key));

  return `${header}.${claims}.${signature}`;
}

async function getAccessToken(fetchImpl: FetchLike): Promise<string> {
  const jwt = buildServiceAccountJwt(loadServiceAccount());
  const response = await fetchImpl(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });

  if (!response.ok) {
    throw new Error(`Play token exchange failed: ${response.status}`);
  }

  const body = (await response.json()) as { access_token?: string };
  if (!body.access_token) {
    throw new Error("Play token exchange returned no access_token.");
  }

  return body.access_token;
}

// subscriptionsv2 state → unified subscription status
const STATE_MAP: Record<string, PlayRefreshResult["status"]> = {
  SUBSCRIPTION_STATE_ACTIVE: "active",
  SUBSCRIPTION_STATE_IN_GRACE_PERIOD: "grace",
  SUBSCRIPTION_STATE_CANCELED: "canceled",
  SUBSCRIPTION_STATE_ON_HOLD: "expired",
  SUBSCRIPTION_STATE_PAUSED: "expired",
  SUBSCRIPTION_STATE_EXPIRED: "expired"
};

export type PlaySubscriptionInfo = PlayRefreshResult & {
  productId: string | null;
};

export async function fetchPlaySubscription(
  purchaseToken: string,
  deps: { fetchImpl?: FetchLike } = {}
): Promise<PlaySubscriptionInfo> {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const packageName = process.env.PLAY_PACKAGE_NAME;
  if (!packageName) {
    throw new Error("PLAY_PACKAGE_NAME is not set.");
  }

  const token = await getAccessToken(fetchImpl);
  const response = await fetchImpl(
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    throw new Error(`Play subscription lookup failed: ${response.status}`);
  }

  const body = (await response.json()) as {
    subscriptionState?: string;
    lineItems?: Array<{ productId?: string; expiryTime?: string }>;
  };

  const lineItem = body.lineItems?.[0];
  const expiry = lineItem?.expiryTime ? new Date(lineItem.expiryTime) : null;

  return {
    status: STATE_MAP[body.subscriptionState ?? ""] ?? "expired",
    currentPeriodEnd: expiry ?? new Date(0),
    productId: lineItem?.productId ?? null
  };
}
