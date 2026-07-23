import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdmin } from "../../../../lib/server/admin";
import { getDb, schema, type Db } from "../../../../lib/server/db";
import {
  sendEmail,
  type SendEmailInput,
  type SendEmailResult
} from "../../../../lib/server/email";
import { generateClaimToken } from "../../../../lib/server/pantry/claims";
import { intakeEmailText } from "../../../../lib/server/pantry/emails";
import {
  defaultProcessDeps,
  deliverReport,
  processPantryOrder,
  type ProcessDeps
} from "../../../../lib/server/pantry/process";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../../lib/server/session";

export const runtime = "nodejs";
export const maxDuration = 300; // rerun judges inline

const ActionSchema = z
  .object({
    orderId: z.string().uuid(),
    action: z.enum(["resend_intake", "resend_report", "mark_manual", "rerun"])
  })
  .strict();

type Deps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  email?: { send: (input: SendEmailInput) => Promise<SendEmailResult> };
  processOrder?: typeof processPantryOrder;
  // Injectable so tests never eagerly construct the OpenAI client
  // (defaultProcessDeps builds the live model, which requires OPENAI_API_KEY).
  makeProcessDeps?: (db: Db) => ProcessDeps;
  now?: () => Date;
};

export function createAdminPantryHandler(deps: Deps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const email = deps.email ?? { send: sendEmail };
  const processOrder = deps.processOrder ?? processPantryOrder;
  const makeProcessDeps = deps.makeProcessDeps ?? defaultProcessDeps;
  const now = deps.now ?? (() => new Date());

  return async function POST(request: Request) {
    const session = await getSession();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    let parsed;
    try {
      parsed = ActionSchema.safeParse(await request.json());
    } catch {
      parsed = ActionSchema.safeParse(null);
    }
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const { orderId, action } = parsed.data;

    const [order] = await db()
      .select()
      .from(schema.pantryOrders)
      .where(eq(schema.pantryOrders.id, orderId));
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const processDeps = { ...makeProcessDeps(db()), email, now };

    if (action === "resend_intake") {
      const { token, tokenHash } = generateClaimToken();
      await db()
        .update(schema.pantryOrders)
        .set({ claimToken: tokenHash, updatedAt: now() })
        .where(eq(schema.pantryOrders.id, orderId));
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const result = await email.send({
        to: order.email,
        ...intakeEmailText(appUrl, token),
        category: "pantry_intake",
        idempotencyKey: `admin-pantry-intake/${order.id}/${tokenHash}`
      });
      if (result.ok) {
        await db()
          .update(schema.pantryOrders)
          .set({ intakeEmailSentAt: now(), updatedAt: now() })
          .where(eq(schema.pantryOrders.id, orderId));
      }
      return NextResponse.json({ ok: result.ok });
    }

    if (action === "resend_report") {
      const ok = await deliverReport(
        processDeps,
        { id: order.id, email: order.email },
        `admin-pantry-report/${order.id}/${now().toISOString()}`
      );
      return NextResponse.json({ ok });
    }

    if (action === "mark_manual") {
      await db()
        .update(schema.pantryOrders)
        .set({ status: "needs_manual", processingLeaseUntil: null, updatedAt: now() })
        .where(eq(schema.pantryOrders.id, orderId));
      return NextResponse.json({ ok: true });
    }

    // rerun: put failed items back in the queue and process inline. Only
    // `failed` rows are reset — already-`judged` items keep their result so
    // rerun never re-judges (and re-bills for) completed work.
    await db()
      .update(schema.pantryItems)
      .set({ status: "confirmed", attempts: 0, updatedAt: now() })
      .where(and(eq(schema.pantryItems.orderId, orderId), eq(schema.pantryItems.status, "failed")));
    await db()
      .update(schema.pantryOrders)
      .set({ status: "processing", processingLeaseUntil: null, updatedAt: now() })
      .where(eq(schema.pantryOrders.id, orderId));
    const result = await processOrder(processDeps, orderId);
    return NextResponse.json({ ok: true, ...result });
  };
}

export const POST = createAdminPantryHandler();
