import { NextResponse } from "next/server";
import { paywallMode, resolvePriceVariant } from "../../../lib/server/pricing";

export const runtime = "nodejs";

export async function GET() {
  const { variant, display } = resolvePriceVariant();
  return NextResponse.json({
    mode: paywallMode(),
    variant,
    priceDisplay: display
  });
}
