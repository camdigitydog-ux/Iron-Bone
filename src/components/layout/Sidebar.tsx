"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { navItems } from "./navItems";
import { BrandBadge } from "./BrandBadge";
import { LogoutButton } from "./LogoutButton";

export function Sidebar({ userEmail }: { userEmail: string | null }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-surface px-3 py-6 md:flex md:flex-col">
      <div className="mb-8 flex items-center gap-2.5 px-3">
        <BrandBadge className="h-9 w-9 drop-shadow-[0_2px_6px_rgb(var(--shadow-color)/0.4)]" />
        <div>
          <p className="font-display text-lg font-semibold uppercase leading-tight tracking-wide">
            Iron Bone
          </p>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Fitness &amp; Nutrition
          </p>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150",
                active
                  ? "bg-gradient-to-b from-brand to-brand/85 text-white shadow-[0_4px_14px_-3px_rgb(var(--shadow-color)/0.5)]"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
              )}
            >
              <Icon width={18} height={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border px-3 pt-4">
        {userEmail ? (
          <>
            <p className="truncate text-xs font-medium text-muted-foreground" title={userEmail}>
              {userEmail}
            </p>
            <LogoutButton />
          </>
        ) : (
          <div>
            <Link href="/login" className="text-xs font-semibold text-fitness hover:underline">
              Sign in
            </Link>
            <p className="text-[11px] text-muted-foreground">Sync your data across devices</p>
          </div>
        )}
      </div>
    </aside>
  );
}
