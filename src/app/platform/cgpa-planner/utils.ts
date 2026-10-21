import { LETTER_RANGES } from "./data";
import type { CourseAttempt, GradeComponent, GradeKey, ParsedCourse, ParsedSemester, PlannedGrades, PlannerCourse, PlannerTab } from "./types";

/** Credits without a trailing ".0". */
export function formatCredits(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "--";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

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

// ---------------------------------------------------------------------------
// CGPA maths
// ---------------------------------------------------------------------------

/**
 * CGPA maths on parsed AMS data. Pure functions, no React, so the planner UI, the API
 * and other tools all agree on the numbers.
 *
 * Rules (Ashoka, 4.0 scale):
 * - Letter grades count towards GPA with their points times the course credits.
 * - P counts towards earned credits only. F on a pass/fail course earns nothing and is not in GPA.
 * - TP earns its credits (at least 2) but is not in GPA; TP without credits does nothing.
 * - AMS's bare "TP" is TP with credits when it earned any, else without; bare "F" counts as
 *   "F (w/o P/F)". AU, "W", blanks and anything else unknown are ignored.
 * - A retaken course counts once: the best attempt wins. Zero-credit rows and TP rows are never
 *   retakes (TP is teaching a course, not taking it again).
 * - In a term still in progress every row can be planned. A row AMS has already graded (a TP,
 *   say) starts from that grade until the student changes it.
 *
 * `scoreGrade` holds the per-grade rules. Every total here and in the trajectory planner goes
 * through it, so a grade counts the same everywhere.
 */


export const GRADE_POINTS: Readonly<Record<GradeKey, number>> = {
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  "D-": 0.7,
  P: 0,
  "F (w P/F)": 0,
  "F (w/o P/F)": 0,
  AU: 0,
  "TP (w credits)": 0,
  "TP (w/o credits)": 0,
};

/** Grades a student can pick for a course still in progress, in the order they're shown. */
export const GRADE_OPTIONS: readonly GradeKey[] = [
  "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-",
  "P", "F (w P/F)", "F (w/o P/F)", "AU", "TP (w credits)", "TP (w/o credits)",
];

const GRADE_KEYS = new Set<string>(GRADE_OPTIONS);

export function isGradeKey(value: string): value is GradeKey {
  return GRADE_KEYS.has(value);
}

/**
 * Maps a grade as AMS (or a saved plan) prints it onto a planner grade. `creditsEarned` tells a
 * bare "TP" with credits from one without; when it's unknown, TP is taken to carry credits.
 */
export function toGradeKey(raw: string | null | undefined, creditsEarned?: number | null): GradeKey | null {
  const grade = raw?.trim() ?? "";
  if (!grade) return null;
  if (isGradeKey(grade)) return grade;
  const upper = grade.toUpperCase();
  if (upper === "TP") return creditsEarned === 0 ? "TP (w/o credits)" : "TP (w credits)";
  if (upper === "F") return "F (w/o P/F)";
  return null;
}

/** The planner grade of a course row as AMS reported it, or null while it's blank. */
export function gradeOf(course: Pick<ParsedCourse, "grade" | "creditsEarned">): GradeKey | null {
  return toGradeKey(course.grade, course.creditsEarned);
}

const isTeachingPracticum = (grade: GradeKey | null) => grade === "TP (w credits)" || grade === "TP (w/o credits)";

/** Grades that never count towards GPA. */
const OUTSIDE_GPA = new Set<GradeKey>(["P", "AU", "F (w P/F)", "TP (w credits)", "TP (w/o credits)"]);

/** Identity used to spot retakes: the course codes, or the title when there are none. */
export function courseKey(course: Pick<ParsedCourse, "codes" | "code" | "title">): string | null {
  if (course.codes.length > 0) return course.codes.join("/");
  const code = course.code?.trim();
  if (code && code !== "--") return code.toUpperCase();
  const title = course.title?.trim();
  return title && title !== "--" ? title.toUpperCase() : null;
}

/** Stable reference to one course row: survives re-syncs as long as AMS keeps the row order. */
export function courseRef(term: Pick<ParsedSemester, "semester">, courseIndex: number): string {
  return `${term.semester}#${courseIndex}`;
}

/** Credits a course shows in the planner once it has `grade`. */
export function creditsFor(course: ParsedCourse, grade: GradeKey | null): number {
  const registered = course.creditsRegistered ?? 0;
  return grade && isTeachingPracticum(grade) ? scoreGrade(grade, registered).earnedCredits : registered;
}

export type GradeScore = { gradePoints: number; gpaCredits: number; earnedCredits: number };

/**
 * What one graded course adds, as AMS prints it for a single term (no retake rules). The one
 * place the per-grade rules live: TP with credits earns at least 2, P and TP stay out of GPA,
 * F without pass/fail counts in GPA and earns nothing.
 */
export function scoreGrade(grade: GradeKey, credits: number): GradeScore {
  switch (grade) {
    case "AU":
    case "TP (w/o credits)":
    case "F (w P/F)":
      return { gradePoints: 0, gpaCredits: 0, earnedCredits: 0 };
    case "P":
      return { gradePoints: 0, gpaCredits: 0, earnedCredits: credits };
    case "TP (w credits)":
      return { gradePoints: 0, gpaCredits: 0, earnedCredits: Math.max(credits, 2) };
    default:
      return {
        gradePoints: GRADE_POINTS[grade] * credits,
        gpaCredits: credits,
        earnedCredits: grade === "F (w/o P/F)" ? 0 : credits,
      };
  }
}

/** GPA from summed scores, or null when nothing counts towards it. */
export function gpaOf({ gradePoints, gpaCredits }: Pick<GradeScore, "gradePoints" | "gpaCredits">): number | null {
  return gpaCredits > 0 ? gradePoints / gpaCredits : null;
}

/**
 * The grade a row counts with. Completed terms use AMS's grade. In a term still in progress every
 * row is the student's to plan: their pick wins (including clearing it), and a row AMS has already
 * graded, such as a TP, starts from that grade.
 */
export function effectiveGrade(
  term: ParsedSemester,
  courseIndex: number,
  plannedGrades: PlannedGrades,
): { grade: GradeKey | null; fromAms: boolean } {
  const course = term.courses[courseIndex];
  const ams = course ? gradeOf(course) : null;
  const ref = courseRef(term, courseIndex);
  if (term.status === "in-progress" && ref in plannedGrades) return { grade: plannedGrades[ref] ?? null, fromAms: false };
  return { grade: ams, fromAms: ams !== null };
}

/**
 * One attempt at a course for the retake rules: `scoreGrade`, plus the credits AMS recorded as
 * earned when the grade came from AMS (they can exceed the registered credits).
 */
function attemptFor(
  key: string,
  grade: GradeKey,
  course: ParsedCourse,
  source: CourseAttempt["source"],
  sIdx: number,
  cIdx: number,
): CourseAttempt | null {
  const registered = course.creditsRegistered ?? 0;
  const recorded = source === "past" ? course.creditsEarned ?? 0 : 0;
  const credits = registered > 0 ? registered : recorded;
  const score = scoreGrade(grade, credits);
  // A letter grade on a row with no credits can't count towards anything.
  if (credits <= 0 && !OUTSIDE_GPA.has(grade)) return null;
  const earnedCredits = score.earnedCredits > 0 ? Math.max(score.earnedCredits, recorded) : 0;
  return {
    key,
    gradeLabel: grade,
    source,
    sIdx,
    cIdx,
    gradePoints: score.gradePoints,
    gpaCredits: score.gpaCredits,
    earnedCredits,
    ratio: score.gpaCredits > 0 ? score.gradePoints / score.gpaCredits : null,
  };
}

/** Picks the attempt that should count: higher grade ratio first, then more points, then fewer GPA credits. */
function betterAttempt(best: CourseAttempt, candidate: CourseAttempt): CourseAttempt {
  if (candidate.ratio !== null && best.ratio !== null) {
    if (candidate.ratio !== best.ratio) return candidate.ratio > best.ratio ? candidate : best;
    if (candidate.gradePoints !== best.gradePoints) return candidate.gradePoints > best.gradePoints ? candidate : best;
    return candidate.gpaCredits < best.gpaCredits ? candidate : best;
  }
  if (candidate.ratio !== null) return candidate.ratio > 0 ? candidate : best;
  if (best.ratio !== null) return best.ratio > 0 ? best : candidate;
  return candidate.earnedCredits > best.earnedCredits ? candidate : best;
}

export type PlanInput = {
  /** Every term, oldest first. */
  terms: ParsedSemester[];
  /** Grades picked for courses in in-progress terms, by course ref. */
  plannedGrades: PlannedGrades;
  /** Manual retake links: course ref -> the course key it retakes. */
  retakeLinks: Record<string, string>;
  /** Course refs the student has said are not retakes, overriding auto-detection. */
  unlinked: string[];
};

export type CourseState = {
  /** True when this row shares a course with another row (a retake group). */
  inRetakeGroup: boolean;
  /** In a retake group and this attempt is the one that counts. */
  counts: boolean;
  /** In a retake group and a better attempt replaced this one. */
  replaced: boolean;
};

export type PlanSummary = {
  totalGradePoints: number;
  totalGpaCredits: number;
  totalEarnedCredits: number;
  cgpa: number | null;
  /** Per course ref. Rows without a grade still appear, so the UI can show retake badges early. */
  courses: Record<string, CourseState>;
};

/** Runs the whole transcript (completed grades plus planned ones) through the retake rules. */
export function summarisePlan({ terms, plannedGrades, retakeLinks, unlinked }: PlanInput): PlanSummary {
  const unlinkedSet = new Set(unlinked);
  const groups = new Map<string, string[]>();
  const attempts = new Map<string, CourseAttempt[]>();
  const attemptRefs = new Map<CourseAttempt, string>();

  terms.forEach((term, sIdx) => {
    term.courses.forEach((course, cIdx) => {
      const baseKey = courseKey(course);
      if (!baseKey) return;
      const ref = courseRef(term, cIdx);
      const { grade, fromAms } = effectiveGrade(term, cIdx, plannedGrades);
      const zeroCredit = (course.creditsRegistered ?? 0) === 0 && (course.creditsEarned ?? 0) === 0;

      let bucket = baseKey;
      if (zeroCredit || isTeachingPracticum(grade) || unlinkedSet.has(ref)) bucket = `${baseKey}::${ref}`;
      else if (retakeLinks[ref]) bucket = retakeLinks[ref];

      groups.set(bucket, [...(groups.get(bucket) ?? []), ref]);

      if (!grade) return;
      const attempt = attemptFor(baseKey, grade, course, fromAms ? "past" : "current", sIdx, cIdx);
      if (!attempt) return;
      attempts.set(bucket, [...(attempts.get(bucket) ?? []), attempt]);
      attemptRefs.set(attempt, ref);
    });
  });

  const courses: Record<string, CourseState> = {};
  for (const refs of groups.values()) {
    for (const ref of refs) courses[ref] = { inRetakeGroup: refs.length > 1, counts: false, replaced: false };
  }

  let totalGradePoints = 0;
  let totalGpaCredits = 0;
  let totalEarnedCredits = 0;

  for (const bucketAttempts of attempts.values()) {
    const best = bucketAttempts.reduce(betterAttempt);
    totalGradePoints += best.gradePoints;
    totalGpaCredits += best.gpaCredits;
    totalEarnedCredits += best.earnedCredits;
    if (bucketAttempts.length < 2) continue;
    for (const attempt of bucketAttempts) {
      const ref = attemptRefs.get(attempt);
      const state = ref ? courses[ref] : undefined;
      if (!state) continue;
      state.counts = attempt === best;
      state.replaced = attempt !== best;
    }
  }

  return {
    totalGradePoints,
    totalGpaCredits,
    totalEarnedCredits,
    cgpa: totalGpaCredits > 0 ? totalGradePoints / totalGpaCredits : null,
    courses,
  };
}

/**
 * GPA and earned credits of one in-progress term, as AMS would print them (no retake rules),
 * from the grades `effectiveGrade` picks.
 */
export function plannedTermGPA(term: ParsedSemester, plannedGrades: PlannedGrades) {
  const total: GradeScore = { gradePoints: 0, gpaCredits: 0, earnedCredits: 0 };
  term.courses.forEach((course, index) => {
    const { grade } = effectiveGrade(term, index, plannedGrades);
    if (!grade) return;
    const score = scoreGrade(grade, course.creditsRegistered ?? 0);
    total.gradePoints += score.gradePoints;
    total.gpaCredits += score.gpaCredits;
    total.earnedCredits += score.earnedCredits;
  });
  return { gpa: gpaOf(total), earnedCredits: total.earnedCredits };
}

// ---------------------------------------------------------------------------
// Goal calculators
// ---------------------------------------------------------------------------

/** A calculator answer: a number to show, or a sentence explaining why there isn't one. */
export type GoalResult = { kind: "value"; value: number } | { kind: "note"; text: string } | { kind: "empty" };

type Standing = { cgpa: number; gpaCredits: number; gradePoints: number };

const MAX_GPA = 4;

function readNumber(input: string): number | null {
  if (!input.trim()) return null;
  const value = Number.parseFloat(input);
  return Number.isFinite(value) ? value : Number.NaN;
}

/** GPA needed over the next `credits` to reach `target`. */
export function requiredGPA(standing: Standing, creditsInput: string, targetInput: string): GoalResult {
  const credits = readNumber(creditsInput);
  const target = readNumber(targetInput);
  if (credits === null || target === null) return { kind: "empty" };
  if (Number.isNaN(credits) || credits <= 0) return { kind: "note", text: "Enter a credit count above 0." };
  if (Number.isNaN(target) || target < 0 || target > MAX_GPA) return { kind: "note", text: "Target must be between 0 and 4." };
  if (standing.gpaCredits === 0) return { kind: "note", text: "Needs at least one graded term." };
  if (target <= standing.cgpa) return { kind: "note", text: "You're already at or above this target." };
  const needed = (target * (standing.gpaCredits + credits) - standing.gradePoints) / credits;
  if (needed > MAX_GPA) return { kind: "note", text: "Not reachable in these credits, even with straight As." };
  return { kind: "value", value: needed };
}

/** CGPA after `credits` more credits at an average of `average`. */
export function projectedCGPA(standing: Standing, averageInput: string, creditsInput: string): GoalResult {
  const average = readNumber(averageInput);
  const credits = readNumber(creditsInput);
  if (average === null || credits === null) return { kind: "empty" };
  if (Number.isNaN(average) || average < 0 || average > MAX_GPA) return { kind: "note", text: "Average must be between 0 and 4." };
  if (Number.isNaN(credits) || credits <= 0) return { kind: "note", text: "Enter a credit count above 0." };
  if (standing.gpaCredits === 0) return { kind: "note", text: "Needs at least one graded term." };
  return { kind: "value", value: (standing.gradePoints + average * credits) / (standing.gpaCredits + credits) };
}

/** Credits needed at a steady `average` to lift the CGPA to `target`. */
export function creditsToTarget(standing: Standing, targetInput: string, averageInput: string): GoalResult {
  const target = readNumber(targetInput);
  const average = readNumber(averageInput);
  if (target === null || average === null) return { kind: "empty" };
  if (Number.isNaN(target) || target < 0 || target > MAX_GPA) return { kind: "note", text: "Target must be between 0 and 4." };
  if (Number.isNaN(average) || average <= 0 || average > MAX_GPA) return { kind: "note", text: "Average must be between 0 and 4." };
  if (standing.gpaCredits === 0) return { kind: "note", text: "Needs at least one graded term." };
  const gap = target * standing.gpaCredits - standing.gradePoints;
  if (target <= standing.cgpa || gap <= 0) return { kind: "note", text: "You're already at or above this target." };
  if (average <= target) return { kind: "note", text: "Your average has to be above the target to pull the CGPA up." };
  return { kind: "value", value: gap / (average - target) };
}

/** Two decimals, or a dash when there's nothing to show. */
export function formatGPA(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? (Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2) : "--";
}
