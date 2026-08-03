"use client";

import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge, Button, Card, CardHeader, CardTitle, EmptyState } from "@/components/ui";
import { useRuns } from "@/features/running/hooks/useRuns";
import { useActiveRunPlan } from "@/features/running/hooks/useRunPlans";
import { RunListItem } from "@/features/running/components/RunListItem";
import { formatFriendlyDate, todayKey } from "@/lib/utils/date";
import { getPlanWeekForDate } from "@/lib/domain";
import { round } from "@/lib/utils/format";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function RunningPage() {
  const { data: runs = [] } = useRuns();
  const { data: activePlan } = useActiveRunPlan();

  const today = todayKey();
  const currentWeek = activePlan ? getPlanWeekForDate(activePlan, today) : undefined;
  const todayDayOfWeek = new Date().getDay();

  const chartData = [...runs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((run) => ({
      date: formatFriendlyDate(run.date).replace(/^\w+, /, ""),
      distanceMiles: round(run.distanceMiles, 1),
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Running</h1>
        <div className="flex gap-2">
          <Link href="/running/plan">
            <Button variant="secondary" size="sm">
              Plan
            </Button>
          </Link>
          <Link href="/running/new">
            <Button size="sm" tone="running">
              Log run
            </Button>
          </Link>
        </div>
      </div>

      {activePlan && currentWeek && (
        <Card accent="running" className="space-y-3">
          <CardHeader>
            <CardTitle>{activePlan.name}</CardTitle>
            <Link href="/running/plan" className="text-xs font-semibold text-running hover:underline">
              View plan
            </Link>
          </CardHeader>
          <div className="grid grid-cols-7 gap-1.5">
            {DAY_LABELS.map((label, dayOfWeek) => {
              const planned = currentWeek.plannedRuns.find((run) => run.dayOfWeek === dayOfWeek);
              const isToday = dayOfWeek === todayDayOfWeek;
              return (
                <div
                  key={label}
                  className={
                    isToday
                      ? "rounded-lg border-2 border-running bg-running/10 px-1 py-2 text-center"
                      : "rounded-lg border border-border bg-surface-muted/40 px-1 py-2 text-center"
                  }
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </p>
                  {planned ? (
                    <>
                      <p className="font-data mt-1 text-xs font-semibold">{planned.targetDistanceMiles} mi</p>
                      <p className="text-[10px] capitalize text-muted-foreground">{planned.runType}</p>
                    </>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">—</p>
                  )}
                </div>
              );
            })}
          </div>
          {currentWeek.phase && (
            <Badge tone="running" className="capitalize">
              {currentWeek.phase} phase
            </Badge>
          )}
        </Card>
      )}

      {runs.length === 0 ? (
        <EmptyState title="No runs logged yet" description="Log your first run to start tracking trends." />
      ) : (
        <>
          <Card>
            <p className="mb-3 text-sm font-semibold">Distance trend</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={35} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="distanceMiles"
                    stroke="var(--running)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="space-y-2">
            {runs.map((run) => (
              <RunListItem key={run.id} run={run} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
