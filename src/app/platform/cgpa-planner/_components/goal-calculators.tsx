"use client";

import { useId, useState, type ComponentType } from "react";
import { ArrowUpCircle, RotateCcw, Target, TrendingUp } from "lucide-react";
import { TourStep } from "@/components/guided-tour";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { creditsToTarget, projectedCGPA, requiredGPA, type GoalResult } from "@/lib/cgpa/calculations";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { formatCredits, formatGPA, inSettledTab } from "../utils";

type Standing = { cgpa: number; gpaCredits: number; gradePoints: number };

type Field = { label: string; placeholder: string; step: string; value: string; onChange: (value: string) => void };

function GoalCard({
  icon: Icon,
  title,
  fields,
  resultLabel,
  result,
  format,
  footnote,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  fields: [Field, Field];
  resultLabel: string;
  result: GoalResult;
  format: (value: number) => string;
  footnote?: (value: number) => string;
}) {
  const id = useId();
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-left text-base">
          <Icon className="size-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-1 xl:grid-cols-2">
          {fields.map((field, index) => (
            <div key={field.label} className="space-y-1.5">
              <Label htmlFor={`${id}-${index}`}>{field.label}</Label>
              <Input
                id={`${id}-${index}`}
                type="number"
                inputMode="decimal"
                step={field.step}
                min="0"
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onWheel={(event) => event.currentTarget.blur()}
                placeholder={field.placeholder}
                className="h-11 text-base sm:h-10 sm:text-sm"
              />
            </div>
          ))}
        </div>
        <div aria-live="polite" className="mt-auto rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs font-medium text-muted-foreground">{resultLabel}</p>
          {result.kind === "value" ? (
            <>
              <p className="mt-1 font-heading text-3xl font-bold tabular-nums text-primary">~ {format(result.value)}</p>
              {footnote && <p className="mt-1 text-xs text-muted-foreground">{footnote(result.value)}</p>}
            </>
          ) : (
            <p className={cn("mt-1", result.kind === "note" ? "text-sm font-medium" : "font-heading text-3xl font-bold text-muted-foreground")}>
              {result.kind === "note" ? result.text : "--"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Three what-if calculators on top of the student's standing (completed plus planned grades). */
export function GoalCalculators({
  standing,
  includesPlan,
  onTourOpen,
}: {
  standing: Standing;
  includesPlan: boolean;
  onTourOpen: () => void;
}) {
  const [credits, setCredits] = useState("");
  const [target, setTarget] = useState("");
  const [average, setAverage] = useState("");
  const [futureCredits, setFutureCredits] = useState("");
  const [raiseTarget, setRaiseTarget] = useState("");
  const [raiseAverage, setRaiseAverage] = useState("");

  const anyInput = [credits, target, average, futureCredits, raiseTarget, raiseAverage].some((value) => value !== "");

  const reset = () => {
    void haptic.tap();
    [setCredits, setTarget, setAverage, setFutureCredits, setRaiseTarget, setRaiseAverage].forEach((set) => set(""));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Starting from a CGPA of <span className="font-semibold text-foreground tabular-nums">{formatGPA(standing.cgpa)}</span> over{" "}
          <span className="font-semibold text-foreground tabular-nums">{formatCredits(standing.gpaCredits)}</span> graded credits
          {includesPlan ? ", including the grades you planned." : "."}
        </p>
        <Button variant="ghost" className="h-11 sm:h-9" onClick={reset} disabled={!anyInput}>
          <RotateCcw /> Clear
        </Button>
      </div>
      <TourStep
        id="cgpa-goals"
        selector={inSettledTab("goals", '[data-tour-step="cgpa-goals"]')}
        order={120}
        title="Plan for a target"
        content="Enter a target CGPA to see the term GPA or the credits it takes to get there. Each answer starts from your current CGPA, plus any grades you planned."
        position="top"
        onOpen={onTourOpen}
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3 md:gap-6">
          <GoalCard
            icon={Target}
            title="GPA needed for a target"
            fields={[
              { label: "Credits this term", placeholder: "16", step: "1", value: credits, onChange: setCredits },
              { label: "Target CGPA", placeholder: "3.5", step: "0.01", value: target, onChange: setTarget },
            ]}
            resultLabel="You'd need a term GPA of about"
            result={requiredGPA(standing, credits, target)}
            format={formatGPA}
          />
          <GoalCard
            icon={TrendingUp}
            title="CGPA after more credits"
            fields={[
              { label: "Average GPA", placeholder: "3.7", step: "0.01", value: average, onChange: setAverage },
              { label: "Credits", placeholder: "16", step: "1", value: futureCredits, onChange: setFutureCredits },
            ]}
            resultLabel="Your CGPA would be about"
            result={projectedCGPA(standing, average, futureCredits)}
            format={formatGPA}
          />
          <GoalCard
            icon={ArrowUpCircle}
            title="Credits to reach a target"
            fields={[
              { label: "Target CGPA", placeholder: "3.7", step: "0.01", value: raiseTarget, onChange: setRaiseTarget },
              { label: "Average you'll keep", placeholder: "3.8", step: "0.01", value: raiseAverage, onChange: setRaiseAverage },
            ]}
            resultLabel="Credits needed"
            result={creditsToTarget(standing, raiseTarget, raiseAverage)}
            format={(value) => String(Math.ceil(value))}
            footnote={(value) => `${value.toFixed(1)} credits exactly, rounded up.`}
          />
        </div>
      </TourStep>
    </div>
  );
}
