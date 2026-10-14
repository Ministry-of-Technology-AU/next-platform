import type { GradeKey } from "@/lib/cgpa/types";

// Report shapes (ParsedCGPAData, ParsedSemester...) live in @/lib/cgpa/types: the API,
// this page and the trajectory planner share them. This file holds the page's own UI types.

export type PlannerTab = "terms" | "grade-planner" | "goals";

/** What the student has planned on top of their AMS data. Saved in this browser only. */
export type PlanState = {
  plannedGrades: Record<string, GradeKey>;
  retakeLinks: Record<string, string>;
  unlinked: string[];
};

/** One assessment in the grade planner (midterm, essay...). Numbers stay strings while typed. */
export type GradeComponent = {
  id: string;
  name: string;
  score: string;
  total: string;
  letter: string;
  weight: string;
};

export type PlannerCourse = {
  id: string;
  name: string;
  components: GradeComponent[];
  extraCredit: GradeComponent | null;
};
