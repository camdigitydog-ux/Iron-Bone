"use client";

import { useState } from "react";
import { Badge, Button, Card, FormField, Input, Select } from "@/components/ui";
import { useExercises, useCreateExercise } from "@/features/workouts/hooks/useExercises";
import { useExerciseSearch } from "@/features/workouts/hooks/useExerciseSearch";
import type { ExerciseCategory } from "@/lib/domain";
import type { ExternalExerciseResult } from "@/lib/external/exerciseDb";

export default function ExercisesPage() {
  const { data: exercises = [] } = useExercises();
  const createExercise = useCreateExercise();

  const [name, setName] = useState("");
  const [muscleGroups, setMuscleGroups] = useState("");
  const [equipment, setEquipment] = useState("");
  const [category, setCategory] = useState<ExerciseCategory>("accessory");

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { data: searchResults = [], isLoading: isSearching, isError: searchFailed } =
    useExerciseSearch(searchTerm);
  const [importingId, setImportingId] = useState<string | null>(null);

  async function handleAdd() {
    if (!name.trim()) return;
    await createExercise.mutateAsync({
      name: name.trim(),
      muscleGroups: muscleGroups
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      equipment: equipment.trim() || undefined,
      category,
      isCustom: true,
    });
    setName("");
    setMuscleGroups("");
    setEquipment("");
    setCategory("accessory");
  }

  async function handleImport(result: ExternalExerciseResult) {
    setImportingId(result.externalId);
    try {
      await createExercise.mutateAsync({
        name: result.name,
        muscleGroups: result.muscleGroups,
        primaryMuscles: result.primaryMuscles,
        secondaryMuscles: result.secondaryMuscles,
        equipment: result.equipment,
        category: result.category,
        mechanic: result.mechanic,
        force: result.force,
        level: result.level,
        movementPattern: result.movementPattern,
        instructions: result.instructions,
        isCustom: true,
      });
      setSearchTerm("");
      setSearchInput("");
    } finally {
      setImportingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Exercise library</h1>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">Add custom exercise</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Name" htmlFor="ex-name">
            <Input id="ex-name" value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label="Muscle groups (comma separated)" htmlFor="ex-muscles">
            <Input
              id="ex-muscles"
              value={muscleGroups}
              onChange={(e) => setMuscleGroups(e.target.value)}
              placeholder="chest, triceps"
            />
          </FormField>
          <FormField label="Equipment (optional)" htmlFor="ex-equipment">
            <Input id="ex-equipment" value={equipment} onChange={(e) => setEquipment(e.target.value)} />
          </FormField>
          <FormField label="Category" htmlFor="ex-category">
            <Select
              id="ex-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
            >
              <option value="main">Main lift</option>
              <option value="accessory">Accessory</option>
            </Select>
          </FormField>
        </div>
        <Button onClick={handleAdd} disabled={!name.trim() || createExercise.isPending}>
          Add exercise
        </Button>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">Can&rsquo;t find it? Search the exercise database</h2>
        <div className="flex gap-2">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setSearchTerm(searchInput);
              }
            }}
            placeholder="e.g. Bulgarian split squat"
            className="flex-1"
          />
          <Button variant="secondary" onClick={() => setSearchTerm(searchInput)}>
            Search
          </Button>
        </div>

        {isSearching && <p className="text-xs text-muted-foreground">Searching…</p>}
        {searchFailed && (
          <p className="text-xs text-danger">Search failed — check your connection and try again.</p>
        )}
        {!isSearching && searchTerm && searchResults.length === 0 && !searchFailed && (
          <p className="text-xs text-muted-foreground">No matches found.</p>
        )}

        {searchResults.length > 0 && (
          <ul className="max-h-64 space-y-1 overflow-y-auto">
            {searchResults.map((result) => (
              <li
                key={result.externalId}
                className="flex items-center justify-between gap-2 rounded-lg border border-border px-2 py-1.5 text-sm"
              >
                <span>
                  <span className="font-medium">{result.name}</span>{" "}
                  <span className="text-xs capitalize text-muted-foreground">
                    ({result.category}) · {result.muscleGroups.join(", ")} · {result.equipment}
                    {result.level ? ` · ${result.level}` : ""}
                  </span>
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleImport(result)}
                  disabled={importingId === result.externalId}
                >
                  {importingId === result.externalId ? "Adding…" : "Add"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-2 sm:grid-cols-2">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="rounded-lg border border-border bg-surface px-3 py-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{exercise.name}</p>
              <Badge tone={exercise.category === "main" ? "fitness" : "neutral"}>
                {exercise.category}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {exercise.muscleGroups.join(", ")}
              {exercise.equipment ? ` · ${exercise.equipment}` : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
