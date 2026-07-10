"use client";

import { useEffect, useState } from "react";

import { loadHistory } from "../lib/client/remote-history";
import { deriveInsight, type CoachInsight } from "../lib/coach/insights";
import { InsightCard } from "./insight-card";

/**
 * The dashboard insight slot (eng amendment #5). The server can only derive
 * daypart insights (its compute is deliberately food-blind), so after paint
 * this hydrates via the existing signed-in history read and upgrades to a
 * repeat_meal insight when one applies — swapping TEXT inside the existing
 * card only, never adding or removing the card post-paint (amendment #14).
 */
export function DashboardInsight({
  initial,
  canUpgrade
}: {
  initial: CoachInsight | null;
  canUpgrade: boolean;
}) {
  const [insight, setInsight] = useState(initial);

  useEffect(() => {
    if (!canUpgrade || !initial) {
      return;
    }
    let cancelled = false;
    (async () => {
      const { source, checks } = await loadHistory(35);
      if (cancelled || source !== "server") {
        return;
      }
      const upgraded = deriveInsight(checks);
      if (upgraded && upgraded.id === "repeat_meal") {
        setInsight(upgraded);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canUpgrade, initial]);

  if (!insight) {
    return null;
  }

  return (
    <div className="dash-card" data-testid="dash-insight">
      <InsightCard insight={insight} />
    </div>
  );
}
