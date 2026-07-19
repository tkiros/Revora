"use client";

import { useEffect } from "react";

import {
  track,
  type JourneyStageProp,
  type NudgeClass
} from "../lib/client/analytics";

/**
 * Emits `nudge_opened {class, stage}` (plan §10.1) when the app is opened from a
 * nudge. The service worker's notificationclick opens `/check?nudge=<class>&
 * stage=<stage>`; this reads those bounded params, fires the event once, then
 * strips them so a refresh never re-fires (same pattern as the account page's
 * ?subscribed handling). Unknown/absent params are ignored — nothing fires on a
 * direct visit.
 *
 * DECISION (Task 19, downstream-value linkage): there is NO `check_started`
 * event in this codebase (the check funnel emits `check_completed` from
 * food-check-form), so no `entry` prop is added. A nudge-originated check is
 * derivable by session sequence — a `nudge_opened` followed by a
 * `check_completed` — mirroring how the clarify funnel derives abandonment from
 * event order rather than a redundant prop. Adding a first-class `check_started`
 * event with an `entry` enum is a deliberate scope boundary / follow-up.
 */

const CLASSES: readonly NudgeClass[] = [
  "journey_step",
  "weekly_learning_ready",
  "generic"
];
const STAGES: readonly JourneyStageProp[] = ["1", "2", "3", "4", "5", "none"];

export function NudgeOpenTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawClass = params.get("nudge");
    if (!rawClass) {
      return;
    }
    const nudgeClass = CLASSES.includes(rawClass as NudgeClass)
      ? (rawClass as NudgeClass)
      : "generic";
    const rawStage = params.get("stage");
    const stage = STAGES.includes(rawStage as JourneyStageProp)
      ? (rawStage as JourneyStageProp)
      : "none";

    track({ name: "nudge_opened", props: { class: nudgeClass, stage } });

    // Strip nudge/stage so a refresh doesn't re-fire; keep any other params.
    params.delete("nudge");
    params.delete("stage");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (query ? `?${query}` : "")
    );
  }, []);

  return null;
}
