import { cn } from "@/lib/utils/cn";

type Tone = "fitness" | "nutrition" | "running" | "trail";

const toneClasses: Record<Tone, string> = {
  fitness: "from-fitness/80 to-fitness",
  nutrition: "from-nutrition/80 to-nutrition",
  running: "from-running/80 to-running",
  trail: "from-trail/80 to-trail",
};

export function ProgressBar({
  value,
  max,
  tone = "nutrition",
  className,
}: {
  value: number;
  max: number;
  tone?: Tone;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      className={cn(
        "h-2.5 w-full overflow-hidden rounded-full bg-surface-muted shadow-inner",
        className,
      )}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r transition-[width] duration-300 ease-out",
          toneClasses[tone],
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
