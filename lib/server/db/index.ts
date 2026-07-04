import { Pool } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

export type Db = Pick<
  NodePgDatabase<typeof schema>,
  "select" | "insert" | "update" | "delete" | "query"
>;

let db: Db | null = null;

/**
 * Production DB handle (node-postgres — plain TCP driver, Railway Postgres
 * compatible; docs/adr/hosting-hybrid.md). Tests inject a PGlite-backed
 * drizzle instance through the same Db type, so data-access code never knows
 * which driver it runs on.
 *
 * Pool stays small (max 3) because each Vercel function instance gets its
 * own pool — see the ADR for the pgbouncer/pooling revisit trigger. TLS
 * turns on for every host except localhost (Railway requires it; local dev
 * Postgres typically doesn't have a cert to offer).
 */
export function getDb(): Db {
  if (!db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set.");
    }

    const pool = new Pool({
      connectionString: url,
      max: 3,
      ssl: isLocalhost(url) ? undefined : { rejectUnauthorized: true }
    });

    db = drizzle(pool, { schema });
  }

  return db;
}

function isLocalhost(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export { schema };
