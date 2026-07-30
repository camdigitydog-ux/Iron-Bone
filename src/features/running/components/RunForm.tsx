"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button, FormField, Input, Select, Textarea } from "@/components/ui";
import { useCreateRun, useUpdateRun } from "../hooks/useRuns";
import { computePaceSecPerMile, RUN_TYPES } from "@/lib/domain";
import { todayKey } from "@/lib/utils/date";
import type { RunEntry } from "@/lib/domain";

const runSchema = z.object({
  date: z.string().min(1, "Required"),
  distanceMiles: z.coerce.number().positive("Must be greater than 0"),
  durationMin: z.coerce.number().min(0),
  durationSec: z.coerce.number().min(0).max(59),
  runType: z.enum(RUN_TYPES),
  perceivedEffort: z.string().optional(),
  route: z.string().optional(),
  notes: z.string().optional(),
});

type RunFormInput = z.input<typeof runSchema>;
type RunFormValues = z.output<typeof runSchema>;

export function RunForm({ initialRun }: { initialRun?: RunEntry }) {
  const router = useRouter();
  const createRun = useCreateRun();
  const updateRun = useUpdateRun();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RunFormInput, unknown, RunFormValues>({
    resolver: zodResolver(runSchema),
    defaultValues: {
      date: initialRun?.date ?? todayKey(),
      distanceMiles: initialRun?.distanceMiles ?? 3,
      durationMin: initialRun ? Math.floor(initialRun.durationSec / 60) : 30,
      durationSec: initialRun ? initialRun.durationSec % 60 : 0,
      runType: initialRun?.runType ?? "easy",
      perceivedEffort: initialRun?.perceivedEffort?.toString() ?? "",
      route: initialRun?.route ?? "",
      notes: initialRun?.notes ?? "",
    },
  });

  async function onSubmit(values: RunFormValues) {
    const durationSec = values.durationMin * 60 + values.durationSec;
    const payload = {
      date: values.date,
      distanceMiles: values.distanceMiles,
      durationSec,
      avgPaceSecPerMile: computePaceSecPerMile(values.distanceMiles, durationSec),
      runType: values.runType,
      perceivedEffort: values.perceivedEffort ? Number(values.perceivedEffort) : undefined,
      route: values.route || undefined,
      notes: values.notes || undefined,
    };

    if (initialRun) {
      await updateRun.mutateAsync({ id: initialRun.id, patch: payload });
    } else {
      await createRun.mutateAsync(payload);
    }
    router.push("/running");
  }

  const isSaving = createRun.isPending || updateRun.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Date" htmlFor="run-date" error={errors.date?.message}>
          <Input id="run-date" type="date" {...register("date")} />
        </FormField>
        <FormField label="Type" htmlFor="run-type">
          <Select id="run-type" {...register("runType")}>
            {RUN_TYPES.map((type) => (
              <option key={type} value={type}>
                {type[0].toUpperCase() + type.slice(1)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Distance (mi)" htmlFor="run-distance" error={errors.distanceMiles?.message}>
          <Input id="run-distance" type="number" step="any" {...register("distanceMiles")} />
        </FormField>
        <div className="grid grid-cols-2 gap-2">
          <FormField label="Duration (min)" htmlFor="run-duration-min">
            <Input id="run-duration-min" type="number" min={0} {...register("durationMin")} />
          </FormField>
          <FormField label="Sec" htmlFor="run-duration-sec">
            <Input id="run-duration-sec" type="number" min={0} max={59} {...register("durationSec")} />
          </FormField>
        </div>
        <FormField label="Perceived effort (1-10, optional)" htmlFor="run-effort">
          <Input id="run-effort" type="number" min={1} max={10} {...register("perceivedEffort")} />
        </FormField>
        <FormField label="Route (optional)" htmlFor="run-route">
          <Input id="run-route" {...register("route")} />
        </FormField>
      </div>
      <FormField label="Notes (optional)" htmlFor="run-notes">
        <Textarea id="run-notes" rows={2} {...register("notes")} />
      </FormField>
      <Button type="submit" disabled={isSaving} tone="running" className="w-full">
        {isSaving ? "Saving…" : "Save run"}
      </Button>
    </form>
  );
}
