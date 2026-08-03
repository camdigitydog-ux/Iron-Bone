import { newId } from "@/lib/utils/id";
import { shuffle } from "@/lib/utils/random";
import type { ExerciseDefinition, Modality, TemplateExercise, ID } from "@/lib/domain";

/**
 * A real CrossFit-style session, not a straight-sets workout — sourced from
 * standard class structure (warm-up → strength/skill → metcon,
 * https://www.gowod.app/blog/what-is-a-crossfit-workout), the classic WOD
 * formats (AMRAP, For Time, EMOM, chipper — https://gymdesk.com/blog/crossfit-wods),
 * the couplet/triplet principle of balancing weightlifting + gymnastics +
 * monostructural movements rather than repeating one modality
 * (https://boxlifemagazine.com/why-the-majority-of-your-workouts-should-be-couplets-and-triplets/),
 * the iconic 21-15-9 descending ladder popularized by "Fran" — a thruster
 * (weightlifting push) paired with pull-ups (gymnastics pull)
 * (https://garagegymrevisited.com/crossfit-benchmark-wods/), and the anatomy of
 * a WODwell workout page — a quoted name, Rx loads, an explicit scoring rule,
 * an "intended stimulus," and a pacing/strategy tip (https://wodwell.com/wod/fran/).
 */

export type WodFormat = "amrap" | "for_time" | "emom" | "chipper" | "ladder";

export const WOD_FORMATS: Record<WodFormat, { label: string; description: string }> = {
  amrap: {
    label: "AMRAP",
    description: "As many rounds/reps as possible in the time cap — cycle through until time's up.",
  },
  for_time: {
    label: "For time",
    description: "Fixed rounds, same reps each round, minimal rest — push to finish as fast as possible.",
  },
  emom: {
    label: "EMOM",
    description: "Every minute on the minute, do that movement's reps, then rest whatever's left.",
  },
  chipper: {
    label: "Chipper",
    description: "One long list — each movement done once, straight through for time.",
  },
  ladder: {
    label: "21-15-9",
    description: "The classic descending ladder — a weightlifting/gymnastics couplet, three rounds.",
  },
};

/** Modeled on WODwell's per-workout breakdown: how it's won, what it should
 * feel like, and how to pace it — not just a format label. */
const FORMAT_DETAILS: Record<WodFormat, { scoring: string; stimulus: string; strategy: string }> = {
  ladder: {
    scoring: "Score is total time to complete all reps across all three rounds.",
    stimulus: "Fast and light — you should want to stop but won't.",
    strategy: "Break the round of 21 early if you need to, but try to go unbroken on the round of 9.",
  },
  amrap: {
    scoring: "Score is total rounds + reps completed when the clock hits zero.",
    stimulus: "Sustainable — a pace you could hold for the whole clock, not a sprint.",
    strategy: "Find a rhythm you can repeat every round. Blowing up in round two costs more than it gains.",
  },
  for_time: {
    scoring: "Score is total time to complete every round.",
    stimulus: "Hard and sustained — steady pressure from the first rep to the last.",
    strategy: "Keep transitions between movements short — the clock doesn't stop between rounds.",
  },
  emom: {
    scoring: "Score is whether every round is completed on the minute (or the slowest round's time).",
    stimulus: "Controlled — the built-in rest keeps quality high on every set.",
    strategy: "If a round is taking more than ~40 seconds, scale the reps down. The rest is the point.",
  },
  chipper: {
    scoring: "Score is total time to clear the entire list, once through.",
    stimulus: "A grind — long and unbroken, mental toughness as much as fitness.",
    strategy: "Keep moving even at a slower pace — resting kills a chipper more than fatigue does.",
  },
};

const NICKNAME_ADJECTIVES = ["Iron", "Rusty", "Molten", "Feral", "Relentless", "Savage", "Grinding", "Brutal"];
const NICKNAME_NOUNS = ["Anvil", "Gauntlet", "Furnace", "Crucible", "Reckoning", "Hammer", "Grind", "Wolf"];

function generateNickname(): string {
  const adjective = NICKNAME_ADJECTIVES[Math.floor(Math.random() * NICKNAME_ADJECTIVES.length)];
  const noun = NICKNAME_NOUNS[Math.floor(Math.random() * NICKNAME_NOUNS.length)];
  return `${adjective} ${noun}`;
}

export interface GenerateWodOptions {
  muscleGroups: string[];
  format: WodFormat;
  equipment?: string[];
  pinnedExerciseIds?: ID[];
}

export interface WodResult {
  format: WodFormat;
  /** A generated nickname in the "Fran"/"Cindy" quoted-name tradition — not a
   * claim that this is an official CrossFit benchmark or Hero WOD. */
  name: string;
  title: string;
  timeCapMin?: number;
  rounds?: number;
  scoring: string;
  stimulus: string;
  strategy: string;
  /** The barbell strength lift done before the WOD, if one was available. */
  strength: TemplateExercise[];
  /** The metcon itself. */
  wod: TemplateExercise[];
}

// WODs draw from the actual vocabulary of a metcon — Olympic/barbell lifts,
// gymnastics/bodyweight, kettlebells, and monostructural cardio. Machines and
// cables aren't part of it, and static holds/carries don't fit rep-based math.
const WOD_EQUIPMENT = new Set([
  "bodyweight",
  "kettlebell",
  "barbell",
  "dumbbell",
  "medicine ball",
  "jump rope",
  "rower",
]);

function modalityOf(exercise: ExerciseDefinition): Modality {
  if (exercise.modality) return exercise.modality;
  if (exercise.movementPattern === "monostructural") return "monostructural";
  if (exercise.equipment === "bodyweight") return "gymnastics";
  return "weightlifting";
}

function wodMovementPool(
  exercises: ExerciseDefinition[],
  muscleGroups: string[],
  equipment: string[] | undefined,
): ExerciseDefinition[] {
  return exercises.filter((exercise) => {
    if (exercise.force === "static") return false;
    if (!WOD_EQUIPMENT.has(exercise.equipment ?? "")) return false;
    if (equipment && equipment.length > 0 && !equipment.includes(exercise.equipment ?? "")) return false;
    if (muscleGroups.length > 0 && !exercise.muscleGroups.some((group) => muscleGroups.includes(group))) {
      return false;
    }
    return true;
  });
}

const NAMED_REPS: Record<string, number> = {
  "Double Under": 40,
  "Wall Ball Shot": 15,
  "Box Jump": 15,
  Burpee: 12,
  "Toes-to-Bar": 10,
  "Power Clean": 5,
  "Kettlebell Snatch": 10,
  "Devil Press": 8,
  Thruster: 12,
  "Row (Calories)": 15,
  "Run (Meters)": 400,
};

/** The movements that exist specifically for WOD metcons — not appropriate for
 * a straight-sets General/Bodybuilding/Powerlifting/Functional session, so
 * generateWorkout.ts hard-excludes anything in this list. */
export const WOD_ONLY_MOVEMENTS = new Set(Object.keys(NAMED_REPS));

// Standard Rx loads (men's) for the loaded movements — the actual numbers
// competitors would recognize (e.g. Fran's 95 lb thruster). Shown as a
// starting point; scale to whatever's appropriate.
const RX_LOAD_LB: Record<string, number> = {
  Thruster: 95,
  "Power Clean": 135,
  "Kettlebell Snatch": 53,
  "Devil Press": 50,
  "Wall Ball Shot": 20,
};

function baselineReps(exercise: ExerciseDefinition): number {
  if (exercise.name in NAMED_REPS) return NAMED_REPS[exercise.name];
  if (exercise.movementPattern === "vertical_pull") return 8; // pull-ups, chin-ups
  if (exercise.equipment === "barbell") return 8; // technical barbell movements
  return 15; // bodyweight / kettlebell / dumbbell staples
}

function unitOf(exercise: ExerciseDefinition): "reps" | "calories" | "meters" {
  if (exercise.equipment === "rower") return "calories";
  if (exercise.name === "Run (Meters)") return "meters";
  return "reps";
}

function roundReps(value: number): number {
  return Math.max(3, Math.round(value));
}

function pickStrengthLift(
  exercises: ExerciseDefinition[],
  muscleGroups: string[],
  pinnedIds: Set<ID>,
): ExerciseDefinition | undefined {
  const candidates = shuffle(
    exercises.filter((exercise) => exercise.category === "main" && exercise.equipment === "barbell"),
  );
  const inGroups = candidates.find(
    (exercise) => muscleGroups.length > 0 && exercise.muscleGroups.some((g) => muscleGroups.includes(g)),
  );
  return inGroups ?? candidates.find((exercise) => !pinnedIds.has(exercise.id)) ?? candidates[0];
}

function movementRow(exercise: ExerciseDefinition, reps: number, sets: number, restSec: number, notes?: string): TemplateExercise {
  return {
    id: newId(),
    exerciseId: exercise.id,
    order: 0,
    targetSets: sets,
    targetRepsMin: reps,
    targetRepsMax: reps,
    targetWeightLb: RX_LOAD_LB[exercise.name],
    unit: unitOf(exercise),
    restSec,
    notes,
  };
}

/**
 * Picks a modality-balanced set of movements — a couplet pairs one weightlifting
 * movement with one gymnastics movement (the Fran formula); larger sets add a
 * monostructural piece, then round out with whatever's left, so a WOD doesn't
 * end up as four barbell lifts in a trenchcoat.
 */
function pickMovements(
  pool: ExerciseDefinition[],
  pinned: ExerciseDefinition[],
  count: number,
  excludeId?: ID,
): ExerciseDefinition[] {
  const chosen: ExerciseDefinition[] = [];
  const used = new Set<ID>();

  function take(exercise: ExerciseDefinition | undefined) {
    if (!exercise || used.has(exercise.id) || chosen.length >= count) return;
    if (excludeId && exercise.id === excludeId) return;
    used.add(exercise.id);
    chosen.push(exercise);
  }

  for (const exercise of pinned) take(exercise);

  // Shuffled once so the iconic-movement sort below (stable) still breaks ties
  // randomly — otherwise the same modality slot always resolves to whichever
  // exercise happens to sort first, and every "Generate" click looks identical.
  const shuffledPool = shuffle(pool);

  // Prefer the movements a real WOD is actually built from (thrusters, wall
  // balls, box jumps, burpees, double-unders, Olympic lifts...) over a plain
  // strength accessory that merely happens to share the same modality tag.
  const byModality = (modality: Modality) =>
    shuffledPool
      .filter((exercise) => modalityOf(exercise) === modality && !used.has(exercise.id))
      .sort((a, b) => Number(b.name in NAMED_REPS) - Number(a.name in NAMED_REPS));

  const order: Modality[] = ["weightlifting", "gymnastics", "monostructural"];
  let cursor = 0;
  while (chosen.length < count) {
    const modality = order[cursor % order.length];
    const candidates = byModality(modality);
    if (candidates.length > 0) take(candidates[0]);
    cursor++;
    // Every modality is exhausted — stop rather than looping forever.
    if (cursor > count * order.length + order.length) break;
  }

  if (chosen.length < count) {
    for (const exercise of shuffledPool) {
      take(exercise);
      if (chosen.length >= count) break;
    }
  }

  return chosen;
}

export function generateWod(
  exercises: ExerciseDefinition[],
  { muscleGroups, format, equipment, pinnedExerciseIds = [] }: GenerateWodOptions,
): WodResult {
  const pinnedSet = new Set(pinnedExerciseIds);
  const pool = wodMovementPool(exercises, muscleGroups, equipment);
  const pinned = exercises.filter((exercise) => pinnedSet.has(exercise.id) && WOD_EQUIPMENT.has(exercise.equipment ?? ""));

  const strengthLift = pickStrengthLift(exercises, muscleGroups, pinnedSet);
  const strength: TemplateExercise[] = strengthLift
    ? [
        movementRow(strengthLift, 3, 1, 240, "Top set — work up to a heavy triple."),
        movementRow(strengthLift, 5, 3, 150, "Backoff — drop ~10–15% from your top set."),
      ]
    : [];

  const wod: TemplateExercise[] = [];
  let title = "";
  let timeCapMin: number | undefined;
  let rounds: number | undefined;

  if (format === "ladder") {
    const movements = pickMovements(pool, pinned, 2, strengthLift?.id);
    title = "21-15-9, for time";
    for (const reps of [21, 15, 9]) {
      for (const exercise of movements) {
        wod.push(movementRow(exercise, reps, 1, 0, `Round of ${reps}`));
      }
    }
  } else if (format === "amrap") {
    const movements = pickMovements(pool, pinned, 3, strengthLift?.id);
    timeCapMin = 15;
    title = `AMRAP ${timeCapMin}:00`;
    for (const exercise of movements) {
      wod.push(movementRow(exercise, roundReps(baselineReps(exercise)), 1, 0, `AMRAP ${timeCapMin}:00 — cycle through`));
    }
  } else if (format === "for_time") {
    const movements = pickMovements(pool, pinned, 3, strengthLift?.id);
    rounds = 4;
    title = `${rounds} rounds for time`;
    for (const exercise of movements) {
      wod.push(movementRow(exercise, roundReps(baselineReps(exercise) * 0.7), rounds, 0, "For time — minimal rest"));
    }
  } else if (format === "emom") {
    const movements = pickMovements(pool, pinned, 3, strengthLift?.id);
    const roundsPerMovement = 4;
    timeCapMin = movements.length * roundsPerMovement;
    title = `EMOM ${timeCapMin}:00`;
    for (const exercise of movements) {
      wod.push(
        movementRow(
          exercise,
          roundReps(baselineReps(exercise) * 0.5),
          roundsPerMovement,
          45,
          "Every minute on the minute — rest whatever's left",
        ),
      );
    }
  } else {
    const movements = pickMovements(pool, pinned, 6, strengthLift?.id);
    title = "The chipper — one round, for time";
    for (const exercise of movements) {
      wod.push(movementRow(exercise, roundReps(baselineReps(exercise) * 2), 1, 0, "Once through, straight to the next movement"));
    }
  }

  wod.forEach((row, index) => {
    row.order = strength.length + index;
  });
  strength.forEach((row, index) => {
    row.order = index;
  });

  const details = FORMAT_DETAILS[format];
  return {
    format,
    name: generateNickname(),
    title,
    timeCapMin,
    rounds,
    scoring: details.scoring,
    stimulus: details.stimulus,
    strategy: details.strategy,
    strength,
    wod,
  };
}
