import { useQuery } from "@tanstack/react-query";
import { searchFoodsOnline } from "@/lib/external/foodSearch";

export function useFoodSearch(query: string) {
  const term = query.trim();
  return useQuery({
    queryKey: ["externalFoodSearch", term],
    queryFn: () => searchFoodsOnline(term),
    enabled: term.length >= 2,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
