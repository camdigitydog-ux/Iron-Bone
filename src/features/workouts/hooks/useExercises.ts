import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "@/lib/providers/RepositoryProvider";
import { workoutKeys, invalidationGroups } from "@/lib/query/keys";
import type { CreateInput } from "@/lib/repositories/types";
import type { ExerciseDefinition } from "@/lib/domain";

export function useExercises() {
  const { workouts } = useRepositories();
  return useQuery({
    queryKey: workoutKeys.exercises(),
    queryFn: () => workouts.listExercises(),
  });
}

export function useExerciseMap(): Map<string, ExerciseDefinition> {
  const { data: exercises = [] } = useExercises();
  return new Map(exercises.map((exercise) => [exercise.id, exercise]));
}

export function useCreateExercise() {
  const { workouts } = useRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInput<ExerciseDefinition>) => workouts.createExercise(input),
    onSuccess: () => {
      invalidationGroups.workouts.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
  });
}
