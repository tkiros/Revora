import { NextResponse } from "next/server";
import webpush from "web-push";

import { runNudgeCron, type PushSendResult } from "../../../../lib/server/nudge";
import { getDb, type Db } from "../../../../lib/server/db";
import { captureServerError } from "../../../../lib/revora/sentry-capture";

export const runtime = "nodejs";
export const maxDuration = 60;

type Deps = {
  db?: () => Db;
  send?: (
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    payload: string
  ) => Promise<PushSendResult>;
};

let vapidConfigured = false;

async function defaultSend(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string
): Promise<PushSendResult> {
  if (!vapidConfigured) {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    if (!publicKey || !privateKey) {
      return "error";
    }
    webpush.setVapidDetails(
      `mailto:${process.env.SUPPORT_EMAIL ?? "support@revora.app"}`,
      publicKey,
      privateKey
    );
    vapidConfigured = true;
  }

  try {
    await webpush.sendNotification(subscription, payload);
    return "ok";
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    return statusCode === 404 || statusCode === 410 ? "gone" : "error";
  }
}

export function createNudgeCronHandler(deps: Deps = {}) {
  const db = deps.db ?? getDb;
  const send = deps.send ?? defaultSend;

  return async function GET(request: Request) {
    const secret = process.env.CRON_SECRET;
    const auth = request.headers.get("authorization");
    if (!secret || auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    try {
      const result = await runNudgeCron(db(), { send });
      return NextResponse.json({ ok: true, ...result });
    } catch (error) {
      await captureServerError(error, "route");
      return NextResponse.json({ error: "nudge run failed" }, { status: 500 });
    }
  };
}

export const GET = createNudgeCronHandler();
