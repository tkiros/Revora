import type { RevoraRisk } from "./ui-state";

/**
 * On-device meal memory (plan P3). localStorage now; after 4B the same
 * interface is backed by the server for signed-in users — this module is the
 * seam. Guests keep working from this store unchanged.
 * ponytail: localStorage now, server is the durable copy after 4B; the
 * interface is the seam.
 */

export type StoredCheck = {
  clientId: string;
  food: string;
  risk: RevoraRisk;
  a1cBand: string;
  inputMethod: "text" | "voice";
  createdAt: string; // ISO
  actionDoneAt?: string;
};

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const STORAGE_KEY = "revora.history.v1";
// ponytail: hard cap keeps localStorage bounded; server history (4B) is the
// long-term memory.
const MAX_STORED_CHECKS = 500;

function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function createHistoryStore(storage: StorageLike | null) {
  function read(): StoredCheck[] {
    if (!storage) {
      return [];
    }

    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }

      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(
        (entry): entry is StoredCheck =>
          !!entry &&
          typeof entry === "object" &&
          typeof (entry as StoredCheck).clientId === "string" &&
          typeof (entry as StoredCheck).food === "string" &&
          typeof (entry as StoredCheck).createdAt === "string"
      );
    } catch {
      return [];
    }
  }

  function write(checks: StoredCheck[]): void {
    if (!storage) {
      return;
    }

    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(checks));
    } catch {
      // Quota or private-mode failure: history is a convenience, never fatal.
    }
  }

  function sortedNewestFirst(checks: StoredCheck[]): StoredCheck[] {
    return [...checks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  return {
    add(check: StoredCheck): void {
      const next = sortedNewestFirst([...read(), check]);
      write(next.slice(0, MAX_STORED_CHECKS));
    },

    all(): StoredCheck[] {
      return sortedNewestFirst(read());
    },

    today(now: Date = new Date()): StoredCheck[] {
      const todayKey = localDayKey(now);
      return this.all().filter(
        (check) => localDayKey(new Date(check.createdAt)) === todayKey
      );
    },

    recent(days: number, now: Date = new Date()): StoredCheck[] {
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - (days - 1));
      cutoff.setHours(0, 0, 0, 0);
      return this.all().filter(
        (check) => new Date(check.createdAt).getTime() >= cutoff.getTime()
      );
    },

    streak(now: Date = new Date()): number {
      const dayKeys = new Set(
        read().map((check) => localDayKey(new Date(check.createdAt)))
      );

      // Start today if checked today, else yesterday (today isn't over yet).
      const cursor = new Date(now);
      if (!dayKeys.has(localDayKey(cursor))) {
        cursor.setDate(cursor.getDate() - 1);
      }

      let streak = 0;
      while (dayKeys.has(localDayKey(cursor))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }

      return streak;
    },

    markActionDone(clientId: string, now: Date = new Date()): void {
      write(
        read().map((check) =>
          check.clientId === clientId
            ? { ...check, actionDoneAt: now.toISOString() }
            : check
        )
      );
    },

    clear(): void {
      storage?.removeItem(STORAGE_KEY);
    }
  };
}

function safeLocalStorage(): StorageLike | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export const historyStore = createHistoryStore(safeLocalStorage());
