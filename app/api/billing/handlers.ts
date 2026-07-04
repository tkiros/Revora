import { eq } from "drizzle-orm";
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
import { sendEmail, type SendEmailResult } from "../../../lib/server/email";

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
};

export type PantryEmailSender = {
  send: (input: {
    to: string;
    subject: string;
    text: string;
  }) => Promise<SendEmailResult>;
};

const PlayVerifySchema = z
  .object({ purchaseToken: z.string().trim().min(1).max(512) })
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
        currentPeriodEnd: info.currentPeriodEnd,
        updatedAt: now()
      })
      .onConflictDoUpdate({
        target: schema.subscriptions.providerRef,
        set: {
          status: info.status,
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
    const expected = process.env.RTDN_SHARED_TOKEN;
    if (!expected || url.searchParams.get("token") !== expected) {
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
  .object({ plan: z.enum(["monthly", "annual"]) })
  .strict();

export function createStripeCheckoutHandler(deps: BillingDeps = {}) {
  const getSession = deps.getSession ?? getSessionInfo;
  const stripe = deps.stripeClient ?? defaultStripe;

  return async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
      return unauthorized();
    }

    const parsed = CheckoutSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const price =
      parsed.data.plan === "monthly"
        ? process.env.STRIPE_PRICE_MONTHLY
        : process.env.STRIPE_PRICE_ANNUAL;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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
      success_url: `${appUrl}/account?subscribed=1`,
      cancel_url: `${appUrl}/subscribe`
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

    const [row] = await db()
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.userId, session.userId));

    if (!row || row.provider !== "stripe") {
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

// ── POST /api/billing/stripe/webhook ────────────────────────────────────────

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
        status: "active",
        currentPeriodEnd: item?.current_period_end
          ? new Date(item.current_period_end * 1000)
          : new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000),
        updatedAt: now
      })
      .onConflictDoUpdate({
        target: schema.subscriptions.providerRef,
        set: { status: "active", updatedAt: now }
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

    await db
      .update(schema.subscriptions)
      .set({
        status,
        currentPeriodEnd: item?.current_period_end
          ? new Date(item.current_period_end * 1000)
          : now,
        updatedAt: now
      })
      .where(eq(schema.subscriptions.providerRef, subscription.id));
    return;
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntent =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent?.id;
    if (!paymentIntent) {
      return;
    }
    await db
      .update(schema.pantryOrders)
      .set({ status: "canceled", updatedAt: now })
      .where(eq(schema.pantryOrders.stripePaymentIntent, paymentIntent));
  }
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
      updatedAt: now
    })
    .onConflictDoNothing({ target: schema.pantryOrders.stripeSessionId })
    .returning();

  if (inserted.length === 0) {
    return; // Duplicate webhook delivery — the first one already emailed.
  }

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
): "active" | "canceled" | "grace" | "expired" | "refunded" {
  if (eventType === "customer.subscription.deleted") {
    return "expired";
  }

  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      return "grace";
    case "canceled":
      return "canceled";
    default:
      return "expired";
  }
}
