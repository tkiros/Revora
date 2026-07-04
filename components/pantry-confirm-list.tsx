"use client";

import { useState } from "react";

export type ConfirmItem = { name: string; portion: string };

export function PantryConfirmList({
  initialItems,
  onConfirm
}: {
  initialItems: ConfirmItem[];
  onConfirm: (items: ConfirmItem[]) => Promise<void>;
}) {
  const [rows, setRows] = useState<ConfirmItem[]>(initialItems);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(index: number, patch: Partial<ConfirmItem>) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  }

  const valid = rows.filter((row) => row.name.trim().length > 0);

  return (
    <div className="field-stack">
      <ul className="pantry-confirm-rows">
        {rows.map((row, index) => (
          <li key={index}>
            <label className="field-label" htmlFor={`item-name-${index}`}>
              Item {index + 1}
            </label>
            <input
              id={`item-name-${index}`}
              className="text-input"
              value={row.name}
              maxLength={160}
              onChange={(event) => update(index, { name: event.target.value })}
            />
            <input
              aria-label={`Portion for item ${index + 1}`}
              className="text-input"
              placeholder="Portion (optional)"
              value={row.portion}
              maxLength={80}
              onChange={(event) => update(index, { portion: event.target.value })}
            />
            <button
              type="button"
              className="pantry-row-delete"
              onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      {rows.length < 40 ? (
        <button
          type="button"
          className="primary-button pantry-add-row"
          onClick={() => setRows((current) => [...current, { name: "", portion: "" }])}
        >
          Add an item we missed
        </button>
      ) : (
        <p className="field-hint">That&apos;s the 40-item maximum for one review.</p>
      )}
      {error ? (
        <p className="field-error" aria-live="polite">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        className="primary-button"
        disabled={busy || valid.length === 0}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            await onConfirm(valid);
          } catch {
            setError("Saving didn't go through — your edits are still here. Try again.");
            setBusy(false);
          }
        }}
      >
        Review {valid.length} item{valid.length === 1 ? "" : "s"}
      </button>
    </div>
  );
}
