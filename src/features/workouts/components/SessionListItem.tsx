import Link from "next/link";
import { Badge } from "@/components/ui";
import { formatFriendlyDate } from "@/lib/utils/date";
import { totalVolumeLb, isSessionCompleted } from "@/lib/domain";
import type { WorkoutSession } from "@/lib/domain";

export function SessionListItem({ session }: { session: WorkoutSession }) {
  const completed = isSessionCompleted(session);
  return (
    <Link
      href={`/workouts/${session.id}`}
      className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-surface-muted"
    >
      <div>
        <p className="font-medium">{formatFriendlyDate(session.date)}</p>
        <p className="text-xs text-muted-foreground">
          {session.exercises.length} exercise{session.exercises.length === 1 ? "" : "s"} ·{" "}
          {Math.round(totalVolumeLb(session))} lb volume
        </p>
      </div>
      <Badge tone={completed ? "success" : "warning"}>{completed ? "Completed" : "In progress"}</Badge>
    </Link>
  );
}
