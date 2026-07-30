import type { RunFuelingGuide } from "@/lib/domain";

export function FuelingDisclosure({ guide }: { guide: RunFuelingGuide }) {
  return (
    <details className="mt-1 text-xs">
      <summary className="cursor-pointer text-muted-foreground">Fueling tips</summary>
      <div className="mt-1 space-y-1 text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Pre: </span>
          {guide.pre}
        </p>
        <p>
          <span className="font-medium text-foreground">During: </span>
          {guide.during}
        </p>
        <p>
          <span className="font-medium text-foreground">Post: </span>
          {guide.post}
        </p>
      </div>
    </details>
  );
}
