import type { CoachInsight } from "../lib/coach/insights";

export function InsightCard({ insight }: { insight: CoachInsight }) {
  return (
    <div className="insight-card" data-testid="insight-card">
      <p className="insight-eyebrow">One thing from your week</p>
      <p className="insight-text">{insight.text}</p>
    </div>
  );
}
