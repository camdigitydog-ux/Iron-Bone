import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "@/lib/providers/RepositoryProvider";
import { nutritionKeys, invalidationGroups } from "@/lib/query/keys";
import type { CreateInput, DateRange } from "@/lib/repositories/types";
import type { BodyWeightEntry } from "@/lib/domain";

export function useBodyWeightEntries(range?: DateRange) {
  const { nutrition } = useRepositories();
  return useQuery({
    queryKey: nutritionKeys.bodyWeight(range),
    queryFn: () => nutrition.listBodyWeightEntries(range),
  });
}

export function useLatestBodyWeight() {
  const { nutrition } = useRepositories();
  return useQuery({
    queryKey: nutritionKeys.latestBodyWeight(),
    queryFn: async () => (await nutrition.getLatestBodyWeightEntry()) ?? null,
  });
}

export function useCreateBodyWeightEntry() {
  const { nutrition } = useRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInput<BodyWeightEntry>) => nutrition.createBodyWeightEntry(input),
    onSuccess: () => {
      invalidationGroups.nutrition.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
  });
}
