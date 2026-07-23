# Database governance and release proof

The application and migration credentials have different jobs:

- `DATABASE_URL` is the Vercel runtime credential. It can read/write app rows
  but cannot create schemas or objects.
- `DATABASE_MIGRATION_URL` is the Railway owner credential. It is available
  only to the operator running migrations; never bind it to Vercel.

## One-time role split

Use the existing Railway owner as the migration role. Create a separate login
named `revora_app` with a generated password, then run the following as the
owner. Replace `railway_owner` with the actual owner role before executing the
`ALTER DEFAULT PRIVILEGES` statements; do not paste credentials into this file.

Run this block with `psql` (it uses `\gexec` to quote the provider-generated
database and owner-role identifiers safely):

```sql
BEGIN;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM revora_app;
SELECT format('REVOKE CREATE ON DATABASE %I FROM revora_app', current_database()) \gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO revora_app', current_database()) \gexec
GRANT USAGE ON SCHEMA public TO revora_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO revora_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO revora_app;
SELECT format(
  'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO revora_app',
  current_user
) \gexec
SELECT format(
  'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO revora_app',
  current_user
) \gexec
COMMIT;
```

Review the transaction before commit. Do not revoke the owner role or transfer
object ownership during this change.

## Migration sequence

1. Take/verify a provider backup and record its timestamp.
2. Export both URLs only in the operator shell. Confirm they target the same
   host/database and different usernames without printing passwords.
3. Run `npm run db:governance:check`. A pending migration makes
   `migrationJournalComplete` false; every other field must already be true.
4. Run `npm run db:migrate:production`. The command refuses missing credentials
   or the same username for runtime and migration roles.
5. Run `npm run db:governance:check` again. Every boolean must be true and the
   expected/recorded migration counts must match.
6. Deploy the application with only the restricted `DATABASE_URL`, then verify
   `/api/health` and one owner-scoped read/write/delete journey.

## Connection budget

Each Vercel instance defaults to at most three connections, with a five-second
connect timeout and ten-second idle timeout. `DATABASE_POOL_MAX` accepts only
`1..10`. Keep it at three until provider metrics show a reason to change it.

Record peak active connections, Railway's connection limit, and the maximum
simultaneous Vercel instances. If `instances × pool max` can approach 70% of the
provider limit, introduce a transaction pooler and repeat the full billing,
auth, and `FOR UPDATE` inbox tests against it; do not simply raise the pool cap.

## Evidence boundary

Checked-in migrations and passing PGlite tests prove source consistency only.
Launch evidence requires the post-migration governance check against the exact
production database plus provider backup/restore proof. Never put database URLs,
role names, query output containing user rows, or passwords in a handoff.
