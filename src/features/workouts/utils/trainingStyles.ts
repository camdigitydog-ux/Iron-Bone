/**
 * Training-style presets for the workout generator. Each bundles the rep/set/rest
 * scheme for its main lifts and accessories, plus a bias on how exercises get
 * picked — sourced from NSCA/ACSM load-intensity guidelines (strength ≥85% 1RM /
 * hypertrophy 67–85% / endurance <67%, https://pubmed.ncbi.nlm.nih.gov/19204579/),
 * Renaissance-Periodization-aligned volume landmarks (10–20 working sets per
 * muscle per week, https://www.nsca.com/education/articles/ptq/training-volume-and-hypertrophy-an-evidence-based-approach-for-personal-trainers/),
 * Westside/powerlifting accessory conventions (primary accessories <80% 1RM in
 * service of the competition lift, upper-back work 2–3x/week,
 * https://www.westside-barbell.com/a/blog/accessory-exercise-basics), and
 * CrossFit metcon/circuit structure (rounds with minimal between-movement rest,
 * https://vegvisircrossfit.com/uncategorized/amrap-emom-metcon-how-did-crossfit-programming-start/).
 */

export type TrainingStyle = "general" | "bodybuilding" | "powerlifting" | "functional" | "crossfit";

export interface StyleParams {
  label: string;
  description: string;
  mainSets: number;
  mainRepsMin: number;
  mainRepsMax: number;
  restMainSec: number;
  accessorySets: number;
  accessoryRepsMin: number;
  accessoryRepsMax: number;
  restAccessorySec: number;
  accessoriesPerGroupDefault: number;
  /** Soft preference — used to rank candidates, not a hard filter. */
  preferredEquipment?: string[];
  /** Bias accessory selection toward this mechanic when there's a choice. */
  preferMechanic?: "compound" | "isolation";
  /** Always round out the workout with these movement patterns, regardless of
   * which muscle groups were picked — a defining trait of that style. */
  alwaysInclude?: string[];
  structureNote?: string;
}

export const STYLE_PARAMS: Record<TrainingStyle, StyleParams> = {
  general: {
    label: "General strength",
    description: "Balanced main lifts and accessories — a solid default for overall fitness.",
    mainSets: 4,
    mainRepsMin: 5,
    mainRepsMax: 8,
    restMainSec: 120,
    accessorySets: 3,
    accessoryRepsMin: 10,
    accessoryRepsMax: 15,
    restAccessorySec: 75,
    accessoriesPerGroupDefault: 1,
  },
  bodybuilding: {
    label: "Bodybuilding",
    description: "Higher volume and more accessory variety per muscle, with mind-muscle coaching cues on every set.",
    mainSets: 4,
    mainRepsMin: 8,
    mainRepsMax: 12,
    restMainSec: 90,
    accessorySets: 3,
    accessoryRepsMin: 10,
    accessoryRepsMax: 15,
    restAccessorySec: 60,
    accessoriesPerGroupDefault: 2,
    preferMechanic: "isolation",
  },
  powerlifting: {
    label: "Powerlifting",
    description: "A heavy top set plus backoffs on the big barbell lifts, with targeted supporting accessories.",
    mainSets: 5,
    mainRepsMin: 3,
    mainRepsMax: 5,
    restMainSec: 240,
    accessorySets: 3,
    accessoryRepsMin: 6,
    accessoryRepsMax: 10,
    restAccessorySec: 90,
    accessoriesPerGroupDefault: 1,
    preferredEquipment: ["barbell"],
    structureNote:
      "Main lifts run as a top set (work up to a heavy double/triple) plus 4 backoff sets at a lighter load — the actual powerlifting convention, not uniform straight sets. Accessories support the squat/bench/deadlift rather than standing on their own.",
  },
  functional: {
    label: "Functional fitness",
    description:
      "Real-world movement patterns — compound, often unilateral — plus a carry and core finisher every session.",
    mainSets: 3,
    mainRepsMin: 8,
    mainRepsMax: 12,
    restMainSec: 75,
    accessorySets: 3,
    accessoryRepsMin: 10,
    accessoryRepsMax: 15,
    restAccessorySec: 45,
    accessoriesPerGroupDefault: 1,
    preferredEquipment: ["dumbbell", "kettlebell", "bodyweight"],
    preferMechanic: "compound",
    alwaysInclude: ["carry", "core"],
    structureNote: "Always rounds out with a loaded carry and a core movement, whatever else is picked.",
  },
  crossfit: {
    label: "CrossFit style",
    description: "A real WOD — a strength lift, then an AMRAP, For Time, EMOM, chipper, or 21-15-9 metcon.",
    mainSets: 3,
    mainRepsMin: 8,
    mainRepsMax: 15,
    restMainSec: 30,
    accessorySets: 3,
    accessoryRepsMin: 10,
    accessoryRepsMax: 15,
    restAccessorySec: 20,
    accessoriesPerGroupDefault: 1,
    preferredEquipment: ["barbell", "kettlebell", "bodyweight"],
    preferMechanic: "compound",
    structureNote: "Pick a WOD format below — this style builds a real class structure, not straight sets.",
  },
};
