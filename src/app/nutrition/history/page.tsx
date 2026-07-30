"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useMeals } from "@/features/nutrition/hooks/useMeals";
import { useActiveGoal } from "@/features/nutrition/hooks/useGoals";
import { mealMacros } from "@/lib/domain";
import { Card, EmptyState } from "@/components/ui";
import { addDaysToKey, todayKey, formatFriendlyDate } from "@/lib/utils/date";
import { round } from "@/lib/utils/format";

const DAYS_BACK = 13;

export default function NutritionHistoryPage() {
  const today = todayKey();
  const from = addDaysToKey(today, -DAYS_BACK);
  const { data: meals = [] } = useMeals({ from, to: today });
  const { data: goal } = useActiveGoal(today);

  const totalsByDate = new Map<string, number>();
  for (let i = 0; i <= DAYS_BACK; i++) {
    totalsByDate.set(addDaysToKey(from, i), 0);
  }
  for (const meal of meals) {
    const macros = mealMacros(meal);
    totalsByDate.set(meal.date, (totalsByDate.get(meal.date) ?? 0) + macros.calories);
  }

  const chartData = Array.from(totalsByDate.entries()).map(([date, calories]) => ({
    date: formatFriendlyDate(date).replace(/^\w+, /, ""),
    calories: round(calories, 0),
  }));

  const hasData = meals.length > 0;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Nutrition history</h1>

      {hasData ? (
        <Card>
          <p className="mb-3 text-sm font-semibold">Daily calories (last 14 days)</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={1} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  width={40}
                  domain={[0, (dataMax: number) => Math.max(dataMax, goal?.dailyCalories ?? 0) * 1.1]}
                />
                <Tooltip />
                <Line type="monotone" dataKey="calories" stroke="var(--nutrition)" strokeWidth={2} dot={false} />
                {goal ? (
                  <ReferenceLine
                    y={goal.dailyCalories}
                    stroke="var(--muted-foreground)"
                    strokeDasharray="4 4"
                    label={{ value: "Goal", fontSize: 11, position: "insideTopRight" }}
                  />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : (
        <EmptyState title="No nutrition history yet" description="Log meals to see trends over time." />
      )}
    </div>
  );
}
