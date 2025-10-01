import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Course, GradeComponent } from "../types";
import { STORAGE_KEY, newCourse, newComponent, defaultScoreForLetter, computeCourse, getLetterFromPercentage } from "../data";
import { Plus, Trash2 } from "lucide-react";
import {HeaderRow} from "./header-row";
import {ComponentRowView} from "./component-row-view";
import { Star } from "lucide-react";
import { X } from "lucide-react";
import { ExtraCreditCard } from "./extra-credit-card";

export default function GradePlanner() {
  const [courses, setCourses] = useState<Course[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Course[] = JSON.parse(raw);
        setCourses(parsed);
        return;
      }
    } catch {}
    // default empty course
    setCourses([newCourse()]);
  }, []);

  const persist = useCallback((next: Course[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const debouncedPersist = useCallback((next: Course[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persist(next), 400);
  }, [persist]);

  const updateCourses = useCallback((updater: (prev: Course[]) => Course[]) => {
    setCourses((prev) => {
      const next = updater(prev);
      debouncedPersist(next);
      return next;
    });
  }, [debouncedPersist]);

  const addCourse = useCallback(() => updateCourses((prev) => [newCourse(), ...prev]), [updateCourses]);
  const removeCourse = useCallback((courseId: string) => updateCourses((prev) => prev.filter((c) => c.id !== courseId)), [updateCourses]);

  const addComponentToCourse = useCallback(
    (courseId: string) =>
      updateCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, components: [newComponent(), ...c.components] } : c))
      ),
    [updateCourses]
  );

  const removeComponentFromCourse = useCallback(
    (courseId: string, compId: string) =>
      updateCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, components: c.components.filter((gc) => gc.id !== compId) } : c))
      ),
    [updateCourses]
  );

  const toggleExtraCredit = useCallback(
    (courseId: string) =>
      updateCourses((prev) =>
        prev.map((c) => {
          if (c.id !== courseId) return c;
          if (c.showExtraCredit) {
            return { ...c, showExtraCredit: false, extraCredit: null };
          }
          return { ...c, showExtraCredit: true, extraCredit: newComponent() };
        })
      ),
    [updateCourses]
  );

  const updateCourseField = useCallback(
    (courseId: string, key: keyof Course, value: any) =>
      updateCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, [key]: value } : c))),
    [updateCourses]
  );

  const updateComponentField = useCallback(
    (courseId: string, compId: string, key: keyof GradeComponent, value: string) =>
      updateCourses((prev) =>
        prev.map((c) => {
          if (c.id !== courseId) return c;
          return {
            ...c,
            components: c.components.map((gc) => (gc.id === compId ? { ...gc, [key]: value } : gc)),
          };
        })
      ),
    [updateCourses]
  );

  const updateExtraCreditField = useCallback(
    (courseId: string, key: keyof GradeComponent, value: string) =>
      updateCourses((prev) =>
        prev.map((c) => {
          if (c.id !== courseId) return c;
          if (!c.extraCredit) return c;
          return { ...c, extraCredit: { ...c.extraCredit, [key]: value } };
        })
      ),
    [updateCourses]
  );

  // Sync logic similar to EJS: when letter changes, set score to average of range and total 100.
  const onLetterChange = useCallback(
    (courseId: string, compId: string, letter: string) => {
      const avg = defaultScoreForLetter(letter);
      updateCourses((prev) =>
        prev.map((c) => {
          if (c.id !== courseId) return c;
          const updater = (gc: GradeComponent) =>
            gc.id === compId
              ? { ...gc, letter, score: avg ? String(avg) : "", total: avg ? "100" : gc.total }
              : gc;
          return { ...c, components: c.components.map(updater) };
        })
      );
    },
    [updateCourses]
  );

  const onExtraLetterChange = useCallback(
    (courseId: string, letter: string) => {
      const avg = defaultScoreForLetter(letter);
      updateCourses((prev) =>
        prev.map((c) => {
          if (c.id !== courseId || !c.extraCredit) return c;
          return {
            ...c,
            extraCredit: {
              ...c.extraCredit,
              letter,
              score: avg ? String(avg) : "",
              total: avg ? "100" : c.extraCredit.total,
            },
          };
        })
      );
    },
    [updateCourses]
  );


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Grade Planner</h2>
        <Button onClick={addCourse} className="gap-2"><Plus className="h-4 w-4" /> Add Course</Button>
      </div>

      {courses.map((course) => {
        const { finalPct, totalWeight } = computeCourse(course);
        const displayLetter = Number.isFinite(finalPct) ? getLetterFromPercentage(finalPct) : null;
        return (
          <Card key={course.id} className="course-card">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Course</CardTitle>
                <Button variant="ghost" onClick={() => removeCourse(course.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input
                value={course.name}
                onChange={(e) => updateCourseField(course.id, "name", e.target.value)}
                placeholder="e.g., Math 101"
              />
            </CardHeader>
            <CardContent className="space-y-3">
              <HeaderRow />
              <div className="space-y-2">
                {course.components.map((gc) => (
                  <ComponentRowView
                    key={gc.id}
                    courseId={course.id}
                    gc={gc}
                    updateComponentField={updateComponentField}
                    onLetterChange={onLetterChange}
                    removeComponentFromCourse={removeComponentFromCourse}
                  />
                ))}
              </div>
              <ExtraCreditCard
                course={course}
                updateExtraCreditField={updateExtraCreditField}
                onExtraLetterChange={onExtraLetterChange}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => addComponentToCourse(course.id)} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Component
                </Button>
                <Button variant="outline" size="sm" onClick={() => toggleExtraCredit(course.id)} className="gap-2">
                  {course.showExtraCredit ? (<><X className="h-4 w-4" /> Remove Extra Credit</>) : (<><Star className="h-4 w-4" /> Add Extra Credit</>)}
                </Button>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <div className="min-w-[180px] rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-inner">
                  <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Current Grade</span>
                  <div className="mt-1 flex items-baseline gap-2 text-emerald-900">
                    <span className="text-xl font-semibold tabular-nums">
                      {Number.isFinite(finalPct) ? `${finalPct.toFixed(2)}%` : '--'}
                    </span>
                    {displayLetter && (
                      <span className="text-sm font-medium text-emerald-700">{displayLetter}</span>
                    )}
                  </div>
                </div>
                <div className="min-w-[180px] rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 shadow-inner">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Current Weightage</span>
                  <div className="mt-1 text-lg font-semibold text-slate-900 tabular-nums">
                    {totalWeight.toFixed(2)}%
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
