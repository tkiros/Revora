import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

import {
  getEntitlement,
  countChecksToday,
  FREE_DAILY_CHECKS
} from "../../../lib/server/entitlement";
import { fetchPlaySubscription } from "../../../lib/server/play-api";
import { getDb, schema, type Db } from "../../../lib/server/db";
import {
  getSessionInfo,
  type SessionInfo
} from "../../../lib/server/session";
import { generateClaimToken } from "../../../lib/server/pantry/claims";
import { intakeEmailText } from "../../../lib/server/pantry/emails";
import {
  resolveAnnualPrice,
  resolvePriceVariant
} from "../../../lib/server/pricing";
import { sendEmail, type SendEmailResult } from "../../../lib/server/email";
import {
  emitBillingEvent,
  type BillingTelemetryEvent
} from "../../../lib/server/billing/telemetry";
import { verifyCancelToken } from "../../../lib/server/billing/cancel-token";
import { paymentFailedEmailText } from "../../../lib/server/billing/emails";
import { deleteOrderBlobs } from "../../../lib/server/blob";
import { timingSafeEqualSecret } from "../../../lib/server/timing-safe";
import { checkEmailCooldown } from "../../../lib/revora/rate-limit";
import { TERMS_VERSION } from "../../../lib/legal/terms";

/**
 * Billing (plan 4D / docs/adr/billing.md): Play Billing verified server-side
 * against the Play Developer API; Stripe web fallback; one `subscriptions`
 * table; entitlement read separately (lib/server/entitlement.ts).
 */

export type BillingDeps = {
  db?: () => Db;
  getSession?: () => Promise<SessionInfo>;
  playLookup?: typeof fetchPlaySubscription;
  stripeClient?: () => Stripe;
  now?: () => Date;
  email?: PantryEmailSender;
  env?: NodeJS.ProcessEnv;
};

export type PantryEmailSender = {
  send: (input: {
    to: string;
    subject: string;
    text: string;
  }) => Promise<SendEmailResult>;
};

const PlayVerifySchema = z
  .object({
    purchaseToken: z.string().trim().min(1).max(512),
    termsAccepted: z.literal(true),
    termsVersion: z.literal(TERMS_VERSION)
  })
  .strict();

function unauthorized() {
  return NextResponse.json({ error: "Sign in first." }, { status: 401 });
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

let stripeSingleton: Stripe | null = null;
function defaultStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  stripeSingleton ??= new Stripe(key);
  return stripeSingleton;
}

/**
 * W-04 — the legal gate. /terms still renders counsel placeholders, and taking
 * money against a placeholder contract is the one failure we cannot undo with a
 * hotfix. So NO paid-checkout entry point opens until the deploy explicitly
 * declares the terms final: LEGAL_TERMS_FINAL=1.
 *
 * Default-blocked on purpose (env unset ⇒ 503): forgetting the flag can only
 * ever cost a sale, while forgetting the reverse gate would take real money.
 * The failure is loud in staging and impossible to miss in QA.
 *
 * Deliberately NOT applied to the portal or the cancel paths — an existing
 * subscriber must ALWAYS be able to manage and leave, terms or no terms.
 */
function checkoutGate(env: NodeJS.ProcessEnv = process.env): NextResponse | null {
  if (env.LEGAL_TERMS_FINAL === "1") {
    return null;
  }
  return NextResponse.json(
    { error: "Checkout is temporarily unavailable. Please try again soon." },
    { status: 503 }
  );
}

// ── GET /api/entitlement ────────────────────────────────────────────────────

export function createEntitlementHandler(deps: BillingDeps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const playLookup = deps.playLookup ?? fetchPlaySubscription;
  const now = deps.now ?? (() => new Date());

  return async function GET() {
    const session = await getSession();
    if (!session) {
      return unauthorized();
    }

    const entitlement = await getEntitlement(db(), session.userId, {
      now,
      refreshPlaySubscription: (token) => playLookup(token)
    });

    const [profile] = await db()
      .select({ timezone: schema.profiles.timezone })
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, session.userId));

    const checksToday = await countChecksToday(
      db(),
      session.userId,
      profile?.timezone ?? "America/New_York",
      now()
    );

    return NextResponse.json({
      ...entitlement,
      checksToday,
      freeDailyLimit: FREE_DAILY_CHECKS
    });
  };
}

// ── POST /api/billing/play/verify ───────────────────────────────────────────

export function createPlayVerifyHandler(deps: BillingDeps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const playLookup = deps.playLookup ?? fetchPlaySubscription;
  const now = deps.now ?? (() => new Date());

  return async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
      return unauthorized();
    }

    const parsed = PlayVerifySchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    let info;
    try {
      // Server-side receipt verification — the client's word is never enough.
      info = await playLookup(parsed.data.purchaseToken);
    } catch {
      return NextResponse.json(
        { error: "Could not verify the purchase with Google Play." },
        { status: 502 }
      );
    }

    await db()
      .insert(schema.subscriptions)
      .values({
        userId: session.userId,
        provider: "play",
        providerRef: parsed.data.purchaseToken,
        productId: info.productId ?? "premium_monthly",
        status: info.status,
        termsVersion: parsed.data.termsVersion,
        termsAcceptedAt: now(),
        currentPeriodEnd: info.currentPeriodEnd,
        updatedAt: now()
      })
      .onConflictDoUpdate({
        target: schema.subscriptions.providerRef,
        set: {
          status: info.status,
          termsVersion: parsed.data.termsVersion,
          termsAcceptedAt: now(),
          currentPeriodEnd: info.currentPeriodEnd,
          updatedAt: now()
        }
      });

    const entitlement = await getEntitlement(db(), session.userId, { now });
    return NextResponse.json(entitlement);
  };
}

// ── POST /api/billing/play/rtdn (Pub/Sub push) ─────────────────────────────

export function createPlayRtdnHandler(deps: BillingDeps = {}) {
  const db = deps.db ?? getDb;
  const playLookup = deps.playLookup ?? fetchPlaySubscription;
  const now = deps.now ?? (() => new Date());

  return async function POST(request: Request) {
    const url = new URL(request.url);
    // Constant-time (N-29): a plain !== on the shared token leaks its length and
    // matching prefix through response timing, and this door is unauthenticated.
    if (
      !timingSafeEqualSecret(
        url.searchParams.get("token"),
        process.env.RTDN_SHARED_TOKEN
      )
    ) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = (await readJson(request)) as {
      message?: { data?: string };
    } | null;

    const purchaseToken = extractPurchaseToken(body);
    if (!purchaseToken) {
      // Always ack malformed/test notifications — Pub/Sub retries otherwise.
      return NextResponse.json({ ok: true, ignored: true });
    }

    // Only update subscriptions we know (the verify call creates the row and
    // binds it to a user — RTDN alone cannot attribute a purchase).
    const [existing] = await db()
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerRef, purchaseToken));

    if (!existing) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    try {
      const info = await playLookup(purchaseToken);
      await db()
        .update(schema.subscriptions)
        .set({
          status: info.status,
          currentPeriodEnd: info.currentPeriodEnd,
          updatedAt: now()
        })
        .where(eq(schema.subscriptions.id, existing.id));
    } catch {
      // Lookup failure: nack via 500 so Pub/Sub retries with backoff.
      return NextResponse.json({ error: "retry" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  };
}

function extractPurchaseToken(
  body: { message?: { data?: string } } | null
): string | null {
  try {
    const decoded = JSON.parse(
      Buffer.from(body?.message?.data ?? "", "base64").toString("utf8")
    ) as {
      subscriptionNotification?: { purchaseToken?: string };
      voidedPurchaseNotification?: { purchaseToken?: string };
    };
    return (
      decoded.subscriptionNotification?.purchaseToken ??
      decoded.voidedPurchaseNotification?.purchaseToken ??
      null
    );
  } catch {
    return null;
  }
}

// ── POST /api/billing/stripe/checkout ───────────────────────────────────────

const CheckoutSchema = z
  .object({
    plan: z.enum(["monthly", "annual"]),
    termsAccepted: z.literal(true),
    termsVersion: z.literal(TERMS_VERSION)
  })
  .strict();

export function createStripeCheckoutHandler(deps: BillingDeps = {}) {
  const getSession = deps.getSession ?? getSessionInfo;
  const stripe = deps.stripeClient ?? defaultStripe;
  const env = deps.env ?? process.env;

  return async function POST(request: Request) {
    const blocked = checkoutGate(env);
    if (blocked) {
      return blocked;
    }

    const session = await getSession();
    if (!session) {
      return unauthorized();
    }

    const parsed = CheckoutSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    // W-20 — the legacy (PAYWALL_MODE=legacy) rollback path used to read its own
    // STRIPE_PRICE_MONTHLY env var, a DIFFERENT variable from the trial funnel's
    // variant ladder. That silently unenforced the one invariant pricing.ts
    // exists to hold — "the wall can never show a price checkout won't charge" —
    // precisely on the path we'd be running during an incident. Both plans now
    // derive from the same resolvers as every other surface.
    const price =
      parsed.data.plan === "monthly"
        ? resolvePriceVariant(env).priceId
        : resolveAnnualPrice(env).priceId;
    const appUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    if (!price) {
      return NextResponse.json(
        { error: "Billing is not configured." },
        { status: 503 }
      );
    }

    const checkout = await stripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      client_reference_id: session.userId,
      customer_email: session.email,
      metadata: { terms_version: parsed.data.termsVersion },
      subscription_data: {
        metadata: { terms_version: parsed.data.termsVersion }
      },
      success_url: `${appUrl}/account?subscribed=1`,
      cancel_url: `${appUrl}/subscribe`
    });

    return NextResponse.json({ url: checkout.url });
  };
}

// ── POST /api/billing/stripe/pantry-checkout ────────────────────────────────

const PantryCheckoutSchema = z
  .object({
    termsAccepted: z.literal(true),
    termsVersion: z.literal(TERMS_VERSION)
  })
  .strict();

export function createPantryCheckoutSessionHandler(deps: BillingDeps = {}) {
  const stripe = deps.stripeClient ?? defaultStripe;
  const env = deps.env ?? process.env;

  return async function POST(request: Request) {
    const blocked = checkoutGate(env);
    if (blocked) {
      return blocked;
    }

    const parsed = PantryCheckoutSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Accept the Terms and Privacy Notice before checkout." },
        { status: 400 }
      );
    }

    const price = env.STRIPE_PRICE_PANTRY;
    const appUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    if (!price) {
      return NextResponse.json({ error: "The Pantry Review is not available right now." }, { status: 503 });
    }
    // No session gate: buyers may be anonymous. Checkout collects the email;
    // order binding stays possession-of-claim-token, exactly like the
    // Payment Link path (applyPantryCheckout is reused byte-identically).
    const checkout = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity: 1 }],
      metadata: { terms_version: parsed.data.termsVersion },
      success_url: `${appUrl}/pantry/thanks`,
      cancel_url: `${appUrl}/pantry`
    });
    return NextResponse.json({ url: checkout.url });
  };
}

// ── POST /api/billing/stripe/portal ─────────────────────────────────────────

export function createStripePortalHandler(deps: BillingDeps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const stripe = deps.stripeClient ?? defaultStripe;

  return async function POST() {
    const session = await getSession();
    if (!session) {
      return unauthorized();
    }

    // W-20 — filter on provider, exactly as the cancel path below does. Without
    // it a user who has BOTH a Play row and a Stripe row gets whichever row the
    // planner happens to return first (there is no ORDER BY), so a legitimate
    // Stripe subscriber intermittently gets a 404 from their own manage button.
    const [row] = await db()
      .select()
      .from(schema.subscriptions)
      .where(
        and(
          eq(schema.subscriptions.userId, session.userId),
          eq(schema.subscriptions.provider, "stripe")
        )
      );

    if (!row) {
      return NextResponse.json(
        { error: "No Stripe subscription to manage." },
        { status: 404 }
      );
    }

    const subscription = await stripe().subscriptions.retrieve(
      row.providerRef
    );
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;

    const portal = await stripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/account`
    });

    return NextResponse.json({ url: portal.url });
  };
}

// ── /api/billing/cancel (email-token GET + account POST) ────────────────────

// Statuses whose subscription is still entitled and therefore cancelable at
// period end. A cancel on a lapsed row is a no-op (nothing to stop).
const CANCELABLE = new Set(["trialing", "active", "grace"]);

/**
 * One-tap cancel (docs/adr/billing.md, anti-Klinio). GET is the signed-out
 * email link — its trust anchor is the verified token, never a session; POST
 * is the account-page button behind the session. Both flip
 * `cancel_at_period_end` on Stripe so entitlement runs out the paid period,
 * and both are idempotent (a second click re-runs the same harmless update).
 */
export function createCancelHandlers(deps: BillingDeps = {}) {
  const db = deps.db ?? getDb;
  const getSession = deps.getSession ?? getSessionInfo;
  const stripe = deps.stripeClient ?? defaultStripe;

  // GET /api/billing/cancel?token=… — from the pre-charge email, works
  // signed-out. Never dedupe or log by the raw token (it is suffix-malleable);
  // the verify result is the only trust anchor.
  async function GET(request: Request): Promise<NextResponse> {
    const url = new URL(request.url);
    const canceled = (invalid: boolean) =>
      NextResponse.redirect(
        new URL(invalid ? "/canceled?invalid=1" : "/canceled", url),
        303
      );

    const verified = verifyCancelToken(url.searchParams.get("token") ?? "");
    if (!verified) {
      return canceled(true);
    }

    const [row] = await db()
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.id, verified.subRowId));

    if (row && row.provider === "stripe" && CANCELABLE.has(row.status)) {
      await stripe().subscriptions.update(row.providerRef, {
        cancel_at_period_end: true
      });
      if (row.status === "trialing") {
        emitBillingEvent({
          name: "trial_canceled",
          priceVariant:
            (row.priceVariant as BillingTelemetryEvent["priceVariant"]) ??
            undefined
        });
      }
    }

    return canceled(false);
  }

  // POST /api/billing/cancel — the account-page one-tap button. Session-gated;
  // cancels the caller's own Stripe row only.
  async function POST(): Promise<NextResponse> {
    const session = await getSession();
    if (!session) {
      return unauthorized();
    }

    const [row] = await db()
      .select()
      .from(schema.subscriptions)
      .where(
        and(
          eq(schema.subscriptions.userId, session.userId),
          eq(schema.subscriptions.provider, "stripe")
        )
      );

    if (!row || row.provider !== "stripe") {
      return NextResponse.json(
        { error: "No Stripe subscription to cancel." },
        { status: 404 }
      );
    }

    await stripe().subscriptions.update(row.providerRef, {
      cancel_at_period_end: true
    });

    return NextResponse.json({ ok: true, accessUntil: row.currentPeriodEnd });
  }

  return { GET, POST };
}

// ── POST /api/billing/stripe/webhook ────────────────────────────────────────

// How long a declined card keeps premium after the FIRST failed charge (W-18).
// Long enough to genuinely fix a card (expired, bank hold), far short of the
// ~3 weeks Stripe's dunning would otherwise hand out for free.
const DUNNING_GRACE_MS = 3 * 24 * 60 * 60 * 1000;

export function createStripeWebhookHandler(deps: BillingDeps = {}) {
  const db = deps.db ?? getDb;
  const stripe = deps.stripeClient ?? defaultStripe;
  const now = deps.now ?? (() => new Date());
  const email = deps.email ?? { send: sendEmail };

  return async function POST(request: Request) {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature") ?? "";
    const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

    let event: Stripe.Event;
    try {
      event = await stripe().webhooks.constructEventAsync(
        payload,
        signature,
        secret
      );
    } catch {
      return NextResponse.json({ error: "Bad signature." }, { status: 400 });
    }

    await applyStripeEvent(db(), event, now(), stripe, email);
    return NextResponse.json({ received: true });
  };
}

/** Exported for direct unit testing without signature plumbing. */
export async function applyStripeEvent(
  db: Db,
  event: Stripe.Event,
  now: Date,
  stripe?: () => Stripe,
  email?: PantryEmailSender
): Promise<void> {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.mode === "payment") {
      // Pantry Review Payment Link (one-time). Anything else in payment
      // mode is not ours — verify the price before touching the DB.
      await applyPantryCheckout(db, session, now, stripe, email);
      return;
    }

    const userId = session.client_reference_id;
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    if (!userId || !subscriptionId) {
      return;
    }

    // Fetch the subscription for period end + price.
    const subscription = stripe
      ? await stripe().subscriptions.retrieve(subscriptionId)
      : null;
    const item = subscription?.items.data[0];

    const isTrialing = subscription?.status === "trialing";
    const status = isTrialing ? "trialing" : "active";
    const priceVariant = subscription?.metadata?.price_variant ?? null;
    const termsVersion =
      subscription?.metadata?.terms_version ??
      session.metadata?.terms_version ??
      null;
    const currentPeriodEnd =
      isTrialing && subscription?.trial_end
        ? new Date(subscription.trial_end * 1000)
        : item?.current_period_end
          ? new Date(item.current_period_end * 1000)
          : new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000);

    await db
      .insert(schema.subscriptions)
      .values({
        userId,
        provider: "stripe",
        providerRef: subscriptionId,
        productId:
          item?.price.id === process.env.STRIPE_PRICE_ANNUAL
            ? "premium_annual"
            : "premium_monthly",
        status,
        priceVariant,
        termsVersion,
        termsAcceptedAt: termsVersion ? now : null,
        currentPeriodEnd,
        updatedAt: now
      })
      .onConflictDoUpdate({
        target: schema.subscriptions.providerRef,
        set: {
          status,
          priceVariant,
          termsVersion,
          termsAcceptedAt: termsVersion ? now : null,
          updatedAt: now
        }
      });

    if (isTrialing) {
      emitBillingEvent({
        name: "trial_started",
        priceVariant:
          (priceVariant as BillingTelemetryEvent["priceVariant"]) ?? undefined
      });
    }
    return;
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = resolveInvoiceSubscriptionId(invoice);
    if (!subscriptionId) {
      return;
    }

    const [row] = await db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerRef, subscriptionId));
    if (!row) {
      return;
    }

    // The $0 subscription-create invoice fires at trial START. It must not
    // flip trialing→active or emit a conversion. Other billing reasons
    // (subscription_cycle, …) or an absent reason proceed to conversion.
    if (invoice.billing_reason === "subscription_create") {
      return;
    }

    // Only trial→active and renewals of active rows are ours to touch.
    if (row.status !== "trialing" && row.status !== "active") {
      return;
    }

    const subscription = stripe
      ? await stripe().subscriptions.retrieve(subscriptionId)
      : null;
    const item = subscription?.items.data[0];
    const currentPeriodEnd = item?.current_period_end
      ? new Date(item.current_period_end * 1000)
      : row.currentPeriodEnd;

    if (row.status === "trialing") {
      // First successful charge converts the trial. Renewals of an
      // already-active row are NOT conversions (new-only rule).
      await db
        .update(schema.subscriptions)
        .set({ status: "active", currentPeriodEnd, updatedAt: now })
        .where(eq(schema.subscriptions.id, row.id));
      emitBillingEvent({
        name: "trial_converted",
        priceVariant:
          (row.priceVariant as BillingTelemetryEvent["priceVariant"]) ??
          undefined
      });
    } else {
      // Active renewal: period-end refresh only.
      await db
        .update(schema.subscriptions)
        .set({ currentPeriodEnd, updatedAt: now })
        .where(eq(schema.subscriptions.id, row.id));
    }
    return;
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = resolveInvoiceSubscriptionId(invoice);
    if (!subscriptionId) {
      return; // Not a subscription invoice (e.g. the one-time Pantry charge).
    }

    const [found] = await db
      .select({ sub: schema.subscriptions, email: schema.users.email })
      .from(schema.subscriptions)
      .innerJoin(schema.users, eq(schema.subscriptions.userId, schema.users.id))
      .where(eq(schema.subscriptions.providerRef, subscriptionId));
    if (!found || found.sub.status === "refunded") {
      return; // "refunded" is terminal — see the guard in subscription.updated.
    }
    const row = found.sub;

    // Cap the grace window (N-07). Stripe's dunning retries a declined card for
    // ~3 weeks; mapStripeStatus turns past_due into "grace", which IS entitled,
    // and currentPeriodEnd stayed weeks out — so a card that will never clear
    // bought three more weeks of premium at zero revenue, and the user was never
    // told. Access now ends DUNNING_GRACE_MS from the first failure (or at the
    // period end already stored, whichever comes first — never extend it).
    const graceEnd = new Date(now.getTime() + DUNNING_GRACE_MS);
    const currentPeriodEnd =
      row.currentPeriodEnd < graceEnd ? row.currentPeriodEnd : graceEnd;

    // Every dunning retry re-fires this event. Once the row is capped, a later
    // retry recomputes a graceEnd LATER than the stored end — that is the
    // idempotence signal, and it costs no schema column: cap and email once.
    if (row.status === "grace" && row.currentPeriodEnd <= graceEnd) {
      return;
    }

    await db
      .update(schema.subscriptions)
      .set({ status: "grace", currentPeriodEnd, updatedAt: now })
      .where(eq(schema.subscriptions.id, row.id));

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await (email?.send ?? sendEmail)({
      to: found.email,
      ...paymentFailedEmailText(
        appUrl,
        currentPeriodEnd.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric"
        })
      )
    });
    return;
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const item = subscription.items?.data[0];
    const status = mapStripeStatus(subscription.status, event.type);

    // Read the stored row BEFORE the update — its pre-update status drives the
    // refund guard below as well as the cancel and conversion telemetry.
    const [existing] = await db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerRef, subscription.id));

    // "refunded" is TERMINAL (N-06). Stripe does not guarantee webhook ordering,
    // so a customer.subscription.updated emitted before the refund can be
    // delivered after it — and this handler used to write `status` and
    // `currentPeriodEnd` unconditionally, which resurrected a refunded
    // subscription to "active" and handed back the premium we just refunded.
    // charge.refunded is the only writer of this status; nothing may undo it.
    if (existing?.status === "refunded") {
      return;
    }

    // Cancellation telemetry: a subscription flagged to cancel at period end
    // keeps its current status (entitled until it lapses); we only surface the
    // signal. Telemetry duplicates on repeated updates are tolerable.
    //
    // The two names are NOT interchangeable — a trial that never converted and
    // a paying customer who left are different business events, and W-10's
    // churn metric wants the second one. A trial cancels; a subscriber churns.
    if (
      event.type === "customer.subscription.updated" &&
      subscription.cancel_at_period_end === true &&
      (existing?.status === "trialing" || existing?.status === "active")
    ) {
      emitBillingEvent({
        name:
          existing.status === "trialing"
            ? "trial_canceled"
            : "subscription_canceled",
        priceVariant:
          (existing.priceVariant as BillingTelemetryEvent["priceVariant"]) ??
          undefined
      });
    }

    // Conversion can arrive here instead of via invoice.paid when Stripe fires
    // customer.subscription.updated (trialing→active) first. Emit exactly once:
    // the stored row still being "trialing" is the dedupe — whichever handler
    // runs first flips the row, so only one of the two emits.
    const previousStatus = (
      event.data.previous_attributes as { status?: string } | undefined
    )?.status;
    const isConversion =
      event.type === "customer.subscription.updated" &&
      previousStatus === "trialing" &&
      status === "active" &&
      existing?.status === "trialing";

    // A payload that omits current_period_end must LEAVE the stored one alone.
    // Writing `now` (the old fallback) set the paid-through date to this instant,
    // and getEntitlement requires currentPeriodEnd > now — so any such update
    // silently revoked premium from a paying, fully-active subscriber.
    const periodEnd = item?.current_period_end
      ? new Date(item.current_period_end * 1000)
      : undefined;

    await db
      .update(schema.subscriptions)
      .set({
        status,
        ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
        updatedAt: now
      })
      .where(eq(schema.subscriptions.providerRef, subscription.id));

    if (isConversion) {
      emitBillingEvent({
        name: "trial_converted",
        priceVariant:
          (existing?.priceVariant as BillingTelemetryEvent["priceVariant"]) ??
          undefined
      });
    }
    return;
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntent =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent?.id;
    if (paymentIntent) {
      const canceled = await db
        .update(schema.pantryOrders)
        .set({ status: "canceled", updatedAt: now })
        .where(eq(schema.pantryOrders.stripePaymentIntent, paymentIntent))
        .returning({ id: schema.pantryOrders.id });

      // W-33 — a refunded order is over, so its photos must go. Nothing else
      // ever revisits a canceled order (the sweep only walks live states), so
      // without this the buyer's food photos would live in blob storage
      // forever, against the privacy promise. Must run here, while the
      // pantry_photos rows still hold the only pointers to the objects.
      for (const order of canceled) {
        await deleteOrderBlobs(db, order.id);
      }
    }

    // Subscription refund (launch audit BUG-17). Policy: a FULL refund of a
    // subscription invoice charge (charge.refunded === true) drops premium
    // immediately via status "refunded" — the only writer of that enum value.
    // Partial refunds keep the entitlement; a refund WITH a cancel also flows
    // through subscription.deleted, and this update is idempotent alongside it.
    // stripe@22's basil types drop charge.invoice — same safe-cast fallback as
    // the invoice.paid resolution above.
    if (!charge.refunded || !stripe) {
      return;
    }
    const invoiceRef = (
      charge as unknown as { invoice?: string | { id: string } | null }
    ).invoice;
    const invoiceId =
      typeof invoiceRef === "string" ? invoiceRef : invoiceRef?.id;
    if (!invoiceId) {
      return;
    }
    const invoice = await stripe().invoices.retrieve(invoiceId);
    const subscriptionId = resolveInvoiceSubscriptionId(invoice);
    if (!subscriptionId) {
      return;
    }
    const refunded = await db
      .update(schema.subscriptions)
      .set({ status: "refunded", updatedAt: now })
      .where(eq(schema.subscriptions.providerRef, subscriptionId))
      .returning({ priceVariant: schema.subscriptions.priceVariant });

    // W-10 churn signal. Emitted off the RETURNING rows, not the incoming
    // event, so a refund for a subscription we do not hold emits nothing —
    // the event fires if and only if a real entitlement was revoked.
    for (const row of refunded) {
      emitBillingEvent({
        name: "subscription_refunded",
        priceVariant:
          (row.priceVariant as BillingTelemetryEvent["priceVariant"]) ??
          undefined
      });
    }
  }
}

/**
 * Subscription id resolution across API versions. On 2025-03-31.basil+
 * payloads it lives under invoice.parent.subscription_details; older
 * account/endpoint versions send a top-level invoice.subscription that
 * stripe@22's types no longer declare — resolve via a safe cast fallback.
 */
function resolveInvoiceSubscriptionId(
  invoice: Stripe.Invoice
): string | undefined {
  const subRef = invoice.parent?.subscription_details?.subscription;
  const fromParent = typeof subRef === "string" ? subRef : subRef?.id;
  if (fromParent) {
    return fromParent;
  }
  const legacy = (
    invoice as unknown as { subscription?: string | { id: string } }
  ).subscription;
  return typeof legacy === "string" ? legacy : legacy?.id;
}

async function applyPantryCheckout(
  db: Db,
  session: Stripe.Checkout.Session,
  now: Date,
  stripe?: () => Stripe,
  email?: PantryEmailSender
): Promise<void> {
  const pantryPrice = process.env.STRIPE_PRICE_PANTRY;
  if (!pantryPrice || !stripe) {
    return;
  }

  const lineItems = await stripe().checkout.sessions.listLineItems(
    session.id,
    { limit: 10 }
  );
  if (!lineItems.data.some((item) => item.price?.id === pantryPrice)) {
    return;
  }

  const buyerEmail =
    session.customer_details?.email ?? session.customer_email;
  if (!buyerEmail) {
    return; // Payment Links always collect email; belt-and-suspenders.
  }

  const { token, tokenHash } = generateClaimToken();
  const inserted = await db
    .insert(schema.pantryOrders)
    .values({
      email: buyerEmail,
      stripeSessionId: session.id,
      stripePaymentIntent:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null),
      claimToken: tokenHash,
      termsVersion: session.metadata?.terms_version ?? null,
      termsAcceptedAt: session.metadata?.terms_version ? now : null,
      updatedAt: now
    })
    .onConflictDoNothing({ target: schema.pantryOrders.stripeSessionId })
    .returning();

  if (inserted.length === 0) {
    return; // Duplicate webhook delivery — the first one already emailed.
  }

  emitBillingEvent({ name: "pantry_purchased" });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const result = await (email?.send ?? sendEmail)({
    to: buyerEmail,
    ...intakeEmailText(appUrl, token)
  });

  if (result.ok) {
    await db
      .update(schema.pantryOrders)
      .set({ intakeEmailSentAt: now, updatedAt: now })
      .where(eq(schema.pantryOrders.id, inserted[0].id));
  }
}

function mapStripeStatus(
  status: Stripe.Subscription.Status,
  eventType: string
): "active" | "trialing" | "canceled" | "grace" | "expired" | "refunded" {
  if (eventType === "customer.subscription.deleted") {
    return "expired";
  }

  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "grace";
    case "canceled":
      return "canceled";
    default:
      return "expired";
  }
}

// ── POST /api/trial/start ───────────────────────────────────────────────────

const TrialStartSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    // 2-plan wall (owner decision 2026-07-10). Absent = monthly, so existing
    // clients keep working unchanged.
    plan: z.enum(["monthly", "annual"]).optional(),
    termsAccepted: z.literal(true),
    termsVersion: z.literal(TERMS_VERSION)
  })
  .strict();

/**
 * Email-first, card-gated 7-day trial. The account is created at trial start
 * (find-or-create on the same `users` row the magic-link sign-in resolves via
 * getUserByEmail), the magic link fires non-fatally as account recovery if the
 * card step is abandoned, and a subscription Checkout session with a 7-day
 * trial is returned. Consumed by the Phase-4 paywall (Task 4.2).
 */
export function createTrialCheckoutHandler(
  deps: BillingDeps & {
    sendMagicLink?: (email: string) => Promise<void>;
    emailCooldown?: (email: string) => Promise<{ ok: boolean }>;
  } = {}
) {
  const db = deps.db ?? getDb;
  const stripe = deps.stripeClient ?? defaultStripe;
  const env = deps.env ?? process.env;
  const emailCooldown =
    deps.emailCooldown ?? ((email: string) => checkEmailCooldown("trial_email", email));
  const sendMagicLink =
    deps.sendMagicLink ??
    (async (email: string) => {
      // Reuses the exact existing magic-link path; the email doubles as
      // account recovery if the card step is abandoned.
      const { signIn } = await import("../../../auth");
      await signIn("resend", {
        email,
        redirect: false,
        redirectTo: "/welcome?trial=1"
      });
    });

  return async function POST(request: Request) {
    const blocked = checkoutGate(env);
    if (blocked) {
      return blocked;
    }

    const parsed = TrialStartSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }

    // Per-email cooldown (W-11). The proxy already limits this route per IP;
    // this is the half per-IP cannot see — a distributed flood pointed at ONE
    // stranger's inbox. Runs BEFORE the users row, the magic link, and the
    // Stripe session, so a blocked request costs us nothing at all.
    const cooldown = await emailCooldown(parsed.data.email);
    if (!cooldown.ok) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in a little while." },
        { status: 429 }
      );
    }

    const monthly = resolvePriceVariant(env);
    const plan = parsed.data.plan ?? "monthly";
    const priceId =
      plan === "annual" ? resolveAnnualPrice(env).priceId : monthly.priceId;
    // The metadata drives the pre-charge email's price line; annual rows carry
    // the plan name instead of a monthly variant.
    const variant = plan === "annual" ? "annual" : monthly.variant;
    if (!priceId) {
      return NextResponse.json(
        { error: "Billing is not configured." },
        { status: 503 }
      );
    }

    const email = parsed.data.email;
    // Find-or-create: the DrizzleAdapter's magic-link sign-in resolves this
    // same row via getUserByEmail, so account creation moves to trial start
    // without forking the auth model.
    let [user] = await db()
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));
    if (!user) {
      try {
        [user] = await db().insert(schema.users).values({ email }).returning();
      } catch {
        // Concurrent trial-start for the same new email lost the insert race
        // (users.email is UNIQUE) — the winner's row is now present.
        [user] = await db()
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, email));
      }
    }

    try {
      await sendMagicLink(email);
    } catch {
      // Non-fatal: /trial/started offers a resend; checkout must not block on email.
    }

    // W-16 — one free week per account, ever. Every checkout used to carry a
    // fresh trial_period_days, so cancel → re-subscribe → cancel bought free
    // premium forever. ANY prior subscriptions row disqualifies the trial,
    // whatever its status: canceled, expired and refunded all mean the free week
    // was already taken. The row itself is the flag, so this needs no migration
    // and no new column to keep in sync. A user who merely abandoned checkout
    // never got a row — they still get the week they never used. Correct.
    const [priorSubscription] = await db()
      .select({ id: schema.subscriptions.id })
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.userId, user.id))
      .limit(1);

    const appUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const checkout = await stripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      payment_method_collection: "always",
      subscription_data: {
        ...(priorSubscription ? {} : { trial_period_days: 7 }),
        metadata: {
          price_variant: variant,
          terms_version: parsed.data.termsVersion
        }
      },
      metadata: { terms_version: parsed.data.termsVersion },
      client_reference_id: user.id,
      customer_email: email,
      success_url: `${appUrl}/trial/started`,
      cancel_url: `${appUrl}/subscribe?declined=1`
    });

    return NextResponse.json({ url: checkout.url });
  };
}
