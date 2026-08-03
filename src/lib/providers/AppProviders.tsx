"use client";

import { useState, useEffect, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/query/queryClient";
import { RepositoryProvider } from "./RepositoryProvider";
import { SyncProvider } from "./SyncProvider";
import { seedIfEmpty, migrateExerciseLibraryIfNeeded, migrateFoodLibraryIfNeeded } from "@/lib/db/seed";

export function AppProviders({
  userEmail = null,
  children,
}: {
  userEmail?: string | null;
  children: ReactNode;
}) {
  const [queryClient] = useState(createQueryClient);
  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    seedIfEmpty()
      .then(() => migrateExerciseLibraryIfNeeded())
      .then(() => migrateFoodLibraryIfNeeded())
      .finally(() => setIsSeeded(true));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider>
        {isSeeded ? (
          // Gated on isSeeded so the initial sync pull never races the
          // first-run seed writing to the same Dexie tables.
          <SyncProvider userEmail={userEmail}>{children}</SyncProvider>
        ) : (
          <AppBootScreen />
        )}
      </RepositoryProvider>
    </QueryClientProvider>
  );
}

function AppBootScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">
      Loading your planner…
    </div>
  );
}
