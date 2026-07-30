"use client";

import { useState } from "react";
import { Button, Card, CardHeader, CardTitle } from "@/components/ui";
import { AddFoodEntryModal } from "./AddFoodEntryModal";
import { useCreateMeal, useUpdateMeal } from "../hooks/useMeals";
import { mealMacros } from "@/lib/domain";
import { round } from "@/lib/utils/format";
import type { MealEntry, MealFoodEntry, MealType } from "@/lib/domain";

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
};

export function MealSection({
  date,
  mealType,
  entries,
}: {
  date: string;
  mealType: MealType;
  entries: MealEntry[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const createMeal = useCreateMeal();
  const updateMeal = useUpdateMeal();

  const items = entries.flatMap((entry) => entry.items);
  const totals = mealMacros({ items } as MealEntry);

  async function handleAdd(item: MealFoodEntry) {
    const existing = entries[0];
    if (existing) {
      await updateMeal.mutateAsync({ id: existing.id, patch: { items: [...existing.items, item] } });
    } else {
      await createMeal.mutateAsync({
        date,
        mealType,
        loggedAt: new Date().toISOString(),
        items: [item],
      });
    }
  }

  async function handleRemove(itemId: string) {
    for (const entry of entries) {
      if (entry.items.some((item) => item.id === itemId)) {
        await updateMeal.mutateAsync({
          id: entry.id,
          patch: { items: entry.items.filter((item) => item.id !== itemId) },
        });
        return;
      }
    }
  }

  return (
    <Card className="space-y-3">
      <CardHeader>
        <CardTitle>{MEAL_LABELS[mealType]}</CardTitle>
        <span className="text-xs text-muted-foreground">{round(totals.calories)} kcal</span>
      </CardHeader>

      {items.length > 0 ? (
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between text-sm">
              <span>
                {item.foodName}{" "}
                <span className="text-xs text-muted-foreground">
                  {item.amount}
                  {item.unit} · {round(item.macros.calories)} kcal
                </span>
              </span>
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="text-muted-foreground hover:text-danger"
                aria-label={`Remove ${item.foodName}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">Nothing logged yet.</p>
      )}

      <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)} className="w-full">
        + Add food
      </Button>

      <AddFoodEntryModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} />
    </Card>
  );
}
