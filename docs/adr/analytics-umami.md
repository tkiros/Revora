# ADR: Analytics — Umami, not Plausible

**Date:** 2026-07-02 · **Status:** Accepted (owner decision) · **Phases:** P7+
**Supersedes:** the Analytics row of `docs/adr/stack.md` (Plausible) — see
the superseded note left in that file.
**Amended 2026-07-22:** production uses Umami Cloud. Self-hosting remains a
possible later migration, not current infrastructure or a launch requirement.

## Decision

Use **Umami Cloud** as the current analytics vendor instead of Plausible.
Everywhere the earlier plan text says "Plausible," read "Umami." The typed
event contract is deployment-independent, so a later move to a self-hosted
Umami instance would only change the configured script/ingest origins.

The event model is unchanged from the original plan: a **typed, closed,
no-PII event allowlist** (`lib/client/analytics.ts`) is the only thing that
ever reaches the vendor. `track()` calls `window.umami.track(name, props)`;
every prop is a bounded enum, never free text — enforced by
`tests/unit/client/analytics.test.ts`, including a static source scan for
the specific field names (A1C, meal text, email, etc.) this module must
never reference.

## Why Umami over Plausible

- **Cloud production today, self-hostable later** — production currently loads
  `https://cloud.umami.is/script.js` and posts to Umami's cloud gateway. A
  self-hosted deployment remains portable, but it is not part of the current
  Railway inventory.
- **No cookie banner needed** — like Plausible, Umami's default tracking is
  cookieless, which matters for a health-adjacent app where a consent
  banner is friction the product doesn't need for the US launch.
- **Event API compatible with a typed allowlist** — `window.umami.track(name,
  props)` maps directly onto the `AnalyticsEvent` discriminated union
  already designed for Plausible's custom-event API; the swap changed the
  script tag and the client call, not the privacy model.

## Wiring

- `app/layout.tsx` renders `<Script src={NEXT_PUBLIC_UMAMI_SRC}
  data-website-id={NEXT_PUBLIC_UMAMI_WEBSITE_ID} defer />` **only when both**
  env vars are set. Absent in dev/test (including Playwright, which sets
  neither) → no script tag renders, and `track()` no-ops because
  `window.umami` is never defined.
- Wired call sites (client-only; see task report for the full list and any
  deliberately-skipped surfaces): check completion, onboarding completion,
  first-sign-in profile save, paywall render, subscribe CTA click,
  post-checkout landing, and account-deletion completion.

## Non-choices (rejected)

- **Plausible**: superseded by the owner's explicit vendor decision (Umami
  over Plausible); the original plan's privacy rationale (cookieless, no
  consent banner) carries over unchanged.
- **Google Analytics / PostHog default config**: rejected in the original
  stack ADR for PII risk in a health-adjacent app; nothing about the Umami
  swap changes that reasoning.
- **A server-side event for `nudge_sent`**: Umami here is client-script
  based; hacking a server-to-Umami call for the one cron-side event
  (`nudge_sent`) was rejected as scope creep for this task. Send-counts come
  from cron logs / the `/api/health` cron-heartbeat probe for now — see
  `docs/handoff/human-actions-required.md`.

## Human action required

Keep `NEXT_PUBLIC_UMAMI_SRC`, `NEXT_PUBLIC_UMAMI_WEBSITE_ID`, and (only when
needed) `NEXT_PUBLIC_UMAMI_HOST_URL` correct in Vercel. Before launch, prove one
allowlisted browser event appears exactly once in the intended Umami Cloud
website and that CSP permits both the script and ingest origins. See
`docs/handoff/human-actions-required.md` (P7 section).
