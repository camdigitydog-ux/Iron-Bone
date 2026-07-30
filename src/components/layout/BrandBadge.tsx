import { cn } from "@/lib/utils/cn";

export function BrandBadge({ className }: { className?: string }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/badge-light-bg.png" alt="Iron Bone" className={cn(className, "dark:hidden")} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/badge-dark-bg.png"
        alt="Iron Bone"
        className={cn(className, "hidden dark:block")}
      />
    </>
  );
}
