"use client";

import { useEffect, useState } from "react";

import { historyStore } from "../lib/client/history-store";
import { dayKeyLocal } from "../lib/coach/days";

/**
 * Two-step nudge opt-in (plan P5): offered on the home loop only after the
 * user has a check on a PRIOR day (never during onboarding), and only when
 * signed in. Step 1 is our own calm ask; the browser permission prompt only
 * fires after an explicit yes.
 */
export function NudgeOptIn() {
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<"idle" | "asking" | "done" | "failed">(
    "idle"
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (
        typeof Notification === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        Notification.permission === "denied"
      ) {
        return;
      }

      // Value first: at least one check on a day before today.
      const todayKey = dayKeyLocal(new Date());
      const hasPriorDay = historyStore
        .all()
        .some((check) => dayKeyLocal(new Date(check.createdAt)) !== todayKey);
      if (!hasPriorDay) {
        return;
      }

      // Signed-in + premium only (the nudge is a premium feature) — and not
      // already subscribed.
      try {
        const [entitlementResponse, registration] = await Promise.all([
          fetch("/api/entitlement", { cache: "no-store" }),
          navigator.serviceWorker.ready
        ]);
        if (cancelled || !entitlementResponse.ok) {
          return;
        }
        const entitlement = (await entitlementResponse.json()) as {
          tier: string;
        };
        if (entitlement.tier !== "premium") {
          return;
        }
        const existing = await registration.pushManager.getSubscription();
        if (!existing && !cancelled) {
          setVisible(true);
        }
      } catch {
        // stay hidden on any failure
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    setState("asking");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("failed");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        setState("failed");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(subscription.toJSON())
      });

      setState(response.ok ? "done" : "failed");
    } catch {
      setState("failed");
    }
  }

  if (!visible || state === "done") {
    return state === "done" ? (
      <p className="field-hint" data-testid="nudge-enabled">
        Daily reminder on — one gentle check-in, at your hour, never more.
      </p>
    ) : null;
  }

  return (
    <div className="insight-card" data-testid="nudge-opt-in">
      <p className="insight-eyebrow">Optional</p>
      <p className="insight-text">
        Want one gentle reminder a day to check your first meal? No streak
        guilt, no repeats — one nudge, at an hour you pick.
      </p>
      <div className="paywall-actions">
        <button
          type="button"
          className="recheck-button"
          disabled={state === "asking"}
          data-testid="nudge-enable"
          onClick={enable}
        >
          {state === "asking" ? "Asking your browser…" : "Turn on the reminder"}
        </button>
        <button
          type="button"
          className="recheck-button"
          data-testid="nudge-dismiss"
          onClick={() => setVisible(false)}
        >
          Not now
        </button>
      </div>
      {state === "failed" ? (
        <p className="field-hint">
          That didn&apos;t work — you can turn it on later from your account
          page.
        </p>
      ) : null}
    </div>
  );
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}
