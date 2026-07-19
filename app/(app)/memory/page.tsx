"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { RISK_LABELS } from "../../../lib/revora/labels";
import { mealMemoryUiEnabled } from "../../../lib/meal-memory-flag";
import {
  deleteAllMealMemories,
  deleteMealMemory,
  editMealMemory,
  searchMealMemories,
  MEMORY_EASE_OPTIONS,
  MEMORY_LABEL_OPTIONS,
  type MemoryEase,
  type MemoryEditInput,
  type MemoryLabel,
  type SavedMemory
} from "../../../lib/client/memory";

/**
 * Meal memory controls (plan §P3.4). Search, edit user-authored fields, export,
 * delete one, and delete all — all over the caller's OWN memories. The explainer
 * stays visible: memory is theirs and never changes how Revora checks a meal
 * (global constraint §1). Ships behind the meal-memory build flag; a build with
 * the flag off renders an inert not-available state (never routes anyone here).
 *
 * Error-truth (global constraint §7): a failed search / edit / delete surfaces an
 * explicit retry state, never an empty list or a paywall.
 */

type ViewStatus = "loading" | "guest" | "ready" | "unavailable" | "error";

const EASE_LABEL = new Map(MEMORY_EASE_OPTIONS.map((o) => [o.value, o.label]));
const LABEL_LABEL = new Map(MEMORY_LABEL_OPTIONS.map((o) => [o.value, o.label]));

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
}

type EditDraft = {
  choice: string;
  note: string;
  wouldRepeat: "unset" | "yes" | "no";
  ease: MemoryEase | "";
  label: MemoryLabel | "";
  favorite: boolean;
};

function draftOf(memory: SavedMemory): EditDraft {
  return {
    choice: memory.choice ?? "",
    note: memory.note ?? "",
    wouldRepeat:
      memory.wouldRepeat === true
        ? "yes"
        : memory.wouldRepeat === false
          ? "no"
          : "unset",
    ease: memory.ease ?? "",
    label: memory.label ?? "",
    favorite: memory.favorite
  };
}

// Turn an edit draft into a merge patch: every field is sent, so cleared text
// becomes null and an "unset" reflection clears to null. The server whitelist
// accepts only these user-authored fields.
function patchOf(draft: EditDraft): MemoryEditInput {
  return {
    choice: draft.choice.trim() ? draft.choice.trim() : null,
    note: draft.note.trim() ? draft.note.trim() : null,
    wouldRepeat:
      draft.wouldRepeat === "yes"
        ? true
        : draft.wouldRepeat === "no"
          ? false
          : null,
    ease: draft.ease === "" ? null : draft.ease,
    label: draft.label === "" ? null : draft.label,
    favorite: draft.favorite
  };
}

export default function MemoryPage() {
  // The build flag is inlined at build time (same on server + client render), so
  // it is safe to seed the initial state from it — no setState-in-effect.
  const [status, setStatus] = useState<ViewStatus>(() =>
    mealMemoryUiEnabled() ? "loading" : "unavailable"
  );
  const [memories, setMemories] = useState<SavedMemory[]>([]);
  // Server caps a page at 50 (MAX_LIMIT) and returns `nextOffset` for the rest;
  // consuming it lets a user with >50 memories reach all of them (U6).
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [query, setQuery] = useState("");
  const [searchError, setSearchError] = useState(false);
  const [searching, setSearching] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  function parseMemoryPage(body: unknown): {
    memories: SavedMemory[];
    nextOffset: number | null;
  } {
    if (typeof body !== "object" || body === null) {
      return { memories: [], nextOffset: null };
    }
    const record = body as { memories?: SavedMemory[]; nextOffset?: unknown };
    return {
      memories: record.memories ?? [],
      nextOffset:
        typeof record.nextOffset === "number" ? record.nextOffset : null
    };
  }

  async function loadList(): Promise<void> {
    try {
      const response = await fetch("/api/memory");
      if (response.status === 401) {
        setStatus("guest");
        return;
      }
      if (response.status === 403 || response.status === 404) {
        setStatus("unavailable");
        return;
      }
      if (!response.ok) {
        setStatus("error");
        return;
      }
      const page = parseMemoryPage(await response.json());
      setMemories(page.memories);
      setNextOffset(page.nextOffset);
      setLoadMoreError(false);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  // Append the next page. A failure here is a non-destructive inline error —
  // never blows the loaded list away to the full-page error surface.
  async function onLoadMore(): Promise<void> {
    if (nextOffset === null || loadingMore) {
      return;
    }
    setLoadingMore(true);
    setLoadMoreError(false);
    try {
      const response = await fetch(`/api/memory?offset=${nextOffset}`);
      if (!response.ok) {
        setLoadMoreError(true);
        return;
      }
      const page = parseMemoryPage(await response.json());
      setMemories((prev) => [...prev, ...page.memories]);
      setNextOffset(page.nextOffset);
    } catch {
      setLoadMoreError(true);
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    if (!mealMemoryUiEnabled()) {
      return;
    }
    void loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSearch(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    const term = query.trim();
    setSearchError(false);
    if (!term) {
      // Empty search returns to the full list.
      await loadList();
      return;
    }
    setSearching(true);
    const result = await searchMealMemories(term);
    setSearching(false);
    if (!result.ok) {
      // Error-truth: a failed search is an explicit retry state, never "no results".
      setSearchError(true);
      return;
    }
    setMemories(result.memories);
    // Search returns a single bounded result set — no pagination cursor.
    setNextOffset(null);
    setLoadMoreError(false);
    setStatus("ready");
  }

  function beginEdit(memory: SavedMemory): void {
    setActionError(null);
    setEditingId(memory.id);
    setDraft(draftOf(memory));
  }

  function cancelEdit(): void {
    setEditingId(null);
    setDraft(null);
  }

  async function saveEdit(id: string): Promise<void> {
    if (!draft) {
      return;
    }
    setActionError(null);
    const ok = await editMealMemory(id, patchOf(draft));
    if (!ok) {
      setActionError("Couldn't save that change. Please try again.");
      return;
    }
    cancelEdit();
    await loadList();
  }

  async function onDeleteOne(id: string): Promise<void> {
    setActionError(null);
    const ok = await deleteMealMemory(id);
    if (!ok) {
      setActionError("Couldn't delete that entry. Please try again.");
      return;
    }
    await loadList();
  }

  async function onDeleteAll(): Promise<void> {
    setActionError(null);
    const ok = await deleteAllMealMemories();
    setConfirmDeleteAll(false);
    if (!ok) {
      setActionError("Couldn't clear your memory. Please try again.");
      return;
    }
    setQuery("");
    await loadList();
  }

  return (
    <main className="page-narrow" data-testid="memory-page">
      <h1 className="page-title">Your meal memory</h1>
      <p className="result-disclaimer" data-testid="memory-page-explainer">
        Your memory is yours. It never changes how Revora checks a meal — only
        your current meal description affects a check, never your notes.
      </p>

      {status === "loading" ? (
        <p className="placeholder-copy">Loading your memory…</p>
      ) : null}

      {status === "guest" ? (
        <p className="placeholder-copy" data-testid="memory-guest">
          <Link className="inline-link" href="/signin">
            Sign in
          </Link>{" "}
          to keep a meal memory.
        </p>
      ) : null}

      {status === "unavailable" ? (
        <p className="placeholder-copy" data-testid="memory-unavailable">
          Meal memory isn&apos;t available on your plan yet.
        </p>
      ) : null}

      {status === "error" ? (
        <p className="placeholder-copy" data-testid="memory-error">
          Something went wrong loading your memory. Please try again.
        </p>
      ) : null}

      {status === "ready" ? (
        <>
          <div className="memory-controls">
            <form
              className="memory-search"
              onSubmit={(event) => void onSearch(event)}
              data-testid="memory-search"
            >
              <label className="sr-only" htmlFor="memory-search-input">
                Search your meals
              </label>
              <input
                id="memory-search-input"
                className="text-input"
                type="text"
                inputMode="search"
                placeholder="Search your meals or notes"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button
                type="submit"
                className="primary-button"
                disabled={searching}
              >
                {searching ? "Searching…" : "Search"}
              </button>
              {query ? (
                <button
                  type="button"
                  className="recheck-button"
                  onClick={() => {
                    setQuery("");
                    setSearchError(false);
                    void loadList();
                  }}
                >
                  Clear
                </button>
              ) : null}
            </form>
            <a
              className="recheck-button"
              href="/api/memory/export"
              download
              data-testid="memory-export"
            >
              Export
            </a>
          </div>

          {searchError ? (
            <p className="placeholder-copy" data-testid="memory-search-error">
              Search didn&apos;t work just now. Please try again.
            </p>
          ) : null}

          {actionError ? (
            <p className="placeholder-copy" data-testid="memory-action-error">
              {actionError}
            </p>
          ) : null}

          {memories.length === 0 ? (
            <p className="placeholder-copy" data-testid="memory-empty">
              {query
                ? "No saved meals match that search."
                : "Nothing saved yet. Save a check to your meal memory and it shows up here."}
            </p>
          ) : (
            <ul className="memory-list" data-testid="memory-list">
              {memories.map((memory) => (
                <li
                  key={memory.id}
                  className="memory-item"
                  data-testid="memory-item"
                >
                  <div className="memory-item-head">
                    <span className="memory-food">
                      {memory.favorite ? (
                        <span aria-label="Favorite" title="Favorite">
                          ★{" "}
                        </span>
                      ) : null}
                      {memory.food ?? "(unreadable entry)"}
                    </span>
                    <span
                      className="risk-chip"
                      data-risk={memory.risk}
                      data-testid="memory-band"
                    >
                      {RISK_LABELS[memory.risk]}
                    </span>
                  </div>
                  <p className="memory-date">{formatDate(memory.createdAt)}</p>

                  {editingId === memory.id && draft ? (
                    <div className="memory-edit" data-testid="memory-edit">
                      <label className="field-label">
                        Chose
                        <input
                          className="text-input"
                          type="text"
                          value={draft.choice}
                          maxLength={200}
                          onChange={(event) =>
                            setDraft({ ...draft, choice: event.target.value })
                          }
                        />
                      </label>
                      <label className="field-label">
                        Note
                        <input
                          className="text-input"
                          type="text"
                          value={draft.note}
                          maxLength={500}
                          onChange={(event) =>
                            setDraft({ ...draft, note: event.target.value })
                          }
                        />
                      </label>
                      <label className="field-label">
                        Again?
                        <select
                          className="text-input"
                          value={draft.wouldRepeat}
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              wouldRepeat: event.target
                                .value as EditDraft["wouldRepeat"]
                            })
                          }
                        >
                          <option value="unset">—</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </label>
                      <label className="field-label">
                        Felt
                        <select
                          className="text-input"
                          value={draft.ease}
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              ease: event.target.value as EditDraft["ease"]
                            })
                          }
                        >
                          <option value="">—</option>
                          {MEMORY_EASE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="field-label">
                        Label
                        <select
                          className="text-input"
                          value={draft.label}
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              label: event.target.value as EditDraft["label"]
                            })
                          }
                        >
                          <option value="">—</option>
                          {MEMORY_LABEL_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="field-label field-label--inline">
                        <input
                          type="checkbox"
                          checked={draft.favorite}
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              favorite: event.target.checked
                            })
                          }
                        />
                        Favorite
                      </label>
                      <div className="memory-item-buttons">
                        <button
                          type="button"
                          className="primary-button"
                          data-testid="memory-save"
                          onClick={() => void saveEdit(memory.id)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="recheck-button"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {memory.choice ? (
                        <p
                          className="memory-field"
                          data-testid="memory-item-choice"
                        >
                          <strong>Chose:</strong> {memory.choice}
                        </p>
                      ) : null}
                      {memory.wouldRepeat !== null ? (
                        <p className="memory-field">
                          <strong>Again?</strong>{" "}
                          {memory.wouldRepeat ? "Yes" : "No"}
                        </p>
                      ) : null}
                      {memory.ease ? (
                        <p className="memory-field">
                          <strong>Felt:</strong> {EASE_LABEL.get(memory.ease)}
                        </p>
                      ) : null}
                      {memory.label ? (
                        <p className="memory-field">
                          <strong>Label:</strong> {LABEL_LABEL.get(memory.label)}
                        </p>
                      ) : null}
                      {memory.note ? (
                        <p
                          className="memory-field"
                          data-testid="memory-item-note"
                        >
                          <strong>Note:</strong> {memory.note}
                        </p>
                      ) : null}
                      <div className="memory-item-buttons">
                        <button
                          type="button"
                          className="recheck-button"
                          data-testid="memory-edit-button"
                          onClick={() => beginEdit(memory)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="recheck-button"
                          data-testid="memory-delete-button"
                          onClick={() => void onDeleteOne(memory.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          {nextOffset !== null && !query ? (
            <div className="memory-load-more">
              <button
                type="button"
                className="recheck-button"
                data-testid="memory-load-more"
                onClick={() => void onLoadMore()}
                disabled={loadingMore}
              >
                {loadingMore
                  ? "Loading…"
                  : loadMoreError
                    ? "Couldn't load more — Retry"
                    : "Load more"}
              </button>
              {loadMoreError ? (
                <p
                  className="placeholder-copy"
                  data-testid="memory-load-more-error"
                >
                  Something went wrong loading more. Your memory is safe — try
                  again.
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="memory-danger" data-testid="memory-delete-all">
            {confirmDeleteAll ? (
              <>
                <p className="placeholder-copy">
                  Delete everything in your meal memory? This can&apos;t be
                  undone.
                </p>
                <div className="memory-item-buttons">
                  <button
                    type="button"
                    className="recheck-button"
                    data-testid="memory-delete-all-confirm"
                    onClick={() => void onDeleteAll()}
                  >
                    Yes, delete all my memory
                  </button>
                  <button
                    type="button"
                    className="recheck-button"
                    onClick={() => setConfirmDeleteAll(false)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                className="recheck-button"
                data-testid="memory-delete-all-start"
                onClick={() => setConfirmDeleteAll(true)}
                disabled={memories.length === 0 && !query}
              >
                Delete all my memory
              </button>
            )}
          </div>
        </>
      ) : null}
    </main>
  );
}
