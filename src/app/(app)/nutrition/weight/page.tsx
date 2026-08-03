"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useBodyWeightEntries, useLatestBodyWeight } from "@/features/nutrition/hooks/useBodyWeight";
import { useActiveGoal } from "@/features/nutrition/hooks/useGoals";
import { BodyWeightForm } from "@/features/nutrition/components/BodyWeightForm";
import { Card, EmptyState } from "@/components/ui";
import { formatFriendlyDate, todayKey } from "@/lib/utils/date";
import { round } from "@/lib/utils/format";

// Recalculating goals every 10-15lb of weight change (or every 6-8 weeks) is
// the standard guidance for keeping a calorie/macro target accurate rather
// than training against numbers that no longer match your body.
const RECALC_THRESHOLD_LB = 10;

export default function BodyWeightPage() {
  const { data: entries = [] } = useBodyWeightEntries();
  const { data: latest } = useLatestBodyWeight();
  const { data: goal } = useActiveGoal(todayKey());

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const chartData = sorted.map((entry) => ({
    date: formatFriendlyDate(entry.date).replace(/^\w+, /, ""),
    weightLb: entry.weightLb,
  }));

  const first = sorted[0];
  const changeSinceFirst = first && latest ? round(latest.weightLb - first.weightLb, 1) : undefined;

  const weightDriftFromGoal =
    goal?.basedOnWeightLb && latest ? Math.abs(latest.weightLb - goal.basedOnWeightLb) : 0;
  const shouldNudgeRecalc = weightDriftFromGoal >= RECALC_THRESHOLD_LB;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Body weight</h1>

      <Card accent="nutrition" className="space-y-3">
        <BodyWeightForm />
      </Card>

      {shouldNudgeRecalc && (
        <div className="rounded-lg border border-dashed border-nutrition/40 bg-nutrition/10 px-3 py-2 text-sm text-foreground">
          Your weight has moved {round(weightDriftFromGoal, 1)} lb since your current nutrition goal
          was calculated — worth recalculating your targets on the{" "}
          <a href="/nutrition/goals" className="font-semibold text-nutrition hover:underline">
            Goals page
          </a>
          .
        </div>
      )}

      {sorted.length > 0 ? (
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Weight trend</p>
            {changeSinceFirst !== undefined && (
              <p className="font-data text-sm text-muted-foreground">
                {changeSinceFirst > 0 ? "+" : ""}
                {changeSinceFirst} lb since {formatFriendlyDate(first.date)}
              </p>
            )}
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={40} domain={["dataMin - 2", "dataMax + 2"]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="weightLb"
                  stroke="var(--nutrition)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : (
        <EmptyState title="No weight logged yet" description="Log your weight to start tracking trends." />
      )}
    </div>
  );
}
