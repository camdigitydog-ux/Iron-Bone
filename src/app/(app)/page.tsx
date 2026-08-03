"use client";

import Link from "next/link";
import { Badge, Button, Card, CardHeader, CardTitle, EmptyState } from "@/components/ui";
import { useTodaySummary } from "@/features/dashboard/hooks/useTodaySummary";
import { useExerciseMap } from "@/features/workouts/hooks/useExercises";
import { MacroSummary } from "@/features/nutrition/components/MacroSummary";
import { FuelingDisclosure } from "@/features/running/components/FuelingDisclosure";
import { formatFriendlyDate } from "@/lib/utils/date";
import { formatDuration, formatPace } from "@/lib/domain";
import { formatMiles, round } from "@/lib/utils/format";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const summary = useTodaySummary();
  const exerciseMap = useExerciseMap();

  if (summary.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading your day…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grain-surface relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-brand/20 via-surface to-surface px-5 py-6 shadow-[0_2px_10px_-3px_rgb(var(--shadow-color)/0.3)]">
        <div aria-hidden className="knurl pointer-events-none absolute inset-0 z-[1]" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-10 z-[1] h-40 w-40 rounded-full bg-brand/25 blur-3xl"
        />
        <div className="relative z-[2] flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {greeting()}
            </p>
            <h1 className="mt-1 text-3xl font-semibold uppercase tracking-wide">
              {formatFriendlyDate(summary.date)}
            </h1>
          </div>
          <Link
            href="/planner"
            className="mt-1 shrink-0 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-trail hover:underline"
          >
            Planner →
          </Link>
        </div>
        <div className="relative z-[2] mt-5 flex items-stretch gap-6 border-t border-border/60 pt-4">
          <div>
            <p className="font-stencil stamped text-4xl font-bold leading-none text-fitness">
              {summary.weeklyWorkoutCount}
            </p>
            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Workouts this wk
            </p>
          </div>
          <div className="w-px bg-border/60" aria-hidden />
          <div>
            <p className="font-stencil stamped text-4xl font-bold leading-none text-running">
              {round(summary.weeklyDistanceMiles, 1)}
            </p>
            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Miles this wk
            </p>
          </div>
        </div>
      </div>

      <Card accent="fitness">
        <CardHeader>
          <CardTitle>Workout</CardTitle>
          <Link href="/workouts" className="text-xs font-semibold text-fitness hover:underline">
            View all
          </Link>
        </CardHeader>
        {summary.sessions.length > 0 ? (
          <div className="space-y-2">
            {summary.sessions.map((session) => (
              <Link
                key={session.id}
                href={`/workouts/${session.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-surface-muted/40 px-3 py-2 text-sm transition-colors hover:bg-surface-muted"
              >
                <span>
                  {session.exercises
                    .map((exercise) => exerciseMap.get(exercise.exerciseId)?.name)
                    .filter(Boolean)
                    .slice(0, 3)
                    .join(", ") || "Workout session"}
                </span>
                <Badge tone={session.completedAt ? "success" : "warning"}>
                  {session.completedAt ? "Completed" : "In progress"}
                </Badge>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No workout logged yet"
            description="Start a session from a template or a blank workout."
            action={
              <Link href="/workouts/new">
                <Button size="sm" tone="fitness">
                  Start a workout
                </Button>
              </Link>
            }
          />
        )}
      </Card>

      <Card accent="running">
        <CardHeader>
          <CardTitle>Running</CardTitle>
          <Link href="/running" className="text-xs font-semibold text-running hover:underline">
            View all
          </Link>
        </CardHeader>
        {summary.runs.length > 0 ? (
          <div className="space-y-2">
            {summary.runs.map((run) => (
              <Link
                key={run.id}
                href={`/running/${run.id}`}
                className="font-data block rounded-lg border border-border bg-surface-muted/40 px-3 py-2 text-sm transition-colors hover:bg-surface-muted"
              >
                {formatMiles(run.distanceMiles)} · {formatDuration(run.durationSec)} ·{" "}
                {formatPace(run.avgPaceSecPerMile)}
              </Link>
            ))}
          </div>
        ) : summary.suggestedRun ? (
          <div className="rounded-lg border border-dashed border-border px-3 py-2 text-sm">
            <div className="flex items-center justify-between">
              <span>
                Planned: {summary.suggestedRun.runType}
                {summary.suggestedRun.targetDistanceMiles
                  ? ` · ${summary.suggestedRun.targetDistanceMiles} mi`
                  : ""}
              </span>
              <Link href="/running/new">
                <Button size="sm" variant="secondary">
                  Log it
                </Button>
              </Link>
            </div>
            {summary.suggestedRun.fuelingGuide && (
              <FuelingDisclosure guide={summary.suggestedRun.fuelingGuide} />
            )}
          </div>
        ) : (
          <EmptyState
            title="No run today"
            description="Nothing planned or logged for today."
            action={
              <Link href="/running/new">
                <Button size="sm" tone="running">
                  Log a run
                </Button>
              </Link>
            }
          />
        )}
      </Card>

      <Card accent="nutrition">
        <CardHeader>
          <CardTitle>Nutrition</CardTitle>
          <Link href="/nutrition" className="text-xs font-semibold text-nutrition hover:underline">
            View all
          </Link>
        </CardHeader>
        <MacroSummary consumed={summary.consumedToday} goal={summary.goal} bare />
      </Card>
    </div>
  );
}
