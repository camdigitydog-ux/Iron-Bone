import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "@/lib/providers/RepositoryProvider";
import { nutritionKeys, invalidationGroups } from "@/lib/query/keys";
import type { CreateInput } from "@/lib/repositories/types";
import type { NutritionGoal } from "@/lib/domain";

export function useActiveGoal(date: string) {
  const { nutrition } = useRepositories();
  return useQuery({
    queryKey: nutritionKeys.activeGoal(date),
    // Coerce "not found" (undefined) to null — TanStack Query rejects undefined data.
    queryFn: async () => (await nutrition.getActiveGoal(date)) ?? null,
  });
}

export function useGoals() {
  const { nutrition } = useRepositories();
  return useQuery({
    queryKey: nutritionKeys.goals(),
    queryFn: () => nutrition.listGoals(),
  });
}

export function useCreateGoal() {
  const { nutrition } = useRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInput<NutritionGoal>) => nutrition.createGoal(input),
    onSuccess: () => {
      invalidationGroups.nutrition.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
  });
}
