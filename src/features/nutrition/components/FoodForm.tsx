"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, FormField, Input } from "@/components/ui";
import { useCreateFood } from "../hooks/useFoods";

const foodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().optional(),
  servingSize: z.coerce.number().positive("Must be greater than 0"),
  servingUnit: z.string().min(1, "Required"),
  calories: z.coerce.number().min(0),
  proteinG: z.coerce.number().min(0),
  carbsG: z.coerce.number().min(0),
  fatG: z.coerce.number().min(0),
});

type FoodFormInput = z.input<typeof foodSchema>;
type FoodFormValues = z.output<typeof foodSchema>;

export function FoodForm({ onSaved }: { onSaved?: () => void }) {
  const createFood = useCreateFood();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FoodFormInput, unknown, FoodFormValues>({
    resolver: zodResolver(foodSchema),
    defaultValues: {
      name: "",
      brand: "",
      servingSize: 4,
      servingUnit: "oz",
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
    },
  });

  async function onSubmit(values: FoodFormValues) {
    await createFood.mutateAsync({
      name: values.name,
      brand: values.brand || undefined,
      servingSize: values.servingSize,
      servingUnit: values.servingUnit,
      macrosPerServing: {
        calories: values.calories,
        proteinG: values.proteinG,
        carbsG: values.carbsG,
        fatG: values.fatG,
      },
      isCustom: true,
    });
    reset();
    onSaved?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Name" htmlFor="food-name" error={errors.name?.message}>
          <Input id="food-name" {...register("name")} />
        </FormField>
        <FormField label="Brand (optional)" htmlFor="food-brand">
          <Input id="food-brand" {...register("brand")} />
        </FormField>
        <FormField label="Serving size" htmlFor="food-serving-size" error={errors.servingSize?.message}>
          <Input id="food-serving-size" type="number" step="any" {...register("servingSize")} />
        </FormField>
        <FormField label="Serving unit" htmlFor="food-serving-unit" error={errors.servingUnit?.message}>
          <Input id="food-serving-unit" placeholder="oz, fl oz, piece…" {...register("servingUnit")} />
        </FormField>
        <FormField label="Calories" htmlFor="food-calories">
          <Input id="food-calories" type="number" step="any" {...register("calories")} />
        </FormField>
        <FormField label="Protein (g)" htmlFor="food-protein">
          <Input id="food-protein" type="number" step="any" {...register("proteinG")} />
        </FormField>
        <FormField label="Carbs (g)" htmlFor="food-carbs">
          <Input id="food-carbs" type="number" step="any" {...register("carbsG")} />
        </FormField>
        <FormField label="Fat (g)" htmlFor="food-fat">
          <Input id="food-fat" type="number" step="any" {...register("fatG")} />
        </FormField>
      </div>
      <Button type="submit" disabled={createFood.isPending}>
        Add food
      </Button>
    </form>
  );
}
