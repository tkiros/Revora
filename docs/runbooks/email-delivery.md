# Resend delivery and suppression runbook

Revora treats a successful `POST /emails` response as **accepted**, not
delivered. Application and magic-link sends write a PII-minimized attempt to
`email_delivery_attempts`; signed Resend events advance that row. Recipient
addresses, subjects, bodies, support text, and magic-link tokens are never
stored in the delivery tables.

## Provider setup

1. Deploy the migration that creates `email_delivery_attempts` and
   `email_suppressions`.
2. In Resend, create an HTTPS webhook at
   `https://revora.plus/api/webhooks/resend`.
3. Subscribe it to `email.sent`, `email.delivered`,
   `email.delivery_delayed`, `email.bounced`, `email.complained`,
   `email.suppressed`, and `email.failed`.
4. Store that endpoint's signing secret as `RESEND_WEBHOOK_SECRET` in the
   production Vercel environment, then redeploy. Do not reuse the API key.
5. Keep `AUTH_SECRET` stable: it HMACs recipient addresses for local
   correlation and suppression without storing them.

The route verifies the raw body with Resend's SDK and the `svix-id`,
`svix-timestamp`, and `svix-signature` headers. Missing configuration returns
503, a missing/bad signature returns 400, and a database failure returns 500 so
Resend retries. Payloads and recipients are never logged or echoed.

## State ownership

| State | Meaning | Owner action |
| --- | --- | --- |
| `pending` | Local attempt exists; provider acceptance is not confirmed | The caller's durable workflow retries with the same hashed idempotency key |
| `accepted` / `sent` | Resend accepted/is attempting the message | Wait for a terminal/delayed event; do not claim delivery |
| `delayed` | Receiving server deferred the message | Observe for a later delivered/failed event; do not blind-resend |
| `delivered` | Recipient mail server accepted it | No action; this still does not prove inbox placement or reading |
| `rate_limited` / `transport_failed` | Request did not receive provider acceptance | The owning Pantry/trial/support/auth workflow retries; Resend's 24-hour idempotency key prevents duplicate acceptance of the same payload |
| `rejected` / `failed` | Configuration, validation, quota, or provider failure | Email owner inspects the bounded error code and Resend dashboard; fix configuration before a new attempt |
| `bounced` / `complained` / `suppressed` | Permanent/reputation-sensitive failure | Recipient HMAC is added to `email_suppressions`; automated sends stop until an owner validates and deliberately clears the suppression |

Delivery-attempt rows expire after 30 days during sends and webhook handling.
Suppressions remain because forgetting a hard bounce or complaint would damage
sender reputation; they contain only an HMAC, reason enum, and provider id.

## Activation proof

Use provider-approved synthetic recipients, never a real customer. Capture all
of the following before calling delivery operational:

- bad signature -> 400 and no row;
- `email.sent` -> `sent`, then delivered -> `delivered`;
- delayed followed by delivered does not regress;
- permanent bounce -> `bounced` plus a suppression, and a later send is blocked
  before the provider call;
- complained and provider-suppressed events behave the same way;
- API 429 -> `rate_limited` with no raw provider message retained;
- one magic link reaches both a direct inbox and the approved forwarding path;
- Resend's domain screen confirms DKIM/SPF and the required Return-Path MX.

Provider dashboard receipt, DNS publication, and real-inbox proof are external
gates. Local tests or a deployed 200 response do not close them.
