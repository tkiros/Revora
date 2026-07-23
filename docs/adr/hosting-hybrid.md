# ADR: Hosting — Vercel (app) + Railway (database)

**Date:** 2026-07-02 · **Status:** Accepted (owner decision) · **Phases:** P7+
**Supersedes:** the Database row of `docs/adr/stack.md` (Neon Postgres) — see
the superseded note left in that file.

## Decision

- **Vercel** hosts the Next.js app: pages, API routes, and the one remaining
  Vercel cron (`vercel.json` — `/api/cron/bai-weekly`, weekly). The hourly
  crons (`nudge`, `pantry-sweep`, `trial-precharge`, `stripe-reconcile`) moved to a Railway
  scheduler service (commit `eb3005e`; provisioning steps in
  `docs/runbooks/price-test.md`) because hourly cadence needs Vercel Pro.
- **Railway** hosts **Postgres** — plain Postgres over TCP, not Neon's HTTP
  driver — plus the `hourly-crons` scheduler above, and is the landing spot
  for any future heavy background work that does not fit a Vercel function.
- **Umami Cloud**, not Railway, is the current analytics deployment. See
  `docs/adr/analytics-umami.md`.

This is a hybrid, not a full migration off Vercel: request/response and the
weekly BAI cron stay on Vercel; the database and hourly scheduler run on
Railway. The scheduler's checked-in configuration is not proof that its live
deployment is healthy—fresh `/api/health` heartbeats are the release gate.

## Why

The owner chose Railway for the database over staying on Neon (§ project
decision log). Vercel remains the host for the app itself because the
edge-adjacent request handling and preview-deploy workflow depend on it.

## Connection approach

- Driver: `drizzle-orm/node-postgres` over a `pg` `Pool`
  (`lib/server/db/index.ts`), replacing the Neon HTTP driver
  (`@neondatabase/serverless` removed from `package.json`).
- Pool size: **`max: 3`** per Vercel function instance. Serverless functions
  scale horizontally, not by holding one big pool — a small per-instance
  cap avoids exhausting Railway's connection limit under concurrent
  invocations. **Revisit trigger:** if `/api/health`'s `db` probe starts
  flapping to `"error"` under load, or Railway reports connection-limit
  pressure, put **PgBouncer** (or Railway's own pooling add-on) in front of
  the database and point `DATABASE_URL` at the pooler instead of raising
  `max`.
- TLS: enabled for every host except `localhost`/`127.0.0.1` (local dev
  Postgres typically has no cert to offer; Railway requires TLS on its
  public TCP endpoint).
- The `Db` type consumed by all data-access code stays structural
  (`Pick<NodePgDatabase<typeof schema>, "select" | "insert" | "update" |
  "delete" | "query">`), unchanged in shape from the Neon-backed version —
  this is what lets `tests/helpers/test-db.ts` keep injecting a PGlite
  instance through the same type with zero test-code changes.

## Non-choices (rejected)

- **Staying on Neon**: superseded by the owner's explicit hybrid decision.
- **Moving the whole app to Railway**: Vercel's preview-deploy workflow and
  existing cron config are working infrastructure; only the database needed
  to move.
- **`pgbouncer` from day one**: premature at current scale (a single-digit
  number of Vercel function instances); adding it is a one-line
  `DATABASE_URL` swap when the revisit trigger above fires, not an
  architectural change.

## Human action required

The canonical production Railway Postgres instance is provisioned. Before
launch, provision an isolated preview database, verify the migration journal,
backup/PITR and a timed restore, and prove the live hourly scheduler produces
fresh heartbeats. See `docs/handoff/human-actions-required.md` (P7 section).
