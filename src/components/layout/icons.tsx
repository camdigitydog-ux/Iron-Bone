import type { SVGProps } from "react";

function base(props: SVGProps<SVGSVGElement>) {
  return {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function DumbbellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M6.5 7v10M4 9.5v5M17.5 7v10M20 9.5v5" />
      <path d="M6.5 12h11" />
    </svg>
  );
}

export function NutritionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v3" />
      <path d="M9.5 4.5c1 1 3.5 1 4.5 0" />
      <path d="M12 6c4 0 6.5 3 6.5 7 0 4.5-3 8-6.5 8s-6.5-3.5-6.5-8c0-4 2.5-7 6.5-7Z" />
    </svg>
  );
}

export function RunningIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="15.5" cy="5" r="1.6" fill="currentColor" stroke="none" />
      <path d="M9 21l2.2-4.2-2-1.8 1-4 3 2.6 3.3-1.1M6.5 13.5 9 12l2 2.2" />
      <path d="M10.5 10.8 13 8.4l2.5 1.4 2.5-.6" />
    </svg>
  );
}

export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="5.5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8 3.5v3M16 3.5v3" />
    </svg>
  );
}
