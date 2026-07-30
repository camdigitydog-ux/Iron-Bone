import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "fitness" | "nutrition" | "running" | "trail" | "success" | "warning";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-muted text-muted-foreground ring-border",
  fitness: "bg-fitness/12 text-fitness ring-fitness/25",
  nutrition: "bg-nutrition/12 text-nutrition ring-nutrition/25",
  running: "bg-running/12 text-running ring-running/25",
  trail: "bg-trail/12 text-trail ring-trail/25",
  success: "bg-nutrition/12 text-nutrition ring-nutrition/25",
  warning: "bg-trail/12 text-trail ring-trail/25",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
