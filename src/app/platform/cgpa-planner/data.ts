import type { TermKind } from "@/lib/cgpa/types";
import type { GradeComponent, PlannerCourse } from "./types";

/** Letters the grade planner works in. */
export const LETTERS = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"] as const;

/** Percentage band for each letter. The planner fills a letter's midpoint when a letter is picked. */
export const LETTER_RANGES: ReadonlyArray<{ letter: string; min: number; max: number }> = [
  { letter: "A", min: 89.5, max: 100 },
  { letter: "A-", min: 84.5, max: 89.49 },
  { letter: "B+", min: 79.5, max: 84.99 },
  { letter: "B", min: 74.5, max: 79.99 },
  { letter: "B-", min: 69.5, max: 74.99 },
  { letter: "C+", min: 64.5, max: 69.99 },
  { letter: "C", min: 59.5, max: 64.99 },
  { letter: "C-", min: 54.5, max: 59.99 },
  { letter: "D+", min: 49.5, max: 54.99 },
  { letter: "D", min: 44.5, max: 49.99 },
  { letter: "D-", min: 39.5, max: 44.99 },
  { letter: "F", min: 0, max: 39.49 },
];

/** Labels for term kinds. Regular semesters get no badge; everything else is called out. */
export const TERM_KIND_LABEL: Record<TermKind, string | null> = {
  monsoon: null,
  spring: null,
  summer: "Summer",
  winter: "Winter",
  abroad: "Abroad",
  internship: "Internship",
  transfer: "Transfer",
  other: "Other",
};

export const GRADE_PLANNER_STORAGE_KEY = "cgpa-planner:grade-planner:v1";
export const PLAN_STORAGE_KEY = "cgpa-planner:plan:v2";

export function newComponent(): GradeComponent {
  return { id: crypto.randomUUID(), name: "", score: "", total: "", letter: "", weight: "" };
}

export function newPlannerCourse(): PlannerCourse {
  return {
    id: crypto.randomUUID(),
    name: "",
    components: [newComponent(), newComponent(), newComponent()],
    extraCredit: null,
  };
}
