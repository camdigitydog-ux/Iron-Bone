"use client";

import { useExercises } from "../hooks/useExercises";
import { Select } from "@/components/ui";
import type { ID } from "@/lib/domain";

export function ExercisePicker({
  value,
  onChange,
}: {
  value: ID | "";
  onChange: (id: ID) => void;
}) {
  const { data: exercises = [] } = useExercises();
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="" disabled>
        Select an exercise…
      </option>
      {exercises.map((exercise) => (
        <option key={exercise.id} value={exercise.id}>
          {exercise.name}
        </option>
      ))}
    </Select>
  );
}
