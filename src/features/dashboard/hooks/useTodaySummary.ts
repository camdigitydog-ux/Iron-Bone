import { useDayDetail } from "@/features/planner/hooks/useDayDetail";
import { useActiveGoal } from "@/features/nutrition/hooks/useGoals";
import { useRuns } from "@/features/running/hooks/useRuns";
import { useWorkoutSessions } from "@/features/workouts/hooks/useWorkoutSessions";
import { dateKey, daysOfWeek, todayKey } from "@/lib/utils/date";
import { mealMacros, sumMacros } from "@/lib/domain";
import type { DateRange } from "@/lib/repositories/types";

export function useTodaySummary() {
  const today = todayKey();
  const day = useDayDetail(today);
  const goal = useActiveGoal(today);

  const week = daysOfWeek(new Date());
  const weekRange: DateRange = { from: dateKey(week[0]), to: dateKey(week[week.length - 1]) };
  const weeklyRuns = useRuns(weekRange);
  const weeklySessions = useWorkoutSessions(weekRange);

  const consumedToday = sumMacros(day.meals.map((meal) => mealMacros(meal)));
  const weeklyDistanceMiles = (weeklyRuns.data ?? []).reduce(
    (total, run) => total + run.distanceMiles,
    0,
  );
  const weeklyWorkoutCount = (weeklySessions.data ?? []).length;

  return {
    date: today,
    ...day,
    goal: goal.data,
    consumedToday,
    weeklyDistanceMiles,
    weeklyWorkoutCount,
    isLoading: day.isLoading || goal.isLoading || weeklyRuns.isLoading || weeklySessions.isLoading,
  };
}
