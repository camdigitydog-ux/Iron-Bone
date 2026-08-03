import { differenceInCalendarWeeks, parseISO } from "date-fns";
import { newId } from "@/lib/utils/id";
import { todayKey } from "@/lib/utils/date";
import { round } from "@/lib/utils/format";
import { generateFuelingGuide } from "./generateFuelingGuide";
import type {
  BaseEntity,
  RaceType,
  RunningExperience,
  RunPlan,
  RunPlanWeek,
  PlannedRun,
  RunType,
  TrainingPhase,
} from "@/lib/domain";

export interface RunPlanGeneratorInput {
  raceType: RaceType;
  raceDistanceMiles: number;
  experience: RunningExperience;
  raceDate: string; // yyyy-MM-dd
  daysPerWeek: number; // 3-7
  bodyWeightLb?: number;
}

export const DEFAULT_DAYS_PER_WEEK_BY_EXPERIENCE: Record<RunningExperience, number> = {
  beginner: 3,
  intermediate: 4,
  advanced: 5,
};

// Each array is dayOfWeek values (0=Sun..6=Sat); the last entry is always long-run day.
const DAY_TEMPLATES: Record<number, number[]> = {
  3: [2, 4, 6],
  4: [2, 3, 4, 6],
  5: [1, 2, 3, 4, 6],
  6: [1, 2, 3, 4, 5, 6],
  7: [0, 1, 2, 3, 4, 5, 6],
};

const BASE_PACE_MIN_PER_MILE: Record<RunningExperience, number> = {
  beginner: 11.5,
  intermediate: 9,
  advanced: 7.5,
};

const RACE_TYPE_LABELS: Record<RaceType, string> = {
  road: "Road Race",
  trail: "Trail Race",
  triathlon: "Triathlon Run Leg",
  ultra: "Ultramarathon",
};

// Jack Daniels' long-run guideline: never let it exceed ~25-30% of weekly
// mileage or run past ~2:30-3:00, since beyond that adds injury/burnout risk
// without extra fitness benefit. Used both to cap the peak long run's time
// and to size supporting runs so the split holds across the whole plan.
const TARGET_LONG_RUN_SHARE = 0.28;
const MAX_LONG_RUN_MINUTES = 180;

function peakLongRunMiles(
  raceType: RaceType,
  raceDistanceMiles: number,
  experience: RunningExperience,
): number {
  const distanceCap =
    raceType === "ultra" || raceDistanceMiles > 27
      ? Math.min(raceDistanceMiles * 0.5, 26)
      : raceDistanceMiles >= 22
        ? 20 // marathon-style: rarely run the full distance
        : raceDistanceMiles * 1.1; // 5k..half: long run often exceeds race distance a little

  const timeCapMiles = MAX_LONG_RUN_MINUTES / BASE_PACE_MIN_PER_MILE[experience];
  return Math.min(distanceCap, timeCapMiles);
}

function phaseForWeek(weekNumber: number, totalWeeks: number): TrainingPhase {
  const taperWeeks = totalWeeks <= 6 ? 1 : totalWeeks <= 12 ? 2 : 3;
  if (weekNumber > totalWeeks - taperWeeks) return "taper";
  const buildStart = Math.ceil(totalWeeks * 0.4) + 1;
  const peakStart = Math.max(buildStart, Math.ceil(totalWeeks * 0.75));
  if (weekNumber >= peakStart) return "peak";
  if (weekNumber >= buildStart) return "build";
  return "base";
}

function pickRunType(phase: TrainingPhase, index: number, supportingCount: number): RunType {
  if (phase === "base") return "easy";
  if (phase === "taper") return index === 0 ? "easy" : "recovery";
  // build & peak: front-load intensity, keep the rest easy
  if (index === 0) return "interval";
  if (supportingCount >= 3 && index === Math.floor(supportingCount / 2)) return "tempo";
  return "easy";
}

const RELATIVE_INTENSITY_WEIGHT: Record<RunType, number> = {
  easy: 0.4,
  tempo: 0.35,
  interval: 0.3,
  recovery: 0.25,
  long: 1,
  race: 1,
};

// Sizes every supporting run off the week's total volume — not off the long
// run alone — so the long run actually lands at TARGET_LONG_RUN_SHARE of the
// week regardless of how many supporting days there are. The remainder is
// split across supporting days proportional to their relative intensity, so
// a hard interval session still stays shorter than an easy day.
function distributeSupportingMiles(types: RunType[], longRunMiles: number): number[] {
  if (types.length === 0) return [];
  const weeklyRemainder = longRunMiles * (1 / TARGET_LONG_RUN_SHARE - 1);
  const totalWeight = types.reduce((sum, type) => sum + RELATIVE_INTENSITY_WEIGHT[type], 0);
  return types.map((type) => {
    const share = totalWeight > 0 ? (RELATIVE_INTENSITY_WEIGHT[type] / totalWeight) * weeklyRemainder : 0;
    return round(Math.max(share, type === "interval" ? 2 : 1.5), 1);
  });
}

function estimateDurationMin(
  distanceMiles: number,
  runType: RunType,
  experience: RunningExperience,
): number {
  const basePace = BASE_PACE_MIN_PER_MILE[experience];
  const paceFactor: Record<RunType, number> = {
    easy: 1,
    long: 1,
    recovery: 1.05,
    tempo: 0.9,
    interval: 0.85,
    race: 0.85,
  };
  return distanceMiles * basePace * paceFactor[runType];
}

export function generateRunPlan({
  raceType,
  raceDistanceMiles,
  experience,
  raceDate,
  daysPerWeek,
  bodyWeightLb = 160,
}: RunPlanGeneratorInput): Omit<RunPlan, keyof BaseEntity> {
  const today = new Date();
  const race = parseISO(raceDate);
  const rawWeeks = differenceInCalendarWeeks(race, today, { weekStartsOn: 1 }) + 1;
  const totalWeeks = Math.min(Math.max(rawWeeks, 4), 24);

  const dayTemplate = DAY_TEMPLATES[daysPerWeek] ?? DAY_TEMPLATES[4];
  const peakLong = peakLongRunMiles(raceType, raceDistanceMiles, experience);
  const startLong = Math.max(Math.min(peakLong * 0.4, raceDistanceMiles * 0.3), 2);

  const weeks: RunPlanWeek[] = [];

  for (let weekNumber = 1; weekNumber <= totalWeeks; weekNumber++) {
    const phase = phaseForWeek(weekNumber, totalWeeks);
    const progress = totalWeeks > 1 ? (weekNumber - 1) / (totalWeeks - 1) : 1;
    const isCutbackWeek = (phase === "base" || phase === "build") && weekNumber % 4 === 0;
    const weeksLeftInTaper = totalWeeks - weekNumber;

    let longRunMiles: number;
    if (phase === "taper") {
      longRunMiles = weeksLeftInTaper === 0 ? peakLong * 0.25 : peakLong * 0.5;
    } else {
      longRunMiles = startLong + (peakLong - startLong) * progress;
      if (isCutbackWeek) longRunMiles *= 0.75;
    }
    longRunMiles = round(longRunMiles, 1);

    const supportingCount = dayTemplate.length - 1;
    const supportingTypes: RunType[] = dayTemplate
      .slice(0, -1)
      .map((_, index) => pickRunType(phase, index, supportingCount));
    const supportingDistances = distributeSupportingMiles(supportingTypes, longRunMiles);

    const plannedRuns: PlannedRun[] = dayTemplate.map((dayOfWeek, index) => {
      const isLongDay = index === dayTemplate.length - 1;
      const runType: RunType = isLongDay
        ? phase === "taper"
          ? "easy"
          : "long"
        : supportingTypes[index];
      const distanceMiles = isLongDay ? longRunMiles : supportingDistances[index];
      const durationMin = estimateDurationMin(distanceMiles, runType, experience);

      return {
        id: newId(),
        dayOfWeek,
        runType,
        targetDistanceMiles: distanceMiles,
        notes:
          isLongDay && phase === "peak"
            ? "Include race-pace segments in the back half of this run."
            : undefined,
        fuelingGuide: generateFuelingGuide(durationMin, raceType, bodyWeightLb),
      };
    });

    weeks.push({ weekNumber, phase, plannedRuns });
  }

  return {
    name: `${totalWeeks}-Week ${RACE_TYPE_LABELS[raceType]} Plan (${experience[0].toUpperCase()}${experience.slice(1)})`,
    startDate: todayKey(),
    isActive: true,
    weeks,
    raceType,
    raceDistanceMiles,
    raceDate,
  };
}
