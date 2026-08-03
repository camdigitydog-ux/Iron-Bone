import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";
type Tone = "brand" | "fitness" | "nutrition" | "running";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Swaps the `primary` gradient or the `secondary` tint to a domain color. */
  tone?: Tone;
}

const toneGradient: Record<Tone, string> = {
  brand: "from-brand to-brand/80 focus-visible:ring-brand/50",
  fitness: "from-fitness to-fitness/80 focus-visible:ring-fitness/50",
  nutrition: "from-nutrition to-nutrition/80 focus-visible:ring-nutrition/50",
  running: "from-running to-running/80 focus-visible:ring-running/50",
};

// Only brand keeps the neutral gray look — the other tones give `secondary`
// a soft tab-like tint instead of the solid `primary` gradient.
const secondaryToneClasses: Record<Tone, string> = {
  brand:
    "bg-surface-muted text-foreground border border-border shadow-[0_2px_0_0_rgb(var(--shadow-color)/0.15)] hover:bg-border/60 hover:border-border",
  fitness: "bg-fitness/10 text-fitness border border-fitness/25 hover:bg-fitness/15",
  nutrition: "bg-nutrition/10 text-nutrition border border-nutrition/25 hover:bg-nutrition/15",
  running: "bg-running/10 text-running border border-running/25 hover:bg-running/15",
};

const variantClasses: Record<Exclude<Variant, "secondary">, string> = {
  primary:
    "bg-gradient-to-b text-white shadow-[0_3px_0_0_rgb(var(--shadow-color)/0.35),0_8px_18px_-6px_rgb(var(--shadow-color)/0.55)] hover:brightness-110 hover:shadow-[0_2px_0_0_rgb(var(--shadow-color)/0.35),0_6px_14px_-6px_rgb(var(--shadow-color)/0.5)] active:brightness-95 active:shadow-[0_1px_0_0_rgb(var(--shadow-color)/0.35)]",
  ghost: "text-foreground hover:bg-surface-muted",
  danger:
    "bg-gradient-to-b from-danger to-danger/80 text-white shadow-[0_3px_0_0_rgb(var(--shadow-color)/0.35),0_8px_18px_-6px_rgb(var(--shadow-color)/0.55)] hover:brightness-110 active:brightness-95",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", tone = "brand", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "font-display inline-flex items-center justify-center gap-2 rounded-lg uppercase tracking-wide font-semibold transition-all duration-150 ease-out active:scale-[0.98] active:translate-y-px disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 disabled:active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        variant === "primary" ? "focus-visible:ring-brand/50" : "focus-visible:ring-brand/30",
        (variant === "primary" || variant === "danger") && "knurl-press",
        variant === "secondary" ? secondaryToneClasses[tone] : variantClasses[variant],
        variant === "primary" && toneGradient[tone],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
});
