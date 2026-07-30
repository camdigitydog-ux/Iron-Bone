import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { dateKey, isToday } from "@/lib/utils/date";
import type { DayOverview } from "../hooks/useWeekOverview";

export function DayCell({ day, overview }: { day: Date; overview?: DayOverview }) {
  const key = dateKey(day);
  const today = isToday(key);
  const hasActivity =
    overview && (overview.workoutCount > 0 || overview.runCount > 0 || overview.mealCount > 0 || overview.plannerCount > 0);

  return (
    <Link
      href={`/planner/${key}`}
      className={cn(
        "flex flex-col gap-1 rounded-lg border px-2 py-2 text-left transition-colors hover:bg-surface-muted",
        today ? "border-foreground/40 bg-surface-muted" : "border-border bg-surface",
      )}
    >
      <span className="text-xs font-medium text-muted-foreground">
        {day.toLocaleDateString(undefined, { weekday: "short" })}
      </span>
      <span className="text-sm font-semibold">{day.getDate()}</span>
      {hasActivity ? (
        <div className="flex flex-wrap gap-1">
          {overview!.workoutCount > 0 && <Dot tone="fitness" count={overview!.workoutCount} />}
          {overview!.runCount > 0 && <Dot tone="running" count={overview!.runCount} />}
          {overview!.mealCount > 0 && <Dot tone="nutrition" count={overview!.mealCount} />}
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      )}
    </Link>
  );
}

function Dot({ tone, count }: { tone: "fitness" | "running" | "nutrition"; count: number }) {
  const toneClasses = {
    fitness: "bg-fitness/15 text-fitness",
    running: "bg-running/15 text-running",
    nutrition: "bg-nutrition/15 text-nutrition",
  } as const;
  return (
    <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", toneClasses[tone])}>
      {count}
    </span>
  );
}
