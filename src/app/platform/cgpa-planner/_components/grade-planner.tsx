"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Star, Trash2, X } from "lucide-react";
import { TourStep } from "@/components/guided-tour";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { haptic } from "@/lib/haptics";
import { GRADE_PLANNER_STORAGE_KEY, newComponent, newPlannerCourse } from "../data";
import type { GradeComponent, PlannerCourse } from "../types";
import { coursePercentage, editComponent, letterForPercentage, readStorage, writeStorage, inSettledTab } from "../utils";
import { AssessmentHeader, AssessmentRow, type AssessmentField } from "./assessment-row";

/** Courses saved by the old planner carried a `showExtraCredit` flag; fold it into `extraCredit`. */
type StoredCourse = PlannerCourse & { showExtraCredit?: boolean };

function restore(): PlannerCourse[] {
  const saved = readStorage<StoredCourse[]>(GRADE_PLANNER_STORAGE_KEY);
  if (!Array.isArray(saved) || saved.length === 0) return [newPlannerCourse()];
  return saved.map(({ showExtraCredit, ...course }) => ({
    ...course,
    extraCredit: showExtraCredit === false ? null : course.extraCredit ?? null,
  }));
}

/**
 * Works out a course grade from its assessments and weights. Saved in this browser only.
 */
export function GradePlanner({ onTourOpen }: { onTourOpen: () => void }) {
  const [courses, setCourses] = useState<PlannerCourse[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setCourses(restore()), []);
  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  const update = useCallback((updater: (prev: PlannerCourse[]) => PlannerCourse[]) => {
    setCourses((prev) => {
      const next = updater(prev);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => writeStorage(GRADE_PLANNER_STORAGE_KEY, next), 400);
      return next;
    });
  }, []);

  const updateCourse = useCallback(
    (courseId: string, change: (course: PlannerCourse) => PlannerCourse) =>
      update((prev) => prev.map((course) => (course.id === courseId ? change(course) : course))),
    [update],
  );

  const editRow = (courseId: string, componentId: string, field: AssessmentField, value: string) =>
    updateCourse(courseId, (course) => ({
      ...course,
      components: course.components.map((c: GradeComponent) => (c.id === componentId ? editComponent(c, field, value) : c)),
    }));

  const editExtra = (courseId: string, field: AssessmentField, value: string) =>
    updateCourse(courseId, (course) => (course.extraCredit ? { ...course, extraCredit: editComponent(course.extraCredit, field, value) } : course));

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-prose text-sm text-muted-foreground">
          Enter each assessment and its weight to see where a course is heading. Weights under 100% are scaled up.
        </p>
        <Button
          className="h-11 md:h-9"
          onClick={() => {
            void haptic.press();
            update((prev) => [newPlannerCourse(), ...prev]);
          }}
        >
          <Plus /> Add course
        </Button>
      </div>

      {courses.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No courses yet. Add one to start working out its grade.
          </CardContent>
        </Card>
      )}

      {courses.map((course, courseIndex) => {
        const { percentage, weight } = coursePercentage(course);
        const card = (
          <Card key={course.id}>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 p-4 pb-2 sm:p-6 sm:pb-3">
              <label htmlFor={`course-${course.id}`} className="sr-only">Course name</label>
              <Input
                id={`course-${course.id}`}
                value={course.name}
                onChange={(e) => updateCourse(course.id, (c) => ({ ...c, name: e.target.value }))}
                placeholder="Course name, e.g. Linear Algebra"
                className="h-11 flex-1 border-transparent bg-transparent px-1 text-lg font-semibold shadow-none hover:border-border focus-visible:border-input"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${course.name || "this course"}`}
                    onClick={() => {
                      void haptic.warn();
                      update((prev) => prev.filter((c) => c.id !== course.id));
                    }}
                    className="size-11 text-destructive-text hover:text-destructive-text"
                  >
                    <Trash2 />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete this course and its assessments</TooltipContent>
              </Tooltip>
            </CardHeader>

            <CardContent className="space-y-3 p-4 pt-0 sm:px-6">
              <AssessmentHeader />
              {course.components.map((component) => (
                <AssessmentRow
                  key={component.id}
                  component={component}
                  onChange={(field, value) => editRow(course.id, component.id, field, value)}
                  onRemove={() => updateCourse(course.id, (c) => ({ ...c, components: c.components.filter((x) => x.id !== component.id) }))}
                />
              ))}

              {course.extraCredit && (
                <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Star className="size-4 text-primary" aria-hidden /> Extra credit, added on top of 100%
                  </p>
                  <AssessmentRow
                    component={course.extraCredit}
                    namePlaceholder="e.g. Bonus quiz"
                    onChange={(field, value) => editExtra(course.id, field, value)}
                  />
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4 p-4 pt-2 sm:p-6 sm:pt-2 md:flex-row md:items-center md:justify-between">
              <div className="flex w-full flex-wrap gap-2 md:w-auto">
                <Button
                  variant="outline"
                  className="h-11 flex-1 md:h-9 md:flex-none"
                  onClick={() => {
                    void haptic.tap();
                    updateCourse(course.id, (c) => ({ ...c, components: [...c.components, newComponent()] }));
                  }}
                >
                  <Plus /> Add assessment
                </Button>
                <Button
                  variant="outline"
                  className="h-11 flex-1 md:h-9 md:flex-none"
                  onClick={() => {
                    void haptic.tap();
                    updateCourse(course.id, (c) => ({ ...c, extraCredit: c.extraCredit ? null : newComponent() }));
                  }}
                >
                  {course.extraCredit ? <X /> : <Star />}
                  {course.extraCredit ? "Remove extra credit" : "Add extra credit"}
                </Button>
              </div>
              <dl className="grid w-full grid-cols-2 gap-3 md:flex md:w-auto" aria-live="polite">
                <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current grade</dt>
                  <dd className="font-semibold tabular-nums">
                    {percentage === null ? "--" : (
                      <>
                        <span className="text-lg text-primary">{percentage.toFixed(2)}%</span>
                        <span className="ml-2">{letterForPercentage(percentage)}</span>
                      </>
                    )}
                  </dd>
                </div>
                <div className="rounded-lg border border-border px-4 py-2.5">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current weightage</dt>
                  <dd className="text-lg font-semibold tabular-nums">{weight.toFixed(0)}%</dd>
                </div>
              </dl>
            </CardFooter>
          </Card>
        );
        if (courseIndex !== 0) return card;
        return (
          <TourStep
            key={course.id}
            id="cgpa-grade-planner"
        selector={inSettledTab("grade-planner", '[data-tour-step="cgpa-grade-planner"]')}
            order={110}
            title="Work out a course grade"
            content="Add each assessment with your score, what it was out of and its weight. Your grade so far shows at the bottom, and it's saved in this browser."
            position="top"
            onOpen={onTourOpen}
          >
            {card}
          </TourStep>
        );
      })}
    </div>
  );
}
