import type { DateRange } from "@/lib/repositories/types";

export const workoutKeys = {
  all: ["workouts"] as const,
  exercises: () => [...workoutKeys.all, "exercises"] as const,
  templates: () => [...workoutKeys.all, "templates"] as const,
  template: (id: string) => [...workoutKeys.all, "templates", id] as const,
  sessions: (range?: DateRange) => [...workoutKeys.all, "sessions", range ?? "all"] as const,
  session: (id: string) => [...workoutKeys.all, "sessions", id] as const,
  sessionsByDate: (date: string) => [...workoutKeys.all, "sessions", "date", date] as const,
};

export const nutritionKeys = {
  all: ["nutrition"] as const,
  foods: () => [...nutritionKeys.all, "foods"] as const,
  meals: (range?: DateRange) => [...nutritionKeys.all, "meals", range ?? "all"] as const,
  mealsByDate: (date: string) => [...nutritionKeys.all, "meals", "date", date] as const,
  goals: () => [...nutritionKeys.all, "goals"] as const,
  activeGoal: (date: string) => [...nutritionKeys.all, "goals", "active", date] as const,
  bodyWeight: (range?: DateRange) => [...nutritionKeys.all, "bodyWeight", range ?? "all"] as const,
  latestBodyWeight: () => [...nutritionKeys.all, "bodyWeight", "latest"] as const,
};

export const runningKeys = {
  all: ["running"] as const,
  runs: (range?: DateRange) => [...runningKeys.all, "runs", range ?? "all"] as const,
  run: (id: string) => [...runningKeys.all, "runs", id] as const,
  runsByDate: (date: string) => [...runningKeys.all, "runs", "date", date] as const,
  plans: () => [...runningKeys.all, "plans"] as const,
  activePlan: () => [...runningKeys.all, "plans", "active"] as const,
};

export const plannerKeys = {
  all: ["planner"] as const,
  byDate: (date: string) => [...plannerKeys.all, "date", date] as const,
  byRange: (range: DateRange) => [...plannerKeys.all, "range", range] as const,
};

export const dashboardKeys = {
  all: ["dashboard"] as const,
  today: (date: string) => [...dashboardKeys.all, date] as const,
};

/** Every key group a mutation in a given domain should invalidate, including cross-domain dashboard/planner reads. */
export const invalidationGroups = {
  workouts: [workoutKeys.all, dashboardKeys.all, plannerKeys.all],
  nutrition: [nutritionKeys.all, dashboardKeys.all, plannerKeys.all],
  running: [runningKeys.all, dashboardKeys.all, plannerKeys.all],
  planner: [plannerKeys.all, dashboardKeys.all],
};
