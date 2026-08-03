"use client";

import { useState } from "react";
import { Button, Card, FormField, Input, Select } from "@/components/ui";
import {
  ACTIVITY_LEVELS,
  CALORIE_GOALS,
  calculateNutritionGoal,
  type ActivityLevel,
  type BiologicalSex,
  type CalorieGoal,
  type CalculatedGoal,
} from "../utils/calculateGoal";

export function GoalCalculator({ onCalculate }: { onCalculate: (goal: CalculatedGoal) => void }) {
  const [open, setOpen] = useState(false);
  const [sex, setSex] = useState<BiologicalSex>("male");
  const [age, setAge] = useState(30);
  const [weightLb, setWeightLb] = useState(160);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(9);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<CalorieGoal>("maintain");
  const [result, setResult] = useState<CalculatedGoal | null>(null);

  function handleCalculate() {
    const calculated = calculateNutritionGoal({
      sex,
      age,
      weightLb,
      heightIn: heightFt * 12 + heightIn,
      activityLevel,
      goal,
    });
    setResult(calculated);
  }

  function handleApply() {
    if (!result) return;
    onCalculate(result);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-nutrition hover:underline"
      >
        Calculate my targets for me
      </button>
    );
  }

  return (
    <Card accent="nutrition" className="space-y-3">
      <p className="text-sm font-semibold">Calculate my targets</p>
      <p className="text-xs text-muted-foreground">
        Estimates your calorie and macro targets from the Mifflin-St Jeor formula — the
        equation most guidelines treat as the most accurate estimate of daily energy needs.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Sex" htmlFor="calc-sex">
          <Select id="calc-sex" value={sex} onChange={(e) => setSex(e.target.value as BiologicalSex)}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
        </FormField>
        <FormField label="Age" htmlFor="calc-age">
          <Input
            id="calc-age"
            type="number"
            min={13}
            max={100}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
          />
        </FormField>
        <FormField label="Weight (lb)" htmlFor="calc-weight">
          <Input
            id="calc-weight"
            type="number"
            min={60}
            value={weightLb}
            onChange={(e) => setWeightLb(Number(e.target.value))}
          />
        </FormField>
        <FormField label="Height" htmlFor="calc-height-ft">
          <div className="flex gap-2">
            <Input
              id="calc-height-ft"
              type="number"
              min={3}
              max={8}
              aria-label="Height (feet)"
              value={heightFt}
              onChange={(e) => setHeightFt(Number(e.target.value))}
            />
            <Input
              type="number"
              min={0}
              max={11}
              aria-label="Height (inches)"
              value={heightIn}
              onChange={(e) => setHeightIn(Number(e.target.value))}
            />
          </div>
        </FormField>
        <FormField label="Activity level" htmlFor="calc-activity" className="sm:col-span-2">
          <Select
            id="calc-activity"
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
          >
            {ACTIVITY_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Goal" htmlFor="calc-goal" className="sm:col-span-2">
          <Select id="calc-goal" value={goal} onChange={(e) => setGoal(e.target.value as CalorieGoal)}>
            {CALORIE_GOALS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <Button type="button" variant="secondary" onClick={handleCalculate} className="w-full">
        Calculate
      </Button>

      {result && (
        <div className="space-y-2 rounded-lg border border-border bg-surface-muted/40 px-3 py-2 text-sm">
          <p>
            Maintenance (TDEE): <span className="font-data">{result.tdee} kcal/day</span>
          </p>
          <p>
            Target: <span className="font-data font-semibold">{result.dailyCalories} kcal</span> ·{" "}
            <span className="font-data">{result.proteinG}p / {result.carbsG}c / {result.fatG}f</span>
          </p>
          <Button type="button" tone="nutrition" onClick={handleApply} className="w-full">
            Use these numbers
          </Button>
        </div>
      )}
    </Card>
  );
}
