"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { courseRef, plannedTermGPA, summarisePlan } from "@/lib/cgpa/calculations";
import type { GradeKey, ParsedSemester } from "@/lib/cgpa/types";
import { PLAN_STORAGE_KEY } from "./data";
import type { PlanState } from "./types";
import { readStorage, writeStorage } from "./utils";

const EMPTY_PLAN: PlanState = { plannedGrades: {}, retakeLinks: {}, unlinked: [] };

/**
 * The student's plan on top of their AMS terms: grades picked for in-progress courses
 * and retake links. Everything else is derived, so there is no "Calculate" step.
 */
export function usePlan(terms: ParsedSemester[]) {
  const [plan, setPlan] = useState<PlanState>(EMPTY_PLAN);
  const [loaded, setLoaded] = useState(false);

  // Restore after mount: localStorage isn't available during the server render.
  useEffect(() => {
    const saved = readStorage<Partial<PlanState>>(PLAN_STORAGE_KEY);
    if (saved) {
      setPlan({
        plannedGrades: saved.plannedGrades ?? {},
        retakeLinks: saved.retakeLinks ?? {},
        unlinked: Array.isArray(saved.unlinked) ? saved.unlinked : [],
      });
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) writeStorage(PLAN_STORAGE_KEY, plan);
  }, [plan, loaded]);

  const setGrade = useCallback((ref: string, grade: GradeKey | null) => {
    setPlan((prev) => {
      const plannedGrades = { ...prev.plannedGrades };
      if (grade) plannedGrades[ref] = grade;
      else delete plannedGrades[ref];
      return { ...prev, plannedGrades };
    });
  }, []);

  const clearGrades = useCallback((term: ParsedSemester) => {
    setPlan((prev) => {
      const plannedGrades = { ...prev.plannedGrades };
      term.courses.forEach((_, index) => delete plannedGrades[courseRef(term, index)]);
      return { ...prev, plannedGrades };
    });
  }, []);

  const linkRetake = useCallback((ref: string, key: string) => {
    setPlan((prev) => ({
      ...prev,
      retakeLinks: { ...prev.retakeLinks, [ref]: key },
      unlinked: prev.unlinked.filter((item) => item !== ref),
    }));
  }, []);

  /** Marks a row as "not a retake", undoing both auto-detection and any manual link. */
  const unlinkRetake = useCallback((ref: string) => {
    setPlan((prev) => {
      const retakeLinks = { ...prev.retakeLinks };
      delete retakeLinks[ref];
      return { ...prev, retakeLinks, unlinked: prev.unlinked.includes(ref) ? prev.unlinked : [...prev.unlinked, ref] };
    });
  }, []);

  /** Lets auto-detection decide again. */
  const restoreRetake = useCallback((ref: string) => {
    setPlan((prev) => ({ ...prev, unlinked: prev.unlinked.filter((item) => item !== ref) }));
  }, []);

  // Standing from AMS grades alone, with automatic retake detection only (no manual links).
  const baseline = useMemo(() => summarisePlan({ terms, plannedGrades: {}, retakeLinks: {}, unlinked: [] }), [terms]);
  const summary = useMemo(() => summarisePlan({ terms, ...plan }), [terms, plan]);

  const hasPlannedGrades = Object.keys(plan.plannedGrades).length > 0;

  const termProjection = useCallback(
    (term: ParsedSemester) => plannedTermGPA(term, plan.plannedGrades),
    [plan.plannedGrades],
  );

  return {
    plan,
    baseline,
    summary,
    hasPlannedGrades,
    termProjection,
    setGrade,
    clearGrades,
    linkRetake,
    unlinkRetake,
    restoreRetake,
  };
}

export type PlanApi = ReturnType<typeof usePlan>;
