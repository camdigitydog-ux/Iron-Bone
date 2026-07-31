"use client";

import { Card } from "@/components/ui";
import { useActiveGoal, useGoals } from "@/features/nutrition/hooks/useGoals";
import { GoalForm } from "@/features/nutrition/components/GoalForm";
import { todayKey, formatFriendlyDate } from "@/lib/utils/date";

export default function GoalsPage() {
  const { data: currentGoal } = useActiveGoal(todayKey());
  const { data: goals = [] } = useGoals();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Nutrition goals</h1>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Set daily targets</h2>
        <GoalForm currentGoal={currentGoal} />
      </Card>

      {goals.length > 1 ? (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">History</h2>
          {goals.map((goal) => (
            <div key={goal.id} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm">
              <span className="font-medium">{formatFriendlyDate(goal.effectiveDate)}</span>{" "}
              <span className="text-muted-foreground">
                — {goal.dailyCalories} kcal, {goal.proteinG}p / {goal.carbsG}c / {goal.fatG}f
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
