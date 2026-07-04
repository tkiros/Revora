/**
 * Play Billing via the Digital Goods API inside the TWA (plan 4D). Feature-
 * detected: present only when running inside a Play-installed TWA on a
 * supporting Chrome. Browser users fall back to Stripe checkout.
 */

const PLAY_BILLING_URL = "https://play.google.com/billing";

export const PLAY_SKUS = {
  monthly: "premium_monthly",
  annual: "premium_annual"
} as const;

type DigitalGoodsService = {
  getDetails(itemIds: string[]): Promise<
    Array<{
      itemId: string;
      title: string;
      price: { currency: string; value: string };
    }>
  >;
};

type DigitalGoodsHost = {
  getDigitalGoodsService?: (
    serviceProvider: string
  ) => Promise<DigitalGoodsService>;
  PaymentRequest?: typeof PaymentRequest;
};

export function isPlayBillingAvailable(
  host: DigitalGoodsHost = globalThis as DigitalGoodsHost
): boolean {
  return typeof host.getDigitalGoodsService === "function";
}

export async function listPlaySkus(
  host: DigitalGoodsHost = globalThis as DigitalGoodsHost
): Promise<Array<{ itemId: string; title: string; priceLabel: string }>> {
  if (!host.getDigitalGoodsService) {
    return [];
  }

  const service = await host.getDigitalGoodsService(PLAY_BILLING_URL);
  const details = await service.getDetails([
    PLAY_SKUS.monthly,
    PLAY_SKUS.annual
  ]);

  return details.map((item) => ({
    itemId: item.itemId,
    title: item.title,
    priceLabel: `${item.price.value} ${item.price.currency}`
  }));
}

/**
 * Runs the Play purchase flow and returns the purchaseToken. The token MUST
 * then be verified server-side (POST /api/billing/play/verify) — the client
 * result alone never grants entitlement.
 */
export async function purchasePlaySku(
  sku: string,
  host: DigitalGoodsHost = globalThis as DigitalGoodsHost
): Promise<string | null> {
  const PaymentRequestCtor = host.PaymentRequest;
  if (!PaymentRequestCtor || !host.getDigitalGoodsService) {
    return null;
  }

  const request = new PaymentRequestCtor(
    [
      {
        supportedMethods: PLAY_BILLING_URL,
        data: { sku }
      }
    ],
    // Play Billing ignores PaymentRequest totals; a zero placeholder is the
    // documented pattern.
    {
      total: {
        label: "Subscription",
        amount: { currency: "USD", value: "0" }
      }
    }
  );

  const response = await request.show();
  const details = response.details as { purchaseToken?: string };
  await response.complete("success");

  return details.purchaseToken ?? null;
}
