import { eq } from "drizzle-orm";
import { cache } from "react";

import {
  countChecksToday,
  FREE_DAILY_CHECKS,
  getEntitlement
} from "./entitlement";
import { getDb, schema } from "./db";
import { getSessionInfo } from "./session";

/**
 * Plan-box display data for the (app) shell + dashboard (M1 plan, eng
 * amendment #4): a DISPLAY-only entitlement read — no refreshPlaySubscription
 * injected, so rendering the shell never blocks on the Play API. May be
 * minutes stale; all granting paths keep verify-on-read.
 *
 * cache() dedupes the read when both the sidebar and the dashboard page ask
 * during one render pass. Any failure degrades to the guest box — the shell
 * must render even when the DB is down.
 */

export type PlanBoxData = {
  planName: string;
  meta: string;
  isFree: boolean;
  signedIn: boolean;
};

const GUEST_BOX: PlanBoxData = {
  planName: "Free plan",
  meta: "The daily check is free.",
  isFree: true,
  signedIn: false
};

function formatDate(date: Date, timezone: string): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: timezone
  });
}

export const getPlanBox = cache(async (): Promise<PlanBoxData> => {
  try {
    const session = await getSessionInfo();
    if (!session) {
      return GUEST_BOX;
    }

    const db = getDb();
    const entitlement = await getEntitlement(db, session.userId);

    const [profile] = await db
      .select({ timezone: schema.profiles.timezone })
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, session.userId));
    const timezone = profile?.timezone ?? "America/New_York";

    if (entitlement.tier === "premium") {
      const date = entitlement.currentPeriodEnd
        ? formatDate(entitlement.currentPeriodEnd, timezone)
        : null;
      const meta =
        entitlement.status === "trialing"
          ? date
            ? `Trial ends ${date}`
            : "Trial active"
          : date
            ? `Renews ${date}`
            : "Active";
      return {
        planName: "Revora Premium",
        meta,
        isFree: false,
        signedIn: true
      };
    }

    const used = await countChecksToday(db, session.userId, timezone);
    const left = Math.max(0, FREE_DAILY_CHECKS - used);
    return {
      planName: "Free plan",
      meta: `${left} of ${FREE_DAILY_CHECKS} free checks left today`,
      isFree: true,
      signedIn: true
    };
  } catch {
    // DB or session hiccup: the shell still renders; the box shows the
    // guest default rather than blocking the page.
    return GUEST_BOX;
  }
});
