"use client";

import Link from "next/link";
import { Button, Card, EmptyState } from "@/components/ui";
import { useWorkoutTemplates } from "@/features/workouts/hooks/useWorkoutTemplates";
import { useWorkoutSessions } from "@/features/workouts/hooks/useWorkoutSessions";
import { TemplateCard } from "@/features/workouts/components/TemplateCard";
import { SessionListItem } from "@/features/workouts/components/SessionListItem";

export default function WorkoutsPage() {
  const { data: templates = [] } = useWorkoutTemplates();
  const { data: sessions = [] } = useWorkoutSessions();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Workouts</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/workouts/exercises" className="shrink-0">
            <Button variant="secondary" size="sm" className="whitespace-nowrap">
              Exercises
            </Button>
          </Link>
          <Link href="/workouts/build" className="shrink-0">
            <Button variant="secondary" size="sm" className="whitespace-nowrap">
              Build workout
            </Button>
          </Link>
          <Link href="/workouts/new" className="shrink-0">
            <Button size="sm" tone="fitness" className="whitespace-nowrap">
              Start blank
            </Button>
          </Link>
        </div>
      </div>

      <Card accent="fitness" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Templates</h2>
          <Link href="/workouts/templates/new" className="text-xs font-medium text-fitness">
            + New template
          </Link>
        </div>
        {templates.length === 0 ? (
          <EmptyState
            title="No templates yet"
            description="Create a reusable template so you don't have to plan each session from scratch."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Recent sessions</h2>
        {sessions.length === 0 ? (
          <EmptyState title="No sessions logged yet" description="Start a workout to see it here." />
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 10).map((session) => (
              <SessionListItem key={session.id} session={session} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
