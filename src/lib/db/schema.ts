import Dexie, { type EntityTable } from "dexie";
import type {
  ExerciseDefinition,
  WorkoutTemplate,
  WorkoutSession,
  FoodItem,
  MealEntry,
  NutritionGoal,
  BodyWeightEntry,
  RunEntry,
  RunPlan,
  PlannerEntry,
} from "@/lib/domain";

export interface MetaRow {
  key: string;
  value: string;
}

export class FitnessPlannerDB extends Dexie {
  exercises!: EntityTable<ExerciseDefinition, "id">;
  workoutTemplates!: EntityTable<WorkoutTemplate, "id">;
  workoutSessions!: EntityTable<WorkoutSession, "id">;
  foodItems!: EntityTable<FoodItem, "id">;
  mealEntries!: EntityTable<MealEntry, "id">;
  nutritionGoals!: EntityTable<NutritionGoal, "id">;
  bodyWeightEntries!: EntityTable<BodyWeightEntry, "id">;
  runEntries!: EntityTable<RunEntry, "id">;
  runPlans!: EntityTable<RunPlan, "id">;
  plannerEntries!: EntityTable<PlannerEntry, "id">;
  meta!: EntityTable<MetaRow, "key">;

  constructor() {
    super("fitness-planner");

    this.version(1).stores({
      exercises: "id, name, isCustom",
      workoutTemplates: "id, name, createdAt",
      workoutSessions: "id, date, templateId, createdAt",
      foodItems: "id, name, isCustom",
      mealEntries: "id, date, mealType, createdAt",
      nutritionGoals: "id, effectiveDate",
      runEntries: "id, date, createdAt",
      runPlans: "id, isActive, startDate",
      plannerEntries: "id, date, itemType, status",
      meta: "key",
    });

    this.version(2).stores({
      bodyWeightEntries: "id, date",
    });
  }
}

export const db = new FitnessPlannerDB();
