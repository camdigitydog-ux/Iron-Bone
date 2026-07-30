import type {
  ID,
  BaseEntity,
  ExerciseDefinition,
  WorkoutTemplate,
  WorkoutSession,
  FoodItem,
  MealEntry,
  NutritionGoal,
  RunEntry,
  RunPlan,
  PlannerEntry,
} from "@/lib/domain";

export type CreateInput<T extends BaseEntity> = Omit<T, keyof BaseEntity>;
export type UpdatePatch<T extends BaseEntity> = Partial<CreateInput<T>>;

export interface DateRange {
  from: string; // yyyy-MM-dd inclusive
  to: string; // yyyy-MM-dd inclusive
}

export interface WorkoutRepository {
  listExercises(): Promise<ExerciseDefinition[]>;
  createExercise(input: CreateInput<ExerciseDefinition>): Promise<ExerciseDefinition>;

  listTemplates(): Promise<WorkoutTemplate[]>;
  getTemplate(id: ID): Promise<WorkoutTemplate | undefined>;
  createTemplate(input: CreateInput<WorkoutTemplate>): Promise<WorkoutTemplate>;
  updateTemplate(id: ID, patch: UpdatePatch<WorkoutTemplate>): Promise<WorkoutTemplate>;
  deleteTemplate(id: ID): Promise<void>;

  listSessions(range?: DateRange): Promise<WorkoutSession[]>;
  getSession(id: ID): Promise<WorkoutSession | undefined>;
  getSessionsByDate(date: string): Promise<WorkoutSession[]>;
  createSession(input: CreateInput<WorkoutSession>): Promise<WorkoutSession>;
  updateSession(id: ID, patch: UpdatePatch<WorkoutSession>): Promise<WorkoutSession>;
  deleteSession(id: ID): Promise<void>;
}

export interface NutritionRepository {
  listFoods(): Promise<FoodItem[]>;
  createFood(input: CreateInput<FoodItem>): Promise<FoodItem>;
  updateFood(id: ID, patch: UpdatePatch<FoodItem>): Promise<FoodItem>;
  deleteFood(id: ID): Promise<void>;

  listMeals(range?: DateRange): Promise<MealEntry[]>;
  getMealsByDate(date: string): Promise<MealEntry[]>;
  createMeal(input: CreateInput<MealEntry>): Promise<MealEntry>;
  updateMeal(id: ID, patch: UpdatePatch<MealEntry>): Promise<MealEntry>;
  deleteMeal(id: ID): Promise<void>;

  getActiveGoal(date: string): Promise<NutritionGoal | undefined>;
  listGoals(): Promise<NutritionGoal[]>;
  createGoal(input: CreateInput<NutritionGoal>): Promise<NutritionGoal>;
}

export interface RunningRepository {
  listRuns(range?: DateRange): Promise<RunEntry[]>;
  getRun(id: ID): Promise<RunEntry | undefined>;
  getRunsByDate(date: string): Promise<RunEntry[]>;
  createRun(input: CreateInput<RunEntry>): Promise<RunEntry>;
  updateRun(id: ID, patch: UpdatePatch<RunEntry>): Promise<RunEntry>;
  deleteRun(id: ID): Promise<void>;

  getActivePlan(): Promise<RunPlan | undefined>;
  listPlans(): Promise<RunPlan[]>;
  createPlan(input: CreateInput<RunPlan>): Promise<RunPlan>;
  updatePlan(id: ID, patch: UpdatePatch<RunPlan>): Promise<RunPlan>;
}

export interface PlannerRepository {
  listByDate(date: string): Promise<PlannerEntry[]>;
  listByRange(range: DateRange): Promise<PlannerEntry[]>;
  create(input: CreateInput<PlannerEntry>): Promise<PlannerEntry>;
  update(id: ID, patch: UpdatePatch<PlannerEntry>): Promise<PlannerEntry>;
  delete(id: ID): Promise<void>;
}
