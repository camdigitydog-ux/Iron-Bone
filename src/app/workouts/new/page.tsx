"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWorkoutTemplate } from "@/features/workouts/hooks/useWorkoutTemplates";
import { useCreateWorkoutSession } from "@/features/workouts/hooks/useWorkoutSessions";
import { useExerciseMap } from "@/features/workouts/hooks/useExercises";
import { buildSessionExercises } from "@/features/workouts/utils/buildSessionExercises";
import { todayKey } from "@/lib/utils/date";

function NewSessionInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId") ?? undefined;
  const { data: template, isLoading: isTemplateLoading } = useWorkoutTemplate(templateId);
  const exerciseMap = useExerciseMap();
  const createSession = useCreateWorkoutSession();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    if (templateId && isTemplateLoading) return;

    hasStarted.current = true;

    const exercises = template ? buildSessionExercises(template.exercises, exerciseMap) : [];

    createSession
      .mutateAsync({
        templateId,
        date: todayKey(),
        startedAt: new Date().toISOString(),
        exercises,
      })
      .then((session) => {
        router.replace(`/workouts/${session.id}`);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, isTemplateLoading, template]);

  return <p className="text-sm text-muted-foreground">Starting your workout…</p>;
}

export default function NewWorkoutSessionPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <NewSessionInner />
    </Suspense>
  );
}
