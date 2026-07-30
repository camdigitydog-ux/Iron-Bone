import { TemplateForm } from "@/features/workouts/components/TemplateForm";

export default function NewTemplatePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">New template</h1>
      <TemplateForm />
    </div>
  );
}
