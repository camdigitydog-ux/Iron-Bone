"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { navItems } from "./navItems";

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors",
              active ? "text-brand" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex h-7 w-9 items-center justify-center rounded-full transition-colors",
                active && "bg-brand/15",
              )}
            >
              <Icon width={19} height={19} />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
