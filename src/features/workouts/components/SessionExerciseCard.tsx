"use client";

import { useState } from "react";
import { Badge, Button, Card, Input } from "@/components/ui";
import { newId } from "@/lib/utils/id";
import type { ExerciseDefinition, SessionExercise, SetEntry } from "@/lib/domain";

export function SessionExerciseCard({
  exercise,
  sessionExercise,
  onChange,
  onRemove,
}: {
  exercise: ExerciseDefinition | undefined;
  sessionExercise: SessionExercise;
  onChange: (next: SessionExercise) => void;
  onRemove: () => void;
}) {
  const [showInstructions, setShowInstructions] = useState(false);

  function addSet() {
    const lastSet = sessionExercise.sets[sessionExercise.sets.length - 1];
    const newSet: SetEntry = {
      id: newId(),
      setNumber: sessionExercise.sets.length + 1,
      reps: lastSet?.reps ?? 8,
      weightLb: lastSet?.weightLb ?? 0,
    };
    onChange({ ...sessionExercise, sets: [...sessionExercise.sets, newSet] });
  }

  function updateSet(id: string, patch: Partial<SetEntry>) {
    onChange({
      ...sessionExercise,
      sets: sessionExercise.sets.map((set) => (set.id === id ? { ...set, ...patch } : set)),
    });
  }

  function removeSet(id: string) {
    onChange({
      ...sessionExercise,
      sets: sessionExercise.sets
        .filter((set) => set.id !== id)
        .map((set, index) => ({ ...set, setNumber: index + 1 })),
    });
  }

  const hasInstructions = !!exercise?.instructions && exercise.instructions.length > 0;

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{exercise?.name ?? "Unknown exercise"}</h3>
        <div className="flex shrink-0 items-center gap-1">
          {hasInstructions && (
            <button
              type="button"
              onClick={() => setShowInstructions((prev) => !prev)}
              className="whitespace-nowrap text-xs font-medium text-fitness"
            >
              {showInstructions ? "Hide form" : "How to"}
            </button>
          )}
          <Button variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>
      </div>

      {showInstructions && exercise?.instructions && (
        <ol className="list-decimal space-y-1 rounded-lg bg-surface-muted/50 p-3 pl-7 text-xs text-muted-foreground">
          {exercise.instructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}

      {sessionExercise.sets.length > 0 ? (
        <div className="space-y-2">
          <div className="grid grid-cols-[2rem_1fr_1fr_1fr_2rem] gap-2 text-xs font-medium text-muted-foreground">
            <span>Set</span>
            <span>Reps</span>
            <span>Weight (lb)</span>
            <span>RPE</span>
            <span />
          </div>
          {sessionExercise.sets.map((set) => (
            <div key={set.id} className="grid grid-cols-[2rem_1fr_1fr_1fr_2rem] items-center gap-2">
              {set.isWarmup ? (
                <Badge tone="trail" className="justify-center px-1.5">
                  W
                </Badge>
              ) : (
                <span className="font-data text-sm text-muted-foreground">{set.setNumber}</span>
              )}
              <Input
                type="number"
                min={0}
                className="font-data"
                value={set.reps}
                onChange={(e) => updateSet(set.id, { reps: Number(e.target.value) })}
              />
              <Input
                type="number"
                min={0}
                step={0.5}
                className="font-data"
                value={set.weightLb}
                onChange={(e) => updateSet(set.id, { weightLb: Number(e.target.value) })}
              />
              <Input
                type="number"
                min={1}
                max={10}
                className="font-data"
                value={set.rpe ?? ""}
                onChange={(e) =>
                  updateSet(set.id, {
                    rpe: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
              />
              <button
                type="button"
                onClick={() => removeSet(set.id)}
                className="text-muted-foreground hover:text-danger"
                aria-label="Remove set"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No sets logged yet.</p>
      )}

      <Button variant="secondary" size="sm" onClick={addSet} className="w-full">
        + Add set
      </Button>
    </Card>
  );
}
