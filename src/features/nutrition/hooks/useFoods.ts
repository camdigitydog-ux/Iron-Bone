import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "@/lib/providers/RepositoryProvider";
import { nutritionKeys, invalidationGroups } from "@/lib/query/keys";
import type { CreateInput, UpdatePatch } from "@/lib/repositories/types";
import type { FoodItem, ID } from "@/lib/domain";

function useInvalidateNutrition() {
  const queryClient = useQueryClient();
  return () =>
    invalidationGroups.nutrition.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
}

export function useFoods() {
  const { nutrition } = useRepositories();
  return useQuery({
    queryKey: nutritionKeys.foods(),
    queryFn: () => nutrition.listFoods(),
  });
}

export function useCreateFood() {
  const { nutrition } = useRepositories();
  const invalidate = useInvalidateNutrition();
  return useMutation({
    mutationFn: (input: CreateInput<FoodItem>) => nutrition.createFood(input),
    onSuccess: invalidate,
  });
}

export function useUpdateFood() {
  const { nutrition } = useRepositories();
  const invalidate = useInvalidateNutrition();
  return useMutation({
    mutationFn: ({ id, patch }: { id: ID; patch: UpdatePatch<FoodItem> }) =>
      nutrition.updateFood(id, patch),
    onSuccess: invalidate,
  });
}

export function useDeleteFood() {
  const { nutrition } = useRepositories();
  const invalidate = useInvalidateNutrition();
  return useMutation({
    mutationFn: (id: ID) => nutrition.deleteFood(id),
    onSuccess: invalidate,
  });
}
