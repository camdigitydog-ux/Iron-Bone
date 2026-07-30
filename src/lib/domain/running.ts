import { differenceInCalendarWeeks, parseISO } from "date-fns";
import type { BaseEntity, ID } from "./common";

export type RunType = "easy" | "tempo" | "interval" | "long" | "race" | "recovery";

export const RUN_TYPES: RunType[] = ["easy", "tempo", "interval", "long", "race", "recovery"];

export interface RunEntry extends BaseEntity {
  date: string; // yyyy-MM-dd
  distanceMiles: number;
  durationSec: number;
  avgPaceSecPerMile: number; // derived, stored for cheap sort/query
  perceivedEffort?: number; // 1-10
  route?: string;
  runType?: RunType;
  notes?: string;
}

/** Pre/during/post fueling guidance for a single planned run, scaled to the runner's
 * body weight and the run's estimated duration. */
export interface RunFuelingGuide {
  pre: string;
  during: string;
  post: string;
}

export interface PlannedRun {
  id: ID;
  dayOfWeek: number; // 0=Sunday..6=Saturday
  runType?: RunType;
  targetDistanceMiles?: number;
  targetDurationSec?: number;
  notes?: string;
  fuelingGuide?: RunFuelingGuide;
}

export type TrainingPhase = "base" | "build" | "peak" | "taper";

export interface RunPlanWeek {
  weekNumber: number;
  phase?: TrainingPhase;
  plannedRuns: PlannedRun[];
}

export type RaceType = "road" | "trail" | "triathlon" | "ultra";
export const RACE_TYPES: RaceType[] = ["road", "trail", "triathlon", "ultra"];

export type RunningExperience = "beginner" | "intermediate" | "advanced";
export const RUNNING_EXPERIENCE_LEVELS: RunningExperience[] = [
  "beginner",
  "intermediate",
  "advanced",
];

export interface RunPlan extends BaseEntity {
  name: string;
  startDate: string; // yyyy-MM-dd, Monday-anchored
  weeks: RunPlanWeek[];
  isActive: boolean;
  raceType?: RaceType;
  raceDistanceMiles?: number;
  raceDate?: string; // yyyy-MM-dd
}

/**
 * A plan with a single week is treated as a repeating weekly template (the manual
 * plan editor's model) and always resolves to that one week. A plan with multiple
 * weeks is a dated, periodized progression, so this picks the week that has actually
 * elapsed since `startDate`, clamped to the plan's range.
 */
export function getPlanWeekForDate(plan: RunPlan, date: string): RunPlanWeek | undefined {
  if (plan.weeks.length === 0) return undefined;
  if (plan.weeks.length === 1) return plan.weeks[0];
  const weeksElapsed = differenceInCalendarWeeks(parseISO(date), parseISO(plan.startDate), {
    weekStartsOn: 1,
  });
  const index = Math.min(Math.max(weeksElapsed, 0), plan.weeks.length - 1);
  return plan.weeks[index];
}

export function computePaceSecPerMile(distanceMiles: number, durationSec: number): number {
  if (distanceMiles <= 0) return 0;
  return durationSec / distanceMiles;
}

export function formatPace(secPerMile: number): string {
  if (!Number.isFinite(secPerMile) || secPerMile <= 0) return "--:--";
  const min = Math.floor(secPerMile / 60);
  const sec = Math.round(secPerMile % 60);
  return `${min}:${sec.toString().padStart(2, "0")}/mi`;
}

export function formatDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.round(totalSec % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}
