import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "@/lib/providers/RepositoryProvider";
import { plannerKeys, invalidationGroups } from "@/lib/query/keys";
import type { CreateInput, UpdatePatch, DateRange } from "@/lib/repositories/types";
import type { PlannerEntry, ID } from "@/lib/domain";

function useInvalidatePlanner() {
  const queryClient = useQueryClient();
  return () =>
    invalidationGroups.planner.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
}

export function usePlannerEntriesByDate(date: string) {
  const { planner } = useRepositories();
  return useQuery({
    queryKey: plannerKeys.byDate(date),
    queryFn: () => planner.listByDate(date),
  });
}

export function usePlannerEntriesByRange(range: DateRange) {
  const { planner } = useRepositories();
  return useQuery({
    queryKey: plannerKeys.byRange(range),
    queryFn: () => planner.listByRange(range),
  });
}

export function useCreatePlannerEntry() {
  const { planner } = useRepositories();
  const invalidate = useInvalidatePlanner();
  return useMutation({
    mutationFn: (input: CreateInput<PlannerEntry>) => planner.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdatePlannerEntry() {
  const { planner } = useRepositories();
  const invalidate = useInvalidatePlanner();
  return useMutation({
    mutationFn: ({ id, patch }: { id: ID; patch: UpdatePatch<PlannerEntry> }) =>
      planner.update(id, patch),
    onSuccess: invalidate,
  });
}

export function useDeletePlannerEntry() {
  const { planner } = useRepositories();
  const invalidate = useInvalidatePlanner();
  return useMutation({
    mutationFn: (id: ID) => planner.delete(id),
    onSuccess: invalidate,
  });
}
