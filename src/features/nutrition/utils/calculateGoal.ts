export type BiologicalSex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "very" | "extreme";
export type CalorieGoal = "lose" | "maintain" | "gain";

export const ACTIVITY_LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: "sedentary", label: "Sedentary (little or no exercise)" },
  { value: "light", label: "Lightly active (exercise 1-3 days/wk)" },
  { value: "moderate", label: "Moderately active (exercise 3-5 days/wk)" },
  { value: "very", label: "Very active (exercise 6-7 days/wk)" },
  { value: "extreme", label: "Extremely active (hard daily training)" },
];

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extreme: 1.9,
};

export const CALORIE_GOALS: { value: CalorieGoal; label: string }[] = [
  { value: "lose", label: "Lose weight" },
  { value: "maintain", label: "Maintain weight" },
  { value: "gain", label: "Build muscle" },
];

const LB_TO_KG = 0.45359237;
const IN_TO_CM = 2.54;

export interface CalculateGoalInput {
  sex: BiologicalSex;
  age: number;
  weightLb: number;
  heightIn: number;
  activityLevel: ActivityLevel;
  goal: CalorieGoal;
}

export interface CalculatedGoal {
  bmr: number;
  tdee: number;
  dailyCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  /** The body weight this estimate was based on, so the goal can later be
   * flagged for recalculation once weight has drifted enough to matter. */
  weightLb: number;
}

/**
 * Mifflin-St Jeor BMR × activity multiplier, then macros split by
 * evidence-based defaults rather than an arbitrary percentage guess:
 *  - Protein at 1g/lb covers the well-supported 1.6-2.2g/kg range for
 *    resistance-trained adults (ISSN position stand) and sits at the high
 *    end recommended for preserving muscle in a deficit.
 *  - Fat at 25% of calories, the middle of the accepted 20-35% band.
 *  - Carbs fill whatever calories remain, since they're the most
 *    performance-flexible macro for someone training regularly.
 * Calorie adjustment is a moderate ±1 lb/week pace rather than the more
 * aggressive ends of the researched deficit/surplus ranges, since faster
 * rates cost more muscle (cutting) or add more fat (bulking) per pound.
 */
export function calculateNutritionGoal({
  sex,
  age,
  weightLb,
  heightIn,
  activityLevel,
  goal,
}: CalculateGoalInput): CalculatedGoal {
  const weightKg = weightLb * LB_TO_KG;
  const heightCm = heightIn * IN_TO_CM;

  const bmr =
    sex === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const tdee = bmr * ACTIVITY_MULTIPLIER[activityLevel];

  const calorieAdjustment = goal === "lose" ? -500 : goal === "gain" ? 300 : 0;
  const dailyCalories = Math.max(1200, Math.round(tdee + calorieAdjustment));

  const proteinG = Math.round(weightLb * 1);
  const fatG = Math.round((dailyCalories * 0.25) / 9);
  const carbsG = Math.max(0, Math.round((dailyCalories - proteinG * 4 - fatG * 9) / 4));

  return { bmr: Math.round(bmr), tdee: Math.round(tdee), dailyCalories, proteinG, carbsG, fatG, weightLb };
}
