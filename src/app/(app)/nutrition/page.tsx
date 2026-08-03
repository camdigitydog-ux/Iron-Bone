"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { useMealsByDate } from "@/features/nutrition/hooks/useMeals";
import { useActiveGoal } from "@/features/nutrition/hooks/useGoals";
import { MacroSummary } from "@/features/nutrition/components/MacroSummary";
import { MealSection } from "@/features/nutrition/components/MealSection";
import { MEAL_TYPES, mealMacros, sumMacros } from "@/lib/domain";
import { todayKey, formatFriendlyDate } from "@/lib/utils/date";
import type { MealEntry } from "@/lib/domain";

export default function NutritionPage() {
  const date = todayKey();
  const { data: meals = [] } = useMealsByDate(date);
  const { data: goal } = useActiveGoal(date);

  const consumed = sumMacros(meals.map((meal) => mealMacros(meal)));

  const mealsByType = MEAL_TYPES.reduce<Record<string, MealEntry[]>>((acc, type) => {
    acc[type] = meals.filter((meal) => meal.mealType === type);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Nutrition</h1>
          <p className="text-xs text-muted-foreground">{formatFriendlyDate(date)}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/nutrition/foods">
            <Button variant="secondary" size="sm" tone="nutrition">
              Foods
            </Button>
          </Link>
          <Link href="/nutrition/goals">
            <Button variant="secondary" size="sm" tone="nutrition">
              Goals
            </Button>
          </Link>
          <Link href="/nutrition/history">
            <Button variant="secondary" size="sm" tone="nutrition">
              History
            </Button>
          </Link>
        </div>
      </div>

      <MacroSummary consumed={consumed} goal={goal} />

      <div className="space-y-3">
        {MEAL_TYPES.map((type) => (
          <MealSection key={type} date={date} mealType={type} entries={mealsByType[type]} />
        ))}
      </div>
    </div>
  );
}
