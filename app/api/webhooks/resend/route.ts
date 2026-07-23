import { NextResponse } from "next/server";
import { Resend, type WebhookEventPayload } from "resend";

import { getDb, type Db } from "../../../../lib/server/db";
import { recordResendWebhookEvent } from "../../../../lib/server/email-delivery";

export const runtime = "nodejs";

type VerifyInput = {
  payload: string;
  headers: { id: string; timestamp: string; signature: string };
  webhookSecret: string;
};

type Deps = {
  db?: () => Db;
  now?: () => Date;
  verify?: (input: VerifyInput) => WebhookEventPayload;
};

function defaultVerify(input: VerifyInput): WebhookEventPayload {
  return new Resend().webhooks.verify(input);
}

export function createResendWebhookHandler(deps: Deps = {}) {
  const db = deps.db ?? getDb;
  const now = deps.now ?? (() => new Date());
  const verify = deps.verify ?? defaultVerify;

  return async function POST(request: Request) {
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET?.trim();
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Email webhook is not configured." },
        { status: 503 }
      );
    }

    const headers = {
      id: request.headers.get("svix-id") ?? "",
      timestamp: request.headers.get("svix-timestamp") ?? "",
      signature: request.headers.get("svix-signature") ?? ""
    };
    if (!headers.id || !headers.timestamp || !headers.signature) {
      return NextResponse.json({ error: "Invalid webhook." }, { status: 400 });
    }

    const payload = await request.text();
    let event: WebhookEventPayload;
    try {
      event = verify({ payload, headers, webhookSecret });
    } catch {
      return NextResponse.json({ error: "Invalid webhook." }, { status: 400 });
    }

    try {
      const outcome = await recordResendWebhookEvent(db(), event, now());
      return NextResponse.json(
        { ok: true, outcome },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch {
      // Resend retries non-2xx deliveries. No payload or recipient data is
      // logged or echoed from this boundary.
      return NextResponse.json(
        { error: "Email event could not be recorded." },
        { status: 500 }
      );
    }
  };
}

export const POST = createResendWebhookHandler();
