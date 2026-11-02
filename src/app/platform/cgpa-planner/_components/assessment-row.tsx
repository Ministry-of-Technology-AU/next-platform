"use client";

import { memo, useId } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { LETTERS } from "../data";
import type { GradeComponent } from "../types";
import { componentPercentage } from "../utils";

export type AssessmentField = keyof Omit<GradeComponent, "id">;

/** Column template shared by the header and every row, so they always line up. */
export const ASSESSMENT_GRID = "md:grid md:grid-cols-[minmax(0,2.2fr)_repeat(4,minmax(0,1fr))_4.5rem_2.5rem] md:items-center md:gap-2";

export function AssessmentHeader() {
  return (
    <div className={cn("hidden px-1 text-xs font-medium text-muted-foreground", ASSESSMENT_GRID)} aria-hidden>
      <span>Assessment</span>
      <span>Score</span>
      <span>Out of</span>
      <span>Letter</span>
      <span>Weight %</span>
      <span className="text-right">Result</span>
      <span />
    </div>
  );
}

/**
 * One assessment. A row of fields on tablets and up; a small labelled card on phones.
 * Labels are always in the DOM for screen readers and only shown on phones.
 */
export const AssessmentRow = memo(function AssessmentRow({
  component,
  onChange,
  onRemove,
  namePlaceholder = "e.g. Midterm",
}: {
  component: GradeComponent;
  onChange: (field: AssessmentField, value: string) => void;
  onRemove?: () => void;
  namePlaceholder?: string;
}) {
  const id = useId();
  const pct = componentPercentage(component);
  const label = "mb-1 block text-xs font-medium text-muted-foreground md:sr-only";
  const field = "h-11 text-base md:h-9 md:text-sm";

  return (
    <div className={cn("grid grid-cols-2 gap-3 rounded-lg border border-border p-3 md:rounded-none md:border-0 md:p-0", ASSESSMENT_GRID)}>
      <div className="col-span-2 md:col-span-1">
        <label htmlFor={`${id}-name`} className={label}>Assessment</label>
        <Input id={`${id}-name`} value={component.name} onChange={(e) => onChange("name", e.target.value)} placeholder={namePlaceholder} className={field} />
      </div>
      <div>
        <label htmlFor={`${id}-score`} className={label}>Score</label>
        <Input id={`${id}-score`} type="number" inputMode="decimal" value={component.score} onChange={(e) => onChange("score", e.target.value)} placeholder="86" className={field} />
      </div>
      <div>
        <label htmlFor={`${id}-total`} className={label}>Out of</label>
        <Input id={`${id}-total`} type="number" inputMode="decimal" value={component.total} onChange={(e) => onChange("total", e.target.value)} placeholder="100" className={field} />
      </div>
      <div>
        <label htmlFor={`${id}-letter`} className={label}>Letter</label>
        <Select
          value={component.letter || undefined}
          onValueChange={(value) => {
            void haptic.select();
            onChange("letter", value);
          }}
        >
          <SelectTrigger id={`${id}-letter`} className={cn("w-full", field)}>
            <SelectValue placeholder="Pick" />
          </SelectTrigger>
          <SelectContent>
            {LETTERS.map((letter) => (
              <SelectItem key={letter} value={letter}>{letter}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label htmlFor={`${id}-weight`} className={label}>Weight %</label>
        <Input id={`${id}-weight`} type="number" inputMode="decimal" value={component.weight} onChange={(e) => onChange("weight", e.target.value)} placeholder="30" className={field} />
      </div>
      <div className="col-span-2 flex items-center justify-between gap-2 md:contents">
        <span className="text-sm tabular-nums md:text-right" aria-live="polite">
          {pct === null ? <span className="text-muted-foreground">--</span> : `${pct.toFixed(1)}%`}
        </span>
        {onRemove ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${component.name || "this assessment"}`}
                onClick={() => {
                  void haptic.warn();
                  onRemove();
                }}
                className="size-11 text-destructive-text hover:text-destructive-text md:size-9"
              >
                <Trash2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Remove this assessment</TooltipContent>
          </Tooltip>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
});
