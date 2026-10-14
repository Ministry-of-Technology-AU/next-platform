"use client";

import { Award, Eraser } from "lucide-react";
import { TourStep } from "@/components/guided-tour";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { courseRef, creditsFor } from "@/lib/cgpa/calculations";
import type { GradeKey, ParsedSemester } from "@/lib/cgpa/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { TERM_KIND_LABEL } from "../data";
import type { PlanApi } from "../use-plan";
import { formatCredits, formatGPA, inSettledTab } from "../utils";
import { CourseMenu, GradeSelect, RetakeBadge, type CourseRowModel, type RetakeActions } from "./course-row-parts";

const HEAD = "border-b border-border bg-muted/60 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground";

export function TermPanel({
  term,
  planApi,
  retakeActions,
  onTourOpen,
}: {
  term: ParsedSemester;
  planApi: PlanApi;
  retakeActions: RetakeActions;
  /** Brings the in-progress term into view before a tour step that needs it. */
  onTourOpen: () => void;
}) {
  const isMobile = useIsMobile();
  const { plan, summary, setGrade, clearGrades, termProjection } = planApi;
  const editable = term.status === "in-progress";
  const kindLabel = TERM_KIND_LABEL[term.kind];

  const rows: CourseRowModel[] = term.courses.map((course, index) => {
    const ref = courseRef(term, index);
    const planned: GradeKey | null = plan.plannedGrades[ref] ?? null;
    return {
      ref,
      code: course.code,
      title: course.title ?? course.code ?? "Untitled course",
      credits: editable ? creditsFor(course, planned) : course.creditsRegistered,
      grade: editable ? planned : course.grade,
      creditsEarned: course.creditsEarned,
      gradePoints: course.gradePoints,
      editable,
      state: summary.courses[ref],
      manuallyLinked: ref in plan.retakeLinks,
      unlinked: plan.unlinked.includes(ref),
    };
  });

  const projection = editable ? termProjection(term) : null;
  const plannedCount = rows.filter((row) => row.grade !== null).length;

  return (
    <Card className="min-w-0 overflow-hidden">
      {/* Term band */}
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h2 className="text-left text-lg font-bold sm:text-xl">{term.semester}</h2>
          {kindLabel && <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold">{kindLabel}</span>}
          {editable && <span className="rounded-md border border-primary/30 px-2 py-0.5 text-xs font-semibold text-primary">In progress</span>}
          {term.honours.map((honour) => (
            <span key={honour} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-semibold">
              <Award className="size-3.5" aria-hidden /> {honour}
            </span>
          ))}
        </div>
        {!editable && (
          <dl className="flex gap-4 text-xs sm:gap-6">
            <BandStat label="GPA" value={formatGPA(term.gpa)} />
            <BandStat label="Earned" value={formatCredits(term.semesterCreditsEarned)} />
            <BandStat label="CGPA" value={formatGPA(term.cgpa)} />
          </dl>
        )}
      </header>

      <TourStep
        id="cgpa-courses"
        selector={inSettledTab("terms", '[data-tour-step="cgpa-courses"]')}
        order={80}
        title="Plan this term's grades"
        content="For the term in progress, pick the grade you expect in each course. Finished terms show exactly what AMS recorded."
        position="top"
        onOpen={onTourOpen}
      >
        {/* Phones: one card per course */}
        <ul className="divide-y divide-border md:hidden">
          {rows.map((row) => (
            <li key={row.ref} className={cn("min-w-0 space-y-2 p-3", row.state?.replaced && "opacity-50")}>
              <div className="flex min-w-0 items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className={cn("break-words font-semibold leading-snug", row.state?.replaced && "italic")}>{row.title}</p>
                  <p className="mt-0.5 break-words text-xs text-muted-foreground">
                    {row.code ?? "No code"} · {formatCredits(row.credits)} cr
                    {!row.editable && ` · ${formatCredits(row.creditsEarned)} earned · ${row.gradePoints ?? "--"} pts`}
                  </p>
                </div>
                {!row.editable && <GradePill grade={row.grade} />}
                <CourseMenu row={row} actions={retakeActions} tourTarget={row === rows[0] ? "cgpa-course-menu-mobile" : undefined} />
              </div>
              {row.editable && <GradeSelect value={row.grade} courseTitle={row.title} onChange={(grade) => setGrade(row.ref, grade)} className="w-32" />}
              <RetakeBadge row={row} onUnlink={retakeActions.onUnlink} />
            </li>
          ))}
        </ul>

        {/* Tablet and up: table, scrolling sideways when space runs out */}
        <ScrollArea className="hidden w-full md:block">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr>
                <th scope="col" className={cn(HEAD, "pl-6 text-left")}>Course</th>
                <th scope="col" className={cn(HEAD, "w-20 text-center")}>Credits</th>
                <th scope="col" className={cn(HEAD, editable ? "w-32 text-left" : "w-20 text-center")}>Grade</th>
                {!editable && <th scope="col" className={cn(HEAD, "w-20 text-center")}>Earned</th>}
                {!editable && <th scope="col" className={cn(HEAD, "w-20 text-center")}>Points</th>}
                <th scope="col" className={cn(HEAD, "w-14 pr-4")}>
                  <span className="sr-only">Retake options</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.ref} className={cn("transition-colors hover:bg-muted/40", row.state?.replaced && "opacity-50")}>
                  <td className="py-2.5 pl-6 pr-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("font-medium", row.state?.replaced && "italic")}>{row.title}</span>
                      <RetakeBadge row={row} onUnlink={retakeActions.onUnlink} />
                    </div>
                    <span className="text-xs text-muted-foreground">{row.code ?? "No code"}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center tabular-nums">{formatCredits(row.credits)}</td>
                  <td className={cn("px-3 py-2", !editable && "text-center")}>
                    {row.editable ? (
                      <GradeSelect value={row.grade} courseTitle={row.title} onChange={(grade) => setGrade(row.ref, grade)} className="w-28" />
                    ) : (
                      <GradePill grade={row.grade} />
                    )}
                  </td>
                  {!editable && <td className="px-3 py-2.5 text-center tabular-nums">{formatCredits(row.creditsEarned)}</td>}
                  {!editable && <td className="px-3 py-2.5 text-center tabular-nums">{row.gradePoints ?? "--"}</td>}
                  <td className="py-2 pr-4 text-right">
                    <CourseMenu row={row} actions={retakeActions} tourTarget={row === rows[0] ? "cgpa-course-menu-desktop" : undefined} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </TourStep>

      {/* Phones and desktop render different rows, so point at whichever menu is on screen. */}
      <TourStep
        id="cgpa-retakes"
        order={90}
        title="Retakes are handled for you"
        content="Retaken courses are spotted on their own and only the better grade counts. Use this menu to mark a retake yourself or undo one."
        position="left"
        onOpen={onTourOpen}
        selector={inSettledTab("terms", `[data-tour-target="cgpa-course-menu-${isMobile ? "mobile" : "desktop"}"]`)}
      />

      {editable && projection && (
        <TourStep
          id="cgpa-result"
        selector={inSettledTab("terms", '[data-tour-step="cgpa-result"]')}
          order={100}
          title="See where you land"
          content="Your term GPA, new CGPA and credits update as you pick grades. Clear grades starts the term over."
          position="top"
          onOpen={onTourOpen}
        >
          <footer aria-live="polite" className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-3 sm:p-4">
            <dl className="flex flex-wrap items-center gap-4 rounded-lg bg-primary px-4 py-3 text-primary-foreground sm:gap-6">
              <Metric label="Sem GPA" value={formatGPA(projection.gpa)} />
              <span aria-hidden className="hidden h-8 w-px bg-white/25 xs:block" />
              <Metric label="New CGPA" value={formatGPA(plannedCount > 0 ? summary.cgpa : null)} />
              <span aria-hidden className="hidden h-8 w-px bg-white/25 xs:block" />
              <Metric label="Credits" value={formatCredits(projection.earnedCredits)} />
            </dl>
            {plannedCount > 0 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 sm:h-9"
                    onClick={() => {
                      void haptic.tap();
                      clearGrades(term);
                    }}
                  >
                    <Eraser /> Clear grades
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove the grades you picked for {term.semester}</TooltipContent>
              </Tooltip>
            ) : (
              <p className="text-xs text-muted-foreground">Pick a grade for each course. Results update as you go.</p>
            )}
          </footer>
        </TourStep>
      )}
    </Card>
  );
}

function BandStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-base font-bold tabular-nums">{value}</dd>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-white/75">{label}</dt>
      <dd className="text-xl font-bold tabular-nums">{value}</dd>
    </div>
  );
}

function GradePill({ grade }: { grade: string | null }) {
  return (
    <span className={cn("inline-flex min-w-10 items-center justify-center rounded-md px-2 py-1 text-sm font-semibold", grade ? "bg-muted" : "text-muted-foreground")}>
      {grade ?? "--"}
    </span>
  );
}
