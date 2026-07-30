import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PlannerView = "week" | "month";

interface UiState {
  plannerView: PlannerView;
  setPlannerView: (view: PlannerView) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      plannerView: "week",
      setPlannerView: (plannerView) => set({ plannerView }),
    }),
    { name: "fitness-planner-ui" },
  ),
);
