import { Card } from "@/components/ui";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { round } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Macros, NutritionGoal } from "@/lib/domain";

// FDA Daily Value for fiber on a 2,000-calorie reference diet (21 CFR 101.9) —
// used as the fiber row's target when the active goal doesn't specify its own,
// since the goal calculator doesn't compute a personalized fiber target yet.
const FIBER_DAILY_VALUE_G = 28;

export function MacroSummary({
  consumed,
  goal,
  bare = false,
}: {
  consumed: Macros;
  goal?: NutritionGoal | null;
  /** Skip the wrapping accented Card — for callers that already provide one (e.g. the home dashboard). */
  bare?: boolean;
}) {
  if (!goal) {
    const message = (
      <p className="text-sm text-muted-foreground">
        No nutrition goal set yet. Head to Goals to set daily targets.
      </p>
    );
    return bare ? message : <Card accent="nutrition">{message}</Card>;
  }

  const rows: { label: string; value: number; target: number }[] = [
    { label: "Calories", value: consumed.calories, target: goal.dailyCalories },
    { label: "Protein", value: consumed.proteinG, target: goal.proteinG },
    { label: "Carbs", value: consumed.carbsG, target: goal.carbsG },
    { label: "Fat", value: consumed.fatG, target: goal.fatG },
  ];

  // Only add a fifth row once there's real fiber data to show — an empty "0g"
  // row would just be clutter for goals/meals that predate fiber tracking.
  if (consumed.fiberG !== undefined || goal.fiberG !== undefined) {
    rows.push({
      label: "Fiber",
      value: consumed.fiberG ?? 0,
      target: goal.fiberG ?? FIBER_DAILY_VALUE_G,
    });
  }

  const rowList = rows.map((row) => (
    <div key={row.label} className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{row.label}</span>
        <span className="font-data text-muted-foreground">
          {round(row.value)} / {round(row.target)}
          {row.label !== "Calories" ? "g" : ""}
        </span>
      </div>
      <ProgressBar value={row.value} max={row.target} tone="nutrition" />
    </div>
  ));

  if (bare) {
    return <div className={cn("space-y-3")}>{rowList}</div>;
  }

  return (
    <Card accent="nutrition" className="space-y-3">
      {rowList}
    </Card>
  );
}
