export default function OfflineFallbackPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-xl font-semibold">You&apos;re offline</h1>
      <p className="max-w-sm text-sm text-neutral-500">
        This page hasn&apos;t been loaded yet, so it isn&apos;t available offline. Your
        workouts, meals, and runs are still safe on this device — reconnect and
        try again, or go back to a page you&apos;ve already visited.
      </p>
    </main>
  );
}
