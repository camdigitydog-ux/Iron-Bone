import type { ReactNode } from "react";
import { getSession } from "@/lib/server/session";
import { AppProviders } from "@/lib/providers/AppProviders";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppGroupLayout({ children }: { children: ReactNode }) {
  // No requireSession()/redirect here — signing in is optional. Anonymous
  // visitors get the full local-only app; a session just adds sync on top.
  const session = await getSession();

  return (
    <AppProviders userEmail={session?.email ?? null}>
      <AppShell userEmail={session?.email ?? null}>{children}</AppShell>
    </AppProviders>
  );
}
