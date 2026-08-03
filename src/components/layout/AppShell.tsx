import type { ReactNode } from "react";
import Link from "next/link";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { BrandBadge } from "./BrandBadge";
import { LogoutButton } from "./LogoutButton";

export function AppShell({
  children,
  userEmail,
}: {
  children: ReactNode;
  userEmail: string | null;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar userEmail={userEmail} />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-2.5 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur-md md:hidden">
          <BrandBadge className="h-8 w-8 drop-shadow-[0_2px_6px_rgb(var(--shadow-color)/0.4)]" />
          <p className="font-display flex-1 text-lg font-semibold uppercase tracking-wide">
            Iron Bone
          </p>
          {userEmail ? (
            <LogoutButton />
          ) : (
            <Link href="/login" className="text-xs font-semibold text-fitness hover:underline">
              Sign in
            </Link>
          )}
        </header>
        <main className="flex-1 px-4 pb-20 pt-4 md:px-8 md:pb-8 md:pt-6">
          <div className="mx-auto w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1800px]">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
