import { db } from "./schema";
import { newId, nowIso } from "@/lib/utils/id";
import { todayKey } from "@/lib/utils/date";
import type {
  ExerciseDefinition,
  ExerciseCategory,
  ExerciseMechanic,
  ExerciseForce,
  ExerciseLevel,
  MovementPattern,
  Modality,
  FoodItem,
  WorkoutTemplate,
  NutritionGoal,
  RunPlan,
} from "@/lib/domain";

const SEEDED_FLAG_KEY = "hasSeededInitialData";
const EXERCISE_LIBRARY_MIGRATION_KEY = "hasMigratedExerciseLibraryV4";
const FOOD_LIBRARY_MIGRATION_KEY = "hasMigratedFoodLibraryV2";

interface ExerciseSeed {
  name: string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  category: ExerciseCategory;
  equipment: string;
  mechanic: ExerciseMechanic;
  force: ExerciseForce;
  level: ExerciseLevel;
  movementPattern: MovementPattern;
  modality?: Modality;
  instructions: string[];
}

/** Identity helper — keeps the curated list below readable as a flat array of
 * plain specs, shared by both the fresh-install seed and the upgrade migration. */
function exerciseSpec(input: ExerciseSeed): ExerciseSeed {
  return input;
}

function makeExercise(input: ExerciseSeed): ExerciseDefinition {
  const timestamp = nowIso();
  return {
    id: newId(),
    name: input.name,
    muscleGroups: [...input.primaryMuscles, ...(input.secondaryMuscles ?? [])],
    primaryMuscles: input.primaryMuscles,
    secondaryMuscles: input.secondaryMuscles ?? [],
    equipment: input.equipment,
    category: input.category,
    mechanic: input.mechanic,
    force: input.force,
    level: input.level,
    movementPattern: input.movementPattern,
    modality: input.modality,
    instructions: input.instructions,
    isCustom: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function makeFood(
  name: string,
  servingSize: number,
  servingUnit: string,
  macrosPerServing: FoodItem["macrosPerServing"],
): FoodItem {
  const timestamp = nowIso();
  return {
    id: newId(),
    name,
    servingSize,
    servingUnit,
    macrosPerServing,
    isCustom: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

const CURATED_EXERCISES: ExerciseSeed[] = [
    // --- Squat pattern ---
    exerciseSpec({
      name: "Barbell Back Squat",
      primaryMuscles: ["quads", "glutes"],
      secondaryMuscles: ["core"],
      category: "main",
      equipment: "barbell",
      mechanic: "compound",
      force: "push",
      level: "intermediate",
      movementPattern: "squat",
      modality: "weightlifting",
      instructions: [
        "Set the bar on your upper traps, feet shoulder-width apart.",
        "Brace your core and unrack, stepping back to a stable stance.",
        "Break at the hips and knees together, sitting down and back until thighs are at least parallel.",
        "Drive through the whole foot to stand, keeping the bar path vertical.",
      ],
    }),
    exerciseSpec({
      name: "Front Squat",
      primaryMuscles: ["quads", "glutes"],
      secondaryMuscles: ["core"],
      category: "main",
      equipment: "barbell",
      mechanic: "compound",
      force: "push",
      level: "intermediate",
      movementPattern: "squat",
      modality: "weightlifting",
      instructions: [
        "Rest the bar across your front delts, elbows high, fingertips under the bar.",
        "Keep your torso upright as you descend, elbows pointed forward the whole time.",
        "Squat to depth, then drive up while keeping the chest tall.",
      ],
    }),
    exerciseSpec({
      name: "Goblet Squat",
      primaryMuscles: ["quads", "glutes"],
      secondaryMuscles: ["core"],
      category: "accessory",
      equipment: "dumbbell",
      mechanic: "compound",
      force: "push",
      level: "beginner",
      movementPattern: "squat",
      modality: "weightlifting",
      instructions: [
        "Hold a dumbbell vertically against your chest with both hands.",
        "Squat down between your knees, keeping your torso upright.",
        "Drive through your heels to stand back up.",
      ],
    }),
    exerciseSpec({
      name: "Leg Press",
      primaryMuscles: ["quads", "glutes"],
      category: "main",
      equipment: "machine",
      mechanic: "compound",
      force: "push",
      level: "beginner",
      movementPattern: "squat",
      instructions: [
        "Sit in the machine with feet shoulder-width on the platform.",
        "Lower the platform under control until your knees reach about 90 degrees.",
        "Press through your heels to extend without locking your knees out hard.",
      ],
    }),
    exerciseSpec({
      name: "Bodyweight Squat",
      primaryMuscles: ["quads", "glutes"],
      category: "accessory",
      equipment: "bodyweight",
      mechanic: "compound",
      force: "push",
      level: "beginner",
      movementPattern: "squat",
      modality: "gymnastics",
      instructions: [
        "Stand with feet shoulder-width apart, arms out for balance.",
        "Sit your hips back and down until thighs are at least parallel.",
        "Drive through your feet to return to standing.",
      ],
    }),

    // --- Hinge pattern ---
    exerciseSpec({
      name: "Conventional Deadlift",
      primaryMuscles: ["hamstrings", "glutes"],
      secondaryMuscles: ["back", "core"],
      category: "main",
      equipment: "barbell",
      mechanic: "compound",
      force: "pull",
      level: "intermediate",
      movementPattern: "hinge",
      modality: "weightlifting",
      instructions: [
        "Stand with the bar over mid-foot, shins close to the bar.",
        "Hinge and bend your knees to grip the bar just outside your legs.",
        "Brace your core, flatten your back, and drive through the floor to stand tall.",
        "Reverse the motion under control, hinging the hips back before the knees bend.",
      ],
    }),
    exerciseSpec({
      name: "Romanian Deadlift",
      primaryMuscles: ["hamstrings", "glutes"],
      secondaryMuscles: ["back"],
      category: "main",
      equipment: "barbell",
      mechanic: "compound",
      force: "pull",
      level: "intermediate",
      movementPattern: "hinge",
      instructions: [
        "Hold the bar at hip height with a shoulder-width grip.",
        "Push your hips back, keeping the bar close to your legs and knees only slightly bent.",
        "Lower until you feel a stretch in your hamstrings, then drive your hips forward to stand.",
      ],
    }),
    exerciseSpec({
      name: "Sumo Deadlift",
      primaryMuscles: ["glutes", "hamstrings"],
      secondaryMuscles: ["back", "quads"],
      category: "main",
      equipment: "barbell",
      mechanic: "compound",
      force: "pull",
      level: "expert",
      movementPattern: "hinge",
      instructions: [
        "Set up with a wide stance, toes turned out, gripping the bar inside your knees.",
        "Drop your hips low, chest up, and brace hard.",
        "Drive the floor away with your legs while keeping the bar path straight.",
      ],
    }),
    exerciseSpec({
      name: "Hip Thrust",
      primaryMuscles: ["glutes"],
      secondaryMuscles: ["hamstrings"],
      category: "main",
      equipment: "barbell",
      mechanic: "compound",
      force: "push",
      level: "beginner",
      movementPattern: "hinge",
      instructions: [
        "Sit with your upper back against a bench, bar over your hips.",
        "Plant your feet and drive your hips up until your body forms a straight line knee-to-shoulder.",
        "Squeeze your glutes hard at the top, then lower under control.",
      ],
    }),
    exerciseSpec({
      name: "Kettlebell Swing",
      primaryMuscles: ["glutes", "hamstrings"],
      secondaryMuscles: ["core", "cardio"],
      category: "accessory",
      equipment: "kettlebell",
      mechanic: "compound",
      force: "pull",
      level: "intermediate",
      movementPattern: "hinge",
      modality: "weightlifting",
      instructions: [
        "Stand with the kettlebell a foot in front of you, hinge to grip it.",
        "Hike the bell back between your legs, then snap your hips forward explosively.",
        "Let the hip drive float the bell to chest height — don't lift with your arms.",
      ],
    }),

    // --- Lunge pattern ---
    exerciseSpec({
      name: "Walking Lunge",
      primaryMuscles: ["quads", "glutes"],
      category: "accessory",
      equipment: "dumbbell",
      mechanic: "compound",
      force: "push",
      level: "beginner",
      movementPattern: "lunge",
      instructions: [
        "Hold dumbbells at your sides and step forward into a lunge.",
        "Lower your back knee toward the floor, front shin close to vertical.",
        "Drive through the front foot to step into the next lunge.",
      ],
    }),
    exerciseSpec({
      name: "Bulgarian Split Squat",
      primaryMuscles: ["quads", "glutes"],
      category: "accessory",
      equipment: "dumbbell",
      mechanic: "compound",
      force: "push",
      level: "intermediate",
      movementPattern: "lunge",
      instructions: [
        "Rest the top of your back foot on a bench behind you.",
        "Lower straight down until your front thigh is near parallel.",
        "Drive through the front heel to stand back up.",
      ],
    }),
    exerciseSpec({
      name: "Reverse Lunge",
      primaryMuscles: ["quads", "glutes"],
      category: "accessory",
      equipment: "dumbbell",
      mechanic: "compound",
      force: "push",
      level: "beginner",
      movementPattern: "lunge",
      instructions: [
        "Step one foot back and lower your back knee toward the floor.",
        "Keep most of your weight on the front leg.",
        "Push through the front foot to return to standing.",
      ],
    }),
    exerciseSpec({
      name: "Step-Up",
      primaryMuscles: ["quads", "glutes"],
      category: "accessory",
      equipment: "dumbbell",
      mechanic: "compound",
      force: "push",
      level: "beginner",
      movementPattern: "lunge",
      instructions: [
        "Place one foot fully on a bench or box in front of you.",
        "Drive through that foot to stand on the box, avoiding a push from the trailing leg.",
        "Step back down under control and repeat.",
      ],
    }),

    // --- Leg isolation ---
    exerciseSpec({
      name: "Leg Extension",
      primaryMuscles: ["quads"],
      category: "accessory",
      equipment: "machine",
      mechanic: "isolation",
      force: "push",
      level: "beginner",
      movementPattern: "isolation",
      instructions: [
        "Sit with the pad resting on your shins, knees at the machine's pivot.",
        "Extend your legs until straight, squeezing your quads at the top.",
        "Lower under control back to the start.",
      ],
    }),
    exerciseSpec({
      name: "Leg Curl",
      primaryMuscles: ["hamstrings"],
      category: "accessory",
      equipment: "machine",
      mechanic: "isolation",
      force: "pull",
      level: "beginner",
      movementPattern: "isolation",
      instructions: [
        "Lie face down (or sit, depending on the machine) with the pad on your lower legs.",
        "Curl your heels toward your glutes, squeezing the hamstrings.",
        "Lower under control back to the start.",
      ],
    }),
    exerciseSpec({
      name: "Standing Calf Raise",
      primaryMuscles: ["calves"],
      category: "accessory",
      equipment: "machine",
      mechanic: "isolation",
      force: "push",
      level: "beginner",
      movementPattern: "isolation",
      instructions: [
        "Stand on the platform with the balls of your feet, heels hanging off.",
        "Rise onto your toes as high as possible, pausing briefly at the top.",
        "Lower under control until you feel a full stretch in your calves.",
      ],
    }),
    exerciseSpec({
      name: "Seated Calf Raise",
      primaryMuscles: ["calves"],
      category: "accessory",
      equipment: "machine",
      mechanic: "isolation",
      force: "push",
      level: "beginner",
      movementPattern: "isolation",
      instructions: [
        "Sit with the pad resting on your lower thighs, balls of your feet on the platform.",
        "Raise your heels as high as possible, squeezing at the top.",
        "Lower until you feel a full stretch, then repeat.",
      ],
    }),

    // --- Horizontal push ---
    exerciseSpec({
      name: "Barbell Bench Press",
      primaryMuscles: ["chest"],
      secondaryMuscles: ["triceps", "shoulders"],
      category: "main",
      equipment: "barbell",
      mechanic: "compound",
      force: "push",
      level: "intermediate",
      movementPattern: "horizontal_push",
      instructions: [
        "Lie on the bench with eyes under the bar, feet flat on the floor.",
        "Grip just wider than shoulder-width and unrack, arms straight over your chest.",
        "Lower to your mid-chest under control, elbows at roughly 45 degrees.",
        "Press back up to lockout, keeping your shoulder blades pinned.",
      ],
    }),
    exerciseSpec({
      name: "Dumbbell Bench Press",
      primaryMuscles: ["chest"],
      secondaryMuscles: ["triceps", "shoulders"],
      category: "main",
      equipment: "dumbbell",
      mechanic: "compound",
      force: "push",
      level: "beginner",
      movementPattern: "horizontal_push",
      instructions: [
        "Lie on a bench holding a dumbbell in each hand at chest level.",
        "Press both dumbbells up until your arms are extended.",
        "Lower under control until you feel a stretch across your chest.",
      ],
    }),
    exerciseSpec({
      name: "Incline Barbell Bench Press",
      primaryMuscles: ["chest", "shoulders"],
      secondaryMuscles: ["triceps"],
      category: "main",
      equipment: "barbell",
      mechanic: "compound",
      force: "push",
      level: "intermediate",
      movementPattern: "horizontal_push",
      instructions: [
        "Set the bench to a 30–45 degree incline.",
        "Unrack and lower the bar to your upper chest.",
        "Press up and slightly back until your arms lock out.",
      ],
    }),
    exerciseSpec({
      name: "Incline Dumbbell Press",
      primaryMuscles: ["chest", "shoulders"],
      secondaryMuscles: ["triceps"],
      category: "main",
      equipment: "dumbbell",
      mechanic: "compound",
      force: "push",
      level: "beginner",
      movementPattern: "horizontal_push",
      instructions: [
        "Set the bench to a 30–45 degree incline, dumbbell in each hand at shoulder height.",
        "Press both dumbbells up until your arms are extended.",
        "Lower under control back to shoulder height.",
      ],
    }),
    exerciseSpec({
      name: "Push-Up",
      primaryMuscles: ["chest"],
      secondaryMuscles: ["triceps", "shoulders", "core"],
      category: "accessory",
      equipment: "bodyweight",
      mechanic: "compound",
      force: "push",
      level: "beginner",
      movementPattern: "horizontal_push",
      modality: "gymnastics",
      instructions: [
        "Start in a plank with hands slightly wider than shoulders.",
        "Lower your chest toward the floor, keeping your body in a straight line.",
        "Press back up to full arm extension.",
      ],
    }),
    exerciseSpec({
      name: "Cable Chest Fly",
      primaryMuscles: ["chest"],
      category: "accessory",
      equipment: "cable",
      mechanic: "isolation",
      force: "push",
      level: "beginner",
      movementPattern: "isolation",
      instructions: [
        "Set both pulleys above shoulder height, one handle in each hand.",
        "Step forward and bring your hands together in front of your chest in an arcing motion.",
        "Return under control until you feel a stretch across your chest.",
      ],
    }),

    // --- Vertical push ---
    exerciseSpec({
      name: "Overhead Press",
      primaryMuscles: ["shoulders"],
      secondaryMuscles: ["triceps"],
      category: "main",
      equipment: "barbell",
      mechanic: "compound",
      force: "push",
      level: "intermediate",
      movementPattern: "vertical_push",
      modality: "weightlifting",
      instructions: [
        "Hold the bar at shoulder height, grip just outside shoulder-width.",
        "Brace your core and press the bar straight overhead, moving your head through at the top.",
        "Lower under control back to shoulder height.",
      ],
    }),
    exerciseSpec({
      name: "Dumbbell Shoulder Press",
      primaryMuscles: ["shoulders"],
      secondaryMuscles: ["triceps"],
      category: "main",
      equipment: "dumbbell",
      mechanic: "compound",
      force: "push",
      level: "beginner",
      movementPattern: "vertical_push",
      instructions: [
        "Sit or stand holding a dumbbell at each shoulder.",
        "Press both dumbbells overhead until your arms are extended.",
        "Lower under control back to shoulder height.",
      ],
    }),
    exerciseSpec({
      name: "Arnold Press",
      primaryMuscles: ["shoulders"],
      secondaryMuscles: ["triceps"],
      category: "accessory",
      equipment: "dumbbell",
      mechanic: "compound",
      force: "push",
      level: "intermediate",
      movementPattern: "vertical_push",
      instructions: [
        "Start with dumbbells at shoulder height, palms facing you.",
        "Press up while rotating your palms to face forward at the top.",
        "Reverse the rotation as you lower back down.",
      ],
    }),
    exerciseSpec({
      name: "Pike Push-Up",
      primaryMuscles: ["shoulders"],
      secondaryMuscles: ["triceps"],
      category: "accessory",
      equipment: "bodyweight",
      mechanic: "compound",
      force: "push",
      level: "intermediate",
      movementPattern: "vertical_push",
      instructions: [
        "Start in a downward-dog position, hips high, hands shoulder-width.",
        "Bend your elbows to lower the top of your head toward the floor.",
        "Press back up to the starting position.",
      ],
    }),

    // --- Horizontal pull ---
    exerciseSpec({
      name: "Barbell Row",
      primaryMuscles: ["back"],
      secondaryMuscles: ["biceps"],
      category: "main",
      equipment: "barbell",
      mechanic: "compound",
      force: "pull",
      level: "intermediate",
      movementPattern: "horizontal_pull",
      modality: "weightlifting",
      instructions: [
        "Hinge forward to about a 45-degree torso angle, bar hanging at arm's length.",
        "Pull the bar to your lower ribs, driving your elbows back.",
        "Lower under control without letting your torso rise.",
      ],
    }),
    exerciseSpec({
      name: "Dumbbell Row",
      primaryMuscles: ["back"],
      secondaryMuscles: ["biceps"],
      category: "main",
      equipment: "dumbbell",
      mechanic: "compound",
      force: "pull",
      level: "beginner",
      movementPattern: "horizontal_pull",
      instructions: [
        "Support yourself with one hand and knee on a bench, other foot on the floor.",
        "Row the dumbbell to your hip, driving your elbow back.",
        "Lower under control to a full stretch.",
      ],
    }),
    exerciseSpec({
      name: "Seated Cable Row",
      primaryMuscles: ["back"],
      secondaryMuscles: ["biceps"],
      category: "accessory",
      equipment: "cable",
      mechanic: "compound",
      force: "pull",
      level: "beginner",
      movementPattern: "horizontal_pull",
      instructions: [
        "Sit with knees slightly bent, gripping the handle at arm's length.",
        "Pull to your torso, driving your elbows back and squeezing your shoulder blades.",
        "Extend back out under control without rounding your lower back.",
      ],
    }),
    exerciseSpec({
      name: "Chest-Supported Row",
      primaryMuscles: ["back"],
      secondaryMuscles: ["biceps"],
      category: "accessory",
      equipment: "dumbbell",
      mechanic: "compound",
      force: "pull",
      level: "beginner",
      movementPattern: "horizontal_pull",
      instructions: [
        "Lie chest-down on an incline bench holding dumbbells underneath you.",
        "Row both dumbbells up toward your hips, squeezing your shoulder blades.",
        "Lower under control to a full stretch.",
      ],
    }),
    exerciseSpec({
      name: "Inverted Row",
      primaryMuscles: ["back"],
      secondaryMuscles: ["biceps"],
      category: "accessory",
      equipment: "bodyweight",
      mechanic: "compound",
      force: "pull",
      level: "beginner",
      movementPattern: "horizontal_pull",
      instructions: [
        "Set a bar at hip height and hang beneath it, body straight, heels on the floor.",
        "Pull your chest to the bar, squeezing your shoulder blades together.",
        "Lower under control to full arm extension.",
      ],
    }),

    // --- Vertical pull ---
    exerciseSpec({
      name: "Pull-Up",
      primaryMuscles: ["back"],
      secondaryMuscles: ["biceps"],
      category: "main",
      equipment: "bodyweight",
      mechanic: "compound",
      force: "pull",
      level: "intermediate",
      movementPattern: "vertical_pull",
      modality: "gymnastics",
      instructions: [
        "Hang from the bar with an overhand grip, just outside shoulder-width.",
        "Pull yourself up until your chin clears the bar, driving your elbows down.",
        "Lower under control to a full hang.",
      ],
    }),
    exerciseSpec({
      name: "Chin-Up",
      primaryMuscles: ["back", "biceps"],
      category: "main",
      equipment: "bodyweight",
      mechanic: "compound",
      force: "pull",
      level: "intermediate",
      movementPattern: "vertical_pull",
      modality: "gymnastics",
      instructions: [
        "Hang from the bar with an underhand, shoulder-width grip.",
        "Pull yourself up until your chin clears the bar.",
        "Lower under control to a full hang.",
      ],
    }),
    exerciseSpec({
      name: "Lat Pulldown",
      primaryMuscles: ["back"],
      secondaryMuscles: ["biceps"],
      category: "accessory",
      equipment: "cable",
      mechanic: "compound",
      force: "pull",
      level: "beginner",
      movementPattern: "vertical_pull",
      instructions: [
        "Sit with thighs secured under the pad, grip the bar wider than shoulder-width.",
        "Pull the bar down to your upper chest, driving your elbows down and back.",
        "Extend back up under control to a full stretch.",
      ],
    }),
    exerciseSpec({
      name: "Assisted Pull-Up",
      primaryMuscles: ["back"],
      secondaryMuscles: ["biceps"],
      category: "accessory",
      equipment: "machine",
      mechanic: "compound",
      force: "pull",
      level: "beginner",
      movementPattern: "vertical_pull",
      instructions: [
        "Kneel or stand on the platform, set assistance to offset the right amount of bodyweight.",
        "Pull yourself up until your chin clears the bar.",
        "Lower under control to a full hang.",
      ],
    }),

    // --- Shoulder isolation ---
    exerciseSpec({
      name: "Lateral Raise",
      primaryMuscles: ["shoulders"],
      category: "accessory",
      equipment: "dumbbell",
      mechanic: "isolation",
      force: "pull",
      level: "beginner",
      movementPattern: "isolation",
      instructions: [
        "Stand holding a dumbbell in each hand at your sides.",
        "Raise your arms out to the sides until roughly shoulder height.",
        "Lower under control, leading with a slight elbow bend throughout.",
      ],
    }),
    exerciseSpec({
      name: "Rear Delt Fly",
      primaryMuscles: ["shoulders"],
      secondaryMuscles: ["back"],
      category: "accessory",
      equipment: "dumbbell",
      mechanic: "isolation",
      force: "pull",
      level: "beginner",
      movementPattern: "isolation",
      instructions: [
        "Hinge forward at the hips, dumbbells hanging beneath your shoulders.",
        "Raise your arms out to the sides, squeezing your shoulder blades together.",
        "Lower under control back to the start.",
      ],
    }),
    exerciseSpec({
      name: "Face Pull",
      primaryMuscles: ["shoulders"],
      secondaryMuscles: ["back"],
      category: "accessory",
      equipment: "cable",
      mechanic: "isolation",
      force: "pull",
      level: "beginner",
      movementPattern: "isolation",
      instructions: [
        "Set a rope attachment at upper-chest height.",
        "Pull toward your face, flaring your elbows out and rotating your hands back.",
        "Return under control to a full stretch.",
      ],
    }),

    // --- Arm isolation ---
    exerciseSpec({
      name: "Dumbbell Bicep Curl",
      primaryMuscles: ["biceps"],
      category: "accessory",
      equipment: "dumbbell",
      mechanic: "isolation",
      force: "pull",
      level: "beginner",
      movementPattern: "isolation",
      instructions: [
        "Stand holding a dumbbell in each hand, arms extended, palms forward.",
        "Curl the weights up, keeping your elbows pinned at your sides.",
        "Lower under control to full extension.",
      ],
    }),
    exerciseSpec({
      name: "Barbell Curl",
      primaryMuscles: ["biceps"],
      category: "accessory",
      equipment: "barbell",
      mechanic: "isolation",
      force: "pull",
      level: "beginner",
      movementPattern: "isolation",
      instructions: [
        "Hold the bar with an underhand, shoulder-width grip.",
        "Curl the bar up, keeping your elbows pinned at your sides.",
        "Lower under control to full extension.",
      ],
    }),
    exerciseSpec({
      name: "Hammer Curl",
      primaryMuscles: ["biceps"],
      secondaryMuscles: ["forearms"],
      category: "accessory",
      equipment: "dumbbell",
      mechanic: "isolation",
      force: "pull",
      level: "beginner",
      movementPattern: "isolation",
      instructions: [
        "Hold dumbbells with a neutral, palms-in grip.",
        "Curl the weights up without rotating your wrists.",
        "Lower under control to full extension.",
      ],
    }),
    exerciseSpec({
      name: "Triceps Pushdown",
      primaryMuscles: ["triceps"],
      category: "accessory",
      equipment: "cable",
      mechanic: "isolation",
      force: "push",
      level: "beginner",
      movementPattern: "isolation",
      instructions: [
        "Grip the bar with elbows pinned at your sides.",
        "Extend your arms down until straight, squeezing your triceps.",
        "Let the bar rise back under control without flaring your elbows.",
      ],
    }),
    exerciseSpec({
      name: "Overhead Triceps Extension",
      primaryMuscles: ["triceps"],
      category: "accessory",
      equipment: "dumbbell",
      mechanic: "isolation",
      force: "push",
      level: "beginner",
      movementPattern: "isolation",
      instructions: [
        "Hold one dumbbell overhead with both hands, arms extended.",
        "Lower it behind your head by bending your elbows.",
        "Extend back to the start, keeping your upper arms still.",
      ],
    }),
    exerciseSpec({
      name: "Skull Crusher",
      primaryMuscles: ["triceps"],
      category: "accessory",
      equipment: "barbell",
      mechanic: "isolation",
      force: "push",
      level: "intermediate",
      movementPattern: "isolation",
      instructions: [
        "Lie on a bench holding the bar over your chest, arms extended.",
        "Bend your elbows to lower the bar toward your forehead, upper arms staying still.",
        "Extend back to the start.",
      ],
    }),

    // --- Core ---
    exerciseSpec({
      name: "Plank",
      primaryMuscles: ["core"],
      category: "accessory",
      equipment: "bodyweight",
      mechanic: "isolation",
      force: "static",
      level: "beginner",
      movementPattern: "core",
      instructions: [
        "Support yourself on your forearms and toes, body in a straight line.",
        "Brace your core and squeeze your glutes to keep your hips level.",
        "Hold, breathing normally, without letting your hips sag or pike.",
      ],
    }),
    exerciseSpec({
      name: "Side Plank",
      primaryMuscles: ["core"],
      category: "accessory",
      equipment: "bodyweight",
      mechanic: "isolation",
      force: "static",
      level: "beginner",
      movementPattern: "core",
      instructions: [
        "Prop yourself on one forearm, body in a straight line, feet stacked.",
        "Lift your hips until your body forms a straight line head to feet.",
        "Hold, then repeat on the other side.",
      ],
    }),
    exerciseSpec({
      name: "Hanging Leg Raise",
      primaryMuscles: ["core"],
      category: "accessory",
      equipment: "bodyweight",
      mechanic: "isolation",
      force: "pull",
      level: "intermediate",
      movementPattern: "core",
      modality: "gymnastics",
      instructions: [
        "Hang from a pull-up bar with a full grip.",
        "Raise your legs until roughly parallel to the floor, minimizing swing.",
        "Lower under control back to a full hang.",
      ],
    }),
    exerciseSpec({
      name: "Cable Crunch",
      primaryMuscles: ["core"],
      category: "accessory",
      equipment: "cable",
      mechanic: "isolation",
      force: "pull",
      level: "beginner",
      movementPattern: "core",
      instructions: [
        "Kneel below a high pulley, rope behind your head.",
        "Crunch down, bringing your elbows toward your knees by flexing your spine.",
        "Return under control without losing tension on the cable.",
      ],
    }),
    exerciseSpec({
      name: "Ab Wheel Rollout",
      primaryMuscles: ["core"],
      category: "accessory",
      equipment: "bodyweight",
      mechanic: "isolation",
      force: "static",
      level: "expert",
      movementPattern: "core",
      instructions: [
        "Kneel holding the wheel beneath your shoulders.",
        "Roll forward, keeping your core braced and back flat, as far as you can control.",
        "Pull back to the start using your abs, not your hips.",
      ],
    }),
    exerciseSpec({
      name: "Pallof Press",
      primaryMuscles: ["core"],
      category: "accessory",
      equipment: "cable",
      mechanic: "isolation",
      force: "push",
      level: "beginner",
      movementPattern: "core",
      instructions: [
        "Stand sideways to the cable, handle at chest height, arms bent.",
        "Press the handle straight out in front of you, resisting the pull to rotate.",
        "Return under control to your chest and repeat.",
      ],
    }),

    // --- Carry ---
    exerciseSpec({
      name: "Farmer's Carry",
      primaryMuscles: ["core"],
      secondaryMuscles: ["back", "forearms"],
      category: "accessory",
      equipment: "dumbbell",
      mechanic: "compound",
      force: "static",
      level: "beginner",
      movementPattern: "carry",
      instructions: [
        "Pick up a heavy dumbbell or kettlebell in each hand.",
        "Stand tall, shoulders back, and walk for the target distance or time.",
        "Keep your core braced and avoid leaning to either side.",
      ],
    }),
    exerciseSpec({
      name: "Suitcase Carry",
      primaryMuscles: ["core"],
      secondaryMuscles: ["back", "forearms"],
      category: "accessory",
      equipment: "dumbbell",
      mechanic: "compound",
      force: "static",
      level: "beginner",
      movementPattern: "carry",
      instructions: [
        "Pick up a single heavy dumbbell in one hand.",
        "Stand tall and walk for the target distance, resisting the pull to lean.",
        "Switch hands and repeat for the same distance.",
      ],
    }),

    // --- CrossFit / WOD staples — the actual vocabulary of a metcon (thrusters,
    // wall balls, box jumps, burpees, double-unders, toes-to-bar, Olympic lifts,
    // and monostructural cardio), not strength-training accessories. Tagged with
    // modality (weightlifting/gymnastics/monostructural) so the WOD generator can
    // build real couplets/triplets across modalities the way an actual WOD does.
    exerciseSpec({
      name: "Thruster",
      primaryMuscles: ["quads", "shoulders"],
      secondaryMuscles: ["glutes", "triceps"],
      category: "main",
      equipment: "barbell",
      mechanic: "compound",
      force: "push",
      level: "intermediate",
      movementPattern: "olympic",
      modality: "weightlifting",
      instructions: [
        "Hold the bar in the front-rack position, feet shoulder-width apart.",
        "Squat to full depth, then drive up explosively.",
        "Use the leg drive to press the bar overhead in one continuous motion.",
        "Return the bar to the front rack as you descend into the next rep.",
      ],
    }),
    exerciseSpec({
      name: "Wall Ball Shot",
      primaryMuscles: ["quads", "shoulders"],
      secondaryMuscles: ["glutes"],
      category: "main",
      equipment: "medicine ball",
      mechanic: "compound",
      force: "push",
      level: "beginner",
      movementPattern: "squat",
      modality: "weightlifting",
      instructions: [
        "Hold the ball at your chest, feet shoulder-width, facing a wall target.",
        "Squat to full depth, then drive up explosively.",
        "Throw the ball to the target as your legs finish extending, catching it on the way back down.",
      ],
    }),
    exerciseSpec({
      name: "Box Jump",
      primaryMuscles: ["quads", "glutes"],
      secondaryMuscles: ["calves", "cardio"],
      category: "accessory",
      equipment: "bodyweight",
      mechanic: "compound",
      force: "push",
      level: "intermediate",
      movementPattern: "squat",
      modality: "gymnastics",
      instructions: [
        "Stand facing the box, feet shoulder-width apart.",
        "Dip into a quarter squat and swing your arms, then jump onto the box.",
        "Land softly with hips open, then step or jump back down.",
      ],
    }),
    exerciseSpec({
      name: "Burpee",
      primaryMuscles: ["chest", "quads"],
      secondaryMuscles: ["core", "shoulders", "cardio"],
      category: "accessory",
      equipment: "bodyweight",
      mechanic: "compound",
      force: "push",
      level: "beginner",
      movementPattern: "full_body",
      modality: "gymnastics",
      instructions: [
        "Drop into a squat and place your hands on the floor.",
        "Kick your feet back into a plank, then perform a push-up.",
        "Jump your feet back toward your hands and stand, jumping with your arms overhead.",
      ],
    }),
    exerciseSpec({
      name: "Double Under",
      primaryMuscles: ["calves"],
      secondaryMuscles: ["shoulders", "core", "cardio"],
      category: "accessory",
      equipment: "jump rope",
      mechanic: "compound",
      force: "push",
      level: "intermediate",
      movementPattern: "monostructural",
      modality: "monostructural",
      instructions: [
        "Hold the rope handles at hip height, wrists doing most of the turning.",
        "Jump just high enough to pass the rope under your feet twice per jump.",
        "Keep a steady rhythm rather than jumping higher for more clearance.",
      ],
    }),
    exerciseSpec({
      name: "Toes-to-Bar",
      primaryMuscles: ["core"],
      secondaryMuscles: ["back"],
      category: "accessory",
      equipment: "bodyweight",
      mechanic: "compound",
      force: "pull",
      level: "intermediate",
      movementPattern: "core",
      modality: "gymnastics",
      instructions: [
        "Hang from the bar with an active shoulder grip.",
        "Generate a slight swing, then curl your hips and drive your toes up to touch the bar.",
        "Lower under control and let the swing carry you into the next rep.",
      ],
    }),
    exerciseSpec({
      name: "Power Clean",
      primaryMuscles: ["back", "hamstrings"],
      secondaryMuscles: ["glutes", "shoulders"],
      category: "main",
      equipment: "barbell",
      mechanic: "compound",
      force: "pull",
      level: "expert",
      movementPattern: "olympic",
      modality: "weightlifting",
      instructions: [
        "Start with the bar over mid-foot, grip just outside your legs.",
        "Pull the bar from the floor, accelerating hard as it passes your knees.",
        "Extend violently through the hips, then pull yourself under the bar into a front-rack squat catch.",
        "Stand to finish the rep.",
      ],
    }),
    exerciseSpec({
      name: "Kettlebell Snatch",
      primaryMuscles: ["shoulders", "back"],
      secondaryMuscles: ["glutes", "hamstrings"],
      category: "main",
      equipment: "kettlebell",
      mechanic: "compound",
      force: "pull",
      level: "intermediate",
      movementPattern: "olympic",
      modality: "weightlifting",
      instructions: [
        "Hike the kettlebell back between your legs like a swing.",
        "Drive your hips forward explosively, pulling the bell close to your body.",
        "Punch your hand through as the bell reaches the top, finishing overhead with a locked-out arm.",
      ],
    }),
    exerciseSpec({
      name: "Devil Press",
      primaryMuscles: ["shoulders", "chest"],
      secondaryMuscles: ["quads", "core"],
      category: "accessory",
      equipment: "dumbbell",
      mechanic: "compound",
      force: "push",
      level: "expert",
      movementPattern: "full_body",
      modality: "weightlifting",
      instructions: [
        "With a dumbbell in each hand, drop into a burpee, chest to the floor.",
        "Stand and swing both dumbbells between your legs into an overhead snatch.",
        "Finish with both arms locked out overhead, dumbbells over your shoulders.",
      ],
    }),
    exerciseSpec({
      name: "Row (Calories)",
      primaryMuscles: ["back", "quads"],
      secondaryMuscles: ["hamstrings", "cardio"],
      category: "accessory",
      equipment: "rower",
      mechanic: "compound",
      force: "pull",
      level: "beginner",
      movementPattern: "monostructural",
      modality: "monostructural",
      instructions: [
        "Strap in, drive with your legs first, then lean back and pull the handle to your ribs.",
        "Reverse the order on the way back — arms, then hips, then knees.",
        "Keep a steady pace rather than yanking on the first few strokes.",
      ],
    }),
    exerciseSpec({
      name: "Run (Meters)",
      primaryMuscles: ["quads", "calves"],
      secondaryMuscles: ["hamstrings", "cardio"],
      category: "accessory",
      equipment: "bodyweight",
      mechanic: "compound",
      force: "push",
      level: "beginner",
      movementPattern: "monostructural",
      modality: "monostructural",
      instructions: [
        "Head out at a hard but sustainable pace for the prescribed distance.",
        "Keep your effort even rather than sprinting the first half.",
      ],
    }),
];

async function seedExercises(): Promise<Record<string, string>> {
  const exercises = CURATED_EXERCISES.map(makeExercise);
  await db.exercises.bulkAdd(exercises);
  const byName: Record<string, string> = {};
  for (const exercise of exercises) byName[exercise.name] = exercise.id;
  return byName;
}

/**
 * Upgrades an existing local library to the current curated exercise set —
 * updating the rich metadata (mechanic/force/level/movementPattern/instructions)
 * on any exercise that shares a name with the original seed, and inserting any
 * new ones, without touching workout history, custom exercises, or other data.
 */
async function migrateExerciseLibrary(): Promise<void> {
  const existing = await db.exercises.toArray();
  const existingByName = new Map(
    existing.filter((exercise) => !exercise.isCustom).map((exercise) => [exercise.name, exercise]),
  );

  const toAdd: ExerciseDefinition[] = [];
  const toUpdate: ExerciseDefinition[] = [];

  for (const spec of CURATED_EXERCISES) {
    const current = existingByName.get(spec.name);
    if (!current) {
      toAdd.push(makeExercise(spec));
      continue;
    }
    toUpdate.push({
      ...current,
      muscleGroups: [...spec.primaryMuscles, ...(spec.secondaryMuscles ?? [])],
      primaryMuscles: spec.primaryMuscles,
      secondaryMuscles: spec.secondaryMuscles ?? [],
      mechanic: spec.mechanic,
      force: spec.force,
      level: spec.level,
      movementPattern: spec.movementPattern,
      modality: spec.modality,
      instructions: spec.instructions,
      updatedAt: nowIso(),
    });
  }

  if (toAdd.length > 0) await db.exercises.bulkAdd(toAdd);
  if (toUpdate.length > 0) await db.exercises.bulkPut(toUpdate);
}

type FoodSeed = [name: string, servingSize: number, servingUnit: string, macros: FoodItem["macrosPerServing"]];

// Macro values are standard USDA-style figures for the common preparation named
// (e.g. "cooked", "raw", "steamed") — the same reference figures used in most
// nutrition-tracking apps and food-label databases.
const CURATED_FOODS: FoodSeed[] = [
  // Protein
  ["Chicken Breast (cooked)", 3.5, "oz", { calories: 165, proteinG: 31, carbsG: 0, fatG: 3.6 }],
  ["Turkey Breast (roasted)", 3.5, "oz", { calories: 135, proteinG: 30.1, carbsG: 0, fatG: 0.7 }],
  ["Lean Ground Beef 93/7 (cooked)", 3.5, "oz", { calories: 152, proteinG: 21, carbsG: 0, fatG: 7 }],
  ["Salmon (cooked)", 3.5, "oz", { calories: 208, proteinG: 20.4, carbsG: 0, fatG: 13.4 }],
  ["Tuna (canned in water)", 3.5, "oz", { calories: 116, proteinG: 25.5, carbsG: 0, fatG: 0.8 }],
  ["Shrimp (cooked)", 3.5, "oz", { calories: 99, proteinG: 24, carbsG: 0.2, fatG: 0.3 }],
  ["Pork Tenderloin (cooked)", 3.5, "oz", { calories: 143, proteinG: 26, carbsG: 0, fatG: 3.5 }],
  ["Egg (whole)", 1, "piece", { calories: 72, proteinG: 6.3, carbsG: 0.4, fatG: 4.8 }],
  ["Egg White", 1, "piece", { calories: 17, proteinG: 3.6, carbsG: 0.2, fatG: 0.1 }],
  ["Tofu (firm)", 3.5, "oz", { calories: 76, proteinG: 8, carbsG: 1.9, fatG: 4.8 }],
  ["Black Beans (cooked)", 3.5, "oz", { calories: 132, proteinG: 8.9, carbsG: 23.7, fatG: 0.5 }],
  ["Lentils (cooked)", 3.5, "oz", { calories: 116, proteinG: 9, carbsG: 20.1, fatG: 0.4 }],
  ["Cottage Cheese (2%)", 3.5, "oz", { calories: 84, proteinG: 11.1, carbsG: 4.3, fatG: 2.3 }],
  ["Greek Yogurt (plain, 2%)", 3.5, "oz", { calories: 73, proteinG: 9.9, carbsG: 3.8, fatG: 1.9 }],
  ["Whey Protein Powder", 1, "scoop", { calories: 120, proteinG: 24, carbsG: 3, fatG: 1.5 }],
  ["Protein Bar (generic)", 1, "bar", { calories: 200, proteinG: 20, carbsG: 22, fatG: 7 }],

  // Carbohydrate
  ["Brown Rice (cooked)", 3.5, "oz", { calories: 112, proteinG: 2.3, carbsG: 23.5, fatG: 0.8 }],
  ["White Rice (cooked)", 3.5, "oz", { calories: 130, proteinG: 2.7, carbsG: 28.2, fatG: 0.3 }],
  ["Quinoa (cooked)", 3.5, "oz", { calories: 120, proteinG: 4.4, carbsG: 21.3, fatG: 1.9 }],
  ["Pasta (cooked)", 3.5, "oz", { calories: 131, proteinG: 5, carbsG: 25, fatG: 1.1 }],
  ["Rolled Oats (dry)", 3.5, "oz", { calories: 379, proteinG: 13.2, carbsG: 67.7, fatG: 6.5 }],
  ["Sweet Potato (baked)", 3.5, "oz", { calories: 90, proteinG: 2, carbsG: 20.7, fatG: 0.1 }],
  ["Potato (baked, with skin)", 3.5, "oz", { calories: 93, proteinG: 2.5, carbsG: 21, fatG: 0.1 }],
  ["Whole Wheat Bread", 1, "slice", { calories: 81, proteinG: 4, carbsG: 13.8, fatG: 1.1 }],
  ["White Bread", 1, "slice", { calories: 79, proteinG: 2.7, carbsG: 14.7, fatG: 1 }],
  ["Corn Tortilla", 1, "piece", { calories: 52, proteinG: 1.4, carbsG: 10.7, fatG: 0.6 }],

  // Fat
  ["Olive Oil", 1, "tbsp", { calories: 119, proteinG: 0, carbsG: 0, fatG: 13.5 }],
  ["Almonds", 1, "oz", { calories: 164, proteinG: 6, carbsG: 6.1, fatG: 14.2 }],
  ["Walnuts", 1, "oz", { calories: 185, proteinG: 4.3, carbsG: 3.9, fatG: 18.5 }],
  ["Peanut Butter", 2, "tbsp", { calories: 188, proteinG: 8, carbsG: 6, fatG: 16 }],
  ["Avocado", 0.5, "piece", { calories: 120, proteinG: 1.5, carbsG: 6.4, fatG: 10.9 }],
  ["Chia Seeds", 1, "tbsp", { calories: 58, proteinG: 2, carbsG: 5, fatG: 3.7 }],
  ["Butter", 1, "tbsp", { calories: 102, proteinG: 0.1, carbsG: 0, fatG: 11.5 }],

  // Vegetables
  ["Broccoli (steamed)", 3.5, "oz", { calories: 35, proteinG: 2.4, carbsG: 7.2, fatG: 0.4 }],
  ["Spinach (raw)", 3.5, "oz", { calories: 23, proteinG: 2.9, carbsG: 3.6, fatG: 0.4 }],
  ["Bell Pepper (raw)", 3.5, "oz", { calories: 31, proteinG: 1, carbsG: 6, fatG: 0.3 }],
  ["Carrots (raw)", 3.5, "oz", { calories: 41, proteinG: 0.9, carbsG: 9.6, fatG: 0.2 }],
  ["Asparagus (steamed)", 3.5, "oz", { calories: 22, proteinG: 2.4, carbsG: 4.1, fatG: 0.2 }],
  ["Green Beans (steamed)", 3.5, "oz", { calories: 35, proteinG: 1.9, carbsG: 8, fatG: 0.2 }],
  ["Cauliflower (steamed)", 3.5, "oz", { calories: 23, proteinG: 1.8, carbsG: 4.1, fatG: 0.5 }],
  ["Mixed Salad Greens", 3.5, "oz", { calories: 15, proteinG: 1.4, carbsG: 2.9, fatG: 0.2 }],

  // Fruit
  ["Apple", 1, "piece", { calories: 95, proteinG: 0.5, carbsG: 25, fatG: 0.3 }],
  ["Banana", 1, "piece", { calories: 105, proteinG: 1.3, carbsG: 27, fatG: 0.4 }],
  ["Orange", 1, "piece", { calories: 62, proteinG: 1.2, carbsG: 15.4, fatG: 0.2 }],
  ["Strawberries", 3.5, "oz", { calories: 32, proteinG: 0.7, carbsG: 7.7, fatG: 0.3 }],
  ["Blueberries", 3.5, "oz", { calories: 57, proteinG: 0.7, carbsG: 14.5, fatG: 0.3 }],
  ["Grapes", 3.5, "oz", { calories: 69, proteinG: 0.7, carbsG: 18.1, fatG: 0.2 }],

  // Dairy
  ["Milk (2%)", 1, "cup", { calories: 122, proteinG: 8.1, carbsG: 11.7, fatG: 4.8 }],
  ["Milk (whole)", 1, "cup", { calories: 149, proteinG: 7.7, carbsG: 11.7, fatG: 7.9 }],
  ["Cheddar Cheese", 1, "oz", { calories: 113, proteinG: 7, carbsG: 0.4, fatG: 9.3 }],
  ["String Cheese", 1, "piece", { calories: 80, proteinG: 7, carbsG: 1, fatG: 6 }],
];

function foodSeedName(seed: FoodSeed): string {
  return seed[0];
}

function buildFoodItem(seed: FoodSeed): FoodItem {
  const [name, servingSize, servingUnit, macros] = seed;
  return makeFood(name, servingSize, servingUnit, macros);
}

async function seedFoods(): Promise<void> {
  await db.foodItems.bulkAdd(CURATED_FOODS.map(buildFoodItem));
}

/** Adds any newly curated foods a device's library is missing, by name —
 * mirrors migrateExerciseLibrary's add-only approach so it never touches a
 * user's own custom foods or overwrites one they've edited. */
async function migrateFoodLibrary(): Promise<void> {
  const existing = await db.foodItems.toArray();
  const existingNames = new Set(existing.filter((food) => !food.isCustom).map((food) => food.name));

  const toAdd = CURATED_FOODS.filter((seed) => !existingNames.has(foodSeedName(seed))).map(buildFoodItem);
  if (toAdd.length > 0) await db.foodItems.bulkAdd(toAdd);
}

async function seedWorkoutTemplate(exerciseIds: Record<string, string>): Promise<void> {
  const timestamp = nowIso();
  const template: WorkoutTemplate = {
    id: newId(),
    name: "Full Body A",
    description: "A balanced full-body session covering all major movement patterns.",
    exercises: [
      {
        id: newId(),
        exerciseId: exerciseIds["Barbell Back Squat"],
        order: 0,
        targetSets: 3,
        targetRepsMin: 5,
        targetRepsMax: 8,
      },
      {
        id: newId(),
        exerciseId: exerciseIds["Barbell Bench Press"],
        order: 1,
        targetSets: 3,
        targetRepsMin: 5,
        targetRepsMax: 8,
      },
      {
        id: newId(),
        exerciseId: exerciseIds["Barbell Row"],
        order: 2,
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 12,
      },
      {
        id: newId(),
        exerciseId: exerciseIds["Plank"],
        order: 3,
        targetSets: 3,
        targetRepsMin: 30,
        targetRepsMax: 60,
        notes: "Hold time in seconds",
      },
    ],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await db.workoutTemplates.add(template);
}

async function seedNutritionGoal(): Promise<void> {
  const timestamp = nowIso();
  const goal: NutritionGoal = {
    id: newId(),
    effectiveDate: todayKey(),
    dailyCalories: 2400,
    proteinG: 160,
    carbsG: 260,
    fatG: 75,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await db.nutritionGoals.add(goal);
}

async function seedRunPlan(): Promise<void> {
  const timestamp = nowIso();
  const plan: RunPlan = {
    id: newId(),
    name: "3-Day Base Building",
    startDate: todayKey(),
    isActive: true,
    weeks: [
      {
        weekNumber: 1,
        plannedRuns: [
          {
            id: newId(),
            dayOfWeek: 2,
            runType: "easy",
            targetDistanceMiles: 3,
            notes: "Easy conversational pace",
          },
          {
            id: newId(),
            dayOfWeek: 4,
            runType: "tempo",
            targetDistanceMiles: 4,
            notes: "Comfortably hard middle 20 minutes",
          },
          {
            id: newId(),
            dayOfWeek: 6,
            runType: "long",
            targetDistanceMiles: 6,
            notes: "Long slow distance",
          },
        ],
      },
    ],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await db.runPlans.add(plan);
}

export async function seedIfEmpty(): Promise<void> {
  const flag = await db.meta.get(SEEDED_FLAG_KEY);
  if (flag) return;

  await db.transaction(
    "rw",
    [db.exercises, db.foodItems, db.workoutTemplates, db.nutritionGoals, db.runPlans, db.meta],
    async () => {
      const exerciseIds = await seedExercises();
      await seedFoods();
      await seedWorkoutTemplate(exerciseIds);
      await seedNutritionGoal();
      await seedRunPlan();
      await db.meta.put({ key: SEEDED_FLAG_KEY, value: "true" });
      await db.meta.put({ key: EXERCISE_LIBRARY_MIGRATION_KEY, value: "true" });
      await db.meta.put({ key: FOOD_LIBRARY_MIGRATION_KEY, value: "true" });
    },
  );
}

/** Runs once per device to bring an existing library up to the current curated
 * exercise set — safe to call unconditionally on every app start. */
export async function migrateExerciseLibraryIfNeeded(): Promise<void> {
  const flag = await db.meta.get(EXERCISE_LIBRARY_MIGRATION_KEY);
  if (flag) return;

  await db.transaction("rw", [db.exercises, db.meta], async () => {
    await migrateExerciseLibrary();
    await db.meta.put({ key: EXERCISE_LIBRARY_MIGRATION_KEY, value: "true" });
  });
}

/** Runs once per device to add newly curated foods to an existing library —
 * safe to call unconditionally on every app start. */
export async function migrateFoodLibraryIfNeeded(): Promise<void> {
  const flag = await db.meta.get(FOOD_LIBRARY_MIGRATION_KEY);
  if (flag) return;

  await db.transaction("rw", [db.foodItems, db.meta], async () => {
    await migrateFoodLibrary();
    await db.meta.put({ key: FOOD_LIBRARY_MIGRATION_KEY, value: "true" });
  });
}
