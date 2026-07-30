"use client";

import { useParams, useRouter } from "next/navigation";
import { useWorkoutTemplate, useDeleteWorkoutTemplate } from "@/features/workouts/hooks/useWorkoutTemplates";
import { TemplateForm } from "@/features/workouts/components/TemplateForm";
import { Button } from "@/components/ui";

export default function EditTemplatePage() {
  const params = useParams<{ templateId: string }>();
  const router = useRouter();
  const { data: template, isLoading } = useWorkoutTemplate(params.templateId);
  const deleteTemplate = useDeleteWorkoutTemplate();

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading template…</p>;
  if (!template) return <p className="text-sm text-muted-foreground">Template not found.</p>;

  async function handleDelete() {
    await deleteTemplate.mutateAsync(template!.id);
    router.push("/workouts");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Edit template</h1>
        <Button variant="ghost" size="sm" onClick={handleDelete}>
          Delete template
        </Button>
      </div>
      <TemplateForm initialTemplate={template} />
    </div>
  );
}
