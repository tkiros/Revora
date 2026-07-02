export function StreakChip({ streak }: { streak: number }) {
  if (streak < 1) {
    return null;
  }

  return (
    <span className="streak-chip" data-testid="streak-chip">
      Day {streak} of checking in
    </span>
  );
}
