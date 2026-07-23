# Blocked and open gates

## Local gate

- No confirmed local source/test blocker remains on `f8fa488c6da1ecf956082924394aba2e287903d1`.
- I-23's next-hour retry defect is closed locally with explicit bounded retry/lease state and the original next-hour assertion intact.
- The complete final gate is green except for 12 explicit private-Blob/live-judge Pantry browser skips. Those skips are external provisioning/evidence gates and are not counted as passes.

## Observed provider-side test residue

- Before the provider-isolation harness was committed, an optimized local browser run loaded the existing Upstash variables from `.env` and consumed the local test identity's `support_ip` budget, producing a real `429` on the sixth synthetic support request.
- No credential value was printed. The synthetic mailbox prevented Resend delivery; no Stripe, model, Blob, Sentry, or Umami call was part of that focused run.
- The rate-limit entry has a 24-hour sliding-window expiry and is keyed to the local test request identity, so no production user identity was used. The exact provider key was not read or deleted.
- Commit `6d77d20` prevents recurrence by blanking every provider credential before Next loads env files and by refusing non-loopback databases.

## External and approval-gated work

- Railway scheduler configuration: plan must be refreshed; apply requires explicit approval under the project skill.
- Vercel/private Blob/model deployment: requires provisioned nonproduction and production resources plus exact-SHA runtime proof.
- Resend/DNS/inbox/webhooks: requires provider mutation, DNS propagation, approved synthetic identities, and provider receipt.
- Stripe: requires a test-mode endpoint and controlled lifecycle; no real charge is authorized.
- Database roles/migrations/backup/PITR/restore: requires a backup, provider owner coordination, isolated restore, and live governance evidence.
- GitHub/Vercel promotion controls: require repository/environment settings and a real protected green run.
- Sentry/Umami/uptime: require current dashboard receipt, scrub proof, alerts, ownership, and acknowledgement.
- Orphan Railway/Vercel/GitHub resources: deletion is destructive and requires exact binding/data verification plus explicit approval.
- Legal/counsel and real clinical/content approval remain separate external launch gates.

No provider, DNS, dashboard, merged-revision, production-deployment, legal, clinical, or destructive-resource gate is called fixed without direct evidence.
