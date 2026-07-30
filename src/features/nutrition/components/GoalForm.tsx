"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, FormField, Input } from "@/components/ui";
import { useCreateGoal } from "../hooks/useGoals";
import { todayKey } from "@/lib/utils/date";
import type { NutritionGoal } from "@/lib/domain";

const goalSchema = z.object({
  dailyCalories: z.coerce.number().positive(),
  proteinG: z.coerce.number().min(0),
  carbsG: z.coerce.number().min(0),
  fatG: z.coerce.number().min(0),
});

type GoalFormInput = z.input<typeof goalSchema>;
type GoalFormValues = z.output<typeof goalSchema>;

export function GoalForm({ currentGoal }: { currentGoal?: NutritionGoal | null }) {
  const createGoal = useCreateGoal();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GoalFormInput, unknown, GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      dailyCalories: currentGoal?.dailyCalories ?? 2200,
      proteinG: currentGoal?.proteinG ?? 150,
      carbsG: currentGoal?.carbsG ?? 220,
      fatG: currentGoal?.fatG ?? 70,
    },
  });

  async function onSubmit(values: GoalFormValues) {
    await createGoal.mutateAsync({ effectiveDate: todayKey(), ...values });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Daily calories" htmlFor="goal-calories" error={errors.dailyCalories?.message}>
          <Input id="goal-calories" type="number" {...register("dailyCalories")} />
        </FormField>
        <FormField label="Protein (g)" htmlFor="goal-protein">
          <Input id="goal-protein" type="number" {...register("proteinG")} />
        </FormField>
        <FormField label="Carbs (g)" htmlFor="goal-carbs">
          <Input id="goal-carbs" type="number" {...register("carbsG")} />
        </FormField>
        <FormField label="Fat (g)" htmlFor="goal-fat">
          <Input id="goal-fat" type="number" {...register("fatG")} />
        </FormField>
      </div>
      <Button type="submit" disabled={createGoal.isPending}>
        Save goal
      </Button>
    </form>
  );
}
