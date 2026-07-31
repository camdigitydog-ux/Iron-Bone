import { RunForm } from "@/features/running/components/RunForm";

export default function NewRunPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Log a run</h1>
      <RunForm />
    </div>
  );
}
