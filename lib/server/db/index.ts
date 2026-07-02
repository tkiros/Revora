import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export type Db = Pick<
  NeonHttpDatabase<typeof schema>,
  "select" | "insert" | "update" | "delete" | "query"
>;

let db: Db | null = null;

/**
 * Production DB handle (Neon HTTP driver — fetch-based, serverless-native).
 * Tests inject a PGlite-backed drizzle instance through the same Db type, so
 * data-access code never knows which driver it runs on.
 */
export function getDb(): Db {
  if (!db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set.");
    }

    db = drizzle(neon(url), { schema });
  }

  return db;
}

export { schema };
