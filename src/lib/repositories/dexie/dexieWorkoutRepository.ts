import type { FitnessPlannerDB } from "@/lib/db/schema";
import type { ExerciseDefinition, WorkoutTemplate, WorkoutSession, ID } from "@/lib/domain";
import type { WorkoutRepository, CreateInput, UpdatePatch, DateRange } from "../types";
import { createEntity, updateEntity } from "./helpers";

export class DexieWorkoutRepository implements WorkoutRepository {
  constructor(private db: FitnessPlannerDB) {}

  listExercises(): Promise<ExerciseDefinition[]> {
    return this.db.exercises.orderBy("name").toArray();
  }

  createExercise(input: CreateInput<ExerciseDefinition>): Promise<ExerciseDefinition> {
    return createEntity<ExerciseDefinition>(this.db.exercises, input);
  }

  listTemplates(): Promise<WorkoutTemplate[]> {
    return this.db.workoutTemplates.orderBy("createdAt").reverse().toArray();
  }

  getTemplate(id: ID): Promise<WorkoutTemplate | undefined> {
    return this.db.workoutTemplates.get(id);
  }

  createTemplate(input: CreateInput<WorkoutTemplate>): Promise<WorkoutTemplate> {
    return createEntity<WorkoutTemplate>(this.db.workoutTemplates, input);
  }

  updateTemplate(id: ID, patch: UpdatePatch<WorkoutTemplate>): Promise<WorkoutTemplate> {
    return updateEntity<WorkoutTemplate>(this.db.workoutTemplates, id, patch);
  }

  async deleteTemplate(id: ID): Promise<void> {
    await this.db.workoutTemplates.delete(id);
  }

  async listSessions(range?: DateRange): Promise<WorkoutSession[]> {
    if (!range) return this.db.workoutSessions.orderBy("date").reverse().toArray();
    return this.db.workoutSessions.where("date").between(range.from, range.to, true, true).toArray();
  }

  getSession(id: ID): Promise<WorkoutSession | undefined> {
    return this.db.workoutSessions.get(id);
  }

  getSessionsByDate(date: string): Promise<WorkoutSession[]> {
    return this.db.workoutSessions.where("date").equals(date).toArray();
  }

  createSession(input: CreateInput<WorkoutSession>): Promise<WorkoutSession> {
    return createEntity<WorkoutSession>(this.db.workoutSessions, input);
  }

  updateSession(id: ID, patch: UpdatePatch<WorkoutSession>): Promise<WorkoutSession> {
    return updateEntity<WorkoutSession>(this.db.workoutSessions, id, patch);
  }

  async deleteSession(id: ID): Promise<void> {
    await this.db.workoutSessions.delete(id);
  }
}
