"use client";

import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button, Card, EmptyState } from "@/components/ui";
import { useRuns } from "@/features/running/hooks/useRuns";
import { RunListItem } from "@/features/running/components/RunListItem";
import { formatFriendlyDate } from "@/lib/utils/date";
import { round } from "@/lib/utils/format";

export default function RunningPage() {
  const { data: runs = [] } = useRuns();

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
