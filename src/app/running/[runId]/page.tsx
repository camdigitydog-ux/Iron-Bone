"use client";

import { useParams, useRouter } from "next/navigation";
import { useRun, useDeleteRun } from "@/features/running/hooks/useRuns";
import { RunForm } from "@/features/running/components/RunForm";
import { Button } from "@/components/ui";

export default function EditRunPage() {
  const params = useParams<{ runId: string }>();
  const router = useRouter();
  const { data: run, isLoading } = useRun(params.runId);
  const deleteRun = useDeleteRun();

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading run…</p>;
  if (!run) return <p className="text-sm text-muted-foreground">Run not found.</p>;

  async function handleDelete() {
    await deleteRun.mutateAsync(run!.id);
    router.push("/running");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Edit run</h1>
        <Button variant="ghost" size="sm" onClick={handleDelete}>
          Delete
        </Button>
      </div>
      <RunForm initialRun={run} />
    </div>
  );
}
