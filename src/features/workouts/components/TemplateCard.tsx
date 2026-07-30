import Link from "next/link";
import { Card, Button } from "@/components/ui";
import type { WorkoutTemplate } from "@/lib/domain";

export function TemplateCard({ template }: { template: WorkoutTemplate }) {
  return (
    <Card accent="fitness" className="transition-shadow hover:shadow-[0_4px_16px_-3px_rgb(var(--shadow-color)/0.4)]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold leading-tight">{template.name}</h3>
          {template.description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{template.description}</p>
          ) : null}
        </div>
        <Link href={`/workouts/templates/${template.id}`}>
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        </Link>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {template.exercises.length} exercise{template.exercises.length === 1 ? "" : "s"}
        </p>
        <Link href={`/workouts/new?templateId=${template.id}`}>
          <Button size="sm">Start</Button>
        </Link>
      </div>
    </Card>
  );
}
