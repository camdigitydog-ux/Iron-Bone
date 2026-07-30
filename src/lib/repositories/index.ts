import { db } from "@/lib/db/schema";
import type { WorkoutRepository, NutritionRepository, RunningRepository, PlannerRepository } from "./types";
import { DexieWorkoutRepository } from "./dexie/dexieWorkoutRepository";
import { DexieNutritionRepository } from "./dexie/dexieNutritionRepository";
import { DexieRunningRepository } from "./dexie/dexieRunningRepository";
import { DexiePlannerRepository } from "./dexie/dexiePlannerRepository";

export interface Repositories {
  workouts: WorkoutRepository;
  nutrition: NutritionRepository;
  running: RunningRepository;
  planner: PlannerRepository;
}

let cached: Repositories | null = null;

/**
 * The only place that needs to change to move off local-only storage: swap these
 * Dexie-backed implementations for API-backed ones built against the same interfaces
 * in ./types.ts. Nothing above this factory (hooks, components, pages) needs to change.
 */
export function getRepositories(): Repositories {
  if (!cached) {
    cached = {
      workouts: new DexieWorkoutRepository(db),
      nutrition: new DexieNutritionRepository(db),
      running: new DexieRunningRepository(db),
      planner: new DexiePlannerRepository(db),
    };
  }
  return cached;
}

export type * from "./types";
