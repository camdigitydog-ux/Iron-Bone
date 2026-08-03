import { dateKey, weekRange } from "@/lib/utils/date";
import type { ExerciseDefinition, ID, WorkoutSession } from "@/lib/domain";

/**
 * Uniform weekly working-set volume landmarks (Renaissance Periodization's
 * MEV/MAV/MRV framework, Israetel et al.): MEV is the floor below which a
 * muscle is undertrained, MAV the 10-20 set/week range most lifters progress
 * fastest in, MRV the recoverable ceiling past which added sets mostly add
 * fatigue instead of growth. Real landmarks vary per muscle (back and delts
 * tolerate more than biceps), but the app doesn't model per-muscle recovery,
 * so a single set of bands is used as a reasonable default across all of them.
 * https://rpstrength.com/expert-advice/training-volume-landmarks-muscle-growth
 */
export const MEV = 8;
export const MAV_HIGH = 20;
export const MRV = 25;

/** The muscle groups this section reports on — a coarser, display-friendly
 * subset of the tags exercises actually carry (which also include things
 * like calves/forearms/cardio that aren't typically volume-landmark-tracked). */
export const TRACKED_MUSCLES = [
  "chest",
  "back",
  "quads",
  "hamstrings",
  "shoulders",
  "biceps",
  "triceps",
  "core",
] as const;

export type TrackedMuscle = (typeof TRACKED_MUSCLES)[number];

export type VolumeZone = "below-mev" | "mav" | "near-mrv" | "above-mrv";

export interface MuscleVolumeEntry {
  muscle: TrackedMuscle;
  sets: number;
  zone: VolumeZone;
}

export function volumeZoneFor(sets: number): VolumeZone {
  if (sets < MEV) return "below-mev";
  if (sets <= MAV_HIGH) return "mav";
  if (sets <= MRV) return "near-mrv";
  return "above-mrv";
}

const isTrackedMuscle = (muscle: string): muscle is TrackedMuscle =>
  (TRACKED_MUSCLES as readonly string[]).includes(muscle);

/**
 * Counts non-warmup working sets logged this week (Mon-Sun) per tracked
 * muscle group. Attributed by primaryMuscles (falling back to muscleGroups
 * for exercises that predate that split) — a compound lift's set counts fully
 * toward each primary muscle it trains, which is how RP-style volume
 * accounting is normally done rather than splitting fractional credit.
 */
export function getWeeklyMuscleVolume(
  sessions: WorkoutSession[],
  exercises: Map<ID, ExerciseDefinition>,
  referenceDate: Date = new Date(),
): MuscleVolumeEntry[] {
  const { start, end } = weekRange(referenceDate);
  const startKey = dateKey(start);
  const endKey = dateKey(end);

  const counts: Record<TrackedMuscle, number> = {
    chest: 0,
    back: 0,
    quads: 0,
    hamstrings: 0,
    shoulders: 0,
    biceps: 0,
    triceps: 0,
    core: 0,
  };

  for (const session of sessions) {
    if (session.date < startKey || session.date > endKey) continue;

    for (const sessionExercise of session.exercises) {
      const exercise = exercises.get(sessionExercise.exerciseId);
      if (!exercise) continue;

      const muscles = exercise.primaryMuscles?.length ? exercise.primaryMuscles : exercise.muscleGroups;
      const trackedMuscles = muscles.filter(isTrackedMuscle);
      if (trackedMuscles.length === 0) continue;

      const workingSetCount = sessionExercise.sets.filter((set) => !set.isWarmup && set.reps > 0).length;
      if (workingSetCount === 0) continue;

      for (const muscle of trackedMuscles) {
        counts[muscle] += workingSetCount;
      }
    }
  }

  return TRACKED_MUSCLES.map((muscle) => ({
    muscle,
    sets: counts[muscle],
    zone: volumeZoneFor(counts[muscle]),
  }));
}
