import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "@/lib/providers/RepositoryProvider";
import { runningKeys, invalidationGroups } from "@/lib/query/keys";
import type { CreateInput, UpdatePatch } from "@/lib/repositories/types";
import type { RunPlan, ID } from "@/lib/domain";

function useInvalidateRunning() {
  const queryClient = useQueryClient();
  return () =>
    invalidationGroups.running.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
}

export function useActiveRunPlan() {
  const { running } = useRepositories();
  return useQuery({
    queryKey: runningKeys.activePlan(),
    // TanStack Query treats `undefined` as "no data yet", not "no active plan" — coerce
    // Dexie's undefined-when-not-found into null so an inactive period doesn't error.
    queryFn: async () => {
      const plan = await running.getActivePlan();
      return plan ?? null;
    },
  });
}

export function useCreateRunPlan() {
  const { running } = useRepositories();
  const invalidate = useInvalidateRunning();
  return useMutation({
    mutationFn: (input: CreateInput<RunPlan>) => running.createPlan(input),
    onSuccess: invalidate,
  });
}

export function useUpdateRunPlan() {
  const { running } = useRepositories();
  const invalidate = useInvalidateRunning();
  return useMutation({
    mutationFn: ({ id, patch }: { id: ID; patch: UpdatePatch<RunPlan> }) =>
      running.updatePlan(id, patch),
    onSuccess: invalidate,
  });
}
