"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, Button, Card, CardHeader, CardTitle, Input, Select } from "@/components/ui";
import { useDayDetail } from "@/features/planner/hooks/useDayDetail";
import { useCreatePlannerEntry } from "@/features/planner/hooks/usePlannerEntries";
import { PlannerEntryRow } from "@/features/planner/components/PlannerEntryRow";
import { useExerciseMap } from "@/features/workouts/hooks/useExercises";
import { FuelingDisclosure } from "@/features/running/components/FuelingDisclosure";
import { formatFriendlyDate } from "@/lib/utils/date";
import { formatDuration, formatPace, mealMacros, sumMacros } from "@/lib/domain";
import { formatMiles, round } from "@/lib/utils/format";
import type { PlannerItemType } from "@/lib/domain";

export default function DayDetailPage() {
  const params = useParams<{ date: string }>();
  const date = params.date;
  const { sessions, runs, meals, plannerEntries, suggestedRun, isLoading } = useDayDetail(date);
  const exerciseMap = useExerciseMap();
  const createEntry = useCreatePlannerEntry();

  const [title, setTitle] = useState("");
  const [itemType, setItemType] = useState<PlannerItemType>("workout");

  async function handleAddEntry() {
    if (!title.trim()) return;
    await createEntry.mutateAsync({ date, itemType, status: "planned", title: title.trim() });
    setTitle("");
  }

  const mealTotals = sumMacros(meals.map((meal) => mealMacros(meal)));

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading day…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{formatFriendlyDate(date)}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Workouts</CardTitle>
        </CardHeader>
        {sessions.length > 0 ? (
          <div className="space-y-2">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/workouts/${session.id}`}
                className="block rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface-muted"
              >
                {session.exercises
                  .map((exercise) => exerciseMap.get(exercise.exerciseId)?.name)
                  .filter(Boolean)
                  .join(", ") || "Workout session"}{" "}
                <Badge tone={session.completedAt ? "success" : "warning"} className="ml-2">
                  {session.completedAt ? "Completed" : "In progress"}
                </Badge>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Nothing logged.</p>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Running</CardTitle>
        </CardHeader>
        {runs.length > 0 ? (
          <div className="space-y-2">
            {runs.map((run) => (
              <Link
                key={run.id}
                href={`/running/${run.id}`}
                className="block rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface-muted"
              >
                {formatMiles(run.distanceMiles)} · {formatDuration(run.durationSec)} ·{" "}
                {formatPace(run.avgPaceSecPerMile)}
              </Link>
            ))}
          </div>
        ) : suggestedRun ? (
          <div className="rounded-lg border border-dashed border-border px-3 py-2">
            <div className="flex items-center justify-between">
              <p className="text-sm">
                Planned: {suggestedRun.runType}
                {suggestedRun.targetDistanceMiles ? ` · ${suggestedRun.targetDistanceMiles} mi` : ""}
              </p>
              <Link href="/running/new">
                <Button size="sm" variant="secondary">
                  Log it
                </Button>
              </Link>
            </div>
            {suggestedRun.fuelingGuide && <FuelingDisclosure guide={suggestedRun.fuelingGuide} />}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Nothing planned or logged.</p>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nutrition</CardTitle>
          <span className="text-xs text-muted-foreground">{round(mealTotals.calories)} kcal</span>
        </CardHeader>
        {meals.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {meals.flatMap((meal) =>
              meal.items.map((item) => (
                <li key={item.id} className="text-muted-foreground">
                  <span className="text-foreground">{item.foodName}</span> {item.amount}
                  {item.unit} ({meal.mealType})
                </li>
              )),
            )}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">Nothing logged.</p>
        )}
      </Card>

      <Card className="space-y-3">
        <CardHeader>
          <CardTitle>Planned items</CardTitle>
        </CardHeader>
        {plannerEntries.length > 0 ? (
          <div className="space-y-2">
            {plannerEntries.map((entry) => (
              <PlannerEntryRow key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No manual plans for this day yet.</p>
        )}

        <div className="flex items-end gap-2">
          <Input
            placeholder="e.g. Leg day"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1"
          />
          <Select value={itemType} onChange={(e) => setItemType(e.target.value as PlannerItemType)} className="w-32">
            <option value="workout">Workout</option>
            <option value="run">Run</option>
            <option value="meal">Meal</option>
          </Select>
          <Button onClick={handleAddEntry} disabled={!title.trim()}>
            Add
          </Button>
        </div>
      </Card>
    </div>
  );
}
