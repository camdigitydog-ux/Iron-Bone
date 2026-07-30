import { round } from "@/lib/utils/format";
import type { RaceType, RunFuelingGuide } from "@/lib/domain";

const LB_TO_KG = 0.453592;

// Standard sports-nutrition carb/protein ratios are established per kg of bodyweight
// (ACSM/ISSN), so body weight is converted internally even though the app's public
// input is in pounds — the output (grams) is unit-agnostic either way.
function gramRange(bodyWeightLb: number, low: number, high: number): string {
  const bodyWeightKg = bodyWeightLb * LB_TO_KG;
  return `${round(bodyWeightKg * low, 0)}–${round(bodyWeightKg * high, 0)}g`;
}

/**
 * Produces pre/during/post fueling guidance scaled to body weight and how long the
 * run is expected to take, following standard endurance-nutrition heuristics
 * (ACSM/ISSN-style carb-per-kg ranges) rather than a fixed script for every run.
 */
export function generateFuelingGuide(
  estimatedDurationMin: number,
  raceType: RaceType,
  bodyWeightLb: number,
): RunFuelingGuide {
  if (estimatedDurationMin < 60) {
    return {
      pre: `Light snack 1–2h before: ${gramRange(bodyWeightLb, 0.5, 1)} carbs (banana, toast with honey). Fine to skip if running fasted comfortably.`,
      during: "Not needed for a run this short — water only, sipped if thirsty.",
      post: `Within an hour: ${gramRange(bodyWeightLb, 0.25, 0.4)} protein + ${gramRange(bodyWeightLb, 0.5, 0.8)} carbs (yogurt with fruit, chocolate milk). Rehydrate with water.`,
    };
  }

  if (estimatedDurationMin < 90) {
    return {
      pre: `1–3h before: ${gramRange(bodyWeightLb, 1, 2)} carbs, moderate protein, low fat/fiber (oatmeal + banana, bagel + peanut butter).`,
      during: "Water throughout; if pushing pace, 15–30g carbs (a gel or sports drink) around the 45-minute mark.",
      post: `Within 30–60 min: ${gramRange(bodyWeightLb, 0.3, 0.4)} protein + ${gramRange(bodyWeightLb, 1, 1.2)} carbs, plus electrolytes (300–600mg sodium) and some antioxidant-rich fruit or greens.`,
    };
  }

  const ultraNote =
    raceType === "ultra"
      ? " Practice eating real food too (rice balls, potatoes, sandwiches) — ultras demand more variety than gels alone, and your gut needs the training."
      : "";

  return {
    pre: `Carb-load the day before (~${gramRange(bodyWeightLb, 7, 10)} total). Race-morning meal 2–3h out: ${gramRange(bodyWeightLb, 1, 2)} carbs, low fat/fiber, moderate protein.`,
    during: `30–60g carbs/hour from gels, chews, or sports drink starting 30–45 min in, repeating every 30–45 min.${ultraNote} Sodium 300–700mg/hour and 13–27 fl oz fluid/hour, more in heat.`,
    post: `Within 30 min: ${gramRange(bodyWeightLb, 1, 1.2)} carbs + ${gramRange(bodyWeightLb, 0.3, 0.4)} protein to kickstart recovery. Follow within 2h with a full meal covering iron (leafy greens, lean red meat), calcium + vitamin D (dairy), magnesium + potassium (bananas, potatoes, nuts) for cramp prevention, and omega-3s (fish, walnuts) for inflammation.`,
  };
}
