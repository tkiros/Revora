import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { encryptField } from "../../../../lib/server/crypto";
import { getDb, schema, type Db } from "../../../../lib/server/db";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../../lib/server/session";

export const runtime = "nodejs";

// 160 = checkFood()'s FOOD_MAX_LENGTH — anything longer would be rejected
// by the judge later, so reject it at the door instead.
const ConfirmSchema = z
  .object({
    orderId: z.string().uuid(),
    items: z
      .array(
        z.object({
          name: z.string().trim().min(1).max(160),
          portion: z.string().trim().min(1).max(80).nullable().optional()
        })
      )
      .min(1)
      .max(40)
  })
  .strict();

type Deps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  now?: () => Date;
};

export function createPantryConfirmHandler(deps: Deps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const now = deps.now ?? (() => new Date());

  return async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    }

    let parsed;
    try {
      parsed = ConfirmSchema.safeParse(await request.json());
    } catch {
      parsed = ConfirmSchema.safeParse(null);
    }
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const input = parsed.data;

    const [order] = await db()
      .select()
      .from(schema.pantryOrders)
      .where(
        and(
          eq(schema.pantryOrders.id, input.orderId),
          eq(schema.pantryOrders.userId, session.userId)
        )
      );
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // AUD-021 (narrowed): the transition + delete + reinsert are ONE
    // transaction. A failure anywhere rolls the whole confirm back, so an
    // order can never be stranded `processing` with drafts deleted and no
    // confirmed items — this is a paid workflow, partial state costs money.
    // The conditional transition inside the transaction stays the
    // double-confirm guard: only ONE request wins awaiting_confirm →
    // processing; the loser's CAS matches zero rows and rolls back to a 409.
    const outcome = await db().transaction(async (tx) => {
      const transitioned = await tx
        .update(schema.pantryOrders)
        .set({ status: "processing", updatedAt: now() })
        .where(
          and(
            eq(schema.pantryOrders.id, order.id),
            eq(schema.pantryOrders.status, "awaiting_confirm")
          )
        )
        .returning();
      if (transitioned.length === 0) {
        return "already_confirmed" as const;
      }

      // The confirmed list REPLACES the drafts — what the buyer approved is
      // exactly what the judge will see (locked decision 1).
      await tx
        .delete(schema.pantryItems)
        .where(eq(schema.pantryItems.orderId, order.id));
      await tx.insert(schema.pantryItems).values(
        input.items.map((item, position) => ({
          orderId: order.id,
          position,
          nameCiphertext: encryptField(item.name),
          portionCiphertext: item.portion ? encryptField(item.portion) : null,
          source: "buyer" as const,
          status: "confirmed" as const,
          updatedAt: now()
        }))
      );
      return "ok" as const;
    });

    if (outcome === "already_confirmed") {
      return NextResponse.json(
        { error: "Already confirmed." },
        { status: 409 }
      );
    }

    return NextResponse.json({ ok: true });
  };
}

export const POST = createPantryConfirmHandler();
