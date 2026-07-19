import { historyStore, type StoredCheck } from "./history-store";

/**
 * Server-backed history reads (4B): signed-in users read from the server
 * (cross-device); guests and offline reads fall back to the local store.
 */

export type HistorySource = "server" | "local";

export async function loadHistory(days: number): Promise<{
  source: HistorySource;
  checks: StoredCheck[];
}> {
  try {
    const response = await fetch(`/api/history?limit=200`, {
      cache: "no-store"
    });

    if (response.ok) {
      const body = (await response.json()) as {
        checks: Array<{
          clientId: string;
          food: string;
          risk: StoredCheck["risk"];
          a1cBand: string;
          inputMethod: string;
          actionDoneAt?: string;
          createdAt: string;
        }>;
      };

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - (days - 1));
      cutoff.setHours(0, 0, 0, 0);

      const checks = body.checks
        .filter((check) => new Date(check.createdAt) >= cutoff)
        .map((check) => ({
          clientId: check.clientId,
          food: check.food,
          risk: check.risk,
          a1cBand: check.a1cBand,
          // Preserve the true input method (text/voice/photo). Anything the
          // server did not tag with a known method degrades to "text".
          inputMethod:
            check.inputMethod === "voice" || check.inputMethod === "photo"
              ? check.inputMethod
              : "text",
          createdAt: check.createdAt,
          actionDoneAt: check.actionDoneAt
        })) as StoredCheck[];

      return { source: "server", checks };
    }
  } catch {
    // network failure → local fallback below
  }

  return { source: "local", checks: historyStore.recent(days) };
}

/**
 * Idempotent local→server sync (dedupe on client_id server-side). Runs on
 * sign-in (welcome page) and opportunistically from the daily loop.
 */
export async function syncLocalHistory(): Promise<void> {
  const local = historyStore.all();
  if (local.length === 0) {
    return;
  }

  try {
    await fetch("/api/history/migrate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ checks: local })
    });
  } catch {
    // best-effort; retried on the next visit
  }
}
