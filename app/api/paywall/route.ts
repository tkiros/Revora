import { NextResponse } from "next/server";
import { getDb, type Db } from "../../../lib/server/db";
import { getEntitlement } from "../../../lib/server/entitlement";
import { fetchPlaySubscription } from "../../../lib/server/play-api";
import {
  paywallMode,
  resolveAnnualPrice,
  resolvePriceVariant
} from "../../../lib/server/pricing";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../lib/server/session";

export const runtime = "nodejs";

type PaywallDeps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  getEntitlementImpl?: typeof getEntitlement;
  playLookup?: typeof fetchPlaySubscription;
};

export function createPaywallHandler(deps: PaywallDeps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const getEntitlementImpl = deps.getEntitlementImpl ?? getEntitlement;
  const playLookup = deps.playLookup ?? fetchPlaySubscription;

  return async function GET() {
    const { variant, display } = resolvePriceVariant();
    const annual = resolveAnnualPrice();

    // AUD-009: the check form's client gate must know whether this session is
    // entitled, or the device-local taster meter walls paying users. Resolved
    // server-side with the same getEntitlement the check route enforces with.
    // Any failure (no session context, DB error) degrades to false: the client
    // keeps its guest meter and the server 402/503 stays the spend authority.
    let entitled = false;
    try {
      const session = await getSession();
      if (session) {
        const entitlement = await getEntitlementImpl(db(), session.userId, {
          refreshPlaySubscription: (token) => playLookup(token)
        });
        entitled = entitlement.tier === "premium";
      }
    } catch {
      entitled = false;
    }

    return NextResponse.json({
      mode: paywallMode(),
      variant,
      priceDisplay: display,
      // Annual is offered only when its Stripe price is configured.
      annualDisplay: annual.priceId ? annual.display : null,
      annualMonthlyEquivalent: annual.priceId ? annual.monthlyEquivalent : null,
      entitled
    });
  };
}

export const GET = createPaywallHandler();
