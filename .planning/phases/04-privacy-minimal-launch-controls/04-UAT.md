---
status: testing
phase: 04-privacy-minimal-launch-controls
source: [04-VERIFICATION.md]
started: 2026-06-19T02:20:00Z
updated: 2026-06-19T02:20:00Z
---

## Current Test

number: 1
name: Vercel build gate (`npx vercel build` after `vercel login`)
expected: |
  Build completes without errors; output includes /api/check, /api/health, and middleware (Proxy).
awaiting: user response

## Tests

### 1. Vercel build gate (`npx vercel build` after `vercel login`)
expected: After `vercel login`, `npx vercel build` completes without errors; output includes /api/check, /api/health, and the middleware (Proxy). (`npm run build` already passes and produces the correct route manifest; this confirms the auth-gated Vercel pipeline.)
result: [pending]

### 2. Edge Config setup and kill-switch drill
expected: |
  In Vercel Dashboard → Storage → Edge Config, create a store with keys launch_mode="normal",
  public_checks_enabled=true, incident_message="Revora checks are temporarily paused."; set
  EDGE_CONFIG=ecfg_<string> in Preview and Production scopes. Then:
  (a) Set public_checks_enabled=false → GET /api/health returns {"ok":false,"launch":"paused","launchMode":"paused"}
      and POST /api/check returns 503 with friendly pause copy and no stack traces.
  (b) Restore public_checks_enabled=true → /api/health returns {"ok":true,"launch":"ready"}.
  Kill switch should activate/deactivate in under 30s without a redeploy.
result: [pending]

### 3. WAF rate-limit rule publication
expected: |
  In Vercel Dashboard → Security → WAF, publish rule revora-check-rate-limit on path /api/check,
  limit 10 requests / 10 minutes / IP, action Block (429). Sending 11 rapid POST /api/check requests
  from one IP returns 429 on the 11th; first 10 succeed. Record rule ID + publication timestamp.
result: [pending]

### 4. Rollback drill (vercel login + live Production deployment)
expected: |
  With Vercel CLI authenticated and a Production deployment active, run:
  vercel rollback → vercel rollback status (reaches COMPLETE) →
  vercel logs --environment production --status-code 5xx --since 5m (5xx at baseline) →
  GET /api/health ({"ok":true,"launch":"ready","launchMode":"normal"}) →
  one synthetic POST /api/check (returns kind:result or kind:retry).
  Rollback is not confirmed as recovery until all five post-rollback checks pass.
  Record evidence in the docs/ops/launch-controls.md §5 SETUP_BLOCKED slots.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
