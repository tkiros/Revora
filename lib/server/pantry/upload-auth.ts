import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { schema, type Db } from "../db";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const UPLOADABLE_STATUSES = ["claimed", "submitted"] as const;

export type UploadTokenOptions = {
  allowedContentTypes: string[];
  maximumSizeInBytes: number;
  addRandomSuffix: true;
  tokenPayload: string;
};

/** Pure token-authorization logic, unit-testable without Blob network calls. */
export async function authorizePantryUpload(
  db: Db,
  session: { userId: string; email: string },
  pathname: string,
  clientPayload: string | null | undefined
): Promise<UploadTokenOptions> {
  const parsedId = z.string().uuid().safeParse(clientPayload);
  if (!parsedId.success) {
    throw new Error("No open pantry order for this upload.");
  }

  const [order] = await db
    .select()
    .from(schema.pantryOrders)
    .where(
      and(
        eq(schema.pantryOrders.id, parsedId.data),
        eq(schema.pantryOrders.userId, session.userId),
        inArray(schema.pantryOrders.status, [...UPLOADABLE_STATUSES])
      )
    );
  if (!order) {
    throw new Error("No open pantry order for this upload.");
  }
  if (pathname !== `pantry/${order.id}/photo.jpg`) {
    throw new Error("Invalid pantry photo pathname.");
  }

  return {
    allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
    maximumSizeInBytes: MAX_PHOTO_BYTES,
    addRandomSuffix: true,
    tokenPayload: order.id
  };
}
