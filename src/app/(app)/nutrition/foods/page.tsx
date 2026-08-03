"use client";

import { Card } from "@/components/ui";
import { useFoods } from "@/features/nutrition/hooks/useFoods";
import { FoodForm } from "@/features/nutrition/components/FoodForm";
import { round } from "@/lib/utils/format";

export default function FoodsPage() {
  const { data: foods = [] } = useFoods();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Food library</h1>

      <Card accent="nutrition">
        <h2 className="mb-3 text-sm font-semibold">Add custom food</h2>
        <FoodForm />
      </Card>

      <div className="grid gap-2 sm:grid-cols-2">
        {foods.map((food) => (
          <div key={food.id} className="rounded-lg border border-border bg-surface px-3 py-2">
            <p className="text-sm font-medium">
              {food.name}
              {food.brand ? <span className="text-muted-foreground"> · {food.brand}</span> : null}
            </p>
            <p className="text-xs text-muted-foreground">
              Per {food.servingSize}
              {food.servingUnit}: {round(food.macrosPerServing.calories)} kcal ·{" "}
              {round(food.macrosPerServing.proteinG)}p / {round(food.macrosPerServing.carbsG)}c /{" "}
              {round(food.macrosPerServing.fatG)}f
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
