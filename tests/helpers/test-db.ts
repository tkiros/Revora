import fs from "node:fs";
import path from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

import * as schema from "../../lib/server/db/schema";
import type { Db } from "../../lib/server/db";

/**
 * In-memory Postgres (PGlite) with the real generated migrations applied —
 * the same SQL that runs against Neon. Data-access code receives this
 * through the Db type and cannot tell the difference.
 */
export async function createTestDb(): Promise<{
  db: Db;
  raw: PGlite;
  close(): Promise<void>;
}> {
  const client = new PGlite();
  const migrationsDir = path.join(process.cwd(), "drizzle");
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of migrationFiles) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    for (const statement of sql.split("--> statement-breakpoint")) {
      await client.exec(statement);
    }
  }

  const db = drizzle(client, { schema }) as unknown as Db;

  return {
    db,
    raw: client,
    close: () => client.close()
  };
}
