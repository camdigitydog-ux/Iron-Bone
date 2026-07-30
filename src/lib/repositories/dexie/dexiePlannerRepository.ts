import type { FitnessPlannerDB } from "@/lib/db/schema";
import type { PlannerEntry, ID } from "@/lib/domain";
import type { PlannerRepository, CreateInput, UpdatePatch, DateRange } from "../types";
import { createEntity, updateEntity } from "./helpers";

export class DexiePlannerRepository implements PlannerRepository {
  constructor(private db: FitnessPlannerDB) {}

  listByDate(date: string): Promise<PlannerEntry[]> {
    return this.db.plannerEntries.where("date").equals(date).toArray();
  }

  listByRange(range: DateRange): Promise<PlannerEntry[]> {
    return this.db.plannerEntries
      .where("date")
      .between(range.from, range.to, true, true)
      .toArray();
  }

  create(input: CreateInput<PlannerEntry>): Promise<PlannerEntry> {
    return createEntity<PlannerEntry>(this.db.plannerEntries, input);
  }

  update(id: ID, patch: UpdatePatch<PlannerEntry>): Promise<PlannerEntry> {
    return updateEntity<PlannerEntry>(this.db.plannerEntries, id, patch);
  }

  async delete(id: ID): Promise<void> {
    await this.db.plannerEntries.delete(id);
  }
}
