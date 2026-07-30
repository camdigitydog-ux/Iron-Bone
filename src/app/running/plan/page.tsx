"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { useActiveRunPlan } from "@/features/running/hooks/useRunPlans";
import { RunPlanEditor } from "@/features/running/components/RunPlanEditor";
import { RaceTrainingPlanForm } from "@/features/running/components/RaceTrainingPlanForm";
import { PlanOverview } from "@/features/running/components/PlanOverview";

export default function RunPlanPage() {
  const { data: plan, isLoading } = useActiveRunPlan();
  const [showManualEditor, setShowManualEditor] = useState(false);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading plan…</p>;

  const hasGeneratedRacePlan = Boolean(plan?.raceType);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Training plan</h1>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">Generate a plan for your race</h2>
        <p className="text-xs text-muted-foreground">
          Tell us about your race and we&rsquo;ll build a periodized week-by-week plan with
          fueling guidance for every run.
        </p>
        <RaceTrainingPlanForm />
      </Card>

      {hasGeneratedRacePlan && plan ? (
        <>
          <PlanOverview plan={plan} />
          <button
            type="button"
            onClick={() => setShowManualEditor((prev) => !prev)}
            className="text-xs font-medium text-muted-foreground underline"
          >
            {showManualEditor ? "Hide" : "Or set a simple repeating weekly plan instead"}
          </button>
          {showManualEditor && <RunPlanEditor />}
        </>
      ) : (
        <RunPlanEditor plan={plan ?? undefined} />
      )}
    </div>
  );
}
