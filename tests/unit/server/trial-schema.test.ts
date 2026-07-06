import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

/**
 * Schema-level contract for the trial-billing columns (migration 0002):
 * `subscriptions.status` accepts `'trialing'`, and the two nullable columns
 * `priceVariant` (price_variant) / `preChargeEmailSentAt`
 * (pre_charge_email_sent_at) exist and default to NULL. Consumed by Tasks
 * 2.3, 2.4, 3.1. pglite applies the real 0002 migration via test-db.ts.
 */
describe("subscriptions trial columns (0002)", () => {
  let ctx: Awaited<ReturnType<typeof createTestDb>>;

  beforeEach(async () => {
    ctx = await createTestDb();
  });

  afterEach(async () => {
    await ctx.close();
  });

  it("accepts a trialing row with price variant", async () => {
    const [user] = await ctx.db
      .insert(schema.users)
      .values({ email: "t@example.com" })
      .returning();
    const [row] = await ctx.db
      .insert(schema.subscriptions)
      .values({
        userId: user.id,
        provider: "stripe",
        providerRef: "sub_test_1",
        productId: "premium_monthly",
        status: "trialing",
        priceVariant: "1299",
        currentPeriodEnd: new Date(Date.now() + 7 * 86400_000),
        updatedAt: new Date()
      })
      .returning();
    expect(row.status).toBe("trialing");
    expect(row.preChargeEmailSentAt).toBeNull();
  });
});
