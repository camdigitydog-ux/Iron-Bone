export interface ExternalFoodResult {
  externalId: string;
  name: string;
  brand?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

interface FoodSearchResponse {
  results: ExternalFoodResult[];
}

/**
 * Open Food Facts doesn't send CORS headers on its search endpoints, so this calls
 * our own /api/food-search route (server-side, no CORS restriction) instead of
 * hitting Open Food Facts directly from the browser.
 */
export async function searchFoodsOnline(query: string): Promise<ExternalFoodResult[]> {
  const response = await fetch(`/api/food-search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error("Food search failed");
  }
  const data: FoodSearchResponse = await response.json();
  return data.results;
}
