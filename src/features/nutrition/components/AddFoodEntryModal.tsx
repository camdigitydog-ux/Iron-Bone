"use client";

import { useState } from "react";
import { Button, Input, Modal } from "@/components/ui";
import { useFoods, useCreateFood } from "../hooks/useFoods";
import { useFoodSearch } from "../hooks/useFoodSearch";
import { scaleMacros } from "@/lib/domain";
import { newId } from "@/lib/utils/id";
import type { MealFoodEntry } from "@/lib/domain";
import type { ExternalFoodResult } from "@/lib/external/foodSearch";

// Open Food Facts reports macros per 100g; 100g ≈ 3.5oz, so results are stored
// with the same numbers relabeled onto an imperial reference serving.
const REFERENCE_SERVING_OZ = 3.5;

export function AddFoodEntryModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (entry: MealFoodEntry) => void;
}) {
  const { data: foods = [] } = useFoods();
  const createFood = useCreateFood();

  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  const { data: results = [], isLoading: isSearching, isError: searchFailed } = useFoodSearch(term);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [addingId, setAddingId] = useState<string | null>(null);

  function reset() {
    setQuery("");
    setTerm("");
    setAmounts({});
  }

  async function handleAdd(result: ExternalFoodResult) {
    const amount = Number(amounts[result.externalId]);
    if (!amount || amount <= 0) return;

    setAddingId(result.externalId);
    try {
      // Reuse an already-imported copy of this food instead of creating a duplicate.
      let food = foods.find((f) => f.name === result.name && f.brand === result.brand);
      if (!food) {
        food = await createFood.mutateAsync({
          name: result.name,
          brand: result.brand,
          servingSize: REFERENCE_SERVING_OZ,
          servingUnit: "oz",
          macrosPerServing: {
            calories: result.caloriesPer100g,
            proteinG: result.proteinPer100g,
            carbsG: result.carbsPer100g,
            fatG: result.fatPer100g,
          },
          isCustom: true,
        });
      }

      onAdd({
        id: newId(),
        foodItemId: food.id,
        foodName: food.brand ? `${food.name} (${food.brand})` : food.name,
        amount,
        unit: food.servingUnit,
        macros: scaleMacros(food.macrosPerServing, amount / food.servingSize),
      });
      reset();
      onClose();
    } finally {
      setAddingId(null);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Add food"
    >
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setTerm(query);
              }
            }}
            placeholder="Search for a food, e.g. cottage cheese"
            autoFocus
            className="flex-1"
          />
          <Button variant="secondary" onClick={() => setTerm(query)}>
            Search
          </Button>
        </div>

        {isSearching && <p className="text-xs text-muted-foreground">Searching…</p>}
        {searchFailed && (
          <p className="text-xs text-danger">Search failed — check your connection and try again.</p>
        )}
        {!isSearching && term && results.length === 0 && !searchFailed && (
          <p className="text-xs text-muted-foreground">No matches found.</p>
        )}

        {results.length > 0 && (
          <ul className="max-h-80 space-y-2 overflow-y-auto">
            {results.map((result) => (
              <li key={result.externalId} className="rounded-lg border border-border px-3 py-2">
                <p className="text-sm font-medium">
                  {result.name}
                  {result.brand ? (
                    <span className="font-normal text-muted-foreground"> · {result.brand}</span>
                  ) : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(result.caloriesPer100g)} kcal / {REFERENCE_SERVING_OZ}oz ·{" "}
                  {Math.round(result.proteinPer100g)}g protein
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    placeholder="Amount"
                    value={amounts[result.externalId] ?? ""}
                    onChange={(e) =>
                      setAmounts((prev) => ({ ...prev, [result.externalId]: e.target.value }))
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">oz</span>
                  <Button
                    size="sm"
                    onClick={() => handleAdd(result)}
                    disabled={
                      addingId === result.externalId ||
                      !amounts[result.externalId] ||
                      Number(amounts[result.externalId]) <= 0
                    }
                    className="ml-auto"
                  >
                    {addingId === result.externalId ? "Adding…" : "Add"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
