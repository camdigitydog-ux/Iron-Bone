import type { BaseEntity, ID } from "./common";

export type PlannerItemType = "workout" | "run" | "meal";
export type PlannerStatus = "planned" | "completed" | "skipped";

/**
 * The cross-domain glue entity. "Planned but not yet done" has no natural home in
 * WorkoutTemplate (not date-bound), WorkoutSession (shouldn't exist until performed),
 * or RunPlan (a recurring weekly shape, not a specific day). PlannerEntry represents
 * intent for a specific date; once fulfilled, it links to the resulting session/run/meal.
 */
export interface PlannerEntry extends BaseEntity {
  date: string; // yyyy-MM-dd
  itemType: PlannerItemType;
  status: PlannerStatus;
  title: string;
  linkedTemplateId?: ID;
  linkedSessionId?: ID;
  linkedRunPlanId?: ID;
  linkedRunEntryId?: ID;
  linkedMealEntryId?: ID;
  notes?: string;
}
