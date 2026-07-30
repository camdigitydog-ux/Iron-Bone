import type { BaseEntity, ID } from "./common";

export type ExerciseCategory = "main" | "accessory";

/** How the exercise loads the target muscles — mirrors free-exercise-db's taxonomy
 * so imported exercises carry this through instead of being flattened away. */
export type ExerciseMechanic = "compound" | "isolation";
export type ExerciseForce = "push" | "pull" | "static";
export type ExerciseLevel = "beginner" | "intermediate" | "expert";

/**
 * The fundamental movement the exercise trains. This is what programming logic
 * actually reasons about — balancing push vs. pull, making sure a leg day covers
 * both a squat and a hinge pattern, etc. — rather than the looser muscleGroups tags.
 */
export type MovementPattern =
  | "squat"
  | "hinge"
  | "lunge"
  | "horizontal_push"
  | "vertical_push"
  | "horizontal_pull"
  | "vertical_pull"
  | "core"
  | "carry"
  | "isolation"
  | "olympic"
  | "monostructural"
  | "full_body";

/** CrossFit's three training modalities — a well-built WOD balances across them
 * rather than drawing every movement from the same bucket (e.g. "Fran" pairs a
 * weightlifting push with a gymnastics pull). */
export type Modality = "weightlifting" | "gymnastics" | "monostructural";

export interface ExerciseDefinition extends BaseEntity {
  name: string;
  /** Primary + secondary muscles combined, for simple display/filtering. */
  muscleGroups: string[];
  /** Muscles this exercise is chiefly training — used to avoid picking two
   * exercises that redundantly hit the same primary muscle. */
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  equipment?: string;
  category: ExerciseCategory;
  mechanic?: ExerciseMechanic;
  force?: ExerciseForce;
  level?: ExerciseLevel;
  movementPattern?: MovementPattern;
  modality?: Modality;
  /** Step-by-step form cues, shown in the picker and while logging a session. */
  instructions?: string[];
  isCustom: boolean;
  notes?: string;
}

export interface TemplateExercise {
  id: ID;
  exerciseId: ID;
  order: number;
  targetSets: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
  targetWeightLb?: number;
  /** What the rep count actually counts — plain reps unless this is a
   * monostructural WOD movement prescribed by calories or distance. */
  unit?: "reps" | "calories" | "meters";
  /** Suggested rest between working sets, in seconds — derived from the training
   * goal (strength/hypertrophy/endurance) at generation time. */
  restSec?: number;
  notes?: string;
}

export interface WorkoutTemplate extends BaseEntity {
  name: string;
  description?: string;
  exercises: TemplateExercise[];
}

export interface SetEntry {
  id: ID;
  setNumber: number;
  reps: number;
  weightLb: number;
  rpe?: number;
  isWarmup?: boolean;
  notes?: string;
}

export interface SessionExercise {
  id: ID;
  exerciseId: ID;
  order: number;
  sets: SetEntry[];
}

export interface WorkoutSession extends BaseEntity {
  templateId?: ID;
  date: string; // yyyy-MM-dd
  startedAt?: string;
  completedAt?: string;
  exercises: SessionExercise[];
  notes?: string;
}

export function isSessionCompleted(session: WorkoutSession): boolean {
  return Boolean(session.completedAt);
}

export function totalVolumeLb(session: WorkoutSession): number {
  return session.exercises.reduce((sessionTotal, exercise) => {
    const exerciseTotal = exercise.sets.reduce((setTotal, set) => {
      if (set.isWarmup) return setTotal;
      return setTotal + set.reps * set.weightLb;
    }, 0);
    return sessionTotal + exerciseTotal;
  }, 0);
}
