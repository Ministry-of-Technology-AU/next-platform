import { LETTER_RANGES } from "./data";
import type { GradeComponent, PlannerCourse, PlannerTab } from "./types";

/** Credits without a trailing ".0". */
export function formatCredits(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "--";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export { formatGPA } from "@/lib/cgpa/calculations";
export { isTypingTarget, readStorage, writeStorage } from "@/lib/utils";

/** Tour selector for a target inside a tab, matching only once that tab has finished sliding in. */
export function inSettledTab(tab: PlannerTab, target: string): string {
  return `[data-tour-tab-settled="${tab}"] ${target}`;
}

// ---------------------------------------------------------------------------
// Grade planner maths
// ---------------------------------------------------------------------------

function toNumber(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function letterForPercentage(percentage: number): string {
  const rounded = Math.round(percentage);
  const cutoffs: ReadonlyArray<readonly [number, string]> = [
    [90, "A"], [85, "A-"], [80, "B+"], [75, "B"], [70, "B-"], [65, "C+"],
    [60, "C"], [55, "C-"], [50, "D+"], [45, "D"], [40, "D-"],
  ];
  return cutoffs.find(([min]) => rounded >= min)?.[1] ?? "F";
}

/** Middle of a letter's band, used when a student picks a letter instead of typing a score. */
export function midpointForLetter(letter: string): number | null {
  const range = LETTER_RANGES.find((band) => band.letter === letter);
  return range ? Number(((range.min + range.max) / 2).toFixed(2)) : null;
}

export function componentPercentage(component: GradeComponent): number | null {
  const score = toNumber(component.score);
  const total = toNumber(component.total);
  return Number.isFinite(score) && Number.isFinite(total) && total > 0 ? (score / total) * 100 : null;
}

/**
 * Weighted course percentage. Weights under 100 are scaled up so a half-finished course
 * shows where it's heading. Extra credit adds on top without counting towards the 100.
 */
export function coursePercentage(course: PlannerCourse): { percentage: number | null; weight: number } {
  let weighted = 0;
  let weight = 0;
  for (const component of course.components) {
    const pct = componentPercentage(component);
    const w = toNumber(component.weight);
    if (pct === null || !Number.isFinite(w) || w <= 0) continue;
    weighted += (pct * w) / 100;
    weight += w;
  }
  if (weight === 0) return { percentage: null, weight };
  let percentage = weight < 100 ? (weighted / weight) * 100 : weighted;

  if (course.extraCredit) {
    const pct = componentPercentage(course.extraCredit);
    const w = toNumber(course.extraCredit.weight);
    if (pct !== null && Number.isFinite(w) && w > 0) percentage += (pct * w) / 100;
  }
  return { percentage, weight };
}

/** Applies an edit to one component, keeping score, total and letter in step. */
export function editComponent(component: GradeComponent, field: keyof Omit<GradeComponent, "id">, value: string): GradeComponent {
  if (field === "letter") {
    const midpoint = midpointForLetter(value);
    return midpoint === null ? { ...component, letter: value } : { ...component, letter: value, score: String(midpoint), total: "100" };
  }
  const next = { ...component, [field]: value };
  if (field === "score" || field === "total") {
    const pct = componentPercentage(next);
    if (pct !== null) next.letter = letterForPercentage(pct);
  }
  return next;
}
