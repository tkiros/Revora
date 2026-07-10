/**
 * Additive progress chip (design review decision 7A): "N days this week"
 * resets weekly by design and can never visually "break" — no loss-aversion
 * streak framing on a surface for anxious users. Streak math still runs
 * internally (day-1 first-win gate); this chip just doesn't display it.
 */
export function StreakChip({ daysThisWeek }: { daysThisWeek: number }) {
  if (daysThisWeek < 1) {
    return null;
  }

  return (
    <span className="streak-chip" data-testid="streak-chip">
      {daysThisWeek === 1 ? "1 day this week" : `${daysThisWeek} days this week`}
    </span>
  );
}
