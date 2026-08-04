export type Sex = "male" | "female";

export type StrengthTier = "Untrained" | "Novice" | "Intermediate" | "Advanced" | "Elite";

const TIERS: StrengthTier[] = ["Untrained", "Novice", "Intermediate", "Advanced", "Elite"];

type Thresholds = readonly [novice: number, intermediate: number, advanced: number, elite: number];

/**
 * Bodyweight-ratio thresholds (estimated 1RM ÷ bodyweight) required to reach
 * each tier, for the four "big compound" lifts that have well-established
 * relative-strength norms. Sourced from Strength Level's aggregate database
 * of 5.6M+ user-logged lifts (strengthlevel.com/strength-standards/{squat,
 * bench-press, deadlift, overhead-press}, accessed 2026) — the same
 * percentile-based novice/intermediate/advanced/elite tiering popularized by
 * Lon Kilgore's strength standard tables (used in Rippetoe's Practical
 * Programming) and mirrored by ExRx and Symmetric Strength. "Barbell Row" is
 * intentionally left out of this table: unlike the big four, there's no
 * comparably well-established bodyweight norm for it.
 */
const STANDARDS: Record<string, Record<Sex, Thresholds>> = {
  "Barbell Back Squat": {
    male: [1.25, 1.75, 2.25, 2.75],
    female: [0.75, 1.25, 1.75, 2.25],
  },
  "Barbell Bench Press": {
    male: [1.0, 1.25, 1.5, 2.0],
    female: [0.5, 0.75, 1.1, 1.45],
  },
  "Conventional Deadlift": {
    male: [1.5, 2.0, 2.5, 3.25],
    female: [1.0, 1.5, 2.0, 2.5],
  },
  "Overhead Press": {
    male: [0.55, 0.8, 1.05, 1.35],
    female: [0.35, 0.5, 0.7, 0.95],
  },
};

export interface StrengthStandardResult {
  tier: StrengthTier;
  ratio: number;
  /** Absent once the elite threshold has been cleared — there's no further tier to progress toward. */
  nextTier?: StrengthTier;
  /** 0-1 progress from the current tier's floor toward the next tier's threshold. */
  progressToNext?: number;
  nextThresholdLb?: number;
}

/** Whether `liftName` has an established bodyweight-ratio standard at all
 * (used to decide whether the relative-strength section has anything to show). */
export function hasStrengthStandard(liftName: string): boolean {
  return liftName in STANDARDS;
}

export function getStrengthStandard(
  liftName: string,
  oneRepMaxLb: number,
  bodyWeightLb: number,
  sex: Sex,
): StrengthStandardResult | undefined {
  const thresholds = STANDARDS[liftName]?.[sex];
  if (!thresholds || bodyWeightLb <= 0) return undefined;

  const ratio = oneRepMaxLb / bodyWeightLb;

  let tierIndex = 0; // index into TIERS; 0 = Untrained
  for (let i = 0; i < thresholds.length; i++) {
    if (ratio >= thresholds[i]) tierIndex = i + 1;
  }

  const tier = TIERS[tierIndex];
  if (tierIndex >= TIERS.length - 1) {
    return { tier, ratio };
  }

  const floor = tierIndex === 0 ? 0 : thresholds[tierIndex - 1];
  const nextThreshold = thresholds[tierIndex];
  const progressToNext = Math.max(0, Math.min(1, (ratio - floor) / (nextThreshold - floor)));

  return {
    tier,
    ratio,
    nextTier: TIERS[tierIndex + 1],
    progressToNext,
    nextThresholdLb: Math.round(nextThreshold * bodyWeightLb),
  };
}
