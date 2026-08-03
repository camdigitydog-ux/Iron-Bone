import type { FitnessPlannerDB } from "@/lib/db/schema";
import type { FoodItem, MealEntry, NutritionGoal, BodyWeightEntry, ID } from "@/lib/domain";
import type { NutritionRepository, CreateInput, UpdatePatch, DateRange } from "../types";
import { createEntity, updateEntity } from "./helpers";

export class DexieNutritionRepository implements NutritionRepository {
  constructor(private db: FitnessPlannerDB) {}

  listFoods(): Promise<FoodItem[]> {
    return this.db.foodItems.orderBy("name").toArray();
  }

  createFood(input: CreateInput<FoodItem>): Promise<FoodItem> {
    return createEntity<FoodItem>(this.db.foodItems, input);
  }

  updateFood(id: ID, patch: UpdatePatch<FoodItem>): Promise<FoodItem> {
    return updateEntity<FoodItem>(this.db.foodItems, id, patch);
  }

  async deleteFood(id: ID): Promise<void> {
    await this.db.foodItems.delete(id);
  }

  async listMeals(range?: DateRange): Promise<MealEntry[]> {
    if (!range) return this.db.mealEntries.orderBy("date").reverse().toArray();
    return this.db.mealEntries.where("date").between(range.from, range.to, true, true).toArray();
  }

  getMealsByDate(date: string): Promise<MealEntry[]> {
    return this.db.mealEntries.where("date").equals(date).toArray();
  }

  createMeal(input: CreateInput<MealEntry>): Promise<MealEntry> {
    return createEntity<MealEntry>(this.db.mealEntries, input);
  }

  updateMeal(id: ID, patch: UpdatePatch<MealEntry>): Promise<MealEntry> {
    return updateEntity<MealEntry>(this.db.mealEntries, id, patch);
  }

  async deleteMeal(id: ID): Promise<void> {
    await this.db.mealEntries.delete(id);
  }

  async getActiveGoal(date: string): Promise<NutritionGoal | undefined> {
    const goals = await this.db.nutritionGoals
      .where("effectiveDate")
      .belowOrEqual(date)
      .toArray();
    if (goals.length === 0) return undefined;
    return goals.sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))[0];
  }

  listGoals(): Promise<NutritionGoal[]> {
    return this.db.nutritionGoals.orderBy("effectiveDate").reverse().toArray();
  }

  createGoal(input: CreateInput<NutritionGoal>): Promise<NutritionGoal> {
    return createEntity<NutritionGoal>(this.db.nutritionGoals, input);
  }

  async listBodyWeightEntries(range?: DateRange): Promise<BodyWeightEntry[]> {
    if (!range) return this.db.bodyWeightEntries.orderBy("date").toArray();
    return this.db.bodyWeightEntries.where("date").between(range.from, range.to, true, true).toArray();
  }

  async getLatestBodyWeightEntry(): Promise<BodyWeightEntry | undefined> {
    return this.db.bodyWeightEntries.orderBy("date").last();
  }

  createBodyWeightEntry(input: CreateInput<BodyWeightEntry>): Promise<BodyWeightEntry> {
    return createEntity<BodyWeightEntry>(this.db.bodyWeightEntries, input);
  }
}
