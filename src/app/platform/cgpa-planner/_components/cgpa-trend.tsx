"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { formatGPA } from "../utils";

export type TrendPoint = {
  termIndex: number;
  label: string;
  value: number;
  projected?: boolean;
};

/**
 * CGPA after each term as a line. Each point is a real button that opens that term,
 * so the chart doubles as navigation. A planned term shows as a hollow, dashed point.
 */
export function CGPATrend({
  points,
  selectedTermIndex,
  onSelect,
  className,
}: {
  points: TrendPoint[];
  selectedTermIndex: number | null;
  onSelect: (termIndex: number) => void;
  className?: string;
}) {
  if (points.length < 2) return null;

  const values = points.map((point) => point.value);
  const min = Math.max(0, Math.min(...values) - 0.15);
  const max = Math.min(4, Math.max(...values) + 0.15);
  const span = max - min || 1;
  // Inset so dots at the edges aren't clipped.
  const x = (index: number) => 4 + (index / (points.length - 1)) * 92;
  const y = (value: number) => 8 + (1 - (value - min) / span) * 84;

  const actual = points.filter((point) => !point.projected);
  const last = actual[actual.length - 1];
  const projected = points.find((point) => point.projected);
  const line = actual.map((point) => `${x(points.indexOf(point))},${y(point.value)}`).join(" ");

  return (
    <div role="group" aria-label="CGPA after each term" className={cn("relative h-24 w-full", className)}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <polyline points={line} fill="none" className="stroke-primary" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        {projected && last && (
          <line
            x1={x(points.indexOf(last))}
            y1={y(last.value)}
            x2={x(points.indexOf(projected))}
            y2={y(projected.value)}
            className="stroke-primary"
            strokeWidth={2}
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {points.map((point, index) => {
        const selected = point.termIndex === selectedTermIndex;
        const label = `${point.label}: ${point.projected ? "projected " : ""}CGPA ${formatGPA(point.value)}`;
        return (
          <Tooltip key={`${point.termIndex}-${point.projected ? "p" : "a"}`}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={label}
                aria-pressed={selected}
                onClick={() => {
                  void haptic.select();
                  onSelect(point.termIndex);
                }}
                className="group absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                style={{ left: `${x(index)}%`, top: `${y(point.value)}%` }}
              >
                <span
                  className={cn(
                    "block size-2.5 rounded-full border-2 border-primary transition-transform duration-200 group-hover:scale-150 motion-reduce:transition-none",
                    point.projected ? "border-dashed bg-card" : "bg-primary",
                    selected && "scale-150 ring-4 ring-primary/20",
                  )}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
