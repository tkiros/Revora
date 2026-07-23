#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";

import pg from "pg";

const runtimeUrl = process.env.DATABASE_URL?.trim();
const migrationUrl = process.env.DATABASE_MIGRATION_URL?.trim();

if (!runtimeUrl || !migrationUrl) {
  console.error(
    "DATABASE_URL and DATABASE_MIGRATION_URL are required; values are never printed.",
  );
  process.exit(1);
}

const connectionConfig = (connectionString) => ({
  connectionString,
  connectionTimeoutMillis: 5_000,
  query_timeout: 5_000,
});
const runtime = new pg.Client(connectionConfig(runtimeUrl));
const migrator = new pg.Client(connectionConfig(migrationUrl));

try {
  await Promise.all([runtime.connect(), migrator.connect()]);

  const [runtimeProbe, migratorProbe, migrationFiles, recorded] =
    await Promise.all([
      runtime.query(`
        SELECT
          current_user,
          has_schema_privilege(current_user, 'public', 'CREATE') AS can_create_schema,
          has_database_privilege(current_user, current_database(), 'CREATE') AS can_create_database,
          COALESCE(bool_and(has_table_privilege(
            current_user,
            format('%I.%I', table_schema, table_name),
            'SELECT,INSERT,UPDATE,DELETE'
          )), false) AS has_runtime_dml
        FROM information_schema.tables
        WHERE table_schema = 'public'
        GROUP BY current_user
      `),
      migrator.query(`
        SELECT
          current_user,
          has_schema_privilege(current_user, 'public', 'CREATE') AS can_migrate,
          to_regclass('drizzle.__drizzle_migrations') IS NOT NULL AS journal_present
      `),
      readdir("drizzle"),
      migrator
        .query("SELECT hash FROM drizzle.__drizzle_migrations")
        .catch(() => ({ rows: [] })),
    ]);

  const sqlFiles = migrationFiles.filter((file) => file.endsWith(".sql")).sort();
  const expectedHashes = await Promise.all(
    sqlFiles.map(async (file) =>
      createHash("sha256")
        .update(await readFile(`drizzle/${file}`, "utf8"))
        .digest("hex"),
    ),
  );
  const recordedHashes = new Set(recorded.rows.map((row) => row.hash));
  const runtimeState = runtimeProbe.rows[0];
  const migrationState = migratorProbe.rows[0];
  const result = {
    rolesDistinct:
      Boolean(runtimeState?.current_user) &&
      runtimeState.current_user !== migrationState?.current_user,
    runtimeCannotCreate:
      runtimeState?.can_create_schema === false &&
      runtimeState?.can_create_database === false,
    runtimeDmlReady: runtimeState?.has_runtime_dml === true,
    migratorCanCreate: migrationState?.can_migrate === true,
    migrationJournalPresent: migrationState?.journal_present === true,
    migrationJournalComplete: expectedHashes.every((hash) =>
      recordedHashes.has(hash),
    ),
    expectedMigrationCount: expectedHashes.length,
    recordedExpectedMigrationCount: expectedHashes.filter((hash) =>
      recordedHashes.has(hash),
    ).length,
  };

  console.log(JSON.stringify(result, null, 2));
  if (Object.values(result).some((value) => value === false)) {
    process.exitCode = 1;
  }
} catch (error) {
  console.error(
    JSON.stringify({ ok: false, errorClass: error?.name ?? "UnknownError" }),
  );
  process.exitCode = 1;
} finally {
  await Promise.allSettled([runtime.end(), migrator.end()]);
}
