import type {
  ExerciseCategory,
  ExerciseMechanic,
  ExerciseForce,
  ExerciseLevel,
  MovementPattern,
} from "@/lib/domain";

export interface ExternalExerciseResult {
  externalId: string;
  name: string;
  muscleGroups: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  category: ExerciseCategory;
  mechanic?: ExerciseMechanic;
  force?: ExerciseForce;
  level?: ExerciseLevel;
  movementPattern: MovementPattern;
  instructions: string[];
}

interface FreeExerciseDbEntry {
  id: string;
  name: string;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  mechanic: "compound" | "isolation" | null;
  force: "push" | "pull" | "static" | null;
  level: "beginner" | "intermediate" | "expert" | null;
  instructions: string[];
}

// A static, community-maintained dataset (~870 exercises) served from GitHub with
// permissive CORS, so it can be fetched directly from the browser with no API key.
const DATASET_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

// free-exercise-db uses a finer muscle vocabulary than the app's picker needs —
// collapse it down so the muscle-group filter on /workouts/build doesn't fragment
// into a dozen near-duplicate tags.
const MUSCLE_ALIASES: Record<string, string> = {
  quadriceps: "quads",
  lats: "back",
  "middle back": "back",
  "lower back": "back",
  traps: "shoulders",
  abdominals: "core",
};

function normalizeMuscle(muscle: string): string {
  const lower = muscle.toLowerCase();
  return MUSCLE_ALIASES[lower] ?? lower;
}

/** Best-effort movement-pattern tag for imported exercises, from name + muscle +
 * force/mechanic — free-exercise-db has no equivalent field, but the workout
 * generator relies on this to balance a session across movement patterns. */
function inferMovementPattern(
  name: string,
  primaryMuscles: string[],
  force: ExerciseForce | null,
  mechanic: ExerciseMechanic | null,
): MovementPattern {
  const lowerName = name.toLowerCase();
  const has = (muscle: string) => primaryMuscles.some((m) => normalizeMuscle(m) === muscle);

  if (lowerName.includes("carry") || lowerName.includes("farmer")) return "carry";
  if (has("core")) return "core";
  if (has("quads")) {
    return lowerName.includes("lunge") || lowerName.includes("split") || lowerName.includes("step")
      ? "lunge"
      : "squat";
  }
  if ((has("hamstrings") || has("glutes")) && force === "pull" && mechanic === "compound") return "hinge";
  if (has("back")) {
    return lowerName.includes("pull") || lowerName.includes("chin")
      ? "vertical_pull"
      : "horizontal_pull";
  }
  if (has("chest")) return "horizontal_push";
  if (has("shoulders") && mechanic === "compound") return "vertical_push";
  return "isolation";
}

let cachedDataset: FreeExerciseDbEntry[] | null = null;
let pendingLoad: Promise<FreeExerciseDbEntry[]> | null = null;

async function loadDataset(): Promise<FreeExerciseDbEntry[]> {
  if (cachedDataset) return cachedDataset;
  if (!pendingLoad) {
    pendingLoad = fetch(DATASET_URL)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load exercise database");
        return response.json() as Promise<FreeExerciseDbEntry[]>;
      })
      .then((data) => {
        cachedDataset = data;
        return data;
      })
      .finally(() => {
        pendingLoad = null;
      });
  }
  return pendingLoad;
}

export async function searchExercisesOnline(query: string): Promise<ExternalExerciseResult[]> {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  const dataset = await loadDataset();
  return dataset
    .filter((entry) => entry.name.toLowerCase().includes(term))
    .slice(0, 25)
    .map((entry) => {
      const primaryMuscles = entry.primaryMuscles.map(normalizeMuscle);
      const secondaryMuscles = entry.secondaryMuscles.map(normalizeMuscle);
      const mechanic = entry.mechanic ?? undefined;
      const force = entry.force ?? undefined;
      return {
        externalId: entry.id,
        name: entry.name,
        muscleGroups: [...new Set([...primaryMuscles, ...secondaryMuscles])],
        primaryMuscles,
        secondaryMuscles,
        equipment: entry.equipment ?? "bodyweight",
        category: entry.mechanic === "compound" ? "main" : "accessory",
        mechanic,
        force,
        level: entry.level ?? undefined,
        movementPattern: inferMovementPattern(entry.name, primaryMuscles, force ?? null, mechanic ?? null),
        instructions: entry.instructions,
      };
    });
}
