import { newId } from "@/lib/utils/id";
import { shuffle } from "@/lib/utils/random";
import type { ExerciseDefinition, ExerciseLevel, TemplateExercise, ID } from "@/lib/domain";
import { STYLE_PARAMS, type TrainingStyle } from "./trainingStyles";
import { WOD_ONLY_MOVEMENTS } from "./generateWod";

export interface GenerateWorkoutOptions {
  muscleGroups: string[];
  style: TrainingStyle;
  pinnedExerciseIds?: ID[];
  /** Overrides the style's default accessory count per muscle group. */
  accessoriesPerGroup?: number;
  /** Hard filter — only exercises using this equipment are eligible (empty/undefined = any). */
  equipment?: string[];
  /** Excludes exercises above this difficulty. */
  experienceLevel?: ExerciseLevel;
}

const LEVEL_RANK: Record<ExerciseLevel, number> = { beginner: 0, intermediate: 1, expert: 2 };

function levelAllowed(exerciseLevel: ExerciseLevel | undefined, maxLevel: ExerciseLevel | undefined): boolean {
  if (!maxLevel || !exerciseLevel) return true;
  return LEVEL_RANK[exerciseLevel] <= LEVEL_RANK[maxLevel];
}

function primaryMusclesOf(exercise: ExerciseDefinition): string[] {
  return exercise.primaryMuscles?.length ? exercise.primaryMuscles : exercise.muscleGroups;
}

function sharesPrimaryMuscle(exercise: ExerciseDefinition, included: ExerciseDefinition[]): boolean {
  const primary = primaryMusclesOf(exercise);
  return included.some((other) => primaryMusclesOf(other).some((m) => primary.includes(m)));
}

/**
 * Assembles a workout for a given training style by pinning any explicitly requested
 * exercises, then for each muscle group of interest adding one main lift (if one
 * exists and isn't already included) plus a configurable number of accessories —
 * preferring accessories that don't just re-hit an already-covered primary muscle.
 * Ordering puts compounds first, then interleaves push/pull accessories for balance.
 * See trainingStyles.ts for the research behind each style's rep/set/rest scheme.
 */
export function generateWorkout(
  exercises: ExerciseDefinition[],
  {
    muscleGroups,
    style,
    pinnedExerciseIds = [],
    accessoriesPerGroup,
    equipment,
    experienceLevel,
  }: GenerateWorkoutOptions,
): TemplateExercise[] {
  const params = STYLE_PARAMS[style];
  const accessoryCount = accessoriesPerGroup ?? params.accessoriesPerGroupDefault;

  // Shuffled once up front so every filter/sort below (which is stable) still
  // breaks ties randomly — clicking Generate again with the same inputs gives
  // a genuinely different workout instead of the same deterministic pick.
  const pool = shuffle(exercises);
  const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const includedIds = new Set<ID>();
  const orderedMain: ExerciseDefinition[] = [];
  const orderedAccessory: ExerciseDefinition[] = [];

  function passesFilters(exercise: ExerciseDefinition): boolean {
    // WOD-only movements (thrusters, box jumps, double-unders...) belong to the
    // CrossFit metcon generator, not a straight-sets session in any other style.
    if (WOD_ONLY_MOVEMENTS.has(exercise.name)) return false;
    if (equipment && equipment.length > 0 && exercise.equipment && !equipment.includes(exercise.equipment)) {
      return false;
    }
    return levelAllowed(exercise.level, experienceLevel);
  }

  function equipmentScore(exercise: ExerciseDefinition): number {
    if (!params.preferredEquipment || !exercise.equipment) return 0;
    return params.preferredEquipment.includes(exercise.equipment) ? 1 : 0;
  }

  function includeMain(exercise: ExerciseDefinition) {
    if (includedIds.has(exercise.id)) return;
    includedIds.add(exercise.id);
    orderedMain.push(exercise);
  }

  function includeAccessory(exercise: ExerciseDefinition) {
    if (includedIds.has(exercise.id)) return;
    includedIds.add(exercise.id);
    orderedAccessory.push(exercise);
  }

  for (const id of pinnedExerciseIds) {
    const exercise = byId.get(id);
    if (!exercise) continue;
    if (exercise.category === "main") includeMain(exercise);
    else includeAccessory(exercise);
  }

  for (const group of muscleGroups) {
    const candidates = pool
      .filter((exercise) => exercise.muscleGroups.includes(group) && !includedIds.has(exercise.id))
      .filter(passesFilters)
      .sort((a, b) => equipmentScore(b) - equipmentScore(a));

    const mainLift = candidates.find((exercise) => exercise.category === "main");
    if (mainLift) includeMain(mainLift);

    const accessoryCandidates = candidates
      .filter((exercise) => exercise.category === "accessory" && !includedIds.has(exercise.id))
      .sort((a, b) => {
        const included = [...orderedMain, ...orderedAccessory];
        const score = (exercise: ExerciseDefinition) => {
          let s = 0;
          if (params.preferMechanic && exercise.mechanic === params.preferMechanic) s += 1;
          if (!sharesPrimaryMuscle(exercise, included)) s += 1;
          return s;
        };
        return score(b) - score(a);
      });
    accessoryCandidates.slice(0, accessoryCount).forEach(includeAccessory);
  }

  // Style-defined movement patterns that round out the session regardless of which
  // muscle groups were picked (e.g. functional fitness always closes with a carry).
  for (const pattern of params.alwaysInclude ?? []) {
    const alreadyCovered = [...orderedMain, ...orderedAccessory].some(
      (exercise) => exercise.movementPattern === pattern,
    );
    if (alreadyCovered) continue;
    const candidate = pool
      .filter((exercise) => exercise.movementPattern === pattern && !includedIds.has(exercise.id))
      .filter(passesFilters)
      .sort((a, b) => equipmentScore(b) - equipmentScore(a))[0];
    if (candidate) includeAccessory(candidate);
  }

  // Compounds lead the session; accessories interleave push/pull so the workout
  // doesn't hammer one side of a joint before the other gets any work.
  const pushAccessories = orderedAccessory.filter((exercise) => exercise.force === "push");
  const pullAccessories = orderedAccessory.filter((exercise) => exercise.force === "pull");
  const otherAccessories = orderedAccessory.filter(
    (exercise) => exercise.force !== "push" && exercise.force !== "pull",
  );
  const interleaved: ExerciseDefinition[] = [];
  const rounds = Math.max(pushAccessories.length, pullAccessories.length);
  for (let i = 0; i < rounds; i++) {
    if (pushAccessories[i]) interleaved.push(pushAccessories[i]);
    if (pullAccessories[i]) interleaved.push(pullAccessories[i]);
  }
  interleaved.push(...otherAccessories);

  const rows: TemplateExercise[] = [];
  let order = 0;

  for (const exercise of orderedMain) {
    // Powerlifting trains its main lifts as a top set + backoffs — the actual
    // convention (RPE 8-9 top single/double/triple, then 3-5 backoff sets at
    // ~70-85% for more reps) rather than uniform straight sets.
    if (style === "powerlifting") {
      rows.push({
        id: newId(),
        exerciseId: exercise.id,
        order: order++,
        targetSets: 1,
        targetRepsMin: 2,
        targetRepsMax: 3,
        restSec: params.restMainSec,
        notes: "Top set — work up to a heavy double or triple.",
      });
      rows.push({
        id: newId(),
        exerciseId: exercise.id,
        order: order++,
        targetSets: 4,
        targetRepsMin: 5,
        targetRepsMax: 8,
        restSec: 150,
        notes: "Backoff sets — drop ~10–15% from your top set.",
      });
      continue;
    }
    rows.push({
      id: newId(),
      exerciseId: exercise.id,
      order: order++,
      targetSets: params.mainSets,
      targetRepsMin: params.mainRepsMin,
      targetRepsMax: params.mainRepsMax,
      restSec: params.restMainSec,
    });
  }

  for (const exercise of interleaved) {
    rows.push({
      id: newId(),
      exerciseId: exercise.id,
      order: order++,
      targetSets: params.accessorySets,
      targetRepsMin: params.accessoryRepsMin,
      targetRepsMax: params.accessoryRepsMax,
      restSec: params.restAccessorySec,
      // Bodybuilding is about feeling the target muscle work, not just moving
      // the weight — a real coaching cue, not a numeric tweak.
      notes: style === "bodybuilding" ? "Slow negative, full stretch, squeeze at peak contraction." : undefined,
    });
  }

  return rows;
}
