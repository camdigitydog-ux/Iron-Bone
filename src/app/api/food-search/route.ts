import { NextRequest, NextResponse } from "next/server";
import type { ExternalFoodResult } from "@/lib/external/foodSearch";

interface OpenFoodFactsHit {
  code?: string;
  product_name?: string;
  brands?: string | string[];
  nutriments?: Record<string, number>;
}

interface OpenFoodFactsResponse {
  hits?: OpenFoodFactsHit[];
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const url = new URL("https://search.openfoodfacts.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("page_size", "15");
  url.searchParams.set("fields", "code,product_name,brands,nutriments");

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "User-Agent": "IronBoneFitnessApp/1.0 (local development)" },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return NextResponse.json({ results: [] }, { status: 502 });
  }

  if (!response.ok) {
    return NextResponse.json({ results: [] }, { status: 502 });
  }

  const data: OpenFoodFactsResponse = await response.json();

  const results: ExternalFoodResult[] = (data.hits ?? [])
    .filter((hit) => hit.code && hit.product_name && hit.nutriments?.["energy-kcal_100g"] != null)
    .map((hit) => ({
      externalId: hit.code!,
      name: hit.product_name!,
      brand: Array.isArray(hit.brands) ? hit.brands[0] : hit.brands || undefined,
      caloriesPer100g: hit.nutriments!["energy-kcal_100g"] ?? 0,
      proteinPer100g: hit.nutriments!["proteins_100g"] ?? 0,
      carbsPer100g: hit.nutriments!["carbohydrates_100g"] ?? 0,
      fatPer100g: hit.nutriments!["fat_100g"] ?? 0,
    }));

  return NextResponse.json({ results });
}
