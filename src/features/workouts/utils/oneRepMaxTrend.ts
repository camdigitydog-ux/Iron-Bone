import { estimateOneRepMax } from "./oneRepMax";
import { topSetOf } from "./exerciseHistory";
import type { ID, WorkoutSession } from "@/lib/domain";

/**
 * A 1RM estimate only means something for a heavy, low-ish-rep compound
 * barbell lift — the classic "big five" programs are built around, rather
 * than every exercise that's ever appeared in a session (an estimated max on
 * a lateral raise isn't a number anyone tracks). Matched by name against the
 * curated exercise library rather than a hardcoded ID since seeded IDs are
 * generated per install.
 */
export const TRACKABLE_LIFT_NAMES = [
  "Barbell Back Squat",
  "Barbell Bench Press",
  "Conventional Deadlift",
  "Overhead Press",
  "Barbell Row",
] as const;

export interface OneRepMaxDataPoint {
  date: string;
  estimatedOneRm: number;
}

/**
 * Walks every session chronologically and takes each one's top working set
 * for the given exercise, converting it to an estimated 1RM — the same
 * estimator already used for the fleeting "last time" reference while
 * logging, just plotted across every session instead of shown once.
 */
export function getOneRepMaxTrend(sessions: WorkoutSession[], exerciseId: ID): OneRepMaxDataPoint[] {
  const chronological = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  const points: OneRepMaxDataPoint[] = [];

  for (const session of chronological) {
    const setsForExercise = session.exercises
      .filter((sessionExercise) => sessionExercise.exerciseId === exerciseId)
      .flatMap((sessionExercise) => sessionExercise.sets);
    const topSet = topSetOf(setsForExercise);
    if (!topSet) continue;
    points.push({ date: session.date, estimatedOneRm: estimateOneRepMax(topSet.weightLb, topSet.reps) });
  }

  return points;
}

export interface PlateauInfo {
  peakOneRm: number;
  currentOneRm: number;
  flatSessions: number;
}

/**
 * Flags a genuine plateau: the estimated 1RM hasn't set a new high across at
 * least the last `minFlatSessions` (default 3) sessions that actually trained
 * this lift — deliberately keyed off getOneRepMaxTrend's per-session points
 * rather than calendar time, so a lift that's simply gone untrained for a few
 * weeks isn't mistaken for one that's stalled out. Requires one session of
 * history before the flat window too, so there's an established peak to
 * compare against rather than just an early streak of identical numbers.
 * The standard periodization response to a real plateau is a one-session
 * deload — cutting the working weight ~10-20% to shed accumulated fatigue
 * before resuming the push for a new max (Israetel et al., RP training
 * volume/fatigue model; Helms et al., "The Muscle and Strength Pyramid:
 * Training", autoregulation chapter).
 */
export function detectPlateau(trend: OneRepMaxDataPoint[], minFlatSessions = 3): PlateauInfo | undefined {
  if (trend.length < minFlatSessions + 1) return undefined;

  const windowStart = trend.length - minFlatSessions;
  const priorPeak = Math.max(...trend.slice(0, windowStart).map((point) => point.estimatedOneRm));
  const windowPeak = Math.max(...trend.slice(windowStart).map((point) => point.estimatedOneRm));

  if (windowPeak > priorPeak) return undefined;

  return {
    peakOneRm: priorPeak,
    currentOneRm: trend[trend.length - 1].estimatedOneRm,
    flatSessions: minFlatSessions,
  };
}
