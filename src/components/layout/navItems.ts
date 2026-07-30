import {
  HomeIcon,
  DumbbellIcon,
  NutritionIcon,
  RunningIcon,
  CalendarIcon,
} from "./icons";

export const navItems = [
  { href: "/", label: "Today", icon: HomeIcon },
  { href: "/workouts", label: "Workouts", icon: DumbbellIcon },
  { href: "/nutrition", label: "Nutrition", icon: NutritionIcon },
  { href: "/running", label: "Running", icon: RunningIcon },
  { href: "/planner", label: "Planner", icon: CalendarIcon },
] as const;
