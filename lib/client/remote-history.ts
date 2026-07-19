import {
  historyStore,
  normalizeInputMethod,
  type StoredCheck
} from "./history-store";

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
          // Preserve the true input method (text/voice/photo); an unknown
          // method degrades to "text" (shared helper — one mapping rule).
          inputMethod: normalizeInputMethod(check.inputMethod),
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
 * A server history row carries a stable server `id` (the delete key) on top of
 * the StoredCheck shape the rest of the UI already knows.
 */
export type ServerCheck = StoredCheck & { id: string };

export type HistoryMeta = {
  tier: "free" | "premium";
  retention: { scope: "full" | "window"; windowDays: number | null };
};

/**
 * Result of a paginated history read. The three statuses are deliberately
 * distinct so the UI never renders a backend failure as a paywall (plan §7 /
 * global constraint 7): `guest` = signed-out (401) → show the local on-device
 * view; `error` = network/5xx → show an explicit unavailable+retry state;
 * `ok` = server data with truthful retention meta.
 */
export type FetchHistoryPageResult =
  | {
      status: "ok";
      checks: ServerCheck[];
      nextCursor: string | null;
      meta: HistoryMeta;
      searchScanned: number | null;
      searchCapped: boolean;
    }
  | { status: "guest" }
  | { status: "error" };

// The paginated UI page size. Small by design (<=50, the paginated-mode ceiling)
// so a page is cheap; older rows arrive via nextCursor.
export const HISTORY_PAGE_SIZE = 25;

function normalizeServerCheck(check: {
  id?: string;
  clientId: string;
  food: string;
  risk: StoredCheck["risk"];
  a1cBand: string;
  inputMethod: string;
  actionDoneAt?: string;
  createdAt: string;
}): ServerCheck {
  return {
    id: check.id ?? check.clientId,
    clientId: check.clientId,
    food: check.food,
    risk: check.risk,
    a1cBand: check.a1cBand,
    // Preserve the true input method (text/voice/photo); shared mapping rule.
    inputMethod: normalizeInputMethod(check.inputMethod),
    createdAt: check.createdAt,
    actionDoneAt: check.actionDoneAt
  };
}

export async function fetchHistoryPage(params: {
  cursor?: string | null;
  q?: string;
  from?: string;
  to?: string;
  limit?: number;
} = {}): Promise<FetchHistoryPageResult> {
  const query = params.q?.trim();

  let response: Response;
  try {
    if (query) {
      // Meal text is health data — plan §16 forbids it in URLs/logs, so the
      // search term travels in a POST body, NEVER the query string.
      response = await fetch(`/api/history/search`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          q: query,
          from: params.from || undefined,
          to: params.to || undefined
        })
      });
    } else {
      const search = new URLSearchParams();
      search.set("limit", String(params.limit ?? HISTORY_PAGE_SIZE));
      if (params.cursor) search.set("cursor", params.cursor);
      if (params.from) search.set("from", params.from);
      if (params.to) search.set("to", params.to);
      response = await fetch(`/api/history?${search.toString()}`, {
        cache: "no-store"
      });
    }
  } catch {
    return { status: "error" };
  }

  if (response.status === 401) {
    return { status: "guest" };
  }
  if (!response.ok) {
    return { status: "error" };
  }

  try {
    const body = (await response.json()) as {
      checks: Array<Parameters<typeof normalizeServerCheck>[0]>;
      nextCursor?: string | null;
      searchScanned?: number;
      searchCapped?: boolean;
      meta?: HistoryMeta;
    };
    return {
      status: "ok",
      checks: body.checks.map(normalizeServerCheck),
      nextCursor: body.nextCursor ?? null,
      meta: body.meta ?? {
        tier: "free",
        retention: { scope: "window", windowDays: 7 }
      },
      searchScanned:
        typeof body.searchScanned === "number" ? body.searchScanned : null,
      searchCapped: body.searchCapped ?? false
    };
  } catch {
    return { status: "error" };
  }
}

/**
 * Per-check delete. Returns true on success; the caller removes the row from its
 * view. Any failure returns false so the UI can surface a non-destructive error
 * without optimistically dropping a row that still exists on the server.
 */
export async function deleteHistoryCheck(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/history/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    return response.ok;
  } catch {
    return false;
  }
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
