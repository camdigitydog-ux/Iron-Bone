"use client";

import { useState } from "react";
import { Button, Card, FormField, Input, Select } from "@/components/ui";
import { useActiveRunPlan, useCreateRunPlan, useUpdateRunPlan } from "../hooks/useRunPlans";
import { RUN_TYPES } from "@/lib/domain";
import { newId } from "@/lib/utils/id";
import { todayKey } from "@/lib/utils/date";
import type { PlannedRun, RunPlan, RunType } from "@/lib/domain";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type DaySlot = { runType: RunType | "rest"; targetDistanceMiles: number };

function buildInitialSlots(plan?: RunPlan): DaySlot[] {
  const plannedRuns = plan?.weeks[0]?.plannedRuns ?? [];
  return DAY_LABELS.map((_, dayOfWeek) => {
    const planned = plannedRuns.find((run) => run.dayOfWeek === dayOfWeek);
    return {
      runType: planned?.runType ?? "rest",
      targetDistanceMiles: planned?.targetDistanceMiles ?? 3,
    };
  });
}

export function RunPlanEditor({ plan }: { plan?: RunPlan }) {
  const { data: activePlan } = useActiveRunPlan();
  const createPlan = useCreateRunPlan();
  const updatePlan = useUpdateRunPlan();
  const [name, setName] = useState(plan?.name ?? "My weekly plan");
  const [slots, setSlots] = useState<DaySlot[]>(() => buildInitialSlots(plan));

  function updateSlot(dayOfWeek: number, patch: Partial<DaySlot>) {
    setSlots((prev) => prev.map((slot, index) => (index === dayOfWeek ? { ...slot, ...patch } : slot)));
  }

  async function handleSave() {
    const plannedRuns: PlannedRun[] = slots
      .map((slot, dayOfWeek) => ({ slot, dayOfWeek }))
      .filter(({ slot }) => slot.runType !== "rest")
      .map(({ slot, dayOfWeek }) => ({
        id: newId(),
        dayOfWeek,
        runType: slot.runType as RunType,
        targetDistanceMiles: slot.targetDistanceMiles,
      }));

    if (plan) {
      await updatePlan.mutateAsync({
        id: plan.id,
        patch: { name, weeks: [{ weekNumber: 1, plannedRuns }] },
      });
    } else {
      // Create before deactivating so there's never a moment with zero active plans.
      const previousActiveId = activePlan?.id;
      await createPlan.mutateAsync({
        name,
        startDate: todayKey(),
        isActive: true,
        weeks: [{ weekNumber: 1, plannedRuns }],
      });
      if (previousActiveId) {
        await updatePlan.mutateAsync({ id: previousActiveId, patch: { isActive: false } });
      }
    }
  }

  const isSaving = createPlan.isPending || updatePlan.isPending;

  return (
    <Card className="space-y-4">
      <FormField label="Plan name" htmlFor="plan-name">
        <Input id="plan-name" value={name} onChange={(e) => setName(e.target.value)} />
      </FormField>

      <div className="space-y-2">
        {DAY_LABELS.map((label, dayOfWeek) => {
          const slot = slots[dayOfWeek];
          return (
            <div key={label} className="grid grid-cols-[6rem_1fr_6rem] items-center gap-2">
              <span className="text-sm font-medium">{label}</span>
              <Select
                value={slot.runType}
                onChange={(e) => updateSlot(dayOfWeek, { runType: e.target.value as RunType | "rest" })}
              >
                <option value="rest">Rest day</option>
                {RUN_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type[0].toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </Select>
              {slot.runType !== "rest" ? (
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={slot.targetDistanceMiles}
                  onChange={(e) => updateSlot(dayOfWeek, { targetDistanceMiles: Number(e.target.value) })}
                  aria-label={`${label} target distance (mi)`}
                />
              ) : (
                <span />
              )}
            </div>
          );
        })}
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving ? "Saving…" : "Save plan"}
      </Button>
    </Card>
  );
}
