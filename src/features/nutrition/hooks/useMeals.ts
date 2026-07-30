import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "@/lib/providers/RepositoryProvider";
import { nutritionKeys, invalidationGroups } from "@/lib/query/keys";
import type { CreateInput, UpdatePatch, DateRange } from "@/lib/repositories/types";
import type { MealEntry, ID } from "@/lib/domain";

function useInvalidateNutrition() {
  const queryClient = useQueryClient();
  return () =>
    invalidationGroups.nutrition.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
}

export function useMeals(range?: DateRange) {
  const { nutrition } = useRepositories();
  return useQuery({
    queryKey: nutritionKeys.meals(range),
    queryFn: () => nutrition.listMeals(range),
  });
}

export function useMealsByDate(date: string) {
  const { nutrition } = useRepositories();
  return useQuery({
    queryKey: nutritionKeys.mealsByDate(date),
    queryFn: () => nutrition.getMealsByDate(date),
  });
}

export function useCreateMeal() {
  const { nutrition } = useRepositories();
  const invalidate = useInvalidateNutrition();
  return useMutation({
    mutationFn: (input: CreateInput<MealEntry>) => nutrition.createMeal(input),
    onSuccess: invalidate,
  });
}

export function useUpdateMeal() {
  const { nutrition } = useRepositories();
  const invalidate = useInvalidateNutrition();
  return useMutation({
    mutationFn: ({ id, patch }: { id: ID; patch: UpdatePatch<MealEntry> }) =>
      nutrition.updateMeal(id, patch),
    onSuccess: invalidate,
  });
}

export function useDeleteMeal() {
  const { nutrition } = useRepositories();
  const invalidate = useInvalidateNutrition();
  return useMutation({
    mutationFn: (id: ID) => nutrition.deleteMeal(id),
    onSuccess: invalidate,
  });
}
