"use client";

import { useState, useEffect, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/query/queryClient";
import { RepositoryProvider } from "./RepositoryProvider";
import { seedIfEmpty, migrateExerciseLibraryIfNeeded } from "@/lib/db/seed";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    seedIfEmpty()
      .then(() => migrateExerciseLibraryIfNeeded())
      .finally(() => setIsSeeded(true));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider>{isSeeded ? children : <AppBootScreen />}</RepositoryProvider>
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
