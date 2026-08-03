/**
 * Epley and Brzycki agree closely at low reps and diverge as reps climb —
 * Epley reads a touch high, Brzycki a touch low — and averaging validated
 * formulas gives a more reliable estimate than trusting either alone.
 * Both lose real accuracy past ~12 reps (Brzycki is undefined at 37), so
 * that's treated as a hard ceiling rather than extrapolated further.
 */
export function estimateOneRepMax(weightLb: number, reps: number): number {
  if (weightLb <= 0 || reps <= 0) return 0;
  if (reps === 1) return weightLb;

  const cappedReps = Math.min(reps, 12);
  const epley = weightLb * (1 + cappedReps / 30);
  const brzycki = weightLb * (36 / (37 - cappedReps));
  return (epley + brzycki) / 2;
}
