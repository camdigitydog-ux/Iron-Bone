"use client";

import { startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Button } from "@/components/ui";
import { useUiStore } from "@/lib/store/uiStore";
import { useWeekOverview } from "@/features/planner/hooks/useWeekOverview";
import { DayCell } from "@/features/planner/components/DayCell";
import { daysOfWeek, dateKey } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

export default function PlannerPage() {
  const plannerView = useUiStore((state) => state.plannerView);
  const setPlannerView = useUiStore((state) => state.setPlannerView);

  const today = new Date();
  const days = plannerView === "week" ? daysOfWeek(today) : eachDayOfInterval({ start: startOfMonth(today), end: endOfMonth(today) });
  const { overview } = useWeekOverview(days);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Planner</h1>
        <div className="flex rounded-lg border border-border p-0.5">
          <Button
            variant={plannerView === "week" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setPlannerView("week")}
          >
            Week
          </Button>
          <Button
            variant={plannerView === "month" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setPlannerView("month")}
          >
            Month
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "grid gap-2",
          plannerView === "week" ? "grid-cols-7" : "grid-cols-4 sm:grid-cols-7",
        )}
      >
        {days.map((day) => (
          <DayCell key={dateKey(day)} day={day} overview={overview.get(dateKey(day))} />
        ))}
      </div>
    </div>
  );
}
