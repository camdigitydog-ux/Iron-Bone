import { estimateOneRepMax } from "./oneRepMax";
import type { ExerciseDefinition, ID, MovementPattern, SetEntry, WorkoutSession } from "@/lib/domain";

export interface LastPerformance {
  date: string;
  topSet: SetEntry;
  estimatedOneRm: number;
  suggestedNextWeightLb: number;
}

// Squat/hinge/lunge patterns recruit far more total muscle mass per rep than
// an upper-body push/pull, so they tolerate (and need) a bigger jump to keep
// progressing — the standard beginner-program split of +10lb lower / +5lb
// upper body per session (e.g. StrongLifts, Starting Strength).
const LOWER_BODY_PATTERNS = new Set<MovementPattern>(["squat", "hinge", "lunge"]);

/** The set that best represents effort for a given exercise in a session —
 * highest weight x reps among non-warmup sets — shared by the "last time"
 * reference and the 1RM progress trend so both agree on what "top set" means. */
export function topSetOf(sets: SetEntry[]): SetEntry | undefined {
  const workingSets = sets.filter((set) => !set.isWarmup && set.weightLb > 0 && set.reps > 0);
  if (workingSets.length === 0) return undefined;
  return workingSets.reduce((best, set) =>
    set.weightLb * set.reps > best.weightLb * best.reps ? set : best,
  );
}

/**
 * Finds the most recent OTHER session (any date before today, excluding the
 * session currently being edited) that logged this exercise, and derives a
 * suggested next weight from its heaviest working set — repeat the weight if
 * that set was already near failure (RPE ≥ 9.5), otherwise add the standard
 * per-session increment. This is what turns "log a workout" into "train":
 * a concrete number to try and beat today, not just a blank form.
 */
export function findLastPerformance(
  sessions: WorkoutSession[],
  exerciseId: ID,
  excludeSessionId: ID,
  exercise: ExerciseDefinition | undefined,
): LastPerformance | undefined {
  const candidates = sessions
    .filter((session) => session.id !== excludeSessionId)
    .sort((a, b) => b.date.localeCompare(a.date));

  for (const session of candidates) {
    const match = session.exercises.find((sessionExercise) => sessionExercise.exerciseId === exerciseId);
    if (!match) continue;
    const topSet = topSetOf(match.sets);
    if (!topSet) continue;

    const increment = LOWER_BODY_PATTERNS.has(exercise?.movementPattern as MovementPattern) ? 10 : 5;
    const maxedOut = (topSet.rpe ?? 0) >= 9.5;

    return {
      date: session.date,
      topSet,
      estimatedOneRm: estimateOneRepMax(topSet.weightLb, topSet.reps),
      suggestedNextWeightLb: maxedOut ? topSet.weightLb : topSet.weightLb + increment,
    };
  }

  return undefined;
}
