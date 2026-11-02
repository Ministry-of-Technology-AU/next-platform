"use client";

import { Link2, Link2Off, MoreVertical, RotateCcw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GRADE_OPTIONS, isGradeKey, type CourseState } from "../utils";
import type { GradeKey } from "../types";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

/** Everything a course row needs, worked out once by the term panel. */
export type CourseRowModel = {
  ref: string;
  code: string | null;
  title: string;
  credits: number | null;
  /** AMS grade for completed terms; for in-progress ones, the planned grade (AMS's grade until changed). */
  grade: string | null;
  creditsEarned: number | null;
  gradePoints: number | null;
  editable: boolean;
  state: CourseState | undefined;
  manuallyLinked: boolean;
  unlinked: boolean;
};

export type RetakeActions = {
  onPickRetake: (ref: string) => void;
  onUnlink: (ref: string) => void;
  onRestore: (ref: string) => void;
};

const NO_GRADE = "none";

export function GradeSelect({
  value,
  courseTitle,
  onChange,
  className,
}: {
  value: string | null;
  courseTitle: string;
  onChange: (grade: GradeKey | null) => void;
  className?: string;
}) {
  return (
    <Select
      value={value ?? NO_GRADE}
      onValueChange={(next) => {
        void haptic.select();
        onChange(isGradeKey(next) ? next : null);
      }}
    >
      <SelectTrigger aria-label={`Planned grade for ${courseTitle}`} className={cn("h-11 w-28 sm:h-9", className)}>
        <SelectValue placeholder="Grade" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NO_GRADE}>
          <span className="text-muted-foreground">Not set</span>
        </SelectItem>
        {GRADE_OPTIONS.map((grade) => (
          <SelectItem key={grade} value={grade}>
            {grade}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Says where a row stands in its retake group. Text, not just colour. */
export function RetakeBadge({ row, onUnlink }: { row: CourseRowModel; onUnlink: (ref: string) => void }) {
  const state = row.state;
  if (!state?.inRetakeGroup) return null;

  // Past rows: a later attempt replaced this one, or this is the retake that counts.
  if (!row.editable) {
    if (state.replaced) {
      return (
        <Badge variant="outline" className="border-dashed font-medium text-muted-foreground">
          Replaced by retake
        </Badge>
      );
    }
    return state.counts ? (
      <Badge variant="secondary" className="bg-secondary-light text-black hover:bg-secondary-light">
        Retake
      </Badge>
    ) : null;
  }

  // This term's rows are the retake. When an earlier attempt still beats the planned grade,
  // that earlier attempt is what counts, so say that rather than "replaced".
  return (
    <Badge
      variant={state.replaced ? "outline" : "secondary"}
      className={cn(
        "gap-1 pr-0.5",
        state.replaced
          ? "border-dashed font-medium text-muted-foreground"
          : "bg-secondary-light text-black hover:bg-secondary-light",
      )}
    >
      {state.replaced ? "Retake: earlier grade counts" : "Retake"}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`${row.title} is not a retake`}
            onClick={() => {
              void haptic.tap();
              onUnlink(row.ref);
            }}
            className="flex size-6 items-center justify-center rounded opacity-60 hover:bg-secondary-dark hover:opacity-100"
          >
            <X className="size-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Not a retake: count both attempts</TooltipContent>
      </Tooltip>
    </Badge>
  );
}

export function CourseMenu({ row, actions, tourTarget }: { row: CourseRowModel; actions: RetakeActions; tourTarget?: string }) {
  const inGroup = row.state?.inRetakeGroup === true || row.manuallyLinked;
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-11 sm:size-8"
              aria-label={`Retake options for ${row.title}`}
              data-tour-target={tourTarget}
              onClick={() => void haptic.tap()}
            >
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Retake options</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onSelect={() => actions.onPickRetake(row.ref)}>
          <Link2 /> Mark course as retake
        </DropdownMenuItem>
        {inGroup && (
          <DropdownMenuItem onSelect={() => actions.onUnlink(row.ref)}>
            <Link2Off /> Deselect as retake
          </DropdownMenuItem>
        )}
        {row.unlinked && (
          <DropdownMenuItem onSelect={() => actions.onRestore(row.ref)}>
            <RotateCcw /> Detect retakes again
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
