import { useQuery } from "@tanstack/react-query";
import { searchExercisesOnline } from "@/lib/external/exerciseDb";

export function useExerciseSearch(query: string) {
  const term = query.trim();
  return useQuery({
    queryKey: ["externalExerciseSearch", term],
    queryFn: () => searchExercisesOnline(term),
    enabled: term.length >= 2,
    staleTime: Infinity,
    retry: false,
  });
}
