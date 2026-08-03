import { Card } from "@/components/ui";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { round } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Macros, NutritionGoal } from "@/lib/domain";

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
