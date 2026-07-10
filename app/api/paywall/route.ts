import { NextResponse } from "next/server";
import {
  paywallMode,
  resolveAnnualPrice,
  resolvePriceVariant
} from "../../../lib/server/pricing";

export const runtime = "nodejs";

export async function GET() {
  const { variant, display } = resolvePriceVariant();
  const annual = resolveAnnualPrice();
  return NextResponse.json({
    mode: paywallMode(),
    variant,
    priceDisplay: display,
    // Annual is offered only when its Stripe price is configured.
    annualDisplay: annual.priceId ? annual.display : null,
    annualMonthlyEquivalent: annual.priceId ? annual.monthlyEquivalent : null
  });
}
