import { estimateOneRepMax } from "./oneRepMax";
import { topSetOf } from "./exerciseHistory";
import type { ID, WorkoutSession } from "@/lib/domain";

/**
 * A 1RM estimate only means something for a heavy, low-ish-rep compound
 * barbell lift — the classic "big five" programs are built around, rather
 * than every exercise that's ever appeared in a session (an estimated max on
 * a lateral raise isn't a number anyone tracks). Matched by name against the
 * curated exercise library rather than a hardcoded ID since seeded IDs are
 * generated per install.
 */
export const TRACKABLE_LIFT_NAMES = [
  "Barbell Back Squat",
  "Barbell Bench Press",
  "Conventional Deadlift",
  "Overhead Press",
  "Barbell Row",
] as const;

export interface OneRepMaxDataPoint {
  date: string;
  estimatedOneRm: number;
}

/**
 * Walks every session chronologically and takes each one's top working set
 * for the given exercise, converting it to an estimated 1RM — the same
 * estimator already used for the fleeting "last time" reference while
 * logging, just plotted across every session instead of shown once.
 */
export function getOneRepMaxTrend(sessions: WorkoutSession[], exerciseId: ID): OneRepMaxDataPoint[] {
  const chronological = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  const points: OneRepMaxDataPoint[] = [];

  for (const session of chronological) {
    const setsForExercise = session.exercises
      .filter((sessionExercise) => sessionExercise.exerciseId === exerciseId)
      .flatMap((sessionExercise) => sessionExercise.sets);
    const topSet = topSetOf(setsForExercise);
    if (!topSet) continue;
    points.push({ date: session.date, estimatedOneRm: estimateOneRepMax(topSet.weightLb, topSet.reps) });
  }

  return points;
}
