"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { RISK_LABELS } from "../../../lib/revora/labels";
import { mealMemoryUiEnabled } from "../../../lib/meal-memory-flag";
import {
  MEMORY_EASE_OPTIONS,
  MEMORY_LABEL_OPTIONS,
  type MemoryEase,
  type MemoryLabel
} from "../../../lib/client/memory";

/**
 * Meal memory list (plan §P3.2). List-ONLY in this task — search / edit / delete
 * land in Task 16. Ships behind the meal-memory build flag; a build with the
 * flag off never routes anyone here (the page renders an inert not-available
 * state rather than 404-ing the router).
 *
 * The list renders the user's own words back to them (food, choice, note) plus
 * the band chip the check produced — never a new verdict. The explainer states
 * the boundary: memory is theirs and never changes how Revora checks a meal.
 */

type Memory = {
  id: string;
  checkId: string;
  food: string | null;
  risk: "SAFE" | "MODERATE" | "HIGH";
  choice: string | null;
  wouldRepeat: boolean | null;
  ease: MemoryEase | null;
  note: string | null;
  favorite: boolean;
  label: MemoryLabel | null;
  createdAt: string;
  updatedAt: string;
};

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

export default function MemoryPage() {
  // The build flag is inlined at build time (same on server + client render), so
  // it is safe to seed the initial state from it — no setState-in-effect.
  const [status, setStatus] = useState<ViewStatus>(() =>
    mealMemoryUiEnabled() ? "loading" : "unavailable"
  );
  const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    if (!mealMemoryUiEnabled()) {
      return;
    }
    let active = true;
    void (async () => {
      try {
        const response = await fetch("/api/memory");
        if (!active) {
          return;
        }
        if (response.status === 401) {
          setStatus("guest");
          return;
        }
        // 403 (not entitled) / 404 (flag off server-side): the feature is not
        // available to this caller — an explicit unavailable state, never a
        // paywall dressed as an error (global constraint §7).
        if (response.status === 403 || response.status === 404) {
          setStatus("unavailable");
          return;
        }
        if (!response.ok) {
          setStatus("error");
          return;
        }
        const body: unknown = await response.json();
        const list =
          typeof body === "object" && body !== null
            ? ((body as { memories?: Memory[] }).memories ?? [])
            : [];
        setMemories(list);
        setStatus("ready");
      } catch {
        if (active) {
          setStatus("error");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="page-narrow" data-testid="memory-page">
      <h1 className="page-title">Your meal memory</h1>
      <p className="result-disclaimer" data-testid="memory-page-explainer">
        Your memory is yours. It never changes how Revora checks a meal.
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

      {status === "ready" && memories.length === 0 ? (
        <p className="placeholder-copy" data-testid="memory-empty">
          Nothing saved yet. Save a check to your meal memory and it shows up
          here.
        </p>
      ) : null}

      {status === "ready" && memories.length > 0 ? (
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
              {memory.choice ? (
                <p className="memory-field" data-testid="memory-item-choice">
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
                <p className="memory-field" data-testid="memory-item-note">
                  <strong>Note:</strong> {memory.note}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
