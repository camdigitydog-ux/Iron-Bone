"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, FormField, Input, Select } from "@/components/ui";
import { useExercises, useExerciseMap } from "@/features/workouts/hooks/useExercises";
import { useCreateWorkoutSession } from "@/features/workouts/hooks/useWorkoutSessions";
import { TemplateForm } from "@/features/workouts/components/TemplateForm";
import { generateWorkout } from "@/features/workouts/utils/generateWorkout";
import { generateWod, WOD_FORMATS, type WodFormat, type WodResult } from "@/features/workouts/utils/generateWod";
import { buildSessionExercises } from "@/features/workouts/utils/buildSessionExercises";
import { STYLE_PARAMS, type TrainingStyle } from "@/features/workouts/utils/trainingStyles";
import { formatDuration } from "@/lib/domain";
import { todayKey } from "@/lib/utils/date";
import type { TemplateExercise, ExerciseDefinition, ExerciseLevel, ID } from "@/lib/domain";

// TODO: CrossFit style is implemented (generateWod.ts) but temporarily hidden —
// the WOD movement selection isn't reading as authentic yet. Re-add "crossfit"
// to this list once that's reworked; nothing else needs to change.
const STYLES = (Object.keys(STYLE_PARAMS) as TrainingStyle[]).filter((style) => style !== "crossfit");
const LEVELS: ExerciseLevel[] = ["beginner", "intermediate", "expert"];
const WOD_FORMAT_KEYS = Object.keys(WOD_FORMATS) as WodFormat[];

const WOD_FOCUS_PRESETS: { label: string; groups: string[] }[] = [
  { label: "Full body — any movement", groups: [] },
  { label: "Upper body", groups: ["chest", "back", "shoulders", "biceps", "triceps"] },
  { label: "Lower body", groups: ["quads", "hamstrings", "glutes", "calves"] },
  { label: "Push", groups: ["chest", "shoulders", "triceps"] },
  { label: "Pull", groups: ["back", "biceps"] },
  { label: "Core & engine", groups: ["core"] },
];

const UPPER_GROUPS = ["chest", "back", "shoulders", "biceps", "triceps", "forearms"];
const LOWER_GROUPS = ["quads", "hamstrings", "glutes", "calves"];
const CORE_GROUPS = ["core"];
const CARDIO_GROUPS = ["cardio"];

function ExerciseRow({
  templateExercise,
  exerciseMap,
  isOpen,
  onToggleInstructions,
}: {
  templateExercise: TemplateExercise;
  exerciseMap: Map<string, ExerciseDefinition>;
  isOpen: boolean;
  onToggleInstructions: () => void;
}) {
  const exercise = exerciseMap.get(templateExercise.exerciseId);
  const sameReps = templateExercise.targetRepsMin === templateExercise.targetRepsMax;
  const repsLabel = sameReps
    ? String(templateExercise.targetRepsMin)
    : `${templateExercise.targetRepsMin}–${templateExercise.targetRepsMax}`;
  const unit = templateExercise.unit ?? "reps";
  const amountLabel = unit === "meters" ? `${repsLabel}m` : unit === "calories" ? `${repsLabel} cal` : `${repsLabel} reps`;
  const weightLabel = templateExercise.targetWeightLb ? ` @ ${templateExercise.targetWeightLb} lb (Rx)` : "";
  return (
    <Card className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{exercise?.name ?? "Unknown exercise"}</p>
          <p className="font-data text-xs text-muted-foreground">
            {templateExercise.targetSets} {templateExercise.targetSets === 1 ? "set" : "sets"} × {amountLabel}
            {weightLabel} · rest {templateExercise.restSec ? formatDuration(templateExercise.restSec) : "—"}
          </p>
          {templateExercise.notes && <p className="mt-0.5 text-xs text-fitness">{templateExercise.notes}</p>}
        </div>
        {exercise?.instructions && exercise.instructions.length > 0 && (
          <button
            type="button"
            onClick={onToggleInstructions}
            className="shrink-0 whitespace-nowrap text-xs font-medium text-fitness"
          >
            {isOpen ? "Hide form" : "How to"}
          </button>
        )}
      </div>
      {isOpen && exercise?.instructions && (
        <ol className="list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
          {exercise.instructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}
    </Card>
  );
}

export default function BuildWorkoutPage() {
  const router = useRouter();
  const { data: exercises = [] } = useExercises();
  const exerciseMap = useExerciseMap();
  const createSession = useCreateWorkoutSession();

  const muscleGroups = useMemo(() => {
    const groups = new Set<string>();
    for (const exercise of exercises) {
      for (const group of exercise.muscleGroups) groups.add(group);
    }
    return Array.from(groups).sort();
  }, [exercises]);

  // Condensed into five broad categories instead of ~12 individual muscle chips —
  // "Full Body" is every group at once; the rest each map to a handful of them.
  const muscleCategories = useMemo(() => {
    const has = (candidates: string[]) => candidates.filter((g) => muscleGroups.includes(g));
    return [
      { label: "Full Body", groups: muscleGroups },
      { label: "Upper", groups: has(UPPER_GROUPS) },
      { label: "Lower", groups: has(LOWER_GROUPS) },
      { label: "Core", groups: has(CORE_GROUPS) },
      { label: "Cardio", groups: has(CARDIO_GROUPS) },
    ].filter((category) => category.groups.length > 0);
  }, [muscleGroups]);

  const equipmentOptions = useMemo(() => {
    const set = new Set<string>();
    for (const exercise of exercises) {
      if (exercise.equipment) set.add(exercise.equipment);
    }
    return Array.from(set).sort();
  }, [exercises]);

  const [style, setStyle] = useState<TrainingStyle>("general");
  const [wodFormat, setWodFormat] = useState<WodFormat>("amrap");
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExerciseLevel | "">("");
  const [pinnedIds, setPinnedIds] = useState<Set<ID>>(new Set());
  const [accessoriesPerGroup, setAccessoriesPerGroup] = useState(STYLE_PARAMS.general.accessoriesPerGroupDefault);
  const [generated, setGenerated] = useState<TemplateExercise[] | null>(null);
  const [wodResult, setWodResult] = useState<WodResult | null>(null);
  const [showAllLifts, setShowAllLifts] = useState(false);
  const [openInstructionsId, setOpenInstructionsId] = useState<ID | null>(null);

  const isCrossfit = style === "crossfit";

  function selectStyle(next: TrainingStyle) {
    setStyle(next);
    setAccessoriesPerGroup(STYLE_PARAMS[next].accessoriesPerGroupDefault);
    setGenerated(null);
    setWodResult(null);
  }

  function toggleCategory(groups: string[]) {
    setSelectedGroups((prev) => {
      const allActive = groups.every((g) => prev.has(g));
      const next = new Set(prev);
      for (const g of groups) {
        if (allActive) next.delete(g);
        else next.add(g);
      }
      return next;
    });
    setGenerated(null);
    setWodResult(null);
  }

  function applyFocusPreset(groups: string[]) {
    setSelectedGroups(new Set(groups));
    setGenerated(null);
    setWodResult(null);
  }

  function togglePinned(id: ID) {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setGenerated(null);
    setWodResult(null);
  }

  function handleGenerate() {
    if (isCrossfit) {
      const result = generateWod(exercises, {
        muscleGroups: Array.from(selectedGroups),
        format: wodFormat,
        equipment: equipmentFilter ? [equipmentFilter] : undefined,
        pinnedExerciseIds: Array.from(pinnedIds),
      });
      setWodResult(result);
      setGenerated(null);
      return;
    }
    const draft = generateWorkout(exercises, {
      muscleGroups: Array.from(selectedGroups),
      style,
      pinnedExerciseIds: Array.from(pinnedIds),
      accessoriesPerGroup,
      equipment: equipmentFilter ? [equipmentFilter] : undefined,
      experienceLevel: experienceLevel || undefined,
    });
    setGenerated(draft);
    setWodResult(null);
  }

  const allExercises = wodResult ? [...wodResult.strength, ...wodResult.wod] : generated;

  async function handleStartNow() {
    if (!allExercises || allExercises.length === 0) return;
    const session = await createSession.mutateAsync({
      date: todayKey(),
      startedAt: new Date().toISOString(),
      exercises: buildSessionExercises(allExercises, exerciseMap),
    });
    router.push(`/workouts/${session.id}`);
  }

  const canGenerate = isCrossfit || selectedGroups.size > 0 || pinnedIds.size > 0;
  const activeStyle = STYLE_PARAMS[style];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Build a custom workout</h1>
        <p className="text-sm text-muted-foreground">
          Pick a training style and the muscle groups or lifts you&rsquo;re after — we&rsquo;ll assemble
          sets, reps, and rest from evidence-based programming for that style.
        </p>
      </div>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">Training style</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {STYLES.map((key) => {
            const params = STYLE_PARAMS[key];
            const active = style === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => selectStyle(key)}
                className={
                  active
                    ? "rounded-xl border-2 border-fitness bg-fitness/10 px-3 py-2.5 text-left"
                    : "rounded-xl border-2 border-border bg-surface px-3 py-2.5 text-left hover:bg-surface-muted"
                }
              >
                <p className="text-sm font-semibold">{params.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{params.description}</p>
              </button>
            );
          })}
        </div>
      </Card>

      {isCrossfit && (
        <Card className="space-y-3">
          <h2 className="text-sm font-semibold">WOD format</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {WOD_FORMAT_KEYS.map((key) => {
              const meta = WOD_FORMATS[key];
              const active = wodFormat === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setWodFormat(key);
                    setWodResult(null);
                  }}
                  className={
                    active
                      ? "rounded-xl border-2 border-running bg-running/10 px-3 py-2.5 text-left"
                      : "rounded-xl border-2 border-border bg-surface px-3 py-2.5 text-left hover:bg-surface-muted"
                  }
                >
                  <p className="text-sm font-semibold">{meta.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{meta.description}</p>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">Muscle groups {isCrossfit && "(optional)"}</h2>
        {isCrossfit && (
          <FormField label="Focus" htmlFor="wod-focus">
            <Select
              id="wod-focus"
              defaultValue=""
              onChange={(e) => {
                const preset = WOD_FOCUS_PRESETS[Number(e.target.value)];
                if (preset) applyFocusPreset(preset.groups);
              }}
            >
              <option value="" disabled>
                Quick pick a focus…
              </option>
              {WOD_FOCUS_PRESETS.map((preset, index) => (
                <option key={preset.label} value={index}>
                  {preset.label}
                </option>
              ))}
            </Select>
          </FormField>
        )}
        <div className="flex flex-wrap gap-2">
          {muscleCategories.map((category) => {
            const active = category.groups.length > 0 && category.groups.every((g) => selectedGroups.has(g));
            return (
              <button
                key={category.label}
                type="button"
                onClick={() => toggleCategory(category.groups)}
                className={
                  active
                    ? "rounded-full bg-fitness px-4 py-1.5 text-sm font-medium text-white"
                    : "rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium text-muted-foreground hover:bg-surface-muted"
                }
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">Equipment &amp; level (optional)</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Equipment available" htmlFor="equipment-filter">
            <Select
              id="equipment-filter"
              value={equipmentFilter}
              onChange={(e) => {
                setEquipmentFilter(e.target.value);
                setGenerated(null);
                setWodResult(null);
              }}
            >
              <option value="">Any</option>
              {equipmentOptions.map((item) => (
                <option key={item} value={item} className="capitalize">
                  {item}
                </option>
              ))}
            </Select>
          </FormField>
          {!isCrossfit && (
            <FormField label="Max exercise difficulty" htmlFor="experience-level">
              <Select
                id="experience-level"
                value={experienceLevel}
                onChange={(e) => {
                  setExperienceLevel(e.target.value as ExerciseLevel | "");
                  setGenerated(null);
                }}
              >
                <option value="">Any</option>
                {LEVELS.map((level) => (
                  <option key={level} value={level} className="capitalize">
                    {level}
                  </option>
                ))}
              </Select>
            </FormField>
          )}
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Interested in specific lifts?</h2>
          <button
            type="button"
            onClick={() => setShowAllLifts((prev) => !prev)}
            className="text-xs font-medium text-fitness"
          >
            {showAllLifts ? "Hide" : "Pin exercises"}
          </button>
        </div>
        {pinnedIds.size > 0 && (
          <div className="flex flex-wrap gap-1">
            {exercises
              .filter((exercise) => pinnedIds.has(exercise.id))
              .map((exercise) => (
                <Badge key={exercise.id} tone="fitness">
                  {exercise.name}
                </Badge>
              ))}
          </div>
        )}
        {showAllLifts && (
          <div className="grid max-h-64 gap-1 overflow-y-auto sm:grid-cols-2">
            {exercises.map((exercise) => (
              <label
                key={exercise.id}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-muted"
              >
                <input
                  type="checkbox"
                  checked={pinnedIds.has(exercise.id)}
                  onChange={() => togglePinned(exercise.id)}
                />
                {exercise.name}
                <span className="text-xs text-muted-foreground">({exercise.category})</span>
              </label>
            ))}
          </div>
        )}
      </Card>

      {!isCrossfit && (
        <Card className="space-y-3">
          <FormField label="Accessories per muscle group" htmlFor="accessories-per-group">
            <Input
              id="accessories-per-group"
              type="number"
              min={0}
              max={5}
              value={accessoriesPerGroup}
              onChange={(e) => {
                setAccessoriesPerGroup(Number(e.target.value));
                setGenerated(null);
              }}
            />
          </FormField>
          <Button onClick={handleGenerate} disabled={!canGenerate} className="w-full">
            Generate workout
          </Button>
        </Card>
      )}

      {isCrossfit && (
        <Button onClick={handleGenerate} disabled={!canGenerate} className="w-full">
          Generate WOD
        </Button>
      )}

      {wodResult && (
        <div className="space-y-4">
          <Card accent="running" className="space-y-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Today&rsquo;s WOD — &ldquo;{wodResult.name}&rdquo;
              </p>
              <p className="font-display text-2xl font-semibold uppercase tracking-wide text-running">
                {wodResult.title}
              </p>
            </div>
            <div className="space-y-1 border-t border-border/60 pt-2 text-xs text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Scoring: </span>
                {wodResult.scoring}
              </p>
              <p>
                <span className="font-semibold text-foreground">Stimulus: </span>
                {wodResult.stimulus}
              </p>
              <p>
                <span className="font-semibold text-foreground">Strategy: </span>
                {wodResult.strategy}
              </p>
            </div>
          </Card>

          {wodResult.strength.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Strength</h3>
              {wodResult.strength.map((templateExercise) => (
                <ExerciseRow
                  key={templateExercise.id}
                  templateExercise={templateExercise}
                  exerciseMap={exerciseMap}
                  isOpen={openInstructionsId === templateExercise.id}
                  onToggleInstructions={() =>
                    setOpenInstructionsId(openInstructionsId === templateExercise.id ? null : templateExercise.id)
                  }
                />
              ))}
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">The WOD</h3>
            {wodResult.wod.map((templateExercise) => (
              <ExerciseRow
                key={templateExercise.id}
                templateExercise={templateExercise}
                exerciseMap={exerciseMap}
                isOpen={openInstructionsId === templateExercise.id}
                onToggleInstructions={() =>
                  setOpenInstructionsId(openInstructionsId === templateExercise.id ? null : templateExercise.id)
                }
              />
            ))}
          </div>

          <Button onClick={handleStartNow} disabled={createSession.isPending} tone="fitness" className="w-full">
            {createSession.isPending ? "Starting…" : "Start this WOD now"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            or fine-tune sets/reps below and save it as a reusable template
          </p>
          <TemplateForm initialExercises={allExercises ?? []} initialName={`"${wodResult.name}" — ${wodResult.title}`} />
        </div>
      )}

      {generated && generated.length > 0 && (
        <div className="space-y-4">
          {activeStyle.structureNote && (
            <Card className="border-fitness/30 bg-fitness/5">
              <p className="text-xs text-foreground">{activeStyle.structureNote}</p>
            </Card>
          )}

          <div className="space-y-2">
            {generated.map((templateExercise) => (
              <ExerciseRow
                key={templateExercise.id}
                templateExercise={templateExercise}
                exerciseMap={exerciseMap}
                isOpen={openInstructionsId === templateExercise.id}
                onToggleInstructions={() =>
                  setOpenInstructionsId(openInstructionsId === templateExercise.id ? null : templateExercise.id)
                }
              />
            ))}
          </div>

          <Button
            onClick={handleStartNow}
            disabled={createSession.isPending}
            tone="fitness"
            className="w-full"
          >
            {createSession.isPending ? "Starting…" : "Start this workout now"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            or fine-tune sets/reps below and save it as a reusable template
          </p>
          <TemplateForm initialExercises={generated} initialName="Custom workout" />
        </div>
      )}

      {generated && generated.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No matching exercises found for that selection. Try different muscle groups, equipment, or level.
        </p>
      )}
    </div>
  );
}
