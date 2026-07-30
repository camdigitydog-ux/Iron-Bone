"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      className={cn(
        "grain-surface m-auto w-full max-w-lg rounded-2xl border border-border bg-surface-elevated p-0 text-foreground shadow-[0_20px_50px_-12px_rgb(var(--shadow-color)/0.6)] backdrop:bg-black/60 backdrop:backdrop-blur-sm",
        className,
      )}
    >
      <div className="relative z-[2] flex items-center justify-between border-b border-border px-4 py-3.5">
        <h2 className="font-display text-base font-semibold uppercase tracking-wide">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="relative z-[2] max-h-[70vh] overflow-y-auto p-4">{children}</div>
    </dialog>
  );
}
