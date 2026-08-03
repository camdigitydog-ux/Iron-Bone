import { getLiftingNutritionTip } from "../utils/liftingNutritionTip";

export function PostWorkoutNutritionDisclosure() {
  const tip = getLiftingNutritionTip();

  return (
    <details className="mt-1 text-xs">
      <summary className="cursor-pointer text-muted-foreground">Post-workout nutrition tips</summary>
      <div className="mt-1 space-y-1 text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Post: </span>
          {tip.post}
        </p>
        <p>
          <span className="font-medium text-foreground">Pre: </span>
          {tip.pre}
        </p>
        <p className="italic">{tip.note}</p>
      </div>
    </details>
  );
}
