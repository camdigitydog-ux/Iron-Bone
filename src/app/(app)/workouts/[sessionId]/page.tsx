"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Textarea } from "@/components/ui";
import {
  useWorkoutSession,
  useWorkoutSessions,
  useUpdateWorkoutSession,
  useDeleteWorkoutSession,
} from "@/features/workouts/hooks/useWorkoutSessions";
import { useExerciseMap } from "@/features/workouts/hooks/useExercises";
import { SessionExerciseCard } from "@/features/workouts/components/SessionExerciseCard";
import { ExercisePicker } from "@/features/workouts/components/ExercisePicker";
import { findLastPerformance } from "@/features/workouts/utils/exerciseHistory";
import { formatFriendlyDate } from "@/lib/utils/date";
import { newId } from "@/lib/utils/id";
import type { SessionExercise, ID } from "@/lib/domain";

export default function WorkoutSessionPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { data: session, isLoading } = useWorkoutSession(params.sessionId);
  const { data: allSessions = [] } = useWorkoutSessions();
  const exerciseMap = useExerciseMap();
  const updateSession = useUpdateWorkoutSession();
  const deleteSession = useDeleteWorkoutSession();

  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [notes, setNotes] = useState("");
  const [pickerValue, setPickerValue] = useState<ID | "">("");
  const [loadedSessionId, setLoadedSessionId] = useState<string | undefined>(undefined);

  if (session && session.id !== loadedSessionId) {
    setLoadedSessionId(session.id);
    setExercises(session.exercises);
    setNotes(session.notes ?? "");
  }

  if (isLoading || !session) {
    return <p className="text-sm text-muted-foreground">Loading session…</p>;
  }

  function updateExercise(id: string, next: SessionExercise) {
    setExercises((prev) => prev.map((ex) => (ex.id === id ? next : ex)));
  }

  function removeExercise(id: string) {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  }

  function addExercise() {
    if (!pickerValue) return;
    setExercises((prev) => [
      ...prev,
      { id: newId(), exerciseId: pickerValue, order: prev.length, sets: [] },
    ]);
    setPickerValue("");
  }

  async function handleSave() {
    await updateSession.mutateAsync({ id: session!.id, patch: { exercises, notes } });
  }

  async function handleComplete() {
    await updateSession.mutateAsync({
      id: session!.id,
      patch: { exercises, notes, completedAt: new Date().toISOString() },
    });
    router.push("/workouts");
  }

  async function handleDelete() {
    await deleteSession.mutateAsync(session!.id);
    router.push("/workouts");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{formatFriendlyDate(session.date)}</h1>
          <p className="text-xs text-muted-foreground">
            {session.completedAt ? "Completed" : "In progress"}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDelete}>
          Delete
        </Button>
      </div>

      <div className="space-y-3">
        {exercises.map((sessionExercise) => (
          <SessionExerciseCard
            key={sessionExercise.id}
            sessionExercise={sessionExercise}
            exercise={exerciseMap.get(sessionExercise.exerciseId)}
            lastPerformance={findLastPerformance(
              allSessions,
              sessionExercise.exerciseId,
              session.id,
              exerciseMap.get(sessionExercise.exerciseId),
            )}
            onChange={(next) => updateExercise(sessionExercise.id, next)}
            onRemove={() => removeExercise(sessionExercise.id)}
          />
        ))}
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <ExercisePicker value={pickerValue} onChange={setPickerValue} />
        </div>
        <Button variant="secondary" onClick={addExercise} disabled={!pickerValue}>
          Add
        </Button>
      </div>

      <Textarea
        placeholder="Session notes (optional)"
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="flex gap-2">
        <Button variant="secondary" onClick={handleSave} disabled={updateSession.isPending} className="flex-1">
          Save
        </Button>
        {!session.completedAt && (
          <Button onClick={handleComplete} disabled={updateSession.isPending} tone="fitness" className="flex-1">
            Finish workout
          </Button>
        )}
      </div>
    </div>
  );
}
