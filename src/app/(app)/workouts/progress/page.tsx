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
import { Badge, Card, EmptyState, Select } from "@/components/ui";
import { useWorkoutSessions } from "@/features/workouts/hooks/useWorkoutSessions";
import { useExercises } from "@/features/workouts/hooks/useExercises";
import { TRACKABLE_LIFT_NAMES, getOneRepMaxTrend } from "@/features/workouts/utils/oneRepMaxTrend";
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
  const exerciseMap = useMemo(() => new Map(exercises.map((exercise) => [exercise.id, exercise])), [exercises]);

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
      </Card>

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
