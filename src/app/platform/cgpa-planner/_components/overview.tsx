"use client";

import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, Award, MoreHorizontal, RefreshCw, Trash2 } from "lucide-react";
import { TourStep } from "@/components/guided-tour";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { ParsedCGPAData } from "../types";
import { formatCredits, formatGPA } from "../utils";
import { CGPATrend, type TrendPoint } from "./cgpa-trend";

/** Category rows that are totals or empty add noise; the rest are worth a glance. */
function visibleCategories(report: ParsedCGPAData) {
  return report.categories.filter((row) => !/degree|diploma|total/i.test(row.category) && row.credits > 0);
}

export function Overview({
  report,
  projectedCGPA,
  selectedTermIndex,
  onSelectTerm,
  onUpdate,
  onClear,
}: {
  report: ParsedCGPAData;
  /** CGPA including planned grades; null when nothing is planned. */
  projectedCGPA: number | null;
  selectedTermIndex: number | null;
  onSelectTerm: (termIndex: number) => void;
  onUpdate: () => void;
  onClear: () => void;
}) {
  const current = report.degreeCGPA;
  const delta = projectedCGPA !== null && current > 0 ? projectedCGPA - current : null;
  const deansList = report.semesters.filter((term) => term.honours.some((honour) => /dean/i.test(honour))).length;
  const categories = visibleCategories(report);

  const trend = useMemo<TrendPoint[]>(() => {
    const points: TrendPoint[] = report.semesters
      .map((term, termIndex) => ({ termIndex, label: term.semester, value: term.cgpa, status: term.status }))
      .filter((point) => point.status === "completed" && point.value > 0)
      .map(({ termIndex, label, value }) => ({ termIndex, label, value }));
    if (projectedCGPA !== null) {
      const plannedIndex = report.semesters.findLastIndex((term) => term.status === "in-progress");
      const plannedTerm = report.semesters[plannedIndex];
      if (plannedTerm) points.push({ termIndex: plannedIndex, label: plannedTerm.semester, value: projectedCGPA, projected: true });
    }
    return points;
  }, [report.semesters, projectedCGPA]);

  return (
    <Card className="relative overflow-hidden">
      {/* One set of actions for every width, pinned to the corner. */}
      <TourStep
        id="cgpa-update"
        order={50}
        title="Update after results"
        content="When new grades come out, paste a fresh copy of your AMS report here. The menu next to it removes your saved grades."
        position="left"
        className="absolute right-2 top-2 z-10 sm:right-4 sm:top-4"
      >
        <OverviewActions onUpdate={onUpdate} onClear={onClear} />
      </TourStep>
      <CardContent className="grid grid-cols-[minmax(0,1fr)] gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-center lg:gap-10">
        <TourStep
          id="cgpa-overview"
          order={30}
          title="Your CGPA"
          content="This is your degree CGPA as AMS has it. Once you plan grades for this term, your new CGPA shows up next to it."
          position="bottom"
          className="min-w-0"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Degree CGPA</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-heading text-5xl font-bold tabular-nums tracking-tight text-primary sm:text-6xl">{formatGPA(current)}</span>
            {projectedCGPA !== null && delta !== null && (
              <span className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-sm font-bold tabular-nums text-primary-foreground">
                {delta >= 0 ? <ArrowUpRight className="size-4" aria-hidden /> : <ArrowDownRight className="size-4" aria-hidden />}
                {formatGPA(projectedCGPA)}
                <span className="font-medium opacity-80">planned</span>
              </span>
            )}
          </div>

          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Major CGPA</dt>
              <dd className="font-semibold tabular-nums">{formatGPA(report.majorCGPA)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Counted credits</dt>
              <dd className="font-semibold tabular-nums">{formatCredits(report.totalCredits)}</dd>
            </div>
            {deansList > 0 && (
              <div>
                <dt className="text-xs text-muted-foreground">Dean&apos;s List</dt>
                <dd className="flex items-center gap-1 font-semibold">
                  <Award className="size-4 text-primary" aria-hidden />
                  {deansList} {deansList === 1 ? "term" : "terms"}
                </dd>
              </div>
            )}
          </dl>
        </TourStep>

        <div className="min-w-0 space-y-3">
          <p className="hidden pr-48 text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:block">CGPA after each term</p>
          {trend.length >= 2 && (
            <TourStep
              id="cgpa-trend"
              order={40}
              title="How your CGPA moved"
              content="Each point is your CGPA after a term. Select a point to open that term's courses."
              position="bottom"
            >
              <CGPATrend points={trend} selectedTermIndex={selectedTermIndex} onSelect={onSelectTerm} />
            </TourStep>
          )}
          {categories.length > 0 && (
            <ul className="hidden flex-wrap gap-2 sm:flex" aria-label="Credits by category">
              {categories.map((row) => (
                <li key={`${row.category}-${row.programme ?? ""}`} className="rounded-md border border-border px-2.5 py-1 text-xs">
                  <span className="font-semibold">{row.category}</span>
                  {row.programme && <span className="text-muted-foreground"> · {row.programme}</span>}
                  <span className="ml-1.5 tabular-nums text-muted-foreground">{formatCredits(row.credits)} cr</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewActions({
  onUpdate,
  onClear,
  className,
}: {
  onUpdate: () => void;
  onClear: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex shrink-0 items-center gap-1", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="h-11 gap-2 px-3 sm:h-9"
            onClick={() => {
              void haptic.tap();
              onUpdate();
            }}
          >
            <RefreshCw />
            <span className="hidden sm:inline">Update from AMS</span>
            <span className="sr-only sm:hidden">Update from AMS</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Paste a fresh AMS report, e.g. after grades come out <kbd className="ml-2 font-mono">U</kbd>
        </TooltipContent>
      </Tooltip>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-11 sm:size-9" aria-label="More options" onClick={() => void haptic.tap()}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>More options</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onUpdate}>
            <RefreshCw /> Update from AMS <DropdownMenuShortcut>U</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              void haptic.warn();
              onClear();
            }}
            className="text-destructive-text focus:text-destructive-text"
          >
            <Trash2 className="text-destructive-text" /> Remove saved grades
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
