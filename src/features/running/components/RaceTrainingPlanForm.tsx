"use client";

import { useState } from "react";
import { addWeeks } from "date-fns";
import { Button, FormField, Input, Select } from "@/components/ui";
import { useActiveRunPlan, useCreateRunPlan, useUpdateRunPlan } from "../hooks/useRunPlans";
import { generateRunPlan, DEFAULT_DAYS_PER_WEEK_BY_EXPERIENCE } from "../utils/generateRunPlan";
import { dateKey } from "@/lib/utils/date";
import { RACE_TYPES, RUNNING_EXPERIENCE_LEVELS } from "@/lib/domain";
import type { RaceType, RunningExperience } from "@/lib/domain";

const DISTANCE_PRESETS: { label: string; miles: number }[] = [
  { label: "5K", miles: 3.1 },
  { label: "10K", miles: 6.2 },
  { label: "Half", miles: 13.1 },
  { label: "Marathon", miles: 26.2 },
];

const DAYS_PER_WEEK_OPTIONS = [3, 4, 5, 6, 7];

export function RaceTrainingPlanForm() {
  const { data: activePlan } = useActiveRunPlan();
  const createPlan = useCreateRunPlan();
  const updatePlan = useUpdateRunPlan();

  const [raceType, setRaceType] = useState<RaceType>("road");
  const [raceDistanceMiles, setRaceDistanceMiles] = useState(6.2);
  const [experience, setExperience] = useState<RunningExperience>("intermediate");
  const [daysPerWeek, setDaysPerWeek] = useState(DEFAULT_DAYS_PER_WEEK_BY_EXPERIENCE.intermediate);
  const [raceDate, setRaceDate] = useState(dateKey(addWeeks(new Date(), 12)));
  const [bodyWeightLb, setBodyWeightLb] = useState(160);

  const isSaving = createPlan.isPending || updatePlan.isPending;

  function handleExperienceChange(next: RunningExperience) {
    setExperience(next);
    setDaysPerWeek(DEFAULT_DAYS_PER_WEEK_BY_EXPERIENCE[next]);
  }

  async function handleGenerate() {
    const generated = generateRunPlan({
      raceType,
      raceDistanceMiles,
      experience,
      raceDate,
      daysPerWeek,
      bodyWeightLb,
    });
    // Create the new plan before deactivating the old one so there's never a moment
    // with zero active plans (which would make the active-plan query resolve to none).
    const previousActiveId = activePlan?.id;
    await createPlan.mutateAsync(generated);
    if (previousActiveId) {
      await updatePlan.mutateAsync({ id: previousActiveId, patch: { isActive: false } });
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Race type" htmlFor="race-type">
          <Select id="race-type" value={raceType} onChange={(e) => setRaceType(e.target.value as RaceType)}>
            {RACE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type[0].toUpperCase() + type.slice(1)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Experience" htmlFor="race-experience">
          <Select
            id="race-experience"
            value={experience}
            onChange={(e) => handleExperienceChange(e.target.value as RunningExperience)}
          >
            {RUNNING_EXPERIENCE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level[0].toUpperCase() + level.slice(1)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Race distance (mi)" htmlFor="race-distance">
          <Input
            id="race-distance"
            type="number"
            min={1}
            step="any"
            value={raceDistanceMiles}
            onChange={(e) => setRaceDistanceMiles(Number(e.target.value))}
          />
        </FormField>
        <FormField label="Days per week" htmlFor="race-days-per-week">
          <Select
            id="race-days-per-week"
            value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(Number(e.target.value))}
          >
            {DAYS_PER_WEEK_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} days/week
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Race date" htmlFor="race-date">
          <Input id="race-date" type="date" value={raceDate} onChange={(e) => setRaceDate(e.target.value)} />
        </FormField>
        <FormField label="Body weight (lb, for fueling targets)" htmlFor="race-bodyweight">
          <Input
            id="race-bodyweight"
            type="number"
            min={60}
            step="any"
            value={bodyWeightLb}
            onChange={(e) => setBodyWeightLb(Number(e.target.value))}
          />
        </FormField>
      </div>

      <div className="flex flex-wrap gap-2">
        {DISTANCE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => setRaceDistanceMiles(preset.miles)}
            className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-surface-muted"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <Button onClick={handleGenerate} disabled={isSaving} className="w-full">
        {isSaving ? "Generating…" : "Generate training plan"}
      </Button>
      {activePlan && (
        <p className="text-xs text-muted-foreground">
          Generating a new plan replaces whichever plan is currently active.
        </p>
      )}
    </div>
  );
}
