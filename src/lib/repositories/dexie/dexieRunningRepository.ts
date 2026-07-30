import type { FitnessPlannerDB } from "@/lib/db/schema";
import type { RunEntry, RunPlan, ID } from "@/lib/domain";
import type { RunningRepository, CreateInput, UpdatePatch, DateRange } from "../types";
import { createEntity, updateEntity } from "./helpers";

export class DexieRunningRepository implements RunningRepository {
  constructor(private db: FitnessPlannerDB) {}

  async listRuns(range?: DateRange): Promise<RunEntry[]> {
    if (!range) return this.db.runEntries.orderBy("date").reverse().toArray();
    return this.db.runEntries.where("date").between(range.from, range.to, true, true).toArray();
  }

  getRun(id: ID): Promise<RunEntry | undefined> {
    return this.db.runEntries.get(id);
  }

  getRunsByDate(date: string): Promise<RunEntry[]> {
    return this.db.runEntries.where("date").equals(date).toArray();
  }

  createRun(input: CreateInput<RunEntry>): Promise<RunEntry> {
    return createEntity<RunEntry>(this.db.runEntries, input);
  }

  updateRun(id: ID, patch: UpdatePatch<RunEntry>): Promise<RunEntry> {
    return updateEntity<RunEntry>(this.db.runEntries, id, patch);
  }

  async deleteRun(id: ID): Promise<void> {
    await this.db.runEntries.delete(id);
  }

  async getActivePlan(): Promise<RunPlan | undefined> {
    return this.db.runPlans.filter((plan) => plan.isActive).first();
  }

  listPlans(): Promise<RunPlan[]> {
    return this.db.runPlans.orderBy("startDate").reverse().toArray();
  }

  createPlan(input: CreateInput<RunPlan>): Promise<RunPlan> {
    return createEntity<RunPlan>(this.db.runPlans, input);
  }

  updatePlan(id: ID, patch: UpdatePatch<RunPlan>): Promise<RunPlan> {
    return updateEntity<RunPlan>(this.db.runPlans, id, patch);
  }
}
