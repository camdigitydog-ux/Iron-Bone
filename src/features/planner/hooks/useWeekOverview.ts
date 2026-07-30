import { useWorkoutSessions } from "@/features/workouts/hooks/useWorkoutSessions";
import { useMeals } from "@/features/nutrition/hooks/useMeals";
import { useRuns } from "@/features/running/hooks/useRuns";
import { usePlannerEntriesByRange } from "./usePlannerEntries";
import { dateKey } from "@/lib/utils/date";
import type { DateRange } from "@/lib/repositories/types";

export interface DayOverview {
  workoutCount: number;
  runCount: number;
  mealCount: number;
  plannerCount: number;
}

export function useWeekOverview(days: Date[]) {
  const range: DateRange = { from: dateKey(days[0]), to: dateKey(days[days.length - 1]) };

  const sessions = useWorkoutSessions(range);
  const runs = useRuns(range);
  const meals = useMeals(range);
  const plannerEntries = usePlannerEntriesByRange(range);

  const overview = new Map<string, DayOverview>();
  for (const day of days) {
    overview.set(dateKey(day), { workoutCount: 0, runCount: 0, mealCount: 0, plannerCount: 0 });
  }
  for (const session of sessions.data ?? []) {
    const entry = overview.get(session.date);
    if (entry) entry.workoutCount += 1;
  }
  for (const run of runs.data ?? []) {
    const entry = overview.get(run.date);
    if (entry) entry.runCount += 1;
  }
  for (const meal of meals.data ?? []) {
    const entry = overview.get(meal.date);
    if (entry) entry.mealCount += 1;
  }
  for (const plannerEntry of plannerEntries.data ?? []) {
    const entry = overview.get(plannerEntry.date);
    if (entry) entry.plannerCount += 1;
  }

  return {
    overview,
    isLoading: sessions.isLoading || runs.isLoading || meals.isLoading || plannerEntries.isLoading,
  };
}
