export interface LiftingNutritionTip {
  post: string;
  pre: string;
  note: string;
}

/**
 * Nutrient-timing guidance for resistance training. Early-2000s sports
 * nutrition popularized a narrow post-workout "anabolic window" that had to
 * be hit within ~30 minutes — Schoenfeld, Aragon & Krieger's meta-analysis
 * (2013) found timing's effect on hypertrophy/strength is small once total
 * daily protein intake is controlled for, and the ISSN's position stand on
 * protein (Jäger et al., 2017) frames a ~20-40g dose spread across several
 * meals a day as the more important lever than hitting a precise minute.
 * https://jissn.biomedcentral.com/articles/10.1186/1550-2783-10-53
 * https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8
 */
export function getLiftingNutritionTip(): LiftingNutritionTip {
  return {
    post: "Aim for ~20-40g of protein sometime in the next couple hours — a full meal works just as well as a shake.",
    pre: "Next time: a meal with carbs plus a moderate protein serving 1-3h beforehand keeps energy and amino acids on hand without sitting heavy through the session.",
    note: "The old \"30-minute anabolic window\" is overstated — total daily protein (roughly 0.7-1g per lb bodyweight) and training consistency matter far more than precise timing.",
  };
}
