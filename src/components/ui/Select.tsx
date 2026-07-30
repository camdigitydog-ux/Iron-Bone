import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/30",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);
