import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

import { hashClaimToken } from "../../../lib/server/pantry/claims";
import { getDb, schema, type Db } from "../../../lib/server/db";
import { getSessionInfo, type SessionInfo } from "../../../lib/server/session";

export const runtime = "nodejs";

type Deps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  now?: () => Date;
};

export function createPantryClaimHandler(deps: Deps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const now = deps.now ?? (() => new Date());

  return async function GET(request: Request) {
    const url = new URL(request.url);
    const token = url.searchParams.get("token") ?? "";

    const session = await getSession();
    if (!session) {
      const callback = `/pantry/claim?token=${encodeURIComponent(token)}`;
      return NextResponse.redirect(
        new URL(`/signin?callbackUrl=${encodeURIComponent(callback)}`, url)
      );
    }

    if (token) {
      // Possession binds: first signed-in visitor with the token owns the
      // order. Already-claimed orders (userId set) are never rebound.
      await db()
        .update(schema.pantryOrders)
        .set({
          userId: session.userId,
          status: "claimed",
          claimedAt: now(),
          updatedAt: now()
        })
        .where(
          and(
            eq(schema.pantryOrders.claimToken, hashClaimToken(token)),
            isNull(schema.pantryOrders.userId),
            eq(schema.pantryOrders.status, "paid")
          )
        );
    }

    // Wrong/expired token or already claimed: intake's empty state carries
    // the "Paid with a different email?" support escape hatch.
    return NextResponse.redirect(new URL("/pantry/intake", url));
  };
}

export const GET = createPantryClaimHandler();
