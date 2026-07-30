import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "@/lib/providers/RepositoryProvider";
import { runningKeys, invalidationGroups } from "@/lib/query/keys";
import type { CreateInput, UpdatePatch, DateRange } from "@/lib/repositories/types";
import type { RunEntry, ID } from "@/lib/domain";

function useInvalidateRunning() {
  const queryClient = useQueryClient();
  return () =>
    invalidationGroups.running.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
}

export function useRuns(range?: DateRange) {
  const { running } = useRepositories();
  return useQuery({
    queryKey: runningKeys.runs(range),
    queryFn: () => running.listRuns(range),
  });
}

export function useRun(id: ID | undefined) {
  const { running } = useRepositories();
  return useQuery({
    queryKey: runningKeys.run(id ?? ""),
    queryFn: async () => (await running.getRun(id as ID)) ?? null,
    enabled: Boolean(id),
  });
}

export function useRunsByDate(date: string) {
  const { running } = useRepositories();
  return useQuery({
    queryKey: runningKeys.runsByDate(date),
    queryFn: () => running.getRunsByDate(date),
  });
}

export function useCreateRun() {
  const { running } = useRepositories();
  const invalidate = useInvalidateRunning();
  return useMutation({
    mutationFn: (input: CreateInput<RunEntry>) => running.createRun(input),
    onSuccess: invalidate,
  });
}

export function useUpdateRun() {
  const { running } = useRepositories();
  const invalidate = useInvalidateRunning();
  return useMutation({
    mutationFn: ({ id, patch }: { id: ID; patch: UpdatePatch<RunEntry> }) =>
      running.updateRun(id, patch),
    onSuccess: invalidate,
  });
}

export function useDeleteRun() {
  const { running } = useRepositories();
  const invalidate = useInvalidateRunning();
  return useMutation({
    mutationFn: (id: ID) => running.deleteRun(id),
    onSuccess: invalidate,
  });
}
