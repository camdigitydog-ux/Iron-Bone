"use client";

import { useState } from "react";
import { Button, FormField, Input } from "@/components/ui";
import { useCreateBodyWeightEntry, useLatestBodyWeight } from "../hooks/useBodyWeight";
import { todayKey } from "@/lib/utils/date";

export function BodyWeightForm() {
  const { data: latest } = useLatestBodyWeight();
  const createEntry = useCreateBodyWeightEntry();
  const [date, setDate] = useState(todayKey());
  const [weightLb, setWeightLb] = useState(latest?.weightLb ?? 160);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createEntry.mutateAsync({ date, weightLb });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <FormField label="Date" htmlFor="weight-date" className="w-36">
        <Input id="weight-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </FormField>
      <FormField label="Weight (lb)" htmlFor="weight-value" className="flex-1">
        <Input
          id="weight-value"
          type="number"
          min={60}
          step="any"
          value={weightLb}
          onChange={(e) => setWeightLb(Number(e.target.value))}
        />
      </FormField>
      <Button type="submit" tone="nutrition" disabled={createEntry.isPending}>
        Log
      </Button>
    </form>
  );
}
