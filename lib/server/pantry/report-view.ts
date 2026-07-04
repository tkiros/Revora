import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { decryptField } from "../crypto";
import { schema, type Db } from "../db";
import type { PantryReport } from "./process";

export type ReportView =
  | { kind: "not_found" }
  | { kind: "processing" }
  | { kind: "ready"; report: PantryReport };

export async function loadReportForUser(
  db: Db,
  userId: string,
  orderId: string
): Promise<ReportView> {
  if (!z.string().uuid().safeParse(orderId).success) {
    return { kind: "not_found" };
  }
  const [order] = await db
    .select()
    .from(schema.pantryOrders)
    .where(
      and(
        eq(schema.pantryOrders.id, orderId),
        eq(schema.pantryOrders.userId, userId)
      )
    );
  if (!order || order.status === "canceled") {
    return { kind: "not_found" };
  }
  if (order.status !== "ready" || !order.reportCiphertext) {
    // The owner NEVER sees a 404 for an in-flight order (design spec).
    return { kind: "processing" };
  }
  return {
    kind: "ready",
    report: JSON.parse(decryptField(order.reportCiphertext)) as PantryReport
  };
}
