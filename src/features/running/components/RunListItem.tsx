import Link from "next/link";
import { Badge } from "@/components/ui";
import { formatFriendlyDate } from "@/lib/utils/date";
import { formatPace, formatDuration } from "@/lib/domain";
import { formatMiles } from "@/lib/utils/format";
import type { RunEntry } from "@/lib/domain";

export function RunListItem({ run }: { run: RunEntry }) {
  return (
    <Link
      href={`/running/${run.id}`}
      className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-surface-muted"
    >
      <div>
        <p className="font-medium">{formatFriendlyDate(run.date)}</p>
        <p className="font-data text-xs text-muted-foreground">
          {formatMiles(run.distanceMiles)} · {formatDuration(run.durationSec)} ·{" "}
          {formatPace(run.avgPaceSecPerMile)}
        </p>
      </div>
      {run.runType ? <Badge tone="running">{run.runType}</Badge> : null}
    </Link>
  );
}
