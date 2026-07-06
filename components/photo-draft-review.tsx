"use client";

import { useState } from "react";

import type { MealDraftItem } from "../lib/meal/photo-extract";
import { composeDraftText } from "../lib/client/photo-draft";

/** D5 confirm-before-verdict review card. Uncertain chips must be tapped
 *  (confirm) or removed before the draft can be used — no blanket accept of
 *  flagged doubts. Confirming composes plain text into the food textarea;
 *  the existing form and engine take it from there. */
export function PhotoDraftReview({
  dish,
  items,
  onConfirm,
  onDiscard
}: {
  dish: string | null;
  items: MealDraftItem[];
  onConfirm: (text: string) => void;
  onDiscard: () => void;
}) {
  const [draftDish, setDraftDish] = useState(dish ?? "");
  const [draftItems, setDraftItems] = useState<MealDraftItem[]>(items);
  const [newItem, setNewItem] = useState("");

  const unresolved = draftItems.filter((item) => item.uncertain).length;
  const isEmpty = draftDish.trim() === "" && draftItems.length === 0;

  return (
    <section className="draft-card" data-testid="photo-draft-review">
      <p className="result-eyebrow">Check the draft</p>
      <p className="field-hint">
        This is Revora&apos;s best guess from your photo. Fix anything that&apos;s
        off — tap the highlighted items to confirm them.
      </p>
      <label htmlFor="draft-dish" className="field-label">
        Dish
      </label>
      <input
        id="draft-dish"
        className="text-input"
        value={draftDish}
        placeholder="What is this meal?"
        onChange={(event) => setDraftDish(event.target.value)}
      />
      <ul className="chip-list">
        {draftItems.map((item, index) => (
          <li
            key={`${item.name}-${index}`}
            className={item.uncertain ? "chip chip-uncertain" : "chip"}
            data-testid={item.uncertain ? "chip-uncertain" : "chip"}
          >
            <button
              type="button"
              className="chip-label"
              title={item.uncertain ? "Tap to confirm this item" : undefined}
              onClick={() =>
                setDraftItems((current) =>
                  current.map((entry, i) =>
                    i === index ? { ...entry, uncertain: false } : entry
                  )
                )
              }
            >
              {item.portion ? `${item.name} (${item.portion})` : item.name}
              {item.uncertain ? " — not sure, tap to confirm" : ""}
            </button>
            <button
              type="button"
              className="chip-remove"
              aria-label={`Remove ${item.name}`}
              onClick={() =>
                setDraftItems((current) => current.filter((_, i) => i !== index))
              }
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="chip-add-row">
        <input
          className="text-input"
          value={newItem}
          placeholder="Add something it missed"
          onChange={(event) => setNewItem(event.target.value)}
        />
        <button
          type="button"
          className="secondary-button"
          disabled={newItem.trim() === ""}
          onClick={() => {
            setDraftItems((current) => [
              ...current,
              { name: newItem.trim(), portion: null, uncertain: false }
            ]);
            setNewItem("");
          }}
        >
          Add
        </button>
      </div>
      <button
        type="button"
        className="primary-button"
        data-testid="draft-confirm-button"
        disabled={unresolved > 0 || isEmpty}
        onClick={() =>
          onConfirm(composeDraftText(draftDish.trim() || null, draftItems))
        }
      >
        {unresolved > 0
          ? `Confirm ${unresolved} highlighted item${unresolved === 1 ? "" : "s"} first`
          : "Use this description"}
      </button>
      <button type="button" className="link-button-plain" onClick={onDiscard}>
        Discard and type instead
      </button>
    </section>
  );
}
