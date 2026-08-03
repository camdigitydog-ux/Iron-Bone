export type ID = string;

export interface BaseEntity {
  id: ID;
  createdAt: string;
  updatedAt: string;
}

export interface Macros {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  /** Optional micronutrients — left undefined (not 0) when a food/goal predates
   * this field or the figure just isn't known, so callers can tell "no data"
   * apart from "genuinely zero" (e.g. olive oil really does have 0g fiber). */
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
}

export const ZERO_MACROS: Macros = {
  calories: 0,
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
};

/** Adds two optional micronutrient figures, staying undefined only when BOTH
 * sides are unknown — so summing a mix of foods with and without fiber data
 * still yields a real (if partial) total instead of silently going blank. */
function addOptional(a: number | undefined, b: number | undefined): number | undefined {
  if (a === undefined && b === undefined) return undefined;
  return (a ?? 0) + (b ?? 0);
}

export function addMacros(a: Macros, b: Macros): Macros {
  return {
    calories: a.calories + b.calories,
    proteinG: a.proteinG + b.proteinG,
    carbsG: a.carbsG + b.carbsG,
    fatG: a.fatG + b.fatG,
    fiberG: addOptional(a.fiberG, b.fiberG),
    sugarG: addOptional(a.sugarG, b.sugarG),
    sodiumMg: addOptional(a.sodiumMg, b.sodiumMg),
  };
}

export function sumMacros(items: Macros[]): Macros {
  return items.reduce(addMacros, { ...ZERO_MACROS });
}

export function scaleMacros(macros: Macros, factor: number): Macros {
  return {
    calories: macros.calories * factor,
    proteinG: macros.proteinG * factor,
    carbsG: macros.carbsG * factor,
    fatG: macros.fatG * factor,
    fiberG: macros.fiberG !== undefined ? macros.fiberG * factor : undefined,
    sugarG: macros.sugarG !== undefined ? macros.sugarG * factor : undefined,
    sodiumMg: macros.sodiumMg !== undefined ? macros.sodiumMg * factor : undefined,
  };
}
