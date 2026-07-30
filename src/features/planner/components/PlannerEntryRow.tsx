import { Badge, Button } from "@/components/ui";
import { useUpdatePlannerEntry, useDeletePlannerEntry } from "../hooks/usePlannerEntries";
import type { PlannerEntry, PlannerStatus } from "@/lib/domain";

const STATUS_TONE: Record<PlannerStatus, "warning" | "success" | "neutral"> = {
  planned: "warning",
  completed: "success",
  skipped: "neutral",
};

export function PlannerEntryRow({ entry }: { entry: PlannerEntry }) {
  const updateEntry = useUpdatePlannerEntry();
  const deleteEntry = useDeletePlannerEntry();

  function cycleStatus() {
    const next: PlannerStatus =
      entry.status === "planned" ? "completed" : entry.status === "completed" ? "skipped" : "planned";
    updateEntry.mutate({ id: entry.id, patch: { status: next } });
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
      <div>
        <p className="text-sm font-medium">{entry.title}</p>
        <p className="text-xs capitalize text-muted-foreground">{entry.itemType}</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={cycleStatus} type="button">
          <Badge tone={STATUS_TONE[entry.status]}>{entry.status}</Badge>
        </button>
        <Button variant="ghost" size="sm" onClick={() => deleteEntry.mutate(entry.id)}>
          Remove
        </Button>
      </div>
    </div>
  );
}
