import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "@/lib/providers/RepositoryProvider";
import { workoutKeys, invalidationGroups } from "@/lib/query/keys";
import type { CreateInput, UpdatePatch } from "@/lib/repositories/types";
import type { WorkoutTemplate, ID } from "@/lib/domain";

export function useWorkoutTemplates() {
  const { workouts } = useRepositories();
  return useQuery({
    queryKey: workoutKeys.templates(),
    queryFn: () => workouts.listTemplates(),
  });
}

export function useWorkoutTemplate(id: ID | undefined) {
  const { workouts } = useRepositories();
  return useQuery({
    queryKey: workoutKeys.template(id ?? ""),
    queryFn: async () => (await workouts.getTemplate(id as ID)) ?? null,
    enabled: Boolean(id),
  });
}

function useInvalidateWorkouts() {
  const queryClient = useQueryClient();
  return () =>
    invalidationGroups.workouts.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
}

export function useCreateWorkoutTemplate() {
  const { workouts } = useRepositories();
  const invalidate = useInvalidateWorkouts();
  return useMutation({
    mutationFn: (input: CreateInput<WorkoutTemplate>) => workouts.createTemplate(input),
    onSuccess: invalidate,
  });
}

export function useUpdateWorkoutTemplate() {
  const { workouts } = useRepositories();
  const invalidate = useInvalidateWorkouts();
  return useMutation({
    mutationFn: ({ id, patch }: { id: ID; patch: UpdatePatch<WorkoutTemplate> }) =>
      workouts.updateTemplate(id, patch),
    onSuccess: invalidate,
  });
}

export function useDeleteWorkoutTemplate() {
  const { workouts } = useRepositories();
  const invalidate = useInvalidateWorkouts();
  return useMutation({
    mutationFn: (id: ID) => workouts.deleteTemplate(id),
    onSuccess: invalidate,
  });
}
