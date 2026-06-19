# Revora Launch Controls — Operator Runbook

This document describes the abuse-cost thresholds, kill-switch procedures,
WAF configuration, Edge Config setup, and rollback steps for Revora's
public-check path.

Rollback is **not** recovery until post-rollback health, logs, and one
synthetic public-check verification are complete. Each step below includes
an evidence slot — mark it `SETUP_BLOCKED` if CLI or provider auth is
unavailable.

---

## 1. Threshold Table

| Signal | Value | Response |
|--------|-------|----------|
| WAF rate limit (Vercel WAF) | 10 requests / 10 minutes / IP on `/api/check` | Vercel blocks the request; client sees friendly 429 |
| Operator cost gate | 2,000 checks / 24h (aggregate across IPs) | Operator sets `public_checks_enabled = false` in Edge Config |
| Harmful-guidance incident | Any SAFE classification for a high-risk food | Operator sets `launch_mode = paused` and reviews model outputs |
| Provider-failure spike | Repeated provider errors (`check_failed` events) | Operator sets `launch_mode = paused` until provider recovers |

No durable counter is built into the app. Operators read the aggregate
from Vercel logs and act manually. Upstash, Redis, and client-only
throttling are explicitly out of scope for this MVP.

---

## 2. Edge Config Setup

### 2.1 Required keys

| Key | Type | Default when absent | Effect |
|-----|------|---------------------|--------|
| `launch_mode` | `"normal"` \| `"paused"` | `"normal"` | `"paused"` activates the kill switch |
| `public_checks_enabled` | `boolean` | `true` | `false` blocks all public checks before model spend |
| `incident_message` | `string` | `"Revora checks are temporarily paused. Please try again later."` | Copy shown to users during a pause |

### 2.2 Edge Config connection string

```
EDGE_CONFIG=ecfg_<your_connection_string>
```

Add `EDGE_CONFIG` to Vercel Project → Settings → Environment Variables for
**Preview** and **Production** scopes only. Do not expose it client-side.

Evidence slot: `SETUP_BLOCKED` until connection string is obtained.

### 2.3 Pause drill (kill switch)

```bash
# Via Vercel Dashboard → Storage → Edge Config → Edit
# Set public_checks_enabled = false (or launch_mode = "paused")
# Optionally set incident_message = "We're paused briefly — please check back soon."

# Verify the kill switch is active:
curl https://your-domain.com/api/health
# Expected: {"ok":false,"environment":"production","launch":"paused","launchMode":"paused"}
```

Evidence slot: `SETUP_BLOCKED` until Edge Config store is created.

### 2.4 Restore drill

```bash
# Via Vercel Dashboard → Storage → Edge Config → Edit
# Set public_checks_enabled = true
# Set launch_mode = "normal"
# Clear or reset incident_message

# Verify restore:
curl https://your-domain.com/api/health
# Expected: {"ok":true,"environment":"production","launch":"ready","launchMode":"normal"}
```

---

## 3. WAF Rule (Rate Limit)

### 3.1 Rule configuration

| Field | Value |
|-------|-------|
| Rule name | `revora-check-rate-limit` |
| Path matcher | `/api/check` |
| Limit | 10 requests / 10 minutes / IP |
| Action | Block (return 429) |
| Publish state | `published` |

### 3.2 How to publish

1. Open Vercel Dashboard → Security → WAF.
2. Create a new rate-limit rule with the values above.
3. Publish the rule.
4. Evidence: Record the rule ID and publication timestamp below.

Evidence slot: `SETUP_BLOCKED` until WAF is accessible.

### 3.3 Verification (after publishing)

```bash
# Send 11 rapid requests from the same IP to confirm blocking:
for i in $(seq 1 11); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST https://your-domain.com/api/check \
    -H 'Content-Type: application/json' \
    -d '{"food":"apple","a1c":"6.1"}'
done
# The 11th request should return 429.
```

Evidence slot: `SETUP_BLOCKED` until WAF rule is published.

---

## 4. Preview Deploy Checklist

Before promoting to Production, collect the following evidence:

- [ ] `/api/health` returns `{"ok":true,"environment":"preview","launch":"ready","launchMode":"normal"}` on the Preview URL.
- [ ] Pause drill: set `public_checks_enabled = false` in Edge Config → verify `/api/check` returns 503 with friendly pause copy, no stack traces.
- [ ] Restore drill: set `public_checks_enabled = true` → verify `/api/check` accepts a check again.
- [ ] WAF rate-limit rule name, path, limit, and publish state recorded.
- [ ] `OPENAI_API_KEY` is set in the Preview environment.
- [ ] `EDGE_CONFIG` is set in the Preview environment.

---

## 5. Rollback Procedure

> Rollback is **not** recovery until steps 5.3–5.5 all pass.

### 5.1 Trigger rollback

```bash
vercel rollback
```

Record the deployment ID returned. Evidence slot: `SETUP_BLOCKED` if Vercel CLI is not authenticated.

### 5.2 Monitor rollback status

```bash
vercel rollback status
```

Wait until status is `COMPLETE` before proceeding.

### 5.3 Check error logs after rollback

```bash
vercel logs --environment production --status-code 5xx --since 5m
```

Confirm the 5xx rate has returned to baseline. Evidence slot: `SETUP_BLOCKED` if Vercel CLI is not authenticated.

### 5.4 Health probe verification

```bash
curl https://your-domain.com/api/health
```

Expected response after successful rollback:

```json
{"ok":true,"environment":"production","launch":"ready","launchMode":"normal"}
```

If `/api/health` reports `{"ok":false,...}` after rollback, the environment
variables or Edge Config keys may not match the rolled-back deployment.

### 5.5 Synthetic public-check verification

```bash
curl -s -X POST https://your-domain.com/api/check \
  -H 'Content-Type: application/json' \
  -d '{"food":"apple","a1c":"6.1"}' | jq .kind
```

Expected: `"result"` (or `"retry"` on transient model errors).
If this returns a 503 or pause copy, Edge Config `public_checks_enabled` may
still be set to `false` — toggle it back to `true` and re-run the probe.

---

## 6. Non-Production Test Override

For local development and CI smoke tests, set:

```bash
REVORA_LAUNCH_MODE_OVERRIDE=paused
```

This overrides launch mode to `paused` without touching live Edge Config.
The override is **ignored** in `production` and `VERCEL_ENV=production`
environments to prevent accidental pauses.

---

## 7. public_checks_enabled Reference

The `public_checks_enabled` Edge Config key is the primary kill switch.
When set to `false`, the middleware intercepts requests to `/api/check`
and returns a 503 pause response before any OpenAI model call is made.

This ensures:
- No model spend during a pause incident.
- No raw food text, prompt text, or stack traces in the pause response.
- The public page remains accessible; only the check path is blocked.
