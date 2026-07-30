import { Badge } from "@/components/ui";
import { getPlanWeekForDate } from "@/lib/domain";
import { todayKey } from "@/lib/utils/date";
import { FuelingDisclosure } from "./FuelingDisclosure";
import type { RunPlan, TrainingPhase } from "@/lib/domain";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PHASE_TONE: Record<TrainingPhase, "fitness" | "running" | "nutrition" | "trail"> = {
  base: "running",
  build: "nutrition",
  peak: "fitness",
  taper: "trail",
};

export function PlanOverview({ plan }: { plan: RunPlan }) {
  const currentWeek = getPlanWeekForDate(plan, todayKey());

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold">{plan.name}</h2>
        {plan.raceDate && (
          <p className="text-xs text-muted-foreground">
            Race day: {plan.raceDate} · {plan.raceDistanceMiles} mi
          </p>
        )}
      </div>

      <div className="space-y-2">
        {plan.weeks.map((week) => (
          <details
            key={week.weekNumber}
            open={currentWeek?.weekNumber === week.weekNumber}
            className="rounded-lg border border-border bg-surface"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2">
              <span className="text-sm font-medium">
                Week {week.weekNumber}
                {currentWeek?.weekNumber === week.weekNumber ? " (this week)" : ""}
              </span>
              {week.phase && <Badge tone={PHASE_TONE[week.phase]}>{week.phase}</Badge>}
            </summary>
            <div className="space-y-2 border-t border-border px-3 py-2">
              {week.plannedRuns.map((run) => (
                <div key={run.id} className="rounded-md bg-surface-muted px-2 py-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">
                      {DAY_LABELS[run.dayOfWeek]} · {run.runType} · {run.targetDistanceMiles} mi
                    </span>
                  </div>
                  {run.notes && <p className="mt-0.5 text-muted-foreground">{run.notes}</p>}
                  {run.fuelingGuide && <FuelingDisclosure guide={run.fuelingGuide} />}
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
