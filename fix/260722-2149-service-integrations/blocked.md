# Blocked and open gates

## Local gate

- No confirmed local source/test blocker remains on runtime SHA `6215b14b0ddc1ddb34733011756dd06b4e93e322`.
- I-23's next-hour retry defect is closed locally with explicit bounded retry/lease state and the original next-hour assertion intact.
- The complete local gate and GitHub Actions run `30003920371` are green: build/typecheck/lint/contract/Drizzle; 1,974 tests passed; and 225 Playwright cases passed. The 12 explicit private-Blob/live-judge Pantry skips are external provisioning/evidence gates and are not counted as passes.

## Observed provider-side test residue

- Before the provider-isolation harness was committed, an optimized local browser run loaded the existing Upstash variables from `.env` and consumed the local test identity's `support_ip` budget, producing a real `429` on the sixth synthetic support request.
- No credential value was printed. The synthetic mailbox prevented Resend delivery; no Stripe, model, Blob, Sentry, or Umami call was part of that focused run.
- The rate-limit entry has a 24-hour sliding-window expiry and is keyed to the local test request identity, so no production user identity was used. The exact provider key was not read or deleted.
- Commit `6d77d20` prevents recurrence by blanking every provider credential before Next loads env files and by refusing non-loopback databases.

## External and approval-gated work

- GitHub promotion: PR #35 has no review. The private-repository plan returns `403` for branch protection, rulesets, code scanning, and secret scanning; all five environments have no protection rules and allow admin bypass. A green run exists, but an unreviewed/red revision is not demonstrably blocked.
- Railway scheduler: the refreshed plan is `0 add, 4 change, 0 destroy`; apply still requires explicit approval under the project skill. The live service remains the permissive curl-image runner.
- Production Vercel: production remains SHA `fc8e9fa164bf942ec7b50d14776c7fefa252d3bf`. `/api/health/live` and `/.well-known/security.txt` are `404`, while legacy `/api/health` returns `200/ok:true` with four stale jobs.
- Private Blob/model: production has the legacy public Blob binding but no `PANTRY_BLOB_READ_WRITE_TOKEN`; it also has `OPENAI_BASE_URL` present even though remediated production source rejects any non-empty value. Provision/ownership/config decisions and live synthetic proof are required.
- Resend/DNS/inbox/webhooks: the locally authenticated Resend account reports `contact.revora.plus` verified and zero webhooks. Public DNS has no MX at `send.contact.revora.plus`; direct/forwarded inbox, signed webhook, suppression, and recovery receipts remain unproven.
- Stripe: the account has zero test-mode webhook endpoints; the controlled lifecycle has not run. No real charge is authorized.
- Database: live main Postgres has 20 public application tables plus the Drizzle journal, about 31 estimated rows, and 16 of 18 committed migrations. The inspected credential is superuser/owner; restricted runtime-role proof, migrations 0016–0017, backup/PITR, connection pressure, and isolated restore remain open.
- Preview isolation: the exact-SHA Vercel preview is real, but it has only preview Sentry/Umami bindings rather than isolated DB, Stripe, Resend, private Blob, model, Upstash, and push resources.
- Sentry/Umami/uptime: exact-preview Sentry receipt, scrubbing, release binding, and alert trigger are proven. Email acknowledgement, server canary, ownership rules, cron monitors, Umami dashboard receipt/blackout alert, and readiness alert/recovery are not.
- Orphan Railway/Vercel/GitHub resources: deletion is destructive and requires exact binding/data verification plus explicit approval.
- Legal/counsel and real clinical/content approval remain separate external launch gates.

No provider, DNS, dashboard, merged-revision, production-deployment, legal, clinical, or destructive-resource gate is called fixed without direct evidence.
