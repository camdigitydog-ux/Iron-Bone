import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Accent = "fitness" | "nutrition" | "running" | "trail";

const accentClasses: Record<Accent, string> = {
  fitness: "before:bg-fitness",
  nutrition: "before:bg-nutrition",
  running: "before:bg-running",
  trail: "before:bg-trail",
};

export function Card({
  className,
  accent,
  ...props
}: HTMLAttributes<HTMLDivElement> & { accent?: Accent }) {
  return (
    <div
      className={cn(
        "grain-surface relative overflow-hidden rounded-2xl border border-border bg-surface p-4",
        "shadow-[0_2px_10px_-3px_rgb(var(--shadow-color)/0.3)]",
        accent &&
          "before:absolute before:inset-x-0 before:top-0 before:z-[2] before:h-[3px] before:content-['']",
        accent && accentClasses[accent],
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-3 flex items-center justify-between gap-2", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
