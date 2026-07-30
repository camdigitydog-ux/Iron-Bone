import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "@/lib/providers/RepositoryProvider";
import { workoutKeys, invalidationGroups } from "@/lib/query/keys";
import type { CreateInput, UpdatePatch, DateRange } from "@/lib/repositories/types";
import type { WorkoutSession, ID } from "@/lib/domain";

export function useWorkoutSessions(range?: DateRange) {
  const { workouts } = useRepositories();
  return useQuery({
    queryKey: workoutKeys.sessions(range),
    queryFn: () => workouts.listSessions(range),
  });
}

export function useWorkoutSession(id: ID | undefined) {
  const { workouts } = useRepositories();
  return useQuery({
    queryKey: workoutKeys.session(id ?? ""),
    queryFn: async () => (await workouts.getSession(id as ID)) ?? null,
    enabled: Boolean(id),
  });
}

export function useWorkoutSessionsByDate(date: string) {
  const { workouts } = useRepositories();
  return useQuery({
    queryKey: workoutKeys.sessionsByDate(date),
    queryFn: () => workouts.getSessionsByDate(date),
  });
}

function useInvalidateWorkouts() {
  const queryClient = useQueryClient();
  return () =>
    invalidationGroups.workouts.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
}

export function useCreateWorkoutSession() {
  const { workouts } = useRepositories();
  const invalidate = useInvalidateWorkouts();
  return useMutation({
    mutationFn: (input: CreateInput<WorkoutSession>) => workouts.createSession(input),
    onSuccess: invalidate,
  });
}

export function useUpdateWorkoutSession() {
  const { workouts } = useRepositories();
  const invalidate = useInvalidateWorkouts();
  return useMutation({
    mutationFn: ({ id, patch }: { id: ID; patch: UpdatePatch<WorkoutSession> }) =>
      workouts.updateSession(id, patch),
    onSuccess: invalidate,
  });
}

export function useDeleteWorkoutSession() {
  const { workouts } = useRepositories();
  const invalidate = useInvalidateWorkouts();
  return useMutation({
    mutationFn: (id: ID) => workouts.deleteSession(id),
    onSuccess: invalidate,
  });
}
