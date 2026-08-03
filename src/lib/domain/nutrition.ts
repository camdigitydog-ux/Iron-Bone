import { sumMacros } from "./common";
import type { BaseEntity, ID, Macros } from "./common";

export interface FoodItem extends BaseEntity {
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string; // "g" | "ml" | "cup" | "piece" | ...
  macrosPerServing: Macros;
  isCustom: boolean;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export interface MealFoodEntry {
  id: ID;
  foodItemId: ID;
  foodName: string; // snapshot, so a deleted/renamed food doesn't break history
  amount: number; // quantity consumed, in `unit`
  unit: string; // snapshot of the food's servingUnit at log time, e.g. "g", "ml", "piece"
  macros: Macros; // snapshot at log time, scaled for `amount`
}

export interface MealEntry extends BaseEntity {
  date: string; // yyyy-MM-dd
  mealType: MealType;
  loggedAt: string; // ISO datetime
  items: MealFoodEntry[];
  notes?: string;
}

export interface NutritionGoal extends BaseEntity {
  effectiveDate: string; // yyyy-MM-dd
  dailyCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  /** Body weight the calculator used to derive this goal, if it was
   * calculated rather than entered by hand — lets the app notice when
   * weight has drifted enough (10-15lb) to be worth recalculating. */
  basedOnWeightLb?: number;
  /** Optional daily fiber target — no goal-calculator support for this yet, so
   * it's normally unset; MacroSummary falls back to the FDA Daily Value (28g)
   * when absent rather than leaving the fiber row without a target. */
  fiberG?: number;
}

export interface BodyWeightEntry extends BaseEntity {
  date: string; // yyyy-MM-dd
  weightLb: number;
  notes?: string;
}

export function mealMacros(meal: MealEntry): Macros {
  return sumMacros(meal.items.map((item) => item.macros));
}
