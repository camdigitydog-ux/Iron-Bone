"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge, Card, EmptyState, ProgressBar, Select } from "@/components/ui";
import { useWorkoutSessions } from "@/features/workouts/hooks/useWorkoutSessions";
import { useExercises } from "@/features/workouts/hooks/useExercises";
import { useLatestBodyWeight } from "@/features/nutrition/hooks/useBodyWeight";
import {
  TRACKABLE_LIFT_NAMES,
  getOneRepMaxTrend,
  detectPlateau,
} from "@/features/workouts/utils/oneRepMaxTrend";
import { getStrengthStandard, type Sex } from "@/features/workouts/utils/strengthStandards";
import {
  MEV,
  MAV_HIGH,
  MRV,
  getWeeklyMuscleVolume,
  type VolumeZone,
} from "@/features/workouts/utils/muscleVolume";
import { formatFriendlyDate } from "@/lib/utils/date";
import { round } from "@/lib/utils/format";

const ZONE_LABEL: Record<VolumeZone, string> = {
  "below-mev": "Below MEV",
  mav: "In MAV range",
  "near-mrv": "Near MRV",
  "above-mrv": "Above MRV",
};

const ZONE_BADGE_TONE: Record<VolumeZone, "neutral" | "success" | "warning"> = {
  "below-mev": "neutral",
  mav: "success",
  "near-mrv": "warning",
  "above-mrv": "warning",
};

const MUSCLE_LABEL: Record<string, string> = {
  chest: "Chest",
  back: "Back",
  quads: "Quads",
  hamstrings: "Hamstrings",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  core: "Core",
};

export default function StrengthProgressPage() {
  const { data: sessions = [] } = useWorkoutSessions();
  const { data: exercises = [] } = useExercises();
  const { data: latestWeight } = useLatestBodyWeight();
  const exerciseMap = useMemo(() => new Map(exercises.map((exercise) => [exercise.id, exercise])), [exercises]);

  // Not persisted — there's no user-profile store in this app to keep it in,
  // and re-picking sex on the rare visit where it matters is cheap enough
  // that adding one isn't worth it just for this.
  const [sex, setSex] = useState<Sex>("male");

  const trackableLifts = useMemo(
    () =>
      TRACKABLE_LIFT_NAMES.map((name) => exercises.find((exercise) => exercise.name === name)).filter(
        (exercise): exercise is NonNullable<typeof exercise> => Boolean(exercise),
      ),
    [exercises],
  );

  const [selectedId, setSelectedId] = useState<string>("");
  const activeLift = trackableLifts.find((lift) => lift.id === selectedId) ?? trackableLifts[0];

  const trend = activeLift ? getOneRepMaxTrend(sessions, activeLift.id) : [];
  const currentOneRm = trend.length > 0 ? trend[trend.length - 1].estimatedOneRm : undefined;
  const chartData = trend.map((point) => ({
    date: formatFriendlyDate(point.date).replace(/^\w+, /, ""),
    estimatedOneRm: round(point.estimatedOneRm, 1),
  }));

  const plateau = detectPlateau(trend);
  const standard =
    activeLift && currentOneRm && latestWeight?.weightLb
      ? getStrengthStandard(activeLift.name, currentOneRm, latestWeight.weightLb, sex)
      : undefined;

  const muscleVolume = getWeeklyMuscleVolume(sessions, exerciseMap);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Strength progress</h1>

      <Card accent="fitness" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Estimated 1RM
            </p>
            <p className="font-stencil stamped text-4xl font-bold leading-none text-fitness">
              {currentOneRm ? Math.round(currentOneRm) : "--"}
              {currentOneRm ? <span className="ml-1 text-lg font-semibold text-muted-foreground">lb</span> : null}
            </p>
          </div>
          {trackableLifts.length > 0 && (
            <div className="w-56">
              <Select
                value={activeLift?.id ?? ""}
                onChange={(e) => setSelectedId(e.target.value)}
                aria-label="Select lift"
              >
                {trackableLifts.map((lift) => (
                  <option key={lift.id} value={lift.id}>
                    {lift.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>

        {trend.length > 0 ? (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={40} domain={["dataMin - 10", "dataMax + 10"]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="estimatedOneRm"
                  stroke="var(--fitness)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            title="No sets logged for this lift yet"
            description={`Log a working set for ${activeLift?.name ?? "this lift"} to start tracking your estimated 1RM over time.`}
          />
        )}

        {plateau && (
          <div className="rounded-lg border border-dashed border-fitness/40 bg-fitness/10 px-3 py-2 text-sm text-foreground">
            <span className="font-semibold text-fitness">Plateau — </span>
            estimated 1RM hasn&apos;t topped {Math.round(plateau.peakOneRm)}lb across your last{" "}
            {plateau.flatSessions} sessions of {activeLift?.name}. Try a deload: cut your working
            weight ~10-20% for one session, then resume chasing a new high.
          </div>
        )}
      </Card>

      {activeLift && currentOneRm && (standard || !latestWeight?.weightLb) && (
        <Card className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Relative strength</p>
              <p className="text-xs text-muted-foreground">
                Estimated 1RM vs. bodyweight-ratio norms for the big compound lifts (Strength
                Level, 5.6M+ logged lifts).
              </p>
            </div>
            <div className="w-28">
              <Select
                value={sex}
                onChange={(e) => setSex(e.target.value as Sex)}
                aria-label="Sex for strength standards"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </Select>
            </div>
          </div>

          {!latestWeight?.weightLb ? (
            <div className="rounded-lg border border-dashed border-fitness/40 bg-fitness/10 px-3 py-2 text-sm text-foreground">
              Log your{" "}
              <a href="/nutrition/weight" className="font-semibold text-fitness hover:underline">
                body weight
              </a>{" "}
              to see how your {activeLift.name} 1RM compares to strength standards.
            </div>
          ) : (
            standard && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Badge tone="fitness">{standard.tier}</Badge>
                  <span className="font-data text-xs text-muted-foreground">
                    {standard.ratio.toFixed(2)}x bodyweight
                  </span>
                </div>
                {standard.nextTier && standard.progressToNext !== undefined && (
                  <div className="space-y-1">
                    <ProgressBar value={standard.progressToNext * 100} max={100} tone="fitness" />
                    <p className="text-xs text-muted-foreground">
                      {standard.nextThresholdLb}lb estimated 1RM to reach {standard.nextTier}
                    </p>
                  </div>
                )}
              </div>
            )
          )}
        </Card>
      )}

      <Card className="space-y-3">
        <div>
          <p className="text-sm font-semibold">Weekly training volume</p>
          <p className="text-xs text-muted-foreground">
            Working sets logged this week (Mon–Sun), per muscle group, against volume landmarks
            (MEV {MEV} · MAV up to {MAV_HIGH} · MRV {MRV} sets/week).
          </p>
        </div>
        <div className="space-y-2">
          {muscleVolume.map((entry) => (
            <div key={entry.muscle} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
              <span className="text-sm font-medium">{MUSCLE_LABEL[entry.muscle]}</span>
              <div className="flex items-center gap-2">
                <span className="font-data text-xs text-muted-foreground">{entry.sets} sets</span>
                <Badge tone={ZONE_BADGE_TONE[entry.zone]}>{ZONE_LABEL[entry.zone]}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
