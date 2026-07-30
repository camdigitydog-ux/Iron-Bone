import { newId } from "@/lib/utils/id";
import type { ExerciseDefinition, SessionExercise, SetEntry, TemplateExercise } from "@/lib/domain";

/**
 * Ascending warm-up ramp before a compound lift's working sets — a structured ramp
 * outperforms no warm-up or a generic one for lifts above ~60% 1RM (NSCA position
 * stand on warm-up protocol). Weight is rounded to the nearest 5 lb plate increment.
 */
const WARMUP_RAMP: { pctOfWorking: number; reps: number }[] = [
  { pctOfWorking: 0.5, reps: 8 },
  { pctOfWorking: 0.75, reps: 4 },
];

function roundToFive(weight: number): number {
  return Math.round(weight / 5) * 5;
}

/**
 * Turns template exercises into a concrete session, prepending an evidence-based
 * warm-up ramp to each compound lift when a working weight is known.
 */
export function buildSessionExercises(
  templateExercises: TemplateExercise[],
  exerciseMap: Map<string, ExerciseDefinition>,
): SessionExercise[] {
  const warmedUpExerciseIds = new Set<string>();

  return templateExercises.map((templateExercise) => {
    const exercise = exerciseMap.get(templateExercise.exerciseId);
    const isCompound = exercise?.category === "main" || exercise?.mechanic === "compound";
    const workingWeight = templateExercise.targetWeightLb ?? 0;
    const workingReps = templateExercise.targetRepsMin ?? 8;

    const sets: SetEntry[] = [];
    let setNumber = 1;

    // A lift split across multiple rows (e.g. powerlifting's top set + backoffs)
    // only gets warmed up once — you're already warm for the backoffs.
    const needsWarmup = isCompound && !warmedUpExerciseIds.has(templateExercise.exerciseId);
    if (needsWarmup) {
      warmedUpExerciseIds.add(templateExercise.exerciseId);
    }

    if (needsWarmup) {
      for (const step of WARMUP_RAMP) {
        sets.push({
          id: newId(),
          setNumber: setNumber++,
          reps: step.reps,
          weightLb: workingWeight > 0 ? roundToFive(workingWeight * step.pctOfWorking) : 0,
          isWarmup: true,
        });
      }
    }

    for (let i = 0; i < templateExercise.targetSets; i++) {
      sets.push({
        id: newId(),
        setNumber: setNumber++,
        reps: workingReps,
        weightLb: workingWeight,
      });
    }

    return {
      id: newId(),
      exerciseId: templateExercise.exerciseId,
      order: templateExercise.order,
      sets,
    };
  });
}
