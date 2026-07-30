"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, FormField, Input, Textarea } from "@/components/ui";
import { ExercisePicker } from "./ExercisePicker";
import { useExerciseMap } from "../hooks/useExercises";
import {
  useCreateWorkoutTemplate,
  useUpdateWorkoutTemplate,
} from "../hooks/useWorkoutTemplates";
import { newId } from "@/lib/utils/id";
import type { TemplateExercise, WorkoutTemplate } from "@/lib/domain";

export function TemplateForm({
  initialTemplate,
  initialExercises,
  initialName,
}: {
  initialTemplate?: WorkoutTemplate;
  initialExercises?: TemplateExercise[];
  initialName?: string;
}) {
  const router = useRouter();
  const exerciseMap = useExerciseMap();
  const createTemplate = useCreateWorkoutTemplate();
  const updateTemplate = useUpdateWorkoutTemplate();

  const [name, setName] = useState(initialTemplate?.name ?? initialName ?? "");
  const [description, setDescription] = useState(initialTemplate?.description ?? "");
  const [exercises, setExercises] = useState<TemplateExercise[]>(
    initialTemplate?.exercises ?? initialExercises ?? [],
  );

  function addExercise() {
    const firstExerciseId = exerciseMap.keys().next().value ?? "";
    setExercises((prev) => [
      ...prev,
      {
        id: newId(),
        exerciseId: firstExerciseId,
        order: prev.length,
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 12,
      },
    ]);
  }

  function updateExercise(id: string, patch: Partial<TemplateExercise>) {
    setExercises((prev) => prev.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex)));
  }

  function removeExercise(id: string) {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  }

  async function handleSave() {
    if (!name.trim() || exercises.length === 0) return;
    const payload = { name: name.trim(), description: description.trim() || undefined, exercises };
    if (initialTemplate) {
      await updateTemplate.mutateAsync({ id: initialTemplate.id, patch: payload });
    } else {
      await createTemplate.mutateAsync(payload);
    }
    router.push("/workouts");
  }

  const isSaving = createTemplate.isPending || updateTemplate.isPending;
  const canSave = name.trim().length > 0 && exercises.length > 0;

  return (
    <div className="space-y-4">
      <FormField label="Template name" htmlFor="template-name">
        <Input
          id="template-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Push Day"
        />
      </FormField>
      <FormField label="Description (optional)" htmlFor="template-description">
        <Textarea
          id="template-description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormField>

      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          <Card key={exercise.id} className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <span className="mt-2 text-xs font-medium text-muted-foreground">#{index + 1}</span>
              <div className="flex-1">
                <ExercisePicker
                  value={exercise.exerciseId}
                  onChange={(exerciseId) => updateExercise(exercise.id, { exerciseId })}
                />
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeExercise(exercise.id)}>
                Remove
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <FormField label="Sets" htmlFor={`sets-${exercise.id}`}>
                <Input
                  id={`sets-${exercise.id}`}
                  type="number"
                  min={1}
                  value={exercise.targetSets}
                  onChange={(e) =>
                    updateExercise(exercise.id, { targetSets: Number(e.target.value) })
                  }
                />
              </FormField>
              <FormField label="Reps min" htmlFor={`reps-min-${exercise.id}`}>
                <Input
                  id={`reps-min-${exercise.id}`}
                  type="number"
                  min={1}
                  value={exercise.targetRepsMin ?? ""}
                  onChange={(e) =>
                    updateExercise(exercise.id, { targetRepsMin: Number(e.target.value) })
                  }
                />
              </FormField>
              <FormField label="Reps max" htmlFor={`reps-max-${exercise.id}`}>
                <Input
                  id={`reps-max-${exercise.id}`}
                  type="number"
                  min={1}
                  value={exercise.targetRepsMax ?? ""}
                  onChange={(e) =>
                    updateExercise(exercise.id, { targetRepsMax: Number(e.target.value) })
                  }
                />
              </FormField>
              <FormField label="Rest (sec)" htmlFor={`rest-${exercise.id}`}>
                <Input
                  id={`rest-${exercise.id}`}
                  type="number"
                  min={0}
                  step={5}
                  value={exercise.restSec ?? ""}
                  onChange={(e) =>
                    updateExercise(exercise.id, {
                      restSec: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                />
              </FormField>
            </div>
          </Card>
        ))}
      </div>

      <Button variant="secondary" onClick={addExercise} className="w-full">
        + Add exercise
      </Button>

      <Button onClick={handleSave} disabled={!canSave || isSaving} className="w-full">
        {isSaving ? "Saving…" : "Save template"}
      </Button>
    </div>
  );
}
