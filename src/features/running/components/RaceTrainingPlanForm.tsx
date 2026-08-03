"use client";

import { useState } from "react";
import { addWeeks } from "date-fns";
import { Button, Card, FormField, Input, Select } from "@/components/ui";
import { useActiveRunPlan, useCreateRunPlan, useUpdateRunPlan } from "../hooks/useRunPlans";
import { generateRunPlan, DEFAULT_DAYS_PER_WEEK_BY_EXPERIENCE } from "../utils/generateRunPlan";
import { PlanOverview } from "./PlanOverview";
import { dateKey } from "@/lib/utils/date";
import { RACE_TYPES, RUNNING_EXPERIENCE_LEVELS } from "@/lib/domain";
import type { RaceType, RunningExperience, RunPlan } from "@/lib/domain";

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
  const [previewPlan, setPreviewPlan] = useState<RunPlan | null>(null);

  const isSaving = createPlan.isPending || updatePlan.isPending;

  function handleExperienceChange(next: RunningExperience) {
    setExperience(next);
    setDaysPerWeek(DEFAULT_DAYS_PER_WEEK_BY_EXPERIENCE[next]);
  }

  function handleGenerate() {
    const draft = generateRunPlan({
      raceType,
      raceDistanceMiles,
      experience,
      raceDate,
      daysPerWeek,
      bodyWeightLb,
    });
    // Not persisted yet — just a preview until the runner picks "Select this plan."
    const timestamp = new Date().toISOString();
    setPreviewPlan({ ...draft, id: "preview", createdAt: timestamp, updatedAt: timestamp });
  }

  async function handleSelectPlan() {
    if (!previewPlan) return;
    // Create the new plan before deactivating the old one so there's never a moment
    // with zero active plans (which would make the active-plan query resolve to none).
    // previewPlan's placeholder id/createdAt/updatedAt are extra properties the
    // create call ignores — the repository assigns its own.
    const previousActiveId = activePlan?.id;
    await createPlan.mutateAsync(previewPlan);
    if (previousActiveId) {
      await updatePlan.mutateAsync({ id: previousActiveId, patch: { isActive: false } });
    }
    setPreviewPlan(null);
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

      <Button
        onClick={handleGenerate}
        variant={previewPlan ? "secondary" : "primary"}
        disabled={isSaving}
        className="w-full"
      >
        {previewPlan ? "Regenerate" : "Generate training plan"}
      </Button>

      {previewPlan && (
        <Card accent="running" className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview</p>
            <p className="text-xs text-muted-foreground">
              Not saved yet — review the weeks below, then select it to make it your active plan.
            </p>
          </div>
          <PlanOverview plan={previewPlan} />
          <Button onClick={handleSelectPlan} disabled={isSaving} tone="running" className="w-full">
            {isSaving ? "Selecting…" : "Select this plan"}
          </Button>
        </Card>
      )}

      {!previewPlan && activePlan && (
        <p className="text-xs text-muted-foreground">
          Selecting a new plan replaces whichever plan is currently active.
        </p>
      )}
    </div>
  );
}
