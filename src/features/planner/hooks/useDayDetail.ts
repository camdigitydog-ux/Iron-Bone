import { useWorkoutSessionsByDate } from "@/features/workouts/hooks/useWorkoutSessions";
import { useMealsByDate } from "@/features/nutrition/hooks/useMeals";
import { useRunsByDate } from "@/features/running/hooks/useRuns";
import { useActiveRunPlan } from "@/features/running/hooks/useRunPlans";
import { usePlannerEntriesByDate } from "./usePlannerEntries";
import { parseDateKey } from "@/lib/utils/date";
import { getPlanWeekForDate } from "@/lib/domain";
import type { PlannedRun } from "@/lib/domain";

export function useDayDetail(date: string) {
  const sessions = useWorkoutSessionsByDate(date);
  const runs = useRunsByDate(date);
  const meals = useMealsByDate(date);
  const plannerEntries = usePlannerEntriesByDate(date);
  const activePlan = useActiveRunPlan();

  const dayOfWeek = parseDateKey(date).getDay();
  const planWeek = activePlan.data ? getPlanWeekForDate(activePlan.data, date) : undefined;
  const suggestedRun: PlannedRun | undefined = planWeek?.plannedRuns.find(
    (planned) => planned.dayOfWeek === dayOfWeek,
  );
  const hasLoggedRun = (runs.data ?? []).length > 0;

  return {
    sessions: sessions.data ?? [],
    runs: runs.data ?? [],
    meals: meals.data ?? [],
    plannerEntries: plannerEntries.data ?? [],
    suggestedRun: !hasLoggedRun ? suggestedRun : undefined,
    isLoading:
      sessions.isLoading || runs.isLoading || meals.isLoading || plannerEntries.isLoading || activePlan.isLoading,
  };
}
