import type { ReactNode } from "react";
import { requireSession } from "@/lib/server/session";
import { AppProviders } from "@/lib/providers/AppProviders";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppGroupLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();

  return (
    <AppProviders>
      <AppShell userEmail={session.email}>{children}</AppShell>
    </AppProviders>
  );
}
