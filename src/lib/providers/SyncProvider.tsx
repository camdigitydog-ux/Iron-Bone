"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { exportAllData, importAllData } from "@/lib/db/sync";
import { pullSyncData, pushSyncData } from "@/lib/sync/actions";

const PUSH_DEBOUNCE_MS = 4000;

// Signing in only adds sync on top of the local-only app, so this provider is
// a no-op whenever userEmail is null — anonymous usage never touches the
// server. httpOnly session cookies aren't readable from client JS, so the
// server-computed email is threaded down as a prop from (app)/layout.tsx.
export function SyncProvider({
  userEmail,
  children,
}: {
  userEmail: string | null;
  children: ReactNode;
}) {
  const queryClient = useQueryClient();
  const hasPulledFor = useRef<string | null>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userEmail || hasPulledFor.current === userEmail) return;
    hasPulledFor.current = userEmail;

    (async () => {
      const remote = await pullSyncData();
      if (remote) {
        await importAllData(remote.data);
        await queryClient.invalidateQueries();
      } else {
        // First time this account has ever synced — seed the remote from
        // whatever is already on this device instead of leaving it empty.
        const local = await exportAllData();
        await pushSyncData(local);
      }
    })();
  }, [userEmail, queryClient]);

  useEffect(() => {
    if (!userEmail) return;

    const mutationCache = queryClient.getMutationCache();
    const unsubscribe = mutationCache.subscribe((event) => {
      if (event.type !== "updated" || event.mutation.state.status !== "success") return;

      if (pushTimer.current) clearTimeout(pushTimer.current);
      pushTimer.current = setTimeout(() => {
        exportAllData().then(pushSyncData);
      }, PUSH_DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [userEmail, queryClient]);

  return <>{children}</>;
}
