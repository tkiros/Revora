#!/usr/bin/env node
// Baseline the drizzle migration journal on a database whose schema was
// applied via `drizzle-kit push` or by hand, so `drizzle-kit migrate`
// works from here on. Idempotent: skips entries already recorded.
//
// WARNING — this is the equivalent of `alembic stamp head`: it DECLARES the
// database to already match the last migration in drizzle/meta/_journal.json.
// It does not verify the schema. Only run it after confirming the target DB's
// schema is actually current; a wrongly baselined DB will silently skip the
// migrations it is missing.
//
// Usage: DATABASE_MIGRATION_URL=<owner-url> node scripts/baseline-drizzle-journal.mjs [--dry-run]
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import pg from 'pg';

const args = process.argv.slice(2);
const unknown = args.filter((a) => a !== '--dry-run');
if (unknown.length > 0) {
  console.error(`Unknown argument(s): ${unknown.join(' ')} (did you mean --dry-run?)`);
  process.exit(1);
}
const dry = args.includes('--dry-run');
const url = process.env.DATABASE_MIGRATION_URL;
if (!url) { console.error('DATABASE_MIGRATION_URL required'); process.exit(1); }

const journal = JSON.parse(readFileSync('drizzle/meta/_journal.json', 'utf8'));
const client = new pg.Client({ connectionString: url });
await client.connect();

const appTables = await client.query(
  "select count(*)::int as n from information_schema.tables where table_schema='public'"
);
if (appTables.rows[0].n === 0) {
  console.error('Refusing to baseline: database has no app tables (wrong database?).');
  await client.end(); process.exit(1);
}

const { rows: existing } = await client.query(
  "select hash from drizzle.__drizzle_migrations"
).catch(() => ({ rows: [] })); // table may not exist yet; dry-run must not create it
const seen = new Set(existing.map((r) => r.hash));

const pending = [];
for (const entry of journal.entries) {
  const sql = readFileSync(`drizzle/${entry.tag}.sql`, 'utf8');
  // hash matches drizzle-orm's migrator: sha256 of the raw migration file
  const hash = createHash('sha256').update(sql).digest('hex');
  if (seen.has(hash)) { console.log(`skip ${entry.tag} (already recorded)`); continue; }
  console.log(`${dry ? '[dry] would record' : 'record'} ${entry.tag} (created_at=${entry.when})`);
  pending.push({ hash, when: entry.when });
}

if (!dry && pending.length > 0) {
  // single transaction: a crash mid-run leaves no partial journal
  await client.query('BEGIN');
  try {
    await client.query('CREATE SCHEMA IF NOT EXISTS drizzle');
    await client.query(`CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY, hash text NOT NULL, created_at bigint)`);
    for (const p of pending) {
      await client.query(
        'INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)',
        [p.hash, p.when]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  }
}
console.log(`${dry ? '[dry] ' : ''}baselined ${pending.length} of ${journal.entries.length} entries`);
await client.end();
