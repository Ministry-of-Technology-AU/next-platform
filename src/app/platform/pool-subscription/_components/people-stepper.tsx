"use client";

import { Minus, Plus } from "lucide-react";
import { FieldShell, useFieldIds } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { haptic } from "@/lib/haptics";

interface PeopleStepperProps {
  title: string;
  description?: string;
  className?: string;
  name?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  errorMessage?: string;
  disabled?: boolean;
}

/** − / + counter for the pool size. Faster on touch than a 20-item list. */
export function PeopleStepper({
  title,
  description,
  className,
  name,
  value,
  onChange,
  min,
  max,
  errorMessage,
  disabled,
}: PeopleStepperProps) {
  const ids = useFieldIds(undefined, name);
  const atMin = value <= min;
  const atMax = value >= max;

  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next === value) return;
    onChange(next);
    void haptic.select();
  };

  return (
    <FieldShell
      ids={ids}
      title={title}
      description={description}
      error={errorMessage}
      variant="group"
      isRequired
      disabled={disabled}
      className={className}
    >
      <div
        className="flex h-11 w-full items-center justify-between rounded-md border border-border bg-background md:h-9"
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowRight") {
            e.preventDefault();
            step(1);
          } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
            e.preventDefault();
            step(-1);
          }
        }}
      >
        <StepButton
          label={atMin ? `A pool needs at least ${min} people` : "One fewer person"}
          disabled={disabled || atMin}
          onClick={() => step(-1)}
        >
          <Minus aria-hidden="true" className="size-4" />
        </StepButton>
        <output
          id={ids.controlId}
          aria-live="polite"
          aria-labelledby={ids.labelId}
          className="min-w-16 text-center text-base font-semibold tabular-nums md:text-sm"
        >
          {value} <span className="font-normal text-muted-foreground">people</span>
        </output>
        <StepButton
          label={atMax ? `Pools are capped at ${max} people` : "One more person"}
          disabled={disabled || atMax}
          onClick={() => step(1)}
        >
          <Plus aria-hidden="true" className="size-4" />
        </StepButton>
      </div>
    </FieldShell>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* Disabled buttons swallow pointer events; the span keeps the reason reachable. */}
        <span tabIndex={disabled ? 0 : undefined} className="rounded-md">
          <Button
            type="button"
            variant="ghost"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            className="size-11 rounded-md active:scale-95 md:size-9"
          >
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
