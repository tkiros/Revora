import { describe, expect, it, vi } from "vitest";

import { listPlayPurchases } from "../../../lib/client/digital-goods";

// N-08: the restore affordance rests on this — a reinstalling subscriber's
// only path back is listPurchases() → server-side verify.
describe("listPlayPurchases", () => {
  it("returns [] outside a Play TWA (no Digital Goods host)", async () => {
    await expect(listPlayPurchases({})).resolves.toEqual([]);
  });

  it("lists the account's existing purchases from the Play billing service", async () => {
    const purchases = [
      { itemId: "premium_monthly", purchaseToken: "token-1" }
    ];
    const getDigitalGoodsService = vi.fn().mockResolvedValue({
      getDetails: vi.fn(),
      listPurchases: vi.fn().mockResolvedValue(purchases)
    });

    await expect(
      listPlayPurchases({ getDigitalGoodsService })
    ).resolves.toEqual(purchases);
    expect(getDigitalGoodsService).toHaveBeenCalledWith(
      "https://play.google.com/billing"
    );
  });
});
